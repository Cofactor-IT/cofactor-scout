#!/bin/bash
# Cofactor Club - PostgreSQL Restore Script
# One-click restoration from backup files

set -euo pipefail

BACKUP_DIR="/backup"
VOLUME_NAME="cofactor-club_postgres_data"

# List available backups
echo "=============================================="
echo "Cofactor Club - Database Restoration"
echo "=============================================="
echo ""

if [[ ! -d "$BACKUP_DIR" ]] || [[ -z "$(ls -A "$BACKUP_DIR"/*.sql.gz 2>/dev/null)" ]]; then
    echo "ERROR: No backups found in $BACKUP_DIR" >&2
    exit 1
fi

# Show available backups
echo "Available backups:"
echo ""
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ") - " $6 " " $7 " " $8}'
echo ""

# Find latest backup for quick restore
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | head -n1)

if [[ -z "$LATEST_BACKUP" ]]; then
    echo "ERROR: No backup found in $BACKUP_DIR" >&2
    exit 1
fi

# Prompt for backup selection
read -p "Enter backup filename (or press Enter for latest [$LATEST_BACKUP]): " selected_backup
selected_backup="${selected_backup:-$LATEST_BACKUP}"

# Validate selection
if [[ ! -f "$selected_backup" ]]; then
    # Try with backup dir prefix
    if [[ -f "$BACKUP_DIR/$selected_backup" ]]; then
        selected_backup="$BACKUP_DIR/$selected_backup"
    else
        echo "ERROR: File not found: $selected_backup" >&2
        exit 1
    fi
fi

echo ""
echo "Selected backup: $selected_backup"
echo "File size: $(du -h "$selected_backup" | cut -f1)"
echo ""
echo "WARNING: This will PERMANENTLY DELETE all current data!"
echo ""
read -p "Type 'RESTORE' to confirm: " confirm

if [[ "$confirm" != "RESTORE" ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "[1/6] Stopping containers..."
docker compose down

echo "[2/6] Removing postgres volume..."
docker volume rm "$VOLUME_NAME" 2>/dev/null || echo "Volume not found (fresh start)"

echo "[3/6] Starting database container..."
docker compose up -d db

echo "[4/6] Waiting for database to be ready..."
sleep 5
until docker compose exec -T db pg_isready -U "${POSTGRES_USER:-cofactor}" -q; do
    echo "  Waiting for PostgreSQL..."
    sleep 2
done

# Load environment variables from .env if present
if [[ -f .env ]]; then
    set -a
    source .env
    set +a
fi

export POSTGRES_USER="${POSTGRES_USER:-cofactor}"
export POSTGRES_DB="${POSTGRES_DB:-cofactor_db}"

echo "[5/6] Restoring backup (decompressing)..."
gunzip -c "$selected_backup" | docker compose exec -T db psql -U "$POSTGRES_USER" "$POSTGRES_DB"

echo "[6/6] Restarting full stack..."
docker compose up -d

echo ""
echo "=============================================="
echo "Restore complete!"
echo "=============================================="
