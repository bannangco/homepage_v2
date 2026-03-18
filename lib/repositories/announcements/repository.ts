import { promises as fs } from 'fs';
import path from 'path';
import { Announcement } from '@/types/announcement';

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'announcements');
const DATA_FILE = path.join(DATA_DIR, 'announcements.json');

async function ensureStorage() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function getAnnouncements(): Promise<Announcement[]> {
  await ensureStorage();

  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Announcement[];

    return parsed.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

export async function getAnnouncementById(id: string): Promise<Announcement | null> {
  const announcements = await getAnnouncements();
  return announcements.find((announcement) => announcement.id === id) ?? null;
}

export async function createAnnouncement(input: {
  title: string;
  content: string;
  file?: File | null;
}): Promise<Announcement> {
  await ensureStorage();

  const announcements = await getAnnouncements();
  const now = new Date().toISOString();
  const id = Date.now().toString();

  let fileUrl: string | undefined;
  let fileName: string | undefined;

  if (input.file && input.file.size > 0) {
    const bytes = Buffer.from(await input.file.arrayBuffer());
    const safeName = input.file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const storedName = `${id}_${safeName}`;
    const filePath = path.join(UPLOAD_DIR, storedName);

    await fs.writeFile(filePath, bytes);

    fileUrl = `/uploads/announcements/${storedName}`;
    fileName = input.file.name;
  }

  const announcement: Announcement = {
    id,
    title: input.title,
    content: input.content,
    createdAt: now,
    fileUrl,
    fileName,
  };

  const next = [announcement, ...announcements];
  await fs.writeFile(DATA_FILE, JSON.stringify(next, null, 2), 'utf8');

  return announcement;
}
