# Content Moderation System

A comprehensive content moderation system with automated spam detection, content filtering, user reputation tracking, and user reporting functionality for the Cofactor Club platform.

## Features

### 1. Automated Spam Detection (`lib/moderation/spam-detector.ts`)
- **Link Analysis**: Detects excessive links, URL shorteners, and suspicious/blacklisted domains
- **CAPS Detection**: Flags content with excessive uppercase usage (>70%)
- **Repetition Detection**: Identifies character flooding and word repetition
- **Spam Keywords**: Scans for known spam phrases and keywords
- **Suspicious HTML**: Detects hidden text, tiny fonts, obfuscated content, and inline event handlers
- **Score-based System**: Calculates a risk score (0-100) for each content submission
- **Content Similarity**: Levenshtein distance algorithm to detect copy-paste spam

### 2. Content Filtering (`lib/moderation/content-filter.ts`)
- **Profanity Detection**: Filters inappropriate language (configurable word list)
- **Hate Speech Detection**: Pattern-based hate speech identification
- **Personal Information Detection**: Identifies emails, phone numbers, credit card numbers, and SSN
- **Blocked Domains/URLs**: Prevents content from known malicious sources
- **Content Sanitization**: Uses DOMPurify to clean HTML and remove malicious elements
- **Personal Info Masking**: Automatically masks PII when displaying user content

### 3. User Reputation System (`lib/moderation/reputation.ts`)
- **Reputation Score**: 0-100 score based on multiple factors
- **Factors**:
  - Account age (days)
  - Email verification status
  - Power score
  - Approval history ratio
  - Recent activity levels
- **Auto-approve**: Trusted users (score ≥ 80, approval rate ≥ 85%)
- **Auto-flag**: Suspicious users (score ≤ 30, approval rate < 50%)
- **Priority Scoring**: Determines moderation queue priority for each user

### 4. User Reporting System
- **Submit Report**: `POST /api/moderation/report` - Users can report inappropriate content
- **List Reports**: `GET/POST /api/moderation/reports` - Admin view of all reports with filtering
- **Resolve Report**: `POST /api/moderation/reports/[id]/resolve` - Admin can resolve/dismiss/block reports
- **Report Types**: WIKI_REVISION, COMMENT, USER, PERSON
- **Status Tracking**: PENDING, UNDER_REVIEW, RESOLVED, DISMISSED, BLOCKED
- **Duplicate Prevention**: Prevents users from reporting the same content multiple times

### 5. Database Schema
New models added to `prisma/schema.prisma`:

```prisma
model Report {
    id          String       @id @default(cuid())
    reporterId  String
    reporter    User         @relation("ReportReporter", fields: [reporterId], references: [id], onDelete: Cascade)
    contentType ReportContentType
    contentId   String
    reason      String
    description String?
    status      ReportStatus @default(PENDING)
    createdAt   DateTime     @default(now())
    resolvedAt  DateTime?
    resolvedBy  String?
    resolver    User?       @relation("ReportResolver", fields: [resolvedBy], references: [id], onDelete: SetNull)
}

enum ReportContentType {
    WIKI_REVISION
    COMMENT
    USER
    PERSON
}

enum ReportStatus {
    PENDING
    UNDER_REVIEW
    RESOLVED
    DISMISSED
    BLOCKED
}
```

Also added relations to `User` model:
- `reportsMade Report[] @relation("ReportReporter")`
- `reportsResolved Report[] @relation("ReportResolver")`

## Configuration (`lib/moderation/config.ts`)

### Score Thresholds
- `autoRejectThreshold`: 80 - Auto-reject content with score ≥ 80
- `manualReviewThreshold`: 40 - Flag for manual review with score ≥ 40
- `approveThreshold`: 20 - Auto-approve content with score ≤ 20

### Link Detection
- `maxLinks`: 5 - Maximum allowed links
- `maxShortenedLinks`: 2 - Maximum allowed URL shorteners
- `suspiciousDomains`: Blacklisted domains
- `urlShortenerDomains`: Known URL shortener domains

### Content Patterns
- `maxCapsRatio`: 0.7 - Max allowed uppercase ratio
- `maxRepeatedCharacters`: 10 - Max character repetitions
- `maxRepeatedWords`: 5 - Max word repetitions
- `minContentLength`: 10 - Minimum content length
- `maxContentLength`: 50000 - Maximum content length

### Keywords & Patterns
- `spamKeywords`: List of spam phrases and keywords
- `profanityKeywords`: List of profanity words
- `hateSpeechPatterns`: Regex patterns for hate speech detection
- `personalInfoPatterns`: Regex patterns for PII detection

### Reputation Thresholds
- `trustedUserScore`: 0.85 - 85% approval rate for trusted status
- `suspiciousUserScore`: 0.5 - 50% approval rate for suspicious status
- `autoApproveReputation`: 80 - Score for auto-approve
- `autoFlagReputation`: 30 - Score for manual review flag

### Feature Flags
Environment variables to enable/disable features:
- `FEATURE_SPAM_DETECTION`: Enable spam detection (default: enabled)
- `FEATURE_CONTENT_FILTERING`: Enable content filtering (default: enabled)
- `FEATURE_REPUTATION_SYSTEM`: Enable reputation system (default: enabled)
- `FEATURE_USER_REPORTING`: Enable user reporting (default: enabled)

## API Endpoints

### Submit Report
```http
POST /api/moderation/report
Content-Type: application/json

{
  "contentType": "WIKI_REVISION",
  "contentId": "revision_id",
  "reason": "Spam content",
  "description": "Optional additional details"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report submitted successfully...",
  "reportId": "report_id"
}
```

### List Reports (Admin)
```http
GET /api/moderation/reports?page=1&limit=20&status=PENDING&contentType=WIKI_REVISION
```

**Response:**
```json
{
  "reports": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Bulk Action (Admin)
```http
POST /api/moderation/reports
Content-Type: application/json

{
  "action": "bulk_approve" | "bulk_dismiss",
  "reportIds": ["id1", "id2", "id3"]
}
```

### Resolve Report (Admin)
```http
POST /api/moderation/reports/[id]/resolve
Content-Type: application/json

{
  "action": "resolve" | "dismiss" | "block",
  "resolutionNotes": "Optional notes for admin records"
}
```

## Usage Examples

### Check Content Before Submission
```typescript
import { detectSpam } from '@/lib/moderation'
import { filterContent } from '@/lib/moderation'

const content = "User's wiki content"

// Spam detection
const spamResult = detectSpam(content)
if (spamResult.shouldAutoReject) {
    return { error: 'Content rejected as spam', reasons: spamResult.reasons }
}

// Content filtering
const filterResult = filterContent(content)
if (!filterResult.passed) {
    return { error: 'Content violates policy', violations: filterResult.violations }
}
```

### Get User Reputation
```typescript
import { getUserReputation, shouldAutoApprove } from '@/lib/moderation'

const reputation = await getUserReputation(userId)

if (await shouldAutoApprove(userId)) {
    // Skip moderation, auto-approve
    await prisma.wikiRevision.update({
        where: { id },
        data: { status: 'APPROVED' }
    })
} else if (reputation.isSuspicious) {
    // Flag for manual review
    await prisma.wikiRevision.update({
        where: { id },
        data: { status: 'PENDING' }
    })
}
```

### Check Content Similarity
```typescript
import { calculateSimilarity } from '@/lib/moderation'

const existingRevisions = await prisma.wikiRevision.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: 'desc' },
    take: 5
})

const similarity = calculateSimilarity(newContent, existingRevisions[0].content)

if (similarity > 0.9) {
    // Potential duplicate submission
}
```

## Integration with Wiki Submission Flow

When a user submits a wiki revision:

1. **Pre-submission Checks**:
   - Run `detectSpam()` on content
   - Run `filterContent()` on content
   - Check `getUserReputation()` for auto-approve/auto-flag

2. **Auto-approve Path** (if conditions met):
   - Spam score < 20
   - No content violations
   - User reputation ≥ 80
   - Email verified
   - Set status to APPROVED

3. **Auto-reject Path** (if conditions met):
   - Spam score ≥ 80
   - Hate speech detected
   - Personal info detected
   - Return error to user

4. **Manual Review Path** (default):
   - Set status to PENDING
   - Include spam score in revision data
   - Priority based on reputation score
   - Admin can approve/reject in dashboard

## Security Considerations

1. **Rate Limiting**:
   - Report submission: 5 per hour per user
   - Prevents report spamming

2. **Authentication**:
   - All moderation endpoints require valid session
   - Admin-only routes verify role === 'ADMIN'

3. **Input Validation**:
   - All content validated before processing
   - Sanitized using DOMPurify

4. **Audit Logging**:
   - All moderation actions logged
   - Report resolutions tracked
   - Admin actions recorded

5. **Duplicate Prevention**:
   - Users cannot report same content twice
   - Content similarity check for duplicate submissions

## Admin Dashboard Enhancements

The moderation queue in the admin dashboard should now show:

1. **Spam Score Badge**: Visual indicator of spam likelihood
2. **Reputation Indicator**: Show user trust level
3. **Priority Sorting**: High-priority (suspicious) content first
4. **Bulk Actions**: Approve/Reject multiple items at once
5. **Content Preview**: Show detected violations and reasons
6. **Similarity Warnings**: Flag potential copy-paste spam

## Performance Considerations

- **Reputation Caching**: Cache user reputation for 5-10 minutes to avoid repeated DB queries
- **Async Processing**: Consider moving heavy spam detection to background jobs
- **Database Indexing**: Ensure proper indexes on User.reportsMade, User.reportsResolved, Report fields
- **Batch Operations**: Use bulk operations for admin actions

## Future Enhancements

- [ ] Machine Learning Spam Detection
- [ ] Advanced Hate Speech Detection (NLP-based)
- [ ] Image/Video Moderation
- [ ] Contextual Analysis (understand content context)
- [ ] Appeal System (users can appeal rejected content)
- [ ] Report Analytics Dashboard
- [ ] Automated Spam Account Detection
- [ ] Reputation Decay (older submissions count less)

## Troubleshooting

### Prisma Migration Not Found
After updating the schema, run:
```bash
npx prisma migrate dev --name add_reports
npx prisma generate
```

### Spam Detection Too Aggressive
Adjust thresholds in `lib/moderation/config.ts`:
- Increase `autoRejectThreshold` (e.g., 90)
- Decrease score penalties in spam-detector.ts
- Add domain/keyword exceptions

### False Positives on Profanity
- Update `profanityKeywords` list in config
- Consider context-aware filtering
- Add whitelisted phrases

## Support

For issues or questions about the moderation system, consult:
- Team lead or project manager
- Internal documentation/wiki
- Engineering best practices guidelines
