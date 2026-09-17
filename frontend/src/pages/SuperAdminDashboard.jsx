import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function SuperAdminDashboard() {
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");

            navigate("/", {
                replace: true,
            });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#070b14] text-white">

            {/* ================= MOBILE HEADER ================= */}
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#070b14]/95 px-5 py-4 backdrop-blur-xl lg:hidden">

                <button
                    onClick={() => setSidebarOpen(true)}
                    className="rounded-lg p-2 text-gray-300 hover:bg-white/5 cursor-pointer"
                >
                    ☰
                </button>

                <h1 className="text-xl font-extrabold tracking-wide text-indigo-400">
                    TechConnect
                </h1>

                <div className="h-9 w-9 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    SA
                </div>

            </header>


            {/* ================= MOBILE OVERLAY ================= */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                />
            )}


            {/* ================= SIDEBAR ================= */}
            <aside
                className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-white/10 bg-[#0b101b] transition-transform duration-300
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0`}
            >

                {/* Logo */}
                <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">

                    <div>
                        <h1 className="text-2xl font-extrabold tracking-wide text-indigo-400">
                            TechConnect
                        </h1>

                        <p className="mt-0.5 text-[10px] uppercase tracking-widest text-gray-500">
                            Super Admin
                        </p>
                    </div>

                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-white lg:hidden cursor-pointer"
                    >
                        ✕
                    </button>

                </div>


                {/* Navigation */}
                <nav className="flex-1 space-y-2 px-4 py-6">

                    <SidebarItem
                        icon="▦"
                        label="Dashboard"
                        active
                    />

                    <SidebarItem
                        icon="🏢"
                        label="Cooperatives"
                    />

                    <SidebarItem
                        icon="👥"
                        label="Cooperative Admins"
                    />

                    <SidebarItem
                        icon="👷"
                        label="Workers"
                    />

                    <SidebarItem
                        icon="👤"
                        label="Customers"
                    />

                    <SidebarItem
                        icon="📊"
                        label="Reports"
                    />

                    <SidebarItem
                        icon="⚙"
                        label="Settings"
                    />

                </nav>


                {/* Bottom */}
                <div className="border-t border-white/10 p-4">

                    <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/3 p-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/15 font-semibold text-indigo-400">
                            SA
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-200">
                                Super Admin
                            </p>

                            <p className="text-xs text-gray-500">
                                Platform Administrator
                            </p>
                        </div>

                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-400 transition hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </aside>


            {/* ================= MAIN ================= */}
            <main className="lg:ml-72">

                {/* Desktop Topbar */}
                <header className="hidden h-20 items-center justify-between border-b border-white/10 bg-[#070b14] px-8 lg:flex">

                    <div>
                        <p className="text-sm text-gray-500">
                            Administration
                        </p>

                        <h2 className="text-xl font-bold text-gray-100">
                            Platform Overview
                        </h2>
                    </div>


                    <div className="flex items-center gap-4">

                        <button className="relative rounded-xl border border-white/10 bg-white/3 p-3 text-gray-400 hover:bg-white/5 hover:text-white">
                            🔔

                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-500" />
                        </button>

                        <div className="flex items-center gap-3 border-l border-white/10 pl-4">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/15 font-semibold text-indigo-400">
                                SA
                            </div>

                            <div>
                                <p className="text-sm font-semibold">
                                    Super Admin
                                </p>

                                <p className="text-xs text-gray-500">
                                    Administrator
                                </p>
                            </div>

                        </div>

                    </div>

                </header>


                {/* Content */}
                <div className="px-5 py-7 sm:px-8 lg:px-10">

                    {/* Page Heading */}
                    <div className="mb-8">

                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                            <div>
                                <p className="text-sm font-medium text-indigo-400">
                                    Welcome back 👋
                                </p>

                                <h1 className="mt-1 text-2xl font-bold text-gray-100 sm:text-3xl">
                                    Super Admin Dashboard
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm text-gray-500">
                                    Manage cooperatives, administrators,
                                    workers and platform activity from one place.
                                </p>
                            </div>

                            <button
                                onClick={() => navigate("/admin/cooperatives/create")}
                                className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-600 cursor-pointer"
                            >
                                + Create Cooperative
                            </button>

                        </div>

                    </div>


                    {/* ================= STATS ================= */}
                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        <StatCard
                            icon="🏢"
                            label="Cooperatives"
                            value="12"
                            change="+2 this month"
                        />

                        <StatCard
                            icon="👥"
                            label="Cooperative Admins"
                            value="28"
                            change="+5 this month"
                        />

                        <StatCard
                            icon="👷"
                            label="Verified Workers"
                            value="486"
                            change="+32 this month"
                        />

                        <StatCard
                            icon="👤"
                            label="Customers"
                            value="2,840"
                            change="+180 this month"
                        />

                    </section>


                    {/* ================= MAIN GRID ================= */}
                    <section className="mt-8 grid gap-6 xl:grid-cols-3">

                        {/* Cooperative Overview */}
                        <div className="rounded-2xl border border-white/10 bg-[#0b101b] p-5 sm:p-6 xl:col-span-2">

                            <div className="flex items-center justify-between">

                                <div>
                                    <h2 className="text-lg font-bold">
                                        Cooperative Overview
                                    </h2>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Platform cooperative activity
                                    </p>
                                </div>

                                <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300 cursor-pointer">
                                    View All →
                                </button>

                            </div>


                            {/* Table */}
                            <div className="mt-6 overflow-x-auto">

                                <table className="w-full min-w-150 text-left">

                                    <thead>
                                        <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-gray-500">
                                            <th className="pb-3 font-medium">
                                                Cooperative
                                            </th>

                                            <th className="pb-3 font-medium">
                                                Workers
                                            </th>

                                            <th className="pb-3 font-medium">
                                                Services
                                            </th>

                                            <th className="pb-3 font-medium">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-white/5">

                                        <CooperativeRow
                                            name="Delhi Workers Cooperative"
                                            workers="84"
                                            services="32"
                                            active
                                        />

                                        <CooperativeRow
                                            name="Community Services Cooperative"
                                            workers="67"
                                            services="24"
                                            active
                                        />

                                        <CooperativeRow
                                            name="Green Skills Cooperative"
                                            workers="51"
                                            services="19"
                                            active
                                        />

                                        <CooperativeRow
                                            name="Urban Support Cooperative"
                                            workers="42"
                                            services="15"
                                            active
                                        />

                                    </tbody>

                                </table>

                            </div>

                        </div>


                        {/* Quick Actions */}
                        <div className="rounded-2xl border border-white/10 bg-[#0b101b] p-5 sm:p-6">

                            <h2 className="text-lg font-bold">
                                Quick Actions
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                Frequently used operations
                            </p>


                            <div className="mt-6 space-y-3">

                                <QuickAction
                                    icon="🏢"
                                    title="Create Cooperative"
                                    description="Register a new cooperative"
                                    onClick={() =>
                                        navigate("/admin/cooperatives/create")
                                    }
                                />

                                <QuickAction
                                    icon="👤"
                                    title="Create Admin"
                                    description="Assign cooperative administrator"
                                    onClick={() =>
                                        navigate("/admin/cooperative-admins/create")
                                    }
                                />

                                <QuickAction
                                    icon="👷"
                                    title="Manage Workers"
                                    description="View registered workers"
                                />

                                <QuickAction
                                    icon="📊"
                                    title="View Reports"
                                    description="Platform performance"
                                />

                            </div>

                        </div>

                    </section>


                    {/* ================= ACTIVITY ================= */}
                    <section className="mt-6 rounded-2xl border border-white/10 bg-[#0b101b] p-5 sm:p-6">

                        <div className="flex items-center justify-between">

                            <div>
                                <h2 className="text-lg font-bold">
                                    Recent Activity
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    Latest platform events
                                </p>
                            </div>

                            <button className="text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer">
                                View All →
                            </button>

                        </div>


                        <div className="mt-6 space-y-1">

                            <Activity
                                icon="🏢"
                                title="New cooperative registered"
                                description="Community Services Cooperative"
                                time="2 hours ago"
                            />

                            <Activity
                                icon="👤"
                                title="New cooperative admin created"
                                description="Administrator assigned successfully"
                                time="5 hours ago"
                            />

                            <Activity
                                icon="👷"
                                title="32 workers verified"
                                description="Worker verification completed"
                                time="Yesterday"
                            />

                            <Activity
                                icon="✓"
                                title="Platform activity updated"
                                description="Daily system operations completed"
                                time="Yesterday"
                            />

                        </div>

                    </section>


                    {/* Footer */}
                    <div className="mt-8 border-t border-white/5 pt-6 text-center text-xs text-gray-600">
                        TechConnect Cooperative Services Platform • Super Admin
                    </div>

                </div>

            </main>

        </div>
    );
}


/* ================= COMPONENTS ================= */

function SidebarItem({ icon, label, active }) {
    return (
        <button
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition cursor-pointer
            ${
                active
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "text-gray-400 hover:bg-white/4 hover:text-gray-200"
            }`}
        >
            <span className="w-5 text-center">
                {icon}
            </span>

            {label}
        </button>
    );
}


function StatCard({
    icon,
    label,
    value,
    change,
}) {
    return (
        <div className="group rounded-2xl border border-white/10 bg-[#0b101b] p-5 transition hover:border-indigo-400/20">

            <div className="flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-xl">
                    {icon}
                </div>

                <span className="text-xs text-green-400">
                    {change}
                </span>

            </div>

            <p className="mt-5 text-sm text-gray-500">
                {label}
            </p>

            <p className="mt-1 text-3xl font-bold tracking-tight">
                {value}
            </p>

        </div>
    );
}


function CooperativeRow({
    name,
    workers,
    services,
    active,
}) {
    return (
        <tr className="text-sm">

            <td className="py-4">
                <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-sm">
                        🏢
                    </div>

                    <span className="font-medium text-gray-200">
                        {name}
                    </span>

                </div>
            </td>

            <td className="py-4 text-gray-400">
                {workers}
            </td>

            <td className="py-4 text-gray-400">
                {services}
            </td>

            <td className="py-4">

                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold
                    ${
                        active
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                    }`}
                >
                    {active ? "Active" : "Inactive"}
                </span>

            </td>

        </tr>
    );
}


function QuickAction({
    icon,
    title,
    description,
    onClick,
}) {
    return (
        <button
            onClick={onClick}
            className="flex w-full items-center gap-4 rounded-xl border border-white/5 bg-white/2 p-4 text-left transition hover:border-indigo-400/20 hover:bg-white/4"
        >

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-lg">
                {icon}
            </div>

            <div className="min-w-0 flex-1">

                <p className="text-sm font-semibold text-gray-200">
                    {title}
                </p>

                <p className="mt-1 truncate text-xs text-gray-500">
                    {description}
                </p>

            </div>

            <span className="text-gray-600">
                →
            </span>

        </button>
    );
}


function Activity({
    icon,
    title,
    description,
    time,
}) {
    return (
        <div className="flex items-center gap-4 rounded-xl p-3 transition hover:bg-white/2">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-sm">
                {icon}
            </div>

            <div className="min-w-0 flex-1">

                <p className="text-sm font-medium text-gray-200">
                    {title}
                </p>

                <p className="mt-1 truncate text-xs text-gray-500">
                    {description}
                </p>

            </div>

            <span className="shrink-0 text-xs text-gray-600">
                {time}
            </span>

        </div>
    );
}

export default SuperAdminDashboard;