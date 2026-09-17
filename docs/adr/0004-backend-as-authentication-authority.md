# 0004 — Backend as the authentication authority

- **Status:** accepted
- **Date:** 2026-09-17
- **Deciders:** Stephan Tragni

## Context and problem statement

The admin area has to be protected. Today there is exactly one user. Later there
will be contributors who manage their own projects, and later still, projects
that need to know which user is interacting with them (see
[02-scope.md](../requirements/02-scope.md), A6).

The frontend and the API are separate applications. Something has to decide
where the session lives and who verifies it. An earlier draft had the frontend
run the OAuth flow with a frontend auth library and the .NET API verify
self-issued JWTs — which means hand-writing token issuance, signing, lifetime
and key rotation.

No passwords are to be stored (see [02-scope.md](../requirements/02-scope.md),
non-goals).

## Considered options

1. **Frontend as the authority** — frontend auth library runs the OAuth flow and
   issues tokens the API verifies
2. **Backend as the authority** — the API runs the OIDC flow against an external
   provider and issues a cookie-based session
3. **Dedicated identity provider** — Keycloak as an additional container

## Decision

Chosen: **backend as the authority**, with cookie-based sessions and an external
OIDC provider (GitHub) for identity.

The reverse proxy serves the frontend and the API on the **same origin**
(`tragni.ch` and `tragni.ch/api`). This makes cookie authentication
straightforward: no CORS, no token in browser-reachable storage, nothing to
refresh in the client.

Flow: the browser hits the API's sign-in endpoint → the API runs the OIDC flow
with the external provider using the framework's built-in handler → the API maps
the external identity to a local `User` record and role → the API sets an
HttpOnly, Secure, SameSite cookie. The frontend contains **no authentication
logic at all**.

No passwords exist, so there is nothing to store, leak or reset, and no password
reset flow — which also avoids sending email from the server, a known weak point
on a fresh VPS.

Because public pages are static or incrementally regenerated and the admin area
is rendered client-side against the API, the same-origin cookie model fits the
page architecture rather than fighting it.

## Consequences

**Positive**

- No hand-written token issuance. The risky part is handled by the framework and
  the external provider.
- No token reachable from JavaScript, so XSS cannot exfiltrate a session.
- Adding a contributor later is an entry in the user table and a role, not a
  feature.
- Adding a second provider later is configuration, because identity is modelled
  as `Provider` + `ExternalId` rather than a provider-specific field.

**Negative / accepted costs**

- Sign-in requires an account with the external provider. Acceptable while the
  only people signing in are the admin and, later, contributors — participants
  in project demos use transient identities and never sign in (A7).
- Same-origin is now a requirement, not a convenience. The proxy configuration
  is part of the authentication design.
- Cookie authentication requires CSRF protection, which token-in-header schemes
  do not.

**Obligations this creates**

- **Data protection keys must be persisted** outside the container (volume or
  database). Otherwise every API restart invalidates all sessions — and
  restarts are expected, because containers restart themselves (Q3c).
- **Antiforgery tokens on every write request**, plus `SameSite` set
  restrictively.
- **The cookie domain is scoped tightly to the main host.** Demo subdomains must
  never receive the admin cookie. This becomes critical once third-party demos
  run on the same server.
- Authorisation is expressed as **policies**, never as role comparisons in code,
  so that new roles do not require touching call sites.
- Projects receive identity only through short-lived signed tokens issued by the
  platform (A6) — never by sharing this cookie.

## Why not the others

**Frontend as the authority** — frontend auth libraries are built for the case
where the frontend *is* the application. With a separate resource backend,
something must issue a token the backend trusts, and that ends in hand-rolled
signing, lifetimes and key rotation. This is the part of authentication where
mistakes are invisible until someone finds them.

**Keycloak** — the strongest option on paper and the most recognisable name in
job listings. Rejected on resources: 500–700 MB plus its own database on a 4 GB
server (A1) is roughly a third of the budget for demos, spent on a single user.
It also brings realm configuration and regular major-version upgrades — ongoing
operational load with no return for this system. Learning it is better served by
making it part of a project *on* the platform, where multiple roles are
functionally justified, than by hiding it in the platform's own infrastructure.

## Revisit when

- Sign-in is needed for people who cannot reasonably be expected to hold an
  account with a supported provider.
- A project on the platform genuinely requires full OIDC provider capabilities
  (token exchange for third parties, fine-grained scopes, user federation).
- The server is scaled up such that a dedicated identity provider no longer
  competes with the demo budget.
