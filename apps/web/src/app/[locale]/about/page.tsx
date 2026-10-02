import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Entry, Section } from "@/components/section";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/locales";
import { siteUrl } from "@/lib/site";

// Not translated: the names of the tools stay as they are.
const ownProjectTools = [
  "C# / .NET",
  "TypeScript",
  "Next.js",
  "PostgreSQL",
  "Docker",
  "Linux",
  "CI/CD",
];

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = getDictionary(locale);

  return {
    title: t.meta.aboutTitle,
    description: t.meta.aboutDescription,
    alternates: {
      canonical: `/${locale}/about`,
      languages: Object.fromEntries(
        locales.map((it) => [it, `/${it}/about`]),
      ),
    },
    openGraph: {
      type: "profile",
      siteName: t.meta.siteName,
      title: t.meta.aboutTitle,
      description: t.meta.aboutDescription,
      url: `${siteUrl}/${locale}/about`,
      locale,
    },
  };
}

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/about">) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = getDictionary(locale);

  return (
    <>
      <h1 className="max-w-[19ch] font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-[2.625rem]">
        {t.about.title}
      </h1>

      <p className="mt-6 max-w-[36rem] text-lg text-muted">{t.about.lede}</p>

      <Section heading={t.about.work.heading}>
        <p className="max-w-[36rem]">{t.about.work.first}</p>
        <p className="mt-5 max-w-[36rem]">{t.about.work.second}</p>

        <ul className="mt-6 max-w-[36rem] space-y-3">
          {t.about.work.tasks.map((task) => (
            <li key={task} className="relative pl-5">
              <span
                aria-hidden
                className="absolute left-0 top-[0.75em] h-px w-1.5 bg-accent"
              />
              {task}
            </li>
          ))}
        </ul>
      </Section>

      <Section heading={t.about.besides.heading}>
        <p className="max-w-[36rem]">{t.about.besides.first}</p>
        <p className="mt-5 max-w-[36rem]">{t.about.besides.second}</p>
      </Section>

      <Section heading={t.about.stations.heading}>
        <Entry
          when={t.about.stations.current.when}
          what={t.about.stations.current.what}
          detail={t.about.stations.current.detail}
        />
        <Entry
          when={t.about.stations.earlier.when}
          what={t.about.stations.earlier.what}
          detail={t.about.stations.earlier.detail}
        >
          <p className="mt-2.5 max-w-[36rem] text-[0.9375rem] leading-loose text-muted">
            {t.about.stations.earlier.steps.join(" · ")}
          </p>
        </Entry>
      </Section>

      <Section heading={t.about.education.heading}>
        {t.about.education.entries.map((entry) => (
          <Entry
            key={`${entry.when}-${entry.what}`}
            when={entry.when}
            what={entry.what}
            detail={entry.detail}
          />
        ))}
      </Section>

      <Section heading={t.about.tools.heading}>
        <div className="space-y-7">
          <div>
            <h3 className="mb-3 text-[0.9375rem] font-semibold">
              {t.about.tools.professionalHeading}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {t.about.tools.professional.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-rule px-3 py-1.5 text-sm leading-none text-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-[0.9375rem] font-semibold">
              {t.about.tools.ownHeading}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {ownProjectTools.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-rule px-3 py-1.5 text-sm leading-none text-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}
