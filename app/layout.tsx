import "./css/style.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

import Footer from "@/components/ui/footer";
import Header from "@/components/ui/header";
import {
  ORGANIZATION_JSON_LD,
  serializeJsonLd,
} from "@/lib/company-profile";
import {
  createSocialMetadata,
  SITE_URL,
} from "@/lib/site-metadata";

const HOME_TITLE = "Bannangco - 주식회사 반낭코";
const HOME_DESCRIPTION =
  "반낭코는 문화 서비스, 커뮤니티, 예약과 발견의 경험을 더 쉽고 풍요롭게 만드는 Korean culture-tech startup입니다.";

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
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  ...createSocialMetadata(HOME_TITLE, HOME_DESCRIPTION, SITE_URL),
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(ORGANIZATION_JSON_LD),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${nacelle.variable} bg-ivory font-inter text-base text-ink antialiased`}
      >
        <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
          <a
            href="#main-content"
            className="fixed left-4 top-4 z-[100] inline-flex min-h-11 -translate-y-24 items-center bg-signal px-4 font-semibold text-ink shadow-lg transition focus-visible:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory motion-reduce:transition-none"
          >
            본문으로 건너뛰기
          </a>
          <Header />
          <main
            id="main-content"
            tabIndex={-1}
            className="relative isolate flex grow flex-col"
          >
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
