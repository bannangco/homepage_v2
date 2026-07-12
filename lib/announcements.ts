import announcementData from "@/data/announcements.json";
import {
  isValidAnnouncementId,
  validateAnnouncements,
} from "@/lib/announcement-contract";
import {
  compareISODateOnlyDescending,
  isValidISODateOnly,
} from "@/utils/formatDate";

export const announcements = validateAnnouncements(
  announcementData,
  isValidISODateOnly,
);

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
  if (!isValidAnnouncementId(id)) {
    return null;
  }

  return announcements.find((announcement) => announcement.id === id) ?? null;
}
