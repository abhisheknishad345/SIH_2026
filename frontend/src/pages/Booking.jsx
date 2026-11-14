
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
    ArrowLeft,
    ArrowRight,
    Wrench,
    UserRound,
    IndianRupee,
    CalendarDays,
    Clock3,
    MapPin,
    Navigation,
    LocateFixed,
    CheckCircle2,
    AlertCircle,
    LoaderCircle,
    ClipboardCheck,
    ShieldCheck,
    BriefcaseBusiness,
    Info,
} from "lucide-react";

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
        duration: 60,
        address: "",
    });

    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Fetch selected service and worker
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [servicesResponse, workersResponse] =
                    await Promise.all([
                        api.get("/services"),
                        api.get(`/services/${serviceId}/workers`),
                    ]);

                const selectedService =
                    servicesResponse.data.services.find(
                        (item) => item._id === serviceId
                    );

                const selectedWorker =
                    workersResponse.data.workers.find(
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
                console.error("Booking details error:", err);

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

    // Handle form inputs
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
    const getLocation = () => {
        setError("");

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        setLocationLoading(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    type: "Point",
                    coordinates: [
                        position.coords.longitude,
                        position.coords.latitude,
                    ],
                });

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

    // Submit booking
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!location) {
            setError("Please provide your current location.");
            return;
        }

        if (!formData.scheduledAt) {
            setError("Please select your booking date and time.");
            return;
        }

        if (!formData.address.trim()) {
            setError("Please enter your service address.");
            return;
        }

        if (
            service?.priceType !== "fixed" &&
            Number(formData.quantity) < 1
        ) {
            setError("Please enter a valid quantity.");
            return;
        }

        setBookingLoading(true);

        try {
            const response = await api.post("/bookings", {
                workerId,
                serviceId,
                skillName: formData.skillName,
                quantity:
                    service?.priceType === "fixed"
                        ? 1
                        : Number(formData.quantity),
                scheduledAt: new Date(formData.scheduledAt),
                duration: Number(formData.duration),
                address: formData.address.trim(),
                location,
            });

            console.log("Booking created:", response.data);

            setSuccess("Booking created successfully!");

            setTimeout(() => {
                navigate("/customer/bookings");
            }, 1200);
        } catch (err) {
            console.error("Booking creation failed:", err);

            setError(
                err.response?.data?.message ||
                "Unable to create booking."
            );
        } finally {
            setBookingLoading(false);
        }
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

    const getQuantityLabel = () => {
        if (service?.priceType === "per_hour") return "Number of Hours";
        if (service?.priceType === "per_day") return "Number of Days";
        return "Number of Visits";
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
                        Loading booking details...
                    </p>
                </div>
            </div>
        );
    }

    // Invalid booking details
    if (error && (!service || !worker)) {
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
                        Booking Details Not Available
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                        <ArrowLeft size={17} />
                        Go Back
                    </button>
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
                        onClick={() => navigate(-1)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
                    >
                        <ArrowLeft size={18} />
                        Back
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

                    <div className="hidden items-center gap-2 text-xs font-semibold text-emerald-700 sm:flex">
                        <ShieldCheck size={17} />
                        Secure Booking
                    </div>

                </div>
            </nav>

            {/* Main */}
            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">

                {/* Page Header */}
                <section className="mb-8">

                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                        <ClipboardCheck size={15} />
                        SERVICE REQUEST
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Book Your Service
                    </h1>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                        Schedule your service with a professional.
                        Provide the required details to confirm your booking.
                    </p>

                </section>

                <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-5">

                    {/* Left: Booking Form */}
                    <div className="lg:col-span-3">

                        <form
                            onSubmit={handleSubmit}
                            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                        >

                            {/* Form Header */}
                            <div className="border-b border-slate-100 px-5 py-6 sm:px-8">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <CalendarDays size={22} />
                                    </div>

                                    <div>
                                        <h2 className="font-bold text-slate-900">
                                            Booking Details
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Fill in your service requirements
                                        </p>
                                    </div>

                                </div>

                            </div>

                            <div className="space-y-7 p-5 sm:p-8">

                                {/* Error */}
                                {error && (
                                    <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                                        <AlertCircle
                                            size={20}
                                            className="mt-0.5 shrink-0 text-rose-600"
                                        />

                                        <p className="text-sm leading-6 text-rose-700">
                                            {error}
                                        </p>
                                    </div>
                                )}

                                {/* Success */}
                                {success && (
                                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                        <CheckCircle2
                                            size={21}
                                            className="shrink-0 text-emerald-600"
                                        />

                                        <p className="text-sm font-semibold text-emerald-700">
                                            {success}
                                        </p>
                                    </div>
                                )}

                                {/* Skill */}
                                <div>
                                    <label
                                        htmlFor="skillName"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Select Skill
                                    </label>

                                    <div className="relative">
                                        <Wrench
                                            size={18}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <select
                                            id="skillName"
                                            name="skillName"
                                            value={formData.skillName}
                                            onChange={handleChange}
                                            className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                            required
                                        >
                                            {worker?.skills?.map((skill) => (
                                                <option
                                                    key={skill._id || skill.name}
                                                    value={skill.name}
                                                >
                                                    {skill.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Quantity */}
                                {service?.priceType !== "fixed" && (
                                    <div>
                                        <label
                                            htmlFor="quantity"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            {getQuantityLabel()}
                                        </label>

                                        <div className="relative">
                                            <BriefcaseBusiness
                                                size={18}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                id="quantity"
                                                type="number"
                                                name="quantity"
                                                min="1"
                                                value={formData.quantity}
                                                onChange={handleChange}
                                                placeholder="Enter quantity"
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                                required
                                            />
                                        </div>

                                        <p className="mt-2 text-xs text-slate-400">
                                            Enter the required number of {service?.priceType === "per_hour" ? "hours" : service?.priceType === "per_day" ? "days" : "visits"}.
                                        </p>
                                    </div>
                                )}

                                {/* Schedule */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Schedule Date & Time
                                    </label>

                                    <div className="relative">
                                        <CalendarDays
                                            size={18}
                                            className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                                        />

                                        <DatePicker
                                            selected={
                                                formData.scheduledAt
                                                    ? new Date(formData.scheduledAt)
                                                    : null
                                            }
                                            onChange={(date) => {
                                                const localDate = date
                                                    ? `${date.getFullYear()}-${String(
                                                        date.getMonth() + 1
                                                    ).padStart(2, "0")}-${String(
                                                        date.getDate()
                                                    ).padStart(2, "0")}T${String(
                                                        date.getHours()
                                                    ).padStart(2, "0")}:${String(
                                                        date.getMinutes()
                                                    ).padStart(2, "0")}`
                                                    : "";

                                                setFormData((prev) => ({
                                                    ...prev,
                                                    scheduledAt: localDate,
                                                }));

                                                setError("");
                                            }}
                                            showTimeSelect
                                            timeIntervals={30}
                                            dateFormat="dd MMM yyyy, h:mm aa"
                                            minDate={new Date()}
                                            filterTime={(time) =>
                                                time.getTime() > Date.now()
                                            }
                                            placeholderText="Select date and time"
                                            autoComplete="off"
                                            required
                                            className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                            wrapperClassName="w-full"
                                            calendarClassName="booking-calendar"
                                        />
                                    </div>

                                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                                        <Info size={14} />
                                        Choose your preferred service date and time.
                                    </p>
                                </div>

                                {/* Duration */}
                                <div>
                                    <label
                                        htmlFor="duration"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Estimated Duration
                                    </label>

                                    <div className="relative">
                                        <Clock3
                                            size={18}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <select
                                            id="duration"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleChange}
                                            className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                            required
                                        >
                                            <option value="60">1 Hour</option>
                                            <option value="120">2 Hours</option>
                                            <option value="180">3 Hours</option>
                                            <option value="240">4 Hours</option>
                                            <option value="360">6 Hours</option>
                                            <option value="480">8 Hours</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <label
                                        htmlFor="address"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Service Address
                                    </label>

                                    <div className="relative">
                                        <MapPin
                                            size={18}
                                            className="absolute left-4 top-4 text-slate-400"
                                        />

                                        <textarea
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Enter your complete service address"
                                            rows={3}
                                            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* GPS Location */}
                                <div>
                                    <div className="mb-3">
                                        <label className="block text-sm font-semibold text-slate-700">
                                            Current Location
                                        </label>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Required to find and coordinate nearby services.
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">

                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                                                    <LocateFixed size={21} />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {location
                                                            ? "Location Added"
                                                            : "Share Your Location"}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {location
                                                            ? "Your GPS coordinates are ready."
                                                            : "Allow browser location permission."}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={getLocation}
                                                disabled={locationLoading}
                                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                                                        {location
                                                            ? "Refresh Location"
                                                            : "Use My Location"}
                                                    </>
                                                )}
                                            </button>

                                        </div>

                                        {location && (
                                            <div className="mt-4 flex items-center gap-2 border-t border-indigo-100 pt-3 text-xs font-semibold text-emerald-700">
                                                <CheckCircle2 size={16} />
                                                Location successfully captured
                                            </div>
                                        )}

                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="border-t border-slate-100 pt-6">

                                    <button
                                        type="submit"
                                        disabled={bookingLoading || locationLoading}
                                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {bookingLoading ? (
                                            <>
                                                <LoaderCircle
                                                    size={19}
                                                    className="animate-spin"
                                                />
                                                Creating Booking...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={19} />
                                                Confirm Booking
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>

                                    <p className="mt-3 text-center text-xs text-slate-400">
                                        Please verify your details before confirming.
                                    </p>

                                </div>

                            </div>
                        </form>

                    </div>

                    {/* Right: Booking Summary */}
                    <aside className="space-y-5 lg:sticky lg:top-24 lg:col-span-2">

                        {/* Service Summary */}
                        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                            <div className="bg-linear-to-r from-indigo-600 to-blue-600 px-5 py-5 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                                        <ClipboardCheck size={21} />
                                    </div>

                                    <div>
                                        <h2 className="font-bold">
                                            Booking Summary
                                        </h2>

                                        <p className="mt-0.5 text-xs text-indigo-100">
                                            Review your selected service
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5 p-5">

                                {/* Service */}
                                <div className="flex items-start gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <Wrench size={23} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-slate-400">
                                            SELECTED SERVICE
                                        </p>

                                        <h3 className="mt-1 text-lg font-bold text-slate-900">
                                            {service?.name}
                                        </h3>

                                        <span className="mt-2 inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                            {service?.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100" />

                                {/* Worker */}
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                        <UserRound size={21} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-slate-400">
                                            YOUR TECHNICIAN
                                        </p>

                                        <p className="mt-1 truncate text-sm font-bold text-slate-800">
                                            {workerName || worker?.userId?.fullName || "Selected Worker"}
                                        </p>
                                    </div>

                                    <ShieldCheck
                                        size={19}
                                        className="shrink-0 text-emerald-600"
                                    />
                                </div>

                                <div className="h-px bg-slate-100" />

                                {/* Price */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <IndianRupee size={17} />
                                        Service Price
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xl font-bold text-slate-900">
                                            ₹{service?.price ?? 0}
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                            {getPriceType(service?.priceType)}
                                        </p>
                                    </div>
                                </div>

                                {service?.priceType !== "fixed" && (
                                    <div className="rounded-xl bg-slate-50 p-3">
                                        <p className="text-xs leading-5 text-slate-500">
                                            Final service charges may depend on the selected quantity and applicable service terms.
                                        </p>
                                    </div>
                                )}

                            </div>
                        </section>

                        {/* Information Card */}
                        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">

                            <div className="flex items-start gap-3">
                                <ShieldCheck
                                    size={21}
                                    className="mt-0.5 shrink-0 text-emerald-600"
                                />

                                <div>
                                    <h3 className="text-sm font-bold text-emerald-900">
                                        Booking Information
                                    </h3>

                                    <p className="mt-2 text-xs leading-6 text-emerald-800">
                                        Your booking request will be sent to the selected technician. The booking status can be tracked from My Bookings.
                                    </p>
                                </div>
                            </div>

                        </section>

                        <button
                            type="button"
                            onClick={() => navigate("/customer/bookings")}
                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                            <CalendarDays size={17} />
                            View My Bookings
                        </button>

                    </aside>

                </div>

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

export default Booking;
