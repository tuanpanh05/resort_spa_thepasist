import React, { useState, useEffect } from "react";
import { Search, Edit, X, UserCheck, Shield, AlertCircle, Loader2, Eye, Users, Bed, CreditCard, Calendar, Plus } from "lucide-react";
import { staffApi, bookingApi, masterDataApi } from "../../api";

/**
 * UC08: ManageBookings — Arrivals Dashboard & Check-In Management.
 * Connects to real backend APIs for listing bookings and performing check-in.
 * Check-In modal collects CCCD/Passport per Vietnamese Residence Law 2020.
 * Enhanced with Overview Stat Cards, Date Filter, and Walk-in Guest Form.
 */
export default function ManageBookings({
  bookings: mockBookings,
  rooms,
  payments,
  setBookings,
  setRooms,
  setPayments,
  onViewItinerary,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [arrivals, setArrivals] = useState([]);
  const [villas, setVillas] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check-In modal state
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInBooking, setCheckInBooking] = useState(null);
  const [identityDocument, setIdentityDocument] = useState("");
  const [nationality, setNationality] = useState("Vietnam");
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInError, setCheckInError] = useState(null);

  // Walk-in guest modal state
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInLoading, setWalkInLoading] = useState(false);
  const [walkInError, setWalkInError] = useState(null);
  const [walkInForm, setWalkInForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    roomId: "",
    packageId: "",
    checkInDate: new Date().toISOString().split("T")[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    guestsCount: 1
  });

  // Load all operational data from API
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [arrivalsData, villasData, packagesData] = await Promise.all([
        staffApi.getArrivals(),
        staffApi.getVillas(),
        masterDataApi.getRetreatPackages()
      ]);
      setArrivals(arrivalsData || []);
      setVillas(villasData || []);
      setPackages(packagesData || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách dữ liệu vận hành.");
      setArrivals([]);
      setVillas([]);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  // Open Check-In modal
  const openCheckInModal = (booking) => {
    setCheckInBooking(booking);
    setIdentityDocument("");
    setNationality("Vietnam");
    setCheckInError(null);
    setShowCheckInModal(true);
  };

  // Perform Check-In via API
  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!identityDocument.trim()) {
      setCheckInError("Vui lòng nhập số CCCD / Hộ chiếu (bắt buộc theo Luật Cư trú 2020).");
      return;
    }
    setCheckInLoading(true);
    setCheckInError(null);
    try {
      await staffApi.performCheckIn({
        bookingId: checkInBooking.bookingId,
        identityDocument: identityDocument.trim(),
        nationality: nationality.trim(),
      });
      setShowCheckInModal(false);
      await loadAllData();
      alert(`Check-in thành công cho khách ${checkInBooking.guestName}!`);
    } catch (err) {
      setCheckInError(err.message || "Không thể thực hiện check-in.");
    } finally {
      setCheckInLoading(false);
    }
  };

  // Walk-in Booking Submission
  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    if (!walkInForm.fullName.trim() || !walkInForm.email.trim() || !walkInForm.phone.trim() || !walkInForm.roomId) {
      setWalkInError("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }
    setWalkInLoading(true);
    setWalkInError(null);
    try {
      const dto = {
        fullName: walkInForm.fullName.trim(),
        email: walkInForm.email.trim(),
        phone: walkInForm.phone.trim(),
        roomId: parseInt(walkInForm.roomId),
        checkInDate: walkInForm.checkInDate,
        checkOutDate: walkInForm.checkOutDate,
        guestsCount: parseInt(walkInForm.guestsCount || 1),
        packageIds: walkInForm.packageId ? [parseInt(walkInForm.packageId)] : [],
      };

      await bookingApi.createBooking(dto);
      setShowWalkInModal(false);
      // Reset form
      setWalkInForm({
        fullName: "",
        email: "",
        phone: "",
        roomId: "",
        packageId: "",
        checkInDate: new Date().toISOString().split("T")[0],
        checkOutDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        guestsCount: 1
      });
      await loadAllData();
      alert("Đặt phòng cho khách vãng lai (Walk-in Guest) thành công!");
    } catch (err) {
      setWalkInError(err.message || "Không thể đặt phòng cho khách vãng lai.");
    } finally {
      setWalkInLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (val) => {
    if (!val) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  // Check if check-in date is reached or passed
  const isCheckInAllowed = (checkInDateStr) => {
    if (!checkInDateStr) return false;
    const checkIn = new Date(checkInDateStr);
    checkIn.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today >= checkIn;
  };

  // Filter arrivals
  const filteredArrivals = arrivals.filter((b) => {
    const matchesSearch =
      (b.guestName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(b.bookingId).includes(searchTerm);
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "CONFIRMED" && b.status === "CONFIRMED") ||
      (statusFilter === "CHECKED_IN" && b.status === "CHECKED_IN") ||
      (statusFilter === "PENDING_DEPOSIT" && b.status === "PENDING_DEPOSIT");

    // Date filter logic
    const todayStr = new Date().toISOString().split("T")[0];
    const checkInStr = b.checkInDate ? b.checkInDate.split("T")[0] : "";
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    let matchesDate = true;
    if (dateFilter === "Today") {
      matchesDate = checkInStr === todayStr;
    } else if (dateFilter === "Tomorrow") {
      matchesDate = checkInStr === tomorrowStr;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate stats
  const expectedArrivals = arrivals.filter(b => b.status === "CONFIRMED").length;
  const inHouse = arrivals.filter(b => b.status === "CHECKED_IN").length;
  const pendingDeposit = arrivals.filter(b => b.status === "PENDING_DEPOSIT").length;
  const availableVillasCount = villas.filter(v => v.status === "AVAILABLE" || v.status === "available").length;

  // Status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-blue-50 text-blue-700 border border-blue-200/50";
      case "CHECKED_IN":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
      case "CHECKED_OUT":
        return "bg-gray-50 text-gray-600 border border-gray-250/50";
      case "PENDING_DEPOSIT":
        return "bg-amber-50 text-amber-700 border border-amber-200/50";
      default:
        return "bg-gray-50 text-gray-500 border border-gray-200/50";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "CONFIRMED": return "Chờ Check-in";
      case "CHECKED_IN": return "Đang lưu trú";
      case "CHECKED_OUT": return "Đã trả phòng";
      case "PENDING_DEPOSIT": return "Chờ đặt cọc";
      default: return status;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header */}
      <div className="bg-white border border-primary-100 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-[0_2px_10px_rgba(26,44,34,0.02)]">
        <div>
          <h3 className="font-serif text-lg font-normal text-sage-950">
            Quản Lý Đơn Đặt Phòng & Check-In
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Danh sách đặt phòng từ hệ thống. Thực hiện check-in với xác minh CCCD/Hộ chiếu (Luật Cư trú 2020).
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowWalkInModal(true)}
            className="flex-1 sm:flex-none px-4 py-2 bg-[#cda250] hover:bg-[#b0873a] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 transition-all duration-300"
          >
            <Plus className="h-3.5 w-3.5" />
            Khách vãng lai (Walk-in)
          </button>
          <button
            onClick={loadAllData}
            className="px-3 py-2 border border-primary-100 hover:bg-primary-50 text-sage-600 hover:text-sage-900 text-xs font-semibold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 transition-all"
            title="Tải lại dữ liệu"
          >
            <Loader2 className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Expected Arrivals Card */}
        <div className="bg-white border border-[#cda250]/20 p-5 shadow-[0_4px_20px_rgba(26,44,34,0.03)] flex items-center justify-between transition-all duration-300 hover:shadow-[0_10px_30px_rgba(26,44,34,0.08)] hover:-translate-y-0.5">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-sage-500">Chờ Check-in hôm nay</p>
            <p className="text-2xl font-serif font-semibold text-sage-950">{expectedArrivals}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        {/* In-House Guests Card */}
        <div className="bg-white border border-[#cda250]/20 p-5 shadow-[0_4px_20px_rgba(26,44,34,0.03)] flex items-center justify-between transition-all duration-300 hover:shadow-[0_10px_30px_rgba(26,44,34,0.08)] hover:-translate-y-0.5">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-sage-500">Khách đang lưu trú</p>
            <p className="text-2xl font-serif font-semibold text-sage-950">{inHouse}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Available Rooms Card */}
        <div className="bg-white border border-[#cda250]/20 p-5 shadow-[0_4px_20px_rgba(26,44,34,0.03)] flex items-center justify-between transition-all duration-300 hover:shadow-[0_10px_30px_rgba(26,44,34,0.08)] hover:-translate-y-0.5">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-sage-500">Villa trống sẵn sàng</p>
            <p className="text-2xl font-serif font-semibold text-sage-950">{availableVillasCount}</p>
          </div>
          <div className="p-3 bg-[#faf8f5] text-[#cda250] border border-[#cda250]/30 rounded-lg">
            <Bed className="h-5 w-5" />
          </div>
        </div>

        {/* Pending Deposit Card */}
        <div className="bg-white border border-[#cda250]/20 p-5 shadow-[0_4px_20px_rgba(26,44,34,0.03)] flex items-center justify-between transition-all duration-300 hover:shadow-[0_10px_30px_rgba(26,44,34,0.08)] hover:-translate-y-0.5">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-sage-500">Đơn chờ đặt cọc</p>
            <p className="text-2xl font-serif font-semibold text-sage-950">{pendingDeposit}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-lg">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 flex items-center gap-2 text-red-700 text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter panel */}
      <div className="bg-white border border-primary-100 p-5 flex flex-col sm:flex-row gap-4 items-center shadow-[0_2px_10px_rgba(26,44,34,0.01)]">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-sage-400" />
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng, mã đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-primary-100 text-xs focus:outline-primary-200"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="CONFIRMED">Chờ Check-in</option>
              <option value="CHECKED_IN">Đang lưu trú</option>
              <option value="PENDING_DEPOSIT">Chờ đặt cọc</option>
            </select>
          </div>
          <div className="flex-1 sm:w-40">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full p-2 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
            >
              <option value="All">Mọi ngày lưu trú</option>
              <option value="Today">Đến hôm nay</option>
              <option value="Tomorrow">Đến ngày mai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-sage-500">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm font-medium">Đang tải dữ liệu đặt phòng...</span>
        </div>
      )}

      {/* Bookings Table */}
      {!loading && (
        <div className="bg-white border border-primary-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-primary-50/50 text-sage-600 font-bold border-b border-primary-100">
                  <th className="p-4">Mã đơn</th>
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Ngày lưu trú</th>
                  <th className="p-4">Phòng / Villa</th>
                  <th className="p-4">Gói trị liệu</th>
                  <th className="p-4">Đã cọc</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-center">Tác vụ lễ tân</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50/50">
                {filteredArrivals.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-sage-400 italic bg-[#fafbf9]">
                      Không tìm thấy đơn đặt phòng nào phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredArrivals.map((b) => (
                    <tr key={b.bookingId} className="hover:bg-primary-50/10">
                      <td className="p-4 font-bold text-primary-950">
                        #{b.bookingId}
                      </td>
                      <td className="p-4 font-semibold text-sage-950">
                        <div>{b.guestName || "—"}</div>
                        <div className="text-[10px] text-sage-400 font-mono mt-0.5">
                          {b.guestPhone || b.guestEmail || ""}
                        </div>
                        {b.specialRequests && (
                          <div className="mt-1.5 text-[10px] text-amber-700 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded font-normal inline-block max-w-[200px] break-words" title={b.specialRequests}>
                            <strong>YC đặc biệt:</strong> {b.specialRequests}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sage-700">
                        <div>
                          {formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {b.roomNumber ? (
                            b.roomNumber.split(", ").map((num) => (
                              <span
                                key={num}
                                className="px-2 py-0.5 bg-primary-100 text-primary-900 border border-primary-200/50 text-[10px] font-bold uppercase rounded-md tracking-wider shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                              >
                                {num}
                              </span>
                            ))
                          ) : (
                            <span className="px-2 py-0.5 bg-yellow-50 text-yellow-800 border border-yellow-250/50 text-[10px] font-bold uppercase rounded-md">
                              Chưa gán phòng
                            </span>
                          )}
                        </div>
                        {b.roomTypeName && (
                          <div className="text-[10px] text-sage-500 mt-1.5 italic font-medium max-w-[220px] truncate" title={b.roomTypeName}>
                            {b.roomTypeName}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sage-600 text-[11px]">
                        {b.packageName || "Không có gói"}
                      </td>
                      <td className="p-4 font-semibold text-primary-850 text-[11px]">
                        {formatCurrency(b.depositPaid)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(b.status)}`}>
                          {getStatusLabel(b.status)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {b.status === "CONFIRMED" && (
                            isCheckInAllowed(b.checkInDate) ? (
                              <button
                                onClick={() => openCheckInModal(b)}
                                className="px-2.5 py-1.5 bg-primary-800 hover:bg-primary-900 text-white rounded-none text-[10px] font-semibold uppercase tracking-wider cursor-pointer flex items-center gap-1 transition-colors"
                              >
                                <UserCheck className="h-3 w-3" />
                                Check-in
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-red-650 bg-red-50 border border-red-200/50 px-2 py-1.5 rounded-none uppercase select-none">
                                Chưa đến ngày check-in
                              </span>
                            )
                          )}
                          {onViewItinerary && (
                            <button
                              onClick={() => onViewItinerary(b.bookingId)}
                              className="p-1.5 bg-primary-50 hover:bg-primary-100 text-primary-950 rounded-none cursor-pointer transition-colors"
                              title="Xem lịch trình"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Walk-in Booking Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-primary-50 pb-3">
              <h3 className="font-serif text-lg font-normal text-sage-950 flex items-center gap-2">
                <Bed className="h-5 w-5 text-[#cda250]" />
                Nhận Khách Vãng Lai (Walk-in Booking)
              </h3>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="text-sage-400 hover:text-sage-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {walkInError && (
              <div className="bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{walkInError}</span>
              </div>
            )}

            <form onSubmit={handleWalkInSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Tên khách hàng <span className="text-red-550">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={walkInForm.fullName}
                    onChange={(e) => setWalkInForm({ ...walkInForm, fullName: e.target.value })}
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full p-2.5 border border-primary-100 focus:outline-primary-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Số điện thoại <span className="text-red-550">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={walkInForm.phone}
                    onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                    placeholder="VD: 0987654321"
                    className="w-full p-2.5 border border-primary-100 focus:outline-primary-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Email khách hàng <span className="text-red-550">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={walkInForm.email}
                  onChange={(e) => setWalkInForm({ ...walkInForm, email: e.target.value })}
                  placeholder="VD: guest@gmail.com"
                  className="w-full p-2.5 border border-primary-100 focus:outline-primary-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Ngày nhận phòng <span className="text-red-550">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={walkInForm.checkInDate}
                    onChange={(e) => setWalkInForm({ ...walkInForm, checkInDate: e.target.value })}
                    className="w-full p-2.5 border border-primary-100 focus:outline-primary-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Ngày trả phòng <span className="text-red-550">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={walkInForm.checkOutDate}
                    onChange={(e) => setWalkInForm({ ...walkInForm, checkOutDate: e.target.value })}
                    className="w-full p-2.5 border border-primary-100 focus:outline-primary-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Chọn biệt thự/Phòng trống <span className="text-red-550">*</span>
                  </label>
                  <select
                    required
                    value={walkInForm.roomId}
                    onChange={(e) => setWalkInForm({ ...walkInForm, roomId: e.target.value })}
                    className="w-full p-2.5 border border-primary-100 focus:outline-primary-200 bg-white"
                  >
                    <option value="">-- Chọn phòng khả dụng --</option>
                    {villas
                      .filter((v) => v.status === "AVAILABLE" || v.status === "available")
                      .map((v) => (
                        <option key={v.roomId} value={v.roomId}>
                          Phòng {v.roomNumber} ({v.roomTypeName} - Tối đa {v.capacity || 2} khách)
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Chọn gói Retreat trị liệu
                  </label>
                  <select
                    value={walkInForm.packageId}
                    onChange={(e) => setWalkInForm({ ...walkInForm, packageId: e.target.value })}
                    className="w-full p-2.5 border border-primary-100 focus:outline-primary-200 bg-white"
                  >
                    <option value="">Không sử dụng gói</option>
                    {packages.map((pkg) => (
                      <option key={pkg.packageId} value={pkg.packageId}>
                        {pkg.name} ({pkg.durationDays} ngày - {formatCurrency(pkg.price)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Số lượng khách
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={walkInForm.guestsCount}
                  onChange={(e) => setWalkInForm({ ...walkInForm, guestsCount: e.target.value })}
                  className="w-full p-2.5 border border-primary-100 focus:outline-primary-200"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 border border-primary-100 text-xs font-semibold uppercase tracking-wider hover:bg-primary-50 cursor-pointer"
                  disabled={walkInLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={walkInLoading}
                  className="px-6 py-2 bg-primary-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-900 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {walkInLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Tạo đặt phòng
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check-In Modal — UC08 with CCCD/Passport collection (Residence Law 2020) */}
      {showCheckInModal && checkInBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-primary-50 pb-3">
              <h3 className="font-serif text-lg font-normal text-sage-950 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary-700" />
                Thủ Tục Check-In
              </h3>
              <button
                onClick={() => setShowCheckInModal(false)}
                className="text-sage-400 hover:text-sage-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Booking summary */}
            <div className="bg-primary-50/50 border border-primary-100 p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-sage-500">Mã đặt phòng:</span>
                <span className="font-bold text-primary-900">#{checkInBooking.bookingId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sage-500">Khách hàng:</span>
                <span className="font-semibold">{checkInBooking.guestName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sage-500">Số điện thoại:</span>
                <span className="font-semibold">{checkInBooking.guestPhone || "—"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sage-500">Email:</span>
                <span className="font-semibold font-mono">{checkInBooking.guestEmail || "—"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sage-500">Phòng / Villa:</span>
                <span className="font-semibold">{checkInBooking.roomNumber || "Chưa gán"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sage-500">Tiền cọc đã thanh toán:</span>
                <span className="font-bold text-green-700">{formatCurrency(checkInBooking.depositPaid)}</span>
              </div>
            </div>

            {/* Legal notice */}
            <div className="bg-yellow-50 border border-yellow-200 p-3 text-[11px] text-yellow-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Luật Cư trú Việt Nam 2020:</strong> Bắt buộc thu thập thông tin CCCD/Hộ chiếu
                để khai báo tạm trú cho cơ quan Công an địa phương. Dữ liệu được mã hóa AES-256 khi lưu trữ.
              </span>
            </div>

            {checkInError && (
              <div className="bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{checkInError}</span>
              </div>
            )}

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Số CCCD / Hộ chiếu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={identityDocument}
                  onChange={(e) => setIdentityDocument(e.target.value)}
                  placeholder="VD: 012345678901 hoặc B1234567"
                  className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Quốc tịch <span className="text-red-500">*</span>
                </label>
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
                  required
                >
                  <option value="Vietnam">Việt Nam</option>
                  <option value="China">Trung Quốc</option>
                  <option value="Japan">Nhật Bản</option>
                  <option value="South Korea">Hàn Quốc</option>
                  <option value="USA">Hoa Kỳ</option>
                  <option value="France">Pháp</option>
                  <option value="Australia">Úc</option>
                  <option value="UK">Anh</option>
                  <option value="Other">Khác</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="px-4 py-2 border border-primary-100 text-xs font-semibold uppercase tracking-wider hover:bg-primary-50 cursor-pointer"
                  disabled={checkInLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={checkInLoading}
                  className="px-6 py-2 bg-primary-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-900 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {checkInLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-3 w-3" />
                      Xác nhận Check-In
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
