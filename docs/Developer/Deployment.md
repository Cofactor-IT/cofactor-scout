# Deployment

## Overview

This project is optimized for deployment on **ARM64** architecture (e.g., Oracle Cloud Free Tier) using **Docker** and **Docker Compose**.

## Prerequisites

*   A Linux server (Ubuntu 22.04 LTS recommended).
*   Docker & Docker Compose installed.
*   A domain name pointed to your server's IP.

## Docker Setup

We use a multi-stage `Dockerfile` to keep the image size small.

### Stages
1.  **Deps**: Installs dependencies (`npm ci`).
2.  **Builder**: Builds the Next.js application (`npm run build`).
3.  **Runner**: A minimal Alpine Linux image that runs the standalone build.

### ARM64 Optimization
The `Dockerfile` specifically targets `linux/arm64` compatibility to avoid issues with native modules (like `bcrypt` or `sharp`) on Oracle Cloud Ampere instances.

## Environment Variables

Create a `.env` file in the root directory.

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Connection string for PostgreSQL. | `postgresql://user:pass@db:5432/db` |
| `NEXTAUTH_SECRET` | Secret key for session encryption. | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | The canonical URL of your site. | `https://cofactor.club` |
| `ADMIN_EMAIL` | Email of the initial admin user. | `admin@cofactor.club` |
| `SMTP_*` | (Optional) Email server settings. | `smtp.gmail.com` |

## Deployment Commands

### 1. Build and Start
```bash
docker-compose up -d --build
```

### 2. View Logs
```bash
docker-compose logs -f web
```

### 3. Run Database Migrations
```bash
docker-compose exec web npx prisma db push
```

## Backup & Restore

Scripts are located in the `scripts/` directory.

*   **Backup**: `./scripts/backup.sh` (Creates a dump of the Postgres database).
*   **Restore**: `./scripts/restore.sh <backup_file>` (Restores from a dump).
