"use client";

import { Announcement } from '@/types/announcement';
import { useEffect, useState } from 'react';
import { fetchAnnouncements } from '@/lib/repositories/announcements/client';
import Link from 'next/link';
import { formatDateYYYYMMDD } from '@/utils/formatDate';

export default function AnnouncementsContent() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const result = await fetchAnnouncements();
        setAnnouncements(result);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('지금은 소식을 불러오지 못하고 있어요. 잠시 후 다시 확인해주세요.');
      } finally {
        setLoading(false);
      }
    }

    loadAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-200">공지사항</h1>
        </div>
        <div className="text-center text-gray-400">반낭코 소식을 불러오는 중입니다...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-200">공지사항</h1>
        </div>
        <div className="rounded-md bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-center text-3xl font-semibold text-gray-200">공지사항</h1>
      </div>

      <div className="space-y-8">
        {announcements.length === 0 ? (
          <p className="text-center text-gray-400">아직 등록된 공지가 없어요. 곧 새로운 소식으로 찾아올게요.</p>
        ) : (
          announcements.map((announcement) => (
            <article
              key={announcement.id}
              className="rounded-lg bg-gray-800/40 p-6 transition"
            >
              <header className="mb-4">
                <h2 className="mb-2 text-xl font-semibold text-gray-200">
                  {announcement.title}
                </h2>
                <p className="text-indigo-200/65">
                  {formatDateYYYYMMDD(announcement.createdAt)}
                </p>
              </header>

              <div className="mb-4 whitespace-pre-wrap text-gray-300/90">
                {announcement.content}
              </div>

              <Link href={`/announcements/${announcement.id}`} className="text-indigo-300 hover:text-indigo-200">
                자세히 보기 →
              </Link>

              {announcement.fileUrl && (
                <div className="mt-4">
                  <a
                    href={announcement.fileUrl}
                    className="btn bg-gradient-to-t from-indigo-600 to-indigo-500 bg-[bottom] bg-[length:100%_100%] px-6 py-2 text-white shadow-[inset_0px_1px_0px_0px_theme(colors.white/.16)] hover:bg-[length:100%_150%]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {announcement.fileName} 다운로드
                  </a>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
