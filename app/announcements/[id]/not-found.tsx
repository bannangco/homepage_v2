import Link from 'next/link';

export default function AnnouncementNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-32 text-center sm:px-6">
      <h1 className="mb-4 font-nacelle text-4xl font-semibold text-stone-950">
        공지사항을 찾지 못했어요
      </h1>
      <p className="mb-8 text-stone-600">
        요청하신 소식이 이동되었거나 삭제되었을 수 있어요.
      </p>
      <Link href="/announcements" className="font-semibold text-teal-700 hover:text-teal-900">
        공지 목록으로 돌아가기
      </Link>
    </div>
  );
}
