
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import WorkerProfileForm from "./WorkerProfileForm";
import { createWorkerProfile } from "../services/workerService";

const WorkerCreateProfile = ({ cooperativeId }) => {
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleCreate = async (payload) => {
        console.log(payload)
        try {
            await createWorkerProfile({
                ...payload,
                cooperativeId,
            });

            navigate("/worker/pending");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to create worker profile."
            );

            throw err;
        }
    };

    return (
        <div className="mx-auto max-w-4xl p-4">
            {error && (
                <p className="mb-4 rounded bg-red-100 p-3 text-red-700">
                    {error}
                </p>
            )}

            <WorkerProfileForm
                initialData={{ cooperativeId }}
                onSubmit={handleCreate}
                submitLabel="Create Profile"
                cooperativeLocked={false}
            />
        </div>
    );
};

export default WorkerCreateProfile;
