import type { Announcement } from "@/types/announcement";

export const announcements: Announcement[] = [
  {
    id: "1",
    title: "정관",
    summary: "주식회사 반낭코의 정관 관련 공고입니다.",
    content:
      "주식회사 반낭코의 정관 관련 공고입니다.\n\n세부 열람이나 회사 공고 관련 문의는 공식 이메일로 연락해 주세요.",
    createdAt: "2024-01-21",
  },
];

export function getAnnouncements() {
  return [...announcements].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getAnnouncementById(id: string) {
  return announcements.find((announcement) => announcement.id === id) ?? null;
}
