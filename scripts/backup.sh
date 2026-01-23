#!/bin/bash
# Cofactor Club - PostgreSQL Backup Script with Smart Retention
# Creates timestamped backups from the Docker db container
# Usage: ./scripts/backup.sh

set -euo pipefail

# Backup configuration
BACKUP_DIR="/backup"
RETENTION_HOURLY=24      # Keep last 24 hourly backups (1 day)
RETENTION_DAILY=7         # Keep last 7 daily backups (1 week)
RETENTION_WEEKLY=4        # Keep last 4 weekly backups (1 month)
RETENTION_MONTHLY=12      # Keep last 12 monthly backups (1 year)

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/cofactor_${TIMESTAMP}.sql"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Load environment variables from .env if present
if [[ -f .env ]]; then
    set -a
    source .env
    set +a
fi

# Set defaults if not in .env
export POSTGRES_USER="${POSTGRES_USER:-cofactor}"
export POSTGRES_DB="${POSTGRES_DB:-cofactor_db}"

log "Starting backup..."

# Execute pg_dump inside the db container
if docker compose exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$BACKUP_FILE" 2>/dev/null; then
    # Verify backup was created
    if [[ -s "$BACKUP_FILE" ]]; then
        FILESIZE=$(stat --printf="%s" "$BACKUP_FILE" 2>/dev/null || stat -f%z "$BACKUP_FILE" 2>/dev/null || echo "unknown")
        log "Backup successful: ${BACKUP_FILE} (${FILESIZE} bytes)"
        chown 1001:1001 "$BACKUP_FILE"

        # Compress the backup
        gzip "$BACKUP_FILE"
        BACKUP_FILE="${BACKUP_FILE}.gz"
        chown 1001:1001 "$BACKUP_FILE"
        FILESIZE=$(stat --printf="%s" "$BACKUP_FILE" 2>/dev/null || stat -f%z "$BACKUP_FILE" 2>/dev/null || echo "unknown")
        log "Compressed: ${BACKUP_FILE} (${FILESIZE} bytes)"
    else
        log "ERROR: Backup file is empty!"
        rm -f "$BACKUP_FILE"
        exit 1
    fi
else
    log "ERROR: Failed to execute pg_dump!"
    exit 1
fi

# Smart Retention Policy
log "Applying retention policy..."

cd "$BACKUP_DIR"

# Arrays to hold backups by type
declare -a hourly_backups
declare -a daily_backups
declare -a weekly_backups
declare -a monthly_backups

# Current time for calculations
current_hour=$(date +%s)
day_ago=$((current_hour - 86400))
week_ago=$((current_hour - 604800))
month_ago=$((current_hour - 2592000))
year_ago=$((current_hour - 31536000))

# Process all backup files
for file in cofactor_*.sql.gz; do
    if [[ -f "$file" ]]; then
        # Extract timestamp from filename
        file_ts=$(echo "$file" | sed -E 's/cofactor_([0-9]{8}_[0-9]{6})\.sql\.gz/\1/')
        file_time=$(date -d "${file_ts:0:4}-${file_ts:4:2}-${file_ts:6:2} ${file_ts:9:2}:${file_ts:11:2}:${file_ts:13:2}" +%s 2>/dev/null || echo "0")

        if [[ "$file_time" -gt "$day_ago" ]]; then
            hourly_backups+=("$file")
        elif [[ "$file_time" -gt "$week_ago" ]]; then
            daily_backups+=("$file")
        elif [[ "$file_time" -gt "$month_ago" ]]; then
            weekly_backups+=("$file")
        else
            monthly_backups+=("$file")
        fi
    fi
done

# Keep backups based on retention policy (keeping most recent)
keep_hourly=$(printf "%s\n" "${hourly_backups[@]}" | sort -r | head -n "$RETENTION_HOURLY")
keep_daily=$(printf "%s\n" "${daily_backups[@]}" | sort -r | head -n "$RETENTION_DAILY")
keep_weekly=$(printf "%s\n" "${weekly_backups[@]}" | sort -r | head -n "$RETENTION_WEEKLY")
keep_monthly=$(printf "%s\n" "${monthly_backups[@]}" | sort -r | head -n "$RETENTION_MONTHLY")

# Files to keep
declare -A files_to_keep
for f in $keep_hourly $keep_daily $keep_weekly $keep_monthly; do
    [[ -n "$f" ]] && files_to_keep["$f"]=1
done

# Delete old backups
deleted_count=0
for file in cofactor_*.sql.gz; do
    if [[ -f "$file" ]]; then
        if [[ -z "${files_to_keep[$file]+isset}" ]]; then
            rm -f "$file"
            log "Deleted old backup: $file"
            ((deleted_count++))
        fi
    fi
done

# Summary
total_backups=$(ls -1 cofactor_*.sql.gz 2>/dev/null | wc -l)
log "Retention complete. Keeping $total_backups backups (deleted $deleted_count old backups)"
log "Backup process completed successfully"
