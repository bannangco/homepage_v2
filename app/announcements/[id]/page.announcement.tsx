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
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-32 sm:px-6 lg:pt-40">
      <article>
        <header className="mb-10 border-b border-stone-300 pb-8">
          <Link
            href="/announcements"
            className="mb-8 inline-flex text-sm font-semibold text-teal-700 transition hover:text-teal-900"
          >
            전자공고·법적 고지 목록으로 돌아가기
          </Link>
          <h1 className="mb-4 font-nacelle text-4xl font-semibold text-stone-950 md:text-6xl">
            {announcement.title}
          </h1>
          <time
            dateTime={
              isValidISODateOnly(announcement.createdAt)
                ? announcement.createdAt
                : undefined
            }
            className="text-stone-500"
          >
            {formatDateYYYYMMDD(announcement.createdAt)}
          </time>
        </header>

        {announcement.content ? (
          <div className="whitespace-pre-wrap text-lg leading-8 text-stone-700">
            {announcement.content}
          </div>
        ) : null}

        {announcement.document ? (
          <a
            href={announcement.document.href}
            className="mt-10 inline-flex min-h-11 items-center rounded-lg border border-stone-300 px-5 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
            target="_blank"
            rel="noopener noreferrer"
          >
            {announcement.document.label}
          </a>
        ) : null}
      </article>
    </div>
  );
}
