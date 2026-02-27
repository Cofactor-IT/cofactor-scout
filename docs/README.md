# Cofactor Scout Documentation

**Last Updated:** 2026-02-26  
**Audience:** All

---

## What's in This Folder

This folder contains all documentation for Cofactor Scout, organized by audience and purpose.

---

## Folder Structure

### decisions/
**Audience:** Developers, Architects  
**Purpose:** Architecture Decision Records (ADRs)

Documents major technical decisions and their reasoning:
- ADR-001: Server Actions over API Routes
- ADR-002: NextAuth Credentials Provider
- ADR-003: Supabase over Self-Hosted PostgreSQL

### engineering/
**Audience:** Developers  
**Purpose:** Development workflow and standards

- BRANCHING.md — Git branching strategy
- CODE_REVIEW.md — Code review guidelines
- COMMIT_MESSAGES.md — Commit message format
- MERGE_REQUESTS.md — Pull request process
- TESTING.md — Testing procedures

### features/
**Audience:** Developers, Product Managers  
**Purpose:** Feature-specific documentation

Each feature has 4 files:
- PRIMER.md — Non-technical overview
- TECHNICAL.md — Implementation details
- BUGS.md — Known and fixed bugs
- CHANGELOG.md — Feature history

**Features documented:**
- authentication/ — Sign up, sign in, password reset
- submissions/ — Research submission flow
- scout-application/ — Scout application process

### guides/
**Audience:** Developers  
**Purpose:** Setup and operational guides

- DEPLOYMENT.md — Production deployment
- ENVIRONMENT_SETUP.md — Local development setup
- TROUBLESHOOTING.md — Common issues and solutions

### pm-notes/
**Audience:** Developers, Designers  
**Purpose:** Design system and code standards

- ANIMATION_GUIDELINES.md — Animation patterns
- CODE_STANDARDS.md — Code quality rules
- COMMENTING_GUIDELINES.md — Documentation standards
- DESIGN_GUIDELINES.md — UI/UX design system

---

## Quick Links by Role

### New Developer
1. [ENVIRONMENT_SETUP.md](./guides/ENVIRONMENT_SETUP.md) — Get started
2. [CODE_STANDARDS.md](./pm-notes/CODE_STANDARDS.md) — Code quality
3. [DESIGN_GUIDELINES.md](./pm-notes/DESIGN_GUIDELINES.md) — UI patterns
4. [BRANCHING.md](./engineering/BRANCHING.md) — Git workflow

### Backend Developer
1. [Authentication TECHNICAL.md](./features/authentication/TECHNICAL.md)
2. [Submissions TECHNICAL.md](./features/submissions/TECHNICAL.md)
3. [ADR-001](./decisions/ADR-001-server-actions-over-api-routes.md)
4. [CODE_REVIEW.md](./engineering/CODE_REVIEW.md)

### Frontend Developer
1. [DESIGN_GUIDELINES.md](./pm-notes/DESIGN_GUIDELINES.md)
2. [ANIMATION_GUIDELINES.md](./pm-notes/ANIMATION_GUIDELINES.md)
3. [Authentication PRIMER.md](./features/authentication/PRIMER.md)
4. [Submissions PRIMER.md](./features/submissions/PRIMER.md)

### Product Manager
1. [Authentication PRIMER.md](./features/authentication/PRIMER.md)
2. [Submissions PRIMER.md](./features/submissions/PRIMER.md)
3. [Scout Application PRIMER.md](./features/scout-application/PRIMER.md)

### DevOps Engineer
1. [DEPLOYMENT.md](./guides/DEPLOYMENT.md)
2. [ENVIRONMENT_SETUP.md](./guides/ENVIRONMENT_SETUP.md)
3. [TROUBLESHOOTING.md](./guides/TROUBLESHOOTING.md)

---

## Documentation Standards

### File Naming
- Folders: kebab-case (e.g., `scout-application/`)
- Files: UPPER_SNAKE_CASE.md (e.g., `TECHNICAL.md`)
- Exception: README.md

### Required Sections
Every documentation file must have:
- **Last Updated:** Date at top
- **Audience:** Who should read this
- Clear headings and structure

### No References To
- ❌ Old wiki platform (Cofactor Club)
- ❌ Admin or staff roles (only CONTRIBUTOR, SCOUT, ADMIN)
- ❌ cofactor.club domain (use scout.cofactor.world)

---

## Contributing to Documentation

### Adding New Documentation
1. Create file in appropriate folder
2. Follow naming conventions
3. Include required sections
4. Update this README.md
5. Submit PR

### Updating Existing Documentation
1. Make changes
2. Update "Last Updated" date
3. Update related docs if needed
4. Submit PR

---

## Documentation by Topic

### Authentication
- [PRIMER.md](./features/authentication/PRIMER.md) — How it works
- [TECHNICAL.md](./features/authentication/TECHNICAL.md) — Implementation
- [BUGS.md](./features/authentication/BUGS.md) — Known issues
- [CHANGELOG.md](./features/authentication/CHANGELOG.md) — History

### Submissions
- [PRIMER.md](./features/submissions/PRIMER.md) — How it works
- [TECHNICAL.md](./features/submissions/TECHNICAL.md) — Implementation
- [BUGS.md](./features/submissions/BUGS.md) — Known issues
- [CHANGELOG.md](./features/submissions/CHANGELOG.md) — History

### Scout Application
- [PRIMER.md](./features/scout-application/PRIMER.md) — How it works
- [TECHNICAL.md](./features/scout-application/TECHNICAL.md) — Implementation
- [BUGS.md](./features/scout-application/BUGS.md) — Known issues
- [CHANGELOG.md](./features/scout-application/CHANGELOG.md) — History

### Design System
- [DESIGN_GUIDELINES.md](./pm-notes/DESIGN_GUIDELINES.md) — Complete design system
- [ANIMATION_GUIDELINES.md](./pm-notes/ANIMATION_GUIDELINES.md) — Animation patterns

### Development Workflow
- [BRANCHING.md](./engineering/BRANCHING.md) — Git workflow
- [COMMIT_MESSAGES.md](./engineering/COMMIT_MESSAGES.md) — Commit format
- [MERGE_REQUESTS.md](./engineering/MERGE_REQUESTS.md) — PR process
- [CODE_REVIEW.md](./engineering/CODE_REVIEW.md) — Review guidelines
- [TESTING.md](./engineering/TESTING.md) — Testing procedures

---

## External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## Support

- **Documentation Issues:** [GitHub Issues](https://github.com/your-org/cofactor-scout/issues)
- **Technical Support:** support@cofactor.world
- **Main README:** [../README.md](../README.md)
