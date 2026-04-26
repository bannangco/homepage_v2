import Reveal from "@/components/reveal";

const focusAreas = [
  {
    title: "발견",
    body: "관객과 사용자가 새로운 문화 경험을 찾는 순간을 더 빠르고 선명하게 만듭니다.",
  },
  {
    title: "참여",
    body: "온라인 커뮤니티와 소셜 흐름을 설계해 문화 활동이 자연스럽게 이어지도록 돕습니다.",
  },
  {
    title: "운영",
    body: "예약, 매칭, 콘텐츠 관리처럼 반복되는 운영 과정을 기술로 가볍게 만듭니다.",
  },
];

export default function Features() {
  return (
    <section id="mission" className="bg-stone-100 px-5 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase text-teal-700">
              Mission
            </p>
            <h2 className="font-nacelle text-4xl font-semibold leading-tight text-stone-950 md:text-6xl">
              문화생활이 더 가까워지는 구조를 만듭니다.
            </h2>
          </div>
          <p className="max-w-2xl text-xl leading-9 text-stone-700">
            반낭코는 컴퓨터 사이언스를 기반으로 문화 서비스의 발견, 참여,
            운영 흐름을 다시 설계합니다. 더 많은 사람이 일상 속에서 좋은
            경험을 쉽게 만나도록 만드는 것이 우리의 일입니다.
          </p>
        </Reveal>

        <div className="mt-20 divide-y divide-stone-300 border-y border-stone-300">
          {focusAreas.map((item, index) => (
            <Reveal
              key={item.title}
              delay={index * 90}
              className="grid gap-5 py-8 md:grid-cols-[11rem_1fr]"
            >
              <h3 className="font-nacelle text-3xl font-semibold text-stone-950">
                {item.title}
              </h3>
              <p className="max-w-3xl text-lg leading-8 text-stone-600">
                {item.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
