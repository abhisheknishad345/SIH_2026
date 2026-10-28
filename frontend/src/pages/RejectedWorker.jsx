import { useEffect, useState } from "react";
import api from "../services/api"
import { useNavigate } from "react-router-dom";

const RejectedWorker = () => {
    const navigate = useNavigate();

    const [worker, setWorker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [resubmitting, setResubmitting] = useState(false);

    const [formData, setFormData] = useState({
        skills: "",
        experience: "",
        certifications: "",
    });

    // Fetch worker profile
    useEffect(() => {
        const getWorkerProfile = async () => {
            try {
                const response = await api.get(
                    "/workers/profile",
                    { withCredentials: true }
                );

                const workerData = response.data.worker;
               console.log("Worker ID:", worker._id);
                console.log("Cooperative ID:", worker.cooperativeId);
                console.log("Worker Data:", worker);
                setWorker(workerData);

                setFormData({
                    skills: workerData.skills
                    ?.map((skill) => skill.name)
                    .join(", ") || "",

                    experience: workerData.experience || "",

                    certifications: workerData.certifications
                    ?.join(", ") || "",
                                    });
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        getWorkerProfile();
    }, []);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Update profile
    const handleUpdateProfile = async () => {
        try {
            setUpdating(true);

            const updateData = {
                skills: formData.skills
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter((skill) => skill !== ""),

                experience: Number(formData.experience),

                certifications: formData.certifications
                    .split(",")
                    .map((certificate) => certificate.trim())
                    .filter((certificate) => certificate !== ""),
            };

            const response = await api.patch(
                "/editprofile",
                updateData,
                { withCredentials: true }
            );

            setWorker(response.data.worker);

            alert("Profile updated successfully");
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Unable to update profile"
            );
        } finally {
            setUpdating(false);
        }
    };

    // Resubmit profile
    const handleResubmit = async () => {
        try {
            setResubmitting(true);

            await api.put(
                "workers/profile/resubmit",
                {},
                { withCredentials: true }
            );

            navigate("/worker/profile-pending");
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Unable to resubmit profile"
            );
        } finally {
            setResubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading profile...
            </div>
        );
    }

    if (!worker) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl">
                Worker profile not found
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-300 px-4 py-10">

            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="bg-gray-200 rounded-2xl shadow-sm border p-6 mb-6">

                    <div className="flex items-center gap-4">

                        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-2xl">
                            ⚠️
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Profile Verification Rejected
                            </h1>

                            <p className="text-neutral-700 mt-1">
                                Please update your profile and resubmit it
                                for verification.
                            </p>
                        </div>

                    </div>

                    {/* Rejection Reason */}
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">

                        <h2 className="font-semibold text-red-700">
                            Reason for Rejection
                        </h2>

                        <p className="text-sm text-red-600 mt-2">
                            {worker.rejectionReason ||
                                "Your profile needs some changes. Please review your details and resubmit."}
                        </p>

                    </div>

                </div>

                {/* Profile Form */}
                <div className="bg-gray-200 rounded-2xl shadow-sm border p-6">

                    <h2 className="text-xl font-semibold text-gray-800 mb-6">
                        Update Your Profile
                    </h2>

                    {/* Skills */}
                    <div className="mb-5">

                        <label className="block text-md font-semibold text-gray-700 mb-2">
                            Skills
                        </label>

                        <input
                            type="text"
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            placeholder="Pipe Fitting, Leakage Repair"
                            className="w-full border-2 font-mono text-black rounded-lg px-4 py-3 outline-none focus:ring focus:ring-black"
                        />

                        <p className="text-sm text-rose-600 mt-1">
                            Enter skills separated by commas
                        </p>

                    </div>

                    {/* Experience */}
                    <div className="mb-5">

                        <label className="block text-md font-semibold text-gray-700 mb-2">
                            Experience (Years)
                        </label>

                        <input
                            type="number"
                            name="experience"
                            min="0"
                            value={formData.experience}
                            onChange={handleChange}
                            placeholder="Enter Your Experience"
                            className="w-full border-2 text-black rounded-lg px-4 py-3 outline-none focus:ring focus:ring-black"
                        />

                    </div>

                    {/* Certifications */}
                    <div className="mb-6">

                        <label className="block text-md font-semibold text-gray-700 mb-2">
                            Certifications
                        </label>

                        <input
                            type="text"
                            name="certifications"
                            value={formData.certifications}
                            onChange={handleChange}
                            placeholder="ITI Certificate, Plumbing Certificate"
                            className="w-full border-2 text-black rounded-lg px-4 py-3 outline-none focus:ring focus:ring-black"
                        />

                        <p className="text-sm text-rose-600 mt-1">
                            Enter certifications separated by commas
                        </p>

                    </div>

                    {/* Update Button */}
                    <button
                        onClick={handleUpdateProfile}
                        disabled={updating || resubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg disabled:opacity-50 cursor-pointer"
                    >
                        {updating
                            ? "Updating Profile..."
                            : "Save Changes"}
                    </button>

                    {/* Resubmit Button */}
                    <button
                        onClick={handleResubmit}
                        disabled={updating || resubmitting}
                        className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg disabled:opacity-50 cursor-pointer"
                    >
                        {resubmitting
                            ? "Resubmitting..."
                            : "Resubmit for Verification"}
                    </button>

                </div>

            </div>

        </div>
    );
};

export default RejectedWorker;