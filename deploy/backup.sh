#!/usr/bin/env bash
set -euo pipefail

set -a
source /opt/tragni/secrets/backup.env
set +a

echo "=== backup started $(date -Is) ==="

# A database dump will be written to /opt/tragni/data/ here
# once PostgreSQL exists. Never back up a live data directory.

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
