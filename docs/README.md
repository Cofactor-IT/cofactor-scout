# Cofactor Club - Detailed Documentation

Welcome to the comprehensive documentation for Cofactor Club. This documentation provides in-depth information about the architecture, APIs, database schema, and deployment of the platform.

## Table of Contents

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | System architecture, tech stack, and design patterns |
| [Database Schema](./database.md) | Complete database models, relationships, and migrations |
| [API Reference](./api.md) | All API endpoints, routes, and server actions |
| [Authentication](./authentication.md) | Auth flow, security, and user management |
| [Deployment](./deployment.md) | Docker setup, cloud deployment, and backups |
| [Contributing](./contributing.md) | Development workflow and contribution guidelines |

## Quick Links

### For Developers
- [Getting Started Locally](./deployment.md#local-development)
- [Project Structure](./architecture.md#project-structure)
- [API Endpoints](./api.md#api-routes)
- [Database Models](./database.md#core-models)

### For DevOps
- [Docker Deployment](./deployment.md#docker-deployment)
- [Environment Variables](./deployment.md#environment-variables)
- [Backup & Restore](./deployment.md#backup-and-restore)
- [Monitoring](./deployment.md#monitoring)

### For Administrators
- [User Roles](./authentication.md#user-roles)
- [Admin Dashboard](./architecture.md#admin-dashboard)
- [Security Features](./authentication.md#security-features)

## Project Overview

Cofactor Club is a **student ambassador network platform** built with modern web technologies. It combines:

- **Referral System**: Track viral growth through invite codes
- **University Wiki**: Community-contributed, moderated content
- **Power Score**: Gamified reputation system
- **Social Integration**: Link and aggregate social media presence
- **Admin Tools**: Comprehensive dashboard for platform management

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router), React, Tailwind CSS |
| **UI Components** | Shadcn UI, Radix UI primitives |
| **Backend** | Next.js API Routes, Server Actions |
| **Database** | PostgreSQL 15, Prisma ORM |
| **Authentication** | NextAuth.js (Credentials provider) |
| **Email** | Nodemailer (SMTP) |
| **Container** | Docker (multi-stage, ARM64 optimized) |
| **Security** | bcryptjs, DOMPurify, Zod validation |

## Key Features

### 1. Power Score System
Users earn points through platform engagement:
- **Referrals**: +50 points per successful invite
- **Wiki Contributions**: +20 points for approved edits
- **Social Reach**: Points based on follower counts

### 2. Role-Based Access Control
| Role | Permissions |
|------|-------------|
| **Student** | Create referrals, propose wiki edits |
| **Staff** | Auto-approved wiki edits |
| **Admin** | Full platform management |

### 3. Wiki System
- Revision-based editing workflow
- Admin moderation queue
- Visual diff viewer
- XSS protection with content sanitization

### 4. Security First
- bcrypt password hashing (10 rounds)
- Account lockout after failed attempts
- CSRF protection via Server Actions
- Email verification required
- Secure password reset (6-digit codes)

## Support

For questions, issues, or contributions:
- Open an issue on GitHub
- Contact the development team
- Refer to specific documentation sections above

---

**Next:** Read the [Architecture documentation](./architecture.md) to understand the system design.
