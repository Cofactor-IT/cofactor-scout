# Testing Documentation

## Overview

Cofactor Scout uses Vitest as its testing framework. Tests are organized by type (unit, integration) and by feature area.

## Testing Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Test Runner** | Vitest 4.0.18 | Fast unit test runner |
| **Assertions** | Vitest (built-in) | Test assertions |
| **Mocking** | Vitest (built-in) | Function and module mocking |
| **Path Resolution** | vite-tsconfig-paths | Resolve @ imports in tests |

## Test Structure

```
tests/
├── unit/                      # Unit tests
│   ├── security/              # Security-related tests
│   │   ├── rate-limit.test.ts
│   │   ├── sanitization.test.ts
│   │   └── password.test.ts
│   ├── validation/            # Validation schema tests
│   │   └── schemas.test.ts
│   └── utils/                 # Utility function tests
│       └── utils.test.ts
└── integration/               # Integration tests (future)
    └── auth-flow.test.ts
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm test -- --watch
```

### Specific File
```bash
npm test tests/unit/security/rate-limit.test.ts
```

### With Coverage
```bash
npm test -- --coverage
```

### UI Mode
```bash
npm test -- --ui
```

## Configuration

**File**: `vitest.config.mts`

```typescript
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
  },
})
```

**Features**:
- Node environment (for server-side code)
- TypeScript path resolution (`@/` imports)
- Includes all `*.test.ts` files

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect } from 'vitest'

describe('Feature Name', () => {
  it('should do something', () => {
    const result = myFunction()
    expect(result).toBe(expected)
  })
})
```

### Async Tests

```typescript
import { describe, it, expect } from 'vitest'

describe('Async Feature', () => {
  it('should handle async operations', async () => {
    const result = await myAsyncFunction()
    expect(result).toBe(expected)
  })
})
```

### Mocking

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('Mocked Feature', () => {
  it('should call mocked function', () => {
    const mockFn = vi.fn()
    myFunction(mockFn)
    expect(mockFn).toHaveBeenCalled()
  })
})
```

### Fake Timers

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Timer Feature', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should handle timeouts', () => {
    const callback = vi.fn()
    setTimeout(callback, 1000)
    
    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalled()
  })
})
```

## Test Coverage

### Current Coverage

| Category | Files | Coverage |
|----------|-------|----------|
| **Security** | 3 files | ~80% |
| **Validation** | 1 file | ~90% |
| **Utils** | 1 file | ~70% |
| **Overall** | 5 files | ~80% |

### Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: 60%+ coverage
- **Critical Paths**: 100% coverage (auth, security)

### Viewing Coverage

```bash
npm test -- --coverage
```

**Output**:
- Terminal summary
- HTML report in `coverage/` directory

## Test Categories

### 1. Security Tests

**File**: `tests/unit/security/rate-limit.test.ts`

**Tests**:
- Rate limit enforcement
- Window expiration
- Independent identifier tracking
- Cleanup functionality

**File**: `tests/unit/security/sanitization.test.ts`

**Tests**:
- Name sanitization
- String sanitization
- Bio sanitization
- SQL injection detection
- URL validation
- Search query sanitization
- JSON parsing safety
- Zero-width character removal
- Unicode normalization
- Whitespace normalization

**File**: `tests/unit/security/password.test.ts`

**Tests**:
- Password hashing (bcrypt)
- Password verification
- Password complexity validation
- Account lockout simulation
- Token generation
- Timing attack prevention

### 2. Validation Tests

**File**: `tests/unit/validation/schemas.test.ts`

**Tests**:
- Sign-in schema validation
- Sign-up schema validation
- Social connect schema validation
- Email validation
- Password validation
- Name validation
- Username validation
- Follower count validation

### 3. Utility Tests

**File**: `tests/unit/utils/utils.test.ts`

**Tests**:
- `cn()` utility (class name merging)
- Conditional classes
- Array handling
- Tailwind class merging

## Testing Best Practices

### 1. Test Naming

```typescript
// Good
it('should validate correct email addresses', () => {})
it('should reject emails without @ symbol', () => {})

// Bad
it('test email', () => {})
it('works', () => {})
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should calculate total correctly', () => {
  // Arrange
  const items = [1, 2, 3]
  
  // Act
  const total = calculateTotal(items)
  
  // Assert
  expect(total).toBe(6)
})
```

### 3. Test One Thing

```typescript
// Good
it('should validate email format', () => {
  expect(validateEmail('test@example.com')).toBe(true)
})

it('should reject invalid email format', () => {
  expect(validateEmail('invalid')).toBe(false)
})

// Bad
it('should validate email', () => {
  expect(validateEmail('test@example.com')).toBe(true)
  expect(validateEmail('invalid')).toBe(false)
  expect(validateEmail('')).toBe(false)
  // Too many assertions
})
```

### 4. Use Descriptive Assertions

```typescript
// Good
expect(result.isValid).toBe(true)
expect(result.error).toBeUndefined()

// Bad
expect(result).toBeTruthy()
```

### 5. Test Edge Cases

```typescript
describe('sanitizeName', () => {
  it('should handle empty string', () => {})
  it('should handle very long names', () => {})
  it('should handle special characters', () => {})
  it('should handle Unicode characters', () => {})
  it('should handle whitespace-only input', () => {})
})
```

## Mocking Strategies

### Mock Functions

```typescript
const mockFn = vi.fn()
mockFn.mockReturnValue('mocked value')
mockFn.mockResolvedValue('async mocked value')

expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
expect(mockFn).toHaveBeenCalledTimes(2)
```

### Mock Modules

```typescript
vi.mock('@/lib/database/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    }
  }
}))
```

### Mock Environment Variables

```typescript
beforeEach(() => {
  process.env.DATABASE_URL = 'test-db-url'
})

afterEach(() => {
  delete process.env.DATABASE_URL
})
```

## Integration Testing (Future)

### Auth Flow Test

```typescript
describe('Authentication Flow', () => {
  it('should complete full signup flow', async () => {
    // 1. Sign up
    const signupResult = await signUp(formData)
    expect(signupResult.success).toBeDefined()
    
    // 2. Verify email
    const verifyResult = await verifyEmail(token)
    expect(verifyResult.success).toBe(true)
    
    // 3. Sign in
    const signinResult = await signIn(credentials)
    expect(signinResult.user).toBeDefined()
  })
})
```

### Submission Flow Test

```typescript
describe('Submission Flow', () => {
  it('should complete full submission flow', async () => {
    // 1. Create draft
    const draft = await saveDraft(step1Data)
    expect(draft.id).toBeDefined()
    
    // 2. Update draft
    await saveDraft({ ...step2Data, id: draft.id })
    
    // 3. Submit
    const submission = await submitResearch({ id: draft.id })
    expect(submission.success).toBe(true)
  })
})
```

## Continuous Integration

### GitHub Actions (Future)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm test
      - run: npm run lint
```

## Test Data

### Fixtures

```typescript
// tests/fixtures/users.ts
export const testUsers = {
  contributor: {
    email: 'contributor@example.com',
    password: 'SecurePass123!',
    name: 'John Contributor'
  },
  scout: {
    email: 'scout@example.com',
    password: 'SecurePass123!',
    name: 'Jane Scout',
    role: 'SCOUT'
  }
}
```

### Factories

```typescript
// tests/factories/submission.ts
export function createSubmission(overrides = {}) {
  return {
    researchTopic: 'AI for Drug Discovery',
    researchDescription: 'Using machine learning...',
    researcherName: 'Dr. Smith',
    researcherEmail: 'smith@university.edu',
    ...overrides
  }
}
```

## Debugging Tests

### Run Single Test

```bash
npm test -- -t "should validate email"
```

### Debug Mode

```bash
node --inspect-brk node_modules/.bin/vitest run
```

### Console Logging

```typescript
it('should do something', () => {
  console.log('Debug info:', value)
  expect(value).toBe(expected)
})
```

## Performance Testing

### Benchmark Tests

```typescript
import { bench, describe } from 'vitest'

describe('Performance', () => {
  bench('sanitizeName', () => {
    sanitizeName('John Doe')
  })
  
  bench('validateEmail', () => {
    validateEmail('test@example.com')
  })
})
```

## Test Maintenance

### Keep Tests Fast
- Mock external dependencies
- Use fake timers
- Avoid real database calls in unit tests

### Keep Tests Isolated
- No shared state between tests
- Clean up after each test
- Use `beforeEach` and `afterEach`

### Keep Tests Readable
- Descriptive test names
- Clear assertions
- Minimal setup code

### Keep Tests Updated
- Update tests when code changes
- Remove obsolete tests
- Add tests for new features

## Common Patterns

### Testing Zod Schemas

```typescript
it('should validate correct data', () => {
  const result = schema.safeParse(validData)
  expect(result.success).toBe(true)
  if (result.success) {
    expect(result.data).toEqual(expectedData)
  }
})

it('should reject invalid data', () => {
  const result = schema.safeParse(invalidData)
  expect(result.success).toBe(false)
  if (!result.success) {
    expect(result.error.issues[0].message).toBe(expectedError)
  }
})
```

### Testing Server Actions

```typescript
it('should create user', async () => {
  const formData = new FormData()
  formData.append('email', 'test@example.com')
  formData.append('password', 'SecurePass123!')
  formData.append('name', 'John Doe')
  
  const result = await signUp(undefined, formData)
  expect(result.success).toBeDefined()
})
```

### Testing Error Handling

```typescript
it('should handle errors gracefully', async () => {
  const mockPrisma = {
    user: {
      create: vi.fn().mockRejectedValue(new Error('Database error'))
    }
  }
  
  const result = await createUser(data)
  expect(result.error).toBeDefined()
})
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
