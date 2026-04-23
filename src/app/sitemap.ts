import type { MetadataRoute } from "next";
import { ARTICLES, DATE_MODIFIED } from "@/lib/learn/articles";

const SITE_URL = "https://unicode-viewer.appbatake.com";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const modified = new Date(DATE_MODIFIED);

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/learn`,
      lastModified: modified,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          en: `${SITE_URL}/learn`,
          ja: `${SITE_URL}/ja/learn`,
          "x-default": `${SITE_URL}/learn`,
        },
      },
    },
    {
      url: `${SITE_URL}/ja/learn`,
      lastModified: modified,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          en: `${SITE_URL}/learn`,
          ja: `${SITE_URL}/ja/learn`,
          "x-default": `${SITE_URL}/learn`,
        },
      },
    },
    {
      url: `${SITE_URL}/credits`,
      lastModified: modified,
      changeFrequency: "monthly",
      priority: 0.3,
      alternates: {
        languages: {
          en: `${SITE_URL}/credits`,
          ja: `${SITE_URL}/ja/credits`,
          "x-default": `${SITE_URL}/credits`,
        },
      },
    },
    {
      url: `${SITE_URL}/ja/credits`,
      lastModified: modified,
      changeFrequency: "monthly",
      priority: 0.3,
      alternates: {
        languages: {
          en: `${SITE_URL}/credits`,
          ja: `${SITE_URL}/ja/credits`,
          "x-default": `${SITE_URL}/credits`,
        },
      },
    },
  ];

  for (const article of ARTICLES) {
    const enUrl = `${SITE_URL}/learn/${article.slug}`;
    const jaUrl = `${SITE_URL}/ja/learn/${article.slug}`;
    const alternates = {
      languages: {
        en: enUrl,
        ja: jaUrl,
        "x-default": enUrl,
      },
    };
    entries.push({
      url: enUrl,
      lastModified: modified,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates,
    });
    entries.push({
      url: jaUrl,
      lastModified: modified,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates,
    });
  }

  return entries;
}
