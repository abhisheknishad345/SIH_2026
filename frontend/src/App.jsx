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
import CustomerCreateProfile from "./pages/CustomerCreateProfile";
import CustomerEditProfile from "./pages/CustomerEditProfile";
import WorkerEditProfile from "./pages/WorkerEditProfile";
import CustomerProfile from "./pages/CustomerProfile";
import AdminDashboard from "./pages/AdminDashboard"
import HandleError from "./pages/Error";
import LandingPage from "./pages/LandingPage";
import api from "./services/api";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CustomerProfileGuard from "./pages/CustomerProfileGuard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";


function App() {
  return (


    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<HandleError />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/customer"
          element={
            <CustomerProfileGuard>
              <CustomerDashboard />
            </CustomerProfileGuard>
          }
        />

        <Route
          path="/customer/edit-profile"
          element={
            <CustomerProfileGuard>

          <CustomerEditProfile />
            </CustomerProfileGuard>
        }

        />

        <Route
          path="/customer/create-profile"
          element={<CustomerCreateProfile />}
        />
        <Route path="/worker" element={<WorkerDashboard />} />
        <Route path="/cooperative-admin" element={<AdminDashboard />} />
        <Route path="/admin" element={<SuperAdminDashboard />} />

        <Route
          path="/booking"
          element={
            <CustomerProfileGuard>
              <Booking />
            </CustomerProfileGuard>
          }
        />

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
          element={
            <CustomerProfileGuard>
              <MyBookings />
            </CustomerProfileGuard>
          }
        />
        <Route
          path="/services/:serviceId/workers"
          element={
            <CustomerProfileGuard>
              <ServiceWorkers />
            </CustomerProfileGuard>
          }
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