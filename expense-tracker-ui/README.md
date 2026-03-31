# Expense Tracker UI - React + Vite

A modern, responsive React application for tracking personal expenses using Vite as the build tool.

## Project Setup

### Requirements
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

---

## Folder Structure

```
expense-tracker-ui/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable React components
│   │   ├── Layout.jsx      # Main layout wrapper (navbar + footer)
│   │   └── Navbar.jsx      # Navigation bar component
│   │
│   ├── pages/              # Page components (one per route)
│   │   ├── Dashboard.jsx   # Home page with summary cards
│   │   ├── Expenses.jsx    # Expense listing and management
│   │   ├── Categories.jsx  # Category management
│   │   ├── Profile.jsx     # User profile and settings
│   │   └── NotFound.jsx    # 404 error page
│   │
│   ├── styles/             # CSS stylesheets
│   │   ├── globals.css     # Global styles (buttons, forms, cards)
│   │   ├── Navbar.css      # Navbar component styles
│   │   └── Layout.css      # Layout & page container styles
│   │
│   ├── App.jsx             # Main app component with routing
│   ├── main.jsx            # App entry point
│   └── index.css            # Base index styles
│
├── package.json            # Project dependencies and scripts
├── vite.config.js          # Vite configuration
├── index.html              # HTML template
└── README.md               # This file
```

---

## Component Architecture

### **Components vs Pages**

**Components** (`src/components/`)
- Reusable, self-contained UI elements
- Include styling (CSS files matching component names)
- Examples: Navbar, Layout, Forms, Cards
- Used across multiple pages

**Pages** (`src/pages/`)
- Full-page components (one per route)
- Compose smaller components
- Handle page-specific logic
- Examples: Dashboard, Expenses, Categories

### **Component Tree**

```
App (Router + Routes)
└── Layout (wrapper with Navbar + Footer)
    ├── Navbar (navigation links)
    └── Current Page (based on route)
        ├── Dashboard
        ├── Expenses
        ├── Categories
        ├── Profile
        └── NotFound (404)
```

---

## Routing Structure

Uses **React Router v7** for client-side routing:

```
GET / → Dashboard page
GET /expenses → Expenses page
GET /categories → Categories page
GET /profile → Profile page
GET /* → 404 Not Found page
```

**Router Setup** (in App.jsx):
```jsx
<Router>
  <Layout>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/expenses" element={<Expenses />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Layout>
</Router>
```

---

## Styling Approach

### **CSS Organization**

**Global Styles** (`src/styles/globals.css`)
- Reset and base styles
- Button system (.btn, .btn-primary, .btn-danger)
- Form styles (.form, .form-group)
- Card component styles (.card)
- Reusable utility classes

**Component Styles**
- One CSS file per component
- Imported in component file
- Scoped to component classNames
- Examples: Navbar.css, Layout.css

### **Design System**

**Color Palette:**
- Primary: #3498db (blue)
- Success: #27ae60 (green)
- Danger: #e74c3c (red)
- Dark: #2c3e50 (dark blue-gray)
- Light: #f5f5f5 (light gray)

**Responsive Breakpoint:**
- Mobile: < 768px
- Desktop: ≥ 768px

---

## Functional Components

All components use **React Hooks** (functional components):

- `useState` - For local state (Expenses list, form inputs)
- `useLocation` - For active route detection in Navbar
- `useNavigate` - For programmatic navigation

Example:
```jsx
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  // ... component JSX
}
```

---

## File Naming Conventions

- **Components:** PascalCase (Dashboard.jsx, Navbar.jsx)
- **CSS files:** Match component name (Navbar.jsx → Navbar.css)
- **Functions:** camelCase within components
- **Folders:** lowercase (components/, pages/, styles/)

---

## Development Workflow

### Start Development Server
```bash
npm run dev
```
- Hot Module Replacement (HMR) enabled
- Changes reflect instantly in browser
- No page refresh needed

### Add a New Page
1. Create file: `src/pages/NewPage.jsx`
2. Add route in App.jsx:
   ```jsx
   <Route path="/newpage" element={<NewPage />} />
   ```
3. Add link in Navbar.jsx:
   ```jsx
   <Link to="/newpage">New Page</Link>
   ```

### Add Component to Multiple Pages
1. Create component file: `src/components/MyComponent.jsx`
2. Create CSS file: `src/styles/MyComponent.css`
3. Import in pages: `import MyComponent from '../components/MyComponent'`

## Dependencies

**Core:**
- `react@19.2.4` - UI library
- `react-dom@19.2.4` - DOM rendering
- `react-router-dom@7.13.2` - Client-side routing

**Build Tools:**
- `vite@8.0.1` - Build tool
- `@vitejs/plugin-react` - React plugin for Vite

---

## Next Steps

### Features to Implement
- [ ] Connect to backend API (http://localhost:5297)
- [ ] User authentication (login/register)
- [ ] Add expense form modal
- [ ] Edit expense functionality
- [ ] Monthly spending chart (Chart.js)
- [ ] CSV export integration
- [ ] Loading states and error handling
- [ ] User session management

### Styling Enhancements
- [ ] Dark mode toggle
- [ ] Mobile navbar (hamburger menu)
- [ ] Loading spinners
- [ ] Error notifications

---

## License

MIT
