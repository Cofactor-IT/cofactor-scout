#!/bin/bash
# Cofactor Club - PostgreSQL Backup Script
# Creates timestamped backups from the Docker db container

set -euo pipefail

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/cofactor_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Load environment variables from .env if present
if [[ -f .env ]]; then
    export $(grep -v '^#' .env | xargs)
fi

# Execute pg_dump inside the db container
docker compose exec -T db pg_dump \
    -U "${POSTGRES_USER:-cofactor}" \
    "${POSTGRES_DB:-cofactor_db}" > "$BACKUP_FILE"

# Verify backup was created
if [[ -s "$BACKUP_FILE" ]]; then
    FILESIZE=$(stat --printf="%s" "$BACKUP_FILE" 2>/dev/null || stat -f%z "$BACKUP_FILE" 2>/dev/null)
    echo "[$(date)] Backup saved: $BACKUP_FILE (${FILESIZE} bytes)"
else
    echo "[$(date)] ERROR: Backup file is empty!" >&2
    rm -f "$BACKUP_FILE"
    exit 1
fi
