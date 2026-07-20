import { isIP } from "node:net";

export const PRODUCTION_ORIGIN = "https://bannangco.com";
export const LEGACY_WORKERS_URL =
  "https://bannangco-homepage-v2.yunboshim.workers.dev";

export const REQUIRED_ROUTES = [
  "/",
  "/privacy",
  "/announcements",
  "/robots.txt",
  "/sitemap.xml",
];

export const REQUIRED_SECURITY_HEADERS = [
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
];

const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
const HTML_BODY_LIMIT = 1024 * 1024;
const TEXT_BODY_LIMIT = 512 * 1024;
const LEGACY_BODY_LIMIT = 128 * 1024;
const MAX_RUNTIME_ASSETS = 128;

function stripIpv6Brackets(hostname) {
  return hostname.startsWith("[") && hostname.endsWith("]")
    ? hostname.slice(1, -1)
    : hostname;
}

function mappedIpv4Address(address) {
  if (!address.startsWith("::ffff:")) {
    return null;
  }
  const suffix = address.slice("::ffff:".length);
  if (isIP(suffix) === 4) {
    return suffix;
  }
  const groups = suffix.split(":");
  if (
    groups.length !== 2 ||
    groups.some((group) => !/^[\da-f]{1,4}$/i.test(group))
  ) {
    return null;
  }
  const high = Number.parseInt(groups[0], 16);
  const low = Number.parseInt(groups[1], 16);
  return [high >> 8, high & 255, low >> 8, low & 255].join(".");
}

function isPrivateAddress(hostname) {
  const normalized = stripIpv6Brackets(hostname.toLowerCase()).replace(/\.$/, "");

  if (normalized === "localhost" || normalized.endsWith(".localhost")) {
    return true;
  }

  const version = isIP(normalized);
  if (version === 4) {
    const octets = normalized.split(".").map(Number);
    return (
      octets[0] === 0 ||
      octets[0] === 10 ||
      octets[0] === 127 ||
      (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127) ||
      (octets[0] === 169 && octets[1] === 254) ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168) ||
      (octets[0] === 198 && (octets[1] === 18 || octets[1] === 19))
    );
  }

  if (version === 6) {
    const mappedAddress = mappedIpv4Address(normalized);
    return (
      (mappedAddress && isPrivateAddress(mappedAddress)) ||
      normalized === "::" ||
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      /^fe[89ab]/.test(normalized) ||
      normalized.startsWith("::ffff:127.")
    );
  }

  return false;
}

export function parsePublicBaseUrl(value = PRODUCTION_ORIGIN) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("The public base URL is not a valid absolute URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("The public base URL must use HTTP or HTTPS.");
  }
  if (url.username || url.password) {
    throw new Error("The public base URL must not contain credentials.");
  }
  if (url.search || url.hash) {
    throw new Error("The public base URL must not contain a query or fragment.");
  }
  if (url.pathname !== "/") {
    throw new Error("The public base URL must be an origin without a path.");
  }
  if (isPrivateAddress(url.hostname)) {
    throw new Error("The public base URL must not target localhost or a private address.");
  }
  if (url.port === "3001") {
    throw new Error("The public base URL must not use the development port 3001.");
  }

  return new URL(url.origin);
}

export function parseCliOptions(argv) {
  let help = false;

  for (const argument of argv) {
    if (argument === "--help" || argument === "-h") {
      help = true;
      continue;
    }
    throw new Error("Unsupported production-check option.");
  }

  return {
    baseUrl: parsePublicBaseUrl(PRODUCTION_ORIGIN),
    help,
  };
}

export function isRetryableStatus(status) {
  return RETRYABLE_STATUSES.has(status);
}

export async function readBodyLimited(response, maximumBytes) {
  if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 0) {
    throw new Error("The response body limit must be a non-negative integer.");
  }

  if (!response.body || maximumBytes === 0) {
    await response.body?.cancel().catch(() => {});
    return "";
  }

  const declaredLength = Number(response.headers.get("content-length"));
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > maximumBytes
  ) {
    await response.body?.cancel().catch(() => {});
    const error = new Error("The response body exceeded the configured size limit.");
    error.code = "BODY_LIMIT";
    throw error;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      received += value.byteLength;
      if (received > maximumBytes) {
        await reader.cancel().catch(() => {});
        const error = new Error("The response body exceeded the configured size limit.");
        error.code = "BODY_LIMIT";
        throw error;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(body);
}

function createAbortErrorMessage(error) {
  if (error?.name === "AbortError") {
    return "The request timed out.";
  }
  return "The request failed before a usable response was received.";
}

export function createHttpRequester({
  fetchImpl = globalThis.fetch,
  timeoutMs = 10_000,
  maximumAttempts = 3,
  retryDelaysMs = [250, 750],
  sleep = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds)),
  onRequest = () => {},
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("A fetch implementation is required.");
  }

  return async function request(
    url,
    {
      bodyLimit = HTML_BODY_LIMIT,
      readBody = true,
      accept = "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
    } = {},
  ) {
    let finalError;

    for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      timer.unref?.();

      try {
        const response = await fetchImpl(url, {
          method: "GET",
          redirect: "manual",
          signal: controller.signal,
          headers: {
            accept,
            "user-agent": "Bannangco-Production-Assurance/1.0",
          },
        });

        if (isRetryableStatus(response.status) && attempt < maximumAttempts) {
          await response.body?.cancel().catch(() => {});
          await sleep(retryDelaysMs[attempt - 1] ?? retryDelaysMs.at(-1) ?? 0);
          continue;
        }

        const body = readBody
          ? await readBodyLimited(response, bodyLimit)
          : await readBodyLimited(response, 0);
        const normalized = {
          status: response.status,
          headers: response.headers,
          body,
          attempts: attempt,
        };
        onRequest({ url: new URL(url).href, status: response.status, attempt });
        return normalized;
      } catch (error) {
        finalError = error;
        if (error?.code === "BODY_LIMIT") {
          throw error;
        }
        if (attempt < maximumAttempts) {
          await sleep(retryDelaysMs[attempt - 1] ?? retryDelaysMs.at(-1) ?? 0);
          continue;
        }
      } finally {
        clearTimeout(timer);
      }
    }

    const requestError = new Error(
      finalError?.message?.includes("size limit")
        ? finalError.message
        : createAbortErrorMessage(finalError),
    );
    requestError.code = "NETWORK";
    throw requestError;
  };
}

export function decodeHtmlEntities(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    );
}

export function parseHtmlAttributes(tag) {
  const content = tag
    .replace(/^<\s*[\w:-]+\s*/i, "")
    .replace(/\/?\s*>$/, "");
  const attributes = {};
  const pattern = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;

  while ((match = pattern.exec(content))) {
    attributes[match[1].toLowerCase()] = decodeHtmlEntities(
      match[2] ?? match[3] ?? match[4] ?? "",
    );
  }
  return attributes;
}

function extractTags(html, tagName) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) ?? [];
}

function parseSrcset(value) {
  return value
    .split(",")
    .map((candidate) => candidate.trim().split(/\s+/, 1)[0])
    .filter(Boolean);
}

function addRuntimeValue(values, value) {
  if (
    !value ||
    value.startsWith("#") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return;
  }
  values.add(value);
}

export function extractCssUrls(css) {
  const urls = [];
  const pattern = /url\(\s*(?:"([^"]+)"|'([^']+)'|([^)'"\s][^)]*?))\s*\)/gi;
  let match;
  while ((match = pattern.exec(css))) {
    const value = (match[1] ?? match[2] ?? match[3] ?? "").trim();
    if (
      value &&
      !value.startsWith("#") &&
      !value.startsWith("data:") &&
      !value.startsWith("blob:")
    ) {
      urls.push(value);
    }
  }
  return urls;
}

export function visibleText(html) {
  return decodeHtmlEntities(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function extractHtmlContract(html) {
  const canonicalUrls = [];
  const openGraphUrls = [];
  const metadataUrls = [];
  const runtimeUrls = new Set();

  for (const tag of extractTags(html, "link")) {
    const attributes = parseHtmlAttributes(tag);
    const relationships = (attributes.rel ?? "")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    if (relationships.includes("canonical") && attributes.href) {
      canonicalUrls.push(attributes.href);
      metadataUrls.push(attributes.href);
    }
    if (
      attributes.href &&
      relationships.some((relationship) =>
        [
          "stylesheet",
          "preload",
          "modulepreload",
          "icon",
          "apple-touch-icon",
          "manifest",
        ].includes(relationship),
      )
    ) {
      addRuntimeValue(runtimeUrls, attributes.href);
    }
  }

  for (const tag of extractTags(html, "meta")) {
    const attributes = parseHtmlAttributes(tag);
    const property = (attributes.property ?? attributes.name ?? "").toLowerCase();
    const content = attributes.content;
    if (property === "og:url" && content) {
      openGraphUrls.push(content);
    }
    if (
      content &&
      (property.startsWith("og:") || property.startsWith("twitter:")) &&
      /^(?:https?:)?\/\//i.test(content)
    ) {
      metadataUrls.push(content);
    }
  }

  for (const tag of extractTags(html, "script")) {
    addRuntimeValue(runtimeUrls, parseHtmlAttributes(tag).src);
  }

  for (const tagName of [
    "img",
    "source",
    "video",
    "audio",
    "iframe",
    "embed",
    "input",
    "track",
    "image",
  ]) {
    for (const tag of extractTags(html, tagName)) {
      const attributes = parseHtmlAttributes(tag);
      addRuntimeValue(runtimeUrls, attributes.src);
      addRuntimeValue(runtimeUrls, attributes.poster);
      addRuntimeValue(runtimeUrls, attributes.href);
      addRuntimeValue(runtimeUrls, attributes["xlink:href"]);
      for (const candidate of parseSrcset(attributes.srcset ?? "")) {
        addRuntimeValue(runtimeUrls, candidate);
      }
      for (const candidate of extractCssUrls(attributes.style ?? "")) {
        addRuntimeValue(runtimeUrls, candidate);
      }
    }
  }

  for (const tag of extractTags(html, "object")) {
    addRuntimeValue(runtimeUrls, parseHtmlAttributes(tag).data);
  }
  for (const tag of extractTags(html, "use")) {
    const attributes = parseHtmlAttributes(tag);
    addRuntimeValue(runtimeUrls, attributes.href);
    addRuntimeValue(runtimeUrls, attributes["xlink:href"]);
  }
  for (const tag of html.match(/<[\w:-]+\b[^>]*\bstyle\s*=\s*(?:"[^"]*"|'[^']*')[^>]*>/gi) ?? []) {
    for (const candidate of extractCssUrls(parseHtmlAttributes(tag).style ?? "")) {
      addRuntimeValue(runtimeUrls, candidate);
    }
  }
  for (const match of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    for (const candidate of extractCssUrls(match[1])) {
      addRuntimeValue(runtimeUrls, candidate);
    }
  }

  return {
    canonicalUrls,
    openGraphUrls,
    metadataUrls,
    runtimeUrls: [...runtimeUrls],
    text: visibleText(html),
  };
}

export function parseRobots(text) {
  const directives = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+#.*$/, "").trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(":");
      return separator < 0
        ? null
        : {
            name: line.slice(0, separator).trim().toLowerCase(),
            value: line.slice(separator + 1).trim(),
          };
    })
    .filter(Boolean);

  let inWildcardGroup = false;
  const wildcardDirectives = [];
  for (const directive of directives) {
    if (directive.name === "user-agent") {
      inWildcardGroup = directive.value === "*";
      continue;
    }
    if (inWildcardGroup && ["allow", "disallow"].includes(directive.name)) {
      wildcardDirectives.push(directive);
    }
  }

  return {
    hasWildcardAgent: directives.some(
      (directive) =>
        directive.name === "user-agent" && directive.value === "*",
    ),
    allowsRoot: wildcardDirectives.some(
      (directive) => directive.name === "allow" && directive.value === "/",
    ),
    blocksRoot: wildcardDirectives.some(
      (directive) => directive.name === "disallow" && directive.value === "/",
    ),
    sitemaps: directives
      .filter((directive) => directive.name === "sitemap")
      .map((directive) => directive.value),
    hosts: directives
      .filter((directive) => directive.name === "host")
      .map((directive) => directive.value),
  };
}

export function parseSitemapLocations(xml) {
  return [...xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)].map((match) =>
    decodeHtmlEntities(match[1].trim()),
  );
}

export function parseCacheControl(value = "") {
  const directives = new Map();
  for (const part of value.split(",")) {
    const [rawName, rawValue] = part.trim().split("=", 2);
    if (!rawName) {
      continue;
    }
    directives.set(
      rawName.toLowerCase(),
      rawValue?.replace(/^"|"$/g, "") ?? true,
    );
  }
  return directives;
}

export function validateRedirectHop({ status, location, source, expected }) {
  if (status !== 301 && status !== 308) {
    return { ok: false, detail: `expected 301/308, received ${status}` };
  }
  if (!location) {
    return { ok: false, detail: "permanent redirect omitted Location" };
  }

  let actual;
  try {
    actual = new URL(location, source).href;
  } catch {
    return { ok: false, detail: "redirect Location is not a valid URL" };
  }

  if (actual !== expected) {
    return { ok: false, detail: "redirect did not preserve the exact path/query" };
  }
  return { ok: true, detail: `${status} -> ${actual}` };
}

export function classifyLegacyResponse(status, body = "") {
  if (status === 404 || status === 410) {
    return { ok: true, classification: "disabled", detail: `HTTP ${status}` };
  }
  if (
    [401, 403, 451, 530].includes(status) &&
    /disabled|not found|not available|workers_dev/i.test(body)
  ) {
    return {
      ok: true,
      classification: "explicitly-disabled",
      detail: `HTTP ${status} explicitly disabled`,
    };
  }
  if (status === 200) {
    const servesProduction =
      /https:\/\/bannangco\.com/i.test(body) ||
      /Bannangco|반낭코/i.test(visibleText(body));
    return {
      ok: false,
      classification: servesProduction
        ? "canonical-site-public"
        : "unexpected-public-response",
      detail: servesProduction
        ? "legacy URL still serves the canonical production site"
        : "legacy URL unexpectedly returns a public 200 response",
    };
  }
  return {
    ok: false,
    classification: "unexpected-response",
    detail: `unexpected HTTP ${status}`,
  };
}

function normalizedUrl(value, base) {
  try {
    return new URL(value, base);
  } catch {
    return null;
  }
}

function isForbiddenPublicUrl(value) {
  const url = normalizedUrl(value);
  if (!url) {
    return true;
  }
  const hostname = url.hostname.toLowerCase();
  return (
    hostname === "www.bannangco.com" ||
    hostname.endsWith(".workers.dev") ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    stripIpv6Brackets(hostname) === "127.0.0.1" ||
    url.port === "3001"
  );
}

function headerValue(response, name) {
  if (!response?.headers) {
    return null;
  }
  if (typeof response.headers.get === "function") {
    return response.headers.get(name);
  }
  const key = Object.keys(response.headers).find(
    (candidate) => candidate.toLowerCase() === name.toLowerCase(),
  );
  return key ? String(response.headers[key]) : null;
}

function isManagedInsightsUrl(url) {
  return (
    url.protocol === "https:" &&
    url.hostname === "static.cloudflareinsights.com" &&
    url.pathname.startsWith("/beacon.min.js")
  );
}

function hasHashedNextAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") &&
    /(?:^|[-.])[a-f0-9]{8,}(?:[-.]|$)/i.test(url.pathname.split("/").at(-1))
  );
}

export function exitCodeForReport(report) {
  return report.ok ? 0 : 1;
}

export function formatProductionReport(report) {
  const lines = report.checks.map(
    (check) => `${check.status.padEnd(4)} ${check.name} — ${check.detail}`,
  );
  const passed = report.checks.filter((check) => check.status === "PASS").length;
  const failed = report.checks.filter((check) => check.status === "FAIL").length;
  const informational = report.checks.filter(
    (check) => check.status === "INFO",
  ).length;
  lines.push(
    `${report.ok ? "PASS" : "FAIL"} production assurance: ${passed} passed, ${failed} failed, ${informational} informational`,
  );
  return lines.join("\n");
}

export async function runProductionAssurance({
  request,
  baseUrl = parsePublicBaseUrl(),
  canonicalOrigin = PRODUCTION_ORIGIN,
  legacyUrl = LEGACY_WORKERS_URL,
  privacyFacts,
  nonce = "p6a",
} = {}) {
  if (typeof request !== "function") {
    throw new TypeError("runProductionAssurance requires an injected request function.");
  }
  if (!privacyFacts) {
    throw new TypeError("runProductionAssurance requires privacy facts.");
  }

  const targetBase = parsePublicBaseUrl(baseUrl.href ?? baseUrl);
  const canonicalBase = parsePublicBaseUrl(canonicalOrigin);
  const checks = [];
  const responses = new Map();
  const add = (status, name, detail) => checks.push({ status, name, detail });
  const addResult = (ok, name, detail) => add(ok ? "PASS" : "FAIL", name, detail);

  async function fetchTarget(label, url, options) {
    try {
      const response = await request(url, options);
      responses.set(url, response);
      return response;
    } catch (error) {
      add("FAIL", label, error?.message || "request failed");
      return null;
    }
  }

  const pageRoutes = ["/", "/privacy", "/announcements"];
  for (const route of REQUIRED_ROUTES) {
    const url = new URL(route, targetBase).href;
    const response = await fetchTarget(`route ${route}`, url, {
      bodyLimit: route.endsWith(".xml") || route.endsWith(".txt")
        ? TEXT_BODY_LIMIT
        : HTML_BODY_LIMIT,
      accept: route.endsWith(".xml")
        ? "application/xml,text/xml;q=0.9,*/*;q=0.8"
        : route.endsWith(".txt")
          ? "text/plain,*/*;q=0.8"
          : undefined,
    });
    if (response) {
      addResult(response.status === 200, `route ${route}`, `HTTP ${response.status}`);
    }
  }

  const missingPath = `/__production-assurance-${String(nonce).replace(/[^a-z0-9-]/gi, "-")}`;
  const missingUrl = new URL(missingPath, targetBase).href;
  const missingResponse = await fetchTarget("custom 404", missingUrl, {
    bodyLimit: HTML_BODY_LIMIT,
  });
  if (missingResponse) {
    const customBody =
      /Signal lost\s*\/\s*404/i.test(missingResponse.body) ||
      visibleText(missingResponse.body).includes("요청한 신호를 찾을 수 없습니다.");
    addResult(
      missingResponse.status === 404 && customBody,
      "custom 404",
      `HTTP ${missingResponse.status}; marker ${customBody ? "present" : "missing"}`,
    );
  }

  for (const [url, response] of responses) {
    if (
      !REQUIRED_ROUTES.some((route) => new URL(route, targetBase).href === url) &&
      url !== missingUrl
    ) {
      continue;
    }
    const missingHeaders = REQUIRED_SECURITY_HEADERS.filter(
      (name) => !headerValue(response, name),
    );
    addResult(
      missingHeaders.length === 0,
      `security headers ${new URL(url).pathname}`,
      missingHeaders.length === 0
        ? "all required headers present"
        : `missing ${missingHeaders.join(", ")}`,
    );
  }

  const redirectPath = `/privacy?probe=p6a-${encodeURIComponent(nonce)}&path=signal%2Fops`;
  const expectedRedirect = new URL(redirectPath, canonicalBase).href;
  const redirectSources = [
    `http://bannangco.com${redirectPath}`,
    `https://www.bannangco.com${redirectPath}`,
    `http://www.bannangco.com${redirectPath}`,
  ];
  for (const source of redirectSources) {
    const response = await fetchTarget(`redirect ${new URL(source).origin}`, source, {
      readBody: false,
      bodyLimit: 0,
    });
    if (!response) {
      continue;
    }
    const hop = validateRedirectHop({
      status: response.status,
      location: headerValue(response, "location"),
      source,
      expected: expectedRedirect,
    });
    if (!hop.ok) {
      add("FAIL", `redirect ${new URL(source).origin}`, hop.detail);
      continue;
    }
    const finalResponse = await fetchTarget(
      `redirect final ${new URL(source).origin}`,
      expectedRedirect,
      { readBody: false, bodyLimit: 0 },
    );
    const exactlyOneHop =
      finalResponse?.status === 200 && !headerValue(finalResponse, "location");
    addResult(
      exactlyOneHop,
      `redirect ${new URL(source).origin}`,
      exactlyOneHop ? hop.detail : "redirect did not terminate at HTTPS apex in one hop",
    );
  }

  const contracts = new Map();
  for (const route of pageRoutes) {
    const url = new URL(route, targetBase).href;
    const response = responses.get(url);
    if (!response || response.status !== 200) {
      continue;
    }
    const contract = extractHtmlContract(response.body);
    contracts.set(url, contract);
    const expected = new URL(route, canonicalBase).href;
    const canonicalUrl = normalizedUrl(contract.canonicalUrls[0]);
    const openGraphUrl = normalizedUrl(contract.openGraphUrls[0]);
    const canonicalMatches =
      contract.canonicalUrls.length === 1 &&
      canonicalUrl?.protocol === "https:" &&
      canonicalUrl?.origin === canonicalBase.origin &&
      canonicalUrl?.href === expected;
    const openGraphMatches =
      contract.openGraphUrls.length === 1 &&
      openGraphUrl?.protocol === "https:" &&
      openGraphUrl?.origin === canonicalBase.origin &&
      openGraphUrl?.href === expected;
    const unsafeMetadata = contract.metadataUrls.filter((value) => {
      const urlValue = normalizedUrl(value);
      return (
        !urlValue ||
        urlValue.protocol !== "https:" ||
        urlValue.origin !== canonicalBase.origin ||
        isForbiddenPublicUrl(value)
      );
    });
    addResult(
      canonicalMatches && openGraphMatches && unsafeMetadata.length === 0,
      `metadata ${route}`,
      canonicalMatches && openGraphMatches && unsafeMetadata.length === 0
        ? `canonical and og:url use ${expected}`
        : "canonical, og:url, or public metadata origin is invalid",
    );
  }

  const robotsUrl = new URL("/robots.txt", targetBase).href;
  const robotsResponse = responses.get(robotsUrl);
  if (robotsResponse?.status === 200) {
    const robots = parseRobots(robotsResponse.body);
    const expectedSitemap = new URL("/sitemap.xml", canonicalBase).href;
    const safeValues = [...robots.sitemaps, ...robots.hosts].every(
      (value) => !isForbiddenPublicUrl(value),
    );
    const valid =
      robots.hasWildcardAgent &&
      robots.allowsRoot &&
      !robots.blocksRoot &&
      robots.sitemaps.length === 1 &&
      normalizedUrl(robots.sitemaps[0])?.href === expectedSitemap &&
      safeValues;
    addResult(
      valid,
      "robots policy",
      valid ? `public crawling; sitemap ${expectedSitemap}` : "robots policy is invalid",
    );
  }

  const sitemapUrl = new URL("/sitemap.xml", targetBase).href;
  const sitemapResponse = responses.get(sitemapUrl);
  if (sitemapResponse?.status === 200) {
    const locations = parseSitemapLocations(sitemapResponse.body);
    const normalized = locations.map((value) => normalizedUrl(value)?.href);
    const unique = new Set(normalized);
    const required = ["/", "/privacy", "/announcements"].map(
      (route) => new URL(route, canonicalBase).href,
    );
    const validLocations = normalized.every((value) => {
      const url = value ? new URL(value) : null;
      return (
        url &&
        url.protocol === "https:" &&
        url.origin === canonicalBase.origin &&
        !url.username &&
        !url.password &&
        !url.search &&
        !url.hash &&
        !isForbiddenPublicUrl(value)
      );
    });
    const validSet =
      locations.length > 0 &&
      unique.size === locations.length &&
      required.every((value) => unique.has(value)) &&
      validLocations;
    addResult(
      validSet,
      "sitemap contract",
      validSet
        ? `${locations.length} unique HTTPS apex URLs; required routes present`
        : "sitemap URLs are missing, duplicate, or outside HTTPS apex",
    );

    if (validSet) {
      for (const location of normalized) {
        const response = await fetchTarget(`sitemap URL ${new URL(location).pathname}`, location, {
          readBody: false,
          bodyLimit: 0,
        });
        if (response) {
          addResult(
            response.status === 200,
            `sitemap URL ${new URL(location).pathname}`,
            `HTTP ${response.status}`,
          );
        }
      }
    }
  }

  const privacyUrl = new URL("/privacy", targetBase).href;
  const privacyContract = contracts.get(privacyUrl);
  if (privacyContract) {
    const requiredFacts = [
      privacyFacts.controller,
      privacyFacts.privacyOfficer,
      privacyFacts.contactEmail,
      "Cloudflare Web Analytics",
    ];
    const missingFacts = requiredFacts.filter(
      (fact) => !privacyContract.text.includes(fact),
    );
    addResult(
      missingFacts.length === 0,
      "privacy disclosure",
      missingFacts.length === 0
        ? "approved contact facts and Cloudflare disclosure present"
        : "approved privacy facts are missing",
    );
  }

  const runtimeUrls = new Map();
  for (const [pageUrl, contract] of contracts) {
    for (const reference of contract.runtimeUrls) {
      const resolved = normalizedUrl(reference, pageUrl);
      if (resolved) {
        runtimeUrls.set(resolved.href, resolved);
      } else {
        add("FAIL", "runtime assets", "an asset reference is not a valid URL");
      }
    }
  }
  if (missingResponse?.body) {
    const contract = extractHtmlContract(missingResponse.body);
    for (const reference of contract.runtimeUrls) {
      const resolved = normalizedUrl(reference, missingUrl);
      if (resolved) {
        runtimeUrls.set(resolved.href, resolved);
      }
    }
  }

  if (runtimeUrls.size > MAX_RUNTIME_ASSETS) {
    add("FAIL", "runtime assets", `discovered more than ${MAX_RUNTIME_ASSETS} assets`);
  } else {
    const assetResponses = new Map();
    let unexpectedExternal = 0;
    let brokenAssets = 0;
    for (const [href, url] of runtimeUrls) {
      if (runtimeUrls.size > MAX_RUNTIME_ASSETS) {
        brokenAssets += 1;
        add(
          "FAIL",
          "runtime assets",
          `discovered more than ${MAX_RUNTIME_ASSETS} assets`,
        );
        break;
      }
      const firstParty =
        url.origin === targetBase.origin || url.origin === canonicalBase.origin;
      if (!firstParty) {
        if (!isManagedInsightsUrl(url)) {
          unexpectedExternal += 1;
        }
        continue;
      }
      const inspectCss = url.pathname.toLowerCase().endsWith(".css");
      const response = await fetchTarget(`asset ${url.pathname}`, href, {
        readBody: inspectCss,
        bodyLimit: inspectCss ? TEXT_BODY_LIMIT : 0,
        accept: inspectCss ? "text/css,*/*;q=0.8" : "*/*",
      });
      if (!response || response.status !== 200) {
        brokenAssets += 1;
      } else {
        assetResponses.set(href, response);
        if (inspectCss) {
          for (const reference of extractCssUrls(response.body)) {
            const resolved = normalizedUrl(reference, href);
            if (resolved && !runtimeUrls.has(resolved.href)) {
              runtimeUrls.set(resolved.href, resolved);
            }
          }
        }
      }
    }
    addResult(
      unexpectedExternal === 0 && brokenAssets === 0,
      "runtime assets",
      unexpectedExternal === 0 && brokenAssets === 0
        ? `${runtimeUrls.size} references valid; only Cloudflare Insights is externally allowed`
        : `${brokenAssets} broken first-party and ${unexpectedExternal} unexpected external references`,
    );

    const hashedAsset = [...runtimeUrls.values()].find(hasHashedNextAsset);
    const hashedResponse = hashedAsset
      ? assetResponses.get(hashedAsset.href) ?? responses.get(hashedAsset.href)
      : null;
    const cache = parseCacheControl(headerValue(hashedResponse, "cache-control") ?? "");
    const immutable =
      hashedAsset &&
      hashedResponse?.status === 200 &&
      cache.has("public") &&
      cache.get("max-age") === "31536000" &&
      cache.has("immutable");
    addResult(
      Boolean(immutable),
      "hashed asset cache",
      immutable
        ? `${hashedAsset.pathname}: public, max-age=31536000, immutable`
        : "no hashed Next asset with immutable one-year caching was verified",
    );
  }

  try {
    const response = await request(legacyUrl, {
      bodyLimit: LEGACY_BODY_LIMIT,
      accept: "text/html,text/plain;q=0.9,*/*;q=0.8",
    });
    const classification = classifyLegacyResponse(response.status, response.body);
    addResult(
      classification.ok,
      "legacy workers.dev",
      classification.detail,
    );
  } catch (error) {
    if (error?.code === "NETWORK") {
      add("PASS", "legacy workers.dev", "network endpoint unavailable");
    } else {
      add("FAIL", "legacy workers.dev", "response could not be validated safely");
    }
  }

  const homepageResponse = responses.get(new URL("/", targetBase).href);
  add(
    "INFO",
    "HSTS",
    headerValue(homepageResponse, "strict-transport-security")
      ? "present"
      : "absent (informational)",
  );
  add(
    "INFO",
    "CSP",
    headerValue(homepageResponse, "content-security-policy") ||
      headerValue(homepageResponse, "content-security-policy-report-only")
      ? "present"
      : "absent (informational)",
  );

  return {
    ok: !checks.some((check) => check.status === "FAIL"),
    baseUrl: targetBase.href,
    checks,
  };
}
