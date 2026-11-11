
import { useEffect, useState } from "react";
import { ArrowLeft, CircleUserRound, MapPin, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AdminSidebar from "../components/AdminSidebar";

function RejectedWorkers() {
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRejectedWorkers = async () => {
      try {
        setError("");
        const response = await api.get("/workers/rejected");
        setWorkers(response.data.workers || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load rejected workers."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRejectedWorkers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="min-h-screen px-4 py-6 pt-20 sm:px-6 lg:ml-64 lg:p-8">
        <div className="mx-auto max-w-6xl">

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Rejected Workers
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                View rejected worker profiles in your cooperative
              </p>
            </div>

            <button
              onClick={() => navigate("/cooperative-admin")}
              className="flex items-center justify-center gap-2 rounded-xl text-black border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-gray-200"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mb-5 rounded-2xl border-2 border-gray-300 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-700">
              Total rejected workers
            </p>
            <p className="mt-1 text-3xl font-bold text-red-600">
              {workers.length}
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white p-10 text-center">
              Loading Rejected Workers...
            </div>
          ) : workers.length === 0 ? (
            <div className="rounded-2xl border bg-white px-5 py-12 text-center shadow-sm">
              <UserX size={50} className="mx-auto text-red-500" />
              <h2 className="mt-5 text-lg font-semibold text-gray-900">
                No rejected workers
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Rejected worker profiles will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {workers.map((worker) => (
                <div
                  key={worker._id}
                  className="rounded-2xl border-2 border-gray-300 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <CircleUserRound size={33} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-bold text-gray-900">
                        {worker.userId?.fullName || "Unknown Worker"}
                      </h2>
                      <p className="truncate text-sm text-gray-600">
                        {worker.userId?.email || "No email available"}
                      </p>
                      <span className="mt-2 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                        Rejected
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-gray-200 p-3">
                      <p className="text-sm font-bold uppercase text-gray-900">
                        Category
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-700">
                        {worker.category || "Not Defined"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-200 p-3">
                      <p className="text-sm font-bold uppercase text-gray-900">
                        Experience
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-700">
                        {worker.experience ?? "—"} Years
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="mb-2 text-sm font-semibold uppercase text-gray-900">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {worker.skills?.length > 0 ? (
                        worker.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
                          >
                            {skill.name} ₹{skill.price} {skill.priceType}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">
                          No skills listed
                        </span>
                      )}
                    </div>
                  </div>

                  {worker.certifications?.length > 0 && (
                    <div className="mt-5">
                      <p className="mb-2 text-sm font-semibold uppercase text-gray-900">
                        Certifications
                      </p>
                      <p className="text-sm text-gray-700">
                        {worker.certifications.join(", ")}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 rounded-xl bg-gray-200 p-3">
                    <p className="mb-2 text-sm font-semibold uppercase text-gray-900">
                      Location
                    </p>
                    <p className="flex items-center gap-2 text-sm text-blue-600">
                      <MapPin size={20} className="shrink-0 text-black" />
                      {worker.address || "Location coordinates available"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default RejectedWorkers;
