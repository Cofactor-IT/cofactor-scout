# File Reorganization - February 2026

**Date:** February 15, 2026  
**Status:** ✅ COMPLETE  
**Files Moved:** 60  
**Files Modified:** 85+  
**Import Paths Fixed:** 100+  
**Reason:** Align with CODE_STANDARDS.md structure

---

## TL;DR

Reorganized 60 files into standardized directory structure. Fixed 100+ import paths across 85+ files. All features working.

### What Changed

```
actions/                    ← 14 Server Actions moved here
components/features/        ← 19 feature components organized by domain
components/shared/          ← 4 shared components
lib/auth/                   ← 3 auth utilities
lib/security/               ← 5 security utilities
lib/validation/             ← 1 validation schemas
lib/email/                  ← 1 email sender (2 already existed)
lib/database/               ← 2 database utilities
lib/utils/                  ← 6 general utilities
tests/unit/                 ← 4 test files organized by category
proxy.ts                    ← Renamed from middleware.ts (Next.js 16)
```

---

## Additional Changes

### 1. Made Referral Code Optional (3 files)

**Files:** `lib/validation/schemas.ts`, `actions/auth.actions.ts`, `app/auth/signup/page.tsx`

- Removed `.min(1, 'Referral code is required')` validation
- Added `.optional()` to referralCode field
- Updated SQL injection check: `!code || !containsSqlInjection(code)`
- Changed `determineUserRole()` parameter to optional: `referralCode?: string`
- Removed `required` attribute from signup form input
- Updated label: "Referral Code" → "Referral Code (Optional)"

**Result:** Users can now sign up without a referral code. Staff codes still work.

### 2. Fixed Import Path Errors (85+ files)

**Problem:** Incorrect import paths after file reorganization causing build failures

**Categories Fixed:**

- **Auth Config** (35 files): `@/lib/auth-config` → `@/lib/auth/config`
- **Prisma** (12 files): `@/lib/prisma` → `@/lib/database/prisma`
- **Utils** (15 files): `@/lib/utils` → `@/lib/utils/formatting`
- **Security** (10 files): `@/lib/sanitization` → `@/lib/security/sanitization`
- **Validation** (8 files): `@/lib/validation` → `@/lib/validation/schemas`
- **Email** (5 files): `@/lib/email` → `@/lib/email/send`
- **Components** (20+ files): Relative imports → `@/components/features/*` or `@/components/shared/*`
- **Actions** (15+ files): Relative imports → `@/actions/*.actions`

**Result:** All build errors resolved ✅

### 3. Next.js 16 Compatibility

**File:** `middleware.ts` → `proxy.ts`

- Renamed per Next.js 16 requirement
- Functionality unchanged
- Deprecation warning removed

---

## Quick Reference: Where Files Moved

### Server Actions → `actions/`

```
app/auth/actions.ts                     → actions/auth.actions.ts
app/admin/actions.ts                    → actions/admin.actions.ts
app/admin/settings/actions.ts           → actions/admin-settings.actions.ts
app/admin/universities/actions.ts       → actions/admin-universities.actions.ts
app/members/actions.ts                  → actions/members.actions.ts
app/profile/actions.ts                  → actions/profile.actions.ts
app/profile/settings-actions.ts         → actions/profile-settings.actions.ts
app/profile/connect/actions.ts          → actions/social-connect.actions.ts
app/actions/social.ts                   → actions/social.actions.ts
app/wiki/actions.ts                     → actions/wiki.actions.ts
app/wiki/activity-actions.ts            → actions/wiki-activity.actions.ts
app/wiki/history-actions.ts             → actions/wiki-history.actions.ts
app/wiki/people-actions.ts              → actions/wiki-people.actions.ts
app/wiki/structure-actions.ts           → actions/wiki-structure.actions.ts
```

### Components → `components/features/` & `components/shared/`

```
# Admin
app/admin/settings/AddStaffDomainForm.tsx       → components/features/admin/
app/admin/universities/UniversityManager.tsx    → components/features/admin/

# Members
app/members/member-row.tsx                      → components/features/members/MemberRow.tsx

# Profile
app/profile/SecondaryUniversityCard.tsx         → components/features/profile/
app/profile/settings/*.tsx (3 files)            → components/features/profile/

# Wiki
app/wiki/*.tsx (4 modals/buttons)               → components/features/wiki/
app/wiki/[slug]/edit/*.tsx (2 files)            → components/features/wiki/

# Search
components/SearchBar.tsx                        → components/features/search/

# Shared
components/navbar.tsx                           → components/shared/Navbar.tsx
components/SignOutButton.tsx                    → components/shared/SignOutButton.tsx
components/error-boundary.tsx                   → components/shared/ErrorBoundary.tsx
components/AnalyticsProvider.tsx                → components/shared/AnalyticsProvider.tsx
```

### Lib Utilities → Organized Modules

```
# Auth
lib/auth.ts                 → lib/auth/session.ts
lib/auth-checks.ts          → lib/auth/permissions.ts
lib/auth-config.ts          → lib/auth/config.ts

# Security
lib/rate-limit*.ts (3)      → lib/security/
lib/sanitization.ts         → lib/security/sanitization.ts
lib/csrf.ts                 → lib/security/csrf.ts

# Validation
lib/validation.ts           → lib/validation/schemas.ts

# Email
lib/email.ts                → lib/email/send.ts

# Database
lib/db-helpers.ts           → lib/database/helpers.ts
lib/prisma.ts               → lib/database/prisma.ts

# Utils
lib/universityUtils.ts      → lib/utils/university.ts
lib/search.ts               → lib/utils/search.ts
lib/mentions.ts             → lib/utils/mentions.ts
lib/middleware-helpers.ts   → lib/utils/middleware.ts
lib/api-response.ts         → lib/utils/api-response.ts
lib/utils.ts                → lib/utils/formatting.ts
```

### Tests → `tests/unit/`

```
lib/rate-limit.test.ts      → tests/unit/security/rate-limit.test.ts
lib/types.test.ts           → tests/unit/utils/types.test.ts
lib/utils.test.ts           → tests/unit/utils/utils.test.ts
lib/validation.test.ts      → tests/unit/validation/schemas.test.ts
```

---

## Import Path Changes

### Before (Old Imports - Broken)

```typescript
import { requireAdmin } from "@/lib/auth-checks";
import { prisma } from "@/lib/prisma";
import { signUp } from "@/app/auth/actions";
import { sanitizeHtmlContent } from "@/lib/sanitization";
import { cn } from "@/lib/utils";
import { proposeEdit } from "@/app/wiki/actions";
```

### After (New Imports - Need to Update)

```typescript
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/database/prisma";
import { signUp } from "@/actions/auth.actions";
import { sanitizeHtmlContent } from "@/lib/security/sanitization";
import { cn } from "@/lib/utils/formatting";
import { proposeEdit } from "@/actions/wiki.actions";
```

---

## What Stayed the Same

- **All page routes** (`app/*/page.tsx`) - No route changes
- **All API routes** (`app/api/*/route.ts`) - No route changes
- **UI components** (`components/ui/`) - No changes
- **Editor components** (`components/editor/`) - No changes
- **Existing organized modules:**
  - `lib/moderation/`
  - `lib/gdpr/`
  - `lib/queues/`
  - `components/admin/` (BackupList, BackupStats, etc.)
  - `components/wiki/` (ActivityTimeline, TextDiffViewer)

---

## Next Steps (TODO)

1. ✅ Files moved to new structure
2. ✅ **Update imports in 85+ files** (COMPLETE)
3. ✅ Run `npm run type-check` to verify
4. ✅ Run `npm run build` to test compilation
5. ✅ Test critical user flows
6. ✅ Clear Next.js cache
7. ✅ Rename middleware.ts to proxy.ts

---

## Benefits

- ✅ Centralized Server Actions in `/actions`
- ✅ Feature components organized by domain
- ✅ Shared components clearly separated
- ✅ Lib utilities modularized by purpose
- ✅ Tests organized by category
- ✅ Follows CODE_STANDARDS.md conventions
- ✅ Easier to navigate and maintain

---

## Rollback Instructions

If needed, revert with:

```bash
git checkout HEAD -- .
```

Or manually reverse moves using the mappings above.
