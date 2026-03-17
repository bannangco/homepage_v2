"use client";

import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Announcement } from '@/types/announcement';
import { useEffect, useState } from 'react';
import Link from 'next/link';

function formatAnnouncementDate(createdAt: Announcement['createdAt']) {
  const date = createdAt?.toDate?.() ?? new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

export default function AnnouncementsContent() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const announcementsRef = collection(db, 'announcements');
        const q = query(announcementsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const fetchedAnnouncements = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Announcement[];
        setAnnouncements(fetchedAnnouncements);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('공지사항을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-200">공지사항</h1>
        </div>
        <div className="text-center text-gray-400">
          반낭코 소식을 준비하고 있어요...
        </div>
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
          <p className="text-center text-gray-400">곧 새로운 공지로 찾아올게요.</p>
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
                  {formatAnnouncementDate(announcement.createdAt)}
                </p>
              </header>

              <div className="prose prose-invert mb-4 line-clamp-3 max-w-none text-indigo-100/85">
                {announcement.content}
              </div>

              <Link
                href={`/announcements/${announcement.id}`}
                className="text-sm font-medium text-indigo-300 transition hover:text-indigo-200"
              >
                자세히 보기 →
              </Link>
            </article>
          ))
        )}
      </div>
    </div>
  );
} 
