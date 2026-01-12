# Contributing Guide

This document describes how to contribute to Cofactor Club development.

## Table of Contents

- [Overview](#overview)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Development Workflow](#development-workflow)

---

## Overview

We welcome contributions to Cofactor Club! This guide covers the development workflow, coding standards, and best practices.

### Ways to Contribute

- **Bug fixes** - Fix reported issues
- **Features** - Implement new features
- **Documentation** - Improve docs and comments
- **Testing** - Add test coverage
- **Code review** - Review pull requests
- **Issues** - Report bugs and suggest improvements

---

## Development Setup

### Prerequisites

- **Node.js** 20 or later
- **npm** or **yarn**
- **Docker** and **Docker Compose** (for local database)
- **Git**

### Initial Setup

1. **Fork and clone:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/cofactor-club.git
   cd cofactor-club
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start database:**
   ```bash
   docker compose up -d db
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

5. **Generate Prisma client:**
   ```bash
   npm run prisma:generate
   ```

6. **Push database schema:**
   ```bash
   npm run prisma:push
   ```

7. **Start dev server:**
   ```bash
   npm run dev
   ```

8. **Access application:**
   ```
   http://localhost:3000
   ```

### Development Tools

**Recommended VS Code Extensions:**
- Prisma
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (if using Vue components)

**Recommended Browser Extensions:**
- React Developer Tools

---

## Project Structure

Understanding the project layout is important for effective contribution.

```
cofactor-club/
├── app/                          # Next.js App Router
│   ├── (routes)/                 # Route groups
│   ├── admin/                    # Admin functionality
│   ├── api/                      # API routes
│   ├── auth/                     # Authentication pages
│   ├── wiki/                     # Wiki functionality
│   └── layout.tsx                # Root layout
│
├── components/                   # React components
│   ├── ui/                       # Shadcn UI components
│   └── (custom components)       # Project-specific components
│
├── lib/                          # Utilities and helpers
│   ├── prisma.ts                 # Database client
│   ├── auth.ts                   # Auth utilities
│   ├── email.ts                  # Email utilities
│   ├── validation.ts             # Zod schemas
│   └── types.ts                  # TypeScript types
│
├── prisma/
│   └── schema.prisma             # Database schema
│
└── public/                       # Static assets
```

### File Naming Conventions

- **Components:** PascalCase (e.g., `UserProfile.tsx`)
- **Utilities:** camelCase (e.g., `formatDate.ts`)
- **API Routes:** lowercase with hyphens (e.g., `update-role/route.ts`)
- **Pages:** `page.tsx` (App Router convention)

---

## Coding Standards

### TypeScript

- Use **strict mode** TypeScript
- Avoid `any` types
- Use interfaces for object shapes
- Use type aliases for unions/intersections

**Example:**
```typescript
// Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// Bad
type UserProfile = any;
```

### React Components

- Use **Server Components** by default
- Mark Client Components with `'use client'`
- Use functional components with hooks
- Prefer composition over inheritance

**Server Component:**
```typescript
// Default (server component)
export default async function UserProfile({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return <div>{user.name}</div>;
}
```

**Client Component:**
```typescript
'use client';

import { useState } from 'react';

export default function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Server Actions

- Mark with `'use server'`
- Use for all data mutations
- Include proper error handling
- Revalidate paths after mutations

**Example:**
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function updateProfile(formData: FormData) {
  const userId = formData.get('userId') as string;

  await prisma.user.update({
    where: { id: userId },
    data: { name: formData.get('name') as string }
  });

  revalidatePath('/profile');
}
```

### Styling

- Use **Tailwind CSS** for all styling
- Follow responsive design (mobile-first)
- Use Shadcn UI components when possible
- Custom CSS in `globals.css` for global styles

**Example:**
```tsx
<div className="flex flex-col gap-4 p-4 rounded-lg border bg-card">
  <h2 className="text-xl font-semibold">Title</h2>
  <p className="text-sm text-muted-foreground">Description</p>
</div>
```

### Validation

- Use **Zod** schemas for all input validation
- Define schemas in `lib/validation.ts`
- Reuse schemas across client and server

**Example:**
```typescript
import { z } from 'zod';

export const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
});
```

### Error Handling

- Return descriptive error messages
- Log errors appropriately
- Don't expose sensitive information

**Example:**
```typescript
export async function sensitiveAction(userId: string) {
  try {
    // Action logic
  } catch (error) {
    logger.error('Action failed', { userId, error });
    return { error: 'An error occurred. Please try again.' };
  }
}
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

- Use **Jest** for unit tests
- Use **React Testing Library** for component tests
- Test user behavior, not implementation details

**Example:**
```typescript
import { render, screen } from '@testing-library/react';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  it('renders user name', () => {
    render(<UserProfile name="John Doe" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

---

## Commit Guidelines

### Commit Message Format

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Build process or auxiliary tool changes |

### Examples

```
feat(auth): add password reset functionality

- Implement 6-digit code reset flow
- Add email templates for reset
- Update auth pages

Closes #123
```

```
fix(wiki): prevent XSS in user content

Sanitize all user input with DOMPurify before storage.

Fixes #456
```

```
docs(readme): update deployment instructions

Added section on Cloudflare Tunnel setup.
```

---

## Pull Request Process

### Before Submitting

1. **Update your branch:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests:**
   ```bash
   npm test
   ```

3. **Run linter:**
   ```bash
   npm run lint
   ```

4. **Build successfully:**
   ```bash
   npm run build
   ```

### PR Title Format

Use the same format as commit messages:

```
feat(scope): brief description
fix(scope): brief description
docs(scope): brief description
```

### PR Description Template

```markdown
## Summary
Brief description of changes.

## Changes
- Change 1
- Change 2
- Change 3

## Testing
How this was tested.

## Screenshots (if applicable)
[Attach screenshots]

## Related Issues
Closes #123
Related to #456
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Approval** required before merge
4. **Resolve feedback** or discuss alternatives

---

## Development Workflow

### Feature Development

1. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** following coding standards

3. **Test thoroughly**

4. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push to fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create pull request**

### Bug Fix Development

1. **Create bugfix branch:**
   ```bash
   git checkout -b fix/bug-description
   ```

2. **Implement fix** with tests if applicable

3. **Commit:**
   ```bash
   git commit -m "fix(scope): description"
   ```

4. **Push and create PR**

### Database Changes

When modifying the database schema:

1. **Update schema:**
   ```bash
   nano prisma/schema.prisma
   ```

2. **Generate migration:**
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

3. **Update TypeScript types:**
   ```bash
   npx prisma generate
   ```

4. **Test migration locally**

5. **Include migration files in PR**

---

## Best Practices

### Security

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Sanitize all user input
- Validate all data on the server
- Follow OWASP guidelines

### Performance

- Use Server Components by default
- Implement pagination for large lists
- Cache frequently accessed data
- Optimize database queries
- Use `revalidatePath` selectively

### Accessibility

- Use semantic HTML
- Provide alt text for images
- Ensure keyboard navigation works
- Use ARIA labels where appropriate
- Test with screen readers

### Documentation

- Document complex logic
- Update README for user-facing changes
- Add comments for non-obvious code
- Keep API docs up to date

---

## Getting Help

### Resources

- **Documentation:** See `/docs` directory
- **Issues:** Search existing issues first
- **Discussions:** Use GitHub Discussions for questions

### Reporting Issues

When reporting bugs, include:

- **Description:** Clear description of the problem
- **Steps to reproduce:** How to reproduce the issue
- **Expected behavior:** What should happen
- **Actual behavior:** What actually happens
- **Environment:** OS, browser, Node version
- **Screenshots:** If applicable

---

## Code of Conduct

Be respectful, inclusive, and collaborative. We're all here to build something great together.

---

**Thank you for contributing to Cofactor Club!**
