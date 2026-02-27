# Scout Application - Technical Documentation

**Audience:** Developers  
**Last Updated:** 2026-02-26

## Implementation

Scout applications are handled through the sign-up flow with additional profile fields.

### Database Fields

```prisma
model User {
  // Scout Profile
  university             String?
  department             String?
  linkedinUrl            String?
  userRole               UserRole?
  userRoleOther          String?
  researchAreas          String?
  whyScout               String?
  howSourceLeads         String?
  scoutApplicationStatus ScoutApplicationStatus @default(NOT_APPLIED)
  scoutApplicationDate   DateTime?
}

enum ScoutApplicationStatus {
  NOT_APPLIED
  PENDING
  APPROVED
  REJECTED
}

enum UserRole {
  PHD_STUDENT
  POSTDOC
  PROFESSOR
  INDUSTRY_RESEARCHER
  INDEPENDENT_RESEARCHER
  OTHER
}
```

### Sign Up with Scout Application

**File:** `actions/auth.actions.ts`

When `scoutApplication=true` in form data:

```typescript
if (isScoutApp) {
  await prisma.user.create({
    data: {
      email: validatedEmail,
      fullName: name,
      firstName,
      lastName,
      password: hashedPassword,
      role: 'CONTRIBUTOR', // Starts as contributor
      verificationToken,
      verificationExpires,
      university,
      department: formData.get('department') as string,
      linkedinUrl: (formData.get('linkedinUrl') as string) || null,
      userRole: formData.get('userRole') as any,
      userRoleOther: formData.get('userRole') === 'OTHER' ? 
        (formData.get('userRoleOther') as string) : null,
      researchAreas: formData.get('researchAreas') as string,
      whyScout: formData.get('whyScout') as string,
      howSourceLeads: formData.get('howSourceLeads') as string,
      scoutApplicationStatus: 'PENDING',
      scoutApplicationDate: new Date()
    }
  })
}
```

### Email Notifications

**Confirmation Email (to applicant):**
- Subject: "Scout Application Received"
- Confirms application submitted
- Explains next steps
- Timeline expectations

**Notification Email (to admin):**
- Subject: "New Scout Application"
- Applicant details
- University and department
- Research areas
- Link to review (future)

### Admin Approval Flow

**Current:** Manual database update  
**Future:** Admin dashboard with approve/reject buttons

```typescript
// Approve scout application
await prisma.user.update({
  where: { id: userId },
  data: {
    role: 'SCOUT',
    scoutApplicationStatus: 'APPROVED'
  }
})

// Send approval email
await sendScoutApprovalEmail(user.email, user.fullName)
```

### Application Status Check

Users can check their application status in settings or dashboard.

```typescript
const user = await prisma.user.findUnique({
  where: { id: session.id },
  select: {
    scoutApplicationStatus: true,
    scoutApplicationDate: true
  }
})
```

## Security

- Authentication required for logged-in applications
- Email verification required before application review
- Application data validated with Zod
- Admin-only approval/rejection

## Testing

### Submit Application (New User)
```typescript
const result = await signUp(undefined, formData)
expect(result.success).toBe(true)

const user = await prisma.user.findUnique({
  where: { email }
})
expect(user.scoutApplicationStatus).toBe('PENDING')
expect(user.scoutApplicationDate).toBeDefined()
```

### Approve Application
```typescript
await prisma.user.update({
  where: { id: userId },
  data: {
    role: 'SCOUT',
    scoutApplicationStatus: 'APPROVED'
  }
})

const user = await prisma.user.findUnique({
  where: { id: userId }
})
expect(user.role).toBe('SCOUT')
expect(user.scoutApplicationStatus).toBe('APPROVED')
```

## Environment Variables

Same as authentication (SMTP for emails).
