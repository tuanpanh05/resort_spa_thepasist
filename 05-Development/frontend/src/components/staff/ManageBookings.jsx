import React, { useState, useEffect } from "react";
import { Search, Edit, X, UserCheck, Shield, AlertCircle, Loader2, Eye } from "lucide-react";
import { staffApi } from "../../api";

/**
 * UC08: ManageBookings — Arrivals Dashboard & Check-In Management.
 * Connects to real backend APIs for listing bookings and performing check-in.
 * Check-In modal collects CCCD/Passport per Vietnamese Residence Law 2020.
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
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check-In modal state
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInBooking, setCheckInBooking] = useState(null);
  const [identityDocument, setIdentityDocument] = useState("");
  const [nationality, setNationality] = useState("Vietnam");
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInError, setCheckInError] = useState(null);

  // Notes modal state
  const [selectedBookingForNotes, setSelectedBookingForNotes] = useState(null);
  const [notesFormValue, setNotesFormValue] = useState("");

  // Load arrivals from API
  useEffect(() => {
    loadArrivals();
  }, []);

  const loadArrivals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await staffApi.getArrivals();
      setArrivals(data);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách đặt phòng.");
      // Fallback to mock data if API fails
      setArrivals([]);
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
      // Reload arrivals to refresh statuses
      await loadArrivals();
      alert(`Check-in thành công cho khách ${checkInBooking.guestName}!`);
    } catch (err) {
      setCheckInError(err.message || "Không thể thực hiện check-in.");
    } finally {
      setCheckInLoading(false);
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
    return matchesSearch && matchesStatus;
  });

  // Status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";
      case "CHECKED_IN":
        return "bg-green-100 text-green-700";
      case "CHECKED_OUT":
        return "bg-gray-100 text-gray-600";
      case "PENDING_DEPOSIT":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-500";
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
      <div className="bg-white border border-primary-100 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-normal text-sage-950">
            Quản Lý Đơn Đặt Phòng & Check-In
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Danh sách đặt phòng từ hệ thống. Thực hiện check-in với xác minh CCCD/Hộ chiếu (Luật Cư trú 2020).
          </p>
        </div>
        <button
          onClick={loadArrivals}
          className="px-4 py-2 bg-primary-800 hover:bg-primary-900 text-white rounded-none text-xs font-semibold uppercase tracking-wider cursor-pointer"
        >
          Tải lại dữ liệu
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 flex items-center gap-2 text-red-700 text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter panel */}
      <div className="bg-white border border-primary-100 p-5 flex flex-col sm:flex-row gap-4 items-center">
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
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
          >
            <option value="All">Tất cả đơn</option>
            <option value="CONFIRMED">Chờ Check-in</option>
            <option value="CHECKED_IN">Đang lưu trú</option>
            <option value="PENDING_DEPOSIT">Chờ đặt cọc</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-sage-500">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm">Đang tải dữ liệu đặt phòng...</span>
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
                    <td colSpan="8" className="p-8 text-center text-sage-400 italic">
                      Không tìm thấy đơn đặt phòng nào.
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
                            <span className="px-2 py-0.5 bg-yellow-50 text-yellow-800 border border-yellow-200/50 text-[10px] font-bold uppercase rounded-md">
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
                      <td className="p-4 font-semibold text-primary-800 text-[11px]">
                        {formatCurrency(b.depositPaid)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(b.status)}`}>
                          {getStatusLabel(b.status)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {b.status === "CONFIRMED" && (
                            isCheckInAllowed(b.checkInDate) ? (
                              <button
                                onClick={() => openCheckInModal(b)}
                                className="px-2.5 py-1.5 bg-primary-800 hover:bg-primary-900 text-white rounded-none text-[10px] font-semibold uppercase tracking-wider cursor-pointer flex items-center gap-1"
                              >
                                <UserCheck className="h-3 w-3" />
                                Check-in
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-red-650 bg-red-50 border border-red-200 px-2 py-1.5 rounded-none uppercase select-none">
                                Chưa đến ngày check-in
                              </span>
                            )
                          )}
                          {onViewItinerary && (
                            <button
                              onClick={() => onViewItinerary(b.bookingId)}
                              className="p-1.5 bg-primary-50 hover:bg-primary-100 text-primary-950 rounded-none cursor-pointer"
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
