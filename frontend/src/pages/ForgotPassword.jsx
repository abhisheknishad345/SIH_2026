import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!email.trim()) {
            setError("Please enter your email.");
            return;
        }

        try {
            setLoading(true);

            await api.post("/auth/forgot-password", {
                email: email.trim(),
            });

            // Email ko next page par bhej rahe hain
            navigate("/reset-password", {
                state: {
                    email: email.trim(),
                },
            });
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to send OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 px-4 py-8">
            <div className="flex min-h-[90vh] items-center justify-center">

                <div className="w-full max-w-md">

                    {/* Logo */}
                    <div className="mb-8 text-center">
                        <Link
                            to="/"
                            className="text-3xl font-extrabold tracking-wide text-indigo-600"
                        >
                            SEWA
                        </Link>

                        <p className="mt-2 text-sm text-gray-500">
                            Cooperative Services Platform
                        </p>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">

                        {/* Icon */}
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-2xl">
                            🔐
                        </div>

                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Forgot Password?
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Enter your registered email address and
                                we'll send you a verification OTP.
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="mt-6"
                        >
                            {/* Email */}
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Email Address
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                }}
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-black"
                            />

                            {/* Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-5 w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                            >
                                {loading
                                    ? "Sending OTP..."
                                    : "Get OTP"}
                            </button>
                        </form>

                        {/* Login */}
                        <div className="mt-6 text-center">
                            <Link
                                to="/"
                                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                            >
                                ← Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;