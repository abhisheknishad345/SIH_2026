import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Users,
  UserCheck,
  UserX,
  Clock3,
  BriefcaseBusiness,
  CalendarDays,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Plus,
  ClipboardList,
  PlayCircle,
  Ban,
  Check,
} from "lucide-react";

import AdminSidebar from "../components/AdminSidebar";
import api from "../services/api";

const dashboardCards = [
  { title: "Total Workers", section: "workers", field: "total", icon: Users, color: "text-indigo-600", bg: "bg-indigo-100" },
  { title: "Approved Workers", section: "workers", field: "approved", icon: UserCheck, color: "text-green-600", bg: "bg-green-100", path: "/cooperative-admin/workers/approved" },
  { title: "Pending Workers", section: "workers", field: "pending", icon: Clock3, color: "text-amber-600", bg: "bg-amber-100", path: "/cooperative-admin/workers/pending" },
  { title: "Rejected Workers", section: "workers", field: "rejected", icon: UserX, color: "text-red-600", bg: "bg-red-100", path: "/cooperative-admin/workers/rejected" },
  { title: "Total Services", section: "services", field: "total", icon: BriefcaseBusiness, color: "text-purple-600", bg: "bg-purple-100" },
  { title: "Active Services", section: "services", field: "active", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
  { title: "Total Bookings", section: "bookings", field: "total", icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-100" },
];

const bookingStats = [
  { label: "Pending", field: "pending", icon: Clock3, tone: "text-amber-700 bg-amber-50 border-amber-100" },
  { label: "Accepted", field: "accepted", icon: CheckCircle2, tone: "text-sky-700 bg-sky-50 border-sky-100" },
  { label: "In Progress", field: "inProgress", icon: PlayCircle, tone: "text-indigo-700 bg-indigo-50 border-indigo-100" },
  { label: "Completed", field: "completed", icon: Check, tone: "text-emerald-700 bg-emerald-50 border-emerald-100" },
  { label: "Rejected", field: "rejected", icon: X, tone: "text-red-700 bg-red-50 border-red-100" },
  { label: "Cancelled", field: "cancelled", icon: Ban, tone: "text-slate-700 bg-slate-100 border-slate-200" },
];

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [serviceError, setServiceError] = useState("");
  const [serviceSuccess, setServiceSuccess] = useState("");
  const [serviceForm, setServiceForm] = useState({ name: "", category: "", description: "" });

  const fetchDashboardStats = useCallback(async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError("");
      const response = await api.get("/cooperative-admins/dashboard/stats");
      setStats(response.data.stats);
    } catch (err) {
      console.error("Dashboard stats error:", err);
      setError(err.response?.data?.message || "Unable to load dashboard statistics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handleCreateService = async (event) => {
    event.preventDefault();
    setSavingService(true);
    setServiceError("");
    setServiceSuccess("");
    try {
      await api.post("/services/create", {
        name: serviceForm.name.trim(),
        category: serviceForm.category.trim(),
        description: serviceForm.description.trim(),
      });
      setServiceSuccess("Service created successfully.");
      setServiceForm({ name: "", category: "", description: "" });
      await fetchDashboardStats(true);
      setShowServiceForm(false);
      setServiceSuccess("Service created successfully.");
    } catch (err) {
      setServiceError(err.response?.data?.message || "Unable to create service.");
    } finally {
      setSavingService(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800">
      <AdminSidebar />
      <main className="min-h-screen p-4 pt-20 sm:p-6 sm:pt-20 lg:ml-64 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-gray-600 bg-gray-900 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Cooperative Admin Dashboard</h1>
              <p className="mt-2 text-sm text-gray-300">Manage your cooperative, services and bookings</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => { setShowServiceForm(true); setServiceError(""); setServiceSuccess(""); }}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Plus size={18} /> Create Service
              </button>
              <button
                type="button"
                onClick={() => fetchDashboardStats(true)}
                disabled={loading || refreshing}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-600 bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
              >
                <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </header>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-400/40 bg-red-950/40 p-4 text-sm text-red-200">
              <AlertCircle size={20} className="shrink-0" /> {error}
            </div>
          )}

          {serviceSuccess && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
              <CheckCircle2 size={19} /> {serviceSuccess}
              <button type="button" onClick={() => setServiceSuccess("")} className="ml-auto"><X size={17} /></button>
            </div>
          )}

          <div className="mb-4">
            <h2 className="text-xl font-bold text-white">Overview Statistics</h2>
            <p className="mt-1 text-sm text-gray-400">Live counts for your cooperative</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {dashboardCards.map((card) => {
              const Icon = card.icon;
              const value = stats?.[card.section]?.[card.field];
              return (
                <div key={card.title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className={"flex h-12 w-12 items-center justify-center rounded-xl " + card.bg + " " + card.color}>
                      <Icon size={25} />
                    </div>
                    {card.path && <a href={card.path} className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-indigo-600" aria-label={"View " + card.title}><ArrowRight size={20} /></a>}
                  </div>
                  <p className="mt-5 text-sm font-semibold text-gray-600">{card.title}</p>
                  {loading ? <div className="mt-3 h-10 w-24 animate-pulse rounded-lg bg-gray-200" /> : <p className={"mt-2 text-4xl font-bold " + card.color}>{value ?? "—"}</p>}
                </div>
              );
            })}
          </div>

          <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <CalendarDays className="text-blue-600" size={25} />
              <div>
                <h2 className="text-lg font-bold text-gray-900">Booking Status Overview</h2>
                <p className="text-xs text-gray-500">Status-wise booking count</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              {bookingStats.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.field} className={"rounded-xl border p-4 " + item.tone}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold">{item.label}</span>
                      <Icon size={17} />
                    </div>
                    <p className="mt-3 text-2xl font-extrabold">{loading ? "…" : stats?.bookings?.[item.field] ?? "—"}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <BriefcaseBusiness className="text-purple-600" size={25} />
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Service Catalogue</h2>
                  <p className="text-xs text-gray-500">Manage services offered by your cooperative</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowServiceForm(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700">
                <Plus size={17} /> Add New Service
              </button>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-purple-50 p-4"><p className="text-sm font-medium text-purple-700">Total Services</p><p className="mt-1 text-2xl font-extrabold text-purple-900">{loading ? "…" : stats?.services?.total ?? "—"}</p></div>
              <div className="rounded-xl bg-emerald-50 p-4"><p className="text-sm font-medium text-emerald-700">Active Services</p><p className="mt-1 text-2xl font-extrabold text-emerald-900">{loading ? "…" : stats?.services?.active ?? "—"}</p></div>
              <div className="rounded-xl bg-slate-100 p-4"><p className="text-sm font-medium text-slate-600">Inactive Services</p><p className="mt-1 text-2xl font-extrabold text-slate-900">{loading ? "…" : stats?.services ? stats.services.total - stats.services.active : "—"}</p></div>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 text-xl font-bold text-white">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { label: "Review Pending Workers", path: "/cooperative-admin/workers/pending", icon: Clock3 },
                { label: "View Approved Workers", path: "/cooperative-admin/workers/approved", icon: UserCheck },
                { label: "View Rejected Workers", path: "/cooperative-admin/workers/rejected", icon: UserX },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <a key={action.path} href={action.path} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 font-semibold text-gray-800 transition hover:bg-indigo-50">
                    <span className="flex items-center gap-3"><Icon size={21} className="text-indigo-600" />{action.label}</span>
                    <ArrowRight size={18} />
                  </a>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {showServiceForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Create New Service</h2>
                <p className="mt-1 text-sm text-slate-500">Add a service to your cooperative catalogue.</p>
              </div>
              <button type="button" onClick={() => setShowServiceForm(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateService} className="space-y-4 p-5 sm:p-6">
              {serviceError && <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={17} className="mt-0.5 shrink-0" />{serviceError}</div>}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Service Name <span className="text-red-500">*</span></label>
                <input required minLength={2} maxLength={100} value={serviceForm.name} onChange={(e) => setServiceForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Electrical Repair" className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 text-black" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Category <span className="text-red-500">*</span></label>
                <input required minLength={2} maxLength={100} value={serviceForm.category} onChange={(e) => setServiceForm((p) => ({ ...p, category: e.target.value }))} placeholder="e.g. Electrical" className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 text-black" />
                <p className="mt-1 text-xs text-slate-400">Workers use this category to find and select relevant services.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Description <span className="font-normal text-slate-400">(Optional)</span></label>
                <textarea rows={3} maxLength={500} value={serviceForm.description} onChange={(e) => setServiceForm((p) => ({ ...p, description: e.target.value }))} placeholder="Briefly describe this service..." className="w-full resize-y rounded-xl border border-slate-300 px-3.5 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 text-black" />
              </div>
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setShowServiceForm(false)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={savingService} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {savingService ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={17} />}
                  {savingService ? "Creating..." : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
