# Cofactor Club - Security Audit Report

**Audit Date:** 2026-01-24
**Application:** Cofactor Club
**Version:** 0.1.0
**Tech Stack:** Next.js 16, PostgreSQL, Prisma, NextAuth.js

---

## Executive Summary

This comprehensive security audit analyzed the Cofactor Club application across authentication, authorization, input validation, API security, database security, and performance optimization.

### Overall Risk Assessment: MEDIUM-HIGH

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 3 | Needs Immediate Attention |
| High | 5 | Should Be Fixed Soon |
| Medium | 8 | Consider Fixing |
| Low | 4 | Optional Improvements |
| Info/Optimization | 6 | Best Practices |

---

## Table of Contents

1. [Critical Security Issues](#critical-security-issues)
2. [High Severity Issues](#high-severity-issues)
3. [Medium Severity Issues](#medium-severity-issues)
4. [Low Severity Issues](#low-severity-issues)
5. [Performance Optimizations](#performance-optimizations)
6. [Positive Security Findings](#positive-security-findings)
7. [Recommendations Summary](#recommendations-summary)

---

## Critical Security Issues

### 1. Command Injection in Backup/Restore System (CRITICAL)

**Location:** `app/api/admin/backups/route.ts:78-81`, `app/api/admin/backups/restore/route.ts:57-69`

**Issue:** Database credentials are interpolated directly into shell commands without proper escaping, creating a command injection vulnerability.

```typescript
// VULNERABLE CODE in route.ts
const dbHost = process.env.POSTGRES_HOST || 'db';
const dbUser = process.env.POSTGRES_USER || 'cofactor';
const dbName = process.env.POSTGRES_DB || 'cofactor_db';
const command = `pg_dump -h ${dbHost} -U ${dbUser} -d ${dbName} -f "${filepath}"`;
```

If an attacker can control environment variables (e.g., through a compromised container or supply chain attack), they could inject arbitrary commands.

**Recommendation:**
1. Use parameterized command execution libraries
2. Validate and sanitize all environment variables
3. Consider using Prisma's native backup functionality or a dedicated backup service

```typescript
// Safer approach
import { spawn } from 'child_process';
const args = ['-h', dbHost, '-U', dbUser, '-d', dbName, '-f', filepath];
const proc = spawn('pg_dump', args, { env: { PGPASSWORD: dbPassword } });
```

### 2. Debug Endpoint Exposes Database Information (CRITICAL)

**Location:** `app/api/universities/debug/route.ts`

**Issue:** The debug endpoint exposes internal database information including the database connection string (partially masked) and all university data without authentication.

```typescript
// VULNERABLE CODE - No authentication check!
export async function GET() {
    const dbUrl = process.env.DATABASE_URL || 'not set'
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@')
    // Returns all universities to unauthenticated users
    return NextResponse.json({
        database_url_used: maskedUrl,
        universities
    })
}
```

**Recommendation:**
1. Add admin authentication check
2. Remove this endpoint in production or guard it strictly
3. Consider using environment-based conditional exports

### 3. Docker Socket Mount in Backup Container (CRITICAL)

**Location:** `docker-compose.yml:66`

**Issue:** The backup container mounts the Docker socket (`/var/run/docker.sock:/var/run/docker.sock`), which gives the container root-level access to the Docker daemon. If the backup container is compromised, an attacker could:

- Escape to the host system
- Control other containers
- Access sensitive data from other containers

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock # CRITICAL SECURITY ISSUE
```

**Recommendation:**
1. Use Docker API sockets only when absolutely necessary
2. Consider using cron jobs on the host instead
3. If Docker socket access is required, use Docker Contexts with limited permissions

---

## High Severity Issues

### 4. In-Memory Rate Limiting (HIGH)

**Location:** `lib/rate-limit.ts:11`, `app/auth/actions.ts:11-13`

**Issue:** Rate limiting uses in-memory Map storage, which:
- Does not persist across container restarts
- Does not work in multi-instance deployments
- Can be bypassed by distributing requests across multiple servers

```typescript
// VULNERABLE - In-memory only
const rateLimitStore = new Map<string, RateLimitEntry>()
const signupAttempts = new Map<string, { count: number; resetTime: number }>()
```

**Recommendation:**
1. Implement Redis-based rate limiting for production
2. Use Upstash Redis or similar for server-friendly rate limiting
3. Fall back to IP-based rate limiting if email-based is bypassed

### 5. Weak Password Reset Token (HIGH)

**Location:** `app/auth/actions.ts:16-18`

**Issue:** Password reset tokens are 6-digit numeric codes with only 1,000,000 possible combinations. With no rate limiting on the reset endpoint itself, an attacker could brute force these codes.

```typescript
function generateToken(): string {
    return randomInt(100000, 1000000).toString() // Only 6 digits!
}
```

**Recommendation:**
1. Use cryptographically secure random tokens with at least 128 bits of entropy
2. Implement rate limiting on the reset password endpoint
3. Consider adding additional verification factors (e.g., security questions)

### 6. Missing Authorization on Role Update (HIGH)

**Location:** `app/api/members/update-role/route.ts`

**Issue:** The role update endpoint uses loose redirect logic instead of proper JSON error responses, and doesn't validate that the target role is valid.

```typescript
// Missing: Validate newRole is a valid Role enum value
const newRole = formData.get('role') as Role
// No validation that newRole is a valid enum value
```

**Recommendation:**
1. Validate role against enum values before updating
2. Return JSON error responses instead of redirects for API endpoints
3. Add audit logging for role changes

### 7. SQL Injection Risk via Dynamic Filename (HIGH)

**Location:** `app/api/admin/backups/restore/route.ts:31-60`

**Issue:** While `path.basename()` is used, the filename is still used in shell commands with potential for injection if the basename doesn't fully sanitize the input.

```typescript
const safeFilename = path.basename(filename);
// Still used in shell command:
command = `gunzip -c "${filepath}" | psql -h ${dbHost} -U ${dbUser} -d ${dbName}`;
```

**Recommendation:**
1. Implement strict filename validation (allow only alphanumeric, dashes, underscores, dots)
2. Reject filenames with special characters
3. Consider using a whitelist approach for allowed filenames

### 8. Missing HTTPS Enforcement (HIGH)

**Location:** Multiple files, `lib/auth-config.ts:121-122`

**Issue:** Session max age is set to 30 days without proper cookie security settings. The session configuration should include:

- `secure: true` for HTTPS-only cookies
- `sameSite: 'lax'` or `'strict'` for CSRF protection

```typescript
session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    // Missing: secure cookie settings
}
```

**Recommendation:**
1. Add cookie security settings in NextAuth configuration
2. Enforce HTTPS in production via redirects or HSTS headers
3. Consider shorter session durations for sensitive operations

---

## Medium Severity Issues

### 9. Duplicate Code in Admin Actions (MEDIUM)

**Location:** `app/admin/actions.ts:177-181`

**Issue:** Redundant code paths with unreachable code after redirect:

```typescript
revalidatePath('/wiki')
redirect('/wiki')  // Function exits here
revalidatePath('/wiki')  // DEAD CODE - unreachable
redirect('/wiki')  // DEAD CODE - unreachable
```

**Recommendation:**
1. Remove unreachable code
2. Use proper control flow patterns

### 10. Information Disclosure via Error Messages (MEDIUM)

**Location:** `app/api/admin/backups/route.ts:50-51`, various locations

**Issue:** Error messages may leak internal file paths and system information:

```typescript
return new NextResponse('Failed to create backup: ' + (error instanceof Error ? error.message : String(error))
```

**Recommendation:**
1. Use generic error messages for API responses
2. Log detailed errors server-side only
3. Implement error codes that can be looked up internally

### 11. Missing CSRF Protection for State-Changing Operations (MEDIUM)

**Location:** `app/api/auth/[...nextauth]/route.ts`

**Issue:** While NextAuth provides some CSRF protection, API routes that use form data should explicitly implement CSRF tokens.

**Recommendation:**
1. Implement CSRF token validation for all state-changing operations
2. Use Next.js built-in CSRF protection for Server Actions
3. Consider using double-submit cookie pattern

### 12. Weak Password Policy (MEDIUM)

**Location:** `lib/validation.ts:14-16`

**Issue:** Password validation only checks minimum length (8 characters) and doesn't enforce complexity requirements.

```typescript
password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
```

**Recommendation:**
1. Add complexity requirements (uppercase, lowercase, numbers, special chars)
2. Implement password strength meter
3. Check against common password dictionaries

### 13. Missing Account Enumeration Prevention (MEDIUM)

**Location:** `app/auth/actions.ts:104-106`, `lib/auth-config.ts:26-27`

**Issue:** Different error messages for existing vs non-existing users during signup and login can be used for account enumeration.

```typescript
// Signup - reveals if email exists
if (existingUser) {
    return { error: 'Email already exists' }
}
```

**Recommendation:**
1. Use generic error messages for both cases
2. Implement rate limiting to slow down enumeration attempts
3. Consider email verification to confirm email existence

### 14. Unrestricted File Upload in Backup System (MEDIUM)

**Location:** `app/api/admin/backups/upload/route.ts:35-37`

**Issue:** File extension validation is superficial and doesn't validate actual file content:

```typescript
if (!file.name.endsWith('.sql') && !file.name.endsWith('.sql.gz')) {
    return new NextResponse('Invalid file format. Must be .sql or .sql.gz', { status: 400 });
}
```

**Recommendation:**
1. Validate file MIME type
2. Check magic bytes/file signature
3. Limit file size
4. Scan uploaded files for malware

### 15. Potential Race Condition in Referral Code Generation (MEDIUM)

**Location:** `app/auth/actions.ts:46-56`

**Issue:** The referral code generation has a race condition window where the same code could be generated by concurrent requests.

```typescript
// Check for uniqueness
const existing = await prisma.user.findUnique({
    where: { referralCode: code }
})
// Race condition: another request could create same code here
if (!existing) {
    return code
}
```

**Recommendation:**
1. Use database unique constraint as the primary guarantee
2. Implement retry logic with exponential backoff
3. Consider using UUID-based referral codes

### 16. Missing Request Size Limits (MEDIUM)

**Location:** Multiple API routes

**Issue:** No explicit limits on request body size, which could lead to DoS attacks via large payloads.

**Recommendation:**
1. Configure Next.js body size limits
2. Implement per-route size limits
3. Add request timeout middleware

---

## Low Severity Issues

### 17. Inconsistent Error Status Codes (LOW)

**Location:** `app/api/members/update-role/route.ts:10`, `app/api/members/delete-user/route.ts:10`

**Issue:** Using 401 (Unauthorized) for authorization failures instead of 403 (Forbidden).

**Recommendation:**
- Use 401 for unauthenticated requests
- Use 403 for authenticated but unauthorized requests

### 18. Hardcoded Staff Secret Code Default (LOW)

**Location:** `docker-compose.yml:15`, `.env.example:31`

**Issue:** Default STAFF_SECRET_CODE is publicly documented.

**Recommendation:**
1. Require explicit setting of staff secret
2. Remove default value or make it randomly generated

### 19. Missing Security Headers (LOW)

**Location:** Next.js configuration

**Issue:** No explicit security headers configured (CSP, HSTS, X-Frame-Options, etc.)

**Recommendation:**
1. Add Content-Security-Policy header
2. Add X-Frame-Options: DENY
3. Add X-Content-Type-Options: nosniff
4. Add Strict-Transport-Security header

### 20. Exposed Referral Code Pattern (LOW)

**Location:** `app/auth/actions.ts:26-37`

**Issue:** Referral codes follow a predictable pattern (name + random hex) which could be guessed.

**Recommendation:**
1. Use fully random referral codes
2. Add rate limiting on referral code lookup
3. Implement code expiration

---

## Performance Optimizations

### 21. N+1 Query in Leaderboard (OPTIMIZATION)

**Location:** Leaderboard implementation (not fully visible but inferred)

**Issue:** If leaderboard fetches each user's data separately, this creates N+1 queries.

**Recommendation:**
1. Use eager loading with Prisma `include`
2. Implement caching for leaderboard data
3. Consider materialized views for rankings

### 22. Missing Database Index Optimization (OPTIMIZATION)

**Location:** `prisma/schema.prisma`

**Issue:** Some frequently queried fields may benefit from composite indexes.

**Current Indexes:**
```prisma
@@index([email])
@@index([referralCode])
```

**Recommendation:**
1. Add composite index for `(universityId, role)` queries
2. Add index for `(status, createdAt)` on WikiRevision
3. Consider partial indexes for pending items

### 23. Inefficient Power Score Recalculation (OPTIMIZATION)

**Location:** `app/admin/actions.ts:125-155`

**Issue:** Power score recalculation makes multiple database queries per user.

```typescript
const referralsCount = await prisma.referral.count(...)
const approvedEditsCount = await prisma.wikiRevision.count(...)
// Multiple queries - could be combined
```

**Recommendation:**
1. Use aggregate queries or single query with joins
2. Implement incremental updates instead of full recalculation
3. Cache power scores with Redis

### 24. Missing Response Caching (OPTIMIZATION)

**Location:** Various API routes

**Issue:** Public endpoints like university lookup don't implement caching.

**Recommendation:**
1. Add HTTP cache headers for public data
2. Implement Redis caching for frequently accessed data
3. Use Next.js revalidation for cache invalidation

### 25. Inefficient Social Stats Sync (OPTIMIZATION)

**Location:** `app/actions/social.ts:18-31`

**Issue:** Mock social stats sync doesn't implement real API integration.

```typescript
// Mock API call delay
await new Promise(resolve => setTimeout(resolve, 1000))
// Returns random data instead of real API calls
```

**Recommendation:**
1. Implement actual OAuth integration with social platforms
2. Cache social stats with appropriate TTL
3. Implement background refresh

### 26. Duplicate Revalidation Calls (OPTIMIZATION)

**Location:** `app/admin/actions.ts:57-62`, multiple files

**Issue:** Some functions call `revalidatePath()` multiple times with same path.

**Recommendation:**
1. Deduplicate revalidation calls
2. Batch revalidations where possible

---

## Positive Security Findings

The following security practices were well implemented:

1. **Password Hashing:** Uses bcryptjs with 10 rounds (`app/auth/actions.ts:199`)

2. **XSS Protection:** DOMPurify is used for sanitizing user-generated wiki content (`app/wiki/actions.ts:17`)

3. **Account Lockout:** Failed login attempt tracking with account lockout after 5 attempts (`lib/auth-config.ts:7-8, 50-59`)

4. **Email Verification:** Users must verify email before full access (`app/auth/actions.ts:204-206, app/auth/verify/route.ts`)

5. **Input Validation:** Zod schemas for form validation (`lib/validation.ts`)

6. **SQL Injection Protection:** Prisma ORM prevents SQL injection through parameterized queries

7. **Directory Traversal Protection:** Uses `path.basename()` for file operations (`app/api/admin/backups/[filename]/route.ts:32`)

8. **Audit Logging:** Logger implementation for security events (`lib/logger.ts`)

---

## Recommendations Summary

### Immediate Actions (This Week)

1. **Remove or secure** the `/api/universities/debug` endpoint
2. **Fix command injection** in backup/restore routes
3. **Remove Docker socket mount** from backup container
4. **Implement Redis-based rate limiting**

### Short-term Actions (This Month)

1. Strengthen password reset tokens
2. Add comprehensive CSRF protection
3. Implement proper cookie security settings
4. Add security headers to Next.js configuration
5. Fix role validation in update-role endpoint

### Long-term Actions (This Quarter)

1. Implement real OAuth for social media integration
2. Add comprehensive audit logging for admin actions
3. Implement caching strategy for public endpoints
4. Add end-to-end testing for security scenarios
5. Consider security penetration testing

---

## Additional Recommendations

### Infrastructure

1. **Secrets Management:** Use a proper secrets manager (e.g., HashiCorp Vault, AWS Secrets Manager) instead of environment variables
2. **Container Security:** Scan Docker images for vulnerabilities using Trivy or similar
3. **Network Segmentation:** Separate database and application networks
4. **WAF:** Consider adding a Web Application Firewall

### Monitoring

1. **Security Logging:** Implement centralized security event logging
2. **Alerting:** Set up alerts for suspicious activities
3. **Audit Trails:** Maintain immutable audit logs for admin actions

### Compliance

1. **GDPR:** Implement data export and deletion functionality
2. **Privacy Policy:** Add privacy policy and terms of service
3. **Cookie Consent:** Implement cookie consent banner

---

## Conclusion

The Cofactor Club application has a solid foundation with good security practices in several areas (password hashing, XSS protection, email verification). However, there are critical vulnerabilities in the backup system and debug endpoint that require immediate attention. The application would benefit from a hardened security posture focused on:

1. Removing debug endpoints from production
2. Implementing proper rate limiting with persistent storage
3. Strengthening authentication token security
4. Adding comprehensive security headers and HTTPS enforcement

**Overall Security Rating: 6.5/10**

With the critical issues addressed and the recommended improvements implemented, this rating could be improved to 8/10.

---

*Report generated by Claude Code - Security Audit Module*
