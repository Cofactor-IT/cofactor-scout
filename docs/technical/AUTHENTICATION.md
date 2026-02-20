# Authentication & Security

## Overview

Cofactor Scout implements a comprehensive authentication and security system using NextAuth.js, bcrypt password hashing, JWT sessions, and multiple layers of input validation and sanitization.

## Authentication System

### Technology Stack
- **NextAuth.js 4.24.13**: Session management and authentication
- **bcrypt**: Password hashing (10 rounds)
- **JWT**: Session tokens
- **Nodemailer**: Email verification and notifications

### Authentication Flow

#### 1. Sign Up Flow
```
User submits form
  → Validate input (Zod schema)
  → Check for existing user
  → Hash password (bcrypt, 10 rounds)
  → Split full name into first/last
  → Generate verification token (32-byte hex)
  → Create user record (emailVerified = null)
  → Send verification email
  → Return success message
```

**Code Location**: `actions/auth.actions.ts` → `signUp()`

**Security Features**:
- Email normalization (lowercase, trim)
- Password complexity requirements
- Account enumeration prevention (constant timing)
- SQL injection checks
- Name sanitization

#### 2. Email Verification Flow
```
User clicks verification link
  → Extract token from URL
  → Find user by token
  → Check token expiration (24 hours)
  → Set emailVerified = now()
  → Clear verification token
  → Redirect to sign-in
```

**Code Location**: `app/auth/verify/route.ts`

#### 3. Sign In Flow
```
User submits credentials
  → Find user by email
  → Check if account is locked
  → Check if email is verified
  → Verify password (bcrypt.compare)
  → If invalid: increment failedLoginAttempts
  → If 5 failed attempts: lock account for 15 minutes
  → If valid: reset failedLoginAttempts
  → Generate JWT token
  → Set session cookie
  → Send sign-in notification email
  → Redirect to dashboard
```

**Code Location**: `lib/auth/config.ts` → `authOptions.providers`

**Security Features**:
- Account lockout after 5 failed attempts
- 15-minute lockout duration
- Email verification required
- Failed attempt tracking
- Sign-in notification emails

#### 4. Password Reset Flow
```
User requests reset
  → Validate email
  → Find user by email
  → Generate reset token (32-byte hex)
  → Store token with 1-hour expiration
  → Send reset email with token
  → Return success message (no user enumeration)

User submits new password
  → Validate token
  → Check token expiration
  → Validate password complexity
  → Hash new password
  → Update user password
  → Delete reset token
  → Return success message
```

**Code Location**: `actions/auth.actions.ts` → `requestPasswordReset()`, `resetPassword()`

### Session Management

#### JWT Configuration
```typescript
session: {
  strategy: "jwt",
  maxAge: 60 * 60 * 24 * 30, // 30 days max
}
```

#### JWT Payload
```typescript
{
  id: string,           // User ID
  role: Role,           // CONTRIBUTOR, SCOUT, or ADMIN
  rememberMe?: boolean, // Session duration flag
  exp: number           // Expiration timestamp
}
```

#### Session Duration
- **Remember Me**: 30 days
- **Default**: 1 day

#### Session Helpers

**Get Current User**
```typescript
import { getCurrentUser } from '@/lib/auth/session'

const user = await getCurrentUser()
// Returns: { id, email, role, emailVerified } | undefined
```

**Require Authentication**
```typescript
import { requireAuth } from '@/lib/auth/session'

const user = await requireAuth()
// Redirects to /auth/signin if not authenticated
```

**Require Admin**
```typescript
import { requireAdmin } from '@/lib/auth/session'

const admin = await requireAdmin()
// Throws error if not admin
```

## Password Security

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Password Hashing
```typescript
import bcrypt from 'bcryptjs'

// Hash password
const hashedPassword = await bcrypt.hash(password, 10)

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword)
```

**Rounds**: 10 (balance between security and performance)

### Account Lockout
```typescript
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 15

// After 5 failed attempts
lockedUntil = new Date(Date.now() + 15 * 60 * 1000)
```

## Input Validation & Sanitization

### Validation Stack
1. **Zod Schemas**: Type-safe validation
2. **Sanitization Functions**: XSS prevention, SQL injection checks
3. **Custom Validators**: Business logic validation

### Sign Up Schema
```typescript
export const signUpSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(255, 'Email is too long')
    .toLowerCase()
    .trim()
    .refine(
      (email) => !containsSqlInjection(email),
      'Invalid email format'
    ),
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

**Code Location**: `lib/validation/schemas.ts`

### Sanitization Functions

#### Name Sanitization
```typescript
export function sanitizeName(name: string, maxLength: number = 100): {
  sanitized: string
  isValid: boolean
  error?: string
}
```

**Features**:
- Removes zero-width characters
- Normalizes Unicode (NFKC)
- Removes control characters
- Removes HTML-special chars (`<>"'&`)
- Validates against pattern: `^[\p{L}\s\-'\.]+$`
- Enforces length limits

#### SQL Injection Detection
```typescript
export function containsSqlInjection(input: string): boolean
```

**Checks for**:
- SQL keywords with suspicious characters
- Comment syntax (`--`, `#`, `/*`, `*/`)
- Boolean injection patterns (`OR 1=1`, `AND 1=1`)
- Time-based injection (`WAITFOR DELAY`, `SLEEP`)
- Stored procedures (`xp_`, `sp_`)

#### URL Validation
```typescript
export function validateAndSanitizeUrl(url: string): UrlValidationResult
```

**Features**:
- Rejects dangerous protocols (`javascript:`, `data:`, `vbscript:`, `file:`)
- Ensures `http:` or `https:`
- Adds protocol if missing
- Validates URL structure
- Enforces 2048-character limit

## Rate Limiting

### Implementation
**Current**: In-memory rate limiting (MVP)
**Future**: Redis-based distributed rate limiting

### Rate Limit Configuration
```typescript
export const RateLimits = {
  AUTH: { limit: 5, window: 15 * 60 * 1000 },        // 5 per 15 min
  SIGNUP: { limit: 3, window: 60 * 60 * 1000 },      // 3 per hour
  PASSWORD_RESET: { limit: 3, window: 60 * 60 * 1000 }, // 3 per hour
  WIKI_SUBMIT: { limit: 10, window: 60 * 60 * 1000 },   // 10 per hour
  SOCIAL_CONNECT: { limit: 20, window: 60 * 60 * 1000 } // 20 per hour
}
```

### Usage
```typescript
import { checkRateLimit, RateLimits } from '@/lib/security/rate-limit'

const result = checkRateLimit(userEmail, RateLimits.AUTH)

if (!result.success) {
  return { error: 'Too many attempts. Please try again later.' }
}
```

**Code Location**: `lib/security/rate-limit.ts`

**Note**: Rate limiting is currently disabled in MVP for development ease. Enable in production by uncommenting code in `actions/auth.actions.ts` and `proxy.ts`.

## Security Headers

### Middleware (proxy.ts)
```typescript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`

response.headers.set('X-Frame-Options', 'DENY')
response.headers.set('X-Content-Type-Options', 'nosniff')
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
response.headers.set('Content-Security-Policy', cspHeader)
```

### Next.js Config (next.config.ts)
```typescript
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: "..." }
    ]
  }]
}
```

## Email Security

### Email Verification
- **Token**: 32-byte random hex (64 characters)
- **Expiration**: 24 hours
- **One-time use**: Token cleared after verification

### Password Reset
- **Token**: 32-byte random hex (64 characters)
- **Expiration**: 1 hour
- **One-time use**: Token deleted after use

### Email Templates
All emails use HTML templates with:
- Branded styling
- Clear call-to-action buttons
- Plain text fallback
- No tracking pixels

**Code Location**: `lib/email/templates.ts`

## CSRF Protection

### Server Actions
Next.js Server Actions have built-in CSRF protection:
- Automatic token generation
- Token validation on submission
- Same-origin policy enforcement

### API Routes
For API routes, CSRF tokens can be implemented:
```typescript
import { generateCsrfToken, validateCsrfToken } from '@/lib/security/csrf'
```

**Code Location**: `lib/security/csrf.ts`

## XSS Prevention

### Input Sanitization
All user inputs are sanitized before storage:
- HTML tags removed (unless explicitly allowed)
- Special characters escaped
- Zero-width characters removed
- Unicode normalized

### Output Encoding
React automatically escapes output, but for raw HTML:
```typescript
import DOMPurify from 'isomorphic-dompurify'

const clean = DOMPurify.sanitize(dirtyHtml)
```

**Note**: DOMPurify removed in MVP to avoid jsdom dependency. Simple HTML stripping used instead.

## Monitoring & Logging

### Structured Logging
```typescript
import { logger } from '@/lib/logger'

logger.info('User signed in', { userId, email: maskEmail(email) })
logger.warn('Failed login attempt', { email: maskEmail(email), attempts })
logger.error('Authentication error', { error }, error)
```

**Features**:
- Email masking for privacy
- Structured JSON logs
- Error stack traces
- Sentry integration

### Sentry Integration
```typescript
import { setSentryUser } from '@/instrumentation/sentry'

setSentryUser(userId, email, role)
```

**Tracked Events**:
- Authentication errors
- Failed login attempts
- Account lockouts
- Password resets
- Email verification

## Best Practices

### 1. Never Trust User Input
- Validate all inputs with Zod
- Sanitize before storage
- Escape before output

### 2. Use Parameterized Queries
- Always use Prisma (never raw SQL)
- Prisma automatically parameterizes queries

### 3. Implement Defense in Depth
- Multiple layers of validation
- Rate limiting
- Account lockout
- Email verification

### 4. Secure Session Management
- HTTP-only cookies
- Secure flag in production
- SameSite=Lax
- Short session duration

### 5. Monitor & Alert
- Log all authentication events
- Alert on suspicious activity
- Track failed login attempts

## Security Checklist

- [x] Password hashing (bcrypt)
- [x] Email verification required
- [x] Account lockout after failed attempts
- [x] Password complexity requirements
- [x] Input validation (Zod)
- [x] Input sanitization
- [x] SQL injection prevention
- [x] XSS prevention
- [x] CSRF protection (Server Actions)
- [x] Security headers
- [x] Rate limiting (implemented, disabled in MVP)
- [x] Secure session management
- [x] Email notifications for security events
- [x] Structured logging
- [x] Error monitoring (Sentry)
- [ ] Two-factor authentication (schema ready, not implemented)
- [ ] Redis-based rate limiting (planned)
- [ ] DOMPurify for HTML sanitization (planned post-MVP)

## Environment Variables

### Required
```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<random-string>
NEXTAUTH_URL=https://your-domain.com
```

### Optional (Email)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Cofactor Scout" <no-reply@cofactor.world>
```

### Optional (Admin)
```env
ADMIN_EMAIL=admin@cofactor.world
ADMIN_PASSWORD=<secure-password>
```

## Testing

### Unit Tests
```bash
npm test
```

**Test Files**:
- `tests/unit/security/rate-limit.test.ts`
- `tests/unit/validation/schemas.test.ts`

### Manual Testing
1. Sign up with weak password → Should fail
2. Sign up with valid data → Should succeed
3. Try to sign in before verification → Should fail
4. Verify email → Should succeed
5. Sign in with wrong password 5 times → Account locked
6. Wait 15 minutes → Account unlocked
7. Request password reset → Should receive email
8. Reset password with token → Should succeed

## Troubleshooting

### Common Issues

**Issue**: Email verification not working
- Check SMTP configuration
- Check email logs: `docker-compose logs -f web`
- Verify `NEXTAUTH_URL` is correct

**Issue**: Account locked permanently
- Check `lockedUntil` field in database
- Manually unlock: `UPDATE "User" SET "lockedUntil" = NULL WHERE email = '...'`

**Issue**: Session not persisting
- Check `NEXTAUTH_SECRET` is set
- Check cookies are enabled
- Check `NEXTAUTH_URL` matches domain

**Issue**: Rate limiting not working
- Rate limiting is disabled in MVP
- Uncomment code in `actions/auth.actions.ts` to enable
