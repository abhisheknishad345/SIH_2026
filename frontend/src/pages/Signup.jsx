import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Network,
  Wrench,
} from "lucide-react";
import api from "../services/api";

/* lucide-react has no brand logos, so these two are inline SVGs */
const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.37 12.63c-.03-2.82 2.3-4.18 2.4-4.24-1.31-1.91-3.34-2.17-4.06-2.2-1.73-.17-3.37 1.02-4.25 1.02-.88 0-2.23-.99-3.67-.96-1.89.03-3.63 1.1-4.6 2.79-1.96 3.4-.5 8.44 1.41 11.2.93 1.35 2.05 2.87 3.5 2.82 1.4-.06 1.93-.91 3.63-.91s2.17.91 3.65.88c1.51-.03 2.47-1.38 3.39-2.74 1.07-1.57 1.51-3.09 1.54-3.17-.03-.01-2.95-1.13-2.98-4.49zM13.6 4.37c.77-.94 1.29-2.24 1.15-3.54-1.11.05-2.46.74-3.25 1.68-.71.83-1.34 2.16-1.17 3.43 1.24.1 2.5-.63 3.27-1.57z" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path
      fill="#EA4335"
      d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z"
    />
  </svg>
);

/* Password strength (0 - 4) - UI only */
const getStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return password.length === 0 ? 0 : Math.max(score, 1);
};

const STRENGTH_META = {
  0: { label: "", color: "" },
  1: { label: "Weak", color: "bg-red-500", text: "text-red-400" },
  2: { label: "Fair", color: "bg-orange-400", text: "text-orange-400" },
  3: { label: "Good", color: "bg-emerald-500", text: "text-emerald-400" },
  4: { label: "Strong", color: "bg-emerald-400", text: "text-emerald-300" },
};

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "customer",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // UI-only state (not sent to the API)
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const strength = getStrength(formData.password);
  const strengthMeta = STRENGTH_META[strength];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/signup", formData, {
        withCredentials: true,
      });

      console.log(response.data);

      setSuccess("Account created successfully! Please verify your email.");

      setTimeout(() => {
        navigate("/verify-email", {
          state: { email: formData.email },
        });
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/5 bg-white/[0.06] py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 " +
    "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 sm:py-3.5 sm:text-base";

  const labelClass =
    "mb-2 block text-xs font-semibold text-gray-200 sm:text-sm";

  const leftIconClass =
    "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400";

  const RoleIcon = formData.role === "worker" ? Wrench : User;

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#070b1a] px-4 py-8 sm:px-6 lg:px-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl sm:h-96 sm:w-96 lg:h-[30rem] lg:w-[30rem]" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-64 w-64 rounded-full bg-purple-700/10 blur-3xl sm:h-80 sm:w-80" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center sm:max-w-md lg:max-w-[28rem]">
        {/* Logo + heading */}
        <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-500/15 text-indigo-300 shadow-lg shadow-indigo-900/40 sm:h-16 sm:w-16">
            <Network size={28} />
          </div>

          <h1 className="bg-gradient-to-r from-indigo-300 to-purple-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            TechConnect
          </h1>

          <p className="mt-1 text-sm font-semibold text-white sm:text-base">
            Create your account
          </p>

          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-indigo-200/70 sm:text-xs">
            Cooperative Services Platform
          </p>
        </div>

        {/* Card */}
        <div className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-7 lg:p-8">
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Full name */}
            <div>
              <label htmlFor="fullName" className={labelClass}>
                Full Name
              </label>

              <div className="relative">
                <span className={leftIconClass}>
                  <User size={18} />
                </span>

                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>

              <div className="relative">
                <span className={leftIconClass}>
                  <AtSign size={18} />
                </span>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Password + strength meter */}
            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>

              <div className="relative">
                <span className={leftIconClass}>
                  <Lock size={18} />
                </span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={`${inputClass} pr-12`}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4 text-gray-400 transition hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="grid flex-1 grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={`h-1 rounded-full transition-colors ${
                        bar <= strength ? strengthMeta.color : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>

                <span
                  className={`min-w-[2.5rem] text-right text-[11px] font-semibold ${
                    strengthMeta.text || ""
                  }`}
                >
                  {strengthMeta.label}
                </span>
              </div>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className={labelClass}>
                Register as
              </label>

              <div className="relative">
                <span className={leftIconClass}>
                  <RoleIcon size={18} />
                </span>

                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`${inputClass} cursor-pointer appearance-none pr-11`}
                >
                  <option value="customer" className="bg-gray-900">
                    Customer
                  </option>
                  <option value="worker" className="bg-gray-900">
                    Worker
                  </option>
                </select>

                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">
                  <ChevronDown size={18} />
                </span>
              </div>
            </div>

            {/* Terms */}
            <label className="flex cursor-pointer items-start gap-2.5 text-xs text-gray-300 sm:text-sm">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-white/20 bg-white/10 accent-indigo-500"
                required
              />
              <span>
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="font-semibold text-indigo-300 underline-offset-2 hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="font-semibold text-indigo-300 underline-offset-2 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white
                         shadow-lg shadow-indigo-900/40 transition hover:from-indigo-500 hover:to-purple-500 sm:py-3.5 sm:text-base
                         disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                "Creating Account..."
              ) : (
                <>
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3 sm:my-6">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] font-medium uppercase tracking-widest text-gray-500">
              Or sign up with
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Social buttons (design only) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.06] py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <AppleIcon />
              Apple
            </button>

            <button
              type="button"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.06] py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <GoogleIcon />
              Google
            </button>
          </div>

          <p className="mt-5 text-center text-xs text-gray-400 sm:mt-6 sm:text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-indigo-300 transition hover:text-indigo-200 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col items-center gap-1 text-center text-[10px] text-gray-500 sm:mt-8 sm:text-xs">
          <span className="flex items-center gap-1.5 text-gray-400">
            <ShieldCheck size={13} className="text-emerald-400" />
            256-bit SSL secured &bull; Cooperative Network
          </span>
          <span>
            TechConnect Ecosystem &copy; {new Date().getFullYear()}. All rights
            reserved.
          </span>
        </div>
      </div>
    </div>
  );
}

export default Signup;