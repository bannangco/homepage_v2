import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  classifyLegacyResponse,
  createHttpRequester,
  exitCodeForReport,
  extractCssUrls,
  extractHtmlContract,
  isRetryableStatus,
  parseCacheControl,
  parseCliOptions,
  parsePublicBaseUrl,
  parseRobots,
  parseSitemapLocations,
  readBodyLimited,
  runProductionAssurance,
  validateRedirectHop,
} from "../lib/production-assurance.mjs";
import { PRIVACY_POLICY_FACTS } from "../lib/privacy-policy.ts";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "SAMEORIGIN",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), geolocation=(), microphone=()",
};

function normalizedResponse(status, body = "", headers = {}) {
  return {
    status,
    body,
    headers: new Headers({ ...SECURITY_HEADERS, ...headers }),
    attempts: 1,
  };
}

function pageHtml(route, { privacy = false, unsafeScript = false } = {}) {
  const canonical = new URL(route, "https://bannangco.com").href;
  const privacyText = privacy
    ? `${PRIVACY_POLICY_FACTS.controller} ${PRIVACY_POLICY_FACTS.privacyOfficer} ${PRIVACY_POLICY_FACTS.contactEmail} Cloudflare Web Analytics`
    : "Bannangco";
  return `<!doctype html><html lang="ko"><head>
    <link rel="canonical" href="${canonical}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="https://bannangco.com/images/ogimage.png">
    <meta name="twitter:image" content="https://bannangco.com/images/ogimage.png">
    <link rel="stylesheet" href="/_next/static/css/app-1234abcd.css">
    <script src="/_next/static/chunks/app-abcdef123456.js"></script>
    <script src="https://static.cloudflareinsights.com/beacon.min.js/v123"></script>
    ${unsafeScript ? '<script src="https://tracker.example/script.js"></script>' : ""}
  </head><body><main><h1>${privacyText}</h1><img src="/images/logo.svg" alt=""></main></body></html>`;
}

function createFixtureRequest({
  malformed = false,
  relativeMetadata = false,
  legacyError = null,
} = {}) {
  const redirectPath = "/privacy?probe=p6a-fixture&path=signal%2Fops";
  const finalRedirect = `https://bannangco.com${redirectPath}`;
  const sitemap = `<?xml version="1.0"?><urlset>
    <url><loc>https://bannangco.com</loc></url>
    <url><loc>https://bannangco.com/privacy</loc></url>
    <url><loc>https://bannangco.com/announcements</loc></url>
  </urlset>`;

  return async (value) => {
    const url = new URL(value);
    if (url.hostname === "bannangco-homepage-v2.yunboshim.workers.dev") {
      if (legacyError) {
        throw legacyError;
      }
      return normalizedResponse(404, "Not Found");
    }
    if (
      ["http://bannangco.com", "https://www.bannangco.com", "http://www.bannangco.com"].includes(
        url.origin,
      )
    ) {
      return normalizedResponse(301, "", { location: finalRedirect });
    }
    if (url.href === finalRedirect) {
      return normalizedResponse(200);
    }
    if (url.pathname.startsWith("/__production-assurance-")) {
      return normalizedResponse(
        404,
        "<main><h1>요청한 신호를 찾을 수 없습니다.</h1><p>Signal lost / 404</p></main>",
      );
    }
    if (url.pathname === "/robots.txt") {
      return normalizedResponse(
        200,
        "User-Agent: *\nAllow: /\nHost: https://bannangco.com\nSitemap: https://bannangco.com/sitemap.xml\n",
      );
    }
    if (url.pathname === "/sitemap.xml") {
      return normalizedResponse(200, sitemap);
    }
    if (url.pathname.startsWith("/_next/static/")) {
      return normalizedResponse(200, "", {
        "cache-control": "public, max-age=31536000, immutable",
      });
    }
    if (url.pathname === "/images/logo.svg") {
      return normalizedResponse(200);
    }
    if (url.pathname === "/privacy") {
      const html = pageHtml("/privacy", {
        privacy: true,
        unsafeScript: malformed,
      });
      return normalizedResponse(
        200,
        relativeMetadata
          ? html.replaceAll("https://bannangco.com/privacy", "/privacy")
          : malformed
            ? html.replace(
              "https://bannangco.com/privacy\"",
              "https://www.bannangco.com/privacy\"",
            )
            : html,
      );
    }
    if (url.pathname === "/announcements") {
      return normalizedResponse(200, pageHtml("/announcements"));
    }
    if (url.pathname === "/") {
      return normalizedResponse(200, pageHtml("/"));
    }
    if (url.hostname === "tracker.example") {
      return normalizedResponse(200);
    }
    throw new Error("fixture request was not declared");
  };
}

test("accepts only origin-only public HTTP(S) base URLs", () => {
  assert.equal(parsePublicBaseUrl().href, "https://bannangco.com/");
  assert.equal(
    parsePublicBaseUrl("https://preview.example:8443").href,
    "https://preview.example:8443/",
  );

  for (const invalid of [
    "ftp://example.com",
    "https://user:secret@example.com",
    "https://example.com/path",
    "https://example.com?probe=1",
    "https://example.com#fragment",
    "http://localhost",
    "http://localhost.:8080",
    "http://sub.localhost",
    "http://127.0.0.1",
    "http://192.168.1.2",
    "http://[::1]",
    "http://[::ffff:7f00:1]:8080",
    "http://[::ffff:c0a8:101]:8080",
    "https://example.com:3001",
  ]) {
    assert.throws(() => parsePublicBaseUrl(invalid));
  }
});

test("parses a single CLI or environment base override without echoing credentials", () => {
  assert.equal(
    parseCliOptions(["--base-url", "https://preview.example"], {}).baseUrl.href,
    "https://preview.example/",
  );
  assert.equal(
    parseCliOptions([], {
      BANNANGCO_PRODUCTION_BASE_URL: "https://preview.example",
    }).baseUrl.href,
    "https://preview.example/",
  );
  assert.throws(
    () =>
      parseCliOptions(["--base-url=https://preview.example"], {
        BANNANGCO_PRODUCTION_BASE_URL: "https://other.example",
      }),
    /either --base-url/,
  );
  assert.throws(() => parseCliOptions(["--unknown"], {}), /Unknown/);
  assert.throws(
    () => parseCliOptions(["--base-url=https://user:secret@example.com"], {}),
    (error) => !error.message.includes("secret"),
  );
});

test("validates an exact one-hop permanent redirect with path and query", () => {
  const source = "http://www.bannangco.com/privacy?probe=p6a&path=a%2Fb";
  const expected = "https://bannangco.com/privacy?probe=p6a&path=a%2Fb";
  assert.deepEqual(
    validateRedirectHop({ status: 301, location: expected, source, expected }).ok,
    true,
  );
  assert.equal(
    validateRedirectHop({ status: 302, location: expected, source, expected }).ok,
    false,
  );
  assert.equal(
    validateRedirectHop({
      status: 308,
      location: "https://bannangco.com/privacy?probe=p6a",
      source,
      expected,
    }).ok,
    false,
  );
});

test("extracts metadata and runtime assets without treating ordinary anchors as assets", () => {
  const contract = extractHtmlContract(`${pageHtml("/")}
    <a href="https://policies.google.com/privacy">Policy</a>`);
  assert.deepEqual(contract.canonicalUrls, ["https://bannangco.com/"]);
  assert.deepEqual(contract.openGraphUrls, ["https://bannangco.com/"]);
  assert.equal(contract.runtimeUrls.includes("https://policies.google.com/privacy"), false);
  assert.equal(
    contract.runtimeUrls.includes(
      "https://static.cloudflareinsights.com/beacon.min.js/v123",
    ),
    true,
  );
  assert.deepEqual(
    extractCssUrls(
      ".hero{background:url('/images/hero.png')}@font-face{src:url(../font.woff2)}",
    ),
    ["/images/hero.png", "../font.woff2"],
  );
});

test("parses public robots and unique sitemap locations", () => {
  const robots = parseRobots(
    "User-agent: *\nAllow: /\nSitemap: https://bannangco.com/sitemap.xml",
  );
  assert.equal(robots.hasWildcardAgent, true);
  assert.equal(robots.allowsRoot, true);
  assert.equal(robots.blocksRoot, false);
  assert.deepEqual(robots.sitemaps, ["https://bannangco.com/sitemap.xml"]);
  assert.deepEqual(
    parseSitemapLocations(
      "<urlset><url><loc>https://bannangco.com/?a=1&amp;b=2</loc></url></urlset>",
    ),
    ["https://bannangco.com/?a=1&b=2"],
  );
});

test("parses immutable cache directives and classifies the legacy endpoint", () => {
  const cache = parseCacheControl("public, max-age=31536000, immutable");
  assert.equal(cache.has("public"), true);
  assert.equal(cache.get("max-age"), "31536000");
  assert.equal(cache.has("immutable"), true);
  assert.equal(classifyLegacyResponse(404).ok, true);
  assert.equal(
    classifyLegacyResponse(200, '<link rel="canonical" href="https://bannangco.com">').ok,
    false,
  );
  assert.equal(classifyLegacyResponse(500, "error").ok, false);
});

test("retries only transient network or HTTP failures", async () => {
  let calls = 0;
  const requester = createHttpRequester({
    fetchImpl: async () => {
      calls += 1;
      return calls === 1 ? new Response("retry", { status: 503 }) : new Response("ok");
    },
    sleep: async () => {},
  });
  const result = await requester("https://example.com");
  assert.equal(calls, 2);
  assert.equal(result.status, 200);
  assert.equal(result.body, "ok");
  assert.equal(isRetryableStatus(503), true);
  assert.equal(isRetryableStatus(404), false);

  let bodyLimitCalls = 0;
  const limitedRequester = createHttpRequester({
    fetchImpl: async () => {
      bodyLimitCalls += 1;
      return new Response("too large");
    },
    sleep: async () => {},
  });
  await assert.rejects(
    limitedRequester("https://example.com", { bodyLimit: 2 }),
    /size limit/,
  );
  assert.equal(bodyLimitCalls, 1);
});

test("enforces decoded response body limits", async () => {
  await assert.rejects(
    readBodyLimited(new Response("12345"), 4),
    /size limit/,
  );
  assert.equal(
    await readBodyLimited(
      new Response("asset", { headers: { "content-length": "5" } }),
      0,
    ),
    "",
  );
});

test("passes a complete deterministic production response map", async () => {
  const report = await runProductionAssurance({
    request: createFixtureRequest(),
    privacyFacts: PRIVACY_POLICY_FACTS,
    nonce: "fixture",
  });
  assert.equal(report.ok, true, JSON.stringify(report.checks, null, 2));
  assert.equal(exitCodeForReport(report), 0);
  assert.equal(report.checks.some((check) => check.name === "HSTS"), true);
  assert.equal(report.checks.some((check) => check.name === "CSP"), true);
});

test("returns a nonzero contract for malformed production fixtures", async () => {
  const report = await runProductionAssurance({
    request: createFixtureRequest({ malformed: true }),
    privacyFacts: PRIVACY_POLICY_FACTS,
    nonce: "fixture",
  });
  assert.equal(report.ok, false);
  assert.equal(exitCodeForReport(report), 1);
  assert.equal(report.checks.some((check) => check.status === "FAIL"), true);
});

test("rejects relative canonical metadata and unsafe legacy response failures", async () => {
  const relativeReport = await runProductionAssurance({
    request: createFixtureRequest({ relativeMetadata: true }),
    privacyFacts: PRIVACY_POLICY_FACTS,
    nonce: "fixture",
  });
  assert.equal(relativeReport.ok, false);
  assert.equal(
    relativeReport.checks.some(
      (check) => check.name === "metadata /privacy" && check.status === "FAIL",
    ),
    true,
  );

  const bodyLimitError = new Error("The response body exceeded the configured size limit.");
  bodyLimitError.code = "BODY_LIMIT";
  const legacyReport = await runProductionAssurance({
    request: createFixtureRequest({ legacyError: bodyLimitError }),
    privacyFacts: PRIVACY_POLICY_FACTS,
    nonce: "fixture",
  });
  assert.equal(legacyReport.ok, false);
  assert.equal(
    legacyReport.checks.some(
      (check) => check.name === "legacy workers.dev" && check.status === "FAIL",
    ),
    true,
  );
});

test("keeps the scheduled production workflow read-only and deployment-free", async () => {
  const workflow = await readFile(
    `${projectRoot}.github/workflows/production-smoke.yml`,
    "utf8",
  );
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /schedule:/);
  assert.doesNotMatch(workflow, /^\s{2}(?:push|pull_request):/m);
  assert.match(workflow, /permissions:\s*\n\s+contents: read/);
  assert.match(workflow, /timeout-minutes: 10/);
  assert.match(workflow, /node-version-file: \.node-version/);
  assert.match(
    workflow,
    /actions\/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0/,
  );
  assert.match(
    workflow,
    /actions\/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e/,
  );
  assert.deepEqual(
    [...workflow.matchAll(/^\s+run:\s*(.+)$/gm)].map((match) => match[1]),
    ["npm run check:production"],
  );
  assert.doesNotMatch(workflow, /secrets\.|wrangler|deploy|npm ci|write/i);
});
