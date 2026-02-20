# Components Documentation

## Overview

Cofactor Scout uses a component-based architecture with React Server Components as the default and Client Components only when interactivity is required.

## Component Categories

### 1. UI Components (`components/ui/`)
Reusable, styled components based on Radix UI primitives.

### 2. Feature Components (`components/`)
Feature-specific components for submissions, settings, etc.

### 3. Page Components (`app/`)
Page-level components using Next.js App Router.

---

## UI Components

### Button (`components/ui/button.tsx`)

Primary button component with variants.

**Props:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}
```

**Usage:**
```tsx
<Button>Click Me</Button>
<Button variant="outline">Outline Button</Button>
<Button size="sm">Small Button</Button>
```

**Styling:**
- Default: Teal background (#0D7377), white text
- Hover: Darker teal (#0A5A5D)
- Height: 48px (mobile), 56px (tablet), 64px (desktop)
- Font: Rethink Sans, 500 weight

---

### Card (`components/ui/card.tsx`)

Container component with shadow and border.

**Props:**
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}
```

**Usage:**
```tsx
<Card>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

**Styling:**
- Background: White
- Border: 1px solid #E5E7EB
- Border radius: 4px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Padding: Varies by usage

---

### Input (`components/ui/input.tsx`)

Text input field.

**Props:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}
```

**Usage:**
```tsx
<Input 
  type="email" 
  placeholder="Enter email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

**Styling:**
- Height: 48px
- Border: 1px solid #E5E7EB
- Border radius: 4px
- Font: Rethink Sans, 16px
- Focus: Teal border (#0D7377)

---

### Textarea (`components/ui/textarea.tsx`)

Multi-line text input.

**Props:**
```typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string
}
```

**Usage:**
```tsx
<Textarea 
  placeholder="Enter description"
  rows={5}
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>
```

**Styling:**
- Min height: 120px
- Border: 1px solid #E5E7EB
- Border radius: 4px
- Font: Rethink Sans, 16px
- Resize: Vertical only

---

### Checkbox (`components/ui/checkbox.tsx`)

Checkbox input with label.

**Props:**
```typescript
interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  label?: string
  className?: string
}
```

**Usage:**
```tsx
<Checkbox 
  checked={agreed}
  onCheckedChange={setAgreed}
  label="I agree to the terms"
/>
```

---

### Dropdown (`components/ui/dropdown.tsx`)

Dropdown menu component.

**Props:**
```typescript
interface DropdownProps {
  trigger: React.ReactNode
  items: Array<{
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }>
}
```

**Usage:**
```tsx
<Dropdown 
  trigger={<Button>Menu</Button>}
  items={[
    { label: 'Profile', onClick: () => router.push('/profile') },
    { label: 'Settings', onClick: () => router.push('/settings') },
    { label: 'Sign Out', onClick: signOut }
  ]}
/>
```

---

### Modal (`components/ui/modal.tsx`)

Modal dialog component.

**Props:**
```typescript
interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
}
```

**Usage:**
```tsx
<Modal 
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Confirm Action"
  description="Are you sure you want to proceed?"
>
  <div className="flex gap-4">
    <Button onClick={handleConfirm}>Confirm</Button>
    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
  </div>
</Modal>
```

---

### Navbar (`components/ui/navbar.tsx`)

Navigation bar for authenticated pages.

**Props:**
```typescript
interface NavbarProps {
  displayName: string
  role: string
  initials: string
  profilePictureUrl?: string | null
  activePage?: 'submissions' | 'drafts' | 'settings'
}
```

**Usage:**
```tsx
<Navbar 
  displayName="John Doe"
  role="Verified Scout"
  initials="JD"
  activePage="submissions"
/>
```

**Features:**
- Logo on left
- User dropdown on right
- Active page indicator
- Responsive design

---

### AuthNavbar (`components/ui/auth-navbar.tsx`)

Navigation bar for authentication pages.

**Usage:**
```tsx
<AuthNavbar />
```

**Features:**
- Logo only
- No user menu
- Minimal design

---

### PromotionBanner (`components/ui/promotion-banner.tsx`)

Call-to-action banner.

**Usage:**
```tsx
<PromotionBanner />
```

**Features:**
- Displays "Apply to become a Scout" for Contributors
- Hidden for Scouts
- Teal background
- Centered text

---

## Feature Components

### Submission Components (`components/submission/`)

#### Step1Form (`components/submission/Step1Form.tsx`)

First step of research submission form.

**Props:**
```typescript
interface Step1FormProps {
  initialData?: Partial<ResearchSubmission>
  onNext: (data: Step1Data) => void
  onSaveDraft: (data: Step1Data) => void
}
```

**Fields:**
- Research topic
- Research description
- Researcher name
- Researcher email
- Researcher institution
- Researcher department

**Features:**
- Auto-save draft
- Validation with Zod
- Error messages
- Next button

---

#### FormInput (`components/submission/FormInput.tsx`)

Styled input for submission forms.

**Props:**
```typescript
interface FormInputProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  error?: string
}
```

**Usage:**
```tsx
<FormInput 
  label="Research Topic"
  name="researchTopic"
  placeholder="Enter research topic"
  required
  value={topic}
  onChange={setTopic}
  error={errors.topic}
/>
```

---

#### FormTextarea (`components/submission/FormTextarea.tsx`)

Styled textarea for submission forms.

**Props:**
```typescript
interface FormTextareaProps {
  label: string
  name: string
  placeholder?: string
  required?: boolean
  rows?: number
  value: string
  onChange: (value: string) => void
  error?: string
}
```

---

#### FormSelect (`components/submission/FormSelect.tsx`)

Styled select dropdown for submission forms.

**Props:**
```typescript
interface FormSelectProps {
  label: string
  name: string
  options: Array<{ value: string; label: string }>
  required?: boolean
  value: string
  onChange: (value: string) => void
  error?: string
}
```

---

#### ProgressStepper (`components/submission/ProgressStepper.tsx`)

Visual progress indicator for 3-step form.

**Props:**
```typescript
interface ProgressStepperProps {
  currentStep: 1 | 2 | 3
  steps: Array<{ number: number; label: string }>
}
```

**Usage:**
```tsx
<ProgressStepper 
  currentStep={2}
  steps={[
    { number: 1, label: 'Research Summary' },
    { number: 2, label: 'Additional Details' },
    { number: 3, label: 'Scout Pitch' }
  ]}
/>
```

---

#### ReviewCard (`components/submission/ReviewCard.tsx`)

Summary card for review step.

**Props:**
```typescript
interface ReviewCardProps {
  title: string
  data: Record<string, any>
  onEdit: () => void
}
```

**Usage:**
```tsx
<ReviewCard 
  title="Research Summary"
  data={{
    'Research Topic': submission.researchTopic,
    'Researcher Name': submission.researcherName,
    'Institution': submission.researcherInstitution
  }}
  onEdit={() => setStep(1)}
/>
```

---

### Settings Components (`components/settings/`)

#### ProfileSettings (`components/settings/ProfileSettings.tsx`)

Profile settings form.

**Features:**
- Update display name
- Update bio
- Profile picture upload (future)

---

#### AccountSettings (`components/settings/AccountSettings.tsx`)

Account settings form.

**Features:**
- Change password
- Email preferences (future)
- Privacy settings (future)

---

#### SettingsTabs (`components/settings/SettingsTabs.tsx`)

Tab navigation for settings.

**Props:**
```typescript
interface SettingsTabsProps {
  activeTab: 'profile' | 'account'
  onTabChange: (tab: 'profile' | 'account') => void
}
```

---

### Dashboard Components

#### DashboardNavbar (`components/dashboard-navbar.tsx`)

Dashboard-specific navbar with navigation links.

**Props:**
```typescript
interface DashboardNavbarProps {
  displayName: string
  role: string
  initials: string
  profilePictureUrl?: string | null
  activePage: 'submissions' | 'drafts' | 'settings'
}
```

**Features:**
- Logo
- Navigation links (Submissions, Drafts)
- User dropdown
- Active page indicator

---

#### SubmissionsTable (`components/SubmissionsTable.tsx`)

Table displaying user's submissions.

**Props:**
```typescript
interface SubmissionsTableProps {
  submissions: ResearchSubmission[]
  statusConfig: Record<string, { label: string; bg: string; text: string }>
}
```

**Features:**
- Sortable columns
- Status badges
- Date formatting
- Click to view details

---

#### DraftsTable (`components/DraftsTable.tsx`)

Table displaying user's drafts.

**Props:**
```typescript
interface DraftsTableProps {
  drafts: ResearchSubmission[]
}
```

**Features:**
- Resume editing
- Delete draft
- Date formatting

---

### Support Components

#### SupportWidget (`components/SupportWidget.tsx`)

Floating support widget (future feature).

**Usage:**
```tsx
<SupportWidget />
```

**Features:**
- Floating button
- Opens support chat
- Only visible when authenticated

---

## Component Patterns

### Server Components (Default)

```tsx
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const data = await fetchData()
  
  return <div>{/* Render */}</div>
}
```

**When to use:**
- Data fetching
- No interactivity needed
- SEO important

---

### Client Components

```tsx
'use client'

// components/InteractiveComponent.tsx
export function InteractiveComponent() {
  const [state, setState] = useState()
  
  return <div onClick={() => setState(...)}>...</div>
}
```

**When to use:**
- User interaction (onClick, onChange)
- Browser APIs (localStorage, window)
- React hooks (useState, useEffect)

---

### Form Components

```tsx
'use client'

export function MyForm() {
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validate
    const result = schema.safeParse(formData)
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors)
      return
    }
    
    // Submit
    const response = await myAction(formData)
    if (response.error) {
      setErrors({ _form: response.error })
    }
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

---

## Styling Guidelines

### Typography Classes

```css
h1, .h1          /* Hero headlines: 36-60px, Rethink Sans, 700 */
h2, .h2          /* Section titles: 28-45px, Rethink Sans, 700 */
h3, .h3          /* Subsection titles: 22-30px, Rethink Sans, 600 */
h4, .h4          /* Card titles: 18-22.5px, Rethink Sans, 600 */
.body-large      /* Large body: 18-22.5px, Merriweather, 400 */
.body, p         /* Regular body: 16-20px, Rethink Sans, 400 */
.body-bold       /* Bold body: 16-20px, Merriweather, 700 */
.caption         /* Metadata: 14-17.5px, Rethink Sans, 400 */
.button          /* Button text: 14-20px, Rethink Sans, 500 */
.label           /* Form labels: 14-17.5px, Rethink Sans, 500 */
```

### Color Classes

```css
bg-navy          /* #1B2A4A - Primary dark */
bg-teal          /* #0D7377 - Primary accent */
bg-teal-dark     /* #0A5A5D - Hover state */
bg-off-white     /* #FAFBFC - Light background */
bg-cool-gray     /* #6B7280 - Secondary text */
bg-light-gray    /* #E5E7EB - Borders */
bg-purple        /* #6B5CE7 - Accent */
bg-gold          /* #C9A84C - Scout badge */
bg-green         /* #2D7D46 - Success */
bg-red           /* #EF4444 - Error */
bg-amber         /* #F59E0B - Warning */
```

### Utility Classes

```css
.container       /* Max-width container with padding */
.card            /* Card styling */
.button          /* Button styling */
.input           /* Input styling */
.badge           /* Badge styling */
```

---

## Accessibility

### ARIA Labels
```tsx
<button aria-label="Close modal">
  <X />
</button>
```

### Keyboard Navigation
- All interactive elements focusable
- Tab order logical
- Enter/Space activate buttons

### Screen Readers
- Semantic HTML
- ARIA labels where needed
- Alt text for images

---

## Performance

### Code Splitting
```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>
})
```

### Image Optimization
```tsx
import Image from 'next/image'

<Image 
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority
/>
```

### Lazy Loading
```tsx
<Image 
  src="/image.jpg"
  alt="Description"
  loading="lazy"
/>
```

---

## Testing Components

```typescript
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click Me</Button>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })
  
  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click Me</Button>)
    screen.getByText('Click Me').click()
    expect(onClick).toHaveBeenCalled()
  })
})
```
