# Cookie Consent - Known Bugs

**Last Updated:** 2024-12-19

## Known Bugs

None currently known.

## Fixed Bugs

### [2024-12-19] Missing version field in ConsentState

**Description:** AccountSettings component was initializing consent state without the required `version` field, causing TypeScript build error.

**Root Cause:** ConsentState type requires `version: number` but initial state only had `analytics` and `error` fields.

**Fix Applied:** Added `version: 1` to consent state initialization:
```typescript
const [cookieConsent, setCookieConsent] = useState({ 
  analytics: false, 
  error: false, 
  version: 1  // Added
})
```

**File:** `components/settings/AccountSettings.tsx`

---

## Reporting Bugs

Use the [bug report template](../../../.github/ISSUE_TEMPLATE/bug_report.md) to report cookie consent issues.

Include:
- Steps to reproduce
- Expected vs actual behavior
- Browser and device info
- Console errors (if any)
- Cookie value (check DevTools → Application → Cookies)
