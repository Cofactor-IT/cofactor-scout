# Commenting Guidelines

**Audience:** Developers  
**Last Updated:** 2026-02-26

## File-Level JSDoc

**Every file must have a header comment explaining its purpose.**

### Format

```typescript
/**
 * filename.ts
 * 
 * Brief description of what this file does (1-2 sentences).
 * 
 * Additional context about when to use it, dependencies, or important notes.
 */
```

### Real Examples from Codebase

```typescript
/**
 * submission.actions.ts
 * 
 * Server Actions for research submission management including drafts,
 * submission, retrieval, and deletion.
 * 
 * All actions verify user authentication and ownership before operations.
 * Submissions go through draft -> submitted workflow with email notifications.
 */
```

```typescript
/**
 * session.ts
 * 
 * Server-side session management utilities.
 * Provides authentication checks and role verification.
 * 
 * All functions are server actions that read from NextAuth session.
 * Use these to protect server components and API routes.
 */
```

## Function JSDoc

**Every exported function must have JSDoc with @param, @returns, @throws.**

### Format

```typescript
/**
 * Brief description of what the function does (1 sentence).
 * Additional details about behavior, side effects, or important notes.
 * 
 * @param paramName - Description of parameter
 * @param paramName.property - Description of nested property (if object)
 * @returns Description of return value
 * @throws {ErrorType} When and why this error is thrown
 */
```

### Real Examples from Codebase

```typescript
/**
 * Saves or updates a research submission draft.
 * Validates for duplicate research topics before saving.
 * Cleans enum fields by converting empty strings to null.
 * 
 * @param data - Draft data including all submission fields
 * @param data.id - Draft ID for updates, 'new' for creation
 * @returns Success status and draft ID, or error message
 * @throws {Error} If user is not authenticated
 */
export async function saveDraft(data: any) {
  // Implementation
}
```

```typescript
/**
 * Requires authentication, redirects to signin if not authenticated.
 * Use this in server components that require a logged-in user.
 * 
 * @returns Authenticated user object
 * @throws Redirects to /auth/signin if not authenticated
 */
export async function requireAuth() {
  // Implementation
}
```

```typescript
/**
 * Find all non-draft submissions for a user
 * 
 * @param userId - User ID
 * @returns Array of user's submissions
 */
export async function findSubmissionsByUserId(userId: string) {
  // Implementation
}
```

## Inline Comments

**Only comment non-obvious logic. Never state what the code already says.**

### When to Add Inline Comments

✅ Business rules  
✅ Security considerations  
✅ Performance optimizations  
✅ Workarounds for bugs  
✅ Complex algorithms  
✅ Non-obvious side effects  

### Real Examples from Codebase

```typescript
// ✅ GOOD: Explains WHY
// Email normalized to lowercase to prevent duplicate accounts
email: z.string().toLowerCase().trim()

// ✅ GOOD: Explains business rule
// Account locks after 5 failed attempts for 15 minutes
if (attempts >= MAX_LOGIN_ATTEMPTS) {
  updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
}

// ✅ GOOD: Explains security measure
// Always read userId from session, never from client input
const session = await requireAuth()

// ✅ GOOD: Explains data transformation
// Clean data - convert empty strings to null for enum fields to prevent validation errors
const cleanData = { ...restData }
```

### What NOT to Comment

```typescript
// ❌ BAD: States the obvious
// Increment the counter
counter++

// ❌ BAD: Repeats function name
// Get user by ID
function getUserById(id: string) { }

// ❌ BAD: Describes what code does (code is self-explanatory)
// Loop through submissions
submissions.forEach(submission => { })
```

## Section Dividers

**Use section dividers in files over 100 lines.**

### Format

```typescript
// ============================================
// SECTION NAME
// ============================================
```

### Real Examples from Codebase

```typescript
// ============================================
// CONSTANTS
// ============================================

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 15

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateSecureToken(): string { }

// ============================================
// EXPORTED SERVER ACTIONS
// ============================================

export async function signUp() { }
```

## Zod Schema Comments

**Explain validation rules and transformations.**

```typescript
export const signUpSchema = z.object({
  // Email normalized to lowercase to prevent duplicate accounts
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  
  // Password complexity requirements enforced for security
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .refine(
      (password) => /[A-Z]/.test(password),
      'Password must contain at least one uppercase letter'
    ),
  
  // Name sanitized to remove HTML tags and dangerous characters
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .transform((name, ctx) => {
      const result = sanitizeName(name)
      if (!result.isValid) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.error })
        return z.NEVER
      }
      return result.sanitized
    })
})
```

## Prisma Schema Comments

**Use /// for documentation comments in schema.prisma.**

```prisma
/// Platform access level for users.
/// CONTRIBUTOR: Default role, can submit research leads.
/// SCOUT: Verified role with higher commission, requires application.
/// ADMIN: Full platform access for team members.
enum Role {
  CONTRIBUTOR
  SCOUT
  ADMIN
}

model User {
  id String @id @default(cuid())
  
  /// Email address, normalized to lowercase to prevent duplicates
  email String @unique
  
  /// Bcrypt hashed password with cost factor 10. Never stored in plain text.
  password String
  
  /// Timestamp when email was verified. Null if not verified.
  emailVerified DateTime?
  
  /// Number of consecutive failed login attempts. Resets on successful login.
  failedLoginAttempts Int @default(0)
  
  /// Account locks after 5 failed attempts for 15 minutes.
  lockedUntil DateTime?
}
```

## Component Comments

**Explain props and usage patterns.**

```typescript
/**
 * Props for Button component.
 */
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

/**
 * Button component with design system styling.
 * Includes hover states and shadow for depth.
 * 
 * @param children - Button content
 * @param variant - Visual style (primary or secondary)
 * @param className - Additional CSS classes
 * @param onClick - Click handler
 * @param type - HTML button type
 */
export function Button({ children, variant = 'primary', ... }: ButtonProps) {
  // Implementation
}
```

## Summary

**Comment the WHY, not the WHAT.**

✅ Business rules  
✅ Security considerations  
✅ Non-obvious transformations  
✅ Complex algorithms  
✅ Workarounds  

❌ Obvious code  
❌ Repeating function names  
❌ Describing what code does  
❌ Commented-out code  
