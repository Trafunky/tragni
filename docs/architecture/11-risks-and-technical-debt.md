# 11 — Risks and Technical Debt

Written plainly. A risk register that lists only manageable risks is a
marketing document.

## Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **Single point of failure.** One VPS, no redundancy. Hardware or provider failure takes everything down. | low | high | Accepted. Recovery relies on off-server backups and a rehearsed restore (Q9). The availability target is set accordingly. |
| R2 | **The project stalls.** Four to eight hours a week, long gaps. A portfolio that stands still is worse than none. | **medium** | **high** | Scope cut to a catalogue; publishing designed to cost one evening (Q14); issues with acceptance criteria so re-entry is cheap. |
| R3 | **Docker socket access for the proxy.** A container with the socket is effectively root on the host. | low | **high** | Socket mounted read-only; a socket proxy once third-party demos run; dashboard not publicly exposed ([ADR-0005](../adr/0005-traefik-as-reverse-proxy.md)). |
| R4 | **Demos are third-party code on the same host.** A compromised demo is an attacker inside the perimeter. | medium | high | Network isolation per demo, resource limits, no Docker socket, no database access, identity only through short-lived tokens. Demos never share a network. |
| R5 | **Resource exhaustion.** 4 GB with no headroom; a runaway process takes the host down. | medium | medium | Memory limit on every container, swap with low swappiness, budget tracked as a metric with a defined scaling trigger (Q10). |
| R6 | **Free tier dependency.** The observability backend could change its terms. | medium | low | Instrumentation is vendor-neutral OpenTelemetry; switching is a collector configuration change ([ADR-0006](../adr/0006-hosted-observability-backend.md)). |
| R7 | **Framework caching semantics.** The frontend's caching model has changed across major versions; subtle staleness bugs are easy to introduce. | **medium** | medium | Version pinned; documentation read for the pinned version rather than blog posts; publishing verified end-to-end in the test suite. |
| R8 | **Secret leaked into a public repository.** | low | high | `.gitignore`, secret scanning and push protection enabled, `.env.example` only. A leaked secret is rotated, not deleted. |
| R9 | **Untested restore.** A backup that has never been restored is a hope, not a backup. | medium | **high** | Quarterly restore rehearsal into a fresh container, with a smoke test and a written log (Q9). |
| R10 | **Bus factor of one.** Nobody else knows how this runs. | certain | low | Accepted for a personal project. Partly mitigated by the documentation being the point of the project. |

R2 is the most likely to actually materialise, and it is the one the
architecture is most shaped around. Every decision that reduced ceremony —
monorepo, vertical slices, no mediator, one frontend application — was made
with R2 in view.

## Known technical debt

Nothing is built yet, so this is debt taken on **deliberately at design time**,
not accumulated by accident. Each item is a conscious trade, recorded so that a
reader does not mistake it for an oversight.

| # | Debt | Why it is accepted | When to address |
|---|---|---|---|
| D1 | **No staging environment.** Changes go from local to production. | A second environment costs roughly what production costs, on a machine with no spare capacity. | If deployments start breaking production, or if the platform gains users who are not the owner. |
| D2 | **No blue-green or rolling deployment.** Restarting means a few seconds of downtime. | Within the availability target; the complexity is not justified at this traffic. | If availability becomes a real requirement rather than a documented figure. |
| D3 | **Media served from a volume, not object storage.** | One less moving part; Swiss Backup is backup, not live storage (A2). | If media volume outgrows the disk, or if a CDN becomes worthwhile. |
| D4 | **In-process caching only, no Redis.** | A single API instance has nothing to share cache with. | If a second instance ever runs, in-process caching becomes incorrect, not just suboptimal. |
| D5 | **No rate limiting beyond the proxy.** | Sufficient for current traffic. | Before the first public write endpoint — a contact form or a demo that accepts input. |
| D6 | **Backup covers data, not the server.** Rebuilding means reinstalling Docker and restoring volumes by hand. | Infrastructure as code for one server is more effort than the rebuild it saves. | If the rebuild path is ever needed and proves slower than the RTO allows. |
| D7 | **Demo lifecycle is manual.** Starting, stopping and updating a demo is an operator action. | No demos exist yet; automating an unbuilt process is guesswork. | Once the third demo exists. Before that, the process is not yet understood well enough to automate. |

## Explicitly not technical debt

Things that may look like gaps and are not:

- **No CQRS, no mediator, no repository layer** — deliberate, argued in
  [ADR-0007](../adr/0007-vertical-slices-with-domain-core.md) and
  [ADR-0008](../adr/0008-no-mediator-framework.md). Adding them later is a
  mechanical refactor; removing them would not be.
- **No Kubernetes** — a handful of containers on one host. An orchestrator here
  would be complexity without a corresponding problem.
- **97 % availability rather than 99.9 %** — the honest figure for this
  architecture, not a target that was missed.
- **A blog that does not exist** — removed from scope on purpose
  ([Scope](../requirements/02-scope.md)).
