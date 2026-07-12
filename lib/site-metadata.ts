import type { Metadata } from "next";

export const SITE_URL = "https://bannangco.com";

export const SITE_OG_IMAGE = {
  url: "/images/ogimage.png",
  width: 1200,
  height: 630,
  alt: "Bannangco - 주식회사 반낭코",
};

export const LEGAL_NOTICE_TITLE = "전자공고·법적 고지 - 반낭코";
export const LEGAL_NOTICE_DESCRIPTION =
  "주식회사 반낭코의 전자공고 및 법적 고지입니다.";

export function createSocialMetadata(
  title: string,
  description: string,
  url: string,
  type: "website" | "article" = "website",
): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      title,
      description,
      type,
      url,
      images: [SITE_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SITE_OG_IMAGE.url],
    },
  };
}
