# 0010 — Next.js as the frontend framework

- **Status:** accepted
- **Date:** 2026-09-19
- **Deciders:** Stephan Tragni

## Context and problem statement

The frontend has two halves with opposite requirements.

The **public half** — catalogue, filtering, project detail, shareability
(PK-01 to PK-05) — is content. It must be fast on a phone (Q1: LCP under 2.0 s),
fully indexable (Q4), and it must render without client-side JavaScript so that
filtering works for crawlers and for users on poor connections.

The **admin half** — sign-in, draft management, image upload, a Markdown editor
with live preview, publishing (CV-01 to CV-06) — is an interactive application.
Static rendering and SEO are irrelevant there; state management and
responsiveness are not.

Publishing must become visible within a minute without a deployment (CV-04,
Q14). The backend is a separate .NET API, so the frontend renders and calls;
it does not own data.

An earlier draft specified Next.js. That was inherited rather than argued.

## Considered options

1. **Next.js (App Router)** — React, server components, incremental
   regeneration
2. **Astro** — content-first, near-zero JavaScript, interactive islands
3. **Astro for the public half plus a separate admin application**

## Decision

Chosen: **Next.js**, App Router, TypeScript, with the major version pinned to
the current Active LTS line.

The deciding argument is the shape of the admin half. Astro's model is static
pages with islands of interactivity — genuinely better for the public half, and
a poor fit for CV-01 to CV-06, which together are an application, not a
sprinkle. Building it inside Astro means embedding a single-page application and
then running Astro's routing and that application's routing side by side: two
mental models in one project. Under constraint O1, that friction is what causes
things to be left unfinished.

Next.js covers both halves with one model: public pages pre-rendered or
incrementally regenerated, the admin area client-rendered against the API, one
application, one build, one container.

Incremental regeneration also answers CV-04 directly. On publish, the API calls
a signed revalidation endpoint and the affected pages regenerate — no rebuild,
no deployment. Astro in static mode would need a full rebuild triggered by a
webhook, which means a build pipeline or a build container in the loop; Astro in
server mode avoids that but gives back the speed advantage that argued for Astro
in the first place.

Market reach supports the decision but did not decide it: React and Next.js
appear in vastly more job listings, including in Switzerland, and the learning
material is denser. That matters for a portfolio, but it would not have
outweighed a genuinely worse technical fit.

## Consequences

**Positive**

- One application, one build, one container for both halves.
- On-demand revalidation satisfies Q14 without a deployment.
- Server components keep data fetching on the server, so the public pages carry
  no data-fetching code to the browser.
- Built-in support for metadata, sitemap and internationalised routing (E4).
- Transferable skills.

**Negative / accepted costs**

- Around 250 MB of memory for the container, against roughly 80–120 MB for a
  leaner alternative — about 7 % of the demo budget (Q10). Budgeted for in
  [chapter 7](../architecture/07-deployment-view.md).
- A React runtime ships to the browser even on pages that need no interactivity.
  Q1 is still reachable, but with less headroom than Astro would give.
- The App Router has real conceptual complexity: the boundary between server and
  client components, and caching semantics that have changed across major
  versions.

**Obligations this creates**

- **The major version is pinned** to the Active LTS line and upgraded
  deliberately. Maintenance LTS receives only critical fixes.
- **Caching behaviour is read from the documentation for the pinned version.**
  Guidance written for an earlier major version is a common and expensive source
  of error; risk R7 records this.
- Public pages must render fully without client-side JavaScript. Filtering is
  expressed as links, not buttons (PK-02).
- The admin area is not pre-rendered and is not indexable.
- API types are never hand-written — they come from the generated client
  ([ADR-0003](0003-monorepo-over-polyrepo.md)).
- The production image uses standalone output; the build never runs on the
  server (constraint T5).
- The revalidation endpoint is server-to-server and signed. Its failure must not
  fail the publish operation.

## Why not the others

**Astro** — technically the cleaner fit for the public half and a genuinely
appealing option: near-zero JavaScript would make Q1 and Q4 nearly free. It
loses on the admin half, where a full application inside an island model means
two routing systems in one project. A defensible ADR could have gone the other
way for a pure content site; this is not one.

**Astro plus a separate admin application** — removes that conflict and replaces
it with two frontends, two build setups and two containers, on a 4 GB server
maintained by one person a few hours a week. More surface than the problem
justifies.

## Revisit when

- The admin area moves out of the web application entirely, leaving a pure
  content site — at which point Astro's argument returns in full.
- Q1 cannot be met on the public pages despite static rendering and image
  optimisation.
