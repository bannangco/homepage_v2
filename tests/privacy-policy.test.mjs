import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { COMPANY_PROFILE } from "../lib/company-profile.ts";
import { PRIVACY_POLICY_FACTS } from "../lib/privacy-policy.ts";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));

async function readProjectFile(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8");
}

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(entryPath)));
    } else if (/\.(?:js|mjs|ts|tsx)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

test("keeps approved privacy facts in a privacy-only source of truth", () => {
  assert.deepEqual(PRIVACY_POLICY_FACTS, {
    controller: "주식회사 반낭코",
    representative: "심윤보",
    privacyOfficer: "심윤보",
    contactEmail: "bannangko@gmail.com",
    effectiveDate: "2026-07-19",
    inquiryRetention: {
      maximumYears: 3,
      basis: "internal-maximum",
      unclearCompletionReference: "last-contact",
    },
    website: {
      contactForm: false,
      account: false,
      login: false,
      payment: false,
      newsletter: false,
      userDatabase: false,
      intentionallySetsFirstPartyCookies: false,
    },
    emailService: {
      provider: "Google LLC",
      service: "일반 무료 Gmail",
      accountType: "ordinary-free",
      privacyPolicyUrl: "https://policies.google.com/privacy?hl=ko",
    },
    cloudflare: {
      managedAnalyticsInjection: true,
      rumBeaconUrl:
        "https://developers.cloudflare.com/speed/observatory/rum-beacon/",
      webAnalyticsFaqUrl:
        "https://developers.cloudflare.com/web-analytics/faq/",
      customerDpaUrl:
        "https://www.cloudflare.com/cloudflare-customer-dpa/",
      unsampledRetentionDays: 7,
      longTermAggregatePercentage: 10,
      accessibleHistoryMonths: 6,
    },
  });

  assert.equal(PRIVACY_POLICY_FACTS.controller, COMPANY_PROFILE.legalName);
  assert.equal(PRIVACY_POLICY_FACTS.contactEmail, COMPANY_PROFILE.email);

  const serializedFacts = JSON.stringify(PRIVACY_POLICY_FACTS);
  const unsupportedEnterpriseService = ["Google", "Workspace"].join(" ");

  assert.equal(serializedFacts.includes(unsupportedEnterpriseService), false);
  assert.equal(Object.hasOwn(PRIVACY_POLICY_FACTS, "telephone"), false);
  assert.equal(Object.hasOwn(PRIVACY_POLICY_FACTS, "address"), false);
  assert.equal(Object.hasOwn(PRIVACY_POLICY_FACTS, "registrationNumber"), false);
  assert.doesNotMatch(serializedFacts, /\b01[016789][-. ]?\d{3,4}[-. ]?\d{4}\b/);
  assert.doesNotMatch(serializedFacts, /\b\d{6}[- ]?[1-4]\d{6}\b/);
  assert.doesNotMatch(serializedFacts, /\b\d{3}-\d{2}-\d{5}\b/);
  assert.doesNotMatch(serializedFacts, /\b\d{6}-\d{7}\b/);
});

test("keeps announcement and legal-document catalogs empty", async () => {
  const [announcements, legalDocuments] = await Promise.all([
    readProjectFile("data/announcements.json"),
    readProjectFile("data/legal-documents.json"),
  ]);

  assert.deepEqual(JSON.parse(announcements), []);
  assert.deepEqual(JSON.parse(legalDocuments), []);
});

test("does not propagate the representative into unrelated public surfaces", async () => {
  const unrelatedFiles = await Promise.all(
    [
      "app/layout.tsx",
      "app/(default)/page.tsx",
      "components/ui/header.tsx",
      "components/ui/footer.tsx",
      "lib/company-profile.ts",
      "lib/site-metadata.ts",
    ].map(readProjectFile),
  );

  for (const source of unrelatedFiles) {
    assert.equal(source.includes(PRIVACY_POLICY_FACTS.representative), false);
  }
});

test("keeps collection and analytics integrations out of application source", async () => {
  const sourceFiles = [
    ...(await collectSourceFiles(path.join(projectRoot, "app"))),
    ...(await collectSourceFiles(path.join(projectRoot, "components"))),
  ];
  const applicationSource = (
    await Promise.all(sourceFiles.map((file) => readFile(file, "utf8")))
  ).join("\n");
  const packageJson = JSON.parse(await readProjectFile("package.json"));
  const dependencyNames = [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
  ];

  assert.doesNotMatch(applicationSource, /<form\b/i);
  assert.doesNotMatch(applicationSource, /\bdocument\.cookie\b|\bcookies\s*\(/i);
  assert.doesNotMatch(
    applicationSource,
    /\b(?:localStorage|sessionStorage)\.(?:getItem|setItem|removeItem|clear)\b|\bindexedDB\.open\b/,
  );
  assert.doesNotMatch(
    applicationSource,
    /data-cf-beacon|beacon\.min\.js|<script\b[^>]*cloudflareinsights/i,
  );
  assert.equal(
    dependencyNames.some((name) => /(?:^|[-/@])(?:cookie|consent)(?:[-/]|$)/i.test(name)),
    false,
  );
});

test("documents the privacy operations and non-deployment boundary", async () => {
  const readme = await readProjectFile("README.md");

  for (const requiredText of [
    "lib/privacy-policy.ts",
    "일반 무료 Gmail",
    "내부 최장 보유 한도",
    "적어도 연 1회",
    "보유 한도를 넘긴 기록은 삭제",
    "문의 양식, 계정, 결제, 뉴스레터 또는 새로운 analytics",
    "개인 전화번호, 정관 원문·추출 정보, 세무 신고 상태 또는 재무 정보",
    "production 배포, Cloudflare Dashboard 또는 DNS를 변경하지 않습니다",
  ]) {
    assert.equal(readme.includes(requiredText), true);
  }
});

test("keeps privacy source free of placeholders and generated files untracked", async () => {
  const privacySource = [
    await readProjectFile("app/privacy/page.tsx"),
    await readProjectFile("lib/privacy-policy.ts"),
  ].join("\n");
  const trackedGeneratedFiles = execFileSync(
    "git",
    ["ls-files", "--", ".next", "out", "next-env.d.ts", ".wrangler", "output"],
    { cwd: projectRoot, encoding: "utf8" },
  ).trim();

  const placeholderMarkers = [
    ["TO", "DO"].join(""),
    ["FIX", "ME"].join(""),
    ["template", "placeholder"].join(" "),
  ];

  for (const marker of placeholderMarkers) {
    assert.equal(privacySource.toLowerCase().includes(marker.toLowerCase()), false);
  }
  assert.equal(trackedGeneratedFiles, "");
});
