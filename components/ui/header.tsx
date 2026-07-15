"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import Logo from "./logo";

const navigationItems = [
  { href: "/#about", label: "회사" },
  { href: "/#services", label: "서비스" },
  { href: "/#archive", label: "아카이브" },
] as const;

const navigationLinkClassName =
  "inline-flex min-h-11 items-center border-b border-transparent px-3 text-sm font-semibold text-ivory-muted outline-none transition-colors hover:border-signal hover:text-ivory focus-visible:border-signal focus-visible:text-ivory focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ink motion-reduce:transition-none";

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
    <header
      id="site-header"
      className="fixed inset-x-0 top-0 z-50 w-full border-b border-border bg-ink text-ivory"
    >
      <div className="mx-auto max-w-[80rem] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.5rem] items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center">
            <Logo priority />
          </div>

          <nav aria-label="주요 메뉴" className="hidden sm:block">
            <ul className="flex items-center gap-2">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={navigationLinkClassName}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="mailto:bannangko@gmail.com"
                  className="ml-2 inline-flex min-h-11 items-center border border-signal bg-signal px-4 text-sm font-semibold text-ink outline-none transition-colors hover:bg-ivory focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ink motion-reduce:transition-none"
                >
                  문의
                </a>
              </li>
            </ul>
          </nav>

          <button
            id="mobile-menu-button"
            ref={menuButtonRef}
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-border text-ivory outline-none transition-colors hover:border-signal hover:text-signal focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ink motion-reduce:transition-none sm:hidden"
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
              strokeWidth="1.5"
              strokeLinecap="square"
              aria-hidden="true"
            >
              {isMenuOpen ? (
                <>
                  <path d="M5 5l14 14" />
                  <path d="M19 5L5 19" />
                </>
              ) : (
                <>
                  <path d="M3 6h18" />
                  <path d="M3 12h18" />
                  <path d="M3 18h18" />
                </>
              )}
            </svg>
          </button>
        </div>

        <nav
          id="mobile-navigation"
          aria-label="모바일 주요 메뉴"
          hidden={!isMenuOpen}
          className="border-t border-border bg-ink pb-4 pt-2 text-ivory sm:hidden"
        >
          <ul className="divide-y divide-border border-b border-border">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center justify-between px-2 py-2 text-base font-semibold text-ivory-muted outline-none transition-colors hover:bg-surface-dark hover:text-ivory focus-visible:bg-surface-dark focus-visible:text-signal focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-signal motion-reduce:transition-none"
                  onClick={closeMenu}
                >
                  {item.label}
                  <span aria-hidden="true">↘</span>
                </Link>
              </li>
            ))}
            <li>
              <a
                href="mailto:bannangko@gmail.com"
                className="flex min-h-11 items-center justify-between bg-signal px-2 py-2 text-base font-semibold text-ink outline-none transition-colors hover:bg-ivory focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink motion-reduce:transition-none"
                onClick={closeMenu}
              >
                문의
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          </ul>
        </nav>

        <noscript>
          <style>{`
            @media (max-width: 639px) {
              #site-header { position: relative !important; }
              #mobile-menu-button { display: none !important; }
            }
          `}</style>
          <nav
            aria-label="모바일 주요 메뉴"
            className="border-t border-border bg-ink pb-4 pt-2 text-ivory sm:hidden"
          >
            <ul className="divide-y divide-border border-b border-border">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="flex min-h-11 items-center justify-between px-2 py-2 text-base font-semibold text-ivory-muted"
                  >
                    {item.label}
                    <span aria-hidden="true">↘</span>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="mailto:bannangko@gmail.com"
                  className="flex min-h-11 items-center justify-between bg-signal px-2 py-2 text-base font-semibold text-ink"
                >
                  문의
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            </ul>
          </nav>
        </noscript>
      </div>
      <span
        aria-hidden="true"
        className="header-scroll-progress pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-signal motion-reduce:hidden"
      />
    </header>
  );
}
