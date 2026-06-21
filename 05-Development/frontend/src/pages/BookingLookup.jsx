import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, ArrowLeft, User, CalendarDays, Heart, CreditCard, Clock,
  MapPin, Phone, Mail, Leaf, ChevronRight, Edit3, X, Check,
  AlertCircle, Package, UtensilsCrossed, Sparkles
} from "lucide-react";
import { bookingLookupApi } from "../api";
import { fmtDate, fmtDateTime, fmtCurrency } from "../utils/formatters";

// ─── Status Badge ──────────────────────────────────────────────
const STATUS_MAP = {
  CONFIRMED: { label: "Đã xác nhận", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CHECKED_IN: { label: "Đã nhận phòng", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  CHECKED_OUT: { label: "Đã trả phòng", cls: "bg-sage-100 text-sage-700 border-sage-200" },
  CANCELLED: { label: "Đã hủy", cls: "bg-red-50 text-red-600 border-red-200" },
  PENDING_DEPOSIT: { label: "Chờ đặt cọc", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  PENDING: { label: "Chờ xử lý", cls: "bg-amber-50 text-amber-700 border-amber-200" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || { label: status, cls: "bg-gray-100 text-gray-600 border-gray-200" };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border ${s.cls}`}>{s.label}</span>;
};

// ─── Timeline Event Types ──────────────────────────────────────
const EVENT_ICONS = {
  CHECKIN: { icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-100" },
  CHECKOUT: { icon: MapPin, color: "text-rose-600", bg: "bg-rose-100" },
  SPA: { icon: Sparkles, color: "text-purple-600", bg: "bg-purple-100" },
  FOOD: { icon: UtensilsCrossed, color: "text-amber-600", bg: "bg-amber-100" },
};

export default function BookingLookup() {
  // ── Search state ──
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState(null); // null = not searched, [] = no results
  const [searched, setSearched] = useState(false);

  // ── Selected booking state ──
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [itinerary, setItinerary] = useState(null);
  const [loadingItinerary, setLoadingItinerary] = useState(false);

  // ── Edit modal state ──
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // ─── Search handler ──────────────────────────────────────────
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim() || !phone.trim()) {
      setError("Vui lòng nhập đầy đủ Email và Số điện thoại.");
      return;
    }
    setLoading(true);
    setError("");
    setBookings(null);
    setSelected(null);
    setSearched(false);
    try {
      const result = await bookingLookupApi.lookup(email.trim(), phone.trim());
      setBookings(result);
      setSearched(true);
    } catch (err) {
      setError(err.message || "Không thể tra cứu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Select a booking ────────────────────────────────────────
  const handleSelectBooking = async (booking) => {
    setSelected(booking);
    setActiveTab("info");
    setItinerary(null);
    // Also fetch itinerary
    setLoadingItinerary(true);
    try {
      const data = await bookingLookupApi.getItinerary(booking.bookingId);
      setItinerary(data);
    } catch {
      setItinerary(null);
    } finally {
      setLoadingItinerary(false);
    }
  };

  // ─── Open edit modal ─────────────────────────────────────────
  const openEdit = () => {
    setEditData({
      fullName: selected?.user?.fullName || "",
      phone: selected?.user?.phone || phone,
      checkInDate: selected?.checkInDate ? selected.checkInDate.substring(0, 10) : "",
      checkOutDate: selected?.checkOutDate ? selected.checkOutDate.substring(0, 10) : "",
    });
    setEditError("");
    setEditSuccess("");
    setEditOpen(true);
  };

  // ─── Submit edit ─────────────────────────────────────────────
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");
    try {
      await bookingLookupApi.update(selected.bookingId, {
        email: email.trim(),
        phone: phone.trim(),
        fullName: editData.fullName,
        phone: editData.phone,
        checkInDate: editData.checkInDate ? editData.checkInDate + "T14:00:00" : null,
        checkOutDate: editData.checkOutDate ? editData.checkOutDate + "T12:00:00" : null,
      });
      setEditSuccess("Cập nhật thành công! Thông tin đã được thay đổi.");
      // Re-fetch bookings to get updated data
      setTimeout(async () => {
        try {
          const result = await bookingLookupApi.lookup(email.trim(), phone.trim());
          setBookings(result);
          const updatedBooking = result.find((b) => b.bookingId === selected.bookingId);
          if (updatedBooking) {
            setSelected(updatedBooking);
            // Re-fetch itinerary too
            const data = await bookingLookupApi.getItinerary(updatedBooking.bookingId);
            setItinerary(data);
          }
        } catch { /* ignore */ }
        setEditOpen(false);
      }, 1500);
    } catch (err) {
      setEditError(err.message || "Lỗi khi cập nhật thông tin.");
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Helper: get room info from booking ──────────────────────
  const getRoomInfo = (booking) => {
    if (!booking?.details || booking.details.length === 0) return null;
    const d = booking.details[0];
    return {
      roomNumber: d.room?.roomNumber || "—",
      typeName: d.room?.roomType?.typeName || "—",
      pricePerNight: d.priceAtBooking || d.room?.roomType?.basePricePerNight || 0,
    };
  };

  // ─── Calculate nights ────────────────────────────────────────
  const calcNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    return Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
  };

  // ─── TABS ────────────────────────────────────────────────────
  const TABS = [
    { key: "info", label: "Thông tin", icon: User },
    { key: "orders", label: "Lịch sử đặt", icon: CalendarDays },
    { key: "health", label: "Sức khỏe", icon: Heart },
    { key: "payment", label: "Thanh toán", icon: CreditCard },
    { key: "timeline", label: "Lịch trình", icon: Clock },
  ];

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sage-50 pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* ── Back ── */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-sage-600 hover:text-primary-900 transition mb-6 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại trang chủ
        </Link>

        {/* ── Hero Search Card ── */}
        <div className="bg-white rounded-md shadow-lg overflow-hidden mb-8">
          {/* Banner */}
          <div className="h-20 bg-gradient-to-r from-primary-900 via-primary-700 to-sage-700 relative flex items-center justify-center">
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,...')]" />
            <div className="relative z-10 text-center">
              <h1 className="font-serif text-xl text-white font-bold tracking-wide">Tra cứu lịch trình</h1>
              <p className="text-primary-100 text-[11px] mt-1 tracking-wider">Nhập Email và Số điện thoại đã đặt phòng để xem thông tin</p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="px-6 py-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sage-400" />
                <input
                  id="lookup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email đã đặt phòng"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-primary-200 rounded-md focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none transition bg-primary-50/30"
                  required
                />
              </div>
              <div className="flex-1 relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sage-400" />
                <input
                  id="lookup-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Số điện thoại"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-primary-200 rounded-md focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none transition bg-primary-50/30"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-primary-800 hover:bg-primary-900 text-white text-sm font-semibold rounded-md transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 justify-center cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Tra cứu
              </button>
            </div>
            {error && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </form>
        </div>

        {/* ── No Results ── */}
        {searched && bookings && bookings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-md shadow-sm border border-primary-100">
            <Search className="h-12 w-12 text-sage-300 mx-auto mb-4" />
            <p className="text-sage-600 font-semibold">Không tìm thấy đơn đặt phòng nào</p>
            <p className="text-sage-400 text-sm mt-1">Vui lòng kiểm tra lại Email và Số điện thoại</p>
          </div>
        )}

        {/* ── Booking List (when no booking selected) ── */}
        {bookings && bookings.length > 0 && !selected && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-sage-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary-600" />
              Danh sách đặt phòng ({bookings.length})
            </h2>
            {bookings.map((b) => {
              const room = getRoomInfo(b);
              const pkgs = b.retreatPackages || (b.retreatPackage ? [b.retreatPackage] : []);
              return (
                <button
                  key={b.bookingId}
                  onClick={() => handleSelectBooking(b)}
                  className="w-full text-left bg-white rounded-md shadow-sm border border-primary-100 p-4 hover:shadow-md hover:border-primary-300 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-primary-800 bg-primary-50 px-2 py-1 rounded">
                          #{b.bookingId}
                        </span>
                        <StatusBadge status={b.status} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-sage-600">
                        <div>
                          <span className="font-semibold text-sage-800">Phòng:</span>{" "}
                          {room ? `${room.roomNumber} — ${room.typeName}` : "—"}
                        </div>
                        <div>
                          <span className="font-semibold text-sage-800">Nhận phòng:</span>{" "}
                          {fmtDate(b.checkInDate)}
                        </div>
                        <div>
                          <span className="font-semibold text-sage-800">Trả phòng:</span>{" "}
                          {fmtDate(b.checkOutDate)}
                        </div>
                      </div>
                      {pkgs.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {pkgs.map((p) => (
                            <span key={p.packageId} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-[10px] font-semibold rounded border border-primary-200">
                              <Package className="h-3 w-3" />
                              {p.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-sage-400 group-hover:text-primary-600 transition flex-shrink-0 ml-3" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Selected Booking Detail ── */}
        {selected && (
          <div>
            {/* Back to list */}
            <button
              onClick={() => { setSelected(null); setActiveTab("info"); }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sage-600 hover:text-primary-900 transition mb-4 group cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Quay lại danh sách
            </button>

            {/* Header card */}
            <div className="bg-white rounded-md shadow-lg overflow-hidden mb-4">
              <div className="h-16 bg-gradient-to-r from-primary-900 via-primary-700 to-sage-700 relative" />
              <div className="px-6 pb-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-4">
                  <div className="w-16 h-16 rounded-md bg-primary-900 text-white flex items-center justify-center text-xl font-bold font-serif shadow-lg border-4 border-white flex-shrink-0 relative -top-8 z-10">
                    {selected.user?.fullName?.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase() || "KH"}
                  </div>
                  <div className="sm:pb-1 flex-1 min-w-0">
                    <h2 className="font-serif text-lg font-bold text-sage-900 truncate">{selected.user?.fullName || "Khách hàng"}</h2>
                    <p className="text-xs text-sage-500">{selected.user?.email || "—"}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:pb-1">
                    <StatusBadge status={selected.status} />
                    <button
                      onClick={openEdit}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 hover:bg-primary-200 text-primary-800 text-xs font-semibold rounded-md transition cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Thay đổi
                    </button>
                  </div>
                </div>
                {/* Quick stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-primary-50 rounded-md p-3 text-center">
                    <p className="text-sm font-bold text-primary-900">#{selected.bookingId}</p>
                    <p className="text-[10px] text-sage-500 uppercase tracking-wider mt-0.5">Mã đặt phòng</p>
                  </div>
                  <div className="bg-primary-50 rounded-md p-3 text-center">
                    <p className="text-sm font-bold text-primary-900">{selected.user?.phone || "—"}</p>
                    <p className="text-[10px] text-sage-500 uppercase tracking-wider mt-0.5">Số điện thoại</p>
                  </div>
                  <div className="bg-primary-50 rounded-md p-3 text-center">
                    <p className="text-sm font-bold text-primary-900">{fmtDate(selected.checkInDate)}</p>
                    <p className="text-[10px] text-sage-500 uppercase tracking-wider mt-0.5">Nhận phòng</p>
                  </div>
                  <div className="bg-primary-50 rounded-md p-3 text-center">
                    <p className="text-sm font-bold text-primary-900">{fmtDate(selected.checkOutDate)}</p>
                    <p className="text-[10px] text-sage-500 uppercase tracking-wider mt-0.5">Trả phòng</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 bg-white rounded-md shadow-sm border border-primary-100 p-1 mb-4 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-sm transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab.key
                      ? "bg-primary-900 text-white shadow-sm"
                      : "text-sage-600 hover:bg-primary-50 hover:text-primary-900"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-md shadow-sm border border-primary-100 p-6">
              {/* ─ Info Tab ─ */}
              {activeTab === "info" && (() => {
                const room = getRoomInfo(selected);
                const pkgs = selected.retreatPackages || (selected.retreatPackage ? [selected.retreatPackage] : []);
                const nights = calcNights(selected.checkInDate, selected.checkOutDate);
                return (
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-sage-900 uppercase tracking-wider flex items-center gap-2">
                      <User className="h-4 w-4 text-primary-600" />
                      Thông tin cá nhân
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-primary-50/50 rounded-md p-3 border border-primary-100/50">
                        <p className="text-[10px] text-sage-500 uppercase tracking-wider">Họ tên</p>
                        <p className="text-sm font-semibold text-sage-900 mt-0.5">{selected.user?.fullName || "—"}</p>
                      </div>
                      <div className="bg-primary-50/50 rounded-md p-3 border border-primary-100/50">
                        <p className="text-[10px] text-sage-500 uppercase tracking-wider">Email</p>
                        <p className="text-sm font-semibold text-sage-900 mt-0.5">{selected.user?.email || "—"}</p>
                      </div>
                      <div className="bg-primary-50/50 rounded-md p-3 border border-primary-100/50">
                        <p className="text-[10px] text-sage-500 uppercase tracking-wider">Số điện thoại</p>
                        <p className="text-sm font-semibold text-sage-900 mt-0.5">{selected.user?.phone || "—"}</p>
                      </div>
                      <div className="bg-primary-50/50 rounded-md p-3 border border-primary-100/50">
                        <p className="text-[10px] text-sage-500 uppercase tracking-wider">Trạng thái tài khoản</p>
                        <p className="text-sm font-semibold text-sage-900 mt-0.5">{selected.user?.status || "—"}</p>
                      </div>
                    </div>

                    <hr className="border-primary-100" />

                    <h3 className="text-sm font-bold text-sage-900 uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary-600" />
                      Thông tin phòng
                    </h3>
                    {room && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-primary-50/50 rounded-md p-3 border border-primary-100/50">
                          <p className="text-[10px] text-sage-500 uppercase tracking-wider">Phòng</p>
                          <p className="text-sm font-semibold text-sage-900 mt-0.5">{room.roomNumber}</p>
                        </div>
                        <div className="bg-primary-50/50 rounded-md p-3 border border-primary-100/50">
                          <p className="text-[10px] text-sage-500 uppercase tracking-wider">Loại phòng</p>
                          <p className="text-sm font-semibold text-sage-900 mt-0.5">{room.typeName}</p>
                        </div>
                        <div className="bg-primary-50/50 rounded-md p-3 border border-primary-100/50">
                          <p className="text-[10px] text-sage-500 uppercase tracking-wider">Giá / đêm</p>
                          <p className="text-sm font-semibold text-primary-800 mt-0.5">{fmtCurrency(room.pricePerNight)}</p>
                        </div>
                      </div>
                    )}

                    {pkgs.length > 0 && (
                      <>
                        <hr className="border-primary-100" />
                        <h3 className="text-sm font-bold text-sage-900 uppercase tracking-wider flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary-600" />
                          Gói trị liệu ({pkgs.length})
                        </h3>
                        <div className="space-y-2">
                          {pkgs.map((p) => (
                            <div key={p.packageId} className="bg-primary-50/50 rounded-md p-3 border border-primary-100/50 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-sage-900">{p.name}</p>
                                <p className="text-xs text-sage-500 mt-0.5">{p.durationDays} ngày • {p.description?.substring(0, 60) || ""}</p>
                              </div>
                              <p className="text-sm font-bold text-primary-800">{fmtCurrency(p.price)}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <hr className="border-primary-100" />
                    <div className="bg-primary-900 rounded-md p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-primary-200 uppercase tracking-wider">Tổng thời gian lưu trú</p>
                          <p className="text-lg font-bold mt-0.5">{nights} đêm</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-primary-200 uppercase tracking-wider">Tiền phòng (ước tính)</p>
                          <p className="text-lg font-bold mt-0.5">{fmtCurrency((room?.pricePerNight || 0) * nights)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ─ Orders Tab ─ */}
              {activeTab === "orders" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-sage-900 uppercase tracking-wider flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary-600" />
                    Lịch sử đặt hàng
                  </h3>
                  {bookings && bookings.length > 0 ? bookings.map((b) => {
                    const room = getRoomInfo(b);
                    const pkgs = b.retreatPackages || (b.retreatPackage ? [b.retreatPackage] : []);
                    return (
                      <div key={b.bookingId} className={`p-4 rounded-md border ${b.bookingId === selected?.bookingId ? "border-primary-400 bg-primary-50/30" : "border-primary-100"}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold text-primary-800 bg-primary-100 px-2 py-0.5 rounded">#{b.bookingId}</span>
                          <StatusBadge status={b.status} />
                          <span className="text-[10px] text-sage-400 ml-auto">{fmtDate(b.createdAt)}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-sage-600">
                          <div><span className="font-semibold">Phòng:</span> {room?.roomNumber || "—"}</div>
                          <div><span className="font-semibold">Loại:</span> {room?.typeName || "—"}</div>
                          <div><span className="font-semibold">Nhận:</span> {fmtDate(b.checkInDate)}</div>
                          <div><span className="font-semibold">Trả:</span> {fmtDate(b.checkOutDate)}</div>
                        </div>
                        {pkgs.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {pkgs.map((p) => (
                              <span key={p.packageId} className="text-[10px] px-2 py-0.5 bg-primary-50 text-primary-700 rounded border border-primary-200 font-medium">
                                {p.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }) : (
                    <p className="text-sage-400 text-sm italic">Chưa có đơn đặt hàng nào.</p>
                  )}
                </div>
              )}

              {/* ─ Health Tab ─ */}
              {activeTab === "health" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-sage-900 uppercase tracking-wider flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-500" />
                    Hồ sơ sức khỏe
                  </h3>
                  <div className="bg-primary-50/30 rounded-md p-4 border border-primary-100/50">
                    <p className="text-xs text-sage-500 mb-3">Thông tin sức khỏe được mã hóa và bảo mật. Liên hệ lễ tân để cập nhật hồ sơ.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white rounded-md p-3 border border-primary-100">
                        <p className="text-[10px] text-sage-500 uppercase tracking-wider">Trạng thái đồng ý</p>
                        <p className="text-sm font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Đã ký đồng thuận
                        </p>
                      </div>
                      <div className="bg-white rounded-md p-3 border border-primary-100">
                        <p className="text-[10px] text-sage-500 uppercase tracking-wider">Dị ứng thực phẩm</p>
                        <p className="text-sm font-semibold text-sage-900 mt-0.5">Đã khai báo (mã hóa)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─ Payment Tab ─ */}
              {activeTab === "payment" && (() => {
                const room = getRoomInfo(selected);
                const pkgs = selected.retreatPackages || (selected.retreatPackage ? [selected.retreatPackage] : []);
                const nights = calcNights(selected.checkInDate, selected.checkOutDate);
                const roomTotal = (room?.pricePerNight || 0) * nights;
                const pkgTotal = pkgs.reduce((s, p) => s + (p.price || 0), 0);
                return (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-sage-900 uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary-600" />
                      Chi tiết thanh toán
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2 border-b border-primary-100">
                        <span className="text-xs text-sage-600">Tiền phòng ({room?.typeName} × {nights} đêm)</span>
                        <span className="text-sm font-semibold text-sage-900">{fmtCurrency(roomTotal)}</span>
                      </div>
                      {pkgs.map((p) => (
                        <div key={p.packageId} className="flex items-center justify-between py-2 border-b border-primary-100">
                          <span className="text-xs text-sage-600">Gói {p.name}</span>
                          <span className="text-sm font-semibold text-sage-900">{fmtCurrency(p.price)}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between py-2 border-b border-primary-100">
                        <span className="text-xs text-sage-600">Đặt cọc</span>
                        <span className="text-sm font-semibold text-sage-900">{fmtCurrency(selected.totalDeposit)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3">
                        <span className="text-sm font-bold text-sage-900 uppercase">Tổng (ước tính)</span>
                        <span className="text-lg font-bold text-primary-800">{fmtCurrency(roomTotal + pkgTotal)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ─ Timeline Tab ─ */}
              {activeTab === "timeline" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-sage-900 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary-600" />
                    Lịch trình hoạt động
                  </h3>
                  {loadingItinerary ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-3 border-primary-800 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : itinerary?.timeline && itinerary.timeline.length > 0 ? (
                    <div className="relative">
                      {/* Vertical line */}
                      <div className="absolute left-5 top-4 bottom-4 w-px bg-primary-200" />
                      <div className="space-y-4">
                        {itinerary.timeline.map((event, idx) => {
                          const evtConfig = EVENT_ICONS[event.type] || EVENT_ICONS.CHECKIN;
                          const Icon = evtConfig.icon;
                          return (
                            <div key={idx} className="relative flex gap-4 items-start">
                              <div className={`w-10 h-10 rounded-full ${evtConfig.bg} flex items-center justify-center flex-shrink-0 z-10 border-2 border-white shadow-sm`}>
                                <Icon className={`h-4 w-4 ${evtConfig.color}`} />
                              </div>
                              <div className="flex-1 bg-primary-50/30 rounded-md p-3 border border-primary-100/50">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-xs font-bold text-sage-900">{event.title}</p>
                                  <StatusBadge status={event.status} />
                                </div>
                                <p className="text-[11px] text-sage-500">{fmtDateTime(event.startTime)}{event.endTime ? ` → ${fmtDateTime(event.endTime)}` : ""}</p>
                                {event.description && (
                                  <p className="text-[11px] text-sage-400 mt-1">{event.description}</p>
                                )}
                                {event.price != null && event.price > 0 && (
                                  <p className="text-xs font-semibold text-primary-800 mt-1">{fmtCurrency(event.price)}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sage-400 text-sm italic py-6 text-center">Chưa có hoạt động nào trong lịch trình.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ Edit Modal ═══ */}
        {editOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditOpen(false)}>
            <div
              className="bg-white rounded-md shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-primary-900 to-primary-700 px-5 py-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Thay đổi thông tin lưu trú
                </h3>
                <button onClick={() => setEditOpen(false)} className="text-white/70 hover:text-white transition cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-sage-700 mb-1">Họ tên</label>
                  <input
                    type="text"
                    value={editData.fullName || ""}
                    onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-primary-200 rounded-md focus:ring-2 focus:ring-primary-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-sage-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={editData.phone || ""}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-primary-200 rounded-md focus:ring-2 focus:ring-primary-300 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-sage-700 mb-1">Ngày nhận phòng</label>
                    <input
                      type="date"
                      value={editData.checkInDate || ""}
                      onChange={(e) => setEditData({ ...editData, checkInDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-primary-200 rounded-md focus:ring-2 focus:ring-primary-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-sage-700 mb-1">Ngày trả phòng</label>
                    <input
                      type="date"
                      value={editData.checkOutDate || ""}
                      onChange={(e) => setEditData({ ...editData, checkOutDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-primary-200 rounded-md focus:ring-2 focus:ring-primary-300 outline-none"
                    />
                  </div>
                </div>

                {editError && (
                  <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-200">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{editError}</span>
                  </div>
                )}
                {editSuccess && (
                  <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-md border border-emerald-200">
                    <Check className="h-4 w-4" />
                    {editSuccess}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditOpen(false)}
                    className="flex-1 px-4 py-2.5 text-xs font-semibold text-sage-700 bg-sage-100 hover:bg-sage-200 rounded-md transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-primary-800 hover:bg-primary-900 rounded-md transition disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {editLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
