import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";

function CustomerProfileGuard({ children }) {
    const [loading, setLoading] = useState(true);
    const [hasProfile, setHasProfile] = useState(false);

    useEffect(() => {
        const checkProfile = async () => {
            try {
                await api.get("/customers/profile");

                setHasProfile(true);
            } catch (error) {
                if (error.response?.status === 404) {
                    setHasProfile(false);
                }
            } finally {
                setLoading(false);
            }
        };

        checkProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <p className="text-gray-500">
                    Checking profile...
                </p>
            </div>
        );
    }

    if (!hasProfile) {
        return (
            <Navigate
                to="/customer/create-profile"
                replace
            />
        );
    }

    return children;
}

export default CustomerProfileGuard;