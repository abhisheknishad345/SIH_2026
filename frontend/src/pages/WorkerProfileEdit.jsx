
import { useEffect, useState } from "react";
import WorkerProfileForm from "./WorkerProfileForm";
import { useNavigate } from "react-router-dom";

import {
    getWorkerProfile,
    updateWorkerProfile,
} from "../services/workerService";

import { getAllCooperatives } from "../services/cooperativeService";

const WorkerProfileEdit = () => {
    const [worker, setWorker] = useState(null);
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

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
        setSuccess("Profile Changes Saved.");
    };

    if (loading) {
        return (

            <div className="flex min-h-screen items-center justify-center">


            <button
            
            className="flex items-center justify-center m-3 gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-white font-semibold disabled:opacity-70 text-xl"
            >
                <div className="p-2 h-7 w-7 animate-spin rounded-full border-4 border-white/30 border-t-white">
                </div>
                Loading Profile
            </button>
            </div>
            )
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
                    cooperatives={cooperatives}
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
