import { Announcement, CreateAnnouncementInput } from '@/types/announcement';

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const response = await fetch('/api/announcements');

  if (!response.ok) {
    throw new Error('공지사항을 불러오는 중 오류가 발생했습니다.');
  }

  const data = (await response.json()) as { announcements: Announcement[] };
  return data.announcements;
}

export async function postAnnouncement(input: CreateAnnouncementInput): Promise<void> {
  const formData = new FormData();
  formData.append('title', input.title);
  formData.append('content', input.content);

  if (input.file) {
    formData.append('file', input.file);
  }

  const response = await fetch('/api/announcements', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(data?.message ?? '공지사항 작성 중 오류가 발생했습니다.');
  }
}
