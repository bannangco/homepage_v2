"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import Logo from "./logo";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4 rounded-lg border border-white/15 bg-stone-950/55 px-4 text-white shadow-2xl shadow-stone-950/20 backdrop-blur-md">
          <div className="flex min-w-0 flex-1 items-center">
            <Logo />
          </div>
          <nav aria-label="주요 메뉴" className="hidden sm:block">
            <ul className="flex items-center gap-1 text-sm font-semibold">
              <li>
                <Link
                  href="/#mission"
                  className="inline-flex min-h-11 items-center rounded-lg px-3 text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  회사
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="inline-flex min-h-11 items-center rounded-lg px-3 text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  서비스
                </Link>
              </li>
              <li>
                <a
                  href="mailto:bannangko@gmail.com"
                  className="ml-2 inline-flex min-h-11 items-center rounded-lg bg-teal-300 px-4 text-stone-950 transition hover:bg-teal-200"
                >
                  문의
                </a>
              </li>
            </ul>
          </nav>

          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:hidden"
            aria-label={isMenuOpen ? "주요 메뉴 닫기" : "주요 메뉴 열기"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {isMenuOpen ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>

        <nav
          id="mobile-navigation"
          aria-label="모바일 주요 메뉴"
          hidden={!isMenuOpen}
          className="mt-2 rounded-lg border border-white/15 bg-stone-950/95 p-2 text-sm font-semibold text-white shadow-2xl shadow-stone-950/20 backdrop-blur-md sm:hidden"
        >
          <ul className="space-y-1">
            <li>
              <Link
                href="/#mission"
                className="flex min-h-11 items-center rounded-lg px-4 text-white/75 transition hover:bg-white/10 hover:text-white"
                onClick={closeMenu}
              >
                회사
              </Link>
            </li>
            <li>
              <Link
                href="/#services"
                className="flex min-h-11 items-center rounded-lg px-4 text-white/75 transition hover:bg-white/10 hover:text-white"
                onClick={closeMenu}
              >
                서비스
              </Link>
            </li>
            <li>
              <a
                href="mailto:bannangko@gmail.com"
                className="flex min-h-11 items-center rounded-lg bg-teal-300 px-4 text-stone-950 transition hover:bg-teal-200"
                onClick={closeMenu}
              >
                문의
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
