# Environment Setup

**Audience:** Developers  
**Last Updated:** 2026-02-26

## Prerequisites

- **Node.js:** 20+ (check with `node --version`)
- **Package Manager:** npm (included with Node.js)
- **Database:** PostgreSQL 15+ or Supabase account
- **Git:** For version control

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/your-org/cofactor-scout.git
cd cofactor-scout

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values

# 4. Set up database
npx prisma db push

# 5. Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Environment Variables

### Required

```env
# Database (Supabase or local PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-super-secret-random-string"
NEXTAUTH_URL="http://localhost:3000"
```

### Optional (Email)

```env
# SMTP Configuration (Gmail example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Cofactor Scout <no-reply@cofactor.world>"
```

**Gmail Setup:**
1. Enable 2FA on your Google account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password as `SMTP_PASS`

### Optional (Admin Account)

```env
# Admin account for initial setup
ADMIN_EMAIL="admin@cofactor.world"
ADMIN_PASSWORD="your-secure-admin-password"
```

### Optional (Monitoring)

```env
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
SENTRY_ORG="your-org"
SENTRY_PROJECT="cofactor-scout"
SENTRY_AUTH_TOKEN="your-auth-token"
```

## Database Setup

### Option A: Supabase (Recommended for Production)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string
5. Add to `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
   DIRECT_URL="postgresql://postgres:[password]@[host]:5432/postgres"
   ```
6. Push schema:
   ```bash
   npx prisma db push
   ```

### Option B: Local PostgreSQL

1. Install PostgreSQL 15+
2. Create database:
   ```bash
   createdb cofactor_scout
   ```
3. Add to `.env`:
   ```env
   DATABASE_URL="postgresql://localhost:5432/cofactor_scout"
   DIRECT_URL="postgresql://localhost:5432/cofactor_scout"
   ```
4. Push schema:
   ```bash
   npx prisma db push
   ```

### Option C: Docker

```bash
# Start PostgreSQL container
docker-compose up -d db

# Push schema
npx prisma db push
```

## Prisma Commands

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio

# Create migration (production)
npx prisma migrate dev --name migration_name

# Deploy migrations (production)
npx prisma migrate deploy
```

## Development Server

```bash
# Start dev server
npm run dev

# Run with specific env file
npx dotenv -e .env.local -- npm run dev
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Common Setup Errors

### Error: "Can't reach database server"

**Solution:**
- Check `DATABASE_URL` is correct
- Verify database is running
- Check firewall/network settings
- For Supabase, verify connection pooling is enabled

### Error: "NEXTAUTH_SECRET is not set"

**Solution:**
```bash
# Generate secret
openssl rand -base64 32

# Add to .env
NEXTAUTH_SECRET="generated-secret-here"
```

### Error: "Prisma Client not generated"

**Solution:**
```bash
npx prisma generate
```

### Error: "Port 3000 already in use"

**Solution:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

### Error: "Module not found"

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
```

## IDE Setup

### VS Code (Recommended)

**Extensions:**
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense

**Settings:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Next Steps

1. Read [CONTRIBUTING.md](../../CONTRIBUTING.md)
2. Review [CODE_STANDARDS.md](../pm-notes/CODE_STANDARDS.md)
3. Check [DESIGN_GUIDELINES.md](../pm-notes/DESIGN_GUIDELINES.md)
4. Explore [features documentation](../features/)

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npx prisma studio        # Open database GUI
npx prisma db push       # Push schema changes
npx prisma generate      # Regenerate Prisma Client

# Testing
npm test                 # Run tests
npm run lint             # Run ESLint

# Prisma
npm run prisma:generate  # Generate Prisma Client
npm run prisma:push      # Push schema to database
npm run prisma:studio    # Open Prisma Studio
```
