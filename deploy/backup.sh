#!/usr/bin/env bash
set -euo pipefail

# Everything this script creates -- the database dump above all -- is readable
# by its owner only, like secrets/.
umask 077

set -a
source /opt/tragni/secrets/backup.env
set +a

echo "=== backup started $(date -Is) ==="

# The database is dumped, never copied: a running data directory copied file by
# file is an inconsistent snapshot. pg_dump asks PostgreSQL for a consistent one.
#
# - Runs inside the container: the database has no port outside the internal
#   network, and the client always matches the server version.
# - No -t on docker exec: a terminal would rewrite the binary output.
# - Custom format, so pg_restore can list and select from the dump; uncompressed,
#   because restic compresses and deduplicates better than a pre-compressed
#   file allows.
# - Written under a temporary name and renamed when complete, so an interrupted
#   dump never replaces the last good one. If pg_dump fails, set -e stops the
#   whole backup: a backup without the database has to fail, not look complete.
dump_dir=/opt/tragni/data
mkdir -p "$dump_dir"
docker exec postgres pg_dump -U tragni -d tragni --format=custom --compress=0 \
  > "$dump_dir/tragni.dump.tmp"
mv "$dump_dir/tragni.dump.tmp" "$dump_dir/tragni.dump"

restic backup \
  --tag infra \
  --exclude-caches \
  /opt/tragni

restic forget \
  --tag infra \
  --keep-daily 7 \
  --keep-weekly 4 \
  --keep-monthly 6 \
  --prune

restic check

echo "=== backup finished $(date -Is) ==="
