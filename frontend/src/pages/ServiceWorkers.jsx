import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function ServiceWorkers() {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await api.get(
          `/services/${serviceId}/workers`
        );

        console.log("Workers:", response.data);

        setWorkers(response.data.workers || []);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
          "Unable to load workers."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [serviceId]);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-5 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">

          <button
            onClick={() => navigate("/customer")}
            className="text-gray-600 hover:text-indigo-600 cursor-pointer"
          >
            ⬅ Back
          </button>

          <h1 className="text-xl font-bold text-indigo-700">
            TechConnect
          </h1>

          <div className="w-10" />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-5 py-7">

        <div className="mb-7">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Available Workers
          </h2>

          <p className="text-gray-500 mt-2">
            Choose a verified worker for your service
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-gray-500">
            Finding available workers...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && workers.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-4xl mb-3">👷</div>

            <h3 className="text-lg font-bold text-gray-800">
              No workers available
            </h3>

            <p className="text-gray-500 mt-2">
              There are currently no verified workers available
              for this service.
            </p>
          </div>
        )}

        {/* Workers */}
        {!loading && !error && workers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {workers.map((worker) => (
              <div
                key={worker.workerId}
                className="bg-white rounded-2xl shadow-sm p-5
                           hover:shadow-md transition"
              >

                {/* Worker Header */}
                <div className="flex items-center gap-4">

                  <div
                    className="w-14 h-14 rounded-full bg-indigo-100
                               flex items-center justify-center
                               text-2xl"
                  >
                    👷
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {worker.fullName}
                    </h3>

                    <p className="text-sm text-indigo-600">
                      {worker.category}
                    </p>
                  </div>

                </div>

                {/* Rating */}
                <div className="mt-5 flex items-center gap-2">
                  <span className="text-yellow-500">★</span>

                  <span className="font-semibold text-gray-800">
                    {worker.averageRating?.toFixed(1) || "New"}
                  </span>

                  <span className="text-sm text-gray-500">
                    ({worker.totalRatings || 0} ratings)
                  </span>
                </div>

                {/* Experience */}
                <div className="mt-3 text-sm text-gray-600">
                  <span className="font-semibold">
                    Experience:
                  </span>{" "}
                  {worker.experience} years
                </div>

                {/* Skills */}
                {worker.skills?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {worker.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600
                                   px-2 py-1 rounded-full"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Book */}
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
                  className="w-full mt-5 py-3 bg-indigo-600
                             text-white font-semibold rounded-xl
                             hover:bg-indigo-700 transition cursor-pointer"
                >
                  Book Now
                </button>

              </div>
            ))}

          </div>
        )}

      </main>
    </div>
  );
}

export default ServiceWorkers;