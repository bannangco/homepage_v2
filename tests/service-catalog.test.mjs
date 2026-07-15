import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { test } from "node:test";

import {
  endedServices,
  preparingServices,
  renewingServices,
  SERVICE_STATUSES,
  serviceCatalog,
  validateServiceCatalog,
} from "../data/services.ts";

const servicesById = new Map(
  serviceCatalog.map((service) => [service.id, service]),
);

function requireService(id) {
  const service = servicesById.get(id);
  assert.ok(service, `Missing service: ${id}`);
  return service;
}

test("contains exactly four uniquely identified services in the intended order", () => {
  const ids = serviceCatalog.map((service) => service.id);

  assert.deepEqual(ids, ["musepicker", "splash", "friending", "meetinggo"]);
  assert.equal(new Set(ids).size, 4);
  assert.doesNotThrow(() => validateServiceCatalog(serviceCatalog));
});

test("uses only supported statuses and preserves the verified status map", () => {
  const allowedStatuses = new Set(SERVICE_STATUSES);

  assert.equal(
    serviceCatalog.every((service) => allowedStatuses.has(service.status)),
    true,
  );
  assert.deepEqual(
    Object.fromEntries(
      serviceCatalog.map((service) => [service.id, service.status]),
    ),
    {
      musepicker: "preparing",
      splash: "renewing",
      friending: "ended",
      meetinggo: "ended",
    },
  );
});

test("derives disjoint lifecycle groups from the authoritative catalog", () => {
  const groups = [preparingServices, renewingServices, endedServices];
  const groupedServices = groups.flat();
  const groupedIds = groupedServices.map((service) => service.id);
  const catalogIds = serviceCatalog.map((service) => service.id);

  assert.deepEqual(
    preparingServices.map((service) => service.id),
    ["musepicker"],
  );
  assert.deepEqual(
    renewingServices.map((service) => service.id),
    ["splash"],
  );
  assert.deepEqual(
    endedServices.map((service) => service.id),
    ["friending", "meetinggo"],
  );

  assert.equal(
    preparingServices.every((service) => service.status === "preparing"),
    true,
  );
  assert.equal(
    renewingServices.every((service) => service.status === "renewing"),
    true,
  );
  assert.equal(
    endedServices.every((service) => service.status === "ended"),
    true,
  );

  assert.equal(groupedServices.length, serviceCatalog.length);
  assert.equal(new Set(groupedIds).size, groupedIds.length);
  assert.deepEqual(groupedIds.toSorted(), catalogIds.toSorted());

  for (const service of serviceCatalog) {
    assert.equal(
      groupedServices.filter((candidate) => candidate === service).length,
      1,
      `Service ${service.id} must be derived exactly once without cloning.`,
    );
  }
});

test("keeps MusePicker as an unlaunched temporary typography treatment", () => {
  const musePicker = requireService("musepicker");

  assert.equal(musePicker.name, "MusePicker");
  assert.equal(
    musePicker.description,
    "미국의 박물관·미술관·예술 탐색을 위한 AI 기반 메타검색 서비스",
  );
  assert.equal(musePicker.status, "preparing");
  assert.equal(musePicker.statusLabel, "출시 준비 중");
  assert.equal(musePicker.periodLabel, null);
  assert.deepEqual(musePicker.metrics, []);
  assert.deepEqual(musePicker.links, []);
  assert.deepEqual(musePicker.presentation, {
    kind: "temporary-wordmark",
    official: false,
    text: "MusePicker",
  });
  assert.equal(JSON.stringify(musePicker).includes("종료"), false);
  assert.equal(JSON.stringify(musePicker).includes("workflow-01.png"), false);
});

test("preserves Splash period, renewing state, metrics, and Instagram link", () => {
  const splash = requireService("splash");

  assert.equal(splash.description, "국내 수상레저 통합 예약관리 플랫폼");
  assert.equal(splash.status, "renewing");
  assert.equal(splash.statusLabel, "운영 중단 · 리뉴얼 중");
  assert.equal(splash.periodLabel, "운영 기간 2024.04–2024.12");
  assert.deepEqual(splash.metrics, [
    { id: "monthly-visits", label: "월 방문", value: "3,000+" },
    { id: "official-partners", label: "공식 제휴처", value: "3곳" },
    { id: "instagram-reach", label: "Instagram 도달", value: "120만+" },
  ]);
  assert.deepEqual(splash.links, [
    {
      kind: "instagram",
      label: "Instagram",
      href: "https://www.instagram.com/splash.gram/",
    },
  ]);
});

test("keeps ended services on verified end-only dates and facts", () => {
  const friending = requireService("friending");
  const meetingGo = requireService("meetinggo");

  assert.deepEqual(
    {
      name: friending.name,
      description: friending.description,
      status: friending.status,
      statusLabel: friending.statusLabel,
      periodLabel: friending.periodLabel,
      metrics: friending.metrics,
      links: friending.links,
    },
    {
      name: "프렌딩",
      description: "관심사·취미 기반 20대 대학생 소셜 모임",
      status: "ended",
      statusLabel: "서비스 종료",
      periodLabel: "2025.04 종료",
      metrics: [
        { id: "sold-out-meetups", label: "모임 만석", value: "20회 이상" },
      ],
      links: [
        {
          kind: "instagram",
          label: "Instagram",
          href: "https://www.instagram.com/friending_official/",
        },
      ],
    },
  );
  assert.deepEqual(
    {
      name: meetingGo.name,
      description: meetingGo.description,
      status: meetingGo.status,
      statusLabel: meetingGo.statusLabel,
      periodLabel: meetingGo.periodLabel,
      metrics: meetingGo.metrics,
      links: meetingGo.links,
    },
    {
      name: "미팅GO",
      description: "대학생을 위한 안전하고 편리한 미팅 애플리케이션",
      status: "ended",
      statusLabel: "서비스 종료",
      periodLabel: "2025.04 종료",
      metrics: [],
      links: [
        {
          kind: "instagram",
          label: "Instagram",
          href: "https://www.instagram.com/meetinggo_official/",
        },
      ],
    },
  );
});

test("uses only verified HTTPS external links and excludes retired domains", () => {
  const links = serviceCatalog.flatMap((service) => service.links);

  assert.equal(links.every((link) => new URL(link.href).protocol === "https:"), true);
  assert.deepEqual(
    links.map((link) => link.href),
    [
      "https://www.instagram.com/splash.gram/",
      "https://www.instagram.com/friending_official/",
      "https://www.instagram.com/meetinggo_official/",
    ],
  );

  const serializedCatalog = JSON.stringify(serviceCatalog);
  assert.equal(serializedCatalog.includes("friending.so"), false);
  assert.equal(serializedCatalog.includes("meetinggo.kr"), false);
  assert.equal(serializedCatalog.includes("musepicker.com"), false);
  assert.equal(serializedCatalog.includes("2024.12 종료"), false);
});

test("references the three existing official logo images without importing them", async () => {
  const imagePresentations = serviceCatalog
    .map((service) => service.presentation)
    .filter((presentation) => presentation.kind === "image");

  assert.deepEqual(
    imagePresentations.map((presentation) => presentation.src),
    [
      "/images/workflow-splash.png",
      "/images/workflow-friending.png",
      "/images/workflow-meetinggo.png",
    ],
  );

  await Promise.all(
    imagePresentations.map((presentation) =>
      access(new URL(`../public${presentation.src}`, import.meta.url)),
    ),
  );
});

test("rejects duplicate IDs, unsupported statuses, insecure URLs, and invalid branding", () => {
  assert.throws(
    () =>
      validateServiceCatalog([
        ...serviceCatalog,
        { ...serviceCatalog[0] },
      ]),
    /Duplicate service id/,
  );

  assert.throws(
    () =>
      validateServiceCatalog([
        { ...serviceCatalog[0], status: "live" },
      ]),
    /invalid status/,
  );

  assert.throws(
    () =>
      validateServiceCatalog([
        {
          ...serviceCatalog[1],
          links: [
            {
              kind: "instagram",
              label: "Instagram",
              href: "http://www.instagram.com/splash.gram/",
            },
          ],
        },
      ]),
    /must use HTTPS/,
  );

  assert.throws(
    () =>
      validateServiceCatalog([
        {
          ...serviceCatalog[0],
          presentation: {
            ...serviceCatalog[0].presentation,
            official: true,
          },
        },
      ]),
    /must be marked official: false/,
  );
});
