# Cookie Consent - Technical Documentation

**Audience:** Developers  
**Last Updated:** 2024-12-19

## Architecture

### File Structure

```
components/cookie-consent/
├── types.ts          # ConsentState type definition
├── constants.ts      # Cookie name, expiration, version
├── utils.ts          # Read/write cookie, backend logging
├── Banner.tsx        # First-visit banner component
├── Modal.tsx         # Preference customization modal
└── Trigger.tsx       # Footer "Cookie Settings" button

app/api/consent/
└── route.ts          # POST endpoint for consent logging
```

### Database Models

```prisma
model ConsentRecord {
  id        String   @id @default(cuid())
  userId    String?  // Null for anonymous users
  analytics Boolean
  error     Boolean
  userAgent String?
  ipAddress String?  // For compliance audit trail
  createdAt DateTime @default(now())

  @@index([userId])
}
```

## Components

### Banner.tsx

**Purpose:** First-visit banner with Accept All / Reject All / Customize

**Flow:**
1. Check if consent cookie exists
2. If not, show banner
3. User clicks action button
4. Save consent to cookie
5. Log to backend
6. Reload page

**Key Functions:**
```typescript
const handleSave = async (consent: ConsentState) => {
  writeConsentCookie(consent)
  setIsVisible(false)
  recordConsentOnBackend(consent)
  window.location.reload()
}
```

### Modal.tsx

**Purpose:** Granular preference customization

**Features:**
- Toggle for analytics cookies
- Toggle for error monitoring
- Strictly necessary always on
- Accept All / Reject All quick actions
- Save Preferences button

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (consent: ConsentState) => void
  initialState: ConsentState
}
```

### Trigger.tsx

**Purpose:** Footer button to reopen preferences

**Flow:**
1. Read current consent from cookie
2. User clicks "Cookie Settings"
3. Open modal with current preferences
4. User updates and saves
5. Reload page

## Shared Utilities

### types.ts

```typescript
export type ConsentState = {
  analytics: boolean  // Vercel Analytics
  error: boolean      // Sentry error monitoring
  version: number     // Schema version (currently 1)
}
```

### constants.ts

```typescript
export const CONSENT_COOKIE_NAME = 'cf_consent'
export const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 182  // 182 days
export const CONSENT_VERSION = 1
```

### utils.ts

**readConsentCookie()**
```typescript
export function readConsentCookie(): ConsentState | null {
  const match = document.cookie.match(new RegExp(`(^| )${CONSENT_COOKIE_NAME}=([^;]+)`))
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match[2])) as ConsentState
  } catch {
    return null
  }
}
```

**writeConsentCookie()**
```typescript
export function writeConsentCookie(consent: ConsentState): void {
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; samesite=strict`
}
```

**recordConsentOnBackend()**
```typescript
export function recordConsentOnBackend(consent: ConsentState): void {
  fetch('/api/consent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(consent)
  }).catch(() => { })  // Fire-and-forget
}
```

## API Endpoint

### POST /api/consent

**File:** `app/api/consent/route.ts`

**Request Body:**
```json
{
  "analytics": true,
  "error": false,
  "version": 1
}
```

**Response:**
```json
{
  "success": true
}
```

**Implementation:**
```typescript
export async function POST(request: Request) {
  const body = await request.json()
  const session = await getServerSession(authOptions)
  
  await prisma.consentRecord.create({
    data: {
      userId: session?.user?.id || null,
      analytics: body.analytics,
      error: body.error,
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for')
    }
  })
  
  return NextResponse.json({ success: true })
}
```

## Integration Points

### Root Layout

```tsx
// app/layout.tsx
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

### Footer

```tsx
// components/ui/footer.tsx
import { CookieConsentTrigger } from '@/components/cookie-consent/Trigger'

export function Footer() {
  return (
    <footer>
      <CookieConsentTrigger />
    </footer>
  )
}
```

### Settings Page

```tsx
// components/settings/AccountSettings.tsx
import { CookieModal } from '@/components/cookie-consent/Modal'

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

## Security

### Cookie Attributes

- **SameSite=Strict:** CSRF protection
- **Path=/:** Site-wide access
- **Max-Age:** 182 days (6 months)
- **No HttpOnly:** Needs to be readable by JavaScript
- **No Secure flag:** Works on localhost (added in production)

### Backend Logging

- User ID (if authenticated)
- Timestamp
- User agent
- IP address (for compliance)
- Consent choices

## Testing

### Manual Tests

```typescript
// Check if consent exists
import { readConsentCookie } from '@/components/cookie-consent/utils'
const consent = readConsentCookie()
console.log('Consent:', consent)

// Clear consent (for testing)
document.cookie = 'cf_consent=; path=/; max-age=0'

// Set consent manually
import { writeConsentCookie } from '@/components/cookie-consent/utils'
writeConsentCookie({ analytics: true, error: true, version: 1 })
```

### Database Queries

```typescript
// Get all consent records for a user
const records = await prisma.consentRecord.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: 'desc' }
})

// Get latest consent
const latest = await prisma.consentRecord.findFirst({
  where: { userId: user.id },
  orderBy: { createdAt: 'desc' }
})

// Count consent events
const count = await prisma.consentRecord.count({
  where: { analytics: true }
})
```

## Common Tasks

### Add New Cookie Category

1. Update `ConsentState` in `types.ts`
2. Update `DEFAULT_CONSENT` in `Banner.tsx` and `Trigger.tsx`
3. Add toggle to `Modal.tsx`
4. Update database schema
5. Run `npx prisma generate && npx prisma db push`

### Change Cookie Expiration

Update `CONSENT_COOKIE_MAX_AGE` in `constants.ts`

### Increment Schema Version

Update `CONSENT_VERSION` in `constants.ts` when making breaking changes

## Environment Variables

None required. Uses existing:
- `NEXT_PUBLIC_SENTRY_DSN` (for error monitoring)
- Vercel Analytics (automatic)

## Performance

- **Bundle Size:** ~8KB (minified + gzipped)
- **Initial Load:** Banner renders immediately
- **Modal Load:** Lazy-loaded on first open
- **Database Impact:** Single INSERT per consent event
