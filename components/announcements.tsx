import Link from "next/link";

import Reveal from "@/components/reveal";
import { getAnnouncements } from "@/lib/announcements";
import { formatDateYYYYMMDD } from "@/utils/formatDate";

export default function Announcements() {
  const latestAnnouncements = getAnnouncements().slice(0, 3);

  return (
    <section className="bg-white px-5 py-24 sm:px-6 lg:py-32" id="announcements">
      <div className="mx-auto max-w-7xl">
        <Reveal className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase text-teal-700">
              Notice
            </p>
            <h2 className="font-nacelle text-4xl font-semibold text-stone-950 md:text-6xl">
              회사 공고
            </h2>
            <Link
              href="/announcements"
              className="mt-8 inline-flex min-h-11 items-center rounded-lg border border-stone-300 px-5 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
            >
              모든 공고 보기
            </Link>
          </div>

          <div className="divide-y divide-stone-300 border-y border-stone-300">
            {latestAnnouncements.map((announcement) => (
              <Link
                key={announcement.id}
                href={`/announcements/${announcement.id}`}
                className="group grid gap-4 py-7 md:grid-cols-[8rem_1fr]"
              >
                <time className="text-sm text-stone-500">
                  {formatDateYYYYMMDD(announcement.createdAt)}
                </time>
                <div>
                  <h3 className="font-nacelle text-2xl font-semibold text-stone-950">
                    {announcement.title}
                  </h3>
                  <p className="mt-2 text-stone-600">
                    {announcement.summary}
                  </p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-teal-700 transition group-hover:translate-x-1">
                    자세히 보기
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
