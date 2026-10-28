
import { useEffect, useState } from "react";
import WorkerProfileForm from "./WorkerProfileForm";
import { useNavigate } from "react-router-dom";

import {
    getWorkerProfile,
    updateWorkerProfile,
} from "../services/workerService";

const WorkerProfileEdit = () => {
    const [worker, setWorker] = useState(null);
    // const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);

            const response = await getWorkerProfile();

            setWorker(response.data.worker);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to load worker profile."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (payload) => {
        const response = await updateWorkerProfile(payload);

        setWorker(response.data.worker);
        // setIsEditing(false);
        setSuccess("Profile updated successfully.");
    };

    if (loading) {
        return <p className="p-6">Loading profile...</p>;
    }

    if (error && !worker) {
        return (
            <p className="p-6 text-red-600">
                {error}
            </p>
        );
    }

    if (!worker) {
        return <p className="p-6">Profile not found.</p>;
    }

    return (
        <div className="mx-auto max-w-4xl space-y-5 p-4">
            {success && (
                <p className="rounded bg-green-100 p-3 text-green-700">
                    {success}
                </p>
            )}

            {error && (
                <p className="rounded bg-red-100 p-3 text-red-700">
                    {error}
                </p>
            )}

           
                <WorkerProfileForm
                    initialData={worker}
                    onSubmit={handleUpdate}
                    onCancel={() => navigate(-1)}
                    submitLabel="Save Changes"
                    cooperativeLocked={true}
             />
        
        </div>
    );
};

export default WorkerProfileEdit;
