# Cofactor Club Database Schema Guide

## Core Models

### User (Central Hub)
```
id                  String      @id @default(cuid())
email               String      @unique
name                String?
bio                 String?
password            String?
role                Role        @default(STUDENT)  // STUDENT/ADMIN/STAFF/PENDING_STAFF
referralCode        String      @unique
socialStats         Json?       // Instagram/TikTok/LinkedIn followers
emailVerified       DateTime?
verificationToken   String?     @unique
verificationExpires DateTime?
failedLoginAttempts Int         @default(0)
lockedUntil         DateTime?
isPublicProfile     Boolean     @default(false)
isTrusted           Boolean     @default(false)
publicPersonId      String?     @unique  // Links to Person record
universityId        String?     // Primary university (auto-assigned)
secondaryUniversityId String?   // Optional second university
createdAt           DateTime    @default(now())
updatedAt           DateTime    @updatedAt

Relations:
- revisions (WikiRevision[])
- referralsMade (Referral[])
- referredBy (Referral?)
- notifications (Notification[])
- bookmarks (Bookmark[])
- pageVersions (PageVersion[])
- publicPerson (Person)
- university (University)
- secondaryUniversity (University)
```

### University
```
id        String   @id @default(cuid())
name      String   @unique
domains   String[] // Email domains ["tu-berlin.de", "campus.tu-berlin.de"]
logo      String?
approved  Boolean  @default(true)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

Relations:
- users (User[]) // Primary affiliation
- secondaryUsers (User[]) // Secondary affiliation
- pages (UniPage[])
- institutes (Institute[])
```

### UniPage (Wiki Pages)
```
id            String   @id @default(cuid())
name          String
slug          String   @unique
content       String
published     Boolean  @default(false)
searchVector  String?
keywords      String[]
universityId  String?  // University-scoped
instituteId   String?  // Institute-scoped
labId         String?  // Lab-scoped
createdAt     DateTime @default(now())
updatedAt     DateTime @updatedAt

Relations:
- revisions (WikiRevision[])
- versions (PageVersion[])
- bookmarks (Bookmark[])
- pageTags (PageTag[])
- university (University)
- institute (Institute)
- lab (Lab)
```

### Institute
```
id           String   @id @default(cuid())
name         String
slug         String   @unique
approved     Boolean  @default(false)
searchVector String?
keywords     String[]
universityId String
authorId     String?
createdAt    DateTime @default(now())
updatedAt    DateTime @updatedAt

Relations:
- university (University)
- labs (Lab[])
- people (Person[])
- pages (UniPage[])
- author (User)
```

### Lab
```
id           String   @id @default(cuid())
name         String
slug         String   @unique
approved     Boolean  @default(false)
searchVector String?
keywords     String[]
instituteId  String
authorId     String?
createdAt    DateTime @default(now())
updatedAt    DateTime @updatedAt

Relations:
- institute (Institute)
- people (Person[])
- pages (UniPage[])
- author (User)
```

### Person
```
id           String   @id @default(cuid())
name         String
slug         String?  @unique
role         String?
fieldOfStudy String?
image        String?
bio          String?
linkedin     String?
twitter      String?
website      String?
email        String?
searchVector String?
keywords     String[]
instituteId  String?
labId        String?
approved     Boolean  @default(false)
authorId     String?
createdAt    DateTime @default(now())
updatedAt    DateTime @updatedAt

Relations:
- institute (Institute)
- lab (Lab)
- linkedUser (User) // If user makes profile public
- author (User)
```

## Wiki & Content Management

### WikiRevision
```
id              String         @id @default(cuid())
uniPageId       String
authorId        String
content         String
title           String?
status          RevisionStatus @default(PENDING)
                // PENDING/APPROVED/REJECTED/AUTO_REJECTED/FLAGGED
spamScore       Int?           // 0-100
moderationNotes String?
moderatedBy     String?
moderatedAt     DateTime?
moderationReason String?
filterViolations Json?
createdAt       DateTime       @default(now())
updatedAt       DateTime       @updatedAt

Relations:
- uniPage (UniPage)
- author (User)
```

### PageVersion
```
id        String   @id @default(cuid())
uniPageId String
content   String
title     String
version   Int      @default(1)
createdBy String
createdAt DateTime @default(now())

Relations:
- uniPage (UniPage)
- author (User)
```

## Referral & Gamification

### Referral
```
id         String   @id @default(cuid())
referrerId String
refereeId  String   @unique
createdAt  DateTime @default(now())

Relations:
- referrer (User)
- referee (User)

Points: +50 per successful referral
```

## User Management

### PasswordReset
```
id        String   @id @default(cuid())
token     String   @unique // 6-digit code
userId    String
expires   DateTime
createdAt DateTime @default(now())

Relations:
- user (User)
```

### SecondaryUniversityRequest
```
id           String        @id @default(cuid())
userId       String
universityId String
proofText    String        // User's explanation/proof
status       RequestStatus @default(PENDING)
             // PENDING/APPROVED/REJECTED
createdAt    DateTime      @default(now())
updatedAt    DateTime      @updatedAt

Relations:
- user (User)
- university (University)
```

### DeletionRequest
```
id          String         @id @default(cuid())
userId      String         @unique
token       String         @unique
mode        DeletionMode   // SOFT/HARD
status      DeletionStatus @default(PENDING)
            // PENDING/CONFIRMED/EXPIRED/FAILED
expiresAt   DateTime
confirmedAt DateTime?
createdAt   DateTime       @default(now())

Relations:
- user (User)
```

## Notifications

### Notification
```
id        String           @id @default(cuid())
userId    String
type      NotificationType
          // WIKI_APPROVED/WIKI_REJECTED/WIKI_PUBLISHED/
          // STAFF_APPROVED/STAFF_REJECTED/REFERRAL_USED/
          // USER_FOLLOWED/MENTION/COMMENT
title     String
message   String
link      String?
read      Boolean  @default(false)
createdAt DateTime @default(now())

Relations:
- user (User)
```

### NotificationPreference
```
id           String   @id @default(cuid())
userId       String   @unique
emailEnabled Boolean  @default(true)
pushEnabled  Boolean  @default(false)
inAppEnabled Boolean  @default(true)
wikiApproval Boolean  @default(true)
staffStatus  Boolean  @default(true)
activityFeed Boolean  @default(true)
createdAt    DateTime @default(now())
updatedAt    DateTime @updatedAt

Relations:
- user (User)
```

## Advanced Features

### Tag + PageTag
```
Tag:
  id        String   @id @default(cuid())
  name      String   @unique
  slug      String   @unique
  color     String   @default("#3B82F6")
  createdAt DateTime @default(now())

PageTag (Junction):
  id        String   @id @default(cuid())
  pageId    String
  tagId     String
  createdAt DateTime @default(now())
```

### Bookmark
```
id        String   @id @default(cuid())
userId    String
pageId    String
note      String?
createdAt DateTime @default(now())

Relations:
- user (User)
- page (UniPage)
```

### Experiment + ExperimentAssignment
```
Experiment:
  id          String           @id @default(cuid())
  name        String           @unique
  description String?
  status      ExperimentStatus @default(DRAFT)
              // DRAFT/RUNNING/PAUSED/COMPLETED
  variants    Json
  traffic     Float            @default(0.5)
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

ExperimentAssignment:
  id           String   @id @default(cuid())
  experimentId String
  userId       String
  variant      String
  createdAt    DateTime @default(now())
```

### CalendarEvent
```
id          String    @id @default(cuid())
title       String
description String?
startTime   DateTime
endTime     DateTime
location    String?
type        EventType @default(MEETING)
            // MEETING/DEADLINE/REMINDER/EVENT
userId      String?
createdAt   DateTime  @default(now())
updatedAt   DateTime  @updatedAt

Relations:
- user (User)
```

### Report
```
id          String            @id @default(cuid())
reporterId  String
contentType ReportContentType
            // WIKI_REVISION/COMMENT/USER/PERSON
contentId   String
reason      String
description String?
status      ReportStatus      @default(PENDING)
            // PENDING/UNDER_REVIEW/RESOLVED/DISMISSED/BLOCKED
createdAt   DateTime          @default(now())
resolvedAt  DateTime?
resolvedBy  String?

Relations:
- reporter (User)
- resolver (User)
```

### ExportJob + ImportJob
```
ExportJob:
  id          String     @id @default(cuid())
  userId      String
  type        ExportType
              // USER_DATA/WIKI_PAGES/MEMBERS/ANALYTICS
  status      JobStatus  @default(PENDING)
              // PENDING/PROCESSING/COMPLETED/FAILED
  fileUrl     String?
  createdAt   DateTime   @default(now())
  completedAt DateTime?

ImportJob:
  id          String     @id @default(cuid())
  userId      String
  type        ImportType
              // USERS/WIKI_PAGES
  status      JobStatus  @default(PENDING)
  records     Int        @default(0)
  errors      Json?
  createdAt   DateTime   @default(now())
  completedAt DateTime?
```

### FeatureFlag
```
id        String   @id @default(cuid())
key       String   @unique
enabled   Boolean  @default(false)
rollout   Float    @default(0)      // Percentage 0-1
users     String[]                   // Whitelist
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

### CustomField + CustomFieldValue
```
CustomField:
  id       String    @id @default(cuid())
  key      String    @unique
  label    String
  type     FieldType
           // TEXT/NUMBER/SELECT/MULTI_SELECT/DATE/BOOLEAN
  required Boolean   @default(false)
  options  String[]
  createdAt DateTime @default(now())

CustomFieldValue:
  id        String   @id @default(cuid())
  userId    String
  fieldId   String
  value     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
```

### SystemSettings
```
id                       String   @id @default(cuid())
enableStudentEmails      Boolean  @default(true)
enableAdminEmails        Boolean  @default(true)
enableInAppNotifications Boolean  @default(true)
trustedUserDailyLimit    Int      @default(5)
updatedAt                DateTime @updatedAt
```

## Key Relationships

```
User ──┬─→ University (primary)
       ├─→ University (secondary)
       ├─→ Person (public profile)
       ├─→ WikiRevision (author)
       ├─→ Referral (referrer/referee)
       └─→ Notification, Bookmark, etc.

University ──→ Institute ──→ Lab ──→ Person
                    ↓          ↓       ↓
                 UniPage    UniPage  UniPage

UniPage ──┬─→ WikiRevision (pending edits)
          └─→ PageVersion (approved history)
```

## Power Score Calculation

- **Referrals**: +50 points per successful invite
- **Wiki Contributions**: +20 points for approved edits
- **Social Reach**: Points based on aggregate followers (Instagram, TikTok, LinkedIn)

## Role Hierarchy

1. **STUDENT**: Create referrals, propose wiki edits, sync social accounts
2. **TRUSTED STUDENT**: Limited daily auto-approved edits (default: 5/day)
3. **STAFF**: Auto-approved wiki edits, same as student
4. **PENDING_STAFF**: Awaiting admin approval for staff privileges
5. **ADMIN**: Full access - approve/reject revisions, manage users, delete pages

## Wiki Access Control

- **University-Scoped**: Students only see their own university's wiki
- **Students**: View/Edit own university wiki (edits require approval)
- **Staff**: View/Edit all university wikis (auto-approved)
- **Admins**: Full control over all wikis

## Important Indexes

```
User: [email], [referralCode], [createdAt DESC], [role], [universityId]
WikiRevision: [status], [authorId], [uniPageId], [createdAt DESC], [status, spamScore DESC]
UniPage: [searchVector], [keywords]
Institute/Lab/Person: [searchVector], [keywords], [slug]
Notification: [userId], [read], [createdAt DESC]
```

## Security Features

- Password hashing: bcryptjs (10 rounds)
- Session management: NextAuth.js JWT
- XSS prevention: isomorphic-dompurify
- CSRF protection: Server Actions with form tokens
- Rate limiting: Failed login attempts tracking
- Account locking: `lockedUntil` timestamp
