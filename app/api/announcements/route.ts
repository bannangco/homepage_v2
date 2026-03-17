import { NextResponse } from 'next/server';
import { createAnnouncement, getAnnouncements } from '@/lib/repositories/announcements/repository';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export async function GET() {
  try {
    const announcements = await getAnnouncements();
    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Failed to load announcements', error);
    return NextResponse.json(
      { message: '공지사항을 불러오지 못했습니다.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title');
    const content = formData.get('content');
    const file = formData.get('file');

    if (typeof title !== 'string' || typeof content !== 'string' || !title || !content) {
      return NextResponse.json(
        { message: '제목과 내용을 입력해주세요.' },
        { status: 400 },
      );
    }

    if (file && file instanceof File && file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { message: '파일 크기는 10MB를 초과할 수 없습니다.' },
        { status: 400 },
      );
    }

    const announcement = await createAnnouncement({
      title,
      content,
      file: file instanceof File ? file : null,
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    console.error('Failed to create announcement', error);
    return NextResponse.json(
      { message: '공지사항 작성 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
