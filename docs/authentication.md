# Authentication & Authorization

This document describes the authentication and authorization system in Cofactor Club.

## Table of Contents

- [Overview](#overview)
- [Authentication Flow](#authentication-flow)
- [User Roles](#user-roles)
- [Security Features](#security-features)
- [Session Management](#session-management)
- [Authorization Patterns](#authorization-patterns)
- [Email Verification](#email-verification)
- [Password Reset](#password-reset)

---

## Overview

Cofactor Club uses **NextAuth.js v5** for authentication with a credentials-based provider. The system includes:

- **Password-based authentication** with bcrypt hashing
- **JWT session management** with 30-day expiration
- **Email verification** for new accounts
- **Account lockout** after failed login attempts
- **Password reset** via secure 6-digit codes
- **Role-based access control** (RBAC)

### Technology Stack

| Component | Technology |
|-----------|------------|
| Authentication Library | NextAuth.js |
| Password Hashing | bcryptjs (10 rounds) |
| Session Strategy | JWT |
| Session Duration | 30 days |
| Email Service | Nodemailer (SMTP) |

---

## Authentication Flow

### Sign Up Flow

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  User   │───▶│ Validate │───▶│  Create  │───▶│  Send    │
│ Form    │    │  Input   │    │  Account │    │  Email   │
└─────────┘    └──────────┘    └──────────┘    └──────────┘
                                                     │
                                                     ▼
                                              ┌──────────┐
                                              │ Redirect │
                                              │ to Sign  │
                                              │   In     │
                                              └──────────┘
```

**Steps:**

1. User submits sign-up form with email, password, name, and referral code
2. Server validates input with Zod schema
3. Rate limit check (3 attempts per 15 minutes per email)
4. Password is hashed with bcrypt (10 rounds)
5. Unique referral code is generated
6. Email verification token is created (24-hour expiration)
7. User record is created in database
8. Verification email is sent
9. User is redirected to sign-in page

**Sign-Up Validation Schema:**
```typescript
const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  referralCode: z.string().min(4, 'Referral code is required'),
});
```

---

### Sign In Flow

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  User   │───▶│  Find    │───▶│  Check   │───▶│ Compare  │
│  Login  │    │  User    │    │ Lockout  │    │ Password │
└─────────┘    └──────────┘    └──────────┘    └──────────┘
                                                  │
                              ┌───────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │   Valid Password?   │
                    └─────────────────────┘
                     │                   │
                    Yes                  No
                     │                   │
                     ▼                   ▼
            ┌────────────┐      ┌────────────────┐
            │ Reset      │      │ Increment      │
            │ Failed     │      │ Failed Count   │
            │ Count      │      │ Lock if ≥5     │
            │ Create JWT │      └────────────────┘
            └────────────┘
```

**Sign-In Process:**

1. User submits email and password
2. Server finds user by email
3. Checks if account is locked
4. Compares password hash using bcrypt
5. **On success:**
   - Resets failed login attempts
   - Creates JWT session (30 days)
   - Returns user object with role
6. **On failure:**
   - Increments failed login attempt counter
   - Locks account after 5 failed attempts (15 minutes)
   - Returns null (authentication failed)

**Account Lockout Configuration:**
```typescript
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
```

---

### Sign Out Flow

```typescript
// Client-side
await signOut({ callbackUrl: '/auth/signin' });

// Server-side
await prisma.user.update({
  where: { id: userId },
  data: { failedLoginAttempts: 0 }
});
```

---

## User Roles

### Role Definitions

| Role | Description | Permissions |
|------|-------------|-------------|
| `STUDENT` | Default member | Create referrals, propose wiki edits, link social accounts |
| `STAFF` | Trusted member | All student permissions + auto-approved wiki edits |
| `PENDING_STAFF` | Awaiting approval | Same as student, awaiting staff status |
| `ADMIN` | Platform administrator | Full access: manage users, approve revisions, delete pages |

### Role Assignment

**At Sign-Up:**
- Default: `STUDENT`
- With staff secret code: `PENDING_STAFF`

**By Admin:**
- Admin can promote any user to any role via `/members` page
- Staff approval: `PENDING_STAFF` → `STAFF`
- Staff rejection: `PENDING_STAFF` → `STUDENT`

### Role Hierarchy

```
ADMIN (full access)
 │
 ├── STAFF (trusted member)
 │    │
 │    └── STUDENT (default member)
 │
 └── PENDING_STAFF (awaiting approval)
```

---

## Security Features

### Password Security

**Hashing:**
- Algorithm: bcrypt
- Rounds: 10
- Library: bcryptjs

```typescript
// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Compare password
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

**Password Requirements:**
- Minimum 8 characters
- No additional complexity requirements (user-friendly)

### Account Lockout

**Configuration:**
- **Max Attempts:** 5
- **Lock Duration:** 15 minutes
- **Auto-Unlock:** After lock duration expires

**Database Fields:**
```prisma
model User {
  failedLoginAttempts  Int       @default(0)
  lockedUntil          DateTime?
}
```

**Reset on Success:**
```typescript
await prisma.user.update({
  where: { id: user.id },
  data: {
    failedLoginAttempts: 0,
    lockedUntil: null
  }
});
```

### Rate Limiting

**In-Memory Rate Limits:**

| Action | Limit | Window |
|--------|-------|--------|
| Sign Up | 3 attempts | 15 minutes |
| Password Reset | 3 attempts | 1 hour |

**Implementation:**
```typescript
const signupAttempts = new Map<string, { count: number; resetTime: number }>();

// Check rate limit
const attempt = signupAttempts.get(email);
if (attempt && attempt.count >= 3) {
  return { error: 'Too many attempts. Please try again later.' }
}
```

### XSS Protection

All user-generated content is sanitized:

```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitizedContent = DOMPurify.sanitize(rawContent);
```

### CSRF Protection

Server Actions include built-in CSRF protection via form tokens.

---

## Session Management

### JWT Configuration

```typescript
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

### Session Structure

```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: Role;
  };
  expires: string;
}
```

### Getting Session

**Server-Side:**
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

const session = await getServerSession(authOptions);
const user = session?.user;
```

**Client-Side:**
```typescript
import { useSession } from "next-auth/react";

const { data: session, status } = useSession();
```

### Session Callbacks

**JWT Callback** - Stores user data in token:
```typescript
async jwt({ token, user }) {
  if (user) {
    token.id = user.id;
    token.role = user.role;
  }
  return token;
}
```

**Session Callback** - Exposes data to client:
```typescript
async session({ session, token }) {
  if (session.user) {
    session.user.id = token.id as string;
    session.user.role = token.role as string;
  }
  return session;
}
```

---

## Authorization Patterns

### Helper Functions

Located in: `lib/auth.ts`

#### getCurrentUser()

Get the currently authenticated user.

```typescript
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}
```

#### requireAdmin()

Ensure user is authenticated and has admin role. Throws error if not.

```typescript
export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}
```

#### isAdmin()

Check if current user is admin (non-throwing).

```typescript
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'ADMIN';
}
```

### Usage Examples

**Server Action Protection:**
```typescript
'use server';

import { requireAdmin } from '@/lib/auth';

export async function sensitiveAction() {
  // Will throw if not admin
  await requireAdmin();

  // Action logic here
}
```

**Conditional Rendering:**
```typescript
const isAdmin = await isAdmin();

if (isAdmin) {
  // Show admin controls
}
```

---

## Email Verification

### Verification Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Sign Up  │───▶│ Generate │───▶│  Send    │───▶│  User    │
│          │    │  Token   │    │  Email   │    │ Clicks   │
└──────────┘    └──────────┘    └──────────┘    │  Link    │
                                            └─────┬──────┘
                                                  │
                                                  ▼
                                           ┌────────────┐
                                           │ Verify     │
                                           │ Token      │
                                           │ Set        │
                                           │ emailVerified│
                                           └────────────┘
```

### Token Generation

```typescript
function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

// 24-hour expiration
const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
```

### Verification Endpoint

**Route:** `GET /auth/verify?token=...`

**Behavior:**
1. Finds user by verification token
2. Checks expiration (24 hours)
3. Sets `emailVerified = now()`
4. Clears verification token
5. Redirects to sign-in with success message

### Resend Verification

Users can request a new verification email if needed:

```typescript
export async function resendVerificationEmail(formData: FormData) {
  // Generate new token
  const verificationToken = generateSecureToken();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Update user record
  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken, verificationExpires }
  });

  // Send email
  await sendVerificationEmail(user.email, user.name, verificationToken);
}
```

---

## Password Reset

### Reset Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Request  │───▶│ Generate │───▶│  Send    │───▶│  User    │
│ Reset    │    │  6-digit │    │  Email   │    │ Enters   │
│          │    │  Code    │    │  with    │    │  Code    │
└──────────┘    └──────────┘    │  Code    │    └──────────┘
                                 └──────────┘          │
                                                       ▼
                                                ┌────────────┐
                                                │ Validate   │
                                                │ Code       │
                                                │ Update     │
                                                │ Password   │
                                                └────────────┘
```

### Security Design

**Why 6-Digit Codes?**
- Easier to enter on mobile than URLs
- Single-use (deleted after successful reset)
- Short expiration (1 hour)
- No user enumeration (always returns success)

### Code Generation

```typescript
function generateToken(): string {
  return randomInt(100000, 1000000).toString(); // 6 digits
}
```

### Database Schema

```prisma
model PasswordReset {
  id        String   @id @default(cuid())
  token     String   @unique // 6-digit code
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expires   DateTime // 1 hour expiration
}
```

### Reset Process

**Step 1: Request Reset**
```typescript
export async function requestPasswordReset(formData: FormData) {
  // Find user (don't reveal if doesn't exist)
  const user = await prisma.user.findUnique({
    where: { email: formData.get('email') }
  });

  if (user) {
    // Delete old tokens
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id }
    });

    // Create new token (expires in 1 hour)
    const token = generateToken();
    await prisma.passwordReset.create({
      data: {
        token,
        userId: user.id,
        expires: new Date(Date.now() + 60 * 60 * 1000)
      }
    });

    // Send email
    await sendPasswordResetEmail(user.email, token);
  }

  // Always return success (prevents email enumeration)
  return { success: 'If an account exists...' };
}
```

**Step 2: Reset Password**
```typescript
export async function resetPassword(formData: FormData) {
  const token = formData.get('token');
  const password = formData.get('password');

  // Find valid token
  const resetRecord = await prisma.passwordReset.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!resetRecord || resetRecord.expires < new Date()) {
    return { error: 'Invalid or expired reset code' };
  }

  // Update password
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: resetRecord.userId },
    data: { password: hashedPassword }
  });

  // Delete used token (single-use)
  await prisma.passwordReset.delete({
    where: { id: resetRecord.id }
  });
}
```

---

## Environment Variables

Required authentication environment variables:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-random-string
NEXTAUTH_URL=https://your-domain.com

# Staff Sign-up Code (optional)
STAFF_SECRET_CODE=STAFF_2026

# Email Configuration (optional but recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Cofactor Club" <no-reply@cofactor.world>
```

### Generating NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

---

## Best Practices

### For Users

1. **Use strong passwords** - At least 8 characters
2. **Verify email** - Required for full account access
3. **Keep referral codes private** - They're your identity
4. **Report suspicious activity** - Contact admin if needed

### For Developers

1. **Always validate input** - Use Zod schemas
2. **Check authorization** - Use `requireAdmin()` for protected actions
3. **Sanitize content** - Use DOMPurify for all user content
4. **Handle errors gracefully** - Don't leak sensitive information
5. **Use Server Actions** - Built-in CSRF protection

### For Admins

1. **Verify staff applicants** - Only approve trusted members
2. **Review wiki revisions** - Check for quality and accuracy
3. **Monitor failed logins** - May indicate brute force attacks
4. **Reset passwords carefully** - Use strong temporary passwords

---

**Next:** Read the [Deployment documentation](./deployment.md) for deployment procedures.
