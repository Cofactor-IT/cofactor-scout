# Auth & Security

## Overview

Security is paramount in Cofactor Club. We use a combination of **NextAuth.js** and strict **Role-Based Access Control (RBAC)** to protect user data and maintain content integrity.

## Authentication (NextAuth.js)

We use the `Credentials` provider for email/password login.

### University Domain Verification
When a user signs up, their email domain is critical.
1.  **Extraction**: The domain is extracted from the email (e.g., `alice@tu-berlin.de` -> `tu-berlin.de`).
2.  **Matching**: We check the `University` table for a matching domain.
3.  **Assignment**: If a match is found, the user is automatically assigned to that university. If not, signup is rejected (or they are placed in a holding pattern, depending on configuration).

## Authorization (RBAC)

We use middleware and server-side checks to enforce permissions.

### Roles
The `Role` enum defines the hierarchy:
1.  **`STUDENT`**: Default role. Can view and *propose* edits.
2.  **`TRUSTED`**: Can *publish* edits directly (up to a daily limit).
3.  **`STAFF`**: Can *publish* unlimited edits and moderate content within their university.
4.  **`ADMIN`**: Superuser. Can manage all universities, users, and system settings.

### Middleware Protection
The `middleware.ts` file protects routes based on patterns:
*   `/admin/*` -> Requires `ADMIN` role.
*   `/wiki/*/edit` -> Requires authentication.

### Server Action Checks
Every server action (mutation) performs a double-check of permissions.
```typescript
// Example: Verifying admin status in an action
const session = await auth();
if (session?.user?.role !== "ADMIN") {
  throw new Error("Unauthorized");
}
```

## Security Best Practices

*   **XSS Protection**: All user content is sanitized with `isomorphic-dompurify` before rendering.
*   **CSRF**: Next.js Server Actions automatically handle CSRF protection via tokens.
*   **Rate Limiting**: We use `upstash/ratelimit` (optional/configurable) to prevent abuse on public endpoints.
