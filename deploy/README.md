# Deployment

Everything that runs on the server. These files are the source of truth; the
copies under `/opt/tragni` on the VPS are deployed artefacts, not originals.

## Current state

The walking skeleton is not finished. What runs today:

| Service | Purpose |
|---|---|
| `traefik` | TLS termination, routing, security headers |
| `whoami` | **Temporary.** A test container that echoes the request it received. Proves routing and TLS work end to end. Removed once the frontend exists. |

Backups run outside Docker, as a systemd timer on the host — see
[backup.md](backup.md).

## Layout

```
deploy/
  docker-compose.yml          services, networks, volumes
  docker-compose.dev.yml      PostgreSQL for local development, never deployed
  traefik/
    traefik.yml               static configuration, read at startup
    dynamic/
      security.yml            middlewares, reloaded automatically on change
  backup.sh                   restic backup, run by the systemd timer
  backup.md                   backup and restore runbook
  secrets/
    backup.env.example        template; the real file lives only on the server
  systemd/
    tragni-backup.service
    tragni-backup.timer
```

The split matters: **static** configuration (entry points, providers, ACME)
requires a restart. **Dynamic** configuration (routers, middlewares, TLS
options) is watched and applied live. Anything that may need changing while the
system serves traffic belongs in `dynamic/`.

## Server layout

```
/opt/tragni/
  docker-compose.yml
  traefik/
  secrets/            .env and similar — never in this repository (chmod 700)
```

## How it is deployed

Manually, for now: files are copied to the server and `docker compose up -d` is
run there. This is temporary. Once the CI/CD pipeline exists, deployment is
`main` → build → push to registry → pull and restart on the server
(arc42 [chapter 7](../docs/architecture/07-deployment-view.md)), with no manual
step (Q11).

## Decisions visible in these files

| What | Why |
|---|---|
| Docker socket mounted `:ro` | A container with write access to the socket is effectively root on the host — risk R3 |
| `exposedByDefault: false` | Traefik routes only containers that explicitly ask for it. The default would publish every container. |
| Only Traefik publishes ports | Docker bypasses UFW for published ports. Nothing else is published, so the host firewall stays meaningful. |
| `mem_limit` on every container | One runaway process must not take down a 4 GB host — Q10 |
| `no-new-privileges` | A process inside a container cannot gain privileges it did not start with |
| Dashboard disabled | Nothing to expose, nothing to protect — [ADR-0005](../docs/adr/0005-traefik-as-reverse-proxy.md) |
| Security headers set explicitly | Traefik sets none by default |
| Traefik version pinned | The configuration format has changed across major versions |

## Certificates

Let's Encrypt via HTTP-01 challenge on port 80. Certificates are stored in the
`traefik-certs` volume and renewed automatically about 30 days before expiry.

The ACME account uses **`ssl@tragni.ch`**, a role alias forwarding to the
operator's mailbox. It is deliberately not a personal address, so this
configuration can stay in a public repository and can be abandoned if it ever
attracts spam.

**Let's Encrypt no longer sends expiry warning emails.** A failed renewal will
not be announced — monitoring has to catch it. Planned check: certificate
remaining lifetime as a metric, alert below 21 days.

### Changing the ACME email

Editing `traefik.yml` is **not enough**. The registered account is stored in
`acme.json` inside the volume and takes precedence; Traefik reuses it and
ignores the changed address. The stored value can be checked with:

```bash
sudo grep -i email /var/lib/docker/volumes/tragni_traefik-certs/_data/acme.json
```

To actually change it, the account has to be recreated, which also re-issues the
certificates:

```bash
docker compose down
docker volume rm tragni_traefik-certs
docker compose up -d
```

### Testing certificate configuration

Point `caServer` at the Let's Encrypt **staging** endpoint first:

```yaml
caServer: https://acme-staging-v02.api.letsencrypt.org/directory
```

Staging certificates are untrusted in browsers — that is the point — and the
endpoint has no meaningful rate limits. The production endpoint locks out
further attempts for an hour after a handful of failures. Switching back uses
the same volume-removal procedure as above, otherwise Traefik keeps serving the
staging certificate.

## HSTS

`stsSeconds` is currently **86400** (one day), deliberately low while the system
is being built. HSTS cannot be revoked — browsers remember it locally for the
stated duration. It is raised to one year once the real frontend is live.

`preload` is not set and will not be: entry into the browser preload list is
effectively permanent.

## Open items

- [ ] `aliasHeadersStrategy` is unset; Traefik warns about it at startup. It
      affects backends that derive variable names from header names (CGI, PHP,
      WSGI). Neither .NET nor Node is in that class, so the risk here is low —
      but it should be configured deliberately rather than left at the default.
- [ ] Raise `stsSeconds` to 31536000 when the frontend ships.
- [ ] Remove the `whoami` service once the frontend exists.
- [ ] Certificate lifetime as a monitored metric.
- [ ] A failed backup is currently only visible in the journal. Alerting on it
      depends on observability, which does not exist yet — see
      [backup.md](backup.md).
- [ ] When PostgreSQL moves to the server: mount its volume at
      `/var/lib/postgresql`, **not** `/var/lib/postgresql/data` — from version 18
      the image stores data in a version-specific subdirectory and refuses to
      start otherwise.
