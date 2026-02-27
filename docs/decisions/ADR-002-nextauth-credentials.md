# ADR-002: NextAuth Credentials Provider

**Status:** Accepted  
**Date:** February 2026  
**Deciders:** Development Team

## Context

Cofactor Scout needed an authentication system for user sign-up, sign-in, and session management. We evaluated several authentication approaches:

1. **NextAuth with Credentials Provider** - Email/password authentication
2. **NextAuth with OAuth only** - Google, LinkedIn, GitHub
3. **Custom JWT implementation** - Build from scratch
4. **Third-party auth service** - Auth0, Clerk, Supabase Auth

## Decision

**Use NextAuth.js with Credentials Provider for email/password authentication.**

Add OAuth providers (Google, LinkedIn) in post-MVP phase.

## Reasoning

### Why NextAuth.js?

1. **Next.js Integration**
   - Built specifically for Next.js
   - Works seamlessly with App Router
   - Server Components support
   - Middleware integration

2. **Session Management**
   - JWT or database sessions
   - Automatic cookie handling
   - CSRF protection built-in
   - Session refresh handling

3. **Extensibility**
   - Easy to add OAuth providers later
   - Custom callbacks for business logic
   - Flexible session strategy
   - Database adapter support

4. **Security**
   - Industry-standard implementation
   - Regular security updates
   - Well-audited codebase
   - OWASP best practices

### Why Credentials Provider?

1. **MVP Requirements**
   - Users need email/password option
   - No dependency on third-party OAuth
   - Works for all users (no Google/LinkedIn required)
   - Simpler onboarding flow

2. **Control**
   - Full control over sign-up flow
   - Custom validation rules
   - Email verification workflow
   - Password complexity requirements

3. **User Experience**
   - Familiar sign-up/sign-in flow
   - No external redirects
   - Works without JavaScript (progressive enhancement)
   - Single-page authentication

### Implementation Details

**Session Strategy: JWT**
```typescript
session: {
  strategy: "jwt",
  maxAge: 60 * 60 * 24 * 30, // 30 days
}
```

**Why JWT over Database Sessions:**
- Stateless (no database query on every request)
- Scales horizontally
- Works with serverless
- Simpler infrastructure

**Remember Me Feature:**
```typescript
// Default: 24 hours
// With remember me: 30 days
const maxAge = user.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24
token.exp = Math.floor(Date.now() / 1000) + maxAge
```

**Account Security:**
- Account lockout after 5 failed attempts
- 15-minute lockout duration
- Failed attempts reset on successful login
- Email verification required before sign-in

## Consequences

### Positive

- **Fast Implementation:** NextAuth provides most functionality out of the box
- **Security:** Industry-standard implementation with regular updates
- **Flexibility:** Easy to add OAuth providers later
- **User Control:** Full control over authentication flow
- **No Vendor Lock-in:** Can migrate to custom solution if needed

### Negative

- **Password Management:** We handle password resets, complexity, etc.
- **Email Verification:** We must implement and maintain email sending
- **Account Recovery:** We handle locked accounts and password resets
- **Security Responsibility:** We're responsible for password security

### Neutral

- **OAuth Later:** Can add Google/LinkedIn in post-MVP
- **Database Dependency:** Requires PostgreSQL for user storage
- **Email Dependency:** Requires SMTP for verification emails

## Alternatives Considered

### 1. OAuth Only (No Credentials)

**Pros:**
- No password management
- Faster sign-up
- More secure (no password leaks)

**Cons:**
- Requires Google/LinkedIn account
- External dependency
- More complex for users without accounts
- Privacy concerns (tracking)

**Why Rejected:** Not all users have or want to use Google/LinkedIn

### 2. Custom JWT Implementation

**Pros:**
- Full control
- No dependencies
- Exactly what we need

**Cons:**
- Security risk (easy to get wrong)
- Time-consuming to build
- Need to maintain ourselves
- Reinventing the wheel

**Why Rejected:** NextAuth provides same control with better security

### 3. Auth0 / Clerk / Supabase Auth

**Pros:**
- Fully managed
- No security responsibility
- Advanced features (MFA, etc.)
- Great UX

**Cons:**
- Monthly cost ($25-100+)
- Vendor lock-in
- Less control over flow
- External dependency

**Why Rejected:** Unnecessary cost for MVP, can migrate later if needed

## Security Measures Implemented

### Password Security
- Bcrypt hashing (cost factor 10)
- Complexity requirements (8+ chars, uppercase, lowercase, number, special)
- Never stored in plain text
- Never sent in logs or error messages

### Account Lockout
```typescript
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 15
```

### Email Verification
- Required before sign-in (except admin)
- Token expires after 24 hours
- Cryptographically secure tokens (32 bytes)

### Password Reset
- Token expires after 1 hour
- Single-use tokens (deleted after use)
- Constant-time responses (prevent account enumeration)

### Session Security
- HTTP-only cookies
- Secure flag in production
- SameSite=Lax
- CSRF protection via NextAuth

## Future Enhancements

### Post-MVP
- [ ] Google OAuth
- [ ] LinkedIn OAuth
- [ ] Two-factor authentication (schema ready)
- [ ] Magic link sign-in
- [ ] Passkey support

### Monitoring
- [ ] Failed login attempt tracking
- [ ] Account lockout alerts
- [ ] Suspicious activity detection
- [ ] Session analytics

## Review

This decision will be reviewed after 6 months to assess:
- User feedback on authentication flow
- Security incidents (if any)
- Need for OAuth providers
- Performance and scalability

## References

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Credentials Provider](https://next-auth.js.org/providers/credentials)
- [JWT Sessions](https://next-auth.js.org/configuration/options#jwt)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [lib/auth/config.ts](../../lib/auth/config.ts) - Implementation
- [actions/auth.actions.ts](../../actions/auth.actions.ts) - Server Actions
