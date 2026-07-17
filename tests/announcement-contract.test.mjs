import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import {
  getAnnouncementPath,
  isValidAnnouncementId,
  validateAnnouncements,
} from "../lib/announcement-contract.ts";
import {
  ORGANIZATION_JSON_LD,
  serializeJsonLd,
} from "../lib/company-profile.ts";
import {
  isValidLegalDocumentId,
  validateLegalDocuments,
} from "../lib/legal-document-contract.ts";
import { isValidPublicPdfPath } from "../lib/public-pdf-contract.mjs";
import { isValidISODateOnly } from "../utils/formatDate.ts";

const validAnnouncement = {
  id: "articles-of-incorporation-2025",
  title: "Legal notice",
  summary: "Verified legal notice summary",
  createdAt: "2025-02-28",
};

test("accepts a lowercase ASCII announcement slug", () => {
  assert.equal(isValidAnnouncementId(validAnnouncement.id), true);
  assert.equal(
    getAnnouncementPath(validAnnouncement.id),
    "/announcements/articles-of-incorporation-2025",
  );
});

test("rejects spaces, Korean, slashes, and uppercase announcement IDs", () => {
  for (const id of ["has space", "한글", "nested/path", "Uppercase"]) {
    assert.equal(isValidAnnouncementId(id), false, id);
    assert.throws(() => getAnnouncementPath(id), /Invalid announcement id/);
  }
});

test("rejects duplicate announcement IDs", () => {
  assert.throws(
    () =>
      validateAnnouncements(
        [validAnnouncement, { ...validAnnouncement }],
        isValidISODateOnly,
      ),
    /Duplicate announcement id/,
  );
});

test("rejects invalid announcement dates", () => {
  assert.throws(
    () =>
      validateAnnouncements(
        [{ ...validAnnouncement, createdAt: "2025-02-30" }],
        isValidISODateOnly,
      ),
    /invalid createdAt/,
  );
});

test("rejects empty announcement titles and summaries", () => {
  assert.throws(
    () =>
      validateAnnouncements(
        [{ ...validAnnouncement, title: "  " }],
        isValidISODateOnly,
      ),
    /empty title/,
  );
  assert.throws(
    () =>
      validateAnnouncements(
        [{ ...validAnnouncement, summary: "" }],
        isValidISODateOnly,
      ),
    /empty summary/,
  );
});

test("authoritative announcement data satisfies the shared contract", async () => {
  const data = JSON.parse(
    await readFile(new URL("../data/announcements.json", import.meta.url), "utf8"),
  );

  assert.doesNotThrow(() =>
    validateAnnouncements(data, isValidISODateOnly),
  );
});

const validPdfPath = "/legal/board-notice-2025.pdf";
const unsafePdfPaths = [
  "/legal/../secret.pdf",
  "/legal/%2e%2e/secret.pdf",
  "/legal/nested%2fsecret.pdf",
  "\\legal\\notice.pdf",
  "/legal/notice.pdf?download=1",
  "/legal/notice.pdf#page=1",
  "https://example.com/notice.pdf",
  "//example.com/notice.pdf",
  "legal/notice.pdf",
  "/legal//notice.pdf",
  "/legal/NOTICE.PDF",
  "/legal/notice.txt",
  "/documents/notice.pdf",
];

test("accepts only safe root-relative public PDF paths", () => {
  assert.equal(isValidPublicPdfPath(validPdfPath), true);

  for (const href of unsafePdfPaths) {
    assert.equal(isValidPublicPdfPath(href), false, href);
  }
});

test("announcement documents reuse the public PDF path contract", () => {
  assert.doesNotThrow(() =>
    validateAnnouncements(
      [
        {
          ...validAnnouncement,
          document: {
            href: validPdfPath,
            label: "전자공고문",
          },
        },
      ],
      isValidISODateOnly,
    ),
  );

  for (const href of unsafePdfPaths) {
    assert.throws(
      () =>
        validateAnnouncements(
          [
            {
              ...validAnnouncement,
              document: {
                href,
                label: "전자공고문",
              },
            },
          ],
          isValidISODateOnly,
        ),
      /invalid document reference/,
      href,
    );
  }

  assert.throws(
    () =>
      validateAnnouncements(
        [
          {
            ...validAnnouncement,
            document: {
              href: validPdfPath,
              label: "Notice PDF",
            },
          },
        ],
        isValidISODateOnly,
      ),
    /invalid document reference/,
  );
});

const validLegalDocument = {
  id: "articles-of-incorporation",
  kind: "articles-of-incorporation",
  displayName: "정관",
  href: "/legal/articles-of-incorporation.pdf",
};

test("accepts an approved legal-document shape with an optional date", () => {
  assert.equal(isValidLegalDocumentId(validLegalDocument.id), true);
  assert.doesNotThrow(() =>
    validateLegalDocuments(
      [validLegalDocument, { ...validLegalDocument, id: "revised-articles-2024", href: "/legal/revised-articles-2024.pdf", date: "2024-02-29" }],
      isValidISODateOnly,
    ),
  );
});

test("rejects unsafe legal-document IDs", () => {
  for (const id of ["has space", "정관", "nested/path", "Uppercase"]) {
    assert.equal(isValidLegalDocumentId(id), false, id);
    assert.throws(
      () =>
        validateLegalDocuments(
          [{ ...validLegalDocument, id }],
          isValidISODateOnly,
        ),
      /invalid id/,
      id,
    );
  }
});

test("rejects duplicate legal-document IDs and PDF paths", () => {
  assert.throws(
    () =>
      validateLegalDocuments(
        [validLegalDocument, { ...validLegalDocument }],
        isValidISODateOnly,
      ),
    /Duplicate legal document id/,
  );
  assert.throws(
    () =>
      validateLegalDocuments(
        [
          validLegalDocument,
          { ...validLegalDocument, id: "duplicate-path" },
        ],
        isValidISODateOnly,
      ),
    /Duplicate legal document href/,
  );
});

test("rejects unsupported legal-document kinds and invalid display names", () => {
  assert.throws(
    () =>
      validateLegalDocuments(
        [{ ...validLegalDocument, kind: "press-release" }],
        isValidISODateOnly,
      ),
    /unsupported kind/,
  );

  for (const displayName of ["", "   ", "Articles"] ) {
    assert.throws(
      () =>
        validateLegalDocuments(
          [{ ...validLegalDocument, displayName }],
          isValidISODateOnly,
        ),
      /non-empty Korean displayName/,
      displayName,
    );
  }
});

test("rejects unsafe legal-document paths", () => {
  for (const href of unsafePdfPaths) {
    assert.throws(
      () =>
        validateLegalDocuments(
          [{ ...validLegalDocument, href }],
          isValidISODateOnly,
        ),
      /invalid href/,
      href,
    );
  }
});

test("rejects invalid optional legal-document dates and unknown fields", () => {
  assert.throws(
    () =>
      validateLegalDocuments(
        [{ ...validLegalDocument, date: "2025-02-30" }],
        isValidISODateOnly,
      ),
    /invalid date/,
  );
  assert.throws(
    () =>
      validateLegalDocuments(
        [{ ...validLegalDocument, publishedAt: "test-value" }],
        isValidISODateOnly,
      ),
    /unknown field/,
  );
});

test("authoritative legal-document data supports an empty catalog", async () => {
  const data = JSON.parse(
    await readFile(
      new URL("../data/legal-documents.json", import.meta.url),
      "utf8",
    ),
  );

  assert.deepEqual(data, []);
  assert.doesNotThrow(() =>
    validateLegalDocuments(data, isValidISODateOnly),
  );
});

test("Organization JSON-LD contains only confirmed company fields", () => {
  assert.deepEqual(Object.keys(ORGANIZATION_JSON_LD).sort(), [
    "@context",
    "@type",
    "alternateName",
    "email",
    "foundingDate",
    "logo",
    "name",
    "sameAs",
    "url",
  ]);
  assert.deepEqual(ORGANIZATION_JSON_LD, {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "주식회사 반낭코",
    alternateName: "Bannangco",
    url: "https://bannangco.com",
    logo: "https://bannangco.com/images/logo.svg",
    foundingDate: "2025-04-04",
    email: "bannangko@gmail.com",
    sameAs: [
      "https://github.com/bannangco",
      "https://kr.linkedin.com/company/bannangco",
    ],
  });
});

test("JSON-LD serialization prevents script-context breakout", () => {
  const value = {
    unsafe: "</script><script>alert('x')</script>&\u2028\u2029",
  };
  const serialized = serializeJsonLd(value);

  assert.equal(serialized.includes("<"), false);
  assert.deepEqual(JSON.parse(serialized), value);
});
