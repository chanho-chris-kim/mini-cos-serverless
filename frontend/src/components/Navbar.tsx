import { Link } from "react-router-dom";
import logo from "../../assets/logo/CHKInc.png";

export default function Navbar() {
  return (
    <nav className="bg-primary text-secondary shadow">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Company Name */}
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="CHK Inc. Logo"
              className="h-10 w-10 object-contain"
            />
            <span className="font-bold text-xl">CHK Inc.</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <Link
              to="/orders"
              className="px-3 py-2 rounded focus:outline-none focus:ring-2 hover:bg-primary-hover"
            >
              Orders
            </Link>
            <Link
              to="/tasks"
              className="px-3 py-2 rounded focus:outline-none focus:ring-2 hover:bg-primary-hover"
            >
              Warehouse Tasks
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              aria-label="Open menu"
              className="p-2 rounded focus:outline-none focus:ring-2 hover:bg-primary-hover"
              onClick={() => alert("Mobile menu placeholder")}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
