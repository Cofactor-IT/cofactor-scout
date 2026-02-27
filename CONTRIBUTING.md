# Contributing to Cofactor Scout

**Cofactor Scout** connects university research with venture capital investors through a two-tier community system where Contributors and Scouts submit research leads and earn commission on successful matches.

## Quick Start

1. **Environment Setup** → See [docs/guides/ENVIRONMENT_SETUP.md](docs/guides/ENVIRONMENT_SETUP.md)
2. **Branching Rules** → See [docs/engineering/BRANCHING.md](docs/engineering/BRANCHING.md)
3. **Commit Format** → See [docs/engineering/COMMIT_MESSAGES.md](docs/engineering/COMMIT_MESSAGES.md)
4. **Pull Requests** → See [docs/engineering/MERGE_REQUESTS.md](docs/engineering/MERGE_REQUESTS.md)
5. **Code Standards** → See [docs/pm-notes/CODE_STANDARDS.md](docs/pm-notes/CODE_STANDARDS.md)

## Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes following CODE_STANDARDS.md

# 3. Test locally
npm run dev

# 4. Commit with conventional format
git commit -m "feat(submissions): add draft auto-save"

# 5. Push and open PR
git push origin feature/your-feature-name
```

## Code Review

- Every PR requires 1 approval
- All CI checks must pass
- Follow [docs/engineering/CODE_REVIEW.md](docs/engineering/CODE_REVIEW.md)

## Questions?

- Technical docs: [docs/features/](docs/features/)
- Troubleshooting: [docs/guides/TROUBLESHOOTING.md](docs/guides/TROUBLESHOOTING.md)
- Design system: [docs/pm-notes/DESIGN_GUIDELINES.md](docs/pm-notes/DESIGN_GUIDELINES.md)

---

**Last Updated:** 2026-02-26
