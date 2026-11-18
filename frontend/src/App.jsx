import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import WorkerProfileEdit from "./pages/WorkerProfileEdit";
import CustomerProfile from "./pages/CustomerProfile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminServices from "./pages/AdminServices";
import AdminBookings from "./pages/AdminBookings";
import HandleError from "./pages/Error";
import LandingPage from "./pages/LandingPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CustomerProfileGuard from "./pages/CustomerProfileGuard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import WorkerBookings from "./pages/WorkerBookings";
import RejectWorker from "./pages/RejectWorker";
import { AuthProvider } from "./context/AuthContext";
import ApprovedWorkers from "./pages/ApprovedWorkers";
import RejectedWorkers from "./pages/RejectedWorkers";
import CooperativeChat from "./pages/CooperativeChat";
import BookingChat from "./pages/BookingChat";
import Body from "./components/Body";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Customer routes */}
          <Route path="/customer" element={<Body allowedRoles={["customer"]}><CustomerProfileGuard><CustomerDashboard /></CustomerProfileGuard></Body>} />
          <Route path="/customer/edit-profile" element={<Body allowedRoles={["customer"]}><CustomerProfileGuard><CustomerEditProfile /></CustomerProfileGuard></Body>} />
          <Route path="/customer/create-profile" element={<Body allowedRoles={["customer"]}><CustomerCreateProfile /></Body>} />
          <Route path="/customer/profile" element={<Body allowedRoles={["customer"]}><CustomerProfile /></Body>} />
          <Route path="/customer/bookings" element={<Body allowedRoles={["customer"]}><CustomerProfileGuard><MyBookings /></CustomerProfileGuard></Body>} />
          <Route path="/booking" element={<Body allowedRoles={["customer"]}><CustomerProfileGuard><Booking /></CustomerProfileGuard></Body>} />
          <Route path="/services/:serviceId/workers" element={<Body allowedRoles={["customer"]}><CustomerProfileGuard><ServiceWorkers /></CustomerProfileGuard></Body>} />

          {/* Worker routes */}
          <Route path="/worker/dashboard" element={<Body allowedRoles={["worker"]}><WorkerDashboard /></Body>} />
          <Route path="/worker/bookings" element={<Body allowedRoles={["worker"]}><WorkerBookings /></Body>} />
          <Route path="/worker/profile" element={<Body allowedRoles={["worker"]}><WorkerProfile /></Body>} />
          <Route path="/worker/create-profile" element={<Body allowedRoles={["worker"]}><WorkerCreateProfile /></Body>} />
          <Route path="/worker/rejected" element={<Body allowedRoles={["worker"]}><RejectWorker /></Body>} />
          <Route path="/worker/profile-pending" element={<Body allowedRoles={["worker"]}><WorkerProfilePending /></Body>} />
          <Route path="/worker/edit-profile" element={<Body allowedRoles={["worker"]}><WorkerProfileEdit /></Body>} />
          <Route path="/worker/chat" element={<Body allowedRoles={["worker"]}><CooperativeChat /></Body>} />
          <Route path="/bookings/:bookingId/chat" element={<Body allowedRoles={["customer", "worker"]}><BookingChat /></Body>} />

          {/* Cooperative admin routes */}
          <Route path="/cooperative-admin" element={<Body allowedRoles={["cooperative_admin"]}><AdminDashboard /></Body>} />
          <Route path="/cooperative-admin/services" element={<Body allowedRoles={["cooperative_admin"]}><AdminServices /></Body>} />
          <Route path="/cooperative-admin/bookings" element={<Body allowedRoles={["cooperative_admin"]}><AdminBookings /></Body>} />
          <Route path="/cooperative-admin/chat" element={<Body allowedRoles={["cooperative_admin"]}><CooperativeChat /></Body>} />
          <Route path="/cooperative-admin/workers/pending" element={<Body allowedRoles={["cooperative_admin"]}><PendingWorkers /></Body>} />
          <Route path="/cooperative-admin/workers/approved" element={<Body allowedRoles={["cooperative_admin"]}><ApprovedWorkers /></Body>} />
          <Route path="/cooperative-admin/workers/rejected" element={<Body allowedRoles={["cooperative_admin"]}><RejectedWorkers /></Body>} />

          {/* Super admin routes */}
          <Route path="/admin" element={<Body allowedRoles={["super_admin"]}><SuperAdminDashboard /></Body>} />

          {/* Unknown manually entered URLs also require authentication */}
          <Route path="*" element={<Body><HandleError /></Body>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
