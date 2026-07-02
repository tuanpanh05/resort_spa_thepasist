import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BedDouble, Sparkles, BadgeCheck, Clock, Dumbbell, Leaf } from "lucide-react";
import { userApi } from "../../services/api";
import { ROOM_STATUS_MAP, SPA_STATUS_MAP } from "../../constants/statusMaps";
import { fmtDate, fmtDateTime, fmtCurrency } from "../../utils/format";

function StatusBadge({ status, map }) {
  const { label, color } = map[status] || {
    label: status,
    color: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[11px] font-semibold border ${color}`}
    >
      {label}
    </span>
  );
}

const EmptyState = ({ icon: Icon, message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="inline-flex p-4 rounded-md bg-primary-50 text-primary-300 mb-4">
      <Icon className="h-8 w-8" />
    </div>
    <p className="text-sage-500 text-sm">{message}</p>
    <Link
      to="/dat-lich"
      className="mt-4 px-5 py-2 rounded-md text-xs font-semibold bg-primary-900 text-white hover:bg-primary-800 transition"
    >
      Đặt lịch ngay
    </Link>
  </div>
);

export default function HistoryTab() {
  const [activeCategory, setActiveCategory] = useState("rooms"); // "rooms" or "others"
  const [serviceFilter, setServiceFilter] = useState("all"); // "all", "spa", "yoga", "food"
  const [roomBookings, setRoomBookings] = useState([]);
  const [spaBookings, setSpaBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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
      type: "yoga",
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
      type: "yoga",
    },
  ];

  const MOCK_FOOD_ORDERS = [
    {
      spaBookingId: "food-1",
      serviceName: "Set Soup Sâm Gà Đông Trùng Hạ Thảo",
      serviceCategory: "Ẩm thực dưỡng sinh",
      startDatetime: new Date(Date.now() - 86400000 * 3).toISOString(),
      endDatetime: new Date(Date.now() - 86400000 * 3).toISOString(),
      status: "COMPLETED",
      priceAtBooking: 320000,
      isPackageIncluded: false,
      type: "food",
      specialNote: "Không bột ngọt, ít muối",
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
      specialNote: "Không đường, nhiều đá",
    },
  ];

  const allOtherServices = [
    ...spaBookings.map((s) => ({ ...s, type: "spa" })),
    ...MOCK_YOGA_BOOKINGS,
    ...MOCK_FOOD_ORDERS,
  ];

  const filteredOtherServices = allOtherServices.filter((item) => {
    if (serviceFilter === "all") return true;
    return item.type === serviceFilter;
  });

  return (
    <div className="space-y-5">
      {/* Category selector */}
      <div className="flex gap-2 bg-primary-50 p-1 rounded-md w-fit">
        {[
          { key: "rooms", label: "Đặt Phòng", icon: BedDouble, count: roomBookings.length },
          {
            key: "others",
            label: "Dịch Vụ Khác (Spa, Yoga, Food)",
            icon: Sparkles,
            count: allOtherServices.length,
          },
        ].map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === key
                ? "bg-white text-primary-900 shadow-sm"
                : "text-sage-600 hover:text-sage-800"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                activeCategory === key
                  ? "bg-primary-100 text-primary-800"
                  : "bg-sage-200 text-sage-600"
              }`}
            >
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
                  <span className="text-xs font-bold text-sage-900">
                    Cọc: {fmtCurrency(b.totalDeposit)}
                  </span>
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
              <button
                key={key}
                onClick={() => setServiceFilter(key)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                  serviceFilter === key
                    ? "bg-primary-900 text-white border-primary-900 shadow-sm"
                    : "bg-white border-primary-200 text-sage-600 hover:border-primary-400"
                }`}
              >
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
                        {s.type === "spa"
                          ? "Spa Booking"
                          : s.type === "yoga"
                          ? "Yoga Booking"
                          : "Room Service Food"}
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

                    </div>
                    <StatusBadge status={s.status} map={SPA_STATUS_MAP} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-sage-500 mt-3 pt-3 border-t border-primary-50">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {s.type === "food"
                        ? fmtDate(s.startDatetime)
                        : `${fmtDateTime(s.startDatetime)} — ${fmtDateTime(s.endDatetime)}`}
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
