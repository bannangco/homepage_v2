import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import {
  getAnnouncementPath,
  isValidAnnouncementId,
  validateAnnouncements,
} from "../lib/announcement-contract.ts";
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
