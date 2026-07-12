import Link from "next/link";
import logo from "@/public/images/logo.svg";

import StaticImage from "./static-image";

export default function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex min-h-11 min-w-0 items-center gap-3 text-ivory outline-none transition-colors hover:text-signal focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-4 focus-visible:ring-offset-ink motion-reduce:transition-none"
      aria-label="반낭코 홈으로 이동"
    >
      <StaticImage
        src={logo}
        alt=""
        className="h-10 w-auto shrink-0"
      />
      <span className="font-nacelle text-sm font-semibold tracking-[0.08em] sm:text-base">
        Bannangco
      </span>
    </Link>
  );
}
