import { isValidPublicPdfPath } from "./public-pdf-contract.mjs";

import type { LegalDocument } from "@/types/legal-document";

export const LEGAL_DOCUMENT_KINDS = ["articles-of-incorporation"] as const;

export const LEGAL_DOCUMENT_ID_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const LEGAL_DOCUMENT_FIELDS = new Set([
  "id",
  "kind",
  "displayName",
  "href",
  "date",
]);
const KOREAN_TEXT_PATTERN = /[가-힣]/;

type DateOnlyValidator = (value: string) => boolean;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isValidLegalDocumentId(value: unknown): value is string {
  return typeof value === "string" && LEGAL_DOCUMENT_ID_PATTERN.test(value);
}

export function validateLegalDocuments(
  value: unknown,
  isValidDateOnly: DateOnlyValidator,
): LegalDocument[] {
  if (!Array.isArray(value)) {
    throw new TypeError("Legal document data must be an array.");
  }

  const ids = new Set<string>();
  const hrefs = new Set<string>();

  value.forEach((item, index) => {
    if (!isRecord(item)) {
      throw new TypeError(`Legal document at index ${index} must be an object.`);
    }

    const unknownFields = Object.keys(item).filter(
      (field) => !LEGAL_DOCUMENT_FIELDS.has(field),
    );
    if (unknownFields.length > 0) {
      throw new TypeError(
        `Legal document at index ${index} has unknown field(s): ${unknownFields.join(", ")}.`,
      );
    }

    if (!isValidLegalDocumentId(item.id)) {
      throw new TypeError(
        `Legal document at index ${index} has invalid id ${JSON.stringify(item.id)}; expected a lowercase ASCII slug matching ${LEGAL_DOCUMENT_ID_PATTERN}.`,
      );
    }

    if (ids.has(item.id)) {
      throw new TypeError(`Duplicate legal document id ${JSON.stringify(item.id)}.`);
    }
    ids.add(item.id);

    if (
      typeof item.kind !== "string" ||
      !LEGAL_DOCUMENT_KINDS.includes(
        item.kind as (typeof LEGAL_DOCUMENT_KINDS)[number],
      )
    ) {
      throw new TypeError(
        `Legal document ${JSON.stringify(item.id)} has unsupported kind ${JSON.stringify(item.kind)}.`,
      );
    }

    if (
      typeof item.displayName !== "string" ||
      item.displayName.trim().length === 0 ||
      !KOREAN_TEXT_PATTERN.test(item.displayName)
    ) {
      throw new TypeError(
        `Legal document ${JSON.stringify(item.id)} must have a non-empty Korean displayName.`,
      );
    }

    if (!isValidPublicPdfPath(item.href)) {
      throw new TypeError(
        `Legal document ${JSON.stringify(item.id)} has invalid href ${JSON.stringify(item.href)}; expected a safe root-relative local PDF path below /legal/.`,
      );
    }

    if (hrefs.has(item.href)) {
      throw new TypeError(
        `Duplicate legal document href ${JSON.stringify(item.href)}.`,
      );
    }
    hrefs.add(item.href);

    if (
      item.date !== undefined &&
      (typeof item.date !== "string" || !isValidDateOnly(item.date))
    ) {
      throw new TypeError(
        `Legal document ${JSON.stringify(item.id)} has invalid date ${JSON.stringify(item.date)}; expected a real ISO YYYY-MM-DD date when provided.`,
      );
    }
  });

  return value as LegalDocument[];
}
