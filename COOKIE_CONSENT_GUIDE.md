# Cookie Consent - Quick Reference

**For:** Developers  
**Last Updated:** 2024-12-19

---

## File Structure

```
components/cookie-consent/
├── types.ts          # ConsentState type definition
├── constants.ts      # CONSENT_COOKIE_NAME, CONSENT_COOKIE_MAX_AGE, CONSENT_VERSION
├── utils.ts          # readConsentCookie(), writeConsentCookie(), recordConsentOnBackend()
├── Banner.tsx        # First-visit banner component
├── Modal.tsx         # Preference customization modal
└── Trigger.tsx       # Footer "Cookie Settings" button

app/api/consent/
└── route.ts          # POST /api/consent - logs consent to database
```

---

## Quick Usage

### Add Banner to Layout

```tsx
import { CookieBanner } from '@/components/cookie-consent/Banner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
```

### Add Trigger to Footer

```tsx
import { CookieConsentTrigger } from '@/components/cookie-consent/Trigger'

export function Footer() {
  return (
    <footer>
      <CookieConsentTrigger />
    </footer>
  )
}
```

### Add to Settings Page

```tsx
import { CookieModal } from '@/components/cookie-consent/Modal'
import { ConsentState } from '@/components/cookie-consent/types'

const [showModal, setShowModal] = useState(false)
const [consent, setConsent] = useState<ConsentState>({ 
  analytics: false, 
  error: false, 
  version: 1 
})

<button onClick={() => setShowModal(true)}>
  Manage Cookie Preferences
</button>

<CookieModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSave={(state) => {
    setConsent(state)
    setShowModal(false)
  }}
  initialState={consent}
/>
```

---

## API Reference

### Types

```typescript
// types.ts
export type ConsentState = {
  analytics: boolean  // Vercel Analytics
  error: boolean      // Sentry error monitoring
  version: number     // Schema version (currently 1)
}
```

### Constants

```typescript
// constants.ts
export const CONSENT_COOKIE_NAME = 'cf_consent'
export const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 182  // 182 days
export const CONSENT_VERSION = 1
```

### Utilities

```typescript
// utils.ts

// Read consent from browser cookie
readConsentCookie(): ConsentState | null

// Write consent to browser cookie
writeConsentCookie(consent: ConsentState): void

// Log consent to backend (fire-and-forget)
recordConsentOnBackend(consent: ConsentState): void
```

### Components

```typescript
// Banner.tsx
<CookieBanner />

// Modal.tsx
<CookieModal
  isOpen={boolean}
  onClose={() => void}
  onSave={(consent: ConsentState) => void}
  initialState={ConsentState}
/>

// Trigger.tsx
<CookieConsentTrigger />
```

---

## Database

### ConsentRecord Model

```prisma
model ConsentRecord {
  id        String   @id @default(cuid())
  userId    String?  // Null for anonymous users
  analytics Boolean
  error     Boolean
  userAgent String?
  ipAddress String?
  createdAt DateTime @default(now())

  @@index([userId])
}
```

### Query Examples

```typescript
// Get all consent records for a user
const records = await prisma.consentRecord.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: 'desc' }
})

// Get latest consent for a user
const latest = await prisma.consentRecord.findFirst({
  where: { userId: user.id },
  orderBy: { createdAt: 'desc' }
})

// Count consent events
const count = await prisma.consentRecord.count({
  where: { analytics: true }
})
```

---

## Testing

### Check if Consent Exists

```typescript
import { readConsentCookie } from '@/components/cookie-consent/utils'

const consent = readConsentCookie()
if (consent) {
  console.log('User has consented:', consent)
} else {
  console.log('No consent found')
}
```

### Manually Set Consent (for testing)

```typescript
import { writeConsentCookie } from '@/components/cookie-consent/utils'
import { CONSENT_VERSION } from '@/components/cookie-consent/constants'

// Accept all
writeConsentCookie({ 
  analytics: true, 
  error: true, 
  version: CONSENT_VERSION 
})

// Reject all
writeConsentCookie({ 
  analytics: false, 
  error: false, 
  version: CONSENT_VERSION 
})
```

### Clear Consent (for testing)

```javascript
// In browser console
document.cookie = 'cf_consent=; path=/; max-age=0'
```

---

## Common Tasks

### Add New Cookie Category

1. Update `ConsentState` type in `types.ts`:
```typescript
export type ConsentState = {
  analytics: boolean
  error: boolean
  marketing: boolean  // NEW
  version: number
}
```

2. Update `DEFAULT_CONSENT` in `Banner.tsx` and `Trigger.tsx`:
```typescript
const DEFAULT_CONSENT: ConsentState = {
  analytics: false,
  error: false,
  marketing: false,  // NEW
  version: CONSENT_VERSION
}
```

3. Add toggle to `Modal.tsx`:
```tsx
<div className="space-y-2 border border-[#E5E7EB] p-4 rounded-md">
  <div className="flex justify-between items-start">
    <h4>Marketing Cookies</h4>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={preferences.marketing}
        onChange={(e) => setPreferences(prev => ({ 
          ...prev, 
          marketing: e.target.checked 
        }))}
      />
      {/* Toggle UI */}
    </label>
  </div>
  <p className="body text-sm text-[#6B7280]">
    Description of marketing cookies
  </p>
</div>
```

4. Update database schema:
```prisma
model ConsentRecord {
  // ... existing fields
  marketing Boolean  // NEW
}
```

5. Run migration:
```bash
npx prisma generate
npx prisma db push
```

### Change Cookie Expiration

Update `CONSENT_COOKIE_MAX_AGE` in `constants.ts`:
```typescript
// 1 year instead of 182 days
export const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365
```

### Increment Schema Version

When making breaking changes to `ConsentState`:

1. Update `CONSENT_VERSION` in `constants.ts`:
```typescript
export const CONSENT_VERSION = 2  // Was 1
```

2. Add migration logic to handle old versions:
```typescript
const consent = readConsentCookie()
if (consent && consent.version < CONSENT_VERSION) {
  // Show banner again to get new consent
  setIsVisible(true)
}
```

---

## Troubleshooting

### Banner Not Showing

```typescript
// Check if cookie exists
const consent = readConsentCookie()
console.log('Consent:', consent)

// Clear cookie to test
document.cookie = 'cf_consent=; path=/; max-age=0'
```

### Preferences Not Saving

```typescript
// Check if cookie is being written
writeConsentCookie({ analytics: true, error: true, version: 1 })
console.log('Cookie after write:', readConsentCookie())

// Check browser console for errors
// Check Network tab for /api/consent POST request
```

### Modal Not Opening

```typescript
// Verify state is declared
const [showModal, setShowModal] = useState(false)

// Check for JavaScript errors in console
// Verify Modal component is imported
```

---

## Best Practices

### DO
- ✅ Use shared utilities from `utils.ts`
- ✅ Import types from `types.ts`
- ✅ Import constants from `constants.ts`
- ✅ Handle consent changes with page reload
- ✅ Log consent to backend for compliance
- ✅ Show banner only when no consent exists

### DON'T
- ❌ Duplicate cookie read/write logic
- ❌ Hardcode cookie name or expiration
- ❌ Skip backend logging
- ❌ Pre-check consent toggles
- ❌ Hide essential cookies toggle
- ❌ Forget to increment version on breaking changes

---

## Folder Naming

**Why `cookie-consent` not `cookie-banner`?**

The folder contains the entire consent system:
- Banner (first visit)
- Modal (customization)
- Trigger (settings button)
- API endpoint (logging)
- Shared utilities and types

"Cookie consent" accurately describes the full scope, while "cookie banner" would only describe one component.

---

## Related Documentation

- Main README: [README.md](../README.md) - See "Cookie Consent & Privacy" section
- Recent Changes: [RECENT_CHANGES.md](../RECENT_CHANGES.md)
- Code Standards: [docs/pm-notes/CODE_STANDARDS.md](../docs/pm-notes/CODE_STANDARDS.md)

---

**Questions?** Check the main README or contact the development team.
