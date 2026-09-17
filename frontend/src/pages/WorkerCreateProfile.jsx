/*
import { useState, useEffect } from "react";
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

function WorkerCreateProfile() {

  const validateForm = () => {

    if (!formData.cooperativeId) {
      setError("Please select your cooperative.");
      return;
    }
    if (!formData.category) {
      return "Please select your service category.";
    }

    if (
      formData.experience === "" ||
      Number(formData.experience) < 0
    ) {
      return "Please enter a valid experience.";
    }

    if (skills.length === 0) {
      return "Please add at least one skill.";
    }

    for (const skill of skills) {
      if (!skill.name.trim()) {
        return "Every skill must have a name.";
      }

      if (
        skill.price === "" ||
        Number(skill.price) < 0
      ) {
        return "Every skill must have a valid price.";
      }

      if (!skill.priceType) {
        return "Please select a price type for every skill.";
      }
    }

    const skillNames = skills.map((skill) =>
      skill.name.trim().toLowerCase()
    );

    if (new Set(skillNames).size !== skillNames.length) {
      setError("You cannot add the same skill more than once.");
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      return "Please select your current location.";
    }

    return null;
  };

  const [cooperatives, setCooperatives] = useState([]);
  const [cooperativeLoading, setCooperativeLoading] = useState(true);

  useEffect(() => {
    const fetchCooperatives = async () => {
      try {
        const response = await api.get("/cooperatives");

        setCooperatives(
          response.data.cooperatives || response.data
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to load cooperatives."
        );
      } finally {
        setCooperativeLoading(false);
      }
    };

    fetchCooperatives();
  }, []);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: "",
    experience: "",
    certifications: "",
    address: "",
    longitude: "",
    latitude: "",
  });

  const [skills, setSkills] = useState([
    {
      name: "",
      price: "",
      priceType: "per_hour",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // -------------------------
  // Normal input change
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

    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  // -------------------------
  // Get current location
  // -------------------------
  const getCurrentLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Location services are not supported by your browser.");
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
  // Submit
  // -------------------------
  const handleSubmit = async (e) => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }
    e.preventDefault();

    setError("");
    setSuccess("");

    // Basic validation
    if (!formData.category) {
      setError("Please select your service category.");
      return;
    }

    if (formData.experience === "") {
      setError("Please enter your experience.");
      return;
    }

    if (!formData.address.trim()) {
      setError("Please enter your address.");
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError("Please provide your current location.");
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

    setLoading(true);

    try {
      const payload = {
        cooperativeId: formData.cooperativeId,

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

        address: formData.address.trim(),
      };

      console.log("Worker profile payload:", payload);

      await api.post("/workers/profile", payload);

      setSuccess("Profile submitted for verification.");

      setTimeout(() => {
        navigate("/worker/profile-pending", {
          replace: true,
        });
      }, 800);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to create your profile."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-700">
            Select Cooperative
          </label>

          <select
            name="cooperativeId"
            value={formData.cooperativeId}
            onChange={handleChange}
            disabled={cooperativeLoading}
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3
                   outline-none focus:border-indigo-500 focus:ring-2
                   focus:ring-indigo-100"
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
        </div>

        {/* Header */
        /*
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white">
              S
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Create Worker Profile
              </h1>

              <p className="text-sm text-gray-500">
                Complete your profile to start receiving work
              </p>
            </div>
          </div>
        </div>
*/
//         {/* Main Card */}
    
//         <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200">

//           {/* Intro */}
//           <div className="border-b border-gray-200 px-5 py-5 sm:px-7">
//             <h2 className="text-lg font-semibold text-gray-900">
//               Professional Information
//             </h2>

//             <p className="mt-1 text-sm text-gray-500">
//               Tell customers about your skills and experience.
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="p-5 sm:p-7">

//             {/* Error */}
//             {error && (
//               <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
//                 {error}
//               </div>
//             )}

//             {/* Success */}
//             {success && (
//               <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
//                 {success}
//               </div>
//             )}

//             {/* Category + Experience */}
//             <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

//               {/* Category */}
//               <div>
//                 <label className="mb-2 block text-sm font-semibold text-gray-700">
//                   Service Category
//                 </label>

//                 <select
//                   name="category"
//                   value={formData.category}
//                   onChange={handleChange}
//                   className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                   required
//                 >
//                   <option value="">Select your category</option>

//                   {categories.map((category) => (
//                     <option key={category} value={category}>
//                       {category}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Experience */}
//               <div>
//                 <label className="mb-2 block text-sm font-semibold text-gray-700">
//                   Experience (Years)
//                 </label>

//                 <input
//                   type="number"
//                   name="experience"
//                   min="0"
//                   step="0.5"
//                   placeholder="e.g. 3"
//                   value={formData.experience}
//                   onChange={handleChange}
//                   className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Skills */}
//             <div className="mt-8">
//               <div className="mb-4 flex items-center justify-between gap-3">
//                 <div>
//                   <h3 className="text-base font-semibold text-gray-900">
//                     Your Skills
//                   </h3>

//                   <p className="text-sm text-gray-500">
//                     Add the skills you offer and their pricing.
//                   </p>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={addSkill}
//                   className="shrink-0 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
//                 >
//                   + Add Skill
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 {skills.map((skill, index) => (
//                   <div
//                     key={index}
//                     className="rounded-xl border border-gray-200 bg-gray-50 p-4"
//                   >
//                     <div className="mb-3 flex items-center justify-between">
//                       <span className="text-sm font-semibold text-gray-700">
//                         Skill {index + 1}
//                       </span>

//                       {skills.length > 1 && (
//                         <button
//                           type="button"
//                           onClick={() => removeSkill(index)}
//                           className="text-sm font-medium text-red-500 hover:text-red-600"
//                         >
//                           Remove
//                         </button>
//                       )}
//                     </div>

//                     <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

//                       {/* Skill Name */}
//                       <div className="md:col-span-1">
//                         <label className="mb-2 block text-xs font-semibold text-gray-600">
//                           Skill Name
//                         </label>

//                         <input
//                           type="text"
//                           placeholder="e.g. Pipe Repair"
//                           value={skill.name}
//                           onChange={(e) =>
//                             handleSkillChange(
//                               index,
//                               "name",
//                               e.target.value
//                             )
//                           }
//                           className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                           required
//                         />
//                       </div>

//                       {/* Price */}
//                       <div>
//                         <label className="mb-2 block text-xs font-semibold text-gray-600">
//                           Price
//                         </label>

//                         <input
//                           type="number"
//                           min="0"
//                           placeholder="e.g. 500"
//                           value={skill.price}
//                           onChange={(e) =>
//                             handleSkillChange(
//                               index,
//                               "price",
//                               e.target.value
//                             )
//                           }
//                           className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                           required
//                         />
//                       </div>

//                       {/* Price Type */}
//                       <div>
//                         <label className="mb-2 block text-xs font-semibold text-gray-600">
//                           Price Type
//                         </label>

//                         <select
//                           value={skill.priceType}
//                           onChange={(e) =>
//                             handleSkillChange(
//                               index,
//                               "priceType",
//                               e.target.value
//                             )
//                           }
//                           className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                         >
//                           {priceTypes.map((type) => (
//                             <option
//                               key={type.value}
//                               value={type.value}
//                             >
//                               {type.label}
//                             </option>
//                           ))}
//                         </select>
//                       </div>

//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Certifications */}
//             <div className="mt-8">
//               <label className="mb-2 block text-sm font-semibold text-gray-700">
//                 Certifications
//               </label>

//               <input
//                 type="text"
//                 name="certifications"
//                 placeholder="e.g. ITI, Electrician Certificate, Skill India"
//                 value={formData.certifications}
//                 onChange={handleChange}
//                 className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//               />

//               <p className="mt-2 text-xs text-gray-500">
//                 If you have multiple certifications, separate them with
//                 commas.
//               </p>
//             </div>

//             {/* Location */}
//             <div className="mt-8">
//               <div className="mb-4">
//                 <h3 className="text-base font-semibold text-gray-900">
//                   Location
//                 </h3>

//                 <p className="text-sm text-gray-500">
//                   Your location helps customers find nearby workers.
//                 </p>
//               </div>

//               {/* Address */}
//               <div>
//                 <label className="mb-2 block text-sm font-semibold text-gray-700">
//                   Address
//                 </label>

//                 <textarea
//                   name="address"
//                   rows="3"
//                   placeholder="Enter your current address"
//                   value={formData.address}
//                   onChange={handleChange}
//                   className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                   required
//                 />
//               </div>

//               {/* Location Button */}
//               <div className="mt-4">
//                 <button
//                   type="button"
//                   onClick={getCurrentLocation}
//                   disabled={locationLoading}
//                   className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
//                 >
//                   {locationLoading
//                     ? "Getting Location..."
//                     : "📍 Use Current Location"}
//                 </button>
//               </div>

//               {/* Coordinates */}
//               <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

//                 <div>
//                   <label className="mb-2 block text-xs font-semibold text-gray-600">
//                     Latitude
//                   </label>

//                   <input
//                     type="text"
//                     value={formData.latitude}
//                     readOnly
//                     placeholder="Not selected"
//                     className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-600 outline-none"
//                   />
//                 </div>

//                 <div>
//                   <label className="mb-2 block text-xs font-semibold text-gray-600">
//                     Longitude
//                   </label>

//                   <input
//                     type="text"
//                     value={formData.longitude}
//                     readOnly
//                     placeholder="Not selected"
//                     className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-600 outline-none"
//                   />
//                 </div>

//               </div>
//             </div>

//             {/* Verification Notice */}
//             <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
//               <div className="flex gap-3">
//                 <div className="text-lg">ℹ️</div>

//                 <div>
//                   <h4 className="text-sm font-semibold text-indigo-900">
//                     Profile Verification
//                   </h4>

//                   <p className="mt-1 text-xs leading-5 text-indigo-700">
//                     After creating your profile, your cooperative admin
//                     will review and verify your worker profile before you
//                     can receive customer bookings.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Submit */}
//             <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

//               <button
//                 type="button"
//                 onClick={() => navigate("/worker")}
//                 className="w-full rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
//               >
//                 {loading ? "Creating Profile..." : "Create Profile"}
//               </button>

//             </div>

//           </form>
//         </div>

//         {/* Footer */}
//         <p className="py-5 text-center text-xs text-gray-400">
//           SEWA • Cooperative Services Platform
//         </p>

//       </div>
//     </div>
//   );
// }  
// export default WorkerCreateProfile;


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
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-4 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                        ← Back
                    </button>

                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        Create Worker Profile
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        Complete your profile to start working through your cooperative.
                    </p>
                </div>

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
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
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
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
                                className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
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
                                                className="text-sm font-medium text-red-500 hover:text-red-700"
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
                                                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
                                                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
                                                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
                            className="mb-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                            className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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