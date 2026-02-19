# Cofactor Scout Component Library

## ✅ Component Status

All 25 components have been implemented and are located in their proper directories.

### Layout Components (`components/shared/`)
1. ✅ **Navbar.tsx** - Main navigation with logo, links, and user profile
2. ✅ **ProfileDropdown.tsx** - User profile dropdown menu
3. ✅ **PageHeader.tsx** - Page header with title, subtitle, back link, badge
4. ✅ **StickyFooter.tsx** - Sticky footer with action buttons

### UI Components (`components/ui/`)
5. ✅ **Button.tsx** - Primary, secondary, danger, text, ghost, outline variants
6. ✅ **Input.tsx** - Text input with label, helper text, error states, locked state
7. ✅ **Textarea.tsx** - Textarea with label, helper text, character count
8. ✅ **Dropdown.tsx** - Select dropdown with label, placeholder, error states
9. ✅ **Checkbox.tsx** - Checkbox with label and helper text
10. ✅ **Card.tsx** - Container card with optional header and padding variants
11. ✅ **StatusBadge.tsx** - Status badges (pending, validating, pitched, match)
12. ✅ **Avatar.tsx** - User avatar with image or initials, multiple sizes
13. ✅ **Table.tsx** - Data table with header, body, rows, cells
14. ✅ **Tabs.tsx** - Tab navigation with badges
15. ✅ **ProgressIndicator.tsx** - Multi-step progress indicator
16. ✅ **Modal.tsx** - Modal dialog with title, content, footer
17. ✅ **SearchBar.tsx** - Search input with icon and clear button
18. ✅ **AlertBanner.tsx** - Alert banners (info, warning, success, error)

### Feature Components (`components/features/`)
19. ✅ **CommentBox.tsx** - Comment input box with avatar (`submissions/`)
20. ✅ **Comment.tsx** - Comment display with edit/delete (`submissions/`)
21. ✅ **StatCard.tsx** - Dashboard stat card with icon (`dashboard/`)
22. ✅ **SubmissionRow.tsx** - Submission table row (`submissions/`)
23. ✅ **DraftRow.tsx** - Draft table row (`submissions/`)
24. ✅ **InfoRow.tsx** - Info display row (`submissions/`)
25. ✅ **AdditionalLinkInput.tsx** - Additional link input fields (`profile/`)

## Design Tokens

### Colors
```typescript
navy: #1B2A4A
teal: #0D7377
tealDark: #0a5a5d
coolGray: #6B7280
lightGray: #E5E7EB
offWhite: #FAFBFC
purple: #6B5CE7
gold: #C9A84C
green: #2D7D46
red: #EF4444
amber: #F59E0B
white: #FFFFFF
```

### Typography
- **Headings**: "Rethink Sans", sans-serif
- **Body/Inputs**: "Merriweather", serif

### Border Radius
- **Containers/Cards/Inputs**: 4px (`rounded-sharp`)
- **Buttons/Badges/Avatars**: 9999px (`rounded-pill`)

### Spacing
- Page margin: 120px
- Content width: 1200px
- Form card width: 900px
- Navbar height: 80px

## Usage Examples

### Button
```tsx
import { Button } from '@/components/ui/button'

<Button variant="primary" size="default">
  Submit
</Button>
```

### Input
```tsx
import { Input } from '@/components/ui/input'

<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  helperText="We'll never share your email"
  error={false}
/>
```

### Card
```tsx
import { Card } from '@/components/ui/card'

<Card
  padding="md"
  header={{
    title: "Settings",
    action: <Button>Save</Button>
  }}
>
  <p>Card content here</p>
</Card>
```

### StatusBadge
```tsx
import { StatusBadge } from '@/components/ui/status-badge'

<StatusBadge variant="pending">
  Pending Research
</StatusBadge>
```

### Modal
```tsx
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
  footer={
    <>
      <Button variant="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleConfirm}>
        Confirm
      </Button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

### Table
```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>Active</TableCell>
      <TableCell>
        <Button size="sm">View</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Tabs
```tsx
import { Tabs } from '@/components/ui/tabs'

const tabs = [
  { key: 'all', label: 'All Submissions', badge: 12 },
  { key: 'pending', label: 'Pending', badge: 3 },
  { key: 'approved', label: 'Approved', badge: 9 },
]

<Tabs
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### ProgressIndicator
```tsx
import { ProgressIndicator } from '@/components/ui/progress-indicator'

const steps = [
  { number: 1, label: 'Basic Info' },
  { number: 2, label: 'Details' },
  { number: 3, label: 'Review' },
]

<ProgressIndicator
  steps={steps}
  currentStep={2}
/>
```

### AlertBanner
```tsx
import { AlertBanner } from '@/components/ui/alert-banner'

<AlertBanner variant="warning">
  Your submission is pending review. We'll notify you once it's processed.
</AlertBanner>
```

### CommentBox & Comment
```tsx
import { CommentBox } from '@/components/features/submissions/CommentBox'
import { Comment } from '@/components/features/submissions/Comment'

<CommentBox
  user={currentUser}
  onSubmit={handleCommentSubmit}
  placeholder="Add a comment..."
/>

<Comment
  comment={commentData}
  currentUserId={currentUser.id}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### StatCard
```tsx
import { StatCard } from '@/components/features/dashboard/StatCard'
import { FileText } from 'lucide-react'

<StatCard
  label="Total Submissions"
  value={42}
  icon={FileText}
  iconClassName="text-teal"
  iconContainerClassName="bg-[#DBEAFE]"
/>
```

## Link Routing

All components with navigation handle missing/invalid routes gracefully:

```tsx
// For Next.js Link components
import Link from 'next/link'
import { notFound } from 'next/navigation'

// For programmatic navigation
import { useRouter } from 'next/navigation'

const router = useRouter()

try {
  router.push('/some-route')
} catch (error) {
  router.push('/not-found')
}
```

## Code Standards

All components follow these standards:
- ✅ TypeScript with strict typing (no `any` types)
- ✅ Named exports (not default exports)
- ✅ `cn()` utility for conditional classNames
- ✅ Lucide React for icons
- ✅ Functions under 20 lines
- ✅ Single responsibility principle
- ✅ Descriptive names
- ✅ Self-contained (no inline styles)

## File Structure

```
components/
├── shared/              # Layout components
│   ├── Navbar.tsx
│   ├── ProfileDropdown.tsx
│   ├── PageHeader.tsx
│   └── StickyFooter.tsx
├── ui/                  # UI primitives
│   ├── button.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── dropdown.tsx
│   ├── checkbox.tsx
│   ├── card.tsx
│   ├── status-badge.tsx
│   ├── avatar.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── progress-indicator.tsx
│   ├── modal.tsx
│   ├── search-bar.tsx
│   └── alert-banner.tsx
└── features/            # Feature-specific components
    ├── dashboard/
    │   └── StatCard.tsx
    ├── submissions/
    │   ├── CommentBox.tsx
    │   ├── Comment.tsx
    │   ├── SubmissionRow.tsx
    │   ├── DraftRow.tsx
    │   └── InfoRow.tsx
    └── profile/
        └── AdditionalLinkInput.tsx
```

## Dependencies

All components use these packages (already installed):
- `react` & `react-dom`
- `next`
- `tailwindcss`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `lucide-react`
- `@radix-ui/react-slot`
- `@radix-ui/react-checkbox`

## Notes

- All components are client-side (`"use client"`) where needed
- All components support className prop for custom styling
- All form components support error states
- All interactive components have hover states
- All components are fully typed with TypeScript
- All components are accessible (ARIA labels where needed)


## Custom Icons

### Icon Paths
```tsx
import { ICON_PATHS } from '@/lib/utils/icons'

// Feature icons
<img src={ICON_PATHS.scout} alt="Scout" className="w-6 h-6" />
<img src={ICON_PATHS.contributor} alt="Contributor" className="w-6 h-6" />
<img src={ICON_PATHS.submitResearch} alt="Submit" className="w-6 h-6" />

// Logos
<img src={ICON_PATHS.navbarLogo} alt="Cofactor Scout" className="h-8" />
<img src={ICON_PATHS.heroLogo} alt="Cofactor Scout" className="h-16" />
```

### Available Icons
- approvedSubmission, contributor, earnCommission, eye, locked, pending
- reviewSubmission, scout, search, submitResearch, totalSubmission
- heroLogo, navbarLogo, logoMiniWhite
