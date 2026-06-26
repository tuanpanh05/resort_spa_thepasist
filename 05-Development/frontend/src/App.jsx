import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Spa from "./pages/Spa";
import Restaurant from "./pages/Restaurant";
import Events from "./pages/Events";
import Yoga from "./pages/Yoga";
import Therapy from "./pages/Therapy";
import Promotions from "./pages/Promotions";
import RoomsPage from "./pages/RoomsPage";
import ScrollToTop from "./components/ScrollToTop";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import ChefDashboard from "./pages/ChefDashboard";
import SpecialistDashboard from "./pages/SpecialistDashboard";
import HealthProfile from "./pages/HealthProfile";
import BookingPage from "./pages/BookingPage";
import GuestDashboard from "./pages/GuestDashboard";
import Payment from "./pages/Payment";
import PaymentResult from "./pages/PaymentResult";
import ProfilePage from "./pages/ProfilePage";


import CustomerLayout from "./layouts/CustomerLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col scroll-smooth selection:bg-primary-200 selection:text-sage-900">
        <Routes>
          {/* Public Customer Routes */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/spa" element={<Spa />} />
            <Route path="/nha-hang" element={<Restaurant />} />
            <Route path="/hoi-nghi" element={<Events />} />
            <Route path="/yoga" element={<Yoga />} />
            <Route path="/vat-ly-tri-lieu" element={<Therapy />} />
            <Route path="/khuyen-mai" element={<Promotions />} />
            <Route path="/phong-o" element={<RoomsPage />} />
            <Route path="/dang-nhap" element={<Login />} />
            <Route path="/dang-ky" element={<Register />} />
            <Route path="/quen-mat-khau" element={<ForgotPassword />} />
            {/* Protected Customer Routes */}
            <Route path="/ho-so-suc-khoe" element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <HealthProfile />
              </ProtectedRoute>
            } />
            <Route path="/dat-lich" element={<BookingPage />} />
            <Route path="/guest-dashboard" element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <GuestDashboard />
              </ProtectedRoute>
            } />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment-result" element={<PaymentResult />} />
            <Route path="/tai-khoan/*" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />

          </Route>

          {/* Operations / Dashboard Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={["STAFF", "RECEPTIONIST", "MANAGER", "ADMIN"]}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
          <Route path="/chef" element={
            <ProtectedRoute allowedRoles={["CHEF", "ADMIN", "MANAGER"]}>
              <ChefDashboard />
            </ProtectedRoute>
          } />
          <Route path="/specialist" element={
            <ProtectedRoute allowedRoles={["SPA", "YOGA", "PHYSIO", "THERAPIST", "ADMIN", "MANAGER"]}>
              <SpecialistDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
