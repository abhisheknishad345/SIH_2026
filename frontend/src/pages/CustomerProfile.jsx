

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    UserRound,
    Mail,
    Phone,
    MapPin,
    Navigation,
    ShieldCheck,
    Pencil,
    AlertCircle,
    LoaderCircle,
    Home,
    BadgeCheck,
    CalendarDays,
} from "lucide-react";

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

    // Loading State
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-10 py-9 shadow-sm">
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

    // Error State
    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50">
                        <AlertCircle
                            size={32}
                            className="text-rose-500"
                        />
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-slate-900">
                        Unable to Load Profile
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {error}
                    </p>

                    <button
                        onClick={() => navigate("/customer")}
                        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                        <ArrowLeft size={17} />
                        Back to Dashboard
                    </button>

                </div>
            </div>
        );
    }

    const coordinates = customer?.location?.coordinates || [];

    const longitude =
        coordinates.length === 2 ? coordinates[0] : null;

    const latitude =
        coordinates.length === 2 ? coordinates[1] : null;

    const fullName = customer?.userId?.fullName || "Customer";
    const email = customer?.userId?.email || "Email not available";
    const phone = customer?.phone || "Not provided";
    const address = customer?.address || "Address not provided";
    const role = customer?.userId?.role || "customer";

    // Reusable information card
    const InfoCard = ({ icon: Icon, label, value, iconColor = "text-indigo-600" }) => (
        <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-indigo-100 hover:bg-indigo-50/40">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <Icon size={20} className={iconColor} />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {label}
                </p>

                <p className="mt-1 wrap-break text-sm font-semibold text-slate-800">
                    {value}
                </p>
            </div>

        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-5xl">

                {/* Top Navigation */}
                <div className="mb-7 flex items-center justify-between">

                    <button
                        onClick={() => navigate("/customer")}
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-indigo-600 cursor-pointer"
                    >
                        <ArrowLeft size={18} />
                        Dashboard
                    </button>

                    <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                            T
                        </span>
                        TechConnect
                    </span>

                </div>

                {/* Profile Hero */}
                <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-indigo-600 to-blue-700 p-6 text-white shadow-lg shadow-indigo-200 sm:p-9">

                    <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-35 border-white/10" />

                    <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-5">

                            {/* Avatar */}
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/15 shadow-inner sm:h-24 sm:w-24">
                                <UserRound size={45} strokeWidth={1.5} />
                            </div>

                            <div className="min-w-0">

                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-100">
                                    My Account
                                </p>

                                <h1 className="truncate text-2xl font-bold sm:text-3xl">
                                    {fullName}
                                </h1>

                                <p className="mt-1 truncate text-sm text-indigo-100">
                                    {email}
                                </p>

                                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold">
                                    <BadgeCheck size={14} />
                                    Customer Account
                                </div>

                            </div>

                        </div>

                        <button
                            onClick={() => navigate("/customer/edit-profile")}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50 cursor-pointer"
                        >
                            <Pencil size={17} />
                            Edit Profile
                        </button>

                    </div>
                </section>

                {/* Profile Content */}
                <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* Left Column */}
                    <div className="space-y-6 lg:col-span-2">

                        {/* Contact Information */}
                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

                            <div className="mb-6 flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <UserRound size={21} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        Contact Information
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Your personal contact details
                                    </p>
                                </div>

                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <InfoCard
                                    icon={UserRound}
                                    label="Full Name"
                                    value={fullName}
                                />

                                <InfoCard
                                    icon={Mail}
                                    label="Email Address"
                                    value={email}
                                />

                                <div className="sm:col-span-2">
                                    <InfoCard
                                        icon={Phone}
                                        label="Phone Number"
                                        value={phone}
                                        iconColor="text-emerald-600"
                                    />
                                </div>

                            </div>
                        </section>

                        {/* Address */}
                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

                            <div className="mb-6 flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                    <Home size={21} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        Saved Address
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Your preferred service location
                                    </p>
                                </div>

                            </div>

                            <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                                    <MapPin
                                        size={21}
                                        className="text-orange-500"
                                    />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Home Address
                                    </p>

                                    <p className="mt-2 text-sm font-medium leading-7 text-slate-700">
                                        {address}
                                    </p>
                                </div>

                            </div>

                        </section>

                        {/* Location */}
                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

                            <div className="mb-6 flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <Navigation size={21} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        Geographical Location
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Your saved GPS coordinates
                                    </p>
                                </div>

                            </div>

                            {latitude !== null && longitude !== null ? (

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    <InfoCard
                                        icon={MapPin}
                                        label="Latitude"
                                        value={latitude}
                                        iconColor="text-emerald-600"
                                    />

                                    <InfoCard
                                        icon={Navigation}
                                        label="Longitude"
                                        value={longitude}
                                        iconColor="text-emerald-600"
                                    />

                                </div>

                            ) : (

                                <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-5">

                                    <MapPin
                                        size={22}
                                        className="shrink-0 text-amber-600"
                                    />

                                    <p className="text-sm font-medium text-amber-800">
                                        Location has not been provided.
                                    </p>

                                </div>

                            )}

                        </section>

                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">

                        {/* Account Status */}
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                            <div className="mb-6 flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <ShieldCheck size={22} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        Account Status
                                    </h2>

                                    <p className="text-xs text-slate-500">
                                        Account information
                                    </p>
                                </div>

                            </div>

                            <div className="space-y-4">

                                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">

                                    <span className="text-sm text-slate-500">
                                        Account Type
                                    </span>

                                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold capitalize text-indigo-700">
                                        {role}
                                    </span>

                                </div>

                                <div className="flex items-center justify-between gap-3">

                                    <span className="text-sm text-slate-500">
                                        Profile Status
                                    </span>

                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        Active
                                    </span>

                                </div>

                            </div>

                        </section>

                        {/* Quick Actions */}
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                            <h2 className="font-bold text-slate-900">
                                Quick Actions
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Manage your account
                            </p>

                            <div className="mt-5 space-y-3">

                                <button
                                    onClick={() => navigate("/customer/edit-profile")}
                                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
                                >
                                    <span className="flex items-center gap-3">
                                        <Pencil size={17} />
                                        Edit Profile
                                    </span>

                                    <ArrowLeft
                                        size={16}
                                        className="rotate-180"
                                    />
                                </button>

                                <button
                                    onClick={() => navigate("/customer/bookings")}
                                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
                                >
                                    <span className="flex items-center gap-3">
                                        <CalendarDays size={17} />
                                        My Bookings
                                    </span>

                                    <ArrowLeft
                                        size={16}
                                        className="rotate-180"
                                    />
                                </button>

                                <button
                                    onClick={() => navigate("/customer")}
                                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
                                >
                                    <span className="flex items-center gap-3">
                                        <Home size={17} />
                                        Dashboard
                                    </span>

                                    <ArrowLeft
                                        size={16}
                                        className="rotate-180"
                                    />
                                </button>

                            </div>

                        </section>

                    </div>

                </div>

                {/* Footer */}
                <footer className="mt-10 border-t border-slate-200 py-7 text-center">

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

export default CustomerProfile;
