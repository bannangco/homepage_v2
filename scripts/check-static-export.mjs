import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { fileURLToPath } from "node:url";

import {
  getAnnouncementPath,
  validateAnnouncements,
} from "../lib/announcement-contract.ts";
import {
  COMPANY_PROFILE,
  ORGANIZATION_JSON_LD,
} from "../lib/company-profile.ts";
import { validateLegalDocuments } from "../lib/legal-document-contract.ts";
import { PRIVACY_POLICY_FACTS } from "../lib/privacy-policy.ts";
import {
  getPublicPdfPathSegments,
  isValidPublicPdfPath,
} from "../lib/public-pdf-contract.mjs";
import {
  LEGAL_NOTICE_DESCRIPTION,
  LEGAL_NOTICE_TITLE,
  PRIVACY_POLICY_DESCRIPTION,
  PRIVACY_POLICY_PATH,
  PRIVACY_POLICY_TITLE,
  SITE_URL,
} from "../lib/site-metadata.ts";
import {
  endedServices,
  preparingServices,
  renewingServices,
  serviceCatalog,
} from "../data/services.ts";
import {
  compareISODateOnlyDescending,
  isValidISODateOnly,
} from "../utils/formatDate.ts";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "out");
const failures = [];

let announcements = [];
try {
  announcements = validateAnnouncements(
    JSON.parse(
      await readFile(
        path.join(projectRoot, "data", "announcements.json"),
        "utf8",
      ),
    ),
    isValidISODateOnly,
  );
} catch (error) {
  failures.push(
    error instanceof Error
      ? `Invalid announcement data: ${error.message}`
      : "Unable to read authoritative announcement data.",
  );
}

let legalDocuments = [];
try {
  legalDocuments = validateLegalDocuments(
    JSON.parse(
      await readFile(
        path.join(projectRoot, "data", "legal-documents.json"),
        "utf8",
      ),
    ),
    isValidISODateOnly,
  );
} catch (error) {
  failures.push(
    error instanceof Error
      ? `Invalid legal document data: ${error.message}`
      : "Unable to read authoritative legal document data.",
  );
}

async function isFile(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function requireFile(relativePath) {
  const filePath = path.join(outputRoot, ...relativePath.split("/"));

  if (!(await isFile(filePath))) {
    failures.push(`Missing required export file: out/${relativePath}`);
  }
}

async function requireRoute(route) {
  const relativeRoute = route.replace(/^\//, "");
  const candidates = relativeRoute
    ? [`${relativeRoute}.html`, `${relativeRoute}/index.html`]
    : ["index.html"];

  if (!(await Promise.all(candidates.map((candidate) => isFile(path.join(outputRoot, candidate))))).some(Boolean)) {
    failures.push(`Missing expected exported route: ${route}`);
  }
}

async function collectExportFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectExportFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function exportedPathFromUrl(url) {
  if (typeof url !== "string" || !url.startsWith("/") || url.startsWith("//")) {
    return null;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(url.split(/[?#]/, 1)[0]);
  } catch {
    return null;
  }

  if (pathname === "/" || pathname.includes("\\")) {
    return null;
  }

  const resolvedPath = path.resolve(outputRoot, `.${pathname}`);
  const outputPrefix = `${path.resolve(outputRoot)}${path.sep}`;

  return resolvedPath.startsWith(outputPrefix) ? resolvedPath : null;
}

function exportedPdfPathFromHref(href) {
  const segments = getPublicPdfPathSegments(href);
  const resolvedPath = path.resolve(outputRoot, ...segments);
  const outputPrefix = `${path.resolve(outputRoot)}${path.sep}`;

  if (!resolvedPath.startsWith(outputPrefix)) {
    throw new TypeError(`Public PDF path escaped out/: ${href}`);
  }

  return resolvedPath;
}

function textFromHtmlFragment(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replace(/\s+/g, " ")
    .trim();
}

function countAccessibleMusePickerHeadings(html) {
  let count = 0;

  for (const match of html.matchAll(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi)) {
    const [, , attributes, content] = match;
    if (/\baria-hidden\s*=\s*["']true["']/i.test(attributes)) {
      continue;
    }
    if (textFromHtmlFragment(content) === "MusePicker") {
      count += 1;
    }
  }

  return count;
}

function getVisibleDocumentText(html) {
  return textFromHtmlFragment(
    html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " "),
  );
}

function escapeRegularExpression(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getLiteralStartTags(html) {
  const markupOnly = html.replace(
    /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,
    (fragment) => " ".repeat(fragment.length),
  );

  return [...markupOnly.matchAll(/<([a-z][a-z0-9:-]*)\b[^>]*>/gi)].map(
    (match) => ({
      tagName: match[1].toLowerCase(),
      html: match[0],
      start: match.index,
      end: match.index + match[0].length,
    }),
  );
}

function getLiteralAttribute(startTag, attribute) {
  const pattern = new RegExp(
    `\\s${escapeRegularExpression(attribute)}\\s*=\\s*(["'])([^"']*)\\1`,
    "i",
  );

  return pattern.exec(startTag)?.[2] ?? null;
}

function getBannangcoUrl(href) {
  try {
    const url = new URL(href, "https://bannangco.com");
    return url.origin === "https://bannangco.com" ? url : null;
  } catch {
    return null;
  }
}

function getMatchingElement(html, startTag) {
  if (/\/\s*>$/.test(startTag.html)) {
    return {
      ...startTag,
      fragment: startTag.html,
    };
  }

  const tagPattern = new RegExp(
    `<(/?)${escapeRegularExpression(startTag.tagName)}\\b[^>]*>`,
    "gi",
  );
  tagPattern.lastIndex = startTag.end;

  let depth = 1;
  let match;
  while ((match = tagPattern.exec(html)) !== null) {
    if (match[1] === "/") {
      depth -= 1;
    } else if (!/\/\s*>$/.test(match[0])) {
      depth += 1;
    }

    if (depth === 0) {
      return {
        ...startTag,
        end: tagPattern.lastIndex,
        fragment: html.slice(startTag.start, tagPattern.lastIndex),
      };
    }
  }

  return null;
}

function stringArraysMatch(actual, expected) {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

await requireFile("index.html");
await requireFile("404.html");
await requireFile("robots.txt");
await requireFile("sitemap.xml");
await requireFile("_headers");
await requireFile("privacy.html");
await requireRoute("/");
await requireRoute("/announcements");
await requireRoute(PRIVACY_POLICY_PATH);

for (const announcement of announcements) {
  await requireRoute(getAnnouncementPath(announcement.id));
}

function getMetaContents(startTags, attribute, value) {
  return startTags.flatMap((startTag) => {
    if (
      startTag.tagName !== "meta" ||
      getLiteralAttribute(startTag.html, attribute) !== value
    ) {
      return [];
    }

    const content = getLiteralAttribute(startTag.html, "content");
    return content === null ? [] : [content];
  });
}

function getPdfAnchorStartTags(html) {
  return getLiteralStartTags(html).filter((startTag) => {
    if (startTag.tagName !== "a") return false;

    const href = getLiteralAttribute(startTag.html, "href");
    return (
      href !== null &&
      (href.toLowerCase().includes(".pdf") || href.startsWith("/legal/"))
    );
  });
}

function getJsonLdScriptContents(html) {
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].flatMap(
    ([, attributes, content]) =>
      /\btype\s*=\s*(["'])application\/ld\+json\1/i.test(attributes)
        ? [content.trim()]
        : [],
  );
}

function isPlainObject(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function verifySharedFooter(html, relativePath) {
  const startTags = getLiteralStartTags(html);
  const footerStartTags = startTags.filter(
    (startTag) => startTag.tagName === "footer",
  );
  const footerElement =
    footerStartTags.length === 1
      ? getMatchingElement(html, footerStartTags[0])
      : null;

  if (!footerElement) {
    failures.push(`${relativePath} must contain exactly one shared site footer.`);
    return;
  }

  if (
    getVisibleDocumentText(footerElement.fragment).includes(
      PRIVACY_POLICY_FACTS.representative,
    )
  ) {
    failures.push(
      `${relativePath} shared footer must not expose the privacy-only representative name.`,
    );
  }

  const exactLegalLinks = getLiteralStartTags(footerElement.fragment).filter(
    (startTag) =>
      startTag.tagName === "a" &&
      getLiteralAttribute(startTag.html, "href") === "/announcements",
  );
  const legalLinkElement =
    exactLegalLinks.length === 1
      ? getMatchingElement(footerElement.fragment, exactLegalLinks[0])
      : null;

  if (
    !legalLinkElement ||
    textFromHtmlFragment(legalLinkElement.fragment) !==
      "전자공고·법적 고지"
  ) {
    failures.push(
      `${relativePath} footer must contain exactly one /announcements link labelled 전자공고·법적 고지.`,
    );
  }

  const exactPrivacyLinks = getLiteralStartTags(footerElement.fragment).filter(
    (startTag) =>
      startTag.tagName === "a" &&
      getLiteralAttribute(startTag.html, "href") === PRIVACY_POLICY_PATH,
  );
  const privacyLinkElement =
    exactPrivacyLinks.length === 1
      ? getMatchingElement(footerElement.fragment, exactPrivacyLinks[0])
      : null;

  if (
    !privacyLinkElement ||
    textFromHtmlFragment(privacyLinkElement.fragment) !== "개인정보처리방침"
  ) {
    failures.push(
      `${relativePath} footer must contain exactly one ${PRIVACY_POLICY_PATH} link labelled 개인정보처리방침.`,
    );
  }
}

function compareText(a, b) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function decodeXmlText(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .trim();
}

const declaredPdfReferences = [
  ...announcements.flatMap((announcement) =>
    announcement.document
      ? [
          {
            owner: `Announcement ${announcement.id}`,
            href: announcement.document.href,
          },
        ]
      : [],
  ),
  ...legalDocuments.map((document) => ({
    owner: `Legal document ${document.id}`,
    href: document.href,
  })),
];
const declaredPdfHrefs = new Set(
  declaredPdfReferences.map(({ href }) => href),
);

for (const { owner, href } of declaredPdfReferences) {
  let documentPath;
  try {
    documentPath = exportedPdfPathFromHref(href);
  } catch (error) {
    failures.push(
      error instanceof Error
        ? `${owner} has an unsafe PDF reference: ${error.message}`
        : `${owner} has an unsafe PDF reference.`,
    );
    continue;
  }

  if (!(await isFile(documentPath))) {
    failures.push(`${owner} references a missing exported PDF: ${href}`);
  }
}

const staleDetailCandidates = [
  path.join(outputRoot, "announcements", "1.html"),
  path.join(outputRoot, "announcements", "1.txt"),
  path.join(outputRoot, "announcements", "1", "index.html"),
  path.join(outputRoot, "announcements", "1", "index.txt"),
  path.join(outputRoot, "announcements", "__no_announcements__.html"),
  path.join(outputRoot, "announcements", "__no_announcements__.txt"),
];

if ((await Promise.all(staleDetailCandidates.map(isFile))).some(Boolean)) {
  failures.push(
    "Stale or synthetic announcement detail output remains in the export.",
  );
}

let exportFiles = [];
let htmlFiles = [];
try {
  exportFiles = await collectExportFiles(outputRoot);
  htmlFiles = exportFiles.filter((filePath) => filePath.endsWith(".html"));
} catch {
  failures.push("Unable to inspect the out/ directory. Run `npm run build` first.");
}

function routeFromExportPayload(filePath) {
  const relativePath = path
    .relative(outputRoot, filePath)
    .replaceAll(path.sep, "/");

  if (!/\.(?:html|txt)$/.test(relativePath)) {
    return null;
  }

  const withoutExtension = relativePath.replace(/\.(?:html|txt)$/, "");
  const routePath = withoutExtension.endsWith("/index")
    ? withoutExtension.slice(0, -"/index".length)
    : withoutExtension;

  return `/${routePath}`;
}

const expectedAnnouncementDetailRoutes = announcements
  .map((announcement) => getAnnouncementPath(announcement.id))
  .sort();
const exportedAnnouncementDetailRoutes = [
  ...new Set(
    exportFiles
      .map(routeFromExportPayload)
      .filter(
        (route) =>
          typeof route === "string" && route.startsWith("/announcements/"),
      ),
  ),
].sort();

if (
  !stringArraysMatch(
    exportedAnnouncementDetailRoutes,
    expectedAnnouncementDetailRoutes,
  )
) {
  failures.push(
    `Exported announcement detail routes must exactly match authoritative data (expected: ${expectedAnnouncementDetailRoutes.join(", ") || "none"}; received: ${exportedAnnouncementDetailRoutes.join(", ") || "none"}).`,
  );
}

const exportedLegalPdfHrefs = exportFiles
  .filter((filePath) => filePath.toLowerCase().endsWith(".pdf"))
  .map(
    (filePath) =>
      `/${path.relative(outputRoot, filePath).replaceAll(path.sep, "/")}`,
  )
  .sort();
const expectedPdfHrefs = [...declaredPdfHrefs].sort();

if (!stringArraysMatch(exportedLegalPdfHrefs, expectedPdfHrefs)) {
  failures.push(
    `Exported PDFs must exactly match authoritative references (expected: ${expectedPdfHrefs.join(", ") || "none"}; received: ${exportedLegalPdfHrefs.join(", ") || "none"}).`,
  );
}

for (const announcement of announcements) {
  const route = getAnnouncementPath(announcement.id);
  const detailHtmlFiles = htmlFiles.filter(
    (filePath) => routeFromExportPayload(filePath) === route,
  );

  if (detailHtmlFiles.length !== 1) {
    failures.push(
      `Announcement ${announcement.id} must have exactly one exported HTML detail page.`,
    );
    continue;
  }

  const detailHtml = await readFile(detailHtmlFiles[0], "utf8");
  const detailStartTags = getLiteralStartTags(detailHtml);
  const pdfLinks = getPdfAnchorStartTags(detailHtml);
  const expectedTitle = `${announcement.title} - 전자공고·법적 고지 - 반낭코`;
  const canonicalLinks = detailStartTags.filter(
    (startTag) =>
      startTag.tagName === "link" &&
      getLiteralAttribute(startTag.html, "rel") === "canonical" &&
      getLiteralAttribute(startTag.html, "href") === `${SITE_URL}${route}`,
  );

  if (canonicalLinks.length !== 1) {
    failures.push(
      `Announcement ${announcement.id} must have an exact canonical URL.`,
    );
  }

  for (const [attribute, name, expectedContent] of [
    ["property", "og:title", expectedTitle],
    ["property", "og:description", announcement.summary],
    ["property", "og:url", `${SITE_URL}${route}`],
    ["property", "og:image", `${SITE_URL}/images/ogimage.png`],
    ["name", "twitter:title", expectedTitle],
    ["name", "twitter:description", announcement.summary],
  ]) {
    const contents = getMetaContents(detailStartTags, attribute, name);
    if (contents.length !== 1 || contents[0] !== expectedContent) {
      failures.push(
        `Announcement ${announcement.id} must contain exact ${name} metadata.`,
      );
    }
  }

  if (!announcement.document) {
    if (pdfLinks.length !== 0) {
      failures.push(
        `Announcement ${announcement.id} must not render an undeclared PDF link.`,
      );
    }
    continue;
  }

  const matchingLinks = pdfLinks.filter(
    (startTag) =>
      getLiteralAttribute(startTag.html, "href") ===
      announcement.document.href,
  );
  const linkElement =
    matchingLinks.length === 1
      ? getMatchingElement(detailHtml, matchingLinks[0])
      : null;
  const linkText = linkElement
    ? getVisibleDocumentText(linkElement.fragment)
    : "";
  const relTokens = new Set(
    (matchingLinks[0]
      ? getLiteralAttribute(matchingLinks[0].html, "rel")
      : ""
    )?.split(/\s+/),
  );

  if (
    pdfLinks.length !== 1 ||
    matchingLinks.length !== 1 ||
    !linkElement ||
    getLiteralAttribute(matchingLinks[0].html, "target") !== "_blank" ||
    !relTokens.has("noopener") ||
    !relTokens.has("noreferrer") ||
    !linkText.includes(announcement.document.label) ||
    !linkText.includes("PDF, 새 창")
  ) {
    failures.push(
      `Announcement ${announcement.id} must render exactly its declared accessible PDF link.`,
    );
  }
}

let sitemapXml = "";
try {
  sitemapXml = await readFile(path.join(outputRoot, "sitemap.xml"), "utf8");
} catch {
  // The required-file check above already reports a missing sitemap.
}

if (sitemapXml) {
  const sitemapEntries = [...sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/gi)].map(
    ([, block]) => ({
      loc: decodeXmlText(/<loc>([\s\S]*?)<\/loc>/i.exec(block)?.[1] ?? ""),
      lastmod: decodeXmlText(
        /<lastmod>([\s\S]*?)<\/lastmod>/i.exec(block)?.[1] ?? "",
      ),
    }),
  );
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    const dateOrder = compareISODateOnlyDescending(a.createdAt, b.createdAt);
    return dateOrder || compareText(a.id, b.id);
  });
  const expectedSitemapLocations = [
    SITE_URL,
    `${SITE_URL}/announcements`,
    `${SITE_URL}${PRIVACY_POLICY_PATH}`,
    ...sortedAnnouncements.map(
      (announcement) => `${SITE_URL}${getAnnouncementPath(announcement.id)}`,
    ),
  ];
  const actualSitemapLocations = sitemapEntries.map(({ loc }) => loc);

  if (
    !stringArraysMatch(actualSitemapLocations, expectedSitemapLocations)
  ) {
    failures.push(
      `sitemap.xml must contain only generated public routes in deterministic order (expected: ${expectedSitemapLocations.join(", ")}; received: ${actualSitemapLocations.join(", ") || "none"}).`,
    );
  }

  for (const baseLocation of [
    SITE_URL,
    `${SITE_URL}/announcements`,
    `${SITE_URL}${PRIVACY_POLICY_PATH}`,
  ]) {
    const entry = sitemapEntries.find(({ loc }) => loc === baseLocation);
    if (!entry || entry.lastmod !== "") {
      failures.push(
        `sitemap.xml must not synthesize lastmod for ${baseLocation}.`,
      );
    }
  }

  for (const announcement of sortedAnnouncements) {
    const expectedLocation = `${SITE_URL}${getAnnouncementPath(announcement.id)}`;
    const entry = sitemapEntries.find(({ loc }) => loc === expectedLocation);

    if (!entry || entry.lastmod !== announcement.createdAt) {
      failures.push(
        `sitemap.xml must derive ${expectedLocation} lastmod from authoritative createdAt ${announcement.createdAt}.`,
      );
    }
  }
}

let homepageHtml = "";
try {
  homepageHtml = await readFile(path.join(outputRoot, "index.html"), "utf8");
} catch {
  // The required-file check above already reports a missing homepage.
}

if (homepageHtml) {
  if (!/<html\b[^>]*\blang=["']ko["']/i.test(homepageHtml)) {
    failures.push("out/index.html must preserve <html lang=\"ko\">.");
  }

  const organizationScripts = getJsonLdScriptContents(homepageHtml);
  if (organizationScripts.length !== 1) {
    failures.push(
      `out/index.html must contain exactly one Organization JSON-LD script (received: ${organizationScripts.length}).`,
    );
  } else {
    const [rawOrganizationJson] = organizationScripts;

    if (rawOrganizationJson.includes("<")) {
      failures.push(
        "Organization JSON-LD must escape literal < characters for script safety.",
      );
    }

    try {
      const parsedOrganization = JSON.parse(rawOrganizationJson);
      const actualKeys = isPlainObject(parsedOrganization)
        ? Object.keys(parsedOrganization).sort()
        : [];
      const expectedKeys = Object.keys(ORGANIZATION_JSON_LD).sort();

      if (
        !isPlainObject(parsedOrganization) ||
        !stringArraysMatch(actualKeys, expectedKeys) ||
        !isDeepStrictEqual(parsedOrganization, ORGANIZATION_JSON_LD)
      ) {
        failures.push(
          "Organization JSON-LD must contain exactly the approved company fields and values.",
        );
      }
    } catch {
      failures.push("Organization JSON-LD must be valid JSON.");
    }
  }

  const accessibleMusePickerHeadingCount =
    countAccessibleMusePickerHeadings(homepageHtml);
  if (accessibleMusePickerHeadingCount !== 1) {
    failures.push(
      `out/index.html must contain exactly one accessible MusePicker heading (received: ${accessibleMusePickerHeadingCount}).`,
    );
  }

  const literalStartTags = getLiteralStartTags(homepageHtml);
  const homepageCanonicalLinks = literalStartTags.filter(
    (startTag) =>
      startTag.tagName === "link" &&
      getLiteralAttribute(startTag.html, "rel") === "canonical" &&
      getLiteralAttribute(startTag.html, "href") === SITE_URL,
  );
  if (homepageCanonicalLinks.length !== 1) {
    failures.push(
      `out/index.html must contain exactly one canonical link to ${SITE_URL}.`,
    );
  }
  const requiredSectionIds = [
    "company",
    "about",
    "services",
    "preparing",
    "renewing",
    "archive",
  ];
  const sectionMarkers = [];

  for (const sectionId of requiredSectionIds) {
    const matches = literalStartTags.filter(
      (startTag) => getLiteralAttribute(startTag.html, "id") === sectionId,
    );

    if (matches.length !== 1) {
      failures.push(
        `out/index.html must contain exactly one #${sectionId} section marker.`,
      );
    } else {
      sectionMarkers.push({
        id: sectionId,
        position: matches[0].start,
        startTag: matches[0],
      });
    }
  }

  if (
    sectionMarkers.length === requiredSectionIds.length &&
    sectionMarkers.some(
      (marker, index) =>
        index > 0 && marker.position <= sectionMarkers[index - 1].position,
    )
  ) {
    failures.push(
      "out/index.html sections must follow company, about, services, preparing, renewing, archive order.",
    );
  }

  const expectedServiceIds = serviceCatalog.map((service) => service.id);
  const renderedServiceIds = literalStartTags.flatMap((startTag) => {
    const serviceId = getLiteralAttribute(startTag.html, "data-service-id");
    return serviceId === null ? [] : [serviceId];
  });

  if (!stringArraysMatch(renderedServiceIds, expectedServiceIds)) {
    failures.push(
      `out/index.html must render every service exactly once in catalog order (expected: ${expectedServiceIds.join(", ")}; received: ${renderedServiceIds.join(", ") || "none"}).`,
    );
  }

  for (const service of serviceCatalog) {
    const serviceStartTags = literalStartTags.filter(
      (startTag) =>
        getLiteralAttribute(startTag.html, "data-service-id") === service.id,
    );

    if (serviceStartTags.length !== 1) continue;

    const [serviceStartTag] = serviceStartTags;
    const serviceElement = getMatchingElement(homepageHtml, serviceStartTag);
    const presentationKind = getLiteralAttribute(
      serviceStartTag.html,
      "data-presentation-kind",
    );
    const official = getLiteralAttribute(serviceStartTag.html, "data-official");

    if (
      presentationKind !== service.presentation.kind ||
      official !== String(service.presentation.official)
    ) {
      failures.push(
        `The ${service.id} service marker must preserve presentation kind ${service.presentation.kind} and official=${String(service.presentation.official)}.`,
      );
    }

    if (!serviceElement) {
      failures.push(`Unable to inspect the ${service.id} service markup.`);
      continue;
    }

    if (service.id === "musepicker") {
      const visibleMusePickerCount =
        getVisibleDocumentText(serviceElement.fragment).match(/MusePicker/g)
          ?.length ?? 0;

      if (visibleMusePickerCount !== 1) {
        failures.push(
          `The MusePicker service must render its name exactly once (received: ${visibleMusePickerCount}).`,
        );
      }

      if (getLiteralAttribute(serviceStartTag.html, "tabindex") !== null) {
        failures.push(
          "The noninteractive MusePicker article must not be in the tab order.",
        );
      }
    }

    if (service.presentation.kind === "image") {
      const renderedLogoSources = getLiteralStartTags(
        serviceElement.fragment,
      ).flatMap((startTag) => {
        if (startTag.tagName !== "img") return [];
        const src = getLiteralAttribute(startTag.html, "src");
        return src === null ? [] : [src];
      });

      if (
        renderedLogoSources.filter(
          (src) => src === service.presentation.src,
        ).length !== 1
      ) {
        failures.push(
          `The ${service.id} service must render its configured logo source exactly once.`,
        );
      }
    }

    if (service.status === "ended") {
      const expectedLabelId = `service-${service.id}`;
      const summaryStartTags = getLiteralStartTags(
        serviceElement.fragment,
      ).filter((startTag) => startTag.tagName === "summary");
      const summaryElement =
        summaryStartTags.length === 1
          ? getMatchingElement(serviceElement.fragment, summaryStartTags[0])
          : null;

      if (
        serviceStartTag.tagName !== "details" ||
        getLiteralAttribute(serviceStartTag.html, "aria-labelledby") !==
          expectedLabelId
      ) {
        failures.push(
          `The ${service.id} archive details must be labelled by ${expectedLabelId}.`,
        );
      }

      if (!summaryElement) {
        failures.push(
          `The ${service.id} archive entry must contain exactly one native summary.`,
        );
      } else {
        if (
          getLiteralStartTags(summaryElement.fragment).filter(
            (startTag) =>
              getLiteralAttribute(startTag.html, "id") === expectedLabelId,
          ).length !== 1
        ) {
          failures.push(
            `The ${service.id} summary must contain its accessible label target.`,
          );
        }

        if (/<(?:article|div|dl|h[1-6]|ol|p|section|ul)\b/i.test(summaryElement.fragment)) {
          failures.push(
            `The ${service.id} summary must use phrasing-content structure.`,
          );
        }
      }
    }
  }

  const groupExpectations = [
    {
      marker: "preparing",
      serviceIds: preparingServices.map((service) => service.id),
    },
    {
      marker: "renewing",
      serviceIds: renewingServices.map((service) => service.id),
    },
    {
      marker: "archive",
      serviceIds: endedServices.map((service) => service.id),
    },
  ];
  const groupMarkers = literalStartTags.flatMap((startTag) => {
    const marker = getLiteralAttribute(startTag.html, "data-service-group");
    return marker === null ? [] : [{ marker, startTag }];
  });

  if (
    !stringArraysMatch(
      groupMarkers.map(({ marker }) => marker),
      groupExpectations.map(({ marker }) => marker),
    )
  ) {
    failures.push(
      "out/index.html service groups must appear exactly once in preparing, renewing, archive order.",
    );
  }

  for (const expectation of groupExpectations) {
    const matches = groupMarkers.filter(
      ({ marker }) => marker === expectation.marker,
    );

    if (matches.length !== 1) {
      failures.push(
        `out/index.html must contain exactly one ${expectation.marker} service group.`,
      );
      continue;
    }

    const { startTag } = matches[0];
    const groupElement = getMatchingElement(homepageHtml, startTag);
    if (!groupElement) {
      failures.push(
        `Unable to inspect the ${expectation.marker} service group markup.`,
      );
      continue;
    }

    const sectionMarker = sectionMarkers.find(
      ({ id }) => id === expectation.marker,
    );
    const sectionElement = sectionMarker
      ? getMatchingElement(homepageHtml, sectionMarker.startTag)
      : null;
    if (
      !sectionElement ||
      groupElement.start < sectionElement.start ||
      groupElement.end > sectionElement.end
    ) {
      failures.push(
        `The ${expectation.marker} service group must be contained by #${expectation.marker}.`,
      );
    }

    const renderedGroupIds = getLiteralStartTags(groupElement.fragment).flatMap(
      (groupStartTag) => {
        const serviceId = getLiteralAttribute(
          groupStartTag.html,
          "data-service-id",
        );
        return serviceId === null ? [] : [serviceId];
      },
    );

    if (!stringArraysMatch(renderedGroupIds, expectation.serviceIds)) {
      failures.push(
        `The ${expectation.marker} service group contains incorrect services (expected: ${expectation.serviceIds.join(", ")}; received: ${renderedGroupIds.join(", ") || "none"}).`,
      );
    }

    if (
      expectation.marker === "preparing" &&
      getVisibleDocumentText(groupElement.fragment).includes("종료")
    ) {
      failures.push(
        "out/index.html incorrectly describes MusePicker as an ended service.",
      );
    }
  }

  const footerStartTags = literalStartTags.filter(
    (startTag) => startTag.tagName === "footer",
  );
  const footerElement =
    footerStartTags.length === 1
      ? getMatchingElement(homepageHtml, footerStartTags[0])
      : null;

  if (footerStartTags.length !== 1) {
    failures.push("out/index.html must contain exactly one site footer.");
  } else if (!footerElement) {
    failures.push("Unable to inspect the site footer markup in out/index.html.");
  }

  const legalLinkStartTags = literalStartTags.filter((startTag) => {
    if (startTag.tagName !== "a") return false;

    const href = getLiteralAttribute(startTag.html, "href");
    const url = href === null ? null : getBannangcoUrl(href);
    return (
      url !== null &&
      (url.pathname === "/announcements" ||
        url.pathname.startsWith("/announcements/"))
    );
  });
  const baseLegalLinkStartTags = legalLinkStartTags.filter(
    (startTag) =>
      getLiteralAttribute(startTag.html, "href") === "/announcements",
  );
  const legalLinkElement =
    baseLegalLinkStartTags.length === 1
      ? getMatchingElement(homepageHtml, baseLegalLinkStartTags[0])
      : null;

  if (baseLegalLinkStartTags.length !== 1) {
    failures.push(
      "out/index.html must contain exactly one link to /announcements.",
    );
  } else if (!legalLinkElement) {
    failures.push(
      "Unable to inspect the legal notice link markup in out/index.html.",
    );
  } else {
    if (
      textFromHtmlFragment(legalLinkElement.fragment) !==
      "전자공고·법적 고지"
    ) {
      failures.push(
        "The footer legal notice link must be labelled 전자공고·법적 고지.",
      );
    }
  }

  const legalLinkOutsideFooter = legalLinkStartTags.some((startTag) => {
    const linkElement = getMatchingElement(homepageHtml, startTag);
    return (
      !footerElement ||
      !linkElement ||
      linkElement.start < footerElement.start ||
      linkElement.end > footerElement.end
    );
  });

  if (legalLinkOutsideFooter) {
    failures.push(
      "Links to /announcements and its detail routes must appear only within the site footer.",
    );
  }

  const privacyLinkStartTags = literalStartTags.filter((startTag) => {
    if (startTag.tagName !== "a") return false;

    const href = getLiteralAttribute(startTag.html, "href");
    const url = href === null ? null : getBannangcoUrl(href);
    return url !== null && url.pathname === PRIVACY_POLICY_PATH;
  });
  const privacyLinkElement =
    privacyLinkStartTags.length === 1
      ? getMatchingElement(homepageHtml, privacyLinkStartTags[0])
      : null;

  if (privacyLinkStartTags.length !== 1) {
    failures.push(
      `out/index.html must contain exactly one link to ${PRIVACY_POLICY_PATH}.`,
    );
  } else if (
    !privacyLinkElement ||
    textFromHtmlFragment(privacyLinkElement.fragment) !== "개인정보처리방침"
  ) {
    failures.push(
      "The footer privacy link must be labelled 개인정보처리방침.",
    );
  }

  const privacyLinkOutsideFooter = privacyLinkStartTags.some((startTag) => {
    const linkElement = getMatchingElement(homepageHtml, startTag);
    return (
      !footerElement ||
      !linkElement ||
      linkElement.start < footerElement.start ||
      linkElement.end > footerElement.end
    );
  });

  if (privacyLinkOutsideFooter) {
    failures.push(
      `Links to ${PRIVACY_POLICY_PATH} must appear only within the site footer.`,
    );
  }

  if (
    getVisibleDocumentText(homepageHtml).includes(
      PRIVACY_POLICY_FACTS.representative,
    )
  ) {
    failures.push(
      "out/index.html must not expose the privacy-only representative name.",
    );
  }

  const forbiddenHomepageValues = [
    "AI operated metasearch website for Museums, Galleries, and Art in U.S. 2025.04 종료",
    "2024.12 종료",
    "friending.so",
    "meetinggo.kr",
    "musepicker.com",
    "workflow-01.png",
  ];
  for (const forbiddenValue of forbiddenHomepageValues) {
    if (homepageHtml.includes(forbiddenValue)) {
      failures.push(
        `out/index.html contains removed service content: ${forbiddenValue}`,
      );
    }
  }

  const unverifiedLocationPatterns = [
    /\bSEO(?:UL)\b/i,
    /37[.]56(?:65)/,
  ];
  for (const pattern of unverifiedLocationPatterns) {
    if (pattern.test(homepageHtml)) {
      failures.push(
        "out/index.html contains unverified geographic information.",
      );
    }
  }

}

let legalHubHtml = "";
try {
  legalHubHtml = await readFile(
    path.join(outputRoot, "announcements.html"),
    "utf8",
  );
} catch {
  // The required-route check above already reports a missing legal hub.
}

if (legalHubHtml) {
  const legalHubStartTags = getLiteralStartTags(legalHubHtml);
  const sortedLegalDocuments = [...legalDocuments].sort((a, b) => {
    if (a.date !== undefined && b.date !== undefined) {
      return compareISODateOnlyDescending(a.date, b.date) || compareText(a.id, b.id);
    }
    if (a.date !== undefined) return -1;
    if (b.date !== undefined) return 1;
    return compareText(a.id, b.id);
  });
  const legalSectionIds = [
    "company-information",
    "electronic-announcements",
    "legal-documents",
  ];
  const legalSectionPositions = [];
  const legalSectionElements = new Map();

  for (const sectionId of legalSectionIds) {
    const matches = legalHubStartTags.filter(
      (startTag) => getLiteralAttribute(startTag.html, "id") === sectionId,
    );
    if (matches.length !== 1) {
      failures.push(
        `out/announcements.html must contain exactly one #${sectionId} section.`,
      );
    } else {
      legalSectionPositions.push(matches[0].start);
      const element = getMatchingElement(legalHubHtml, matches[0]);
      if (!element) {
        failures.push(
          `Unable to inspect #${sectionId} in out/announcements.html.`,
        );
      } else {
        legalSectionElements.set(sectionId, element);
      }
    }
  }

  if (
    legalSectionPositions.length === legalSectionIds.length &&
    legalSectionPositions.some(
      (position, index) =>
        index > 0 && position <= legalSectionPositions[index - 1],
    )
  ) {
    failures.push(
      "out/announcements.html must order company information, electronic announcements, then legal documents.",
    );
  }

  const companyInformationText = getVisibleDocumentText(
    legalSectionElements.get("company-information")?.fragment ?? "",
  );
  for (const requiredText of [
    COMPANY_PROFILE.legalName,
    COMPANY_PROFILE.foundingDate.replaceAll("-", "."),
    COMPANY_PROFILE.noticeMethod,
    COMPANY_PROFILE.email,
  ]) {
    if (!companyInformationText.includes(requiredText)) {
      failures.push(
        `out/announcements.html is missing confirmed company information: ${requiredText}.`,
      );
    }
  }

  const announcementSection = legalSectionElements.get(
    "electronic-announcements",
  );
  const announcementSectionTags = announcementSection
    ? getLiteralStartTags(announcementSection.fragment)
    : [];
  const renderedAnnouncementMarkers = announcementSectionTags.flatMap((startTag) => {
    const id = getLiteralAttribute(startTag.html, "data-announcement-id");
    return id === null ? [] : [{ id, startTag }];
  });
  const sortedAnnouncements = announcements
    .slice()
    .sort((a, b) => {
      const dateOrder = compareISODateOnlyDescending(a.createdAt, b.createdAt);
      return dateOrder || compareText(a.id, b.id);
    });
  const expectedAnnouncementIds = sortedAnnouncements.map(
    (announcement) => announcement.id,
  );
  const renderedAnnouncementIds = renderedAnnouncementMarkers.map(
    ({ id }) => id,
  );

  if (!stringArraysMatch(renderedAnnouncementIds, expectedAnnouncementIds)) {
    failures.push(
      `The legal hub must render only authoritative announcements (expected: ${expectedAnnouncementIds.join(", ") || "none"}; received: ${renderedAnnouncementIds.join(", ") || "none"}).`,
    );
  }

  const allAnnouncementMarkers = legalHubStartTags.filter(
    (startTag) =>
      getLiteralAttribute(startTag.html, "data-announcement-id") !== null,
  );
  if (allAnnouncementMarkers.length !== renderedAnnouncementMarkers.length) {
    failures.push(
      "Announcement records must be contained by #electronic-announcements.",
    );
  }

  for (const announcement of sortedAnnouncements) {
    const marker = renderedAnnouncementMarkers.find(
      ({ id }) => id === announcement.id,
    );
    const element = marker
      ? getMatchingElement(announcementSection.fragment, marker.startTag)
      : null;
    const text = element ? getVisibleDocumentText(element.fragment) : "";

    if (
      !marker ||
      marker.startTag.tagName !== "a" ||
      getLiteralAttribute(marker.startTag.html, "href") !==
        getAnnouncementPath(announcement.id) ||
      !text.includes(announcement.title) ||
      !text.includes(announcement.summary) ||
      !text.includes(announcement.createdAt.replaceAll("-", "."))
    ) {
      failures.push(
        `Announcement ${announcement.id} must render its exact source-controlled route and content in #electronic-announcements.`,
      );
    }
  }

  const hasAnnouncementEmptyState = getVisibleDocumentText(
    announcementSection?.fragment ?? "",
  ).includes("현재 게시된 전자공고가 없습니다.");
  if (hasAnnouncementEmptyState !== (announcements.length === 0)) {
    failures.push(
      "The electronic-announcement empty state must match authoritative data.",
    );
  }

  const legalDocumentSection = legalSectionElements.get("legal-documents");
  const legalDocumentSectionTags = legalDocumentSection
    ? getLiteralStartTags(legalDocumentSection.fragment)
    : [];
  const legalDocumentMarkers = legalDocumentSectionTags.flatMap((startTag) => {
    const id = getLiteralAttribute(startTag.html, "data-legal-document-id");
    return id === null ? [] : [{ id, startTag }];
  });
  if (
    !stringArraysMatch(
      legalDocumentMarkers.map(({ id }) => id),
      sortedLegalDocuments.map((document) => document.id),
    )
  ) {
    failures.push(
      `The legal hub must render only authoritative legal documents (expected: ${sortedLegalDocuments.map(({ id }) => id).join(", ") || "none"}; received: ${legalDocumentMarkers.map(({ id }) => id).join(", ") || "none"}).`,
    );
  }

  const allLegalDocumentMarkers = legalHubStartTags.filter(
    (startTag) =>
      getLiteralAttribute(startTag.html, "data-legal-document-id") !== null,
  );
  if (allLegalDocumentMarkers.length !== legalDocumentMarkers.length) {
    failures.push("Legal document records must be contained by #legal-documents.");
  }

  const renderedLegalPdfHrefs = getPdfAnchorStartTags(legalHubHtml)
    .map((startTag) => getLiteralAttribute(startTag.html, "href"))
    .filter((href) => href !== null)
    .sort();
  const expectedLegalPdfHrefs = sortedLegalDocuments
    .map((document) => document.href)
    .sort();
  if (!stringArraysMatch(renderedLegalPdfHrefs, expectedLegalPdfHrefs)) {
    failures.push(
      `The legal hub PDF links must exactly match legal-document data (expected: ${expectedLegalPdfHrefs.join(", ") || "none"}; received: ${renderedLegalPdfHrefs.join(", ") || "none"}).`,
    );
  }

  for (const document of sortedLegalDocuments) {
    const marker = legalDocumentMarkers.find(({ id }) => id === document.id);
    const element = marker
      ? getMatchingElement(legalDocumentSection.fragment, marker.startTag)
      : null;
    const documentLinks = element
      ? getLiteralStartTags(element.fragment).filter(
          (startTag) =>
            startTag.tagName === "a" &&
            getLiteralAttribute(startTag.html, "href") === document.href,
        )
      : [];
    const link = documentLinks[0];
    const relTokens = new Set(
      (link ? getLiteralAttribute(link.html, "rel") : "")?.split(/\s+/),
    );
    const timeElements = element
      ? getLiteralStartTags(element.fragment).filter(
          (startTag) => startTag.tagName === "time",
        )
      : [];
    const hasExpectedDate =
      document.date === undefined
        ? timeElements.length === 0
        : timeElements.length === 1 &&
          getLiteralAttribute(timeElements[0].html, "datetime") ===
            document.date &&
          getVisibleDocumentText(element?.fragment ?? "").includes(
            document.date.replaceAll("-", "."),
          );

    if (
      !element ||
      documentLinks.length !== 1 ||
      getLiteralAttribute(marker.startTag.html, "data-document-kind") !==
        document.kind ||
      !link ||
      getLiteralAttribute(link.html, "target") !== "_blank" ||
      !relTokens.has("noopener") ||
      !relTokens.has("noreferrer") ||
      !getVisibleDocumentText(element.fragment).includes(document.displayName) ||
      !getVisibleDocumentText(element.fragment).includes("PDF, 새 창") ||
      !hasExpectedDate
    ) {
      failures.push(
        `Legal document ${document.id} must render one accessible, source-controlled PDF link.`,
      );
    }
  }

  const hasLegalDocumentEmptyState = getVisibleDocumentText(
    legalDocumentSection?.fragment ?? "",
  ).includes("현재 공개된 법적 문서가 없습니다.");
  if (hasLegalDocumentEmptyState !== (legalDocuments.length === 0)) {
    failures.push(
      "The legal-document empty state must match authoritative data.",
    );
  }

  const canonicalLinks = legalHubStartTags.filter(
    (startTag) =>
      startTag.tagName === "link" &&
      getLiteralAttribute(startTag.html, "rel") === "canonical" &&
      getLiteralAttribute(startTag.html, "href") ===
        `${SITE_URL}/announcements`,
  );
  if (canonicalLinks.length !== 1) {
    failures.push(
      `out/announcements.html must contain exactly one canonical link to ${SITE_URL}/announcements.`,
    );
  }

  const expectedSocialMetadata = [
    ["property", "og:title", LEGAL_NOTICE_TITLE],
    ["property", "og:description", LEGAL_NOTICE_DESCRIPTION],
    ["property", "og:url", `${SITE_URL}/announcements`],
    ["property", "og:image", `${SITE_URL}/images/ogimage.png`],
    ["name", "twitter:title", LEGAL_NOTICE_TITLE],
    ["name", "twitter:description", LEGAL_NOTICE_DESCRIPTION],
  ];
  for (const [attribute, name, expectedContent] of expectedSocialMetadata) {
    const contents = getMetaContents(legalHubStartTags, attribute, name);
    if (contents.length !== 1 || contents[0] !== expectedContent) {
      failures.push(
        `out/announcements.html must contain exact ${name} metadata.`,
      );
    }
  }
}

let privacyHtml = "";
try {
  privacyHtml = await readFile(path.join(outputRoot, "privacy.html"), "utf8");
} catch {
  // The required-file check above already reports a missing privacy page.
}

if (privacyHtml) {
  const privacyStartTags = getLiteralStartTags(privacyHtml);
  const privacyPageStartTags = privacyStartTags.filter(
    (startTag) =>
      getLiteralAttribute(startTag.html, "data-privacy-page") === "true",
  );
  const privacyPageElement =
    privacyPageStartTags.length === 1
      ? getMatchingElement(privacyHtml, privacyPageStartTags[0])
      : null;

  if (!privacyPageElement) {
    failures.push(
      "out/privacy.html must contain exactly one inspectable privacy page root.",
    );
  } else {
    const pageStartTags = getLiteralStartTags(privacyPageElement.fragment);
    const pageVisibleText = getVisibleDocumentText(privacyPageElement.fragment);
    const h1StartTags = pageStartTags.filter(
      (startTag) => startTag.tagName === "h1",
    );
    const h1Element =
      h1StartTags.length === 1
        ? getMatchingElement(privacyPageElement.fragment, h1StartTags[0])
        : null;

    if (
      !h1Element ||
      getLiteralAttribute(h1StartTags[0].html, "aria-label") !==
        "개인정보처리방침" ||
      textFromHtmlFragment(h1Element.fragment) !== "개인정보처리방침"
    ) {
      failures.push(
        "out/privacy.html must expose exactly one h1 named 개인정보처리방침.",
      );
    }

    const expectedSections = [
      ["privacy-overview", "개인정보처리방침 개요"],
      ["privacy-items", "처리하는 개인정보 항목 및 수집 방법"],
      ["privacy-purpose", "개인정보 처리 목적"],
      ["privacy-retention", "보유 및 이용 기간"],
      ["privacy-destruction", "파기 절차 및 방법"],
      ["privacy-third-parties", "제3자 제공 여부"],
      ["privacy-external-services", "외부 이메일·인프라 서비스 이용"],
      ["privacy-overseas", "국외 처리 가능성"],
      ["privacy-analytics", "Cloudflare Web Analytics 및 자동 수집 기술"],
      ["privacy-rights", "정보주체의 권리와 행사 방법"],
      ["privacy-contact", "개인정보 보호책임자 및 문의처"],
      ["privacy-safeguards", "안전성 확보 조치"],
      ["privacy-effective-date", "시행일"],
    ];
    const sectionStartTags = pageStartTags.filter(
      (startTag) =>
        startTag.tagName === "section" &&
        getLiteralAttribute(startTag.html, "data-privacy-section") !== null,
    );
    const actualSectionIds = sectionStartTags.map((startTag) =>
      getLiteralAttribute(startTag.html, "data-privacy-section"),
    );

    if (
      !stringArraysMatch(
        actualSectionIds,
        expectedSections.map(([id]) => id),
      )
    ) {
      failures.push(
        "out/privacy.html must render the thirteen privacy sections in the approved order.",
      );
    }

    for (const [id, title] of expectedSections) {
      const matchingSections = sectionStartTags.filter(
        (startTag) =>
          getLiteralAttribute(startTag.html, "data-privacy-section") === id &&
          getLiteralAttribute(startTag.html, "id") === id &&
          getLiteralAttribute(startTag.html, "aria-labelledby") === `${id}-title`,
      );
      const sectionElement =
        matchingSections.length === 1
          ? getMatchingElement(privacyPageElement.fragment, matchingSections[0])
          : null;
      const sectionHeadings = sectionElement
        ? getLiteralStartTags(sectionElement.fragment).filter(
            (startTag) =>
              startTag.tagName === "h2" &&
              getLiteralAttribute(startTag.html, "id") === `${id}-title`,
          )
        : [];
      const sectionHeading =
        sectionHeadings.length === 1 && sectionElement
          ? getMatchingElement(sectionElement.fragment, sectionHeadings[0])
          : null;

      if (
        !sectionHeading ||
        textFromHtmlFragment(sectionHeading.fragment) !== title
      ) {
        failures.push(
          `Privacy section ${id} must have its exact accessible heading: ${title}.`,
        );
      }
    }

    const headingLevels = pageStartTags
      .filter((startTag) => /^h[1-6]$/.test(startTag.tagName))
      .map((startTag) => Number(startTag.tagName.slice(1)));
    if (
      headingLevels[0] !== 1 ||
      headingLevels.filter((level) => level === 1).length !== 1 ||
      headingLevels.filter((level) => level === 2).length !==
        expectedSections.length ||
      headingLevels.some((level, index) =>
        index === 0 ? false : level > headingLevels[index - 1] + 1,
      ) ||
      headingLevels.some((level) => level > 3) ||
      !pageVisibleText.includes("외부 이메일 서비스") ||
      !pageVisibleText.includes("Cloudflare 제공 인프라")
    ) {
      failures.push(
        "out/privacy.html must use one h1 with logical h2 policy sections and no skipped heading levels.",
      );
    }

    const requiredPrivacyText = [
      PRIVACY_POLICY_FACTS.controller,
      PRIVACY_POLICY_FACTS.representative,
      PRIVACY_POLICY_FACTS.privacyOfficer,
      PRIVACY_POLICY_FACTS.contactEmail,
      "일반 무료 Gmail",
      "Google LLC",
      "외부 이메일 서비스",
      "자발적으로 제공",
      "모든 항목이 항상 필수인 것은 아닙니다",
      "웹사이트 자체가 문의 양식을 통해 이 정보를 수집하지 않습니다",
      "문의의 접수와 식별",
      "문의 이력 유지와 분쟁 처리",
      "내부 최장 보유 한도",
      "법정 의무 기간",
      "마지막 연락일",
      "더 일찍 삭제",
      "부당한 지체 없이",
      "Cloudflare Workers Static Assets",
      "Cloudflare Web Analytics",
      "페이지 경로",
      "페이지 로드 식별자",
      "Web Vitals",
      "localStorage",
      "sessionStorage",
      "IndexedDB",
      "접속 IP 주소",
      "핵심 데이터베이스나 로그에는 저장되지 않습니다",
      `${PRIVACY_POLICY_FACTS.cloudflare.unsampledRetentionDays}일`,
      `약 ${PRIVACY_POLICY_FACTS.cloudflare.longTermAggregatePercentage}%`,
      `${PRIVACY_POLICY_FACTS.cloudflare.accessibleHistoryMonths}개월`,
      "별도의 analytics beacon을 직접 추가하지 않습니다",
      "별도의 쿠키 배너나 consent SDK를 추가하지 않습니다",
    ];
    for (const requiredText of requiredPrivacyText) {
      if (!pageVisibleText.includes(requiredText)) {
        failures.push(
          `out/privacy.html is missing an approved disclosure: ${requiredText}`,
        );
      }
    }

    const unsupportedEnterpriseService = ["Google", "Workspace"].join(" ");
    if (pageVisibleText.includes(unsupportedEnterpriseService)) {
      failures.push(
        "out/privacy.html must identify the email service as ordinary free Gmail only.",
      );
    }

    const privacyLinks = pageStartTags.filter(
      (startTag) => startTag.tagName === "a",
    );
    const exactMailtoLinks = privacyLinks.filter(
      (startTag) =>
        getLiteralAttribute(startTag.html, "href") ===
        `mailto:${PRIVACY_POLICY_FACTS.contactEmail}`,
    );
    const contactSectionStartTag = sectionStartTags.find(
      (startTag) =>
        getLiteralAttribute(startTag.html, "data-privacy-section") ===
        "privacy-contact",
    );
    const contactSectionElement = contactSectionStartTag
      ? getMatchingElement(privacyPageElement.fragment, contactSectionStartTag)
      : null;
    const contactVisibleText = getVisibleDocumentText(
      contactSectionElement?.fragment ?? "",
    );
    const contactMailtoLinks = contactSectionElement
      ? getLiteralStartTags(contactSectionElement.fragment).filter(
          (startTag) =>
            startTag.tagName === "a" &&
            getLiteralAttribute(startTag.html, "href") ===
              `mailto:${PRIVACY_POLICY_FACTS.contactEmail}`,
        )
      : [];
    if (
      exactMailtoLinks.length !== 1 ||
      contactMailtoLinks.length !== 1 ||
      !contactVisibleText.includes("개인정보 보호책임자") ||
      !contactVisibleText.includes(PRIVACY_POLICY_FACTS.privacyOfficer) ||
      !contactVisibleText.includes(PRIVACY_POLICY_FACTS.contactEmail)
    ) {
      failures.push(
        "out/privacy.html must bind the exact officer and accessible email link to its privacy-contact section.",
      );
    }

    for (const href of [
      PRIVACY_POLICY_FACTS.emailService.privacyPolicyUrl,
      PRIVACY_POLICY_FACTS.cloudflare.rumBeaconUrl,
      PRIVACY_POLICY_FACTS.cloudflare.webAnalyticsFaqUrl,
      PRIVACY_POLICY_FACTS.cloudflare.customerDpaUrl,
    ]) {
      const matches = privacyLinks.filter(
        (startTag) => getLiteralAttribute(startTag.html, "href") === href,
      );
      if (matches.length !== 1) {
        failures.push(
          `out/privacy.html must link exactly once to its authoritative reference: ${href}`,
        );
      }
    }

    const timeStartTags = pageStartTags.filter(
      (startTag) => startTag.tagName === "time",
    );
    if (
      timeStartTags.length === 0 ||
      timeStartTags.some(
        (startTag) =>
          getLiteralAttribute(startTag.html, "datetime") !==
          PRIVACY_POLICY_FACTS.effectiveDate,
      )
    ) {
      failures.push(
        "out/privacy.html must derive every displayed policy date from the approved effective date.",
      );
    }

    const visibleCalendarDates = new Set(
      pageVisibleText.match(/\b20\d{2}[.-]\d{2}[.-]\d{2}\b/g) ?? [],
    );
    if (
      !stringArraysMatch(
        [...visibleCalendarDates],
        [PRIVACY_POLICY_FACTS.effectiveDate.replaceAll("-", ".")],
      )
    ) {
      failures.push(
        "out/privacy.html must not display an unapproved or invented calendar date.",
      );
    }

    if (/<form\b/i.test(privacyPageElement.fragment)) {
      failures.push("out/privacy.html must not render a contact form.");
    }
    if (
      /data-cf-beacon|beacon\.min\.js|<script\b[^>]*cloudflareinsights/i.test(
        privacyPageElement.fragment,
      )
    ) {
      failures.push(
        "out/privacy.html must not insert an application-owned analytics beacon.",
      );
    }
    if (
      /\b01[016789][-. ]?\d{3,4}[-. ]?\d{4}\b|\b\d{3}-\d{2}-\d{5}\b|\b\d{6}-\d{7}\b/.test(
        pageVisibleText,
      )
    ) {
      failures.push(
        "out/privacy.html must not expose a telephone number or personal identifier.",
      );
    }
  }

  const renderedTitle = textFromHtmlFragment(
    /<title>([\s\S]*?)<\/title>/i.exec(privacyHtml)?.[1] ?? "",
  );
  if (renderedTitle !== PRIVACY_POLICY_TITLE) {
    failures.push(`out/privacy.html must have the exact title ${PRIVACY_POLICY_TITLE}.`);
  }

  const descriptions = getMetaContents(
    privacyStartTags,
    "name",
    "description",
  );
  if (
    descriptions.length !== 1 ||
    descriptions[0] !== PRIVACY_POLICY_DESCRIPTION
  ) {
    failures.push("out/privacy.html must contain its exact Korean description.");
  }

  const canonicalLinks = privacyStartTags.filter(
    (startTag) =>
      startTag.tagName === "link" &&
      getLiteralAttribute(startTag.html, "rel") === "canonical" &&
      getLiteralAttribute(startTag.html, "href") ===
        `${SITE_URL}${PRIVACY_POLICY_PATH}`,
  );
  if (canonicalLinks.length !== 1) {
    failures.push(
      `out/privacy.html must contain exactly one canonical link to ${SITE_URL}${PRIVACY_POLICY_PATH}.`,
    );
  }

  for (const [attribute, name, expectedContent] of [
    ["property", "og:title", PRIVACY_POLICY_TITLE],
    ["property", "og:description", PRIVACY_POLICY_DESCRIPTION],
    ["property", "og:url", `${SITE_URL}${PRIVACY_POLICY_PATH}`],
    ["property", "og:image", `${SITE_URL}/images/ogimage.png`],
    ["name", "twitter:title", PRIVACY_POLICY_TITLE],
    ["name", "twitter:description", PRIVACY_POLICY_DESCRIPTION],
  ]) {
    const contents = getMetaContents(privacyStartTags, attribute, name);
    if (contents.length !== 1 || contents[0] !== expectedContent) {
      failures.push(`out/privacy.html must contain exact ${name} metadata.`);
    }
  }
}

const renderedPdfHrefs = new Set();

for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, "utf8");
  const relativePath = path.relative(projectRoot, htmlFile).replaceAll(path.sep, "/");
  const literalStartTags = getLiteralStartTags(html);

  verifySharedFooter(html, relativePath);

  const mainCount = literalStartTags.filter(
    (startTag) => startTag.tagName === "main",
  ).length;
  const h1Count = literalStartTags.filter(
    (startTag) => startTag.tagName === "h1",
  ).length;
  if (mainCount !== 1 || h1Count !== 1) {
    failures.push(
      `${relativePath} must contain exactly one main and one h1 (received main=${mainCount}, h1=${h1Count}).`,
    );
  }

  if (getJsonLdScriptContents(html).length !== 1) {
    failures.push(
      `${relativePath} must contain exactly one root Organization JSON-LD script.`,
    );
  }

  if (html.includes("/_next/image")) {
    failures.push(`${relativePath} references the Next.js image optimizer`);
  }

  if (/localhost|127\.0\.0\.1|(?::|%3a)3001/i.test(html)) {
    failures.push(`${relativePath} contains a local server reference`);
  }

  if (/\/announcements\/1(?:[/?#"']|$)/.test(html)) {
    failures.push(`${relativePath} references the removed /announcements/1 placeholder`);
  }

  for (const startTag of literalStartTags) {
    const directRequestAttribute = [
      "script",
      "img",
      "iframe",
      "source",
      "audio",
      "video",
    ].includes(startTag.tagName)
      ? "src"
      : null;
    const directRequestUrl = directRequestAttribute
      ? getLiteralAttribute(startTag.html, directRequestAttribute)
      : null;

    if (directRequestUrl && /^(?:https?:)?\/\//i.test(directRequestUrl)) {
      failures.push(
        `${relativePath} contains an external runtime resource request: ${directRequestUrl}`,
      );
    }

    if (startTag.tagName === "link") {
      const relTokens = new Set(
        (getLiteralAttribute(startTag.html, "rel") ?? "")
          .toLowerCase()
          .split(/\s+/),
      );
      const href = getLiteralAttribute(startTag.html, "href");
      const requestRels = [
        "stylesheet",
        "preload",
        "modulepreload",
        "prefetch",
        "icon",
        "manifest",
      ];
      if (
        href &&
        /^(?:https?:)?\/\//i.test(href) &&
        requestRels.some((rel) => relTokens.has(rel))
      ) {
        failures.push(
          `${relativePath} contains an external runtime link resource: ${href}`,
        );
      }
    }
  }

  for (const srcset of html.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
    if (
      srcset[1]
        .split(",")
        .some((candidate) => /^(?:https?:)?\/\//i.test(candidate.trim()))
    ) {
      failures.push(`${relativePath} contains an external runtime srcset.`);
    }
  }

  for (const startTag of literalStartTags) {
    if (startTag.tagName !== "a") continue;

    const href = getLiteralAttribute(startTag.html, "href");
    if (
      href === null ||
      (!href.toLowerCase().includes(".pdf") && !href.startsWith("/legal/"))
    ) {
      continue;
    }

    if (!isValidPublicPdfPath(href)) {
      failures.push(`${relativePath} contains an unsafe PDF link: ${href}`);
      continue;
    }

    if (!declaredPdfHrefs.has(href)) {
      failures.push(
        `${relativePath} links to a PDF that is absent from authoritative data: ${href}`,
      );
      continue;
    }

    const renderedRoute = routeFromExportPayload(htmlFile);
    const allowedOnLegalHub =
      renderedRoute === "/announcements" &&
      legalDocuments.some((document) => document.href === href);
    const allowedOnAnnouncementDetail = announcements.some(
      (announcement) =>
        announcement.document?.href === href &&
        renderedRoute === getAnnouncementPath(announcement.id),
    );

    if (!allowedOnLegalHub && !allowedOnAnnouncementDetail) {
      failures.push(
        `${relativePath} renders a declared PDF outside its authoritative page: ${href}`,
      );
      continue;
    }

    renderedPdfHrefs.add(href);
  }

  const assetUrls = new Set();
  for (const match of html.matchAll(/\b(?:src|poster)=["'](\/[^"']+)["']/gi)) {
    assetUrls.add(match[1]);
  }
  for (const match of html.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(",")) {
      const [url] = candidate.trim().split(/\s+/, 1);
      if (url?.startsWith("/")) {
        assetUrls.add(url);
      }
    }
  }

  for (const assetUrl of assetUrls) {
    const assetPath = exportedPathFromUrl(assetUrl);
    if (assetPath && !(await isFile(assetPath))) {
      failures.push(`${relativePath} references missing local asset: ${assetUrl}`);
    }
  }
}

if (
  !stringArraysMatch([...renderedPdfHrefs].sort(), [...declaredPdfHrefs].sort())
) {
  failures.push(
    `Rendered PDF links must exactly match authoritative references (expected: ${[...declaredPdfHrefs].sort().join(", ") || "none"}; received: ${[...renderedPdfHrefs].sort().join(", ") || "none"}).`,
  );
}

if (failures.length > 0) {
  console.error("Static export verification failed:");
  for (const failure of [...new Set(failures)]) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Static export verified (${htmlFiles.length} HTML files inspected).`);
}
