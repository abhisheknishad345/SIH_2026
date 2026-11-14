
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    Clock3,
    MapPin,
    UserRound,
    Wrench,
    IndianRupee,
    XCircle,
    CheckCircle2,
    AlertCircle,
    LoaderCircle,
    RefreshCw,
    ClipboardList,
    CalendarCheck,
    CalendarClock,
} from "lucide-react";

import api from "../services/api";

function MyBookings() {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [cancellingId, setCancellingId] = useState(null);
    const [error, setError] = useState("");

    // Fetch customer bookings
    const fetchBookings = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await api.get("/bookings/customer");

            setBookings(response.data.bookings || []);
        } catch (err) {
            console.error("Bookings fetch failed:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load your bookings."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // Cancel booking
    const cancelBooking = async (bookingId) => {
        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this booking?"
        );

        if (!confirmCancel) return;

        try {
            setError("");
            setCancellingId(bookingId);

            await api.put(`/bookings/${bookingId}/cancel`);

            await fetchBookings(true);
        } catch (err) {
            console.error("Booking cancellation failed:", err);

            setError(
                err.response?.data?.message ||
                "Unable to cancel booking."
            );
        } finally {
            setCancellingId(null);
        }
    };

    // Status configuration
    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                label: "Pending",
                icon: CalendarClock,
                className: "bg-amber-50 text-amber-700 border-amber-200",
                dot: "bg-amber-500",
            },
            accepted: {
                label: "Accepted",
                icon: CheckCircle2,
                className: "bg-blue-50 text-blue-700 border-blue-200",
                dot: "bg-blue-500",
            },
            completed: {
                label: "Completed",
                icon: CheckCircle2,
                className: "bg-emerald-50 text-emerald-700 border-emerald-200",
                dot: "bg-emerald-500",
            },
            rejected: {
                label: "Rejected",
                icon: XCircle,
                className: "bg-rose-50 text-rose-700 border-rose-200",
                dot: "bg-rose-500",
            },
            cancelled: {
                label: "Cancelled",
                icon: XCircle,
                className: "bg-slate-100 text-slate-600 border-slate-200",
                dot: "bg-slate-400",
            },
        };

        return configs[status] || {
            label: status || "Unknown",
            icon: AlertCircle,
            className: "bg-slate-100 text-slate-600 border-slate-200",
            dot: "bg-slate-400",
        };
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return "Not scheduled";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Invalid date";
        }

        return parsedDate.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
        }).replace(/\b(am|pm)\b/gi, (match) => match.toUpperCase());
    };

    const getPriceType = (priceType) => {
        const types = {
            per_hour: "Per Hour",
            per_day: "Per Day",
            per_visit: "Per Visit",
            fixed: "Fixed Price",
        };

        return types[priceType] || "Fixed Price";
    };

    // Duration is stored in minutes
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

    // Loading state
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">

                <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white px-10 py-9 shadow-sm">

                    <LoaderCircle
                        size={38}
                        className="animate-spin text-indigo-600"
                    />

                    <p className="mt-4 text-sm font-semibold text-slate-600">
                        Loading your bookings...
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">

            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">

                <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">

                    <button
                        type="button"
                        onClick={() => navigate("/customer")}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
                    >
                        <ArrowLeft size={18} />
                        <span>Dashboard</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/customer")}
                        className="flex cursor-pointer items-center gap-2"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-black text-white">
                            T
                        </div>

                        <span className="text-lg font-bold tracking-tight text-slate-900">
                            TechConnect
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => fetchBookings(true)}
                        disabled={refreshing}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={16}
                            className={refreshing ? "animate-spin" : ""}
                        />

                        <span className="hidden sm:inline">
                            Refresh
                        </span>
                    </button>

                </div>
            </nav>

            {/* Main */}
            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">

                {/* Page Header */}
                <section className="mb-8">

                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                        <ClipboardList size={15} />
                        YOUR ACTIVITY
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                My Bookings
                            </h1>

                            <p className="mt-3 text-sm text-slate-500 sm:text-base">
                                Manage and track all your service bookings.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/customer")}
                            className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                        >
                            <Wrench size={17} />
                            Book a Service
                        </button>

                    </div>

                </section>

                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">

                        <AlertCircle
                            size={20}
                            className="mt-0.5 shrink-0 text-rose-600"
                        />

                        <div className="flex-1">
                            <p className="text-sm font-bold text-rose-800">
                                Something went wrong
                            </p>

                            <p className="mt-1 text-sm text-rose-700">
                                {error}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            className="cursor-pointer text-rose-500 hover:text-rose-700"
                        >
                            <XCircle size={18} />
                        </button>

                    </div>
                )}

                {/* Booking Summary */}
                <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <CalendarDays size={23} />
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Total Bookings
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {bookings.length}
                            </p>
                        </div>

                    </div>

                    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <CalendarCheck size={23} />
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Completed Bookings
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {bookings.filter(
                                    (booking) => booking.status === "completed"
                                ).length}
                            </p>
                        </div>

                    </div>

                </section>

                {/* Empty State */}
                {!loading && bookings.length === 0 && (

                    <section className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
                            <CalendarDays size={38} />
                        </div>

                        <h2 className="mt-6 text-xl font-bold text-slate-900">
                            No bookings yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                            You haven't booked any services yet.
                            Explore available services and find the right professional.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/customer")}
                            className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                            Browse Services
                            <ArrowRight size={17} />
                        </button>

                    </section>

                )}

                {/* Booking Cards */}
                {bookings.length > 0 && (

                    <section className="space-y-5">

                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">
                                Booking History
                            </h2>

                            <span className="text-xs font-medium text-slate-400">
                                {bookings.length} records
                            </span>
                        </div>

                        {bookings.map((booking) => {

                            const status = getStatusConfig(booking.status);
                            const StatusIcon = status.icon;

                            return (
                                <article
                                    key={booking._id}
                                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50"
                                >

                                    {/* Card Header */}
                                    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:px-7">

                                        <div className="flex items-start gap-4">

                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                                <Wrench size={23} />
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="text-lg font-bold text-slate-900">
                                                    {booking.serviceId?.name || "Service"}
                                                </h3>

                                                <p className="mt-1 text-sm font-medium text-indigo-600">
                                                    {booking.skillName || "Service Skill"}
                                                </p>

                                                <p className="mt-2 text-xs text-slate-400">
                                                    Booking ID: {booking._id}
                                                </p>
                                            </div>

                                        </div>

                                        {/* Status */}
                                        <span className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                            <StatusIcon size={14} />
                                            {status.label}
                                        </span>

                                    </div>

                                    {/* Card Body */}
                                    <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:px-7 sm:py-6">

                                        {/* Worker */}
                                        <div className="flex items-start gap-3">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                <UserRound size={19} />
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium text-slate-400">
                                                    Technician
                                                </p>

                                                <p className="mt-1 text-sm font-bold text-slate-800">
                                                    {booking.workerId?.fullName || "Worker"}
                                                </p>
                                            </div>

                                        </div>

                                        {/* Schedule */}
                                        <div className="flex items-start gap-3">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                                <CalendarDays size={19} />
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium text-slate-400">
                                                    Scheduled Date & Time
                                                </p>

                                                <p className="mt-1 text-sm font-bold text-slate-800">
                                                    {formatDate(booking.scheduledAt)}
                                                </p>
                                            </div>

                                        </div>

                                        {/* Duration */}
                                        <div className="flex items-start gap-3">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                                <Clock3 size={19} />
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium text-slate-400">
                                                    Duration
                                                </p>

                                                <p className="mt-1 text-sm font-bold text-slate-800">
                                                    {formatDuration(booking.duration)}
                                                </p>
                                            </div>

                                        </div>

                                        {/* Price */}
                                        <div className="flex items-start gap-3">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                                <IndianRupee size={19} />
                                            </div>

                                            <div>
                                                <p className="text-gray-700 uppercase text-xs">
                                                    Amount
                                                </p>

                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <p className="font-bold text-gray-900 text-md">
                                                        ₹{booking.price ?? 0}
                                                    </p>

                                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        {getPriceType(booking.serviceId?.priceType)}
                                                    </span>
                                                </div>
                                            </div>

                                        </div>

                                    </div>

                                    {/* Address */}
                                    {booking.address && (
                                        <div className="mx-5 mb-5 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 sm:mx-7">

                                            <MapPin
                                                size={19}
                                                className="mt-0.5 shrink-0 text-slate-400"
                                            />

                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                    Service Address
                                                </p>

                                                <p className="mt-1 text-sm leading-6 text-slate-700">
                                                    {booking.address}
                                                </p>
                                            </div>

                                        </div>
                                    )}

                                    {/* Card Footer */}
                                    {booking.status === "pending" && (
                                        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">

                                            <p className="text-xs text-slate-500">
                                                Your booking is awaiting technician confirmation.
                                            </p>

                                            <button
                                                type="button"
                                                onClick={() => cancelBooking(booking._id)}
                                                disabled={cancellingId === booking._id}
                                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {cancellingId === booking._id ? (
                                                    <>
                                                        <LoaderCircle
                                                            size={16}
                                                            className="animate-spin"
                                                        />
                                                        Cancelling...
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle size={16} />
                                                        Cancel Booking
                                                    </>
                                                )}
                                            </button>

                                        </div>
                                    )}

                                    {booking.status === "accepted" && (
                                        <div className="flex items-center gap-2 border-t border-blue-100 bg-blue-50/60 px-5 py-4 text-xs font-medium text-blue-700 sm:px-7">
                                            <CheckCircle2 size={16} />
                                            Your booking has been accepted by the technician.
                                        </div>
                                    )}

                                    {booking.status === "completed" && (
                                        <div className="flex items-center gap-2 border-t border-emerald-100 bg-emerald-50/60 px-5 py-4 text-xs font-medium text-emerald-700 sm:px-7">
                                            <CheckCircle2 size={16} />
                                            This service booking has been completed.
                                        </div>
                                    )}

                                    {booking.status === "rejected" && (
                                        <div className="flex items-center gap-2 border-t border-rose-100 bg-rose-50/60 px-5 py-4 text-xs font-medium text-rose-700 sm:px-7">
                                            <XCircle size={16} />
                                            This booking was rejected by the technician.
                                        </div>
                                    )}

                                    {booking.status === "cancelled" && (
                                        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 text-xs font-medium text-slate-600 sm:px-7">
                                            <AlertCircle size={16} />
                                            This booking has been cancelled.
                                        </div>
                                    )}

                                </article>
                            );
                        })}

                    </section>
                )}

                {/* Footer */}
                <footer className="mt-12 border-t border-slate-200 py-7 text-center">
                    <p className="text-sm font-bold text-slate-600">
                        TechConnect
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Connecting local skills with local needs through technology.
                    </p>
                </footer>

            </main>
        </div>
    );
}

export default MyBookings;
