import Link from "next/link";
import Image from "next/image";
import logo from "@/public/images/logo.svg";

export default function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex min-w-0 items-center gap-3"
      aria-label="반낭코 홈으로 이동"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">
        <Image src={logo} alt="반낭코 로고" width={24} height={24} />
      </span>
      <span className="truncate font-nacelle text-sm font-semibold text-white sm:text-base">
        Bannangco
      </span>
    </Link>
  );
}
