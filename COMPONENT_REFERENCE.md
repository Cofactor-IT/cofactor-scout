# Component Quick Reference

## Import Patterns

### Single Component
```tsx
import { Button } from '@/components/ui/button'
```

### Multiple Components from Same Directory
```tsx
import { Button, Input, Textarea } from '@/components/ui'
```

### Layout Components
```tsx
import { Navbar, PageHeader, StickyFooter } from '@/components/shared'
```

### Feature Components
```tsx
import { StatCard, CommentBox, SubmissionRow } from '@/components/features'
```

## Common Patterns

### Form with Validation
```tsx
'use client'

import { useState } from 'react'
import { Input, Button, AlertBanner } from '@/components/ui'

export function MyForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email.includes('@')) {
      setError('Invalid email')
      return
    }
    // Submit logic
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <AlertBanner variant="error">{error}</AlertBanner>}
      
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!!error}
        helperText={error}
      />
      
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### Data Table
```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'
import { Button } from '@/components/ui/button'

export function DataTable({ data }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>
              <StatusBadge variant={item.status}>
                {item.statusLabel}
              </StatusBadge>
            </TableCell>
            <TableCell>
              <Button size="sm" onClick={() => handleView(item.id)}>
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Modal Dialog
```tsx
'use client'

import { useState } from 'react'
import { Modal, Button } from '@/components/ui'

export function DeleteConfirmation({ itemId, onConfirm }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button variant="danger" onClick={() => setIsOpen(true)}>
        Delete
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Deletion"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                onConfirm(itemId)
                setIsOpen(false)
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this item? This action cannot be undone.</p>
      </Modal>
    </>
  )
}
```

### Tabbed Interface
```tsx
'use client'

import { useState } from 'react'
import { Tabs } from '@/components/ui'

export function TabbedContent() {
  const [activeTab, setActiveTab] = useState('all')

  const tabs = [
    { key: 'all', label: 'All Items', badge: 42 },
    { key: 'pending', label: 'Pending', badge: 5 },
    { key: 'approved', label: 'Approved', badge: 37 },
  ]

  return (
    <div>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="mt-6">
        {activeTab === 'all' && <AllItems />}
        {activeTab === 'pending' && <PendingItems />}
        {activeTab === 'approved' && <ApprovedItems />}
      </div>
    </div>
  )
}
```

### Search with Results
```tsx
'use client'

import { useState } from 'react'
import { SearchBar } from '@/components/ui'

export function SearchableList({ items }) {
  const [search, setSearch] = useState('')

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <SearchBar
        value={search}
        onChange={setSearch}
        onClear={() => setSearch('')}
        placeholder="Search items..."
      />
      
      <div className="mt-4">
        {filtered.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>
    </div>
  )
}
```

### Multi-Step Form
```tsx
'use client'

import { useState } from 'react'
import { ProgressIndicator, Button, StickyFooter } from '@/components/ui'

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1)

  const steps = [
    { number: 1, label: 'Basic Info' },
    { number: 2, label: 'Details' },
    { number: 3, label: 'Review' },
  ]

  return (
    <div className="pb-20">
      <ProgressIndicator steps={steps} currentStep={currentStep} />
      
      <div className="mt-8">
        {currentStep === 1 && <Step1 />}
        {currentStep === 2 && <Step2 />}
        {currentStep === 3 && <Step3 />}
      </div>

      <StickyFooter
        leftButton={{
          text: 'Back',
          onClick: () => setCurrentStep(currentStep - 1),
          variant: 'secondary',
        }}
        rightButton={{
          text: currentStep === 3 ? 'Submit' : 'Next',
          onClick: () => setCurrentStep(currentStep + 1),
          variant: 'primary',
          disabled: currentStep === 1,
        }}
      />
    </div>
  )
}
```

### Comment Thread
```tsx
import { CommentBox, Comment } from '@/components/features'

export function CommentThread({ comments, currentUser, onAddComment }) {
  return (
    <div className="space-y-6">
      <CommentBox
        user={currentUser}
        onSubmit={onAddComment}
        placeholder="Add a comment..."
      />

      <div className="space-y-4">
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            currentUserId={currentUser.id}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}
```

### Dashboard Stats
```tsx
import { StatCard } from '@/components/features'
import { FileText, Clock, CheckCircle } from 'lucide-react'

export function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-3 gap-8">
      <StatCard
        label="Total Submissions"
        value={stats.total}
        icon={FileText}
        iconClassName="text-teal"
        iconContainerClassName="bg-[#DBEAFE]"
      />
      <StatCard
        label="Pending Review"
        value={stats.pending}
        icon={Clock}
        iconClassName="text-amber"
        iconContainerClassName="bg-[#FEF3C7]"
      />
      <StatCard
        label="Approved"
        value={stats.approved}
        icon={CheckCircle}
        iconClassName="text-green"
        iconContainerClassName="bg-[#D1FAE5]"
      />
    </div>
  )
}
```

## Styling Tips

### Custom Styling
```tsx
// Add custom classes via className prop
<Button className="w-full mt-4">Full Width Button</Button>

// Use cn() utility for conditional classes
import { cn } from '@/lib/utils/formatting'

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  isError && "error-classes"
)}>
  Content
</div>
```

### Responsive Design
```tsx
// Use Tailwind responsive prefixes
<div className="px-4 sm:px-8 lg:px-[120px]">
  <h1 className="text-2xl sm:text-3xl lg:text-4xl">
    Responsive Heading
  </h1>
</div>
```

### Layout Containers
```tsx
// Standard page layout
<div className="min-h-screen bg-white">
  <Navbar user={user} />
  
  <PageHeader
    title="Page Title"
    subtitle="Page description"
    backLink={{ text: "Back", href: "/dashboard" }}
  />
  
  <main className="max-w-[1200px] mx-auto px-[120px] py-[40px]">
    {/* Content */}
  </main>
</div>
```

## Color Reference

```tsx
// Use design token colors
className="bg-navy text-white"
className="bg-teal hover:bg-teal-dark"
className="text-cool-gray"
className="border-light-gray"
className="bg-off-white"
```

## Typography Reference

```tsx
// Headings (Rethink Sans)
className="font-heading font-bold text-[36px]"
className="font-heading font-semibold text-[24px]"
className="font-heading font-medium text-[14px]"

// Body (Merriweather)
className="font-body font-normal text-[16px]"
className="font-body text-[14px]"
```

## Spacing Reference

```tsx
// Use consistent spacing
className="p-6"    // 24px padding
className="gap-4"  // 16px gap
className="mb-8"   // 32px margin bottom
className="mt-12"  // 48px margin top
```

## Icon Usage

```tsx
import { Icon } from 'lucide-react'

// Standard size
<Icon size={16} className="text-cool-gray" />

// In buttons
<Button>
  <Icon className="mr-2 h-4 w-4" />
  Button Text
</Button>
```

## Error Handling

```tsx
// Form validation
<Input
  error={!!errors.email}
  helperText={errors.email}
/>

// Alert messages
<AlertBanner variant="error">
  {errorMessage}
</AlertBanner>

// Safe navigation
import { safeNavigate } from '@/lib/utils/components'

safeNavigate(router, '/some-route')
```

## Accessibility

```tsx
// Always include labels
<Input label="Email" />

// Use semantic HTML
<button type="submit">Submit</button>

// Add ARIA labels when needed
<button aria-label="Close modal">
  <X size={20} />
</button>
```
