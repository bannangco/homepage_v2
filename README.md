# Bannangco Homepage

Bannangco(주식회사 반낭코) 공식 홈페이지입니다. Next.js App Router로 작성되며, 빌드 결과물은 서버 런타임이 필요 없는 정적 사이트로 내보냅니다.

## Stack

- Node.js 24 LTS
- Next.js 15, React 19, TypeScript
- Tailwind CSS 3
- 소스 관리되는 전자공고·법적 고지 데이터
- Cloudflare Pages 정적 호스팅

인증, 데이터베이스, 서버 API, Firebase, CMS, 파일 업로드 기능은 사용하지 않습니다.

## Local development

```bash
npm ci
npm run dev
```

프로젝트가 지정하는 Node.js 버전은 `.node-version`과 `package.json`의 `engines`에서 확인할 수 있습니다.

## Verification

변경 사항을 검증하려면 다음 명령을 실행합니다.

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run check:static
npm audit --omit=dev
npm audit
```

`npm run build`는 배포 가능한 정적 파일을 `out/`에 생성합니다. `npm run check:static`은 필수 경로와 정적 출력의 안전 조건을 확인합니다.

빌드 결과물을 로컬에서 미리 보려면 다음을 실행합니다.

```bash
npm run preview
```

미리보기 전에 `npm run build`가 완료되어 있어야 합니다.

## Legal notice content

전자공고·법적 고지 데이터는 `data/announcements.json`에서 관리하며, `lib/announcements.ts`가 정렬과 조회를 담당합니다.

- 실제 문서와 정확한 날짜가 확인된 항목만 추가합니다.
- `id`는 소문자 영문·숫자·하이픈만 사용하는 URL-safe slug여야 하며 중복할 수 없습니다.
- 첨부 문서는 `public/` 아래의 검증된 정적 파일을 선택적 `document` 필드로 연결합니다.
- 목록과 상세 페이지는 같은 소스 데이터에서 정적으로 생성됩니다.
- 등록된 문서가 없는 상태도 정상적인 공개 상태입니다.
- 브라우저 기반 작성 기능, 업로드 API, CMS는 사용하지 않습니다.

## Service catalog and MusePicker treatment

홈페이지 서비스 사실과 표시 상태는 `data/services.ts`의 typed catalog에서 관리합니다. MusePicker의 `temporary-wordmark` presentation은 공식 로고가 아닌 임시 typography treatment이며 명시적으로 `official: false`입니다. 공식 로고가 제공되면 카드 구조를 변경하지 않고 이 항목의 presentation 설정 한 곳만 검증된 image asset으로 교체합니다. 임시 워드마크를 이미지나 Open Graph 이미지로 재사용하지 않습니다.

## Cloudflare Pages readiness

향후 Cloudflare Pages 프로젝트는 다음 설정을 사용합니다.

- Build command: `npm run build`
- Build output directory: `out`
- Production branch: `master`
- Node.js runtime: Node.js 24 LTS

이 저장소 변경은 정적 배포 준비만 수행합니다. Cloudflare Pages 프로젝트 생성, 프로덕션 배포, 배포 자격 증명 추가, DNS 변경 및 도메인 전환은 이 작업의 범위가 아닙니다.

`public/_headers`는 정적 호스팅에서 보수적인 보안 헤더와 해시된 Next.js 정적 자산의 장기 캐시 정책을 제공합니다. 엄격한 Content Security Policy는 생성 결과와 함께 별도로 검증하기 전까지 적용하지 않습니다.

## OCI static Nginx fallback

OCI는 정적 파일을 제공하는 선택적 대체 경로로만 유지합니다. 애플리케이션 서버나 상시 실행 Node.js 프로세스는 필요하지 않습니다.

1. Node.js 24 환경에서 `npm ci`, 검증 명령, `npm run build`, `npm run check:static`을 실행합니다.
2. 완성된 `out/`을 OCI 호스트의 `/var/www/bannangco-homepage/out/`과 통째로 교체합니다. 기존 디렉터리에 덮어써서 삭제된 경로를 남기지 않습니다.
3. `deploy/nginx/bannangco.com.conf`를 Nginx 사이트 설정으로 설치합니다.
4. `nginx -t`로 설정을 검증한 뒤 Nginx를 다시 불러옵니다.

Nginx 예시는 `out/`을 직접 제공하고, 확장자 없는 URL과 생성된 `404.html`을 처리하며, `/_next/static/`의 해시 자산을 immutable로 캐시합니다. TLS 인증서, OCI 네트워크 규칙, 프로덕션 파일 복사 및 DNS 구성은 운영 시 별도로 수행합니다.

## Useful commands

- `npm run dev`: 로컬 개발 서버
- `npm run lint`: ESLint 검사
- `npm run typecheck`: TypeScript 검사
- `npm test`: 집중 단위 테스트
- `npm run build`: `out/` 정적 내보내기 생성
- `npm run check:static`: 생성된 정적 결과 검증
- `npm run preview`: 생성된 `out/` 로컬 미리보기
