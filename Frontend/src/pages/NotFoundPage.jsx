import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import { Home, Search } from "lucide-react";

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-3 md:px-4 bg-linear-to-br from-gray-50 to-blue-50">
      <div className="text-center max-w-2xl mx-auto py-12">
        <div className="mb-6 md:mb-8">
          <h1 className="text-8xl md:text-9xl font-mono font-bold text-blue-600 mb-4 animate-pulse">
            404
          </h1>
          <div className="bg-gray-100 rounded-full p-4 md:p-6 inline-block mb-4 md:mb-6">
            <Search className="h-12 w-12 md:h-16 md:w-16 text-gray-400" />
          </div>
        </div>

        <h2 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-3 md:mb-4">
          Page Not Found
        </h2>
        <p className="text-sm md:text-lg text-gray-600 mb-6 md:mb-8 px-4 leading-relaxed">
          The page you are looking for does not exist or has been moved. Let's
          get you back on track!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
          <Link to="/" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto text-base md:text-lg py-6 md:py-3"
            >
              <Home className="h-5 w-5 mr-2" />
              Return to Home
            </Button>
          </Link>
          <Link to="/instructions" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-base md:text-lg py-6 md:py-3"
            >
              View Instructions
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
