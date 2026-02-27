# Research Submissions - Technical Documentation

**Audience:** Developers  
**Last Updated:** 2026-02-26

## File Structure

```
actions/
└── submission.actions.ts    # Server Actions for submissions

lib/database/queries/
└── submissions.ts           # Database queries (future)

components/submission/
├── FormFooter.tsx           # Navigation buttons
├── FormInput.tsx            # Input wrapper
├── FormSelect.tsx           # Select wrapper
├── FormTextarea.tsx         # Textarea wrapper
├── ProgressStepper.tsx      # Step indicator
├── ReviewCard.tsx           # Submission review
└── Step1Form.tsx            # First step form

app/dashboard/
├── submit/
│   ├── page.tsx             # Step 1
│   ├── step-2/page.tsx      # Step 2
│   └── step-3/page.tsx      # Step 3
├── drafts/page.tsx          # Draft list
└── submissions/
    └── [id]/page.tsx        # Submission detail
```

## Database Model

```prisma
model ResearchSubmission {
  id          String           @id @default(cuid())
  userId      String
  status      SubmissionStatus @default(PENDING_RESEARCH)
  isDraft     Boolean          @default(false)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  submittedAt DateTime?
  
  // Step 1 - Research Summary
  researchTopic         String?
  researchDescription   String?
  researcherName        String?
  researcherEmail       String?
  researcherInstitution String?
  researcherDepartment  String?
  
  // Step 2 - Additional Details
  researcherCareerStage      CareerStage?
  researcherCareerStageOther String?
  researcherLinkedin         String?
  researchStage              ResearchStage?
  fundingStatus              FundingStatus?
  keyPublications            String?
  potentialApplications      String?
  supportingLinks            Json?
  submissionSource           SubmissionSource?
  relationshipToResearcher   Relationship?
  researcherAwareness        Boolean @default(false)
  
  // Step 3 - Scout Pitch
  whyInteresting String?
  
  // System
  isDuplicate Boolean @default(false)
  duplicateOf String?
}

enum SubmissionStatus {
  PENDING_RESEARCH
  VALIDATING
  PITCHED_MATCHMAKING
  MATCH_MADE
  REJECTED
}
```

## Server Actions

### saveDraft

**File:** `actions/submission.actions.ts`

```typescript
export async function saveDraft(data: any): Promise<{
  success: boolean
  id?: string
  error?: string
}>
```

**Flow:**
1. Authenticate user with `requireAuth()`
2. Extract and clean form data
3. Check for duplicate research topics
4. Normalize enum fields (empty string → null)
5. Update existing draft or create new one
6. Revalidate `/dashboard/drafts`
7. Return success with draft ID

**Duplicate Detection:**
```typescript
const existingSubmission = await prisma.researchSubmission.findFirst({
  where: {
    userId: session.id,
    researchTopic: restData.researchTopic,
    NOT: id ? { id } : undefined
  }
})
```

**Enum Normalization:**
```typescript
const cleanData = {
  ...restData,
  researcherCareerStage: restData.researcherCareerStage && 
    restData.researcherCareerStage !== '' ? 
    restData.researcherCareerStage : null,
  // ... other enum fields
}
```

### submitResearch

**File:** `actions/submission.actions.ts`

```typescript
export async function submitResearch(data: any): Promise<{
  success: boolean
  id?: string
  error?: string
}>
```

**Flow:**
1. Authenticate user with `requireAuth()`
2. Validate submission ID
3. Verify ownership and draft status
4. Update submission:
   - Set `isDraft = false`
   - Set `submittedAt = now()`
   - Set `status = PENDING_RESEARCH`
5. Increment user statistics:
   - `totalSubmissions += 1`
   - `pendingSubmissions += 1`
6. Send confirmation email
7. Revalidate dashboard paths
8. Return success with submission ID

**Ownership Verification:**
```typescript
const existingSubmission = await prisma.researchSubmission.findFirst({
  where: {
    id: data.id,
    userId: session.id,
    isDraft: true
  }
})
```

**User Stats Update:**
```typescript
await prisma.user.update({
  where: { id: session.id },
  data: {
    totalSubmissions: { increment: 1 },
    pendingSubmissions: { increment: 1 }
  }
})
```

### getDraft

**File:** `actions/submission.actions.ts`

```typescript
export async function getDraft(id: string): Promise<{
  success: boolean
  draft?: ResearchSubmission
  error?: string
}>
```

**Flow:**
1. Authenticate user with `requireAuth()`
2. Find draft by ID and userId
3. Verify `isDraft = true`
4. Return draft data

### deleteDraft

**File:** `actions/submission.actions.ts`

```typescript
export async function deleteDraft(id: string): Promise<{
  success: boolean
  error?: string
}>
```

**Flow:**
1. Authenticate user with `requireAuth()`
2. Validate draft ID
3. Verify ownership and draft status
4. Delete draft from database
5. Revalidate `/dashboard/drafts`
6. Return success

## Email Notifications

### Submission Confirmation Email

**Sent:** After `submitResearch()` completes  
**To:** User who submitted  
**Subject:** "Research Lead Submitted Successfully"

**Content:**
- Confirmation of submission
- Next steps information
- Expected timeline

**Implementation:**
```typescript
await transporter.sendMail({
  from: getFromAddress(),
  to: user.email,
  subject: 'Research Lead Submitted Successfully',
  html: `
    <h1>Research Lead Submitted! ✓</h1>
    <p>Your research lead has been submitted successfully 
       and is now under review.</p>
  `
})
```

## Validation

### Step 1 Validation

**Required Fields:**
- Research topic
- Research description
- Researcher name
- Researcher email
- Researcher institution
- Researcher department

### Step 2 Validation

**Required Fields:**
- Researcher career stage
- Research stage
- Funding status
- Submission source
- Relationship to researcher
- Researcher awareness (boolean)

**Optional Fields:**
- Researcher LinkedIn
- Key publications
- Potential applications
- Supporting links (JSON array)

### Step 3 Validation

**Required Fields:**
- Why interesting (scout pitch)

## Submission Pipeline

### Status Flow

```
PENDING_RESEARCH (initial)
    ↓
VALIDATING (team reviewing)
    ↓
PITCHED_MATCHMAKING (presented to investors)
    ↓
MATCH_MADE (success!) or REJECTED (declined)
```

### Status Updates

**Who can update:**
- Only ADMIN users can change submission status
- Status changes trigger email notifications (future)

**User stats updates:**
```typescript
// When status changes to MATCH_MADE
await prisma.user.update({
  where: { id: submission.userId },
  data: {
    approvedSubmissions: { increment: 1 },
    pendingSubmissions: { decrement: 1 }
  }
})

// When status changes to REJECTED
await prisma.user.update({
  where: { id: submission.userId },
  data: {
    pendingSubmissions: { decrement: 1 }
  }
})
```

## Duplicate Detection

### Current Implementation

Checks for duplicate `researchTopic` by same user:

```typescript
const existingSubmission = await prisma.researchSubmission.findFirst({
  where: {
    userId: session.id,
    researchTopic: restData.researchTopic,
    NOT: id ? { id } : undefined
  }
})
```

### Future Enhancements

- [ ] Check researcher email across all users
- [ ] Fuzzy matching on research topic
- [ ] Check institution + researcher name combination
- [ ] Flag potential duplicates for admin review

## Security

### Authentication
- `requireAuth()` first line of every action
- userId always from session, never from client

### Authorization
- Users can only access their own submissions
- Ownership verified before all operations
- Draft status verified before deletion

### Input Validation
- All enum fields normalized
- Empty strings converted to null
- Supporting links validated as JSON array

## Testing

### Create Draft
```typescript
const result = await saveDraft({
  id: 'new',
  researchTopic: 'AI for Drug Discovery',
  researchDescription: 'Novel approach...',
  researcherName: 'Dr. Jane Smith',
  researcherEmail: 'jane@university.edu',
  researcherInstitution: 'MIT',
  researcherDepartment: 'Computer Science'
})

expect(result.success).toBe(true)
expect(result.id).toBeDefined()
```

### Submit Research
```typescript
const result = await submitResearch({ id: draftId })

expect(result.success).toBe(true)

// Verify draft converted to submission
const submission = await prisma.researchSubmission.findUnique({
  where: { id: draftId }
})
expect(submission.isDraft).toBe(false)
expect(submission.status).toBe('PENDING_RESEARCH')
expect(submission.submittedAt).toBeDefined()
```

### Duplicate Detection
```typescript
// Create first submission
await saveDraft({
  id: 'new',
  researchTopic: 'Quantum Computing',
  // ... other fields
})

// Try to create duplicate
const result = await saveDraft({
  id: 'new',
  researchTopic: 'Quantum Computing',
  // ... other fields
})

expect(result.success).toBe(false)
expect(result.error).toContain('already exists')
```

## Common Issues

### "Draft not found or already submitted"

**Cause:** Trying to submit a draft that doesn't exist or was already submitted  
**Solution:** Check draft exists and `isDraft = true`

### "A submission with this research topic already exists"

**Cause:** User already has submission with same research topic  
**Solution:** Edit existing submission or use different topic

### Email not sending

**Cause:** SMTP not configured  
**Solution:** Set SMTP environment variables or check logs

## Environment Variables

```env
# Email (optional but recommended)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Cofactor Scout <no-reply@cofactor.world>"
```
