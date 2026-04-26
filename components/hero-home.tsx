import Image from "next/image";
import HeroImage from "@/public/images/hero-image-01.jpg";

export default function HeroHome() {
  return (
    <section className="relative min-h-[92svh] overflow-hidden bg-stone-950 text-white">
      <Image
        src={HeroImage}
        alt="디지털 기술로 연결되는 문화 경험"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-60 grayscale"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,8,0.92)_0%,rgba(10,10,8,0.72)_38%,rgba(10,10,8,0.24)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-stone-950 to-transparent" />

      <div className="relative mx-auto flex min-h-[92svh] max-w-7xl flex-col justify-end px-5 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="max-w-4xl animate-[heroRise_900ms_ease-out_both]">
          <p className="mb-5 text-sm font-semibold uppercase text-teal-200">
            Bannangco / 주식회사 반낭코
          </p>
          <h1 className="max-w-[21rem] font-nacelle text-4xl font-semibold leading-tight sm:max-w-3xl sm:text-5xl md:text-7xl lg:max-w-4xl lg:text-8xl">
            <span className="block sm:inline">문화를 더 즐겁게</span>{" "}
            <span className="block sm:inline">만드는 온라인</span>{" "}
            <span className="block sm:inline">기술 회사</span>
          </h1>
          <p className="mt-7 max-w-[21rem] text-base leading-7 text-stone-200 sm:max-w-2xl md:text-xl md:leading-8">
            반낭코는 문화 서비스, 커뮤니티, 예약과 발견의 경험을 더 쉽고
            풍요롭게 만드는 Korean culture-tech startup입니다.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#services"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-teal-300 px-6 text-sm font-semibold text-stone-950 transition hover:bg-teal-200"
            >
              서비스 살펴보기
            </a>
            <a
              href="mailto:bannangko@gmail.com"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/40 px-6 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              회사 문의
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
