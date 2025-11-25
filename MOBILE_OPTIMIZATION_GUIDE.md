# Mobile Optimization Guide

## Tailwind Responsive Breakpoints

- **Base (Mobile)**: Styles apply to all screens by default
- **sm:** - 640px and up (small tablets)
- **md:** - 768px and up (tablets)
- **lg:** - 1024px and up (desktops)
- **xl:** - 1280px and up (large desktops)

## Strategy

We'll add mobile-specific classes that only apply on small screens, and keep desktop styles with `md:` or `lg:` prefixes.

## Common Mobile Optimizations

1. **Navigation**: Hide some nav items on mobile, show in hamburger menu
2. **Spacing**: Reduce padding/margins on mobile
3. **Text sizes**: Smaller text on mobile
4. **Grid layouts**: Single column on mobile, multi-column on desktop
5. **Button sizes**: Larger touch targets on mobile (min 44px)
6. **Card layouts**: Full width on mobile, constrained on desktop

## Example Patterns

```tsx
// Mobile-first: smaller, then larger on desktop
<div className="text-base md:text-lg lg:text-xl">

// Hide on mobile, show on desktop
<div className="hidden md:block">

// Show on mobile, hide on desktop
<div className="block md:hidden">

// Different spacing
<div className="p-4 md:p-8 lg:p-12">

// Single column mobile, multi-column desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

