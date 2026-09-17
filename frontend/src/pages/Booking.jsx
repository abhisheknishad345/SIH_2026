import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

function Booking() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const workerId = state?.workerId;
  const serviceId = state?.serviceId;
  const workerName = state?.workerName;

  const [service, setService] = useState(null);
  const [worker, setWorker] = useState(null);

  const [formData, setFormData] = useState({
    skillName: "",
    quantity: 1,
    scheduledAt: "",
    duration: 1,
    address: "",
  });

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesResponse, workersResponse] = await Promise.all([
          api.get("/services"),
          api.get(`/services/${serviceId}/workers`),
        ]);

        const selectedService = servicesResponse.data.services.find(
          (item) => item._id === serviceId
        );

        const selectedWorker = workersResponse.data.workers.find(
          (item) => item.userId === workerId
        );

        if (!selectedService || !selectedWorker) {
          throw new Error("Service or worker not found.");
        }

        setService(selectedService);
        setWorker(selectedWorker);

        if (selectedWorker.skills?.length > 0) {
          setFormData((prev) => ({
            ...prev,
            skillName: selectedWorker.skills[0].name,
          }));
        }
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
          err.message ||
          "Unable to load booking details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (!workerId || !serviceId) {
      setError("Invalid booking details.");
      setLoading(false);
      return;
    }

    fetchData();
  }, [workerId, serviceId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          type: "Point",
          coordinates: [
            position.coords.longitude,
            position.coords.latitude,
          ],
        });
      },
      () => {
        setError("Unable to get your location.");
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setBookingLoading(true);

    try {
      if (!location) {
        setError("Please provide your current location.");
        setBookingLoading(false);
        return;
      }

      const response = await api.post("/bookings", {
        workerId,
        serviceId,
        skillName: formData.skillName,
        quantity: Number(formData.quantity),
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        duration: Number(formData.duration),
        address: formData.address,
        location,
      });

      console.log("Booking:", response.data);

      setSuccess("Booking created successfully!");

      setTimeout(() => {
        navigate("/customer/bookings");
      }, 1200);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to create booking."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading booking details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-5 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-indigo-600"
          >
            ← Back
          </button>

          <h1 className="text-xl font-bold text-indigo-700">
            SEWA
          </h1>

          <div className="w-10" />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-5 py-7">

        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Book Service
          </h2>

          <p className="text-gray-500 mt-2">
            Schedule your service with a verified worker.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 p-4 rounded-xl bg-green-50 text-green-600">
            {success}
          </div>
        )}

        {/* Selected details */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
          <h3 className="font-bold text-lg text-gray-800">
            {service?.name}
          </h3>

          <p className="text-indigo-600 text-sm mt-1">
            {service?.category}
          </p>

          <div className="mt-4 flex justify-between text-sm">
            <span className="text-gray-500">
              Worker
            </span>

            <span className="font-semibold text-gray-800">
              {workerName}
            </span>
          </div>

          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-500">
              Service price
            </span>

            <span className="font-semibold text-gray-800">
              ₹{service?.price} / {service?.priceType?.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Booking form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm p-5 sm:p-7 space-y-5"
        >

          {/* Skill */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Skill
            </label>

            <select
              name="skillName"
              value={formData.skillName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl
                         bg-white focus:outline-none focus:ring-2
                         focus:ring-indigo-500"
              required
            >
              {worker?.skills?.map((skill) => (
                <option key={skill.name} value={skill.name}>
                  {skill.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quantity
            </label>

            <input
              type="number"
              name="quantity"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl
                         focus:outline-none focus:ring-2
                         focus:ring-indigo-500"
              required
            />
          </div>

          {/* Date and time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Scheduled Date & Time
            </label>

            <input
              type="datetime-local"
              name="scheduledAt"
              value={formData.scheduledAt}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl
                         focus:outline-none focus:ring-2
                         focus:ring-indigo-500"
              required
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Duration
            </label>

            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl
             bg-white focus:outline-none focus:ring-2
             focus:ring-indigo-500"
              required
            >
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="4">4 hours</option>
              <option value="6">6 hours</option>
              <option value="8">8 hours</option>
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Service Address
            </label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your complete address"
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl
                         focus:outline-none focus:ring-2
                         focus:ring-indigo-500 resize-none"
              required
            />
          </div>

          {/* Location */}
          <div>
            <button
              type="button"
              onClick={getLocation}
              className="w-full py-3 border-2 border-indigo-600
                         text-indigo-600 font-semibold rounded-xl
                         hover:bg-indigo-50 transition"
            >
              {location
                ? "✓ Location Added"
                : "📍 Use My Current Location"}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={bookingLoading}
            className="w-full py-3 bg-indigo-600 text-white
                       font-semibold rounded-xl hover:bg-indigo-700
                       transition disabled:opacity-60"
          >
            {bookingLoading
              ? "Creating Booking..."
              : "Confirm Booking"}
          </button>

        </form>
      </main>
    </div>
  );
}

export default Booking;