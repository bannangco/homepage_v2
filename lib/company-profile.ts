export const COMPANY_PROFILE = {
  legalName: "주식회사 반낭코",
  brandName: "Bannangco",
  foundingDate: "2025-04-04",
  noticeMethod: "회사 웹사이트",
  email: "bannangko@gmail.com",
  siteUrl: "https://bannangco.com",
  logoUrl: "https://bannangco.com/images/logo.svg",
  sameAs: [
    "https://github.com/bannangco",
    "https://kr.linkedin.com/company/bannangco",
  ],
} as const;

export const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: COMPANY_PROFILE.legalName,
  alternateName: COMPANY_PROFILE.brandName,
  url: COMPANY_PROFILE.siteUrl,
  logo: COMPANY_PROFILE.logoUrl,
  foundingDate: COMPANY_PROFILE.foundingDate,
  email: COMPANY_PROFILE.email,
  sameAs: COMPANY_PROFILE.sameAs,
} as const;

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}
