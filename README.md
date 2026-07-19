# Bannangco Homepage

Bannangco(주식회사 반낭코) 공식 홈페이지입니다. Next.js App Router로 작성되며, 빌드 결과물은 서버 런타임이 필요 없는 정적 사이트로 내보냅니다.

## Stack

- Node.js 24 LTS
- Next.js 15, React 19, TypeScript
- Tailwind CSS 3
- 소스 관리되는 전자공고·법적 고지 데이터
- Cloudflare Workers Static Assets 정적 호스팅

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
npm run check:cloudflare
npm audit --omit=dev
npm audit
```

`npm run build`는 배포 가능한 정적 파일을 `out/`에 생성합니다. `npm run check:static`은 필수 경로와 정적 출력의 안전 조건을 확인합니다.

운영 사이트의 읽기 전용 검사는 `npm run check:production`으로 실행합니다. 상세 절차는 [production operations runbook](docs/production-operations.md), 정기·수동 모니터링 정의는 [Production Smoke workflow](.github/workflows/production-smoke.yml)를 참고합니다.

빌드 결과물을 로컬에서 미리 보려면 다음을 실행합니다.

```bash
npm run preview
```

미리보기 전에 `npm run build`가 완료되어 있어야 합니다.

## Legal notice content

`/announcements`는 회사 정보, 전자공고, 법적 문서를 한 페이지에서 구분해 제공합니다. 각 정보는 다음 source-controlled 데이터에서 관리합니다.

- 회사 정보와 Organization JSON-LD는 `lib/company-profile.ts`의 확인된 값만 사용합니다.
- 전자공고는 `data/announcements.json`에만 기록합니다. 목록, 상세 metadata, sitemap과 정적 상세 경로가 같은 검증 데이터를 사용합니다.
- 정관과 같은 독립 법적 문서는 `data/legal-documents.json`에만 기록하며 전자공고 record로 만들지 않습니다.
- 실제 공고나 공개 승인된 법적 문서가 없으면 두 배열은 `[]`을 유지합니다. 빈 배열은 정상적인 공개 상태이며 가짜 record나 sentinel route를 만들지 않습니다.
- 모든 `id`는 소문자 영문·숫자·하이픈으로 구성된 중복 없는 URL-safe slug입니다.
- PDF는 개인정보 및 공개 승인 여부를 검토한 원본만 `public/legal/` 아래에 lowercase ASCII 파일명으로 추가합니다. 데이터에는 `/legal/...pdf` 형식의 안전한 root-relative 경로만 선언할 수 있습니다.
- 법적 문서의 `kind`는 명시된 allowlist를 사용하고, `date`는 authoritative date가 확인된 경우에만 선택적으로 기록합니다. 파일명, mtime, 빌드 시각이나 법인 설립일에서 문서 날짜를 만들지 않습니다.
- 브라우저 기반 작성 기능, 업로드 API, CMS는 사용하지 않습니다.

Organization JSON-LD는 확인된 법인명, 브랜드명, 사이트 URL, 공식 로고, 설립일, 이메일 및 공식 GitHub·LinkedIn URL만 포함합니다. 주소, 전화번호, 대표자, 등록번호나 추정 정보는 포함하지 않습니다.

## Privacy policy operations

`/privacy`에 공개하는 승인된 개인정보 처리 사실은 `lib/privacy-policy.ts`에서 관리합니다. 정책 route와 집중 테스트는 이 값을 참조하며, route metadata는 `lib/site-metadata.ts`의 production origin과 공통 social metadata helper를 사용합니다.

- 현재 이메일 문의는 `bannangko@gmail.com`의 일반 무료 Gmail 계정으로 처리합니다. 사이트에는 문의 양식이 없으며 사용자가 자신의 이메일 client에서 문의를 보냅니다.
- 문의 정보는 문의 처리와 필요한 후속 연락 동안 보유하고, 처리 완료 후 최대 3년을 넘기지 않습니다. 완료일이 불명확하면 마지막 연락일을 기준으로 합니다. 3년은 반낭코의 내부 최장 보유 한도이며 모든 문의에 일률적으로 적용되는 법정 의무 기간이 아닙니다. 목적을 달성해 더 이상 필요하지 않으면 그보다 일찍 삭제합니다.
- Gmail 문의 기록은 적어도 연 1회 운영 검토하고, 보유 한도를 넘긴 기록은 삭제합니다. 다른 법률이 제한적인 보관을 요구하면 필요한 정보만 해당 기간 동안 분리해 보관합니다.
- Gmail, Cloudflare, 보유 기간 또는 개인정보 수집 방법이 바뀔 때마다 정책과 공개 문구를 다시 검토합니다. 문의 양식, 계정, 결제, 뉴스레터 또는 새로운 analytics를 추가하기 전에도 개인정보 검토를 먼저 수행합니다.
- Cloudflare Web Analytics는 Cloudflare 관리형 주입을 유지합니다. Application source에 analytics beacon, cookie banner 또는 consent SDK를 직접 추가하지 않습니다.
- 개인정보 관련 source에는 개인 전화번호, 정관 원문·추출 정보, 세무 신고 상태 또는 재무 정보를 기록하지 않습니다.
- P5-C는 repository의 정적 정책·검증 준비만 수행하며 production 배포, Cloudflare Dashboard 또는 DNS를 변경하지 않습니다.

## Service catalog and MusePicker treatment

홈페이지 서비스 사실과 표시 상태는 `data/services.ts`의 typed catalog에서 관리합니다. MusePicker의 `temporary-wordmark` presentation은 공식 로고가 아닌 임시 typography treatment이며 명시적으로 `official: false`입니다. 공식 로고가 제공되면 카드 구조를 변경하지 않고 이 항목의 presentation 설정 한 곳만 검증된 image asset으로 교체합니다. 임시 워드마크를 이미지나 Open Graph 이미지로 재사용하지 않습니다.

## Cloudflare Workers Static Assets production contract

기본 호스팅 대상은 Cloudflare Workers Static Assets이며 production domain은 `https://bannangco.com`입니다. Next.js는 계속 `output: "export"`로 빌드되고, repository root의 `wrangler.jsonc`가 별도 Worker runtime 없이 `out/`만 정적 자산으로 배포합니다. Apex custom domain `bannangco.com`은 이 설정 파일에 source-controlled route로 선언합니다. `www.bannangco.com`은 Worker custom domain으로 추가하지 않습니다.

Cloudflare Dashboard의 Workers Builds Git 연동에는 다음 값을 사용합니다.

- Production branch: `master`
- Build command: `npm run build && npm run check:static`
- Deploy command: `npm run deploy:cloudflare`
- Root directory / Path: repository root (`Path` 입력란은 비워 둠)
- Build variable: `NODE_VERSION=24`
- Output / assets directory: `out` (`wrangler.jsonc`의 `./out`)

`www.bannangco.com`에서 apex로 보내는 redirect는 Cloudflare zone-level Redirect Rules가 소유합니다. HTTP에서 HTTPS로의 전환은 Edge Certificates의 Always Use HTTPS가 소유합니다. 이 두 redirect는 path와 query string을 보존해야 합니다. 예를 들어 `http://www.bannangco.com/announcements?probe=p5b`는 redirect loop 없이 최대 두 번의 redirect로 `https://bannangco.com/announcements?probe=p5b`에 도달해야 합니다. Zone-level `www` redirect와 충돌하므로 `www.bannangco.com`을 `wrangler.jsonc`의 Worker custom domain에 추가하지 않습니다.

`workers_dev: false`와 `preview_urls: false`는 다음 성공적인 배포부터 `*.workers.dev`와 version preview URL을 비활성화합니다. HSTS는 HTTPS redirect와 인증서가 최소 1–2주 안정적으로 운영된 뒤 별도 승인으로 검토하며, 현재 repository 설정에는 포함하지 않습니다.

반드시 repository root의 committed `wrangler.jsonc`와 `npm run deploy:cloudflare`를 사용합니다. 설정 파일 없이 기본 `npx wrangler deploy`를 실행하면 Wrangler의 framework 자동 감지가 Next.js를 OpenNext SSR 앱으로 구성하고 정적 export에는 존재하지 않는 `.next/standalone`을 찾을 수 있습니다. 이 프로젝트에는 OpenNext, Worker runtime script 또는 Pages용 output 설정이 필요하지 않습니다. API token, account ID, secret 및 `.dev.vars`는 repository에 commit하지 않습니다.

로컬에서는 `npm run build`, `npm run check:static`, `npm run check:cloudflare`로 committed assets-only contract와 bundle을 credential 없이 검증할 수 있습니다. `public/_headers`는 빌드 시 `out/_headers`로 복사되어 보수적인 보안 헤더와 해시된 Next.js 정적 자산의 장기 immutable cache 정책을 선언합니다. Repository 검증은 생성된 파일과 정책을 확인하며, 실제 edge 적용은 배포 후 smoke check에서 별도로 확인합니다. 엄격한 Content Security Policy는 생성 결과와 함께 검증하기 전까지 적용하지 않습니다.

배포 후에는 다음을 직접 확인합니다.

- `https://bannangco.com/`, `/privacy`, `/announcements`, `/robots.txt`, `/sitemap.xml`이 `200`인지 확인
- 존재하지 않는 apex URL이 Bannangco custom 404 body와 함께 `404`를 반환하는지 확인
- apex/www 및 HTTP/HTTPS redirect가 path와 query string을 보존하고 loop 없이 canonical apex HTTPS에 도달하는지 확인
- canonical, Open Graph URL, sitemap과 robots가 `https://bannangco.com`을 사용하는지 확인
- security headers와 해시된 Next.js 정적 자산의 immutable cache header가 적용되는지 확인
- `*.workers.dev`와 preview URL이 더 이상 공개되지 않는지 확인

문제가 생기면 Cloudflare Workers Versions & Deployments에서 직전 검증 deployment/version으로 rollback하고, 필요하면 이 변경을 source revert한 뒤 다시 검증·배포합니다. Rollback과 재배포는 승인된 운영 작업으로 수행합니다.

Repository 검증은 committed Wrangler contract와 생성된 static bundle만 검사합니다. Cloudflare Dashboard의 Redirect Rules, Always Use HTTPS, 배포 상태, custom-domain 연결, DNS/MX/TXT record 또는 인증된 계정 상태를 설정하거나 보증하지 않습니다. 실제 배포와 Dashboard·DNS 변경은 별도 승인 후 수행합니다.

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
- `npm run check:cloudflare`: 배포 없이 Workers Static Assets bundle 검증
- `npm run check:production`: 운영 사이트의 읽기 전용 smoke 검사
- `npm run deploy:cloudflare`: 승인된 환경에서 committed Wrangler 설정으로 배포
- `npm run preview`: 생성된 `out/` 로컬 미리보기
