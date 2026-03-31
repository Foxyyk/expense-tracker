import { useState, useEffect } from "react";
import { useDarkMode } from "../context/DarkModeContext";
import { usePreferences } from "../hooks/usePreferences";
import { formatCurrency } from "../utils/currencyUtils";
import * as categoryService from "../services/categoryService";

/**
 * Categories Page - Modern, Responsive Design
 * Fetches categories from backend and displays statistics
 * Allows creating and deleting categories with backend sync
 */
export default function Categories() {
  const { isDarkMode } = useDarkMode();
  const { currency } = usePreferences();

  // State for categories
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // State for form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Common icon options for quick selection
  const iconOptions = [
    "🍕",
    "🚗",
    "🎬",
    "💡",
    "📦",
    "🏥",
    "🎓",
    "🏠",
    "🎮",
    "✈️",
    "🍽️",
    "👔",
  ];

  // Load categories on component mount and when data is refreshed
  useEffect(() => {
    loadCategories();

    // Listen for expense updates from localStorage
    // This allows refresh when expenses are modified on another page
    const handleStorageChange = () => {
      console.log("Expense data changed detected, refreshing categories...");
      loadCategories();
    };

    const handleExpenseUpdate = () => {
      console.log("Expense update event detected, refreshing categories...");
      loadCategories();
    };

    // Listen to storage changes (when expenses are modified)
    window.addEventListener("storage", handleStorageChange);
    // Custom event listener for expense updates
    window.addEventListener("expenseUpdated", handleExpenseUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("expenseUpdated", handleExpenseUpdate);
    };
  }, []);

  // Fetch categories from backend
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await categoryService.getCategories();
      console.log("🔄 Loaded categories:", data);

      // Validate data structure
      if (!Array.isArray(data)) {
        console.error(
          "❌ Invalid data structure - expected array, got:",
          typeof data,
        );
        setError("Invalid data received from server");
        setCategories([]);
        return;
      }

      // Validate each category has required fields and coerce to numbers
      const validData = data.map((cat) => {
        if (!cat.id || !cat.name) {
          console.warn("⚠️ Invalid category structure:", cat);
        }
        return {
          ...cat,
          totalAmount: Number(cat.totalAmount) || 0,
          expenseCount: Number(cat.expenseCount) || 0,
        };
      });

      console.log("✅ Validated categories:", validData);
      setCategories(validData);
    } catch (err) {
      setError(err.message || "Failed to load categories");
      console.error("❌ Error loading categories:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get color gradient based on category index
  const getColorGradient = (index) => {
    const colors = [
      "from-orange-500 to-red-500",
      "from-blue-500 to-indigo-500",
      "from-purple-500 to-pink-500",
      "from-yellow-500 to-orange-500",
      "from-green-500 to-emerald-500",
      "from-cyan-500 to-blue-500",
      "from-red-500 to-pink-500",
      "from-violet-500 to-purple-500",
    ];
    return colors[index % colors.length];
  };

  // Helper function to get icon based on category name
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      food: "🍕",
      transport: "🚗",
      entertainment: "🎬",
      utilities: "💡",
      other: "📦",
      health: "🏥",
      education: "🎓",
      housing: "🏠",
      games: "🎮",
      travel: "✈️",
      dining: "🍽️",
      shopping: "👔",
      groceries: "🛒",
      fuel: "⛽",
    };

    const lowerName = categoryName.toLowerCase();
    return iconMap[lowerName] || "📂";
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "icon" ? value : value.trim(),
    }));
  };

  // Handle form submission - Create new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      if (!formData.name || formData.name.length === 0) {
        setFormError("Category name is required");
        setSubmitting(false);
        return;
      }

      if (formData.name.length > 30) {
        setFormError("Category name must be less than 30 characters");
        setSubmitting(false);
        return;
      }

      // Check for duplicates
      if (
        categories.some(
          (c) => c.name.toLowerCase() === formData.name.toLowerCase(),
        )
      ) {
        setFormError("Category name already exists");
        setSubmitting(false);
        return;
      }

      // Call API to create or update category
      if (editingId) {
        await categoryService.updateCategory(editingId, {
          name: formData.name,
        });
        setEditingId(null);
      } else {
        await categoryService.createCategory({
          name: formData.name,
        });
      }

      // Reload categories from backend to get the updated list
      await loadCategories();
      setFormData({ name: "" });
      setShowForm(false);
    } catch (err) {
      setFormError(err.message || "Failed to create category");
      console.error("Error creating category:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit category
  const handleEdit = (category) => {
    console.log("🖊️ Editing category:", category);
    setEditingId(category.id);
    setFormData({
      name: category.name,
    });
    setShowForm(true);
    setFormError("");
  };

  // Handle delete category
  const handleDelete = async (id) => {
    const category = categories.find((c) => c.id === id);
    const categoryName = category?.name || `Category ${id}`;

    if (
      window.confirm(
        `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`,
      )
    ) {
      try {
        console.log("🗑️ Deleting category ID:", id);
        await categoryService.deleteCategory(id, false);
        console.log("✅ Category deleted successfully");
        // Reload categories after deletion
        await loadCategories();
      } catch (err) {
        // Check if error is due to category having user expenses
        if (err.status === 409 && err.hasUserExpenses && err.expenseCount > 0) {
          console.warn(
            `⚠️ Category has ${err.expenseCount} user expenses, asking for confirmation...`,
          );
          const confirmDeletion = window.confirm(
            `"${err.categoryName}" contains ${err.expenseCount} of your expense(s). ` +
              `All expenses will be deleted when the category is deleted.\n\nAre you sure you want to proceed?`,
          );

          if (confirmDeletion) {
            try {
              console.log(`🗑️ Force deleting category ID: ${id}`);
              await categoryService.deleteCategory(id, true);
              console.log("✅ Category and expenses deleted successfully");
              // Reload categories after deletion
              await loadCategories();
            } catch (forceDeleteErr) {
              console.error(
                "❌ Error force deleting category:",
                forceDeleteErr,
              );
              setError(forceDeleteErr.message || "Failed to delete category");
            }
          }
        } else {
          console.error("❌ Error deleting category:", err);
          setError(err.message || "Failed to delete category");
        }
      }
    }
  };

  // Calculate total statistics from API data - with safe number coercion
  const totalExpenses = categories.reduce(
    (sum, cat) => sum + (Number(cat.totalAmount) || 0),
    0,
  );
  const totalCategories = categories.length;
  const totalItems = categories.reduce(
    (sum, cat) => sum + (Number(cat.expenseCount) || 0),
    0,
  );

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
            Categories
          </h1>
          <p
            className={`text-lg ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Organize and manage your expense categories
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className={`mb-8 p-4 rounded-2xl border-l-4 flex items-start gap-4 ${
              isDarkMode
                ? "bg-red-900/30 border-red-500 text-red-300"
                : "bg-red-50 border-red-500 text-red-700"
            }`}
          >
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-lg hover:opacity-70 transition flex-shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 lg:mb-12">
          {/* Total Categories */}
          <div
            className={`rounded-2xl p-6 lg:p-8 shadow-xl transition-all hover:shadow-2xl border-t-4 border-blue-500 ${
              isDarkMode ? "bg-gray-800/80" : "bg-white/95"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-semibold mb-1 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Total Categories
                </p>
                <p
                  className={`text-3xl lg:text-4xl font-bold ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {totalCategories}
                </p>
              </div>
              <span className="text-4xl lg:text-5xl opacity-50">📂</span>
            </div>
          </div>

          {/* Total Expenses */}
          <div
            className={`rounded-2xl p-6 lg:p-8 shadow-xl transition-all hover:shadow-2xl border-t-4 border-emerald-500 ${
              isDarkMode ? "bg-gray-800/80" : "bg-white/95"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-semibold mb-1 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Total Expenses
                </p>
                <p
                  className={`text-lg lg:text-xl font-bold ${
                    isDarkMode ? "text-emerald-400" : "text-emerald-600"
                  }`}
                >
                  {formatCurrency(totalExpenses, currency)}
                </p>
              </div>
              <span className="text-4xl lg:text-5xl opacity-50">💰</span>
            </div>
          </div>

          {/* Total Items */}
          <div
            className={`rounded-2xl p-6 lg:p-8 shadow-xl transition-all hover:shadow-2xl border-t-4 border-amber-500 ${
              isDarkMode ? "bg-gray-800/80" : "bg-white/95"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-semibold mb-1 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Total Items Tracked
                </p>
                <p
                  className={`text-3xl lg:text-4xl font-bold ${
                    isDarkMode ? "text-amber-400" : "text-amber-600"
                  }`}
                >
                  {totalItems}
                </p>
              </div>
              <span className="text-4xl lg:text-5xl opacity-50">📊</span>
            </div>
          </div>
        </div>

        {/* Add Category Form Card */}
        <div
          className={`rounded-2xl p-6 lg:p-8 shadow-xl mb-10 lg:mb-12 ${
            isDarkMode ? "bg-gray-800/80" : "bg-white/95"
          }`}
        >
          <div className="mb-6">
            <h2
              className={`text-2xl lg:text-3xl font-bold mb-1 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {showForm
                ? editingId
                  ? "✏️ Edit Category"
                  : "➕ Add New Category"
                : "➕ Create Category"}
            </h2>
            <p
              className={`text-base ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              {showForm
                ? editingId
                  ? "Update the category details"
                  : "Fill in the details to add a new expense category"
                : "Click the button below to create a new category"}
            </p>
          </div>

          {showForm ? (
            <form onSubmit={handleAddCategory} className="space-y-6">
              {/* Form Error */}
              {formError && (
                <div
                  className={`p-4 rounded-lg border-l-4 flex items-start gap-3 ${
                    isDarkMode
                      ? "bg-red-900/30 border-red-500 text-red-300"
                      : "bg-red-50 border-red-500 text-red-700"
                  }`}
                >
                  <span className="text-lg flex-shrink-0">⚠️</span>
                  <p className="text-sm">{formError}</p>
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 gap-6">
                {/* Category Name */}
                <div>
                  <label
                    htmlFor="name"
                    className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Groceries, Fuel, Entertainment"
                    maxLength="30"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-base ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
                    }`}
                  />
                  <p
                    className={`text-xs mt-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {formData.name.length}/30 characters
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-300 dark:border-gray-600">
                <button
                  type="button"
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 text-base ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormError("");
                    setFormData({ name: "" });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 background-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 text-base shadow-lg hover:shadow-xl"
                >
                  {editingId ? "Update Category" : "Add Category"}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-6 py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-base"
            >
              ➕ Add New Category
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
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
                Loading your categories...
              </p>
            </div>
          </div>
        ) : categories.length > 0 ? (
          <>
            <div className="mb-6">
              <h2
                className={`text-2xl lg:text-3xl font-bold mb-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                📋 Your Categories ({categories.length})
              </h2>
              <p
                className={`text-base ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                View and manage all your expense categories
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className={`rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl group ${
                    isDarkMode ? "bg-gray-800/80" : "bg-white/95"
                  }`}
                >
                  {/* Category Header with Icon */}
                  <div
                    className={`bg-gradient-to-r ${getColorGradient(index)} h-32 lg:h-36 flex items-center justify-center relative`}
                  >
                    <span className="text-6xl lg:text-7xl transform group-hover:scale-110 transition-transform duration-300">
                      {getCategoryIcon(category.name)}
                    </span>
                  </div>

                  {/* Category Content */}
                  <div className="p-6 lg:p-8">
                    {/* Category Title */}
                    <h3
                      className={`text-xl lg:text-2xl font-bold mb-6 line-clamp-2 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {category.name}
                    </h3>

                    {/* Stats */}
                    <div className="space-y-4 mb-8">
                      {/* Expense Count */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-base font-medium ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          📊 Expenses
                        </span>
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${
                            isDarkMode
                              ? "bg-blue-900/50 text-blue-300"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {category.expenseCount}
                        </span>
                      </div>

                      {/* Total Spent */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-base font-medium ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          💰 Total
                        </span>
                        <span
                          className={`text-lg font-bold ${
                            isDarkMode ? "text-emerald-400" : "text-emerald-600"
                          }`}
                        >
                          {formatCurrency(
                            Number(category.totalAmount) || 0,
                            currency,
                          )}
                        </span>
                      </div>

                      {/* Average per Expense */}
                      <div
                        className={`p-4 rounded-lg flex items-center justify-between ${
                          isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                        }`}
                      >
                        <span
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          📈 Avg. per Item
                        </span>
                        <span
                          className={`text-base font-bold ${
                            isDarkMode ? "text-gray-200" : "text-gray-900"
                          }`}
                        >
                          {formatCurrency(
                            (Number(category.totalAmount) || 0) /
                              Math.max(Number(category.expenseCount) || 1, 1),
                            currency,
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-300 dark:border-gray-600">
                      <button
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200"
                        onClick={() => handleEdit(category)}
                        title="Edit category"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200"
                        onClick={() => handleDelete(category.id)}
                        title="Delete category"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div
            className={`rounded-2xl p-12 lg:p-16 text-center shadow-xl ${
              isDarkMode ? "bg-gray-800/80" : "bg-white/95"
            }`}
          >
            <p
              className={`text-3xl font-bold mb-3 ${
                isDarkMode ? "text-gray-300" : "text-gray-800"
              }`}
            >
              📂 No Categories Yet
            </p>
            <p
              className={`text-lg mb-6 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Create your first category to start organizing your expenses
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-base"
            >
              ➕ Create First Category
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
