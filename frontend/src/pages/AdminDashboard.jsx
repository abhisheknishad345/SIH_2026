
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";

import AdminSidebar from "../components/AdminSidebar";
import api from "../services/api";

const dashboardCards = [
  {
    title: "Total Workers",
    section: "workers",
    field: "total",
    icon: Users,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    path: null,
  },
  {
    title: "Approved Workers",
    section: "workers",
    field: "approved",
    icon: UserCheck,
    color: "text-green-600",
    bg: "bg-green-100",
    path: "/cooperative-admin/workers/approved",
  },
  {
    title: "Pending Workers",
    section: "workers",
    field: "pending",
    icon: Clock3,
    color: "text-amber-600",
    bg: "bg-amber-100",
    path: "/cooperative-admin/workers/pending",
  },
  {
    title: "Rejected Workers",
    section: "workers",
    field: "rejected",
    icon: UserX,
    color: "text-red-600",
    bg: "bg-red-100",
    path: "/cooperative-admin/workers/rejected",
  },
  {
    title: "Total Services",
    section: "services",
    field: "total",
    icon: BriefcaseBusiness,
    color: "text-purple-600",
    bg: "bg-purple-100",
    path: "/cooperative-admin/services",
  },
  {
    title: "Total Bookings",
    section: "bookings",
    field: "total",
    icon: CalendarDays,
    color: "text-blue-600",
    bg: "bg-blue-100",
    path: "/cooperative-admin/bookings",
  },
];

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboardStats = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get(
        "/cooperative-admins/dashboard/stats"
      );

      setStats(response.data.stats);
    } catch (err) {
      console.error("Dashboard stats error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return (
    <div className="min-h-screen bg-gray-800">
      <AdminSidebar />

      <main className="min-h-screen p-4 pt-20 sm:p-6 sm:pt-20 lg:ml-64 lg:p-8">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-gray-600 bg-gray-900 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Cooperative Admin Dashboard
              </h1>

              <p className="mt-2 text-sm text-gray-300">
                Manage your cooperative and monitor its performance
              </p>
            </div>

            <button
              onClick={() => fetchDashboardStats(true)}
              disabled={loading || refreshing}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-400/40 bg-red-950/40 p-4 text-sm text-red-200">
              <AlertCircle size={20} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Statistics */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white">
              Overview Statistics
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Live statistics from your cooperative
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {dashboardCards.map((card) => {
              const Icon = card.icon;
              const value = stats?.[card.section]?.[card.field];

              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} ${card.color}`}
                    >
                      <Icon size={26} />
                    </div>

                    {card.path && (
                      <button
                        onClick={() => navigate(card.path)}
                        className="cursor-pointer rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-indigo-600"
                        aria-label={`View ${card.title}`}
                      >
                        <ArrowRight size={20} />
                      </button>
                    )}
                  </div>

                  <p className="mt-5 text-sm font-semibold text-gray-600">
                    {card.title}
                  </p>

                  {loading ? (
                    <div className="mt-3 h-10 w-24 animate-pulse rounded-lg bg-gray-200" />
                  ) : (
                    <p className={`mt-2 text-4xl font-bold ${card.color}`}>
                      {value ?? "—"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Additional Booking & Service Statistics */}
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <CalendarDays className="text-blue-600" size={26} />
                <h2 className="text-lg font-bold text-gray-900">
                  Booking Overview
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    label: "Total Bookings",
                    value: stats?.bookings?.total,
                  },
                  {
                    label: "Pending Bookings",
                    value: stats?.bookings?.pending,
                  },
                  {
                    label: "Completed Bookings",
                    value: stats?.bookings?.completed,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl bg-gray-100 px-4 py-3"
                  >
                    <span className="font-medium text-gray-700">
                      {item.label}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {loading ? "..." : item.value ?? "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <BriefcaseBusiness
                  className="text-purple-600"
                  size={26}
                />
                <h2 className="text-lg font-bold text-gray-900">
                  Services Overview
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    label: "Total Services",
                    value: stats?.services?.total,
                  },
                  {
                    label: "Active Services",
                    value: stats?.services?.active,
                  },
                  {
                    label: "Inactive Services",
                    value:
                      stats?.services
                        ? stats.services.total - stats.services.active
                        : undefined,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl bg-gray-100 px-4 py-3"
                  >
                    <span className="font-medium text-gray-700">
                      {item.label}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {loading ? "..." : item.value ?? "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-bold text-white">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                {
                  label: "Review Pending Workers",
                  path: "/cooperative-admin/workers/pending",
                  icon: Clock3,
                },
                {
                  label: "View Approved Workers",
                  path: "/cooperative-admin/workers/approved",
                  icon: UserCheck,
                },
                {
                  label: "View Rejected Workers",
                  path: "/cooperative-admin/workers/rejected",
                  icon: UserX,
                },
              ].map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left font-semibold text-gray-800 transition hover:bg-indigo-50"
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={21} className="text-indigo-600" />
                      {action.label}
                    </span>
                    <ArrowRight size={18} />
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
