import type { Metadata } from "next";
import Link from "next/link";

import { getAnnouncements } from "@/lib/announcements";
import { formatDateYYYYMMDD } from "@/utils/formatDate";

export const metadata: Metadata = {
  title: "공지사항 - 반낭코",
  description: "반낭코의 공식 공지사항입니다.",
};

export default function AnnouncementsPage() {
  const announcements = getAnnouncements();

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-24 pt-32 sm:px-6 lg:pt-40">
      <header className="mb-14 border-b border-stone-300 pb-8">
        <p className="mb-3 text-sm font-semibold uppercase text-teal-700">
          Notice
        </p>
        <h1 className="font-nacelle text-4xl font-semibold text-stone-950 md:text-6xl">
          공지사항
        </h1>
      </header>

      <div className="divide-y divide-stone-300">
        {announcements.map((announcement) => (
          <Link
            key={announcement.id}
            href={`/announcements/${announcement.id}`}
            className="group grid gap-4 py-8 transition md:grid-cols-[10rem_1fr_auto]"
          >
            <time className="text-sm text-stone-500">
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
              자세히 보기
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
