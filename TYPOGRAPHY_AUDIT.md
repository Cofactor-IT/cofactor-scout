# Typography Audit & Fix Tracker

## Typography System Reference
- **h1**: 48px, Bold 700, -1% letter spacing (Rethink Sans)
- **h2**: 36px, Bold 700, -0.5% letter spacing (Rethink Sans)
- **h3**: 24px, Semi-Bold 600 (Rethink Sans)
- **h4**: 18px, Semi-Bold 600 (Rethink Sans)
- **body-large**: 18px, Regular 400, 150% line height (Merriweather)
- **body**: 16px, Regular 400, 150% line height (Merriweather)
- **body-bold**: 16px, Bold 700, 150% line height (Merriweather)
- **caption**: 14px, Regular 400, 140% line height (Rethink Sans)
- **button**: 16px, Medium 500, 0.5% letter spacing (Rethink Sans)
- **label**: 14px, Medium 500 (Rethink Sans)

---

## Pages to Audit & Fix

### ✅ COMPLETED
- **Landing Page (app/page.tsx)** - All typography scaled to 1.25x, vw converted to px, proper classes applied, icons scaled, buttons sized correctly, cards at 540x200 and 600px widths, spacing optimized
- **Button Component (components/ui/button.tsx)** - Applied .button class for typography, added flex centering, shadow, removed vw padding
- **Global Styles (app/globals.css)** - All font sizes scaled by 1.25x (h1: 60px, h2: 45px, h3: 30px, h4: 22.5px, body: 20px, body-large: 22.5px, caption: 17.5px, button: 20px, label: 17.5px)
- **Dashboard Page (app/dashboard/page.tsx)** - Converted all vw to px, stat cards 373x145px, icons 27px, numbers 41px, proper spacing throughout

### 🔄 IN PROGRESS
- None

### ⏳ TODO

#### 1. Landing Page (app/page.tsx)
**Issues:**
- Hero h1 uses inline style `fontSize: '2.96vw'` instead of h1 class
- Uses vw units throughout instead of fixed px
- Icon sizes use vw (should be fixed px)
- Button sizes use vw
- Card padding uses vw

**Fix:**
- Replace all vw with fixed px based on 1440px viewport
- Apply proper typography classes (h1, h2, h3, h4, body, body-large, caption)
- Fix icon sizes to 48px, 32px, 24px as appropriate
- Fix button heights to 48px

---

#### 2. Dashboard Page (app/dashboard/page.tsx)
**Issues:**
- Uses vw units for spacing and sizing
- Icon sizes in vw
- Card dimensions in vw
- Stats numbers use inline font styling

**Fix:**
- Convert vw to px
- Apply h2 class to "Welcome" heading
- Apply proper classes to stat cards
- Fix icon sizes

---

#### 3. Drafts Page (app/dashboard/drafts/page.tsx)
**Issues:**
- Same as dashboard page
- Uses vw units throughout

**Fix:**
- Convert vw to px
- Apply proper typography classes

---

#### 4. Submission Detail Page (app/dashboard/submissions/[id]/page.tsx)
**Issues:**
- Already uses fixed px (GOOD!)
- Verify all typography classes are applied correctly

**Fix:**
- Audit and verify only

---

#### 5. Submit Step 1 (components/submission/Step1Form.tsx)
**Issues:**
- Uses vw units for spacing
- Mixed sizing approaches

**Fix:**
- Convert to fixed px
- Ensure form labels use .label class
- Ensure body text uses .body class

---

#### 6. Submit Step 2 (app/dashboard/submit/details/page.tsx)
**Issues:**
- Uses vw units throughout
- Form elements need typography classes

**Fix:**
- Convert vw to px
- Apply proper typography classes

---

#### 7. Submit Step 3 (app/dashboard/submit/review/page.tsx)
**Issues:**
- Uses vw units
- Review cards need proper typography

**Fix:**
- Convert vw to px
- Apply typography classes

---

#### 8. Sign In Page (app/auth/signin/page.tsx)
**Issues:**
- Uses inline font styles
- Mixed sizing

**Fix:**
- Apply h1 class to "Welcome Back"
- Apply body class to description text
- Apply label class to form labels
- Apply button class to buttons

---

#### 9. Sign Up Page (app/auth/signup/page.tsx)
**Issues:**
- Same as sign in page

**Fix:**
- Apply proper typography classes throughout

---

#### 10. Scout Application (app/scout/apply/page.tsx)
**Issues:**
- Needs audit

**Fix:**
- TBD after audit

---

#### 11. Form Components
**Files to check:**
- components/submission/FormInput.tsx
- components/submission/FormTextarea.tsx
- components/submission/FormSelect.tsx
- components/submission/FormFooter.tsx
- components/submission/ProgressStepper.tsx

**Issues:**
- May use vw units
- Need proper typography classes

**Fix:**
- Ensure all use fixed px
- Apply .label class to labels
- Apply .body class to helper text

---

#### 12. Dashboard Navbar (components/dashboard-navbar.tsx)
**Issues:**
- Uses vw for logo height
- Uses inline font size for nav links

**Fix:**
- Convert to fixed px
- Apply proper typography classes

---

#### 13. Tables
**Files:**
- components/DraftsTable.tsx
- components/SubmissionsTable.tsx

**Issues:**
- Use vw units
- Need proper typography classes

**Fix:**
- Convert to fixed px
- Apply .body class to table cells
- Apply .caption class to metadata
- Apply .label class to headers

---

## Conversion Reference (1440px viewport)
- 8.33vw = 120px
- 3.33vw = 48px
- 2.5vw = 36px
- 1.67vw = 24px
- 1.11vw = 16px
- 0.97vw = 14px
- 0.83vw = 12px

---

## Progress Tracker
- Total Pages: 13+
- Completed: 0
- In Progress: 0
- Remaining: 13+
