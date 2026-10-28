
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import WorkerProfileForm from "./WorkerProfileForm";
import { createWorkerProfile } from "../services/workerService";
import { getAllCooperatives } from "../services/cooperativeService";

const WorkerCreateProfile = ({ cooperativeId }) => {
    const [error, setError] = useState("");
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


    const handleCreate = async (payload) => {
        try {
            await createWorkerProfile({
                ...payload,
                cooperativeId,
            });

            navigate("/worker/profile-pending");
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
                initialData={{ cooperativeId: "" }}
                cooperatives={cooperatives}
    c           ategories={CATEGORIES}
                onSubmit={handleCreate}
                submitLabel="Create Profile"
                cooperativeLocked={true}
            />
        </div>
    );
};

export default WorkerCreateProfile;
