import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  getAnnouncementPath,
  validateAnnouncements,
} from "../lib/announcement-contract.ts";
import {
  endedServices,
  preparingServices,
  renewingServices,
  serviceCatalog,
} from "../data/services.ts";
import { isValidISODateOnly } from "../utils/formatDate.ts";

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

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(entryPath);
    }
  }

  return files;
}

function exportedPathFromUrl(url) {
  const pathname = decodeURIComponent(url.split(/[?#]/, 1)[0]);

  if (!pathname.startsWith("/") || pathname === "/") {
    return null;
  }

  return path.join(outputRoot, ...pathname.slice(1).split("/"));
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
await requireRoute("/");
await requireRoute("/announcements");

for (const announcement of announcements) {
  await requireRoute(getAnnouncementPath(announcement.id));

  const documentHref = announcement.document?.href;
  if (typeof documentHref === "string" && documentHref.startsWith("/")) {
    const documentPath = exportedPathFromUrl(documentHref);
    if (documentPath && !(await isFile(documentPath))) {
      failures.push(
        `Announcement ${announcement.id} references a missing document: ${documentHref}`,
      );
    }
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

let htmlFiles = [];
try {
  htmlFiles = await collectHtmlFiles(outputRoot);
} catch {
  failures.push("Unable to inspect the out/ directory. Run `npm run build` first.");
}

let homepageHtml = "";
try {
  homepageHtml = await readFile(path.join(outputRoot, "index.html"), "utf8");
} catch {
  // The required-file check above already reports a missing homepage.
}

if (homepageHtml) {
  const accessibleMusePickerHeadingCount =
    countAccessibleMusePickerHeadings(homepageHtml);
  if (accessibleMusePickerHeadingCount !== 1) {
    failures.push(
      `out/index.html must contain exactly one accessible MusePicker heading (received: ${accessibleMusePickerHeadingCount}).`,
    );
  }

  const literalStartTags = getLiteralStartTags(homepageHtml);
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
  const baseLegalLinkStartTags = legalLinkStartTags.filter((startTag) => {
    const href = getLiteralAttribute(startTag.html, "href");
    const url = href === null ? null : getBannangcoUrl(href);
    return url?.pathname.replace(/\/+$/, "") === "/announcements";
  });
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

for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, "utf8");
  const relativePath = path.relative(projectRoot, htmlFile).replaceAll(path.sep, "/");

  if (html.includes("/_next/image")) {
    failures.push(`${relativePath} references the Next.js image optimizer`);
  }

  if (/localhost|127\.0\.0\.1|(?::|%3a)3001/i.test(html)) {
    failures.push(`${relativePath} contains a local server reference`);
  }

  if (/\/announcements\/1(?:[/?#"']|$)/.test(html)) {
    failures.push(`${relativePath} references the removed /announcements/1 placeholder`);
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

if (failures.length > 0) {
  console.error("Static export verification failed:");
  for (const failure of [...new Set(failures)]) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Static export verified (${htmlFiles.length} HTML files inspected).`);
}
