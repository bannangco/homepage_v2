import Image from "next/image";
import type { StaticImageData } from "next/image";

import Reveal from "@/components/reveal";
import SplashImg from "@/public/images/workflow-splash.png";
import MusePickerImg from "@/public/images/workflow-01.png";
import FriendingImg from "@/public/images/workflow-friending.png";
import MeetingGoImg from "@/public/images/workflow-meetinggo.png";

type PastService = {
  name: string;
  description: string;
  endedAt: string;
  image: StaticImageData;
  href?: string;
};

const pastServices: PastService[] = [
  {
    name: "Splash",
    description: "국내 수상레저 통합 예약관리 플랫폼. 2024년 4월부터 12월까지 운영되었으며, 많은 가족들에게 사랑을 받았습니다.",
    endedAt: "2024.12 종료",
    image: SplashImg,
  },
  {
    name: "MusePicker",
    description: "AI operated metasearch website for Museums, Galleries, and Art in U.S. 2025.04 종료",
    endedAt: "2025.04 종료",
    image: MusePickerImg,
    href: "https://www.musepicker.com",
  },
  {
    name: "프렌딩",
    description: "관심사 및 취미 기반, 20대 대학생들의 자유로운 소셜 모임. 2025.04 종료",
    endedAt: "2025.04 종료",
    image: FriendingImg,
    href: "https://friending.so",
  },
  {
    name: "미팅GO",
    description: "대학생들을 위한 가장 안전하고 편리한 미팅 어플리케이션. 2025.04 종료",
    endedAt: "2025.04 종료",
    image: MeetingGoImg,
    href: "https://meetinggo.kr",
  },
];

export default function PastServices() {
  return (
    <section className="bg-stone-100 px-5 py-24 sm:px-6 lg:py-32" id="past-services">
      <div className="mx-auto max-w-7xl">
        <Reveal className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase text-teal-700">
              Archive
            </p>
            <h2 className="font-nacelle text-4xl font-semibold leading-tight text-stone-950 md:text-6xl">
              실험하고 운영했던 문화 서비스들
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-stone-600">
            반낭코는 여러 문화 서비스 실험을 통해 사용자가 모이고, 예약하고,
            발견하는 방식을 배웠습니다.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {pastServices.map((service, index) => {
            const content = (
              <>
                <div className="flex aspect-[4/3] items-center justify-center bg-stone-200 p-6">
                  <Image
                    src={service.image}
                    alt={`${service.name} 서비스 이미지`}
                    className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-nacelle text-2xl font-semibold text-stone-950">
                      {service.name}
                    </h3>
                    <span className="shrink-0 text-xs font-semibold text-teal-700">
                      {service.endedAt}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-stone-600">
                    {service.description}
                  </p>
                </div>
              </>
            );

            const className =
              "group block overflow-hidden rounded-lg border border-stone-300 bg-white transition duration-300 hover:-translate-y-1 hover:border-stone-400 hover:shadow-xl hover:shadow-stone-900/10";

            return (
              <Reveal key={service.name} delay={index * 90}>
                {service.href ? (
                  <a
                    className={className}
                    href={service.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {content}
                  </a>
                ) : (
                  <div className={className}>{content}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
