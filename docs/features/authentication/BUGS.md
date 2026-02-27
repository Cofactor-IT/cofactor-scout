# Authentication - Known Bugs

**Last Updated:** 2026-02-26

## Known Bugs

None currently known.

## Fixed Bugs

### [2026-02-26] Account lockout not resetting on successful login

**Description:** Failed login attempts counter was not being reset after successful login, causing accounts to eventually lock even with correct password.

**Root Cause:** Missing database update to reset `failedLoginAttempts` to 0 after successful authentication.

**Fix Applied:** Added reset logic in NextAuth authorize callback:
```typescript
if (user.failedLoginAttempts && user.failedLoginAttempts > 0) {
  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null }
  })
}
```

---

## Reporting Bugs

Use the [bug report template](../../../.github/ISSUE_TEMPLATE/bug_report.md) to report authentication issues.

Include:
- Steps to reproduce
- Expected vs actual behavior
- Browser and device info
- Error messages (if any)
