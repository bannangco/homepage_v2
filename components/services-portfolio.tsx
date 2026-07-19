import StaticImage from "@/components/ui/static-image";
import TemporaryMusePickerWordmark from "@/components/temporary-musepicker-wordmark";
import {
  endedServices,
  preparingServices,
  renewingServices,
} from "@/data/services";
import type { ServiceCatalogEntry, ServicePresentation } from "@/data/services";

const serviceLogoDisplayScale = {
  splash: "scale-[1.6] sm:scale-[1.9]",
  friending: "scale-[1.9]",
  meetinggo: "scale-[2]",
} as const;

function getServiceLogoDisplayScale(serviceId: ServiceCatalogEntry["id"]) {
  return serviceLogoDisplayScale[
    serviceId as keyof typeof serviceLogoDisplayScale
  ] ?? "";
}

function ServicePresentationAsset({
  presentation,
  imageClassName,
  decorative = false,
}: {
  presentation: ServicePresentation;
  imageClassName: string;
  decorative?: boolean;
}) {
  if (presentation.kind === "temporary-wordmark") return null;

  return (
    <StaticImage
      src={presentation.src}
      alt={decorative ? "" : presentation.alt}
      width={presentation.width}
      height={presentation.height}
      className={imageClassName}
    />
  );
}

function PreparingServiceHeading({ service }: { service: ServiceCatalogEntry }) {
  if (service.presentation.kind === "temporary-wordmark") {
    return (
      <TemporaryMusePickerWordmark
        headingId={`service-${service.id}`}
        text={service.presentation.text}
      />
    );
  }

  return (
    <h4
      id={`service-${service.id}`}
      className="break-words font-nacelle text-4xl font-semibold tracking-[-0.045em] sm:text-5xl"
    >
      {service.name}
    </h4>
  );
}

function serviceDataAttributes(service: ServiceCatalogEntry) {
  return {
    "data-service-id": service.id,
    "data-presentation-kind": service.presentation.kind,
    "data-official": String(service.presentation.official),
  } as const;
}

export default function ServicesPortfolio() {
  return (
    <section id="services" aria-labelledby="services-title" className="bg-ivory">
      <div className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="section-reveal mx-auto grid max-w-[80rem] gap-8 border-t border-border pt-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
          <p className="text-sm font-semibold text-ink-muted">
            Services / Portfolio
          </p>
          <div>
            <h2
              id="services-title"
              className="max-w-4xl break-keep font-nacelle text-4xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-6xl"
            >
              반낭코가 만들어 온 서비스와 프로젝트
            </h2>
            <p className="mt-6 max-w-2xl break-keep text-lg leading-8 text-ink-muted">
              준비 중인 시도와 리뉴얼 중인 제품, 종료된 프로젝트를 현재
              상태와 함께 분명하게 기록합니다.
            </p>
          </div>
        </div>
      </div>

      <section
        id="preparing"
        data-service-group="preparing"
        aria-labelledby="preparing-title"
        className="bg-ink px-5 py-14 text-ivory sm:px-8 sm:py-16 lg:px-12 lg:pb-16 lg:pt-20"
      >
        <div className="section-reveal mx-auto max-w-[80rem]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-signal">지금 준비하는 서비스</p>
              <h3
                id="preparing-title"
                className="mt-2 break-keep font-nacelle text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
              >
                다음 문화 경험을 준비하고 있습니다.
              </h3>
            </div>
            <span className="text-sm text-ivory/60">Preparing</span>
          </div>

          <div className="mt-8">
            {preparingServices.map((service) => (
              <article
                key={service.id}
                aria-labelledby={`service-${service.id}`}
                {...serviceDataAttributes(service)}
                className={`group relative overflow-hidden border border-grid bg-surface-dark transition duration-200 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-0.5 hover:border-signal/70 motion-reduce:transform-none motion-reduce:transition-none ${service.presentation.kind === "image" ? "grid lg:grid-cols-[minmax(0,1fr)_18rem]" : ""}`}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-12 top-1/2 hidden h-52 w-52 -translate-y-1/2 rounded-full border border-signal/25 transition-transform duration-200 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none lg:block"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-0 top-1/2 hidden h-px w-72 bg-gradient-to-r from-transparent via-signal/45 to-transparent lg:block"
                />

                <div className="relative flex max-w-3xl flex-col justify-between p-6 sm:p-8 lg:p-10">
                  <div>
                    <span className="inline-flex min-h-8 items-center bg-signal px-3 text-sm font-semibold text-ink">
                      {service.statusLabel}
                    </span>
                    <div className="mt-6">
                      <PreparingServiceHeading service={service} />
                    </div>
                    <p className="mt-5 max-w-xl break-keep text-lg leading-8 text-ivory/70">
                      {service.description}
                    </p>
                  </div>
                  <p className="mt-6 max-w-lg break-keep text-sm leading-6 text-ivory/50 [overflow-wrap:normal]">
                    출시를 준비하는 단계로, 공개 운영 이력과 외부 링크는
                    아직 없습니다.
                  </p>
                </div>

                {service.presentation.kind === "image" ? (
                  <div className="relative flex min-h-44 items-center justify-center overflow-hidden border-t border-grid bg-ink p-6 lg:min-h-full lg:border-l lg:border-t-0">
                    <ServicePresentationAsset
                      presentation={service.presentation}
                      imageClassName="h-auto max-h-40 w-auto max-w-full object-contain"
                    />
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="renewing"
        data-service-group="renewing"
        aria-labelledby="renewing-title"
        className="bg-ivory px-5 py-14 text-ink sm:px-8 sm:py-16 lg:px-12 lg:py-20"
      >
        <div className="section-reveal mx-auto max-w-[80rem]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink-muted">다시 설계하는 서비스</p>
              <h3
                id="renewing-title"
                className="mt-2 break-keep font-nacelle text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
              >
                운영을 멈추고 다음 형태를 준비합니다.
              </h3>
            </div>
            <span className="text-sm text-ink-muted">Renewing</span>
          </div>

          <div className="mt-8">
            {renewingServices.map((service) => (
              <article
                key={service.id}
                aria-labelledby={`service-${service.id}`}
                {...serviceDataAttributes(service)}
                className="group grid overflow-hidden border border-border bg-surface-light transition duration-200 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-0.5 hover:border-ink/60 focus-within:-translate-y-0.5 focus-within:border-ink motion-reduce:transform-none motion-reduce:transition-none lg:grid-cols-[17rem_minmax(0,1fr)]"
              >
                <div className="relative flex min-h-[12rem] items-center justify-center overflow-hidden border-b border-border bg-surface-dark p-6 lg:min-h-full lg:border-b-0 lg:border-r">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-5 top-1/3 h-px bg-ink/10 transition-transform duration-500 group-hover:translate-y-2 group-focus-within:translate-y-2 motion-reduce:transition-none"
                  />
                  <ServicePresentationAsset
                    presentation={service.presentation}
                    imageClassName={`relative h-auto max-h-36 w-auto max-w-[13rem] object-contain ${getServiceLogoDisplayScale(service.id)}`}
                  />
                </div>

                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex min-h-8 items-center border border-ink px-3 text-sm font-semibold">
                      {service.statusLabel}
                    </span>
                    {service.periodLabel ? (
                      <span className="text-sm text-ink-muted">
                        {service.periodLabel}
                      </span>
                    ) : null}
                  </div>

                  <h4
                    id={`service-${service.id}`}
                    className="mt-6 font-nacelle text-4xl font-semibold tracking-[-0.04em] sm:text-5xl"
                  >
                    {service.name}
                  </h4>
                  <p className="mt-4 break-keep text-lg leading-8 text-ink-muted">
                    {service.description}
                  </p>

                  {service.metrics.length > 0 ? (
                    <dl className="mt-7 grid grid-cols-2 border-y border-border sm:grid-cols-3">
                      {service.metrics.map((metric, index) => (
                        <div
                          key={metric.id}
                          className={`min-w-0 py-4 ${
                            index === 0
                              ? "border-r border-border pr-3 sm:px-4 sm:pl-0"
                              : index === 1
                                ? "pl-3 sm:border-r sm:border-border sm:px-4"
                                : "col-span-2 border-t border-border pt-4 sm:col-span-1 sm:border-t-0 sm:pl-4"
                          }`}
                        >
                          <dt className="break-keep text-xs text-ink-muted">
                            {metric.label}
                          </dt>
                          <dd className="mt-1 break-keep font-nacelle text-xl font-semibold sm:text-2xl">
                            {metric.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  <div className="mt-7">
                    {service.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-3 border-b border-ink pb-1 text-sm font-semibold outline-none transition-colors duration-200 hover:border-signal focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 motion-reduce:transition-none"
                      >
                        {link.label}에서 보기
                        <span aria-hidden="true">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="archive"
        data-service-group="archive"
        aria-labelledby="archive-title"
        className="bg-ivory-muted/70 px-5 py-14 text-ink sm:px-8 sm:py-16 lg:px-12 lg:py-20"
      >
        <div className="section-reveal mx-auto max-w-[80rem]">
          <div className="grid gap-5 border-b border-border pb-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
              <p className="text-sm font-semibold text-ink-muted">Service archive</p>
              <h3
                id="archive-title"
                className="mt-2 break-keep font-nacelle text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
              >
                종료된 서비스의 기록
              </h3>
            </div>
            <p className="max-w-md break-keep text-sm leading-6 text-ink-muted sm:text-right">
              각 행을 열어 프로젝트의 설명과 확인된 성과를 볼 수 있습니다.
            </p>
          </div>

          <div className="border-b border-border">
            {endedServices.map((service) => (
              <details
                key={service.id}
                aria-labelledby={`service-${service.id}`}
                {...serviceDataAttributes(service)}
                className="group border-t border-border first:border-t-0 focus-within:bg-surface-light/70"
              >
                <summary className="archive-summary grid min-h-20 cursor-pointer list-none grid-cols-[4.5rem_minmax(0,1fr)_2.75rem] items-center gap-3 py-4 outline-none transition-colors duration-200 hover:bg-surface-light/70 focus-visible:bg-surface-light focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink motion-reduce:transition-none [&::-webkit-details-marker]:hidden sm:gap-4 sm:px-4">
                  <span className="flex h-14 w-[4.5rem] items-center justify-center overflow-hidden border border-grid bg-surface-dark">
                    <ServicePresentationAsset
                      presentation={service.presentation}
                      decorative
                      imageClassName={`h-auto max-h-10 w-auto max-w-full object-contain ${getServiceLogoDisplayScale(service.id)}`}
                    />
                  </span>
                  <span className="min-w-0 sm:grid sm:grid-cols-[minmax(8rem,1fr)_auto_auto] sm:items-center sm:gap-6">
                    <span
                      id={`service-${service.id}`}
                      className="font-nacelle text-xl font-semibold tracking-[-0.02em] sm:text-2xl"
                    >
                      {service.name}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 sm:mt-0 sm:contents">
                      <span className="text-xs font-semibold sm:text-sm">
                        {service.statusLabel}
                      </span>
                      <span className="text-xs text-ink-muted sm:text-sm">
                        {service.periodLabel}
                      </span>
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="archive-disclosure flex h-11 w-11 items-center justify-center transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="square"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </summary>

                <div className="archive-body grid gap-5 border-t border-border/70 px-3 pb-7 pt-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-4">
                  <div>
                    <p className="max-w-2xl break-keep leading-7 text-ink-muted">
                      {service.description}
                    </p>
                    {service.metrics.length > 0 ? (
                      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                        {service.metrics.map((metric) => (
                          <div key={metric.id} className="flex items-baseline gap-2">
                            <dt className="text-sm text-ink-muted">{metric.label}</dt>
                            <dd className="font-semibold">{metric.value}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                  </div>
                  <div className="sm:self-end">
                    {service.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-3 border-b border-ink pb-1 text-sm font-semibold outline-none transition-colors duration-200 hover:border-signal focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 motion-reduce:transition-none"
                      >
                        {link.label}에서 보기
                        <span aria-hidden="true">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
