export const SERVICE_STATUSES = ["preparing", "renewing", "ended"] as const;

export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  preparing: "출시 준비 중",
  renewing: "운영 중단 · 리뉴얼 중",
  ended: "서비스 종료",
};

export interface ServiceMetric {
  id: string;
  label: string;
  value: string;
}

export interface ServiceLink {
  kind: "instagram";
  label: string;
  href: string;
}

export interface TemporaryWordmarkPresentation {
  kind: "temporary-wordmark";
  official: false;
  text: string;
}

export interface ImagePresentation {
  kind: "image";
  official: true;
  src: string;
  width: number;
  height: number;
  alt: string;
}

export type ServicePresentation =
  | TemporaryWordmarkPresentation
  | ImagePresentation;

export interface ServiceCatalogEntry {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  statusLabel: string;
  periodLabel: string | null;
  presentation: ServicePresentation;
  metrics: readonly ServiceMetric[];
  links: readonly ServiceLink[];
}

const SERVICE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE_SOURCE_PATTERN = /^\/images\/[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
const serviceStatusSet = new Set<string>(SERVICE_STATUSES);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireNonEmptyString(
  value: unknown,
  field: string,
  serviceId: string,
): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`Service ${serviceId} has an empty ${field}.`);
  }
}

function validateMetrics(value: unknown, serviceId: string): void {
  if (!Array.isArray(value)) {
    throw new TypeError(`Service ${serviceId} metrics must be an array.`);
  }

  const metricIds = new Set<string>();

  value.forEach((metric, index) => {
    if (!isRecord(metric)) {
      throw new TypeError(`Service ${serviceId} metric ${index} must be an object.`);
    }

    requireNonEmptyString(metric.id, "metric id", serviceId);
    if (!SERVICE_ID_PATTERN.test(metric.id)) {
      throw new TypeError(`Service ${serviceId} has an invalid metric id: ${metric.id}.`);
    }
    if (metricIds.has(metric.id)) {
      throw new TypeError(`Service ${serviceId} has a duplicate metric id: ${metric.id}.`);
    }
    metricIds.add(metric.id);

    requireNonEmptyString(metric.label, `metric ${metric.id} label`, serviceId);
    requireNonEmptyString(metric.value, `metric ${metric.id} value`, serviceId);
  });
}

function validateLinks(value: unknown, serviceId: string): void {
  if (!Array.isArray(value)) {
    throw new TypeError(`Service ${serviceId} links must be an array.`);
  }

  value.forEach((link, index) => {
    if (!isRecord(link)) {
      throw new TypeError(`Service ${serviceId} link ${index} must be an object.`);
    }
    if (link.kind !== "instagram") {
      throw new TypeError(`Service ${serviceId} link ${index} has an invalid kind.`);
    }

    requireNonEmptyString(link.label, `link ${index} label`, serviceId);
    requireNonEmptyString(link.href, `link ${index} href`, serviceId);

    let url: URL;
    try {
      url = new URL(link.href);
    } catch {
      throw new TypeError(`Service ${serviceId} has an invalid external URL: ${link.href}.`);
    }
    if (url.protocol !== "https:") {
      throw new TypeError(`Service ${serviceId} external URLs must use HTTPS: ${link.href}.`);
    }
  });
}

function validatePresentation(value: unknown, serviceId: string): void {
  if (!isRecord(value)) {
    throw new TypeError(`Service ${serviceId} presentation must be an object.`);
  }

  if (value.kind === "temporary-wordmark") {
    if (value.official !== false) {
      throw new TypeError(
        `Service ${serviceId} temporary wordmark must be marked official: false.`,
      );
    }
    requireNonEmptyString(value.text, "temporary wordmark text", serviceId);
    return;
  }

  if (value.kind === "image") {
    if (value.official !== true) {
      throw new TypeError(
        `Service ${serviceId} image presentation must be marked official: true.`,
      );
    }
    if (typeof value.src !== "string" || !IMAGE_SOURCE_PATTERN.test(value.src)) {
      throw new TypeError(`Service ${serviceId} has an invalid local image source.`);
    }
    if (!Number.isInteger(value.width) || Number(value.width) <= 0) {
      throw new TypeError(`Service ${serviceId} has an invalid image width.`);
    }
    if (!Number.isInteger(value.height) || Number(value.height) <= 0) {
      throw new TypeError(`Service ${serviceId} has an invalid image height.`);
    }
    if (typeof value.alt !== "string") {
      throw new TypeError(`Service ${serviceId} image alt must be a string.`);
    }
    return;
  }

  throw new TypeError(`Service ${serviceId} has an invalid presentation kind.`);
}

export function validateServiceCatalog(
  value: unknown,
): asserts value is readonly ServiceCatalogEntry[] {
  if (!Array.isArray(value)) {
    throw new TypeError("Service catalog must be an array.");
  }

  const serviceIds = new Set<string>();

  value.forEach((service, index) => {
    if (!isRecord(service)) {
      throw new TypeError(`Service record ${index} must be an object.`);
    }

    requireNonEmptyString(service.id, "id", `record ${index}`);
    if (!SERVICE_ID_PATTERN.test(service.id)) {
      throw new TypeError(`Service record ${index} has an invalid id: ${service.id}.`);
    }
    if (serviceIds.has(service.id)) {
      throw new TypeError(`Duplicate service id: ${service.id}.`);
    }
    serviceIds.add(service.id);

    requireNonEmptyString(service.name, "name", service.id);
    requireNonEmptyString(service.description, "description", service.id);

    if (typeof service.status !== "string" || !serviceStatusSet.has(service.status)) {
      throw new TypeError(`Service ${service.id} has an invalid status.`);
    }
    const status = service.status as ServiceStatus;
    if (service.statusLabel !== SERVICE_STATUS_LABELS[status]) {
      throw new TypeError(
        `Service ${service.id} status label does not match ${status}.`,
      );
    }

    if (
      service.periodLabel !== null &&
      (typeof service.periodLabel !== "string" ||
        service.periodLabel.trim().length === 0)
    ) {
      throw new TypeError(`Service ${service.id} has an invalid period label.`);
    }

    validatePresentation(service.presentation, service.id);
    validateMetrics(service.metrics, service.id);
    validateLinks(service.links, service.id);
  });
}

export const serviceCatalog = [
  {
    id: "musepicker",
    name: "MusePicker",
    description:
      "미국의 박물관·미술관·예술 탐색을 위한 AI 기반 메타검색 서비스",
    status: "preparing",
    statusLabel: "출시 준비 중",
    periodLabel: null,
    presentation: {
      kind: "temporary-wordmark",
      official: false,
      text: "MusePicker",
    },
    metrics: [],
    links: [],
  },
  {
    id: "splash",
    name: "Splash",
    description: "국내 수상레저 통합 예약관리 플랫폼",
    status: "renewing",
    statusLabel: "운영 중단 · 리뉴얼 중",
    periodLabel: "운영 기간 2024.04–2024.12",
    presentation: {
      kind: "image",
      official: true,
      src: "/images/workflow-splash.png",
      width: 700,
      height: 576,
      alt: "Splash 로고",
    },
    metrics: [
      { id: "monthly-visits", label: "월 방문", value: "3,000+" },
      { id: "official-partners", label: "공식 제휴처", value: "3곳" },
      { id: "instagram-reach", label: "Instagram 도달", value: "120만+" },
    ],
    links: [
      {
        kind: "instagram",
        label: "Instagram",
        href: "https://www.instagram.com/splash.gram/",
      },
    ],
  },
  {
    id: "friending",
    name: "프렌딩",
    description: "관심사·취미 기반 20대 대학생 소셜 모임",
    status: "ended",
    statusLabel: "서비스 종료",
    periodLabel: "2025.04 종료",
    presentation: {
      kind: "image",
      official: true,
      src: "/images/workflow-friending.png",
      width: 700,
      height: 576,
      alt: "프렌딩 로고",
    },
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
  {
    id: "meetinggo",
    name: "미팅GO",
    description: "대학생을 위한 안전하고 편리한 미팅 애플리케이션",
    status: "ended",
    statusLabel: "서비스 종료",
    periodLabel: "2025.04 종료",
    presentation: {
      kind: "image",
      official: true,
      src: "/images/workflow-meetinggo.png",
      width: 700,
      height: 576,
      alt: "미팅GO 로고",
    },
    metrics: [],
    links: [
      {
        kind: "instagram",
        label: "Instagram",
        href: "https://www.instagram.com/meetinggo_official/",
      },
    ],
  },
] as const satisfies readonly ServiceCatalogEntry[];

validateServiceCatalog(serviceCatalog);

export const preparingServices: readonly ServiceCatalogEntry[] =
  serviceCatalog.filter((service) => service.status === "preparing");

export const renewingServices: readonly ServiceCatalogEntry[] =
  serviceCatalog.filter((service) => service.status === "renewing");

export const endedServices: readonly ServiceCatalogEntry[] =
  serviceCatalog.filter((service) => service.status === "ended");
