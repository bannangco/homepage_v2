import Link from "next/link";

export default function AnnouncementNotFound() {
  return (
    <div className="grid min-h-[70svh] w-full place-items-center bg-ivory px-5 pb-24 pt-36 text-ink sm:px-6">
      <div className="w-full max-w-4xl border-y border-border py-12 sm:py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
          Legal archive / Not found
        </p>
        <h1 className="mt-5 max-w-3xl font-nacelle text-4xl font-semibold leading-[1.1] tracking-[-0.035em] text-ink sm:text-5xl lg:text-6xl">
          전자공고·법적 고지를 찾을 수 없습니다.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-ink-muted">
          요청하신 전자공고·법적 고지가 존재하지 않거나 게시되지
          않았습니다.
        </p>
        <Link
          href="/announcements"
          className="mt-9 inline-flex min-h-12 items-center border-b border-ink text-sm font-semibold text-ink outline-none transition-colors hover:border-signal hover:text-ink-muted focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 focus-visible:ring-offset-ivory motion-reduce:transition-none"
        >
          목록으로 돌아가기 <span className="ml-3" aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
