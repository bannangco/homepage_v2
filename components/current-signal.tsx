const currentSignals = [
  {
    index: "01",
    label: "PUBLIC OPERATION",
    value: "현재 직접 공개 운영 중인 서비스 없음",
  },
  {
    index: "02",
    label: "MUSEPICKER",
    value: "출시 준비 중",
  },
  {
    index: "03",
    label: "SPLASH",
    value: "운영 중단 · 리뉴얼 중",
  },
] as const;

export default function CurrentSignal() {
  return (
    <section
      id="current-signal"
      aria-labelledby="current-signal-title"
      className="bg-signal px-5 py-16 text-ink sm:px-8 sm:py-20 lg:px-12"
    >
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-8 border-y border-ink/30 py-5 lg:grid-cols-[18rem_1fr] lg:gap-16">
          <div>
            <p className="font-mono text-xs font-semibold tracking-[0.16em]">
              CURRENT SIGNAL
            </p>
            <p className="mt-2 text-xs text-ink/70">EDITORIAL STATUS / ARCHIVE</p>
          </div>
          <h2
            id="current-signal-title"
            className="max-w-4xl break-keep font-nacelle text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl"
          >
            지금의 상태를 과장 없이 기록합니다.
          </h2>
        </div>

        <dl className="divide-y divide-ink/25 border-b border-ink/30">
          {currentSignals.map((signal) => (
            <div
              key={signal.index}
              className="grid gap-3 py-5 sm:grid-cols-[4rem_12rem_1fr] sm:items-baseline sm:gap-6"
            >
              <dt className="contents">
                <span className="font-mono text-xs text-ink/70">
                  {signal.index}
                </span>
                <span className="font-mono text-xs font-semibold tracking-[0.12em]">
                  {signal.label}
                </span>
              </dt>
              <dd className="break-keep text-lg font-semibold sm:text-xl">
                {signal.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
