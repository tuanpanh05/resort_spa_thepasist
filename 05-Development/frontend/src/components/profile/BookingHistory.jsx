import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BedDouble, Sparkles, Dumbbell, Leaf, Clock, BadgeCheck } from "lucide-react";
import { userApi } from "../../api";
import { fmtDate, fmtDateTime, fmtCurrency } from "../../utils/formatters";
import StatusBadge, { ROOM_STATUS_MAP, SPA_STATUS_MAP, FOOD_STATUS_MAP } from "./StatusBadge";
import axiosClient from "../../api/axiosClient";
import { useLanguage } from "../../context/LanguageContext";

export default function BookingHistory() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("rooms"); // "rooms", "all", "spa", "yoga", "food"
  const [roomBookings, setRoomBookings] = useState([]);
  const [spaBookings, setSpaBookings]   = useState([]);
  const [foodOrders, setFoodOrders]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const email = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
        const [rooms, spas, profileRes] = await Promise.all([
          userApi.getMyBookings().catch(() => []),
          userApi.getMySpaBookings().catch(() => []),
          email ? axiosClient.get(`/guest/profile?email=${email}`).catch(() => null) : null
        ]);
        setRoomBookings(rooms || []);
        setSpaBookings(spas || []);

        if (profileRes && profileRes.data && profileRes.data.booking && profileRes.data.booking.orders) {
          const rawOrders = profileRes.data.booking.orders;
          const mappedOrders = rawOrders.map(o => {
            const dishNames = o.details.map(d => `${d.quantity}x ${d.dishName || (language === "VIE" ? "Món ăn" : "Dish")}`).join(", ");
            return {
              spaBookingId: "food-" + o.orderId,
              serviceName: dishNames || (language === "VIE" ? "Đơn hàng ẩm thực" : "Food order"),
              serviceCategory: language === "VIE" ? "Ẩm thực dưỡng sinh" : "Organic dining",
              startDatetime: o.orderTime,
              endDatetime: o.orderTime,
              status: o.status, // PENDING, PREPARING, READY, DELIVERED, CANCELLED
              priceAtBooking: o.totalAmount || 0,
              isPackageIncluded: o.details.some(d => d.isPackageIncluded),
              type: "food",
              specialNote: o.details.map(d => d.specialNote).filter(n => n).join("; ")
            };
          });
          setFoodOrders(mappedOrders);
        } else {
          setFoodOrders([]);
        }
      } catch (err) {
        console.error("Lỗi khi tải lịch sử:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [language]);

  const mappedSpaBookings = spaBookings.map(s => {
    const cat = s.serviceCategory ? s.serviceCategory.toUpperCase() : "";
    const type = cat.includes("YOGA") ? "yoga" : "spa";
    return { ...s, type };
  });

  const allOtherServices = [
    ...mappedSpaBookings,
    ...foodOrders
  ];

  const filteredOtherServices = allOtherServices.filter(item => item.type === activeTab);

  const EmptyState = ({ icon: Icon, message }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="inline-flex p-4 rounded-md bg-primary-50 text-primary-300 mb-4">
        <Icon className="h-8 w-8" />
      </div>
      <p className="text-sage-500 text-sm">{message}</p>
      <Link to="/dat-lich" className="mt-4 px-5 py-2 rounded-md text-xs font-semibold bg-primary-900 text-white hover:bg-primary-800 transition">
        {t("profile.bookNowBtn")}
      </Link>
    </div>
  );

  const tabs = [
    { key: "rooms", label: t("profile.tabRooms"), icon: BedDouble, count: roomBookings.length },
    { key: "spa", label: t("profile.tabSpa"), icon: Dumbbell, count: mappedSpaBookings.filter(s => s.type === "spa").length },
    { key: "yoga", label: t("profile.tabYoga"), icon: Sparkles, count: mappedSpaBookings.filter(s => s.type === "yoga").length },
    { key: "food", label: t("profile.tabFood"), icon: Leaf, count: foodOrders.length },
  ];

  return (
    <div className="space-y-5">
      {/* Category selector / Tabs */}
      <div className="flex gap-2 overflow-x-auto flex-nowrap bg-primary-50 p-1.5 rounded-md w-full md:w-fit max-w-full scrollbar-none">
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
              activeTab === key
                ? "bg-white text-primary-900 shadow-sm"
                : "text-sage-600 hover:text-sage-800"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                activeTab === key
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
      ) : activeTab === "rooms" ? (
        roomBookings.length === 0 ? (
          <EmptyState icon={BedDouble} message={t("profile.emptyRooms")} />
        ) : (
          <div className="space-y-3">
            {roomBookings.map((b) => (
              <div key={b.bookingId} className="bg-white rounded-md border-b border-primary-100 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs text-sage-500 mb-1">{t("profile.bookingId")} #{b.bookingId}</p>
                    <p className="text-sm font-semibold text-sage-900">
                      {fmtDate(b.checkInDate)} → {fmtDate(b.checkOutDate)}
                    </p>
                    {b.packageName && (
                      <p className="text-xs text-primary-700 mt-0.5 flex items-center gap-1">
                        <BadgeCheck className="h-3.5 w-3.5" /> {t("profile.packageLabel")}: {b.packageName}
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
                          {t("profile.roomNo")} {r.roomNumber} — {r.typeName}
                        </span>
                        <span className="font-semibold text-sage-800">{fmtCurrency(r.priceAtBooking)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-primary-50">
                  <span className="text-xs text-sage-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {t("profile.bookedDate")} {fmtDate(b.createdAt)}
                  </span>
                  <span className="text-xs font-bold text-sage-900">{t("profile.depositLabel")}: {fmtCurrency(b.totalDeposit)}</span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Other services */
        filteredOtherServices.length === 0 ? (
          <EmptyState icon={Sparkles} message={t("profile.emptyServices")} />
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
                      <p className="text-xs text-sage-500 mt-1">{t("profile.therapistLabel")}: {s.therapistName}</p>
                    )}
                    {s.specialNote && (
                      <p className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-sm mt-2 w-fit">{t("profile.noteLabel")}: {s.specialNote}</p>
                    )}
                  </div>
                  <StatusBadge status={s.status} map={s.type === "food" ? FOOD_STATUS_MAP : SPA_STATUS_MAP} />
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
                    <BadgeCheck className="h-3.5 w-3.5" /> {t("profile.packageIncluded")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
