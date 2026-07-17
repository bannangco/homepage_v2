import legalDocumentData from "@/data/legal-documents.json";
import { validateLegalDocuments } from "@/lib/legal-document-contract";
import {
  compareISODateOnlyDescending,
  isValidISODateOnly,
} from "@/utils/formatDate";

export const legalDocuments = validateLegalDocuments(
  legalDocumentData,
  isValidISODateOnly,
);

function compareText(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  return a < b ? -1 : 1;
}

export function getLegalDocuments() {
  return [...legalDocuments].sort((a, b) => {
    if (a.date !== undefined && b.date !== undefined) {
      return compareISODateOnlyDescending(a.date, b.date) || compareText(a.id, b.id);
    }

    if (a.date !== undefined) return -1;
    if (b.date !== undefined) return 1;

    return compareText(a.id, b.id);
  });
}
