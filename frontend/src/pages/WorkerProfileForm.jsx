import { useEffect, useState } from "react";
// import { getActiveServices } from "../services/serviceService";
import {
    getActiveServices,
    getServiceCategories
} from "../services/serviceService";
import {
    ArrowLeft,
    HardHat,
    ClipboardList,
    Wrench,
    Award,
    CalendarClock,
    MapPin,
    LocateFixed,
    Plus,
    X,
    Trash2,
    Clock,
    ChevronDown,
    Building2,
    Briefcase,
    IndianRupee,
    Loader2,
    CircleAlert,
    Save,
    CircleCheck,
} from "lucide-react";

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const emptySkill = {
    serviceId: "",
    experience: "",
};

const getCooperativeId = (value) => {
    if (!value) return "";
    // console.log(value);
    return typeof value === "object" ? value._id || "" : value;
};

/* ---------- Shared styles ---------- */
const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition " +
    "focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:text-base";

const labelClass =
    "mb-1.5 block text-xs font-semibold text-slate-700 sm:text-sm";

const sectionClass =
    "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 sm:p-6";

const smallBtnClass =
    "flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100 sm:text-sm";

const STATUS_STYLES = {
    approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    rejected: "border-red-200 bg-red-50 text-red-600",
};

/* ---------- Small presentational helpers ---------- */
const SectionHeader = ({ icon: Icon, title, subtitle, action }) => (
    <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon size={20} />
            </div>

            <div>
                <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                    {title}
                </h3>

                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                    {subtitle}
                </p>
            </div>
        </div>

        {action}
    </div>
);

const SelectWrapper = ({ icon: Icon, children }) => (
    <div className="relative">
        {Icon && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Icon size={18} />
            </span>
        )}

        {children}

        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
            <ChevronDown size={18} />
        </span>
    </div>
);

const WorkerProfileForm = ({
    initialData = {},
    cooperatives = [],
    onSubmit,
    onCancel,
    submitLabel = "Save Profile",
    cooperativeLocked = false,
}) => {

    const [formData, setFormData] = useState({
        cooperativeId: "",
        category: "",
        skills: [{ ...emptySkill }],
        certifications: [""],
        workingHours: [],
        latitude: "",
        longitude: "",
    });

    const [activeServices, setActiveServices] = useState([]);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Populate form when editing or when initial cooperative is provided
    useEffect(() => {
        if (!initialData) return;

        setFormData((prev) => ({
            ...prev,

            cooperativeId:
                getCooperativeId(initialData.cooperativeId) ||
                prev.cooperativeId,


            category: initialData.category ?? prev.category,

            skills:
                initialData.skills?.length > 0
                    ? initialData.skills.map((skill) => ({
                        serviceId:
                            typeof skill.serviceId === "object"
                                ? skill.serviceId?._id || ""
                                : skill.serviceId || "",
                        experience: skill.experience ?? "",
                    }))
                    : initialData._id
                        ? [{ ...emptySkill }]
                        : prev.skills,

            certifications:
                initialData.certifications?.length > 0
                    ? [...initialData.certifications]
                    : initialData._id
                        ? [""]
                        : prev.certifications,

            workingHours:
                initialData.workingHours ?? prev.workingHours,

            latitude:
                initialData.location?.coordinates?.[1] ??
                prev.latitude,

            longitude:
                initialData.location?.coordinates?.[0] ??
                prev.longitude,
        }));
    }, [
        initialData?._id,
        initialData?.cooperativeId,
        initialData?.category,
        initialData?.skills,
        initialData?.certifications,
        initialData?.workingHours,
        initialData?.location,
    ]);

    useEffect(() => {
        let cancelled = false;

        const fetchCategories = async () => {
            if (!formData.cooperativeId) {
                setCategories([]);
                return;
            }

            try {
                setCategoriesLoading(true);

                const response = await getServiceCategories(
                    formData.cooperativeId
                );

                if (!cancelled) {
                    setCategories(response.data.categories || []);
                }

            } catch (error) {
                console.error("Failed to fetch categories:", error);

                if (!cancelled) {
                    setCategories([]);
                }

            } finally {
                if (!cancelled) {
                    setCategoriesLoading(false);
                }
            }
        };

        fetchCategories();

        return () => {
            cancelled = true;
        };

    }, [formData.cooperativeId]);

    useEffect(() => {
        let cancelled = false;

        const fetchServices = async () => {

            if (!formData.cooperativeId || !formData.category) {
                setActiveServices([]);
                return;
            }

            try {
                setServicesLoading(true);

                const response = await getActiveServices(
                    formData.cooperativeId,
                    formData.category
                );

                if (!cancelled) {
                    setActiveServices(response.data.services || []);
                }

            } catch (error) {
                console.error("Failed to fetch services:", error);

                if (!cancelled) {
                    setActiveServices([]);
                }

            } finally {
                if (!cancelled) {
                    setServicesLoading(false);
                }
            }
        };

        fetchServices();

        return () => {
            cancelled = true;
        };

    }, [formData.cooperativeId, formData.category]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => {

            if (name === "cooperativeId") {
                return {
                    ...prev,
                    cooperativeId: value,
                    category: "",
                    skills: [{ ...emptySkill }]
                };
            }

            if (name === "category") {
                return {
                    ...prev,
                    category: value,
                    skills: [{ ...emptySkill }]
                };
            }

            return {
                ...prev,
                [name]: value,
            };
        });

        setError("");
    };

    // Skills
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
    };

    const addSkill = () => {
        setFormData((prev) => ({
            ...prev,
            skills: [...prev.skills, { ...emptySkill }],
        }));
    };

    const removeSkill = (index) => {
        setFormData((prev) => ({
            ...prev,
            skills: prev.skills.filter(
                (_, skillIndex) => skillIndex !== index
            ),
        }));
    };

    // Certifications
    const handleCertificationChange = (index, value) => {
        setFormData((prev) => {
            const updated = [...prev.certifications];
            updated[index] = value;

            return {
                ...prev,
                certifications: updated,
            };
        });
    };

    const addCertification = () => {
        setFormData((prev) => ({
            ...prev,
            certifications: [...prev.certifications, ""],
        }));
    };

    const removeCertification = (index) => {
        setFormData((prev) => ({
            ...prev,
            certifications: prev.certifications.filter(
                (_, certIndex) => certIndex !== index
            ),
        }));
    };

    // Working hours
    const isDaySelected = (day) =>
        formData.workingHours.some(
            (item) => item.day === day && item.isWorking
        );

    const toggleWorkingDay = (day) => {
        setFormData((prev) => {
            const exists = prev.workingHours.some(
                (item) => item.day === day
            );

            const updatedHours = exists
                ? prev.workingHours.filter(
                    (item) => item.day !== day
                )
                : [
                    ...prev.workingHours,
                    {
                        day,
                        isWorking: true,
                        startTime: "09:00",
                        endTime: "17:00",
                    },
                ];

            return {
                ...prev,
                workingHours: updatedHours,
            };
        });
    };

    const handleWorkingHourChange = (day, field, value) => {
        setFormData((prev) => ({
            ...prev,
            workingHours: prev.workingHours.map((item) =>
                item.day === day
                    ? { ...item, [field]: value }
                    : item
            ),
        }));
    };

    // Location
    const getCurrentLocation = () => {
        setError("");

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData((prev) => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                }));
            },
            () => {
                setError(
                    "Unable to get your location. Please allow location access."
                );
            }
        );
    };

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");


        if (!formData.cooperativeId) {
            setError("Please select a cooperative.");
            return;
        }


        if (!formData.category.trim()) {
            setError("Please select a category.");
            return;
        }


        const validSkills = formData.skills.filter(
            (skill) =>
                skill.serviceId &&
                skill.experience !== "" &&
                Number(skill.experience) >= 0
        );

        if (validSkills.length === 0) {
            setError("Please select at least one service and enter experience.");
            return;
        }

        if (validSkills.length !== formData.skills.length) {
            setError("Please complete all selected skills or remove empty ones.");
            return;
        }

        const uniqueServiceIds = new Set(
            validSkills.map((skill) => skill.serviceId)
        );

        if (uniqueServiceIds.size !== validSkills.length) {
            setError("A service can only be selected once.");
            return;
        }

        if (formData.workingHours.length === 0) {
            setError("Please select at least one working day.");
            return;
        }


        if (
            formData.latitude === "" ||
            formData.longitude === ""
        ) {
            setError("Please provide your service location.");
            return;
        }


        const invalidTiming = formData.workingHours.some(
            (item) => item.startTime >= item.endTime
        );


        if (invalidTiming) {
            setError("End time must be after start time.");
            return;
        }


        const payload = {
            cooperativeId: formData.cooperativeId,
            category: formData.category.trim(),

            skills: validSkills.map((skill) => ({
                serviceId: skill.serviceId,
                experience: Number(skill.experience),
            })),

            certifications: formData.certifications
                .map((cert) => cert.trim())
                .filter(Boolean),

            workingHours: formData.workingHours.map((item) => ({
                day: item.day,
                isWorking: item.isWorking,
                startTime: item.startTime,
                endTime: item.endTime,
            })),

            location: {
                type: "Point",
                coordinates: [
                    Number(formData.longitude),
                    Number(formData.latitude),
                ],
            },
        };

        // console.log("Payload: ", payload);

        try {
            setLoading(true);
            // console.log("Payload 2: ", payload);

            await onSubmit(payload);

        } catch (err) {
            // console.log("Hello");
            setError(
                err.response?.data?.message ||
                err.message ||
                "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    };

    /* ---------- UI-only: profile strength ---------- */
    const completedChecks = [
        !!formData.cooperativeId,
        !!formData.category,
        formData.skills.some(
            (skill) => skill.serviceId && skill.experience !== ""
        ),
        formData.workingHours.length > 0,
        formData.latitude !== "" && formData.longitude !== "",
    ];

    const totalChecks = completedChecks.length;
    const doneChecks = completedChecks.filter(Boolean).length;
    const strength = Math.round((doneChecks / totalChecks) * 100);

    const verificationStatus = initialData?.verificationStatus;

    return (
        <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-indigo-50 via-slate-50 to-slate-100 px-4 py-5 sm:px-6 sm:py-8">
            {/* Soft background glow */}
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-300/30 blur-3xl sm:h-96 sm:w-96" />

            <form
                onSubmit={handleSubmit}
                className="relative mx-auto max-w-4xl space-y-5 sm:space-y-6"
            >
                {/* Top bar */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                aria-label="Go back"
                                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
                            >
                                <ArrowLeft size={18} />
                            </button>
                        )}

                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
                                TechConnect
                            </p>

                            <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                                Worker Profile
                            </h1>
                        </div>
                    </div>

                    {verificationStatus && (
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[verificationStatus] ||
                                "border-slate-200 bg-white text-slate-600"
                                }`}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {verificationStatus}
                        </span>
                    )}
                </div>

                {/* Hero */}
                <div className="rounded-2xl bg-linear-to-r from-indigo-600 via-indigo-600 to-purple-600 p-5 text-white shadow-lg shadow-indigo-200 sm:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 sm:h-14 sm:w-14">
                            <HardHat size={26} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-100 sm:text-xs">
                                Worker Registration
                            </p>

                            <h2 className="mt-1 text-xl font-bold sm:text-3xl">
                                Worker Profile
                            </h2>

                            <p className="mt-1.5 max-w-xl text-xs leading-5 text-indigo-100 sm:text-sm sm:leading-6">
                                Tell us about your skills, experience and
                                availability to connect with customers.
                            </p>
                        </div>
                    </div>

                    {/* Profile strength */}
                    <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                            <span>Profile Strength: {strength}%</span>

                            <span className="flex items-center gap-1 text-indigo-100">
                                {strength === 100 ? (
                                    <>
                                        <CircleCheck size={14} />
                                        All fields completed
                                    </>
                                ) : (
                                    `${totalChecks - doneChecks} left`
                                )}
                            </span>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                            <div
                                className="h-full rounded-full bg-emerald-300 transition-all duration-500"
                                style={{ width: `${strength}%` }}
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-md text-red-600">
                        <CircleAlert size={18} className="mt-0.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Basic Information */}
                <section className={sectionClass}>
                    <SectionHeader
                        icon={ClipboardList}
                        title="Basic Information"
                        subtitle="Choose your cooperative and service category"
                    />

                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                        <div className="sm:col-span-2">
                            <label htmlFor="cooperativeId" className={labelClass}>
                                Select Cooperative{" "}
                                <span className="text-red-500">*</span>
                            </label>

                            <SelectWrapper icon={Building2}>
                                <select
                                    id="cooperativeId"
                                    name="cooperativeId"
                                    value={formData.cooperativeId}
                                    onChange={handleChange}
                                    disabled={cooperativeLocked}
                                    required
                                    className={`${inputClass} cursor-pointer appearance-none pl-11 pr-11 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500`}
                                >
                                    <option value="">
                                        Select Cooperative
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
                            </SelectWrapper>
                        </div>

                        <div>
                            <label htmlFor="category" className={labelClass}>
                                Worker Category{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <SelectWrapper icon={Wrench}>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    disabled={
                                        !formData.cooperativeId ||
                                        categoriesLoading ||
                                        categories.length === 0
                                    }
                                    required
                                    className={`${inputClass} cursor-pointer appearance-none pl-11 pr-11 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500`}
                                >
                                    <option value="">
                                        {!formData.cooperativeId
                                            ? "First Select Cooperative"
                                            : categoriesLoading
                                                ? "Loading Categories..."
                                                : categories.length === 0
                                                    ? "No Categories Available"
                                                    : "Select Category"}
                                    </option>

                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </SelectWrapper>


                        </div>


                    </div>
                </section>

                {/* Skills & Pricing */}
                <section className={sectionClass}>
                    <SectionHeader
                        icon={Wrench}
                        title="My Services & Experience"
                        subtitle="Select services offered by your cooperative and add your experience"
                        action={
                            <button
                                type="button"
                                onClick={addSkill}
                                disabled={!formData.cooperativeId || activeServices.length === 0}
                                className={`${smallBtnClass} disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                                <Plus size={14} />
                                Add Service
                            </button>
                        }
                    />

                    {!formData.cooperativeId ? (
                        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
                            Please select a cooperative first.
                        </p>
                    ) : servicesLoading ? (
                        <p className="flex items-center gap-2 text-sm text-slate-500">
                            <Loader2 size={16} className="animate-spin" />
                            Loading available services...
                        </p>
                    ) : activeServices.length === 0 ? (
                        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
                            No active services found for this cooperative.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {formData.skills.map((skill, index) => {
                                const selectedService = activeServices.find(
                                    (service) => service._id === skill.serviceId
                                );

                                return (
                                    <div
                                        key={index}
                                        className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4"
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                                                Service {index + 1}
                                            </span>

                                            {formData.skills.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeSkill(index)}
                                                    className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-500"
                                                >
                                                    <Trash2 size={13} />
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className={labelClass}>
                                                    Select Service
                                                </label>

                                                <div className="relative">
                                                    <select
                                                        value={skill.serviceId}
                                                        onChange={(e) =>
                                                            handleSkillChange(
                                                                index,
                                                                "serviceId",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`${inputClass} appearance-none pr-10`}
                                                        required
                                                    >
                                                        <option value="">
                                                            Choose a service
                                                        </option>

                                                        {activeServices.map((service) => (
                                                            <option
                                                                key={service._id}
                                                                value={service._id}
                                                                disabled={formData.skills.some(
                                                                    (item, itemIndex) =>
                                                                        itemIndex !== index &&
                                                                        item.serviceId === service._id
                                                                )}
                                                            >
                                                                {service.name}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                                                        <ChevronDown size={16} />
                                                    </span>
                                                </div>
                                            </div>

                                            {selectedService && (
                                                <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
                                                    <p className="text-xs font-semibold text-indigo-700">
                                                        Admin-defined service charge
                                                    </p>

                                                    <p className="mt-1 text-sm font-bold text-slate-900">
                                                        ₹{selectedService.price} / {
                                                            selectedService.priceType?.replace("_", " ")
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Pricing is managed by your cooperative admin.
                                                    </p>
                                                </div>
                                            )}

                                            <div>
                                                <label className={labelClass}>
                                                    Experience in this service (Years)
                                                </label>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={skill.experience}
                                                    onChange={(e) =>
                                                        handleSkillChange(
                                                            index,
                                                            "experience",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="e.g. 3"
                                                    className={inputClass}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>


                {/* Certifications */}
                <section className={sectionClass}>
                    <SectionHeader
                        icon={Award}
                        title="Certifications"
                        subtitle="Add relevant training or certificates"
                        action={
                            <button
                                type="button"
                                onClick={addCertification}
                                className={smallBtnClass}
                            >
                                <Plus size={14} />
                                Add
                            </button>
                        }
                    />

                    <div className="space-y-3">
                        {formData.certifications.map((cert, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3"
                            >
                                <div className="relative flex-1">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                        <Award size={18} />
                                    </span>

                                    <input
                                        value={cert}
                                        onChange={(e) =>
                                            handleCertificationChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. ITI Certificate"
                                        className={`${inputClass} pl-11`}
                                    />
                                </div>

                                {formData.certifications.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeCertification(index)
                                        }
                                        aria-label="Remove certification"
                                        className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Working Hours */}
                <section className={sectionClass}>
                    <SectionHeader
                        icon={CalendarClock}
                        title="Working Days & Hours"
                        subtitle="Select the days you are available for work"
                    />

                    <div className="space-y-3">
                        {DAYS.map((day) => {
                            const selected = isDaySelected(day);

                            const hours = formData.workingHours.find(
                                (item) => item.day === day
                            );

                            return (
                                <div
                                    key={day}
                                    className={`rounded-xl border p-3 transition sm:p-4 ${selected
                                        ? "border-indigo-200 bg-indigo-50/60"
                                        : "border-slate-200 bg-white"
                                        }`}
                                >
                                    <label className="flex cursor-pointer items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selected}
                                            onChange={() =>
                                                toggleWorkingDay(day)
                                            }
                                            className="h-4 w-4 cursor-pointer rounded accent-indigo-600"
                                        />

                                        <span
                                            className={`text-xs font-bold uppercase tracking-wide sm:text-sm ${selected
                                                ? "text-slate-900"
                                                : "text-slate-500"
                                                }`}
                                        >
                                            {day}
                                        </span>

                                        <span
                                            className={`ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${selected
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-slate-100 text-slate-400"
                                                }`}
                                        >
                                            {selected
                                                ? "Available"
                                                : "Unavailable"}
                                        </span>
                                    </label>

                                    {selected && hours && (
                                        <div className="mt-3 grid grid-cols-2 gap-3">
                                            <div>
                                                <label className={labelClass}>
                                                    Start Time
                                                </label>

                                                <div className="relative">
                                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                                        <Clock size={15} />
                                                    </span>

                                                    <input
                                                        type="time"
                                                        value={hours.startTime}
                                                        onChange={(e) =>
                                                            handleWorkingHourChange(
                                                                day,
                                                                "startTime",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`${inputClass} bg-white pl-9`}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelClass}>
                                                    End Time
                                                </label>

                                                <div className="relative">
                                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                                        <Clock size={15} />
                                                    </span>

                                                    <input
                                                        type="time"
                                                        value={hours.endTime}
                                                        onChange={(e) =>
                                                            handleWorkingHourChange(
                                                                day,
                                                                "endTime",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`${inputClass} bg-white pl-9`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Service Location */}
                <section className={sectionClass}>
                    <SectionHeader
                        icon={MapPin}
                        title="Service Location"
                        subtitle="Set the location where you provide services."
                    />

                    <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 sm:w-auto"
                    >
                        <LocateFixed size={16} />
                        Use Current Location
                    </button>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Latitude</label>

                            <input
                                type="number"
                                step="any"
                                value={formData.latitude}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        latitude: e.target.value,
                                    }))
                                }
                                placeholder="Latitude"
                                className={`${inputClass} font-mono`}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Longitude</label>

                            <input
                                type="number"
                                step="any"
                                value={formData.longitude}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        longitude: e.target.value,
                                    }))
                                }
                                placeholder="Longitude"
                                className={`${inputClass} font-mono`}
                            />
                        </div>
                    </div>
                </section>

                {/* Form Actions (sticky) */}
                <div className="sticky bottom-3 z-10 flex gap-3 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-lg shadow-slate-300/50 backdrop-blur sm:justify-end sm:p-4">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 cursor-pointer rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex-none"
                        >
                            Cancel
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex flex-2 cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:from-indigo-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:text-base"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                {submitLabel}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default WorkerProfileForm;