import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
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
import Payment from "./pages/Payment";
import PaymentResult from "./pages/PaymentResult";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col scroll-smooth selection:bg-primary-200 selection:text-sage-900">
        {/* Navigation Header (Shared across all pages) */}
        <Header />

        {/* Main Routed Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
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
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/staff" element={<StaffDashboard />} />
            <Route path="/chef" element={<ChefDashboard />} />
            <Route path="/specialist" element={<SpecialistDashboard />} />
            <Route path="/ho-so-suc-khoe" element={<HealthProfile />} />
            <Route path="/dat-lich" element={<BookingPage />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment-result" element={<PaymentResult />} />
            <Route path="/tai-khoan" element={<ProfilePage />} />
          </Routes>
        </main>

        {/* Footer Info (Shared across all pages) */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
