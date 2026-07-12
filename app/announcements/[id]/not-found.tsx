import Link from "next/link";

export default function AnnouncementNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-32 text-center sm:px-6">
      <h1 className="mb-4 font-nacelle text-4xl font-semibold text-stone-950">
        전자공고·법적 고지를 찾을 수 없습니다.
      </h1>
      <p className="mb-8 text-stone-600">
        요청하신 전자공고·법적 고지가 존재하지 않거나 게시되지 않았습니다.
      </p>
      <Link href="/announcements" className="font-semibold text-teal-700 hover:text-teal-900">
        전자공고·법적 고지 목록으로 돌아가기
      </Link>
    </div>
  );
}
