import Image from "next/image";
import type { StaticImageData } from "next/image";
import SplashImg from "@/public/images/workflow-splash.png";
import MusePickerImg from "@/public/images/workflow-01.png";
import FriendingImg from "@/public/images/workflow-friending.png";
import MeetingGoImg from "@/public/images/workflow-meetinggo.png";

type PastService = {
  name: string;
  description: string;
  endedAt: string;
  image: StaticImageData;
};

const pastServices: PastService[] = [
  {
    name: "Splash",
    description: "국내 수상레저 통합 예약관리 플랫폼",
    endedAt: "2024.12 종료",
    image: SplashImg,
  },
  {
    name: "MusePicker",
    description: "미국 미술관·갤러리·전시 정보를 제공한 AI 메타서치 서비스",
    endedAt: "2025.04 종료",
    image: MusePickerImg,
  },
  {
    name: "프렌딩",
    description: "관심사 기반 20대 대학생 소셜 모임 서비스",
    endedAt: "2025.04 종료",
    image: FriendingImg,
  },
  {
    name: "미팅GO",
    description: "대학생을 위한 안전하고 편리한 미팅 애플리케이션",
    endedAt: "2025.04 종료",
    image: MeetingGoImg,
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
              운영을 종료한 서비스 이력을 확인하실 수 있습니다.
            </p>
          </div>

          <div className="mx-auto grid max-w-sm gap-6 lg:max-w-none lg:grid-cols-4">
            {pastServices.map((service) => (
              <div
                key={service.name}
                className="overflow-hidden rounded-2xl bg-gray-800/40 p-px before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_right,theme(colors.gray.800),theme(colors.gray.700),theme(colors.gray.800))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]"
              >
                <div className="relative h-full overflow-hidden rounded-2xl bg-gray-950">
                  <Image
                    className="inline-flex"
                    src={service.image}
                    width={350}
                    height={288}
                    alt={service.name}
                  />
                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-semibold text-gray-200">{service.name}</h3>
                    <p className="mb-3 text-indigo-200/65">{service.description}</p>
                    <span className="rounded-full bg-gray-800/40 px-3 py-1 text-sm text-indigo-200/85">
                      {service.endedAt}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
