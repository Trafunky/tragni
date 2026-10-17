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

Currently `/opt/tragni` — configuration and, above all, `secrets/`, which exists
nowhere else. The rest of the configuration is in this repository too, so today
the backup protects one directory.

**PostgreSQL** is running, but its data is *not yet* part of the backup — see
the open items. When it is added, the data directory is *not* backed up. A
running database directory copied file by file produces an inconsistent
snapshot at best. Instead, `pg_dump` writes to `/opt/tragni/data/`, and that
file is backed up. The script has a marked place for this.

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

## Case 3 — the server is gone, rebuild from scratch

This is the path Q9's 30-minute RTO refers to.

> **Not yet rehearsed end to end.** This procedure was written before the
> `deploy` user and the deployment pipeline existed, and has only partly been
> updated since. Known gaps: the pipeline's SSH access to a new server (key and
> host key) and where the image version for `docker compose` comes from. See the
> open items.

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
8. Log in to GHCR as `deploy` with a read-only token (`docker login ghcr.io`).
   The server's registry login lives in `deploy`'s home directory, which is not
   part of the backup — create a new token rather than looking for the old one.
9. Restore the database dump into PostgreSQL (once one exists)
10. `cd /opt/tragni && docker compose up -d`
11. Point DNS at the new IP address if it changed

Certificates are **not** restored — Traefik requests new ones automatically.
That is why the ACME volume is deliberately not part of the backup.

## Always clean up afterwards

```bash
rm -rf /tmp/restore
```

A restore of `secrets/` leaves credentials in a world-readable directory.

---

# Rehearsal

Quarterly, logged below. A backup whose restore has never been exercised is a
hope, not a backup (risk R9).

Minimum procedure, as `deploy` after the preparation step above:

```bash
mkdir -p /tmp/restore-test
restic restore latest --target /tmp/restore-test
diff -r /opt/tragni /tmp/restore-test/opt/tragni && echo IDENTICAL
ls -l /tmp/restore-test/opt/tragni/secrets/     # must be -rw-------
rm -rf /tmp/restore-test
```

Checking file modes is part of it: a restore that returns secrets with open
permissions is a failed restore, even if the content is correct.

| Date | Result | Notes |
|---|---|---|
| 2026-09-20 | passed | First rehearsal, right after setup. 5 files, content identical, modes preserved. |

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

The units are not deployed by the pipeline: they change rarely and installing
them needs root. Copy them from this repository so the server never drifts from
it:

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
- [ ] Add the `pg_dump` step now that PostgreSQL is running, before the first
  real content reaches the database.
- [ ] Rehearse Case 3 end to end on a throwaway server and close its known
  gaps. It is the procedure the RTO depends on, and the one least tested.
- [ ] Set a calendar reminder for the quarterly rehearsal — an undated intention
  does not happen.

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

Fixed by running the service as `deploy`, and by documenting how the units are
installed so the server no longer drifts from this repository.
