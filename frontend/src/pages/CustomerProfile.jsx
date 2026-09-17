import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CustomerProfile() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/customers/profile");

        setCustomer(response.data.customer);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-6">
        <div className="mx-auto flex min-h-[80vh] max-w-4xl items-center justify-center">
          <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Loading your profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-6">
        <div className="mx-auto flex min-h-[80vh] max-w-lg items-center justify-center">
          <div className="w-full rounded-2xl border border-red-200 bg-white p-7 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-200 text-2xl text-black">
              !
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Unable to Load Profile
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>

            <button
              onClick={() => navigate("/customer")}
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 cursor-pointer"
            >
              Back to Dashboard
            </button>

          </div>
        </div>
      </div>
    );
  }

  const coordinates =
    customer?.location?.coordinates || [];

  const longitude =
    coordinates.length === 2 ? coordinates[0] : null;

  const latitude =
    coordinates.length === 2 ? coordinates[1] : null;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-5 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-4xl">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/customer")}
          className="mb-5 text-sm font-semibold text-gray-600 transition hover:text-indigo-600 cursor-pointer"
        >
          ⬅ Back to Dashboard
        </button>

        {/* Profile Header */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">

              {/* Avatar */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
                👤
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  {customer?.userId?.fullName || "Customer"}
                </h1>

                <p className="mt-1 truncate text-sm text-gray-500">
                  {customer?.userId?.email || "Email not available"}
                </p>

                <span className="mt-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  Customer
                </span>
              </div>

            </div>

            {/* Edit */}
            <button
              onClick={() =>
                navigate("/customer/edit-profile")
              }
              className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:w-auto cursor-pointer"
            >
              Edit Profile
            </button>

          </div>

        </div>

        {/* Contact Information */}
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">

          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Contact Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your contact details used for service bookings.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Name */}
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium text-gray-500">
                Full Name
              </p>

              <p className="mt-1 wrap-break text-sm font-semibold text-gray-800">
                {customer?.userId?.fullName || "Not available"}
              </p>
            </div>

            {/* Email */}
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium text-gray-500">
                Email
              </p>

              <p className="mt-1 break-all text-sm font-semibold text-gray-800">
                {customer?.userId?.email || "Not available"}
              </p>
            </div>

            {/* Phone */}
            <div className="rounded-xl bg-gray-50 p-4 sm:col-span-2">
              <p className="text-xs font-medium text-gray-500">
                Phone Number
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-800">
                {customer?.phone || "Not provided"}
              </p>
            </div>

          </div>

        </div>

        {/* Address */}
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">

          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Address
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your saved service address.
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">

            <div className="flex gap-3">

              <span className="text-lg">
                📍
              </span>

              <p className="wrap-break text-sm leading-6 text-gray-700">
                {customer?.address || "Address not provided"}
              </p>

            </div>

          </div>

        </div>

        {/* Location */}
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">

          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Location
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your saved geographical location.
            </p>
          </div>

          {latitude !== null && longitude !== null ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">
                  Latitude
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-gray-800">
                  {latitude}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">
                  Longitude
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-gray-800">
                  {longitude}
                </p>
              </div>

            </div>
          ) : (
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Location has not been provided.
              </p>
            </div>
          )}

        </div>

        {/* Account Information */}
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">

          <h2 className="text-lg font-semibold text-gray-900">
            Account Information
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium text-gray-500">
                Account Type
              </p>

              <p className="mt-1 text-sm font-semibold capitalize text-gray-800">
                {customer?.userId?.role || "customer"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium text-gray-500">
                Profile Status
              </p>

              <div className="mt-1">
                <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                  Active
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <p className="py-6 text-center text-xs text-gray-600">
          TechCoonect • Cooperative Services Platform
        </p>

      </div>
    </div>
  );
}

export default CustomerProfile;