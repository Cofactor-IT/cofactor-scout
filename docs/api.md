# API Reference

This document describes all API routes, server actions, and data mutations available in Cofactor Club.

## Table of Contents

- [Overview](#overview)
- [API Routes](#api-routes)
- [Server Actions](#server-actions)
  - [Authentication Actions](#authentication-actions)
  - [Admin Actions](#admin-actions)
  - [Wiki Actions](#wiki-actions)
  - [Profile Actions](#profile-actions)
- [Power Score Calculations](#power-score-calculations)
- [Error Handling](#error-handling)

---

## Overview

Cofactor Club uses **Next.js Server Actions** for data mutations and **API Routes** for external integrations. Server Actions provide:

- Type-safe form handling
- Progressive enhancement (works without JavaScript)
- Automatic CSRF protection
- Direct database access

### Authentication

Most endpoints require authentication. Use the `/api/auth/[...nextauth]` endpoint to authenticate.

### Response Format

**Success Response:**
```json
{
  "status": "ok",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "error": "Error message description"
}
```

---

## API Routes

### Health Check

Check application health status.

**Endpoint:** `GET /api/health`

**Authentication:** None required

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-12T10:30:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Application is healthy

---

### NextAuth Authentication

Handles authentication sessions and callbacks.

**Endpoint:** `GET|POST /api/auth/[...nextauth]`

**Authentication:** None (self-handling)

**Supported Methods:**

| Method | Purpose |
|--------|---------|
| `GET` | Retrieve current session |
| `POST` | Sign in, sign out, update session |

**Configuration:** See [Authentication Documentation](./authentication.md)

---

### Update User Role

Change a user's role (Admin only).

**Endpoint:** `POST /api/members/update-role`

**Authentication:** Admin required

**Request Body:** `FormData`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | ID of user to update |
| `role` | string | Yes | New role (`STUDENT`, `STAFF`, `ADMIN`, `PENDING_STAFF`) |

**Response:**
- `302 Redirect` to `/members`

**Error Responses:**
| Status | Description |
|--------|-------------|
| `401` | Unauthorized (not admin) |
| `400` | Missing required fields or attempting to change own role |

**Example:**
```typescript
const formData = new FormData();
formData.append('userId', 'clx...');
formData.append('role', 'STAFF');

await fetch('/api/members/update-role', {
  method: 'POST',
  body: formData
});
```

---

### Delete User

Permanently delete a user account (Admin only).

**Endpoint:** `POST /api/members/delete-user`

**Authentication:** Admin required

**Request Body:** `FormData`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | ID of user to delete |

**Response:**
- `302 Redirect` to `/members`

**Error Responses:**
| Status | Description |
|--------|-------------|
| `401` | Unauthorized (not admin) |
| `400` | Missing userId or attempting to delete self |

**Note:** This is a permanent deletion. User data cannot be recovered.

---

### Reset User Password

Force reset a user's password (Admin only).

**Endpoint:** `POST /api/members/reset-password`

**Authentication:** Admin required

**Request Body:** `FormData`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | ID of user whose password to reset |
| `newPassword` | string | Yes | New password (min 8 characters) |

**Response:**
- `302 Redirect` to `/members`

**Error Responses:**
| Status | Description |
|--------|-------------|
| `401` | Unauthorized (not admin) |
| `400` | Missing fields or invalid password |

---

## Server Actions

Server Actions are functions that run on the server and can be called from Client Components. They are used for form submissions and data mutations.

### Authentication Actions

Located in: `app/auth/actions.ts`

#### Sign Up

Register a new user account.

**Function:** `signUp(prevState, formData: FormData)`

**Authentication:** None

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's email address |
| `password` | string | Yes | Password (min 8 characters) |
| `name` | string | Yes | Display name |
| `referralCode` | string | Yes | Referral code OR staff secret code |

**Behavior:**
1. Validates input with Zod schema
2. Checks rate limits (3 attempts per 15 minutes per email)
3. Verifies referral code or staff secret
4. Creates user with hashed password
5. Generates unique referral code
6. Sends verification email
7. Awards referrer +50 Power Score (if applicable)

**Response:**
- On success: Redirects to `/auth/signin` with success message
- On error: Returns `{ error: string }`

**Role Assignment:**
| Condition | Role |
|-----------|------|
| Staff secret code provided | `PENDING_STAFF` |
| Valid referral code | `STUDENT` |

**Example:**
```tsx
'use client';

import { signUp } from '@/app/auth/actions';

export default function SignUpForm() {
  async function handleSubmit(formData: FormData) {
    const result = await signUp(undefined, formData);
    if (result?.error) {
      // Handle error
    }
  }

  return <form action={handleSubmit}>...</form>;
}
```

---

#### Request Password Reset

Initiate password reset flow.

**Function:** `requestPasswordReset(prevState, formData: FormData)`

**Authentication:** None

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's email address |

**Behavior:**
1. Checks rate limits (3 attempts per hour per email)
2. Finds user by email
3. Generates 6-digit reset code
4. Sends email with reset code
5. Code expires in 1 hour

**Security:** Always returns success message even if email doesn't exist (prevents email enumeration).

**Response:**
```json
{
  "success": "If an account exists with this email, you will receive a password reset code."
}
```

---

#### Reset Password

Complete password reset with code.

**Function:** `resetPassword(prevState, formData: FormData)`

**Authentication:** None (requires valid token)

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | string | Yes | 6-digit reset code from email |
| `password` | string | Yes | New password (min 8 characters) |

**Behavior:**
1. Validates reset token
2. Checks expiration (1 hour)
3. Hashes new password
4. Updates user password
5. Deletes used token (single-use)

**Response:**
- Success: `{ success: "Your password has been reset..." }`
- Error: `{ error: "Invalid or expired reset code" }`

---

#### Resend Verification Email

Resend email verification token.

**Function:** `resendVerificationEmail(prevState, formData: FormData)`

**Authentication:** None

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's email address |

**Response:**
- Success: `{ success: "Verification email sent..." }`
- Already verified: `{ success: "Email is already verified." }`
- Error: `{ error: "No account found..." }`

---

### Admin Actions

Located in: `app/admin/actions.ts`

All admin actions require the `ADMIN` role and call `requireAdmin()` for authorization.

#### Approve Revision

Approve a wiki revision and apply changes to the page.

**Function:** `approveRevision(revisionId: string)`

**Authentication:** Admin required

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `revisionId` | string | Yes | ID of revision to approve |

**Behavior (Atomic Transaction):**
1. Updates revision status to `APPROVED`
2. Updates `UniPage` content with revision content
3. Sets `UniPage.published = true`
4. Awards author +20 Power Score

**Cache Invalidation:**
- Revalidates `/wiki/[slug]`
- Revalidates `/admin/dashboard`
- Revalidates `/wiki`

---

#### Reject Revision

Reject a wiki revision.

**Function:** `rejectRevision(revisionId: string)`

**Authentication:** Admin required

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `revisionId` | string | Yes | ID of revision to reject |

**Behavior:**
- Updates revision status to `REJECTED`
- No Power Score awarded
- Page content unchanged

---

#### Approve Staff

Approve a pending staff member.

**Function:** `approveStaff(userId: string)`

**Authentication:** Admin required

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | ID of user to promote |

**Behavior:**
- Changes user role from `PENDING_STAFF` to `STAFF`

---

#### Reject Staff

Reject a staff application.

**Function:** `rejectStaff(userId: string)`

**Authentication:** Admin required

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | ID of user to downgrade |

**Behavior:**
- Changes user role to `STUDENT`

---

#### Delete Page

Delete a wiki page and all its revisions.

**Function:** `deletePage(slug: string)`

**Authentication:** Admin required

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | URL slug of page to delete |

**Behavior (Atomic Transaction):**
1. Deletes all `WikiRevision` records for the page
2. Deletes the `UniPage` record
3. Redirects to `/wiki`

**Warning:** This is permanent and cannot be undone.

---

#### Recalculate Power Score

Manually recalculate a user's Power Score.

**Function:** `recalculatePowerScore(userId: string)`

**Authentication:** Admin required (typically internal use)

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | ID of user |

**Calculation:**
```
Power Score = (Referrals × 50) + (Approved Edits × 20) + floor(Social Reach / 100)
```

---

### Wiki Actions

Located in: `app/wiki/actions.ts`

#### Propose Edit

Create or edit a wiki page.

**Function:** `proposeEdit(formData: FormData)`

**Authentication:** Any authenticated user

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | Yes | URL-safe page identifier |
| `content` | string | Yes | Page content (HTML/markdown) |
| `uniName` | string | No* | University name (required for new pages) |

*Required when creating a new page

**Behavior:**
1. Sanitizes content with DOMPurify (XSS protection)
2. Creates new page if it doesn't exist
3. Creates revision record
4. Staff/Admin: Auto-approved, updates page immediately
5. Student: Pending approval, creates revision only
6. Awards +20 Power Score if auto-approved

**Role-based Behavior:**
| Role | Revision Status | Page Update |
|------|----------------|-------------|
| `ADMIN` / `STAFF` | `APPROVED` | Immediate |
| `STUDENT` | `PENDING` | After admin approval |

**Response:**
- Auto-approved: Redirects to `/wiki/[slug]`
- Pending: Redirects to `/wiki/[slug]/thank-you`

**Security:** All content is sanitized using `isomorphic-dompurify` before storage.

---

### Profile Actions

Located in: `app/profile/connect/actions.ts`

#### Save Social API Keys

Save social media account information and follower counts.

**Function:** `saveSocialApiKeys(formData: FormData)`

**Authentication:** Required (own profile only)

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `platform` | string | Yes | `instagram`, `tiktok`, or `linkedin` |
| `username` | string | Yes | Username or profile URL |
| `followers` | number | No | Follower count (for verification) |

**Behavior:**
1. Validates input with Zod schema
2. Updates user's `socialStats` JSON field
3. Recalculates Power Score with new social data
4. Revalidates profile and leaderboard pages

**Social Stats Schema:**
```typescript
interface SocialStats {
  instagram?: number;
  instagramUsername?: string;
  tiktok?: number;
  tiktokUsername?: string;
  linkedin?: number;
  linkedinUrl?: string;
}
```

**Example:**
```tsx
<form action={saveSocialApiKeys}>
  <input name="platform" value="instagram" />
  <input name="username" placeholder="@username" />
  <input name="followers" type="number" />
  <button type="submit">Save</button>
</form>
```

**Production Note:** Currently uses self-reported follower counts. In production, integrate with:
- Instagram Graph API
- TikTok API
- LinkedIn API

---

## Power Score Calculations

The Power Score is calculated using the following constants and formula:

### Constants

```typescript
const POWER_SCORE = {
  REFERRAL_POINTS: 50,        // Points per successful referral
  WIKI_APPROVAL_POINTS: 20,   // Points per approved wiki edit
  SOCIAL_DIVISOR: 100,        // Followers needed for 1 point
};
```

### Formula

```
Power Score = (Referrals × 50) + (Approved Wiki Edits × 20) + floor(Total Followers / 100)
```

### Example Calculation

| User Stat | Value |
|-----------|-------|
| Referrals | 5 |
| Approved Wiki Edits | 3 |
| Instagram Followers | 1,000 |
| TikTok Followers | 2,500 |
| LinkedIn Connections | 500 |

```
Power Score = (5 × 50) + (3 × 20) + floor(4,000 / 100)
            = 250 + 60 + 40
            = 350
```

### Social Reach Calculation

```typescript
function calculateSocialReach(stats: SocialStats): number {
  return (stats.instagram || 0) +
         (stats.tiktok || 0) +
         (stats.linkedin || 0);
}
```

---

## Error Handling

### Common Error Responses

| Error | Cause | Resolution |
|-------|-------|------------|
| `Unauthorized` | Missing or invalid session | User must sign in |
| `Forbidden` | Insufficient permissions | User needs higher role |
| `Rate limit exceeded` | Too many requests | Wait for rate limit window |
| `Invalid referral code` | Code doesn't exist | User needs valid code |
| `Email already exists` | Account already registered | Use sign in instead |
| `Too many signup attempts` | Rate limit triggered | Wait 15 minutes |

### Rate Limits

| Action | Limit | Window |
|--------|-------|--------|
| Sign Up | 3 attempts | 15 minutes |
| Password Reset | 3 attempts | 1 hour |

### Validation Errors

All user input is validated using Zod schemas before processing:

```typescript
// Example validation
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  referralCode: z.string().min(4),
});
```

---

## Usage Examples

### Client Component with Server Action

```tsx
'use client';

import { useActionState } from 'react';
import { approveRevision } from '@/app/admin/actions';

export function RevisionActions({ revisionId }: { revisionId: string }) {
  const [state, formAction] = useActionState(approveRevision, null);

  return (
    <form action={async () => await approveRevision(revisionId)}>
      <button type="submit">Approve</button>
    </form>
  );
}
```

### Direct Server Action Call

```typescript
import { approveRevision } from '@/app/admin/actions';

// In another Server Component or Server Action
await approveRevision('clx...');
```

### API Route Call

```typescript
const response = await fetch('/api/members/update-role', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    userId: 'clx...',
    role: 'STAFF'
  }),
});
```

---

## Security Features

- **CSRF Protection:** Built into Server Actions
- **Rate Limiting:** In-memory limits on sensitive operations
- **Input Sanitization:** DOMPurify for all HTML content
- **Password Hashing:** bcrypt with 10 rounds
- **Session Management:** HTTP-only JWT cookies
- **Role-Based Access:** Server-side checks on all protected operations

---

**Next:** Read the [Database Schema documentation](./database.md) for data model details.
