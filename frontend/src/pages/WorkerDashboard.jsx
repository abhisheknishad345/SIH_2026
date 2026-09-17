import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function WorkerDashboard() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      setError("");

      const response = await api.get("/bookings/worker");

      console.log("Worker bookings:", response.data);

      setBookings(response.data.bookings || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to load bookings."
      );
    } finally {
      setLoading(false);
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
        fetchBookings();

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

  const updateBookingStatus = async (bookingId, status) => {
    try {
      setActionLoading(bookingId);
      setError("");

      await api.put(`/bookings/${bookingId}/status`, {
        status,
      });

      await fetchBookings();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        `Unable to ${status} booking.`
      );
    } finally {
      setActionLoading(null);
    }
  };

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

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-5 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">

          <h1 className="text-2xl font-bold text-indigo-700">
            TechConnect
          </h1>

          <button
            onClick={() => navigate("/worker/profile")}
            className="w-1/6 bg-indigo-600 text-white py-2 rounded-xl font-semibold cursor-pointer"
          >
            My Profile
          </button>

          <button
            onClick={handleLogout}
            className="w-1/6 text-md font-semibold text-black border-2 border-black rounded-2xl p-2 cursor-pointer hover:text-red-500"
          >
            Logout
          </button>

        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-5 py-7">

        {/* Header */}
        <section className="mb-7">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Worker Dashboard 👷
          </h2>

          <p className="text-gray-500 mt-2">
            Manage your service bookings
          </p>
        </section>

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 text-red-600">
            {error}
          </div>
        )}

        {/* Bookings */}
        <section>

          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-gray-800">
              Total Bookings
            </h3>

            <span className="text-sm text-gray-500">
              {bookings.length} bookings
            </span>
          </div>

          {loading && (
            <div className="text-center py-12 text-gray-500">
              Loading bookings...
            </div>
          )}

          {!loading && bookings.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="text-4xl mb-3">📅</div>

              <h3 className="font-bold text-lg text-gray-800">
                No bookings yet
              </h3>

              <p className="text-gray-500 mt-2">
                New service requests will appear here.
              </p>
            </div>
          )}

          {!loading && bookings.length > 0 && (
            <div className="space-y-5">

              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white rounded-2xl shadow-sm p-5"
                >

                  {/* Top */}
                  <div className="flex flex-col sm:flex-row
                                  sm:items-start sm:justify-between
                                  gap-3">

                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {booking.serviceId?.name || "Service"}
                      </h3>

                      <p className="text-sm text-indigo-600 mt-1">
                        {booking.skillName}
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

                  {/* Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2
                                  gap-4 mt-5 text-sm">

                    <div>
                      <span className="text-gray-500">
                        Customer
                      </span>

                      <p className="font-semibold text-gray-800">
                        {booking.customerId?.fullName ||
                          "Customer"}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-500">
                        Scheduled
                      </span>

                      <p className="font-semibold text-gray-800">
                        {new Date(
                          booking.scheduledAt
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-500">
                        Duration
                      </span>

                      <p className="font-semibold text-gray-800">
                        {booking.duration} hour(s)
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-500">
                        Amount
                      </span>

                      <p className="font-semibold text-gray-800">
                        ₹{booking.price}
                      </p>
                    </div>

                  </div>

                  {/* Address */}
                  {booking.address && (
                    <div className="mt-4 text-sm">
                      <span className="text-gray-500">
                        Service Address
                      </span>

                      <p className="text-gray-700 mt-1">
                        {booking.address}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {booking.status === "pending" && (
                    <div className="flex gap-3 mt-5">

                      <button
                        disabled={actionLoading === booking._id}
                        onClick={() =>
                          updateBookingStatus(
                            booking._id,
                            "accepted"
                          )
                        }
                        className="flex-1 py-3 bg-green-600
                                   text-white font-semibold
                                   rounded-xl hover:bg-green-700
                                   disabled:opacity-60 cursor-pointer"
                      >
                        {actionLoading === booking._id
                          ? "Updating..."
                          : "Accept"}
                      </button>

                      <button
                        disabled={actionLoading === booking._id}
                        onClick={() =>
                          updateBookingStatus(
                            booking._id,
                            "rejected"
                          )
                        }
                        className="flex-1 py-3 border border-red-500
                                   text-red-600 font-semibold
                                   rounded-xl hover:bg-red-50
                                   disabled:opacity-60 cursor-pointer"
                      >
                        Reject
                      </button>

                    </div>
                  )}

                  {/* Complete */}
                  {booking.status === "accepted" && (
                    <button
                      disabled={actionLoading === booking._id}
                      onClick={() =>
                        updateBookingStatus(
                          booking._id,
                          "completed"
                        )
                      }
                      className="w-full mt-5 py-3 bg-indigo-600
                                 text-white font-semibold rounded-xl
                                 hover:bg-indigo-700
                                 disabled:opacity-60 cursor-pointer"
                    >
                      {actionLoading === booking._id
                        ? "Updating..."
                        : "Mark Completed"}
                    </button>
                  )}

                </div>
              ))}

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default WorkerDashboard;