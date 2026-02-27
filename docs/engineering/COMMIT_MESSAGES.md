# Commit Message Format

**Audience:** Developers  
**Last Updated:** 2026-02-26

## Format

```
type(scope): description

[optional body]

[optional footer]
```

## Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Dependencies, config, tooling |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (no code change) |
| `refactor` | Code restructuring (no behavior change) |
| `test` | Adding or updating tests |
| `perf` | Performance improvements |

## Scopes

Based on actual features in codebase:

- `auth` — Authentication (signup, signin, verification)
- `submissions` — Research submissions
- `scout` — Scout application
- `dashboard` — User dashboard
- `settings` — User settings
- `email` — Email sending and templates
- `database` — Database queries and schema
- `ui` — UI components
- `deps` — Dependencies

## Rules

1. **Present tense** — "add feature" not "added feature"
2. **Lowercase** — No capital letters except proper nouns
3. **No period** — Don't end with a period
4. **Max 72 characters** — Keep it concise
5. **Imperative mood** — "fix bug" not "fixes bug"

## Real Examples from Codebase

### Features

```bash
feat(submissions): add 3-step submission form
feat(auth): add email verification flow
feat(scout): add scout application form
feat(dashboard): add statistics cards
feat(ui): add FadeIn animation component
```

### Fixes

```bash
fix(dashboard): correct hero section padding
fix(auth): prevent duplicate email accounts
fix(submissions): handle empty enum fields
fix(mobile): fix navbar overflow on small screens
fix(email): correct verification link format
```

### Chores

```bash
chore(deps): update next to 16.1.6
chore(deps): add framer-motion
chore(config): configure sentry
chore(prisma): update schema for scout fields
chore(eslint): add typescript rules
```

### Documentation

```bash
docs(auth): add TECHNICAL.md
docs(readme): update environment setup
docs(api): document server actions
docs(contributing): add PR template
```

### Refactoring

```bash
refactor(auth): extract email sending to lib/email
refactor(submissions): move queries to lib/database
refactor(ui): consolidate button variants
```

## With Body

For complex changes, add a body:

```bash
feat(submissions): add draft auto-save

Automatically saves draft every 30 seconds to prevent data loss.
Uses debounced save to avoid excessive database writes.
Shows "Saving..." indicator during save operation.
```

## With Footer

Reference issues or breaking changes:

```bash
fix(auth): correct session expiration logic

Fixes #123

BREAKING CHANGE: Session now expires after 24 hours instead of 30 days
unless "Remember me" is checked.
```

## What NOT to Write

❌ **BAD:**
```bash
Fixed stuff
Update
WIP
asdf
Fixed the bug where the thing wasn't working
```

✅ **GOOD:**
```bash
fix(auth): prevent account lockout on valid password
feat(submissions): add duplicate detection
chore(deps): update prisma to 5.22.0
```

## Jira Integration

If using Jira, reference tickets in footer:

```bash
feat(submissions): add comment system

Allows users to comment on their own submissions.
Comments are visible only to user and admins.

JIRA: SCOUT-123
```

## Commit Frequency

- Commit logical units of work
- Don't commit broken code
- Don't wait until end of day to commit
- Squash commits before merging PR

## Amending Commits

If you need to fix the last commit:

```bash
# Fix files
git add .
git commit --amend --no-edit

# Or change message
git commit --amend -m "feat(submissions): add draft auto-save"
```

## Summary

**Good commit message = type(scope): what you did**

```bash
feat(auth): add email verification
fix(dashboard): correct padding on mobile
chore(deps): update dependencies
docs(api): document submission actions
```
