
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  MapPin,
  MapPinned,
  UserRound,
  CalendarDays,
  Clock3,
  IndianRupee,
  MessageCircle,
  CheckCircle2,
  XCircle,
  BriefcaseBusiness,
  CreditCard,
  LoaderCircle,
  CalendarClock,
  ClipboardList,
  Sparkles,
  Navigation,
  Wallet,
} from "lucide-react";

import api from "../services/api";

const filters = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in_progress" },
  { label: "Accepted", value: "accepted" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  accepted: {
    label: "Accepted",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  },
};

function formatDate(date) {
  if (!date) return "Not scheduled";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not scheduled";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function formatTime(date) {
  if (!date) return "Not specified";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not specified";
  }

  return parsedDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

function formatAmount(amount) {
  if (amount == null || amount === "") {
    return "Awaiting final price";
  }

  const number = Number(amount);

  if (!Number.isFinite(number)) {
    return "Awaiting final price";
  }

  return `₹${number.toLocaleString("en-IN")}`;
}

function WorkerBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  // Fetch bookings
  const fetchBookings = useCallback(async (showLoader = true) => {
    try {
      setError("");

      if (showLoader) {
        setLoading(true);
      }

      const response = await api.get("/bookings/worker");

      const bookingList =
        response.data?.bookings ||
        response.data?.data?.bookings ||
        [];

      const sortedBookings = [...bookingList].sort((a, b) => {
        const dateA = new Date(
          a.createdAt || a.scheduledAt || 0
        ).getTime();

        const dateB = new Date(
          b.createdAt || b.scheduledAt || 0
        ).getTime();

        return dateB - dateA;
      });

      setBookings(sortedBookings);
    } catch (err) {
      console.error("Fetch worker bookings error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load bookings."
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Update booking status
  const updateBookingStatus = async (bookingId, status) => {
    try {
      setActionLoading(bookingId);
      setError("");

      if (status === "completed") {
        await api.put(`/bookings/${bookingId}/complete`);
      } else {
        await api.put(`/bookings/${bookingId}/status`, {
          status,
        });
      }

      await fetchBookings(false);
    } catch (err) {
      console.error("Update booking status error:", err);

      setError(
        err.response?.data?.message ||
        `Unable to ${status} booking.`
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Mark service done
  const markServiceDone = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      setError("");

      await api.put(`/bookings/${bookingId}/service-done`);

      await fetchBookings(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to mark service as done."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Price type
  const getPriceType = (priceType) => {
    const types = {
      per_hour: "Per Hour",
      per_day: "Per Day",
      fixed: "Fixed Price",
      negotiable: "Negotiable",
    };

    return types[priceType] || "Fixed Price";
  };

  // Duration
  const formatDuration = (duration) => {
    const minutes = Number(duration);

    if (!Number.isFinite(minutes) || minutes <= 0) {
      return "Not specified";
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? "Hour" : "Hours"}`;
    }

    if (hours === 0) {
      return `${remainingMinutes} Minutes`;
    }

    return `${hours}h ${remainingMinutes}m`;
  };

  // Get booking duration
  const getBookingDuration = (booking) => {
    if (booking.priceType === "per_day") {
      return `${booking.quantity} ${
        booking.quantity === 1 ? "Day" : "Days"
      }`;
    }

    if (booking.priceType === "per_hour") {
      return `${booking.quantity} ${
        booking.quantity === 1 ? "Hour" : "Hours"
      }`;
    }

    return formatDuration(booking.duration);
  };

  // Filter bookings
  const filteredBookings = useMemo(() => {
    if (activeFilter === "all") {
      return bookings;
    }

    return bookings.filter(
      (booking) => booking.status === activeFilter
    );
  }, [bookings, activeFilter]);

  // Filter count
  const getFilterCount = (status) => {
    if (status === "all") {
      return bookings.length;
    }

    return bookings.filter(
      (booking) => booking.status === status
    ).length;
  };

  // Dashboard statistics
  const stats = useMemo(() => ({
    total: bookings.length,
    pending: getFilterCount("pending"),
    active: getFilterCount("in_progress"),
    completed: getFilterCount("completed"),
  }), [bookings]);

  const getPaymentConfig = (paymentStatus) => {
    if (paymentStatus === "paid") {
      return {
        label: "Paid",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }

    if (paymentStatus === "awaiting") {
      return {
        label: "Awaiting Payment",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }

    return {
      label: "Not Due",
      className: "bg-gray-100 text-gray-600 border-gray-200",
    };
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/worker/dashboard")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                My Bookings
              </h1>

              <p className="text-xs text-slate-500 sm:text-sm">
                Manage your service requests
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchBookings()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 sm:px-4"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">
              Refresh
            </span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

        {/* Welcome Section */}
        <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white shadow-lg shadow-indigo-200 sm:p-8">

          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-2 text-indigo-100">
              <Sparkles size={17} />
              <span className="text-xs font-semibold uppercase tracking-widest">
                Worker Dashboard
              </span>
            </div>

            <h2 className="text-2xl font-bold sm:text-3xl">
              Your Bookings
            </h2>

            <p className="mt-2 max-w-lg text-sm text-indigo-100 sm:text-base">
              Keep track of your service requests, manage jobs
              and stay connected with your customers.
            </p>
          </div>

          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full border-[30px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-32 h-56 w-56 rounded-full bg-white/5" />

          <ClipboardList
            className="absolute bottom-5 right-7 hidden text-white/15 sm:block"
            size={115}
            strokeWidth={1}
          />
        </section>

        {/* Statistics */}
      
        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <XCircle size={19} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Filters */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">
              Booking Requests
            </h2>

            <span className="text-xs text-slate-500">
              {filteredBookings.length} results
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50"
                  }`}
                >
                  {filter.label}

                  <span
                    className={`rounded-lg px-2 py-0.5 text-xs ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {getFilterCount(filter.value)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <LoaderCircle
              size={35}
              className="animate-spin text-indigo-600"
            />

            <p className="mt-4 text-sm font-semibold text-slate-600">
              Loading your bookings...
            </p>
          </div>
        )}

        {/* No bookings */}
        {!loading && bookings.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <CalendarDays size={32} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No booking requests yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              New customer service requests will appear here.
            </p>
          </div>
        )}

        {/* No filtered bookings */}
        {!loading &&
          bookings.length > 0 &&
          filteredBookings.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <ClipboardList size={27} />
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                No {activeFilter.replace("_", " ")} bookings
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                There are no bookings with this status.
              </p>
            </div>
          )}

        {/* Booking Cards */}
        {!loading && filteredBookings.length > 0 && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

            {filteredBookings.map((booking) => {
              const isUpdating = actionLoading === booking._id;

              const status =
                statusConfig[booking.status] ||
                statusConfig.cancelled;

              const payment = getPaymentConfig(
                booking.paymentStatus
              );

              const canChat = [
                "accepted",
                "in_progress",
                "completed",
              ].includes(booking.status);

              return (
                <article
                  key={booking._id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/60"
                >

                  {/* Card Header */}
                  <div className="border-b border-slate-100 p-5 sm:p-6">

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex min-w-0 items-start gap-3">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                          <BriefcaseBusiness size={23} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                            {booking.serviceId?.name || "Service"}
                          </h3>

                          <p className="mt-1 text-sm font-medium text-indigo-600">
                            {booking.skillName || "Service request"}
                          </p>

                          <p className="mt-2 truncate font-mono text-xs text-slate-400">
                            ID: {booking._id}
                          </p>
                        </div>
                      </div>

                      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>

                    {/* Customer */}
                    <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                        <UserRound size={20} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-500">
                          Customer
                        </p>

                        <p className="truncate text-sm font-bold text-slate-800">
                          {booking.customerId?.fullName || "Customer"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="grid grid-cols-2 gap-4 p-5 sm:p-6">

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <CalendarDays size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">
                          Scheduled Date
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {formatDate(booking.scheduledAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <Clock3 size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">
                          Time
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {formatTime(booking.scheduledAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <CalendarClock size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">
                          Duration
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {getBookingDuration(booking)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Wallet size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">
                          Payment Type
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {getPriceType(booking.priceType)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  {booking.address && (
                    <div className="mx-5 mb-5 flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:mx-6">
                      <MapPin
                        size={19}
                        className="mt-0.5 shrink-0 text-rose-500"
                      />

                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Service Address
                        </p>

                        <p className="mt-1 text-sm leading-relaxed text-slate-700">
                          {booking.address}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Price and Payment */}
                  <div className="mx-5 mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:mx-6">

                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Booking Amount
                      </p>

                      <div className="mt-1 flex items-center gap-1">
                        <IndianRupee
                          size={19}
                          className="text-slate-700"
                        />

                        <span className="text-xl font-extrabold text-slate-900">
                          {booking.price != null
                            ? Number(booking.price).toLocaleString("en-IN")
                            : "TBD"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="mb-1 text-xs font-medium text-slate-500">
                        Payment Status
                      </p>

                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${payment.className}`}>
                        <CreditCard size={13} />
                        {payment.label}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-slate-100 p-5 sm:p-6">

                    {/* Pending */}
                    {booking.status === "pending" && (
                      <div className="flex flex-col gap-3 sm:flex-row">

                        <button
                          disabled={isUpdating}
                          onClick={() =>
                            updateBookingStatus(
                              booking._id,
                              "accepted"
                            )
                          }
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <LoaderCircle size={17} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={18} />
                          )}

                          Accept Booking
                        </button>

                        <button
                          disabled={isUpdating}
                          onClick={() =>
                            updateBookingStatus(
                              booking._id,
                              "rejected"
                            )
                          }
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <LoaderCircle size={17} className="animate-spin" />
                          ) : (
                            <XCircle size={18} />
                          )}

                          Reject
                        </button>
                      </div>
                    )}

                    {/* Chat and Live Location */}
                    {canChat && (
                      <div className="flex flex-col gap-3 sm:flex-row">

                        {booking.status !== "completed" && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/bookings/${booking._id}/chat`)
                            }
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
                          >
                            <MessageCircle size={18} />
                            Chat with Customer
                          </button>
                        )}

                        {booking.status === "in_progress" && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/bookings/${booking._id}/live-map`)
                            }
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
                          >
                            <Navigation size={18} />
                            Live Location
                          </button>
                        )}
                      </div>
                    )}

                    {/* Service completion flow */}
                    {booking.status === "in_progress" &&
                      !booking.serviceCompletedAt &&
                      booking.pricingStatus !== "pending" && (
                        <button
                          disabled={isUpdating}
                          onClick={() => markServiceDone(booking._id)}
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <LoaderCircle size={18} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={18} />
                          )}

                          Mark Service Done
                        </button>
                      )}

                    {booking.status === "in_progress" &&
                      !booking.serviceCompletedAt &&
                      booking.pricingStatus === "pending" && (
                        <div className="mt-3 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <IndianRupee
                            size={19}
                            className="mt-0.5 shrink-0 text-amber-600"
                          />

                          <p className="text-sm leading-relaxed text-amber-800">
                            Set the final negotiated amount in booking
                            chat before marking the service done.
                          </p>
                        </div>
                      )}

                    {booking.status === "in_progress" &&
                      booking.serviceCompletedAt &&
                      booking.paymentStatus !== "paid" && (
                        <div className="mt-3 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <CreditCard
                            size={19}
                            className="mt-0.5 shrink-0 text-amber-600"
                          />

                          <p className="text-sm leading-relaxed text-amber-800">
                            Service marked done. Waiting for customer
                            to complete demo payment.
                          </p>
                        </div>
                      )}

                    {booking.status === "in_progress" &&
                      booking.paymentStatus === "paid" && (
                        <button
                          disabled={isUpdating}
                          onClick={() =>
                            updateBookingStatus(
                              booking._id,
                              "completed"
                            )
                          }
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <LoaderCircle size={18} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={18} />
                          )}

                          Mark Completed
                        </button>
                      )}

                    {/* Legacy accepted */}
                    {booking.status === "accepted" && (
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                        Legacy accepted booking. Please refresh or
                        contact support before completion.
                      </div>
                    )}

                    {/* Completed */}
                    {booking.status === "completed" && (
                      <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                        <CheckCircle2 size={18} />
                        Booking Completed
                      </div>
                    )}

                    {/* Rejected / Cancelled */}
                    {["rejected", "cancelled"].includes(booking.status) && (
                      <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 p-3 text-sm font-semibold text-slate-500">
                        <XCircle size={17} />
                        This booking is {booking.status}.
                      </div>
                    )}

                  </div>
                </article>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}

export default WorkerBookings;
