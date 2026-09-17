import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function PendingWorkers() {
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const fetchPendingWorkers = async () => {
    try {
      setError("");

      const response = await api.get("/workers/pending");

      setWorkers(response.data.workers || response.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to load pending workers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingWorkers();
  }, []);

  const handleApprove = async (workerId) => {
    try {
      setActionLoading(workerId);

      await api.patch(`/workers/${workerId}/verify`);

      setWorkers((prev) =>
        prev.filter((worker) => worker._id !== workerId)
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to approve worker."
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleReject = async (workerId) => {
    if (!workerId) {
      setError("Invalid worker.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to reject this worker profile?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(workerId);

      await api.patch(`/workers/${workerId}/reject`);

      setWorkers((prev) =>
        prev.filter(
          (worker) => worker._id !== workerId
        )
      );

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to reject worker."
      );
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Loading pending workers...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-5 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Pending Workers
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Review and verify worker profiles from your cooperative.
            </p>
          </div>

          <button
            onClick={() => navigate("/cooperative-admin")}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto cursor-pointer"
          >
            ⬅ Back to Dashboard
          </button>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Count */}
        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Workers awaiting verification
          </p>

          <p className="mt-1 text-3xl font-bold text-indigo-600">
            {workers.length}
          </p>
        </div>

        {/* Empty state */}
        {workers.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <span className="text-3xl">✓</span>
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              No pending workers
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              All worker profiles have been reviewed.
            </p>

          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            {workers.map((worker) => {

              const workerName =
                worker.userId?.fullName || "Unknown Worker";

              const workerEmail =
                worker.userId?.email || "No email available";

              const busy = actionLoading === worker._id;

              return (
                <div
                  key={worker._id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
                >

                  {/* Worker Header */}
                  <div className="flex items-start gap-4">

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
                      {workerName.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">

                      <h2 className="truncate text-lg font-bold text-gray-900">
                        {workerName}
                      </h2>

                      <p className="truncate text-sm text-gray-500">
                        {workerEmail}
                      </p>

                      <span className="mt-2 inline-flex rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                        Pending
                      </span>

                    </div>

                  </div>

                  {/* Worker Information */}
                  <div className="mt-6 grid grid-cols-2 gap-4">

                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">
                        Category
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {worker.category || "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">
                        Experience
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {worker.experience ?? "—"} years
                      </p>
                    </div>

                  </div>

                  {/* Skills */}
                  <div className="mt-5">

                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Skills
                    </p>

                    <div className="flex flex-wrap gap-2">

                      {worker.skills?.length > 0 ? (
                        worker.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700"
                          >
                            {skill.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">
                          No skills listed
                        </span>
                      )}

                    </div>

                  </div>

                  {/* Certifications */}
                  {worker.certifications?.length > 0 && (
                    <div className="mt-5">

                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Certifications
                      </p>

                      <p className="text-sm text-gray-700">
                        {worker.certifications.join(", ")}
                      </p>

                    </div>
                  )}

                  {/* Location */}
                  <div className="mt-5">

                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Location
                    </p>

                    <p className="text-sm text-gray-600">
                      📍{" "}
                      {worker.address ||
                        "Location coordinates available"}
                    </p>

                  </div>

                  {/* Actions */}
                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

                    <button
                      onClick={() => handleReject(worker._id)}
                      disabled={busy}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-md font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                      {busy ? "Processing..." : "Reject"}
                    </button>

                    <button
                      onClick={() => handleApprove(worker._id)}
                      disabled={busy}
                      className="rounded-xl bg-green-600 px-4 py-3 text-md font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                      {busy ? "Processing..." : "Approve"}
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

export default PendingWorkers;