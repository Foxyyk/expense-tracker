# Dashboard Charts - How They Work

## Overview

The dashboard now displays interactive charts showing your monthly expense trends using **Recharts**, a powerful React charting library.

---

## Architecture

### 1. **Data Flow**

```
Backend (/api/expenses/summary/monthly)
    ↓
summaryService.js (Fetch data)
    ↓
Dashboard.jsx (Process & Display)
    ↓
Recharts Components (Render charts)
```

### 2. **Data Structure from Backend**

The backend returns:

```json
{
  "months": [
    {
      "year": 2026,
      "month": 1,
      "monthName": "January",
      "total": 1250.5,
      "expenseCount": 15,
      "average": 83.37
    }
    // ... more months
  ],
  "grandTotal": 5000.0,
  "averageMonthly": 1250.0
}
```

---

## Components

### **1. Summary Statistics Cards** (Top 4 Cards)

- **Total Expenses**: Sum of all expenses across all time
- **Average Monthly**: Total ÷ Number of months tracked
- **Months Tracked**: Count of months with expense data
- **Recent Month**: Latest month's expense total

**Color Scheme**:

- Blue: Total Expenses
- Green: Average Monthly
- Red: Months Tracked
- Orange: Recent Month

---

### **2. Line Chart - Monthly Trend**

Shows how your expenses change month-to-month.

**Features**:

- X-Axis: Month names (January, February, etc.)
- Y-Axis: Dollar amount
- Interactive dots on each data point
- Hover tooltip shows exact amount
- Smooth line animation

**What it shows**: Is your spending going up or down over time?

---

### **3. Bar Chart - Monthly Comparison**

Makes it easy to see which months had the highest expenses.

**Features**:

- Bars for each month
- Green color for visual clarity
- Rounded corners on bars for modern look
- Hover tooltip with exact amount
- Easy to spot peak spending months

**What it shows**: Which months cost the most?

---

### **4. Pie Chart - Expense Distribution**

Shows how your total spending is divided across months.

**Features**:

- Each month is a colored slice
- Labels show month name and percentage
- Different colors for each slice (8-color rotation)
- Hover tooltip shows dollar amount
- Visual representation of spending breakdown

**What it shows**: What proportion of total spending happened in each month?

---

### **5. Details Table**

Below the charts is a detailed table with:

- **Month**: Full month and year
- **Total Amount**: Total expenses for that month
- **Expense Count**: Number of transactions
- **Daily Average**: Total ÷ 30 days

---

## Key Features

### **Responsive Design**

- Desktop: All cards side-by-side, large charts
- Tablet: 2-column grid for stats
- Mobile: Single column, charts resize automatically

### **Error Handling**

- Loading state while fetching data
- Error message if data fails to load
- "No data yet" message if no expenses exist

### **Interactive Elements**

- Hover over data points to see exact values
- Tooltips format amounts as currency ($ format)
- Charts are fully responsive SVG-based (scales with window)

### **Data Formatting**

- All amounts show with 2 decimal places
- Currency symbol ($) on all monetary values
- Month names auto-generated from date objects
- Percentages calculated dynamically

---

## Technology Stack

### **Recharts Components Used**

1. **LineChart** - Trend visualization
2. **BarChart** - Comparison visualization
3. **PieChart** - Distribution visualization
4. **XAxis, YAxis** - Chart axes
5. **Tooltip** - Hover information
6. **Legend** - Chart labels
7. **ResponsiveContainer** - Mobile-responsive wrapper
8. **Cell** - Individual pie slice colors

### **React Patterns**

- **useState**: Manage summary data, loading, error states
- **useEffect**: Fetch data on component mount
- **Error Boundaries**: Graceful error handling
- **Conditional Rendering**: Show loading/error/chart states

---

## API Integration

### **Endpoint**

```
GET /api/expenses/summary/monthly
Authorization: Bearer {JWT_TOKEN}
```

### **Response Format**

```json
{
  "months": [...],      // Array of monthly summaries
  "grandTotal": 5000,   // Sum of all expenses
  "averageMonthly": 1250    // Average per month
}
```

### **Error Handling**

- **401 Unauthorized**: User not logged in
- **Network errors**: Caught and displayed to user
- **Empty data**: Shows "No expense data yet" message

---

## Styling

### **Color Palette**

- **Primary Blue**: #3498db (Line chart, stat card 1)
- **Success Green**: #2ecc71 (Bar chart, stat card 2)
- **Danger Red**: #e74c3c (Stat card 3)
- **Warning Orange**: #f39c12 (Stat card 4)
- **Multi-color**: 8 colors for pie chart slices

### **Layout**

- Statistics: 4-column grid (responsive)
- Charts: Full-width responsive containers
- Typography: Hierarchical heading sizes
- Spacing: Consistent 20-30px gaps
- Shadows: Subtle depth with box-shadow

---

## How to Use

### **Setup**

1. ✅ Recharts installed via npm
2. ✅ Dashboard component created
3. ✅ summaryService created
4. ✅ Backend endpoint active

### **Testing**

1. Log in to the app
2. Navigate to Dashboard
3. Add some expenses (required for data)
4. Refresh dashboard (F5)
5. Charts should populate with data

### **Troubleshooting**

| Issue                | Solution                             |
| -------------------- | ------------------------------------ |
| Charts not showing   | Add expenses to the app first        |
| Data not loading     | Check browser console for errors     |
| 401 Unauthorized     | Log out and log back in              |
| Charts look squashed | Ensure browser window is wide enough |

---

## Performance Notes

- **Data Fetching**: Only runs once on component mount
- **Chart Rendering**: Recharts optimizes for performance
- **Memory**: Charts are unmounted when leaving dashboard
- **Bandwidth**: Minimal data transfer (monthly aggregates only)

---

## Future Enhancements

Possible improvements:

1. **Category breakdown pie chart** - Spending by category
2. **Date range selector** - Choose custom date ranges
3. **Export chart as image** - Download chart PNG
4. **Forecast chart** - Project future spending
5. **Year-over-year comparison** - Compare trends across years
6. **Budget overlay** - Show budget lines on charts

---

## Summary

The dashboard charts provide:

- 📊 Visual trend analysis
- 💰 Quick financial overview
- 📈 Performance metrics
- 📱 Mobile-friendly experience
- ⚡ Real-time data updates

Enjoy visualizing your expenses! 🎉
