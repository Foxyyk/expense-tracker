# Expense Tracker Frontend - Visual Component Tree & Styling Guide

## Component Hierarchy Tree

```
📦 App.jsx (Root)
│
├── 🔐 AuthProvider (Context Wrapper)
│   │
│   └── 🛣️ Router (BrowserRouter)
│       │
│       ├── 📄 PUBLIC ROUTES (No Layout)
│       │   ├── /login → Login.jsx
│       │   │   └── Form: email, password inputs
│       │   │       Styling: Gradient bg, white card, animated
│       │   │
│       │   ├── /register → Register.jsx
│       │   │   └── Form: email, password, confirm fields
│       │   │       Styling: Similar to Login
│       │   │
│       │   └── * → NotFound.jsx
│       │       └── 404 message with link to home
│       │
│       └── 🔒 PROTECTED ROUTES (ProtectedRoute wrapper)
│           │
│           └── 🎨 Layout.jsx (Wrapper with Navbar & Footer)
│               │
│               ├── 🧭 Navbar.jsx
│               │   ├── Logo/Brand
│               │   ├── Nav Links
│               │   │   ├── Dashboard
│               │   │   ├── Expenses
│               │   │   ├── Categories
│               │   │   └── Profile
│               │   └── User Menu
│               │       └── Logout
│               │
│               ├── 📊 Main Content Area
│               │   ├── / or /dashboard → Dashboard.jsx
│               │   │   ├── 📈 Line Chart (Monthly Trends)
│               │   │   ├── 📊 Bar Chart (Category Comparison)
│               │   │   └── 🥧 Pie Chart (Distribution)
│               │   │
│               │   ├── 💸 /expenses → Expenses.jsx
│               │   │   ├── Add/Edit Form
│               │   │   │   ├── Date Input
│               │   │   │   ├── Category Dropdown
│               │   │   │   ├── Amount Input
│               │   │   │   └── Description Text
│               │   │   ├── Expenses Table
│               │   │   │   └── Edit/Delete Buttons
│               │   │   └── Export CSV Button
│               │   │
│               │   ├── 🏷️ /categories → Categories.jsx
│               │   │   ├── Add Category Button
│               │   │   └── Category Grid
│               │   │       ├── Category Card
│               │   │       ├── Expense Count
│               │   │       ├── Total Amount
│               │   │       └── Edit/Delete Buttons
│               │   │
│               │   └── 👤 /profile → Profile.jsx
│               │       ├── User Info Section
│               │       │   ├── Email (Read-only)
│               │       │   └── Join Date (Read-only)
│               │       └── Settings Section
│               │           ├── Currency Selector
│               │           └── Theme Selector
│               │
│               └── 🦶 Footer
│                   └── Copyright text
```

---

## Styling Approach Architecture

```
┌─────────────────────────────────────────────────────┐
│         STYLING HIERARCHY & LAYERS                  │
└─────────────────────────────────────────────────────┘

┌──────────────────────────┐
│  1. Tailwind CSS         │ ← PRIMARY (Utility-first)
│  (tailwind.config.js)    │
├──────────────────────────┤
│ • Color tokens           │
│ • Spacing scale          │
│ • Custom theme colors    │
│ • Breakpoints (md, lg)   │
│ • Shadows, radius        │
└──────────────────────────┘
           ↓
┌──────────────────────────┐
│  2. CSS Modules          │ ← SUPPORTING
│  /styles/ folder         │
├──────────────────────────┤
│ • globals.css            │
│ • Navbar.css             │
│ • Layout.css             │
│ • Dashboard.css          │
│ • Expenses.css           │
│ • Auth.css               │
└──────────────────────────┘
           ↓
┌──────────────────────────┐
│  3. Inline Styles        │ ← COMPONENT-LEVEL
│  className attributes   │
├──────────────────────────┤
│ • Tailwind classes       │
│ • Responsive prefixes    │
│ • Hover states           │
│ • Focus states           │
└──────────────────────────┘
```

---

## Tailwind Color Palette in Use

```
┌─────────────────────────────────────────┐
│  PRIMARY COLORS (Sky Blue)              │
├─────────────────────────────────────────┤
│ bg-sky-500  →  #0ea5e9  Primary Action │
│ bg-sky-600  →  #0284c7  Hover State    │
│ text-sky-400 → #0ea5e9  Highlighted    │
│ border-sky-400 → Active Indicator      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  SECONDARY COLORS (Slate Gray)          │
├─────────────────────────────────────────┤
│ text-slate-800 → Dark text             │
│ text-slate-600 → Medium text           │
│ bg-slate-800   → Dark backgrounds      │
│ border-gray-200 → Light borders       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  STATUS COLORS                          │
├─────────────────────────────────────────┤
│ bg-green-500  / text-green-600         │
│   → Success states                      │
│ bg-red-500    / text-red-600           │
│   → Error/Delete states                 │
│ bg-yellow-500 / text-yellow-600        │
│   → Warning states                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  BACKGROUND GRADIENTS IN USE            │
├─────────────────────────────────────────┤
│ from-indigo-500 via-purple-500 to-pink-500
│   → Login/Register pages                │
│ from-gray-50 to-gray-100                │
│   → Page backgrounds                    │
│ from-blue gradients                     │
│   → Dashboard stat cards                │
└─────────────────────────────────────────┘
```

---

## Responsive Design Breakpoints

```
Mobile                Tablet              Desktop
┌─────────┐       ┌──────────────┐    ┌─────────────────┐
│         │       │              │    │                 │
│ 1 col   │ md:   │ 2-3 columns  │lg: │ 3-4 columns     │
│ layout  │ (768) │ layout       │(1024) + max-w     │
│         │       │              │    │                 │
└─────────┘       └──────────────┘    └─────────────────┘

Used in:
- Categories: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Dashboard: grid auto-fit minmax(250px, 1fr)
- Navbar: hidden md:flex (mobile menu hidden on mobile)
- Profile: grid-cols-1 lg:grid-cols-2
```

---

## UI Component Patterns

### 1️⃣ Button Patterns

```jsx
// Primary Action
<button className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg">
  Action
</button>

// Secondary/Outline
<button className="bg-gray-200 hover:bg-gray-300 text-slate-800 px-4 py-2 rounded">
  Action
</button>

// Danger
<button className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded">
  Delete
</button>
```

### 2️⃣ Card Patterns

```jsx
// Base Card
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
  {content}
</div>

// Gradient Card
<div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
  {content}
</div>
```

### 3️⃣ Input Patterns

```jsx
// Standard Input
<input
  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg
             focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100
             transition disabled:bg-gray-100 disabled:opacity-60"
/>

// Select Input
<select className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg
                   focus:outline-none focus:border-sky-500 transition">
  {options}
</select>
```

### 4️⃣ Error/Alert Patterns

```jsx
// Error Box
<div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
  {message}
</div>

// Info Box
<div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4">
  {message}
</div>
```

### 5️⃣ Section Patterns

```jsx
// Page Container
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
  {content}
</div>

// Content Wrapper
<div className="max-w-6xl w-full mx-auto">
  {content}
</div>
```

---

## Spacing System Used

```
Consistent spacing scale (in rem/px):

Gap between elements:   gap-6 (1.5rem)
Section padding:        p-8 (2rem)
Horizontal padding:     px-4 to px-8
Vertical padding:       py-2 to py-3 (forms), py-8 (sections)
Margin between titles:  mb-8, mb-6, mb-4
Card/box padding:       p-6 to p-8

Max widths:
- Containers: max-w-6xl (64rem)
- Forms: max-w-md (28rem)
- Full-width contained: w-full
```

---

## Animation Details

```
1. Gradient transitions: transition-colors
2. Hover transforms:
   - Button scale: hover:scale-95 (down)
   - Card elevation: hover:shadow-lg
3. Fade animat ions:
   - animate-fade-in (custom)
4. Timing:
   - duration-200 to duration-3000
5. Transform effects:
   - translateY, scale
```

---

## Pages Visual Comparison

### ✅ HIGH POLISH

```
Login/Register Pages
├── Beautiful gradient backgrounds
├── Animated form entry
├── Clear visual hierarchy
├── Good spacing & alignment
└── Proper feedback states
```

### 🟡 MODERATE

```
Profile, Dashboard
├── Functional layout
├── Good spacing
├── Could use more visual interest
└── Some responsive issues
```

### 🔴 NEEDS WORK

```
Expenses, Categories
├── Cluttered layouts
├── Inconsistent styling
├── Poor mobile experience
└── Missing interactive feedback
```

---

## CSS Files Dependency Map

```
globals.css
    ├── Base button styles (.btn, .btn-primary)
    ├── Form group styles
    └── Typography

Auth.css
    ├── .auth-container
    ├── .auth-form
    └── @keyframes slideIn

Navbar.css
    ├── .navbar (sticky)
    ├── .nav-menu (flex layout)
    └── Active link styles

Layout.css
    ├── .layout (flex column)
    ├── .main-content (max-w container)
    └── .footer

Dashboard.css
    ├── .dashboard-stats (grid)
    ├── .stat-card (gradient)
    └── Chart container styles

Expenses.css
    ├── .expenses-page
    ├── .page-header (flex justify-between)
    └── Error/loading states
```
