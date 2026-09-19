# 04 — Solution Strategy

The handful of decisions that shape everything else. Each is recorded in full in
an ADR; this chapter is the overview and the mapping to quality goals.

## Technology decisions

| Area | Choice | ADR |
|---|---|---|
| Repository layout | Monorepo with an enforced boundary between API and web | [0003](../adr/0003-monorepo-over-polyrepo.md) |
| Backend architecture | Vertical slices with a protected domain core | [0007](../adr/0007-vertical-slices-with-domain-core.md) |
| In-process dispatch | Direct calls; no mediator framework | [0008](../adr/0008-no-mediator-framework.md) |
| Data access | EF Core, migrations as a separate deployment step | [0009](../adr/0009-ef-core-for-data-access.md) |
| Frontend | Next.js (App Router), TypeScript | [0010](../adr/0010-nextjs-as-frontend-framework.md) |
| Package manager | pnpm with workspaces | [0011](../adr/0011-pnpm-as-package-manager.md) |
| Authentication | Backend is the authority; cookie sessions; external OIDC | [0004](../adr/0004-backend-as-authentication-authority.md) |
| Reverse proxy | Traefik v3, routing from container labels | [0005](../adr/0005-traefik-as-reverse-proxy.md) |
| Observability | OpenTelemetry instrumentation, hosted backend | [0006](../adr/0006-hosted-observability-backend.md) |
| Database | PostgreSQL | see below |
| Documentation | arc42 and ADRs in the repository, diagrams as code | [0001](../adr/0001-record-architecture-decisions.md) |

PostgreSQL is not given its own ADR: it was not a contested choice. It is the
default relational database for this stack, runs well in a container, and
nothing in the requirements pushes towards an alternative. The version is
pinned and upgraded deliberately, never implicitly by an image tag.

## How the quality goals are achieved

| Goal | Approach |
|---|---|
| **Q1** Frontend load time | Public pages pre-rendered or incrementally regenerated; images converted to modern formats and sized at upload; measured per pull request by Lighthouse CI |
| **Q2** API response time | Read paths project directly onto DTOs without change tracking; measured through OpenTelemetry rather than estimated |
| **Q3a/b** Availability, response time | Targets set to what a single unattended VPS can actually deliver, and written down as such |
| **Q3c** Self-healing | Restart policies plus health checks on every container; memory limits so one process cannot take the host down; swap against the OOM killer |
| **Q4** SEO | Server-rendered HTML with metadata, sitemap and structured data; no content that requires JavaScript to appear |
| **Q5** Accessibility | Semantic markup, alt text mandatory at upload, axe-core in the end-to-end suite |
| **Q6** Test coverage and quality | Domain logic isolated from frameworks so it can be driven by tests; integration tests against real PostgreSQL via Testcontainers; mutation testing on the domain |
| **Q7** Build duration | Path-filtered workflows; layer-cached Docker builds; no building on the server |
| **Q8** Container security | Trivy gate in the pipeline; minimal base images; non-root containers |
| **Q9** Backup | Off-server, encrypted, deduplicated; restore rehearsed quarterly and logged |
| **Q10** Resource budget | Explicit memory limit per container; hosted observability instead of a self-hosted stack; budget tracked as a metric |
| **Q11** Deployment automation | `main` → build → push → deploy, with no manual step |
| **Q12** Traceability | ADRs, written in the pull request that implements the decision |
| **Q13** Demo integration | Routing declared as labels on the demo container, so the platform is not touched |
| **Q14** Publishing effort | Publishing is a content operation, never a deployment; on-demand revalidation makes it visible within a minute |

## The organising idea

Three ideas run through all of the above.

**Separate what changes often from what changes rarely.** Content changes
weekly, the platform monthly, the infrastructure rarely. Publishing a project
therefore touches no code and triggers no deployment.

**Push complexity out of the server.** The server runs containers and nothing
else — no builds, no telemetry storage, no identity provider. Everything that
can happen in CI or in a hosted service does.

**Make the expensive parts boring.** Authentication uses the framework's
built-in flows rather than hand-written tokens. Deployment is pull-and-restart.
Backups are one well-understood tool. Novelty is spent on the projects, which
are the point, not on the platform, which is the stage.
