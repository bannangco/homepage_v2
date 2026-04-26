import Reveal from "@/components/reveal";

const workStreams = [
  {
    label: "01",
    title: "문화 서비스 리서치",
    body: "전시, 레저, 커뮤니티, 대학 문화처럼 사람들이 시간을 쓰는 방식을 관찰하고 다음 온라인 경험의 기회를 찾습니다.",
  },
  {
    label: "02",
    title: "빠른 프로토타이핑",
    body: "작게 만들고 실제 사용자 반응으로 검증합니다. 운영 가능한 수준까지 빠르게 다듬는 것이 반낭코의 기본 리듬입니다.",
  },
  {
    label: "03",
    title: "운영 가능한 제품화",
    body: "예약, 검색, 매칭, 콘텐츠 관리처럼 서비스가 지속되기 위해 필요한 흐름을 안정적인 웹 기술로 구현합니다.",
  },
];

export default function Workflows() {
  return (
    <section id="services" className="bg-[#15231f] px-5 py-24 text-white sm:px-6 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-4xl">
          <p className="mb-4 text-sm font-semibold uppercase text-teal-200">
            Service Direction
          </p>
          <h2 className="font-nacelle text-4xl font-semibold leading-tight md:text-6xl">
            온라인 기술로 문화 경험의 입구를 넓힙니다.
          </h2>
        </Reveal>

        <div className="mt-20 grid gap-8 lg:grid-cols-3">
          {workStreams.map((stream, index) => (
            <Reveal
              key={stream.label}
              delay={index * 100}
              className="border-t border-white/25 pt-6"
            >
              <span className="text-sm font-semibold text-teal-200">
                {stream.label}
              </span>
              <h3 className="mt-6 font-nacelle text-2xl font-semibold">
                {stream.title}
              </h3>
              <p className="mt-4 leading-7 text-stone-200">{stream.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
