# Scout Application Reminders Feature

## Overview
Implemented a comprehensive reminder system for pending scout applications with email notifications to the team and visual confirmation for users.

## Features Implemented

### 1. Team Notifications
- **Initial Application**: When someone applies to be a scout, emails are sent to:
  - `it@cofactor.world`
  - `team@cofactor.world`
- Email includes: applicant name, email, university, department, role, research areas, and submission date

### 2. Reminder System
- **One Application Per User**: Users can only apply once
- **Weekly Reminders**: After applying, users can send a reminder once per week
- **30-Day Expiration**: After 30 days with no response, users can reapply
- **Visual Feedback**: Users see confirmation when reminder is sent

### 3. Database Changes
Added `lastReminderSent` field to User model:
```prisma
lastReminderSent DateTime?
```

### 4. Email Templates
Three new email templates:
- **scoutApplicationNotification**: Sent to team when application submitted
- **scoutApplicationReminder**: Sent to team when user requests status update
- **reminderConfirmation**: Sent to user confirming reminder was sent

### 5. User Interface
When application is pending, users see:
- Application submission date
- Days since application
- Last reminder sent date (if applicable)
- "Send Reminder" button (enabled once per week)
- Success/error messages
- Countdown until next reminder is available

## Technical Implementation

### Files Modified
1. **prisma/schema.prisma**: Added `lastReminderSent` field
2. **lib/email/templates.ts**: Added 3 new email templates
3. **lib/email/send.ts**: Added 3 new email functions
4. **actions/scout.actions.ts**: 
   - Added `sendScoutApplicationReminder()` action
   - Updated `submitScoutApplication()` to send team notifications
5. **app/scout/apply/page.tsx**: Added logic for pending status and expiration
6. **app/scout/apply/scout-application-form.tsx**: Added pending status UI with reminder button

### Logic Flow

#### Application Submission
1. User submits application
2. Application status set to `PENDING`
3. `scoutApplicationDate` recorded
4. Confirmation email sent to user
5. Notification email sent to `it@cofactor.world` and `team@cofactor.world`

#### Reminder Request
1. User clicks "Send Reminder" button
2. System checks:
   - Application is still `PENDING`
   - Less than 30 days since application
   - At least 7 days since last reminder (or no reminder sent)
3. If valid:
   - Update `lastReminderSent` to current date
   - Send reminder email to team
   - Send confirmation email to user
   - Show success message
4. If expired (>30 days):
   - Reset application status to `NOT_APPLIED`
   - Allow user to reapply

#### Time Constraints
- **Weekly Limit**: 7 days between reminders
- **Monthly Expiration**: 30 days total before reapplication allowed
- **Maximum Reminders**: ~4 reminders possible (weeks 1, 2, 3, 4)

## Email Recipients
- **it@cofactor.world**: Receives all application and reminder notifications
- **team@cofactor.world**: Receives all application and reminder notifications

## User Experience
1. **Apply**: User submits application → sees success page
2. **Pending**: User visits `/scout/apply` → sees pending status with reminder option
3. **Reminder**: User clicks "Send Reminder" → sees confirmation message
4. **Wait**: Button disabled for 7 days with countdown
5. **Expired**: After 30 days → can reapply

## Next Steps
To test:
1. Restart dev server: `npm run dev`
2. Apply to be a scout
3. Check emails at `it@cofactor.world` and `team@cofactor.world`
4. Visit `/scout/apply` to see pending status
5. Click "Send Reminder" to test reminder flow
