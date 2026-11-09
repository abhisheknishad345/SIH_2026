
import { useState } from "react";
import { replace, useNavigate } from "react-router-dom";
import {
  UserPlus,
  User,
  Pencil,
  Phone,
  MapPin,
  Info,
  ArrowRight,
  LogOut,
  Loader2,
  CircleAlert,
  CircleCheck,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";



const ADDRESS_MAX_LENGTH = 200;

function CustomerCreateProfile() {
  const navigate = useNavigate();
  const { logout } = useAuth();

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
      setError("Location services are not supported by your browser.");
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
          coordinates: [Number(formData.longitude), Number(formData.latitude)],
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
      await logout();
      navigate("/login", {replace:true});
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition " +
    "focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:text-base";

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-indigo-50 via-slate-50 to-slate-100 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      {/* Soft background glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-300/30 blur-3xl sm:h-96 sm:w-96" />

      <div className="relative mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200 sm:h-14 sm:w-14">
              <UserPlus size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl lg:text-3xl">
                Create Your Profile
              </h1>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Complete your profile to start using TechConnect services.
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
          {/* Card Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div>
              <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                Customer Information
              </h2>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Add your contact details and location.
              </p>
            </div>

            {/* Avatar (decorative) */}
            <div className="relative shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-indigo-500 sm:h-14 sm:w-14">
                <User size={22} />
              </div>

              <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white">
                <Pencil size={10} />
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-7">
            {/* Error */}
            {error && (
              <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <CircleAlert size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-6 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CircleCheck size={18} className="mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Phone size={18} />
                </span>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="address"
                  className="text-sm font-semibold text-slate-700"
                >
                  Address <span className="text-red-500">*</span>
                </label>

                <span className="text-[11px] text-slate-400">
                  {formData.address.length} / {ADDRESS_MAX_LENGTH} characters
                </span>
              </div>

              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="4"
                maxLength={ADDRESS_MAX_LENGTH}
                placeholder="Enter your current address"
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:text-base"
                required
              />

              <p className="mt-2 text-xs text-slate-400">
                Maximum {ADDRESS_MAX_LENGTH} characters.
              </p>
            </div>

            {/* Location */}
            <div className="mt-8">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-slate-900">
                  Your Location
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Your location helps us find suitable workers near you.
                </p>
              </div>

              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {locationLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin size={16} className="text-rose-500" />
                    Use Current Location
                  </>
                )}
              </button>

              {/* Coordinates */}
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Latitude
                  </label>

                  <input
                    type="text"
                    value={formData.latitude}
                    readOnly
                    placeholder="Not selected"
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 font-mono text-xs text-slate-600 placeholder-slate-400 outline-none sm:text-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Longitude
                  </label>

                  <input
                    type="text"
                    value={formData.longitude}
                    readOnly
                    placeholder="Not selected"
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 font-mono text-xs text-slate-600 placeholder-slate-400 outline-none sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-indigo-600">
                  <Info size={18} />
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
                className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto sm:text-base"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:from-indigo-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:text-base"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    Create Profile <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Logout bar */}
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-white p-3 shadow-sm sm:px-5">
          <span className="flex items-center gap-2 text-xs text-slate-600 sm:text-sm">
            <CircleAlert size={16} className="shrink-0 text-indigo-500" />
            Do not want to create Profile?
          </span>

          <button
            type="button"
            onClick={handleLogout}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 sm:text-sm"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>

        <p className="py-5 text-center text-xs text-slate-500">
          TechConnect &bull; Cooperative Services Platform
        </p>
      </div>
    </div>
  );
}

export default CustomerCreateProfile;