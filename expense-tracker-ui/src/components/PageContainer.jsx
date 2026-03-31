import { useDarkMode } from "../context/DarkModeContext";

/**
 * PageContainer Component - Consistent page layout wrapper
 *
 * Features:
 * - Max-width container (7xl) for better readability
 * - Centered content with auto margins
 * - Consistent padding (responsive)
 * - Proper spacing and visual hierarchy
 * - Dark/light mode support
 *
 * Usage:
 * <PageContainer>
 *   <PageHeader title="Dashboard" subtitle="Your financial overview" />
 *   <div>Content goes here</div>
 * </PageContainer>
 */
export function PageContainer({ children }) {
  const { isDarkMode } = useDarkMode();

  return (
    <div
      className={`w-full transition-colors ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-100"
          : "bg-gradient-to-b from-blue-50 via-white to-indigo-50 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 sm:py-12 md:py-16">
        {children}
      </div>
    </div>
  );
}

/**
 * PageHeader Component - Consistent page title and subtitle
 *
 * Usage:
 * <PageHeader
 *   title="Dashboard"
 *   subtitle="Your financial overview"
 *   icon="📊"
 * />
 */
export function PageHeader({ title, subtitle, icon = "📄" }) {
  const { isDarkMode } = useDarkMode();

  return (
    <div className="mb-8 sm:mb-10 md:mb-12">
      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
        <div className="text-3xl sm:text-4xl md:text-5xl">{icon}</div>
        <h1
          className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight ${
            isDarkMode ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {title}
        </h1>
      </div>
      {subtitle && (
        <p
          className={`text-base sm:text-lg ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/**
 * PageSection Component - Consistent card/section styling
 *
 * Usage:
 * <PageSection title="Statistics">
 *   <div>Content</div>
 * </PageSection>
 */
export function PageSection({ title, subtitle, children, className = "" }) {
  const { isDarkMode } = useDarkMode();

  return (
    <div
      className={`rounded-xl shadow-lg border-t-4 transition-colors p-6 sm:p-8 mb-8 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-800 to-gray-900 border-blue-400"
          : "bg-white border-blue-500"
      } ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h2
              className={`text-2xl sm:text-3xl font-bold mb-1 ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className={`text-sm sm:text-base ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * PageGrid Component - Responsive grid for cards
 *
 * Usage:
 * <PageGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
 *   <Card>...</Card>
 * </PageGrid>
 */
export function PageGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3, large: 4 },
  gap = 6,
}) {
  const colClass = {
    1: "grid-cols-1",
    2: "sm:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "xl:grid-cols-4",
    5: "2xl:grid-cols-5",
  };

  const gapClass = {
    3: "gap-3",
    4: "gap-4",
    5: "gap-5",
    6: "gap-6",
    8: "gap-8",
  };

  return (
    <div
      className={`grid grid-cols-${cols.mobile} ${colClass[cols.tablet]} ${colClass[cols.desktop]} ${colClass[cols.large]} ${gapClass[gap]}`}
    >
      {children}
    </div>
  );
}
