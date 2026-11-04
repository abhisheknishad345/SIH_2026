import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Pencil,
    LogOut,
    Loader2,
    UserX,
    User,
    Mail,
    Star,
    Briefcase,
    Wrench,
    Plus,
    Users,
    Building2,
    Award,
    MapPin,
    MapPinCheck,
    ShieldCheck,
    ClipboardList,
    Radio,
    CircleCheck,
    Clock,
    CircleX,
} from "lucide-react";
import { MdVerified } from "react-icons/md";
import api from "../services/api";

/* ---------- Status styles ---------- */
const VERIFICATION_STYLES = {
    approved: {
        pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
        banner: "border-emerald-200 from-emerald-50 to-green-50",
        iconBox: "border-emerald-200 text-emerald-600",
        title: "text-emerald-800",
        text: "text-emerald-700",
        icon: ShieldCheck,
        label: "Approved",
        message:
            "Approved by your cooperative and ready to receive bookings.",
    },
    rejected: {
        pill: "border-red-200 bg-red-50 text-red-700",
        dot: "bg-red-500",
        banner: "border-red-200 from-red-50 to-rose-50",
        iconBox: "border-red-200 text-red-500",
        title: "text-red-800",
        text: "text-red-700",
        icon: CircleX,
        label: "Rejected",
        message:
            "Your profile was rejected. Please edit your profile and submit it again.",
    },
    pending: {
        pill: "border-amber-200 bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
        banner: "border-amber-200 from-amber-50 to-yellow-50",
        iconBox: "border-amber-200 text-amber-600",
        title: "text-amber-800",
        text: "text-amber-700",
        icon: Clock,
        label: "Pending",
        message:
            "Your profile is waiting for cooperative approval.",
    },
};

/* ---------- Small presentational helpers ---------- */
const Card = ({ children, className = "" }) => (
    <section
        className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 sm:p-6 ${className}`}
    >
        {children}
    </section>
);

const CardHeader = ({ icon: Icon, title, subtitle, badge, action }) => (
    <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon size={20} />
            </div>

            <div>
                <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                        {title}
                    </h2>

                    {badge}
                </div>

                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                    {subtitle}
                </p>
            </div>
        </div>

        {action}
    </div>
);

const LinkButton = ({ onClick, icon: Icon, children }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 sm:text-sm"
    >
        {Icon && <Icon size={14} />}
        {children}
    </button>
);

const WorkerProfile = () => {
    const navigate = useNavigate();

    const [worker, setWorker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingAvailability, setUpdatingAvailability] = useState(false);

    const toggleAvailability = async () => {
        try {
            setUpdatingAvailability(true);

            const response = await api.put("/workers/availability", {
                isAvailable: !worker.isAvailable,
            });

            setWorker((prev) => ({
                ...prev,
                isAvailable: response.data.isAvailable,
            }));
        } catch (error) {
            alert(
                error.response?.data?.message ||
                    "Failed to update availability"
            );
        } finally {
            setUpdatingAvailability(false);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/workers/profile");
                setWorker(response.data.worker);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const pageBg =
        "relative min-h-screen overflow-hidden bg-gradient-to-b from-indigo-50 via-slate-50 to-slate-100";

    // Loading
    if (loading) {
        return (
            <div className={`${pageBg} flex items-center justify-center px-4`}>
                <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 text-center shadow-sm">
                    <Loader2
                        size={32}
                        className="mx-auto mb-3 animate-spin text-indigo-600"
                    />

                    <p className="text-base font-medium text-slate-800">
                        Loading Profile...
                    </p>
                </div>
            </div>
        );
    }

    // Profile not found
    if (!worker) {
        return (
            <div className={`${pageBg} flex items-center justify-center px-4`}>
                <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                        <UserX size={26} />
                    </div>

                    <h2 className="text-lg font-bold text-slate-800">
                        Profile not found
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        We couldn't load your worker profile.
                    </p>

                    <button
                        onClick={() => navigate("/worker/dashboard")}
                        className="mt-5 w-full cursor-pointer rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 py-3 font-semibold text-white shadow-md shadow-indigo-200 transition hover:from-indigo-500 hover:to-purple-500"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const verificationStatus = worker.verificationStatus || "pending";

    const verification =
        VERIFICATION_STYLES[verificationStatus] ||
        VERIFICATION_STYLES.pending;

    const VerificationIcon = verification.icon;

    const fullName = worker.userId?.fullName || "Worker";
    const initial = fullName.charAt(0).toUpperCase() || "W";

    const coordinates = worker.location?.coordinates;

    // Quick metrics - only values that exist in your data are shown
    const metrics = [
        {
            key: "rating",
            icon: <Star size={16} className="fill-amber-400 text-amber-400" />,
            value: worker.averageRating?.toFixed(1) || "New",
            label: `${worker.totalRatings || 0} ratings`,
        },
        {
            key: "experience",
            icon: <Briefcase size={16} className="text-indigo-500" />,
            value: `${worker.experience ?? 0} yrs`,
            label: "Experience",
        },
    ];

    if (worker.completedJobs != null) {
        metrics.push({
            key: "jobs",
            icon: <CircleCheck size={16} className="text-emerald-500" />,
            value: worker.completedJobs,
            label: "Jobs Done",
        });
    }

    const metricsGridClass =
        metrics.length === 2 ? "grid-cols-2" : "grid-cols-3";

    return (
        <div className={pageBg}>
            {/* Soft background glow */}
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-300/30 blur-3xl sm:h-96 sm:w-96" />

            {/* Top bar */}
            <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/worker/dashboard")}
                            aria-label="Go back"
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                            Worker Profile
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate("/worker/edit-profile")}
                            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50"
                        >
                            <Pencil size={15} />
                            <span className="hidden sm:inline">
                                Edit Profile
                            </span>
                            <span className="sm:hidden">Edit</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            aria-label="Logout"
                            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
                        >
                            <LogOut size={15} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:gap-5 sm:px-6 sm:py-8">
                {/* Identity header */}
                <Card className="relative overflow-hidden">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-indigo-100 opacity-70 blur-2xl" />

                    <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="flex h-24 w-24 select-none items-center justify-center rounded-full bg-linear-to-br from-indigo-600 to-purple-600 text-4xl font-bold text-white shadow-md ring-4 ring-white">
                                {initial}
                            </div>

                            {verificationStatus === "approved" && (
                                <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-50 text-emerald-500 shadow-sm">
                                    <CircleCheck size={18} />
                                </span>
                            )}
                        </div>

                        {/* Identity details */}
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                <h1 className="wrap-break-words text-2xl font-bold text-slate-900 sm:text-3xl">
                                    {fullName}
                                </h1>

                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${verification.pill}`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${verification.dot}`}
                                    />
                                    {verification.label}
                                </span>
                            </div>

                            {worker.userId?.email && (
                                <p className="mt-1.5 flex items-center justify-center gap-1.5 break-all text-sm text-slate-500 sm:justify-start">
                                    <Mail size={14} className="shrink-0" />
                                    {worker.userId.email}
                                </p>
                            )}

                            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                {worker.category && (
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                                        <Wrench size={13} />
                                        {worker.category}
                                    </span>
                                )}

                                {verificationStatus === "approved" &&
                                    worker.isVerified && (
                                        <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                                            <MdVerified size={14} />
                                            Verified Professional
                                        </span>
                                    )}
                            </div>
                        </div>
                    </div>

                    {/* Metrics */}
                    <div
                        className={`relative mt-5 grid ${metricsGridClass} gap-2 border-t border-slate-100 pt-4 text-center sm:gap-3`}
                    >
                        {metrics.map((metric) => (
                            <div
                                key={metric.key}
                                className="rounded-xl bg-slate-50 p-2.5 sm:p-3"
                            >
                                <div className="flex items-center justify-center gap-1 text-sm font-bold text-slate-900 sm:text-base">
                                    {metric.icon}
                                    {metric.value}
                                </div>

                                <span className="text-[11px] text-slate-500 sm:text-xs">
                                    {metric.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Top Information Cards */}
                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader
                            icon={User}
                            title="Basic Information"
                            subtitle="Your Professional Details"
                            action={
                                <LinkButton
                                    onClick={() =>
                                        navigate("/worker/edit-profile")
                                    }
                                >
                                    Edit
                                </LinkButton>
                            }
                        />

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                                <span className="mb-1 block text-[11px] font-medium text-slate-500">
                                    Category
                                </span>

                                <div className="flex items-center gap-1.5">
                                    <Wrench
                                        size={16}
                                        className="shrink-0 text-indigo-600"
                                    />

                                    <span className="wrap-break-words text-sm font-semibold text-slate-900">
                                        {worker.category || "Not specified"}
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                                <span className="mb-1 block text-[11px] font-medium text-slate-500">
                                    Experience
                                </span>

                                <div className="flex items-center gap-1.5">
                                    <Clock
                                        size={16}
                                        className="shrink-0 text-indigo-600"
                                    />

                                    <span className="text-sm font-semibold text-slate-900">
                                        {worker.experience ?? 0} years
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Availability */}
                    <Card className="flex items-center">
                        <div className="flex w-full items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                                    {worker.isAvailable && (
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                                    )}

                                    <span
                                        className={`relative inline-flex h-3 w-3 rounded-full ${
                                            worker.isAvailable
                                                ? "bg-emerald-500"
                                                : "bg-slate-400"
                                        }`}
                                    />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-base font-bold text-slate-900">
                                            Available for Hire
                                        </h2>

                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                                worker.isAvailable
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            {worker.isAvailable
                                                ? "Available"
                                                : "Unavailable"}
                                        </span>
                                    </div>

                                    <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                                        {worker.isAvailable
                                            ? "You are currently available for bookings."
                                            : "You are currently unavailable for bookings."}
                                    </p>
                                </div>
                            </div>

                            {/* Toggle */}
                            <button
                                type="button"
                                role="switch"
                                aria-checked={!!worker.isAvailable}
                                onClick={toggleAvailability}
                                disabled={updatingAvailability}
                                aria-label="Toggle availability"
                                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                                    worker.isAvailable
                                        ? "bg-indigo-600"
                                        : "bg-slate-300"
                                } ${
                                    updatingAvailability
                                        ? "cursor-not-allowed opacity-60"
                                        : "cursor-pointer"
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-200 ${
                                        worker.isAvailable
                                            ? "left-[1.4rem]"
                                            : "left-0.5"
                                    }`}
                                />
                            </button>
                        </div>
                    </Card>
                </div>

                {/* Skills */}
                <Card>
                    <CardHeader
                        icon={Wrench}
                        title="Skills & Pricing"
                        subtitle="Services You Provide"
                        badge={
                            worker.skills?.length > 0 && (
                                <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                    {worker.skills.length} Active
                                </span>
                            )
                        }
                        action={
                            <LinkButton
                                onClick={() => navigate("/worker/edit-profile")}
                                icon={Plus}
                            >
                                Add Rate
                            </LinkButton>
                        }
                    />

                    {worker.skills?.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                            {worker.skills.map((skill, index) => (
                                <div
                                    key={index}
                                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                                <Wrench size={15} />
                                            </span>

                                            <h3 className="wrap-break-words text-sm font-semibold text-slate-900">
                                                {skill.name}
                                            </h3>
                                        </div>

                                        <div className="shrink-0 text-right">
                                            <div className="text-lg font-bold text-slate-900">
                                                ₹{skill.price}
                                            </div>

                                            <span className="inline-block rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-medium capitalize text-indigo-600">
                                                {skill.priceType?.replace(
                                                    "_",
                                                    " "
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                            <p className="text-sm text-slate-400">
                                No skills added yet
                            </p>
                        </div>
                    )}
                </Card>

                {/* Bottom Grid */}
                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
                    {/* Certifications */}
                    <Card>
                        <CardHeader
                            icon={Award}
                            title="Certifications"
                            subtitle="Your Qualifications"
                            action={
                                <LinkButton
                                    onClick={() =>
                                        navigate("/worker/edit-profile")
                                    }
                                    icon={Plus}
                                >
                                    Add New
                                </LinkButton>
                            }
                        />

                        {worker.certifications?.length > 0 ? (
                            <div className="space-y-2">
                                {worker.certifications.map(
                                    (certificate, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                                        >
                                            <Award
                                                size={16}
                                                className="mt-0.5 shrink-0 text-indigo-500"
                                            />

                                            <p className="wrap-break-words text-sm font-medium text-slate-700">
                                                {certificate}
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                                    <ClipboardList size={20} />
                                </div>

                                <p className="mb-1 text-sm font-medium text-slate-800">
                                    No certifications added
                                </p>

                                <p className="mb-3 max-w-xs text-xs text-slate-500">
                                    Add your trade licenses or certificates to
                                    get more visibility.
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/worker/edit-profile")
                                    }
                                    className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Add Certificate
                                </button>
                            </div>
                        )}
                    </Card>

                    {/* Cooperative */}
                    <Card>
                        <CardHeader
                            icon={Users}
                            title="Cooperative Affiliation"
                            subtitle="Your Organization"
                            badge={
                                worker.cooperativeId && (
                                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                                        Affiliated Member
                                    </span>
                                )
                            }
                        />

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-start gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                    <Building2 size={18} />
                                </span>

                                <div className="min-w-0">
                                    <span className="block text-[11px] text-slate-500">
                                        Cooperative Organization
                                    </span>

                                    <p className="wrap-break-words text-sm font-bold text-slate-900">
                                        {worker.cooperativeId?.name ||
                                            "Not assigned"}
                                    </p>

                                    {worker.cooperativeId
                                        ?.registrationNumber && (
                                        <p className="mt-2 wrap-break-words text-xs text-slate-500">
                                            Registration:{" "}
                                            <span className="font-mono font-semibold text-slate-700">
                                                {
                                                    worker.cooperativeId
                                                        .registrationNumber
                                                }
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Location */}
                <Card>
                    <CardHeader
                        icon={MapPin}
                        title="Service Location"
                        subtitle="Your service location is saved."
                        action={
                            <LinkButton
                                onClick={() => navigate("/worker/edit-profile")}
                            >
                                Update Pin
                            </LinkButton>
                        }
                    />

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <div className="flex items-center gap-3 border-b border-slate-200 bg-white p-3.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                                <MapPinCheck size={18} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900">
                                    Location saved
                                </p>

                                <p className="text-xs text-slate-500">
                                    Customers can find you based on your
                                    service location when you are available.
                                </p>
                            </div>
                        </div>

                        {coordinates?.length === 2 && (
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 bg-linear-to-r from-indigo-50 to-slate-50 px-4 py-3 text-xs text-slate-600">
                                <span className="flex items-center gap-1.5">
                                    <Radio
                                        size={14}
                                        className="text-indigo-500"
                                    />
                                    Lat:{" "}
                                    <span className="font-mono font-semibold">
                                        {Number(coordinates[1]).toFixed(5)}
                                    </span>
                                </span>

                                <span>
                                    Long:{" "}
                                    <span className="font-mono font-semibold">
                                        {Number(coordinates[0]).toFixed(5)}
                                    </span>
                                </span>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Verification banner */}
                <section
                    className={`flex items-center gap-3.5 rounded-2xl border bg-linear-to-br p-4 shadow-sm ${verification.banner}`}
                >
                    <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm ${verification.iconBox}`}
                    >
                        <VerificationIcon size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h2
                            className={`text-sm font-bold sm:text-base ${verification.title}`}
                        >
                            Cooperative Verification Status
                        </h2>

                        <p className={`text-xs sm:text-sm ${verification.text}`}>
                            {verification.message}
                        </p>
                    </div>

                    <span
                        className={`hidden shrink-0 items-center gap-2 rounded-full border bg-white/70 px-3 py-1.5 text-xs font-bold capitalize sm:inline-flex ${verification.pill}`}
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${verification.dot}`}
                        />
                        {verificationStatus}
                    </span>
                </section>
            </main>
        </div>
    );
};

export default WorkerProfile;