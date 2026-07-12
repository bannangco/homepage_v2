export interface AnnouncementDocument {
  href: string;
  label: string;
}

export interface Announcement {
  id: string;
  title: string;
  summary: string;
  content?: string;
  createdAt: string;
  document?: AnnouncementDocument;
}
