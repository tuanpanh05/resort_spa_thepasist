import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  MapPin,
  Sparkles,
  UtensilsCrossed,
  CalendarDays,
  ChevronDown,
  AlertCircle,
  Package,
  User,
  Phone,
  Mail,
  BadgeCheck,
  Loader2,
  Calendar
} from "lucide-react";
import { userApi, bookingLookupApi } from "../../api";
import { fmtDate, fmtDateTime, fmtCurrency } from "../../utils/formatters";
import { useLanguage } from "../../context/LanguageContext";

const EVENT_CONFIG = {
  CHECKIN: { icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dotBg: "bg-emerald-600" },
  CHECKOUT: { icon: MapPin, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", dotBg: "bg-rose-600" },
  SPA: { icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", dotBg: "bg-purple-600" },
  FOOD: { icon: UtensilsCrossed, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", dotBg: "bg-amber-600" },
};

const STATUS_BADGES = {
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
  CHECKED_IN: "bg-blue-50 text-blue-700 border-blue-200",
  CHECKED_OUT: "bg-sage-100 text-sage-700 border-sage-200",
};

export default function ItineraryTab() {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingItinerary, setLoadingItinerary] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch user bookings
  useEffect(() => {
    const fetchBookings = async () => {
      setLoadingBookings(true);
      setError(null);
      try {
        const data = await userApi.getMyBookings();
        if (data && data.length > 0) {
          setBookings(data);
          // Auto select the first active booking, or the first booking
          const active = data.find((b) => b.status !== "CANCELLED") || data[0];
          setSelectedBookingId(active.bookingId);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách đặt phòng:", err);
        setError("Không thể tải danh sách đặt phòng của bạn.");
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, []);

  // 2. Fetch itinerary for selected booking
  useEffect(() => {
    const fetchItinerary = async () => {
      if (!selectedBookingId) {
        setItinerary(null);
        return;
      }
      setLoadingItinerary(true);
      try {
        const data = await bookingLookupApi.getItinerary(selectedBookingId);
        setItinerary(data);
      } catch (err) {
        console.error("Lỗi khi tải lịch trình chi tiết:", err);
        setItinerary(null);
      } finally {
        setLoadingItinerary(false);
      }
    };
    fetchItinerary();
  }, [selectedBookingId]);

  const handleSelectBooking = (id) => {
    setSelectedBookingId(id);
  };

  const getStatusBadgeClass = (status) => {
    return STATUS_BADGES[status] || "bg-gray-50 text-gray-600 border-gray-200";
  };

  const getStatusLabel = (status) => {
    const keys = {
      COMPLETED: "profile.statusCompleted",
      CONFIRMED: "profile.statusConfirmed",
      PENDING: "profile.statusPendingShort",
      CANCELLED: "profile.statusCancelled",
      CHECKED_IN: "profile.statusInResidence",
      CHECKED_OUT: "profile.statusCheckedOut",
      PENDING_DEPOSIT: "profile.statusPendingDeposit",
    };
    const k = keys[status];
    return k ? t(k) : status;
  };

  // Render Loading state
  if (loadingBookings) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-sage-500">
        <Loader2 className="h-8 w-8 animate-spin text-primary-800 mb-2" />
        <span className="text-xs font-semibold">{t("profile.itineraryLoading")}</span>
      </div>
    );
  }

  // Render Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-md flex items-center gap-2.5 text-red-700 text-xs">
        <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  // Render Empty state
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="inline-flex p-4 rounded-md bg-primary-50 text-primary-300 mb-4">
          <Calendar className="h-8 w-8" />
        </div>
        <h4 className="font-serif text-base font-bold text-sage-900 mb-1">{t("profile.itineraryEmptyTitle")}</h4>
        <p className="text-sage-500 text-xs max-w-sm leading-relaxed mb-5">
          {t("profile.itineraryEmptyDesc")}
        </p>
        <Link
          to="/dat-lich"
          className="px-6 py-2.5 bg-primary-900 text-white hover:bg-primary-800 text-xs font-bold uppercase tracking-wider transition duration-300"
        >
          {t("profile.itineraryBookNow")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Booking Selector header card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary-50/40 p-4 border border-primary-100 rounded-md">
        <div>
          <label className="block text-[9px] font-bold text-sage-400 uppercase tracking-widest mb-1.5">
            {t("profile.itinerarySelectStay")}
          </label>
          <div className="relative inline-block w-full sm:w-72">
            <select
              value={selectedBookingId || ""}
              onChange={(e) => handleSelectBooking(Number(e.target.value))}
              className="w-full pl-3 pr-10 py-2.5 bg-white border border-primary-200 rounded-md text-xs font-semibold text-sage-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 appearance-none cursor-pointer transition-all"
            >
              {bookings.map((b) => (
                <option key={b.bookingId} value={b.bookingId}>
                  {t("profile.bookingId")} #{b.bookingId} ({fmtDate(b.checkInDate)} - {fmtDate(b.checkOutDate)}) [{getStatusLabel(b.status)}]
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sage-500 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-end">
          <span className="text-[10px] bg-primary-900/10 text-primary-900 border border-primary-900/20 px-3 py-1.5 font-bold uppercase tracking-wider rounded">
            {t("profile.itineraryPersonal")}
          </span>
        </div>
      </div>

      {loadingItinerary ? (
        <div className="flex flex-col items-center justify-center py-20 text-sage-500">
          <Loader2 className="h-7 w-7 animate-spin text-primary-800 mb-2" />
          <span className="text-xs">{t("profile.itineraryLoadingDetail")}</span>
        </div>
      ) : itinerary ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Summary stay details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Stay details card */}
            <div className="bg-white border border-primary-100 rounded-md p-5 shadow-sm text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sage-400 mb-4 flex items-center gap-2 pb-2 border-b border-primary-50">
                <CalendarDays className="h-4 w-4 text-primary-700" />
                {t("profile.itineraryStayInfo")}
              </h4>
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="flex justify-between">
                  <span className="text-sage-500">{t("profile.itineraryId")}:</span>
                  <span className="font-bold text-primary-800">#{itinerary.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sage-500">{t("profile.itineraryCheckIn")}:</span>
                  <span className="font-semibold text-sage-800">{fmtDate(itinerary.checkInDate)} (14:00)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sage-500">{t("profile.itineraryCheckOut")}:</span>
                  <span className="font-semibold text-sage-800">{fmtDate(itinerary.checkOutDate)} (12:00)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sage-500">{t("profile.itineraryRoomNo")}:</span>
                  <span className="font-bold text-sage-950">{itinerary.roomNumber || t("profile.itineraryNotAssigned")}</span>
                </div>
                {itinerary.roomTypeName && (
                  <div className="flex justify-between">
                    <span className="text-sage-500">{t("profile.itineraryRoomType")}:</span>
                    <span className="font-semibold text-sage-800">{itinerary.roomTypeName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sage-500">{t("profile.itineraryStatus")}:</span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(itinerary.bookingStatus)}`}>
                    {getStatusLabel(itinerary.bookingStatus)}
                  </span>
                </div>
                {itinerary.totalDeposit > 0 && (
                  <div className="flex justify-between border-t border-primary-50 pt-3 mt-1.5">
                    <span className="text-sage-500 font-medium">{t("profile.itineraryDepositPaid")}:</span>
                    <span className="font-bold text-emerald-700">{fmtCurrency(itinerary.totalDeposit)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Guest info card */}
            <div className="bg-white border border-primary-100 rounded-md p-5 shadow-sm text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sage-400 mb-4 flex items-center gap-2 pb-2 border-b border-primary-50">
                <User className="h-4 w-4 text-primary-700" />
                {t("profile.itineraryGuestInfo")}
              </h4>
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="flex justify-between">
                  <span className="text-sage-500">{t("profile.itineraryGuestName")}:</span>
                  <span className="font-bold text-sage-950">{itinerary.guestName || "—"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sage-500 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-sage-400" /> Email:</span>
                  <span className="font-medium text-sage-700 truncate max-w-[180px]">{itinerary.guestEmail || "—"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sage-500 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-sage-400" /> {t("profile.phone")}:</span>
                  <span className="font-medium text-sage-700">{itinerary.guestPhone || "—"}</span>
                </div>
              </div>
            </div>

            {/* Package info card */}
            {itinerary.packageName && (
              <div className="bg-white border border-primary-100 rounded-md p-5 shadow-sm text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-full -mr-10 -mt-10 opacity-50" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-sage-400 mb-3.5 flex items-center gap-2 pb-1.5 border-b border-primary-50 relative z-10">
                  <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
                  {t("profile.itineraryTherapyPackage")}
                </h4>
                <div className="space-y-2.5 text-xs relative z-10">
                  <p className="font-bold text-sage-950">{itinerary.packageName}</p>
                  {itinerary.packageDescription && (
                    <p className="text-sage-600 leading-relaxed font-light text-[11px]">{itinerary.packageDescription}</p>
                  )}
                  <div className="flex justify-between items-center text-[11px] pt-1.5">
                    <span className="text-sage-500">{t("profile.itineraryDuration")}:</span>
                    <span className="font-bold text-primary-900 bg-primary-50 px-2 py-0.5 rounded">{t("profile.itineraryDurationDays").replace("{days}", itinerary.packageDurationDays)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Detailed Itinerary Timeline (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-primary-100 rounded-md p-6 shadow-sm text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sage-400 mb-6 flex items-center gap-2 pb-2.5 border-b border-primary-50">
                <Clock className="h-4 w-4 text-primary-700" />
                {t("profile.itineraryTimelineTitle")}
              </h4>

              {itinerary.timeline && itinerary.timeline.length > 0 ? (
                <div className="relative pl-2.5">
                  {/* Timeline vertical line */}
                  <div className="absolute left-[29px] top-6 bottom-6 w-0.5 bg-primary-100" />

                  <div className="space-y-6">
                    {itinerary.timeline.map((event, idx) => {
                      const cfg = EVENT_CONFIG[event.type] || EVENT_CONFIG.CHECKIN;
                      const Icon = cfg.icon;
                      return (
                        <div key={idx} className="relative flex gap-4 items-start group">
                          {/* Timeline dot circle */}
                          <div className={`relative z-10 flex-shrink-0 h-9 w-9 rounded-full ${cfg.bg} border-2 ${cfg.border} text-white flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-110`}>
                            <Icon className={`h-4.5 w-4.5 ${cfg.color}`} />
                          </div>

                          {/* Event details card */}
                          <div className={`flex-1 border ${cfg.border} ${cfg.bg}/30 p-4 rounded-lg hover:shadow-md transition-all duration-300`}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h5 className="text-xs sm:text-sm font-bold text-sage-950">{event.title}</h5>
                                {event.description && (
                                  <p className="text-[11px] text-sage-600 mt-1 leading-relaxed font-light whitespace-pre-wrap">{event.description}</p>
                                )}
                              </div>
                              {event.status && (
                                <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(event.status)} flex-shrink-0`}>
                                  {getStatusLabel(event.status)}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-primary-50 text-[10px] text-sage-400">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-sage-400" />
                                {fmtDateTime(event.startTime)}
                              </span>
                              {event.endTime && (
                                <span className="font-medium">→ {fmtDateTime(event.endTime)}</span>
                              )}
                              {event.price != null && event.price > 0 && (
                                <span className="ml-auto font-bold text-primary-850 text-xs">
                                  {fmtCurrency(event.price)}
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
                <div className="text-center py-10 text-sage-400 italic text-xs">
                  <Calendar className="h-8 w-8 mx-auto mb-3 opacity-40 text-sage-500" />
                  {t("profile.itineraryTimelineEmpty")}
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-primary-100 rounded-md">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-sage-400" />
          <p className="text-sage-500 text-xs">{t("profile.itineraryTimelineError")}</p>
        </div>
      )}
    </div>
  );
}
