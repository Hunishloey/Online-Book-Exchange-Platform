import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApiServices from "../../ApiServices";
import { BeatLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Rate limiter implementation
const createRateLimiter = (limit, interval) => {
  let attempts = [];

  return () => {
    const now = Date.now();
    attempts = attempts.filter(timestamp => now - timestamp < interval);

    if (attempts.length >= limit) {
      return false;
    }

    attempts.push(now);
    return true;
  };
};

// Create rate limiter: 3 attempts per 30 seconds
const loginRateLimiter = createRateLimiter(3, 30000);

export default function UserLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Check rate limit
    if (!loginRateLimiter()) {
      toast.error("Too many attempts. Please try again later.");
      return;
    }

    setLoading(true);

    try {
      const response = await ApiServices.Login(formData);

      if (!response.data.success) {
        throw new Error(response.data.message || "Login failed");
      }

      // Store authentication data
      sessionStorage.setItem("authToken", response.data.token);
      sessionStorage.setItem("userData", JSON.stringify(response.data.user));

      // Show success message
      toast.success(response.data.message || "Login successful! Redirecting...");

      // Redirect based on user type
      setTimeout(() => {
        if (response.data.user.userType === 1) {
          navigate("/admin");
        } else if (response.data.user.userType === 2) {
          navigate("/student");
        } else {
          navigate("/"); // Fallback for unknown user types
        }
      }, 500);
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "Login failed. Please try again.";
      if (error.response) {
        // Handle axios error response
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.message) {
        // Handle custom errors
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [formData, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-4">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Decorative header */}
          <div className="bg-gradient-to-r from-gray-800 to-rose-500 p-8 text-center">
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-rose-100 mt-2">Sign in to continue your journey</p>
          </div>
          {/* Form section */}
          <div className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none transition disabled:opacity-75"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none transition disabled:opacity-75"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-rose-500 focus:ring-rose-400 border-gray-300 rounded disabled:opacity-75"
                    disabled={loading}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-rose-500 hover:text-rose-600">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit button */}
              <div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-rose-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-400 shadow-md transition flex justify-center items-center disabled:opacity-75"
                  disabled={loading}
                >
                  {loading ? (
                    <BeatLoader color="#ffffff" size={10} />
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social login */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                className="bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-lg flex items-center justify-center transition disabled:opacity-50"
                disabled={loading}
              >
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-6 h-6" />
              </button>
              <button
                className="bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-lg flex items-center justify-center transition disabled:opacity-50"
                disabled={loading}
              >
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-6 h-6" />
              </button>
              <button
                className="bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-lg flex items-center justify-center transition disabled:opacity-50"
                disabled={loading}
              >
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-rose-500 hover:text-rose-600">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}