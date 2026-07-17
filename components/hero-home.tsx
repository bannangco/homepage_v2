import CulturalSignalField from "@/components/cultural-signal-field";

export default function HeroHome() {
  return (
    <section
      id="company"
      aria-labelledby="hero-title"
      data-hero-pointer-zone
      className="relative overflow-hidden bg-ink text-ivory"
    >
      <div className="hero-home-layout relative mx-auto grid min-h-[36rem] w-full max-w-[80rem] items-center gap-8 px-5 pb-10 pt-28 sm:min-h-[40rem] sm:px-8 sm:pb-10 sm:pt-24 lg:min-h-[45rem] lg:grid-cols-[minmax(0,1.06fr)_minmax(22rem,0.94fr)] lg:gap-16 lg:px-12 lg:py-28">
        <div className="relative z-10 min-w-0">
          <p className="hero-enter-1 mb-5 font-mono text-xs font-semibold tracking-[-0.01em] text-signal sm:mb-6 sm:text-sm">
            {"/* 한층 더 즐거운 세상을 위해 */"}
          </p>

          <h1
            id="hero-title"
            aria-label="코드로 문화를 혁신하다 ; // 반낭코"
            className="hero-enter-2 max-w-[48rem] break-keep font-nacelle text-[clamp(2.75rem,10vw,4.5rem)] font-semibold leading-[0.94] tracking-[-0.055em] lg:text-[clamp(4.75rem,6.4vw,5.75rem)]"
          >
            <span aria-hidden="true" className="block">
              코드로 문화를
            </span>
            <span aria-hidden="true" className="block text-signal">
              혁신하다 ;
            </span>
            <span
              aria-hidden="true"
              className="mt-2 block text-[0.39em] tracking-[-0.025em] text-ivory/65 sm:mt-3"
            >
              {"// 반낭코"}
            </span>
          </h1>

          <p className="hero-enter-3 mt-6 max-w-[38rem] break-keep text-[0.9375rem] leading-7 text-ivory/70 sm:mt-8 sm:text-lg sm:leading-8">
            문화 서비스, 커뮤니티, 예약과 발견의 경험을 더 쉽고 풍요롭게
            만듭니다.
          </p>

          <div className="hero-enter-3 mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 sm:mt-9">
            <a
              href="#about"
              className="inline-flex min-h-12 items-center justify-between gap-8 bg-signal px-5 text-sm font-semibold text-ink outline-none transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-ivory focus-visible:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal motion-reduce:transform-none motion-reduce:transition-none"
            >
              반낭코 알아보기
              <span aria-hidden="true">↓</span>
            </a>
            <a
              href="#services"
              className="inline-flex min-h-11 items-center gap-3 border-b border-grid text-sm font-semibold text-ivory outline-none transition-colors duration-200 hover:border-signal hover:text-signal focus-visible:border-signal focus-visible:text-signal focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-4 focus-visible:ring-offset-ink motion-reduce:transition-none"
            >
              서비스 보기
              <span aria-hidden="true">↘</span>
            </a>
          </div>
        </div>

        <CulturalSignalField />
      </div>
    </section>
  );
}
