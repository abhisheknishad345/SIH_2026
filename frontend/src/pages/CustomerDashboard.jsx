import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CustomerDashboard() {
    const navigate = useNavigate();

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filter states
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await api.get("/services");

                setServices(response.data.services || []);
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.message ||
                    "Unable to load services."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // Get unique categories
    const categories = [
        ...new Set(services.map((service) => service.category))
    ];

    // Filter services
    const filteredServices = services.filter((service) => {
        const matchesSearch = service.name
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesCategory =
            category === "all" || service.category === category;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white">

            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-5 sm:px-8">
                    <div className="h-20 flex items-center justify-between">

                        {/* Logo */}
                        <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => navigate("/customer")}
                        >
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                <span className="text-lg font-black">
                                    T
                                </span>
                            </div>

                            <div>
                                <h1 className="text-xl font-bold tracking-tight">
                                    TechConnect
                                </h1>
                                <p className="hidden sm:block text-[11px] text-slate-500">
                                    Services Made Simple
                                </p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center gap-2 sm:gap-3">

                            <button
                                onClick={() => navigate("/customer/bookings")}
                                className="hidden sm:block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
                            >
                                My Bookings
                            </button>

                            <button
                                onClick={() => navigate("/customer/profile")}
                                className="hidden sm:block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
                            >
                                My Profile
                            </button>

                            <button
                                onClick={handleLogout}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-slate-900 hover:bg-slate-200 transition cursor-pointer"
                            >
                                Logout
                            </button>

                        </div>
                    </div>
                </div>
            </nav>

            {/* Main */}
            <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10">

                {/* Greeting */}
                <section className="mb-10">

                    <div className="max-w-2xl">

                        <p className="text-sm font-semibold text-indigo-400 mb-3">
                            WELCOME BACK
                        </p>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                            What service do you need today?
                        </h2>

                        <p className="text-slate-400 mt-4 text-base sm:text-lg">
                            Find trusted professionals for your everyday needs.
                        </p>

                    </div>

                </section>

                {/* Services */}
                <section>

                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">

                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white">
                                Available Services
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                                Choose a service and find a professional
                            </p>
                        </div>

                        <div className="self-start sm:self-auto px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <span className="text-sm text-slate-300">
                                {filteredServices.length} services
                            </span>
                        </div>

                    </div>

                    {/* Filters */}
                    <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-slate-900 border border-white/10 shadow-xl shadow-black/10">

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            {/* Search */}
                            <div className="md:col-span-2">

                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                                    Search Service
                                </label>

                                <div className="relative">

                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                        <svg
                                            className="w-5 h-5 text-slate-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                                            />
                                        </svg>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Search plumber, electrician, carpenter..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
                                    />

                                </div>

                            </div>

                            {/* Category */}
                            <div>

                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                                    Category
                                </label>

                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-xl bg-slate-800 border border-white/10 text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition cursor-pointer"
                                >
                                    <option
                                        value="all"
                                        className="bg-slate-800"
                                    >
                                        All Categories
                                    </option>

                                    {categories.map((cat) => (
                                        <option
                                            key={cat}
                                            value={cat}
                                            className="bg-slate-800"
                                        >
                                            {cat}
                                        </option>
                                    ))}

                                </select>

                            </div>

                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">

                            <div className="w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mb-4" />

                            <p className="text-slate-400 text-sm">
                                Loading services...
                            </p>

                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="border border-red-500/20 bg-red-500/10 text-red-400 p-5 rounded-2xl">
                            <p className="font-semibold">
                                Something went wrong
                            </p>

                            <p className="text-sm mt-1 text-red-400/80">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* No services from API */}
                    {!loading && !error && services.length === 0 && (
                        <div className="rounded-2xl border border-white/10 bg-slate-900 p-12 text-center">

                            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center mb-5">
                                <span className="text-2xl">
                                    🔧
                                </span>
                            </div>

                            <p className="text-white font-semibold">
                                No services available
                            </p>

                            <p className="text-slate-500 text-sm mt-2">
                                Please check again later.
                            </p>

                        </div>
                    )}

                    {/* No filtered services */}
                    {!loading &&
                        !error &&
                        services.length > 0 &&
                        filteredServices.length === 0 && (
                            <div className="rounded-2xl border border-white/10 bg-slate-900 p-12 text-center">

                                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center mb-5">
                                    <svg
                                        className="w-7 h-7 text-slate-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 1 1 16 0Z"
                                        />
                                    </svg>
                                </div>

                                <p className="text-white font-semibold">
                                    No services found
                                </p>

                                <p className="text-slate-500 text-sm mt-2">
                                    Try changing your search or category.
                                </p>

                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setCategory("all");
                                    }}
                                    className="mt-5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition cursor-pointer"
                                >
                                    Clear Filters
                                </button>

                            </div>
                        )}

                    {/* Services */}
                    {!loading &&
                        !error &&
                        filteredServices.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                                {filteredServices.map((service) => (
                                    <div
                                        key={service._id}
                                        className="group relative rounded-2xl bg-slate-900 border border-white/10 p-5 hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-950/30 transition-all duration-300"
                                    >

                                        {/* Card top */}
                                        <div className="flex items-start justify-between gap-4">

                                            <div className="min-w-0">

                                                <h4 className="text-lg font-bold text-white truncate">
                                                    {service.name}
                                                </h4>

                                                <div className="inline-flex mt-2 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/10">
                                                    <p className="text-xs text-indigo-400 font-semibold">
                                                        {service.category}
                                                    </p>
                                                </div>

                                            </div>

                                            {/* Price */}
                                            <div className="shrink-0 text-right">

                                                <p className="text-lg font-bold text-white">
                                                    ₹{service.price}
                                                </p>

                                            </div>

                                        </div>

                                        {/* Divider */}
                                        <div className="h-px bg-white/5 my-5" />

                                        {/* Description */}
                                        <p className="text-slate-400 text-sm leading-6 line-clamp-2 min-h-12">
                                            {service.description ||
                                                "Professional service"}
                                        </p>

                                        {/* Bottom */}
                                        <div className="mt-6 flex items-center justify-between gap-3">

                                            <span className="text-xs font-medium text-slate-500">

                                                {service.priceType === "per_hour"
                                                    ? "Per Hour"
                                                    : service.priceType === "per_day"
                                                        ? "Per Day"
                                                        : service.priceType === "per_visit"
                                                            ? "Per Visit"
                                                            : "Fixed Price"}

                                            </span>

                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/services/${service._id}/workers`
                                                    )
                                                }
                                                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer"
                                            >
                                                Find Workers →
                                            </button>

                                        </div>

                                        {/* Cooperative */}
                                        {service.cooperativeId && (
                                            <div className="mt-4 pt-4 border-t border-white/5">

                                                <p className="text-xs text-slate-600">
                                                    Provided by
                                                </p>

                                                <p className="text-xs text-slate-400 mt-1">
                                                    {service.cooperativeId.name}
                                                </p>

                                            </div>
                                        )}

                                    </div>
                                ))}

                            </div>
                        )}

                </section>
            </main>
        </div>
    );
}

export default CustomerDashboard;