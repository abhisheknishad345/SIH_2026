import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

/* ---------- Small inline icons (no extra dependency needed) ---------- */
const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const SettingsIcon = ({ size = 28 }) => (
  <svg {...iconProps} width={size} height={size}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const AtIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
  </svg>
);

const LockIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg {...iconProps}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg {...iconProps}>
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg {...iconProps} width={18} height={18}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ShieldIcon = () => (
  <svg {...iconProps} width={14} height={14}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.37 12.63c-.03-2.82 2.3-4.18 2.4-4.24-1.31-1.91-3.34-2.17-4.06-2.2-1.73-.17-3.37 1.02-4.25 1.02-.88 0-2.23-.99-3.67-.96-1.89.03-3.63 1.1-4.6 2.79-1.96 3.4-.5 8.44 1.41 11.2.93 1.35 2.05 2.87 3.5 2.82 1.4-.06 1.93-.91 3.63-.91s2.17.91 3.65.88c1.51-.03 2.47-1.38 3.39-2.74 1.07-1.57 1.51-3.09 1.54-3.17-.03-.01-2.95-1.13-2.98-4.49zM13.6 4.37c.77-.94 1.29-2.24 1.15-3.54-1.11.05-2.46.74-3.25 1.68-.71.83-1.34 2.16-1.17 3.43 1.24.1 2.5-.63 3.27-1.57z" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z" />
  </svg>
);

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // UI-only state (not sent to the API)
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
    const res =   await api.get("/customers/profile");
   // console.log("Customer",res);
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

      const worker = response?.data?.worker;
    
      if (
        worker.verificationStatus === "approved" &&
        worker.isVerified === true
      ) {
        navigate("/worker/dashboard", { replace: true });
        return;
      }

      if (worker.verificationStatus === "pending") {
        navigate("/worker/profile-pending", { replace: true });
        return;
      }

      if (worker.verificationStatus === "rejected") {
        navigate("/worker/rejected", { replace: true });
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
      login(user);
      console.log("User Data",user);
      console.log("Email", user.emailVerified);
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
      console.error("Error",err?.response?.data);
      if (err?.response?.data?.message == "Please verify your email") {
         navigate("/verify-email", {
          state: { email: formData.email }
        })
        
      }

      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials"
      );
    } finally {
      setLoading(false);
      console.log("Final Execution Done !!");
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#070b1a] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Background glow */}

    

      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl sm:h-96 sm:w-96 lg:h-120 lg:w-120" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-64 w-64 rounded-full bg-blue-700/10 blur-3xl sm:h-80 sm:w-80" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center sm:max-w-md lg:max-w-md">
        {/* Logo + heading */}
        <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/15 text-indigo-300 shadow-lg shadow-indigo-900/40 sm:h-16 sm:w-16">
            <SettingsIcon />
          </div>

          <h1 className="text-2xl font-bold text-indigo-300 sm:text-3xl lg:text-4xl">
            TechConnect
          </h1>

          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-indigo-200/70 sm:text-xs">
            Cooperative Services Platform
          </p>
        </div>

        {/* Card */}
        <div className="w-full rounded-2xl border border-white/10 bg-white/4 p-5 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-7 lg:p-8">
          <h2 className="text-lg font-bold text-white sm:text-xl">
            Welcome Back
          </h2>

          <p className="mt-1 mb-5 text-xs text-gray-400 sm:mb-6 sm:text-sm">
            Sign in to securely access your cooperative portal
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-md text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-semibold text-gray-200 sm:text-sm"
              >
                Email Address
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <AtIcon />
                </span>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@cooperative.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/5 bg-white/6 py-3 pl-12 pr-4 text-sm text-white placeholder-gray-500
                             focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 sm:py-3.5 sm:text-base"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold text-gray-200 sm:text-sm"
              >
                Password
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <LockIcon />
                </span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-white/5 bg-white/6 py-3 pl-12 pr-12 text-sm text-white placeholder-gray-500
                             focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 sm:py-3.5 sm:text-base"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-300 sm:text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/10 accent-indigo-500"
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-blue-400 transition hover:text-blue-300 sm:text-sm"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white
                         shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-500 sm:py-3.5 sm:text-base
                         disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                "Logging in..."
              ) : (
                <>
                  Login <ArrowRightIcon />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3 sm:my-6">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] font-medium uppercase tracking-widest text-gray-500">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Social buttons (design only) */}
          <div className="grid grid-cols-2 gap-3">
            <button
            
              type="button"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <AppleIcon />
              Apple
            </button>

            <button
              type="button"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <GoogleIcon />
              Google
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400 sm:mt-8 sm:text-sm">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-blue-400 transition hover:text-blue-300 hover:underline"
          >
            Sign up
          </Link>
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[10px] text-gray-300 sm:text-xs">
          <span className="text-emerald-400">
            <ShieldIcon />
          </span>
          256-bit SSL secured &bull; Cooperative Network
        </div>
      </div>
    </div>
  );
}

export default Login;