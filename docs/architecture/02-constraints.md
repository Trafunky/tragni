# 02 — Constraints

Constraints are not decisions. They are the boundary inside which decisions are
made. Everything here was either set by the owner or follows from the
environment, and none of it is reopened by an ADR.

## Technical constraints

| # | Constraint | Consequence |
|---|---|---|
| T1 | **Backend in C# / .NET** | Set by the owner. The backend ecosystem, tooling and hosting model follow from this. |
| T2 | **Deployment on Docker containers** | Set by the owner. Everything that runs in production is an image; nothing is installed on the host directly. |
| T3 | **Single Linux VPS at Infomaniak (Switzerland)** | Set by the owner and already provisioned. No managed services, no load balancer, no second node. |
| T4 | **2 vCPU · 4 GB RAM · 60 GB disk** | The hard ceiling. Drives the resource budget in [chapter 7](07-deployment-view.md) and rules out anything heavyweight in the base stack. Upgrading is possible but happens only on measured evidence (Q10). |
| T5 | **Building on the server is not allowed** | Two vCPUs cannot serve traffic and build at the same time. All images are built in CI; the server only pulls and runs. |
| T6 | **The repository is public** | Anything that must not be public is a secret and never enters the repository. Configuration is environment-based by necessity, not by preference. |
| T7 | **Backup target is Infomaniak Swiss Backup over S3** | Already provisioned. Backup is off-server by definition; a dump on the same disk is not a backup. |

## Organisational constraints

| # | Constraint | Consequence |
|---|---|---|
| O1 | **One developer, 4–8 hours per week** | No parallel workstreams. Anything requiring sustained attention across days will not get finished. Scope is cut, not stretched. |
| O2 | **Operated alongside a full-time job; up to 24 h response time** | Self-healing is a baseline requirement (Q3c), not a refinement. The availability target is set accordingly (Q3a: 97 %). |
| O3 | **Long gaps between working sessions** | Anything relying on remembered context will be lost. Hence ADRs, this document, and issue-level acceptance criteria. |
| O4 | **No budget beyond the existing VPS and backup** | Paid services are out unless a free tier genuinely covers the need. |

## Conventions

Binding for the whole repository. Details in
[CONTRIBUTING.md](../../CONTRIBUTING.md).

| # | Convention |
|---|---|
| C1 | English throughout the repository — code, commits, issues, pull requests, documentation ([ADR-0002](../adr/0002-english-as-repository-language.md)) |
| C2 | Every architecture decision has an ADR ([ADR-0001](../adr/0001-record-architecture-decisions.md), Q12) |
| C3 | Conventional Commits; nothing committed directly to `main`; squash merge |
| C4 | Documentation lives in the repository as Markdown, diagrams as code |
| C5 | Test-driven development for domain logic; every bug fix starts with a failing test (Q6c) |

## What follows from T4 in particular

The 4 GB ceiling is the single most shaping constraint in this document. It is
the reason the architecture:

- uses a hosted observability backend rather than a self-hosted stack
  ([ADR-0006](../adr/0006-hosted-observability-backend.md)),
- uses the API itself as the authentication authority rather than a dedicated
  identity provider ([ADR-0004](../adr/0004-backend-as-authentication-authority.md)),
- runs Docker Compose rather than an orchestrator,
- sets explicit memory limits on every container and budgets demos against a
  fixed remainder.

If the server is ever scaled up, those four decisions are the ones worth
revisiting — and each ADR says so under *Revisit when*.
