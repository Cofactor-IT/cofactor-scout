# Animation Guidelines

**Audience:** Developers  
**Last Updated:** 2026-02-26

## Animation Components

### FadeIn (Scroll-Triggered)

**When to use:** Content that should animate when scrolled into view

**Component:** `components/ui/FadeIn.tsx`

```tsx
import { FadeIn } from '@/components/ui/FadeIn'

<FadeIn delay={0}>
  <Card>Animates when scrolled into viewport</Card>
</FadeIn>
```

**Properties:**
- Initial: `opacity: 0, y: 32` (32px below)
- Final: `opacity: 1, y: 0`
- Duration: `0.5s`
- Easing: `easeOut`
- Trigger: When element enters viewport
- Margin: `-80px` (triggers 80px before visible)
- Once: `true` (only animates once)

### FadeInOnLoad (Page Load)

**When to use:** Content that should animate immediately on page load

**Component:** `components/ui/FadeInOnLoad.tsx`

```tsx
import { FadeInOnLoad } from '@/components/ui/FadeInOnLoad'

<FadeInOnLoad delay={0.15}>
  <h1>Animates on page load</h1>
</FadeInOnLoad>
```

**Properties:**
- Initial: `opacity: 0, y: 24` (24px below)
- Final: `opacity: 1, y: 0`
- Duration: `0.5s`
- Easing: `easeOut`
- Trigger: Immediately on mount

## Stagger Patterns

### Landing Page Pattern (from app/page.tsx)

```tsx
<FadeInOnLoad delay={0}>
  <h1>First element</h1>
</FadeInOnLoad>

<FadeInOnLoad delay={0.15}>
  <p>Second element</p>
</FadeInOnLoad>

<FadeInOnLoad delay={0.3}>
  <div>Third element</div>
</FadeInOnLoad>
```

**Delay increments:** 0.15s between elements

### Card Grid Pattern

```tsx
<FadeIn delay={0}>
  <Card>First card</Card>
</FadeIn>

<FadeIn delay={0.15}>
  <Card>Second card</Card>
</FadeIn>

<FadeIn delay={0.3}>
  <Card>Third card</Card>
</FadeIn>
```

## Real Examples from Codebase

### Dashboard Statistics Cards

```tsx
// app/dashboard/page.tsx
<FadeInOnLoad delay={0}>
  <Card>Total Submissions</Card>
</FadeInOnLoad>

<FadeInOnLoad delay={0.1}>
  <Card>Pending Review</Card>
</FadeInOnLoad>

<FadeInOnLoad delay={0.2}>
  <Card>Approved</Card>
</FadeInOnLoad>
```

### Landing Page Hero

```tsx
// app/page.tsx
<FadeInOnLoad delay={0}>
  <h1>Headline</h1>
</FadeInOnLoad>

<FadeInOnLoad delay={0.15}>
  <p>Subheadline</p>
</FadeInOnLoad>

<FadeInOnLoad delay={0.3}>
  <div>Buttons</div>
</FadeInOnLoad>
```

### Choose Your Path Section

```tsx
// app/page.tsx
<FadeIn delay={0}>
  <Card>Scout Card</Card>
</FadeIn>

<FadeIn delay={0.15}>
  <Card>Contributor Card</Card>
</FadeIn>
```

## What NOT To Animate

❌ Form inputs  
❌ Buttons (except hover states)  
❌ Navigation bars  
❌ Error messages (should appear immediately)  
❌ Loading spinners  
❌ Modal overlays  

## Rules

1. **Never use inline Framer Motion** — Always use FadeIn or FadeInOnLoad components
2. **Stagger delays by 0.15s** for sequential elements
3. **Use FadeIn for scroll** — Content below the fold
4. **Use FadeInOnLoad for immediate** — Content above the fold
5. **Animate once** — Don't re-trigger on every scroll
6. **Keep it subtle** — 24-32px movement maximum
7. **0.5s duration** — Fast enough to feel snappy

## Performance

- Animations use `transform` and `opacity` (GPU-accelerated)
- `viewport={{ once: true }}` prevents re-renders
- No layout thrashing

## Accessibility

- Animations respect `prefers-reduced-motion`
- Content is accessible before animation completes
- No critical information hidden behind animations
