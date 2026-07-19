import type { MetadataRoute } from "next";

import { getAnnouncementPath } from "@/lib/announcement-contract";
import { getAnnouncements } from "@/lib/announcements";
import { PRIVACY_POLICY_PATH, SITE_URL } from "@/lib/site-metadata";

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
    {
      url: `${SITE_URL}${PRIVACY_POLICY_PATH}`,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  const announcementRoutes: MetadataRoute.Sitemap = getAnnouncements().map(
    (announcement) => {
      const route: MetadataRoute.Sitemap[number] = {
        url: `${SITE_URL}${getAnnouncementPath(announcement.id)}`,
        changeFrequency: "yearly",
        priority: 0.4,
        lastModified: announcement.createdAt,
      };

      return route;
    },
  );

  return [...routes, ...announcementRoutes];
}
