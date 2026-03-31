import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useDarkMode } from "../context/DarkModeContext";
import { login as loginAPI, saveAuthData } from "../services/authService";

/**
 * Login Page - Modern, Professional Design
 * Clean centered form with email and password inputs
 * Includes dark mode toggle
 */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validation
      if (!email || !password) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      if (!email.includes("@")) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      const response = await loginAPI(email, password);

      // Save auth data
      saveAuthData(response.token, response.user);

      // Update context
      login(response.token, response.user);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
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

      <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center gap-0">
        {/* Logo/Brand Section */}
        <div className="text-center mb-4 sm:mb-5 w-full">
          <div
            className={`flex items-center justify-center w-14 sm:w-16 md:w-18 h-14 sm:h-16 md:h-18 rounded-full mb-3 sm:mb-3 shadow-lg hover:shadow-xl transition-all duration-300 mx-auto ${
              isDarkMode
                ? "bg-gradient-to-br from-blue-600 to-indigo-700"
                : "bg-gradient-to-br from-blue-500 to-indigo-600"
            }`}
          >
            <span className="text-2xl sm:text-3xl md:text-4xl select-none leading-none">
              💰
            </span>
          </div>
          <h1
            className={`text-xl sm:text-2xl font-bold tracking-tight ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Expense Tracker
          </h1>
          <p
            className={`mt-1.5 text-sm sm:text-base ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Manage your finances
          </p>
        </div>

        {/* Login Card */}
        <div
          className={`w-full rounded-2xl shadow-lg p-5 sm:p-6 space-y-3.5 sm:space-y-4 flex-shrink-0 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          {/* Card Header */}
          <div>
            <h2
              className={`text-xl sm:text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Welcome back
            </h2>
            <p
              className={`text-sm sm:text-base mt-1 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Sign in to your account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className={`border-l-4 p-3 sm:p-4 rounded-lg flex items-start gap-2 animate-fadeIn text-sm ${
                isDarkMode
                  ? "bg-red-900/30 border-red-500 text-red-300"
                  : "bg-red-50 border-red-500 text-red-700"
              }`}
            >
              <span className="text-lg sm:text-xl flex-shrink-0 mt-0.5">
                ⚠️
              </span>
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? "text-gray-200" : "text-gray-900"
                }`}
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-900/50 disabled:bg-gray-600"
                    : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-100"
                }`}
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className={`block text-sm font-semibold ${
                    isDarkMode ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3 pr-11 sm:pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-900/50 disabled:bg-gray-600"
                      : "border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  required
                />
                <div
                  className={`absolute right-3 sm:right-3.5 top-1/2 transform -translate-y-1/2 text-lg sm:text-xl pointer-events-none ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {showPassword ? "👁️" : "🔒"}
                </div>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                className={`text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                  isDarkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-700"
                }`}
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-3.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 text-base sm:text-lg flex items-center justify-center gap-2 min-h-11 sm:min-h-12"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span className="hidden sm:inline">Signing in...</span>
                  <span className="sm:hidden">Signing in</span>
                </>
              ) : (
                <>Sign In</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative py-3 sm:py-3.5">
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
            <div className="relative flex justify-center">
              <span
                className={`px-2 font-medium text-sm ${
                  isDarkMode
                    ? "bg-gray-800 text-gray-400"
                    : "bg-white text-gray-600"
                }`}
              >
                or
              </span>
            </div>
          </div>

          {/* Register Link */}
          <p
            className={`text-center text-base ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            New to Expense Tracker?{" "}
            <Link
              to="/register"
              className={`font-semibold transition-colors duration-200 ${
                isDarkMode
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-600 hover:text-blue-700"
              }`}
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* Footer Text */}
        <p
          className={`text-center text-xs sm:text-sm mt-6 leading-relaxed ${
            isDarkMode ? "text-gray-500" : "text-gray-600"
          }`}
        >
          By signing in, you agree to our{" "}
          <button
            className={`font-medium transition-colors ${
              isDarkMode
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-600 hover:text-blue-700"
            }`}
          >
            Terms of Service
          </button>{" "}
          and{" "}
          <button
            className={`font-medium transition-colors ${
              isDarkMode
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-600 hover:text-blue-700"
            }`}
          >
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
}
