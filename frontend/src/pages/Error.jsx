
import { useNavigate } from "react-router-dom";

const HandleError = () => {
  const navigate = useNavigate();
  console.log("Bakchodi na kre Janab");

  return (
    <main className="min-h-screen bg-[#070a0f] text-white flex items-center justify-center px-4">

      <div className="text-center max-w-md">

        {/* 404 */}
        <h1 className="text-8xl sm:text-9xl font-extrabold text-blue-400">
          404
        </h1>

        <h2 className="mt-4 text-2xl sm:text-3xl font-bold">
          Page not found
        </h2>

        <p className="mt-4 text-gray-400 leading-relaxed">
          Looks like this route doesn't exist.
          The page you're looking for may have been
          moved or deleted.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">

          <button
            onClick={() => navigate("/")}
            className="
              px-6 py-3
              rounded-lg
              bg-blue-400
              text-[#06101d]
              font-semibold
              hover:bg-sky-400
              transition
            "
          >
            Go Home
          </button>

          <button
            onClick={() => navigate(-1)}
            className="
              px-6 py-3
              rounded-lg
              border border-gray-600
              text-gray-200
              font-semibold
              hover:border-blue-400
              hover:text-blue-400
              transition
            "
          >
            Go Back
          </button>

        </div>

      </div>

    </main>
  );
};

export default HandleError;