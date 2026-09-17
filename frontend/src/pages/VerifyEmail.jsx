import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/verify-email", {
        email,
        otp,
      });

      console.log(response.data);

      setSuccess("Email verified successfully! You can now login.");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid or expired OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-7 sm:p-9">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-700">
            TechConnect
          </h1>

          <p className="text-gray-500 mt-2">
            Verify your email
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 p-3 rounded-lg bg-green-50 text-green-600 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Verification OTP
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength="6"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ""))
              }
              placeholder="Enter 6-digit OTP"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl
                         text-center text-xl tracking-[0.4em]
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-semibold
                       rounded-xl hover:bg-indigo-700 transition
                       disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default VerifyEmail;