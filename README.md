# Homepage v2

Next.js(App Router) 기반 홈페이지 프로젝트입니다.

## 개발

```bash
npm install
npm run dev
```

## 공지사항 아키텍처

- UI 컴포넌트(`AnnouncementsContent`, `NewAnnouncementPage`)는 `/api/announcements`만 호출합니다.
- API 라우트는 `lib/repositories/announcements/repository.ts`를 통해 데이터 접근을 수행합니다.
- 공지사항 데이터는 서버 파일 시스템의 `data/announcements.json`에 저장됩니다.
- 첨부 파일은 `public/uploads/announcements`에 저장됩니다.

## 배포 (Oracle VM 기준)

1. Node.js LTS 설치
2. 소스 배포 후 의존성 설치
   ```bash
   npm ci
   ```
3. 프로덕션 빌드
   ```bash
   npm run build
   ```
4. PM2로 실행
   ```bash
   npm run start:pm2
   ```

### 유용한 스크립트

- `npm run build`: Next.js 프로덕션 빌드
- `npm run start`: 프로덕션 서버 실행
- `npm run start:pm2`: PM2로 서버 백그라운드 실행
- `npm run stop:pm2`: PM2 프로세스 종료

## 환경 변수

현재 Firebase 환경 변수는 사용하지 않습니다.

필요 시 일반적인 Next.js 서버 환경 변수(`PORT`, `NODE_ENV`)를 설정해 실행하세요.
