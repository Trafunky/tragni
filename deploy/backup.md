# Backup & Restore

Quality goal Q9: **RPO ≤ 24 h, RTO ≤ 30 min.** Restore rehearsed quarterly and
logged.

## How it works

[restic](https://restic.net) backs up to Infomaniak Swiss Backup over S3.
Encryption happens **on this server, before upload** — the provider stores
ciphertext only. Data is deduplicated at block level, so an unchanged daily
backup transfers nothing.

| | |
|---|---|
| Schedule | daily, 03:30 + up to 15 min jitter (systemd timer) |
| Runs as | `deploy`, the owner of `/opt/tragni` |
| Script | `backup.sh`, installed by the deployment pipeline with every deployment |
| Retention | 7 daily · 4 weekly · 6 monthly |
| Target | Infomaniak Swiss Backup, S3, 20 GB allocated |
| Credentials | `/opt/tragni/secrets/backup.env`, mode 600, never in this repository |

## ⚠️ The restic password

Without it, **every backup is permanently unreadable**. There is no recovery
path, no support channel, no back door. It is stored in a password manager and
at a second, independent location.

The S3 keys are a different matter: they can be rotated in the Infomaniak
manager at any time, and `backup.env` updated afterwards. The restic password
can be changed with `restic key add` / `restic key remove` without recreating
the repository — but only while an existing password is still known.

## What is backed up

`/opt/tragni` — configuration, `secrets/` (which exists nowhere else), the image
version the server runs (`.env`), and the database dump in `data/`. Most of the
configuration is in this repository too; `secrets/` and the database are not.

**PostgreSQL** is backed up as a dump, never as its data directory. A running
database directory copied file by file produces an inconsistent snapshot at
best. Before each backup, `backup.sh` runs `pg_dump` inside the container and
writes `/opt/tragni/data/tragni.dump` — custom format, uncompressed (restic
compresses and deduplicates better than a pre-compressed file allows), mode 600.
Only the newest dump is kept on disk; older ones live in the snapshots, under the
same retention as everything else. If the dump fails, the whole backup fails.

**Uploaded media** gets a bind mount under `/opt/tragni/data/` rather than a
named volume, so the backup runs unprivileged and needs no path into
`/var/lib/docker`.

---

# Restore

## Preparation — needed in every case

`secrets/` is readable by `deploy` only, so restores and inspections run as
that user:

```bash
sudo -iu deploy
set -a && source /opt/tragni/secrets/backup.env && set +a
```

If `backup.env` itself is gone (new server), recreate it from the password
manager using [`secrets/backup.env.example`](secrets/backup.env.example) as the
template. **This is the step that makes the password manager load-bearing.**

List what is available:

```bash
restic snapshots
```

## Case 1 — a single file was lost or damaged

```bash
restic restore latest --target /tmp/restore --include /opt/tragni/traefik/traefik.yml
```

Then copy the file into place by hand. Restoring straight over a live directory
risks replacing more than intended.

## Case 2 — restore to an earlier point in time

```bash
restic snapshots                      # find the snapshot ID
restic restore <id> --target /tmp/restore
diff -r /opt/tragni /tmp/restore/opt/tragni
```

Inspect the difference **before** copying anything back.

## Case 3 — the database is lost or damaged, the server is fine

Take the dump from a snapshot from *before* the damage — not the one in
`/opt/tragni/data/`, which a backup run since may already have overwritten with
damaged data:

```bash
restic snapshots                      # choose the snapshot
restic restore <id> --target /tmp/restore --include /opt/tragni/data/tragni.dump

cd /opt/tragni
docker compose stop api
docker exec postgres dropdb -U tragni --if-exists tragni
docker exec postgres createdb -U tragni tragni
docker exec -i postgres pg_restore -U tragni -d tragni < /tmp/restore/opt/tragni/data/tragni.dump
docker compose start api
```

This **replaces the live database**. The API is stopped so that nothing writes
to it in between. `dropdb` / `createdb` / `pg_restore` into an empty database is
exactly the path the rehearsal exercises. `docker exec -i` keeps stdin open for
the dump; never add `-t`, which would rewrite the binary stream.

## Case 4 — the server is gone, rebuild from scratch

This is the path Q9's 30-minute RTO refers to.

> **Not yet rehearsed end to end.** The database part (step 10) is the same as
> the rehearsal; everything else has never been exercised on a fresh server.
> See the open items.

1. Provision a VPS, Ubuntu LTS, SSH key from the Infomaniak key store
2. Harden: UFW, swap, `PermitRootLogin no`, unattended-upgrades
3. Install Docker and restic
4. Create the `deploy` user and add it to the `docker` group
5. Recreate `/opt/tragni/secrets/backup.env` from the password manager
   (owner `deploy`, mode 600)
6. Restore as root, so that ownership and modes come back as they were, then
   make sure everything belongs to `deploy`:
   ```bash
   sudo bash -c 'set -a && source /opt/tragni/secrets/backup.env && set +a && restic restore latest --target /'
   sudo chown -R deploy:deploy /opt/tragni
   ```
7. Install the systemd units — see
   [Installing or updating the systemd units](#installing-or-updating-the-systemd-units)
8. Give the pipeline access to the new server. Generate a new key pair for
   `deploy`: the public half goes into `~deploy/.ssh/authorized_keys`, the
   private half replaces the GitHub secret `DEPLOY_SSH_KEY`. The server has a
   new host key, so replace `DEPLOY_KNOWN_HOSTS` with the output of
   `ssh-keyscan <host>`.
9. Start the database alone and wait until it is healthy:
   ```bash
   cd /opt/tragni && docker compose up -d --wait postgres
   ```
10. Restore the dump into the fresh, empty database:
    ```bash
    docker exec -i postgres pg_restore -U tragni -d tragni < /opt/tragni/data/tragni.dump
    ```
11. Log in to GHCR as `deploy` with a read-only token (`docker login ghcr.io`).
    The server's registry login lives in `deploy`'s home directory, which is
    not part of the backup — create a new token rather than looking for the
    old one.
12. `docker compose up -d` — this pulls the version recorded in the restored
    `.env`. If that image no longer exists in GHCR, re-run the latest *Deploy*
    workflow instead, which needs step 8.
13. Point DNS at the new IP address if it changed

Certificates are **not** restored — Traefik requests new ones automatically.
That is why the ACME volume is deliberately not part of the backup.

## Always clean up afterwards

```bash
rm -rf /tmp/restore
```

A restore of `secrets/` or the database dump leaves sensitive data in `/tmp`.

---

# Rehearsal

Quarterly, logged below. A backup whose restore has never been exercised is a
hope, not a backup (risk R9).

Minimum procedure, as `deploy` after the preparation step above. Files first:

```bash
mkdir -p /tmp/restore-test
restic restore latest --target /tmp/restore-test
diff -r /opt/tragni /tmp/restore-test/opt/tragni && echo IDENTICAL
ls -l /tmp/restore-test/opt/tragni/secrets/     # must be -rw-------
ls -l /tmp/restore-test/opt/tragni/data/        # must be -rw-------
```

Then the database — the dump from the snapshot, never the one on disk, into a
throwaway database, never the live one:

```bash
docker exec postgres createdb -U tragni tragni_restore_test
docker exec -i postgres pg_restore -U tragni -d tragni_restore_test < /tmp/restore-test/opt/tragni/data/tragni.dump
docker exec postgres psql -U tragni -d tragni_restore_test -c 'SELECT * FROM "__EFMigrationsHistory";'
docker exec postgres psql -U tragni -d tragni -c 'SELECT * FROM "__EFMigrationsHistory";'
docker exec postgres dropdb -U tragni tragni_restore_test
rm -rf /tmp/restore-test
```

Both queries must return the same rows. The migration history only proves the
schema: once the database holds content, compare the row counts of the main
tables as well.

Checking file modes is part of it: a restore that returns secrets with open
permissions is a failed restore, even if the content is correct.

| Date | Result | Notes |
|---|---|---|
| 2026-09-20 | passed | First rehearsal, right after setup. 5 files, content identical, modes preserved. |
| 2026-10-17 | passed | First rehearsal with the database. Dump restored from snapshot `f15cebe4` into a throwaway database; migration history identical (`InitialCreate`, EF Core 10.0.12); mode preserved. Dump only — files last checked on 2026-09-20. |

---

# Operations

## Check status

```bash
systemctl list-timers tragni-backup.timer      # when it next runs
systemctl status tragni-backup.service         # how the last run went
journalctl -u tragni-backup.service -n 50      # output of the last run
```

The journal shows that a run was *attempted*. Only the snapshot list shows that
one *succeeded* — the date of the newest snapshot is the check that counts:

```bash
sudo -u deploy bash -c 'set -a; source /opt/tragni/secrets/backup.env; set +a; restic snapshots --latest 1'
```

## Run manually

```bash
sudo systemctl start tragni-backup.service
```

## Installing or updating the systemd units

`backup.sh` is installed by the deployment pipeline with every deployment. The
units are not: they change rarely and installing them needs root. Copy them from
this repository so the server never drifts from it:

```bash
# on your machine, from the repository root
scp deploy/systemd/tragni-backup.service deploy/systemd/tragni-backup.timer ubuntu@tragni.ch:/tmp/

# on the server, as ubuntu
grep -c $'\r' /tmp/tragni-backup.*      # must print 0 for both files
sudo install -m 644 -o root -g root /tmp/tragni-backup.service /tmp/tragni-backup.timer /etc/systemd/system/
rm /tmp/tragni-backup.*
sudo systemctl daemon-reload
sudo systemctl enable --now tragni-backup.timer
```

Windows line endings break a unit without a clear error: systemd reads
`User=deploy\r` as a user that does not exist.

The service runs as `deploy`, the owner of `/opt/tragni`. If that ownership
changes, the backup stops working — it did once, see
[Incidents](#incidents).

## Repository integrity

`restic check` runs after every backup and verifies structure. To also verify
stored data — which downloads it and therefore costs time and bandwidth:

```bash
restic check --read-data-subset=10%
```

Worth doing occasionally, not daily.

## Open items

- [ ] Failed backups are currently only visible in the journal. Once
      observability exists, a failed run and a stale last-successful-backup
      timestamp both need to raise an alert. **Until then, nobody is watching.**
      This has already happened once — see [Incidents](#incidents).
- [x] Add the `pg_dump` step — done 2026-10-17, rehearsed the same day.
- [ ] Rehearse Case 4 end to end on a throwaway server. It is the procedure the
      RTO depends on, and the one least tested.
- [ ] Set a calendar reminder for the quarterly rehearsal — next due mid-January
      2027. An undated intention does not happen.

---

# Incidents

## 2026-10: backup failing unnoticed for 17 days

From 1 to 17 October 2026, every scheduled run failed with `Permission denied`
(status 203/EXEC). On 30 September `/opt/tragni` had been handed to the `deploy`
user for the deployment pipeline, while the service still ran as `ubuntu`,
which could no longer execute the script or read `secrets/`. The last good
snapshot before the fix was taken on 30 September at 03:36.

Nothing was lost; the database held no content yet. It was found by chance
while preparing the `pg_dump` step. That is the real finding: a failing backup
raised no alert, exactly as the first open item warns.

Fixed by running the service as `deploy`, by documenting how the units are
installed, and by having the pipeline install `backup.sh`, so the server no
longer drifts from this repository.
