# Design Guidelines

**Audience:** Developers, Designers  
**Last Updated:** 2026-02-26

## Color System

### CSS Variables (from globals.css)

```css
--navy: #1B2A4A        /* Primary text, headers, dark backgrounds */
--teal: #0D7377        /* Primary buttons, links, CTAs */
--teal-dark: #0A5A5D   /* Button hover states */
--cool-gray: #6B7280   /* Secondary text, captions */
--light-gray: #E5E7EB  /* Borders, dividers */
--off-white: #FAFBFC   /* Page backgrounds, sections */
--white: #FFFFFF       /* Cards, containers */
--green: #2D7D46       /* Success states, Scout badges */
--red: #DC2626         /* Error states, destructive actions */
--amber: #F59E0B       /* Warning states, pending status */
--gold: #C9A84C        /* Scout badge accent */
```

### Usage Rules

**✅ CORRECT:**
```tsx
<div className="bg-[#1B2A4A]">  // Use hex directly in Tailwind
<div style={{ color: 'var(--navy)' }}>  // Or CSS variable
```

**❌ WRONG:**
```tsx
<div style={{ backgroundColor: '#1B2A4A' }}>  // Don't hardcode in style
const navy = '#1B2A4A'  // Don't create color constants
```

## Typography System

### Typography Classes (from globals.css)

| Class | Font | Weight | Size | Tablet Size | Desktop Size | Usage |
|-------|------|--------|------|-------------|--------------|-------|
| `.h1` | Rethink Sans | Bold | 36px | 48px | 60px | Hero headlines |
| `.h2` | Rethink Sans | Bold | 28px | 36px | 45px | Section titles |
| `.h3` | Rethink Sans | SemiBold | 22px | 26px | 30px | Subsection titles |
| `.h4` | Rethink Sans | SemiBold | 18px | 20px | 22.5px | Card titles |
| `.body` | Merriweather | Regular | 16px | 16px | 20px | Body text |
| `.body-large` | Merriweather | Regular | 18px | 18px | 22.5px | Intro paragraphs |
| `.body-bold` | Merriweather | Bold | 16px | 16px | 20px | Emphasized text |
| `.caption` | Rethink Sans | Regular | 14px | 14px | 17.5px | Labels, metadata |
| `.button` | Rethink Sans | Medium | 14px | 16px | 20px | Button text |
| `.label` | Rethink Sans | Medium | 14px | 14px | 17.5px | Form labels |

### Typography Pairing Rules

**h4 with body text must use text-sm:**

```tsx
// ✅ CORRECT
<h4>Card Title</h4>
<p className="body text-sm">Description text that pairs with h4</p>

// ❌ WRONG
<h4>Card Title</h4>
<p className="body">Description text</p>  // Too large, creates visual imbalance
```

**Why:** h4 is 18-22.5px, body is 16-20px. Without `text-sm`, the body text is too close in size to the heading, reducing visual hierarchy.

### Usage Rules

**✅ CORRECT:**
```tsx
<h1>Welcome</h1>  // Automatically uses .h1
<p className="body-large">Introduction text</p>
<span className="caption">Posted 2 hours ago</span>
```

**❌ WRONG:**
```tsx
<h1 style={{ fontSize: '48px' }}>Welcome</h1>  // Never hardcode
<p className="text-lg">Text</p>  // Don't use Tailwind text sizes
```

## Border Radius

- **4px** — All cards, inputs, containers, modals
- **9999px** (rounded-full) — All buttons, badges, avatars, pills

**✅ CORRECT:**
```tsx
<Card style={{ borderRadius: '4px' }}>
<Button className="rounded-full">
<div className="rounded-full">  // Badges
```

**❌ WRONG:**
```tsx
<Card className="rounded-lg">  // Don't use Tailwind radius
<Button style={{ borderRadius: '8px' }}>  // Wrong value
```

## Spacing System

### Page Padding
```tsx
className="px-4 md:px-8 lg:px-[120px]"
```

### Section Padding
```tsx
className="py-12 md:py-[80px]"
```

### Card Padding
```tsx
className="p-6 md:p-[48px]"
```

### Gap Between Elements
```tsx
className="gap-4 md:gap-6"  // Small gaps
className="gap-8 md:gap-12"  // Medium gaps
className="gap-12 md:gap-[60px]"  // Large gaps
```

## Shadow System

### Button Shadow
```tsx
className="shadow-[0px_2px_4px_rgba(13,115,119,0.2)]"
```

### Card Shadow
```tsx
className="shadow-sm"
```

## Button Variants

### Primary Button
```tsx
<Button variant="primary">Submit</Button>
// Teal background, white text, rounded-full
```

### Secondary Button
```tsx
<Button variant="secondary">Cancel</Button>
// White background, navy border, rounded-full
```

### Sizes
```tsx
className="h-[48px] px-[24px]"  // Small
className="h-[56px] px-[24px]"  // Medium (default)
className="h-[64px] px-[32px]"  // Large
```

## Badge Variants

### Scout Badge (Green)
```tsx
<div className="flex items-center h-[48px] px-[16px] rounded-full bg-[#D1FAE5]">
  <span className="text-[12px] text-[#2D7D46]">Verified Scout</span>
</div>
```

### Contributor Badge (Gray)
```tsx
<div className="flex items-center h-[48px] px-[16px] rounded-full bg-[#E5E7EB]">
  <span className="text-[12px] text-[#1B2A4A]">Community Contributor</span>
</div>
```

## Status Colors

### Submission Status
```tsx
PENDING_RESEARCH: { bg: '#FEF3C7', text: '#92400E' }  // Amber
VALIDATING: { bg: '#DBEAFE', text: '#1E40AF' }  // Blue
MATCH_MADE: { bg: '#D1FAE5', text: '#065F46' }  // Green
PITCHED: { bg: '#E0E7FF', text: '#3730A3' }  // Indigo
REJECTED: { bg: '#FEE2E2', text: '#991B1B' }  // Red
```

## Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

## What NOT To Do

❌ Never hardcode font sizes  
❌ Never hardcode colors in style attributes  
❌ Never use Tailwind text-* classes (text-lg, text-xl)  
❌ Never use Tailwind rounded-* except rounded-full  
❌ Never create custom color constants  
❌ Never use arbitrary border radius values  
❌ Never skip mobile responsiveness  

## Real Examples from Codebase

### Landing Page Hero
```tsx
<section className="bg-[#1B2A4A] px-4 md:px-8 lg:px-[120px] py-12 md:py-16">
  <h1 className="text-white">Discover Research. Connect Investors.</h1>
  <p className="body-large text-[#E1E8ED]">Description text</p>
  <Button className="w-full md:w-[280px] h-[56px] md:h-[64px]">
    Apply to Become a Scout
  </Button>
</section>
```

### Dashboard Card
```tsx
<Card className="h-[145px] flex flex-col justify-center px-[24px] shadow-sm">
  <FileText className="w-[27px] h-[27px] mb-[10px] text-[#0D7377]" />
  <div className="text-[41px] font-bold mb-[3px] text-[#1B2A4A]">12</div>
  <div className="text-[14px] text-[#6B7280]">Total Submissions</div>
</Card>
```
