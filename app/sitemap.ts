import type { MetadataRoute } from "next";

import { getAnnouncements } from "@/lib/announcements";
import { isValidISODateOnly } from "@/utils/formatDate";

const SITE_URL = "https://bannangco.com";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/announcements`,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  const announcementRoutes: MetadataRoute.Sitemap = getAnnouncements().map(
    (announcement) => {
      const route: MetadataRoute.Sitemap[number] = {
        url: `${SITE_URL}/announcements/${encodeURIComponent(announcement.id)}`,
        changeFrequency: "yearly",
        priority: 0.4,
      };

      if (isValidISODateOnly(announcement.createdAt)) {
        route.lastModified = announcement.createdAt;
      }

      return route;
    },
  );

  return [...routes, ...announcementRoutes];
}
