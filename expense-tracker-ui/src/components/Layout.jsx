import Navbar from "./Navbar";
import { useDarkMode } from "../context/DarkModeContext";

/**
 * Layout Component - Proper Sticky Footer Pattern
 *
 * Structure:
 * - min-h-screen: Full viewport height minimum
 * - flex flex-col: Flex column layout
 * - Navbar: flex-shrink-0 (fixed size)
 * - Main: flex-1 (expands to fill space)
 * - Footer: flex-shrink-0 (fixed size)
 *
 * This prevents overlap and keeps footer at bottom
 */
export default function Layout({ children }) {
  const { isDarkMode } = useDarkMode();

  return (
    <div
      className={`flex flex-col min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-white"}`}
    >
      {/* Navbar - Fixed height, doesn't grow or shrink */}
      <div className="flex-shrink-0">
        <Navbar />
      </div>

      {/* Main Content - Expands to fill remaining space */}
      <main
        className={`flex-1 w-full ${
          isDarkMode
            ? "bg-gradient-to-b from-gray-900 to-gray-950"
            : "bg-gradient-to-b from-blue-50 to-white"
        }`}
      >
        {children}
      </main>

      {/* Footer - Fixed height, stays at bottom */}
      <footer
        className={`flex-shrink-0 border-t-2 w-full ${
          isDarkMode
            ? "bg-gray-950 border-blue-900 text-gray-100"
            : "bg-gray-100 border-blue-200 text-gray-900"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Footer Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Column 1: Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">💰</div>
                <h3 className="text-xl font-bold">Expense Tracker</h3>
              </div>
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                Smart financial management for modern living.
              </p>
            </div>

            {/* Column 2: Features */}
            <div>
              <h4
                className={`font-bold mb-4 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
              >
                Features
              </h4>
              <ul
                className={`space-y-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                <li>
                  <a href="#" className="hover:font-semibold">
                    📊 Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:font-semibold">
                    💸 Expenses
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:font-semibold">
                    📂 Categories
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:font-semibold">
                    👤 Profile
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Support */}
            <div>
              <h4
                className={`font-bold mb-4 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}
              >
                Support
              </h4>
              <ul
                className={`space-y-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                <li>
                  <a href="#" className="hover:font-semibold">
                    📚 Help
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:font-semibold">
                    🔒 Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:font-semibold">
                    ⚖️ Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:font-semibold">
                    💬 Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Connect */}
            <div>
              <h4
                className={`font-bold mb-4 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}
              >
                Connect
              </h4>
              <div className="flex gap-3 mb-4">
                <a
                  href="#"
                  className={`w-10 h-10 rounded flex items-center justify-center ${isDarkMode ? "bg-gray-800" : "bg-gray-300"}`}
                  title="Twitter"
                >
                  𝕏
                </a>
                <a
                  href="#"
                  className={`w-10 h-10 rounded flex items-center justify-center ${isDarkMode ? "bg-gray-800" : "bg-gray-300"}`}
                  title="Facebook"
                >
                  f
                </a>
                <a
                  href="#"
                  className={`w-10 h-10 rounded flex items-center justify-center ${isDarkMode ? "bg-gray-800" : "bg-gray-300"}`}
                  title="LinkedIn"
                >
                  in
                </a>
              </div>
              <p className="text-sm">Follow for updates</p>
            </div>
          </div>

          {/* Footer Divider */}
          <div
            className={`border-t my-8 ${isDarkMode ? "border-gray-800" : "border-gray-300"}`}
          ></div>

          {/* Copyright & Links */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs sm:text-sm">
              © 2025 Expense Tracker. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs sm:text-sm">
              <a href="#" className="hover:font-semibold">
                Privacy
              </a>
              <a href="#" className="hover:font-semibold">
                Terms
              </a>
              <a href="#" className="hover:font-semibold">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
