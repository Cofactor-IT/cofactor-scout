# Import Fix Checklist

## 🤖 Automated Fix (Recommended)

Run the PowerShell script from project root:
```powershell
.\fix-imports.ps1
```

This will automatically update all imports across the codebase.

---

## 📝 Manual Fix (If Needed)

Use VS Code's "Find and Replace in Files" (Ctrl+Shift+H) with regex enabled.

### Round 1: Server Actions (14 patterns)

| Find (Regex) | Replace With |
|--------------|--------------|
| `from ['"]@/app/auth/actions['"]` | `from '@/actions/auth.actions'` |
| `from ['"]@/app/admin/actions['"]` | `from '@/actions/admin.actions'` |
| `from ['"]@/app/admin/settings/actions['"]` | `from '@/actions/admin-settings.actions'` |
| `from ['"]@/app/admin/universities/actions['"]` | `from '@/actions/admin-universities.actions'` |
| `from ['"]@/app/members/actions['"]` | `from '@/actions/members.actions'` |
| `from ['"]@/app/profile/actions['"]` | `from '@/actions/profile.actions'` |
| `from ['"]@/app/profile/settings-actions['"]` | `from '@/actions/profile-settings.actions'` |
| `from ['"]@/app/profile/connect/actions['"]` | `from '@/actions/social-connect.actions'` |
| `from ['"]@/app/actions/social['"]` | `from '@/actions/social.actions'` |
| `from ['"]@/app/wiki/actions['"]` | `from '@/actions/wiki.actions'` |
| `from ['"]@/app/wiki/activity-actions['"]` | `from '@/actions/wiki-activity.actions'` |
| `from ['"]@/app/wiki/history-actions['"]` | `from '@/actions/wiki-history.actions'` |
| `from ['"]@/app/wiki/people-actions['"]` | `from '@/actions/wiki-people.actions'` |
| `from ['"]@/app/wiki/structure-actions['"]` | `from '@/actions/wiki-structure.actions'` |

### Round 2: Auth Module (3 patterns)

| Find (Regex) | Replace With |
|--------------|--------------|
| `from ['"]@/lib/auth-checks['"]` | `from '@/lib/auth/permissions'` |
| `from ['"]@/lib/auth-config['"]` | `from '@/lib/auth/config'` |
| `from ['"]@/lib/auth['"]` | `from '@/lib/auth/session'` |

### Round 3: Security Module (5 patterns)

| Find (Regex) | Replace With |
|--------------|--------------|
| `from ['"]@/lib/rate-limit-edge['"]` | `from '@/lib/security/rate-limit-edge'` |
| `from ['"]@/lib/rate-limit-redis['"]` | `from '@/lib/security/rate-limit-redis'` |
| `from ['"]@/lib/rate-limit['"]` | `from '@/lib/security/rate-limit'` |
| `from ['"]@/lib/sanitization['"]` | `from '@/lib/security/sanitization'` |
| `from ['"]@/lib/csrf['"]` | `from '@/lib/security/csrf'` |

### Round 4: Database Module (2 patterns)

| Find (Regex) | Replace With |
|--------------|--------------|
| `from ['"]@/lib/prisma['"]` | `from '@/lib/database/prisma'` |
| `from ['"]@/lib/db-helpers['"]` | `from '@/lib/database/helpers'` |

### Round 5: Utils Module (6 patterns - ORDER MATTERS!)

| Find (Regex) | Replace With |
|--------------|--------------|
| `from ['"]@/lib/universityUtils['"]` | `from '@/lib/utils/university'` |
| `from ['"]@/lib/middleware-helpers['"]` | `from '@/lib/utils/middleware'` |
| `from ['"]@/lib/api-response['"]` | `from '@/lib/utils/api-response'` |
| `from ['"]@/lib/search['"]` | `from '@/lib/utils/search'` |
| `from ['"]@/lib/mentions['"]` | `from '@/lib/utils/mentions'` |
| `from ['"]@/lib/utils['"]` | `from '@/lib/utils/formatting'` |

### Round 6: Email & Validation (2 patterns)

| Find (Regex) | Replace With |
|--------------|--------------|
| `from ['"]@/lib/email['"]` | `from '@/lib/email/send'` |
| `from ['"]@/lib/validation['"]` | `from '@/lib/validation/schemas'` |

### Round 7: Components (5 patterns)

| Find (Regex) | Replace With |
|--------------|--------------|
| `from ['"]@/components/navbar['"]` | `from '@/components/shared/Navbar'` |
| `from ['"]@/components/SignOutButton['"]` | `from '@/components/shared/SignOutButton'` |
| `from ['"]@/components/error-boundary['"]` | `from '@/components/shared/ErrorBoundary'` |
| `from ['"]@/components/AnalyticsProvider['"]` | `from '@/components/shared/AnalyticsProvider'` |
| `from ['"]@/components/SearchBar['"]` | `from '@/components/features/search/SearchBar'` |

---

## ✅ Verification Steps

After running fixes:

1. **Type Check**
   ```bash
   npm run type-check
   ```

2. **Build Test**
   ```bash
   npm run build
   ```

3. **Dev Server**
   ```bash
   npm run dev
   ```

4. **Manual Spot Checks**
   - Open `/auth/signin` - Should load
   - Open `/admin/dashboard` - Should load (as admin)
   - Open `/wiki` - Should load
   - Open `/profile` - Should load

---

## 🔍 Common Issues

### Issue: "Cannot find module '@/lib/utils'"
**Fix:** Should be `@/lib/utils/formatting`

### Issue: "Cannot find module '@/app/auth/actions'"
**Fix:** Should be `@/actions/auth.actions`

### Issue: Relative imports in moved files
**Example:** `./actions` in a page file
**Fix:** Update to `@/actions/[name].actions`

---

## 📊 Expected Results

- **~150+ files** will have imports updated
- **0 TypeScript errors** after fixes
- **Successful build** with no import errors
- **All routes** still work (no route changes were made)
