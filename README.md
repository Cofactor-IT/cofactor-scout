# Cofactor Club 🚀

A student ambassador network platform for managing referrals, tracking viral growth, and building a moderated University Wiki with a gamified Power Score system.

> **📚 Documentation:** For detailed technical documentation, see the [docs/](./docs/README.md) directory.

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | **Production** - Docker deployment ready, clean codebase |
| `secondary` | **Backup** - Previous development state |

---

## Features

### 🎯 Power Score System
- **Referrals**: +50 points per successful invite
- **Wiki Contributions**: +20 points for approved edits
- **Social Reach**: Points based on aggregate followers (Instagram, TikTok, LinkedIn)

### 👥 User Roles
| Role | Capabilities |
|------|-------------|
| **Student** | Create referrals, propose wiki edits, sync social accounts |
| **Staff** | Auto-approved wiki edits, same as student |
| **Pending Staff** | Awaiting admin approval for staff privileges |
| **Admin** | Full access: approve/reject revisions, manage users, delete pages |

### 📚 University Wiki
- **University-Specific Scoping**: Wikis are isolated per university; students only see their own.
- **Role-Based Access**:
  - **Students**: View/Edit own university wiki.
  - **Staff**: View/Edit all university wikis.
  - **Admins**: Full control over all wikis.
- **Revision System**: Proposed edits require approval (Students) or are auto-approved (Staff).
- **Published State**: Pages only visible after first approval
- **Diff Viewer**: Visual comparison of edit proposals
- **XSS Protection**: All content sanitized with DOMPurify

### 🏫 University Management
- **Admin Control**: Create and manage universities with associated email domains.
- **Auto-Detection**: Users are automatically assigned to a university based on their email domain during signup.
- **Manual Assignment**: Admins can manually assign or correct university affiliation.

### 📊 Admin Dashboard
- **KPI Cards**: Total users, referrals, social reach, pending actions
- **Leaderboard**: Top 10 performers by Power Score
- **Recent Signups**: Latest members with role badges
- **Activity Hotspots**: Most edited wiki pages
- **Staff Applications**: Approve/reject pending staff

---

## Deployment (Docker)

This branch is optimized for **Docker deployment on ARM64 Ubuntu** (e.g., Oracle Cloud).

### Prerequisites
- Docker & Docker Compose
- ARM64 or x86_64 Linux server

### 1. Clone Repository
```bash
git clone https://github.com/your-repo/cofactor-club.git
cd cofactor-club
```

### 2. Configure Environment
Create a `.env` file:

```env
# Database (used by docker-compose)
POSTGRES_USER=cofactor
POSTGRES_PASSWORD=your-secure-db-password
POSTGRES_DB=cofactor_db

# App Configuration
DATABASE_URL=postgresql://cofactor:your-secure-db-password@db:5432/cofactor_db
NEXTAUTH_SECRET=your-super-secret-random-string
NEXTAUTH_URL=https://your-domain.com

# Admin Seeding
ADMIN_EMAIL=admin@cofactor.world
ADMIN_PASSWORD=your-secure-admin-password

# Staff Sign-up (optional)
STAFF_SECRET_CODE=STAFF_2026

# SMTP Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Cofactor Club" <no-reply@cofactor.world>

# Cloudflare Tunnel (Required for production)
CLOUDFLARE_TOKEN=eyJhIjoi...
```

### 3. Deploy with Docker Compose
```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f web
```

### 4. Database Management
```bash
# Push schema changes
docker-compose exec web npx prisma db push

# Open Prisma Studio
docker-compose exec web npx prisma studio
```

### 5. Backup & Restore
```bash
# Backup database
./scripts/backup.sh

# Restore from backup
./scripts/restore.sh
```

### 6. Updating Deployment
```bash
# 1. Pull latest changes
git pull origin main

# 2. Rebuild and restart containers
docker-compose up -d --build

# 3. Apply database schema changes
docker-compose exec web npx prisma db push
```


---

## Local Development

For local development, use the `secondary` branch or:

```bash
# Start only the database
docker-compose up -d db

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Push schema
npm run prisma:push

# Start dev server
npm run dev
```

Visit `http://localhost:3000`

---

## Project Structure

```
cofactor-club/
├── app/                  # Next.js App Router
│   ├── admin/            # Admin dashboard & actions
│   ├── auth/             # Sign-in/Sign-up pages
│   ├── profile/          # User profile & social linking
│   ├── wiki/             # University wiki pages
│   ├── leaderboard/      # Power Score rankings
│   └── members/          # Members directory (admin only)
├── components/           # React components
│   ├── ui/               # Shadcn UI components
│   └── DiffViewer.tsx    # Wiki diff comparison
├── lib/                  # Utilities
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # Auth utilities
│   └── email.ts          # Nodemailer SMTP
├── prisma/
│   └── schema.prisma     # Database schema (ARM64 ready)
├── scripts/
│   ├── backup.sh         # Database backup script
│   └── restore.sh        # Database restore script
├── Dockerfile            # Multi-stage build (ARM64 optimized)
├── docker-compose.yml    # Full stack deployment
└── instrumentation.ts    # Admin seeding on startup
```

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router, Standalone Output) |
| Database | PostgreSQL 15 + Prisma ORM |
| Auth | NextAuth.js (Credentials) |
| Styling | Tailwind CSS + Shadcn UI |
| Icons | Lucide React |
| Markdown | react-markdown + remark-gfm |
| Email | Nodemailer |
| Container | Docker (node:20-alpine, ARM64 compatible) |

---

## Security

| Feature | Implementation |
|---------|---------------|
| Password Hashing | bcryptjs (10 rounds) |
| Session Management | NextAuth.js JWT |
| Admin Protection | Middleware + Server Action guards |
| XSS Prevention | isomorphic-dompurify |
| CSRF Protection | Server Actions with form tokens |
| Secrets | Environment variables only |

---

## License
MIT

---

Built with ❤️ by the Cofactor Team
