# Authentication - Technical Documentation

**Audience:** Developers  
**Last Updated:** 2026-02-26

## Architecture

### File Structure

```
actions/
└── auth.actions.ts          # Server Actions for auth flows

lib/
├── auth/
│   ├── config.ts            # NextAuth configuration
│   ├── session.ts           # Session utilities
│   └── permissions.ts       # Role-based access control
├── email/
│   ├── send.ts              # Email sending functions
│   └── templates.ts         # Email templates
└── validation/
    └── schemas.ts           # Zod validation schemas

app/
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts     # NextAuth API route
└── auth/
    ├── signin/
    ├── signup/
    ├── forgot-password/
    ├── reset-password/
    └── verify/
```

### Database Models

```prisma
model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  password              String
  fullName              String
  firstName             String
  lastName              String
  role                  Role      @default(CONTRIBUTOR)
  
  // Email Verification
  emailVerified         DateTime?
  verificationToken     String?   @unique
  verificationExpires   DateTime?
  
  // Account Security
  failedLoginAttempts   Int       @default(0)
  lockedUntil           DateTime?
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

model PasswordReset {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expires   DateTime
  createdAt DateTime @default(now())
}

enum Role {
  CONTRIBUTOR
  SCOUT
  ADMIN
}
```

## Server Actions

### signUp

**File:** `actions/auth.actions.ts`

```typescript
export async function signUp(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: string }>
```

**Flow:**
1. Normalize email to lowercase
2. Validate with Zod schema
3. Check for existing user (don't reveal if exists)
4. Hash password with bcrypt (cost factor 10)
5. Create user with verification token
6. Send verification and welcome emails
7. Return success message

**Security:**
- Constant-time response (1000ms minimum) to prevent account enumeration
- Password hashed with bcrypt
- Verification token: 32 bytes random hex
- Token expires after 24 hours

### requestPasswordReset

**File:** `actions/auth.actions.ts`

```typescript
export async function requestPasswordReset(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: string }>
```

**Flow:**
1. Validate email format
2. Find user (don't reveal if exists)
3. Generate reset token (32 bytes random hex)
4. Delete existing reset tokens for user
5. Create new reset token (expires in 1 hour)
6. Send reset email
7. Return generic success message

**Security:**
- Constant-time response
- Token expires after 1 hour
- Old tokens deleted before creating new one

### resetPassword

**File:** `actions/auth.actions.ts`

```typescript
export async function resetPassword(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: string }>
```

**Flow:**
1. Validate token and new password
2. Find reset record
3. Check if token expired
4. Hash new password
5. Update user password and delete token (transaction)
6. Return success

**Security:**
- Password complexity validation
- Token single-use (deleted after use)
- Atomic transaction for password update

## NextAuth Configuration

**File:** `lib/auth/config.ts`

### Credentials Provider

```typescript
CredentialsProvider({
  async authorize(credentials) {
    // 1. Find user by email
    // 2. Check if account locked
    // 3. Check if email verified (except admin)
    // 4. Verify password with bcrypt
    // 5. Handle failed attempts (increment counter, lock after 5)
    // 6. Reset failed attempts on success
    // 7. Return user object
  }
})
```

### Session Strategy

- **Type:** JWT (stateless)
- **Default Duration:** 24 hours
- **With Remember Me:** 30 days
- **Storage:** HTTP-only cookie

### Callbacks

```typescript
callbacks: {
  async session({ session, token }) {
    // Add user ID and role to session
    session.user.id = token.id
    session.user.role = token.role
    return session
  },
  
  async jwt({ token, user }) {
    // Set token expiration based on rememberMe
    if (user) {
      token.id = user.id
      token.role = user.role
      const maxAge = user.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24
      token.exp = Math.floor(Date.now() / 1000) + maxAge
    }
    return token
  }
}
```

## Session Utilities

**File:** `lib/auth/session.ts`

### requireAuth

```typescript
export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/auth/signin')
  }
  return session.user
}
```

**Usage:** First line of every protected Server Action

### requireAdmin

```typescript
export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required')
  }
  return user
}
```

**Usage:** Admin-only Server Actions

## Validation Schemas

**File:** `lib/validation/schemas.ts`

### signUpSchema

```typescript
export const signUpSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .refine((p) => /[A-Z]/.test(p), 'Must contain uppercase')
    .refine((p) => /[a-z]/.test(p), 'Must contain lowercase')
    .refine((p) => /[0-9]/.test(p), 'Must contain number')
    .refine((p) => /[^A-Za-z0-9]/.test(p), 'Must contain special character'),
  
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
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

## Email Templates

**File:** `lib/email/templates.ts`

### Verification Email

- Subject: "Verify your email address"
- Contains: Verification link with token
- Expires: 24 hours
- Link format: `${NEXTAUTH_URL}/auth/verify?token=${token}`

### Password Reset Email

- Subject: "Reset your password"
- Contains: Reset link with token
- Expires: 1 hour
- Link format: `${NEXTAUTH_URL}/auth/reset-password?token=${token}`

### Welcome Email

- Subject: "Welcome to Cofactor Scout"
- Sent after: Email verification
- Contains: Getting started guide

## Security Features

### Password Hashing

```typescript
import bcrypt from 'bcryptjs'

// Hash password (cost factor 10)
const hashedPassword = await bcrypt.hash(password, 10)

// Verify password
const isValid = await bcrypt.compare(password, user.password)
```

### Account Lockout

```typescript
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 15

// After 5 failed attempts
if (attempts >= MAX_LOGIN_ATTEMPTS) {
  lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
}

// Check if locked
if (user.lockedUntil && user.lockedUntil > new Date()) {
  return null // Account locked
}
```

### Token Generation

```typescript
import { randomBytes } from 'crypto'

function generateSecureToken(): string {
  return randomBytes(32).toString('hex') // 64-character hex string
}
```

### Constant-Time Response

```typescript
const ACCOUNT_ENUMERATION_DELAY = 1000 // 1 second

async function enforceTimingDelay(startTime: number) {
  const elapsed = Date.now() - startTime
  if (elapsed < ACCOUNT_ENUMERATION_DELAY) {
    await new Promise(resolve => 
      setTimeout(resolve, ACCOUNT_ENUMERATION_DELAY - elapsed)
    )
  }
}
```

## Testing

### Sign Up Flow

```typescript
// 1. Submit signup form
await signUp(undefined, formData)

// 2. Check user created
const user = await prisma.user.findUnique({ where: { email } })
expect(user).toBeDefined()
expect(user.emailVerified).toBeNull()

// 3. Verify email
await verifyEmail(user.verificationToken)

// 4. Check email verified
const verified = await prisma.user.findUnique({ where: { email } })
expect(verified.emailVerified).toBeDefined()
```

### Account Lockout

```typescript
// 1. Fail 5 times
for (let i = 0; i < 5; i++) {
  await signIn({ email, password: 'wrong' })
}

// 2. Check locked
const user = await prisma.user.findUnique({ where: { email } })
expect(user.lockedUntil).toBeDefined()
expect(user.lockedUntil > new Date()).toBe(true)

// 3. Try to sign in
const result = await signIn({ email, password: 'correct' })
expect(result).toBeNull() // Locked
```

## Common Issues

### "Email not verified"

**Cause:** User trying to sign in before verifying email  
**Solution:** Resend verification email or verify manually in database

### "Account locked"

**Cause:** 5 failed login attempts  
**Solution:** Wait 15 minutes or reset `lockedUntil` in database

### "Invalid credentials"

**Cause:** Wrong password or email not found  
**Solution:** Check password, use password reset if forgotten

## Environment Variables

```env
NEXTAUTH_SECRET="random-32-character-string"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@cofactor.world"
ADMIN_PASSWORD="secure-password"
```
