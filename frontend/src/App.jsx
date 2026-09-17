import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import CustomerDashboard from "./pages/CustomerDashboard";
import ServiceWorkers from "./pages/ServiceWorkers";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import WorkerDashboard from "./pages/WorkerDashboard";
import WorkerProfile from "./pages/WorkerProfile";
import WorkerCreateProfile from "./pages/WorkerCreateProfile";
import WorkerProfilePending from "./pages/WorkerProfilePending";
import PendingWorkers from "./pages/PendingWorkers";
import CustomerEditProfile from "./pages/CustomerEditprofile";
import CustomerCreateProfile from "./pages/CustomerCreateProfile";
import WorkerEditProfile from "./pages/WorkerEditProfile";
import CustomerProfile from "./pages/CustomerProfile";
import AdminDashboard from "./pages/AdminDashboard"
import LoginPage from "./pages/FakeLogin";
import HandleError from "./pages/Error";
import LandingPage from "./pages/LandingPage";
import api from "./services/api";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


function SuperAdminDashboard() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <h1 className="p-10 text-3xl text-center">Super Admin Dashboard
      </h1>
      <button onClick={handleLogout} className="border-2 p-2 rounded-xl m-3"
      >Logout</button>
      <h2 className="p-5 text-xl ">You can monnitor entire platform</h2>
      <span className="p-5">1. Cooperative</span>
      <span className="p-5">2. Cooperative Admin</span>
      <span className="p-5">3. Workers</span>
      <span className="p-5">4. Customer</span>
    </>
  )
}

function App() {
  return (


    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<HandleError />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route
          path="/customer/edit-profile"
          element={<CustomerEditProfile />}

        />

        <Route
          path="/customer/create-profile"
          element={<CustomerCreateProfile />}
        />
        <Route path="/worker" element={<WorkerDashboard />} />
        <Route path="/cooperative-admin" element={<AdminDashboard />} />
        <Route path="/admin" element={<SuperAdminDashboard />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/worker/profile" element={<WorkerProfile />} />
        <Route path="/worker/create-profile" element={<WorkerCreateProfile />} />
        <Route
          path="/worker/profile-pending"
          element={<WorkerProfilePending />}
        />

        <Route
          path="/customer/profile"
          element={<CustomerProfile />}
        />

        <Route
          path="/cooperative-admin/workers/pending"
          element={<PendingWorkers />}
        />
        <Route
          path="/worker/edit-profile"
          element={<WorkerEditProfile />}
        />

        <Route
          path="/customer/bookings"
          element={<MyBookings />}
        />
        <Route
          path="/services/:serviceId/workers"
          element={<ServiceWorkers />}
        />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;