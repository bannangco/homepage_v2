const workStreams = [
  {
    label: "01 / RESEARCH",
    title: "문화 서비스 리서치",
    body: "사람들이 문화에 시간을 쓰는 장면을 관찰하고, 다음 온라인 경험의 기회를 찾습니다.",
  },
  {
    label: "02 / PROTOTYPE",
    title: "빠른 프로토타이핑",
    body: "작게 만들고 실제 반응으로 검증하며, 배운 것을 다음 설계에 빠르게 반영합니다.",
  },
  {
    label: "03 / PRODUCT",
    title: "운영 가능한 제품화",
    body: "검증된 흐름을 안정적인 웹 기술과 명확한 운영 구조를 갖춘 제품으로 완성합니다.",
  },
] as const;

export default function Workflows() {
  return (
    <section
      id="method"
      aria-labelledby="method-title"
      className="signal-grid-light bg-ivory px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
    >
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-8 border-y border-border py-6 lg:grid-cols-[18rem_1fr] lg:gap-16">
          <p className="font-mono text-xs font-semibold tracking-[0.16em] text-ink-muted">
            WORKING METHOD
          </p>
          <h2
            id="method-title"
            className="max-w-5xl break-keep font-nacelle text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-6xl"
          >
            관찰에서 운영까지, 짧고 선명한 흐름으로.
          </h2>
        </div>

        <ol className="divide-y divide-border border-b border-border bg-ivory/80">
          {workStreams.map((stream) => (
            <li
              key={stream.label}
              className="grid gap-5 py-8 sm:grid-cols-[11rem_1fr] lg:grid-cols-[18rem_20rem_1fr] lg:items-baseline lg:gap-16"
            >
              <span className="font-mono text-xs font-semibold tracking-[0.12em] text-ink-muted">
                {stream.label}
              </span>
              <h3 className="break-keep font-nacelle text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                {stream.title}
              </h3>
              <p className="max-w-2xl break-keep leading-7 text-ink-muted">
                {stream.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
