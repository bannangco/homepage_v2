import Link from "next/link";

import Logo from "./logo";

const footerLinkClassName =
  "inline-flex min-h-11 items-center text-ivory-muted outline-none transition-colors hover:text-signal focus-visible:text-signal focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ink motion-reduce:transition-none";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-ink px-5 py-10 text-ivory sm:px-8 sm:py-12 lg:px-12">
      <div className="mx-auto max-w-[80rem]">
        <div className="grid gap-8 border-b border-border pb-8 md:grid-cols-[auto_1fr] md:items-center">
          <Logo />

          <nav aria-label="푸터 메뉴" className="md:justify-self-end">
            <ul className="flex flex-col gap-x-7 text-sm font-semibold sm:flex-row sm:flex-wrap sm:items-center">
              <li>
                <a
                  className={footerLinkClassName}
                  href="mailto:bannangko@gmail.com"
                >
                  bannangko@gmail.com
                </a>
              </li>
              <li>
                <a
                  className={footerLinkClassName}
                  href="https://github.com/bannangco"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                  <span className="ml-2" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
              <li>
                <a
                  className={footerLinkClassName}
                  href="https://kr.linkedin.com/company/bannangco"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                  <span className="ml-2" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-ivory-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© Bannangco. 주식회사 반낭코</p>
          <div className="flex flex-wrap gap-x-5">
            <Link
              href="/privacy"
              className="inline-flex min-h-11 w-fit items-center text-ivory-muted outline-none transition-colors hover:text-ivory focus-visible:text-ivory focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ink motion-reduce:transition-none"
            >
              개인정보처리방침
            </Link>
            <Link
              href="/announcements"
              className="inline-flex min-h-11 w-fit items-center text-ivory-muted outline-none transition-colors hover:text-ivory focus-visible:text-ivory focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ink motion-reduce:transition-none"
            >
              전자공고·법적 고지
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
