# Cofactor Scout 🚀

A platform connecting university research with venture capital through a two-tier community system. Contributors and Scouts discover promising research, submit leads, and earn commission on successful matches.

> **📚 Complete Documentation:**
> - [Product Overview](./docs/product/OVERVIEW.md) - Features, user roles, and workflows
> - [Technical Architecture](./docs/technical/ARCHITECTURE.md) - System design and tech stack
> - [Database Schema](./docs/technical/DATABASE.md) - Complete database documentation
> - [Authentication & Security](./docs/technical/AUTHENTICATION.md) - Auth flow and security measures
> - [API & Server Actions](./docs/technical/API.md) - All server-side functions

---

## What is Cofactor Scout?

Cofactor Scout connects promising university research with venture capital investors through a community-driven platform:

- **Contributors** (default role): Submit research leads immediately, earn standard commission
- **Scouts** (verified role): Priority review, higher commission, green badge, part of official network

### Key Features
- 🎯 **3-Step Research Submission**: Comprehensive form with auto-save drafts
- 📊 **Dashboard**: Track submissions, view statistics, manage drafts
- ✅ **Scout Application**: Apply to become a verified Scout
- 📧 **Email Notifications**: Verification, confirmations, status updates
- 🔒 **Secure Authentication**: Email verification, account lockout, password reset

---

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Framework** | Next.js (App Router) | 16.1.6 |
| **Language** | TypeScript | 5.x |
| **Database** | PostgreSQL | 15+ |
| **ORM** | Prisma | 5.22.0 |
| **Authentication** | NextAuth.js | 4.24.13 |
| **Styling** | Tailwind CSS | 3.4.17 |
| **UI Components** | Radix UI | Various |
| **Validation** | Zod | 3.22.4 |
| **Email** | Nodemailer | 7.0.12 |
| **Testing** | Vitest | 4.0.18 |
| **Monitoring** | Sentry | 10.38.0 |

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ (or Docker)
- npm or yarn

### 1. Clone Repository
```bash
git clone https://github.com/your-org/cofactor-scout.git
cd cofactor-scout
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cofactor_scout"
DIRECT_URL="postgresql://user:password@localhost:5432/cofactor_scout"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-random-string"
NEXTAUTH_URL="http://localhost:3000"

# Admin (optional)
ADMIN_EMAIL="admin@cofactor.world"
ADMIN_PASSWORD="your-secure-admin-password"

# SMTP Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Cofactor Scout <no-reply@cofactor.world>"

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
SENTRY_ORG="your-org"
SENTRY_PROJECT="your-project"
SENTRY_AUTH_TOKEN="your-auth-token"
```

### 4. Set Up Database

**Option A: Local PostgreSQL**
```bash
# Create database
createdb cofactor_scout

# Push schema
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio
```

**Option B: Docker**
```bash
# Start PostgreSQL container
docker-compose up -d db

# Push schema
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
cofactor-scout/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   ├── auth/                 # Authentication pages
│   ├── dashboard/            # User dashboard
│   ├── scout/                # Scout application
│   ├── settings/             # User settings
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   └── globals.css           # Global styles
│
├── actions/                  # Server Actions
│   ├── auth.actions.ts       # Authentication
│   ├── submission.actions.ts # Research submissions
│   └── scout.actions.ts      # Scout applications
│
├── components/               # React components
│   ├── ui/                   # Reusable UI components
│   ├── submission/           # Submission form components
│   └── settings/             # Settings components
│
├── lib/                      # Shared utilities
│   ├── auth/                 # Authentication utilities
│   ├── database/             # Database utilities
│   ├── email/                # Email utilities
│   ├── security/             # Security utilities
│   ├── validation/           # Validation schemas
│   └── utils/                # General utilities
│
├── prisma/                   # Prisma ORM
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
│
├── tests/                    # Test files
│   └── unit/                 # Unit tests
│
├── docs/                     # Documentation
│   ├── product/              # Product documentation
│   └── technical/            # Technical documentation
│
├── instrumentation.ts        # App initialization
├── proxy.ts                  # Middleware
└── vitest.config.mts         # Vitest configuration
```

---

## Environment Variables Reference

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `NEXTAUTH_SECRET` | NextAuth secret key | Random 32+ character string |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |

### Optional (Email)

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password | App-specific password |
| `SMTP_FROM` | From address | `"Cofactor Scout" <no-reply@cofactor.world>` |

### Optional (Admin)

| Variable | Description | Example |
|----------|-------------|---------|
| `ADMIN_EMAIL` | Admin account email | `admin@cofactor.world` |
| `ADMIN_PASSWORD` | Admin account password | Secure password |

### Optional (Monitoring)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN | `https://...@sentry.io/...` |
| `SENTRY_ORG` | Sentry organization | `your-org` |
| `SENTRY_PROJECT` | Sentry project | `cofactor-scout` |
| `SENTRY_AUTH_TOKEN` | Sentry auth token | Token from Sentry |

---

## Database Management

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes (ALWAYS USE THIS - protects production DB)
npx dotenv -e .env.production -- npx prisma db push

# Create migration (production)
npx prisma migrate dev --name migration_name

# Deploy migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

**⚠️ IMPORTANT:** Always use `npx dotenv -e .env.production -- npx prisma db push` when updating the schema to avoid accidentally breaking the production database.

### Database Schema

See [DATABASE.md](./docs/technical/DATABASE.md) for complete schema documentation.

**Key Models:**
- `User`: Authentication, profiles, scout applications
- `ResearchSubmission`: Research leads with 3-step form data
- `SubmissionComment`: Comments on submissions (future)
- `PasswordReset`: Password reset tokens
- `SystemSettings`: Global settings (future)

---

## Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure
```
tests/
└── unit/
    ├── security/
    │   └── rate-limit.test.ts
    ├── validation/
    │   └── schemas.test.ts
    └── utils/
        └── utils.test.ts
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest'
import { signUpSchema } from '@/lib/validation/schemas'

describe('signUpSchema', () => {
  it('validates correct data', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'John Doe'
    })
    expect(result.success).toBe(true)
  })
})
```

---

## Deployment

### Production (Vercel + Supabase)

**1. Set up Supabase Database**
```bash
# Create Supabase project
# Copy connection string to VERCEL

# Push schema
npx dotenv -e .env.production -- npx prisma db push
```

**2. Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

**3. Configure Environment Variables**
Set all required environment variables in Vercel dashboard.

### Local Docker Deployment

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f web

# Push schema to database
docker-compose exec web npx prisma db push

# Stop services
docker-compose down
```

---

## Security

### Implemented Security Measures
- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ Email verification required
- ✅ Account lockout (5 failed attempts = 15-minute lock)
- ✅ Password complexity requirements
- ✅ Input validation (Zod schemas)
- ✅ Input sanitization (XSS, SQL injection prevention)
- ✅ CSRF protection (Server Actions)
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ Rate limiting (implemented, disabled in MVP)
- ✅ Secure session management (JWT)
- ✅ Email notifications for security events
- ✅ Structured logging
- ✅ Error monitoring (Sentry)

### Planned Security Features
- [ ] Two-factor authentication (schema ready)
- [ ] Redis-based distributed rate limiting
- [ ] DOMPurify for HTML sanitization
- [ ] Advanced anomaly detection

See [AUTHENTICATION.md](./docs/technical/AUTHENTICATION.md) for complete security documentation.

---

## Contributing

### Development Workflow

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Follow existing code style
   - Write tests for new features
   - Update documentation

3. **Test your changes**
   ```bash
   npm test
   npm run lint
   ```

4. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug"
   git commit -m "docs: update README"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style
- TypeScript for all code
- Functional components with hooks
- Server Components by default
- Client Components only when needed
- Tailwind CSS for styling
- Zod for validation

---

## Troubleshooting

### Common Issues

**Issue**: Database connection error
```bash
# Check DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

**Issue**: Email not sending
```bash
# Check SMTP configuration
# Verify SMTP credentials
# Check email logs in console
```

**Issue**: Session not persisting
```bash
# Check NEXTAUTH_SECRET is set
# Check NEXTAUTH_URL matches domain
# Clear browser cookies
```

**Issue**: Build errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma Client
npx prisma generate
```

---

## License

MIT License - see [LICENSE](./LICENSE) for details

---

## Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/cofactor-scout/issues)
- **Email**: support@cofactor.world

---

Built with ❤️ by the Cofactor Team
