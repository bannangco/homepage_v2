# Homepage v2

Next.js(App Router) 기반 홈페이지 프로젝트입니다.

## 개발
# Bannangco Homepage v2

Bannangco(반낭코) 공식 홈페이지 프로젝트입니다.  
Next.js(App Router) 기반으로 제작되었으며, 회사 소개/주요 서비스/공지사항 화면을 제공합니다.

## 프로젝트 개요

- **프로젝트명**: Bannangco Homepage v2
- **목적**: 반낭코 브랜드/비전/서비스 및 공지사항을 웹으로 제공
- **기술 스택**: Next.js 15, React 19, TypeScript, Tailwind CSS, Firebase
- **기본 도메인**: `https://bannangco.com`

## 로컬 실행 방법

### 1) 요구 사항

- Node.js 20 이상 권장
- npm 10 이상 권장

### 2) 의존성 설치

```bash
npm install
```

### 3) 환경변수 설정

루트에 `.env.local` 파일을 생성하고 아래 값을 설정합니다.

```bash
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Optional
NEXT_PUBLIC_SITE_URL=https://bannangco.com
```

> `FIREBASE_ADMIN_PRIVATE_KEY`는 줄바꿈을 포함할 수 있으므로 배포 환경에서 이스케이프(`\\n`) 처리 여부를 확인하세요.

### 4) 개발 서버 실행

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
브라우저에서 `http://localhost:3000`으로 접속합니다.

## 배포 가이드 (오라클 서버 기준)

아래 절차는 Oracle Cloud Infrastructure(OCI) Ubuntu 서버를 기준으로 합니다.

### 1) 서버 준비

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
node -v
npm -v
```

### 2) 애플리케이션 배포

```bash
git clone <REPOSITORY_URL> bannangco-homepage-v2
cd bannangco-homepage-v2
npm ci
npm run build
```

### 3) 프로세스 매니저(PM2) 실행

```bash
sudo npm install -g pm2
pm2 start npm --name bannangco-homepage-v2 -- start
pm2 save
pm2 startup
```

### 4) Nginx 리버스 프록시

`/etc/nginx/sites-available/bannangco.com`

```nginx
server {
    listen 80;
    server_name bannangco.com www.bannangco.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

적용:

```bash
sudo ln -s /etc/nginx/sites-available/bannangco.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5) HTTPS 인증서(선택, 권장)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d bannangco.com -d www.bannangco.com
```

## 환경변수 목록

| 이름 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase 클라이언트 API 키 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase 인증 도메인 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase 스토리지 버킷 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase 메시징 발신자 ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase 앱 ID |
| `FIREBASE_ADMIN_PROJECT_ID` | Firebase Admin 프로젝트 ID |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Firebase Admin 클라이언트 이메일 |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Firebase Admin 개인 키 |
| `NEXT_PUBLIC_SITE_URL` | 사이트 기본 URL(선택) |

## 디렉토리 구조

```text
.
├── app/                        # App Router 엔트리
│   ├── (default)/              # 메인 랜딩 페이지
│   ├── announcements/          # 공지사항 페이지/생성 화면
│   ├── css/                    # 글로벌/추가 스타일
│   └── layout.tsx              # 루트 레이아웃 및 메타데이터
├── components/                 # UI/섹션 컴포넌트
├── lib/                        # 유틸리티 및 공통 로직
├── public/                     # 정적 파일(이미지/폰트)
├── firebase/                   # Firebase 관련 설정
├── package.json
└── README.md
```

## 스크립트

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm run start`: 프로덕션 서버 실행
- `npm run lint`: 린트 실행
- `npm run deploy`: 배포 스크립트 실행
