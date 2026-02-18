# Schema Migration Cleanup Report

## Migration Summary
Migrated from **University Wiki Platform** to **Cofactor Scout** (Research Lead Submission Platform)

## Schema Changes

### Removed Models
- ❌ `WikiRevision` - Wiki edit tracking
- ❌ `UniPage` - Wiki pages
- ❌ `Institute` - University institutes
- ❌ `Lab` - Research labs
- ❌ `Person` - Person profiles
- ❌ `University` - University management
- ❌ `SecondaryUniversityRequest` - Secondary university requests
- ❌ `Referral` - Referral tracking
- ❌ `SocialAccount` - Social media linking

### Removed User Fields
- ❌ `name` → Use `fullName` instead
- ❌ `universityId` → Replaced with `university` (string)
- ❌ `secondaryUniversityId` → Removed
- ❌ `isTrusted` → Removed
- ❌ `websiteUrl` → Use `personalWebsite` instead
- ❌ `powerScore` → Removed
- ❌ `referralCount` → Removed

### New Models
- ✅ `ResearchSubmission` - Research lead submissions (3-step form)
- ✅ `SubmissionComment` - Comments on submissions
- ✅ `PasswordReset` - Password reset tokens (already existed)
- ✅ `SystemSettings` - Global settings (already existed)

### New User Fields
- ✅ `bio` - User biography
- ✅ `personalWebsite` - Personal website URL
- ✅ `additionalLinks` - JSON field for extra links
- ✅ `profilePictureUrl` - Profile picture URL
- ✅ `twoFactorEnabled` - 2FA toggle
- ✅ `twoFactorSecret` - 2FA secret
- ✅ `totalSubmissions` - Submission count
- ✅ `pendingSubmissions` - Pending submission count
- ✅ `approvedSubmissions` - Approved submission count

## Files Requiring Updates

### Action Files (All need major rewrites)
1. ❌ `actions/admin.actions.ts` - References WikiRevision, UniPage, Institute, Lab, SecondaryUniversityRequest
2. ❌ `actions/members.actions.ts` - References `isTrusted` field
3. ❌ `actions/profile.actions.ts` - References University, SecondaryUniversityRequest
4. ❌ `actions/profile-settings.actions.ts` - References `name`, `universityId`, `secondaryUniversityId`, `websiteUrl`
5. ❌ `actions/wiki-people.actions.ts` - References Person, Institute, Lab models
6. ❌ `actions/admin-universities.actions.ts` - References University model
7. ✅ `actions/auth.actions.ts` - Mostly compliant (uses `fullName`)
8. ✅ `actions/admin-settings.actions.ts` - Compliant (uses SystemSettings)

### App Pages (Need review)
- `app/admin/*` - All admin pages
- `app/wiki/*` - All wiki pages (should be removed or repurposed)
- `app/members/*` - Member management
- `app/profile/*` - Profile pages

### Components (Need review)
- `components/admin/*` - Admin components
- `components/features/wiki/*` - Wiki components (should be removed)
- `components/features/profile/*` - Profile components

### API Routes (Need review)
- `app/api/mentions/*` - Mentions API (wiki-related)
- `app/api/search/*` - Search API (wiki-related)
- `app/api/universities/*` - University API

### Library Files (Need review)
- `lib/moderation/*` - Moderation system (references old models)
- `lib/utils/mentions.ts` - Mentions utility (wiki-related)
- `lib/validation/schemas.ts` - Validation schemas

## Recommended Actions

### Immediate (Critical)
1. **Delete or stub out all wiki-related action files**
2. **Update instrumentation.ts** to use correct User fields
3. **Update auth config** to use correct User fields
4. **Remove all wiki-related pages** from `app/wiki/*`
5. **Remove all wiki-related components** from `components/features/wiki/*`

### Short-term (High Priority)
1. **Create new submission action files** for ResearchSubmission CRUD
2. **Update profile pages** to use new User fields
3. **Update admin dashboard** to show submission stats instead of wiki stats
4. **Remove university management** features

### Long-term (Low Priority)
1. **Clean up unused API routes**
2. **Remove unused components**
3. **Update documentation**

## Migration Status
- ✅ Schema migrated successfully
- ❌ Action files not updated
- ❌ Pages not updated
- ❌ Components not updated
- ❌ API routes not updated
