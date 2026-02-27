# Authentication - Primer

**Audience:** Non-technical, Product Managers  
**Last Updated:** 2026-02-26

## What is Authentication?

Authentication is how Cofactor Scout verifies you are who you say you are. It's like showing your ID at the door—we need to know it's really you before letting you in.

## Sign Up Flow

**Step 1: Create Account**
- User enters email, password, and full name
- System checks if email is already registered
- Password must be strong (8+ characters, uppercase, lowercase, number, special character)
- Account is created but not yet active

**Step 2: Email Verification**
- System sends verification email with a unique link
- Link expires after 24 hours
- User clicks link to verify their email address
- Account becomes active

**Step 3: Sign In**
- User can now sign in with email and password
- System creates a session that lasts 24 hours (or 30 days if "Remember me" is checked)

## Sign In Flow

**Step 1: Enter Credentials**
- User enters email and password
- Optional: Check "Remember me" for 30-day session

**Step 2: Verification**
- System checks if email exists
- System checks if email is verified
- System checks if account is locked
- System verifies password matches

**Step 3: Success**
- User is redirected to dashboard
- Session is created
- User stays signed in until session expires or they sign out

## Email Verification

**Why is it required?**
- Prevents fake accounts
- Ensures we can contact users
- Reduces spam and abuse

**What if I didn't receive the email?**
- Check spam folder
- Request a new verification email
- Contact support if still not received

## Password Reset

**Step 1: Request Reset**
- User clicks "Forgot password?"
- Enters their email address
- System sends reset link (expires in 1 hour)

**Step 2: Reset Password**
- User clicks link in email
- Enters new password
- Password must meet strength requirements

**Step 3: Sign In**
- User can now sign in with new password
- Old password no longer works

## Account Security

### Account Lockout

**What happens:**
- After 5 failed sign-in attempts, account locks for 15 minutes
- Prevents brute-force password guessing
- Automatic unlock after 15 minutes

**Why:**
- Protects your account from hackers
- Prevents automated attacks

### Session Management

**Session Duration:**
- Default: 24 hours
- With "Remember me": 30 days

**What is a session?**
- A session is like a temporary pass that proves you're signed in
- When it expires, you need to sign in again
- Signing out ends the session immediately

## User Roles

### Contributor (Default)
- Automatically assigned on sign up
- Can submit research leads immediately
- Standard commission rates
- Gray badge on submissions

### Scout (Verified)
- Must apply and be approved by admin
- Priority review of submissions
- Higher commission rates
- Green "Verified Scout" badge

### Admin
- Full platform access
- Can review scout applications
- Can manage users
- Can view all submissions

## Common Questions

**Q: Why do I need to verify my email?**  
A: To prevent fake accounts and ensure we can contact you about your submissions.

**Q: How long does verification take?**  
A: Email arrives within 1-2 minutes. Check spam if not received.

**Q: Can I change my email address?**  
A: Not currently. Contact support if you need to change your email.

**Q: What if I forget my password?**  
A: Use the "Forgot password?" link on the sign-in page.

**Q: How do I become a Scout?**  
A: Apply through the Scout application form. Admin will review and approve.

**Q: Can I have multiple accounts?**  
A: No, one account per email address.

## Security Features

- Passwords are encrypted (never stored in plain text)
- Email verification required before sign-in
- Account lockout after failed attempts
- Password reset links expire after 1 hour
- Sessions expire automatically
- Sign-in notifications sent to your email

## What We Don't Do

- We never ask for your password via email
- We never share your email with third parties
- We never store your password in plain text
- We never sign you in without email verification (except admin)
