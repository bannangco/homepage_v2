"use client";

import Link from "next/link";
import Logo from "./logo";

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4 rounded-lg border border-white/15 bg-stone-950/55 px-4 text-white shadow-2xl shadow-stone-950/20 backdrop-blur-md">
          <div className="flex min-w-0 flex-1 items-center">
            <Logo />
          </div>
          <nav>
            <ul className="flex items-center gap-1 text-sm font-semibold">
              <li className="hidden sm:block">
                <Link
                  href="/#mission"
                  className="rounded-lg px-3 py-2 text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  회사
                </Link>
              </li>
              <li className="hidden sm:block">
                <Link
                  href="/#services"
                  className="rounded-lg px-3 py-2 text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  서비스
                </Link>
              </li>
              <li>
                <Link
                  href="/announcements"
                  className="rounded-lg px-3 py-2 text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  공고
                </Link>
              </li>
              <li className="hidden md:block">
                <a
                  href="mailto:bannangko@gmail.com"
                  className="ml-2 inline-flex min-h-9 items-center rounded-lg bg-teal-300 px-4 text-stone-950 transition hover:bg-teal-200"
                >
                  문의
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
