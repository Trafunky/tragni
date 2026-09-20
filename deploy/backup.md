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

That is expected at this stage. The mechanism is built now so that the restore
is proven before anything depends on it.

**When PostgreSQL is added**, the data directory is *not* backed up. A running
database directory copied file by file produces an inconsistent snapshot at
best. Instead, `pg_dump` writes to `/opt/tragni/data/`, and that file is backed
up. The script has a marked place for this.

**Uploaded media** gets a bind mount under `/opt/tragni/data/` rather than a
named volume, so the backup runs unprivileged and needs no path into
`/var/lib/docker`.

---

# Restore

## Preparation — needed in every case

```bash
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

1. Provision a VPS, Ubuntu LTS, SSH key from the Infomaniak key store
2. Harden: UFW, swap, `PermitRootLogin no`, unattended-upgrades
3. Install Docker and restic
4. Recreate `/opt/tragni/secrets/backup.env` from the password manager
5. Restore:
   ```bash
   set -a && source /opt/tragni/secrets/backup.env && set +a
   restic restore latest --target /
   ```
6. Restore the database dump into PostgreSQL (once one exists)
7. `cd /opt/tragni && docker compose up -d`
8. Point DNS at the new IP address if it changed

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

Minimum procedure:

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

## Run manually

```bash
sudo systemctl start tragni-backup.service
```

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
- [ ] Add the `pg_dump` step when PostgreSQL arrives.
- [ ] Set a calendar reminder for the quarterly rehearsal — an undated intention
      does not happen.
