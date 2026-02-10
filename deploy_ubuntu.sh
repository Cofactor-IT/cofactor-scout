#!/bin/bash
# Deployment Commands for Cofactor Club (Ubuntu Server)
# Run these commands in your ~/Cofactor directory

set -e  # Exit on error

echo "🚀 Starting deployment..."

# 1. Update Code
echo "📥 Pulling latest code..."
git fetch origin
git checkout major-update
git pull origin major-update

# 2. Create Backup
echo "💾 Creating database backup..."
# Ensure the backup directory exists or use current dir
mkdir -p backup
# Note: Adjust volume name if needed. Default is usually foldername_volumename
docker compose down
docker run --rm -v cofactor_postgres_data:/volume -v $(pwd)/backup:/backup alpine tar -czf /backup/pre_update_backup_$(date +%F_%H-%M).tar.gz -C /volume ./ || echo "⚠️  Backup failed or volume not found. Proceeding with caution..."

# 3. Rebuild Containers
echo "🐳 Rebuilding Docker images..."
docker compose build --no-cache

# 4. Database Migration
echo "🗄️  Updating database schema..."
docker compose up -d db
echo "Waiting for database to be ready..."
sleep 10
docker compose run --rm web npx prisma db push

# 5. Start Application
echo "✅ Starting services..."
docker compose up -d

# 6. Verification
echo "🔍 Verifying deployment..."
sleep 5
curl -s http://localhost:3000/api/health | grep "healthy" && echo "System is HEALTHY" || echo "System check FAILED"

echo "Deployment complete! Check logs with: docker compose logs -f"
