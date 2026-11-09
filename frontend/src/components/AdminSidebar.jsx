
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserX,
  BriefcaseBusiness,
  CalendarDays,
  Menu,
  X,
  LogOut,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const navigation = [
  {
    name: "Dashboard",
    path: "/cooperative-admin",
    icon: LayoutDashboard,
  },
  {
    name: "Pending Workers",
    path: "/cooperative-admin/workers/pending",
    icon: Users,
  },
  {
    name: "Approved Workers",
    path: "/cooperative-admin/workers/approved",
    icon: UserCheck,
  },
  {
    name: "Rejected Workers",
    path: "/cooperative-admin/workers/rejected",
    icon: UserX,
  },
  {
    name: "Services",
    path: "/cooperative-admin/services",
    icon: BriefcaseBusiness,
  },
  {
    name: "Bookings",
    path: "/cooperative-admin/bookings",
    icon: CalendarDays,
  },
];

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-700 bg-slate-900 text-white transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-700 px-6">
          <div>
            <h1 className="text-2xl font-bold text-indigo-400">
              TechConnect
            </h1>
            <p className="text-xs text-slate-400">
              Cooperative Admin
            </p>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        <div className="px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Management
          </p>

          <nav className="space-y-1">
            {navigation.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/cooperative-admin"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                {name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-700 p-4">
          <div className="mb-3 px-3">
            <p className="text-sm font-semibold">
              {user?.name || "Admin"}
            </p>
            <p className="truncate text-xs text-slate-400">
              {user?.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex cursor-pointer w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-30 rounded-lg bg-slate-900 p-2 text-white shadow-lg lg:hidden"
        aria-label="Open admin menu"
      >
        <Menu size={22} />
      </button>
    </>
  );
}
