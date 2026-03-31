import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useDarkMode } from "../context/DarkModeContext";

/**
 * Navigation Bar Component with Responsive Hamburger Menu
 * Displays navigation links and highlights active page
 * Mobile-friendly with burger menu for small screens
 */
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMenuOpen(false);
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/expenses", label: "Expenses", icon: "💳" },
    { path: "/categories", label: "Categories", icon: "📂" },
    { path: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 shadow-lg border-b-2 transition-colors ${
        isDarkMode ? "bg-gray-900 border-blue-900" : "bg-white border-blue-100"
      }`}
    >
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo/Brand */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <div className="w-9 sm:w-10 h-9 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-lg sm:text-xl">💰</span>
            </div>
            <span className="hidden sm:inline text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              Expense Tracker
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden lg:flex gap-2 list-none m-0 p-0">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`px-3 xl:px-4 py-2 xl:py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                    isActive(link.path) ||
                    (link.path === "/dashboard" && isActive("/"))
                      ? isDarkMode
                        ? "bg-blue-900 text-blue-300 shadow-md"
                        : "bg-blue-100 text-blue-700 shadow-md"
                      : isDarkMode
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>{link.icon}</span>
                  <span className="hidden xl:inline">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Section - Dark Mode, User Info, Hamburger */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all ${
                isDarkMode
                  ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title="Toggle dark mode"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>

            {/* User Info (Hidden on mobile) */}
            {user && (
              <div
                className={`hidden md:flex items-center gap-2 px-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md overflow-hidden">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : user.firstName ? (
                    user.firstName[0].toUpperCase()
                  ) : user.email ? (
                    user.email[0].toUpperCase()
                  ) : (
                    "U"
                  )}
                </div>
                <div className="hidden lg:block">
                  <p
                    className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-600"}`}
                  >
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.firstName
                        ? user.firstName
                        : user.email}
                  </p>
                </div>
              </div>
            )}

            {/* Logout Button (Hidden on small screens) */}
            <button
              onClick={handleLogout}
              className="hidden sm:block bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 lg:px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg font-semibold text-xs whitespace-nowrap"
            >
              🚪 Logout
            </button>

            {/* Hamburger Menu Button (Mobile) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-all ${
                isDarkMode
                  ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className={`lg:hidden border-t transition-colors ${
              isDarkMode
                ? "border-gray-800 bg-gray-800"
                : "border-gray-100 bg-gray-50"
            }`}
          >
            <div className="px-3 py-4 space-y-2">
              {/* Mobile Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    isActive(link.path) ||
                    (link.path === "/dashboard" && isActive("/"))
                      ? isDarkMode
                        ? "bg-blue-900 text-blue-300 shadow-md"
                        : "bg-blue-100 text-blue-700 shadow-md"
                      : isDarkMode
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}

              {/* Mobile User Info */}
              {user && (
                <div
                  className={`px-4 py-3 rounded-lg mx-2 my-2 ${
                    isDarkMode
                      ? "bg-gray-700"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Signed in as
                  </p>
                  <p
                    className={`text-sm font-bold truncate ${
                      isDarkMode ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {user.email}
                  </p>
                </div>
              )}

              {/* Mobile Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full sm:hidden bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-lg transition-all shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2 mt-2"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
