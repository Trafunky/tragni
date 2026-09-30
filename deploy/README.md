# Deployment

Everything that runs on the server. These files are the source of truth; the
copies under `/opt/tragni` on the VPS are deployed artefacts, not originals.

## Current state

The walking skeleton runs. What is deployed today:

| Service | Purpose |
|---|---|
| `traefik` | TLS termination, routing, security headers |
| `web` | Next.js frontend, `Host(tragni.ch)` |
| `api` | .NET API, same origin under `/api` |
| `postgres` | PostgreSQL 18, internal network only |

Measured at idle: web 43 MB, api 21 MB, postgres 32 MB, traefik 21 MB — together
about 117 MB of 4 GB.

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
    backup.env.example        templates; the real files live only on the server
    postgres.env.example
    api.env.example
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
  secrets/            chmod 700, never in this repository
    backup.env
    postgres.env
    api.env
```

## How it is deployed

Automatically. A merge into `main` runs CI; when CI succeeds, the deploy
workflow builds both images, pushes them to GHCR tagged with the commit hash,
applies the migration script, writes that hash into `/opt/tragni/.env`, pulls,
restarts, and then polls the site until it answers — or fails (Q11).

Nothing is built on the server (T5), and nothing is deployed that has not passed
the tests.

| Where | What |
|---|---|
| GitHub Actions | build, test, images, migration script |
| `deploy` on the server | pull and restart. No `sudo`, limited to Docker and `/opt/tragni` |
| `/opt/tragni/.env` | `TRAGNI_VERSION` — the commit currently running |

### Rolling back

Not automated, and a one-liner:

```bash
cd /opt/tragni
echo "TRAGNI_VERSION=<older commit hash>" > .env
docker compose pull && docker compose up -d
```

A rollback does **not** undo a migration. Migrations are therefore written so
that the previous version still runs against the new schema: columns are added,
never removed in the same release.

### Working on the server by hand

`/opt/tragni` belongs to `deploy`. Use `sudo -u deploy …` or connect with the
deploy key; `ubuntu` has no access to it any more.

Registry credentials are stored per user. A `docker login` as `ubuntu` does
nothing for `deploy` — that cost one failed deployment to learn.

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
| Database on an `internal` network | It needs no route to the outside, and nothing but the API needs a route to it |
| Fixed image tags, never `latest` | The file states which build is running, and rolling back is a tag change |
| Health endpoints are not routed | Docker and the deployment reach them internally; they are nobody's business from outside |
| Postgres volume at `/var/lib/postgresql` | From version 18 the image stores data in a version-specific subdirectory; mounting `.../data` puts the container in a restart loop |

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

`stsSeconds` is **31536000** (one year). It was deliberately 86400 while the
system was being built: HSTS cannot be revoked, browsers remember it locally for
the stated duration. The year came with the first real page being served.

`preload` is not set and will not be: entry into the browser preload list is
effectively permanent.

## Open items

- [ ] `aliasHeadersStrategy` is unset; Traefik warns about it at startup. It
      affects backends that derive variable names from header names (CGI, PHP,
      WSGI). Neither .NET nor Node is in that class, so the risk here is low —
      but it should be configured deliberately rather than left at the default.
- [ ] Certificate lifetime as a monitored metric.
- [ ] A failed backup is currently only visible in the journal. Alerting on it
      depends on observability, which does not exist yet — see
      [backup.md](backup.md).
- [ ] `pg_dump` in the backup, now that PostgreSQL runs here — see
      [backup.md](backup.md).
- [ ] arc42 chapter 7 assumes about 250 MB for the frontend; measured at idle it
      is 43 MB. Revisit under load rather than simply lowering the number.
- [ ] Delete the personal push token `tragni-push-local`: Actions publishes the
      images now, so it is no longer needed.
- [ ] The server's read token expires 28 Dec 2026 and has to be renewed, or the
      next deployment fails at `docker compose pull`.
- [ ] Old image tags accumulate in GHCR. Decide a retention policy before it
      becomes a cleanup task.
- [ ] Several GitHub actions still target Node 20 and are forced onto Node 24;
      bump them to current majors.
