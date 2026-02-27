# Branching Strategy

**Audience:** Developers  
**Last Updated:** 2026-02-26

## Branch Types

### feature/

New features and enhancements

**Format:** `feature/short-description`

**Examples:**
```bash
feature/draft-auto-save
feature/scout-application-form
feature/email-verification
feature/submission-comments
```

### fix/

Bug fixes

**Format:** `fix/short-description`

**Examples:**
```bash
fix/dashboard-padding
fix/email-verification-link
fix/submission-duplicate-check
fix/mobile-navbar-overflow
```

### chore/

Dependencies, configuration, non-code changes

**Format:** `chore/short-description`

**Examples:**
```bash
chore/update-dependencies
chore/add-sentry
chore/configure-eslint
chore/update-prisma
```

### docs/

Documentation only

**Format:** `docs/short-description`

**Examples:**
```bash
docs/add-authentication-guide
docs/update-readme
docs/add-deployment-guide
```

## Rules

1. **Always branch from `main`**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature
   ```

2. **Never commit directly to `main`**
   - All changes go through pull requests
   - No exceptions, even for "quick fixes"

3. **Delete branch after merge**
   ```bash
   git branch -d feature/your-feature
   ```

4. **One feature per branch**
   - Don't mix unrelated changes
   - If you need to fix something else, create a new branch

5. **Keep branches short-lived**
   - Merge within 1-2 days
   - Large features should be broken into smaller PRs

6. **Sync with main regularly**
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/your-feature
   git merge main
   ```

## Workflow

```bash
# 1. Create branch
git checkout -b feature/draft-auto-save

# 2. Make changes
# ... edit files ...

# 3. Commit (see COMMIT_MESSAGES.md)
git add .
git commit -m "feat(submissions): add draft auto-save"

# 4. Push
git push origin feature/draft-auto-save

# 5. Open PR on GitHub

# 6. After merge, delete branch
git checkout main
git pull origin main
git branch -d feature/draft-auto-save
```

## Branch Naming Tips

✅ **GOOD:**
- `feature/draft-auto-save`
- `fix/mobile-navbar`
- `chore/update-deps`

❌ **BAD:**
- `my-branch` (no type prefix)
- `feature/fix-bug-and-add-feature` (mixed concerns)
- `feature/JIRA-123` (not descriptive)
- `feature/draft_auto_save` (use hyphens, not underscores)

## Protected Branches

- `main` — Production code, requires PR + approval
- No force pushes allowed
- All CI checks must pass

## Emergency Hotfixes

For critical production bugs:

```bash
# 1. Branch from main
git checkout main
git pull origin main
git checkout -b fix/critical-auth-bug

# 2. Fix and test thoroughly
# ... make fix ...

# 3. Fast-track PR
# - Mark as urgent
# - Request immediate review
# - Deploy after merge

# 4. Clean up
git checkout main
git pull origin main
git branch -d fix/critical-auth-bug
```
