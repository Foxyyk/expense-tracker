# PageContainer Component - Quick Reference Guide

## Overview

The PageContainer component system provides reusable, consistent styling for all pages in the Expense Tracker application.

## Components

### 1. PageContainer

Main page wrapper that handles layout, spacing, and theme support.

```jsx
import { PageContainer } from "../components/PageContainer";

export default function MyPage() {
  return <PageContainer>{/* All page content goes here */}</PageContainer>;
}
```

**Props**: `{ children }`

**What it provides**:

- ✅ Responsive max-width container (7xl = 80rem)
- ✅ Center horizontal alignment
- ✅ Responsive padding (4px → 40px based on screen size)
- ✅ Background gradient (theme-aware)
- ✅ Text color inheritance

---

### 2. PageHeader

Standardized page title section with icon, title, and subtitle support.

```jsx
import { PageHeader } from "../components/PageContainer";

<PageHeader icon="📊" title="Dashboard" subtitle="Your financial overview" />;
```

**Props**:

```javascript
{
  icon: string,        // Emoji or icon (default: "📄")
  title: string,       // Main page title
  subtitle: string     // Optional subtitle
}
```

**Output**:

- Icon + title on same line (flexbox)
- Subtitle below title
- Responsive font sizes
- Proper spacing and dark mode support

**Example**:

```jsx
<PageHeader
  icon="💰"
  title="Expenses"
  subtitle="Track and manage your spending"
/>
```

---

### 3. PageSection

Reusable card/section component for content blocks with optional headers.

```jsx
import { PageSection } from "../components/PageContainer";

<PageSection title="Monthly Summary" subtitle="Overview of this month">
  {/* Content goes here */}
</PageSection>;
```

**Props**:

```javascript
{
  title: string,       // Section header (optional)
  subtitle: string,    // Section description (optional)
  children: ReactNode, // Content
  className: string    // Additional classes (optional)
}
```

**Features**:

- Rounded corners (rounded-xl)
- Shadow effect with hover state
- Blue top border (4px)
- Gradient background (theme-aware)
- Proper spacing for header content

**Examples**:

Without header:

```jsx
<PageSection>
  <div>Content</div>
</PageSection>
```

With header:

```jsx
<PageSection title="📊 Statistics" subtitle="Your performance metrics">
  <div>Statistics content</div>
</PageSection>
```

With custom styling:

```jsx
<PageSection title="Custom" className="border-l-4 border-emerald-500">
  <div>Custom styled content</div>
</PageSection>
```

---

### 4. PageGrid

Responsive grid component for laying out multiple items.

```jsx
import { PageGrid } from "../components/PageContainer";

<PageGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap={6}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</PageGrid>;
```

**Props**:

```javascript
{
  children: ReactNode,
  cols: {
    mobile: 1,    // Number of columns on mobile
    tablet: 2,    // Number of columns on tablet (sm:)
    desktop: 3,   // Number of columns on desktop (lg:)
    large: 4      // Number of columns on large screens (xl:)
  },
  gap: number   // Grid gap: 3, 4, 5, 6, or 8 (default: 6)
}
```

**Example**:

```jsx
<PageGrid cols={{ mobile: 1, tablet: 2, desktop: 4 }} gap={4}>
  <StatCard title="Total" value="$1,250" />
  <StatCard title="Average" value="$450" />
  <StatCard title="Count" value="12" />
  <StatCard title="Trend" value="+15%" />
</PageGrid>
```

---

## Complete Page Example

```jsx
import {
  PageContainer,
  PageHeader,
  PageSection,
  PageGrid,
} from "../components/PageContainer";
import { useDarkMode } from "../context/DarkModeContext";

export default function ExpensesPage() {
  const { isDarkMode } = useDarkMode();

  return (
    <PageContainer>
      {/* Page header */}
      <PageHeader
        icon="💸"
        title="Expenses"
        subtitle="Manage and track your spending"
      />

      {/* Stats grid */}
      <PageGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
        <StatCard title="Total" value="$1,250" icon="💰" />
        <StatCard title="This Month" value="$450" icon="📊" />
        <StatCard title="Count" value="42" icon="📝" />
      </PageGrid>

      {/* Main section */}
      <PageSection
        title="📈 Recent Transactions"
        subtitle="Your latest expenses"
      >
        <ExpensesList />
      </PageSection>

      {/* Additional sections */}
      <PageSection title="🏷️ By Category">
        <CategoryBreakdown />
      </PageSection>
    </PageContainer>
  );
}
```

---

## Styling Classes Used

### Responsive Padding

```css
px-4 sm:px-6 lg:px-8 xl:px-10
py-8 sm:py-12 md:py-16
```

### Colors

**Dark Mode**:

```css
bg-gray-900 text-gray-100
border-blue-400
hover:shadow-blue-900/50
```

**Light Mode**:

```css
bg-white text-gray-900
border-blue-500
hover:shadow-blue-200/50
```

### Transitions

```css
transition-colors
transition-shadow
hover:shadow-xl
```

---

## Common Patterns

### Loading State

```jsx
<PageContainer>
  <PageHeader icon="📊" title="Dashboard" subtitle="Loading..." />
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-400 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">Loading data...</p>
    </div>
  </div>
</PageContainer>
```

### Error State

```jsx
<PageContainer>
  <PageHeader icon="⚠️" title="Error" subtitle="Something went wrong" />
  <PageSection className="border-red-500">
    <div className="text-red-600">
      <p className="font-semibold">Failed to load data</p>
      <p className="text-sm mt-2">Please try again later</p>
    </div>
  </PageSection>
</PageContainer>
```

### Empty State

```jsx
<PageContainer>
  <PageHeader icon="📭" title="No Data" />
  <PageSection>
    <div className="text-center py-12">
      <p className="text-2xl font-semibold mb-2">No items found</p>
      <p className="text-gray-600">Start by creating your first entry</p>
    </div>
  </PageSection>
</PageContainer>
```

---

## Dark Mode Support

All components automatically support dark mode through the `useDarkMode` context:

```jsx
import { useDarkMode } from "../context/DarkModeContext";

const { isDarkMode } = useDarkMode();

// Colors automatically adapt based on isDarkMode value
```

You don't need to do anything special - the components handle it automatically!

---

## File Location

`src/components/PageContainer.jsx`

## Import Statement

```javascript
import {
  PageContainer,
  PageHeader,
  PageSection,
  PageGrid,
} from "../components/PageContainer";
```

---

## Migration Guide

**Old approach** (before refactoring):

```jsx
<div className={`min-h-screen w-full px-4 ...`}>
  <div className="max-w-7xl mx-auto">
    <h1 className="text-4xl font-bold mb-8">Title</h1>
    <p className="text-gray-600">Subtitle</p>
    <div className="rounded-xl shadow-md p-6 bg-white">Content</div>
  </div>
</div>
```

**New approach** (after refactoring):

```jsx
<PageContainer>
  <PageHeader title="Title" subtitle="Subtitle" />
  <PageSection>Content</PageSection>
</PageContainer>
```

This reduces code by ~60% while maintaining consistency!

---

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Dark mode support via CSS and JavaScript

## Performance

- No additional bundle size impact (uses existing Tailwind classes)
- Zero runtime overhead (all styling at build time)
- Optimized for Core Web Vitals (LCP, CLS, FID)
