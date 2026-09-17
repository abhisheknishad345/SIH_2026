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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);

      console.log("Login response:", response.data);

      const user = response.data.user;

      if (user.role === "customer") {
        try {
          await api.get("/customers/profile");
          navigate("/customer");
        } catch (profileError) {
          if (profileError.response?.status === 404) {
            navigate("/customer/create-profile");
          } else {
            navigate("/customer");
          }
        }
      } else if (user.role === "cooperative_admin") {
        navigate("/cooperative-admin");
      } else if (user.role === "super_admin") {
        navigate("/admin");
      } else if (user.role === "worker") {
        try {
          const response = await api.get("/workers/profile");
          
          const worker = response.data.worker;
          
          if (
            worker.verificationStatus === "approved" &&
            worker.isVerified === true
          ) {
            navigate("/worker", { replace: true });
          } else if (
            worker.verificationStatus === "rejected"
          ) {
            navigate("/worker/profile-pending", {
              replace: true,
            });
          } else if (worker.verificationStatus == "pending") {
            navigate("/worker/profile-pending")
 
          } 
           else {
            navigate("/worker/edit-profile", {
              replace: true,
            });
          }

        } catch (profileError) {

          if (profileError.response?.status === 404) {
            navigate("/worker/create-profile", {
              replace: true,
            });
          } else {
            setError(
              profileError.response?.data?.message ||
              "Unable to load worker profile."
            );
          }
        }
      }
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
            SEWA
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