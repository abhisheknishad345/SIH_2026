import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function WorkerProfilePending() {
    const navigate = useNavigate();

    const [status, setStatus] = useState("loading");
    const [worker, setWorker] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const checkProfileStatus = async () => {
            try {
                const response = await api.get("/workers/profile");

                const workerData = response.data.worker;

                setWorker(workerData);

                if (
                    workerData.verificationStatus === "approved" &&
                    workerData.isVerified === true
                ) {
                    navigate("/worker", { replace: true });
                    return;
                }

                if (
                    workerData.verificationStatus === "rejected"
                ) {
                    setStatus("rejected");
                    return;
                }

                setStatus("pending");
            } catch (err) {
                console.error(err);

                if (err.response?.status === 404) {
                    navigate("/worker/create-profile", {
                        replace: true,
                    });
                    return;
                }

                setError(
                    err.response?.data?.message ||
                    "Unable to check profile status."
                );
            }
        };

        checkProfileStatus();
    }, [navigate]);

    // Loading
    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600" />

                    <p className="text-sm text-gray-600">
                        Checking your profile status...
                    </p>
                </div>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm sm:p-8">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
                        !
                    </div>

                    <h1 className="text-xl font-bold text-gray-900">
                        Something went wrong
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        {error}
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Rejected
    if (status === "rejected") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
                <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-center shadow-sm sm:p-8">

                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
                        ✕
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900">
                        Profile Needs Changes
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-gray-600">
                        Your worker profile was not approved by the
                        cooperative admin. Please review and update
                        your profile before submitting it again.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/worker/edit-profile")
                        }
                        className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>
        );
    }

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // Pending
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <button
                onClick={handleLogout}
                className="text-md font-bold
                       text-black border-2 rounded-xl px-4 py-2 cursor-pointer"
            >
                Logout
            </button>

                {/* Icon */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
                    <div className="text-4xl">
                        ⏳
                    </div>
                </div>

                {/* Heading */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        Profile Under Review
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-gray-600">
                        Your worker profile has been successfully
                        submitted and is waiting for approval from
                        your cooperative admin.
                    </p>
                </div>

                {/* Status */}
                <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                            ✓
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                Profile Submitted
                            </p>

                            <p className="mt-1 text-xs text-gray-600">
                                Waiting for cooperative verification
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile summary */}
                {worker && (
                    <div className="mt-5 rounded-xl border border-gray-200 p-4">
                        <h2 className="mb-3 text-sm font-semibold text-gray-900">
                            Profile Details
                        </h2>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">
                                    Category
                                </span>

                                <span className="font-medium text-gray-900">
                                    {worker.category || "—"}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">
                                    Experience
                                </span>

                                <span className="font-medium text-gray-900">
                                    {worker.experience ?? "—"} years
                                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">
                                    Status
                                </span>

                                <span className="font-medium capitalize text-indigo-600">
                                    {worker.verificationStatus || "pending"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom note */}
                <div className="mt-6 text-center">
                    <p className="text-sm leading-5 text-gray-500">
                        You can safely leave this page. Once your
                        profile is approved, you will be able to
                        access your worker dashboard.
                    </p>
                </div>

                {/* Dashboard button intentionally not added */}
            </div>
        </div>
    );
}

export default WorkerProfilePending;