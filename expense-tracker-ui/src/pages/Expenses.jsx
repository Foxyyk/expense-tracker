import { useState, useEffect, useMemo } from "react";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  exportExpensesCsv,
} from "../services/expenseService";
import { getCategories } from "../services/categoryService";
import { useDarkMode } from "../context/DarkModeContext";
import { usePreferences } from "../hooks/usePreferences";
import { formatCurrency, getCurrencySymbol } from "../utils/currencyUtils";

/**
 * Expenses Page - Modern, Responsive Design
 * Manages expense tracking with filters, search, and CRUD operations
 */
export default function Expenses() {
  // State for expenses list
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [operationLoading, setOperationLoading] = useState(false);
  const { isDarkMode } = useDarkMode();
  const { currency } = usePreferences();

  // State for form
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Pagination state
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Form fields
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
    amount: "",
    description: "",
  });

  // Load expenses and categories on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError("");
      const [expensesData, categoriesData] = await Promise.all([
        getExpenses(),
        getCategories(),
      ]);
      setExpenses(expensesData);
      setCategories(categoriesData);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "Failed to load expenses");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Filter and search expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.amount.toString().includes(searchTerm);
      const matchesCategory =
        !selectedCategory || expense.categoryId.toString() === selectedCategory;
      const matchesDate = !selectedDate || expense.date === selectedDate;
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [expenses, searchTerm, selectedCategory, selectedDate]);

  // Paginate filtered expenses
  const paginatedExpenses = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredExpenses, currentPage]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || "" : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      if (!formData.date || !formData.categoryId || !formData.amount) {
        setFormError("Please fill in all required fields");
        setSubmitting(false);
        return;
      }

      if (formData.amount <= 0) {
        setFormError("Amount must be greater than 0");
        setSubmitting(false);
        return;
      }

      const expenseData = {
        date: formData.date,
        categoryId: parseInt(formData.categoryId),
        amount: parseFloat(formData.amount),
        description: formData.description,
      };

      if (editingId) {
        await updateExpense(editingId, expenseData);
      } else {
        await createExpense(expenseData);
      }

      await loadData(false);

      // Emit event to notify Categories page that expenses have changed
      window.dispatchEvent(
        new CustomEvent("expenseUpdated", {
          detail: { action: editingId ? "update" : "add" },
        }),
      );

      setShowForm(false);
      setEditingId(null);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        categoryId: "",
        amount: "",
        description: "",
      });
    } catch (err) {
      setFormError(err.message || "Failed to save expense");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit button
  const handleEdit = (expense) => {
    setEditingId(expense.id);
    // Convert date to YYYY-MM-DD format for date input
    const dateForInput = expense.date.split("T")[0] || expense.date;
    setFormData({
      date: dateForInput,
      categoryId: expense.categoryId,
      amount: expense.amount,
      description: expense.description,
    });
    setShowForm(true);
    // Scroll form into view after a small delay to ensure it renders
    setTimeout(() => {
      document
        .querySelector("form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      document.querySelector('input[type="date"]')?.focus();
    }, 100);
  };

  // Handle delete button
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        setOperationLoading(true);
        await deleteExpense(id);
        await loadData(false);

        // Emit event to notify Categories page that expenses have changed
        window.dispatchEvent(
          new CustomEvent("expenseUpdated", {
            detail: { action: "delete" },
          }),
        );
      } catch (err) {
        setError(err.message || "Failed to delete expense");
      } finally {
        setOperationLoading(false);
      }
    }
  };

  // Handle export CSV
  const handleExportCsv = async () => {
    try {
      setOperationLoading(true);
      const blob = await exportExpensesCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expenses_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message || "Failed to export expenses");
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle close form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormError("");
    setFormData({
      date: new Date().toISOString().split("T")[0],
      categoryId: "",
      amount: "",
      description: "",
    });
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Unknown";
  };

  return (
    <div
      className={`min-h-screen w-full transition-colors ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-10 lg:mb-12">
          <h1
            className={`text-4xl lg:text-5xl font-bold mb-3 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Expenses
          </h1>
          <p
            className={`text-lg ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Track, manage, and analyze your expenses
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className={`mb-6 p-4 rounded-lg border-l-4 flex items-start gap-4 transition-all ${
              isDarkMode
                ? "bg-red-900/30 border-red-500 text-red-300"
                : "bg-red-50 border-red-500 text-red-700"
            }`}
          >
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className={`ml-auto flex-shrink-0 text-xl hover:opacity-70 transition ${
                isDarkMode ? "text-red-300" : "text-red-700"
              }`}
            >
              ✕
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 lg:mb-12">
          <button
            className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            onClick={() => {
              setShowForm(true);
              // Scroll form into view and focus date field
              setTimeout(() => {
                document
                  .querySelector("form")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
                document.querySelector('input[type="date"]')?.focus();
              }, 100);
            }}
            disabled={loading}
          >
            ➕ Add Expense
          </button>
          <button
            className="flex-1 sm:flex-none bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            onClick={handleExportCsv}
            disabled={expenses.length === 0 || operationLoading}
          >
            {operationLoading ? "⏳ Exporting..." : "📥 Export CSV"}
          </button>
        </div>

        {/* Filters Card */}
        <div
          className={`rounded-2xl p-6 lg:p-8 shadow-xl mb-10 lg:mb-12 ${
            isDarkMode ? "bg-gray-800/80" : "bg-white/95"
          }`}
        >
          <div className="mb-6">
            <h2
              className={`text-xl lg:text-2xl font-bold mb-1 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              🔍 Filters & Search
            </h2>
            <p
              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Search and filter your expenses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search Input */}
            <input
              type="text"
              placeholder="🔍 Search description or amount..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={`px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-base ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
              }`}
            />

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className={`px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-base ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500"
                  : "border-gray-300 bg-white text-gray-900 focus:border-blue-500"
              }`}
            >
              <option value="">📂 All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className={`px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-base ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500"
                  : "border-gray-300 bg-white text-gray-900 focus:border-blue-500"
              }`}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
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
                Loading expenses...
              </p>
            </div>
          </div>
        )}

        {/* Expenses List */}
        {!loading && (
          <>
            {filteredExpenses.length === 0 ? (
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
                  📝 No expenses found
                </p>
                <p
                  className={`text-base ${
                    isDarkMode ? "text-blue-300" : "text-blue-600"
                  }`}
                >
                  {searchTerm || selectedCategory || selectedDate
                    ? "Try adjusting your search or filters"
                    : "Add your first expense to get started"}
                </p>
              </div>
            ) : (
              <div
                className={`rounded-2xl shadow-xl overflow-hidden ${
                  isDarkMode ? "bg-gray-800/80" : "bg-white/95"
                }`}
              >
                {/* Table Header Info */}
                <div
                  className={`px-6 lg:px-8 py-4 border-b flex items-center justify-between ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-900/50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Showing {paginatedExpenses.length} of{" "}
                    {filteredExpenses.length} expenses
                  </p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr
                        className={`border-b-2 ${
                          isDarkMode
                            ? "bg-gray-900/50 border-gray-700"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <th
                          className={`px-6 lg:px-8 py-4 text-left text-sm font-semibold ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Date
                        </th>
                        <th
                          className={`px-6 lg:px-8 py-4 text-left text-sm font-semibold ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Category
                        </th>
                        <th
                          className={`px-6 lg:px-8 py-4 text-left text-sm font-semibold ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Description
                        </th>
                        <th
                          className={`px-6 lg:px-8 py-4 text-left text-sm font-semibold ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Amount
                        </th>
                        <th
                          className={`px-6 lg:px-8 py-4 text-left text-sm font-semibold ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedExpenses.map((expense) => (
                        <tr
                          key={expense.id}
                          className={`border-b transition-colors ${
                            isDarkMode
                              ? "border-gray-700 hover:bg-gray-700/50"
                              : "border-gray-100 hover:bg-blue-50"
                          }`}
                        >
                          <td
                            className={`px-6 lg:px-8 py-4 text-sm font-medium ${
                              isDarkMode ? "text-gray-200" : "text-gray-900"
                            }`}
                          >
                            {new Date(expense.date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </td>
                          <td className="px-6 lg:px-8 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                                isDarkMode
                                  ? "bg-indigo-900/50 text-indigo-300"
                                  : "bg-indigo-100 text-indigo-700"
                              }`}
                            >
                              {getCategoryName(expense.categoryId)}
                            </span>
                          </td>
                          <td
                            className={`px-6 lg:px-8 py-4 text-sm max-w-xs truncate ${
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                            title={expense.description}
                          >
                            {expense.description || "—"}
                          </td>
                          <td
                            className={`px-6 lg:px-8 py-4 text-sm font-semibold ${
                              isDarkMode
                                ? "text-emerald-400"
                                : "text-emerald-600"
                            }`}
                          >
                            {formatCurrency(expense.amount, currency)}
                          </td>
                          <td className="px-6 lg:px-8 py-4">
                            <div className="flex gap-2">
                              <button
                                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200"
                                onClick={() => handleEdit(expense)}
                                disabled={operationLoading}
                                title="Edit expense"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200"
                                onClick={() => handleDelete(expense.id)}
                                disabled={operationLoading}
                                title="Delete expense"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div
                    className={`px-6 lg:px-8 py-6 border-t flex items-center justify-between ${
                      isDarkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                          isDarkMode
                            ? "bg-gray-700 text-white hover:bg-gray-600"
                            : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                        }`}
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                          isDarkMode
                            ? "bg-gray-700 text-white hover:bg-gray-600"
                            : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                        }`}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Add/Edit Expense Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div
              className={`rounded-2xl shadow-2xl w-full max-w-md max-h-screen overflow-y-auto ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              {/* Modal Header */}
              <div
                className={`flex justify-between items-center p-6 lg:p-8 border-b sticky top-0 ${
                  isDarkMode
                    ? "bg-gray-900 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <h2
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {editingId ? "✏️ Edit Expense" : "➕ Add Expense"}
                </h2>
                <button
                  className={`text-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${
                    isDarkMode
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={handleCloseForm}
                  disabled={submitting}
                >
                  ✕
                </button>
              </div>

              {/* Form Error */}
              {formError && (
                <div
                  className={`mx-6 mt-6 p-4 rounded-lg border-l-4 flex items-start gap-3 ${
                    isDarkMode
                      ? "bg-red-900/30 border-red-500 text-red-300"
                      : "bg-red-50 border-red-500 text-red-700"
                  }`}
                >
                  <span className="text-lg flex-shrink-0">⚠️</span>
                  <p className="text-sm">{formError}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6">
                {/* Date */}
                <div>
                  <label
                    htmlFor="date"
                    className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-base disabled:opacity-60 ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500"
                        : "border-gray-300 bg-white text-gray-900 focus:border-blue-500"
                    }`}
                  />
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="categoryId"
                    className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    disabled={submitting || categories.length === 0}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-base disabled:opacity-60 ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500"
                        : "border-gray-300 bg-white text-gray-900 focus:border-blue-500"
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label
                    htmlFor="amount"
                    className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Amount ({getCurrencySymbol(currency)}){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                    disabled={submitting}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-base disabled:opacity-60 ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
                    }`}
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter expense description (optional)"
                    rows="3"
                    disabled={submitting}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-base disabled:opacity-60 resize-none ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
                    }`}
                  />
                </div>

                {/* Form Actions */}
                <div
                  className={`flex gap-3 justify-end pt-6 border-t ${
                    isDarkMode ? "border-gray-600" : "border-gray-200"
                  }`}
                >
                  <button
                    type="button"
                    className={`flex-1 font-semibold py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                    }`}
                    onClick={handleCloseForm}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 text-sm"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Saving..."
                      : editingId
                        ? "Update Expense"
                        : "Add Expense"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
