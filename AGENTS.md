# AGENTS.md

**AI Coding Assistant Guide for Cofactor Scout**

This file is automatically read by AI coding assistants (Cursor, Claude Code) at the start of every session. It ensures consistent code standards without manual explanation.

---

## 1. Project Overview

**Cofactor Scout** connects university research with venture capital investors through a two-tier community system. Contributors and Scouts submit research leads, which are reviewed by the Cofactor team and matched with investors. Users earn commission on successful matches.

**Tech Stack:**
- Next.js 16.1.6 (App Router)
- TypeScript 5.x
- PostgreSQL 15+ with Prisma 5.22.0
- NextAuth.js 4.24.13
- Tailwind CSS 3.4.17
- Zod 3.22.4
- Nodemailer 7.0.12
- Vitest 4.0.18
- Sentry 10.38.0

**Production:** Vercel + Supabase PostgreSQL

**User Roles:**
- **CONTRIBUTOR** (default): Submit research immediately, standard commission, gray badge
- **SCOUT** (verified): Apply → Admin approves → Higher commission + priority review + green badge
- **ADMIN** (system): Full platform access, can approve scout applications, manage users

**Production URL:** https://scout.cofactor.world

---

## 2. File Structure Rules

### Where Things Live

```
cofactor-scout/
├── actions/              # Server Actions (*.actions.ts)
├── app/                  # Next.js App Router pages
├── components/
│   ├── ui/              # Base UI components (Button, Card, Input)
│   ├── submission/      # Submission form components
│   └── settings/        # Settings page components
├── lib/
│   ├── auth/            # Authentication utilities
│   ├── database/
│   │   ├── prisma.ts    # Prisma client
│   │   └── queries/     # Database query functions
│   ├── email/           # Email sending and templates
│   ├── security/        # Sanitization, rate limiting
│   ├── utils/           # General utilities
│   └── validation/      # Zod schemas
├── prisma/
│   └── schema.prisma    # Database schema
└── types/               # TypeScript type definitions
```

### Rules for New Files

| What You're Adding | Where It Goes | Naming Convention |
|-------------------|---------------|-------------------|
| Server Action | `actions/` | `feature.actions.ts` |
| Database Query | `lib/database/queries/` | `feature.ts` |
| Zod Schema | `lib/validation/schemas.ts` | Add to existing file |
| UI Component | `components/ui/` | `PascalCase.tsx` |
| Feature Component | `components/feature/` | `PascalCase.tsx` |
| Utility Function | `lib/utils/` | `camelCase.ts` |
| Type Definition | `types/` | `PascalCase.ts` |
| Page | `app/path/` | `page.tsx` |

---

## 3. Architecture Rules

### 3-Layer Pattern (ALWAYS FOLLOW)

```
Components → Server Actions → Query Functions → Database
```

**Real Example from Codebase:**

```typescript
// ❌ NEVER: Prisma in component
export default function Dashboard() {
  const submissions = await prisma.researchSubmission.findMany() // WRONG!
}

// ❌ NEVER: Prisma in Server Action
export async function saveDraft(data: any) {
  const submission = await prisma.researchSubmission.create({ data }) // WRONG!
}

// ✅ CORRECT: 3-layer separation
// Layer 1: Component (app/dashboard/page.tsx)
export default async function Dashboard() {
  const user = await requireAuth()
  const submissions = await findSubmissionsByUserId(user.id) // Call query function
}

// Layer 2: Server Action (actions/submission.actions.ts)
export async function saveDraft(data: any) {
  const session = await requireAuth() // ALWAYS FIRST
  const validated = draftSchema.parse(data) // ALWAYS SECOND
  return await createDraftSubmission(session.id, validated) // Call query function
}

// Layer 3: Query Function (lib/database/queries/submissions.ts)
export async function createDraftSubmission(userId: string, data: DraftData) {
  return await prisma.researchSubmission.create({
    data: { userId, isDraft: true, ...data }
  })
}
```

### Critical Rules

1. **requireAuth() is ALWAYS the first line in every Server Action**
2. **Zod validation is ALWAYS second (before any database call)**
3. **userId ALWAYS comes from session, NEVER from client input**
4. **Check resource ownership before read/update/delete**
5. **Never write Prisma queries outside lib/database/queries/**

---

## 4. Code Standards

### Functions Must Be Under 20 Lines

**❌ BAD:**
```typescript
async function submitResearch(data: any) {
  const session = await requireAuth()
  const validated = schema.parse(data)
  const existing = await prisma.researchSubmission.findFirst({ where: { id: data.id } })
  if (!existing) return { error: 'Not found' }
  const submission = await prisma.researchSubmission.update({ where: { id: data.id }, data: { isDraft: false } })
  await prisma.user.update({ where: { id: session.id }, data: { totalSubmissions: { increment: 1 } } })
  await sendEmail(session.email, 'Submitted')
  revalidatePath('/dashboard')
  return { success: true }
}
```

**✅ GOOD:**
```typescript
async function submitResearch(data: any) {
  const session = await requireAuth()
  const validated = schema.parse(data)
  await verifyDraftOwnership(data.id, session.id)
  await markDraftAsSubmitted(data.id)
  await incrementUserSubmissions(session.id)
  await sendSubmissionConfirmation(session.email)
  revalidatePath('/dashboard')
  return { success: true }
}
```

### No `any` Types — Use `unknown` and Narrow

**❌ BAD:**
```typescript
function processData(data: any) {
  return data.value
}
```

**✅ GOOD:**
```typescript
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value
  }
  throw new Error('Invalid data structure')
}
```

### Max 3 Arguments — Use Object Params

**❌ BAD:**
```typescript
function createUser(email: string, password: string, name: string, role: Role, university: string) {
  // Too many arguments!
}
```

**✅ GOOD:**
```typescript
interface CreateUserParams {
  email: string
  password: string
  name: string
  role: Role
  university: string
}

function createUser(params: CreateUserParams) {
  // Single argument, named properties
}
```

### Command-Query Separation

**❌ BAD:**
```typescript
async function setAndReturnPublished(pageId: string): Promise<boolean> {
  await prisma.page.update({ where: { id: pageId }, data: { published: true } })
  return true // Both modifies AND returns
}
```

**✅ GOOD:**
```typescript
// Query: Answer a question
async function isPagePublished(pageId: string): Promise<boolean> {
  const page = await prisma.page.findUnique({ where: { id: pageId } })
  return page?.published ?? false
}

// Command: Do something
async function publishPage(pageId: string): Promise<void> {
  await prisma.page.update({ where: { id: pageId }, data: { published: true } })
}
```

### Single Responsibility

Every function does ONE thing:

```typescript
// ✅ Each function has one reason to change
async function approveScoutApplication(userId: string) {
  await promoteUserToScout(userId)
  await sendScoutApprovalEmail(userId)
  await notifyAdminOfApproval(userId)
}
```

---

## 5. Naming Conventions

### From Actual Codebase

**Files:**
- `auth.actions.ts` — Server Actions
- `submissions.ts` — Query functions
- `schemas.ts` — Zod schemas
- `Button.tsx` — UI components
- `page.tsx` — Next.js pages

**Functions:**
```typescript
// Server Actions (actions/)
export async function signUp(prevState, formData) { }
export async function saveDraft(data) { }
export async function submitResearch(data) { }

// Query Functions (lib/database/queries/)
export async function findSubmissionsByUserId(userId: string) { }
export async function createDraftSubmission(userId: string, data) { }

// Utilities (lib/)
export function generateSecureToken(): string { }
export function splitName(fullName: string) { }
export async function sendVerificationEmail(email, name, token) { }
```

**Constants:**
```typescript
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 15
const ACCOUNT_ENUMERATION_DELAY = 1000
```

**Types/Interfaces:**
```typescript
interface CreateUserParams { }
type SignUpInput = z.infer<typeof signUpSchema>
```

---

## 6. Design System

### Colors (Exact Hex Values from globals.css)

```css
--navy: #1B2A4A
--teal: #0D7377
--teal-dark: #0A5A5D
--cool-gray: #6B7280
--light-gray: #E5E7EB
--off-white: #FAFBFC
--white: #FFFFFF
--green: #2D7D46
--red: #DC2626
--amber: #F59E0B
--gold: #C9A84C
```

**Always use CSS variables, never hardcode:**
```tsx
// ❌ BAD
<div className="bg-[#1B2A4A]">

// ✅ GOOD
<div className="bg-[var(--navy)]">
```

### Typography Classes (from globals.css)

**ALWAYS use these classes, NEVER hardcode font sizes:**

```css
.h1 → Rethink Sans Bold 36px (md: 48px, lg: 60px)
.h2 → Rethink Sans Bold 28px (md: 36px, lg: 45px)
.h3 → Rethink Sans SemiBold 22px (md: 26px, lg: 30px)
.h4 → Rethink Sans SemiBold 18px (md: 20px, lg: 22.5px)
.body → Merriweather Regular 16px (lg: 20px)
.body-large → Merriweather Regular 18px (lg: 22.5px)
.body-bold → Merriweather Bold 16px (lg: 20px)
.caption → Rethink Sans Regular 14px (lg: 17.5px)
.button → Rethink Sans Medium 14px (md: 16px, lg: 20px)
.label → Rethink Sans Medium 14px (lg: 17.5px)
```

### Typography Pairing Rules

**h4 with body text:**
```tsx
// ✅ CORRECT: h4 paired with smaller body text
<h4>Card Title</h4>
<p className="body text-sm">Description text</p>

// ❌ WRONG: h4 with regular body (too large)
<h4>Card Title</h4>
<p className="body">Description text</p>
```

**Usage:**
```tsx
<h1>Welcome</h1>  // Uses .h1 automatically
<p className="body-large">Introduction text</p>
<h4>Section Title</h4>
<p className="body text-sm">Supporting text</p>6px
```

**Usage:**
```tsx
<h1 className="text-white">Title</h1>  // Uses .h1 automatically
<p className="body-large">Text</p>
```

### Border Radius Rules

- **4px** for all cards, inputs, containers, modals
- **9999px** (rounded-full) for all buttons, badges, avatars

```tsx
// ✅ CORRECT
<Card style={{ borderRadius: '4px' }}>
<Button className="rounded-full">
<div className="rounded-full">  // Badges

// ❌ WRONG
<Card className="rounded-lg">  // Don't use Tailwind radius
<Button style={{ borderRadius: '8px' }}>  // Wrong value
```

### Spacing System

**Page Padding:**
```tsx
className="px-4 md:px-8 lg:px-[120px]"
```

**Section Padding:**
```tsx
className="py-12 md:py-[80px]"
```

**Card Padding:**
```tsx
className="p-6 md:p-[48px]"
```

**Gap Between Elements:**
```tsx
className="gap-4 md:gap-6"  // Small gaps
className="gap-8 md:gap-12"  // Medium gaps
className="gap-12 md:gap-[60px]"  // Large gaps
```

### Shadow System

**Button Shadow:**
```tsx
className="shadow-[0px_2px_4px_rgba(13,115,119,0.2)]"
```

**Card Shadow:**
```tsx
className="shadow-sm"
```

---

## 7. Component Usage Rules

### Available Components (components/ui/)

**Button** — Primary and secondary variants
```tsx
<Button variant="primary">Submit</Button>
<Button variant="secondary">Cancel</Button>
```

**Card** — Container with border and background
```tsx
<Card className="p-6">Content</Card>
```

**FadeIn** — Scroll-triggered animation
```tsx
<FadeIn delay={0.15}>
  <Card>Animates when scrolled into view</Card>
</FadeIn>
```

**FadeInOnLoad** — Page load animation
```tsx
<FadeInOnLoad delay={0.3}>
  <h1>Animates on page load</h1>
</FadeInOnLoad>
```

**Input, Textarea, PasswordInput** — Form fields
```tsx
<Input id="email" type="email" />
<Textarea id="bio" rows={4} />
<PasswordInput id="password" />
```

**Other UI Components:**
- `auth-navbar.tsx` — Navbar for auth pages
- `navbar.tsx` — Main navbar
- `dashboard-navbar.tsx` — Dashboard navbar
- `user-dropdown.tsx` — User profile dropdown
- `checkbox.tsx` — Checkbox input
- `dropdown.tsx` — Dropdown menu
- `modal.tsx` — Modal dialog
- `progress-indicator.tsx` — Progress bar
- `promotion-banner.tsx` — Promotional banner
- `search-bar.tsx` — Search input
- `search-input.tsx` — Search field
- `table.tsx` — Data table
- `tabs.tsx` — Tab navigation

### Submission Components (components/submission/)

- `FormFooter.tsx` — Form navigation buttons
- `FormInput.tsx` — Form input wrapper
- `FormSelect.tsx` — Form select wrapper
- `FormTextarea.tsx` — Form textarea wrapper
- `ProgressStepper.tsx` — Multi-step form progress
- `ReviewCard.tsx` — Submission review display
- `Step1Form.tsx` — First step of submission form

### Settings Components (components/settings/)

- `AccountSettings.tsx` — Account settings form
- `ProfileSettings.tsx` — Profile settings form
- `SettingsTabs.tsx` — Settings tab navigation

### Other Components (components/)

- `CommentForm.tsx` — Comment submission form
- `CommentList.tsx` — List of comments
- `DraftsTable.tsx` — Table of draft submissions
- `SubmissionsTable.tsx` — Table of submissions
- `SupportWidget.tsx` — Support/help widget

**Rule: Never Recreate Existing Components**

Before creating a new component, check `components/ui/`, `components/submission/`, `components/settings/`, and `components/` first. Reuse what exists.

---

## 8. Commenting Requirements

### File-Level JSDoc (Every File)

```typescript
/**
 * submission.actions.ts
 * 
 * Server Actions for research submission management including drafts,
 * submission, retrieval, and deletion.
 * 
 * All actions verify user authentication and ownership before operations.
 * Submissions go through draft -> submitted workflow with email notifications.
 */
```

### Function JSDoc (Every Exported Function)

```typescript
/**
 * Saves or updates a research submission draft.
 * Validates for duplicate research topics before saving.
 * Cleans enum fields by converting empty strings to null.
 * 
 * @param data - Draft data including all submission fields
 * @param data.id - Draft ID for updates, 'new' for creation
 * @returns Success status and draft ID, or error message
 * @throws {Error} If user is not authenticated
 */
export async function saveDraft(data: any) {
  // Implementation
}
```

### Inline Comments (Only for Non-Obvious Logic)

```typescript
// ✅ GOOD: Explains WHY
// Email normalized to lowercase to prevent duplicate accounts
email: z.string().toLowerCase().trim()

// ✅ GOOD: Explains business rule
// Account locks after 5 failed attempts for 15 minutes
if (attempts >= MAX_LOGIN_ATTEMPTS) {
  updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
}

// ❌ BAD: States the obvious
// Increment the counter
counter++
```

### Section Dividers (Files Over 100 Lines)

```typescript
// ============================================
// CONSTANTS
// ============================================

// ============================================
// UTILITY FUNCTIONS
// ============================================

// ============================================
// EXPORTED SERVER ACTIONS
// ============================================
```

---

## 9. Security Rules (NO EXCEPTIONS)

### Every Server Action Must:

```typescript
export async function anyServerAction(data: any) {
  // 1. requireAuth() is ALWAYS first
  const session = await requireAuth()
  
  // 2. Zod validation before any database call
  const validated = schema.parse(data)
  
  // 3. userId from session, NEVER from client
  const userId = session.id // ✅ CORRECT
  const userId = data.userId // ❌ NEVER DO THIS
  
  // 4. Check resource ownership
  const resource = await findResourceById(validated.id)
  if (resource.userId !== session.id) {
    throw new Error('Unauthorized')
  }
  
  // 5. No raw user input touches database
  await updateResource(validated) // ✅ Validated
  await updateResource(data) // ❌ Raw input
}
```

### Account Lockout

```typescript
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 15

// After 5 failed attempts
if (attempts >= MAX_LOGIN_ATTEMPTS) {
  lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
}
```

### Rate Limiting

**Currently disabled in MVP** but infrastructure exists in:
- `lib/security/rate-limit.ts` — In-memory rate limiting
- `lib/security/rate-limit-redis.ts` — Redis-based rate limiting
- `lib/security/rate-limit-edge.ts` — Edge runtime rate limiting
- `proxy.ts` — Middleware with commented rate limit code

---

## 10. Database Rules

### Never Write Prisma Outside lib/database/queries/

**❌ WRONG:**
```typescript
// actions/submission.actions.ts
export async function saveDraft(data: any) {
  const submission = await prisma.researchSubmission.create({ data }) // NO!
}
```

**✅ CORRECT:**
```typescript
// actions/submission.actions.ts
export async function saveDraft(data: any) {
  const session = await requireAuth()
  const validated = schema.parse(data)
  return await createDraftSubmission(session.id, validated) // Call query function
}

// lib/database/queries/submissions.ts
export async function createDraftSubmission(userId: string, data: DraftData) {
  return await prisma.researchSubmission.create({
    data: { userId, isDraft: true, ...data }
  })
}
```

### Always Scope to userId

```typescript
// ✅ CORRECT: User can only see their own data
export async function findSubmissionsByUserId(userId: string) {
  return await prisma.researchSubmission.findMany({
    where: { userId, isDraft: false },
    orderBy: { submittedAt: 'desc' }
  })
}
```

### Always Use select to Limit Fields

```typescript
// ❌ BAD: Returns everything including password
const user = await prisma.user.findUnique({ where: { id } })

// ✅ GOOD: Only returns needed fields
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, email: true, fullName: true }
})
```

### Never Return password Field

```typescript
// ✅ CORRECT: Exclude password
select: { id: true, email: true, fullName: true }

// ❌ NEVER include password
select: { id: true, email: true, password: true }
```

### Use Transactions for Multi-Step Operations

```typescript
await prisma.$transaction([
  prisma.researchSubmission.update({
    where: { id: data.id },
    data: { isDraft: false, submittedAt: new Date() }
  }),
  prisma.user.update({
    where: { id: session.id },
    data: { totalSubmissions: { increment: 1 } }
  })
])
```

---

## 11. What NOT To Do

### Anti-Patterns

- ❌ No `any` types (use `unknown` and narrow)
- ❌ No functions over 20 lines (extract sub-functions)
- ❌ No Prisma in components or Server Actions
- ❌ No hardcoded colors (use CSS variables or Tailwind classes)
- ❌ No hardcoded font sizes (use typography classes)
- ❌ No inline Framer Motion (use FadeIn/FadeInOnLoad)
- ❌ No new API routes unless file upload or webhook
- ❌ No recreating existing components
- ❌ No speculative code for future features
- ❌ No `console.log` committed to main
- ❌ No commented-out code
- ❌ No magic numbers (use named constants)
- ❌ No userId from client input (always from session)

---

## 12. Before Starting Any Task

### Checklist for Every AI Session

1. ✅ Read this file completely
2. ✅ Check what already exists before creating anything
   - Search `components/ui/` for existing components
   - Search `components/submission/` for submission components
   - Search `components/settings/` for settings components
   - Search `actions/` for existing Server Actions
   - Search `lib/database/queries/` for existing queries
3. ✅ List files to be modified before touching anything
4. ✅ Reuse existing components, actions, queries
5. ✅ Only create what the current task actually needs
6. ✅ Follow all rules above without exception

### Example Workflow

**Task:** "Add ability to delete a submission"

**Before coding:**
1. Check if `deleteSubmission` action exists in `actions/submission.actions.ts` ✓
2. Check if delete query exists in `lib/database/queries/submissions.ts` ✗
3. Check if Button component exists in `components/ui/button.tsx` ✓

**Plan:**
1. Add `deleteSubmission` Server Action to `actions/submission.actions.ts`
2. Add `deleteSubmissionById` query to `lib/database/queries/submissions.ts`
3. Use existing Button component for delete button
4. Follow 3-layer pattern: Component → Server Action → Query Function

**Implementation:**
```typescript
// Layer 3: Query (lib/database/queries/submissions.ts)
export async function deleteSubmissionById(id: string, userId: string) {
  return await prisma.researchSubmission.deleteMany({
    where: { id, userId } // Verify ownership
  })
}

// Layer 2: Server Action (actions/submission.actions.ts)
export async function deleteSubmission(id: string) {
  const session = await requireAuth() // 1. Auth first
  if (!id) return { error: 'Invalid ID' } // 2. Validate
  await deleteSubmissionById(id, session.id) // 3. Call query
  revalidatePath('/dashboard')
  return { success: true }
}

// Layer 1: Component (app/dashboard/page.tsx)
<Button onClick={() => deleteSubmission(submission.id)}>
  Delete
</Button>
```

---

## Summary

**10 Core Rules:**

1. **requireAuth() first** in every Server Action
2. **Zod validation second** before database
3. **userId from session** never from client
4. **3-layer pattern** Components → Actions → Queries
5. **Functions under 20 lines** extract sub-functions
6. **No `any` types** use `unknown` and narrow
7. **Typography classes** never hardcode font sizes
8. **Reuse components** check ui/, submission/, settings/ first
9. **Check ownership** before read/update/delete
10. **No Prisma outside** lib/database/queries/

---

**Questions?** Read CODE_STANDARDS.md in docs/pm-notes/

**Last Updated:** 2026-02-26 Rules

- **4px** for all cards, inputs, containers
- **9999px** (rounded-full) for all buttons, badges, avatars

```tsx
// ✅ Cards
<Card style={{ borderRadius: '4px' }}>

// ✅ Buttons
<Button className="rounded-full">

// ✅ Badges
<div className="rounded-full">
```

### Spacing

```tsx
// Page padding
className="px-4 md:px-8 lg:px-[120px]"

// Section padding
className="py-12 md:py-[80px]"

// Card padding
className="p-6 md:p-[48px]"
```

---

## 7. Component Usage Rules

### Available Components (components/ui/)

**Button** — Primary and secondary variants
```tsx
<Button variant="primary">Submit</Button>
<Button variant="secondary">Cancel</Button>
```

**Card** — Container with border and background
```tsx
<Card className="p-6">Content</Card>
```

**FadeIn** — Scroll-triggered animation
```tsx
<FadeIn delay={0.15}>
  <Card>Animates when scrolled into view</Card>
</FadeIn>
```

**FadeInOnLoad** — Page load animation
```tsx
<FadeInOnLoad delay={0.3}>
  <h1>Animates on page load</h1>
</FadeInOnLoad>
```

**Input, Textarea, Label** — Form fields
```tsx
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
<Textarea id="bio" rows={4} />
```

### Rule: Never Recreate Existing Components

Before creating a new component, check `components/ui/` first. Reuse what exists.

---

## 8. Commenting Requirements

### File-Level JSDoc (Every File)

```typescript
/**
 * submission.actions.ts
 * 
 * Server Actions for research submission management including drafts,
 * submission, retrieval, and deletion.
 * 
 * All actions verify user authentication and ownership before operations.
 * Submissions go through draft -> submitted workflow with email notifications.
 */
```

### Function JSDoc (Every Exported Function)

```typescript
/**
 * Saves or updates a research submission draft.
 * Validates for duplicate research topics before saving.
 * Cleans enum fields by converting empty strings to null.
 * 
 * @param data - Draft data including all submission fields
 * @param data.id - Draft ID for updates, 'new' for creation
 * @returns Success status and draft ID, or error message
 * @throws {Error} If user is not authenticated
 */
export async function saveDraft(data: any) {
  // Implementation
}
```

### Inline Comments (Only for Non-Obvious Logic)

```typescript
// ✅ GOOD: Explains WHY
// Email normalized to lowercase to prevent duplicate accounts
email: z.string().toLowerCase().trim()

// ✅ GOOD: Explains business rule
// Account locks after 5 failed attempts for 15 minutes
if (attempts >= MAX_LOGIN_ATTEMPTS) {
  updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
}

// ❌ BAD: States the obvious
// Increment the counter
counter++
```

### Section Dividers (Files Over 100 Lines)

```typescript
// ============================================
// CONSTANTS
// ============================================

// ============================================
// UTILITY FUNCTIONS
// ============================================

// ============================================
// EXPORTED SERVER ACTIONS
// ============================================
```

---

## 9. Security Rules (NO EXCEPTIONS)

### Every Server Action Must:

```typescript
export async function anyServerAction(data: any) {
  // 1. requireAuth() is ALWAYS first
  const session = await requireAuth()
  
  // 2. Zod validation before any database call
  const validated = schema.parse(data)
  
  // 3. userId from session, NEVER from client
  const userId = session.id // ✅ CORRECT
  const userId = data.userId // ❌ NEVER DO THIS
  
  // 4. Check resource ownership
  const resource = await findResourceById(validated.id)
  if (resource.userId !== session.id) {
    throw new Error('Unauthorized')
  }
  
  // 5. No raw user input touches database
  await updateResource(validated) // ✅ Validated
  await updateResource(data) // ❌ Raw input
}
```

### Real Example from Codebase:

```typescript
// actions/submission.actions.ts
export async function saveDraft(data: any) {
  const session = await requireAuth() // 1. Auth first
  
  try {
    const { id, ...restData } = data
    
    // 2. Validate for duplicates
    if (restData.researchTopic) {
      const existingSubmission = await prisma.researchSubmission.findFirst({
        where: {
          userId: session.id, // 3. userId from session
          researchTopic: restData.researchTopic,
          NOT: id ? { id } : undefined
        }
      })
      
      if (existingSubmission) {
        return { success: false, error: 'Duplicate submission' }
      }
    }
    
    // 4. Check ownership for updates
    if (id && id !== 'new') {
      submission = await prisma.researchSubmission.update({
        where: { id: id },
        data: cleanData
      })
    }
  } catch (error) {
    return { success: false, error: 'Failed to save draft' }
  }
}
```

---

## 10. Database Rules

### Never Write Prisma Outside lib/database/queries/

**❌ WRONG:**
```typescript
// actions/submission.actions.ts
export async function saveDraft(data: any) {
  const submission = await prisma.researchSubmission.create({ data }) // NO!
}
```

**✅ CORRECT:**
```typescript
// actions/submission.actions.ts
export async function saveDraft(data: any) {
  const session = await requireAuth()
  const validated = schema.parse(data)
  return await createDraftSubmission(session.id, validated) // Call query function
}

// lib/database/queries/submissions.ts
export async function createDraftSubmission(userId: string, data: DraftData) {
  return await prisma.researchSubmission.create({
    data: { userId, isDraft: true, ...data }
  })
}
```

### Always Scope to userId

```typescript
// ✅ CORRECT: User can only see their own data
export async function findSubmissionsByUserId(userId: string) {
  return await prisma.researchSubmission.findMany({
    where: { userId, isDraft: false },
    orderBy: { submittedAt: 'desc' }
  })
}
```

### Always Use select to Limit Fields

```typescript
// ❌ BAD: Returns everything including password
const user = await prisma.user.findUnique({ where: { id } })

// ✅ GOOD: Only returns needed fields
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, email: true, fullName: true }
})
```

### Never Return password Field

```typescript
// ✅ CORRECT: Exclude password
select: { id: true, email: true, fullName: true }

// ❌ NEVER include password
select: { id: true, email: true, password: true }
```

### Use Transactions for Multi-Step Operations

```typescript
await prisma.$transaction([
  prisma.researchSubmission.update({
    where: { id: data.id },
    data: { isDraft: false, submittedAt: new Date() }
  }),
  prisma.user.update({
    where: { id: session.id },
    data: { totalSubmissions: { increment: 1 } }
  })
])
```

---

## 11. What NOT To Do

### Anti-Patterns from CODE_STANDARDS.md

- ❌ No `any` types (use `unknown` and narrow)
- ❌ No functions over 20 lines (extract sub-functions)
- ❌ No Prisma in components or Server Actions
- ❌ No hardcoded colors (use CSS variables)
- ❌ No hardcoded font sizes (use typography classes)
- ❌ No inline Framer Motion (use FadeIn/FadeInOnLoad)
- ❌ No new API routes unless file upload or webhook
- ❌ No recreating existing components
- ❌ No speculative code for future features
- ❌ No `console.log` committed to main
- ❌ No commented-out code
- ❌ No magic numbers (use named constants)
- ❌ No userId from client input (always from session)

---

## 12. Before Starting Any Task

### Checklist for Every AI Session

1. ✅ Read this file completely
2. ✅ Check what already exists before creating anything
   - Search `components/ui/` for existing components
   - Search `actions/` for existing Server Actions
   - Search `lib/database/queries/` for existing queries
3. ✅ List files to be modified before touching anything
4. ✅ Reuse existing components, actions, queries
5. ✅ Only create what the current task actually needs
6. ✅ Follow all rules above without exception

### Example Workflow

**Task:** "Add ability to delete a submission"

**Before coding:**
1. Check if `deleteSubmission` action exists in `actions/submission.actions.ts` ✓
2. Check if delete query exists in `lib/database/queries/submissions.ts` ✗
3. Check if Button component exists in `components/ui/button.tsx` ✓

**Plan:**
1. Add `deleteSubmission` Server Action to `actions/submission.actions.ts`
2. Add `deleteSubmissionById` query to `lib/database/queries/submissions.ts`
3. Use existing Button component for delete button
4. Follow 3-layer pattern: Component → Server Action → Query Function

**Implementation:**
```typescript
// Layer 3: Query (lib/database/queries/submissions.ts)
export async function deleteSubmissionById(id: string, userId: string) {
  return await prisma.researchSubmission.deleteMany({
    where: { id, userId } // Verify ownership
  })
}

// Layer 2: Server Action (actions/submission.actions.ts)
export async function deleteSubmission(id: string) {
  const session = await requireAuth() // 1. Auth first
  if (!id) return { error: 'Invalid ID' } // 2. Validate
  await deleteSubmissionById(id, session.id) // 3. Call query
  revalidatePath('/dashboard')
  return { success: true }
}

// Layer 1: Component (app/dashboard/page.tsx)
<Button onClick={() => deleteSubmission(submission.id)}>
  Delete
</Button>
```

---

## Summary

**10 Core Rules:**

1. **requireAuth() first** in every Server Action
2. **Zod validation second** before database
3. **userId from session** never from client
4. **3-layer pattern** Components → Actions → Queries
5. **Functions under 20 lines** extract sub-functions
6. **No `any` types** use `unknown` and narrow
7. **Typography classes** never hardcode font sizes
8. **Reuse components** check ui/ first
9. **Check ownership** before read/update/delete
10. **No Prisma outside** lib/database/queries/

---

**Questions?** Read CODE_STANDARDS.md in docs/pm-notes/

**Last Updated:** 2026-02-26
