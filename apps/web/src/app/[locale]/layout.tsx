import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteNav } from "@/components/site-nav";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/locales";
import { siteUrl } from "@/lib/site";

import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

// Relative URLs in page metadata are resolved against this.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full`}
    >
      <body className="min-h-full">
        <div className="mx-auto max-w-5xl px-6">
          {/* The site, not the person — the name in the sidebar is the person. */}
          <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-rule py-5">
            <Link
              href={`/${locale}`}
              className="font-serif text-lg font-semibold tracking-tight"
            >
              tragni.ch
            </Link>

            <SiteNav
              locale={locale}
              menuLabel={t.nav.menuLabel}
              languageLabel={t.nav.languageLabel}
              items={[
                { href: `/${locale}`, label: t.nav.home },
                { href: `/${locale}/about`, label: t.nav.about },
              ]}
            />
          </header>

          <div className="grid gap-x-16 pt-12 sm:pt-16 lg:grid-cols-[14rem_1fr] lg:items-start">
            <aside className="mb-12 lg:sticky lg:top-12 lg:mb-0">
              <div className="flex items-center gap-4 lg:block">
                <Image
                  src="/portrait.jpg"
                  alt={t.identity.portraitAlt}
                  width={224}
                  height={224}
                  priority
                  className="size-20 rounded-full border border-rule object-cover lg:mb-5 lg:size-28"
                />
                <div>
                  <p className="font-serif text-xl font-semibold leading-tight">
                    {t.identity.name}
                  </p>
                  <p className="mt-1 text-sm leading-snug text-muted">
                    {t.identity.role}
                    <br />
                    {t.identity.degree}
                  </p>
                  <p className="mt-3 text-sm">
                    <a
                      href="mailto:stephan@tragni.ch"
                      className="text-accent underline underline-offset-[3px]"
                    >
                      stephan@tragni.ch
                    </a>
                  </p>
                </div>
              </div>
            </aside>

            <main className="min-w-0">{children}</main>
          </div>

          <footer className="mt-20 flex flex-wrap justify-between gap-x-6 gap-y-1 border-t border-rule py-7 pb-12 text-sm text-muted sm:mt-24">
            <p>© 2026 {t.identity.name}</p>
            <p>{t.footer.note}</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
