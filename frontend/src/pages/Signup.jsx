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
    <main className="min-h-screen bg-[#080b0a] text-zinc-100 lg:grid lg:grid-cols-2">
      {/* Form first: on mobile it stays above the image */}
      <section className="relative order-1 flex flex-col justify-center px-5 py-8 sm:px-10 lg:min-h-screen lg:px-14 lg:py-10 xl:px-20">
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="relative mx-auto w-full max-w-md">
          <Link to="/" className="mb-7 inline-flex items-center gap-3 sm:mb-9">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-lime-300 text-black shadow-lg shadow-lime-300/10">
              <Network size={23} />
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              Tech<span className="text-lime-300">Connect</span>
            </span>
          </Link>

          <div className="mb-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-[.22em] text-lime-300">JOIN THE COMMUNITY</p>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Create your account</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Get connected with skilled professionals and local services.</p>
          </div>

          {error && (
            <div role="alert" className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</div>
          )}
          {success && (
            <div role="status" className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-zinc-200">Full name</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500"><User size={18} /></span>
                <input id="fullName" type="text" name="fullName" placeholder="Enter your full name" value={formData.fullName} onChange={handleChange} autoComplete="name" required className="w-full rounded-xl border border-white/10 bg-[#151b17] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300/60 focus:ring-2 focus:ring-lime-300/10" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-200">Email address</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500"><AtSign size={18} /></span>
                <input id="email" type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} autoComplete="email" required className="w-full rounded-xl border border-white/10 bg-[#151b17] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300/60 focus:ring-2 focus:ring-lime-300/10" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-200">Password</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500"><Lock size={18} /></span>
                <input id="password" type={showPassword ? "text" : "password"} name="password" placeholder="Create a password" value={formData.password} onChange={handleChange} autoComplete="new-password" required className="w-full rounded-xl border border-white/10 bg-[#151b17] py-3 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300/60 focus:ring-2 focus:ring-lime-300/10" />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 transition hover:text-lime-300">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="mt-2.5 flex items-center gap-3">
                <div className="grid flex-1 grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((bar) => <div key={bar} className={`h-1 rounded-full transition-colors ${bar <= strength ? strengthMeta.color : "bg-white/10"}`} />)}
                </div>
                <span className={`min-w-[2.5rem] text-right text-[11px] font-semibold ${strengthMeta.text || ""}`}>{strengthMeta.label}</span>
              </div>
            </div>

            <div>
              <label htmlFor="role" className="mb-2 block text-sm font-medium text-zinc-200">Register as</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500"><RoleIcon size={18} /></span>
                <select id="role" name="role" value={formData.role} onChange={handleChange} className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-[#151b17] py-3 pl-11 pr-11 text-sm text-white outline-none transition focus:border-lime-300/60 focus:ring-2 focus:ring-lime-300/10">
                  <option value="customer" className="bg-[#151b17]">Customer</option>
                  <option value="worker" className="bg-[#151b17]">Worker</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500"><ChevronDown size={18} /></span>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-zinc-400">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-white/20 bg-[#151b17] accent-lime-300" required />
              <span>I agree to the <Link to="/terms" className="font-semibold text-lime-300 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="font-semibold text-lime-300 hover:underline">Privacy Policy</Link>.</span>
            </label>

            <button type="submit" disabled={loading} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-lime-300 py-3.5 text-sm font-bold text-black shadow-lg shadow-lime-300/10 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Creating account..." : <>Create account <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="my-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] font-semibold uppercase tracking-[.18em] text-lime-500">Or sign up with</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10"><AppleIcon /> Apple</button>
            <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10"><GoogleIcon /> Google</button>
          </div>

          <p className="mt-6 text-center text-md text-zinc-200">Already have an account? <Link to="/login" className="font-semibold text-lime-300 transition hover:text-lime-200">Log in</Link></p>
          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-zinc-300">
            <ShieldCheck size={14} className="text-lime-300" /> Secure Registration · Cooperative Network</div>
        </div>
      </section>

      {/* Landing-page style image panel: below form on mobile, beside it on desktop */}
      <section className="relative order-2 flex min-h-107 items-center justify-center overflow-hidden border-t border-white/10 bg-[#0d120f] p-5 sm:p-8 lg:min-h-screen lg:border-l lg:border-t-0 lg:p-8">
        <div className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative w-full max-w-2xl">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.22em] text-lime-300">LOCAL PROFESSIONALS</p>
              <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">Good help, right around the corner.</h2>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-2 text-xs font-semibold text-lime-200"><span className="h-2 w-2 rounded-full bg-lime-300" /> Discover</span>
          </div>

          <div className="group relative h-82 overflow-hidden rounded-3xl border border-white/10 bg-[#151d18] shadow-2xl shadow-black/40 sm:h-[430px] lg:h-[500px]">
            <img src="https://images.unsplash.com/photo-1705760058049-b58119c416a9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" alt="A skilled technician working on a home repair" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-linear-to-t from-[#080b0a] via-black/25 to-black/5" />
            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-2 text-[11px] font-medium text-white backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-lime-300" />
            Connecting Local Skills</div>
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[.22em] text-lime-300">HELP AROUND THE CORNER</p>
              <h3 className="mt-3 max-w-lg text-2xl font-bold leading-tight text-white sm:text-4xl">Skilled hands. Peace of mind.</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-zinc-200/80">Discover skilled professionals, explore their services and connect with your local community.</p>
              <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3">
                <div className="rounded-xl border border-white/15 bg-black/25 p-3 backdrop-blur-md"><p className="text-lg font-bold text-lime-300">01</p><p className="mt-1 text-[11px] text-zinc-200">Discover</p></div>
                <div className="rounded-xl border border-white/15 bg-black/25 p-3 backdrop-blur-md"><p className="text-lg font-bold text-lime-300">02</p><p className="mt-1 text-[11px] text-zinc-200">Connect</p></div>
                <div className="rounded-xl border border-white/15 bg-black/25 p-3 backdrop-blur-md"><p className="text-lg font-bold text-lime-300">03</p><p className="mt-1 text-[11px] text-zinc-200">Book</p></div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-sm capitalize text-zinc-300">Connecting local skills with everyday needs</p>
        </div>
      </section>
    </main>
  );
}

export default Signup;