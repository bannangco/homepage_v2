import type { Metadata } from "next";
import Link from "next/link";

import { getAnnouncements } from "@/lib/announcements";
import {
  formatDateYYYYMMDD,
  isValidISODateOnly,
} from "@/utils/formatDate";

export const metadata: Metadata = {
  title: "전자공고·법적 고지 - 반낭코",
  description: "주식회사 반낭코의 전자공고 및 법적 고지입니다.",
  alternates: {
    canonical: "/announcements",
  },
};

export default function AnnouncementsPage() {
  const announcements = getAnnouncements();

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-24 pt-32 sm:px-6 lg:pt-40">
      <header className="mb-14 border-b border-stone-300 pb-8">
        <p className="mb-3 text-sm font-semibold uppercase text-teal-700">
          Legal Notice
        </p>
        <h1 className="font-nacelle text-4xl font-semibold text-stone-950 md:text-6xl">
          전자공고·법적 고지
        </h1>
      </header>

      {announcements.length === 0 ? (
        <div className="border-y border-stone-300 py-12">
          <p className="text-lg text-stone-600">
            현재 게시된 전자공고가 없습니다.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-stone-300 border-y border-stone-300">
          {announcements.map((announcement) => (
            <Link
              key={announcement.id}
              href={`/announcements/${encodeURIComponent(announcement.id)}`}
              className="group grid gap-4 py-8 transition md:grid-cols-[10rem_1fr_auto]"
            >
              <time
                dateTime={
                  isValidISODateOnly(announcement.createdAt)
                    ? announcement.createdAt
                    : undefined
                }
                className="text-sm text-stone-500"
              >
                {formatDateYYYYMMDD(announcement.createdAt)}
              </time>
              <div>
                <h2 className="font-nacelle text-2xl font-semibold text-stone-950">
                  {announcement.title}
                </h2>
                <p className="mt-2 max-w-2xl text-stone-600">
                  {announcement.summary}
                </p>
              </div>
              <span className="self-center text-sm font-semibold text-teal-700 transition group-hover:translate-x-1">
                내용 확인
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
