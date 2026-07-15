import StaticImage from "@/components/ui/static-image";
import BannangcoLogo from "@/public/images/logo.svg";

export default function HeroHome() {
  return (
    <section
      id="company"
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] overflow-hidden bg-ink text-ivory"
    >
      <div aria-hidden="true" className="signal-grid absolute inset-0 opacity-70" />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-[7.5%] w-px bg-grid/80 sm:left-[12.5%]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-[7.5%] w-px bg-grid/80 sm:right-[12.5%]"
      />
      <div
        aria-hidden="true"
        className="signal-line-motion absolute right-[-10%] top-[30%] h-px w-[58%] bg-signal/80"
      />

      <div className="relative mx-auto flex w-full max-w-[90rem] flex-col justify-between px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-32 lg:px-12 lg:pb-16">
        <div className="hero-enter-1 flex items-start justify-between gap-6 border-t border-grid pt-4">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ivory/60 sm:text-xs">
            BNCO / Cultural Signal System
          </p>
          <div
            aria-hidden="true"
            className="hidden items-start gap-3 text-right font-mono text-xs uppercase tracking-[0.16em] text-ivory/50 lg:flex"
          >
            <span>CULTURE / TECHNOLOGY</span>
            <span>SIGNAL / 01</span>
          </div>
        </div>

        <div className="grid items-end gap-10 py-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-16 lg:py-16">
          <div className="min-w-0">
            <p className="hero-enter-1 mb-5 font-mono text-xs font-semibold tracking-[-0.01em] text-signal sm:mb-7 sm:text-sm">
              {"/* 한층 더 즐거운 세상을 위해 */"}
            </p>
            <h1
              id="hero-title"
              aria-label="코드로 문화를 혁신하다 ; // 반낭코"
              className="hero-enter-2 max-w-6xl break-keep font-nacelle text-[clamp(2.6rem,12vw,8rem)] font-semibold leading-[0.91] tracking-[-0.055em]"
            >
              <span aria-hidden="true" className="block">
                코드로 문화를
              </span>
              <span aria-hidden="true" className="block text-signal">
                혁신하다 ;
              </span>
              <span
                aria-hidden="true"
                className="mt-2 block text-[0.46em] tracking-[-0.035em] text-ivory/60 sm:mt-3"
              >
                {"// 반낭코"}
              </span>
            </h1>
          </div>

          <div className="hero-enter-2 absolute right-5 top-32 sm:right-8 sm:top-36 lg:static lg:flex lg:justify-end">
            <StaticImage
              src={BannangcoLogo}
              alt="반낭코 공식 심볼"
              priority
              className="h-auto w-[3.9rem] sm:w-[5rem] lg:w-[11rem]"
            />
          </div>
        </div>

        <div className="hero-enter-3 grid gap-8 border-t border-grid pt-6 sm:pt-8 lg:grid-cols-[minmax(0,42rem)_1fr] lg:items-end lg:gap-16">
          <p className="max-w-2xl break-keep text-base leading-7 text-ivory/70 sm:text-lg sm:leading-8">
            반낭코는 문화 서비스, 커뮤니티, 예약과 발견의 경험을 더 쉽고
            풍요롭게 만드는 Korean culture-tech startup입니다.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <a
              href="#services"
              className="inline-flex min-h-12 items-center justify-between gap-6 bg-signal px-5 text-sm font-semibold text-ink transition-colors hover:bg-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
            >
              서비스 살펴보기
              <span aria-hidden="true">↘</span>
            </a>
            <a
              href="mailto:bannangko@gmail.com"
              className="inline-flex min-h-12 items-center justify-between gap-6 border border-grid px-5 text-sm font-semibold text-ivory transition-colors hover:border-ivory hover:bg-ivory hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
            >
              회사 문의
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
