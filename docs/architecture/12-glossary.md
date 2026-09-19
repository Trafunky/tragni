# 12 — Glossary

The ubiquitous language — the terms used identically in documentation, code,
database and interface — is maintained in one place:

**→ [Glossary](../requirements/05-glossary.md)**

It is not duplicated here. A term that exists in two places will eventually
disagree with itself.

## Architecture terms used in this document

Terms that appear in these chapters but are not part of the domain language.

| Term | Meaning here |
|---|---|
| **Base stack** | Proxy, web, API, database and collector. Everything except demos. The subject of the resource budget (Q10). |
| **Slice** | One use case in the API, as a single file holding its endpoint, handler, validator and types. |
| **Domain core** | `Tragni.Domain` — entities, value objects and rules, with no framework dependency. The test-driven surface. |
| **Edge network** | The Docker network holding the proxy, web and API. The only one with a container bound to a host port. |
| **Data network** | The internal Docker network holding the database. Never published to the host. |
| **Demo network** | One isolated network per demo. Reachable by the proxy, and by nothing else. |
| **Demo contract** | What a demo must provide: an image in the registry, HTTP on a defined port, a health endpoint, a routing target, resource limits. |
| **Token exchange** | The API issuing a short-lived signed token for one specific project. The project verifies the signature and holds no credentials. |
| **Revalidation** | Invalidating a cached page so the next request regenerates it. How publishing becomes visible without a deployment. |
| **Liveness / readiness** | Liveness: the process is alive, used by the restart policy. Readiness: dependencies are reachable, used by the proxy and the deployment check. |
| **Walking skeleton** | The thinnest end-to-end path — browser, web, API, database — built in CI and deployed with TLS and a health check. Built before the first feature. |
| **Path filter** | A CI condition restricting a workflow to changes under a given directory, so one application's change does not rebuild the other. |

## Abbreviations

| Short | Long |
|---|---|
| ADR | Architecture Decision Record |
| CLS | Cumulative Layout Shift |
| INP | Interaction to Next Paint |
| LCP | Largest Contentful Paint |
| OIDC | OpenID Connect |
| OTLP | OpenTelemetry Protocol |
| RPO | Recovery Point Objective — maximum acceptable data loss |
| RTO | Recovery Time Objective — maximum acceptable time to restore |
| SSG / ISR | Static Site Generation / Incremental Static Regeneration |
| WCAG | Web Content Accessibility Guidelines |
