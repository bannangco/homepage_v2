import Link from 'next/link';

export default function AnnouncementNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <h1 className="mb-4 text-3xl font-semibold text-gray-200">공지사항을 찾지 못했어요</h1>
      <p className="mb-8 text-gray-400">요청하신 소식이 이동되었거나 삭제되었을 수 있어요.</p>
      <Link href="/announcements" className="text-indigo-300 hover:text-indigo-200">
        공지 목록으로 돌아가기 →
      </Link>
    </div>
  );
}
