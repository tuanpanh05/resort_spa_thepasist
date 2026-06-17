import React, { useState, useEffect } from "react";
import { useNavigate, Link, Routes, Route, useLocation } from "react-router-dom";
import { User, Heart, CalendarDays, CreditCard, ArrowLeft, BadgeCheck, Leaf } from "lucide-react";
import heroBg from "../assets/hero_bg.png";
import { userApi } from "../api";
import { fmtDate } from "../utils/formatters";

// Import Extracted Components
import PersonalInfoForm from "../components/profile/PersonalInfoForm";
import BookingHistory from "../components/profile/BookingHistory";
import HealthRecords from "../components/profile/HealthRecords";
import PaymentHistory from "../components/profile/PaymentHistory";

const MENU_ITEMS = [
  { path: "/tai-khoan", label: "Thông tin cá nhân", icon: User },
  { path: "/tai-khoan/suc-khoe", label: "Hồ sơ sức khỏe", icon: Heart },
  { path: "/tai-khoan/lich-su-dat-hang", label: "Lịch sử đặt hàng", icon: CalendarDays },
  { path: "/tai-khoan/lich-su-thanh-toan", label: "Lịch sử thanh toán", icon: CreditCard },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);

  // CONNECTION POINT: Fetch user profile from GET /api/users/me
  // DATABASE RELATION: Reads columns from table [User]
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) { navigate("/dang-nhap"); return; }
    userApi.getProfile()
      .then(setProfile)
      .catch(() => {
        // Fallback: build from localStorage
        setProfile({
          fullName: localStorage.getItem("userFullName") || sessionStorage.getItem("userFullName") || "Khách hàng",
          email: "",
          phone: "",
          idPassport: "",
          role: localStorage.getItem("userRole") || sessionStorage.getItem("userRole") || "GUEST",
          createdAt: null,
        });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const isActive = (path) => {
    if (path === "/tai-khoan") {
      return location.pathname === "/tai-khoan" || location.pathname === "/tai-khoan/";
    }
    return location.pathname === path;
  };

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "KH";
    return name.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase() || "KH";
  };

  const roleLabel = { GUEST: "Hội viên", ADMIN: "Quản trị viên", STAFF: "Nhân viên", THERAPIST: "Kỹ thuật viên" };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-800 border-t-transparent rounded-full animate-spin" />
        <p className="text-sage-600 text-sm">Đang tải thông tin tài khoản...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sage-50 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* ─ Back link ─ */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-sage-600 hover:text-primary-900 transition mb-6 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại trang chủ
        </Link>

        {/* ─ Profile header card ─ */}
        <div className="bg-white rounded-md shadow-lg overflow-hidden mb-6">
          {/* Banner gradient */}
          <div className="h-24 bg-gradient-to-r from-primary-900 via-primary-700 to-sage-700 relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          </div>
          {/* Avatar + info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-5">
              {/* Avatar circle */}
              <div className="w-20 h-20 rounded-md bg-primary-900 text-white flex items-center justify-center text-2xl font-bold font-serif shadow-lg border-4 border-white flex-shrink-0 relative -top-10 z-10">
                {getInitials(profile?.fullName)}
              </div>
              <div className="sm:pb-1 flex-1 min-w-0">
                <h1 className="font-serif text-xl font-bold text-sage-900 truncate">{profile?.fullName || "Khách hàng"}</h1>
                <p className="text-sm text-sage-500">{profile?.email || "—"}</p>
              </div>
              <div className="flex items-center gap-2 sm:pb-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-primary-50 text-primary-800 border border-primary-200">
                  <Leaf className="h-3.5 w-3.5" />
                  {roleLabel[profile?.role] || profile?.role || "Hội viên"}
                </span>
              </div>
            </div>
            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-primary-50 rounded-md p-3 text-center">
                <p className="text-lg font-bold text-primary-900">{profile?.phone || "—"}</p>
                <p className="text-[11px] text-sage-500 uppercase tracking-wider mt-0.5">Số điện thoại</p>
              </div>
              <div className="bg-primary-50 rounded-md p-3 text-center">
                <p className="text-lg font-bold text-primary-900">{fmtDate(profile?.createdAt)}</p>
                <p className="text-[11px] text-sage-500 uppercase tracking-wider mt-0.5">Ngày tham gia</p>
              </div>
              <div className="bg-primary-50 rounded-md p-3 text-center col-span-2 sm:col-span-1">
                <p className="text-lg font-bold text-primary-900 flex items-center justify-center gap-1">
                  <BadgeCheck className="h-5 w-5 text-emerald-500" />
                  {profile?.status === "ACTIVE" ? "Đang hoạt động" : profile?.status || "—"}
                </p>
                <p className="text-[11px] text-sage-500 uppercase tracking-wider mt-0.5">Trạng thái</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─ Main Dashboard Section with Sidebar & Main Content area ─ */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Navigation Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0 bg-white rounded-md shadow-sm p-4 h-fit border border-primary-100">
            <h2 className="text-[10px] font-bold text-sage-400 uppercase tracking-widest px-3 mb-3">Menu tài khoản</h2>
            <nav className="space-y-1">
              {MENU_ITEMS.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    to={item.path}
                    key={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all rounded-sm ${
                      active
                        ? "bg-primary-900 text-white shadow-sm"
                        : "text-sage-600 hover:bg-primary-50 hover:text-primary-900"
                    }`}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Main Content area */}
          <div className="flex-grow bg-white rounded-md shadow-sm p-6 border border-primary-100">
            <Routes>
              <Route index element={<PersonalInfoForm profile={profile} onProfileUpdate={setProfile} />} />
              <Route path="suc-khoe" element={<HealthRecords />} />
              <Route path="lich-su-dat-hang" element={<BookingHistory />} />
              <Route path="lich-su-thanh-toan" element={<PaymentHistory />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}
