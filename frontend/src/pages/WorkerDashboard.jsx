import api from "../services/api"
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Wallet,
  UserRound,
  Settings,
  LogOut,
  Bell,
  CheckCircle2,
  Clock3,
  BriefcaseBusiness,
  IndianRupee,
  TrendingUp,
  Menu,
  X,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";


const navigation = [
  { label: "Dashboard", path: "/worker/dashboard", icon: LayoutDashboard, active: true },
  { label: "My Bookings", path: "/worker/bookings", icon: CalendarDays },
  { label: "Earnings", path: "/worker/earning", icon: Wallet },
  { label: "My Profile", path: "/worker/profile", icon: UserRound },
  { label: "Settings", icon: Settings },
];


const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <div className="rounded-2xl border-2 border-mist-500 bg-white p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-700">{title}</p>
        <h3 className="mt-3 text-2xl font-bold text-slate-900">
          {value}
        </h3>
        <p className="mt-2 text-[12px] capitalize text-slate-800">{subtitle}</p>
      </div>

      <div className={`rounded-xl p-3 ${color}`}>
        <Icon size={21} />
      </div>
    </div>
  </div>
);

const EarningsCard = ({ title, amount, bookings, highlighted = false }) => (
  <div
    className={`rounded-2xl border p-5 ${
      highlighted
        ? "border-emerald-200 bg-emerald-50"
        : "border-slate-200 bg-white"
    }`}
  >
    <p className="text-sm font-medium text-slate-500">{title}</p>

    <h3 className="mt-3 text-2xl font-bold text-slate-900">
      {formatCurrency(amount)}
    </h3>

    <p className="mt-2 text-sm capitalize text-slate-500">
      {bookings} completed bookings
    </p>
  </div>
);

export default function WorkerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const checkWorkerProfile = async () => {
      try {
        const response = await api.get("/workers/profile");

        const worker = response.data.worker;

        if (worker.verificationStatus === "pending") {
          navigate("/worker/profile-pending", {
            replace: true,
          });
          return;
        }

        if (worker.verificationStatus === "rejected") {
          navigate("/worker/edit-profile", {
            replace: true,
          });
          return;
        }

        if (
          worker.verificationStatus !== "approved" ||
          worker.isVerified !== true
        ) {
          navigate("/worker/profile-pending", {
            replace: true,
          });
          return;
        }

        // Approved → normal dashboard API calls
        // fetchBookings();

      } catch (err) {
        if (err.response?.status === 404) {
          navigate("/worker/create-profile", {
            replace: true,
          });
        }
      }
    };

    checkWorkerProfile();
  }, [navigate]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

  const [dashboardResponse, earningsResponse] = await Promise.all([
    api.get("/bookings/worker/dashboard", {
      withCredentials: true,
    }),

    api.get("/bookings/worker/earnings", {
      withCredentials: true,
    }),
  ]);

  const dashboardResult = dashboardResponse.data;
  const earningsResult = earningsResponse.data;

  setDashboard(dashboardResult?.data);
  setEarnings(earningsResult?.data);

} catch (err) {
  setError(
    err.response?.data?.message ||
    err.message ||
    "Something went wrong"
  );
} finally {
  setLoading(false);
  }
},
    []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const dashboardStats = [
    {
      title: "Total Bookings",
      value: dashboard?.totalBookings ?? 0,
      subtitle: "All booking requests",
      icon: BriefcaseBusiness,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending Requests",
      value: dashboard?.pendingBookings ?? 0,
      subtitle: "Waiting for your response",
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Active Bookings",
      value: dashboard?.activeBookings ?? 0,
      subtitle: "Currently accepted",
      icon: CalendarDays,
      color: "bg-violet-50 text-violet-600",
    },
    {
      title: "Completed",
      value: dashboard?.completedBookings ?? 0,
      subtitle: "Successfully completed",
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw
            className="mx-auto animate-spin text-emerald-600"
            size={32}
          />
          <p className="mt-3 capitalize text-md font-semibold text-slate-700">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto text-red-500" size={36} />

          <h2 className="mt-4 text-lg capitalize font-semibold text-slate-900">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">{error}</p>

          <button
            onClick={fetchDashboardData}
            className="mt-5 rounded-xl cursor-pointer bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 text-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r-2 border-mist-500 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b-2 border-mist-500 px-6">
          <div>
            <h1 className="text-2xl font-extrabold text-emerald-700">
              TechConnect
            </h1>
            <p className="text-sm font-mono text-black">Worker Portal</p>
          </div>

          <button
            className="lg:hidden cursor-pointer"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        <div className="px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setSidebarOpen(false);
                    // Connect your React Router navigation here.
                    navigate(item.path)
                  }}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    item.active
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  <Icon size={19} />
                  {item.label}
                  {item.active && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-emerald-600" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t-2 border-mist-500 p-4">
          <button
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 hover:bg-red-100 hover:text-red-600 cursor-pointer"
            onClick={handleLogout}
              // Connect your existing logout function here.
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-h-screen lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b-2 border-emerald-500 bg-white/90 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg cursor-pointer p-2 hover:bg-slate-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Dashboard
              </h2>
              <p className="hidden text-md text-slate-500 sm:block">
                Manage your services and earnings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="rounded-xl cursor-pointer border-2 border-gray-500 p-2.5 text-slate-500 hover:bg-slate-50"
              title="Refresh dashboard"
            >
              <RefreshCw size={18} />
            </button>

            <button
              className="relative rounded-xl cursor-pointer border-2 border-gray-500 p-2.5 text-slate-500 hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
              W
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-8">
          {/* Welcome */}
          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome back, Worker!
                </h1>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <ShieldCheck size={20} />
                  Verified
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Here's what's happening with your services today.
              </p>
            </div>

            <button
              onClick={fetchDashboardData}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 cursor-pointer"
            >
              <RefreshCw size={16} />
              Refresh Data
            </button>
          </section>

          {/* Booking statistics */}
          <section className="">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Booking Overview</h2>
            </div>

            <div className=" grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {dashboardStats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </div>
          </section>

          {/* Earnings */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Earnings Overview</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your earnings from completed bookings
                </p>
              </div>

              <Wallet className="text-emerald-600" size={22} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-emerald-700 p-5 text-white shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-emerald-100">
                    Lifetime Earnings
                  </p>
                  <IndianRupee size={20} className="text-emerald-100" />
                </div>

                <h3 className="mt-4 text-3xl font-bold">
                  {formatCurrency(
                    earnings?.lifetime?.totalEarnings ??
                      dashboard?.totalEarnings ??
                      0
                  )}
                </h3>

                <p className="mt-2 text-sm text-emerald-100">
                  {earnings?.lifetime?.completedBookings ??
                    dashboard?.completedBookings ??
                    0}{" "}
                  Completed Bookings
                </p>
              </div>

              <EarningsCard
                title="This Month"
                amount={earnings?.currentMonth?.earnings ?? 0}
                bookings={earnings?.currentMonth?.bookings ?? 0}
                highlighted
              />

              <EarningsCard
                title="Previous Month"
                amount={earnings?.previousMonth?.earnings ?? 0}
                bookings={earnings?.previousMonth?.bookings ?? 0}
              />
            </div>
          </section>

          {/* Activity */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border-2 border-green-500 bg-neutral-100 p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Your Performance</h2>
                  <p className="mt-1 text-[15px] text-slate-500">
                    Overview of your completed work
                  </p>
                </div>

                <TrendingUp className="text-emerald-600" size={22} />
              </div>

              <div className="mt-8 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[15px] text-slate-500">
                    Completed Bookings
                  </p>
                  <p className="mt-2 text-3xl font-bold">
                    {dashboard?.completedBookings ?? 0}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-4 text-emerald-700">
                  <CheckCircle2 size={26} />
                </div>
              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${
                      dashboard?.totalBookings
                        ? Math.min(
                            100,
                            (dashboard.completedBookings /
                              dashboard.totalBookings) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>

              <p className="mt-3 text-[15px] text-slate-500">
                Completed bookings compared with all booking requests.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-green-500 bg-neutral-100 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Quick Summary</h2>
                <ArrowUpRight className="text-slate-400" size={20} />
              </div>

              <div className="mt-6 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Pending requests
                  </span>
                  <span className="font-semibold">
                    {dashboard?.pendingBookings ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Active bookings
                  </span>
                  <span className="font-semibold">
                    {dashboard?.activeBookings ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Lifetime earnings
                  </span>
                  <span className="font-semibold text-emerald-700">
                    {formatCurrency(
                      earnings?.lifetime?.totalEarnings ??
                        dashboard?.totalEarnings ??
                        0
                    )}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t-2 font-mono border-mist-500 pt-5 text-center text-sm text-slate-700">
            TechCoonect Worker Portal - Empowering Workers
          </footer>
        </div>
      </main>
    </div>
  );
}
