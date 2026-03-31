import { Link } from "react-router-dom";

/**
 * Not Found Page
 * 404 error page
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 text-center">
      <div className="mb-8 animate-bounce">
        <span className="text-9xl block">🔍</span>
      </div>

      <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text mb-4">
        404
      </h1>

      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        Oops! Page not found
      </h2>
      <p className="text-gray-600 text-lg mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved. Let's get
        you back on track.
      </p>

      <div className="flex gap-4 justify-center flex-wrap">
        <Link
          to="/dashboard"
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          🏠 Back to Dashboard
        </Link>
        <Link
          to="/"
          className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold px-8 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          🔙 Home
        </Link>
      </div>

      <div className="mt-16 text-center text-gray-600 text-sm">
        <p>
          Error Code:{" "}
          <span className="font-mono font-bold text-gray-900">
            404_NOT_FOUND
          </span>
        </p>
      </div>
    </div>
  );
}
