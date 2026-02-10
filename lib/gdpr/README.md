# GDPR Compliance Module

This module provides comprehensive GDPR-compliant data export and deletion functionality for the Cofactor Club platform.

## Features

- **Data Export (Right to Portability)**: Users can request a complete export of their data in JSON and CSV formats
- **Data Deletion (Right to be Forgotten)**: Two modes of deletion with email confirmation
  - Soft Delete/Anonymization: Replaces PII with anonymized data, preserves contributions
  - Hard Delete: Complete removal of user and associated data
- **Background Job Queue**: Handles export generation and deletion asynchronously
- **Audit Logging**: Comprehensive logging of all GDPR actions for compliance
- **Rate Limiting**: Prevents abuse of GDPR endpoints
- **Secure Tokens**: 24-hour expiring tokens for deletion confirmation

## File Structure

```
lib/gdpr/
├── index.ts          # Module exports
├── data-mapper.ts    # Data relationship documentation
├── export.ts         # Export generation logic
├── anonymize.ts      # Anonymization and deletion logic
├── queue.ts          # Background job queue
└── audit.ts          # GDPR audit logging

app/api/gdpr/
├── export/
│   ├── request/
│   │   └── route.ts  # POST: Request data export
│   └── download/
│       └── [id]/
│           └── route.ts  # GET: Download export file
└── delete/
    ├── request/
    │   └── route.ts  # POST: Request deletion
    └── confirm/
        └── route.ts  # POST: Confirm deletion with token

app/privacy/
└── page.tsx          # Privacy policy and GDPR rights page
```

## API Endpoints

### Data Export

#### Request Export
```http
POST /api/gdpr/export/request
Content-Type: application/json

{
  "format": "both" // "json", "csv", or "both"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data export request received...",
  "exportId": "abc123...",
  "estimatedTime": "5-10 minutes",
  "expiresIn": "7 days"
}
```

**Rate Limit:** 3 requests per 24 hours per user

#### Download Export
```http
GET /api/gdpr/export/download/{exportId}
```

Downloads the generated export file. Files are available for 7 days after generation.

#### Check Export Status
```http
GET /api/gdpr/export/request
```

Returns the user's export history and current status.

### Data Deletion

#### Request Deletion
```http
POST /api/gdpr/delete/request
Content-Type: application/json

{
  "mode": "soft" // "soft" or "hard"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deletion confirmation email sent...",
  "expiresAt": "2025-02-11T10:00:00Z",
  "warnings": [...],
  "contentSummary": {
    "wikiRevisions": 5,
    "pageVersions": 3,
    "bookmarks": 10
  }
}
```

**Rate Limit:** 2 requests per 24 hours per user

#### Confirm Deletion
```http
POST /api/gdpr/delete/confirm
Content-Type: application/json

{
  "token": "secure-token-from-email"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Your account has been anonymized...",
  "mode": "soft",
  "preservedContent": ["Wiki revisions (anonymized author)"],
  "deletedRecords": {
    "Notifications": 15,
    "Bookmarks": 10
  }
}
```

#### Validate Token
```http
GET /api/gdpr/delete/confirm?token=xxx
```

Validates a deletion token (used by confirmation page).

## Deletion Modes

### Soft Delete (Anonymization)
- Email replaced with hash@anonymized.local
- Name replaced with "Anonymous User"
- Bio, password, and socialStats removed
- Referral code regenerated
- Wiki revisions and page versions preserved but anonymized
- All personal notifications, bookmarks, and preferences deleted

### Hard Delete
- Complete removal of user record
- Cascading deletion of all related records
- Wiki content may be preserved without author attribution (depending on referential integrity)
- Falls back to soft delete if constraints prevent hard delete

## Data Included in Export

The export includes all user data organized by category:

1. **Profile Information**
   - Basic info (name, email, bio)
   - University affiliations
   - Referral code and power score

2. **Activity Data**
   - Wiki revisions with content
   - Page versions authored
   - Referrals made and received
   - Bookmarks

3. **System Data**
   - Notifications
   - Calendar events
   - Custom field values
   - Experiment assignments

4. **Preferences**
   - Notification settings
   - User preferences (timezone, language, theme)

## Environment Variables

```bash
# Optional: Custom directory for GDPR export files
GDPR_EXPORT_DIR=./tmp/gdpr-exports

# Required: For generating download URLs
NEXTAUTH_URL=https://your-domain.com

# Required: For sending confirmation emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Cofactor Club <no-reply@cofactor.world>"
```

## Database Schema Updates

The GDPR module requires the following schema additions (already in schema.prisma):

```prisma
model DeletionRequest {
    id          String   @id @default(cuid())
    userId      String   @unique
    user        User     @relation("DeletionRequestUser", fields: [userId], references: [id], onDelete: Cascade)
    token       String   @unique
    mode        DeletionMode
    status      DeletionStatus @default(PENDING)
    expiresAt   DateTime
    confirmedAt DateTime?
    createdAt   DateTime @default(now())
}

enum DeletionMode {
    SOFT
    HARD
}

enum DeletionStatus {
    PENDING
    CONFIRMED
    EXPIRED
    FAILED
}
```

After updating the schema, run:
```bash
npx prisma migrate dev --name add_deletion_requests
npx prisma generate
```

## Security Considerations

1. **Authentication Required**: All GDPR endpoints require valid session
2. **Rate Limiting**: Strict limits prevent abuse
3. **Secure Tokens**: Deletion tokens are 256-bit random values, valid for 24 hours
4. **Email Confirmation**: Deletion requires email verification to prevent accidental/malicious deletion
5. **Audit Trail**: All actions are logged with user ID, timestamp, and IP
6. **File Security**: Export files are stored temporarily (7 days) with random filenames
7. **CSRF Protection**: API endpoints validate origin and session

## Usage Example

### Requesting Data Export

```typescript
const response = await fetch('/api/gdpr/export/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ format: 'both' })
})

const data = await response.json()
// data.exportId can be used to check status
```

### Requesting Account Deletion

```typescript
const response = await fetch('/api/gdpr/delete/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mode: 'soft' })
})

const data = await response.json()
// User receives confirmation email with token
```

### Confirming Deletion

```typescript
const response = await fetch('/api/gdpr/delete/confirm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: 'token-from-email' })
})
```

## Testing

To test the GDPR functionality:

1. **Export Flow:**
   - Log in as a test user
   - Create some content (wiki edits, bookmarks)
   - Request export at `/privacy`
   - Check email for notification
   - Download export file
   - Verify all data is present

2. **Deletion Flow:**
   - Log in as a test user
   - Request deletion at `/privacy`
   - Check email for confirmation link
   - Click confirmation link
   - Verify account is anonymized/deleted
   - Check that wiki contributions remain but are anonymized

## Compliance Notes

- **Article 15 (Right of Access)**: Provided via export functionality
- **Article 16 (Right to Rectification)**: Users can edit profile in settings
- **Article 17 (Right to Erasure)**: Soft and hard deletion modes
- **Article 20 (Right to Portability)**: JSON and CSV formats provided
- **Article 25 (Data Protection by Design)**: Anonymization preserves content integrity
- **Audit Trail**: All GDPR actions logged for compliance verification

## Future Enhancements

- [ ] Automated periodic cleanup of expired deletion requests
- [ ] Export file encryption with password
- [ ] Bulk export for admin compliance requests
- [ ] Data portability to other formats (XML, etc.)
- [ ] Automated data retention policy enforcement
