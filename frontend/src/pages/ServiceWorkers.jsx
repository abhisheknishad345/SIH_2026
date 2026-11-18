import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Star,
  ArrowRight,
  MapPin,
  Building2,
  BriefcaseBusiness,
  HardHat,
  Loader2,
  CircleAlert,
  Users,
  SearchX,
  BadgeCheck,
  IndianRupee,
  Wrench,
  Award,
  Store,
  CalendarDays,
  Clock3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import api from "../services/api";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number(price) || 0);

const getPriceLabel = (skill) => {
  if (!skill) return "Price not available";
  if (skill.priceType === "negotiable") return "Price negotiable";
  if (skill.price == null || Number.isNaN(Number(skill.price))) {
    return "Price not available";
  }

  const amount = "₹" + formatPrice(skill.price);
  if (skill.priceType === "fixed") return amount + " · Fixed price";
  if (skill.priceType === "per_hour") return amount + " / hour";
  if (skill.priceType === "per_day") return amount + " / day";
  return amount;
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "W";

function ServiceWorkers() {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let isMounted = true;

    const fetchWorkers = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/services/" + serviceId + "/workers");
        if (isMounted) setWorkers(response.data.workers || []);
      } catch (err) {
        console.error("Unable to load service workers:", err);
        if (isMounted) {
          setError(
            err.response?.data?.message || "Unable to load workers. Please try again."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWorkers();
    return () => {
      isMounted = false;
    };
  }, [serviceId]);

  const categories = useMemo(() => {
    const unique = [...new Set(workers.map((worker) => worker.category).filter(Boolean))];
    return ["All", ...unique];
  }, [workers]);

  const visibleWorkers =
    selectedCategory === "All"
      ? workers
      : workers.filter((worker) => worker.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/customer")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <ChevronLeft size={18} />
            Back
          </button>

          <h1 className="text-lg font-extrabold tracking-tight text-indigo-700 sm:text-xl">
            TechConnect
          </h1>

          <div className="w-16" />
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              <Sparkles size={14} />
              Verified service professionals
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Choose your worker
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Compare ratings, experience, skills, pricing and shop details before booking.
            </p>
          </div>

          {!loading && !error && (
            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-bold text-emerald-700">
              <Users size={17} />
              {workers.length} {workers.length === 1 ? "worker" : "workers"} available
            </div>
          )}
        </div>

        {!loading && !error && categories.length > 2 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={
                    "rounded-full border px-4 py-2 text-sm font-semibold transition " +
                    (active
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700")
                  }
                >
                  {category}
                </button>
              );
            })}
          </div>
        )}

        {loading && (
          <div className="flex min-h-56 items-center justify-center gap-3 text-sm font-medium text-slate-500">
            <Loader2 size={22} className="animate-spin text-indigo-600" />
            Loading worker profiles...
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <CircleAlert size={19} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Couldn't load workers</p>
              <p className="mt-1">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-2 font-bold underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && workers.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Users size={29} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">No workers available</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              There are currently no verified and available workers for this service.
              Please check again later.
            </p>
          </div>
        )}

        {!loading && !error && workers.length > 0 && visibleWorkers.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <SearchX size={30} className="mx-auto mb-3 text-slate-400" />
            <h3 className="font-bold text-slate-800">No workers in this category</h3>
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className="mt-3 text-sm font-bold text-indigo-600 hover:underline"
            >
              Show all workers
            </button>
          </div>
        )}

        {!loading && !error && visibleWorkers.length > 0 && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {visibleWorkers.map((worker) => {
              const matchedSkill = worker.skill || null;
              const allSkills = worker.skills?.length
                ? worker.skills
                : matchedSkill
                  ? [matchedSkill]
                  : [];
              const certifications = worker.certifications || [];

              return (
                <article
                  key={worker.workerId}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70"
                >
                  <div className="border-b border-slate-100 p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 via-violet-100 to-sky-100 text-xl font-extrabold text-indigo-700 ring-4 ring-indigo-50">
                        {getInitials(worker.fullName)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words text-lg font-extrabold text-slate-900 sm:text-xl">
                            {worker.fullName || "Worker"}
                          </h3>
                          {worker.isVerified !== false && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
                              <BadgeCheck size={13} />
                              Verified
                            </span>
                          )}
                        </div>

                        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-indigo-700">
                          <BriefcaseBusiness size={15} />
                          {worker.category || "Service professional"}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                          <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                            <Star size={15} className="fill-amber-400 text-amber-400" />
                            {Number(worker.averageRating) > 0
                              ? Number(worker.averageRating).toFixed(1)
                              : "New"}
                          </span>
                          <span className="text-xs text-slate-500">
                            {worker.totalRatings || 0} customer ratings
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-3.5">
                        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <BriefcaseBusiness size={14} />
                          Experience
                        </div>
                        <p className="text-base font-extrabold text-slate-900">
                          {matchedSkill?.experience ?? "—"}
                          {matchedSkill?.experience != null && (
                            <span className="ml-1 text-xs font-semibold text-slate-500">
                              years
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-indigo-50 p-3.5">
                        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
                          <IndianRupee size={14} />
                          Service price
                        </div>
                        <p className="text-sm font-extrabold text-indigo-900">
                          {getPriceLabel(matchedSkill)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 p-5 sm:p-6">
                    <section>
                      <div className="mb-2.5 flex items-center gap-2 text-sm font-extrabold text-slate-800">
                        <Wrench size={16} className="text-indigo-600" />
                        Skills & services
                      </div>
                      {allSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {allSkills.map((skill, index) => {
                            const isMatched =
                              matchedSkill &&
                              String(skill.serviceId) === String(matchedSkill.serviceId);
                            return (
                              <span
                                key={skill._id || skill.serviceId || index}
                                className={
                                  "rounded-xl border px-3 py-1.5 text-xs font-semibold " +
                                  (isMatched
                                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                    : "border-slate-200 bg-slate-50 text-slate-600")
                                }
                              >
                                <span>{skill.name || "Service"}{isMatched ? " · Selected" : ""}</span>
                                <span className="ml-1 font-bold">({getPriceLabel(skill)})</span>
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">No skills listed.</p>
                      )}
                    </section>

                    <section>
                      <div className="mb-2.5 flex items-center gap-2 text-sm font-extrabold text-slate-800">
                        <Store size={16} className="text-indigo-600" />
                        Shop details
                      </div>
                      {worker.shopName || worker.shopAddress ? (
                        <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                          {worker.shopName && (
                            <div className="flex items-start gap-2.5">
                              <Building2 size={16} className="mt-0.5 shrink-0 text-indigo-600" />
                              <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                  Shop name
                                </p>
                                <p className="break-words text-sm font-bold text-slate-800">
                                  {worker.shopName}
                                </p>
                              </div>
                            </div>
                          )}
                          {worker.shopAddress && (
                            <div className="flex items-start gap-2.5">
                              <MapPin size={16} className="mt-0.5 shrink-0 text-indigo-600" />
                              <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                  Shop address
                                </p>
                                <p className="break-words text-sm leading-5 text-slate-700">
                                  {worker.shopAddress}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="rounded-xl border border-dashed border-slate-200 px-3 py-3 text-xs text-slate-400">
                          This worker has not added shop details.
                        </p>
                      )}
                    </section>

                    {worker.workingHours?.some((day) => day.isWorking) && (
                      <section>
                        <div className="mb-2.5 flex items-center gap-2 text-sm font-extrabold text-slate-800">
                          <CalendarDays size={16} className="text-indigo-600" />
                          Working hours
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {worker.workingHours
                            .filter((day) => day.isWorking)
                            .map((day) => (
                              <div
                                key={day.day}
                                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                              >
                                <span className="font-semibold text-slate-700">{day.day}</span>
                                <span className="inline-flex items-center gap-1 text-slate-500">
                                  <Clock3 size={12} />
                                  {day.startTime} – {day.endTime}
                                </span>
                              </div>
                            ))}
                        </div>
                      </section>
                    )}

                    {certifications.length > 0 && (
                      <section>
                        <div className="mb-2.5 flex items-center gap-2 text-sm font-extrabold text-slate-800">
                          <Award size={16} className="text-indigo-600" />
                          Certifications
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {certifications.map((certificate, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700"
                            >
                              <ShieldCheck size={13} />
                              {certificate}
                            </span>
                          ))}
                        </div>
                      </section>
                    )}

                    <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div className="text-xs leading-5 text-slate-500">
                        <span className="block font-semibold text-slate-700">
                          {worker.isAvailable === false ? "Currently unavailable" : "Available for booking"}
                        </span>
                        {matchedSkill?.priceType === "negotiable"
                          ? "Final price can be discussed in chat."
                          : "Price shown is based on the worker's listed rate."}
                      </div>

                      <button
                        type="button"
                        disabled={worker.isAvailable === false}
                        onClick={() =>
                          navigate("/booking", {
                            state: {
                              workerId: worker.userId,
                              serviceId,
                              workerName: worker.fullName,
                            },
                          })
                        }
                        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        Book now
                        <ArrowRight size={17} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default ServiceWorkers;
