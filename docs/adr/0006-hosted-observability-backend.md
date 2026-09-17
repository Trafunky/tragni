# 0006 — Hosted observability backend

- **Status:** accepted
- **Date:** 2026-09-17
- **Deciders:** Stephan Tragni

## Context and problem statement

The system is operated part-time, with a response time of up to 24 hours (Q3b).
Under those conditions, knowing what the system is doing is not optional: it is
the only way an outage is noticed at all, and the only way the resource budget
(Q10) and response-time target (Q2) can be verified rather than guessed.

The constraint is the server: 2 vCPU and 4 GB RAM (A1), of which roughly 1.5 GB
is budgeted for the base stack and the remainder is reserved for project demos.

A self-hosted metrics, logs and dashboard stack costs approximately 700 MB to
1 GB — most of the demo budget, spent on infrastructure that is never shown.

## Considered options

1. **Self-hosted stack** — Prometheus, Loki and Grafana as containers
2. **Hosted backend** — instrumentation on the server, storage and dashboards
   external
3. **No observability for now** — add it later

## Decision

Chosen: **hosted backend**.

The application is instrumented with **OpenTelemetry** — traces, metrics and
structured logs. A lightweight OTel Collector runs on the server (roughly
80 MB) and forwards to a hosted backend whose free tier covers this volume
comfortably.

The important point is that the instrumentation is **vendor-neutral**. The skill
being practised is OpenTelemetry instrumentation, not the operation of
Prometheus. If the hosted backend ever becomes unsuitable, the collector is
repointed — a configuration change, not a rewrite.

Observability is part of the MVP, not a later phase. Deferring it would mean
having no measurements at the moment the first decisions about capacity and
performance have to be made.

## Consequences

**Positive**

- Around 900 MB of RAM stays available for demos.
- Dashboards are reachable from anywhere, including from a phone, which matches
  how this system is actually operated.
- Alerting exists without running an alerting stack.
- A working dashboard is something that can be shown in an interview.

**Negative / accepted costs**

- Telemetry leaves the server and leaves Switzerland, on a provider the project
  does not control.
- Dependency on a free tier whose terms may change.
- If the external service is unreachable, telemetry is lost; the collector
  buffers only briefly.

**Obligations this creates**

- **Telemetry must contain no personal data.** No request bodies, no cookie or
  authorisation headers, no email addresses, no full IP addresses. This is
  checked when instrumentation is added, not afterwards.
- Retention and volume are monitored so the free tier is not silently exceeded.
- The collector endpoint and credentials are secrets and live in `.env`, never
  in the repository (A8).
- The status page (stage A1) draws from the same metrics, so metric naming is
  chosen with that in mind.

## Why not the others

**Self-hosted stack** — the option that would look most impressive in a
screenshot, and the one this server cannot afford. Spending a third of total
memory on observability for a system whose visible purpose is to host demos is
the wrong trade. It also adds real operational work — retention, disk usage,
upgrades — on a system explicitly optimised for low operational load.

**No observability for now** — the historical default in the earlier draft,
where monitoring was the sixth phase. With a 24-hour response time and no
redundancy, it is the wrong thing to defer: without measurements, the resource
budget (Q10), the response-time target (Q2) and the availability figure (Q3a)
are all unverifiable, and the decision to scale the server up would be based on
nothing.

## Revisit when

- The free tier stops covering the volume, or its terms change materially.
- Data residency becomes a requirement rather than a preference.
- The server is scaled up far enough that a self-hosted stack no longer competes
  with the demo budget.
