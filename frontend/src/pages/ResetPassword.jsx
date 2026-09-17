import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState(
        location.state?.email || ""
    );

    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        // Email validation
        if (!email.trim()) {
            setError("Please enter your email.");
            return;
        }

        // OTP validation
        if (!otp.trim()) {
            setError("Please enter the OTP.");
            return;
        }

        if (!/^\d{6}$/.test(otp.trim())) {
            setError("OTP must be 6 digits.");
            return;
        }

        // Password validation
        if (!newPassword) {
            setError("Please enter your new password.");
            return;
        }

        if (newPassword.length < 6) {
            setError(
                "Password must be at least 6 characters long."
            );
            return;
        }

        // Confirm password
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            await api.post("/auth/reset-password", {
                email: email.trim(),
                otp: otp.trim(),
                newPassword,
            });

            setSuccess(true);

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to reset password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Success screen
    if (success) {
        return (
            <div className="min-h-screen bg-gray-100 px-4 py-8">
                <div className="flex min-h-[90vh] items-center justify-center">

                    <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm sm:p-8">

                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                            ✓
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900">
                            Password Reset Successfully
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-gray-500">
                            Your password has been changed successfully.
                            You can now login using your new password.
                        </p>

                        <button
                            onClick={() => navigate("/")}
                            className="mt-7 w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                            Go to Login
                        </button>

                    </div>
                </div>
            </div>
        );
    }

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
                            🔑
                        </div>

                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Reset Password
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Enter the OTP sent to your email and
                                create a new password.
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
                            className="mt-6 space-y-5"
                        >

                            {/* Email */}
                            <div>
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
                            </div>

                            {/* OTP */}
                            <div>
                                <label className="mb-2  block text-sm font-medium text-gray-700">
                                    OTP
                                </label>

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => {
                                        const value =
                                            e.target.value
                                                .replace(/\D/g, "");

                                        setOtp(value);
                                        setError("");
                                    }}
                                    placeholder="Enter 6-digit OTP"
                                    autoComplete="one-time-code"
                                    required
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-lg font-semibold tracking-[0.35em] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-black"
                                />
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    New Password
                                </label>

                                <input
                                    type="text"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(
                                            e.target.value
                                        );
                                        setError("");
                                    }}
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
                                    required
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-black"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>

                                <input
                                    type="text"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(
                                            e.target.value
                                        );
                                        setError("");
                                    }}
                                    placeholder="Confirm new password"
                                    autoComplete="new-password"
                                    required
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-black"
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                            >
                                {loading
                                    ? "Resetting Password..."
                                    : "Reset Password"}
                            </button>
                        </form>

                        {/* Back */}
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

export default ResetPassword;