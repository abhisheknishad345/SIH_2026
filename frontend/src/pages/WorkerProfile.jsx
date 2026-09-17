import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const WorkerProfile = () => {
    const navigate = useNavigate();

    const [worker, setWorker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingAvailability, setUpdatingAvailability] = useState(false);

    const toggleAvailability = async () => {
        try {
            setUpdatingAvailability(true);

            const response = await api.put("/workers/availability", {
                isAvailable: !worker.isAvailable
            });

            setWorker((prev) => ({
                ...prev,
                isAvailable: response.data.isAvailable
            }));

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to update availability"
            );
        } finally {
            setUpdatingAvailability(false);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/workers/profile");
                setWorker(response.data.worker);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Loading
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-sm px-6 py-5 text-center">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>

                    <p className="text-gray-600 font-medium">
                        Loading profile...
                    </p>
                </div>
            </div>
        );
    }

    // Profile not found
    if (!worker) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-sm p-6 text-center max-w-sm w-full">
                    <div className="text-4xl mb-3">👤</div>

                    <h2 className="text-lg font-bold text-gray-800">
                        Profile not found
                    </h2>

                    <p className="text-sm text-gray-500 mt-2">
                        We couldn't load your worker profile.
                    </p>

                    <button
                        onClick={() => navigate("/worker")}
                        className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const verificationStatus =
        worker.verificationStatus || "pending";

    const verificationStyles = {
        approved: {
            bg: "bg-green-50",
            text: "text-green-700",
            dot: "bg-green-500",
            label: "Approved"
        },
        rejected: {
            bg: "bg-red-50",
            text: "text-red-700",
            dot: "bg-red-500",
            label: "Rejected"
        },
        pending: {
            bg: "bg-yellow-50",
            text: "text-yellow-700",
            dot: "bg-yellow-500",
            label: "Pending"
        }
    };

    const verification =
        verificationStyles[verificationStatus] ||
        verificationStyles.pending;

        const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <div className="min-h-screen bg-green-800 px-4 py-5 sm:px-6 lg:px-8">

            {/* Main Container */}
            <div className="max-w-5xl mx-auto">



                <div className=" flex justify-between mb-5 border-2 p-3 rounded-2xl bg-amber-200">
                {/* Back Button */}

                <button
                    onClick={() => navigate("/worker")}
                    className="flex items-center gap-2   font-semibold transition border-2 p-2 rounded-2xl cursor-pointer"
                    >
                    <span className="text-xl">←</span>
                    Back to Dashboard
                </button>

                <button
                    onClick={() => navigate("/worker/edit-profile")}
                    className="rounded-2xl border-2  p-2  font-semibold cursor-pointer"
                    >
                    Edit Profile
                </button>

                <button
                onClick={handleLogout}
                className="p-3 rounded-2xl border-2 font-semibold  cursor-pointer"
                >
                    Logout
                </button>

                    </div>



                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 mb-5">

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-700 shrink-0">
                            {worker.userId?.fullName
                                ?.charAt(0)
                                ?.toUpperCase() || "W"}
                        </div>

                        {/* Name */}
                        <div className="min-w-0 flex-1">

                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 wrap-break">
                                {worker.userId?.fullName || "Worker"}
                            </h1>

                            <p className="text-gray-500 mt-1 break-all">
                                {worker.userId?.email}
                            </p>

                        </div>

                        {/* Verification Badge */}
                        <div
                            className={`self-start sm:self-center flex items-center gap-2 px-3 py-2 rounded-full ${verification.bg}`}
                        >
                            <span
                                className={`w-2.5 h-2.5 rounded-full ${verification.dot}`}
                            />

                            <span
                                className={`text-sm font-semibold ${verification.text}`}
                            >
                                {verification.label}
                            </span>
                        </div>

                    </div>

                </div>

                {/* Top Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

                    {/* Basic Information */}
                    <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">

                        <div className="flex items-center gap-3 mb-5">

                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                👤
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    Basic Information
                                </h2>

                                <p className="text-xs text-gray-500">
                                    Your professional details
                                </p>
                            </div>

                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            {/* Category */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-xs text-gray-500 mb-1">
                                    Category
                                </p>

                                <p className="font-semibold text-gray-800 wrap-break">
                                    {worker.category || "Not specified"}
                                </p>
                            </div>

                            {/* Experience */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-xs text-gray-500 mb-1">
                                    Experience
                                </p>

                                <p className="font-semibold text-gray-800">
                                    {worker.experience ?? 0} years
                                </p>
                            </div>

                        </div>

                    </div>

                    {/* Availability */}
                    <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">

                        <div className="flex items-center justify-between gap-4 h-full">

                            <div className="min-w-0 flex-1">

                                <div className="flex items-center gap-3 mb-3">

                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                                        🟢
                                    </div>

                                    <h2 className="text-lg font-bold text-gray-800">
                                        Availability
                                    </h2>

                                </div>

                                <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
                                    {worker.isAvailable
                                        ? "You are currently available for bookings."
                                        : "You are currently unavailable for bookings."}
                                </p>

                                <div
                                    className={`inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-xs font-semibold ${worker.isAvailable
                                        ? "bg-green-50 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    <span
                                        className={`w-2 h-2 rounded-full ${worker.isAvailable
                                            ? "bg-green-500"
                                            : "bg-gray-400"
                                            }`}
                                    />

                                    {worker.isAvailable
                                        ? "Available"
                                        : "Unavailable"}
                                </div>

                            </div>

                            {/* Toggle */}
                            <button
                                onClick={toggleAvailability}
                                disabled={updatingAvailability}
                                aria-label="Toggle availability"
                                className={`relative w-14 h-8 rounded-full shrink-0 transition-all duration-200 ${worker.isAvailable
                                    ? "bg-indigo-600"
                                    : "bg-gray-300"
                                    } ${updatingAvailability
                                        ? "opacity-60 cursor-not-allowed"
                                        : "cursor-pointer"
                                    }`}
                            >

                                <span
                                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-200 ${worker.isAvailable
                                        ? "left-7"
                                        : "left-1"
                                        }`}
                                />

                            </button>

                        </div>

                    </div>

                </div>

                {/* Skills */}
                <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 mb-5">

                    <div className="flex items-center gap-3 mb-5">

                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                            🛠️
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-gray-800">
                                Skills & Pricing
                            </h2>

                            <p className="text-xs text-gray-500">
                                Services you provide
                            </p>
                        </div>

                    </div>

                    {worker.skills?.length > 0 ? (

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                            {worker.skills.map((skill, index) => (

                                <div
                                    key={index}
                                    className="border border-indigo-100 bg-indigo-50/60 rounded-xl p-4"
                                >

                                    <div className="flex items-start justify-between gap-3">

                                        <h3 className="font-semibold text-indigo-700 wrap-break">
                                            {skill.name}
                                        </h3>

                                        <span className="font-bold text-gray-800 whitespace-nowrap">
                                            ₹{skill.price}
                                        </span>

                                    </div>

                                    <div className="mt-3 inline-block bg-white px-2.5 py-1 rounded-lg">

                                        <p className="text-xs text-gray-500 capitalize">
                                            {skill.priceType?.replace(
                                                "_",
                                                " "
                                            )}
                                        </p>

                                    </div>

                                </div>

                            ))}

                        </div>

                    ) : (

                        <div className="bg-gray-50 rounded-xl p-5 text-center">
                            <p className="text-gray-400 text-sm">
                                No skills added yet
                            </p>
                        </div>

                    )}

                </div>

                {/* Bottom Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Certifications */}
                    <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">

                        <div className="flex items-center gap-3 mb-5">

                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                📜
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    Certifications
                                </h2>

                                <p className="text-xs text-gray-500">
                                    Your qualifications
                                </p>
                            </div>

                        </div>

                        {worker.certifications?.length > 0 ? (

                            <div className="space-y-2">

                                {worker.certifications.map(
                                    (certificate, index) => (

                                        <div
                                            key={index}
                                            className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3"
                                        >

                                            <span className="shrink-0">
                                                📜
                                            </span>

                                            <p className="text-sm text-gray-700 wrap-break">
                                                {certificate}
                                            </p>

                                        </div>

                                    )
                                )}

                            </div>

                        ) : (

                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm text-gray-400">
                                    No certifications added
                                </p>
                            </div>

                        )}

                    </div>

                    {/* Cooperative */}
                    <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">

                        <div className="flex items-center gap-3 mb-5">

                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                🏢
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    Cooperative
                                </h2>

                                <p className="text-xs text-gray-500">
                                    Your organization
                                </p>
                            </div>

                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">

                            <p className="font-bold text-gray-800 wrap-break">
                                {worker.cooperativeId?.name ||
                                    "Not assigned"}
                            </p>

                            {worker.cooperativeId
                                ?.registrationNumber && (
                                    <p className="text-sm text-gray-500 mt-2 wrap-break">
                                        Registration:{" "}
                                        {
                                            worker.cooperativeId
                                                .registrationNumber
                                        }
                                    </p>
                                )}

                        </div>

                    </div>

                </div>

                {/* Location */}
                <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 mt-5">

                    <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                            📍
                        </div>

                        <div className="min-w-0">

                            <h2 className="text-lg font-bold text-gray-800">
                                Location
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Your service location is saved.
                            </p>

                        </div>

                    </div>

                    <div className="mt-4 bg-gray-50 rounded-xl p-4">

                        <p className="text-sm font-medium text-gray-700">
                            📍 Location saved
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                            Customers can find you based on your service
                            location when you are available.
                        </p>

                    </div>

                </div>

                {/* Verification */}
                <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 mt-5">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        <div className="flex items-center gap-3">

                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center ${verification.bg}`}
                            >
                                ✓
                            </div>

                            <div>

                                <h2 className="text-lg font-bold text-gray-800">
                                    Verification
                                </h2>

                                <p className="text-xs text-gray-500">
                                    Cooperative verification status
                                </p>

                            </div>

                        </div>

                        <div
                            className={`self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-full ${verification.bg}`}
                        >

                            <span
                                className={`w-2.5 h-2.5 rounded-full ${verification.dot}`}
                            />

                            <span
                                className={`font-bold text-sm ${verification.text} capitalize`}
                            >
                                {verificationStatus}
                            </span>

                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
};

export default WorkerProfile;