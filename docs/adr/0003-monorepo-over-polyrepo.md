# 0003 — Monorepo over polyrepo

- **Status:** accepted
- **Date:** 2026-09-17
- **Deciders:** Stephan Tragni

## Context and problem statement

The platform consists of a .NET API and a separate frontend, plus deployment
configuration, end-to-end tests and documentation. An earlier draft placed API
and frontend in two repositories, reasoning that this would demonstrate the
ability to work with a polyrepo setup and keep the two independently
replaceable.

That setup leaves several artefacts homeless: the compose file and proxy
configuration belong to neither repository, end-to-end tests exercise both, and
the API contract has to travel between them somehow.

## Considered options

1. **Polyrepo** — `tragni-api` and `tragni-web` as separate repositories
2. **Monorepo** — one repository with `apps/api` and `apps/web`

## Decision

Chosen: **monorepo**, with a strict boundary between the two applications.

The decisive argument is the atomic commit. Renaming a field in
`GET /api/projects` touches both sides. In a monorepo that is one pull request,
one review, one CI run, one revert. In a polyrepo it is two pull requests that
only work together but are merged and deployed separately — the exact problem
that contract testing exists to solve, created here artificially.

Repository boundaries should follow **team** boundaries, not technology
boundaries. Frontend and backend are the same team of one. A future project
built with other people gets its own repository for that reason, regardless of
its language.

**The boundary is enforced, not assumed.** `apps/api` and `apps/web` share
exactly one contact point: the TypeScript client generated from the OpenAPI
specification. No shared source directory, no shared business logic, no shared
runtime. Each has its own Dockerfile, its own image in the registry, its own
path-filtered workflow, and is deployed independently by image tag.

## Consequences

**Positive**

- API changes and their client changes are one reviewable unit.
- Compose files, proxy configuration, e2e tests and documentation have an
  obvious home.
- One entry point for a visitor: one README, one `docs/`, one set of checks.
- Replacing the frontend wholesale remains a matter of deleting `apps/web` and
  writing a new one — the API is unaffected as long as the contract holds.

**Negative / accepted costs**

- Without path filters, every change rebuilds everything. Workflows must filter
  on paths from the first pipeline onwards.
- The repository will hold two toolchains (.NET and Node), which makes the root
  directory busier.
- Nothing structurally prevents someone from adding a shared directory. Only the
  rule below does.

**Obligations this creates**

- CI workflows filter on `apps/api/**` and `apps/web/**` respectively.
- The one-contact-point rule is checked in review, and ideally enforced by a CI
  check that fails on cross-imports.
- Quality goal Q13 (a new demo requires no platform code change) is unaffected
  by this decision — demos live in their own repositories entirely.

## Why not the other

**Polyrepo** — the stated rationale was visibility: two repositories would show
mastery of both sides, and demonstrate polyrepo experience. Neither holds up.
Having two repositories is not a skill and is not visible as one; what is
visible is path-filtered pipelines, a generated client, independently versioned
images, and a documented boundary — all of which this monorepo shows in one
place. Polyrepo solves an organisational problem (separate teams, separate
release cadences, separate access rights, third-party API consumers). None of
those apply to a single developer.

## Revisit when

- Other people take on long-term ownership of one of the two applications, with
  their own release cadence or restricted access.
- The API gains consumers outside this project that need it versioned
  independently.

Splitting later costs roughly an afternoon with `git filter-repo`, preserving
history. Merging two repositories later costs considerably more, which is why
this direction was chosen.
