# Code Review Guidelines

**Audience:** Developers  
**Last Updated:** 2026-02-26

## What to Look For in Every Review

### 1. CODE_STANDARDS.md Compliance

- [ ] Functions under 20 lines
- [ ] No `any` types
- [ ] Max 3 function arguments (or object params)
- [ ] Command-Query separation
- [ ] Single responsibility
- [ ] Honest naming
- [ ] No magic numbers

### 2. Security Rules

- [ ] `requireAuth()` is first line of every Server Action
- [ ] Zod validation before database calls
- [ ] `userId` from session, never from client
- [ ] Resource ownership checked before mutations
- [ ] No raw user input to database

### 3. Architecture Compliance

- [ ] 3-layer pattern followed (Components → Actions → Queries)
- [ ] No Prisma in components or Server Actions
- [ ] Prisma only in `lib/database/queries/`
- [ ] Server Actions in `actions/`
- [ ] Zod schemas in `lib/validation/schemas.ts`

### 4. Comments and Documentation

- [ ] File-level JSDoc header present
- [ ] Function JSDoc with @param, @returns, @throws
- [ ] Inline comments explain WHY, not WHAT
- [ ] Section dividers in files >100 lines
- [ ] No commented-out code

### 5. Design System Compliance

- [ ] Uses typography classes (no hardcoded font sizes)
- [ ] Uses CSS variables or Tailwind for colors
- [ ] Border radius: 4px for containers, 9999px for buttons
- [ ] Spacing follows system (px-[120px], py-[80px], etc.)
- [ ] Uses existing components (no recreation)

### 6. UI/UX Quality

- [ ] Loading states present and working
- [ ] Error states present and working
- [ ] Mobile responsiveness checked
- [ ] Animations use FadeIn/FadeInOnLoad (no inline Framer Motion)
- [ ] Forms have validation feedback
- [ ] Buttons have appropriate variants

### 7. No Unnecessary Files

- [ ] No unused components created
- [ ] No unused Server Actions created
- [ ] No unused query functions created
- [ ] No duplicate functionality

### 8. Testing

- [ ] Author tested locally end-to-end
- [ ] Edge cases considered
- [ ] Error paths tested
- [ ] Mobile tested

## How to Give Feedback

### Be Constructive

**❌ BAD:**
```
This is wrong.
```

**✅ GOOD:**
```
This function is doing too much. Consider extracting the validation 
logic into a separate function to follow the single responsibility principle.
```

### Be Specific

**❌ BAD:**
```
The naming could be better.
```

**✅ GOOD:**
```
`getData()` is too generic. Consider `findSubmissionsByUserId()` 
to make it clear what data is being retrieved.
```

### Provide Examples

**❌ BAD:**
```
Use the 3-layer pattern here.
```

**✅ GOOD:**
```
This should follow the 3-layer pattern:

// Instead of Prisma in the action:
export async function saveDraft(data: any) {
  const submission = await prisma.researchSubmission.create({ data })
}

// Extract to a query function:
// actions/submission.actions.ts
export async function saveDraft(data: any) {
  const session = await requireAuth()
  return await createDraftSubmission(session.id, data)
}

// lib/database/queries/submissions.ts
export async function createDraftSubmission(userId: string, data: any) {
  return await prisma.researchSubmission.create({ data: { userId, ...data } })
}
```

### Ask Questions

Instead of demanding changes, ask questions:

```
Why did you choose to implement it this way instead of using 
the existing `Button` component?
```

## What Warrants Blocking a PR

### Must Fix (Blocking)

- Security vulnerabilities
- Breaking changes without migration plan
- CODE_STANDARDS.md violations
- Missing authentication checks
- Missing input validation
- Hardcoded secrets or credentials
- Performance issues (N+1 queries, missing indexes)
- Accessibility violations

### Should Fix (Strong Suggestion)

- Missing error handling
- Missing loading states
- Poor naming
- Missing comments on complex logic
- Code duplication
- Inconsistent patterns

### Nice to Have (Nitpick)

- Alternative approaches
- Minor optimizations
- Formatting preferences
- Additional edge cases

## Review Turnaround

- **Standard PRs:** Review within 24 hours
- **Urgent fixes:** Review within 2 hours
- **Large PRs:** May take 48 hours

## Review Checklist

Copy this into your review:

```markdown
## Code Review Checklist

### Architecture
- [ ] 3-layer pattern followed
- [ ] No Prisma outside queries/
- [ ] requireAuth() first in actions
- [ ] Zod validation before database

### Code Quality
- [ ] Functions under 20 lines
- [ ] No any types
- [ ] Honest naming
- [ ] Comments explain WHY

### Security
- [ ] userId from session only
- [ ] Ownership checked
- [ ] Input validated

### UI/UX
- [ ] Loading states work
- [ ] Error states work
- [ ] Mobile responsive
- [ ] Uses design system

### Testing
- [ ] Tested locally
- [ ] Edge cases considered
```

## Common Review Comments

### Security

```
⚠️ SECURITY: userId should come from session, not client input.

Change:
const userId = data.userId

To:
const session = await requireAuth()
const userId = session.id
```

### Architecture

```
📐 ARCHITECTURE: Prisma queries should be in lib/database/queries/

Move this query to lib/database/queries/submissions.ts and call it 
from the Server Action.
```

### Code Standards

```
📏 CODE STANDARDS: This function is 35 lines. Extract sub-functions 
to keep it under 20 lines.
```

### Design System

```
🎨 DESIGN: Use typography classes instead of hardcoded font sizes.

Change:
<h1 style={{ fontSize: '48px' }}>

To:
<h1>  // Automatically uses .h1 class
```

## Approving a PR

Only approve if:

1. All blocking issues resolved
2. CODE_STANDARDS.md followed
3. Security rules followed
4. Tested locally (if possible)
5. No obvious bugs

## Requesting Changes

Use "Request Changes" for:

- Security issues
- Breaking changes
- CODE_STANDARDS.md violations
- Missing critical functionality

Use "Comment" for:

- Suggestions
- Questions
- Nitpicks

## After Approval

1. Author merges (squash and merge)
2. Author deletes branch
3. Reviewer monitors deployment

## Questions During Review?

- Ask in PR comments
- Tag the author
- Use team chat for urgent questions
