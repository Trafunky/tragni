# 0008 — No mediator framework

- **Status:** accepted
- **Date:** 2026-09-19
- **Deciders:** Stephan Tragni

## Context and problem statement

The earlier draft specified CQRS with commands and queries, which in the .NET
ecosystem almost always means MediatR. With
[ADR-0007](0007-vertical-slices-with-domain-core.md) settling on vertical
slices, the question is whether an in-process mediator still earns its place.

A mediator provides two things: indirection between the caller and the handler,
and a pipeline in which cross-cutting behaviour — validation, logging,
transactions — runs around every request.

There is also a licensing dimension. MediatR moved to a dual licence from
version 13; use remains free below a revenue threshold this project will never
approach, so licensing does not decide the question — but a dependency whose
terms changed once is worth a sentence in the record.

## Considered options

1. **MediatR** — the established library
2. **A hand-written minimal mediator** — an interface and a dispatcher
3. **Direct calls** — the endpoint calls its handler

## Decision

Chosen: **direct calls**. Endpoints invoke their handler in the same slice, or
contain the logic themselves where the slice is trivial.

The indirection a mediator provides is valuable when the caller must not know
the handler — across module boundaries, or where handlers are registered by
other assemblies. Inside a single API assembly organised by feature, the caller
and the handler are in the same file. Routing that call through a dispatcher
adds a layer whose only effect is that "go to definition" stops working.

The pipeline argument is the stronger one, and ASP.NET Core answers it directly:

| Cross-cutting need | Without a mediator |
|---|---|
| Validation | endpoint filter |
| Logging and tracing | middleware and OpenTelemetry instrumentation |
| Transactions | explicit in the slice, or a `DbContext` save interceptor |
| Authorisation | endpoint policies |
| Exception handling | exception handler middleware, producing Problem Details |

These are framework features rather than an additional dependency, and they
apply at the HTTP boundary where the concern actually lives.

## Consequences

**Positive**

- A request can be followed from route to database by reading, without knowing
  how dispatch is wired.
- One fewer dependency, one fewer registration scan at startup, no reflection
  over handler types.
- Stack traces name the actual methods.
- No licence question to revisit.

**Negative / accepted costs**

- Cross-cutting behaviour must be applied per endpoint group rather than
  centrally to every request. A forgotten filter is possible.
- CQRS with MediatR is a pattern reviewers recognise instantly; its absence has
  to be explained. This file is that explanation.
- If the API ever gains genuinely decoupled modules, dispatch will have to be
  introduced.

**Obligations this creates**

- Cross-cutting filters are applied to the endpoint **group**, not to individual
  endpoints, so a new endpoint inherits them by default.
- Endpoints are protected by default; public ones are marked explicitly. A
  forgotten marker must fail closed.
- Domain events, if introduced, get their own explicit dispatch mechanism. They
  are not a reason to adopt a general-purpose mediator.

## Why not the others

**MediatR** — a good library solving a real problem in large, modular codebases.
Here, the caller and handler sit in the same file, so its core benefit does not
apply, and its pipeline duplicates what the web framework already offers at a
more appropriate layer. Adding it would mean adopting CQRS vocabulary — command,
query, handler, behaviour — for what are ordinary method calls.

**A hand-written minimal mediator** — the worst of both. It reproduces the
indirection without the ecosystem, the documentation or the tested edge cases,
and it becomes a piece of infrastructure to maintain for no functional gain.

## Revisit when

- The API is split into modules that must not reference each other directly.
- Domain events grow beyond a handful and need routing rather than direct
  invocation.
- Cross-cutting behaviour genuinely has to run around every request regardless
  of transport — which would only happen if the API gained a second entry point
  besides HTTP.
