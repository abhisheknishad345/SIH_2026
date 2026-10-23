import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ROLE_ROUTES = {
    customer: "/customer",
    cooperative_admin: "/cooperative-admin",
    super_admin: "/admin",
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Customer profile check
  const handleCustomerLogin = async () => {
    try {
      await api.get("/customers/profile");

      navigate("/customer", { replace: true });
    } catch (err) {
      if (err.response?.status === 404) {
        navigate("/customer/create-profile", { replace: true });
        return;
      }

      throw err;
    }
  };

  // Worker profile + verification check
  const handleWorkerLogin = async () => {
    try {
      const response = await api.get("/workers/profile");

      const worker = response.data.worker;

      if (
        worker.verificationStatus === "approved" &&
        worker.isVerified === true
      ) {
        navigate("/worker", { replace: true });
        return;
      }

      if (worker.verificationStatus === "pending") {
        navigate("/worker/profile-pending", { replace: true });
        return;
      }

      if (worker.verificationStatus === "rejected") {
        navigate("/worker/edit-profile", { replace: true });
        return;
      }

      // Fallback
      navigate("/worker/profile-pending", { replace: true });

    } catch (err) {
      if (err.response?.status === 404) {
        navigate("/worker/create-profile", { replace: true });
        return;
      }

      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);

      const user = response.data.user;

      // Customer
      if (user.role === "customer") {
        await handleCustomerLogin();
        return;
      }

      // Worker
      if (user.role === "worker") {
        await handleWorkerLogin();
        return;
      }

      // Admin / Super Admin
      const route = ROLE_ROUTES[user.role];

      if (route) {
        navigate(route, { replace: true });
        return;
      }

      // Unknown role
      setError("Invalid user role.");

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center px-4 ">
      <div className="w-full max-w-md bg-gray-900  rounded-2xl shadow-lg p-7 sm:p-9 border border-white ">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-700">
            TechConnect
          </h1>

          <p className="text-gray-300 mt-2">
            Cooperative Services Platform
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 text-red-600 text-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-white
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Password
            </label>

            <input
              type="text"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-white
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mt-2 text-right">
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-blue-400 hover:text-blue-700"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-semibold
                       rounded-xl hover:bg-indigo-700 transition cursor-pointer
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center text-sm text-gray-300 mt-7">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-400 font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;