# Component Testing Guide

## Testing Checklist

### Visual Testing
- [ ] Component renders correctly in all variants
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Colors match design tokens exactly
- [ ] Typography uses correct fonts (Rethink Sans for headings, Merriweather for body)
- [ ] Border radius is correct (4px for containers, 9999px for buttons/badges)
- [ ] Spacing and padding match specifications
- [ ] Hover states work correctly
- [ ] Focus states are visible and accessible

### Functional Testing
- [ ] All props work as expected
- [ ] Event handlers fire correctly
- [ ] Form inputs accept and validate data
- [ ] Error states display properly
- [ ] Loading states work correctly
- [ ] Disabled states prevent interaction
- [ ] Navigation links route correctly
- [ ] Modal/dropdown opens and closes properly

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader labels are present
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible
- [ ] ARIA attributes are correct
- [ ] Form labels are associated with inputs

### Edge Cases
- [ ] Empty states display correctly
- [ ] Long text truncates or wraps appropriately
- [ ] Missing/null data handled gracefully
- [ ] Invalid routes redirect to /not-found
- [ ] Large datasets don't break layout
- [ ] Special characters render correctly

## Component-Specific Tests

### Button
```tsx
// Test all variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button variant="text">Text</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>

// Test sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="icon"><Icon /></Button>

// Test states
<Button isLoading>Loading</Button>
<Button disabled>Disabled</Button>
```

### Input
```tsx
// Test states
<Input label="Normal" />
<Input label="Error" error helperText="Error message" />
<Input label="Locked" locked />
<Input label="With Value" value="Test" />
```

### StatusBadge
```tsx
// Test all variants
<StatusBadge variant="pending">Pending</StatusBadge>
<StatusBadge variant="validating">Validating</StatusBadge>
<StatusBadge variant="pitched">Pitched</StatusBadge>
<StatusBadge variant="match">Match Made</StatusBadge>
```

### Modal
```tsx
// Test open/close
const [isOpen, setIsOpen] = useState(false)
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Test">
  Content
</Modal>

// Test sizes
<Modal size="sm">Small</Modal>
<Modal size="md">Medium</Modal>
<Modal size="lg">Large</Modal>

// Test with footer
<Modal footer={<Button>Action</Button>}>Content</Modal>
```

### Table
```tsx
// Test empty state
<Table>
  <TableBody>
    <TableRow>
      <TableCell colSpan={3}>No data</TableCell>
    </TableRow>
  </TableBody>
</Table>

// Test with data
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map(row => (
      <TableRow key={row.id}>
        <TableCell>{row.col1}</TableCell>
        <TableCell>{row.col2}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Tabs
```tsx
// Test tab switching
const [activeTab, setActiveTab] = useState('tab1')
<Tabs
  tabs={[
    { key: 'tab1', label: 'Tab 1', badge: 5 },
    { key: 'tab2', label: 'Tab 2' },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### ProgressIndicator
```tsx
// Test all steps
<ProgressIndicator
  steps={[
    { number: 1, label: 'Step 1' },
    { number: 2, label: 'Step 2' },
    { number: 3, label: 'Step 3' },
  ]}
  currentStep={2}
/>
```

### AlertBanner
```tsx
// Test all variants
<AlertBanner variant="info">Info message</AlertBanner>
<AlertBanner variant="warning">Warning message</AlertBanner>
<AlertBanner variant="success">Success message</AlertBanner>
<AlertBanner variant="error">Error message</AlertBanner>
```

### Avatar
```tsx
// Test with image
<Avatar src="/image.jpg" initials="JD" />

// Test with initials
<Avatar initials="JD" />

// Test sizes
<Avatar initials="JD" size="sm" />
<Avatar initials="JD" size="md" />
<Avatar initials="JD" size="lg" />
```

### Card
```tsx
// Test padding variants
<Card padding="none">No padding</Card>
<Card padding="sm">Small padding</Card>
<Card padding="md">Medium padding</Card>
<Card padding="lg">Large padding</Card>

// Test with header
<Card header={{ title: "Title", action: <Button>Action</Button> }}>
  Content
</Card>
```

### SearchBar
```tsx
// Test search and clear
const [search, setSearch] = useState('')
<SearchBar
  value={search}
  onChange={setSearch}
  onClear={() => setSearch('')}
  placeholder="Search..."
/>
```

### CommentBox & Comment
```tsx
// Test comment submission
<CommentBox
  user={user}
  onSubmit={(content) => console.log(content)}
/>

// Test comment display
<Comment
  comment={commentData}
  currentUserId={user.id}
  onEdit={(id) => console.log('Edit', id)}
  onDelete={(id) => console.log('Delete', id)}
/>
```

## Browser Testing

Test in these browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Performance Testing

- [ ] Components render in < 100ms
- [ ] No unnecessary re-renders
- [ ] Images are optimized
- [ ] No memory leaks
- [ ] Smooth animations (60fps)

## Common Issues

### Issue: Font not loading
**Solution**: Check that Google Fonts import is in globals.css

### Issue: Colors not matching
**Solution**: Verify CSS variables are defined in globals.css

### Issue: Border radius wrong
**Solution**: Use `rounded-sharp` (4px) or `rounded-pill` (9999px)

### Issue: Spacing inconsistent
**Solution**: Use Tailwind spacing scale (4, 8, 12, 16, 24, 32, 40, 48px)

### Issue: Component not responsive
**Solution**: Test at breakpoints: 320px, 768px, 1024px, 1440px

### Issue: Navigation broken
**Solution**: Ensure routes exist or redirect to /not-found

## Automated Testing

### Unit Tests (Jest + React Testing Library)
```tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

test('renders button with text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})

test('calls onClick when clicked', () => {
  const handleClick = jest.fn()
  render(<Button onClick={handleClick}>Click me</Button>)
  screen.getByText('Click me').click()
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### Visual Regression Tests (Chromatic/Percy)
```tsx
// Storybook stories for visual testing
export const Primary = () => <Button variant="primary">Primary</Button>
export const Secondary = () => <Button variant="secondary">Secondary</Button>
export const Disabled = () => <Button disabled>Disabled</Button>
```

## Deployment Checklist

Before deploying:
- [ ] All components tested manually
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors
- [ ] Lighthouse score > 90
- [ ] Accessibility audit passes
- [ ] Cross-browser testing complete
- [ ] Mobile testing complete
- [ ] Performance testing complete
