# 0011 — pnpm as the package manager

- **Status:** accepted
- **Date:** 2026-09-19
- **Deciders:** Stephan Tragni

## Context and problem statement

The repository is a monorepo ([ADR-0003](0003-monorepo-over-polyrepo.md)) in
which `apps/web` consumes `packages/api-client`, a TypeScript package generated
from the OpenAPI specification. That package is never published to a registry;
it is built and consumed inside the repository.

The package manager therefore has to resolve a local workspace dependency, and
it has to behave identically on the developer machine, in CI and inside the
Docker build. It also affects the Dockerfile and the pipeline, so it is decided
now rather than discovered later.

An earlier draft assumed npm by default.

## Considered options

1. **npm** — bundled with Node, workspaces supported
2. **pnpm** — content-addressable store, strict resolution, workspaces
3. **Yarn** — mature workspaces, several incompatible generations

## Decision

Chosen: **pnpm**, with workspaces.

Two properties decide it, and the well-known one is the less important.

**Strict resolution.** npm installs a flat `node_modules`, so transitive
dependencies end up importable even though they were never declared. Code that
imports one of them compiles and runs — until that intermediate dependency is
removed or moved upstream, and the build breaks for no visible reason. pnpm's
nested layout makes an undeclared import fail immediately, which turns a latent
problem into a compile error.

**Workspaces.** Linking `packages/api-client` into `apps/web` is pnpm's core use
case, and it handles it with less configuration and fewer hoisting surprises
than npm workspaces.

The commonly cited advantage — a global content-addressable store with hard
links, so each package version exists once on disk — is real, and saves install
time and space. It is a convenience, not a reason.

## Consequences

**Positive**

- An undeclared dependency fails at build time rather than silently working.
- Workspace linking without configuration gymnastics.
- Faster installs and a smaller disk footprint, which matters most in CI and in
  Docker layers.
- Lockfile format designed for workspaces, so a diff is readable.

**Negative / accepted costs**

- Occasional tooling still assumes a flat `node_modules`. Rare now, but when it
  happens it needs a hoisting exception rather than a shrug.
- The Docker build needs a few extra lines to make pnpm available.
- One more thing that must match between the local machine and CI.

**Obligations this creates**

- **The version is pinned** through the `packageManager` field in
  `package.json`, so the developer machine, CI and the Docker build use the same
  pnpm.
- `pnpm-lock.yaml` is committed. CI runs `pnpm install --frozen-lockfile`, so a
  lockfile that disagrees with the manifest fails the build instead of being
  silently corrected.
- The Dockerfile enables Corepack or installs pnpm explicitly, and the install
  step is cached as its own layer so dependency changes do not invalidate the
  whole build (Q7).
- Documentation and scripts use `pnpm` commands consistently. A mixed `npm` and
  `pnpm` history produces two lockfiles, which is a genuinely unpleasant thing
  to unpick.

## Why not the others

**npm** — bundled, universally understood, and adequate. It loses on flat
resolution, which permits a class of bug that is hard to diagnose precisely
because the code works until it suddenly does not. Its workspace support is
serviceable but noticeably less pleasant in practice than pnpm's for the
generated-client arrangement this repository depends on.

**Yarn** — capable, and its modern releases are strict in the same way pnpm is.
It loses on ecosystem confusion: several incompatible generations, with most
online guidance not stating which it targets. For a project worked on in weekly
blocks, that is a source of wasted evenings.

## Revisit when

A dependency proves genuinely incompatible with a nested `node_modules` layout
and no hoisting exception resolves it. Switching back to npm is a lockfile
deletion and a reinstall; nothing in the source depends on the choice.
