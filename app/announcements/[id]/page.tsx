"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Announcement } from "@/types/announcement";

function formatAnnouncementDate(createdAt: Announcement["createdAt"]) {
  const date = createdAt?.toDate?.() ?? new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export default function AnnouncementDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnnouncement() {
      try {
        const announcementRef = doc(db, "announcements", params.id);
        const announcementSnapshot = await getDoc(announcementRef);

        if (!announcementSnapshot.exists()) {
          setError("요청하신 공지를 찾을 수 없어요.");
          return;
        }

        setAnnouncement({
          id: announcementSnapshot.id,
          ...(announcementSnapshot.data() as Omit<Announcement, "id">),
        });
      } catch (fetchError) {
        console.error("Error fetching announcement:", fetchError);
        setError("공지 상세 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncement();
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <p className="text-center text-gray-400">공지 내용을 준비하고 있어요...</p>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="rounded-md bg-red-500/10 p-4 text-red-300">{error}</div>
        <div className="mt-6">
          <Link href="/announcements" className="text-sm font-medium text-indigo-300 hover:text-indigo-200">
            공지사항 목록으로 돌아가기 →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <article>
        <header className="mb-8">
          <h1 className="mb-2 text-3xl font-semibold text-gray-200">{announcement.title}</h1>
          <p className="text-indigo-200/65">{formatAnnouncementDate(announcement.createdAt)}</p>
        </header>

        <div className="prose prose-invert max-w-none text-indigo-100/90">{announcement.content}</div>

        {announcement.fileUrl && (
          <div className="mt-8">
            <a
              href={announcement.fileUrl}
              className="btn bg-gradient-to-t from-indigo-600 to-indigo-500 bg-[bottom] bg-[length:100%_100%] px-6 py-2 text-white shadow-[inset_0px_1px_0px_0px_theme(colors.white/.16)] hover:bg-[length:100%_150%]"
              target="_blank"
              rel="noopener noreferrer"
            >
              {announcement.fileName ?? "첨부 파일"} 다운로드
            </a>
          </div>
        )}

        <div className="mt-8">
          <Link href="/announcements" className="text-sm font-medium text-indigo-300 hover:text-indigo-200">
            공지사항 목록으로 돌아가기 →
          </Link>
        </div>
      </article>
    </div>
  );
}
