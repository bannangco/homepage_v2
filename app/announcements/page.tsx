import type { Metadata } from "next";
import Link from "next/link";

import { COMPANY_PROFILE } from "@/lib/company-profile";
import { getAnnouncementPath } from "@/lib/announcement-contract";
import { getAnnouncements } from "@/lib/announcements";
import { getLegalDocuments } from "@/lib/legal-documents";
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
  const legalDocuments = getLegalDocuments();

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
              Legal information / 01
            </p>
            <h1
              aria-label="전자공고·법적 고지"
              className="mt-5 max-w-4xl break-keep font-nacelle text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-ink [overflow-wrap:normal] sm:text-5xl lg:text-7xl"
            >
              <span aria-hidden="true">
                {"전자공고·"}
                <br className="sm:hidden" />
                {"법적 고지"}
              </span>
            </h1>
          </div>
          <p className="break-keep border-t border-border pt-4 text-sm leading-6 text-ink-muted [overflow-wrap:normal] lg:border-t-0 lg:pt-0">
            주식회사 반낭코의 회사 정보와 전자공고, 공개된 법적 문서를
            확인하는 공간입니다.
          </p>
        </header>

        <section
          id="company-information"
          aria-labelledby="company-information-title"
          className="grid gap-8 border-b border-border py-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:py-14"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-muted">
              Company / 01
            </p>
            <h2
              id="company-information-title"
              className="mt-3 break-keep font-nacelle text-3xl font-semibold tracking-[-0.025em] [overflow-wrap:normal]"
            >
              회사 정보
            </h2>
          </div>
          <dl className="grid border-t border-border sm:grid-cols-2">
            <div className="border-b border-border py-5 sm:pr-6">
              <dt className="text-xs font-semibold text-ink-muted">회사명</dt>
              <dd className="mt-2 break-keep text-lg font-semibold [overflow-wrap:normal]">
                {COMPANY_PROFILE.legalName}
              </dd>
            </div>
            <div className="border-b border-border py-5 sm:border-l sm:pl-6">
              <dt className="text-xs font-semibold text-ink-muted">설립일</dt>
              <dd className="mt-2 text-lg font-semibold">
                <time dateTime={COMPANY_PROFILE.foundingDate}>
                  {formatDateYYYYMMDD(COMPANY_PROFILE.foundingDate)}
                </time>
              </dd>
            </div>
            <div className="border-b border-border py-5 sm:pr-6">
              <dt className="text-xs font-semibold text-ink-muted">공고 방법</dt>
              <dd className="mt-2 break-keep text-lg font-semibold [overflow-wrap:normal]">
                {COMPANY_PROFILE.noticeMethod}
              </dd>
            </div>
            <div className="border-b border-border py-5 sm:border-l sm:pl-6">
              <dt className="text-xs font-semibold text-ink-muted">이메일</dt>
              <dd className="mt-2">
                <a
                  href={`mailto:${COMPANY_PROFILE.email}`}
                  className="inline-flex min-h-11 items-center break-all border-b border-ink text-lg font-semibold outline-none transition-colors hover:border-signal hover:text-ink-muted focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 focus-visible:ring-offset-ivory motion-reduce:transition-none"
                >
                  {COMPANY_PROFILE.email}
                </a>
              </dd>
            </div>
          </dl>
        </section>

        <section
          id="electronic-announcements"
          aria-labelledby="electronic-announcements-title"
          className="border-b border-border py-10 lg:py-14"
        >
          <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-muted">
                Notices / 02
              </p>
              <h2
                id="electronic-announcements-title"
                className="mt-3 break-keep font-nacelle text-3xl font-semibold tracking-[-0.025em] [overflow-wrap:normal]"
              >
                전자공고
              </h2>
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-muted">
              {String(announcements.length).padStart(2, "0")} records
            </p>
          </div>

          {announcements.length === 0 ? (
            <div className="grid min-h-56 place-items-center py-14 text-center">
              <div>
                <span
                  className="mx-auto mb-6 block h-3 w-3 bg-signal"
                  aria-hidden="true"
                />
                <p className="break-keep text-lg font-semibold text-ink [overflow-wrap:normal]">
                  현재 게시된 전자공고가 없습니다.
                </p>
                <p className="mt-2 break-keep text-sm text-ink-muted [overflow-wrap:normal]">
                  게시된 공고가 등록되면 이곳에서 확인할 수 있습니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {announcements.map((announcement, index) => (
                <Link
                  key={announcement.id}
                  data-announcement-id={announcement.id}
                  href={getAnnouncementPath(announcement.id)}
                  className="group grid gap-5 px-2 py-8 outline-none transition-colors hover:bg-surface-light focus-visible:bg-surface-light focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink motion-reduce:transition-none md:grid-cols-[4rem_9rem_minmax(0,1fr)_auto] md:items-start"
                >
                  <span
                    className="font-mono text-xs text-ink-muted"
                    aria-hidden="true"
                  >
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
                    <h3 className="font-nacelle text-2xl font-semibold text-ink">
                      {announcement.title}
                    </h3>
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
        </section>

        <section
          id="legal-documents"
          aria-labelledby="legal-documents-title"
          className="py-10 lg:py-14"
        >
          <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-muted">
                Documents / 03
              </p>
              <h2
                id="legal-documents-title"
                className="mt-3 break-keep font-nacelle text-3xl font-semibold tracking-[-0.025em] [overflow-wrap:normal]"
              >
                법적 문서
              </h2>
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-muted">
              {String(legalDocuments.length).padStart(2, "0")} documents
            </p>
          </div>

          {legalDocuments.length === 0 ? (
            <div className="grid min-h-48 place-items-center py-12 text-center">
              <p className="break-keep text-lg font-semibold text-ink [overflow-wrap:normal]">
                현재 공개된 법적 문서가 없습니다.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {legalDocuments.map((document) => (
                <li
                  key={document.id}
                  data-legal-document-id={document.id}
                  data-document-kind={document.kind}
                >
                  <a
                    href={document.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group grid min-h-20 gap-4 px-2 py-6 outline-none transition-colors hover:bg-surface-light focus-visible:bg-surface-light focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink motion-reduce:transition-none sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <span>
                      <span className="block font-nacelle text-xl font-semibold text-ink">
                        {document.displayName}
                      </span>
                      {document.date ? (
                        <time
                          dateTime={document.date}
                          className="mt-2 block font-mono text-xs text-ink-muted"
                        >
                          {formatDateYYYYMMDD(document.date)}
                        </time>
                      ) : null}
                    </span>
                    <span className="text-sm font-semibold text-ink">
                      PDF, 새 창 <span aria-hidden="true">↗</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex items-center justify-between border-t border-border py-5 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-muted">
          <span>Source / Bannangco</span>
          <span>Static legal archive</span>
        </div>
      </div>
    </div>
  );
}
