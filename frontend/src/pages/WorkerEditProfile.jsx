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

function WorkerEditProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: "",
    experience: "",
    certifications: "",
    latitude: "",
    longitude: "",
  });

  const [skills, setSkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

  // -------------------------
  // Load existing profile
  // -------------------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/workers/profile");

        const worker = response.data.worker;

        const coordinates =
          worker.location?.coordinates || [];

        setFormData({
          category: worker.category || "",
          experience: worker.experience ?? "",
          certifications:
            worker.certifications?.join(", ") || "",
          longitude:
            coordinates.length === 2
              ? coordinates[0].toString()
              : "",
          latitude:
            coordinates.length === 2
              ? coordinates[1].toString()
              : "",
        });

        setSkills(
          worker.skills?.map((skill) => ({
            name: skill.name || "",
            price: skill.price ?? "",
            priceType: skill.priceType || "per_hour",
          })) || []
        );
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // -------------------------
  // Basic input
  // -------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -------------------------
  // Skill change
  // -------------------------
  const handleSkillChange = (index, field, value) => {
    setSkills((prev) =>
      prev.map((skill, i) =>
        i === index
          ? {
              ...skill,
              [field]: value,
            }
          : skill
      )
    );
  };

  // -------------------------
  // Add skill
  // -------------------------
  const addSkill = () => {
    setSkills((prev) => [
      ...prev,
      {
        name: "",
        price: "",
        priceType: "per_hour",
      },
    ]);
  };

  // -------------------------
  // Remove skill
  // -------------------------
  const removeSkill = (index) => {
    if (skills.length === 1) return;

    setSkills((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // -------------------------
  // Current location
  // -------------------------
  const getCurrentLocation = () => {
    setError("");
    setSuccess("");

    if (!navigator.geolocation) {
      setError(
        "Location services are not supported by your browser."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));

        setLocationLoading(false);
      },
      (err) => {
        console.error(err);

        setError(
          "Unable to get your location. Please allow location permission."
        );

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // -------------------------
  // Save
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.category) {
      setError("Please select your category.");
      return;
    }

    if (formData.experience === "") {
      setError("Please enter your experience.");
      return;
    }

    if (skills.length === 0) {
      setError("Please add at least one skill.");
      return;
    }

    const invalidSkill = skills.some(
      (skill) =>
        !skill.name.trim() ||
        skill.price === "" ||
        Number(skill.price) < 0
    );

    if (invalidSkill) {
      setError("Please complete all skill details.");
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError("Please provide your location.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        category: formData.category,

        skills: skills.map((skill) => ({
          name: skill.name.trim(),
          price: Number(skill.price),
          priceType: skill.priceType,
        })),

        experience: Number(formData.experience),

        certifications: formData.certifications
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        location: {
          type: "Point",
          coordinates: [
            Number(formData.longitude),
            Number(formData.latitude),
          ],
        },
      };

      await api.patch("/workers/editprofile", payload);

      setSuccess("Profile updated successfully!");

      setTimeout(() => {
        navigate("/worker/profile");
      }, 1000);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // -------------------------
  // Loading
  // -------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-6">
        <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
          <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Loading your profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/worker/profile")}
          className="mb-5 text-sm font-semibold text-gray-600 transition hover:text-indigo-600"
        >
          ← Back to Profile
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Edit Worker Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Keep your professional information up to date.
          </p>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-7"
          >

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                {success}
              </div>
            )}

            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Update your professional category and experience.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
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
                <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>

            </div>

            {/* Skills */}
            <div className="mt-9 border-t border-gray-200 pt-8">

              <div className="flex items-start justify-between gap-3">

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Skills & Pricing
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Update the skills and prices you offer.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addSkill}
                  className="shrink-0 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
                >
                  + Add Skill
                </button>

              </div>

              <div className="mt-5 space-y-4">

                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >

                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">
                        Skill {index + 1}
                      </span>

                      {skills.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeSkill(index)
                          }
                          className="text-sm font-medium text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                      {/* Name */}
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-600">
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
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          required
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-600">
                          Price
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={skill.price}
                          onChange={(e) =>
                            handleSkillChange(
                              index,
                              "price",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 500"
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          required
                        />
                      </div>

                      {/* Price Type */}
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-600">
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
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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

                {skills.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
                    <p className="text-sm text-gray-500">
                      No skills added yet.
                    </p>

                    <button
                      type="button"
                      onClick={addSkill}
                      className="mt-3 text-sm font-semibold text-indigo-600 hover:underline"
                    >
                      + Add your first skill
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* Certifications */}
            <div className="mt-9 border-t border-gray-200 pt-8">

              <h2 className="text-lg font-semibold text-gray-900">
                Certifications
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add or update your professional certifications.
              </p>

              <div className="mt-5">

                <input
                  type="text"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  placeholder="e.g. ITI, Skill India, Electrician Certificate"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Separate multiple certifications with commas.
                </p>

              </div>
            </div>

            {/* Location */}
            <div className="mt-9 border-t border-gray-200 pt-8">

              <h2 className="text-lg font-semibold text-gray-900">
                Location
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Update your current working location.
              </p>

              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="mt-5 w-full rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {locationLoading
                  ? "Getting Location..."
                  : "📍 Use Current Location"}
              </button>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-600">
                    Latitude
                  </label>

                  <input
                    type="text"
                    value={formData.latitude}
                    readOnly
                    placeholder="Not selected"
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-600 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-600">
                    Longitude
                  </label>

                  <input
                    type="text"
                    value={formData.longitude}
                    readOnly
                    placeholder="Not selected"
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-600 outline-none"
                  />
                </div>

              </div>
            </div>

            {/* Notice */}
            <div className="mt-9 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="flex gap-3">

                <span className="text-lg">
                  ℹ️
                </span>

                <div>
                  <h4 className="text-sm font-semibold text-indigo-900">
                    Profile Verification
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-indigo-700">
                    Changes to your professional information may be
                    reviewed by your cooperative admin.
                  </p>
                </div>

              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => navigate("/worker/profile")}
                className="w-full rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {saving
                  ? "Saving Changes..."
                  : "Save Changes"}
              </button>

            </div>

          </form>
        </div>

        <p className="py-5 text-center text-xs text-gray-400">
          SEWA • Cooperative Services Platform
        </p>

      </div>
    </div>
  );
}

export default WorkerEditProfile;