import "./css/style.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

import Header from "@/components/ui/header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const nacelle = localFont({
  src: [
    {
      path: "../public/fonts/nacelle-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/nacelle-italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/nacelle-semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/nacelle-semibolditalic.woff2",
      weight: "600",
      style: "italic",
    },
  ],
  variable: "--font-nacelle",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bannangco - 주식회사 반낭코",
  description:
    "반낭코는 문화 서비스, 커뮤니티, 예약과 발견의 경험을 온라인 기술로 더 즐겁게 만드는 Korean culture-tech startup입니다.",
  metadataBase: new URL("https://bannangco.com"),
  openGraph: {
    title: "Bannangco - 주식회사 반낭코",
    description:
      "반낭코는 문화 서비스, 커뮤니티, 예약과 발견의 경험을 온라인 기술로 더 즐겁게 만드는 Korean culture-tech startup입니다.",
    type: "website",
    url: "https://bannangco.com",
    images: [
      {
        url: "/images/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Bannangco - 주식회사 반낭코",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bannangco - 주식회사 반낭코",
    description:
      "반낭코는 문화 서비스, 커뮤니티, 예약과 발견의 경험을 온라인 기술로 더 즐겁게 만드는 Korean culture-tech startup입니다.",
    images: ["/images/ogimage.png"],
  },
  other: {
    "naver-site-verification": "a75309cf6a38af2e26f52da0166fdf92baf2e951",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body
        className={`${inter.variable} ${nacelle.variable} bg-stone-100 font-inter text-base text-stone-900 antialiased`}
      >
        <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
