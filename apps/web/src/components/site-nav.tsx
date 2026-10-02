"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { locales, type Locale } from "@/i18n/locales";

/**
 * The only client component on the site. Both halves need the current path: the
 * page links to mark the active one, the language links to point at the same
 * page in the other language. A layout cannot know it.
 */
export function SiteNav({
  locale,
  items,
  menuLabel,
  languageLabel,
}: {
  locale: Locale;
  items: { href: string; label: string }[];
  menuLabel: string;
  languageLabel: string;
}) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-5 text-sm">
      <nav aria-label={menuLabel} className="flex gap-5">
        {items.map((item) =>
          pathname === item.href ? (
            <span
              key={item.href}
              aria-current="page"
              className="font-medium text-foreground"
            >
              {item.label}
            </span>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ),
        )}
      </nav>

      <span aria-hidden className="h-4 w-px bg-rule" />

      <nav aria-label={languageLabel} className="flex gap-3">
        {locales.map((it) =>
          it === locale ? (
            <span
              key={it}
              aria-current="true"
              className="font-medium text-foreground"
            >
              {it.toUpperCase()}
            </span>
          ) : (
            <Link
              key={it}
              href={pathname.replace(/^\/[^/]+/, `/${it}`)}
              className="text-muted transition-colors hover:text-accent"
            >
              {it.toUpperCase()}
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}
