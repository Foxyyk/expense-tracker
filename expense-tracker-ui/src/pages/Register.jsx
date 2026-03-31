import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useDarkMode } from "../context/DarkModeContext";
import { register as registerAPI, saveAuthData } from "../services/authService";

/**
 * Register Page - Modern, Professional Design
 * Extended form with profile information and image upload
 * Supports creating a complete user profile during registration
 * Includes dark mode toggle
 */
export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    profileImage: null,
  });

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        profileImage: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      profileImage: null,
    }));
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }

    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }

    if (!formData.email) {
      setError("Email is required");
      return false;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      // Prepare form data for backend
      const submitData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email,
        password: formData.password,
        phone: formData.phone || null,
      };

      // Call register with full profile data
      const response = await registerAPI(submitData);

      // Save auth data
      saveAuthData(response.token, response.user);

      // Update context
      login(response.token, response.user);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-screen flex flex-col items-center justify-start transition-colors overflow-y-auto overflow-x-hidden ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      } px-3 sm:px-4 py-2 sm:py-3`}
    >
      {/* Dark Mode Toggle */}
      <div className="fixed top-4 sm:top-6 right-3 sm:right-6 z-50">
        <button
          onClick={toggleDarkMode}
          className={`p-2 sm:p-2.5 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 ${
            isDarkMode
              ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
              : "bg-white text-gray-800 hover:bg-gray-100"
          }`}
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </div>

      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl flex flex-col items-center gap-0">
        {/* Logo/Brand Section */}
        <div className="text-center mb-3 sm:mb-4 w-full px-2">
          <div
            className={`flex items-center justify-center w-12 sm:w-14 md:w-16 lg:w-20 h-12 sm:h-14 md:h-16 lg:h-20 rounded-full mb-2 sm:mb-2 shadow-lg hover:shadow-xl transition-all duration-300 mx-auto ${
              isDarkMode
                ? "bg-gradient-to-br from-blue-600 to-indigo-700"
                : "bg-gradient-to-br from-blue-500 to-indigo-600"
            }`}
          >
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl select-none leading-none">
              💰
            </span>
          </div>
          <h1
            className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Expense Tracker
          </h1>
          <p
            className={`mt-1 text-xs sm:text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Start managing your finances
          </p>
        </div>

        {/* Register Card */}
        <div
          className={`w-full rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-5 md:p-6 lg:p-8 space-y-3 sm:space-y-4 md:space-y-5 flex-shrink-0 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          {/* Card Header */}
          <div>
            <h2
              className={`text-lg sm:text-xl md:text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Create account
            </h2>
            <p
              className={`text-xs sm:text-sm mt-0.5 sm:mt-1 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Fill in your details
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className={`border-l-4 p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3 animate-fadeIn text-sm sm:text-base ${
                isDarkMode
                  ? "bg-red-900/30 border-red-500 text-red-300"
                  : "bg-red-50 border-red-500 text-red-700"
              }`}
            >
              <span className="text-lg sm:text-xl flex-shrink-0 mt-0.5">
                ⚠️
              </span>
              <div>
                <p className="font-semibold text-sm sm:text-base">Error</p>
                <p className="text-xs sm:text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-5 md:space-y-6"
          >
            {/* Profile Image Section */}
            <div className="flex flex-col items-center">
              <div className="relative mb-3 sm:mb-4">
                {preview ? (
                  <div className="relative w-28 sm:w-32 md:w-36 h-28 sm:h-32 md:h-36">
                    <img
                      src={preview}
                      alt="Profile preview"
                      className={`w-28 sm:w-32 md:w-36 h-28 sm:h-32 md:h-36 rounded-full object-cover border-4 ${
                        isDarkMode ? "border-blue-900" : "border-blue-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors text-lg"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    className={`w-28 sm:w-32 md:w-36 h-28 sm:h-32 md:h-36 rounded-full flex items-center justify-center text-3xl sm:text-4xl md:text-5xl border-4 ${
                      isDarkMode
                        ? "bg-gradient-to-br from-blue-900 to-indigo-900 border-blue-700"
                        : "bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-200"
                    }`}
                  >
                    📸
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className={`font-semibold text-xs sm:text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                  isDarkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-700"
                }`}
              >
                {preview ? "Change Photo" : "Add Photo (Optional)"}
              </button>
              <p
                className={`text-xs mt-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                JPG, PNG or GIF (Max 5MB)
              </p>
            </div>

            {/* Name Fields - Two Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
              {/* First Name */}
              <div>
                <label
                  htmlFor="firstName"
                  className={`block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 ${
                    isDarkMode ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  disabled={loading}
                  className={`w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3 lg:py-4 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base md:text-base lg:text-lg ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-900/50 disabled:bg-gray-600"
                      : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="lastName"
                  className={`block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 ${
                    isDarkMode ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  disabled={loading}
                  className={`w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3 lg:py-4 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base md:text-base lg:text-lg ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-900/50 disabled:bg-gray-600"
                      : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className={`block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 ${
                  isDarkMode ? "text-gray-200" : "text-gray-900"
                }`}
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                disabled={loading}
                className={`w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3 lg:py-4 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base md:text-base lg:text-lg ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-900/50 disabled:bg-gray-600"
                    : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-100"
                }`}
                required
              />
            </div>

            {/* Phone Field (Optional) */}
            <div>
              <label
                htmlFor="phone"
                className={`block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 ${
                  isDarkMode ? "text-gray-200" : "text-gray-900"
                }`}
              >
                Phone Number{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                disabled={loading}
                className={`w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3 lg:py-4 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base md:text-base lg:text-lg ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-900/50 disabled:bg-gray-600"
                    : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-100"
                }`}
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <label
                  htmlFor="password"
                  className={`block text-xs sm:text-sm font-semibold ${
                    isDarkMode ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                    isDarkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-700"
                  }`}
                  disabled={loading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="At least 6 characters"
                  disabled={loading}
                  className={`w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3 lg:py-4 pr-10 sm:pr-12 md:pr-14 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base md:text-base lg:text-lg ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-900/50 disabled:bg-gray-600"
                      : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  required
                />
                <div
                  className={`absolute right-3 sm:right-4 md:right-5 top-1/2 transform -translate-y-1/2 text-lg sm:text-xl md:text-2xl pointer-events-none flex items-center justify-center ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {showPassword ? "👁️" : "🔒"}
                </div>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <label
                  htmlFor="confirmPassword"
                  className={`block text-xs sm:text-sm font-semibold ${
                    isDarkMode ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                    isDarkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-700"
                  }`}
                  disabled={loading}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  disabled={loading}
                  className={`w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3 lg:py-4 pr-10 sm:pr-12 md:pr-14 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base md:text-base lg:text-lg ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-900/50 disabled:bg-gray-600"
                      : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  required
                />
                <div
                  className={`absolute right-3 sm:right-4 md:right-5 top-1/2 transform -translate-y-1/2 text-lg sm:text-xl md:text-2xl pointer-events-none flex items-center justify-center ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {showConfirmPassword ? "👁️" : "🔒"}
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-2 sm:gap-3">
              <input
                type="checkbox"
                id="terms"
                disabled={loading}
                className={`w-5 h-5 mt-0.5 border-2 rounded-lg focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0 ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 focus:border-blue-500"
                    : "border-gray-200 bg-white focus:border-blue-500"
                }`}
                required
              />
              <label
                htmlFor="terms"
                className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                I agree to the{" "}
                <button
                  type="button"
                  className={`font-semibold transition-colors disabled:opacity-60 ${
                    isDarkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-700"
                  }`}
                  disabled={loading}
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className={`font-semibold transition-colors disabled:opacity-60 ${
                    isDarkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-700"
                  }`}
                  disabled={loading}
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 md:py-3 lg:py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 text-sm sm:text-base md:text-base lg:text-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span className="hidden sm:inline">Creating account...</span>
                  <span className="sm:hidden">Creating</span>
                </>
              ) : (
                <>Create Account</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative py-4 sm:py-6">
            <div
              className={`absolute inset-0 flex items-center ${
                isDarkMode ? "border-gray-600" : "border-gray-200"
              }`}
            >
              <div
                className={`w-full border-t ${
                  isDarkMode ? "border-gray-600" : "border-gray-200"
                }`}
              ></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span
                className={`px-2 font-medium ${
                  isDarkMode
                    ? "bg-gray-800 text-gray-400"
                    : "bg-white text-gray-600"
                }`}
              >
                or
              </span>
            </div>
          </div>

          {/* Login Link */}
          <p
            className={`text-center text-sm sm:text-base ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className={`font-semibold transition-colors duration-200 ${
                isDarkMode
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-600 hover:text-blue-700"
              }`}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
