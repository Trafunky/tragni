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

## Still open

Deliberately not decided yet. These were carried over from an earlier draft and
are being re-evaluated during the architecture work rather than inherited:

- Frontend framework and UI library
- ORM and data access approach
- Backend architecture style (layered, vertical slice, or something else)
- Whether CQRS and a mediator pattern are justified at this scale

## Conventions

- **Numbering** is sequential and never reused.
- **Status** is one of `proposed`, `accepted`, `rejected`, `superseded by
  [NNNN](...)`. An ADR is never deleted or rewritten after acceptance — a later
  decision supersedes it and links back.
- **New ADR** = copy [`template.md`](template.md).
- An ADR is written in the same pull request as the change it justifies.
