#!/bin/bash
# Cofactor Club - PostgreSQL Restore Script
# One-click restoration from the latest backup

set -euo pipefail

BACKUP_DIR="./backups"
VOLUME_NAME="cofactor-club_postgres_data"

# Find the latest backup file
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/*.sql 2>/dev/null | head -n1)

if [[ -z "$LATEST_BACKUP" ]]; then
    echo "ERROR: No backup found in $BACKUP_DIR" >&2
    exit 1
fi

echo "=============================================="
echo "Cofactor Club - Database Restoration"
echo "=============================================="
echo ""
echo "Found backup: $LATEST_BACKUP"
echo "Last modified: $(stat --printf='%y' "$LATEST_BACKUP" 2>/dev/null || stat -f '%Sm' "$LATEST_BACKUP" 2>/dev/null)"
echo ""
echo "WARNING: This will PERMANENTLY DELETE all current data!"
echo ""
read -p "Type 'RESTORE' to confirm: " confirm

if [[ "$confirm" != "RESTORE" ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "[1/5] Stopping containers..."
docker compose down

echo "[2/5] Removing postgres volume..."
docker volume rm "$VOLUME_NAME" 2>/dev/null || echo "Volume not found (fresh start)"

echo "[3/5] Starting database container..."
docker compose up -d db

echo "[4/5] Waiting for database to be ready..."
sleep 5
until docker compose exec -T db pg_isready -U "${POSTGRES_USER:-cofactor}" -q; do
    echo "  Waiting for PostgreSQL..."
    sleep 2
done

# Load environment variables from .env if present
if [[ -f .env ]]; then
    export $(grep -v '^#' .env | xargs)
fi

echo "[5/5] Restoring backup..."
docker compose exec -T db psql \
    -U "${POSTGRES_USER:-cofactor}" \
    "${POSTGRES_DB:-cofactor_db}" < "$LATEST_BACKUP"

echo ""
echo "[DONE] Restarting full stack..."
docker compose up -d

echo ""
echo "=============================================="
echo "Restore complete!"
echo "=============================================="
