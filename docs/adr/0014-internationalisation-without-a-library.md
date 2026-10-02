# 0014 — Internationalisation without a library

- **Status:** accepted
- **Date:** 2026-10-02
- **Deciders:** Stephan Tragni

## Context and problem statement

Requirement E4 asks for German and English with the locale in the route —
`/de/...` and `/en/...` — so that each language is a distinct, indexable URL
carrying the correct `hreflang`. [Chapter 8](../architecture/08-crosscutting-concepts.md)
adds that only the interface and the content are translated: slugs stay
unlocalised, and dates and numbers are formatted through platform APIs rather
than by string concatenation.

Next.js once offered built-in internationalised routing through `next.config`.
That belongs to the Pages Router. The App Router, chosen in
[ADR-0010](0010-nextjs-as-frontend-framework.md), has no equivalent: locale
routing is something the application provides, either by hand or through a
library. Guidance written before the App Router suggests otherwise and is a
common source of wasted time.

The text that needs translating today is a landing page, a page about the
author, the navigation and the metadata. It contains no plurals, no quantities
and no dates in running text — nothing that declines differently per language.

## Considered options

1. **`next-intl`** — the most widely used internationalisation library for the
   App Router
2. **A locale segment with plain dictionaries** — `app/[locale]/` plus one
   TypeScript module per language
3. **Next.js built-in internationalised routing** — listed only because it is
   frequently assumed to exist; it does not, for the App Router

## Decision

Chosen: **a locale segment with plain dictionaries**, without a library.

The deciding argument is that `next-intl` solves problems this site does not
have. Its value lies in ICU message syntax — plural rules, gendered forms,
interpolated dates — and in message management for people who translate without
touching the code. Neither applies here: the texts are short and declarative,
and the only translator is the author.

What remains is a dependency inside the part of the system that moves fastest.
ADR-0010 already obliges this project to pin the Next.js major version and to
raise it deliberately; every library in the frontend has to follow that
movement, and an internationalisation library sits close enough to the router to
be affected by it. Under constraint O1 — one developer, a few hours a week —
that upkeep is the real cost, not the fifty lines it replaces.

The same reasoning produced [ADR-0008](0008-no-mediator-framework.md). A
dependency has to earn the effort of maintaining it, and this one does not yet.

## Consequences

**Positive**

- No library to carry across Next.js major versions.
- The dictionaries share one type, so a missing or misspelled key is a compile
  error rather than a blank space in production.
- Routing, metadata and `hreflang` stay explicit and readable. There is no
  middleware whose behaviour has to be inferred from documentation.
- Both languages are statically rendered, which serves Q1 and Q4 directly.

**Negative / accepted costs**

- No ICU message syntax. Plurals and any form that declines have to be written
  in code, and the first one will be ugly.
- No tooling for translators. Translations live in the repository and are edited
  by someone who can run the build.
- Every new page needs its keys added to both dictionaries. Nothing prompts for
  a translation; only the compiler notices a key that is missing entirely.

**Obligations this creates**

- **The dictionaries share a single type.** The German file defines it, the
  English file satisfies it. A missing key must fail the build.
- **`generateStaticParams` returns every locale**, so both languages are
  pre-rendered rather than generated on request.
- **Every page sets `alternates.languages` and a canonical URL**, and the
  `lang` attribute on `<html>` carries the active locale.
- **Dates and numbers are formatted through `Intl.DateTimeFormat` and
  `Intl.NumberFormat`** with the active locale, never assembled from parts.
- **`/` redirects to the default locale, `de`.** The redirect is temporary
  (307) and not permanent: a permanent redirect is cached by browsers and
  cannot be withdrawn, and the default locale is not yet settled for good.

## Why not the others

**`next-intl`** — a good library, and the right answer for an application with
real message complexity or with translators who do not work in the repository.
It would also save writing the locale plumbing. It loses here on the same
ground as every well-made tool that is not yet needed: it adds something to
maintain in exchange for capability that is not being used. Should the texts
grow in the direction the library is built for, adopting it later is a
contained change — the dictionaries are already keyed, and the routing stays.

**Next.js built-in internationalised routing** — unavailable in the App Router.
Recorded here so that the next person who finds a tutorial describing it knows
it was considered and why it does not apply.

## Revisit when

- A text needs plural forms, gendered forms or dates inside running sentences.
- A third language is added.
- Translations are maintained by someone who does not work in the repository.
