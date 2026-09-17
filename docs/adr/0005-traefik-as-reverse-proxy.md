# 0005 — Traefik as the reverse proxy

- **Status:** accepted
- **Date:** 2026-09-17
- **Deciders:** Stephan Tragni

## Context and problem statement

One public entry point terminates TLS and routes to the frontend and the API.
Later, project demos are added as additional containers, each reachable under
its own path or subdomain — supplied by other people, in other languages, on
their own schedule (persona P4).

Quality goal Q13 requires that adding a demo needs **no code or configuration
change to the platform**. That requirement points directly at how routing is
configured.

An earlier draft used Nginx with a Certbot companion container.

## Considered options

1. **Nginx + Certbot** — static configuration files, certificates renewed by a
   companion container
2. **Traefik v3** — routing derived from container labels, ACME built in
3. **Caddy** — automatic HTTPS, minimal configuration

## Decision

Chosen: **Traefik v3**.

Routing is declared as labels on the container being routed to. A new demo
brings its own routing rule with it; the platform's configuration is not
touched. That is Q13 satisfied by construction rather than by discipline.

Certificate issuance and renewal are built in, with no companion container, no
renewal hook and no reload script.

Traefik is also widely used in exactly this shape — Docker Compose on a single
host — which makes it a more useful thing to know than the alternatives.

## Consequences

**Positive**

- Adding or removing a demo is a compose entry, not a proxy change.
- One fewer moving part than Nginx + Certbot: no companion container, no
  renewal cron, no reload hook.
- Built-in metrics and health information, which feed the later status page.

**Negative / accepted costs**

- Middleware configuration (security headers, rate limiting, redirects) is more
  verbose as labels than as an Nginx config block, and the label syntax takes
  getting used to.
- Traefik needs access to the Docker socket to discover containers. **A
  container with the Docker socket is effectively root on the host.**
- Serving static assets directly is less of a strength than with Nginx.

**Obligations this creates**

- The Docker socket is mounted **read-only**, and a socket proxy in front of it
  is preferred once demos from other people run on the same host.
- The Traefik dashboard is **not** exposed publicly, or only behind
  authentication.
- Security headers (CSP, HSTS, `X-Content-Type-Options`, frame options) are
  configured explicitly as middleware — Traefik sets none of these by default.
- Demos run in their own Docker networks, isolated from the platform's network.
  Traefik reaching a demo must not imply the demo can reach the database.
- The version is pinned. Traefik has changed its configuration format across
  major versions before.

## Why not the others

**Nginx + Certbot** — works, and is the most widely understood option. Rejected
because its configuration is static: every new demo means editing a config file
on the server, reloading, and keeping certificate renewal hooks in step. That
turns Q13 into manual work, which is precisely the friction that makes things
not get done (persona P3).

**Caddy** — the simplest of the three and genuinely appealing for automatic
HTTPS. Rejected narrowly: dynamic per-container routing needs a plugin rather
than being the native model, and Caddy appears less often in the environments
this project is meant to demonstrate familiarity with. Simplicity is a real
advantage; it did not outweigh the routing model here.

## Revisit when

- Demos stop being part of the plan, in which case a static proxy configuration
  is simpler and the main argument disappears.
- The platform moves to an orchestrator with its own ingress layer.
