import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CustomerDashboard() {
    const navigate = useNavigate();

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await api.get("/services");

                // console.log("Services:", response.data);

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

    return (
        <div className="min-h-screen bg-gray-900">

            {/* Navbar */}
            <nav className="bg-gray-800 shadow-sm px-5 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">

                    <h1 className="text-2xl font-bold text-white">
                        SEWA
                    </h1>

                    <button
                        onClick={handleLogout}
                        className="rounded-xl bg-white px-4 py-2.5 text-md font-semibold text-black border-black cursor-pointer hover:text-red-500"
                    >
                        Logout
                    </button>

                    <button
                        onClick={() => navigate("/customer/bookings")}
                        className="rounded-xl px-4 py-2.5 text-md font-semibold text-black border-black cursor-pointer bg-green-500"
                    >
                        My Bookings
                    </button>

                    <button
                        onClick={() => navigate("/customer/profile")}
                       className="rounded-xl bg-white px-4 py-2.5 text-md font-semibold text-black border-black cursor-pointer"
                    >
                        My Profile
                    </button>

                </div>
            </nav>

            {/* Main */}
            <main className="max-w-6xl mx-auto px-5 py-7">

                {/* Greeting */}
                <section className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                        Hello!!
                    </h2>

                    <p className="text-gray-100 mt-2">
                        What service do you need today?
                    </p>
                </section>

                {/* Services */}
                <section>

                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xl font-bold text-gray-200">
                            Available Services
                        </h3>

                        <span className="text-sm text-gray-200">
                            {services.length} services
                        </span>
                    </div>

                    {loading && (
                        <div className="text-center py-12 text-gray-500">
                            Loading services...
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
                            {error}
                        </div>
                    )}

                    {!loading && !error && services.length === 0 && (
                        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                            <p className="text-gray-500">
                                No services are available right now.
                            </p>
                        </div>
                    )}

                    {!loading && !error && services.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                            {services.map((service) => (
                                <div
                                    key={service._id}
                                    className="bg-white rounded-2xl p-5 shadow-sm
                             hover:shadow-md transition"
                                >

                                    <div className="flex items-start justify-between gap-3">

                                        <div>
                                            <h4 className="text-lg font-bold text-gray-800">
                                                {service.name}
                                            </h4>

                                            <p className="text-sm text-indigo-600 font-medium mt-1">
                                                {service.category}
                                            </p>
                                        </div>

                                        <div className="bg-indigo-50 text-indigo-700
                                    px-3 py-1 rounded-full text-sm font-semibold">
                                            ₹{service.price}
                                        </div>

                                    </div>

                                    <p className="text-gray-500 text-sm mt-4 line-clamp-2">
                                        {service.description || "Professional service"}
                                    </p>

                                    <div className="mt-5 flex items-center justify-between">

                                        <span className="text-xs text-gray-500">
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
                                                navigate(`/services/${service._id}/workers`)
                                            }
                                            className="px-4 py-2 bg-indigo-600 text-white
                                 text-sm font-semibold rounded-lg
                                 hover:bg-indigo-700 transition cursor-pointer"
                                        >
                                            Find Workers
                                        </button>

                                    </div>

                                    {service.cooperativeId && (
                                        <p className="text-xs text-gray-400 mt-4">
                                            {service.cooperativeId.name}
                                        </p>
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