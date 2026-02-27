# Testing Guide

**Audience:** Developers  
**Last Updated:** 2026-02-26

## Running the Dev Server

```bash
# Start development server
npm run dev

# Visit http://localhost:3000
```

## Manual Testing Flows

### Authentication Flow

**1. Sign Up**
```
1. Go to http://localhost:3000/auth/signup
2. Enter email, password, full name
3. Click "Sign Up"
4. Check email for verification link
5. Click verification link
6. Verify redirected to sign-in page
```

**2. Email Verification**
```
1. Check email inbox
2. Find "Verify your email address" email
3. Click verification link
4. Verify redirected to sign-in with success message
```

**3. Sign In**
```
1. Go to http://localhost:3000/auth/signin
2. Enter email and password
3. Optional: Check "Remember me"
4. Click "Sign In"
5. Verify redirected to dashboard
```

**4. Password Reset**
```
1. Go to http://localhost:3000/auth/signin
2. Click "Forgot password?"
3. Enter email
4. Click "Send reset link"
5. Check email for reset link
6. Click reset link
7. Enter new password
8. Click "Reset password"
9. Verify redirected to sign-in
10. Sign in with new password
```

**5. Account Lockout**
```
1. Go to sign-in page
2. Enter correct email, wrong password
3. Click "Sign In" 5 times
4. Verify account locked message
5. Wait 15 minutes OR reset lockedUntil in database
6. Try signing in again
7. Verify can sign in
```

### Submission Flow

**1. Create Draft**
```
1. Sign in
2. Go to dashboard
3. Click "Submit Research Lead"
4. Fill in Step 1 (research summary)
5. Click "Save & Continue"
6. Verify redirected to Step 2
7. Fill in Step 2 (additional details)
8. Click "Save & Continue"
9. Verify redirected to Step 3
10. Fill in Step 3 (scout pitch)
11. Click "Save Draft"
12. Verify redirected to drafts page
13. Verify draft appears in table
```

**2. Submit Research**
```
1. Go to drafts page
2. Click "Continue" on a draft
3. Review all information
4. Click "Submit Research"
5. Verify redirected to dashboard
6. Verify submission appears in submissions table
7. Verify status is "Pending Research"
8. Check email for submission confirmation
```

**3. View Submission**
```
1. Go to dashboard
2. Click on a submission in the table
3. Verify all details displayed correctly
4. Verify status badge shows correct color
```

**4. Delete Draft**
```
1. Go to drafts page
2. Click "Delete" on a draft
3. Confirm deletion
4. Verify draft removed from table
```

### Scout Application Flow

**1. Apply as Scout (Logged In)**
```
1. Sign in as Contributor
2. Go to dashboard
3. Click "Apply to be a Scout"
4. Fill in all fields:
   - University
   - Department
   - LinkedIn (optional)
   - Role
   - Research areas
   - Why scout
   - How source leads
5. Click "Submit Application"
6. Verify redirected to submitted page
7. Check email for application confirmation
8. Verify badge still shows "Community Contributor"
```

**2. Apply as Scout (Not Logged In)**
```
1. Go to http://localhost:3000/scout/apply
2. Fill in all fields including email and password
3. Click "Submit Application"
4. Verify account created
5. Check email for verification link
6. Verify email for application confirmation
7. Sign in
8. Verify application status is "Pending"
```

**3. Admin Approves Scout Application**
```
1. Sign in as admin
2. Go to admin dashboard (if exists)
3. Find pending scout application
4. Click "Approve"
5. Verify user role changed to SCOUT
6. Verify user receives approval email
7. Sign in as that user
8. Verify badge shows "Verified Scout"
```

### Settings Flow

**1. Update Profile**
```
1. Sign in
2. Go to settings
3. Update display name
4. Update bio
5. Click "Save Changes"
6. Verify success message
7. Go to dashboard
8. Verify name updated in navbar
```

**2. Change Password**
```
1. Go to settings
2. Click "Account" tab
3. Enter current password
4. Enter new password
5. Confirm new password
6. Click "Change Password"
7. Verify success message
8. Sign out
9. Sign in with new password
10. Verify can sign in
```

## Testing Loading States

Use artificial delay to test loading states:

```typescript
// Add to any Server Action
export async function saveDraft(data: any) {
  const session = await requireAuth()
  
  // Artificial delay for testing
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // Rest of function
}
```

**Test:**
1. Add delay to action
2. Trigger the action
3. Verify loading spinner appears
4. Verify button is disabled
5. Verify loading text shows
6. Wait for completion
7. Verify success state
8. Remove delay before committing

## Testing Error States

### Network Error
```
1. Disconnect internet
2. Try to submit form
3. Verify error message shows
4. Reconnect internet
5. Try again
6. Verify success
```

### Validation Error
```
1. Submit form with invalid data
2. Verify validation errors show
3. Verify fields highlighted
4. Fix errors
5. Submit again
6. Verify success
```

### Server Error
```
1. Temporarily break Server Action (throw error)
2. Try to submit form
3. Verify error message shows
4. Fix Server Action
5. Try again
6. Verify success
```

## Testing Mobile Responsiveness

### Breakpoints to Test

- **Mobile:** 375px width (iPhone SE)
- **Tablet:** 768px width (iPad)
- **Desktop:** 1920px width

### How to Test

**Chrome DevTools:**
```
1. Open DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select device or enter custom dimensions
4. Test all pages
```

**What to Check:**
- [ ] Navigation menu works
- [ ] Forms are usable
- [ ] Buttons are tappable (min 44x44px)
- [ ] Text is readable (no tiny fonts)
- [ ] Images scale properly
- [ ] No horizontal scroll
- [ ] Cards stack vertically
- [ ] Padding adjusts appropriately

## Pre-PR Testing Checklist

Before opening a PR, test:

- [ ] Happy path works end-to-end
- [ ] Loading states work
- [ ] Error states work
- [ ] Validation works
- [ ] Mobile responsive (375px, 768px, 1920px)
- [ ] No console errors
- [ ] No console warnings
- [ ] Works in Chrome
- [ ] Works in Safari (if on Mac)
- [ ] Works in Firefox
- [ ] Sign out and sign in still works
- [ ] Existing features still work

## Common Issues to Check

### Authentication
- [ ] Can sign up
- [ ] Can verify email
- [ ] Can sign in
- [ ] Can sign out
- [ ] Can reset password
- [ ] Session persists on refresh
- [ ] Redirects work correctly

### Forms
- [ ] Validation works
- [ ] Error messages clear
- [ ] Success messages show
- [ ] Loading states work
- [ ] Can submit with Enter key
- [ ] Can navigate with Tab key
- [ ] Required fields enforced

### Navigation
- [ ] All links work
- [ ] Back button works
- [ ] Breadcrumbs work (if present)
- [ ] Active page highlighted
- [ ] Protected routes redirect to sign-in

### Data
- [ ] Data saves correctly
- [ ] Data loads correctly
- [ ] Data updates correctly
- [ ] Data deletes correctly
- [ ] Ownership enforced
- [ ] No data leaks between users

## Automated Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Files Location

```
tests/
└── unit/
    ├── security/
    │   ├── password.test.ts
    │   ├── rate-limit.test.ts
    │   └── sanitization.test.ts
    ├── validation/
    │   └── schemas.test.ts
    └── utils/
        └── utils.test.ts
```

## Database Testing

### Reset Database

```bash
# WARNING: Deletes all data
npx prisma migrate reset

# Or just push schema
npx prisma db push
```

### Seed Test Data

```bash
# Create test users manually in Prisma Studio
npx prisma studio

# Or use instrumentation.ts to create admin
# Set ADMIN_EMAIL and ADMIN_PASSWORD in .env
npm run dev
```

## Questions?

- Testing issues: Ask in team chat
- Flaky tests: Document in BUGS.md
- New test needed: Add to this guide
