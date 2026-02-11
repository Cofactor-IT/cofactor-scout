# Architecture & Tech Stack

## Overview

**Cofactor Club** is a modern full-stack web application built to serve as a gamified university wiki and student ambassador network. It prioritizes mobile responsiveness, performance, and strict content moderation.

## Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) | React framework with App Router and Server Actions. |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict typing for type safety and maintainability. |
| **Database** | [PostgreSQL 15](https://www.postgresql.org/) | Relational database for all core data. |
| **ORM** | [Prisma](https://www.prisma.io/) | Type-safe database client and schema migration tool. |
| **Caching** | [Redis](https://redis.io/) | High-performance caching for search and suggestions. |
| **Auth** | [NextAuth.js](https://next-auth.js.org/) | Authentication (Credentials provider). |
| **UI** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework. |
| **Components** | [Shadcn/UI](https://ui.shadcn.com/) | Reusable UI components based on Radix UI. |
| **Deployment** | [Docker](https://www.docker.com/) | Containerization for consistent deployment (ARM64/x86). |

## Directory Structure

The project follows the standard Next.js App Router structure with feature-based grouping.

```
cofactor-club/
├── app/                  # Application Routes & Pages
│   ├── actions.ts        # Global server actions
│   ├── admin/            # Admin Dashboard (Protected)
│   ├── auth/             # Login/Signup pages
│   ├── wiki/             # The core Wiki engine
│   │   ├── [slug]/       # Generic page route
│   │   ├── university/   # University-scoped routes
│   │   └── actions.ts    # Wiki-specific server actions
│   └── api/              # API Routes (minimal use, mostly Server Actions)
│
├── components/           # React Components
│   ├── ui/               # Primitive components (Button, Input, etc.)
│   └── ...               # Feature-specific components (e.g., DiffViewer)
│
├── lib/                  # Shared Utilities
│   ├── prisma.ts         # Singleton Prisma client
│   ├── auth.ts           # Auth configuration & utilities
│   ├── redis.ts          # Redis client wrapper
│   └── utils.ts          # Helper functions (class merging, formatting)
│
├── prisma/               # Database Configuration
│   └── schema.prisma     # The Source of Truth for the data model
│
├── public/               # Static Assets (Images, Icons)
│
└── scripts/              # OPS Scripts
    ├── backup.sh         # Database backup utility
    └── deploy_ubuntu.sh  # Setup script for production servers
```

## Key Design Patterns

### Server Actions
We heavily utilize **Server Actions** for data mutations instead of traditional API routes. This simplifies the codebase by keeping data fetching and mutation logic closer to the UI components.

### Optimistic Updates
The UI is designed to feel snappy. We use `useOptimistic` in key areas (like voting or editing) to update the UI immediately while the server action processes in the background.

### Mobile-First
All designs start with mobile constraints. Touch targets are large (minimum 44px), and navigation is optimized for thumb reachability.
