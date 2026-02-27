# ADR-001: Server Actions Over API Routes

**Status:** Accepted  
**Date:** February 2026  
**Deciders:** Development Team

## Context

Cofactor Scout needed a way to handle data mutations, form submissions, and server-side operations. Next.js 13+ offers two approaches:

1. **API Routes** (`app/api/*/route.ts`) - Traditional REST endpoints
2. **Server Actions** (`'use server'` functions) - New Next.js feature

We needed to decide which approach to use as the primary pattern for the codebase.

## Decision

**Use Server Actions for all data mutations and form submissions.**

Only use API Routes for:
- File uploads (multipart/form-data)
- Webhooks from external services
- Third-party integrations requiring REST endpoints

## Reasoning

### Advantages of Server Actions

1. **Simpler Code**
   - No need to create separate API routes
   - No fetch calls from client components
   - Direct function calls from forms and components

2. **Type Safety**
   - End-to-end TypeScript types
   - No manual type definitions for request/response
   - Compile-time errors for mismatched types

3. **Built-in Security**
   - Automatic CSRF protection
   - No need to manually validate request methods
   - Session handling integrated with NextAuth

4. **Less Boilerplate**
   ```typescript
   // API Route approach (more code)
   // app/api/submissions/route.ts
   export async function POST(request: Request) {
     const session = await getServerSession()
     if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
     const body = await request.json()
     const validated = schema.parse(body)
     const result = await createSubmission(validated)
     return NextResponse.json(result)
   }
   
   // Client component
   const response = await fetch('/api/submissions', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(data)
   })
   const result = await response.json()
   
   // Server Action approach (less code)
   // actions/submission.actions.ts
   'use server'
   export async function createSubmission(data: FormData) {
     const session = await requireAuth()
     const validated = schema.parse(data)
     return await saveSubmission(validated)
   }
   
   // Client component
   const result = await createSubmission(formData)
   ```

5. **Progressive Enhancement**
   - Forms work without JavaScript
   - Better for accessibility
   - Graceful degradation

6. **Colocation**
   - Actions live in `actions/` directory
   - Grouped by feature (auth, submissions, scout)
   - Easier to find and maintain

### Disadvantages (Accepted Trade-offs)

1. **Newer Technology**
   - Less Stack Overflow answers
   - Fewer examples in the wild
   - Team needs to learn new patterns

2. **Limited to Next.js**
   - Can't be called from non-Next.js clients
   - Not suitable for public APIs

3. **No REST Semantics**
   - No HTTP status codes
   - No standard REST patterns
   - Custom error handling needed

## Consequences

### Positive

- **Faster Development:** Less boilerplate means faster feature delivery
- **Fewer Bugs:** Type safety catches errors at compile time
- **Better DX:** Simpler mental model for developers
- **Consistent Pattern:** All mutations follow same pattern

### Negative

- **Learning Curve:** Team needs to learn Server Actions
- **Migration Effort:** Existing API routes need migration
- **Documentation:** Need to document patterns clearly

### Neutral

- **File Organization:** Actions live in `actions/` directory
- **Testing:** Need to test Server Actions differently than API routes
- **Error Handling:** Custom error handling pattern needed

## Implementation

### File Structure

```
actions/
├── auth.actions.ts           # Authentication actions
├── submission.actions.ts     # Submission actions
├── scout.actions.ts          # Scout application actions
└── settings.actions.ts       # User settings actions
```

### Pattern

Every Server Action follows this pattern:

```typescript
'use server'

export async function actionName(data: FormData) {
  // 1. Authentication
  const session = await requireAuth()
  
  // 2. Validation
  const validated = schema.parse(data)
  
  // 3. Authorization (if needed)
  await checkOwnership(validated.id, session.id)
  
  // 4. Business Logic
  const result = await performOperation(validated)
  
  // 5. Cache Revalidation
  revalidatePath('/dashboard')
  
  // 6. Return Result
  return { success: true, data: result }
}
```

### API Routes (Exceptions)

API routes still exist for:

```
app/api/
├── auth/[...nextauth]/       # NextAuth endpoints
├── uploads/                  # File upload endpoint
└── webhooks/                 # External webhooks
```

## Alternatives Considered

### 1. API Routes Only

**Pros:**
- More familiar to team
- Standard REST patterns
- Works with any client

**Cons:**
- More boilerplate
- No type safety
- Manual CSRF protection
- Fetch calls from client

**Why Rejected:** Too much boilerplate, no type safety

### 2. tRPC

**Pros:**
- End-to-end type safety
- RPC-style API
- Great DX

**Cons:**
- Additional dependency
- Learning curve
- Overkill for our use case

**Why Rejected:** Server Actions provide similar benefits with less complexity

### 3. GraphQL

**Pros:**
- Flexible queries
- Strong typing
- Industry standard

**Cons:**
- Significant complexity
- Requires schema definition
- Overkill for CRUD operations

**Why Rejected:** Too complex for our needs

## Review

This decision will be reviewed after 3 months of implementation to assess:
- Developer satisfaction
- Bug frequency
- Development velocity
- Maintenance burden

## References

- [Next.js Server Actions Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React Server Components](https://react.dev/reference/react/use-server)
- [AGENTS.md](../../AGENTS.md) - Implementation guidelines
