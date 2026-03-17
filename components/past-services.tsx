import Image from "next/image";
import type { StaticImageData } from "next/image";
import SplashImg from "@/public/images/workflow-splash.png";
import MusePickerImg from "@/public/images/workflow-01.png";
import FriendingImg from "@/public/images/workflow-friending.png";
import MeetingGoImg from "@/public/images/workflow-meetinggo.png";
import Spotlight from "@/components/spotlight";

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
    description: "국내 수상레저 통합 예약관리 플랫폼. 2024.12 종료",
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
    <section className="relative" id="past-services">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="mx-auto max-w-3xl pb-12 text-center md:pb-20">
            <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-gradient-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-gradient-to-l after:from-transparent after:to-indigo-200/50">
              <span className="inline-flex bg-gradient-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent">
                종료된 서비스
              </span>
            </div>
            <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,theme(colors.gray.200),theme(colors.indigo.200),theme(colors.gray.50),theme(colors.indigo.300),theme(colors.gray.200))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
              반낭코가 운영했던 서비스
            </h2>
            <p className="text-lg text-indigo-200/65">
              이미지와 함께 운영 종료된 서비스 이력을 확인하실 수 있습니다.
            </p>
          </div>

          <Spotlight className="group mx-auto grid max-w-sm items-start gap-6 md:max-w-2xl md:grid-cols-2 lg:max-w-none lg:grid-cols-4">
            {pastServices.map((service) => {
              const cardClassName =
                "group/card relative h-full overflow-hidden rounded-2xl bg-gray-800 p-px before:pointer-events-none before:absolute before:-left-40 before:-top-40 before:z-10 before:h-80 before:w-80 before:translate-x-[var(--mouse-x)] before:translate-y-[var(--mouse-y)] before:rounded-full before:bg-indigo-500/80 before:opacity-0 before:blur-3xl before:transition-opacity before:duration-500 after:pointer-events-none after:absolute after:-left-48 after:-top-48 after:z-30 after:h-64 after:w-64 after:translate-x-[var(--mouse-x)] after:translate-y-[var(--mouse-y)] after:rounded-full after:bg-indigo-500 after:opacity-0 after:blur-3xl after:transition-opacity after:duration-500 after:hover:opacity-20 before:group-hover:opacity-100";

              const cardContent = (
                <div className="relative z-20 h-full overflow-hidden rounded-[inherit] bg-gray-950 after:absolute after:inset-0 after:bg-gradient-to-br after:from-gray-900/50 after:via-gray-800/25 after:to-gray-900/50">
                  <Image
                    className="inline-flex"
                    src={service.image}
                    width={350}
                    height={288}
                    alt={service.name}
                  />
                  <div className="p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="btn-sm relative rounded-full bg-gray-800/40 px-2.5 py-0.5 text-xs font-normal before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_bottom,theme(colors.gray.700/.15),theme(colors.gray.700/.5))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] hover:bg-gray-800/60">
                        <span className="bg-gradient-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent">
                          {service.name}
                        </span>
                      </span>
                      <span className="rounded-full bg-gray-800/40 px-2.5 py-0.5 text-xs text-indigo-200/75">
                        {service.endedAt}
                      </span>
                    </div>
                    <p className="text-indigo-200/65">{service.description}</p>
                  </div>
                </div>
              );

              if (!service.href) {
                return (
                  <div key={service.name} className={cardClassName}>
                    {cardContent}
                  </div>
                );
              }

              return (
                <a
                  key={service.name}
                  className={cardClassName}
                  href={service.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {cardContent}
                </a>
              );
            })}
          </Spotlight>
        </div>
      </div>
    </section>
  );
}
