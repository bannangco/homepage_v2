"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import AOS from "aos";
import "aos/dist/aos.css";

import Footer from "@/components/ui/footer";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Client Component가 필요한 이유:
  // AOS는 window/document에 의존하고, 페이지 전환 시점의 애니메이션 갱신을 위해
  // useEffect + usePathname 같은 클라이언트 훅이 필요하다.
  const pathname = usePathname();

  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
      duration: 600,
      easing: "ease-out-sine",
    });
  }, []);

  useEffect(() => {
    AOS.refreshHard();
  }, [pathname]);

  return (
    <>
      <main className="relative flex grow flex-col">{children}</main>

      <Footer />
    </>
  );
}
