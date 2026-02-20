# API & Server Actions Documentation

## Overview

Cofactor Scout uses Next.js Server Actions for most mutations and API routes for specific endpoints. This document covers all server-side functions available in the application.

## Server Actions

Server Actions are the primary way to perform mutations in Cofactor Scout. They are defined with `'use server'` and can be called directly from Client Components.

### Authentication Actions

**File**: `actions/auth.actions.ts`

#### signUp()
Creates a new user account with email verification.

```typescript
async function signUp(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: string }>
```

**Input (FormData)**:
- `email`: string (required)
- `password`: string (required)
- `name`: string (required)

**Returns**:
- `{ success: string }`: Account created successfully
- `{ error: string }`: Validation or creation error

**Features**:
- Email normalization and validation
- Password complexity validation
- Name sanitization
- Account enumeration prevention (constant timing)
- Verification email sent
- Welcome email sent

**Example**:
```typescript
const formData = new FormData()
formData.append('email', 'user@example.com')
formData.append('password', 'SecurePass123!')
formData.append('name', 'John Doe')

const result = await signUp(undefined, formData)
```

#### requestPasswordReset()
Initiates password reset flow.

```typescript
async function requestPasswordReset(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: string }>
```

**Input (FormData)**:
- `email`: string (required)

**Returns**:
- `{ success: string }`: Reset email sent (or would be sent)
- `{ error: string }`: Validation error

**Features**:
- Account enumeration prevention
- 1-hour token expiration
- Deletes old reset tokens
- Rate limiting (disabled in MVP)

#### resetPassword()
Resets password with token.

```typescript
async function resetPassword(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: string }>
```

**Input (FormData)**:
- `token`: string (required)
- `password`: string (required)

**Returns**:
- `{ success: string }`: Password reset successfully
- `{ error: string }`: Invalid token or validation error

**Features**:
- Token validation
- Expiration check
- Password complexity validation
- Token deletion after use

#### resendVerificationEmail()
Resends email verification link.

```typescript
async function resendVerificationEmail(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: string }>
```

**Input (FormData)**:
- `email`: string (required)

**Returns**:
- `{ success: string }`: Verification email sent (or would be sent)
- `{ error: string }`: Validation error

**Features**:
- Account enumeration prevention
- New token generation
- 24-hour token expiration

---

### Submission Actions

**File**: `actions/submission.actions.ts`

#### saveDraft()
Saves or updates a research submission draft.

```typescript
async function saveDraft(data: any): Promise<{
  success: boolean
  id?: string
  error?: string
}>
```

**Input**:
```typescript
{
  id?: string,                    // Draft ID (for updates)
  researchTopic?: string,
  researchDescription?: string,
  researcherName?: string,
  researcherEmail?: string,
  researcherInstitution?: string,
  researcherDepartment?: string,
  researcherCareerStage?: CareerStage,
  researcherLinkedin?: string,
  researchStage?: ResearchStage,
  fundingStatus?: FundingStatus,
  keyPublications?: string,
  potentialApplications?: string,
  submissionSource?: SubmissionSource,
  relationshipToResearcher?: Relationship,
  researcherAwareness?: boolean,
  whyInteresting?: string
}
```

**Returns**:
- `{ success: true, id: string }`: Draft saved
- `{ success: false, error: string }`: Save failed

**Features**:
- Creates new draft or updates existing
- Duplicate detection by research topic
- Enum field normalization (empty string → null)
- Requires authentication

#### submitResearch()
Submits a draft for review.

```typescript
async function submitResearch(data: any): Promise<{
  success: boolean
  id?: string
  error?: string
}>
```

**Input**:
```typescript
{
  id: string  // Draft ID (required)
}
```

**Returns**:
- `{ success: true, id: string }`: Submission successful
- `{ success: false, error: string }`: Submission failed

**Features**:
- Verifies ownership
- Sets `isDraft = false`
- Sets `submittedAt = now()`
- Sets `status = PENDING_RESEARCH`
- Updates user stats
- Sends confirmation email
- Revalidates dashboard cache

#### getDraft()
Retrieves a draft by ID.

```typescript
async function getDraft(id: string): Promise<{
  success: boolean
  draft?: ResearchSubmission
  error?: string
}>
```

**Input**:
- `id`: string (required)

**Returns**:
- `{ success: true, draft: ResearchSubmission }`: Draft found
- `{ success: false, error: string }`: Draft not found

**Features**:
- Verifies ownership
- Only returns drafts (`isDraft = true`)

#### deleteDraft()
Deletes a draft.

```typescript
async function deleteDraft(id: string): Promise<{
  success: boolean
  error?: string
}>
```

**Input**:
- `id`: string (required)

**Returns**:
- `{ success: true }`: Draft deleted
- `{ success: false, error: string }`: Delete failed

**Features**:
- Verifies ownership
- Only deletes drafts
- Revalidates drafts page cache

---

### Scout Actions

**File**: `actions/scout.actions.ts`

#### submitScoutApplication()
Submits a scout application.

```typescript
async function submitScoutApplication(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: string }>
```

**Input (FormData)**:
- `name`: string (required)
- `email`: string (required)
- `university`: string (required)
- `department`: string (required)
- `linkedinUrl`: string (optional)
- `userRole`: UserRole (required)
- `researchAreas`: string (required)
- `whyScout`: string (required)
- `howSourceLeads`: string (required)

**Returns**:
- `{ success: string }`: Application submitted
- `{ error: string }`: Validation or submission error

**Features**:
- Works for logged-in and anonymous users
- Creates account if user doesn't exist
- Prevents duplicate applications
- Sends confirmation email
- Sets `scoutApplicationStatus = PENDING`

---

## API Routes

### Authentication

#### POST /api/auth/[...nextauth]
NextAuth.js authentication endpoints.

**Endpoints**:
- `POST /api/auth/signin`: Sign in
- `POST /api/auth/signout`: Sign out
- `GET /api/auth/session`: Get session
- `GET /api/auth/csrf`: Get CSRF token

**Handled by**: NextAuth.js

#### GET /api/auth/verify
Email verification endpoint.

**Query Parameters**:
- `token`: string (required)

**Returns**:
- Redirect to `/auth/signin?verified=true`: Success
- Redirect to `/auth/signin?error=InvalidToken`: Invalid token
- Redirect to `/auth/signin?error=ExpiredToken`: Expired token

**Code Location**: `app/auth/verify/route.ts`

---

### Health Check

#### GET /api/health
Application health check.

**Returns**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Code Location**: `app/api/health/route.ts`

---

## Session Helpers

**File**: `lib/auth/session.ts`

### getCurrentUser()
Gets the current authenticated user.

```typescript
async function getCurrentUser(): Promise<User | undefined>
```

**Returns**:
- `User`: Current user object
- `undefined`: Not authenticated

**Usage**:
```typescript
const user = await getCurrentUser()
if (!user) {
  // Not authenticated
}
```

### requireAuth()
Requires authentication, redirects if not authenticated.

```typescript
async function requireAuth(): Promise<User>
```

**Returns**:
- `User`: Current user object

**Throws**:
- Redirects to `/auth/signin` if not authenticated

**Usage**:
```typescript
const user = await requireAuth()
// User is guaranteed to be authenticated here
```

### requireAdmin()
Requires admin role.

```typescript
async function requireAdmin(): Promise<User>
```

**Returns**:
- `User`: Current admin user

**Throws**:
- `Error`: If not authenticated or not admin

**Usage**:
```typescript
const admin = await requireAdmin()
// User is guaranteed to be admin here
```

### isAdmin()
Checks if current user is admin (non-throwing).

```typescript
async function isAdmin(): Promise<boolean>
```

**Returns**:
- `true`: User is admin
- `false`: User is not admin or not authenticated

**Usage**:
```typescript
const userIsAdmin = await isAdmin()
if (userIsAdmin) {
  // Show admin features
}
```

---

## Email Functions

**File**: `lib/email/send.ts`

### sendWelcomeEmail()
Sends welcome email to new users.

```typescript
async function sendWelcomeEmail(
  toEmail: string,
  name: string
): Promise<void>
```

### sendVerificationEmail()
Sends email verification link.

```typescript
async function sendVerificationEmail(
  toEmail: string,
  name: string,
  token: string
): Promise<void>
```

### sendPasswordResetEmail()
Sends password reset code.

```typescript
async function sendPasswordResetEmail(
  toEmail: string,
  resetCode: string
): Promise<void>
```

### sendNewSignInEmail()
Sends new sign-in notification.

```typescript
async function sendNewSignInEmail(
  toEmail: string,
  name: string,
  timestamp: string,
  location?: string
): Promise<void>
```

### sendScoutApplicationConfirmationEmail()
Sends scout application confirmation.

```typescript
async function sendScoutApplicationConfirmationEmail(
  toEmail: string,
  name: string
): Promise<void>
```

### sendScoutApprovalEmail()
Sends scout approval notification.

```typescript
async function sendScoutApprovalEmail(
  toEmail: string,
  name: string
): Promise<void>
```

---

## Validation Schemas

**File**: `lib/validation/schemas.ts`

### signUpSchema
Validates sign-up form data.

```typescript
const signUpSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(255, 'Email is too long')
    .toLowerCase()
    .trim()
    .refine((email) => !containsSqlInjection(email), 'Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .refine((password) => /[A-Z]/.test(password), 'Must contain uppercase')
    .refine((password) => /[a-z]/.test(password), 'Must contain lowercase')
    .refine((password) => /[0-9]/.test(password), 'Must contain number')
    .refine((password) => /[^A-Za-z0-9]/.test(password), 'Must contain special char'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .trim()
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

### signInSchema
Validates sign-in form data.

```typescript
const signInSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password is too long')
})
```

### socialConnectSchema
Validates social media connection.

```typescript
const socialConnectSchema = z.object({
  platform: z.enum(['instagram', 'tiktok', 'linkedin'], {
    message: 'Invalid platform'
  }),
  username: z.string()
    .min(1, 'Username is required')
    .max(100, 'Username is too long')
    .trim()
    .transform((username, ctx) => {
      const clean = username.replace(/^@/, '')
      const result = sanitizeString(clean, {
        maxLength: 100,
        minLength: 1,
        allowNewlines: false,
        allowHtml: false
      })
      if (!result.isValid) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.error })
        return z.NEVER
      }
      return result.sanitized
    }),
  followers: z.union([
    z.string().optional().transform(val => val ? parseInt(val, 10) : 0),
    z.number().optional().default(0)
  ]).pipe(z.number().min(0).max(1000000000, 'Follower count seems invalid'))
})
```

---

## Error Handling

### Standard Error Response
```typescript
{
  error: string  // Human-readable error message
}
```

### Standard Success Response
```typescript
{
  success: string | boolean,
  id?: string,  // For create/update operations
  data?: any    // For read operations
}
```

### Common Error Messages
- `"Email is required"`
- `"Invalid email address"`
- `"Password must be at least 8 characters"`
- `"Name must be at least 2 characters"`
- `"Too many attempts. Please try again later."` (rate limiting)
- `"Invalid or expired reset code"`
- `"Draft not found or access denied"`
- `"You have already submitted a scout application"`

---

## Rate Limiting

### Configuration
```typescript
export const RateLimits = {
  AUTH: { limit: 5, window: 15 * 60 * 1000 },        // 5 per 15 min
  SIGNUP: { limit: 3, window: 60 * 60 * 1000 },      // 3 per hour
  PASSWORD_RESET: { limit: 3, window: 60 * 60 * 1000 }, // 3 per hour
  WIKI_SUBMIT: { limit: 10, window: 60 * 60 * 1000 },   // 10 per hour
  SOCIAL_CONNECT: { limit: 20, window: 60 * 60 * 1000 } // 20 per hour
}
```

**Note**: Rate limiting is implemented but disabled in MVP. Uncomment code in `actions/auth.actions.ts` to enable.

---

## Testing

### Unit Tests
```bash
npm test
```

**Test Files**:
- `tests/unit/validation/schemas.test.ts`: Schema validation tests
- `tests/unit/security/rate-limit.test.ts`: Rate limiting tests

### Manual Testing with curl

**Sign Up**:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!","name":"John Doe"}'
```

**Sign In**:
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'
```

---

## Best Practices

### 1. Always Validate Input
```typescript
const result = schema.safeParse(data)
if (!result.success) {
  return { error: result.error.issues[0].message }
}
```

### 2. Use Server Actions for Mutations
```typescript
'use server'

export async function myAction(formData: FormData) {
  const user = await requireAuth()
  // Perform mutation
}
```

### 3. Revalidate Cache After Mutations
```typescript
import { revalidatePath } from 'next/cache'

await prisma.submission.create({ ... })
revalidatePath('/dashboard')
```

### 4. Handle Errors Gracefully
```typescript
try {
  await performAction()
  return { success: true }
} catch (error) {
  logger.error('Action failed', { error })
  return { error: 'Action failed. Please try again.' }
}
```

### 5. Log Important Events
```typescript
import { logger } from '@/lib/logger'

logger.info('User signed up', { email: maskEmail(email) })
logger.warn('Failed login attempt', { email: maskEmail(email) })
logger.error('Database error', { error }, error)
```
