import type { MetadataRoute } from "next";

import { locales } from "@/i18n/locales";
import { siteUrl } from "@/lib/site";

const paths = ["", "/about"];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${siteUrl}/${locale}${path}`,
      alternates: {
        languages: Object.fromEntries(
          locales.map((it) => [it, `${siteUrl}/${it}${path}`]),
        ),
      },
    })),
  );
}
