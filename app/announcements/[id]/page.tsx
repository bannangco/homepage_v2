import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAnnouncementById } from '@/lib/repositories/announcements/repository';
import { formatDateYYYYMMDD } from '@/utils/formatDate';

interface AnnouncementDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AnnouncementDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const announcement = await getAnnouncementById(id);

  if (!announcement) {
    return {
      title: '공지사항 - 반낭코',
    };
  }

  return {
    title: `${announcement.title} - 반낭코`,
    description: announcement.content.slice(0, 120),
  };
}

export default async function AnnouncementDetailPage({ params }: AnnouncementDetailPageProps) {
  const { id } = await params;
  const announcement = await getAnnouncementById(id);

  if (!announcement) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <article>
        <header className="mb-8">
          <h1 className="mb-2 text-3xl font-semibold text-gray-200">{announcement.title}</h1>
          <p className="text-indigo-200/65">{formatDateYYYYMMDD(announcement.createdAt)}</p>
        </header>

        <div className="prose prose-invert max-w-none whitespace-pre-wrap">{announcement.content}</div>

        {announcement.fileUrl && (
          <div className="mt-6">
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
    </div>
  );
}
