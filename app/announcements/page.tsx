import type { Metadata } from "next";
import Link from "next/link";

import { getAnnouncementPath } from "@/lib/announcement-contract";
import { getAnnouncements } from "@/lib/announcements";
import {
  createSocialMetadata,
  LEGAL_NOTICE_DESCRIPTION,
  LEGAL_NOTICE_TITLE,
} from "@/lib/site-metadata";
import {
  formatDateYYYYMMDD,
  isValidISODateOnly,
} from "@/utils/formatDate";

export const metadata: Metadata = {
  title: LEGAL_NOTICE_TITLE,
  description: LEGAL_NOTICE_DESCRIPTION,
  alternates: {
    canonical: "/announcements",
  },
  ...createSocialMetadata(
    LEGAL_NOTICE_TITLE,
    LEGAL_NOTICE_DESCRIPTION,
    "/announcements",
  ),
};

export default function AnnouncementsPage() {
  const announcements = getAnnouncements();

  return (
    <div className="relative isolate w-full overflow-hidden bg-ivory px-5 pb-24 pt-36 text-ink sm:px-6 lg:pb-32 lg:pt-44">
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-px bg-grid"
        aria-hidden="true"
      />
      <div className="mx-auto max-w-6xl border-x border-grid bg-ivory px-5 sm:px-8 lg:px-12">
        <header className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-end lg:pb-14">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
              Legal archive / 01
            </p>
            <h1 className="mt-5 max-w-4xl font-nacelle text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-ink sm:text-5xl lg:text-7xl">
              전자공고·법적 고지
            </h1>
          </div>
          <p className="border-t border-border pt-4 text-sm leading-6 text-ink-muted lg:border-t-0 lg:pt-0">
            주식회사 반낭코의 공식 전자공고와 법적 고지를 게시하는
            공간입니다.
          </p>
        </header>

        {announcements.length === 0 ? (
          <div className="grid min-h-64 place-items-center border-b border-border py-16 text-center">
            <div>
              <span
                className="mx-auto mb-6 block h-3 w-3 bg-signal"
                aria-hidden="true"
              />
              <p className="text-lg font-semibold text-ink">
                현재 게시된 전자공고가 없습니다.
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                게시할 공고가 등록되면 이곳에서 확인할 수 있습니다.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border border-b border-border">
            {announcements.map((announcement, index) => (
              <Link
                key={announcement.id}
                href={getAnnouncementPath(announcement.id)}
                className="group grid gap-5 px-2 py-8 outline-none transition-colors hover:bg-surface-light focus-visible:bg-surface-light focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink motion-reduce:transition-none md:grid-cols-[4rem_9rem_minmax(0,1fr)_auto] md:items-start"
              >
                <span className="font-mono text-xs text-ink-muted" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <time
                  dateTime={
                    isValidISODateOnly(announcement.createdAt)
                      ? announcement.createdAt
                      : undefined
                  }
                  className="font-mono text-xs text-ink-muted"
                >
                  {formatDateYYYYMMDD(announcement.createdAt)}
                </time>
                <div>
                  <h2 className="font-nacelle text-2xl font-semibold text-ink">
                    {announcement.title}
                  </h2>
                  <p className="mt-2 max-w-2xl leading-7 text-ink-muted">
                    {announcement.summary}
                  </p>
                </div>
                <span className="self-center text-sm font-semibold text-ink transition-transform motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none">
                  내용 확인 <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between py-5 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-muted">
          <span>Source / Bannangco</span>
          <span>{String(announcements.length).padStart(2, "0")} records</span>
        </div>
      </div>
    </div>
  );
}
