
import { useNavigate } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";

function AdminDashboard() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-800">

            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
           <main className="min-h-screen p-4 pt-16 sm:p-6 sm:pt-20 lg:ml-64 lg:p-8">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 rounded-2xl border-2 border-white p-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h1 className="text-2xl font-bold text-white sm:text-3xl">
                            Cooperative Admin Dashboard
                        </h1>

                        <p className="mt-1 text-sm text-gray-300">
                            Manage your cooperative and its workers
                        </p>
                    </div>

                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

                    {/* Pending Workers */}
                    <button
                        onClick={() =>
                            navigate("/cooperative-admin/workers/pending")
                        }
                        className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-black">
                            <Users size={30} />
                        </div>

                        <h2 className="mt-5 text-lg font-bold text-gray-900">
                            Pending Workers
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Review worker profiles waiting for verification.
                        </p>

                        <div className="mt-5 flex items-center gap-3 font-bold text-indigo-600">
                            Review Workers
                            <ArrowRight size={22} />
                        </div>
                    </button>

                </div>

            </main>
        </div>
    );
}

export default AdminDashboard;