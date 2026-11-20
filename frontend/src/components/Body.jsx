import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Body({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  // Wait until the cookie-based session check is complete.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080b0a] text-zinc-300">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-lime-300" />
          <p className="mt-4 text-sm">Checking your session...</p>
        </div>
      </div>
    );
  }

  // No valid session: always return to the public landing page.
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Prevent a logged-in user from opening another role's pages manually.
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const roleHome = {
      customer: "/customer",
      worker: "/worker/dashboard",
      cooperative_admin: "/cooperative-admin",
      super_admin: "/admin",
    };

    return <Navigate to={roleHome[user.role] || "/"} replace />;
  }

  return children;
}

export default Body;
