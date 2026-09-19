# 0009 — EF Core for data access

- **Status:** accepted
- **Date:** 2026-09-19
- **Deciders:** Stephan Tragni

## Context and problem statement

The platform stores projects, media, users and technologies in PostgreSQL. The
write side is small and transactional; the read side is a handful of list and
detail queries with filtering.

Two needs shape the choice beyond query syntax. The schema must evolve in a
controlled, reviewable way, because the database is long-lived and the system is
deployed automatically (Q11). And read paths must stay cheap enough to meet
Q2 (p95 under 200 ms) on a two-vCPU server.

## Considered options

1. **EF Core** — full ORM with migrations and LINQ
2. **Dapper** — micro-ORM, SQL written by hand
3. **EF Core for writes and migrations, Dapper for reads**

## Decision

Chosen: **EF Core** for everything.

Migrations are the deciding factor. They are generated from the model, reviewed
as code, versioned with the change that requires them, and applied as a
deliberate deployment step. Hand-managed SQL migration scripts are a source of
drift that a single developer working in weekly blocks will not reliably avoid.

The read load does not justify a second data access technology. Where a query
does become a problem, EF Core drops to raw SQL for that one query — which is a
better answer than carrying two abstractions for the whole application.

**Read paths use `AsNoTracking()` and project directly onto DTOs in the query.**
Loading full entities and mapping them afterwards fetches every column,
including the full Markdown body of every project, to build a list view. That is
the most common cause of an ORM being blamed for slowness.

**Migrations never run at application startup.** They run as a separate one-off
step in the pipeline, before the new containers start. Two containers starting
concurrently would migrate concurrently, and a migration that fails at startup
produces a crash loop instead of a clear error.

**No repository layer over EF Core.** `DbContext` is already an abstraction over
the database and implements the unit-of-work pattern. Wrapping it produces
either an interface with twenty query methods and one implementation, or
entity-returning methods that defeat projection — see
[ADR-0007](0007-vertical-slices-with-domain-core.md).

## Consequences

**Positive**

- Schema changes are reviewable, versioned and reversible.
- Compile-time-checked queries; a renamed property breaks the build rather than
  a runtime query.
- Change tracking makes write paths concise: load, invoke a domain method, save.
- The largest .NET data access ecosystem, so answers to problems exist.

**Negative / accepted costs**

- LINQ hides the generated SQL. Inefficient queries are easy to write without
  noticing.
- Bulk operations are weaker than hand-written SQL.
- A model class annotated for persistence can pull persistence concerns into the
  domain if boundaries are not kept.

**Obligations this creates**

- **Entity configuration lives in `IEntityTypeConfiguration` classes in
  Infrastructure**, not as attributes on domain entities. The domain must not
  acquire an EF Core reference ([ADR-0007](0007-vertical-slices-with-domain-core.md)).
- Every read path uses `AsNoTracking()` and projects onto a DTO.
- A global query filter excludes soft-deleted rows, so a forgotten `Where`
  clause cannot leak them.
- Indexes are declared deliberately: `Slug` unique, the slug history indexed on
  the old slug, every foreign key and filter column covered.
- Integration tests run against real PostgreSQL via Testcontainers. In-memory
  providers accept queries PostgreSQL rejects, so a green test there proves
  nothing.
- Generated SQL is inspected when a query looks expensive, rather than assumed
  to be fine.

## Why not the others

**Dapper alone** — fast, explicit, and no migration story. Schema evolution
would become hand-written scripts to order and track manually, which is exactly
the kind of task that decays in a project worked on a few hours a week. The
performance advantage is real and irrelevant at this scale.

**EF Core plus Dapper** — a legitimate pattern in systems where read and write
loads differ sharply. Here it would mean two mental models, two sets of mapping
code and two places to look for a bug, to optimise queries that are not slow.
Premature optimisation with a maintenance cost attached. If a specific query
ever needs it, EF Core's raw SQL support solves that one query without
introducing a second stack.

## Revisit when

- A read path cannot meet Q2 even with projection and appropriate indexes, and
  raw SQL within EF Core is not enough.
- Bulk import or export becomes a regular operation rather than an exception.
