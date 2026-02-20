# Database Schema Documentation

## Overview

Cofactor Scout uses PostgreSQL as its primary database, accessed through Prisma ORM. The schema is designed to support a two-tier user system (Contributors and Scouts) with research submission tracking.

## Database Configuration

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

- **Provider**: PostgreSQL 15+
- **Connection Pooling**: Supported via `DIRECT_URL`
- **Binary Targets**: `["native", "linux-musl-arm64-openssl-3.0.x"]` for ARM64 deployment

## Enums

### Role
Platform-level user roles.

```prisma
enum Role {
  CONTRIBUTOR  // Default role for all new users
  SCOUT        // Verified scouts with priority review
  ADMIN        // System administrators
}
```

### UserRole
Academic/professional roles for scout applications.

```prisma
enum UserRole {
  PHD_STUDENT
  POSTDOC
  PROFESSOR
  INDUSTRY_RESEARCHER
  INDEPENDENT_RESEARCHER
  OTHER
}
```

### ScoutApplicationStatus
Tracks scout application workflow.

```prisma
enum ScoutApplicationStatus {
  NOT_APPLIED  // User has not applied
  PENDING      // Application submitted, awaiting review
  APPROVED     // Application approved, user promoted to SCOUT
  REJECTED     // Application rejected
}
```

### SubmissionStatus
Research submission pipeline stages.

```prisma
enum SubmissionStatus {
  PENDING_RESEARCH      // Initial submission, awaiting review
  VALIDATING            // Under validation by Cofactor team
  PITCHED_MATCHMAKING   // Pitched to investors, matchmaking in progress
  MATCH_MADE            // Successfully matched with investor
  REJECTED              // Submission rejected
}
```

### CareerStage
Researcher's career stage.

```prisma
enum CareerStage {
  UNDERGRAD_STUDENT
  PHD_STUDENT
  POSTDOC
  PROFESSOR
  INDUSTRY_RESEARCHER
  INDEPENDENT_RESEARCHER
  OTHER
}
```

### ResearchStage
Research maturity level.

```prisma
enum ResearchStage {
  EARLY_CONCEPT      // Idea stage
  ACTIVE_RESEARCH    // Ongoing research
  HAS_RESULTS        // Results available
  PUBLISHED          // Published research
}
```

### FundingStatus
Funding status of research.

```prisma
enum FundingStatus {
  NOT_SEEKING
  SEEKING_SEED
  SEEKING_SERIES_A
  GRANT_FUNDED
  INDUSTRY_FUNDED
  VC_BACKED
}
```

### SubmissionSource
How the scout found the lead.

```prisma
enum SubmissionSource {
  CONFERENCE
  ACADEMIC_PAPER
  LINKEDIN
  PERSONAL_CONNECTION
  LAB_VISIT
  OTHER
}
```

### Relationship
Scout's relationship to researcher.

```prisma
enum Relationship {
  LAB_MATE
  CLASSMATE
  COLLEAGUE
  NO_RELATIONSHIP
  OTHER
}
```

## Models

### User

Core user model handling authentication, profiles, and scout applications.

```prisma
model User {
  // Core Identity
  id            String  @id @default(cuid())
  email         String  @unique
  password      String
  fullName      String
  firstName     String
  lastName      String
  preferredName String?
  role          Role    @default(CONTRIBUTOR)

  // Authentication
  emailVerified       DateTime?
  verificationToken   String?   @unique
  verificationExpires DateTime?
  failedLoginAttempts Int       @default(0)
  lockedUntil         DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // Scout Profile (populated via scout application)
  university             String?
  department             String?
  linkedinUrl            String?
  userRole               UserRole?
  researchAreas          String?
  whyScout               String?
  howSourceLeads         String?
  scoutApplicationStatus ScoutApplicationStatus @default(NOT_APPLIED)
  scoutApplicationDate   DateTime?

  // Profile Settings
  bio                String?
  personalWebsite    String?
  additionalLinks    Json?
  profilePictureUrl  String?

  // Account Security
  twoFactorEnabled   Boolean  @default(false)
  twoFactorSecret    String?

  // Stats
  totalSubmissions    Int @default(0)
  pendingSubmissions  Int @default(0)
  approvedSubmissions Int @default(0)

  // Relations
  submissions    ResearchSubmission[]
  comments       SubmissionComment[]
  passwordResets PasswordReset[]

  @@index([email])
  @@index([role])
  @@index([scoutApplicationStatus])
  @@index([createdAt])
}
```

**Key Fields:**
- `id`: CUID for unique identification
- `email`: Unique, used for authentication
- `password`: bcrypt hashed (10 rounds)
- `role`: CONTRIBUTOR (default), SCOUT, or ADMIN
- `emailVerified`: Null until email is verified
- `failedLoginAttempts`: Tracks failed logins for account lockout
- `lockedUntil`: Account locked until this timestamp
- `scoutApplicationStatus`: Tracks scout application workflow

**Indexes:**
- `email`: For fast authentication lookups
- `role`: For role-based queries
- `scoutApplicationStatus`: For admin dashboard
- `createdAt`: For sorting users by registration date

### ResearchSubmission

Research lead submission with 3-step form data.

```prisma
model ResearchSubmission {
  // Core
  id          String           @id @default(cuid())
  userId      String
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  status      SubmissionStatus @default(PENDING_RESEARCH)
  isDraft     Boolean          @default(false)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  submittedAt DateTime?

  // Step 1 - Research Summary
  researchTopic         String?
  researchDescription   String?
  researcherName        String?
  researcherEmail       String?
  researcherInstitution String?
  researcherDepartment  String?

  // Step 2 - Additional Details
  researcherCareerStage    CareerStage?
  researcherLinkedin       String?
  researchStage            ResearchStage?
  fundingStatus            FundingStatus?
  keyPublications          String?
  potentialApplications    String?
  supportingLinks          Json?             @default("[]")
  submissionSource         SubmissionSource?
  relationshipToResearcher Relationship?
  researcherAwareness      Boolean           @default(false)

  // Step 3 - Scout Pitch
  whyInteresting String?

  // System
  isDuplicate Boolean @default(false)
  duplicateOf String?

  // Relations
  comments SubmissionComment[]

  @@index([userId])
  @@index([status])
  @@index([isDraft])
  @@index([researcherEmail])
  @@index([createdAt])
  @@index([submittedAt])
}
```

**Key Fields:**
- `isDraft`: True for saved drafts, false for submitted
- `status`: Tracks submission through pipeline
- `submittedAt`: Timestamp when draft was submitted
- `supportingLinks`: JSON array of URLs
- `isDuplicate`: Flagged if duplicate detected
- `researcherAwareness`: Whether researcher knows about submission

**Indexes:**
- `userId`: For user's submissions
- `status`: For filtering by status
- `isDraft`: For separating drafts from submissions
- `researcherEmail`: For duplicate detection
- `createdAt`, `submittedAt`: For sorting

### SubmissionComment

Comments on research submissions (future feature).

```prisma
model SubmissionComment {
  id           String             @id @default(cuid())
  submissionId String
  submission   ResearchSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  userId       String
  user         User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  content      String
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt

  @@index([submissionId])
  @@index([userId])
}
```

**Key Fields:**
- `content`: Comment text
- `submissionId`: Links to submission
- `userId`: Comment author

### PasswordReset

Password reset tokens.

```prisma
model PasswordReset {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expires   DateTime
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([token])
}
```

**Key Fields:**
- `token`: Unique reset token (64-char hex)
- `expires`: Token expiration (1 hour from creation)
- `userId`: User requesting reset

**Indexes:**
- `token`: For fast token lookup
- `userId`: For user's reset requests

### SystemSettings

Global system settings (future feature).

```prisma
model SystemSettings {
  id                       String   @id @default(cuid())
  enableEmailNotifications Boolean  @default(true)
  enableInAppNotifications Boolean  @default(true)
  updatedAt                DateTime @updatedAt
}
```

## Relationships

### One-to-Many
- `User` → `ResearchSubmission`: A user can have many submissions
- `User` → `SubmissionComment`: A user can write many comments
- `User` → `PasswordReset`: A user can have multiple reset requests
- `ResearchSubmission` → `SubmissionComment`: A submission can have many comments

### Cascade Deletes
- Deleting a `User` cascades to:
  - All their `ResearchSubmission` records
  - All their `SubmissionComment` records
  - All their `PasswordReset` records
- Deleting a `ResearchSubmission` cascades to:
  - All its `SubmissionComment` records

## Data Types

### String Fields
- `String`: Variable-length text
- `String?`: Optional text (nullable)

### Numeric Fields
- `Int`: Integer (e.g., `failedLoginAttempts`)
- `Int @default(0)`: Integer with default value

### Date/Time Fields
- `DateTime`: Timestamp with timezone
- `DateTime @default(now())`: Auto-set to current time
- `DateTime @updatedAt`: Auto-update on record change

### JSON Fields
- `Json?`: Flexible JSON data (e.g., `additionalLinks`, `supportingLinks`)
- Stored as JSONB in PostgreSQL for efficient querying

### Boolean Fields
- `Boolean`: True/false
- `Boolean @default(false)`: Boolean with default value

## Constraints

### Unique Constraints
- `User.email`: Each email can only be used once
- `User.verificationToken`: Each token is unique
- `PasswordReset.token`: Each reset token is unique

### Default Values
- `User.role`: Defaults to `CONTRIBUTOR`
- `User.failedLoginAttempts`: Defaults to `0`
- `User.scoutApplicationStatus`: Defaults to `NOT_APPLIED`
- `ResearchSubmission.status`: Defaults to `PENDING_RESEARCH`
- `ResearchSubmission.isDraft`: Defaults to `false`
- `ResearchSubmission.supportingLinks`: Defaults to `"[]"`

### Auto-Generated Fields
- `@id @default(cuid())`: Auto-generate CUID
- `@default(now())`: Auto-set to current timestamp
- `@updatedAt`: Auto-update on record modification

## Query Patterns

### Common Queries

#### Get User by Email
```typescript
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  select: { id: true, email: true, role: true }
})
```

#### Get User's Submissions
```typescript
const submissions = await prisma.researchSubmission.findMany({
  where: { userId: user.id, isDraft: false },
  orderBy: { createdAt: 'desc' }
})
```

#### Get Pending Scout Applications
```typescript
const applications = await prisma.user.findMany({
  where: { scoutApplicationStatus: 'PENDING' },
  orderBy: { scoutApplicationDate: 'desc' }
})
```

#### Create Draft Submission
```typescript
const draft = await prisma.researchSubmission.create({
  data: {
    userId: user.id,
    isDraft: true,
    researchTopic: 'AI for Drug Discovery',
    researchDescription: '...'
  }
})
```

#### Submit Draft
```typescript
await prisma.researchSubmission.update({
  where: { id: draftId },
  data: {
    isDraft: false,
    submittedAt: new Date(),
    status: 'PENDING_RESEARCH'
  }
})
```

## Migrations

### Migration Strategy
- Prisma Migrate for schema changes
- Migrations stored in `prisma/migrations/`
- Each migration has SQL file and timestamp

### Running Migrations

#### Development
```bash
npx prisma db push
```

#### Production
```bash
npx prisma migrate deploy
```

### Current Migrations
1. `20260217221320_replace_wiki_schema_with_scout_schema`: Initial schema
2. `20260218014205_add_profile_and_2fa_fields`: Added profile and 2FA fields

## Performance Considerations

### Indexes
All frequently queried fields have indexes:
- Foreign keys (automatic)
- Unique constraints (automatic)
- Status fields
- Date fields for sorting

### Query Optimization
- Use `select` to fetch only needed fields
- Use `include` sparingly (N+1 queries)
- Batch operations with `createMany`, `updateMany`

### Connection Pooling
- Prisma handles connection pooling automatically
- Configure `connection_limit` in `DATABASE_URL`

## Backup & Recovery

### Backup Strategy
- Automated daily backups (production)
- Point-in-time recovery available
- Manual backups via `pg_dump`

### Restore Process
```bash
psql $DATABASE_URL < backup.sql
```

## Security

### Data Protection
- Passwords hashed with bcrypt (never stored plain)
- Sensitive fields (tokens) indexed for fast lookup
- Cascade deletes prevent orphaned records

### Access Control
- All queries go through Prisma (parameterized)
- No raw SQL queries (prevents SQL injection)
- Row-level security via application logic
