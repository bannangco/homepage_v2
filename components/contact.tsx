export default function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="bg-signal px-5 py-16 text-ink sm:px-8 sm:py-20 lg:px-12 lg:py-24"
    >
      <div className="section-reveal mx-auto grid max-w-[80rem] gap-8 border-y border-ink/30 py-8 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,1fr)] lg:gap-16 lg:py-12">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-ink/70">
          CONTACT
        </p>

        <div>
          <h2
            id="contact-title"
            className="max-w-4xl break-keep font-nacelle text-4xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-6xl"
          >
            다음 문화 경험을 함께 이야기해요.
          </h2>
          <a
            href="mailto:bannangko@gmail.com"
            className="group mt-8 inline-flex min-h-12 items-center gap-4 border-b border-ink pb-1 text-base font-semibold outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 focus-visible:ring-offset-signal motion-reduce:transform-none motion-reduce:transition-none sm:text-lg"
          >
            bannangko@gmail.com
            <span
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
              aria-hidden="true"
            >
              ↗
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
