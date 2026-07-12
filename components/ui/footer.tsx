import Link from "next/link";

import Logo from "./logo";

const footerLinkClassName =
  "inline-flex min-h-11 items-center text-ivory-muted outline-none transition-colors hover:text-signal focus-visible:text-signal focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ink motion-reduce:transition-none";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-ink px-5 py-16 text-ivory sm:px-6 lg:py-20">
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-14 border-b border-border pb-14 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)] lg:gap-20">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
              Contact / 04
            </p>
            <h2 className="mt-5 max-w-4xl font-nacelle text-4xl font-semibold leading-[1.12] tracking-[-0.03em] text-ivory sm:text-5xl lg:text-6xl">
              다음 문화 경험을 함께 이야기해요.
            </h2>
            <a
              href="mailto:bannangko@gmail.com"
              className="mt-8 inline-flex min-h-12 items-center border-b border-signal text-base font-semibold text-ivory outline-none transition-colors hover:text-signal focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-4 focus-visible:ring-offset-ink motion-reduce:transition-none sm:text-lg"
            >
              bannangko@gmail.com
              <span className="ml-3 text-signal" aria-hidden="true">
                ↗
              </span>
            </a>
          </div>

          <nav
            aria-label="푸터 메뉴"
            className="grid grid-cols-2 gap-x-8 gap-y-10 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0"
          >
            <div>
              <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-ivory-muted">
                Navigate
              </h3>
              <ul className="mt-4 text-sm font-semibold">
                <li>
                  <Link className={footerLinkClassName} href="/#company">
                    회사
                  </Link>
                </li>
                <li>
                  <Link className={footerLinkClassName} href="/#services">
                    서비스
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-ivory-muted">
                Channels
              </h3>
              <ul className="mt-4 text-sm font-semibold">
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
            </div>
          </nav>
        </div>

        <div className="grid gap-8 pt-8 text-xs text-ivory-muted sm:grid-cols-[auto_1fr] sm:items-end">
          <Logo />
          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-end sm:border-t-0 sm:pt-0">
            <p>© Bannangco. 주식회사 반낭코</p>
            <span className="hidden text-border sm:inline" aria-hidden="true">
              /
            </span>
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
