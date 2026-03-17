export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  fileUrl?: string;
  fileName?: string;
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  file?: File | null;
}
