import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

import {
  compareISODateOnlyDescending,
  formatDateYYYYMMDD,
  isValidISODateOnly,
} from "../utils/formatDate.ts";

const FALLBACK = "날짜 미정";

test("formats a valid ISO date-only value", () => {
  assert.equal(formatDateYYYYMMDD("2025-07-12"), "2025.07.12");
});

test("accepts a real leap day", () => {
  assert.equal(isValidISODateOnly("2024-02-29"), true);
  assert.equal(formatDateYYYYMMDD("2024-02-29"), "2024.02.29");
});

test("uses the safe fallback for malformed input", () => {
  assert.equal(isValidISODateOnly("2025-2-03"), false);
  assert.equal(formatDateYYYYMMDD("not-a-date"), FALLBACK);
});

test("rejects impossible calendar dates instead of normalizing them", () => {
  assert.equal(isValidISODateOnly("2023-02-29"), false);
  assert.equal(isValidISODateOnly("2025-04-31"), false);
  assert.equal(formatDateYYYYMMDD("2025-04-31"), FALLBACK);
});

test("orders valid date-only values newest first with invalid values last", () => {
  const values = ["invalid", "2025-01-01", "2025-02-01"];

  assert.deepEqual(values.sort(compareISODateOnlyDescending), [
    "2025-02-01",
    "2025-01-01",
    "invalid",
  ]);
});

function formatInTimezone(timezone) {
  const moduleUrl = new URL("../utils/formatDate.ts", import.meta.url).href;
  const source = `
    import { formatDateYYYYMMDD } from ${JSON.stringify(moduleUrl)};
    process.stdout.write(JSON.stringify({
      formatted: formatDateYYYYMMDD("2024-02-29"),
      localHour: new Date("2024-02-29T00:00:00Z").getHours(),
    }));
  `;
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", source],
    {
      encoding: "utf8",
      env: { ...process.env, TZ: timezone },
    },
  );

  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("produces identical output in UTC and KST environments", () => {
  const utc = formatInTimezone("UTC");
  const kst = formatInTimezone("Asia/Seoul");

  assert.equal(utc.localHour, 0);
  assert.equal(kst.localHour, 9);
  assert.equal(utc.formatted, "2024.02.29");
  assert.equal(kst.formatted, utc.formatted);
});
