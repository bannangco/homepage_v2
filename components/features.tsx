const focusAreas = [
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

export default function Features() {
  return (
    <section
      id="mission"
      aria-labelledby="mission-title"
      className="relative overflow-hidden bg-ink px-5 py-24 text-ivory sm:px-8 lg:px-12 lg:py-36"
    >
      <div aria-hidden="true" className="signal-grid absolute inset-0 opacity-35" />
      <div className="relative mx-auto max-w-[90rem]">
        <div className="grid gap-10 border-t border-grid pt-5 lg:grid-cols-[18rem_1fr] lg:gap-16">
          <div>
            <p className="font-mono text-xs font-semibold tracking-[0.16em] text-signal">
              MISSION / 03 FLOWS
            </p>
          </div>
          <div>
            <h2
              id="mission-title"
              className="max-w-5xl break-keep font-nacelle text-4xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-7xl"
            >
              문화생활이 더 가까워지는 구조를 만듭니다.
            </h2>
            <p className="mt-8 max-w-3xl break-keep text-lg leading-8 text-ivory/60">
              컴퓨터 사이언스를 기반으로 발견, 참여, 운영의 흐름을 다시
              설계합니다.
            </p>
          </div>
        </div>

        <ol className="mt-20 border-b border-grid lg:mt-28">
          {focusAreas.map((item) => (
            <li
              key={item.index}
              className="group grid gap-6 border-t border-grid py-8 transition-colors hover:bg-surface-dark focus-within:bg-surface-dark sm:grid-cols-[4rem_9rem_1fr] sm:items-start sm:gap-8 lg:grid-cols-[6rem_13rem_1fr] lg:py-10"
            >
              <span className="font-mono text-xs text-signal">{item.index}</span>
              <h3 className="font-nacelle text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                {item.title}
              </h3>
              <div className="max-w-3xl">
                <p className="break-keep text-xl font-semibold sm:text-2xl">
                  {item.statement}
                </p>
                <p className="mt-3 break-keep leading-7 text-ivory/60">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
