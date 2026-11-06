
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { ArrowRight, LogOut, Users } from "lucide-react";

function AdminDashboard() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-800 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">

                <div className="mb-8 flex justify-between border-2 border-white rounded-2xl p-3">

                    <div className="">
                        <h1 className="text-2xl font-bold text-white sm:text-3xl">
                            Cooperative Admin Dashboard
                        </h1>

                        <p className="mt-1 text-sm text-white capitalize">
                            Manage your cooperative and its workers
                        </p>
                    </div>
                    {/* <div className="border-2 p-2"> */}

                    <button
                        onClick={handleLogout}
                        className="text-md flex items-center justify-center gap-2  font-bold border-2 border-white text-white my-2 p-2 rounded-2xl
                     cursor-pointer hover:text-red-400"
                    >
                     <LogOut size={25} />
                     <span>Logout</span>
                    </button>
                    {/* </div> */}
                </div>


                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 ">

                    <button
                        onClick={() =>
                            navigate("/cooperative-admin/workers/pending")
                        }
                        className="rounded-2xl border-2  bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md cursor-pointer"
                    >
                        <div className="flex h-12 w-12 items-center text-black justify-center rounded-xl bg-yellow-100 text-2xl">
                            <Users size={30}/>
                            
                        </div>

                        <h2 className="mt-5 text-lg font-bold text-gray-900">
                            Pending Workers
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-black capitalize">
                            Review worker profiles waiting for verification
                        </p>

                        <div className="mt-5 flex gap-4 text-md text-xl font-mono font-bold text-indigo-600">
                            Review Workers
                            <ArrowRight
                                size={25}
                                
                            />
                        </div>
                    </button>

                </div>

            </div>
        </div>
    );
}

export default AdminDashboard