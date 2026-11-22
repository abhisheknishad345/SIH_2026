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
    <main className="min-h-screen bg-[#080b0a] text-zinc-100 lg:grid lg:grid-cols-2">
      {/* Left: login form */}
      <section className="relative flex min-h-screen flex-col justify-center px-5 py-8 sm:px-10 lg:px-14 xl:px-20">
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="relative mx-auto w-full max-w-md">
          <Link to="/" className="mb-10 inline-flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-lime-300 text-black shadow-lg shadow-lime-300/10">
              <SettingsIcon size={23} />
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              Tech<span className="text-lime-300">Connect</span>
            </span>
          </Link>

          <div className="mb-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[.22em] text-lime-300">WELCOME BACK</p>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Sign in to your account</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Access your cooperative portal and stay connected with your community.
            </p>
          </div>

          {error && (
            <div role="alert" className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-200">Email address</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500"><AtIcon /></span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#151b17] py-3.5 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300/60 focus:ring-2 focus:ring-lime-300/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-200">Password</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500"><LockIcon /></span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#151b17] py-3.5 pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300/60 focus:ring-2 focus:ring-lime-300/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 transition hover:text-lime-300"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-white/20 bg-[#151b17] accent-lime-300"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm font-semibold text-lime-300 transition hover:text-lime-200">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-lime-300 py-3.5 text-sm font-bold text-black shadow-lg shadow-lime-300/10 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : <>Sign in <ArrowRightIcon /></>}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] font-semibold uppercase tracking-[.18em] text-lime-500">Or continue with</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10">
              <AppleIcon /> Apple
            </button>
            <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10">
              <GoogleIcon /> Google
            </button>
          </div>

          <p className="mt-8 text-center text-md text-zinc-300">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-lime-300 transition hover:text-lime-200">Create account</Link>
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-300">
            <span className="text-lime-300"><ShieldIcon /></span>
            Secure Access · Cooperative Network
          </div>
        </div>
      </section>

      {/* Right: landing-page style visual panel */}
      <section className="relative min-h-screen overflow-hidden border-l border-white/10 bg-[#0d120f] p-5 lg:flex lg:items-center lg:justify-center xl:p-8">
        <div className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative w-full max-w-2xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.22em] text-lime-300">LOCAL PROFESSIONALS</p>
              <h2 className="mt-2 text-2xl font-bold text-white xl:text-3xl">Good help, right around the corner.</h2>
              <p className="mt-2 text-sm text-zinc-400">Discover skilled people in your community.</p>
            </div>
            <Link to="/signup" className="inline-flex shrink-0 items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-4 py-2.5 text-xs text-lime-300  transition hover:bg-lime-300/20">
              Get Started <ArrowRightIcon />
            </Link>
          </div>

          <div className="group relative h-107 overflow-hidden rounded-3xl border border-white/10 bg-[#151d18] shadow-2xl shadow-black/40 xl:h-130">
            <img
              src="https://images.unsplash.com/photo-1758101755915-462eddc23f57?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
              alt="A skilled technician working on a home repair"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#080b0a] via-black/25 to-black/5" />
            <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-2 text-xs font-medium text-white backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-lime-300" /> Connecting Local Skills
            </div>
            <div className="absolute inset-x-0 bottom-0 p-7 xl:p-9">
              <p className="text-xs font-bold uppercase tracking-[.22em] text-lime-300">HELP AROUND THE CORNER</p>
              <h3 className="mt-3 max-w-lg text-3xl font-bold leading-tight text-white xl:text-4xl">Skilled hands. Peace of mind.</h3>
              <p className="mt-4 max-w-md text-sm leading-6 text-zinc-200/80">
                Find trusted local professionals, explore their skills and book services with confidence.
              </p>
              <div className="mt-7 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/15 bg-black/25 p-3 backdrop-blur-md">
                  <p className="text-lg font-bold text-lime-300">01</p><p className="mt-1 text-[11px] text-zinc-200">Discover</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-black/25 p-3 backdrop-blur-md">
                  <p className="text-lg font-bold text-lime-300">02</p><p className="mt-1 text-[11px] text-zinc-200">Compare</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-black/25 p-3 backdrop-blur-md">
                  <p className="text-lg font-bold text-lime-300">03</p><p className="mt-1 text-[11px] text-zinc-200">Book</p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-zinc-200 capitalize">Connecting local skills with everyday needs</p>
        </div>
      </section>
    </main>
  );
}

export default Login;