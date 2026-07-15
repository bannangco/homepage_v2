const capabilities = [
  {
    index: "01",
    title: "발견",
    statement: "좋은 문화 경험을 찾는 흐름",
    body: "흩어진 선택지를 더 선명하게 탐색하고, 일상 가까이에서 새로운 경험을 만날 수 있게 합니다.",
  },
  {
    index: "02",
    title: "참여",
    statement: "사람과 문화 활동이 이어지는 흐름",
    body: "관심사와 취향을 매개로 사람들이 만나고, 경험에 자연스럽게 참여하는 접점을 설계합니다.",
  },
  {
    index: "03",
    title: "운영",
    statement: "반복되는 운영을 기술로 가볍게",
    body: "예약·검색·매칭·콘텐츠 관리의 반복을 정돈해 문화 서비스를 지속 가능한 제품으로 만듭니다.",
  },
] as const;

const workStreams = [
  {
    index: "01",
    label: "Research",
    title: "문화 서비스 리서치",
    body: "사람들이 문화에 시간을 쓰는 장면을 관찰하고, 다음 온라인 경험의 기회를 찾습니다.",
  },
  {
    index: "02",
    label: "Prototype",
    title: "빠른 프로토타이핑",
    body: "작게 만들고 실제 반응으로 검증하며, 배운 것을 다음 설계에 빠르게 반영합니다.",
  },
  {
    index: "03",
    label: "Product",
    title: "운영 가능한 제품화",
    body: "검증된 흐름을 안정적인 웹 기술과 명확한 운영 구조를 갖춘 제품으로 완성합니다.",
  },
] as const;

export default function CompanyIntro() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="bg-ivory px-5 py-20 text-ink sm:px-8 sm:py-24 lg:px-12 lg:py-28"
    >
      <div className="mx-auto max-w-[80rem]">
        <div className="section-reveal grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
          <p className="text-sm font-semibold text-ink-muted">
            Bannangco / About
          </p>
          <div>
            <h2
              id="about-title"
              className="max-w-4xl break-keep font-nacelle text-4xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-6xl"
            >
              문화생활이 더 가까워지는 구조를 만듭니다.
            </h2>
            <p className="mt-7 max-w-3xl break-keep text-lg leading-8 text-ink-muted sm:text-xl sm:leading-9">
              반낭코는 문화 서비스, 커뮤니티, 예약과 발견의 경험을 더 쉽고
              풍요롭게 만드는 Korean culture-tech startup입니다.
            </p>
          </div>
        </div>

        <div
          aria-label="현재 회사 상태"
          className="section-reveal mt-12 grid overflow-hidden border-y border-border bg-surface-light sm:grid-cols-2 lg:ml-[19rem] lg:mt-14"
        >
          <div className="flex min-h-20 items-center gap-4 px-5 py-4 sm:border-r sm:border-border">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-ink" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold text-ink-muted">현재 공개 운영</p>
              <p className="mt-1 break-keep font-semibold">
                현재 직접 공개 운영 중인 서비스 없음
              </p>
            </div>
          </div>
          <div className="flex min-h-20 items-center gap-4 border-t border-border px-5 py-4 sm:border-t-0">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-signal ring-4 ring-signal/20" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold text-ink-muted">MusePicker</p>
              <p className="mt-1 font-semibold">출시 준비 중</p>
            </div>
          </div>
        </div>

        <ol className="section-reveal mt-16 grid border-y border-border sm:grid-cols-3 lg:mt-20">
          {capabilities.map((capability, index) => (
            <li
              key={capability.index}
              className={`capability-panel group relative py-8 sm:px-6 lg:px-8 ${
                index > 0
                  ? "border-t border-border sm:border-l sm:border-t-0"
                  : ""
              }`}
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-signal transition-transform duration-200 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100 motion-reduce:transition-none"
              />
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-nacelle text-3xl font-semibold tracking-[-0.03em]">
                  {capability.title}
                </h3>
                <span className="text-xs font-semibold text-ink-muted">
                  {capability.index}
                </span>
              </div>
              <p className="mt-5 break-keep text-lg font-semibold leading-7">
                {capability.statement}
              </p>
              <p className="mt-3 break-keep leading-7 text-ink-muted">
                {capability.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="section-reveal mt-16 lg:mt-20">
          <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink-muted">Working method</p>
              <h3 className="mt-2 break-keep font-nacelle text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                관찰에서 운영까지, 짧고 선명한 흐름으로.
              </h3>
            </div>
            <span className="hidden h-px w-24 bg-signal sm:block" aria-hidden="true" />
          </div>

          <ol className="grid sm:grid-cols-3">
            {workStreams.map((stream, index) => (
              <li
                key={stream.index}
                className={`py-7 sm:px-6 lg:px-8 ${
                  index > 0
                    ? "border-t border-border sm:border-l sm:border-t-0"
                    : ""
                }`}
              >
                <p className="flex items-center gap-3 text-xs font-semibold text-ink-muted">
                  <span className="text-ink">{stream.index}</span>
                  <span aria-hidden="true" className="h-px w-6 bg-signal" />
                  {stream.label}
                </p>
                <h4 className="mt-4 break-keep text-lg font-semibold">
                  {stream.title}
                </h4>
                <p className="mt-2 break-keep leading-7 text-ink-muted">
                  {stream.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
