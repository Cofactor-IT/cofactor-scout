# Authentication - Changelog

**Last Updated:** 2026-02-26

## [2026-02-26] Initial Implementation

### Added
- Sign up with email, password, and full name
- Email verification required before sign-in
- Sign in with email and password
- "Remember me" option (30-day session vs 24-hour)
- Password reset flow with email link
- Account lockout after 5 failed attempts (15-minute lock)
- Resend verification email functionality
- Welcome email after verification
- Sign-in notification emails
- Admin bypass for email verification

### Security
- Password hashing with bcrypt (cost factor 10)
- Verification tokens expire after 24 hours
- Reset tokens expire after 1 hour
- Constant-time responses to prevent account enumeration
- Failed login attempt tracking
- Automatic account unlock after 15 minutes
- JWT sessions with configurable expiration
- HTTP-only session cookies

### Database
- User model with authentication fields
- PasswordReset model for reset tokens
- Role enum (CONTRIBUTOR, SCOUT, ADMIN)
- Indexes on email, role, and tokens

### UI
- Sign up page with form validation
- Sign in page with "Remember me" checkbox
- Forgot password page
- Reset password page
- Email verification success page
- Loading states on all buttons
- Error message display
- Mobile-responsive forms

---

## Future Enhancements

- [ ] Two-factor authentication (schema ready)
- [ ] OAuth providers (Google, LinkedIn)
- [ ] Password strength meter
- [ ] Account deletion
- [ ] Email change with verification
- [ ] Session management page (view active sessions)
- [ ] Login history
