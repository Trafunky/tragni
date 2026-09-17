# tragni.ch

A personal portfolio and engineering platform — built, documented and operated
from the ground up.

> **Status:** Early stage. Requirements are written; architecture work is in
> progress. See [Progress](#progress) for the current state.

---

## What this is

tragni.ch is not a business card. It is a production system that grows over
years: it presents projects, and is itself the largest one. What can be followed
here is not only the result but the reasoning — requirements, architecture and
architecture decision records live in the same repository as the code.

In detail: [Vision](docs/requirements/00-vision.md)

## Technology

Fixed constraints and decisions made so far:

| Area | Choice |
|---|---|
| Backend language | C# / .NET |
| Database | PostgreSQL |
| Containers | Docker, Docker Compose |
| Reverse proxy | Traefik v3 (TLS via Let's Encrypt) |
| CI/CD | GitHub Actions → GHCR → VPS |
| Observability | OpenTelemetry, hosted Grafana |
| Hosting | Infomaniak VPS (Ubuntu LTS), Switzerland |
| Repository layout | Monorepo, strict boundary between API and web |

The remaining choices — frontend framework, UI library, ORM, backend
architecture style — are deliberately still open. They were inherited from an
earlier draft and are being re-evaluated rather than carried over. Every
decision, including the alternatives that were rejected, will be recorded in
[`docs/adr/`](docs/adr/).

## Layout

```
apps/api/            .NET solution
apps/web/            Frontend
packages/api-client/ TypeScript client, generated from the OpenAPI spec
deploy/              Compose files, proxy configuration, backup scripts
docs/                Requirements, architecture (arc42), ADRs
tests/e2e/           End-to-end tests
```

A monorepo with a strict boundary: `apps/api` and `apps/web` share exactly one
contact point — the generated API client. No shared code, no shared runtime.

## Running locally

> Once the walking skeleton is in place, a single command will be enough. This
> section will then list the actual prerequisites and steps.

## Documentation

| Document | Contents |
|---|---|
| [Requirements](docs/requirements/) | Vision, personas, scope, quality goals, user stories, glossary |
| [Architecture](docs/architecture/) | arc42 documentation |
| [ADRs](docs/adr/) | Architecture decisions, with rationale and rejected alternatives |
| [Contributing](CONTRIBUTING.md) | Conventions for branches, commits and pull requests |

## Quality goals

Stated as measurable targets and enforced in the pipeline — among them
LCP < 2.0 s, WCAG 2.2 AA, no high or critical CVEs in the production image,
RTO ≤ 30 minutes. The full set:
[`03-qualitaetsziele.md`](docs/requirements/03-qualitaetsziele.md).

Deliberately **not** goals: high availability, horizontal scalability,
multi-tenancy. The system runs on a single VPS and is operated alongside a
full-time job. That is written down rather than papered over with a number the
status page would later contradict.

## Progress

- [x] Requirements
- [ ] Architecture (arc42) and ADRs
- [ ] Infrastructure: server, Docker, proxy, backup
- [ ] Walking skeleton: browser → frontend → API → database, deployed
- [ ] CI/CD pipeline
- [ ] MVP: project catalogue and content management

Current state in detail: [Issues](https://github.com/Trafunky/tragni/issues)
· [MVP milestone](https://github.com/Trafunky/tragni/milestones)

## Licence

[MIT](LICENSE) — take what you need.
