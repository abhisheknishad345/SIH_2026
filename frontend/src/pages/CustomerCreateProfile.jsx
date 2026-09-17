import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CustomerCreateProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getCurrentLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError(
        "Location services are not supported by your browser."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));

        setLocationLoading(false);
      },
      (err) => {
        console.error(err);

        setError(
          "Unable to get your location. Please allow location permission."
        );

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!formData.address.trim()) {
      setError("Please enter your address.");
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError("Please select your current location.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        phone: formData.phone.trim(),

        address: formData.address.trim(),

        location: {
          type: "Point",
          coordinates: [
            Number(formData.longitude),
            Number(formData.latitude),
          ],
        },
      };

      await api.post("/customers/profile", payload);

      setSuccess("Profile created successfully!");

      setTimeout(() => {
        navigate("/customer");
      }, 1000);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to create your profile. Please try again."
      );
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-100 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white">
              👤
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Create Your Profile
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Complete your profile to start using TechConnect services.
              </p>
            </div>

          </div>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* Card Header */}
          <div className="border-b border-gray-200 px-5 py-5 sm:px-7">
            <h2 className="text-lg font-semibold text-gray-900">
              Customer Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add your contact details and location.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-7"
          >

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                {success}
              </div>
            )}

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-black"
                required
              />
            </div>

            {/* Address */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Address
              </label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="4"
                placeholder="Enter your current address"
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-black"
                required
              />

              <p className="mt-2 text-xs text-gray-400">
                Maximum 200 characters.
              </p>
            </div>

            {/* Location */}
            <div className="mt-8">

              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Your Location
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Your location helps us find suitable workers near you.
                </p>
              </div>

              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto cursor-pointer"
              >
                {locationLoading
                  ? "Getting Location..."
                  : "📍 Use Current Location"}
              </button>

              {/* Coordinates */}
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-600">
                    Latitude
                  </label>

                  <input
                    type="text"
                    value={formData.latitude}
                    readOnly
                    placeholder="Not selected"
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-600 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-600">
                    Longitude
                  </label>

                  <input
                    type="text"
                    value={formData.longitude}
                    readOnly
                    placeholder="Not selected"
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-600 outline-none"
                  />
                </div>

              </div>

            </div>

            {/* Info */}
            <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="flex gap-3">

                <span className="text-lg">
                  ℹ️
                </span>

                <div>
                  <h4 className="text-sm font-semibold text-indigo-900">
                    Why do we need your location?
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-indigo-700">
                    TechConnect uses your location to help you discover
                    verified workers and services available nearby.
                  </p>
                </div>

              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => navigate("/customer")}
                className="w-full rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto cursor-pointer"
              >
                {loading
                  ? "Creating Profile..."
                  : "Create Profile"}
              </button>

            </div>

          </form>
        </div>

        <div className="text-black mt-3 flex justify-between border border-purple-600 rounded-2xl p-3">
          !Do not want to create Profile
          <button
          onClick={handleLogout}
          className="border bg-indigo-600 p-2 rounded-xl cursor-pointer text-white font-semibold"
          >Logout</button>
        </div>

        <p className="py-5 text-center text-xs text-gray-600">
          TechConnect • Cooperative Services Platform
        </p>

      </div>
    </div>
  );
}

export default CustomerCreateProfile;