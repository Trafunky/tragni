# 02 — Scope

## MVP

The goal of the MVP is a **system running in production and deployed fully
automatically**, with a single functional core: the project catalogue.

| Epic | Contents | In MVP |
|---|---|---|
| E1 — Project catalogue | Overview, filtering, detail page, shareability | yes |
| E2 — Content management | Login, CRUD, image upload, publishing | yes |
| E3 — About & contact | Career, skills, ways to get in touch | reduced |
| E4 — Internationalisation | German / English | yes |
| E5 — Operations & transparency | Health checks, status page | partial |
| E6 — Live demos | Demo routing, lifecycle, contributor contract | no |

**Reduced in E3:** contact in the MVP is an obfuscated email address, LinkedIn
and GitHub. No contact form — sending mail from a fresh VPS is unreliable
without SPF/DKIM/DMARC and clean reverse DNS, and an enquiry that lands in spam
is worse than no form at all. No CV PDF for download (see assumption A4).

**Partial in E5:** health checks, restart policies, backup and observability are
part of the MVP. The public status page comes only once that foundation is in
place — a status page is a promise and must not appear before the ability to
keep it.

## Stages after the MVP

| Stage | Contents |
|---|---|
| A1 | Public status page (availability, p95 response times, component status, last deployment with commit SHA) |
| A2 | Contact form sent via the mail account's SMTP relay, with honeypot and rate limiting |
| A3 | CV generated as a PDF from the structured data (one source for web and document) |
| A4 | Live demos: routing, demo lifecycle, contributor contract, token exchange |
| A5 | Quiz project: quizmaster with an account, participants via room code, server-side buzzer resolution |

## Non-goals

These are deliberately not pursued. They are listed so that nobody misses them
and nobody introduces them by accident.

- **High availability and redundancy.** A single VPS with no standby. Higher
  availability would require redundancy and is out of scope.
- **Horizontal scalability / Kubernetes.** For a handful of containers on one
  server, Docker Compose and a reverse proxy are the appropriate answer.
- **Multi-tenancy.** There is one operator.
- **A blog as a separate feature.** A technical article is a catalogue entry of
  type "article". A blog with three stale posts does more harm than good.
- **Comments, likes, social features.** Moderation effort without return.
- **Offline capability, native apps.**
- **Own user management with passwords.** Identity comes from external
  providers.

## Assumptions and constraints

| # | Assumption |
|---|---|
| A1 | Runs on an Infomaniak VPS Lite: 2 vCPU, 4 GB RAM, 60 GB disk. Upgrading is possible and happens only once a need has been measured (see Q10). |
| A2 | Backup target is Infomaniak Swiss Backup over S3. Swiss Backup is **backup**, not live storage; served images live in a Docker volume on the server. |
| A3 | Operation is part-time. Response time to incidents is up to 24 h (see Q3b). |
| A4 | Published publicly: industry, role and time periods of the career. No employer names, no address, no date of birth, no phone number. |
| A5 | Fixed technology constraints: backend in C#/.NET, Linux server at Infomaniak, Docker. |
| A6 | The platform is the identity authority for all projects. Projects receive user identity exclusively through short-lived, signed tokens and never access the platform database. |
| A7 | Projects may additionally maintain their own transient session identities (e.g. room code plus nickname) that are not stored by the platform. |
| A8 | The platform source code is public. Anything that must not be public is a secret and never lives in the repository. |
