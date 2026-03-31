# Expense Tracker UI - Project Structure & Architecture

## 📁 Complete Folder Structure

```
expense-tracker-ui/
│
├── public/                          # Static files (copied as-is)
│   └── vite.svg
│
├── src/
│   ├── components/                  # Reusable UI Components
│   │   ├── Layout.jsx              # Main layout wrapper (navbar + footer)
│   │   └── Navbar.jsx              # Navigation bar with active link detection
│   │
│   ├── pages/                       # Page Components (one per route)
│   │   ├── Dashboard.jsx           # Home page (summary cards + chart)
│   │   ├── Expenses.jsx            # Expense management (table + actions)
│   │   ├── Categories.jsx          # Category management (grid view)
│   │   ├── Profile.jsx             # User profile & settings
│   │   └── NotFound.jsx            # 404 error page
│   │
│   ├── styles/                      # CSS Stylesheets
│   │   ├── globals.css             # Global styles, utilities, design system
│   │   ├── Navbar.css              # Navbar-specific styles
│   │   └── Layout.css              # Layout container styles
│   │
│   ├── assets/                      # Images and static assets
│   │   ├── react.svg
│   │   └── vite.svg
│   │
│   ├── App.jsx                      # Main app component (Router setup)
│   ├── App.css                      # App component styles (can remove)
│   ├── main.jsx                     # Application entry point
│   └── index.css                    # Base index styles
│
├── .gitignore                       # Git ignore rules
├── index.html                       # HTML template
├── package.json                     # Project metdata & dependencies
├── package-lock.json                # Dependency lock file
├── vite.config.js                   # Vite build configuration
└── README.md                        # Project documentation
```

---

## 📊 File-by-File Breakdown

### **Core Files**

#### `src/main.jsx` (Entry Point)
- Imports React and React DOM
- Mounts App component to #root element
- This runs first when app loads

#### `src/App.jsx` (Router Setup)
```jsx
- Sets up BrowserRouter
- Defines all routes
- Wraps routes with Layout
- Imports all page components
- Size: ~20 lines (very clean)
```

**Routes:**
```
/ → Dashboard
/expenses → Expenses
/categories → Categories
/profile → Profile
* → NotFound (404)
```

#### `index.html` (HTML Template)
- Single page with `<div id="root">`
- Imports main.jsx as module
- All React rendering happens in JavaScript

---

### **Components** (`src/components/`)

#### `Layout.jsx`
- **Purpose:** Wrapper component providing page structure
- **Contains:** Navbar + main content area + footer
- **Used in:** App.jsx (wraps all routes)
- **Props:** `children` (page content)
- **Key CSS:** .layout, .main-content, .footer

**Structure:**
```
<div class="layout">
  <nav> (Navbar component)
  <main class="main-content"> (children pages)
  <footer>
</div>
```

#### `Navbar.jsx`
- **Purpose:** Navigation bar with active link highlighting
- **Uses:** React Router's `useLocation()` hook
- **Links:** Dashboard, Expenses, Categories, Profile
- **Features:** Active link detection, logout button
- **Key CSS:** .navbar, .nav-menu, .nav-link (highlighted on active)

---

### **Pages** (`src/pages/`)

#### `Dashboard.jsx`
- **Route:** `/`
- **Purpose:** Home page with expense overview
- **Contains:**
  - 4 summary cards (Total, Average, Count, Recent)
  - Placeholder for monthly chart
  - Grid layout (responsive: 1-4 columns)
- **Sample Data:** Hardcoded stats

#### `Expenses.jsx`
- **Route:** `/expenses`
- **Purpose:** Manage and view expenses
- **Contains:**
  - Add Expense button
  - Table of expenses (Date, Category, Amount, Description)
  - Edit/Delete buttons
  - Export CSV button
- **Sample Data:** 3 sample expenses (hardcoded)

#### `Categories.jsx`
- **Route:** `/categories`
- **Purpose:** Manage spending categories
- **Contains:**
  - Add Category button
  - Grid of category cards
  - Shows expense count & total per category
  - Edit/Delete buttons per category
- **Sample Data:** 5 pre-seeded categories

#### `Profile.jsx`
- **Route:** `/profile`
- **Purpose:** User profile & settings
- **Contains:**
  - User info section
  - Settings (currency, theme dropdowns)
  - Save Settings & Change Password buttons
- **Forms:** Read-only email + settings dropdowns

#### `NotFound.jsx`
- **Route:** `*` (catch-all)
- **Purpose:** 404 error page
- **Contains:**
  - Large "404" heading
  - Error message
  - Link back to Dashboard
- **Styling:** Centered, large text

---

### **Styles** (`src/styles/`)

#### `globals.css` (1200+ lines)
**Contains all global styles for:**

1. **Button System**
   - `.btn` - base button
   - `.btn-primary` - blue button
   - `.btn-secondary` - gray button
   - `.btn-danger` - red button
   - `.btn-small` - smaller variant

2. **Forms**
   - `.form` - flex container
   - `.form-group` - label + input wrapper
   - `.form-actions` - button container

3. **Tables**
   - `.table-container` - responsive wrapper
   - `.expenses-table` - styled table
   - Row hover effects

4. **Cards**
   - `.card` - box shadow + padding
   - `.amount` - large, bold, colored text

5. **Layouts**
   - `.dashboard-grid` - responsive grid
   - `.categories-grid` - auto-fill columns
   - `.profile-container` - 2-column responsive

6. **Utilities**
   - Color scheme: Blue/Red/Green/Gray palette
   - Responsive breakpoint: 768px

#### `Navbar.css` (50 lines)
- Sticky navbar styling
- Navigation menu layout
- Active link indicators (blue underline)
- Responsive menu on mobile

#### `Layout.css` (40 lines)
- Overall page layout (flexbox)
- main-content padding & width limits
- Footer styling (sticks to bottom)
- Responsive padding adjustments

---

### **Configuration Files**

#### `package.json`
```json
{
  "name": "expense-tracker-ui",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-router-dom": "^7.13.2"
  },
  "devDependencies": { ... }
}
```

#### `vite.config.js`
- React plugin configured
- HMR enabled for dev server
- Minification for production

#### `index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Expense Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## 🎯 Architecture Diagram

```
   index.html
       ↓
   main.jsx (entry)
       ↓
   App.jsx (Router)
       │
       ├── BrowserRouter
       │   └── Routes
       │       ├── / → Dashboard.jsx
       │       ├── /expenses → Expenses.jsx
       │       ├── /categories → Categories.jsx
       │       ├── /profile → Profile.jsx
       │       └── * → NotFound.jsx
       │           (wrapped in Layout.jsx)
       │
       └── Layout.jsx (wrapper)
           ├── Navbar.jsx (nav bar)
           ├── {page content}
           └── Footer
```

---

## 📈 Component Hierarchy

```
App
└── Router
    └── Layout
        ├── Navbar
        │   └── Links (active detection)
        ├── Routes
        │   ├── Dashboard
        │   ├── Expenses
        │   │   └── useState (expenses list)
        │   ├── Categories
        │   │   └── useState (categories list)
        │   ├── Profile
        │   └── NotFound
        └── Footer
```

---

## 🎨 Styling Strategy

### **CSS Organization Model**

```
globals.css (Design System)
│
├── Color Palette
│   ├── Primary: #3498db
│   ├── Danger: #e74c3c
│   ├── Success: #27ae60
│   └── Dark: #2c3e50
│
├── Components
│   ├── Buttons (.btn-*)
│   ├── Forms (.form-group)
│   ├── Cards (.card)
│   └── Tables (.expenses-table)
│
├── Layouts
│   ├── Dashboard Grid
│   ├── Categories Grid
│   └── Profile 2-col
│
└── Utilities
    ├── Responsive breakpoint: 768px
    ├── Box shadows
    ├── Transitions
    └── Hover states

Component-Specific CSS (Navbar.css, Layout.css)
│
└── Component-scoped styles imported in JSX
```

### **Responsive Design**

**Desktop (≥ 768px):**
- Full navigation visible
- Multi-column grids
- Side-by-side layouts

**Mobile (< 768px):**
- Compact navigation
- Single-column stacks
- Reduced padding
- Smaller buttons

---

## 🔄 Data Flow

### **State Management (Current)**
- Local component state using `useState`
- Props passed down to children
- No global state yet

Example (Expenses.jsx):
```jsx
const [expenses, setExpenses] = useState([
  { id: 1, date: '2025-03-24', category: 'Food', amount: 45.50 }
])
```

### **Future: API Integration**
```
Component → setState → Fetch API → Update state → Re-render
```

---

## 📦 Build Output

After `npm run build`:

```
dist/
├── index.html                 (0.46 kB)
├── assets/
│   ├── index-BaxK2oyV.css     (7.64 kB, gzip: 2.22 kB)
│   └── index-DdVZPC3V.js      (238 kB, gzip: 75.53 kB)
```

**Total Size:** ~246 kB (uncompressed) / 78 kB (gzipped)

---

## ✅ Implementation Checklist

### **✅ Already Done**
- [x] Vite + React project setup
- [x] React Router configured (5 routes)
- [x] Layout wrapper with navbar
- [x] 5 page components created
- [x] Global CSS styling system
- [x] Responsive design
- [x] Functional components (hooks-based)
- [x] Component-based architecture

### **⏳ TODO: Backend Integration**
- [ ] Connect to Express API (localhost:5297)
- [ ] Fetch expenses from GET /api/expenses
- [ ] Fetch categories from GET /api/categories
- [ ] Create expense POST endpoint
- [ ] Update expense PUT endpoint
- [ ] Delete expense DELETE endpoint

### **⏳ TODO: Authentication**
- [ ] Create login page
- [ ] Create register page
- [ ] Store JWT token in localStorage
- [ ] Protected routes (redirect if not logged in)
- [ ] Add token to API requests

### **⏳ TODO: Features**
- [ ] Add expense form (modal or dedicated page)
- [ ] Edit expense functionality
- [ ] Delete expense with confirmation
- [ ] Add category form
- [ ] Monthly spending chart
- [ ] CSV export button integration
- [ ] Date range filtering

---

## 🚀 Quick Start Commands

```bash
# Start dev server (hot reload enabled)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Add new dependencies
npm install package-name

# Update npm packages
npm update
```

---

## 💡 Extending the Project

### **Add a New Page**

1. **Create page component:**
   ```jsx
   // src/pages/Reports.jsx
   export default function Reports() {
     return <div className="page"><h1>Reports</h1></div>;
   }
   ```

2. **Add route in App.jsx:**
   ```jsx
   <Route path="/reports" element={<Reports />} />
   ```

3. **Add navbar link in Navbar.jsx:**
   ```jsx
   <Link to="/reports">Reports</Link>
   ```

### **Add a New Component**

1. **Create component:**
   ```jsx
   // src/components/ExpenseForm.jsx
   export default function ExpenseForm() {
     return <form className="form">...</form>;
   }
   ```

2. **Create stylesheet:**
   ```css
   /* src/styles/ExpenseForm.css */
   .form { /* styles */ }
   ```

3. **Import in page:**
   ```jsx
   import ExpenseForm from '../components/ExpenseForm';
   import '../styles/ExpenseForm.css';
   ```

---

## 📝 File Statistics

| Category | Count | LOC* |
|----------|-------|------|
| React Components | 7 | ~400 |
| CSS Files | 3 | ~1300 |
| Config Files | 3 | ~50 |
| Documentation | 2 | ~500 |
| **Total** | **15** | **~2200** |

*Approximate Lines of Code

---

## 🔗 Folder Relationships

```
pages/              → Uses components from components/
  ├─ Dashboard      → Uses Layout, Navbar
  ├─ Expenses       → Uses Layout, Navbar (+ table component later)
  ├─ Categories     → Uses Layout, Navbar (+ card component later)
  └─ Profile        → Uses Layout, Navbar (+ form component later)

components/         → Reusable across pages
  ├─ Layout         → Imports Navbar + global styles
  └─ Navbar         → Uses react-router-dom

styles/             → Imported by components & pages
  ├─ globals.css    → Imported in App.jsx
  ├─ Navbar.css     → Imported in Navbar.jsx
  └─ Layout.css     → Imported in Layout.jsx
```

---

## 🎓 Learning Path

**Understanding this project requires:**

1. **React Basics**
   - Functional components
   - JSX syntax
   - Props & Children
   - React Hooks (useState, useLocation)

2. **React Router**
   - Route definitions
   - Navigation with Link
   - Route matching & wildcards

3. **CSS**
   - Selectors & specificity
   - Grid & Flexbox layouts
   - Media queries for responsive design

4. **JavaScript ES6+**
   - Import/export modules
   - Arrow functions
   - Array methods (map, filter)

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5173 in use | `npm run dev -- --port 3000` |
| Styles not loading | Check CSS file is imported in component |
| Route not working | Verify path case-sensitive, check import |
| "Cannot find module" | Check relative import path |
| Build fails | Run `npm install` again |

---

## 📚 Resources

- [React Docs](https://react.dev)
- [React Router Docs](https://reactrouter.com)
- [Vite Docs](https://vite.dev)
- [MDN CSS Guide](https://developer.mozilla.org/en-US/docs/Web/CSS)

---

**Project Created:** March 2025  
**React Version:** 19.2.4  
**Vite Version:** 8.0.1  
**React Router Version:** 7.13.2
