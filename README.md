# tragni.ch

A personal portfolio and engineering platform — built, documented and operated
from the ground up.

> **Status:** Early stage. Requirements and architecture are written; the
> walking skeleton is being built. See [Progress](#progress) for the current state.

---

## What this is

tragni.ch is not a business card. It is a production system that grows over
years: it presents projects, and is itself the largest one. What can be followed
here is not only the result but the reasoning — requirements, architecture and
architecture decision records live in the same repository as the code.

In detail: [Vision](docs/requirements/00-vision.md)

## Technology

| Area | Choice | Why |
|---|---|---|
| Backend | C# / .NET, Minimal APIs | Fixed constraint |
| Backend architecture | Vertical slices, framework-free domain core | [ADR-0007](docs/adr/0007-vertical-slices-with-domain-core.md) |
| Data access | EF Core, migrations as a deployment step | [ADR-0009](docs/adr/0009-ef-core-for-data-access.md) |
| Database | PostgreSQL | Default for this stack; version pinned |
| Frontend | Next.js (App Router), TypeScript | [ADR-0010](docs/adr/0010-nextjs-as-frontend-framework.md) |
| Package manager | pnpm with workspaces | [ADR-0011](docs/adr/0011-pnpm-as-package-manager.md) |
| Authentication | Backend is the authority; cookie sessions, external OIDC | [ADR-0004](docs/adr/0004-backend-as-authentication-authority.md) |
| Reverse proxy | Traefik v3, routing from container labels | [ADR-0005](docs/adr/0005-traefik-as-reverse-proxy.md) |
| Containers | Docker, Docker Compose | Fixed constraint |
| CI/CD | GitHub Actions → GHCR → VPS | Never build on the server |
| Observability | OpenTelemetry, hosted backend | [ADR-0006](docs/adr/0006-hosted-observability-backend.md) |
| Hosting | Infomaniak VPS (Ubuntu LTS), Switzerland | Fixed constraint |

Three things this stack deliberately does **not** include, each argued in an
ADR: a mediator framework, a repository layer over EF Core, and a dedicated
identity provider.

## Layout

```
apps/api/            .NET solution — Domain, Infrastructure, Api
apps/web/            Next.js frontend
packages/api-client/ TypeScript client, generated from the OpenAPI spec
deploy/              Compose files, proxy configuration, backup scripts
docs/                Requirements, architecture (arc42), ADRs
tests/e2e/           End-to-end tests
```

A monorepo with a strict boundary: `apps/api` and `apps/web` share exactly one
contact point — the generated API client. No shared code, no shared runtime.

## Running locally

Prerequisites, commands and known pitfalls:
[`docs/development.md`](docs/development.md). Once the walking skeleton is in
place, a single command will start the whole stack.

## Documentation

| Document | Contents |
|---|---|
| [Requirements](docs/requirements/) | Vision, personas, scope, quality goals, user stories, glossary |
| [Architecture](docs/architecture/) | arc42: context, building blocks, runtime, deployment, crosscutting concepts, risks |
| [ADRs](docs/adr/) | Architecture decisions, with rationale and rejected alternatives |
| [Development](docs/development.md) | Local setup, rules the build enforces, troubleshooting |
| [Contributing](CONTRIBUTING.md) | Conventions for branches, commits and pull requests |

## Quality goals

Stated as measurable targets and enforced in the pipeline — among them
LCP < 2.0 s, WCAG 2.2 AA, no high or critical CVEs in the production image,
RTO ≤ 30 minutes. The full set:
[`03-quality-goals.md`](docs/requirements/03-quality-goals.md).

Deliberately **not** goals: high availability, horizontal scalability,
multi-tenancy. The system runs on a single VPS and is operated alongside a
full-time job. That is written down rather than papered over with a number the
status page would later contradict.

Known risks and deliberate technical debt are listed in
[arc42 chapter 11](docs/architecture/11-risks-and-technical-debt.md) — including
the absence of a staging environment and what would trigger adding one.

## Progress

- [x] Requirements
- [x] Architecture (arc42) and ADRs
- [x] Infrastructure: server, Docker, proxy, backup
- [ ] Walking skeleton: browser → frontend → API → database, deployed
  - [x] API: health endpoints and a first typed endpoint, with integration tests
  - [x] Frontend: Next.js and Tailwind, reading the API through the generated client
  - [ ] PostgreSQL and the first migration
  - [ ] Both applications in containers, deployed
- [ ] CI/CD pipeline
- [ ] MVP: project catalogue and content management

Current state in detail: [Issues](https://github.com/Trafunky/tragni/issues)
· [MVP milestone](https://github.com/Trafunky/tragni/milestones)

## Licence

[MIT](LICENSE) — take what you need.
