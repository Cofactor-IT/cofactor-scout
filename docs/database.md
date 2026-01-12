# Database Schema

This document describes the complete database schema, relationships, and data models used in Cofactor Club.

## Table of Contents

- [Overview](#overview)
- [Core Models](#core-models)
- [Enums](#enums)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Migrations](#migrations)
- [Data Access Patterns](#data-access-patterns)

---

## Overview

Cofactor Club uses **PostgreSQL 15** as the primary database, accessed through the **Prisma ORM**. The schema is designed for:

- **Type safety** with auto-generated TypeScript types
- **Referential integrity** with foreign key constraints
- **Performance** with strategic indexes
- **ARM64 compatibility** for cloud deployment

### Database Configuration

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-arm64-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Binary Targets

The Prisma client is configured to support:
- `native` - Development (x86_64/ARM64)
- `linux-musl-arm64-openssl-3.0.x` - Production Docker on ARM64 (Alpine)

---

## Core Models

### User

Represents a user account in the system.

```prisma
model User {
  id                   String    @id @default(cuid())
  email                String    @unique
  name                 String?
  password             String?
  role                 Role      @default(STUDENT)
  referralCode         String    @unique
  socialStats          Json?
  powerScore           Int       @default(0)
  emailVerified        DateTime?
  verificationToken    String?   @unique
  verificationExpires  DateTime?
  failedLoginAttempts  Int       @default(0)
  lockedUntil          DateTime?
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  revisions            WikiRevision[]
  referralsMade        Referral[] @relation("Referrer")
  referredBy           Referral?  @relation("Referee")
  passwordResetTokens  PasswordReset[]
}
```

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String (CUID) | No | Auto-generated | Primary key |
| `email` | String | No | - | User's email (login identifier) |
| `name` | String | Yes | - | Display name |
| `password` | String | Yes | - | Bcrypt hashed password |
| `role` | Role | No | STUDENT | User's access level |
| `referralCode` | String | No | Auto-generated | Unique code for referrals |
| `socialStats` | JSON | Yes | - | Social media follower counts |
| `powerScore` | Int | No | 0 | Gamified reputation score |
| `emailVerified` | DateTime | Yes | - | Timestamp of verification |
| `verificationToken` | String | Yes | - | Email verification token |
| `verificationExpires` | DateTime | Yes | - | Token expiration (24h) |
| `failedLoginAttempts` | Int | No | 0 | Security: failed login counter |
| `lockedUntil` | DateTime | Yes | - | Account lockout expiration |
| `createdAt` | DateTime | No | now() | Account creation timestamp |
| `updatedAt` | DateTime | No | Auto | Last update timestamp |

#### SocialStats JSON Schema

```typescript
interface SocialStats {
  instagram?: number;           // Instagram follower count
  instagramUsername?: string;   // Instagram handle
  tiktok?: number;              // TikTok follower count
  tiktokUsername?: string;      // TikTok handle
  linkedin?: number;            // LinkedIn connections
  linkedinUrl?: string;         // LinkedIn profile URL
}
```

---

### UniPage

Represents a university wiki page.

```prisma
model UniPage {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  content   String
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  revisions WikiRevision[]
}
```

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String (CUID) | No | Auto-generated | Primary key |
| `name` | String | No | - | University display name |
| `slug` | String | No | - | URL-friendly identifier |
| `content` | String | No | - | Page content (sanitized HTML) |
| `published` | Boolean | No | false | Visibility flag |
| `createdAt` | DateTime | No | now() | Creation timestamp |
| `updatedAt` | DateTime | No | Auto | Last update timestamp |

#### Published State

A page is only visible on the wiki when `published = true`. This ensures:
- New pages require admin approval before appearing
- Edits go through moderation workflow
- Quality control on all content

---

### WikiRevision

Represents a proposed change to a wiki page.

```prisma
model WikiRevision {
  id        String         @id @default(cuid())
  uniPageId String
  uniPage   UniPage        @relation(fields: [uniPageId], references: [id], onDelete: Cascade)
  authorId  String
  author    User           @relation(fields: [authorId], references: [id], onDelete: Cascade)
  content   String
  status    RevisionStatus @default(PENDING)
  createdAt DateTime       @default(now())
}
```

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String (CUID) | No | Auto-generated | Primary key |
| `uniPageId` | String | No | - | Foreign key to UniPage |
| `authorId` | String | No | - | Foreign key to User (author) |
| `content` | String | No | - | Proposed content (sanitized) |
| `status` | RevisionStatus | No | PENDING | Moderation status |
| `createdAt` | DateTime | No | now() | Submission timestamp |

#### Revision Lifecycle

```
PENDING → APPROVED (applies to page, awards points)
PENDING → REJECTED (discarded)
```

#### Staff Behavior

When a `STAFF` or `ADMIN` member submits an edit:
- Revision status is set to `APPROVED` immediately
- Page content is updated
- Page is marked as `published = true`
- Power Score is awarded

---

### Referral

Represents a referral relationship between users.

```prisma
model Referral {
  id         String   @id @default(cuid())
  referrerId String
  referrer   User     @relation("Referrer", fields: [referrerId], references: [id], onDelete: Cascade)
  refereeId  String   @unique
  referee    User     @relation("Referee", fields: [refereeId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())
}
```

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String (CUID) | No | Auto-generated | Primary key |
| `referrerId` | String | No | - | User who sent the invite |
| `refereeId` | String | No | - | User who was invited (unique) |
| `createdAt` | DateTime | No | now() | Referral timestamp |

#### Constraints

- Each user can only be referred once (`refereeId` is unique)
- A user cannot refer to themselves
- Cascade delete: if either user is deleted, referral is removed

---

### PasswordReset

Represents a password reset token.

```prisma
model PasswordReset {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expires   DateTime
  createdAt DateTime @default(now())
}
```

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String (CUID) | No | Auto-generated | Primary key |
| `token` | String | No | - | 6-digit numeric code |
| `userId` | String | No | - | Foreign key to User |
| `expires` | DateTime | No | - | Token expiration (1 hour) |
| `createdAt` | DateTime | No | now() | Creation timestamp |

#### Token Format

- 6-digit numeric code (e.g., "123456")
- Generated using `randomInt(100000, 1000000)`
- Single-use (deleted after successful reset)
- Expires after 1 hour

---

## Enums

### Role

Defines user access levels.

```prisma
enum Role {
  STUDENT
  ADMIN
  STAFF
  PENDING_STAFF
}
```

| Role | Description |
|------|-------------|
| `STUDENT` | Default member, can create referrals and propose wiki edits |
| `STAFF` | Trusted member, wiki edits are auto-approved |
| `PENDING_STAFF` | Awaiting admin approval for staff privileges |
| `ADMIN` | Full access to all features and user management |

### Role Hierarchy

```
ADMIN
  ├── Can manage all users
  ├── Can approve/reject wiki revisions
  ├── Can approve/reject staff applications
  └── Can delete wiki pages

STAFF
  ├── Wiki edits are auto-approved
  └── All student privileges

PENDING_STAFF
  ├── Awaiting approval
  └── Has student privileges

STUDENT
  ├── Can create referrals
  ├── Can propose wiki edits
  └── Can link social accounts
```

---

### RevisionStatus

Defines moderation workflow states.

```prisma
enum RevisionStatus {
  PENDING
  APPROVED
  REJECTED
}
```

| Status | Description |
|--------|-------------|
| `PENDING` | Awaiting admin review |
| `APPROVED` | Accepted and applied to page |
| `REJECTED` | Discarded by admin |

---

## Relationships

### Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐
│    User     │         │   UniPage   │
│             │1       1│             │
│ - id        │─────────│ - id        │
│ - email     │         │ - slug      │
│ - role      │         │ - content   │
│ - powerScore│         │ - published │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │1                     N│
       │                       │
       │    N              N   │
       ▼                    ▼   ▼
┌─────────────────┐   ┌─────────────┐
│  WikiRevision   │   │  Referral   │
│                 │   │             │
│ - id            │   │ - id        │
│ - content       │   │ - referrerId│
│ - status        │   │ - refereeId │
└─────────────────┘   └─────────────┘
       ▲
       │
       │
┌──────────────┐
│ PasswordReset│
│              │
│ - token      │
│ - expires    │
└──────────────┘
```

### Relationship Details

#### User → WikiRevision (One-to-Many)

```typescript
// Get all revisions by a user
const userRevisions = await prisma.wikiRevision.findMany({
  where: { authorId: userId },
  include: { uniPage: true }
});
```

#### UniPage → WikiRevision (One-to-Many)

```typescript
// Get all revisions for a page
const pageRevisions = await prisma.wikiRevision.findMany({
  where: { uniPageId: pageId },
  include: { author: true },
  orderBy: { createdAt: 'desc' }
});
```

#### User → Referral (One-to-Many as Referrer)

```typescript
// Get all referrals made by a user
const referralsMade = await prisma.referral.findMany({
  where: { referrerId: userId },
  include: { referee: true }
});
```

#### User → Referral (One-to-One as Referee)

```typescript
// Get who referred this user
const referral = await prisma.referral.findUnique({
  where: { refereeId: userId },
  include: { referrer: true }
});
```

---

## Indexes

Indexes are strategically placed for query performance.

### User Model Indexes

```prisma
@@index([email])                    // Login queries
@@index([referralCode])             // Referral lookups
@@index([powerScore(sort: Desc)])   // Leaderboard
@@index([createdAt(sort: Desc)])    // Recent signups
@@index([role])                     // Role-based queries
```

### WikiRevision Model Indexes

```prisma
@@index([status])                   // Pending revision queue
@@index([authorId])                 // User's revision history
@@index([uniPageId])                // Page revision list
@@index([createdAt(sort: Desc)])    // Recent revisions
```

### Referral Model Indexes

```prisma
@@index([referrerId])               // User's referral count
@@unique([referrerId, refereeId])   // Prevent duplicate referrals
```

### PasswordReset Model Indexes

```prisma
@@index([token])                    // Token lookup
@@index([userId])                   // User's active tokens
```

---

## Migrations

### Creating a Migration

```bash
# After modifying schema.prisma
npx prisma migrate dev --name your_migration_name
```

### Resetting Database

```bash
# WARNING: Deletes all data
npx prisma migrate reset
```

### Pushing Schema (Development)

```bash
# Push schema without migration file
npx prisma db push
```

### Generating Prisma Client

```bash
# After schema changes
npx prisma generate
```

### Opening Prisma Studio

```bash
# GUI for database inspection
npx prisma studio
```

---

## Data Access Patterns

### Singleton Pattern

The Prisma client uses a singleton pattern to prevent connection pool exhaustion in development:

```typescript
// lib/prisma.ts
const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
```

### Common Queries

#### Get User by Email

```typescript
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
});
```

#### Get Leaderboard

```typescript
const leaderboard = await prisma.user.findMany({
  where: { role: { in: ['STUDENT', 'STAFF'] } },
  orderBy: { powerScore: 'desc' },
  take: 10,
  select: {
    name: true,
    referralCode: true,
    powerScore: true,
    socialStats: true
  }
});
```

#### Get Pending Revisions

```typescript
const pending = await prisma.wikiRevision.findMany({
  where: { status: 'PENDING' },
  include: {
    author: { select: { name: true, email: true } },
    uniPage: { select: { name: true, slug: true } }
  },
  orderBy: { createdAt: 'asc' }
});
```

#### Get Referral Count

```typescript
const count = await prisma.referral.count({
  where: { referrerId: userId }
});
```

#### Transaction Example

```typescript
await prisma.$transaction([
  prisma.wikiRevision.update({
    where: { id: revisionId },
    data: { status: 'APPROVED' }
  }),
  prisma.uniPage.update({
    where: { id: pageId },
    data: { content: newContent }
  }),
  prisma.user.update({
    where: { id: authorId },
    data: { powerScore: { increment: 20 } }
  })
]);
```

---

## Database Backup & Restore

See [Deployment Documentation](./deployment.md#backup-and-restore) for backup procedures.

---

**Next:** Read the [Authentication documentation](./authentication.md) for auth flow details.
