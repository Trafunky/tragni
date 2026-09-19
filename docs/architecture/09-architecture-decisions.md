# 09 — Architecture Decisions

Decisions are not recorded here. They live as individual files in
[`docs/adr/`](../adr/), one per decision, in MADR format, immutable once
accepted ([ADR-0001](../adr/0001-record-architecture-decisions.md)).

This chapter is the index and the reading order.

## By theme

**Working method**

| # | Decision |
|---|---|
| [0001](../adr/0001-record-architecture-decisions.md) | Record architecture decisions |
| [0002](../adr/0002-english-as-repository-language.md) | English as the repository language |

**Structure**

| # | Decision |
|---|---|
| [0003](../adr/0003-monorepo-over-polyrepo.md) | Monorepo over polyrepo |
| [0007](../adr/0007-vertical-slices-with-domain-core.md) | Vertical slices with a protected domain core |
| [0008](../adr/0008-no-mediator-framework.md) | No mediator framework |

**Technology**

| # | Decision |
|---|---|
| [0009](../adr/0009-ef-core-for-data-access.md) | EF Core for data access |
| [0010](../adr/0010-nextjs-as-frontend-framework.md) | Next.js as the frontend framework |
| [0011](../adr/0011-pnpm-as-package-manager.md) | pnpm as the package manager |

**Operations**

| # | Decision |
|---|---|
| [0004](../adr/0004-backend-as-authentication-authority.md) | Backend as the authentication authority |
| [0005](../adr/0005-traefik-as-reverse-proxy.md) | Traefik as the reverse proxy |
| [0006](../adr/0006-hosted-observability-backend.md) | Hosted observability backend |

## Where the constraint lies

Several decisions have the same root. Recorded here so that a future reader does
not mistake them for independent judgements:

| Root | Decisions it drove |
|---|---|
| 4 GB of RAM on a single VPS (T4) | 0004 (no Keycloak), 0006 (no self-hosted observability), no orchestrator, no staging environment |
| One developer, few hours per week (O1) | 0003 (one repository), 0007 and 0008 (less ceremony), 0010 (one application for public and admin) |
| Public repository (T6) | 0002 (English), environment-based configuration throughout |
| Demos from other people (Q13) | 0005 (label-based routing), network isolation per demo, token exchange instead of shared identity |

If the server is scaled up, the first row is the list worth revisiting — and
each of those ADRs states the condition under which it should be.
