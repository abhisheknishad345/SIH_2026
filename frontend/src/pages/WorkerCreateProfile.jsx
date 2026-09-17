
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const categories = [
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

const priceTypes = [
    { value: "per_hour", label: "Per Hour" },
    { value: "per_visit", label: "Per Visit" },
    { value: "per_day", label: "Per Day" },
    { value: "fixed", label: "Fixed Price" },
];

const emptySkill = {
    name: "",
    price: "",
    priceType: "per_hour",
};

  

function WorkerCreateProfile() {
    const navigate = useNavigate();

    const [cooperatives, setCooperatives] = useState([]);
    const [cooperativeLoading, setCooperativeLoading] = useState(true);

    const [formData, setFormData] = useState({
        cooperativeId: "",
        category: "",
        skills: [{ ...emptySkill }],
        experience: "",
        certifications: "",
        latitude: "",
        longitude: "",
    });

    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch active cooperatives
    useEffect(() => {
        const fetchCooperatives = async () => {
            try {
                const response = await api.get("/cooperatives");

                setCooperatives(response.data.cooperatives || []);
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.message ||
                    "Unable to load cooperatives."
                );
            } finally {
                setCooperativeLoading(false);
            }
        };

        fetchCooperatives();
    }, []);

    // Normal input change
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // Skill field change
    const handleSkillChange = (index, field, value) => {
        setFormData((prev) => {
            const updatedSkills = [...prev.skills];

            updatedSkills[index] = {
                ...updatedSkills[index],
                [field]: value,
            };

            return {
                ...prev,
                skills: updatedSkills,
            };
        });

        setError("");
    };

    // Add another skill
    const addSkill = () => {
        setFormData((prev) => ({
            ...prev,
            skills: [
                ...prev.skills,
                { ...emptySkill },
            ],
        }));
    };

    // Remove skill
    const removeSkill = (index) => {
        if (formData.skills.length === 1) {
            return;
        }

        setFormData((prev) => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index),
        }));
    };

    // Get current location
    const getCurrentLocation = () => {
        setError("");

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        setLocationLoading(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData((prev) => ({
                    ...prev,
                    latitude: position.coords.latitude.toString(),
                    longitude: position.coords.longitude.toString(),
                }));

                setLocationLoading(false);
            },
            (err) => {
                console.error(err);

                setLocationLoading(false);

                setError(
                    "Unable to get your location. Please allow location access."
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    // Form validation
    const validateForm = () => {
        if (!formData.cooperativeId) {
            return "Please select your cooperative.";
        }

        if (!formData.category) {
            return "Please select your category.";
        }

        if (
            formData.experience === "" ||
            Number(formData.experience) < 0
        ) {
            return "Please enter valid experience.";
        }

        if (!formData.skills.length) {
            return "Please add at least one skill.";
        }

        const skillNames = [];

        for (let i = 0; i < formData.skills.length; i++) {
            const skill = formData.skills[i];

            if (!skill.name.trim()) {
                return `Please enter skill name for Skill ${i + 1}.`;
            }

            if (
                skill.price === "" ||
                Number(skill.price) < 0
            ) {
                return `Please enter a valid price for ${skill.name}.`;
            }

            if (!skill.priceType) {
                return `Please select price type for ${skill.name}.`;
            }

            const normalizedName = skill.name
                .trim()
                .toLowerCase();

            if (skillNames.includes(normalizedName)) {
                return `Duplicate skill "${skill.name}" is not allowed.`;
            }

            skillNames.push(normalizedName);
        }

        if (formData.latitude === "" || formData.longitude === "") {
            return "Please select your current location.";
        }

        const latitude = Number(formData.latitude);
        const longitude = Number(formData.longitude);

        if (
            Number.isNaN(latitude) ||
            latitude < -90 ||
            latitude > 90
        ) {
            return "Invalid latitude.";
        }

        if (
            Number.isNaN(longitude) ||
            longitude < -180 ||
            longitude > 180
        ) {
            return "Invalid longitude.";
        }

        return null;
    };

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);

            const payload = {
                cooperativeId: formData.cooperativeId,

                category: formData.category,

                skills: formData.skills.map((skill) => ({
                    name: skill.name.trim(),
                    price: Number(skill.price),
                    priceType: skill.priceType,
                })),

                experience: Number(formData.experience),

                certifications: formData.certifications
                    ? formData.certifications
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean)
                    : [],

                location: {
                    type: "Point",
                    coordinates: [
                        Number(formData.longitude),
                        Number(formData.latitude),
                    ],
                },
            };

            await api.post("/workers/profile", payload);

            // Profile successfully created
            navigate("/worker/profile-pending", {
                replace: true,
            });
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to create worker profile."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">

                {/* Header */}
                <div className="mb-3 flex justify-end gap-5 border-2 border-black rounded-2xl p-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-4 text-md font-medium border p-2 rounded-xl text-black  hover:text-indigo-800 cursor-pointer"
                    >
                        ⬅ Back
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="mb-4 text-md border p-2 font-medium rounded-xl text-black  hover:text-indigo-800 cursor-pointer"
                    >
                        Logout
                    </button>
                </div>

                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        Create Worker Profile
                    </h1>

                    <p className="mt-2 text-sm text-gray-600 mb-3">
                        Complete your profile to start working through your cooperative.
                    </p>

                {/* Main Card */}
                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl bg-white p-5 shadow-sm sm:p-8"
                >

                    {/* Error */}
                    {error && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Cooperative */}
                    <section className="mb-8">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">
                            Cooperative
                        </h2>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Select Cooperative
                        </label>

                        <select
                            name="cooperativeId"
                            value={formData.cooperativeId}
                            onChange={handleChange}
                            disabled={cooperativeLoading}
                            required
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100 text-black"
                        >
                            <option value="">
                                {cooperativeLoading
                                    ? "Loading cooperatives..."
                                    : "Select your cooperative"}
                            </option>

                            {cooperatives.map((cooperative) => (
                                <option
                                    key={cooperative._id}
                                    value={cooperative._id}
                                >
                                    {cooperative.name}
                                </option>
                            ))}
                        </select>
                    </section>

                    {/* Basic Information */}
                    <section className="mb-8">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">
                            Basic Information
                        </h2>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                            {/* Category */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Work Category
                                </label>

                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-black"
                                >
                                    <option value="">
                                        Select category
                                    </option>

                                    {categories.map((category) => (
                                        <option
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Experience */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Experience (Years)
                                </label>

                                <input
                                    type="number"
                                    name="experience"
                                    min="0"
                                    step="0.5"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    placeholder="e.g. 3"
                                    required
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-black"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Skills */}
                    <section className="mb-8">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Skills & Pricing
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    Add the skills you provide and their pricing.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={addSkill}
                                className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 cursor-pointer"
                            >
                                + Add Skill
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.skills.map((skill, index) => (
                                <div
                                    key={index}
                                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                                >
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-gray-800">
                                            Skill {index + 1}
                                        </h3>

                                        {formData.skills.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeSkill(index)
                                                }
                                                className="text-sm font-medium text-red-500 hover:text-red-700 cursor-pointer"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                                        {/* Skill name */}
                                        <div className="sm:col-span-1">
                                            <label className="mb-2 block text-xs font-medium text-gray-600">
                                                Skill Name
                                            </label>

                                            <input
                                                type="text"
                                                value={skill.name}
                                                onChange={(e) =>
                                                    handleSkillChange(
                                                        index,
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g. Pipe Repair"
                                                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-black"
                                            />
                                        </div>

                                        {/* Price */}
                                        <div>
                                            <label className="mb-2 block text-xs font-medium text-gray-600">
                                                Price
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={skill.price}
                                                onChange={(e) =>
                                                    handleSkillChange(
                                                        index,
                                                        "price",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g. 500"
                                                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-black"
                                            />
                                        </div>

                                        {/* Price Type */}
                                        <div>
                                            <label className="mb-2 block text-xs font-medium text-gray-600">
                                                Price Type
                                            </label>

                                            <select
                                                value={skill.priceType}
                                                onChange={(e) =>
                                                    handleSkillChange(
                                                        index,
                                                        "priceType",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-black"
                                            >
                                                {priceTypes.map((type) => (
                                                    <option
                                                        key={type.value}
                                                        value={type.value}
                                                    >
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Certifications */}
                    <section className="mb-8">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">
                            Certifications
                        </h2>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Certifications
                            <span className="ml-1 font-normal text-gray-400">
                                (Optional)
                            </span>
                        </label>

                        <input
                            type="text"
                            name="certifications"
                            value={formData.certifications}
                            onChange={handleChange}
                            placeholder="e.g. ITI, Electrical Safety Certificate"
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-black"
                        />

                        <p className="mt-2 text-xs text-gray-500">
                            Separate multiple certifications using commas.
                        </p>
                    </section>

                    {/* Location */}
                    <section className="mb-8">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Location
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                Your location helps customers find nearby workers.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            className="mb-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                        >
                            {locationLoading
                                ? "Getting Location..."
                                : "📍 Use Current Location"}
                        </button>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Latitude
                                </label>

                                <input
                                    type="text"
                                    value={formData.latitude}
                                    readOnly
                                    placeholder="Latitude"
                                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Longitude
                                </label>

                                <input
                                    type="text"
                                    value={formData.longitude}
                                    readOnly
                                    placeholder="Longitude"
                                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Submit */}
                    <div className="border-t border-gray-200 pt-6">
                        <button
                            type="submit"
                            disabled={loading || cooperativeLoading}
                            className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto cursor-pointer"
                        >
                            {loading
                                ? "Creating Profile..."
                                : "Create Worker Profile"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default WorkerCreateProfile;