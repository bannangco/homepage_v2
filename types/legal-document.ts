export type LegalDocumentKind = "articles-of-incorporation";

export interface LegalDocument {
  id: string;
  kind: LegalDocumentKind;
  displayName: string;
  href: string;
  date?: string;
}
