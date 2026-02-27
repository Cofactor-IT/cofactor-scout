# Research Submissions - Known Bugs

**Last Updated:** 2026-02-26

## Known Bugs

None currently known.

## Fixed Bugs

### [2026-02-26] Enum fields causing validation errors

**Description:** Empty string values in enum fields (career stage, funding status, etc.) were causing Prisma validation errors.

**Root Cause:** Form submits empty strings for unselected dropdowns, but Prisma expects null for optional enum fields.

**Fix Applied:** Added enum normalization in `saveDraft()`:
```typescript
const cleanData = {
  ...restData,
  researcherCareerStage: restData.researcherCareerStage && 
    restData.researcherCareerStage !== '' ? 
    restData.researcherCareerStage : null,
  // ... other enum fields
}
```

---

## Reporting Bugs

Use the [bug report template](../../../.github/ISSUE_TEMPLATE/bug_report.md) to report submission issues.

Include:
- Steps to reproduce
- Which step of the form (1, 2, or 3)
- Expected vs actual behavior
- Error messages (if any)
