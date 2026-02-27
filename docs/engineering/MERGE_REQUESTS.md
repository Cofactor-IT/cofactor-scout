# Merge Requests (Pull Requests)

**Audience:** Developers  
**Last Updated:** 2026-02-26

## When to Open a PR

**Every change requires a PR. No exceptions.**

- New features
- Bug fixes
- Refactoring
- Documentation updates
- Dependency updates
- Configuration changes

**Never commit directly to `main`.**

## PR Title Format

Use the same format as commit messages:

```
type(scope): description
```

**Examples:**
```
feat(submissions): add draft auto-save
fix(dashboard): correct mobile padding
chore(deps): update next to 16.1.6
docs(auth): add technical documentation
```

## PR Description Must Include

### 1. What Changed and Why

Explain the change in 2-3 sentences:

```markdown
## What changed and why

Added auto-save functionality to the submission form to prevent data loss.
The form now saves every 30 seconds while the user is typing.
```

### 2. Type of Change

```markdown
## Type of change

- [x] New feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation
- [ ] Chore
```

### 3. Screenshots (UI Changes Only)

If your PR changes any UI, include before/after screenshots:

```markdown
## Screenshots

### Before
![before](url)

### After
![after](url)
```

### 4. How to Test

Step-by-step instructions for reviewers:

```markdown
## How to test

1. Go to `/dashboard/submit`
2. Fill in the first step
3. Wait 30 seconds
4. Refresh the page
5. Verify data is still there
```

### 5. Migrations Needed

If database schema changed:

```markdown
## Migrations

Run `npx prisma db push` after pulling this branch.
```

### 6. Jira Ticket Reference

```markdown
## Related Issues

SCOUT-123
```

## Review Requirements

### Before Requesting Review

- [ ] All CI checks pass
- [ ] Follows [CODE_STANDARDS.md](../pm-notes/CODE_STANDARDS.md)
- [ ] JSDoc comments on all exported functions
- [ ] No `console.log` statements
- [ ] No `any` types
- [ ] Tested locally end-to-end
- [ ] Loading states work
- [ ] Error states work
- [ ] Mobile responsiveness checked
- [ ] No unnecessary files created

### Approval Requirements

- **1 approval minimum** from team member
- **All conversations resolved**
- **All CI checks passing**

### Who Reviews What

- **NF reviews Theis's PRs**
- **Theis reviews NF's PRs**
- For urgent fixes, request immediate review

## How to Handle Review Feedback

### Types of Feedback

**1. Blocking Issues (Must Fix)**
- Security vulnerabilities
- Breaking changes
- CODE_STANDARDS.md violations
- Missing tests for critical paths
- Performance issues

**2. Suggestions (Should Consider)**
- Code organization improvements
- Better naming
- Additional edge cases
- Documentation improvements

**3. Nitpicks (Optional)**
- Formatting preferences
- Alternative approaches
- Minor optimizations

### Responding to Feedback

**Do:**
- Address all blocking issues before re-requesting review
- Explain your reasoning if you disagree
- Ask clarifying questions
- Mark conversations as resolved after fixing

**Don't:**
- Ignore feedback
- Get defensive
- Make changes without explanation
- Leave conversations unresolved

## Merge Strategy

**Use "Squash and Merge"**

This keeps the main branch history clean with one commit per PR.

### Before Merging

1. All approvals received
2. All conversations resolved
3. All CI checks passing
4. Branch is up to date with main

### After Merging

1. Delete the branch
2. Verify deployment succeeded (if auto-deploy enabled)
3. Monitor for errors in Sentry

## Turnaround Expectation

- **Standard PRs:** Review within 24 hours
- **Urgent fixes:** Review within 2 hours
- **Large PRs (500+ lines):** May take 48 hours

## PR Size Guidelines

**Ideal PR size:** 100-300 lines changed

**If your PR is >500 lines:**
- Consider breaking into smaller PRs
- Add extra context in description
- Highlight areas that need careful review

## Common PR Mistakes

### ❌ BAD

```markdown
## What changed

Updated stuff

## How to test

Test it
```

### ✅ GOOD

```markdown
## What changed and why

Added email verification to the signup flow to prevent fake accounts.
Users must click a link in their email before they can sign in.

## How to test

1. Go to `/auth/signup`
2. Create account with your email
3. Check your email for verification link
4. Click the link
5. Try to sign in
6. Verify you can access dashboard
```

## PR Template

Use the template in `.github/PULL_REQUEST_TEMPLATE.md` which includes all required sections.

## Emergency Hotfixes

For critical production bugs:

1. Create branch from `main`
2. Fix the bug
3. Open PR marked as **URGENT**
4. Request immediate review
5. Merge as soon as approved
6. Monitor deployment closely

## Questions?

- Review process: Ask in team chat
- Technical questions: Comment on the PR
- Urgent issues: Direct message reviewer
