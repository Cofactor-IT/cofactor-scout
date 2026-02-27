# Scout Application - Changelog

**Last Updated:** 2026-02-26

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
