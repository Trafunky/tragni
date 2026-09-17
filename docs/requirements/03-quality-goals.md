# 03 — Quality Goals

## Priority

Where goals conflict, the higher position wins. If everything is important,
nothing is.

1. **Maintainability and traceability** — the system must be understandable
   again within one evening after a three-month break, and an outside developer
   must be able to read up on the decisions.
2. **Operability** — outages are noticed before anyone else notices them. A
   restore has been rehearsed. A deployment is a button, not a ritual.
3. **Performance and discoverability** — public pages are fast and crawlable.
   The first minute decides.
4. **Security** — appropriate for a public system with a single admin, without
   security theatre.
5. **Extensibility** — new projects and demos are added, not built in.

> Maintainability deliberately outranks performance. Faced with a choice between
> an elegant optimisation and readable code, readable code wins.

## Measurable requirements

| # | Requirement | Metric | Verified by | Gate |
|---|---|---|---|---|
| Q1 | Frontend load time | LCP < 2.0 s · CLS < 0.1 · INP < 200 ms (mobile, 4G) | Lighthouse CI | blocks PR |
| Q2 | API response time | p95 < 200 ms for reads | OTel metric | alert |
| Q3a | Availability | ≥ 97 % / month, excluding planned maintenance | external uptime check | status page |
| Q3b | Response time to an incident | ≤ 24 h | operations log | documented |
| Q3c | Self-healing | container restart without manual intervention | chaos test (kill a container) | architecture rule |
| Q4 | SEO | Lighthouse SEO ≥ 95; all public pages SSG/ISR | Lighthouse CI | blocks PR |
| Q5 | Accessibility | WCAG 2.2 AA, no critical axe findings | axe-core in E2E | blocks PR |
| Q6a | Test coverage | domain ≥ 90 % · application ≥ 85 % · frontend logic ≥ 80 % · frontend components ≥ 60 % | coverage report | blocks PR |
| Q6b | Test quality | mutation score ≥ 70 % on the domain layer | Stryker.NET | observed |
| Q6c | Regression | every bug fix starts with a failing test | review / commit history | architecture rule |
| Q7 | Build duration | pipeline < 5 min to deployable | workflow runtime | observed |
| Q8 | Container security | no high or critical CVEs in the production image | Trivy | blocks PR |
| Q9 | Backup | RPO ≤ 24 h · RTO ≤ 30 min | restore rehearsal, quarterly | logged |
| Q10 | Resource budget | base stack ≤ 1.5 GB RSS | OTel host metrics | alert if p95 > 75 % |
| Q11 | Deployment automation | `main` → production with no manual step | pipeline definition | architecture rule |
| Q12 | Traceability | every architecture decision has an ADR | PR review | architecture rule |
| Q13 | Demo integration | a new demo requires no platform code change | verified with the first demo | architecture rule |
| Q14 | Publishing effort | publishing a new project ≤ 1 evening, no deployment | self-measured | observed |

## Notes on individual goals

### Q3 — availability, RTO and RPO are three different things

- **RTO** is the *technical* recovery time: from "I start" to "it runs again".
  Realistically 10–15 minutes at this data volume.
- **RPO** is the maximum data loss. With daily backups, up to 24 h — at worst
  one project entry from the previous evening.
- **Response time** (Q3b) is something else: how long until anyone looks at all.
  Part-time operation means up to 24 h.

A single unnoticed overnight outage breaks a 99 % target. 97 % with a documented
rationale is more honest, and reads as more professional, than a figure the
status page later contradicts.

### Q3c — self-healing substitutes for response time

Because nobody can respond immediately, the system has to help itself:
`restart: unless-stopped` plus health checks on every container, memory limits
per container, swap against the OOM killer, `unattended-upgrades` for security
patches without automatic reboot, an uptime check with notification. The large
majority of real outages in this setup are a crashed container or a full disk —
Q3c covers both.

### Q6 — coverage is a floor, not a target

Coverage becomes harmful the moment it becomes the target: tests that touch
every line and assert nothing. The number only catches the case where a whole
module slips through untested. Q6b is what says something about test quality.

**Excluded from the coverage gate:** `Program.cs`, EF Core migrations, generated
code, DTOs without behaviour, and infrastructure repositories (covered by
integration tests against real PostgreSQL via Testcontainers, not by unit tests).

**TDD scope:** test-driven development applies to logic with clear inputs and
outputs — slug generation and history, validation rules, authorisation policies,
publication state transitions, image variant calculation. Not test-driven: UI
presentation and code that primarily drives a framework.

### Introducing the gates

Blocking checks are switched on only once the walking skeleton is in place. A
pipeline that goes red on day two because of a coverage target on an empty
project leads to the gate being switched off — and then it stays off. The order
is: measure and report first, enforce second.
