# Architecture Decision Records

Every decision that is hard to reverse, or that a reader would otherwise have to
guess at, is recorded here. An ADR captures the **reasoning**, not the outcome
alone — including the options that were rejected and why.

Format: [MADR](https://adr.github.io/madr/). One file per decision, numbered
sequentially, named after the decision rather than the chosen technology.

## Index

| # | Decision | Status | Date |
|---|---|---|---|
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | accepted | 2026-09-17 |
| [0002](0002-english-as-repository-language.md) | English as the repository language | accepted | 2026-09-17 |
| [0003](0003-monorepo-over-polyrepo.md) | Monorepo over polyrepo | accepted | 2026-09-17 |
| [0004](0004-backend-as-authentication-authority.md) | Backend as the authentication authority | accepted | 2026-09-17 |
| [0005](0005-traefik-as-reverse-proxy.md) | Traefik as the reverse proxy | accepted | 2026-09-17 |
| [0006](0006-hosted-observability-backend.md) | Hosted observability backend | accepted | 2026-09-17 |
| [0007](0007-vertical-slices-with-domain-core.md) | Vertical slices with a protected domain core | accepted | 2026-09-19 |
| [0008](0008-no-mediator-framework.md) | No mediator framework | accepted | 2026-09-19 |
| [0009](0009-ef-core-for-data-access.md) | EF Core for data access | accepted | 2026-09-19 |
| [0010](0010-nextjs-as-frontend-framework.md) | Next.js as the frontend framework | accepted | 2026-09-19 |
| [0011](0011-pnpm-as-package-manager.md) | pnpm as the package manager | accepted | 2026-09-19 |
| [0012](0012-tailwind-css-for-styling.md) | Tailwind CSS for styling | accepted | 2026-09-23 |

## Decisions without an ADR

Not everything warrants one. These were considered and deliberately not written
up, so that their absence is not read as an oversight:

- **PostgreSQL** — not a contested choice. The default relational database for
  this stack, container-friendly, and nothing in the requirements points
  elsewhere. The version is pinned and upgraded deliberately.
- **TypeScript** — the default for this frontend stack in 2026, not a decision
  requiring justification. The parts that *are* decisions — strictness settings
  and runtime validation at system boundaries — are recorded as crosscutting
  concepts in
  [arc42 chapter 8](../architecture/08-crosscutting-concepts.md).
- **Docker, .NET, Linux hosting at Infomaniak** — constraints set by the owner,
  not decisions. Recorded in
  [arc42 chapter 2](../architecture/02-constraints.md).

## Conventions

- **Numbering** is sequential and never reused.
- **Status** is one of `proposed`, `accepted`, `rejected`, `superseded by
  [NNNN](...)`. An ADR is never deleted or rewritten after acceptance — a later
  decision supersedes it and links back.
- **New ADR** = copy [`template.md`](template.md).
- An ADR is written in the same pull request as the change it justifies.
