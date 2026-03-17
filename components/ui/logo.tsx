import Link from "next/link";
import Image from "next/image";
import logo from "@/public/images/logo.svg";

export default function Logo() {
  return (
    <Link href="/" className="inline-flex shrink-0" aria-label="반낭코 홈으로 이동">
      <Image src={logo} alt="반낭코 로고" width={32} height={32} />
    </Link>
  );
}
