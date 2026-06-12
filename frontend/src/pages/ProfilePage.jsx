import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link, Routes, Route, useLocation } from "react-router-dom";
import {
  User,
  Phone,
  CreditCard,
  Save,
  Lock,
  Eye,
  EyeOff,
  CalendarDays,
  Sparkles,
  Heart,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  Clock,
  ChevronRight,
  BedDouble,
  Dumbbell,
  BadgeCheck,
  ShieldCheck,
  Trash2,
  Info,
} from "lucide-react";
import heroBg from "../assets/hero_bg.png";
import { userApi, medicalApi } from "../api";

// ─── Allergy & Diet constants (same as HealthProfile.jsx) ───────────────────
const ALLERGY_OPTIONS = [
  { key: "peanuts", label: "Đậu phộng (Peanuts)" },
  { key: "gluten", label: "Gluten / Lúa mì" },
  { key: "shellfish", label: "Hải sản có vỏ (Shellfish)" },
  { key: "dairy", label: "Sữa / Lactose" },
  { key: "eggs", label: "Trứng" },
  { key: "soy", label: "Đậu nành (Soy)" },
  { key: "treenuts", label: "Hạt cây (Tree nuts)" },
  { key: "fish", label: "Cá" },
];
const DIET_OPTIONS = [
  { key: "omnivore", label: "Ăn tạp (Omnivore)" },
  { key: "vegetarian", label: "Chay (Vegetarian)" },
  { key: "vegan", label: "Thuần chay (Vegan)" },
  { key: "pescatarian", label: "Ăn cá (Pescatarian)" },
  { key: "keto", label: "Keto" },
  { key: "halal", label: "Halal" },
];

// ─── Status badge helpers ────────────────────────────────────────────────────
const ROOM_STATUS_MAP = {
  PENDING:     { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-800 border-amber-200" },
  CONFIRMED:   { label: "Đã xác nhận",  color: "bg-blue-100 text-blue-800 border-blue-200" },
  CHECKED_IN:  { label: "Đã nhận phòng", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  CHECKED_OUT: { label: "Đã trả phòng", color: "bg-gray-100 text-gray-600 border-gray-200" },
  CANCELLED:   { label: "Đã huỷ",       color: "bg-red-100 text-red-700 border-red-200" },
};
const SPA_STATUS_MAP = {
  PENDING:    { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-800 border-amber-200" },
  CONFIRMED:  { label: "Đã xác nhận",  color: "bg-blue-100 text-blue-800 border-blue-200" },
  COMPLETED:  { label: "Hoàn thành",   color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  CANCELLED:  { label: "Đã huỷ",       color: "bg-red-100 text-red-700 border-red-200" },
  NO_SHOW:    { label: "Không đến",    color: "bg-gray-100 text-gray-500 border-gray-200" },
};

function StatusBadge({ status, map }) {
  const { label, color } = map[status] || { label: status, color: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[11px] font-semibold border ${color}`}>
      {label}
    </span>
  );
}

// ─── Format helpers ──────────────────────────────────────────────────────────
const fmtDate = (val) => val ? new Date(val).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
const fmtDateTime = (val) => val ? new Date(val).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const fmtCurrency = (val) => val != null ? Number(val).toLocaleString("vi-VN") + " ₫" : "—";

// ─── Mock data (used when API not yet available) ──────────────────────────────
const MOCK_ROOM_BOOKINGS = [];
const MOCK_SPA_BOOKINGS  = [];

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 – Personal Info
// ═══════════════════════════════════════════════════════════════════════════════
function PersonalInfoTab({ profile, onProfileUpdate }) {
  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [phone, setPhone]       = useState(profile?.phone || "");
  const [idPassport, setIdPassport] = useState(profile?.idPassport || "");
  const [saving, setSaving]     = useState(false);
  const [infoMsg, setInfoMsg]   = useState({ type: "", text: "" });

  // ── Change password sub-state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd]         = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdMsg, setPwdMsg]           = useState({ type: "", text: "" });
  const [pwdSaving, setPwdSaving]     = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setPhone(profile.phone || "");
      setIdPassport(profile.idPassport || "");
    }
  }, [profile]);

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setInfoMsg({ type: "", text: "" });
    if (!fullName.trim()) {
      setInfoMsg({ type: "error", text: "Họ tên không được để trống." });
      return;
    }
    setSaving(true);
    try {
      const updated = await userApi.updateProfile({ fullName, phone, idPassport });
      onProfileUpdate(updated);
      // sync localStorage name for Header
      localStorage.setItem("userFullName", updated.fullName || fullName);
      setInfoMsg({ type: "success", text: "Thông tin đã được cập nhật thành công!" });
    } catch (err) {
      setInfoMsg({ type: "error", text: err.message || "Không thể lưu thông tin. Vui lòng thử lại." });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: "", text: "" });
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: "error", text: "Mật khẩu mới và xác nhận không khớp." });
      return;
    }
    if (newPwd.length < 8) {
      setPwdMsg({ type: "error", text: "Mật khẩu mới phải có ít nhất 8 ký tự." });
      return;
    }
    setPwdSaving(true);
    try {
      await userApi.changePassword(currentPwd, newPwd);
      setPwdMsg({ type: "success", text: "Mật khẩu đã được thay đổi thành công!" });
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (err) {
      setPwdMsg({ type: "error", text: err.message || "Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại." });
    } finally {
      setPwdSaving(false);
    }
  };

  const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = "text", readOnly = false }) => (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-sage-700 uppercase tracking-wider block">{label}</label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-1 flex items-center text-sage-400 pointer-events-none">
          <Icon className="h-4 w-4" />
        </span>
        <input
          type={type}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full pl-8 pr-4 py-2.5 border-b ${readOnly ? "border-sage-200 text-sage-400 bg-transparent cursor-not-allowed" : "border-primary-200 focus:border-primary-800 bg-transparent"} text-sm text-sage-900 placeholder-sage-400 outline-none transition-all`}
        />
      </div>
    </div>
  );

  const PwdInput = ({ label, value, onChange, show, onToggle }) => (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-sage-700 uppercase tracking-wider block">{label}</label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-1 flex items-center text-sage-400 pointer-events-none">
          <Lock className="h-4 w-4" />
        </span>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-8 pr-8 py-2.5 border-b border-primary-200 bg-transparent focus:border-primary-800 text-sm text-sage-900 outline-none transition-all"
        />
        <button type="button" onClick={onToggle}
          className="absolute inset-y-0 right-0 pr-1 flex items-center text-sage-400 hover:text-sage-700 transition-colors">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Personal info form */}
      <div className="bg-white rounded-md p-2 pb-8 border-b border-primary-100">
        <h3 className="text-sm font-bold text-sage-900 uppercase tracking-wider mb-5 flex items-center gap-2">
          <User className="h-4 w-4 text-primary-700" />
          Thông Tin Cá Nhân
        </h3>

        {infoMsg.text && (
          <div className={`mb-5 p-3.5 rounded-md text-sm border flex items-start gap-2 ${infoMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
            {infoMsg.type === "success" ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />}
            <span>{infoMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveInfo} className="space-y-4">
          <InputField label="Email (không thể thay đổi)" icon={User} value={profile?.email || ""} readOnly />
          <InputField label="Họ và Tên" icon={User} value={fullName} onChange={setFullName} placeholder="Nguyễn Văn A" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Số Điện Thoại" icon={Phone} value={phone} onChange={setPhone} placeholder="0901234567" />
            <InputField label="CCCD / Hộ chiếu" icon={CreditCard} value={idPassport} onChange={setIdPassport} placeholder="Nhập số CCCD..." />
          </div>
          <div className="pt-2">
            <button type="submit" disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 rounded-md text-sm font-semibold bg-primary-900 hover:bg-primary-800 text-white shadow transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
            </button>
          </div>
        </form>
      </div>

      {/* Change password form */}
      <div className="bg-white rounded-md p-2 pt-6">
        <h3 className="text-sm font-bold text-sage-900 uppercase tracking-wider mb-5 flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary-700" />
          Đổi Mật Khẩu
        </h3>

        {pwdMsg.text && (
          <div className={`mb-5 p-3.5 rounded-md text-sm border flex items-start gap-2 ${pwdMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
            {pwdMsg.type === "success" ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />}
            <span>{pwdMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <PwdInput label="Mật Khẩu Hiện Tại" value={currentPwd} onChange={setCurrentPwd} show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PwdInput label="Mật Khẩu Mới" value={newPwd} onChange={setNewPwd} show={showNew} onToggle={() => setShowNew(!showNew)} />
            <PwdInput label="Xác Nhận Mật Khẩu Mới" value={confirmPwd} onChange={setConfirmPwd} show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
          </div>
          <div className="pt-2">
            <button type="submit" disabled={pwdSaving}
              className="w-full sm:w-auto px-6 py-2.5 rounded-md text-sm font-semibold bg-sage-800 hover:bg-sage-700 text-white shadow transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
              {pwdSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock className="h-4 w-4" />}
              {pwdSaving ? "Đang cập nhật..." : "Cập Nhật Mật Khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 – Service History
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 – Service & Order History
// ═══════════════════════════════════════════════════════════════════════════════
function HistoryTab() {
  const [activeCategory, setActiveCategory] = useState("rooms"); // "rooms" or "others"
  const [serviceFilter, setServiceFilter] = useState("all"); // "all", "spa", "yoga", "food"
  const [roomBookings, setRoomBookings] = useState([]);
  const [spaBookings, setSpaBookings]   = useState([]);
  const [loading, setLoading] = useState(true);

  // CONNECTION POINT:
  // Fetch room bookings from GET /api/users/me/bookings and spa bookings from GET /api/users/me/spa-bookings.
  // DATABASE RELATION:
  // - roomBookings: Maps to table [room_booking] and [room_booking_detail]
  // - spaBookings: Maps to table [spa_booking] and [spa_service]
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const [rooms, spas] = await Promise.all([
          userApi.getMyBookings().catch(() => []),
          userApi.getMySpaBookings().catch(() => []),
        ]);
        setRoomBookings(rooms || []);
        setSpaBookings(spas || []);
      } catch (err) {
        console.error("Lỗi khi tải lịch sử:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Mocked other services (Yoga and Food) for connection and preview
  // CONNECTION POINT (Future Dev): Integrate with Yoga Module (table [work_schedule]/[spa_booking]) and Restaurant Module (table [food_order]).
  const MOCK_YOGA_BOOKINGS = [
    {
      spaBookingId: "yoga-1",
      serviceName: "Hatha Yoga Phục Hồi",
      serviceCategory: "Yoga & Mindfulness",
      startDatetime: new Date(Date.now() - 86400000 * 2).toISOString(),
      endDatetime: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
      status: "COMPLETED",
      priceAtBooking: 250000,
      therapistName: "Guru Minh Tuấn",
      isPackageIncluded: true,
      type: "yoga"
    },
    {
      spaBookingId: "yoga-2",
      serviceName: "Thiền Định Chuông Xoay Tây Tạng",
      serviceCategory: "Yoga & Mindfulness",
      startDatetime: new Date(Date.now() + 86400000).toISOString(),
      endDatetime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
      status: "CONFIRMED",
      priceAtBooking: 300000,
      therapistName: "Guru Minh Tuấn",
      isPackageIncluded: false,
      type: "yoga"
    }
  ];

  const MOCK_FOOD_ORDERS = [
    {
      spaBookingId: "food-1",
      serviceName: "Set Soup Sâm Gà Đông Trùng Hạ Thảo",
      serviceCategory: "Ẩm thực dưỡng sinh",
      startDatetime: new Date(Date.now() - 86400000 * 3).toISOString(),
      endDatetime: new Date(Date.now() - 86400000 * 3).toISOString(),
      status: "COMPLETED", // mapping to DELIVERED
      priceAtBooking: 320000,
      isPackageIncluded: false,
      type: "food",
      specialNote: "Không bột ngọt, ít muối"
    },
    {
      spaBookingId: "food-2",
      serviceName: "Nước ép Detox Cần Tây Táo Xanh",
      serviceCategory: "Ẩm thực dưỡng sinh",
      startDatetime: new Date(Date.now() - 3600000 * 2).toISOString(),
      endDatetime: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: "COMPLETED",
      priceAtBooking: 95000,
      isPackageIncluded: true,
      type: "food",
      specialNote: "Không đường, nhiều đá"
    }
  ];

  const allOtherServices = [
    ...spaBookings.map(s => ({ ...s, type: "spa" })),
    ...MOCK_YOGA_BOOKINGS,
    ...MOCK_FOOD_ORDERS
  ];

  const filteredOtherServices = allOtherServices.filter(item => {
    if (serviceFilter === "all") return true;
    return item.type === serviceFilter;
  });

  const EmptyState = ({ icon: Icon, message }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="inline-flex p-4 rounded-md bg-primary-50 text-primary-300 mb-4">
        <Icon className="h-8 w-8" />
      </div>
      <p className="text-sage-500 text-sm">{message}</p>
      <Link to="/dat-lich" className="mt-4 px-5 py-2 rounded-md text-xs font-semibold bg-primary-900 text-white hover:bg-primary-800 transition">
        Đặt lịch ngay
      </Link>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Category selector */}
      <div className="flex gap-2 bg-primary-50 p-1 rounded-md w-fit">
        {[
          { key: "rooms", label: "Đặt Phòng", icon: BedDouble, count: roomBookings.length },
          { key: "others", label: "Dịch Vụ Khác (Spa, Yoga, Food)", icon: Sparkles, count: allOtherServices.length },
        ].map(({ key, label, icon: Icon, count }) => (
          <button key={key} onClick={() => setActiveCategory(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${activeCategory === key ? "bg-white text-primary-900 shadow-sm" : "text-sage-600 hover:text-sage-800"}`}>
            <Icon className="h-3.5 w-3.5" />
            {label}
            <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${activeCategory === key ? "bg-primary-100 text-primary-800" : "bg-sage-200 text-sage-600"}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary-800 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeCategory === "rooms" ? (
        roomBookings.length === 0 ? (
          <EmptyState icon={BedDouble} message="Bạn chưa có lịch đặt phòng nào." />
        ) : (
          <div className="space-y-3">
            {roomBookings.map((b) => (
              <div key={b.bookingId} className="bg-white rounded-md border-b border-primary-100 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs text-sage-500 mb-1">Booking #{b.bookingId}</p>
                    <p className="text-sm font-semibold text-sage-900">
                      {fmtDate(b.checkInDate)} → {fmtDate(b.checkOutDate)}
                    </p>
                    {b.packageName && (
                      <p className="text-xs text-primary-700 mt-0.5 flex items-center gap-1">
                        <BadgeCheck className="h-3.5 w-3.5" /> Gói: {b.packageName}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={b.status} map={ROOM_STATUS_MAP} />
                </div>
                {b.rooms && b.rooms.length > 0 && (
                  <div className="border-t border-primary-50 pt-3 mt-3 space-y-1.5">
                    {b.rooms.map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-sage-600">
                        <span className="flex items-center gap-1.5">
                          <BedDouble className="h-3.5 w-3.5 text-primary-400" />
                          Phòng {r.roomNumber} — {r.typeName}
                        </span>
                        <span className="font-semibold text-sage-800">{fmtCurrency(r.priceAtBooking)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-primary-50">
                  <span className="text-xs text-sage-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Đặt ngày {fmtDate(b.createdAt)}
                  </span>
                  <span className="text-xs font-bold text-sage-900">Cọc: {fmtCurrency(b.totalDeposit)}</span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Category: others */
        <div className="space-y-4">
          {/* Sub filters */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "all", label: "Tất cả dịch vụ" },
              { key: "spa", label: "Spa & Vật lý trị liệu" },
              { key: "yoga", label: "Yoga & Thiền" },
              { key: "food", label: "Ẩm thực dưỡng sinh" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setServiceFilter(key)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${serviceFilter === key ? "bg-primary-900 text-white border-primary-900 shadow-sm" : "bg-white border-primary-200 text-sage-600 hover:border-primary-400"}`}>
                {label}
              </button>
            ))}
          </div>

          {filteredOtherServices.length === 0 ? (
            <EmptyState icon={Sparkles} message="Không có lịch sử sử dụng dịch vụ nào." />
          ) : (
            <div className="space-y-3">
              {filteredOtherServices.map((s) => (
                <div key={s.spaBookingId} className="bg-white rounded-md border-b border-primary-100 p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-[10px] text-sage-400 font-bold uppercase tracking-wider mb-1">
                        {s.type === "spa" ? "Spa Booking" : s.type === "yoga" ? "Yoga Booking" : "Room Service Food"}
                      </p>
                      <p className="text-sm font-semibold text-sage-900">{s.serviceName}</p>
                      {s.serviceCategory && (
                        <p className="text-xs text-primary-600 mt-0.5 flex items-center gap-1">
                          {s.type === "spa" && <Dumbbell className="h-3.5 w-3.5" />}
                          {s.type === "yoga" && <Sparkles className="h-3.5 w-3.5" />}
                          {s.type === "food" && <Leaf className="h-3.5 w-3.5" />}
                          {s.serviceCategory}
                        </p>
                      )}
                      {s.therapistName && (
                        <p className="text-xs text-sage-500 mt-1">Hướng dẫn: {s.therapistName}</p>
                      )}
                      {s.specialNote && (
                        <p className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-sm mt-2 w-fit">Ghi chú: {s.specialNote}</p>
                      )}
                    </div>
                    <StatusBadge status={s.status} map={SPA_STATUS_MAP} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-sage-500 mt-3 pt-3 border-t border-primary-50">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {s.type === "food" ? fmtDate(s.startDatetime) : `${fmtDateTime(s.startDatetime)} — ${fmtDateTime(s.endDatetime)}`}
                    </span>
                    <span className="font-bold text-sage-900">{fmtCurrency(s.priceAtBooking)}</span>
                  </div>
                  {s.isPackageIncluded && (
                    <p className="mt-2 text-[11px] text-emerald-600 flex items-center gap-1">
                      <BadgeCheck className="h-3.5 w-3.5" /> Thuộc gói nghỉ dưỡng
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 – Health Profile (inline from HealthProfile.jsx logic)
// ═══════════════════════════════════════════════════════════════════════════════
function HealthTab() {
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [otherAllergy, setOtherAllergy]           = useState("");
  const [dietaryPreference, setDietaryPreference] = useState("omnivore");
  const [physicalCondition, setPhysicalCondition] = useState("");
  const [consentProcessing, setConsentProcessing] = useState(false);
  const [consentSharing, setConsentSharing]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [existing, setExisting]   = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // CONNECTION POINT: Fetch medical profile from GET /api/medical-profiles/me
  // DATABASE RELATION: Maps to table [medical_profile]
  const loadProfile = useCallback(async () => {
    try {
      const p = await medicalApi.getMyProfile();
      if (p && p.explicitConsentSigned) {
        setExisting(p);
        setConsentProcessing(true);
        setConsentSharing(true);
        if (p.foodAllergies) {
          try {
            const parsed = JSON.parse(p.foodAllergies);
            setSelectedAllergies(parsed.selected || []);
            setOtherAllergy(parsed.other || "");
            setDietaryPreference(parsed.diet || "omnivore");
          } catch { setOtherAllergy(p.foodAllergies); }
        }
        if (p.physicalCondition) setPhysicalCondition(p.physicalCondition);
      }
    } catch { /* no profile yet */ } finally { setLoadingInit(false); }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const toggleAllergy = (key) =>
    setSelectedAllergies((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!consentProcessing || !consentSharing) {
      setError("Bạn phải đồng ý với cả hai điều khoản để tiếp tục (theo Nghị định 356/2025/NĐ-CP).");
      return;
    }
    const foodAllergiesJson = JSON.stringify({ selected: selectedAllergies, other: otherAllergy, diet: dietaryPreference });
    setLoading(true);
    try {
      await medicalApi.saveMyProfile(physicalCondition, foodAllergiesJson, true);
      setSuccess("Hồ sơ sức khỏe đã được lưu thành công! Dữ liệu được mã hóa AES-256.");
      await loadProfile();
    } catch (err) {
      setError(err.message || "Không thể lưu hồ sơ sức khỏe.");
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setLoading(true); setError("");
    try {
      await medicalApi.deleteMyProfile();
      setExisting(null);
      setSelectedAllergies([]); setOtherAllergy(""); setPhysicalCondition("");
      setConsentProcessing(false); setConsentSharing(false);
      setShowDeleteConfirm(false);
      setSuccess("Hồ sơ sức khỏe đã được xóa vĩnh viễn.");
    } catch (err) {
      setError(err.message || "Không thể xóa hồ sơ sức khỏe.");
    } finally { setLoading(false); }
  };

  if (loadingInit) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-3 border-primary-800 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {existing && (
        <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Hồ sơ đã được lưu</p>
            <p className="text-xs text-emerald-700">Cập nhật lần cuối: {existing.updatedAt ? new Date(existing.updatedAt).toLocaleString("vi-VN") : "—"}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-md bg-red-50 text-red-700 text-sm border border-red-200 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3.5 rounded-md bg-emerald-50 text-emerald-700 text-sm border border-emerald-200 flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" /><span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Dietary preference */}
        <div className="bg-white rounded-md p-2 pb-6 border-b border-primary-100">
          <h4 className="text-xs font-bold text-sage-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Leaf className="h-4 w-4 text-primary-700" /> Chế Độ Ăn Uống
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DIET_OPTIONS.map((opt) => (
              <label key={opt.key} className={`flex items-center justify-center p-2.5 rounded-md border cursor-pointer text-xs font-semibold transition-all ${dietaryPreference === opt.key ? "border-primary-800 bg-primary-50 text-primary-900" : "border-primary-100 bg-white text-sage-600 hover:border-primary-300"}`}>
                <input type="radio" name="diet" value={opt.key} checked={dietaryPreference === opt.key} onChange={() => setDietaryPreference(opt.key)} className="sr-only" />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Food allergies */}
        <div className="bg-white rounded-md p-2 pb-6 border-b border-primary-100">
          <h4 className="text-xs font-bold text-sage-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" /> Dị Ứng Thực Phẩm
          </h4>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {ALLERGY_OPTIONS.map((opt) => (
              <label key={opt.key} className={`flex items-center gap-2 p-2.5 rounded-md border cursor-pointer text-xs font-medium transition-all ${selectedAllergies.includes(opt.key) ? "border-amber-400 bg-amber-50 text-amber-800" : "border-primary-100 bg-white text-sage-600 hover:border-primary-300"}`}>
                <input type="checkbox" checked={selectedAllergies.includes(opt.key)} onChange={() => toggleAllergy(opt.key)} className="w-4 h-4 accent-amber-500" />
                {opt.label}
              </label>
            ))}
          </div>
          <input type="text" value={otherAllergy} onChange={(e) => setOtherAllergy(e.target.value)} placeholder="Dị ứng khác (nếu có)..."
            className="w-full px-2 py-2.5 border-b border-primary-200 bg-transparent text-sm text-sage-800 focus:outline-none focus:border-primary-800 rounded-none transition-all duration-200" />
        </div>

        {/* Physical condition */}
        <div className="bg-white rounded-md p-2 pb-6 border-b border-primary-100">
          <h4 className="text-xs font-bold text-sage-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500" /> Tình Trạng Thể Chất
          </h4>
          <p className="text-xs text-sage-500 mb-3">Ví dụ: Đau lưng, thoát vị đĩa đệm, huyết áp cao, tiểu diabetes, đang mang thai... Thông tin này được mã hóa và chỉ Kỹ thuật viên Spa/Vật lý trị liệu mới được xem.</p>
          <textarea value={physicalCondition} onChange={(e) => setPhysicalCondition(e.target.value)} rows={4}
            placeholder="Mô tả tình trạng sức khỏe thể chất của bạn..."
            className="w-full px-2 py-3 border-b border-primary-200 bg-transparent text-sm text-sage-800 focus:outline-none focus:border-primary-800 rounded-none resize-none transition-all duration-200" />
        </div>

        {/* Consent */}
        <div className="bg-amber-50/70 border-l-4 border-amber-500 rounded-md p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-600" />
            <h4 className="text-sm font-bold text-amber-800">Đồng Ý Thu Thập Dữ Liệu Nhạy Cảm (Nghị định 356/2025/NĐ-CP)</h4>
          </div>
          <p className="text-xs text-amber-700">Theo Nghị định về Bảo vệ Dữ liệu Cá nhân, việc thu thập thông tin sức khỏe yêu cầu sự đồng ý rõ ràng và riêng biệt của bạn.</p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" id="consent-processing" checked={consentProcessing} onChange={(e) => setConsentProcessing(e.target.checked)} className="w-5 h-5 mt-0.5 accent-amber-600 flex-shrink-0" />
            <span className="text-xs text-amber-900 leading-relaxed"><strong>Đồng ý Xử lý Dữ liệu Sức khỏe:</strong> Tôi đồng ý cho Ngũ Sơn Resort lưu trữ và xử lý thông tin dị ứng thực phẩm và tình trạng thể chất của tôi, được mã hóa AES-256, nhằm mục đích cung cấp dịch vụ nghỉ dưỡng phù hợp.</span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" id="consent-sharing" checked={consentSharing} onChange={(e) => setConsentSharing(e.target.checked)} className="w-5 h-5 mt-0.5 accent-amber-600 flex-shrink-0" />
            <span className="text-xs text-amber-900 leading-relaxed"><strong>Đồng ý Chia sẻ Có Giới hạn:</strong> Tôi đồng ý để thông tin dị ứng thực phẩm của tôi được chia sẻ với bộ phận bếp, và thông tin thể chất được chia sẻ với kỹ thuật viên Spa/trị liệu. Các nhân sự khác không được xem dữ liệu này.</span>
          </label>
          <div className="flex items-start gap-2 pt-1">
            <Info className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-600">Bạn có thể thu hồi sự đồng ý và xóa vĩnh viễn hồ sơ sức khỏe bất cứ lúc nào.</p>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3.5 rounded-md text-sm font-semibold bg-primary-900 hover:bg-primary-800 text-white shadow-md transition-all duration-300 hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="h-4 w-4" />{existing ? "Cập Nhật Hồ Sơ Sức Khỏe" : "Lưu Hồ Sơ Sức Khỏe"}</>}
        </button>
      </form>

      {/* Delete section */}
      {existing && (
        <div className="pt-4 border-t border-red-100">
          {!showDeleteConfirm ? (
            <button type="button" onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 rounded-md text-sm font-semibold border border-red-300 text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2">
              <Trash2 className="h-4 w-4" /> Xóa Vĩnh Viễn Hồ Sơ Sức Khỏe
            </button>
          ) : (
            <div className="bg-red-50/70 border-l-4 border-red-500 rounded-md p-5 space-y-4">
              <p className="text-sm font-semibold text-red-800 text-center">⚠️ Bạn có chắc chắn muốn xóa vĩnh viễn hồ sơ sức khỏe?</p>
              <p className="text-xs text-red-600 text-center">Hành động này không thể hoàn tác. Toàn bộ dữ liệu sức khỏe và dị ứng sẽ bị xóa hoàn toàn.</p>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setShowDeleteConfirm(false)}
                  className="py-2.5 rounded-md text-sm font-semibold border border-sage-300 text-sage-700 hover:bg-sage-50 transition cursor-pointer">
                  Hủy Bỏ
                </button>
                <button type="button" onClick={handleDelete} disabled={loading}
                  className="py-2.5 rounded-md text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Xác Nhận Xóa"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 – Payment History (VNPAY, Invoices)
// ═══════════════════════════════════════════════════════════════════════════════
function PaymentHistoryTab() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // CONNECTION POINT:
  // Fetch payment invoices from GET /api/users/me/invoices in the future.
  // DATABASE RELATION:
  // Reads fields from table [invoice] (invoice_id, room_booking_id, final_amount, status, payment_time, vnpay_tran_id).
  useEffect(() => {
    // Current backend doesn't have an invoices controller endpoint yet.
    // We mock the database seed invoices from resort_spa_db.sql so users can see how they look.
    const mockInvoices = [
      {
        invoiceId: 1,
        roomBookingId: 1,
        roomSubtotal: 12500000,
        spaSubtotal: 0,
        foodSubtotal: 320000,
        taxAndFees: 1282000,
        finalAmount: 14102000,
        depositAmount: 3750000,
        amountDue: 10352000,
        status: "UNPAID",
        vnpayTranId: null,
        paymentTime: null,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        invoiceId: 2,
        roomBookingId: 2,
        roomSubtotal: 9000000,
        spaSubtotal: 1500000,
        foodSubtotal: 415000,
        taxAndFees: 1091500,
        finalAmount: 12006500,
        depositAmount: 2700000,
        amountDue: 0,
        status: "PAID",
        vnpayTranId: "VNP14328905",
        paymentTime: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      }
    ];

    const timer = setTimeout(() => {
      setInvoices(mockInvoices);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="inline-flex p-4 rounded-md bg-primary-50 text-primary-300 mb-4">
        <CreditCard className="h-8 w-8" />
      </div>
      <p className="text-sage-500 text-sm">Bạn chưa có lịch sử thanh toán nào.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary-800 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <div key={inv.invoiceId} className="bg-white rounded-md border border-primary-100 p-5 shadow-sm">
              <div className="flex justify-between items-start border-b border-primary-50 pb-3 mb-3 flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-sage-900">Hóa đơn #{inv.invoiceId}</h4>
                  <p className="text-xs text-sage-400 mt-0.5">Ngày tạo: {fmtDateTime(inv.createdAt)}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-semibold ${
                  inv.status === "PAID"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}>
                  {inv.status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                </span>
              </div>

              <div className="space-y-2 text-xs text-sage-600">
                <div className="flex justify-between">
                  <span>Đặt phòng tham chiếu:</span>
                  <span className="font-semibold text-sage-800">Booking #{inv.roomBookingId}</span>
                </div>
                <div className="flex justify-between pl-3 border-l-2 border-primary-100">
                  <span>Tiền phòng:</span>
                  <span>{fmtCurrency(inv.roomSubtotal)}</span>
                </div>
                <div className="flex justify-between pl-3 border-l-2 border-primary-100">
                  <span>Tiền dịch vụ Spa:</span>
                  <span>{fmtCurrency(inv.spaSubtotal)}</span>
                </div>
                <div className="flex justify-between pl-3 border-l-2 border-primary-100">
                  <span>Tiền ẩm thực dưỡng sinh:</span>
                  <span>{fmtCurrency(inv.foodSubtotal)}</span>
                </div>
                <div className="flex justify-between pl-3 border-l-2 border-primary-100">
                  <span>Thuế & Phí phục vụ (10%):</span>
                  <span>{fmtCurrency(inv.taxAndFees)}</span>
                </div>
                <div className="border-t border-primary-50 my-2" />
                <div className="flex justify-between text-sm font-bold text-sage-900">
                  <span>Tổng tiền hóa đơn:</span>
                  <span>{fmtCurrency(inv.finalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-700">
                  <span>Đã thanh toán cọc (30%):</span>
                  <span>-{fmtCurrency(inv.depositAmount)}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-rose-700">
                  <span>Còn lại cần trả:</span>
                  <span>{fmtCurrency(inv.amountDue)}</span>
                </div>

                {inv.status === "PAID" && (
                  <div className="mt-4 pt-3 border-t border-primary-50 space-y-1 bg-emerald-50/40 p-2.5 rounded-sm">
                    <p className="font-semibold text-emerald-800 text-[11px] uppercase tracking-wider">Thông tin giao dịch VNPAY</p>
                    <div className="flex justify-between text-[11px] text-emerald-700 mt-1">
                      <span>Mã giao dịch:</span>
                      <span className="font-mono font-medium">{inv.vnpayTranId}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-emerald-700">
                      <span>Thời gian thanh toán:</span>
                      <span>{fmtDateTime(inv.paymentTime)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ProfilePage Dashboard Layout
// ═══════════════════════════════════════════════════════════════════════════════
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
    const token = localStorage.getItem("token");
    if (!token) { navigate("/dang-nhap"); return; }
    userApi.getProfile()
      .then(setProfile)
      .catch(() => {
        // Fallback: build from localStorage
        setProfile({
          fullName: localStorage.getItem("userFullName") || "Khách hàng",
          email: "",
          phone: "",
          idPassport: "",
          role: localStorage.getItem("userRole") || "GUEST",
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
              <Route index element={<PersonalInfoTab profile={profile} onProfileUpdate={setProfile} />} />
              <Route path="suc-khoe" element={<HealthTab />} />
              <Route path="lich-su-dat-hang" element={<HistoryTab />} />
              <Route path="lich-su-thanh-toan" element={<PaymentHistoryTab />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}
