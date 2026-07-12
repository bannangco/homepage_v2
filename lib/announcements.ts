import announcementData from "@/data/announcements.json";
import type { Announcement } from "@/types/announcement";
import { compareISODateOnlyDescending } from "@/utils/formatDate";

export const announcements: Announcement[] = announcementData;

function compareText(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  return a < b ? -1 : 1;
}

export function getAnnouncements() {
  return [...announcements].sort((a, b) => {
    const dateOrder = compareISODateOnlyDescending(a.createdAt, b.createdAt);

    return dateOrder || compareText(a.id, b.id);
  });
}

export function getAnnouncementById(id: string) {
  return announcements.find((announcement) => announcement.id === id) ?? null;
}
