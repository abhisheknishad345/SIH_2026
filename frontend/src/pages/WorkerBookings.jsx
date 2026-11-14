import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {ArrowLeft, RefreshCw} from 'lucide-react'

const filters = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

function WorkerBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  // Fetch worker bookings
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

      // Latest booking request first
      const sortedBookings = [...bookingList].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.scheduledAt).getTime();
        const dateB = new Date(b.createdAt || b.scheduledAt).getTime();

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

      await api.put(`/bookings/${bookingId}/status`, {
        status,
      });

      // Refresh bookings after status update
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

  // Filter bookings
  const filteredBookings = useMemo(() => {
    if (activeFilter === "all") {
      return bookings;
    }

    return bookings.filter(
      (booking) => booking.status === activeFilter
    );
  }, [bookings, activeFilter]);

   const getPriceType = (priceType) => {
        const types = {
            per_hour: "Per Hour",
            per_day: "Per Day",
            per_visit: "Per Visit",
            fixed: "Fixed Price",
        };

        return types[priceType] || "Fixed Price";
    };

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

        if (remainingMinutes === 0) {
            return `${hours} Hour(s)`;
        }

        return `${hours}h ${remainingMinutes}m`;
    };

  // Status badge styles
  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "accepted":
        return "bg-blue-100 text-blue-700";

      case "completed":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "cancelled":
        return "bg-gray-100 text-gray-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Filter count
  const getFilterCount = (status) => {
    if (status === "all") {
      return bookings.length;
    }

    return bookings.filter(
      (booking) => booking.status === status
    ).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-neutral-200 border-b-2 border-gray-500 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <button
                onClick={() => navigate("/worker/dashboard")}
                className="text-sm flex items-center gap-2 font-semibold text-gray-700 mb-4 border-2 border-black rounded-xl p-2 cursor-pointer"
              >
                <ArrowLeft size={20}/> 
                <span>Back</span> 
              </button>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                My Bookings
              </h1>

              <p className="text-sm capitalize text-gray-500 mt-1">
                Manage your service requests
              </p>
            </div>

            <button
              onClick={() => fetchBookings()}
              disabled={loading}
              className="px-4 py-2 flex gap-2 items-center rounded-xl border-2 border-black
                         text-sm font-semibold text-green-600 cursor-pointer
                        "
            >
              <RefreshCw size={18}/>
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Error */}
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600">
            {error}
          </div>
        )}

        {/* Filters */}
        <section className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`shrink-0 flex items-center gap-2
                    px-4 py-2 rounded-full text-sm font-semibold
                    transition-colors cursor-pointer
                    ${isActive
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-600 border-2 border-mist-500 hover:bg-gray-200"
                    }`}
                >
                  {filter.label}

                  <span
                    className={`text-xs rounded-full px-2 py-0.5
                      ${isActive
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-100 text-gray-600"
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
          <div className="text-center text-md text-black font-semibold py-16">
            Loading Bookings...
          </div>
        )}

        {/* No bookings */}
        {!loading && bookings.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center">
            <div className="text-5xl mb-4">📅</div>

            <h2 className="text-xl font-bold text-gray-800">
              No booking requests yet
            </h2>

            <p className="text-gray-500 mt-2">
              New service requests will appear here.
            </p>
          </div>
        )}

        {/* No filtered bookings */}
        {!loading &&
          bookings.length > 0 &&
          filteredBookings.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <h2 className="text-lg font-bold text-gray-800">
                No {activeFilter} bookings
              </h2>

              <p className="text-gray-500 mt-2">
                There are no bookings with this status.
              </p>
            </div>
          )}

        {/* Booking list */}
        {!loading && filteredBookings.length > 0 && (
          <div className="space-y-5">
            {filteredBookings.map((booking) => {
              const isUpdating = actionLoading === booking._id;

              return (
                <article
                  key={booking._id}
                  className="bg-white rounded-2xl border border-mist-800
                              p-4 sm:p-6"
                >
                  {/* Booking header */}
                  <div className="flex flex-col sm:flex-row
                                  sm:items-start sm:justify-between gap-3">

                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        {booking.serviceId?.name || "Service"}
                      </h2>

                      <p className="text-md font-semibold text-green-600 mt-1">
                        {booking.skillName}
                      </p>

                      <p className="text-sm font-mono text-gray-800 mt-2">
                        Booking ID: {booking._id}
                      </p>
                    </div>

                    <span
                      className={`self-start px-3 py-1 rounded-full
                        text-xs font-semibold capitalize
                        ${getStatusClass(booking.status)}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  {/* Booking details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2
                                  lg:grid-cols-2 gap-4 mt-5 text-sm">

                    <div>
                      <p className="text-gray-700 uppercase">
                        Customer Name
                      </p>

                      <p className="font-semibold text-gray-900 mt-1">
                        {booking.customerId?.fullName || "Customer"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-700 uppercase">
                        Scheduled
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        Date & Time:{" "}
                        {new Date(booking.scheduledAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                          timeZone: "Asia/Kolkata"
                        }).replace(/\b(am|pm)\b/gi, (match) => match.toUpperCase())}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-700 uppercase">
                        Duration
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {formatDuration(booking.duration)}
                      </p>
                    </div>

                    <div>
  <p className="text-gray-700 uppercase">
    Amount
  </p>

  <div className="flex flex-wrap items-center gap-2 mt-1">
    <p className="font-bold text-gray-900 text-lg">
      ₹{booking.price ?? 0}
    </p>

    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
      {getPriceType(booking.serviceId?.priceType)}
    </span>
  </div>
</div>
                  </div>

                  {/* Service address */}
                  {booking.address && (
                    <div className="mt-4 text-sm">
                      <p className="text-gray-700 uppercase">
                        Service Address
                      </p>

                      <p className="text-gray-900 mt-1 capitalize">
                        {booking.address}
                      </p>
                    </div>
                  )}

                  {/* Pending actions */}
                  {booking.status === "pending" && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-5">
                      <button
                        disabled={isUpdating}
                        onClick={() =>
                          updateBookingStatus(
                            booking._id,
                            "accepted"
                          )
                        }
                        className="flex-1 py-3 bg-emerald-500
                                   text-white font-semibold font-mono rounded-xl
                                   hover:bg-emerald-600 cursor-pointer
                                   "
                      >
                        {isUpdating ? "Updating..." : "Accept Booking"}
                      </button>

                      <button
                        disabled={isUpdating}
                        onClick={() =>
                          updateBookingStatus(
                            booking._id,
                            "rejected"
                          )
                        }
                        className="flex-1 py-3 border border-red-500
                                   text-red-600 font-semibold rounded-xl
                                   hover:bg-red-50 cursor-pointer
                                   font-mono"
                      >
                        {isUpdating ? "Updating..." : "Reject"}
                      </button>
                    </div>
                  )}

                  {/* Accepted action */}
                  {booking.status === "accepted" && (
                    <button
                      disabled={isUpdating}
                      onClick={() =>
                        updateBookingStatus(
                          booking._id,
                          "completed"
                        )
                      }
                      className="w-full mt-5 py-3 bg-indigo-600
                                 text-white font-semibold rounded-xl
                                 hover:bg-indigo-700 cursor-pointer
                                 disabled:opacity-60"
                    >
                      {isUpdating
                        ? "Updating..."
                        : "Mark Completed"}
                    </button>
                  )}
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