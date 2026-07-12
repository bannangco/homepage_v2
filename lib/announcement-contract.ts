import type { Announcement } from "@/types/announcement";

export const ANNOUNCEMENT_ID_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type DateOnlyValidator = (value: string) => boolean;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isValidAnnouncementId(value: unknown): value is string {
  return typeof value === "string" && ANNOUNCEMENT_ID_PATTERN.test(value);
}

export function getAnnouncementPath(id: string): string {
  if (!isValidAnnouncementId(id)) {
    throw new TypeError(
      `Invalid announcement id ${JSON.stringify(id)}; expected a lowercase ASCII slug matching ${ANNOUNCEMENT_ID_PATTERN}.`,
    );
  }

  return `/announcements/${encodeURIComponent(id)}`;
}

export function validateAnnouncements(
  value: unknown,
  isValidDateOnly: DateOnlyValidator,
): Announcement[] {
  if (!Array.isArray(value)) {
    throw new TypeError("Announcement data must be an array.");
  }

  const ids = new Set<string>();

  value.forEach((item, index) => {
    if (!isRecord(item)) {
      throw new TypeError(`Announcement at index ${index} must be an object.`);
    }

    if (!isValidAnnouncementId(item.id)) {
      throw new TypeError(
        `Announcement at index ${index} has invalid id ${JSON.stringify(item.id)}; expected a lowercase ASCII slug matching ${ANNOUNCEMENT_ID_PATTERN}.`,
      );
    }

    if (ids.has(item.id)) {
      throw new TypeError(`Duplicate announcement id ${JSON.stringify(item.id)}.`);
    }
    ids.add(item.id);

    if (!isNonEmptyString(item.title)) {
      throw new TypeError(`Announcement ${JSON.stringify(item.id)} has an empty title.`);
    }

    if (!isNonEmptyString(item.summary)) {
      throw new TypeError(`Announcement ${JSON.stringify(item.id)} has an empty summary.`);
    }

    if (
      typeof item.createdAt !== "string" ||
      !isValidDateOnly(item.createdAt)
    ) {
      throw new TypeError(
        `Announcement ${JSON.stringify(item.id)} has invalid createdAt ${JSON.stringify(item.createdAt)}; expected a real ISO YYYY-MM-DD date.`,
      );
    }

    if (item.content !== undefined && typeof item.content !== "string") {
      throw new TypeError(
        `Announcement ${JSON.stringify(item.id)} has non-string content.`,
      );
    }

    if (item.document !== undefined) {
      if (
        !isRecord(item.document) ||
        !isNonEmptyString(item.document.href) ||
        !isNonEmptyString(item.document.label)
      ) {
        throw new TypeError(
          `Announcement ${JSON.stringify(item.id)} has an invalid document reference.`,
        );
      }
    }
  });

  return value as Announcement[];
}
