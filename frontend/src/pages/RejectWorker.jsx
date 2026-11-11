
import { useEffect, useState } from "react";
import WorkerProfileForm from "./WorkerProfileForm";
import { useAuth } from "../context/AuthContext";

import {
    getWorkerProfile,
    updateWorkerProfile,
    resubmitWorkerProfile,
} from "../services/workerService";

import { getAllCooperatives } from "../services/cooperativeService";

import { useNavigate } from "react-router-dom";

const CATEGORIES = [
    "Plumber",
    "Electrician",
    "Carpenter",
    "Painter",
    "Cleaner",
    "Gardener",
    "Driver",
    "Caregiver",
    "Technician",
];

const RejectWorker = () => {
    const [worker, setWorker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { logout } = useAuth();

    const navigate = useNavigate();

    const [cooperatives, setCooperatives] = useState([]);
    
        useEffect(() => {
            const fetchCooperatives = async () => {
                try {
                    const response = await getAllCooperatives();
    
                    setCooperatives(response.data.cooperatives);
                } catch (error) {
                    console.error(error);
                }
            };
    
            fetchCooperatives();
        }, []);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await getWorkerProfile();
            // console.log(response);

            setWorker(response.data.worker);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to load profile."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (payload) => {
        const response = await updateWorkerProfile(payload);

        setWorker(response.data.worker);
        setSuccess("Changes saved. You can now resubmit");
    };

    const handleResubmit = async () => {
        try {
            setSaving(true);
            setError("");

            await resubmitWorkerProfile();

            navigate("/worker/profile-pending");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to resubmit profile."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login", {replace: true});
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    if (loading) {
        return <p className="p-6">Loading profile...</p>;
    }

    if (!worker) {
        return (
            <p className="p-6 text-red-600 bg-red-100 text-xl">
                {error || "Profile not found."}
            </p>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-5 p-4">
            <div className=" flex justify-between rounded-xl border border-red-200 bg-slate-100 p-5">
                <div>

                <h2 className="text-xl font-semibold text-red-600">
                    Profile Rejected
                </h2>

                <p className="mt-2 text-rose-500">
                    {worker.rejectionReason ||
                        "Please update your profile and resubmit it for verification"}
                </p>
                        </div>

                <div>
                <button 
                onClick={handleLogout}
                className=" border-3 text-lg text-rose-500 rounded-2xl cursor-pointer p-2">
                    Logout
                    </button>

                </div>
            </div>

            {error && (
                <p className="rounded bg-red-100 p-3 text-red-700 text-md">
                    {error}
                </p>
            )}

            {success && (
                <p className="rounded bg-green-100 p-3 text-green-700">
                    {success}
                </p>
            )}

            <WorkerProfileForm
                initialData={worker}
                cooperatives={cooperatives}
                categories={CATEGORIES}
                onSubmit={handleSave}
                submitLabel="Save Changes"
                cooperativeLocked={false}
            />

            <button
                type="button"
                onClick={handleResubmit}
                disabled={saving}
                className="w-75 border-2 cursor-pointer text-md font-semibold rounded-xl px-3 py-3 text-green-400 disabled:opacity-50 bg-gray-950"
            >
                {saving
                    ? "Resubmitting..."
                    : "Resubmit for Verification"}
            </button>
        </div>
    );
};

export default RejectWorker;
