# Scout Application - Changelog

**Last Updated:** 2026-03-06

## [2026-03-06] Resume + Cover Letter Uploads

### Added
- Required resume upload on scout application form
- Optional cover letter upload on scout application form
- Server-side validation for document type (`.pdf`, `.doc`, `.docx`) and size (5MB max)
- Persistence of uploaded scout application documents on user records
- Temporary draft persistence for unauthenticated applications so files survive signup handoff
- Resume and cover letter metadata in admin scout review list
- Resume and cover letter metadata in scout application notification emails

## [2026-02-26] Initial Implementation

### Added
- Scout application form with profile fields
- Application during sign-up flow
- Application status tracking (NOT_APPLIED, PENDING, APPROVED, REJECTED)
- Confirmation emails to applicants
- Notification emails to admin
- Application date tracking

### Form Fields
- University affiliation
- Department
- LinkedIn URL (optional)
- User role (PhD student, postdoc, professor, etc.)
- Research areas
- Why become a Scout
- How to source leads

### Status Flow
- NOT_APPLIED → PENDING → APPROVED or REJECTED
- Can reapply after 30 days if rejected

### Security
- Email verification required
- Application data validated
- Admin-only approval

---

## Future Enhancements

- [ ] Admin dashboard for application review
- [ ] Approve/reject buttons in UI
- [ ] Rejection reason field
- [ ] Reapplication tracking
- [ ] Application analytics
- [ ] Batch approval
- [ ] Application search and filters
