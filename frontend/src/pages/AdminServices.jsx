import { useCallback, useEffect, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, XCircle, Plus, RefreshCw, AlertCircle } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import api from "../services/api";

function AdminServices() {
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ name: "", category: "", description: "" });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [serviceResponse, statsResponse] = await Promise.all([
        api.get("/cooperative-admins/services"),
        api.get("/cooperative-admins/dashboard/stats")
      ]);
      setServices(serviceResponse.data.services || []);
      setStats(statsResponse.data.stats?.services || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load services.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const createService = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setFormError("");
      await api.post("/services/create", {
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description.trim()
      });
      setForm({ name: "", category: "", description: "" });
      setShowForm(false);
      await loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || "Unable to create service.");
    } finally {
      setSaving(false);
    }
  };

  const activeCount = stats?.active ?? services.filter((item) => item.isActive).length;
  const inactiveCount = stats ? stats.total - stats.active : services.length - activeCount;

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="min-h-screen px-4 py-6 pt-20 sm:px-6 lg:ml-64 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Services</h1>
              <p className="mt-1 text-sm text-slate-500">Service catalogue for your cooperative</p>
            </div>
            <div className="flex gap-2">
              <button onClick={loadData} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60">
                <RefreshCw size={17} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
              <button onClick={() => { setFormError(""); setShowForm(true); }} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
                <Plus size={18} /> Create Service
              </button>
            </div>
          </header>

          {error && <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={18} />{error}</div>}

          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: "Total Services", value: stats?.total ?? services.length, icon: BriefcaseBusiness, style: "bg-indigo-50 text-indigo-700" },
              { label: "Active Services", value: activeCount, icon: CheckCircle2, style: "bg-emerald-50 text-emerald-700" },
              { label: "Inactive Services", value: inactiveCount, icon: XCircle, style: "bg-slate-200 text-slate-700" }
            ].map(({ label, value, icon: Icon, style }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-500">{label}</p><span className={"rounded-xl p-3 " + style}><Icon size={21} /></span></div>
                <p className="mt-3 text-3xl font-extrabold text-slate-900">{loading ? "…" : value}</p>
              </div>
            ))}
          </section>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Service Catalogue</h2>
            <span className="text-sm text-slate-500">{services.length} services</span>
          </div>

          {loading ? <div className="rounded-2xl bg-white p-10 text-center text-slate-500">Loading services...</div> :
            services.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><BriefcaseBusiness className="mx-auto text-slate-300" size={42} /><h3 className="mt-3 font-bold text-slate-800">No services created yet</h3><p className="mt-1 text-sm text-slate-500">Create your first service for workers to select.</p></div> :
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <article key={service._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><BriefcaseBusiness size={23} /></div>
                    <span className={"rounded-full px-3 py-1 text-xs font-bold " + (service.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")}>{service.isActive ? "Active" : "Inactive"}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{service.name}</h3>
                  <p className="mt-1 inline-flex rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{service.category}</p>
                  <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600">{service.description || "No description provided."}</p>
                  <div className="mt-5 border-t border-slate-100 pt-3 text-xs text-slate-400">Created {service.createdAt ? new Date(service.createdAt).toLocaleDateString("en-IN") : "—"}</div>
                </article>
              ))}
            </div>
          }
        </div>
      </main>

      {showForm && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4">
        <form onSubmit={createService} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-slate-900">Create Service</h2>
          <p className="mt-1 text-sm text-slate-500">Add a service to your cooperative catalogue.</p>
          {formError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
          <label className="mt-4 block text-sm font-semibold text-slate-700">Service Name</label>
          <input required minLength={2} maxLength={100} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500" placeholder="e.g. Electrical Repair" />
          <label className="mt-4 block text-sm font-semibold text-slate-700">Category</label>
          <input required minLength={2} maxLength={100} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500" placeholder="e.g. Electrical" />
          <label className="mt-4 block text-sm font-semibold text-slate-700">Description (optional)</label>
          <textarea rows={3} maxLength={500} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500" />
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button>
            <button disabled={saving} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving ? "Creating..." : "Create Service"}</button>
          </div>
        </form>
      </div>}
    </div>
  );
}

export default AdminServices;
