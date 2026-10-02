import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Section } from "@/components/section";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/locales";
import { siteUrl } from "@/lib/site";

const repository = "https://github.com/Trafunky/tragni";

// The keys match the dictionary, so a renamed entry breaks the build instead of
// rendering an empty link.
const readingLinks = [
  { key: "repository", href: repository },
  { key: "architecture", href: `${repository}/tree/main/docs/architecture` },
  { key: "decisions", href: `${repository}/tree/main/docs/adr` },
  { key: "development", href: `${repository}/blob/main/docs/development.md` },
] as const;

// Not translated: product names stay as they are in every language.
const builtWith = [
  "C# / .NET",
  "TypeScript",
  "Next.js",
  "PostgreSQL",
  "Docker",
  "Traefik",
  "GitHub Actions",
  "Linux",
];

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = getDictionary(locale);

  return {
    title: t.meta.homeTitle,
    description: t.meta.homeDescription,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(locales.map((it) => [it, `/${it}`])),
    },
    openGraph: {
      type: "website",
      siteName: t.meta.siteName,
      title: t.meta.homeTitle,
      description: t.meta.homeDescription,
      url: `${siteUrl}/${locale}`,
      locale,
    },
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = getDictionary(locale);

  return (
    <>
      <h1 className="max-w-[19ch] font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-[2.625rem]">
        {t.home.title}
      </h1>

      <p className="mt-6 max-w-[36rem] text-lg text-muted">{t.home.lede}</p>

      <Section heading={t.home.idea.heading}>
        <p className="max-w-[36rem]">{t.home.idea.first}</p>
        <p className="mt-5 max-w-[36rem]">{t.home.idea.second}</p>
      </Section>

      <Section heading={t.home.status.heading}>
        <div className="grid gap-8 sm:grid-cols-2 sm:gap-10">
          <div>
            <h3 className="mb-3 text-[0.9375rem] font-semibold">
              {t.home.status.doneHeading}
            </h3>
            <ul className="space-y-2.5 text-[0.9375rem] leading-relaxed">
              {t.home.status.done.map((item) => (
                <li key={item} className="relative pl-6">
                  <span
                    aria-hidden
                    className="absolute left-0 top-[0.6em] size-[7px] rounded-full bg-accent"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-[0.9375rem] font-semibold">
              {t.home.status.nextHeading}
            </h3>
            <ul className="space-y-2.5 text-[0.9375rem] leading-relaxed text-muted">
              {t.home.status.next.map((item) => (
                <li key={item} className="relative pl-6">
                  <span
                    aria-hidden
                    className="absolute left-0 top-[0.6em] size-[7px] rounded-full border border-rule"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section heading={t.home.reading.heading}>
        <ul className="max-w-[36rem]">
          {readingLinks.map(({ key, href }) => (
            <li
              key={key}
              className="border-t border-rule py-3.5 first:border-t-0 first:pt-0"
            >
              <a
                href={href}
                className="text-accent underline underline-offset-[3px]"
              >
                {t.home.reading[key].label}
              </a>
              <span className="block text-[0.9375rem] leading-snug text-muted">
                {t.home.reading[key].description}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section heading={t.home.built.heading}>
        <ul className="flex flex-wrap gap-2">
          {builtWith.map((item) => (
            <li
              key={item}
              className="rounded-full border border-rule px-3 py-1.5 text-sm leading-none text-muted"
            >
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section heading={t.home.about.heading}>
        <p className="max-w-[36rem]">{t.home.about.text}</p>
        <p className="mt-5">
          <Link
            href={`/${locale}/about`}
            className="text-accent underline underline-offset-[3px]"
          >
            {t.home.about.link}
          </Link>
        </p>
      </Section>
    </>
  );
}
