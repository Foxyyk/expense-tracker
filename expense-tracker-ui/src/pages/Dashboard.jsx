/**
 * Dashboard Page - Modern, Responsive Design
 * Shows expense trends, summaries, and analytics with improved UI/UX
 */

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getMonthlySummary,
  getCategorySummary,
} from "../services/summaryService";
import { getExpenses } from "../services/expenseService";
import { getCategories } from "../services/categoryService";
import { useDarkMode } from "../context/DarkModeContext";
import { usePreferences } from "../hooks/usePreferences";
import { formatCurrency, getCurrencySymbol } from "../utils/currencyUtils";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [categorySummary, setCategorySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [monthlyCategoryBreakdown, setMonthlyCategoryBreakdown] = useState({});
  const [categories, setCategories] = useState([]);
  const { isDarkMode } = useDarkMode();
  const { currency } = usePreferences();

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMonthlySummary();
        setSummary(data);
        const categoryData = await getCategorySummary();
        setCategorySummary(categoryData);

        // Load expenses and categories for monthly breakdown
        const expensesData = await getExpenses();
        const categoriesData = await getCategories();
        setCategories(categoriesData);

        // Calculate category breakdown by month
        const breakdown = {};
        expensesData.forEach((expense) => {
          const date = new Date(expense.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

          if (!breakdown[monthKey]) {
            breakdown[monthKey] = {};
          }

          const categoryId = expense.categoryId;
          if (!breakdown[monthKey][categoryId]) {
            breakdown[monthKey][categoryId] = {
              total: 0,
              count: 0,
              categoryName: "",
            };
          }

          breakdown[monthKey][categoryId].total += expense.amount;
          breakdown[monthKey][categoryId].count += 1;

          // Set category name
          const category = categoriesData.find((c) => c.id === categoryId);
          if (category) {
            breakdown[monthKey][categoryId].categoryName = category.name;
          }
        });

        setMonthlyCategoryBreakdown(breakdown);
      } catch (err) {
        setError("Failed to load dashboard data: " + err.message);
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  const toggleExpandedRow = (index) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  // Loading State
  if (loading) {
    return (
      <div
        className={`min-h-screen w-full transition-colors ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"
            : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="mb-10 lg:mb-12">
            <h1
              className={`text-4xl lg:text-5xl font-bold mb-3 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Dashboard
            </h1>
            <p
              className={`text-lg ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Loading your expense overview...
            </p>
          </div>

          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div
                className={`w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4 ${
                  isDarkMode
                    ? "border-gray-700 border-t-blue-400"
                    : "border-blue-200 border-t-blue-600"
                }`}
              ></div>
              <p
                className={`text-lg font-medium ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Loading your expense data...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen w-full transition-colors ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"
            : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="mb-10 lg:mb-12">
            <h1
              className={`text-4xl lg:text-5xl font-bold mb-3 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Dashboard
            </h1>
            <p
              className={`text-lg ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Error loading dashboard
            </p>
          </div>

          <div
            className={`border-l-4 p-6 rounded-lg flex items-start gap-4 ${
              isDarkMode
                ? "bg-red-900/30 border-red-500 text-red-300"
                : "bg-red-50 border-red-500 text-red-700"
            }`}
          >
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="font-semibold text-base">Error Loading Dashboard</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const monthlyData = summary?.months || [];
  const colors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#6366f1",
    "#ec4899",
  ];

  // Pie chart data for all months
  const pieData = monthlyData.map((month, idx) => ({
    name: month.monthName,
    value: Math.round(month.total * 100) / 100,
    month: `${month.year}-${month.month.toString().padStart(2, "0")}`,
  }));

  return (
    <div
      className={`min-h-screen w-full transition-colors ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-10 lg:mb-12">
          <h1
            className={`text-4xl lg:text-5xl font-bold mb-3 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Dashboard
          </h1>
          <p
            className={`text-lg ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Welcome back! Here's your expense overview for the period you're
            tracking.
          </p>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 lg:mb-14">
          {/* Total Expenses Card */}
          <div
            className={`rounded-2xl p-6 lg:p-8 transition-all duration-300 border-t-4 shadow-xl hover:shadow-2xl ${
              isDarkMode
                ? "bg-gray-800/80 border-blue-500"
                : "bg-white/95 border-blue-600"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-semibold uppercase tracking-wide mb-3 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Total Expenses
                </p>
                <p
                  className={`text-3xl lg:text-4xl font-bold truncate ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {formatCurrency(summary?.grandTotal || 0, currency)}
                </p>
                <p
                  className={`text-xs mt-3 ${
                    isDarkMode ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  All time expenses
                </p>
              </div>
              <span className="text-4xl flex-shrink-0">💰</span>
            </div>
          </div>

          {/* Average Monthly Card */}
          <div
            className={`rounded-2xl p-6 lg:p-8 transition-all duration-300 border-t-4 shadow-xl hover:shadow-2xl ${
              isDarkMode
                ? "bg-gray-800/80 border-emerald-500"
                : "bg-white/95 border-emerald-600"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-semibold uppercase tracking-wide mb-3 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Monthly Average
                </p>
                <p
                  className={`text-3xl lg:text-4xl font-bold truncate ${
                    isDarkMode ? "text-emerald-400" : "text-emerald-600"
                  }`}
                >
                  {formatCurrency(summary?.averageMonthly || 0, currency)}
                </p>
                <p
                  className={`text-xs mt-3 ${
                    isDarkMode ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  Per month spending
                </p>
              </div>
              <span className="text-4xl flex-shrink-0">📊</span>
            </div>
          </div>

          {/* Months Tracked Card */}
          <div
            className={`rounded-2xl p-6 lg:p-8 transition-all duration-300 border-t-4 shadow-xl hover:shadow-2xl ${
              isDarkMode
                ? "bg-gray-800/80 border-amber-500"
                : "bg-white/95 border-amber-600"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-semibold uppercase tracking-wide mb-3 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Tracked Months
                </p>
                <p
                  className={`text-3xl lg:text-4xl font-bold ${
                    isDarkMode ? "text-amber-400" : "text-amber-600"
                  }`}
                >
                  {monthlyData.length}
                </p>
                <p
                  className={`text-xs mt-3 ${
                    isDarkMode ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  Expense months
                </p>
              </div>
              <span className="text-4xl flex-shrink-0">📅</span>
            </div>
          </div>

          {/* Recent Month Card */}
          <div
            className={`rounded-2xl p-6 lg:p-8 transition-all duration-300 border-t-4 shadow-xl hover:shadow-2xl ${
              isDarkMode
                ? "bg-gray-800/80 border-violet-500"
                : "bg-white/95 border-violet-600"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-semibold uppercase tracking-wide mb-3 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Latest Month
                </p>
                <p
                  className={`text-3xl lg:text-4xl font-bold truncate ${
                    isDarkMode ? "text-violet-400" : "text-violet-600"
                  }`}
                >
                  {formatCurrency(monthlyData?.[0]?.total || 0, currency)}
                </p>
                <p
                  className={`text-xs mt-3 ${
                    isDarkMode ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  {monthlyData?.[0]?.monthName}
                </p>
              </div>
              <span className="text-4xl flex-shrink-0">📈</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {monthlyData.length === 0 ? (
          <div
            className={`rounded-2xl p-12 text-center shadow-xl ${
              isDarkMode ? "bg-gray-800/80" : "bg-white/95"
            }`}
          >
            <p
              className={`text-2xl font-bold mb-3 ${
                isDarkMode ? "text-gray-300" : "text-gray-800"
              }`}
            >
              📊 No expense data yet
            </p>
            <p
              className={`text-lg ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}
            >
              Start adding expenses to see your expense trends and analytics in
              action.
            </p>
          </div>
        ) : (
          <>
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* Line Chart - Monthly Trend */}
              <div
                className={`rounded-2xl p-8 shadow-xl ${
                  isDarkMode ? "bg-gray-800/80" : "bg-white/95"
                }`}
              >
                <div className="mb-6">
                  <h2
                    className={`text-2xl font-bold mb-2 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    📈 Monthly Trend
                  </h2>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Your expense pattern over time
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                    />
                    <XAxis
                      dataKey="monthName"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{
                        fill: isDarkMode ? "#9ca3af" : "#666",
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      tick={{
                        fill: isDarkMode ? "#9ca3af" : "#666",
                        fontSize: 12,
                      }}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value, currency)}
                      contentStyle={{
                        backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
                        border: `1px solid ${
                          isDarkMode ? "#374151" : "#e5e7eb"
                        }`,
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#3b82f6"
                      dot={{ fill: "#3b82f6", r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Expenses"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart - Category Breakdown */}
              <div
                className={`rounded-2xl p-8 shadow-xl ${
                  isDarkMode ? "bg-gray-800/80" : "bg-white/95"
                }`}
              >
                <div className="mb-6">
                  <h2
                    className={`text-2xl font-bold mb-2 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    📊 Category Breakdown
                  </h2>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    How much money was spent in each category
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categorySummary?.categories || []}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                    />
                    <XAxis
                      dataKey="categoryName"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{
                        fill: isDarkMode ? "#9ca3af" : "#666",
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      tick={{
                        fill: isDarkMode ? "#9ca3af" : "#666",
                        fontSize: 12,
                      }}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value, currency)}
                      contentStyle={{
                        backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
                        border: `1px solid ${
                          isDarkMode ? "#374151" : "#e5e7eb"
                        }`,
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="total"
                      fill="#10b981"
                      name="Total Amount"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart - Full Width */}
            <div
              className={`rounded-2xl p-8 shadow-xl mb-10 ${
                isDarkMode ? "bg-gray-800/80" : "bg-white/95"
              }`}
            >
              <div className="mb-6">
                <h2
                  className={`text-2xl font-bold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  🥧 Expense Distribution
                </h2>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  How your expenses are spread across months
                </p>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value, currency)}
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
                      border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Details Table */}
            <div
              className={`rounded-2xl p-8 shadow-xl ${
                isDarkMode ? "bg-gray-800/80" : "bg-white/95"
              }`}
            >
              <div className="mb-6">
                <h2
                  className={`text-2xl font-bold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  📋 Monthly Details
                </h2>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Detailed breakdown of your monthly expenses
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      className={`border-b-2 ${
                        isDarkMode
                          ? "border-gray-700 bg-gray-900/50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <th
                        className={`px-6 py-4 text-left font-semibold text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Month
                      </th>
                      <th
                        className={`px-6 py-4 text-left font-semibold text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Total Amount
                      </th>
                      <th
                        className={`px-6 py-4 text-left font-semibold text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Expense Count
                      </th>
                      <th
                        className={`px-6 py-4 text-left font-semibold text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Daily Average
                      </th>
                      <th
                        className={`px-6 py-4 text-center font-semibold text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((month, index) => {
                      const monthKey = `${month.year}-${String(month.month).padStart(2, "0")}`;
                      const isExpanded = expandedRows.has(index);
                      const categoryBreakdown =
                        monthlyCategoryBreakdown[monthKey] || {};
                      const categories_in_month =
                        Object.entries(categoryBreakdown);

                      return (
                        <React.Fragment key={`${month.year}-${month.month}`}>
                          <tr
                            className={`border-b transition-all ${
                              isDarkMode
                                ? "border-gray-700 hover:bg-gray-700/50"
                                : "border-gray-100 hover:bg-blue-50"
                            }`}
                          >
                            <td
                              className={`px-6 py-4 font-medium text-sm ${
                                isDarkMode ? "text-gray-300" : "text-gray-900"
                              }`}
                            >
                              {month.monthName} {month.year}
                            </td>
                            <td
                              className={`px-6 py-4 font-semibold text-sm ${
                                isDarkMode ? "text-blue-400" : "text-blue-600"
                              }`}
                            >
                              {formatCurrency(month.total, currency)}
                            </td>
                            <td className={`px-6 py-4 text-sm`}>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  isDarkMode
                                    ? "bg-gray-700 text-gray-300"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {month.expenseCount}
                              </span>
                            </td>
                            <td
                              className={`px-6 py-4 text-sm ${
                                isDarkMode ? "text-gray-400" : "text-gray-700"
                              }`}
                            >
                              {formatCurrency(month.total / 30, currency)}
                            </td>
                            <td className={`px-6 py-4 text-center`}>
                              <button
                                onClick={() => toggleExpandedRow(index)}
                                className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${
                                  isDarkMode
                                    ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                                    : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                                }`}
                              >
                                <span
                                  className={`text-lg transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                >
                                  ▼
                                </span>
                              </button>
                            </td>
                          </tr>
                          {isExpanded && categories_in_month.length > 0 && (
                            <tr
                              className={`${
                                isDarkMode
                                  ? "bg-gray-900/30 border-b border-gray-700"
                                  : "bg-blue-50/30 border-b border-gray-100"
                              }`}
                            >
                              <td colSpan="5" className="px-6 py-6">
                                <div>
                                  <h4
                                    className={`font-semibold text-sm mb-4 ${
                                      isDarkMode
                                        ? "text-gray-300"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    Category Breakdown
                                  </h4>
                                  <div className="space-y-2">
                                    {categories_in_month.map(
                                      ([categoryId, data]) => (
                                        <div
                                          key={categoryId}
                                          className={`flex justify-between items-center p-3 rounded-lg ${
                                            isDarkMode
                                              ? "bg-gray-800/50"
                                              : "bg-white/50"
                                          }`}
                                        >
                                          <div className="flex-1">
                                            <p
                                              className={`font-medium text-sm ${
                                                isDarkMode
                                                  ? "text-gray-300"
                                                  : "text-gray-700"
                                              }`}
                                            >
                                              {data.categoryName}
                                            </p>
                                            <p
                                              className={`text-xs ${
                                                isDarkMode
                                                  ? "text-gray-500"
                                                  : "text-gray-500"
                                              }`}
                                            >
                                              {data.count} expense
                                              {data.count !== 1 ? "s" : ""}
                                            </p>
                                          </div>
                                          <div
                                            className={`font-semibold text-sm ${
                                              isDarkMode
                                                ? "text-green-400"
                                                : "text-green-600"
                                            }`}
                                          >
                                            {formatCurrency(
                                              data.total,
                                              currency,
                                            )}
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
