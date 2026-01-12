# Architecture Documentation

This document describes the overall system architecture, design patterns, and component organization of Cofactor Club.

## Table of Contents

- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Design Patterns](#design-patterns)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Performance Considerations](#performance-considerations)

---

## System Overview

Cofactor Club is built as a **monolithic full-stack application** using Next.js 16 with the App Router architecture. The application follows a **server-first approach** with:

- **Server-Side Rendering (SSR)** for SEO and initial page load
- **Server Actions** for data mutations
- **API Routes** for external integrations
- **PostgreSQL** as the primary database
- **Prisma ORM** for type-safe database access

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                           │
│                    (React + Tailwind CSS)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Next.js App Router                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Server Components                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │   Admin  │  │   Wiki   │  │  Auth    │  │ Profile  │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Routes                             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │  /auth   │  │ /members │  │ /wiki    │  │ /health  │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 Server Actions                            │  │
│  │  ┌─────────────────┐  ┌─────────────────┐                │  │
│  │  │ Admin Actions   │  │  Wiki Actions   │                │  │
│  │  └─────────────────┘  └─────────────────┘                │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Prisma ORM Layer                          │
│                     (Type-safe Database Access)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       PostgreSQL 15                              │
│                    (Primary Data Store)                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend Layer

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React framework with App Router | 16 |
| **React** | UI library | Latest (via Next.js) |
| **TypeScript** | Type safety | 5.x |
| **Tailwind CSS** | Utility-first styling | 3.x |
| **Shadcn UI** | Pre-built accessible components | Latest |
| **Radix UI** | Unstyled component primitives | Latest |

### Backend Layer

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js API Routes** | Backend endpoints | Built-in |
| **Server Actions** | Mutations with form handling | Built-in |
| **NextAuth.js** | Authentication | 5.x (beta) |
| **Zod** | Schema validation | 3.x |
| **Nodemailer** | Email sending | 6.x |

### Data Layer

| Technology | Purpose | Version |
|------------|---------|---------|
| **PostgreSQL** | Relational database | 15 |
| **Prisma** | ORM and schema management | 5.x |

### Infrastructure

| Technology | Purpose | Version |
|------------|---------|---------|
| **Docker** | Containerization | Latest |
| **Node.js** | Runtime | 20-alpine |
| **Cloudflare Tunnel** | Secure tunneling (optional) | Latest |

---

## Project Structure

```
cofactor-club/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin dashboard
│   │   ├── page.tsx              # Dashboard main page
│   │   ├── staff-applications.tsx# Staff approval page
│   │   └── actions.ts            # Admin server actions
│   ├── auth/                     # Authentication pages
│   │   ├── signin/
│   │   │   └── page.tsx          # Sign in form
│   │   ├── signup/
│   │   │   └── page.tsx          # Sign up form
│   │   ├── verify/
│   │   │   ├── page.tsx          # Email verification page
│   │   │   └── route.ts          # Verification API
│   │   └── reset-password/       # Password reset
│   ├── members/                  # Members directory (admin only)
│   │   ├── page.tsx              # Members list
│   │   └── actions.ts            # Member management actions
│   ├── profile/                  # User profile
│   │   ├── [id]/
│   │   │   └── page.tsx          # Profile page
│   │   └── actions.ts            # Profile server actions
│   ├── wiki/                     # University wiki
│   │   ├── page.tsx              # Wiki home
│   │   ├── [slug]/
│   │   │   ├── page.tsx          # Wiki page view
│   │   │   └── edit/
│   │   │       ├── page.tsx      # Edit page
│   │   │       └── actions.ts    # Wiki server actions
│   │   └── create/
│   │       └── page.tsx          # Create new page
│   ├── leaderboard/
│   │   └── page.tsx              # Power Score rankings
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts      # NextAuth configuration
│   │   ├── members/
│   │   │   ├── update-role/route.ts
│   │   │   ├── delete-user/route.ts
│   │   │   └── reset-password/route.ts
│   │   ├── health/
│   │   │   └── route.ts          # Health check endpoint
│   │   └── verify-email/route.ts
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── ui/                       # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── toast.tsx
│   │   ├── table.tsx
│   │   └── ...                   # More UI components
│   ├── DiffViewer.tsx            # Wiki diff comparison
│   ├── WikiContent.tsx           # Rendered wiki content
│   └── social-icons.tsx          # Social media icons
│
├── lib/                          # Utility functions
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # NextAuth configuration
│   ├── auth-options.ts           # Auth options
│   ├── email.ts                  # Email utilities
│   ├── validation.ts             # Zod schemas
│   ├── rate-limit.ts             # Rate limiting
│   ├── types.ts                  # TypeScript types
│   └── utils.ts                  # General utilities
│
├── prisma/
│   └── schema.prisma             # Database schema
│
├── scripts/                      # Utility scripts
│   ├── backup.sh                 # Database backup
│   └── restore.sh                # Database restore
│
├── public/                       # Static assets
│   └── logo.png                  # Application logo
│
├── Dockerfile                    # Docker configuration
├── docker-compose.yml            # Docker services
├── instrumentation.ts            # Startup scripts (admin seeding)
├── middleware.ts                 # NextAuth middleware
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript configuration
```

---

## Design Patterns

### 1. Server-First Rendering

The application uses Server Components by default for:

- **SEO optimization** - Content is rendered on the server
- **Performance** - Reduced client-side JavaScript
- **Data fetching** - Direct database access without API calls

```typescript
// Server Component example
export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const stats = await getAdminStats(); // Direct DB access

  return <DashboardView stats={stats} />;
}
```

### 2. Server Actions for Mutations

Data mutations use Server Actions for:

- **Form handling** with automatic validation
- **Progressive enhancement** (works without JS)
- **Type safety** with TypeScript

```typescript
'use server';

export async function approveRevision(revisionId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { error: 'Unauthorized' };
  }

  // Mutation logic
  await prisma.wikiRevision.update({
    where: { id: revisionId },
    data: { status: 'APPROVED' }
  });
}
```

### 3. Repository Pattern via Prisma

Database access is centralized through the Prisma client:

```typescript
// lib/prisma.ts
const prisma = globalThis.prisma || new PrismaClient();
export default prisma;
```

### 4. Role-Based Access Control

Authorization is implemented at multiple levels:

- **Middleware** - Route protection
- **Server Action guards** - Action-level checks
- **Component-level checks** - UI conditionals

```typescript
// Example guard
if (session?.user.role !== 'ADMIN') {
  redirect('/auth/signin');
}
```

### 5. Validation Schema Pattern

All user input is validated using Zod schemas:

```typescript
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  referralCode: z.string().optional(),
});
```

---

## Component Architecture

### Page Component Structure

Each page follows this pattern:

```
Page (Server Component)
├── Layout Components (Header, Footer)
├── Data Fetching (Server-side)
├── Client Components (for interactivity)
└── Server Actions (for mutations)
```

### Component Hierarchy

```
app/layout.tsx (Root Layout)
├── Header (Navigation, User Menu)
├── Main Content Area
│   ├── Auth Pages
│   ├── Admin Dashboard
│   │   ├── Stats Cards
│   │   ├── Leaderboard
│   │   └── Recent Activity
│   ├── Wiki Pages
│   │   ├── Wiki List
│   │   ├── Wiki Detail
│   │   └── Wiki Editor
│   ├── Profile Pages
│   └── Leaderboard
└── Footer
```

### Shadcn UI Integration

The application uses Shadcn UI components which are:

- **Copied into the project** (not npm dependencies)
- **Fully customizable** for project needs
- **Built on Radix UI** for accessibility
- **Styled with Tailwind CSS**

---

## Data Flow

### Authentication Flow

```
User → Sign In Form
    ↓
Server Action (signin)
    ↓
Validate Credentials
    ↓
NextAuth.js
    ↓
Create JWT Session
    ↓
Set HTTP-only Cookie
    ↓
Redirect to Dashboard
```

### Wiki Edit Flow

```
User → Edit Wiki Page
    ↓
Submit Edit Form
    ↓
Server Action (createRevision)
    ↓
Create Pending Revision
    ↓
Admin Dashboard (Notification)
    ↓
Admin Reviews Diff
    ↓
Approve/Reject
    ↓
Update Page Content (if approved)
    ↓
Award Power Score
```

### Referral Flow

```
User A Shares Referral Code
    ↓
User B Signs Up with Code
    ↓
Server Creates Referral Record
    ↓
Award User A: +50 Power Score
    ↓
User B Account Created
```

---

## Performance Considerations

### 1. Database Indexing

The schema includes indexes on frequently queried fields:

```prisma
model User {
  email        String   @unique  // Automatic index
  referralCode String   @unique  // Automatic index
  // ... other fields
}
```

### 2. Standalone Output

Next.js is configured for standalone output:

```javascript
// next.config.js
module.exports = {
  output: 'standalone',
  // ... other config
};
```

This creates a minimal Docker image with only necessary files.

### 3. Connection Pooling

Prisma manages database connections efficiently:

```typescript
// lib/prisma.ts
const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
```

### 4. Parallel Data Fetching

Server components use parallel data fetching:

```typescript
const [users, referrals, stats] = await Promise.all([
  prisma.user.count(),
  prisma.referral.count(),
  getPowerScoreStats(),
]);
```

### 5. Client-side Caching

React hooks handle client-side state:

```typescript
// Client components use React Query-like patterns
const [data, setData] = useState(null);
```

---

## Admin Dashboard

The admin dashboard is the central hub for platform management:

### Components

| Component | Description |
|-----------|-------------|
| **KPI Cards** | Total users, referrals, social reach, pending actions |
| **Leaderboard** | Top 10 users by Power Score |
| **Recent Signups** | Latest members with role badges |
| **Activity Hotspots** | Most edited wiki pages |
| **Staff Applications** | Pending staff approval queue |
| **Revisions Queue** | Wiki edits awaiting moderation |

### Data Access

The dashboard fetches data in parallel for optimal performance:

```typescript
const [
  totalUsers,
  totalReferrals,
  totalSocialReach,
  pendingRevisions,
  pendingStaff,
  topUsers,
  recentSignups,
  activePages
] = await Promise.all([...]);
```

---

## Security Architecture

See [Authentication Documentation](./authentication.md#security-features) for detailed security information.

---

## Extensibility

The architecture supports future enhancements:

1. **Plugin System** - Easy to add new wiki features
2. **API Expansion** - RESTful endpoints for integrations
3. **Role Extensions** - Add new roles in Prisma schema
4. **Notification System** - Foundation for real-time updates

---

**Next:** Read the [API Reference](./api.md) for detailed endpoint documentation.
