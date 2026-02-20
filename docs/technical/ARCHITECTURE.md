# System Architecture

## Overview

Cofactor Scout is a Next.js 16 full-stack application built with the App Router, designed to connect university research with venture capital through a two-tier user system (Contributors and Scouts).

## Tech Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | Next.js | 16.1.6 | Full-stack React framework with App Router |
| **Runtime** | Node.js | 20+ | Server-side JavaScript runtime |
| **Language** | TypeScript | 5.x | Type-safe development |
| **Database** | PostgreSQL | 15+ | Primary data store |
| **ORM** | Prisma | 5.22.0 | Type-safe database access |
| **Authentication** | NextAuth.js | 4.24.13 | Session management & JWT |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-first CSS |
| **UI Components** | Radix UI | Various | Accessible component primitives |
| **Email** | Nodemailer | 7.0.12 | SMTP email delivery |
| **Validation** | Zod | 3.22.4 | Schema validation |
| **Testing** | Vitest | 4.0.18 | Unit testing framework |
| **Monitoring** | Sentry | 10.38.0 | Error tracking & performance |
| **Analytics** | Vercel Analytics | 1.6.1 | Usage analytics |

## Architecture Patterns

### 1. Server-First Architecture
- **Server Actions**: All mutations use Next.js Server Actions (`'use server'`)
- **Server Components**: Default to Server Components for data fetching
- **Client Components**: Only when interactivity is required (`'use client'`)

### 2. Layered Architecture

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (app/, components/, UI components)     │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Business Logic Layer            │
│  (actions/, lib/auth/, lib/validation)  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Data Access Layer               │
│  (lib/database/, Prisma queries)        │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Database Layer                  │
│  (PostgreSQL via Prisma)                │
└─────────────────────────────────────────┘
```

## Project Structure

```
cofactor-scout/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/   # NextAuth endpoints
│   │   ├── health/               # Health check
│   │   └── ...                   # Other API endpoints
│   ├── auth/                     # Authentication pages
│   │   ├── signin/               # Sign in page
│   │   ├── signup/               # Sign up page
│   │   ├── forgot-password/      # Password reset request
│   │   └── reset-password/       # Password reset form
│   ├── dashboard/                # User dashboard
│   │   ├── drafts/               # Draft submissions
│   │   ├── submissions/[id]/     # Submission details
│   │   └── submit/               # 3-step submission form
│   ├── scout/                    # Scout application
│   │   └── apply/                # Scout application form
│   ├── settings/                 # User settings
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
│
├── actions/                      # Server Actions
│   ├── auth.actions.ts           # Authentication actions
│   ├── submission.actions.ts     # Research submission actions
│   ├── scout.actions.ts          # Scout application actions
│   └── ...                       # Other actions
│
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   ├── submission/               # Submission form components
│   ├── settings/                 # Settings components
│   └── ...                       # Other components
│
├── lib/                          # Shared utilities
│   ├── auth/                     # Authentication utilities
│   │   ├── config.ts             # NextAuth configuration
│   │   └── session.ts            # Session helpers
│   ├── database/                 # Database utilities
│   │   ├── prisma.ts             # Prisma client
│   │   └── queries/              # Reusable queries
│   ├── email/                    # Email utilities
│   │   ├── send.ts               # Email sending functions
│   │   ├── templates.ts          # Email templates
│   │   └── utils.ts              # Email utilities
│   ├── security/                 # Security utilities
│   │   ├── sanitization.ts       # Input sanitization
│   │   ├── rate-limit.ts         # Rate limiting
│   │   └── csrf.ts               # CSRF protection
│   ├── validation/               # Validation schemas
│   │   └── schemas.ts            # Zod schemas
│   └── utils/                    # General utilities
│
├── prisma/                       # Prisma ORM
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
│
├── tests/                        # Test files
│   └── unit/                     # Unit tests
│       ├── security/             # Security tests
│       ├── validation/           # Validation tests
│       └── utils/                # Utility tests
│
├── types/                        # TypeScript types
│   └── next-auth.d.ts            # NextAuth type extensions
│
├── instrumentation.ts            # App initialization
├── proxy.ts                      # Middleware (renamed from middleware.ts)
└── vitest.config.mts             # Vitest configuration
```

## Data Flow

### 1. Authentication Flow
```
User → Sign In Page → Server Action (auth.actions.ts)
  → NextAuth Credentials Provider → Prisma User Query
  → Password Verification (bcrypt) → JWT Token Generation
  → Session Cookie → Redirect to Dashboard
```

### 2. Submission Flow
```
User → Dashboard → Submit Form (3 steps)
  → Step 1: Research Summary → Save Draft (submission.actions.ts)
  → Step 2: Additional Details → Update Draft
  → Step 3: Scout Pitch → Submit Research
  → Prisma Create/Update → Email Notification
  → Redirect to Dashboard
```

### 3. Scout Application Flow
```
User → Scout Application Form → Server Action (scout.actions.ts)
  → Validate Input (Zod) → Check Existing Application
  → Update User Record → Send Confirmation Email
  → Redirect to Submitted Page
```

## Security Architecture

### 1. Authentication & Authorization
- **JWT Sessions**: Managed by NextAuth.js
- **Password Hashing**: bcrypt with 10 rounds
- **Account Lockout**: 5 failed attempts = 15-minute lockout
- **Email Verification**: Required before first sign-in

### 2. Input Validation
- **Zod Schemas**: All inputs validated with Zod
- **Sanitization**: XSS prevention, SQL injection checks
- **Rate Limiting**: In-memory rate limiting (disabled in MVP)

### 3. Security Headers
```typescript
// Set in proxy.ts (middleware)
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000
Content-Security-Policy: [strict CSP]
```

## Database Architecture

### Entity Relationship
```
User (1) ──────< (N) ResearchSubmission
User (1) ──────< (N) SubmissionComment
User (1) ──────< (N) PasswordReset
ResearchSubmission (1) ──────< (N) SubmissionComment
```

### Key Indexes
- `User.email` (unique)
- `User.role`
- `User.scoutApplicationStatus`
- `ResearchSubmission.userId`
- `ResearchSubmission.status`
- `ResearchSubmission.isDraft`

## Deployment Architecture

### Production (Vercel + Supabase)
```
┌─────────────────────────────────────────┐
│         Vercel Edge Network             │
│  (CDN, Edge Functions, Middleware)      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Next.js Application             │
│  (Serverless Functions)                 │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Supabase PostgreSQL             │
│  (Managed Database)                     │
└─────────────────────────────────────────┘
```

### Local Development (Docker)
```
┌─────────────────────────────────────────┐
│         Next.js Dev Server              │
│  (localhost:3000)                       │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         PostgreSQL Container            │
│  (Docker Compose)                       │
└─────────────────────────────────────────┘
```

## Performance Optimizations

### 1. Server Components
- Default to Server Components for better performance
- Reduce client-side JavaScript bundle

### 2. Database Queries
- Prisma query optimization
- Select only required fields
- Use indexes for common queries

### 3. Caching Strategy
- Next.js automatic caching for Server Components
- `revalidatePath()` for cache invalidation

## Monitoring & Observability

### 1. Error Tracking
- **Sentry**: Captures errors and performance metrics
- **Custom Logger**: Structured logging with `lib/logger.ts`

### 2. Analytics
- **Vercel Analytics**: Page views and performance
- **Custom Events**: Track user actions

### 3. Health Checks
- `/api/health`: Application health endpoint
- Database connection monitoring

## Scalability Considerations

### Current Limitations (MVP)
- In-memory rate limiting (not distributed)
- No caching layer (Redis planned)
- Synchronous email sending

### Future Improvements
- Redis for distributed rate limiting
- Background job queue (BullMQ)
- CDN for static assets
- Database read replicas
