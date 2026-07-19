import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PRIVACY_POLICY_FACTS } from "@/lib/privacy-policy";
import {
  createSocialMetadata,
  PRIVACY_POLICY_DESCRIPTION,
  PRIVACY_POLICY_PATH,
  PRIVACY_POLICY_TITLE,
} from "@/lib/site-metadata";
import { formatDateYYYYMMDD } from "@/utils/formatDate";

export const metadata: Metadata = {
  title: PRIVACY_POLICY_TITLE,
  description: PRIVACY_POLICY_DESCRIPTION,
  alternates: {
    canonical: PRIVACY_POLICY_PATH,
  },
  ...createSocialMetadata(
    PRIVACY_POLICY_TITLE,
    PRIVACY_POLICY_DESCRIPTION,
    PRIVACY_POLICY_PATH,
  ),
};

const paragraphClassName =
  "break-keep text-base leading-7 text-ink-muted [overflow-wrap:normal]";
const listClassName =
  "list-disc space-y-2 pl-5 text-base leading-7 text-ink-muted marker:text-signal";
const referenceLinkClassName =
  "block min-h-11 max-w-full border-b border-border py-2 text-sm text-ink outline-none transition-colors hover:border-ink hover:text-ink-muted focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 focus-visible:ring-offset-ivory motion-reduce:transition-none";

type PolicySectionProps = {
  index: string;
  id: string;
  title: string;
  children: ReactNode;
};

function PolicySection({ index, id, title, children }: PolicySectionProps) {
  const headingId = `${id}-title`;

  return (
    <section
      id={id}
      data-privacy-section={id}
      aria-labelledby={headingId}
      className="grid gap-6 border-b border-border py-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10 lg:py-14"
    >
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-muted">
          Policy / {index}
        </p>
        <h2
          id={headingId}
          className="mt-3 break-keep font-nacelle text-2xl font-semibold leading-tight tracking-[-0.025em] text-ink [overflow-wrap:normal] sm:text-3xl"
        >
          {title}
        </h2>
      </div>
      <div className="min-w-0 space-y-5">{children}</div>
    </section>
  );
}

function ReferenceLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className={referenceLinkClassName}>
      <span className="block break-keep font-semibold [overflow-wrap:normal]">
        {label}
      </span>
      <span
        className="mt-1 block break-all font-mono text-xs text-ink-muted [overflow-wrap:anywhere]"
        aria-hidden="true"
      >
        {href}
      </span>
    </a>
  );
}

export default function PrivacyPage() {
  const { cloudflare, emailService, inquiryRetention } = PRIVACY_POLICY_FACTS;

  return (
    <div
      data-privacy-page="true"
      className="relative isolate w-full overflow-hidden bg-ivory px-5 pb-24 pt-36 text-ink sm:px-6 lg:pb-32 lg:pt-44"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-px bg-grid"
        aria-hidden="true"
      />
      <div className="mx-auto max-w-6xl border-x border-grid bg-ivory px-5 sm:px-8 lg:px-12">
        <header className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end lg:pb-14">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
              Privacy policy / 01
            </p>
            <h1
              aria-label="개인정보처리방침"
              className="mt-5 max-w-4xl break-keep font-nacelle text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-ink [overflow-wrap:normal] sm:text-5xl lg:text-7xl"
            >
              <span aria-hidden="true">
                개인정보
                <br className="sm:hidden" />
                처리방침
              </span>
            </h1>
          </div>
          <p className="break-keep border-t border-border pt-4 text-sm leading-6 text-ink-muted [overflow-wrap:normal] lg:border-t-0 lg:pt-0">
            이메일 문의와 사이트 제공 과정에서 처리될 수 있는 정보를 실제
            운영 방식에 맞춰 설명합니다.
          </p>
        </header>

        <dl className="grid border-b border-border sm:grid-cols-3">
          <div className="border-b border-border py-5 sm:border-b-0 sm:pr-6">
            <dt className="text-xs font-semibold text-ink-muted">개인정보처리자</dt>
            <dd className="mt-2 break-keep text-base font-semibold [overflow-wrap:normal]">
              {PRIVACY_POLICY_FACTS.controller}
            </dd>
          </div>
          <div className="border-b border-border py-5 sm:border-b-0 sm:border-l sm:px-6">
            <dt className="text-xs font-semibold text-ink-muted">대표자</dt>
            <dd className="mt-2 break-keep text-base font-semibold [overflow-wrap:normal]">
              {PRIVACY_POLICY_FACTS.representative}
            </dd>
          </div>
          <div className="py-5 sm:border-l sm:pl-6">
            <dt className="text-xs font-semibold text-ink-muted">시행일</dt>
            <dd className="mt-2 text-base font-semibold">
              <time dateTime={PRIVACY_POLICY_FACTS.effectiveDate}>
                {formatDateYYYYMMDD(PRIVACY_POLICY_FACTS.effectiveDate)}
              </time>
            </dd>
          </div>
        </dl>

        <PolicySection index="01" id="privacy-overview" title="개인정보처리방침 개요">
          <p className={paragraphClassName}>
            {PRIVACY_POLICY_FACTS.controller}는 이메일 문의 응대와 웹사이트
            제공 과정에서 처리될 수 있는 개인정보를 이 방침에 따라
            관리합니다.
          </p>
          <p className={paragraphClassName}>
            이 웹사이트에는 문의 양식, 회원 계정·로그인, 결제, 뉴스레터,
            이용자 데이터베이스가 없습니다. 이용자는 자신의 이메일
            클라이언트에서 반낭코의 공개 이메일 주소로 직접 문의합니다.
          </p>
        </PolicySection>

        <PolicySection
          index="02"
          id="privacy-items"
          title="처리하는 개인정보 항목 및 수집 방법"
        >
          <p className={paragraphClassName}>
            이메일 문의 과정에서 이용자가 자발적으로 제공하는 다음 정보가
            처리될 수 있습니다. 모든 항목이 항상 필수인 것은 아닙니다.
          </p>
          <ul className={listClassName}>
            <li className="break-keep [overflow-wrap:normal]">이름 또는 표시 이름</li>
            <li className="break-keep [overflow-wrap:normal]">발신 이메일 주소</li>
            <li className="break-keep [overflow-wrap:normal]">이메일 제목과 본문</li>
            <li className="break-keep [overflow-wrap:normal]">이용자가 첨부한 파일</li>
            <li className="break-keep [overflow-wrap:normal]">
              기본 송수신 시각과 메시지 전송 메타데이터
            </li>
          </ul>
          <p className={paragraphClassName}>
            웹사이트 자체가 문의 양식을 통해 이 정보를 수집하지 않습니다.
            애플리케이션 소스는 의도적으로 first-party 쿠키를 설정하지
            않습니다.
          </p>
        </PolicySection>

        <PolicySection index="03" id="privacy-purpose" title="개인정보 처리 목적">
          <ul className={listClassName}>
            <li className="break-keep [overflow-wrap:normal]">문의의 접수와 식별</li>
            <li className="break-keep [overflow-wrap:normal]">문의에 대한 답변</li>
            <li className="break-keep [overflow-wrap:normal]">필요한 후속 연락</li>
            <li className="break-keep [overflow-wrap:normal]">
              문의 이력 유지와 분쟁 처리
            </li>
          </ul>
        </PolicySection>

        <PolicySection index="04" id="privacy-retention" title="보유 및 이용 기간">
          <p className={paragraphClassName}>
            문의 정보는 문의 처리와 필요한 후속 연락이 진행되는 동안
            보유하며, 처리가 완료된 뒤 {inquiryRetention.maximumYears}년을 넘지
            않는 범위에서 관리합니다. 완료일이 명확하지 않으면 마지막
            연락일을 기준으로 최장 보유기간을 계산합니다.
          </p>
          <p className={paragraphClassName}>
            이 {inquiryRetention.maximumYears}년은 반낭코가 정한 내부 최장 보유
            한도이며, 모든 문의에 일률적으로 적용되는 법정 의무 기간을
            의미하지 않습니다. 처리 목적이 달성되고 정보가 더 이상 필요하지
            않으면 더 일찍 삭제합니다.
          </p>
          <p className={paragraphClassName}>
            다른 법률이 제한적인 보관을 요구하는 경우에는 필요한 정보만
            분리하여 해당 기간 동안 보관한 뒤 삭제합니다.
          </p>
        </PolicySection>

        <PolicySection index="05" id="privacy-destruction" title="파기 절차 및 방법">
          <p className={paragraphClassName}>
            보유 목적이 달성되어 정보가 더 이상 필요하지 않거나 보유기간이
            끝난 경우, 회사가 관리하는 이메일과 첨부파일을 확인하여 삭제
            처리합니다.
          </p>
          <p className={paragraphClassName}>
            삭제 요청을 받으면 다른 법률이 제한적인 보관을 요구하는 경우를
            제외하고 부당한 지체 없이 회사의 관리 범위에서 삭제합니다. 법률상
            보관이 필요한 정보는 다른 문의 기록과 분리하여 필요한 기간에만
            보관합니다.
          </p>
        </PolicySection>

        <PolicySection index="06" id="privacy-third-parties" title="제3자 제공 여부">
          <p className={paragraphClassName}>
            반낭코는 문의 정보를 독립적인 제3자의 자체 목적을 위해 제공하는
            방식으로 운영하지 않습니다. 법률상 의무가 발생하는 경우에는 해당
            의무를 이행하는 데 필요한 범위의 정보만 처리합니다.
          </p>
          <p className={paragraphClassName}>
            문의 수신과 사이트 제공에 이용하는 외부 이메일·인프라 서비스는
            아래에서 별도로 설명합니다.
          </p>
        </PolicySection>

        <PolicySection
          index="07"
          id="privacy-external-services"
          title="외부 이메일·인프라 서비스 이용"
        >
          <div className="border-l-2 border-signal pl-5">
            <h3 className="break-keep font-semibold [overflow-wrap:normal]">
              외부 이메일 서비스
            </h3>
            <dl className="mt-4 grid gap-4 text-sm leading-6 text-ink-muted sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-ink">제공자</dt>
                <dd>{emailService.provider}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">서비스</dt>
                <dd>{emailService.service}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-semibold text-ink">이용 목적</dt>
                <dd className="break-keep [overflow-wrap:normal]">
                  문의 이메일의 수신, 저장, 검색과 답변
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-semibold text-ink">처리될 수 있는 정보</dt>
                <dd className="break-keep [overflow-wrap:normal]">
                  발신자 이름, 이메일 주소, 제목, 본문, 첨부파일과 전송
                  메타데이터
                </dd>
              </div>
            </dl>
          </div>
          <p className={paragraphClassName}>
            이메일을 보내고 받는 과정에서 해당 정보가 네트워크를 통해
            처리됩니다. Google의 고정 보유기간이나 특정 저장 국가를 임의로
            정해 설명하지 않습니다.
          </p>
          <ReferenceLink
            href={emailService.privacyPolicyUrl}
            label="Google 개인정보처리방침"
          />

          <div className="border-l-2 border-border pl-5">
            <h3 className="break-keep font-semibold [overflow-wrap:normal]">
              Cloudflare 제공 인프라
            </h3>
            <p className={`mt-3 ${paragraphClassName}`}>
              사이트 전송에는 Cloudflare Workers Static Assets, CDN, TLS와
              보안 인프라가 사용됩니다. 이 전달 인프라와 아래의 Web Analytics
              기능은 서로 구분하여 설명합니다.
            </p>
          </div>
          <ReferenceLink
            href={cloudflare.customerDpaUrl}
            label="Cloudflare 데이터 처리 관련 공개 문서"
          />
        </PolicySection>

        <PolicySection index="08" id="privacy-overseas" title="국외 처리 가능성">
          <p className={paragraphClassName}>
            이메일 송수신에는 외부 이메일 서비스가 사용되며, Cloudflare는
            분산 네트워크를 통해 사이트와 분석 데이터를 처리합니다. 따라서
            문의 정보나 사이트 이용 관련 정보가 이용자의 국가와 다른 국가
            또는 지역에서 처리될 수 있습니다.
          </p>
          <p className={paragraphClassName}>
            특정 저장 국가나 데이터센터 위치를 추정하지 않습니다. 이용자는
            이메일을 보내기 전에 문의에 필요한 정보만 선택해 제공할 수
            있습니다.
          </p>
        </PolicySection>

        <PolicySection
          index="09"
          id="privacy-analytics"
          title="Cloudflare Web Analytics 및 자동 수집 기술"
        >
          <p className={paragraphClassName}>
            Cloudflare Web Analytics는 Cloudflare가 관리하는 자동 주입 방식으로
            활성화되어 있습니다. 애플리케이션 소스는 별도의 analytics beacon을
            직접 추가하지 않습니다.
          </p>
          <p className={paragraphClassName}>
            페이지 경로, 유입 경로(referrer), 페이지 로드 식별자, 로딩 시간,
            navigation·resource·paint timing과 FCP·LCP·CLS·TTFB·INP 등의 Web
            Vitals가 처리될 수 있습니다. Cloudflare 공식 문서에 따르면 Web
            Analytics는 query string을 기록하지 않습니다.
          </p>
          <p className={paragraphClassName}>
            이 RUM 기능은 쿠키, localStorage, sessionStorage 또는 IndexedDB에
            데이터를 저장하거나 그 저장소의 데이터를 읽지 않습니다. HTTP
            처리 과정에서 Cloudflare가 접속 IP 주소를 수신할 수 있으나,
            Cloudflare의 공식 설명에 따르면 가까운 데이터센터에서 폐기되고
            Web Analytics의 핵심 데이터베이스나 로그에는 저장되지 않습니다.
          </p>
          <p className={paragraphClassName}>
            Cloudflare 공식 문서상 비표본 beacon 데이터는
            {` ${cloudflare.unsampledRetentionDays}일`} 동안 보관되며, 이후 일부
            데이터가 원본 규모의 약 {cloudflare.longTermAggregatePercentage}%로
            집계되어 장기 저장됩니다. Web Analytics에서는 최근
            {` ${cloudflare.accessibleHistoryMonths}개월`} 데이터를 조회할 수
            있습니다. 집계 데이터의 최종 삭제 시점은 공개 문서에서 특정되지
            않습니다.
          </p>
          <p className={paragraphClassName}>
            현재 확인된 분석 구성은 위 browser storage를 사용하지 않으므로
            별도의 쿠키 배너나 consent SDK를 추가하지 않습니다. 수집 방식이나
            분석 도구가 바뀌면 이 방침과 필요한 이용자 안내를 다시 검토합니다.
          </p>
          <div className="space-y-3">
            <ReferenceLink
              href={cloudflare.rumBeaconUrl}
              label="Cloudflare RUM beacon 문서"
            />
            <ReferenceLink
              href={cloudflare.webAnalyticsFaqUrl}
              label="Cloudflare Web Analytics FAQ"
            />
          </div>
        </PolicySection>

        <PolicySection
          index="10"
          id="privacy-rights"
          title="정보주체의 권리와 행사 방법"
        >
          <p className={paragraphClassName}>
            이용자는 자신이 보낸 문의 정보의 확인, 정정, 삭제 또는 처리 중지를
            아래 이메일로 요청할 수 있습니다. 반낭코는 요청자를 확인하는 데
            필요한 최소한의 정보만 확인하고 요청을 처리합니다.
          </p>
          <p className={paragraphClassName}>
            다른 법률이 제한적인 보관을 요구하는 경우에는 그 사유와 범위를
            안내하고, 그 밖의 정보는 부당한 지체 없이 처리합니다.
          </p>
        </PolicySection>

        <PolicySection
          index="11"
          id="privacy-contact"
          title="개인정보 보호책임자 및 문의처"
        >
          <dl className="grid gap-5 border-y border-border py-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-ink-muted">
                개인정보 보호책임자
              </dt>
              <dd className="mt-2 break-keep text-lg font-semibold [overflow-wrap:normal]">
                {PRIVACY_POLICY_FACTS.privacyOfficer}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-ink-muted">이메일</dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${PRIVACY_POLICY_FACTS.contactEmail}`}
                  className="inline-flex min-h-11 max-w-full items-center break-all border-b border-ink text-lg font-semibold outline-none transition-colors hover:border-signal hover:text-ink-muted focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 focus-visible:ring-offset-ivory motion-reduce:transition-none"
                >
                  {PRIVACY_POLICY_FACTS.contactEmail}
                </a>
              </dd>
            </div>
          </dl>
        </PolicySection>

        <PolicySection index="12" id="privacy-safeguards" title="안전성 확보 조치">
          <p className={paragraphClassName}>
            반낭코는 개인정보를 관리하는 범위에서 다음 원칙을 운영 기준으로
            둡니다.
          </p>
          <ul className={listClassName}>
            <li className="break-keep [overflow-wrap:normal]">
              문의 기록에 대한 접근을 업무상 필요한 범위로 제한
            </li>
            <li className="break-keep [overflow-wrap:normal]">
              이메일 계정 인증정보를 공개 source repository에 저장하지 않음
            </li>
            <li className="break-keep [overflow-wrap:normal]">
              문의 기록과 보유기간을 적어도 연 1회 검토하고 한도를 넘긴 기록을
              삭제
            </li>
            <li className="break-keep [overflow-wrap:normal]">
              공개 source repository에 문의 내용이나 개인 연락 정보를 저장하지
              않음
            </li>
          </ul>
        </PolicySection>

        <PolicySection index="13" id="privacy-effective-date" title="시행일">
          <div className="flex items-center gap-4 border-l-4 border-signal bg-surface-light px-5 py-5">
            <span className="h-2 w-2 shrink-0 bg-signal" aria-hidden="true" />
            <p className="break-keep font-semibold [overflow-wrap:normal]">
              이 개인정보처리방침은{" "}
              <time dateTime={PRIVACY_POLICY_FACTS.effectiveDate}>
                {formatDateYYYYMMDD(PRIVACY_POLICY_FACTS.effectiveDate)}
              </time>
              부터 시행합니다.
            </p>
          </div>
        </PolicySection>
      </div>
    </div>
  );
}
