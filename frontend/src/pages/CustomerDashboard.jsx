
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    UserRound,
    CalendarDays,
    LogOut,
    ArrowRight,
    Wrench,
    RefreshCw,
    BriefcaseBusiness,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function CustomerDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");

    // Fetch available services
    const fetchServices = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/services");

            setServices(response.data.services || []);
        } catch (err) {
            console.error("Failed to fetch services:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load services. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    // Logout
    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login", { replace: true });
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    // Get unique categories dynamically
    const categories = useMemo(() => {
        return [
            ...new Set(
                services
                    .map((service) => service.category)
                    .filter(Boolean)
            ),
        ].sort();
    }, [services]);

    // Filter services
    const filteredServices = useMemo(() => {
        return services.filter((service) => {
            const serviceName = service.name || "";
            const serviceCategory = service.category || "";

            const matchesSearch = serviceName
                .toLowerCase()
                .includes(search.trim().toLowerCase());

            const matchesCategory =
                category === "all" ||
                serviceCategory === category;

            return matchesSearch && matchesCategory;
        });
    }, [services, search, category]);

    // Format price type
    const getPriceType = (priceType) => {
        const types = {
            per_hour: "Per Hour",
            per_day: "Per Day",
            per_visit: "Per Visit",
            fixed: "Fixed Price",
        };

        return types[priceType] || "Fixed Price";
    };

    const clearFilters = () => {
        setSearch("");
        setCategory("all");
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">

            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    <div className="flex h-18 items-center justify-between">

                        {/* Logo */}
                        <button
                            onClick={() => navigate("/customer")}
                            className="flex items-center gap-3"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl font-black text-white shadow-md shadow-indigo-200">
                                T
                            </div>

                            <div className="text-left">
                                <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                                    TechConnect
                                </h1>

                                <p className="hidden text-[11px] font-medium text-slate-500 sm:block">
                                    Services Made Simple
                                </p>
                            </div>
                        </button>

                        {/* Navigation */}
                        <div className="flex items-center gap-1 sm:gap-2">

                            <button
                                onClick={() => navigate("/customer/bookings")}
                                className="flex items-center gap-2 rounded-xl px-2.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer sm:px-4"
                            >
                                <CalendarDays size={18} />
                                <span className="hidden sm:inline">
                                    My Bookings
                                </span>
                            </button>

                            <button
                                onClick={() => navigate("/customer/profile")}
                                className="flex items-center gap-2 rounded-xl px-2.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600 sm:px-4 cursor-pointer"
                            >
                                <UserRound size={18} />
                                <span className="hidden sm:inline">
                                    My Profile
                                </span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 sm:px-4 cursor-pointer"
                            >
                                <LogOut size={17} />
                                <span className="hidden sm:inline">
                                    Logout
                                </span>
                            </button>

                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

                {/* Welcome Section */}
                <section className="relative mb-10 overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-indigo-600 to-blue-700 px-6 py-10 text-white shadow-lg shadow-indigo-200 sm:px-10 sm:py-12">

                    {/* Background decoration */}
                    <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-35 border-white/10" />

                    <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-white/5" />

                    <div className="relative z-10 max-w-2xl">

                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-indigo-50">
                            <span className="h-2 w-2 rounded-full bg-green-300" />
                            WELCOME TO TECHCONNECT
                        </div>

                        <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                            What service do you need today?
                        </h2>

                        <p className="mt-4 max-w-xl text-sm leading-7 text-indigo-100 sm:text-base">
                            Find skilled professionals around you.
                            Explore services and connect with the right
                            technician for your needs.
                        </p>

                        <button
                            onClick={() => {
                                document.getElementById("services-section")
                                    ?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50 cursor-pointer"
                        >
                            Explore Services
                            <ArrowRight size={17} />
                        </button>

                    </div>
                </section>

                {/* Services Section */}
                <section id="services-section">

                    {/* Section Header */}
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                        <div>
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-indigo-600">
                                EXPLORE OUR SERVICES
                            </p>

                            <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Available Services
                            </h3>

                            <p className="mt-2 text-sm text-slate-500 sm:text-base">
                                Choose a service and find a professional.
                            </p>
                        </div>

                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2">
                            <BriefcaseBusiness
                                size={16}
                                className="text-indigo-600"
                            />

                            <span className="text-sm font-semibold text-indigo-700">
                                {filteredServices.length} Services
                            </span>
                        </div>

                    </div>

                    {/* Search and Filters */}
                    <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                            {/* Search */}
                            <div className="md:col-span-2">

                                <label
                                    htmlFor="service-search"
                                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500"
                                >
                                    Search Service
                                </label>

                                <div className="relative">

                                    <Search
                                        size={19}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="service-search"
                                        type="text"
                                        placeholder="Search Plumber, Electrician, Carpenter..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                    />

                                </div>
                            </div>

                            {/* Category */}
                            <div>

                                <label
                                    htmlFor="service-category"
                                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500"
                                >
                                    Category
                                </label>

                                <select
                                    id="service-category"
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(e.target.value)
                                    }
                                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                >
                                    <option value="all">
                                        All Categories
                                    </option>

                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}

                                </select>
                            </div>

                        </div>

                        {(search || category !== "all") && (
                            <div className="mt-4 flex justify-end">

                                <button
                                    onClick={clearFilters}
                                    className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
                                >
                                    Clear Filters
                                </button>

                            </div>
                        )}

                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20">

                            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

                            <p className="text-sm font-medium text-slate-600">
                                Loading available services...
                            </p>

                        </div>
                    )}

                    {/* Error State */}
                    {!loading && error && (
                        <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center sm:p-12">

                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
                                <RefreshCw
                                    size={25}
                                    className="text-rose-500"
                                />
                            </div>

                            <h4 className="font-bold text-slate-900">
                                Something went wrong
                            </h4>

                            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                                {error}
                            </p>

                            <button
                                onClick={fetchServices}
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                            >
                                <RefreshCw size={16} />
                                Try Again
                            </button>

                        </div>
                    )}

                    {/* No Services Available */}
                    {!loading && !error && services.length === 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">

                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                                <Wrench
                                    size={30}
                                    className="text-indigo-600"
                                />
                            </div>

                            <h4 className="text-lg font-bold text-slate-900">
                                No services available
                            </h4>

                            <p className="mt-2 text-sm text-slate-500">
                                Please check again later.
                            </p>

                        </div>
                    )}

                    {/* No Filter Results */}
                    {!loading &&
                        !error &&
                        services.length > 0 &&
                        filteredServices.length === 0 && (
                            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">

                                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                                    <Search
                                        size={28}
                                        className="text-slate-400"
                                    />
                                </div>

                                <h4 className="text-lg font-bold text-slate-900">
                                    No services found
                                </h4>

                                <p className="mt-2 text-sm text-slate-500">
                                    Try changing your search or category.
                                </p>

                                <button
                                    onClick={clearFilters}
                                    className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                >
                                    Clear Filters
                                </button>

                            </div>
                        )}

                    {/* Service Cards */}
                    {!loading &&
                        !error &&
                        filteredServices.length > 0 && (

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                                {filteredServices.map((service) => (

                                    <div
                                        key={service._id}
                                        className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/60"
                                    >

                                        {/* Card Header */}
                                        <div className="flex items-start justify-between gap-3">

                                            <div className="min-w-0">

                                                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                                                    <Wrench size={21} />
                                                </div>

                                                <h4 className="truncate text-lg font-bold text-slate-900">
                                                    {service.name}
                                                </h4>

                                                <span className="mt-2 inline-flex rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                                    {service.category}
                                                </span>

                                            </div>

                                            {/* Price */}
                                            <div className="shrink-0 rounded-xl bg-slate-50 px-3 py-2 text-right">

                                                <p className="text-lg font-bold text-slate-900">
                                                    ₹{service.price ?? 0}
                                                </p>

                                                <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                                                    {getPriceType(service.priceType)}
                                                </p>

                                            </div>

                                        </div>

                                        {/* Description */}
                                        <div className="my-5 h-px bg-slate-100" />

                                        <p className="min-h-12 text-sm leading-6 text-slate-500 line-clamp-2">
                                            {service.description ||
                                                "Professional service for your everyday needs."}
                                        </p>

                                        {/* Cooperative */}
                                        {service.cooperativeId && (
                                            <div className="mt-5 flex items-start gap-2 rounded-xl bg-slate-50 p-3">

                                                <BriefcaseBusiness
                                                    size={16}
                                                    className="mt-0.5 shrink-0 text-slate-400"
                                                />

                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-medium text-slate-400">
                                                        PROVIDED BY
                                                    </p>

                                                    <p className="truncate text-xs font-semibold text-slate-700">
                                                        {service.cooperativeId.name}
                                                    </p>
                                                </div>

                                            </div>
                                        )}

                                        {/* Action */}
                                        <div className="mt-auto pt-6">

                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/services/${service._id}/workers`
                                                    )
                                                }
                                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98] cursor-pointer"
                                            >
                                                Find Workers
                                                <ArrowRight size={17} />
                                            </button>

                                        </div>

                                    </div>

                                ))}

                            </div>
                        )}

                </section>

                {/* Footer */}
                <footer className="mt-16 border-t border-slate-200 py-7 text-center">

                    <p className="text-sm font-semibold text-slate-600">
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

export default CustomerDashboard;
