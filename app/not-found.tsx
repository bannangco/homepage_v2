import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative grid min-h-[75svh] w-full place-items-center overflow-hidden bg-ivory px-5 pb-24 pt-36 text-ink sm:px-6">
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-grid"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-5xl border-x border-grid bg-ivory px-5 py-12 sm:px-10 sm:py-16">
        <div className="border-y border-border py-10 sm:py-14">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
            Signal lost / 404
          </p>
          <p
            className="mt-5 font-nacelle text-8xl font-semibold leading-none tracking-[-0.06em] text-signal sm:text-9xl"
            aria-hidden="true"
          >
            404
          </p>
          <h1 className="mt-6 max-w-3xl break-keep font-nacelle text-4xl font-semibold leading-[1.1] tracking-[-0.035em] text-ink [overflow-wrap:normal] sm:text-5xl lg:text-6xl">
            요청한 신호를 찾을 수 없습니다.
          </h1>
          <p className="mt-6 max-w-xl break-keep text-lg leading-8 text-ink-muted [overflow-wrap:normal]">
            주소가 변경되었거나 존재하지 않는 페이지입니다. 반낭코의 홈에서
            다시 탐색해 주세요.
          </p>
          <Link
            href="/"
            className="mt-9 inline-flex min-h-12 items-center border border-ink bg-ink px-5 text-sm font-semibold text-ivory outline-none transition-colors hover:bg-signal hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 focus-visible:ring-offset-ivory motion-reduce:transition-none"
          >
            홈으로 돌아가기 <span className="ml-3" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
