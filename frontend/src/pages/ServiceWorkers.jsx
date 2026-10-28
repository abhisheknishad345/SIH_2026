
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Star,
  Phone,
  ArrowRight,
  MapPin,
  Briefcase,
  HardHat,
  Loader2,
  CircleAlert,
  Users,
  SearchX,
} from "lucide-react";
import { MdVerified } from "react-icons/md";
import api from "../services/api";

function ServiceWorkers() {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI-only filter
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await api.get(`/services/${serviceId}/workers`);

        console.log("Workers:", response.data);

        setWorkers(response.data.workers || []);
      } catch (err) {
        console.error(err);

        setError(err.response?.data?.message || "Unable to load workers.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [serviceId]);

  // Build filter chips from the categories that actually exist in the data
  const categories = useMemo(() => {
    const unique = [...new Set(workers.map((w) => w.category).filter(Boolean))];
    return ["All", ...unique];
  }, [workers]);

  const visibleWorkers =
    selectedCategory === "All"
      ? workers
      : workers.filter((w) => w.category === selectedCategory);

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-indigo-50 via-slate-50 to-slate-100">
      {/* Soft background glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-300/30 blur-3xl sm:h-96 sm:w-96" />

      {/* Navbar */}
      <nav className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur sm:px-5 sm:py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <button
            onClick={() => navigate("/customer")}
            className="flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <h1 className="text-lg font-bold text-indigo-700 sm:text-xl">
            TechConnect
          </h1>

          <div className="w-10 sm:w-17" />
        </div>
      </nav>

      <main className="relative mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
        {/* Heading */}
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Available Workers
            </h2>

            <p className="mt-1 text-sm text-slate-500 sm:mt-2 sm:text-base">
              Choose a verified worker for your service
            </p>
          </div>

          {!loading && !error && workers.length > 0 && (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {workers.length} Pros Available
            </span>
          )}
        </div>

        {/* Category chips */}
        {!loading && !error && workers.length > 0 && categories.length > 2 && (
          <div className="-mx-4 mb-6 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
              {categories.map((category) => {
                const active = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`cursor-pointer whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                      active
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200"
                        : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
            <Loader2 size={20} className="animate-spin text-indigo-600" />
            Finding available workers...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <CircleAlert size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && workers.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
              <Users size={26} />
            </div>

            <h3 className="text-lg font-bold text-slate-800">
              No workers available
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              There are currently no verified workers available for this
              service.
            </p>
          </div>
        )}

        {/* Empty after filtering */}
        {!loading &&
          !error &&
          workers.length > 0 &&
          visibleWorkers.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                <SearchX size={26} />
              </div>

              <h3 className="text-lg font-bold text-slate-800">
                No {selectedCategory} found
              </h3>

              <button
                type="button"
                onClick={() => setSelectedCategory("All")}
                className="mt-3 cursor-pointer text-sm font-semibold text-indigo-600 hover:underline"
              >
                Show all workers
              </button>
            </div>
          )}

        {/* Workers */}
        {!loading && !error && visibleWorkers.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {visibleWorkers.map((worker) => (
              <div
                key={worker.workerId}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200 sm:p-5"
              >
                {/* Worker Header */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="relative shrink-0">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-100 to-purple-100 text-indigo-600">
                      <HardHat size={26} />
                    </div>

                    {worker.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="flex min-w-0 items-center gap-1.5 text-base font-bold text-slate-800 sm:text-lg">
                        <span className="truncate">{worker.fullName}</span>
                        <MdVerified
                          size={16}
                          className="shrink-0 text-blue-500"
                          title="Verified"
                        />
                      </h3>

                      {worker.basePrice != null && (
                        <span className="shrink-0 rounded-lg border border-indigo-100 bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700">
                          ₹{worker.basePrice} base
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-medium text-indigo-600">
                      {worker.category}
                    </p>

                    {/* Rating */}
                    <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm">
                      <Star
                        size={14}
                        className="fill-amber-400 text-amber-400"
                      />

                      <span className="font-semibold text-slate-800">
                        {worker.averageRating?.toFixed(1) || "New"}
                      </span>

                      <span className="text-xs text-black font-mono ">
                        ({worker.totalRatings || 0} ratings)
                      </span>

                      {worker.completedJobs != null && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500">
                            {worker.completedJobs} jobs completed
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Experience + distance */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Briefcase size={14} className="text-indigo-500" />
                    <span className="font-semibold">Experience:</span>{" "}
                    {worker.experience} years
                  </span>

                  {worker.distance != null && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={13} />
                      {Number(worker.distance).toFixed(1)} km away
                    </span>
                  )}
                </div>

                {/* Skills */}
                {worker.skills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {worker.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-5 flex items-center gap-3 pt-0 sm:mt-auto sm:pt-5">
                  {worker.phone && (
                    <a
                      href={`tel:${worker.phone}`}
                      aria-label={`Call ${worker.fullName}`}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <Phone size={18} />
                    </a>
                  )}

                  <button
                    onClick={() =>
                      navigate("/booking", {
                        state: {
                          workerId: worker.userId,
                          serviceId,
                          workerName: worker.fullName,
                        },
                      })
                    }
                    className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:from-indigo-500 hover:to-purple-500 sm:text-base"
                  >
                    Book Now <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ServiceWorkers;