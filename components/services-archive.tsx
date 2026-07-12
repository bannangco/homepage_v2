import StaticImage from "@/components/ui/static-image";
import TemporaryMusePickerWordmark from "@/components/temporary-musepicker-wordmark";
import { serviceCatalog } from "@/data/services";
import type { ServicePresentation } from "@/data/services";

function ServiceBrand({
  presentation,
}: {
  presentation: ServicePresentation;
}) {
  if (presentation.kind === "temporary-wordmark") {
    return <TemporaryMusePickerWordmark text={presentation.text} />;
  }

  return (
    <StaticImage
      src={presentation.src}
      alt={presentation.alt}
      width={presentation.width}
      height={presentation.height}
      className="h-auto max-h-[20rem] w-auto max-w-full object-contain transition-transform duration-500 motion-safe:group-hover:scale-[1.025] motion-safe:group-focus-within:scale-[1.025] motion-reduce:transform-none"
    />
  );
}

export default function ServicesArchive() {
  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="bg-ivory px-5 py-24 sm:px-8 lg:px-12 lg:py-36"
    >
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-10 border-t border-border pt-5 lg:grid-cols-[18rem_1fr] lg:gap-16">
          <div>
            <p className="font-mono text-xs font-semibold tracking-[0.16em] text-ink-muted">
              SERVICES / ARCHIVE
            </p>
            <p className="mt-2 font-mono text-[0.6875rem] tracking-[0.12em] text-ink-muted">
              INDEX 01—04
            </p>
          </div>
          <div>
            <h2
              id="services-title"
              className="max-w-5xl break-keep font-nacelle text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-7xl"
            >
              반낭코가 만들어 온 서비스와 프로젝트
            </h2>
            <p className="mt-8 max-w-3xl break-keep text-lg leading-8 text-ink-muted">
              준비 중인 시도부터 각 프로젝트에서 확인된 성과까지, 문화
              경험을 기술로 풀어 온 과정을 현재 상태와 함께 기록합니다.
            </p>
          </div>
        </div>

        <ol className="mt-20 border-b border-border lg:mt-28">
          {serviceCatalog.map((service, index) => (
            <li
              key={service.id}
              className="group border-t border-border transition-colors hover:bg-surface-light focus-within:bg-surface-light"
            >
              <article
                aria-labelledby={`service-${service.id}`}
                data-service-id={service.id}
                data-presentation-kind={service.presentation.kind}
                data-official={String(service.presentation.official)}
                className="grid gap-8 py-8 lg:grid-cols-[5rem_minmax(0,0.85fr)_minmax(24rem,1.15fr)] lg:gap-10 lg:py-12"
              >
                <div className="flex items-start justify-between gap-4 lg:block">
                  <span className="font-mono text-xs text-ink-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[0.6875rem] tracking-[0.12em] text-ink-muted lg:mt-3 lg:block">
                    {service.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex min-w-0 flex-col">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                    <h3
                      id={`service-${service.id}`}
                      className="break-words font-nacelle text-4xl font-semibold tracking-[-0.04em] sm:text-5xl"
                    >
                      {service.name}
                    </h3>
                    <span className="border-l-2 border-signal pl-3 text-sm font-semibold text-ink">
                      {service.statusLabel}
                    </span>
                  </div>

                  {service.periodLabel ? (
                    <p className="mt-4 font-mono text-xs tracking-[0.08em] text-ink-muted">
                      {service.periodLabel}
                    </p>
                  ) : null}

                  <p className="mt-7 max-w-xl break-keep text-lg leading-8 text-ink-muted">
                    {service.description}
                  </p>

                  {service.metrics.length > 0 ? (
                    <dl className="mt-8 grid grid-cols-2 border-y border-border sm:grid-cols-3">
                      {service.metrics.map((metric) => (
                        <div
                          key={metric.id}
                          className="border-r border-border px-3 py-4 first:pl-0 last:border-r-0 sm:px-4"
                        >
                          <dt className="text-xs text-ink-muted">
                            {metric.label}
                          </dt>
                          <dd className="mt-1 break-keep font-nacelle text-xl font-semibold sm:text-2xl">
                            {metric.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  {service.links.length > 0 ? (
                    <div className="mt-8">
                      {service.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center gap-3 border-b border-ink pb-1 text-sm font-semibold transition-colors hover:border-signal hover:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                        >
                          {link.label}에서 보기
                          <span aria-hidden="true">↗</span>
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="signal-grid relative flex min-h-[18rem] items-center justify-center overflow-hidden border border-grid bg-surface-dark p-6 sm:min-h-[22rem] sm:p-10 lg:min-h-[25rem]">
                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-4 font-mono text-[0.625rem] tracking-[0.12em] text-ivory/40"
                  >
                    BRAND SIGNAL / {service.id.toUpperCase()}
                  </span>
                  <ServiceBrand presentation={service.presentation} />
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
