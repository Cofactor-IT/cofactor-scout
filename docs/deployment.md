# Deployment Guide

This document covers deployment procedures for Cofactor Club, including Docker setup, cloud deployment, and maintenance operations.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Docker Deployment](#docker-deployment)
- [Local Development](#local-development)
- [Backup and Restore](#backup-and-restore)
- [Monitoring and Logging](#monitoring-and-logging)
- [Troubleshooting](#troubleshooting)

---

## Overview

Cofactor Club is designed for **Docker deployment on ARM64 Ubuntu** (e.g., Oracle Cloud Free Tier). The application uses:

- **Multi-stage Docker build** for optimized image size
- **Docker Compose** for orchestration
- **PostgreSQL 15** for data persistence
- **Automated backups** with smart retention policy
- **Cloudflare Tunnel** (optional) for secure exposure

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │    Web     │  │     DB     │  │      Backup        │ │
│  │  (Next.js) │◄─┤ (Postgres) │  │  (Every 6 hours)   │ │
│  │  :3000     │  │   :5432    │  │                    │ │
│  └────────────┘  └────────────┘  └────────────────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Cloudflare Tunnel (Optional)             │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### Hardware Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 1 core | 2+ cores |
| RAM | 1 GB | 2+ GB |
| Storage | 10 GB | 20+ GB |
| Architecture | ARM64 or x86_64 | ARM64 for optimal compatibility |

### Software Requirements

- **Docker** 20.10 or later
- **Docker Compose** 2.0 or later
- **Git** (for cloning repository)

### Installing Docker

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**Verify installation:**
```bash
docker --version
docker compose version
```

---

## Environment Variables

### Required Variables

Create a `.env` file in the project root:

```env
# ============================================
# Database Configuration
# ============================================
POSTGRES_USER=cofactor
POSTGRES_PASSWORD=your_secure_db_password_here
POSTGRES_DB=cofactor_db

# ============================================
# Application Configuration
# ============================================
DATABASE_URL=postgresql://cofactor:your_secure_db_password_here@db:5432/cofactor_db
NEXTAUTH_SECRET=your_super_secret_random_string_generate_with_openssl
NEXTAUTH_URL=https://your-domain.com

# ============================================
# Admin Account Seeding
# ============================================
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_admin_password

# ============================================
# Staff Sign-up Code (Optional)
# ============================================
STAFF_SECRET_CODE=STAFF_2026

# ============================================
# Email Configuration (Optional but Recommended)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_app_specific_password
SMTP_FROM="Cofactor Club" <no-reply@yourdomain.com>

# ============================================
# Cloudflare Tunnel (Production Only)
# ============================================
CLOUDFLARE_TOKEN=your_cloudflare_tunnel_token
```

### Generating Secure Values

**NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Strong Passwords:**
```bash
# Using openssl
openssl rand -base64 16

# Or use a password manager
```

---

## Docker Deployment

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/cofactor-club.git
   cd cofactor-club
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   nano .env
   ```

3. **Deploy:**
   ```bash
   docker compose up -d --build
   ```

4. **Check status:**
   ```bash
   docker compose ps
   docker compose logs -f web
   ```

### Services

| Service | Description | Ports |
|---------|-------------|-------|
| `web` | Next.js application | 3001:3000 |
| `db` | PostgreSQL database | 127.0.0.1:5432:5432 |
| `backup` | Automated backup service | - |
| `tunnel` | Cloudflare Tunnel (optional) | - |

### Health Checks

Both `web` and `db` services include health checks:

```bash
# Check service health
docker compose ps

# Manual health check
curl http://localhost:3001/api/health
```

### Production Deployment with Cloudflare Tunnel

For production deployment with a public URL:

1. **Create a Cloudflare Tunnel:**
   - Go to Cloudflare Zero Dashboard
   - Create a new tunnel
   - Copy the tunnel token

2. **Add token to .env:**
   ```env
   CLOUDFLARE_TOKEN=eyJhIjoi...
   ```

3. **Deploy with tunnel:**
   ```bash
   docker compose --profile production up -d --build
   ```

The tunnel will automatically create a secure public URL to your application.

### Container Management

**View logs:**
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f web
docker compose logs -f db
```

**Restart services:**
```bash
docker compose restart web
```

**Stop services:**
```bash
docker compose down
```

**Stop with volumes:**
```bash
docker compose down -v  # WARNING: Deletes data
```

**Update and rebuild:**
```bash
git pull
docker compose up -d --build
```

---

## Local Development

For development without Docker containers:

1. **Start database only:**
   ```bash
   docker compose up -d db
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Generate Prisma client:**
   ```bash
   npm run prisma:generate
   ```

4. **Push schema to database:**
   ```bash
   npm run prisma:push
   ```

5. **Start dev server:**
   ```bash
   npm run dev
   ```

6. **Access application:**
   ```
   http://localhost:3000
   ```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:push` | Push schema changes |
| `npm run prisma:studio` | Open Prisma Studio |

---

## Backup and Restore

### Automated Backups

The backup service runs every 6 hours automatically.

**Retention Policy:**

| Period | Count | Duration |
|--------|-------|----------|
| Hourly | 24 | 1 day |
| Daily | 7 | 1 week |
| Weekly | 4 | 1 month |
| Monthly | 12 | 1 year |

**Total:** Maximum ~47 backups at any time

### Manual Backup

```bash
# Run backup script manually
./scripts/backup.sh
```

The backup will be saved to the Docker volume `backup-data` at `/backup/cofactor_TIMESTAMP.sql.gz`.

### Backup Contents

Backups include:
- All tables and data
- Indexes and constraints
- Sequences and auto-increment values
- User roles and permissions

### Restore from Backup

```bash
# Run restore script
./scripts/restore.sh
```

**Restore Process:**
1. Lists available backups
2. Prompts for backup selection
3. Requires confirmation (type "RESTORE")
4. Stops all containers
5. Removes PostgreSQL volume
6. Restarts database container
7. Restores data from backup
8. Restarts full stack

**Warning:** This is a destructive operation that replaces all current data.

### Backup Location

Backups are stored in the `backup-data` Docker volume:

```bash
# List backups
docker compose exec backup ls -lh /backup

# Copy backup from container
docker compose cp backup:/backup/cofactor_20250112_120000.sql.gz .
```

### External Backup Storage

For additional safety, sync backups to external storage:

```bash
# Using rsync to a remote server
rsync -avz /var/lib/docker/volumes/cofactor-club_backup-data/_data/ \
  user@remote-server:/backups/cofactor/

# Using rclone to cloud storage
rclone sync /var/lib/docker/volumes/cofactor-club_backup-data/_data/ \
  remote:cofactor-backups
```

---

## Monitoring and Logging

### Application Logs

**View all logs:**
```bash
docker compose logs -f
```

**View specific service:**
```bash
docker compose logs -f web
docker compose logs -f db
docker compose logs -f backup
```

**View last 100 lines:**
```bash
docker compose logs --tail=100 web
```

### Database Monitoring

**Connect to database:**
```bash
docker compose exec db psql -U cofactor -d cofactor_db
```

**Useful queries:**
```sql
-- Database size
SELECT pg_size_pretty(pg_database_size('cofactor_db'));

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- User count
SELECT COUNT(*) FROM "User";

-- Recent signups
SELECT email, role, "createdAt" FROM "User"
ORDER BY "createdAt" DESC LIMIT 10;

-- Pending revisions
SELECT COUNT(*) FROM "WikiRevision" WHERE status = 'PENDING';
```

### Health Monitoring

**Application health:**
```bash
curl http://localhost:3001/api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-12T10:30:00.000Z"
}
```

### Resource Monitoring

**Container stats:**
```bash
docker stats
```

**Disk usage:**
```bash
docker system df

# Volume usage
docker volume ls
docker volume inspect cofactor-club_postgres_data
```

---

## Troubleshooting

### Common Issues

#### Port Already in Use

**Error:** `Bind for 0.0.0.0:3001 failed: port is already allocated`

**Solution:**
```bash
# Find process using port
sudo lsof -i :3001

# Kill process or change port in docker-compose.yml
```

#### Database Connection Failed

**Error:** `Connection refused at db:5432`

**Solution:**
```bash
# Check database is running
docker compose ps db

# Check database logs
docker compose logs db

# Restart database
docker compose restart db
```

#### Out of Memory

**Error:** Container exits with code 137

**Solution:**
```bash
# Check system memory
free -h

# Increase swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### Prisma Client Generation Failed

**Error:** `This command can only be run if the Prisma Client is generated`

**Solution:**
```bash
# Inside container
docker compose exec web npx prisma generate

# Or rebuild container
docker compose up -d --build web
```

#### Email Not Sending

**Error:** Verification emails not received

**Solution:**
```bash
# Check SMTP configuration
docker compose exec web env | grep SMTP

# Check logs
docker compose logs web | grep -i email

# For Gmail, use App Password not regular password
# https://support.google.com/accounts/answer/185833
```

### Recovery Procedures

#### Reset Admin Password

```bash
docker compose exec web node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetAdmin() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (admin) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: await bcrypt.hash('newpassword', 10) }
    });
    console.log('Password reset for:', admin.email);
  }
}
resetAdmin();
"
```

#### Clear Failed Login Attempts

```bash
docker compose exec db psql -U cofactor -d cofactor_db -c \
  "UPDATE \"User\" SET \"failedLoginAttempts\" = 0, \"lockedUntil\" = NULL WHERE email = 'user@example.com';"
```

#### Rebuild from Scratch

**Warning:** Deletes all data

```bash
docker compose down -v
docker compose up -d --build
```

---

## Production Checklist

Before deploying to production:

- [ ] Set strong passwords for all services
- [ ] Generate secure `NEXTAUTH_SECRET`
- [ ] Configure email (SMTP) for verification
- [ ] Set up Cloudflare Tunnel or reverse proxy
- [ ] Configure external backup storage
- [ ] Test backup and restore procedures
- [ ] Set up monitoring/alerting
- [ ] Review and update admin credentials
- [ ] Configure custom domain
- [ ] Enable HTTPS (automatic with Cloudflare Tunnel)
- [ ] Review rate limiting settings
- [ ] Set up log aggregation

---

## Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose up -d --build

# Or for zero-downtime (requires multiple servers)
docker compose pull
docker compose up -d --no-deps web
docker compose up -d --no-deps db
```

### Database Migrations

```bash
# Generate migration
npx prisma migrate dev --name migration_name

# Apply migration in production
docker compose exec web npx prisma migrate deploy
```

### Clean Up Old Images

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes (WARNING: may delete data)
docker volume prune
```

---

**Next:** Read the [Contributing guide](./contributing.md) for development workflow.
