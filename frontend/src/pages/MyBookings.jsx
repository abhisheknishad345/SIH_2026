import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      setError("");

      const response = await api.get("/bookings/customer");

      console.log("My bookings:", response.data);

      setBookings(response.data.bookings || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to load your bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    try {
      await api.patch(`/bookings/${bookingId}/cancel`);

      // Refresh bookings after cancellation
      fetchBookings();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to cancel booking."
      );
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

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-5 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">

          <button
            onClick={() => navigate("/customer")}
            className="text-gray-600 hover:text-indigo-600 cursor-pointer"
          >
            ⬅ Back
          </button>

          <h1 className="text-xl font-bold text-indigo-700">
           TechConnect
          </h1>

          <div className="w-10" />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-5 py-7">

        <div className="mb-7">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            My Bookings
          </h2>

          <p className="text-gray-500 mt-2">
            Track your service bookings
          </p>
        </div>

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 text-red-600">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-gray-500">
            Loading bookings...
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">

            <div className="text-4xl mb-3">
              📅
            </div>

            <h3 className="text-lg font-bold text-gray-800">
              No bookings yet
            </h3>

            <p className="text-gray-500 mt-2">
              Your service bookings will appear here.
            </p>

            <button
              onClick={() => navigate("/customer")}
              className="mt-5 px-5 py-3 bg-indigo-600
                         text-white font-semibold rounded-xl
                         hover:bg-indigo-700"
            >
              Browse Services
            </button>

          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="space-y-5">

            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-2xl shadow-sm p-5"
              >

                <div className="flex flex-col sm:flex-row
                                sm:items-start sm:justify-between gap-4">

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

                <div className="grid grid-cols-1 sm:grid-cols-2
                                gap-3 mt-5 text-sm">

                  <div>
                    <span className="text-gray-500">
                      Worker
                    </span>

                    <p className="font-semibold text-gray-800">
                      {booking.workerId?.fullName || "Worker"}
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
                      Total Price
                    </span>

                    <p className="font-semibold text-gray-800">
                      ₹{booking.price}
                    </p>
                  </div>

                </div>

                {booking.address && (
                  <div className="mt-4 text-sm">
                    <span className="text-gray-500">
                      Address
                    </span>

                    <p className="text-gray-700 mt-1">
                      {booking.address}
                    </p>
                  </div>
                )}

                {booking.status === "pending" && (
                  <button
                    onClick={() => cancelBooking(booking._id)}
                    className="mt-5 px-4 py-2 border border-red-500
                               text-red-600 rounded-lg text-sm
                               font-semibold hover:bg-red-50 cursor-pointer"
                  >
                    Cancel Booking
                  </button>
                )}

              </div>
            ))}

          </div>
        )}

      </main>
    </div>
  );
}

export default MyBookings;