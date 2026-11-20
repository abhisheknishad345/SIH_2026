import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, RefreshCw, AlertCircle, Clock3, CheckCircle2, XCircle, UserRound, BriefcaseBusiness, CreditCard } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import api from "../services/api";

const statuses = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" }
];

const statusStyle = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-sky-50 text-sky-700",
  in_progress: "bg-indigo-50 text-indigo-700",
  completed: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-slate-100 text-slate-600"
};

const pretty = (value = "") => value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
const dateTime = (value) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/cooperative-admins/bookings");
      setBookings(response.data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  const counts = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    accepted: bookings.filter((b) => b.status === "accepted").length,
    inProgress: bookings.filter((b) => b.status === "in_progress").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length
  }), [bookings]);

  const visibleBookings = filter === "all" ? bookings : bookings.filter((booking) => booking.status === filter);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="min-h-screen px-4 py-6 pt-20 sm:px-6 lg:ml-64 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Bookings</h1><p className="mt-1 text-sm text-slate-500">All service bookings made in your cooperative</p></div>
            <button onClick={loadBookings} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"><RefreshCw size={17} className={loading ? "animate-spin" : ""} /> Refresh</button>
          </header>

          {error && <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={18} />{error}</div>}

          <section className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
            {[
              ["Total", counts.total, "text-slate-900"],
              ["Pending", counts.pending, "text-amber-700"],
              ["Accepted", counts.accepted, "text-sky-700"],
              ["In Progress", counts.inProgress, "text-indigo-700"],
              ["Completed", counts.completed, "text-emerald-700"],
              ["Rejected", counts.rejected, "text-red-700"],
              ["Cancelled", counts.cancelled, "text-slate-600"]
            ].map(([label, value, color]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold text-slate-500">{label}</p><p className={"mt-2 text-2xl font-extrabold " + color}>{loading ? "…" : value}</p></div>)}
          </section>

          <div className="mb-5 flex flex-wrap gap-2">
            {statuses.map((item) => <button key={item.value} onClick={() => setFilter(item.value)} className={"rounded-full px-4 py-2 text-sm font-semibold transition " + (filter === item.value ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100")}>{item.label}</button>)}
          </div>

          {loading ? <div className="rounded-2xl bg-white p-10 text-center text-slate-500">Loading bookings...</div> :
            visibleBookings.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><CalendarDays className="mx-auto text-slate-300" size={42} /><h2 className="mt-3 font-bold text-slate-800">No bookings found</h2><p className="mt-1 text-sm text-slate-500">{filter === "all" ? "Bookings will appear here when customers book a service." : "No bookings match this status."}</p></div> :
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {visibleBookings.map((booking) => (
                <article key={booking._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Booking ID</p><p className="mt-1 break-all font-mono text-xs text-slate-600">{booking._id}</p></div>
                    <span className={"rounded-full px-3 py-1.5 text-xs font-bold " + (statusStyle[booking.status] || "bg-slate-100 text-slate-600")}>{pretty(booking.status)}</span>
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3"><p className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500"><UserRound size={15} /> Customer</p><p className="mt-2 font-bold text-slate-900">{booking.customerId?.fullName || "Unknown customer"}</p><p className="mt-0.5 break-all text-xs text-slate-500">{booking.customerId?.email || "—"}</p></div>
                    <div className="rounded-xl bg-slate-50 p-3"><p className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500"><UserRound size={15} /> Worker</p><p className="mt-2 font-bold text-slate-900">{booking.workerId?.fullName || "Unknown worker"}</p><p className="mt-0.5 break-all text-xs text-slate-500">{booking.workerId?.email || "—"}</p></div>
                  </div>
                  <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-700"><BriefcaseBusiness size={15} /> Service Details</p>
                    <p className="mt-2 font-bold text-slate-900">{booking.serviceId?.name || booking.skillName || "Service"}</p>
                    <p className="text-xs text-slate-500">{booking.serviceId?.category || "—"} · {booking.skillName || "—"}</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-slate-500">Scheduled</p><p className="mt-1 font-semibold text-slate-800">{dateTime(booking.scheduledAt)}</p></div><div><p className="text-xs text-slate-500">Duration / Quantity</p><p className="mt-1 font-semibold text-slate-800">{booking.priceType === "per_day" ? (booking.quantity + " day(s)") : (booking.quantity + " hour(s)")}</p></div></div>
                    <div className="mt-3"><p className="text-xs text-slate-500">Service Address</p><p className="mt-1 text-sm font-medium text-slate-800">{booking.address || "—"}</p></div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div><p className="text-xs text-slate-500">Booking Amount</p><p className="mt-1 text-lg font-extrabold text-slate-900">{booking.price == null ? "Price not finalized" : "₹" + Number(booking.price).toLocaleString("en-IN")}</p><p className="text-xs text-slate-500">{pretty(booking.priceType || "—")} · {pretty(booking.pricingStatus || "—")}</p></div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2"><p className="flex items-center gap-1 text-xs text-slate-500"><CreditCard size={14} /> Payment</p><p className="mt-1 text-sm font-bold text-slate-800">{pretty(booking.paymentStatus || "not_due")}</p></div>
                    <div className="w-full text-right text-xs text-slate-400">Created {dateTime(booking.createdAt)}</div>
                  </div>
                </article>
              ))}
            </div>
          }
        </div>
      </main>
    </div>
  );
}

export default AdminBookings;
