# 0007 — Vertical slices with a protected domain core

- **Status:** accepted
- **Date:** 2026-09-19
- **Deciders:** Stephan Tragni

## Context and problem statement

The backend has to be structured before the first feature is written. The domain
is small: a project catalogue with roughly five entities, whose only real logic
is slug generation and history, publication state transitions, authorisation
policies and image variant rules.

An earlier draft specified Clean Architecture with four layers (Domain,
Application, Infrastructure, API) plus CQRS. That was inherited rather than
argued, and it is being re-evaluated here.

Quality goal Q6a requires 90 % coverage on the domain layer, driven by tests.
Constraint O1 — four to eight hours per week — makes ceremony per feature an
actual cost, not a theoretical one.

## Considered options

1. **Clean Architecture, four layers** — Domain, Application, Infrastructure, API
2. **Vertical slices with a protected domain core** — three projects; one file
   per use case
3. **Flat pragmatic layering** — controllers, services, EF Core, no domain project

## Decision

Chosen: **vertical slices with a protected domain core** — three projects.

```
Tragni.Domain/          entities, value objects, rules — references nothing
Tragni.Infrastructure/  EF Core, DbContext, external integrations
Tragni.Api/             Minimal API host; Features/<Area>/<UseCase>.cs
```

A slice is one file holding the endpoint, its handler, its validator and its
request and response types. It is read top to bottom, and a change to one use
case touches one file. Slices may not call each other; shared behaviour moves
into the domain or into `Common`, never sideways.

**`Tragni.Domain` references no framework and no third-party package.** The
compiler enforces this, so it cannot erode through carelessness. That project is
the test-driven surface and the subject of Q6a and Q6b.

The reasoning that decided it: **the domain logic is identical under either of
the first two options.** `Project.Publish()` with its guard clauses lives in a
framework-free domain project either way, and is unit-tested without a database
either way. Clean Architecture's extra layer therefore buys indirection, not
testability — and the indirection is paid for once per use case, forever.

## Consequences

**Positive**

- One file per use case instead of roughly seven across four projects.
- Read paths project directly onto DTOs without a repository interface in the
  way, which is what makes Q2 achievable without extra work.
- Framework-free domain, so TDD is natural rather than an exercise in mocking.
- Less code to read after a three-month break (quality goal priority 1).

**Negative / accepted costs**

- Less immediately recognisable than the four-layer structure a reviewer may
  expect. This document is the answer to that.
- Nothing structurally prevents business logic from leaking into a slice. Only
  review discipline does.
- Some duplication between similar slices. Accepted deliberately: premature
  extraction of shared code is what turns slices back into layers.

**Obligations this creates**

- Domain logic belongs on the entity, never in a slice. A slice orchestrates —
  load, invoke, save, respond.
- Slices do not reference other slices. If two need the same behaviour, it moves
  down into the domain.
- `Tragni.Domain` acquires no package references. A pull request that adds one
  is rejected by default.
- Infrastructure is covered by integration tests against real PostgreSQL via
  Testcontainers, not by unit tests with mocks.

## Why not the others

**Clean Architecture, four layers** — has genuine merits: it is the recognisable
pattern, it will be encountered in industry, and enforced project boundaries
help teams. It loses here on cost against benefit. Publishing a project means
loading an entity, calling a method and saving; spreading that across a command,
a handler, a validator, a repository interface, its implementation and an
endpoint is ceremony without a corresponding problem.

The repository layer is where it hurts most concretely. The catalogue needs
three different read shapes. Behind an `IProjectRepository` that means either
loading full entities and mapping them — fetching every project's Markdown body
to build a list view — or adding a method per query until the interface has
twenty methods and one implementation. EF Core is already the abstraction over
the database; a repository over it is an abstraction over an abstraction.

There is also a signalling argument, and it runs the opposite way to intuition:
a competent reviewer reads four layers and CQRS on a five-entity CRUD system as
a pattern applied without weighing its cost. The stronger signal is a documented
choice, which is what this file is. Clean Architecture is better learned as a
project *on* the platform, where the complexity justifies it — the same
reasoning applied to Keycloak in
[ADR-0004](0004-backend-as-authentication-authority.md).

**Flat pragmatic layering** — fewer files still, but it puts domain rules into
service classes that depend on EF Core. That forfeits the framework-free test
surface, which is the one thing worth protecting here.

## Revisit when

Slices begin to share substantial application logic that does not belong in the
domain — typically when use cases start orchestrating several aggregates.

The response is then to introduce a `Tragni.Application` project between the API
and the domain. That is a mechanical refactor with the slices already grouped by
feature. The reverse direction — removing ceremony from four established layers
— is considerably more expensive, which is the second reason this direction was
chosen.
