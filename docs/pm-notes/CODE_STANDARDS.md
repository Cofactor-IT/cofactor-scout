# COFACTOR CLUB - CODE STANDARDS

**Version 1.0 | February 2026**

> "Code is read far more often than it is written. Write for the humans who will maintain this, not the machine that will execute it."

---

## TABLE OF CONTENTS

1. [Core Principles](#core-principles)
2. [Functions](#functions)
3. [Naming Conventions](#naming-conventions)
4. [Modularity & Single Responsibility](#modularity--single-responsibility)
5. [File Organization](#file-organization)
6. [UI Component Design](#ui-component-design)
7. [TypeScript Standards](#typescript-standards)
8. [Security Requirements](#security-requirements)
9. [Performance Standards](#performance-standards)
10. [Testing Requirements](#testing-requirements)
11. [Code Review Checklist](#code-review-checklist)
12. [Enforcement](#enforcement)

---

## CORE PRINCIPLES

### 1. **Transparency Over Cleverness**

Every piece of code should tell a story. A developer should understand what code does within seconds of reading it.

### 2. **Single Responsibility**

Every function, component, and module does **exactly one thing** and does it well.

### 3. **Easy to Change**

Code should be structured so that common changes (UI tweaks, business logic updates) require touching minimal files.

### 4. **Navigability**

A developer should find what they're looking for in under 30 seconds.

### 5. **Trust Through Honesty**

If a name promises something, the implementation delivers exactly that - no surprises.

---

## FUNCTIONS

### Rule 1: **Transparently Obvious**

Every function should tell a story that makes sense without reading the implementation.

**❌ BAD:**

```typescript
async function process(u: User, d: any) {
  const x = await db.query(/* complex query */);
  const y = transform(x);
  if (y.status === "active") {
    // 50 lines of logic
  }
  return y;
}
```

**✅ GOOD:**

```typescript
async function approveUserStaffApplication(user: User) {
  const application = await findPendingStaffApplication(user.id);
  validateApplicationEligibility(application);
  await promoteUserToStaff(user.id);
  await notifyUserOfApproval(user.email);
}
```

---

### Rule 2: **No Massive Functions**

If a function is longer than **20 lines**, it's doing too much. Extract sub-functions.

**Why 20 lines?** It fits on one screen without scrolling.

**Exception:** Configuration objects (e.g., form schemas) can be longer.

---

### Rule 3: **Separate Levels of Abstraction**

Never mix high-level business logic with low-level implementation details in the same function.

**❌ BAD (Mixed Levels):**

```typescript
async function createWikiPage(data: FormData) {
  // HIGH LEVEL: Business logic
  const slug = data.get("slug") as string;
  const content = data.get("content") as string;

  // LOW LEVEL: Database details
  const existing = await prisma.uniPage.findUnique({
    where: { slug },
    include: { revisions: true },
  });

  // HIGH LEVEL: Validation
  if (existing) throw new Error("Slug exists");

  // LOW LEVEL: Sanitization
  const clean = DOMPurify.sanitize(content);

  // This function is all over the place!
}
```

**✅ GOOD (Clear Levels):**

```typescript
// HIGH LEVEL - Orchestration
async function createWikiPage(data: FormData) {
  const pageData = parseWikiPageForm(data);
  await validateUniqueSlug(pageData.slug);
  const sanitizedContent = sanitizeHtmlContent(pageData.content);
  return await saveWikiPage({ ...pageData, content: sanitizedContent });
}

// LOW LEVEL - Implementation details in separate functions
async function validateUniqueSlug(slug: string) {
  /* ... */
}
function sanitizeHtmlContent(html: string) {
  /* ... */
}
async function saveWikiPage(data: WikiPageData) {
  /* ... */
}
```

---

### Rule 4: **Bury Switch Statements**

Switch statements are low-level details. Hide them in polymorphism or lookup objects.

**❌ BAD:**

```typescript
function calculatePowerScore(user: User) {
  let score = 0;

  switch (user.role) {
    case "STUDENT":
      score = user.referrals * 50;
      break;
    case "STAFF":
      score = user.referrals * 50 + user.approvedEdits * 20;
      break;
    case "ADMIN":
      score = 1000; // Admins always get max
      break;
  }

  return score;
}
```

**✅ GOOD:**

```typescript
// Lookup object (cleaner and extensible)
const POWER_SCORE_CALCULATORS = {
  STUDENT: (user: User) => user.referrals * 50,
  STAFF: (user: User) => user.referrals * 50 + user.approvedEdits * 20,
  ADMIN: () => 1000,
};

function calculatePowerScore(user: User) {
  const calculator = POWER_SCORE_CALCULATORS[user.role];
  return calculator(user);
}
```

---

### Rule 5: **Minimize Arguments (Max 3)**

Functions with >3 arguments are hard to understand and test.

**Argument Count Guidelines:**

- **0 arguments:** Ideal
- **1 argument:** Very good
- **2 arguments:** Acceptable
- **3 arguments:** Tolerable, but consider refactoring
- **4+ arguments:** Refactor required

**❌ BAD:**

```typescript
function createUser(
  email: string,
  password: string,
  name: string,
  role: Role,
  universityId: string,
  referralCode: string,
) {
  // Too many arguments!
}
```

**✅ GOOD:**

```typescript
interface CreateUserParams {
  email: string;
  password: string;
  name: string;
  role: Role;
  universityId: string;
  referralCode: string;
}

function createUser(params: CreateUserParams) {
  // Single argument, named properties
}
```

---

### Rule 6: **Function Purposes: Ask, Transform, or Handle**

Every function should do ONE of these:

1. **Ask a question** (return boolean or data)
2. **Transform data** (take input, return different output)
3. **Handle an event** (side effects, no return value)

**❌ BAD (Does multiple things):**

```typescript
async function getUserAndUpdate(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } }); // Asking
  user.lastLogin = new Date(); // Side effect
  await prisma.user.update({ where: { id: userId }, data: user }); // Side effect
  return user; // Returning
}
```

**✅ GOOD (Separate concerns):**

```typescript
// ASK: Get data
async function getUser(userId: string) {
  return await prisma.user.findUnique({ where: { id: userId } });
}

// HANDLE: Update state
async function updateLastLogin(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { lastLogin: new Date() },
  });
}

// ORCHESTRATE in calling code
const user = await getUser(userId);
await updateLastLogin(userId);
```

---

### Rule 7: **Command-Query Separation**

A function should either **DO something** OR **ANSWER something**, never both.

**❌ BAD:**

```typescript
// This both checks AND modifies
async function setAndReturnPublished(pageId: string): Promise<boolean> {
  await prisma.uniPage.update({
    where: { id: pageId },
    data: { published: true },
  });
  return true;
}
```

**✅ GOOD:**

```typescript
// Query: Answer a question
async function isPagePublished(pageId: string): Promise<boolean> {
  const page = await prisma.uniPage.findUnique({ where: { id: pageId } });
  return page?.published ?? false;
}

// Command: Do something
async function publishPage(pageId: string): Promise<void> {
  await prisma.uniPage.update({
    where: { id: pageId },
    data: { published: true },
  });
}
```

---

### Rule 8: **Avoid Side Effects**

If a function modifies state outside its scope, make it **obvious** in the name.

**❌ BAD (Hidden side effect):**

```typescript
function checkPassword(user: User, password: string): boolean {
  const isValid = bcrypt.compare(password, user.password);

  // Hidden side effect!
  if (!isValid) {
    user.failedLoginAttempts++;
  }

  return isValid;
}
```

**✅ GOOD (Explicit side effect):**

```typescript
// Pure function
function isPasswordValid(user: User, password: string): boolean {
  return bcrypt.compare(password, user.password);
}

// Separate function for side effect
async function incrementFailedLoginAttempts(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: { increment: 1 } },
  });
}
```

---

## NAMING CONVENTIONS

### Rule 1: **Avoid Disinformation**

If a name promises something, the implementation **must** deliver exactly that.

**❌ BAD:**

```typescript
// Name says "list" but returns a Set
function getUserList(): Set<User> {
  /* ... */
}

// Name says "get" but also creates
async function getOrCreateUniversity(name: string) {
  /* ... */
}
```

**✅ GOOD:**

```typescript
function getUserSet(): Set<User> {
  /* ... */
}

// Be explicit about dual behavior
async function findOrCreateUniversity(name: string) {
  /* ... */
}
```

---

### Rule 2: **Meaningful Distinctions**

Don't add numbers or noise words to differentiate names.

**❌ BAD:**

```typescript
function getUser1(id: string) {
  /* ... */
}
function getUser2(id: string) {
  /* ... */
}

const userInfo = {
  /* ... */
};
const userData = {
  /* ... */
};
const userObject = {
  /* ... */
};
// What's the difference?!
```

**✅ GOOD:**

```typescript
function getUserById(id: string) {
  /* ... */
}
function getUserByEmail(email: string) {
  /* ... */
}

const userProfile = {
  /* ... */
};
const userPermissions = {
  /* ... */
};
const userStatistics = {
  /* ... */
};
```

---

### Rule 3: **Pronounceable Names**

Code should sound like human language when read aloud.

**❌ BAD:**

```typescript
const genymdhms = () => {
  // Generate year month day hour minute second
};

const usrCrtDt = user.createdAt;
```

**✅ GOOD:**

```typescript
const generateTimestamp = () => {
  /* ... */
};

const userCreatedDate = user.createdAt;
```

---

### Rule 4: **Searchable Names**

Use names that are easy to find with Ctrl+F.

**❌ BAD:**

```typescript
// Single letter variables (impossible to search)
const u = await getUser();
const e = u.email;

// Magic numbers
if (age > 18) {
  /* ... */
}
```

**✅ GOOD:**

```typescript
const currentUser = await getUser();
const userEmail = currentUser.email;

const MINIMUM_AGE_FOR_VOTING = 18;
if (age > MINIMUM_AGE_FOR_VOTING) {
  /* ... */
}
```

---

### Rule 5: **Avoid Encodings**

Let TypeScript handle the types. Don't include type info in names.

**❌ BAD:**

```typescript
const strUserName: string = "John";
const arrUsers: User[] = [];
const objConfig: Record<string, any> = {};
```

**✅ GOOD:**

```typescript
const userName = "John";
const users: User[] = [];
const config: AppConfig = {};
```

---

### Rule 6: **Function Names Should Tell the Story**

A function name should explain **what it does** without needing to read the code.

**❌ BAD:**

```typescript
function process(data: any) {
  /* ... */
}
function handle(request: any) {
  /* ... */
}
function doStuff(user: User) {
  /* ... */
}
```

**✅ GOOD:**

```typescript
function sanitizeUserInput(data: FormData) {
  /* ... */
}
function validateAuthenticationRequest(request: AuthRequest) {
  /* ... */
}
function calculateUserPowerScore(user: User) {
  /* ... */
}
```

---

## MODULARITY & SINGLE RESPONSIBILITY

### Rule 1: **One Thing, One Place**

Every function, component, and file should have **exactly one reason to change**.

**Examples:**

- ✅ `calculatePowerScore.ts` - Only changes if scoring logic changes
- ✅ `UserProfile.tsx` - Only changes if profile UI changes
- ✅ `validateEmail.ts` - Only changes if email validation rules change

**❌ Anti-pattern:**

```typescript
// auth-utils.ts - Does too many things!
export function hashPassword() {
  /* ... */
}
export function sendEmail() {
  /* ... */
}
export function generatePDF() {
  /* ... */
}
```

---

### Rule 2: **Extract, Don't Inline**

When you see logic repeated or complex, extract it to a named function.

**❌ BAD:**

```typescript
// Repeated inline logic
if (user.role === "ADMIN" || user.role === "STAFF") {
  // Do something
}

if (user.role === "ADMIN" || user.role === "STAFF") {
  // Do something else
}
```

**✅ GOOD:**

```typescript
function isPrivilegedUser(user: User): boolean {
  return user.role === "ADMIN" || user.role === "STAFF";
}

if (isPrivilegedUser(user)) {
  // Do something
}

if (isPrivilegedUser(user)) {
  // Do something else
}
```

---

### Rule 3: **Composition Over Inheritance**

Build complex behavior by combining simple functions, not deep inheritance chains.

**✅ GOOD:**

```typescript
// Composable functions
const sanitize = (text: string) => DOMPurify.sanitize(text);
const trim = (text: string) => text.trim();
const lowercase = (text: string) => text.toLowerCase();

// Compose them
const processUserInput = (input: string) => lowercase(trim(sanitize(input)));
```

---

## FILE ORGANIZATION

### Directory Structure

```
cofactor-club/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group: Auth pages
│   │   ├── signin/
│   │   └── signup/
│   ├── (dashboard)/              # Route group: Authenticated pages
│   │   ├── admin/
│   │   ├── wiki/
│   │   └── profile/
│   ├── api/                      # API routes
│   │   └── [feature]/
│   └── layout.tsx
│
├── components/                   # React components
│   ├── ui/                       # Base UI components (Shadcn)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   ├── features/                 # Feature-specific components
│   │   ├── wiki/
│   │   │   ├── WikiEditor.tsx
│   │   │   ├── WikiRevisionList.tsx
│   │   │   └── DiffViewer.tsx
│   │   ├── admin/
│   │   │   ├── UserManagementTable.tsx
│   │   │   └── ApprovalQueue.tsx
│   │   └── profile/
│   │       └── SocialMediaConnect.tsx
│   └── shared/                   # Shared across features
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── LoadingSpinner.tsx
│
├── lib/                          # Utilities and business logic
│   ├── auth/                     # Authentication logic
│   │   ├── index.ts
│   │   ├── session.ts
│   │   └── permissions.ts
│   ├── validation/               # Zod schemas
│   │   ├── user.schemas.ts
│   │   ├── wiki.schemas.ts
│   │   └── admin.schemas.ts
│   ├── database/                 # Database utilities
│   │   ├── prisma.ts
│   │   ├── queries/
│   │   │   ├── users.ts
│   │   │   ├── wiki.ts
│   │   │   └── admin.ts
│   │   └── transactions/
│   │       └── approveRevision.ts
│   ├── utils/                    # Pure utility functions
│   │   ├── formatting.ts
│   │   ├── date.ts
│   │   └── sanitization.ts
│   └── constants.ts              # App-wide constants
│
├── actions/                      # Server Actions (grouped by feature)
│   ├── auth.actions.ts
│   ├── wiki.actions.ts
│   ├── admin.actions.ts
│   └── profile.actions.ts
│
├── types/                        # TypeScript type definitions
│   ├── models.ts                 # Database model types
│   ├── api.ts                    # API request/response types
│   └── ui.ts                     # UI-specific types
│
└── tests/                        # Test files (mirror src structure)
    ├── unit/
    ├── integration/
    └── e2e/
```

---

### File Naming Rules

| Type                 | Convention                  | Example                        |
| -------------------- | --------------------------- | ------------------------------ |
| **React Components** | PascalCase                  | `UserProfile.tsx`              |
| **Utilities**        | camelCase                   | `formatDate.ts`                |
| **Server Actions**   | camelCase + `.actions.ts`   | `wiki.actions.ts`              |
| **Types**            | PascalCase + `.ts`          | `User.ts` or `types.ts`        |
| **Constants**        | UPPER_SNAKE_CASE            | `const MAX_LOGIN_ATTEMPTS = 5` |
| **API Routes**       | kebab-case                  | `update-role/route.ts`         |
| **Test Files**       | Same as source + `.test.ts` | `formatDate.test.ts`           |

---

### Finding Things (Navigation Rules)

**If I need to...**

- **Add a new page:** Look in `app/`
- **Modify a UI component:** Look in `components/ui/` (base) or `components/features/` (specific)
- **Change business logic:** Look in `lib/`
- **Update a Server Action:** Look in `actions/`
- **Add validation:** Look in `lib/validation/`
- **Modify database queries:** Look in `lib/database/queries/`
- **Update types:** Look in `types/`

**Time to find any file: <30 seconds**

---

## UI COMPONENT DESIGN

### Rule 1: **Components Should Be Easily Customizable**

Use composition and prop spreading to allow style overrides.

**✅ GOOD:**

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className  // Allow override
      )}
      {...props}  // Spread remaining props
    >
      {children}
    </button>
  );
}
```

**Usage:**

```typescript
// Easy to customize without modifying Button component
<Button className="ml-4 custom-style" onClick={handleClick}>
  Save
</Button>
```

---

### Rule 2: **Separate Container and Presentation**

Split components into "smart" (logic) and "dumb" (UI) components.

**❌ BAD (Mixed logic and UI):**

```typescript
export function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser().then(setUser).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not found</div>;

  return (
    <div className="profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      {/* Complex UI */}
    </div>
  );
}
```

**✅ GOOD (Separated):**

```typescript
// Container (smart - handles logic)
export function UserProfileContainer() {
  const { user, loading, error } = useUser();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <NotFound />;

  return <UserProfileView user={user} />;
}

// Presentation (dumb - just renders)
interface UserProfileViewProps {
  user: User;
}

export function UserProfileView({ user }: UserProfileViewProps) {
  return (
    <div className="profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      {/* Complex UI */}
    </div>
  );
}
```

---

### Rule 3: **Use Compound Components for Complex UI**

For components with multiple related parts, use compound pattern.

**✅ GOOD:**

```typescript
// Parent provides context
export function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

// Child components
Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>;
};

Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card-body">{children}</div>;
};

Card.Footer = function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="card-footer">{children}</div>;
};

// Usage (flexible composition)
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

---

### Rule 4: **Co-locate Styles with Components**

Keep styles close to the components that use them (Tailwind classes inline or CSS modules).

**✅ GOOD:**

```typescript
// Styles defined with component
const styles = {
  base: "rounded-lg border bg-card text-card-foreground shadow-sm",
  variants: {
    default: "border-gray-200",
    error: "border-red-500 bg-red-50",
  }
};

export function Alert({ variant = 'default' }: AlertProps) {
  return (
    <div className={cn(styles.base, styles.variants[variant])}>
      {/* content */}
    </div>
  );
}
```

---

## TYPESCRIPT STANDARDS

### Rule 1: **Strict Mode Always**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

### Rule 2: **No `any` Types**

If you don't know the type, use `unknown` and narrow it.

**❌ BAD:**

```typescript
function processData(data: any) {
  return data.value; // No type safety!
}
```

**✅ GOOD:**

```typescript
function processData(data: unknown) {
  if (typeof data === "object" && data !== null && "value" in data) {
    return (data as { value: string }).value;
  }
  throw new Error("Invalid data structure");
}
```

---

### Rule 3: **Use Interfaces for Objects, Types for Unions**

```typescript
// Interfaces for object shapes
interface User {
  id: string;
  email: string;
  role: Role;
}

// Types for unions, intersections, utilities
type Role = "STUDENT" | "STAFF" | "ADMIN";
type UserWithPermissions = User & { permissions: string[] };
```

---

### Rule 4: **Use Zod for Runtime Validation**

TypeScript types are compile-time only. Use Zod for runtime validation.

```typescript
import { z } from "zod";

// Define schema
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(["STUDENT", "STAFF", "ADMIN"]),
});

// Infer TypeScript type from schema
type User = z.infer<typeof userSchema>;

// Validate at runtime
function createUser(data: unknown) {
  const validated = userSchema.parse(data); // Throws if invalid
  // validated is now typed as User
}
```

---

## SECURITY REQUIREMENTS

### Rule 1: **Validate All Input**

**Every** Server Action must validate input with Zod schemas.

```typescript
"use server";

import { userSchema } from "@/lib/validation/user.schemas";

export async function createUser(formData: FormData) {
  // ALWAYS validate first
  const data = Object.fromEntries(formData);
  const validated = userSchema.parse(data);

  // Now safe to use
  await prisma.user.create({ data: validated });
}
```

---

### Rule 2: **Check Authorization Early**

Auth checks should be the **first thing** in a protected function.

```typescript
"use server";

import { requireAdmin } from "@/lib/auth";

export async function deleteUser(userId: string) {
  // Check auth FIRST - fail fast
  await requireAdmin();

  // Now proceed with logic
  await prisma.user.delete({ where: { id: userId } });
}
```

---

### Rule 3: **Sanitize All User HTML**

Any user-generated HTML must be sanitized with DOMPurify.

```typescript
import DOMPurify from "isomorphic-dompurify";

export async function saveWikiContent(content: string) {
  // Sanitize before storing
  const clean = DOMPurify.sanitize(content);

  await prisma.uniPage.update({
    where: { id: pageId },
    data: { content: clean },
  });
}
```

---

### Rule 4: **Rate Limit Sensitive Operations**

Authentication, password reset, and signup must be rate limited.

```typescript
// All rate limiting must use Redis (not in-memory Map)
import { rateLimiter } from "@/lib/rate-limit";

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;

  // Check rate limit
  const allowed = await rateLimiter.check("signup", email, {
    max: 3,
    window: 900, // 15 minutes
  });

  if (!allowed) {
    throw new Error("Too many attempts");
  }

  // Proceed with signup
}
```

---

## PERFORMANCE STANDARDS

### Rule 1: **Index All Foreign Keys**

Every foreign key must have an index for query performance.

```prisma
model WikiRevision {
  uniPageId String
  authorId  String

  // Always index foreign keys
  @@index([uniPageId])
  @@index([authorId])
}
```

---

### Rule 2: **Avoid N+1 Queries**

Use Prisma's `include` to fetch related data in one query.

**❌ BAD (N+1 Query):**

```typescript
const pages = await prisma.uniPage.findMany();

for (const page of pages) {
  // This makes a separate query for EACH page!
  const author = await prisma.user.findUnique({
    where: { id: page.authorId },
  });
}
```

**✅ GOOD (Single Query):**

```typescript
const pages = await prisma.uniPage.findMany({
  include: {
    author: true, // Fetched in one query with JOIN
  },
});
```

---

### Rule 3: **Paginate Large Lists**

Any list with >50 items must use pagination.

```typescript
const ITEMS_PER_PAGE = 50;

async function getUsers(page: number = 1) {
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      take: ITEMS_PER_PAGE,
      skip,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

  return {
    users,
    pagination: {
      page,
      totalPages: Math.ceil(total / ITEMS_PER_PAGE),
      total,
    },
  };
}
```

---

### Rule 4: **Use Transactions for Multi-Step Operations**

If an operation modifies multiple tables, wrap in a transaction.

```typescript
async function approveWikiRevision(revisionId: string) {
  await prisma.$transaction(async (tx) => {
    // Step 1: Update revision status
    const revision = await tx.wikiRevision.update({
      where: { id: revisionId },
      data: { status: "APPROVED" },
    });

    // Step 2: Update page content
    await tx.uniPage.update({
      where: { id: revision.uniPageId },
      data: {
        content: revision.content,
        published: true,
      },
    });

    // Step 3: Award points
    await tx.user.update({
      where: { id: revision.authorId },
      data: { powerScore: { increment: 20 } },
    });
  });
}
```

---

## TESTING REQUIREMENTS

### Rule 1: **Test Coverage Minimum: 80%**

All critical paths must have tests.

**Priority for testing:**

1. Authentication flows
2. Authorization checks
3. Data mutations (Server Actions)
4. Business logic (power score, approval workflows)
5. Validation schemas

---

### Rule 2: **Unit Tests for Pure Functions**

Any function without side effects must have unit tests.

```typescript
// lib/utils/calculatePowerScore.ts
export function calculatePowerScore(user: User): number {
  const referralPoints = user.referralCount * 50;
  const wikiPoints = user.approvedEdits * 20;
  const socialPoints = Math.floor(user.totalFollowers / 100);

  return referralPoints + wikiPoints + socialPoints;
}

// tests/unit/calculatePowerScore.test.ts
describe("calculatePowerScore", () => {
  it("calculates score with all factors", () => {
    const user = {
      referralCount: 5,
      approvedEdits: 3,
      totalFollowers: 1000,
    };

    expect(calculatePowerScore(user)).toBe(320);
    // (5 * 50) + (3 * 20) + floor(1000 / 100)
    // 250 + 60 + 10 = 320
  });

  it("handles zero values", () => {
    const user = {
      referralCount: 0,
      approvedEdits: 0,
      totalFollowers: 0,
    };

    expect(calculatePowerScore(user)).toBe(0);
  });
});
```

---

### Rule 3: **Integration Tests for Server Actions**

Test that Server Actions correctly interact with the database.

```typescript
// tests/integration/wiki.actions.test.ts
describe("proposeWikiEdit", () => {
  it("creates pending revision for student", async () => {
    const student = await createTestUser({ role: "STUDENT" });
    const page = await createTestWikiPage();

    await proposeWikiEdit({
      pageId: page.id,
      content: "New content",
      userId: student.id,
    });

    const revision = await prisma.wikiRevision.findFirst({
      where: { authorId: student.id },
    });

    expect(revision?.status).toBe("PENDING");
  });

  it("auto-approves for staff", async () => {
    const staff = await createTestUser({ role: "STAFF" });
    const page = await createTestWikiPage();

    await proposeWikiEdit({
      pageId: page.id,
      content: "New content",
      userId: staff.id,
    });

    const revision = await prisma.wikiRevision.findFirst({
      where: { authorId: staff.id },
    });

    expect(revision?.status).toBe("APPROVED");
  });
});
```

---

### Rule 4: **E2E Tests for Critical User Flows**

Test complete user journeys.

**Critical flows to test:**

1. User signup with referral code
2. Email verification
3. Create wiki page
4. Propose wiki edit (student) → Admin approval
5. Link social media account
6. Power score recalculation

---

## CODE REVIEW CHECKLIST

Before submitting a PR, verify:

### **Functionality**

- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error states handled gracefully

### **Code Quality**

- [ ] Functions are <20 lines
- [ ] Functions do ONE thing
- [ ] Names are descriptive and honest
- [ ] No magic numbers (use constants)
- [ ] Levels of abstraction separated

### **TypeScript**

- [ ] No `any` types
- [ ] Strict mode passes
- [ ] Types are accurate

### **Security**

- [ ] Input validated with Zod
- [ ] Authorization checked
- [ ] User HTML sanitized
- [ ] Rate limiting applied (if needed)

### **Performance**

- [ ] No N+1 queries
- [ ] Proper indexes on queries
- [ ] Transactions used for multi-step operations
- [ ] Pagination for large lists

### **Testing**

- [ ] Unit tests for pure functions
- [ ] Integration tests for Server Actions
- [ ] Tests pass locally
- [ ] Coverage meets 80% threshold

### **Documentation**

- [ ] Complex logic has comments
- [ ] Function purpose is obvious from name
- [ ] README updated (if public API changed)

---

## ENFORCEMENT

### **Automated Checks**

```bash
# Run before committing
npm run lint          # ESLint checks
npm run type-check    # TypeScript validation
npm test              # Run all tests
npm run format        # Prettier formatting
```

---

### **Pre-commit Hook**

```bash
# .husky/pre-commit
#!/bin/sh
npm run lint
npm run type-check
npm test
```

---

### **CI/CD Pipeline**

GitHub Actions must run on every PR:

- Lint check
- Type check
- Test suite
- Build verification

**No merging to `main` without passing all checks.**

---

### **Code Review Requirements**

- At least 1 approval required
- All conversations resolved
- CI passing
- Test coverage maintained

---

## SUMMARY

### **Core Rules to Remember:**

1. **Transparency:** Code should tell a story
2. **Single Responsibility:** One thing, one place
3. **Small Functions:** <20 lines
4. **Honest Names:** Name promises = implementation delivers
5. **Levels of Abstraction:** High-level logic separate from details
6. **Minimal Arguments:** Max 3 parameters
7. **Command-Query Separation:** Do OR answer, never both
8. **Type Safety:** No `any` types
9. **Security First:** Validate, authorize, sanitize
10. **Test Everything:** 80% coverage minimum

---

**Questions about these standards?** Open an issue or discuss in code review.

**Proposing changes?** Update this document and get team approval.

---

**Last Updated:** February 2026  
**Version:** 1.0  
**Maintainer:** Technical Lead
