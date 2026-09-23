# 0013 — openapi-typescript and openapi-fetch for the generated client

- **Status:** accepted
- **Date:** 2026-09-23
- **Deciders:** Stephan Tragni

## Context and problem statement

[ADR-0003](0003-monorepo-over-polyrepo.md) makes the generated client the single
contact point between the two applications. It does not say what "generated
client" means in practice, and the available tools differ less in correctness
than in what they leave behind in the repository.

Two properties of this system narrow the field. Next.js hangs caching and
revalidation off `fetch`: a client that brings its own HTTP stack silently opts
out of both. And Q1 (LCP under 2.0 s) makes anything shipped to the browser
worth counting.

## Considered options

1. **openapi-typescript plus openapi-fetch** — types only, and a thin typed
   wrapper around `fetch`
2. **NSwag or Kiota** — generated client classes, the common choice in the .NET
   ecosystem
3. **@hey-api/openapi-ts** — a full client, optionally with Zod schemas and
   framework bindings

## Decision

Chosen: **openapi-typescript** to generate the types, **openapi-fetch** to call
the API.

The output is a single `.d.ts` file and no runtime code. There is no generated
client to read, review or accidentally edit, and nowhere for logic to
accumulate — a generated client class is exactly the place where someone
eventually adds a "small" rule that then exists in neither application.

`fetch` stays `fetch`, so Next.js keeps its caching, revalidation and request
deduplication. That is not a detail: it is the mechanism CV-04 and Q14 depend
on.

The runtime is roughly two kilobytes.

## Consequences

**Positive**

- One generated file, ignored by Git, regenerated from the committed
  specification. No generated code in review.
- Paths, parameters and responses are typed; a renamed field fails the frontend
  build (verified).
- Next.js caching keeps working because the underlying call is `fetch`.
- Almost nothing added to the browser bundle (Q1).

**Negative / accepted costs**

- **No runtime validation.** The types state what the server promised, not what
  it sent. A server that lies produces a type-correct crash further down.
- Calls name their path as a string — typed and checked, but less discoverable
  than a method per endpoint.
- Error responses are typed loosely, so error handling is written by hand.

**Obligations this creates**

- The specification is committed, the generated types are not; generation runs
  on `pnpm install` and in the pipeline.
- Runtime validation at the boundary (arc42 chapter 8) is decided when the first
  endpoint carries real data. Until then, the frontend must treat a failed
  request as a normal case, not as an exception.
- `apps/web/src/lib/api.ts` remains the only place that constructs a client.

## Why not the others

**NSwag or Kiota** — the obvious choice for a .NET shop, and a good one for a
.NET consumer. Both generate a client with their own abstractions over HTTP,
which replaces `fetch` and with it Next.js's caching. They also produce a lot of
code, which either lands in the repository or has to be built on every install.

**@hey-api/openapi-ts** — capable and actively maintained, and it can generate
Zod schemas alongside the types, which is exactly what the open point above will
need. It loses today on output size and configuration surface for a client with
one endpoint. It is the first candidate to re-evaluate when runtime validation
is added.

## Revisit when

- Runtime validation at the boundary is introduced — generated schemas would
  then come from the same source as the types.
- The API is consumed outside the browser, where an ergonomic generated client
  weighs more than bundle size.
