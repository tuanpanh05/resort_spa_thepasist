import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Home,
  LogOut,
  Search,
} from "lucide-react";
import { staffApi } from "../../api";

/**
 * UC10: BookingItinerary — Booking Details & Itinerary Timeline.
 * Displays detailed booking information and a visual timeline of events
 * including check-in, spa appointments, food orders, and check-out.
 * Uses ADR-004 Aggregator Pattern data from ItineraryController.
 */
export default function BookingItinerary({ bookingId, onClose }) {
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchBookingId, setSearchBookingId] = useState(bookingId || "");

  useEffect(() => {
    if (bookingId) {
      loadItinerary(bookingId);
    }
  }, [bookingId]);

  const loadItinerary = async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await staffApi.getItinerary(id);
      setItinerary(data);
    } catch (err) {
      setError(err.message || "Không thể tải lịch trình.");
      setItinerary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchBookingId) {
      loadItinerary(parseInt(searchBookingId));
    }
  };

  // Format currency
  const formatCurrency = (val) => {
    if (!val) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  // Format datetime
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  // Timeline event icon and color
  const getEventStyle = (type) => {
    switch (type) {
      case "CHECKIN":
        return { icon: <Home className="h-4 w-4" />, color: "bg-green-500", borderColor: "border-green-200", bgColor: "bg-green-50" };
      case "CHECKOUT":
        return { icon: <LogOut className="h-4 w-4" />, color: "bg-red-500", borderColor: "border-red-200", bgColor: "bg-red-50" };
      case "SPA":
        return { icon: <Sparkles className="h-4 w-4" />, color: "bg-purple-500", borderColor: "border-purple-200", bgColor: "bg-purple-50" };
      case "FOOD":
        return { icon: <MapPin className="h-4 w-4" />, color: "bg-orange-500", borderColor: "border-orange-200", bgColor: "bg-orange-50" };
      default:
        return { icon: <Calendar className="h-4 w-4" />, color: "bg-gray-500", borderColor: "border-gray-200", bgColor: "bg-gray-50" };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "CANCELLED":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "COMPLETED": return "Hoàn thành";
      case "CONFIRMED": return "Đã xác nhận";
      case "PENDING": return "Đang chờ";
      case "CANCELLED": return "Đã hủy";
      case "CHECKED_IN": return "Đang lưu trú";
      case "CHECKED_OUT": return "Đã trả phòng";
      default: return status;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header */}
      <div className="bg-white border border-primary-100 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-normal text-sage-950">
            Chi Tiết Đặt Phòng & Lịch Trình
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Xem thông tin chi tiết đặt phòng và lịch trình hoạt động trong thời gian lưu trú.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 border border-primary-100 text-xs font-semibold uppercase tracking-wider hover:bg-primary-50 cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            Quay lại
          </button>
        )}
      </div>

      {/* Search by Booking ID */}
      <form onSubmit={handleSearch} className="bg-white border border-primary-100 p-5 flex gap-4 items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-sage-400" />
          <input
            type="number"
            placeholder="Nhập mã đặt phòng (Booking ID)..."
            value={searchBookingId}
            onChange={(e) => setSearchBookingId(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-primary-100 text-xs focus:outline-primary-200"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-primary-800 hover:bg-primary-900 text-white rounded-none text-xs font-semibold uppercase tracking-wider cursor-pointer"
        >
          Tra cứu
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 flex items-center gap-2 text-red-700 text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-sage-500">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm">Đang tải lịch trình...</span>
        </div>
      )}

      {/* Itinerary Content */}
      {!loading && itinerary && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column — Booking Details */}
          <div className="lg:col-span-5 space-y-5">
            {/* Guest Card */}
            <div className="bg-white border border-primary-100 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sage-400 mb-4 flex items-center gap-2">
                <User className="h-4 w-4" />
                Thông Tin Khách Hàng
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-sage-500">Họ và tên:</span>
                  <span className="font-bold text-sage-950">{itinerary.guestName || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sage-500 flex items-center gap-1"><Mail className="h-3 w-3" /> Email:</span>
                  <span className="font-semibold">{itinerary.guestEmail || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sage-500 flex items-center gap-1"><Phone className="h-3 w-3" /> Điện thoại:</span>
                  <span className="font-semibold">{itinerary.guestPhone || "—"}</span>
                </div>
              </div>
            </div>

            {/* Booking Summary Card */}
            <div className="bg-white border border-primary-100 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sage-400 mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Chi Tiết Đặt Phòng
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-sage-500">Mã đơn:</span>
                  <span className="font-bold text-primary-800">#{itinerary.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sage-500">Nhận phòng:</span>
                  <span className="font-semibold">{formatDate(itinerary.checkInDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sage-500">Trả phòng:</span>
                  <span className="font-semibold">{formatDate(itinerary.checkOutDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sage-500">Villa / Phòng:</span>
                  <span className="font-bold">{itinerary.roomNumber || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sage-500">Hạng phòng:</span>
                  <span className="font-semibold">{itinerary.roomTypeName || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sage-500">Trạng thái:</span>
                  <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(itinerary.bookingStatus)}`}>
                    {getStatusLabel(itinerary.bookingStatus)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-primary-50 pt-3 mt-2">
                  <span className="text-sage-500">Tiền cọc đã thanh toán:</span>
                  <span className="font-bold text-green-700">{formatCurrency(itinerary.totalDeposit)}</span>
                </div>
              </div>
            </div>

            {/* Package Card */}
            {itinerary.packageName && (
              <div className="bg-white border border-primary-100 p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sage-400 mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Gói Trị Liệu
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="font-bold text-sage-950">{itinerary.packageName}</div>
                  {itinerary.packageDescription && (
                    <p className="text-sage-600 leading-relaxed">{itinerary.packageDescription}</p>
                  )}
                  {itinerary.packageDurationDays && (
                    <div className="text-sage-500">
                      Thời lượng: <span className="font-semibold">{itinerary.packageDurationDays} ngày</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column — Timeline */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-primary-100 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sage-400 mb-6 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Lịch Trình Hoạt Động (Itinerary Timeline)
              </h4>

              {itinerary.timeline && itinerary.timeline.length > 0 ? (
                <div className="relative">
                  {/* Timeline vertical line */}
                  <div className="absolute left-[17px] top-6 bottom-6 w-0.5 bg-primary-100" />

                  <div className="space-y-6">
                    {itinerary.timeline.map((event, idx) => {
                      const style = getEventStyle(event.type);
                      return (
                        <div key={idx} className="relative flex gap-4">
                          {/* Timeline dot */}
                          <div className={`relative z-10 flex-shrink-0 h-9 w-9 rounded-full ${style.color} text-white flex items-center justify-center shadow-md`}>
                            {style.icon}
                          </div>

                          {/* Event card */}
                          <div className={`flex-1 border ${style.borderColor} ${style.bgColor} p-4 rounded-lg`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="text-sm font-bold text-sage-950">{event.title}</h5>
                                {event.description && (
                                  <p className="text-xs text-sage-600 mt-1 leading-relaxed">{event.description}</p>
                                )}
                              </div>
                              {event.status && (
                                <span className={`px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider flex-shrink-0 ml-2 ${getStatusBadge(event.status)}`}>
                                  {getStatusLabel(event.status)}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4 mt-3 text-[11px] text-sage-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDateTime(event.startTime)}
                              </span>
                              {event.endTime && (
                                <span>→ {formatDateTime(event.endTime)}</span>
                              )}
                              {event.price && event.price > 0 && (
                                <span className="ml-auto font-bold text-primary-800">
                                  {formatCurrency(event.price)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-sage-400 italic text-sm">
                  <Calendar className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  Chưa có hoạt động nào trong lịch trình.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !itinerary && !error && (
        <div className="bg-white border border-primary-100 p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-sage-300" />
          <p className="text-sage-500 text-sm">
            Nhập mã đặt phòng ở trên để xem chi tiết lịch trình.
          </p>
        </div>
      )}
    </div>
  );
}
