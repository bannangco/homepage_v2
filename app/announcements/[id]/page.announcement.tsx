import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAnnouncementPath } from "@/lib/announcement-contract";
import { announcements, getAnnouncementById } from "@/lib/announcements";
import {
  createSocialMetadata,
  LEGAL_NOTICE_DESCRIPTION,
  LEGAL_NOTICE_TITLE,
} from "@/lib/site-metadata";
import {
  formatDateYYYYMMDD,
  isValidISODateOnly,
} from "@/utils/formatDate";

interface AnnouncementDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamicParams = false;

export async function generateMetadata({ params }: AnnouncementDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const announcement = getAnnouncementById(id);

  if (!announcement) {
    return {
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
  }

  const title = `${announcement.title} - 전자공고·법적 고지 - 반낭코`;
  const description = announcement.summary;
  const announcementPath = getAnnouncementPath(announcement.id);

  return {
    title,
    description,
    alternates: {
      canonical: announcementPath,
    },
    ...createSocialMetadata(
      title,
      description,
      announcementPath,
      "article",
    ),
  };
}

export function generateStaticParams() {
  return announcements.map((announcement) => ({
    id: announcement.id,
  }));
}

export default async function AnnouncementDetailPage({ params }: AnnouncementDetailPageProps) {
  const { id } = await params;
  const announcement = getAnnouncementById(id);

  if (!announcement) {
    notFound();
  }

  return (
    <div className="relative isolate w-full overflow-hidden bg-ivory px-5 pb-24 pt-36 text-ink sm:px-6 lg:pb-32 lg:pt-44">
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-px bg-grid"
        aria-hidden="true"
      />
      <article className="mx-auto max-w-4xl border-x border-grid bg-ivory px-5 sm:px-8 lg:px-12">
        <header className="border-b border-border pb-10 lg:pb-14">
          <Link
            href="/announcements"
            className="mb-10 inline-flex min-h-11 items-center border-b border-border font-mono text-xs uppercase tracking-[0.16em] text-ink-muted outline-none transition-colors hover:border-ink hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 focus-visible:ring-offset-ivory motion-reduce:transition-none"
          >
            <span className="mr-3" aria-hidden="true">
              ←
            </span>
            Legal archive
          </Link>
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
            전자공고·법적 고지
          </p>
          <h1 className="max-w-3xl font-nacelle text-4xl font-semibold leading-[1.1] tracking-[-0.035em] text-ink sm:text-5xl lg:text-6xl">
            {announcement.title}
          </h1>
          <time
            dateTime={
              isValidISODateOnly(announcement.createdAt)
                ? announcement.createdAt
                : undefined
            }
            className="mt-7 block border-l-4 border-signal pl-4 font-mono text-sm text-ink-muted"
          >
            {formatDateYYYYMMDD(announcement.createdAt)}
          </time>
        </header>

        {announcement.content ? (
          <div className="whitespace-pre-wrap border-b border-border py-12 text-lg leading-9 text-ink-muted">
            {announcement.content}
          </div>
        ) : null}

        {announcement.document ? (
          <a
            href={announcement.document.href}
            className="my-10 inline-flex min-h-12 items-center border border-ink bg-ink px-5 text-sm font-semibold text-ivory outline-none transition-colors hover:bg-signal hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 focus-visible:ring-offset-ivory motion-reduce:transition-none"
            target="_blank"
            rel="noopener noreferrer"
          >
            {announcement.document.label}
            <span className="ml-2">(PDF, 새 창)</span>
            <span className="ml-3" aria-hidden="true">
              ↗
            </span>
          </a>
        ) : null}

        <div className="flex items-center justify-between border-t border-border py-5 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-muted">
          <span>Official notice</span>
          <span>Bannangco</span>
        </div>
      </article>
    </div>
  );
}
