import React, { useState, useEffect } from "react";
import { BedDouble, Sparkles, Leaf, AlertTriangle, Loader2, Info } from "lucide-react";
import { userApi } from "../../api";
import { fmtDateTime, fmtCurrency } from "../../utils/formatters";
import axiosClient from "../../api/axiosClient";
import { useLanguage } from "../../context/LanguageContext";

const PREDEFINED_REASONS = {
  room: [
    "Thay đổi kế hoạch du lịch",
    "Có việc bận đột xuất",
    "Thời tiết không thuận lợi",
    "Lý do sức khỏe",
    "Tìm được lựa chọn khác phù hợp hơn"
  ],
  food: [
    "Thay đổi thực đơn ăn uống",
    "Chọn nhầm món ăn / thời gian phục vụ",
    "Được mời dùng bữa ngoài resort",
    "Thay đổi số lượng người ăn",
    "Lý do sức khỏe"
  ],
  spa: [
    "Thay đổi kế hoạch hoạt động",
    "Chọn nhầm khung giờ / liệu trình",
    "Thay đổi ý định trị liệu",
    "Lý do sức khỏe",
    "Trùng lịch hoạt động khác"
  ]
};

export default function CancelServicesTab() {
  const { t, language } = useLanguage();
  
  // States for data
  const [roomBookings, setRoomBookings] = useState([]);
  const [spaBookings, setSpaBookings]   = useState([]);
  const [foodOrders, setFoodOrders]     = useState([]);
  const [loading, setLoading]           = useState(true);

  // States for cancellation modal
  const [showModal, setShowModal]             = useState(false);
  const [cancelType, setCancelType]           = useState(""); // "room", "food", "spa"
  const [selectedItem, setSelectedItem]       = useState(null);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [otherReason, setOtherReason]         = useState("");
  const [submitting, setSubmitting]           = useState(false);
  const [refundPreview, setRefundPreview]     = useState(null);

  const fetchServicesData = async () => {
    setLoading(true);
    try {
      const email = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
      const [rooms, spas, profileRes] = await Promise.all([
        userApi.getMyBookings().catch(() => []),
        userApi.getMySpaBookings().catch(() => []),
        email ? axiosClient.get(`/guest/profile?email=${email}`).catch(() => null) : null
      ]);

      // Filter active room bookings: PENDING_DEPOSIT, CONFIRMED, CHECKED_IN, CHECKED_OUT
      const activeRooms = (rooms || []).filter(r => 
        r.status === "PENDING_DEPOSIT" || 
        r.status === "CONFIRMED" || 
        r.status === "CHECKED_IN" || 
        r.status === "CHECKED_OUT"
      );
      setRoomBookings(activeRooms);

      // Filter active spa bookings: PENDING, CONFIRMED
      const activeSpas = (spas || []).filter(s => s.status === "PENDING" || s.status === "CONFIRMED");
      setSpaBookings(activeSpas);

      // Filter active food orders: PENDING, PREPARING
      if (profileRes && profileRes.data && profileRes.data.booking && profileRes.data.booking.orders) {
        const activeFoods = profileRes.data.booking.orders.filter(o => o.status === "PENDING" || o.status === "PREPARING");
        setFoodOrders(activeFoods);
      } else {
        setFoodOrders([]);
      }
    } catch (err) {
      console.error("Lỗi khi tải thông tin dịch vụ hoạt động:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesData();
  }, []);

  // Compute refund preview in UI before confirming cancellation
  const handleOpenCancelModal = (type, item) => {
    setCancelType(type);
    setSelectedItem(item);
    setSelectedReasons([]);
    setOtherReason("");
    
    const now = new Date();
    let refundPercent = 100;
    let refundValue = 0;
    let description = "";
    let canCancel = true;

    if (type === "room") {
      const checkInDate = new Date(item.checkInDate);
      const diffMs = checkInDate - now;
      const diffHours = diffMs / (1000 * 60 * 60);
      
      const nights = Math.max(1, Math.round((new Date(item.checkOutDate) - new Date(item.checkInDate)) / (1000 * 60 * 60 * 24)));
      const roomPrice = item.priceAtBooking || 0;
      const roomDeposit = item.bookingDetailsCount === 1 
        ? (item.totalDeposit || (roomPrice * nights * 1.10 * 0.30)) 
        : (roomPrice * nights * 1.10 * 0.30);

      if (item.status === "PENDING_DEPOSIT") {
        refundPercent = 0;
        refundValue = 0;
        description = language === "VIE" 
          ? "Phòng chưa đặt cọc, bạn sẽ không mất phí khi hủy." 
          : "Unpaid booking, no fee will be charged.";
      } else {
        if (diffHours >= 24) {
          refundPercent = 100;
          refundValue = roomDeposit;
          description = language === "VIE" 
            ? `Hủy trước 24h: Hoàn 100% tiền cọc phòng (${fmtCurrency(roomDeposit)}).` 
            : `Cancel before 24h: Refund 100% room deposit (${fmtCurrency(roomDeposit)}).`;
        } else if (diffHours >= 12) {
          refundPercent = 50;
          refundValue = roomDeposit * 0.5;
          description = language === "VIE" 
            ? `Hủy trước 12h: Hoàn 50% tiền cọc phòng (${fmtCurrency(roomDeposit * 0.5)}), giữ lại 50% làm phí phạt.` 
            : `Cancel before 12h: Refund 50% room deposit (${fmtCurrency(roomDeposit * 0.5)}), 50% penalty applies.`;
        } else {
          refundPercent = 0;
          refundValue = 0;
          description = language === "VIE" 
            ? `Hủy muộn (dưới 12h): Hoàn 0% tiền cọc phòng, giữ lại toàn bộ cọc phòng (${fmtCurrency(roomDeposit)}) làm phí phạt.` 
            : `Late cancellation (under 12h): Refund 0% room deposit, full room deposit (${fmtCurrency(roomDeposit)}) kept as penalty.`;
        }
      }
    } else if (type === "food") {
      const serveTime = new Date(item.orderTime);
      const diffMs = serveTime - now;
      const diffHours = diffMs / (1000 * 60 * 60);
      const total = item.totalAmount || 0;

      if (diffHours < 2) {
        canCancel = false;
        description = language === "VIE"
          ? "Thời gian phục vụ dưới 2 tiếng. Không thể hủy món ăn lúc này."
          : "Serving time is under 2 hours. Cancellation is not allowed.";
      } else if (diffHours >= 4) {
        refundPercent = 100;
        refundValue = total;
        description = language === "VIE"
          ? `Hủy trước 4h: Hoàn 100% (${fmtCurrency(total)}), không tính phí phạt.`
          : `Cancel before 4h: Refund 100% (${fmtCurrency(total)}), no penalty.`;
      } else {
        refundPercent = 50;
        refundValue = total * 0.5;
        description = language === "VIE"
          ? `Hủy trước 2h: Hoàn 50% (${fmtCurrency(total * 0.5)}), tính phí phạt 50% (${fmtCurrency(total * 0.5)}) vào hóa đơn phòng.`
          : `Cancel before 2h: Refund 50% (${fmtCurrency(total * 0.5)}), 50% penalty (${fmtCurrency(total * 0.5)}) added to invoice.`;
      }
    } else if (type === "spa") {
      const startDateTime = new Date(item.startDatetime);
      const diffMs = startDateTime - now;
      const diffHours = diffMs / (1000 * 60 * 60);
      const price = item.priceAtBooking || 0;

      if (item.isPackageIncluded) {
        refundPercent = 0;
        refundValue = 0;
        description = language === "VIE"
          ? "Buổi trị liệu nằm trong gói nghỉ dưỡng, bạn sẽ được hoàn lại lượt trị liệu vào tài khoản gói."
          : "Session is included in your package. The session count will be restored.";
      } else {
        if (diffHours >= 2) {
          refundPercent = 100;
          refundValue = price;
          description = language === "VIE"
            ? `Hủy trước 2h: Hoàn 100% (${fmtCurrency(price)}).`
            : `Cancel before 2h: Refund 100% (${fmtCurrency(price)}).`;
        } else {
          refundPercent = 50;
          refundValue = price * 0.5;
          description = language === "VIE"
            ? `Hủy muộn (dưới 2h): Hoàn 50% (${fmtCurrency(price * 0.5)}), tính phí phạt 50% (${fmtCurrency(price * 0.5)}) vào hóa đơn phòng.`
            : `Late cancel (under 2h): Refund 50% (${fmtCurrency(price * 0.5)}), 50% penalty (${fmtCurrency(price * 0.5)}) added to invoice.`;
        }
      }
    }

    setRefundPreview({ refundPercent, refundValue, description, canCancel });
    if (canCancel) {
      setShowModal(true);
    } else {
      alert(description);
    }
  };

  const handleCheckboxChange = (reason) => {
    setSelectedReasons(prev =>
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  const handleConfirmCancel = async () => {
    if (selectedReasons.length === 0 && !otherReason.trim()) {
      alert(language === "VIE" ? "Vui lòng chọn hoặc nhập lý do hủy." : "Please select or input cancellation reason.");
      return;
    }

    setSubmitting(true);
    try {
      const combinedReason = [
        ...selectedReasons,
        otherReason.trim() ? `${language === "VIE" ? "Lý do khác" : "Other"}: ${otherReason.trim()}` : ""
      ].filter(r => r).join("; ");

      if (cancelType === "room") {
        await axiosClient.post(`/bookings/detail/${selectedItem.detailId}/cancel`, { reason: combinedReason });
      } else if (cancelType === "food") {
        await axiosClient.post(`/guest/orders/${selectedItem.orderId}/cancel`, { reason: combinedReason });
      } else if (cancelType === "spa") {
        await axiosClient.post(`/v1/spa-bookings/${selectedItem.spaBookingId}/cancel`, { reason: combinedReason });
      }

      alert(language === "VIE" ? "Đã thực hiện hủy thành công dịch vụ!" : "Service cancelled successfully!");
      setShowModal(false);
      fetchServicesData();
    } catch (err) {
      alert(language === "VIE" ? `Không thể hủy dịch vụ: ${err.response?.data?.message || err.message}` : `Failed to cancel: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 border-primary-900 animate-spin text-primary-900" />
        <p className="text-sage-600 text-xs font-semibold uppercase tracking-wider">
          {language === "VIE" ? "Đang tải dữ liệu..." : "Loading active services..."}
        </p>
      </div>
    );
  }

  // Flatten room booking details to display and cancel individual rooms
  const roomDetailsList = [];
  roomBookings.forEach(booking => {
    if (booking.rooms && booking.rooms.length > 0) {
      booking.rooms.forEach(roomDetail => {
        roomDetailsList.push({
          detailId: roomDetail.detailId,
          roomNumber: roomDetail.roomNumber,
          typeName: roomDetail.typeName,
          priceAtBooking: roomDetail.priceAtBooking,
          bookingId: booking.bookingId,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          status: booking.status,
          totalDeposit: booking.totalDeposit,
          bookingDetailsCount: booking.rooms.length,
          packageName: booking.packageName
        });
      });
    } else {
      roomDetailsList.push({
        bookingId: booking.bookingId,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        status: booking.status,
        totalDeposit: booking.totalDeposit,
        bookingDetailsCount: 1,
        priceAtBooking: booking.totalDeposit / 0.3,
        roomNumber: "N/A",
        typeName: booking.packageName || (language === "VIE" ? "Phòng nghỉ dưỡng" : "Standard stay"),
        packageName: booking.packageName
      });
    }
  });

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-serif font-bold text-sage-950 mb-2">
          {language === "VIE" ? "Quản lý Hủy dịch vụ" : "Service Cancellations"}
        </h2>
        <p className="text-sage-600 text-xs leading-relaxed max-w-2xl">
          {language === "VIE"
            ? "Theo dõi các dịch vụ phòng, món ăn và spa đang hoạt động của bạn. Quý khách có thể tự thực hiện hủy trực tuyến theo chính sách hoàn tiền của Resort."
            : "Manage your active room bookings, food orders, and spa sessions. Cancel online according to Ngu Son Resort's refund policies."}
        </p>
      </div>

      {/* SECTION 1: ROOM BOOKINGS */}
      <div className="bg-white rounded-md border border-primary-100 overflow-hidden shadow-sm">
        <div className="bg-primary-900/5 px-4 py-3 border-b border-primary-100 flex items-center gap-2">
          <BedDouble className="h-4.5 w-4.5 text-primary-900" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary-900">
            {language === "VIE" ? "Đặt phòng nghỉ dưỡng" : "Room Bookings"}
          </h3>
          <span className="ml-auto text-[10px] font-bold bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full">
            {roomDetailsList.length}
          </span>
        </div>

        {roomDetailsList.length === 0 ? (
          <div className="p-6 text-center text-sage-400 text-xs">
            {language === "VIE" ? "Không có đặt phòng nào hoạt động." : "No active room bookings."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-sage-50/50 border-b border-primary-100 text-sage-600 font-semibold">
                  <th className="px-4 py-2.5">Mã</th>
                  <th className="px-4 py-2.5">Check-in / Check-out</th>
                  <th className="px-4 py-2.5">Hạng phòng / Gói</th>
                  <th className="px-4 py-2.5">Tiền cọc phòng</th>
                  <th className="px-4 py-2.5">Trạng thái</th>
                  <th className="px-4 py-2.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50">
                {roomDetailsList.map((item, index) => {
                  const nights = Math.max(1, Math.round((new Date(item.checkOutDate) - new Date(item.checkInDate)) / (1000 * 60 * 60 * 24)));
                  const roomPrice = item.priceAtBooking || 0;
                  const roomDeposit = item.bookingDetailsCount === 1 
                    ? (item.totalDeposit || (roomPrice * nights * 1.10 * 0.30)) 
                    : (roomPrice * nights * 1.10 * 0.30);
                  return (
                    <tr key={item.detailId || `fallback-${index}`} className="hover:bg-primary-50/20 transition">
                      <td className="px-4 py-3">
                        {item.roomNumber && item.roomNumber !== "N/A" ? (
                          <span className="text-[10px] bg-primary-100 text-primary-900 px-1.5 py-0.5 rounded font-mono font-bold">
                            {item.roomNumber}
                          </span>
                        ) : (
                          <span className="text-sage-400 font-medium">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sage-700 whitespace-nowrap">
                        {fmtDateTime(item.checkInDate)} <br />
                        <span className="text-[10px] text-sage-400">đến {fmtDateTime(item.checkOutDate)}</span>
                      </td>
                      <td className="px-4 py-3 text-sage-700 font-medium">
                        {item.typeName || item.packageName || (language === "VIE" ? "Phòng nghỉ dưỡng" : "Standard stay")}
                      </td>
                      <td className="px-4 py-3 font-semibold text-sage-900">{fmtCurrency(roomDeposit)}</td>
                      <td className="px-4 py-3">
                        {(() => {
                          let badgeClass = "";
                          let statusLabel = "";
                          
                          if (item.status === "CONFIRMED") {
                            badgeClass = "bg-blue-50 text-blue-700 border border-blue-200";
                            statusLabel = language === "VIE" ? "Đang chờ nhận phòng" : "Waiting for Check-in";
                          } else if (item.status === "CHECKED_IN") {
                            badgeClass = "bg-emerald-50 text-emerald-700 border border-emerald-200";
                            statusLabel = language === "VIE" ? "Đã nhận phòng" : "Checked In";
                          } else if (item.status === "CHECKED_OUT") {
                            badgeClass = "bg-slate-50 text-slate-700 border border-slate-200";
                            statusLabel = language === "VIE" ? "Trả phòng" : "Checked Out";
                          } else {
                            badgeClass = "bg-amber-50 text-amber-700 border border-amber-200";
                            statusLabel = language === "VIE" ? "Chờ cọc" : "Pending Deposit";
                          }
                          
                          return (
                            <span className={`inline-flex px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                              {statusLabel}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {(item.status === "PENDING_DEPOSIT" || item.status === "CONFIRMED") ? (
                          <button
                            onClick={() => handleOpenCancelModal("room", item)}
                            className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white rounded-sm text-[11px] font-semibold transition"
                          >
                            {language === "VIE" ? "Hủy phòng" : "Cancel"}
                          </button>
                        ) : (
                          <span className="text-[11px] text-sage-400 font-medium italic">
                            {language === "VIE" ? "Không thể hủy" : "Non-cancellable"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: FOOD ORDERS */}
      <div className="bg-white rounded-md border border-primary-100 overflow-hidden shadow-sm">
        <div className="bg-primary-900/5 px-4 py-3 border-b border-primary-100 flex items-center gap-2">
          <Leaf className="h-4.5 w-4.5 text-primary-900" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary-900">
            {language === "VIE" ? "Đơn gọi món Ẩm thực" : "F&B Meal Orders"}
          </h3>
          <span className="ml-auto text-[10px] font-bold bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full">
            {foodOrders.length}
          </span>
        </div>

        {foodOrders.length === 0 ? (
          <div className="p-6 text-center text-sage-400 text-xs">
            {language === "VIE" ? "Không có đơn ẩm thực nào hoạt động." : "No active dining orders."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-sage-50/50 border-b border-primary-100 text-sage-600 font-semibold">
                  <th className="px-4 py-2.5">Mã đơn</th>
                  <th className="px-4 py-2.5">Giờ phục vụ</th>
                  <th className="px-4 py-2.5">Danh sách món ăn</th>
                  <th className="px-4 py-2.5">Tổng thanh toán</th>
                  <th className="px-4 py-2.5">Trạng thái</th>
                  <th className="px-4 py-2.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50">
                {foodOrders.map((item) => {
                  const dishNames = item.details.map(d => `${d.quantity}x ${d.dishName}`).join(", ");
                  return (
                    <tr key={item.orderId} className="hover:bg-primary-50/20 transition">
                      <td className="px-4 py-3 font-serif font-bold text-sage-950">#{item.orderId}</td>
                      <td className="px-4 py-3 text-sage-700 whitespace-nowrap">{fmtDateTime(item.orderTime)}</td>
                      <td className="px-4 py-3 text-sage-500 max-w-xs truncate" title={dishNames}>
                        {dishNames}
                      </td>
                      <td className="px-4 py-3 font-semibold text-sage-900">
                        {fmtCurrency(item.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                          item.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {item.status === "PENDING" ? (language === "VIE" ? "Chờ duyệt" : "Pending") : (language === "VIE" ? "Đang làm" : "Preparing")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleOpenCancelModal("food", item)}
                          className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white rounded-sm text-[11px] font-semibold transition"
                        >
                          {language === "VIE" ? "Hủy món" : "Cancel"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 3: SPA / SERVICES */}
      <div className="bg-white rounded-md border border-primary-100 overflow-hidden shadow-sm">
        <div className="bg-primary-900/5 px-4 py-3 border-b border-primary-100 flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-primary-900" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary-900">
            {language === "VIE" ? "Dịch vụ trị liệu Spa" : "Spa & Therapy Sessions"}
          </h3>
          <span className="ml-auto text-[10px] font-bold bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full">
            {spaBookings.length}
          </span>
        </div>

        {spaBookings.length === 0 ? (
          <div className="p-6 text-center text-sage-400 text-xs">
            {language === "VIE" ? "Không có lịch hẹn trị liệu nào hoạt động." : "No active spa appointments."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-sage-50/50 border-b border-primary-100 text-sage-600 font-semibold">
                  <th className="px-4 py-2.5">Mã lịch</th>
                  <th className="px-4 py-2.5">Giờ trị liệu</th>
                  <th className="px-4 py-2.5">Liệu trình</th>
                  <th className="px-4 py-2.5">Giá trị</th>
                  <th className="px-4 py-2.5">Trạng thái</th>
                  <th className="px-4 py-2.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50">
                {spaBookings.map((item) => (
                  <tr key={item.spaBookingId} className="hover:bg-primary-50/20 transition">
                    <td className="px-4 py-3 font-serif font-bold text-sage-950">#{item.spaBookingId}</td>
                    <td className="px-4 py-3 text-sage-700 whitespace-nowrap">{fmtDateTime(item.startDatetime)}</td>
                    <td className="px-4 py-3 text-sage-700 font-medium">{item.serviceName}</td>
                    <td className="px-4 py-3 font-semibold text-sage-900">
                      {item.isPackageIncluded ? (
                        <span className="text-emerald-600 font-normal italic text-[11px]">
                          {language === "VIE" ? "Theo gói" : "In package"}
                        </span>
                      ) : (
                        fmtCurrency(item.priceAtBooking)
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                        item.status === "CONFIRMED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {item.status === "CONFIRMED" ? (language === "VIE" ? "Đã xếp lịch" : "Confirmed") : (language === "VIE" ? "Chờ xử lý" : "Pending")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenCancelModal("spa", item)}
                        className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white rounded-sm text-[11px] font-semibold transition"
                      >
                        {language === "VIE" ? "Hủy lịch" : "Cancel"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CANCELLATION REASON MODAL OVERLAY */}
      {showModal && (
        <div className="fixed inset-0 bg-sage-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-md max-w-md w-full shadow-2xl border border-primary-100 overflow-hidden transform scale-100 transition-all">
            <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-red-800">
                  {language === "VIE" ? "Xác nhận hủy dịch vụ" : "Confirm Cancellation"}
                </h3>
                <p className="text-[10px] text-red-600 font-semibold tracking-wide">
                  {language === "VIE" ? "Dịch vụ một khi hủy sẽ không thể khôi phục" : "This action cannot be undone"}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Refund Preview Indicator */}
              {refundPreview && (
                <div className="bg-primary-50 rounded-sm p-3 border border-primary-200 flex gap-2">
                  <Info className="h-5 w-5 text-primary-900 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-primary-950">
                      {language === "VIE" ? "Ước tính hoàn cọc / hoàn tiền" : "Estimated Refund Amount"}
                    </h4>
                    <p className="text-[11px] text-sage-600 leading-normal mt-1">
                      {refundPreview.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Reasons Checklist */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold text-sage-600 uppercase tracking-wider">
                  {language === "VIE" ? "Chọn lý do hủy (Có thể chọn nhiều)" : "Select Cancellation Reasons (Multi-select)"}
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {PREDEFINED_REASONS[cancelType]?.map((reason, idx) => (
                    <label key={idx} className="flex items-start gap-2.5 p-2 rounded-sm border border-primary-50/50 hover:bg-sage-50 cursor-pointer transition text-xs text-sage-700">
                      <input
                        type="checkbox"
                        checked={selectedReasons.includes(reason)}
                        onChange={() => handleCheckboxChange(reason)}
                        className="mt-0.5 rounded-sm border-sage-300 text-primary-900 focus:ring-primary-800"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Reason Text Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-sage-600 uppercase tracking-wider">
                  {language === "VIE" ? "Lý do khác" : "Other Reason"}
                </label>
                <textarea
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder={
                    language === "VIE" 
                      ? "Vui lòng nhập thêm lý do chi tiết..." 
                      : "Please input additional details if any..."
                  }
                  className="w-full border border-sage-200 rounded-sm p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary-900 focus:border-primary-900"
                  rows={3}
                />
              </div>
            </div>

            <div className="bg-sage-50 px-6 py-4 flex justify-end gap-2 border-t border-primary-50">
              <button
                onClick={() => setShowModal(false)}
                disabled={submitting}
                className="px-4 py-2 border border-sage-200 hover:bg-sage-100 rounded-sm text-xs font-semibold text-sage-700 transition"
              >
                {language === "VIE" ? "Đóng" : "Close"}
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={submitting}
                className="px-5 py-2 bg-red-650 text-white hover:bg-red-700 rounded-sm text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {language === "VIE" ? "Xác nhận hủy" : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
