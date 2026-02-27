# Research Submissions - Changelog

**Last Updated:** 2026-02-26

## [2026-02-26] Initial Implementation

### Added
- 3-step submission form (research summary, details, pitch)
- Draft auto-save functionality
- Duplicate detection by research topic
- Submission confirmation emails
- Draft management (view, edit, delete)
- Submission tracking with status pipeline
- User statistics (total, pending, approved)

### Form Fields

**Step 1 - Research Summary:**
- Research topic
- Research description
- Researcher name
- Researcher email
- Researcher institution
- Researcher department

**Step 2 - Additional Details:**
- Researcher career stage (with OTHER option)
- Researcher LinkedIn (optional)
- Research stage
- Funding status
- Key publications (optional)
- Potential applications (optional)
- Supporting links (JSON array)
- Submission source
- Relationship to researcher
- Researcher awareness (boolean)

**Step 3 - Scout Pitch:**
- Why interesting

### Status Pipeline
- PENDING_RESEARCH — Initial submission
- VALIDATING — Team reviewing
- PITCHED_MATCHMAKING — Presented to investors
- MATCH_MADE — Successfully matched
- REJECTED — Did not meet criteria

### Security
- Authentication required for all actions
- Ownership verification before operations
- Draft status verification before deletion
- Enum field normalization

### UI Components
- FormFooter — Navigation buttons
- FormInput — Input wrapper
- FormSelect — Select wrapper
- FormTextarea — Textarea wrapper
- ProgressStepper — Step indicator
- ReviewCard — Submission review display

---

## Future Enhancements

- [ ] Comments on submissions
- [ ] File attachments (PDFs, images)
- [ ] Advanced duplicate detection (fuzzy matching)
- [ ] Submission templates
- [ ] Bulk import
- [ ] Export submissions to CSV
- [ ] Submission analytics dashboard
- [ ] Email notifications for status changes
- [ ] In-app notifications
- [ ] Submission search and filters
