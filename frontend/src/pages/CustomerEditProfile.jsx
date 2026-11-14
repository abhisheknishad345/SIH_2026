

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    UserRound,
    Phone,
    MapPin,
    Navigation,
    LocateFixed,
    LoaderCircle,
    CheckCircle2,
    AlertCircle,
    Info,
    Save,
    X,
    ShieldCheck,
    Compass,
} from "lucide-react";

import api from "../services/api";

function CustomerEditProfile() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        phone: "",
        address: "",
        latitude: "",
        longitude: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Load existing profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/customers/profile");

                const customer = response.data.customer;
                const coordinates =
                    customer.location?.coordinates || [];

                setFormData({
                    phone: customer.phone || "",
                    address: customer.address || "",
                    longitude:
                        coordinates.length === 2
                            ? coordinates[0].toString()
                            : "",
                    latitude:
                        coordinates.length === 2
                            ? coordinates[1].toString()
                            : "",
                });
            } catch (err) {
                console.error("Profile fetch failed:", err);

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

    // Input change
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    // Get current location
    const getCurrentLocation = () => {
        setError("");
        setSuccess("");

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
                console.error("Location error:", err);

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

    // Save profile
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
            setError("Please provide your location.");
            return;
        }

        setSaving(true);

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

            await api.put("/customers/profile", payload);

            setSuccess("Profile updated successfully!");

            setTimeout(() => {
                navigate("/customer");
            }, 1000);
        } catch (err) {
            console.error("Profile update failed:", err);

            setError(
                err.response?.data?.message ||
                "Unable to update your profile."
            );
        } finally {
            setSaving(false);
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">

                <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white px-10 py-9 shadow-sm">

                    <LoaderCircle
                        size={38}
                        className="animate-spin text-indigo-600"
                    />

                    <p className="mt-4 text-sm font-semibold text-slate-600">
                        Loading your profile...
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-7 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-4xl">

                {/* Top Navigation */}
                <div className="mb-7 flex items-center justify-between">

                    <button
                        type="button"
                        onClick={() => navigate("/customer/profile")}
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 cursor-pointer transition hover:bg-white hover:text-indigo-600"
                    >
                        <ArrowLeft size={18} />
                        Back to Profile
                    </button>

                    <div className="flex items-center gap-2 font-bold text-slate-800">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                            T
                        </div>
                        <span className="hidden sm:inline">
                            TechConnect
                        </span>
                    </div>

                </div>

                {/* Header */}
                <section className="relative mb-7 overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-indigo-600 to-blue-700 p-6 text-white shadow-lg shadow-indigo-200 sm:p-9">

                    <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-35 border-white/10" />

                    <div className="relative z-10 flex items-center gap-5">

                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 sm:h-20 sm:w-20">
                            <UserRound size={37} strokeWidth={1.5} />
                        </div>

                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-100">
                                ACCOUNT SETTINGS
                            </p>

                            <h1 className="text-2xl font-bold sm:text-3xl">
                                Edit Your Profile
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-indigo-100">
                                Keep your contact and location details updated.
                            </p>
                        </div>

                    </div>

                </section>

                {/* Form Card */}
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                    {/* Card Header */}
                    <div className="border-b border-slate-100 px-5 py-6 sm:px-8">

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <ShieldCheck size={22} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Personal Information
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Update your service contact details
                                </p>
                            </div>

                        </div>

                    </div>

                    <form onSubmit={handleSubmit} className="p-5 sm:p-8">

                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">

                                <AlertCircle
                                    size={20}
                                    className="mt-0.5 shrink-0 text-rose-600"
                                />

                                <div>
                                    <p className="text-sm font-bold text-rose-800">
                                        Something went wrong
                                    </p>

                                    <p className="mt-1 text-sm leading-5 text-rose-700">
                                        {error}
                                    </p>
                                </div>

                            </div>
                        )}

                        {/* Success Alert */}
                        {success && (
                            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                                <CheckCircle2
                                    size={21}
                                    className="shrink-0 text-emerald-600"
                                />

                                <p className="text-sm font-semibold text-emerald-700">
                                    {success}
                                </p>

                            </div>
                        )}

                        {/* Contact Section */}
                        <div>

                            <div className="mb-5">
                                <h3 className="text-base font-bold text-slate-900">
                                    Contact Details
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Provide the phone number workers can use to contact you.
                                </p>
                            </div>

                            {/* Phone */}
                            <div>

                                <label
                                    htmlFor="phone"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Phone Number
                                    <span className="ml-1 text-rose-500">*</span>
                                </label>

                                <div className="relative">

                                    <Phone
                                        size={19}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter your phone number"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                        required
                                    />

                                </div>

                            </div>

                            {/* Address */}
                            <div className="mt-6">

                                <label
                                    htmlFor="address"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Current Address
                                    <span className="ml-1 text-rose-500">*</span>
                                </label>

                                <div className="relative">

                                    <MapPin
                                        size={19}
                                        className="absolute left-4 top-4 text-slate-400"
                                    />

                                    <textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Enter your complete address"
                                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                        required
                                    />

                                </div>

                            </div>

                        </div>

                        {/* Divider */}
                        <div className="my-8 h-px bg-slate-100" />

                        {/* Location Section */}
                        <div>

                            <div className="mb-5 flex items-start gap-3">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <Navigation size={22} />
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900">
                                        Location Details
                                    </h3>

                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Your location helps us discover nearby technicians.
                                    </p>
                                </div>

                            </div>

                            {/* Current Location Button */}
                            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">

                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                                            <LocateFixed size={21} />
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-slate-800">
                                                Use Current Location
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Get your GPS coordinates automatically.
                                            </p>
                                        </div>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={getCurrentLocation}
                                        disabled={locationLoading}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                                    >
                                        {locationLoading ? (
                                            <>
                                                <LoaderCircle
                                                    size={17}
                                                    className="animate-spin"
                                                />
                                                Getting Location...
                                            </>
                                        ) : (
                                            <>
                                                <Navigation size={17} />
                                                Get Location
                                            </>
                                        )}
                                    </button>

                                </div>

                            </div>

                            {/* Coordinates */}
                            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <div>

                                    <label
                                        htmlFor="latitude"
                                        className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500"
                                    >
                                        Latitude
                                    </label>

                                    <div className="relative">

                                        <Compass
                                            size={17}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            id="latitude"
                                            type="text"
                                            value={formData.latitude}
                                            readOnly
                                            placeholder="Not selected"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3.5 pl-11 pr-4 text-sm text-slate-600 outline-none"
                                        />

                                    </div>

                                </div>

                                <div>

                                    <label
                                        htmlFor="longitude"
                                        className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500"
                                    >
                                        Longitude
                                    </label>

                                    <div className="relative">

                                        <Compass
                                            size={17}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            id="longitude"
                                            type="text"
                                            value={formData.longitude}
                                            readOnly
                                            placeholder="Not selected"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3.5 pl-11 pr-4 text-sm text-slate-600 outline-none"
                                        />

                                    </div>

                                </div>

                            </div>

                            {/* Location Status */}
                            <div className="mt-4 flex items-center gap-2">

                                {formData.latitude && formData.longitude ? (
                                    <>
                                        <CheckCircle2
                                            size={16}
                                            className="text-emerald-600"
                                        />

                                        <span className="text-xs font-semibold text-emerald-700">
                                            GPS coordinates selected
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle
                                            size={16}
                                            className="text-amber-500"
                                        />

                                        <span className="text-xs font-medium text-slate-500">
                                            Location not selected yet
                                        </span>
                                    </>
                                )}

                            </div>

                        </div>

                        {/* Information Notice */}
                        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">

                            <Info
                                size={20}
                                className="mt-0.5 shrink-0 text-blue-600"
                            />

                            <div>
                                <h4 className="text-sm font-bold text-blue-900">
                                    Important Information
                                </h4>

                                <p className="mt-1 text-xs leading-6 text-blue-700">
                                    Your name and email are managed through your
                                    account and cannot be changed from this
                                    profile page.
                                </p>
                            </div>

                        </div>

                        {/* Form Actions */}
                        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={() => navigate("/customer/profile")}
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-black bg-white px-6 py-3 text-sm font-semibold text-slate-600 cursor-pointer transition hover:text-red-400 "
                            >
                                <X size={20} />
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving || locationLoading}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed  cursor-pointer"
                            >
                                {saving ? (
                                    <>
                                        <LoaderCircle
                                            size={18}
                                            className="animate-spin"
                                        />
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>

                        </div>

                    </form>

                </div>

                {/* Footer */}
                <footer className="py-7 text-center">
                    <p className="text-sm font-bold text-slate-600">
                        TechConnect
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Connecting local skills with local needs through technology.
                    </p>
                </footer>

            </div>
        </div>
    );
}

export default CustomerEditProfile;
