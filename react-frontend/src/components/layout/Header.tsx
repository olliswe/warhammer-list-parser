import { Link } from "react-router-dom";
import InstallButton from "./InstallButton";

function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img
              src="/listbin.png"
              alt="ListBin"
              className="h-10 w-auto"
            />
          </Link>
          <nav className="flex items-center gap-4">
            <InstallButton />
            <Link
              to="/about"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;