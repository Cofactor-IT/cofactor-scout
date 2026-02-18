# Schema Compliance Fix Summary

## ✅ Files Fixed

### Core Files
1. **instrumentation.ts**
   - ✅ Changed `name` → `fullName`
   - ✅ Added `firstName` and `lastName` fields
   - ✅ Removed empty fields

2. **lib/auth/config.ts**
   - ✅ Already compliant (uses `fullName`)

### Action Files

3. **actions/auth.actions.ts**
   - ✅ Already compliant (uses `fullName`, `firstName`, `lastName`)

4. **actions/admin-settings.actions.ts**
   - ✅ Already compliant (uses `SystemSettings`)

5. **actions/profile-settings.actions.ts**
   - ✅ Changed `name` → `fullName`
   - ✅ Added `firstName` and `lastName` splitting
   - ✅ Changed `websiteUrl` → `personalWebsite`
   - ✅ Removed university management functions
   - ✅ Updated all User field references

6. **actions/admin.actions.ts**
   - ✅ Stubbed out (all functions throw errors)
   - ⚠️ References removed models: WikiRevision, UniPage, Institute, Lab, SecondaryUniversityRequest

7. **actions/members.actions.ts**
   - ✅ Stubbed out (all functions throw errors)
   - ⚠️ References removed field: `isTrusted`

8. **actions/profile.actions.ts**
   - ✅ Stubbed out (all functions throw errors)
   - ⚠️ References removed models: University, SecondaryUniversityRequest

9. **actions/wiki-people.actions.ts**
   - ✅ Stubbed out (all functions throw errors)
   - ⚠️ References removed models: Person, Institute, Lab

10. **actions/admin-universities.actions.ts**
    - ✅ Stubbed out (all functions throw errors)
    - ⚠️ References removed model: University

## ⚠️ Files That Still Need Review

### App Pages (High Priority)
- `app/admin/dashboard/page.tsx` - Shows wiki stats, needs to show submission stats
- `app/admin/universities/page.tsx` - University management UI (should be removed)
- `app/admin/revision/[id]/page.tsx` - Wiki revision approval (should be removed)
- `app/wiki/**/*` - All wiki pages (should be removed or repurposed)
- `app/members/page.tsx` - Member management (may reference `isTrusted`)
- `app/profile/page.tsx` - Profile display (may reference old fields)
- `app/profile/settings/page.tsx` - Profile settings (may reference old fields)

### Components (High Priority)
- `components/admin/*` - Admin components (may reference old models)
- `components/features/wiki/*` - Wiki components (should be removed)
- `components/features/profile/*` - Profile components (may reference old fields)
- `components/features/members/*` - Member components (may reference `isTrusted`)

### API Routes (Medium Priority)
- `app/api/mentions/route.ts` - Mentions API (wiki-related)
- `app/api/search/route.ts` - Search API (wiki-related)
- `app/api/universities/lookup/route.ts` - University lookup (may need update)
- `app/api/members/*` - Member management APIs
- `app/api/moderation/*` - Moderation APIs (may reference old models)

### Library Files (Medium Priority)
- `lib/moderation/reputation.ts` - Reputation system (may reference old models)
- `lib/moderation/moderator.ts` - Moderation logic (may reference old models)
- `lib/utils/mentions.ts` - Mentions utility (wiki-related)
- `lib/utils/university.ts` - University utilities (may need update)
- `lib/validation/schemas.ts` - Validation schemas (may have old schemas)
- `lib/user-limits.ts` - User limits (may reference `isTrusted`)
- `lib/settings.ts` - Settings (may reference old fields)

### GDPR/Export (Low Priority)
- `lib/gdpr/data-mapper.ts` - Data export (may reference old models)
- `lib/gdpr/export.ts` - Export logic (may reference old models)
- `app/api/gdpr/*` - GDPR APIs (may reference old models)
- `app/api/exports/route.ts` - Export API (may reference old models)

## 🚨 Critical Next Steps

1. **Create New Submission Actions**
   - Create `actions/submissions.actions.ts` for ResearchSubmission CRUD
   - Create `actions/submission-comments.actions.ts` for comments

2. **Update Admin Dashboard**
   - Replace wiki stats with submission stats
   - Remove university management
   - Remove wiki revision approval

3. **Update Profile Pages**
   - Use `fullName`, `firstName`, `lastName` instead of `name`
   - Use `personalWebsite` instead of `websiteUrl`
   - Remove university management UI
   - Add new profile fields (bio, profilePictureUrl, additionalLinks)

4. **Remove Wiki Pages**
   - Delete `app/wiki/**/*` or repurpose for submissions
   - Delete wiki-related components
   - Delete wiki-related API routes

5. **Update Member Management**
   - Remove `isTrusted` references
   - Update to use new User fields

## 📊 Compliance Status

- ✅ **Core Auth**: 100% compliant
- ✅ **Action Files**: Stubbed out (need rewrites)
- ⚠️ **Pages**: 0% compliant (need review)
- ⚠️ **Components**: 0% compliant (need review)
- ⚠️ **API Routes**: 0% compliant (need review)
- ⚠️ **Library Files**: 50% compliant (some need review)

## 🎯 Recommended Approach

1. **Phase 1: Remove Dead Code** (1-2 hours)
   - Delete all wiki pages
   - Delete all wiki components
   - Delete wiki-related API routes

2. **Phase 2: Build New Features** (4-6 hours)
   - Create submission management actions
   - Create submission pages
   - Create submission components

3. **Phase 3: Update Existing Features** (2-3 hours)
   - Update profile pages
   - Update admin dashboard
   - Update member management

4. **Phase 4: Clean Up** (1 hour)
   - Remove unused imports
   - Update documentation
   - Test all features

**Total Estimated Time**: 8-12 hours
