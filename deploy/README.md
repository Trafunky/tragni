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

Images are built locally, pushed to GitHub Container Registry and pulled on the
server. The build never runs on the server (constraint T5).

```powershell
docker build -t ghcr.io/trafunky/tragni-api:<version> apps/api
docker build -t ghcr.io/trafunky/tragni-web:<version> -f apps/web/Dockerfile .
docker push ghcr.io/trafunky/tragni-api:<version>
docker push ghcr.io/trafunky/tragni-web:<version>
```

Then the tags in `docker-compose.yml` are raised, the file is copied to the
server, and there:

```bash
cd /opt/tragni && docker compose pull && docker compose up -d
```

Migrations are a separate step and never run on application startup
([ADR-0009](../docs/adr/0009-ef-core-for-data-access.md)). The script is
generated locally and applied on the server:

```powershell
dotnet ef migrations script --idempotent --project apps/api/src/Tragni.Infrastructure --startup-project apps/api/src/Tragni.Api -o migrate.sql
scp migrate.sql ubuntu@<server>:/home/ubuntu/migrate.sql
```

```bash
docker compose exec -T postgres sh -c 'PGPASSWORD=$POSTGRES_PASSWORD psql -U tragni -d tragni' < /home/ubuntu/migrate.sql
```

**This whole procedure is temporary.** The pipeline replaces it: build, test,
push and deploy on merge to `main`, with no manual step (Q11, #27).

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
- [ ] The registry tokens expire: push token 29 Oct 2026, server read token
      28 Dec 2026. The pipeline makes the push token unnecessary (#27); the
      server token has to be renewed.
- [ ] `pg_dump` in the backup, now that PostgreSQL runs here — see
      [backup.md](backup.md).
- [ ] arc42 chapter 7 assumes about 250 MB for the frontend; measured at idle it
      is 43 MB. Revisit under load rather than simply lowering the number.
