import Logo from "./logo";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-950 px-5 py-16 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-white/15 pb-12 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase text-teal-200">
              Contact
            </p>
            <h2 className="max-w-3xl font-nacelle text-4xl font-semibold leading-tight md:text-6xl">
              문화와 기술이 만나는 다음 서비스를 함께 이야기해요.
            </h2>
            <a
              href="mailto:bannangko@gmail.com"
              className="mt-8 inline-flex min-h-12 items-center rounded-lg bg-teal-300 px-6 text-sm font-semibold text-stone-950 transition hover:bg-teal-200"
            >
              bannangko@gmail.com
            </a>
          </div>
          <nav className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <h3 className="mb-4 font-semibold text-white">회사</h3>
              <ul className="space-y-3 text-white/65">
                <li>
                  <Link className="transition hover:text-white" href="/#mission">
                    소개
                  </Link>
                </li>
                <li>
                  <Link className="transition hover:text-white" href="/#past-services">
                    서비스 아카이브
                  </Link>
                </li>
                <li>
                  <Link className="transition hover:text-white" href="/announcements">
                    공지사항
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-white">외부 채널</h3>
              <ul className="space-y-3 text-white/65">
                <li>
                  <a
                    className="transition hover:text-white"
                    href="https://github.com/bannangco"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    className="transition hover:text-white"
                    href="https://www.linkedin.com/company/bannangco"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="flex flex-col gap-6 pt-8 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p>© Bannangco. 주식회사 반낭코</p>
        </div>
      </div>
    </footer>
  );
}
