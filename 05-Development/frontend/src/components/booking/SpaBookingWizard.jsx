import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Clock, CheckCircle, AlertCircle, Loader2, Sparkles,
  Leaf, Heart, Activity, ChevronLeft, ChevronRight, Mail, Calendar, User
} from "lucide-react";
import { spaApi, medicalApi } from "../../api";

// --- Helpers -----------------------------------------------------------------
function formatPrice(v) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);
}
function formatDateLong(dt) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString("vi-VN", { dateStyle: "full", timeStyle: "short" });
  } catch (e) { return dt; }
}

const CAT_TABS = [
  { key: "SPA",     label: "Spa & Thư giãn",       icon: Leaf },
  { key: "YOGA",    label: "Yoga & Thiền định", icon: Heart },
  { key: "THERAPY", label: "Trị liệu chuyên sâu", icon: Activity },
];

const STEP_LABELS = ["Chọn dịch vụ", "Chọn khung giờ", "Xác nhận & đặt"];

// Detect whether a service is covered free by an active room-booking package
function detectPackage(service, userBookings, allPackages) {
  for (const booking of (userBookings || [])) {
    if (!booking.packageName) continue;
    const pkg = (allPackages || []).find(
      (p) => p.name === booking.packageName || p.packageName === booking.packageName
    );
    if (!pkg || !pkg.includes) continue;
    const items = pkg.includes.split(";").map((s) => s.trim().toLowerCase());
    const name = service.name.toLowerCase();
    const clean = (x) => x.replace(/[^a-z0-9]/g, "");
    const matched = items.some(
      (item) =>
        name.includes(item) ||
        item.includes(name) ||
        clean(name).includes(clean(item)) ||
        clean(item).includes(clean(name))
    );
    if (matched) return booking;
  }
  return null;
}

export default function SpaBookingWizard({
  spaServices = [],
  userBookings = [],
  allPackages = [],
  medicalProfile: initProfile,
  currentUser,
}) {
  const [step, setStep] = useState(1);
  const [activeCat, setActiveCat] = useState("SPA");
  const [selectedServices, setSelectedServices] = useState([]); // array of { id, service, date, guestsCount, slots, loadingSlots, error, selectedSlot, isFree, matchedPackage }

  const [selectedRoomBookingId, setSelectedRoomBookingId] = useState("");

  const [medicalProfile, setMedicalProfile] = useState(initProfile);
  const [consentChecked, setConsentChecked] = useState(initProfile?.explicitConsentSigned || false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => { setMedicalProfile(initProfile); setConsentChecked(initProfile?.explicitConsentSigned || false); }, [initProfile]);

  const todayStr = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split("T")[0];

  const toggleService = (svc) => {
    setSelectedServices((prev) => {
      const exists = prev.find((x) => x.service.serviceId === svc.serviceId);
      if (exists) {
        return prev.filter((x) => x.service.serviceId !== svc.serviceId);
      } else {
        const free = detectPackage(svc, userBookings, allPackages);
        return [...prev, {
          id: Date.now() + Math.random(),
          service: svc,
          date: "",
          guestsCount: 1,
          slots: [],
          loadingSlots: false,
          error: "",
          selectedSlot: null,
          isFree: !!free,
          matchedPackage: free
        }];
      }
    });
  };

  const updateItemAndFetchSlots = (itemId, dateValue, guestCountValue) => {
    const item = selectedServices.find(x => x.id === itemId);
    if (!item) return;

    const newDate = dateValue !== undefined ? dateValue : item.date;
    const newGuestsCount = guestCountValue !== undefined ? guestCountValue : item.guestsCount;

    setSelectedServices(prev => prev.map(x => {
      if (x.id === itemId) {
        return {
          ...x,
          date: newDate,
          guestsCount: newGuestsCount,
          loadingSlots: !!newDate,
          error: "",
          slots: [],
          selectedSlot: null
        };
      }
      return x;
    }));

    if (!newDate) return;

    // Fetch slots from API
    spaApi.getAvailableSlots(item.service.serviceId, newDate, newGuestsCount)
      .then((data) => {
        setSelectedServices(prev => prev.map(x => {
          if (x.id === itemId) {
            return { ...x, slots: data || [], loadingSlots: false };
          }
          return x;
        }));
      })
      .catch((err) => {
        setSelectedServices(prev => prev.map(x => {
          if (x.id === itemId) {
            return { ...x, error: err.message || "Không thể tải khung giờ trống.", loadingSlots: false };
          }
          return x;
        }));
      });
  };

  const handleBook = async () => {
    setBookingError("");
    if (!consentChecked) { setBookingError("Bạn cần đồng ý cam kết điều khoản y tế trước khi đặt lịch."); return; }
    
    // Check that all services have a chosen slot
    const uncompleted = selectedServices.find(x => !x.selectedSlot);
    if (uncompleted) {
      setBookingError(`Vui lòng chọn khung giờ cho dịch vụ "${uncompleted.service.name}".`);
      return;
    }

    // BR: Phải có đặt phòng lưu trú tại resort mới được đặt dịch vụ spa.
    if ((userBookings || []).length === 0) {
      setBookingError("Quý khách cần có đơn đặt phòng (đang hoạt động hoặc sắp đến) tại resort mới được đặt dịch vụ spa. Vui lòng đặt phòng trước.");
      return;
    }

    // Check room bookings for each item
    for (const item of selectedServices) {
      const effectiveId = item.isFree ? item.matchedPackage?.bookingId : (selectedRoomBookingId ? Number(selectedRoomBookingId) : null);
      if (!effectiveId) {
        setBookingError(`Vui lòng chọn đơn đặt phòng để gắn cho dịch vụ tính phí.`);
        return;
      }
    }

    setIsBooking(true);
    try {
      // Persist consent silently if it was just ticked
      if (consentChecked && !medicalProfile?.explicitConsentSigned) {
        try {
          const updated = await medicalApi.saveMyProfile(
            medicalProfile?.physicalCondition || "",
            medicalProfile?.foodAllergies || "",
            true
          );
          setMedicalProfile(updated);
        } catch (e) { /* non-blocking */ }
      }

      const successes = [];
      for (const item of selectedServices) {
        const roomBookingId = item.isFree ? item.matchedPackage?.bookingId : Number(selectedRoomBookingId);
        
        for (let g = 0; g < item.guestsCount; g++) {
          const payload = {
            spaServiceId: item.service.serviceId,
            startDatetime: item.selectedSlot.startDatetime,
            therapistId: item.selectedSlot.therapistIds?.[g] || item.selectedSlot.therapistId,
            treatmentRoomId: item.selectedSlot.treatmentRoomIds?.[g] || item.selectedSlot.treatmentRoomId,
            isPackageIncluded: item.isFree,
            roomBookingId,
            price: item.isFree ? 0 : item.service.price,
          };
          const result = await spaApi.schedule(payload);
          successes.push({
            ...result,
            serviceName: item.service.name
          });
        }
      }

      setBookingResult({
        ...successes[0],
        successes
      });
    } catch (err) {
      setBookingError(err.message || "Đặt lịch thất bại. Vui lòng thử lại.");
    } finally {
      setIsBooking(false);
    }
  };

  const resetAll = () => {
    setBookingResult(null);
    setStep(1);
    setSelectedServices([]);
    setBookingError("");
    setSelectedRoomBookingId("");
  };

  // ----- Success screen -----------------------------------------------------
  if (bookingResult) {
    const isGroup = bookingResult.successes && bookingResult.successes.length > 1;
    return (
      <div className="max-w-2xl mx-auto bg-white border border-forest-ink/20 p-8 sm:p-12 text-center shadow-xl rounded-2xl relative overflow-hidden animate-fade-in text-black-olive">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-forest-ink via-lemon-zest to-forest-ink" />
        <div className="inline-flex p-4 bg-green-50 text-forest-ink rounded-full mb-6">
          <CheckCircle className="h-12 w-12" />
        </div>
        <h2 className="font-serif text-3xl font-normal text-forest-ink mb-3 uppercase tracking-wide">
          Đặt Lịch Thành Công!
        </h2>
        <p className="text-black-olive/75 text-sm mb-6 font-light leading-relaxed">
          Toàn bộ lịch hẹn trị liệu của quý khách{isGroup ? " và nhóm đi cùng" : ""} đã được xác nhận.
        </p>

        <div className="border border-sage-mist bg-warm-cream/50 text-left p-6 space-y-3.5 mb-6 rounded-xl text-sm max-h-[400px] overflow-y-auto scrollbar-thin">
          {bookingResult.successes ? (
            bookingResult.successes.map((b, idx) => (
              <div key={idx} className="p-3.5 bg-white border border-sage-mist/50 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-dashed border-sage-mist/40">
                  <span className="font-semibold text-forest-ink text-[11px] uppercase">Lịch hẹn {idx + 1}</span>
                  <span className="font-mono font-bold text-forest-ink">SPA-{String(b.spaBookingId).padStart(4, "0")}</span>
                </div>
                <div className="flex justify-between"><span className="text-black-olive/75 font-light">Dịch vụ:</span><span className="font-semibold text-black-olive">{b.serviceName}</span></div>
                <div className="flex justify-between"><span className="text-black-olive/75 font-light">Thời gian:</span><span className="font-semibold text-black-olive">{formatDateLong(b.startDatetime)}</span></div>
                <div className="flex justify-between"><span className="text-black-olive/75 font-light">Kỹ thuật viên:</span><span className="font-semibold text-black-olive">{b.therapistName}</span></div>
                <div className="flex justify-between"><span className="text-black-olive/75 font-light">Phòng:</span><span className="font-semibold text-black-olive">{b.roomName}</span></div>
              </div>
            ))
          ) : null}
        </div>

        <div className="flex items-start gap-2 text-left bg-sage-50 border border-sage-200 rounded-xl p-4 mb-6 text-xs text-black-olive/80">
          <Mail className="w-4 h-4 text-forest-ink shrink-0 mt-0.5" />
          <span>
            Email xác nhận đã được gửi đến <span className="font-semibold text-forest-ink">{currentUser?.email || "hộp thư của bạn"}</span>.
          </span>
        </div>

        <button onClick={resetAll} className="bg-forest-ink text-warm-cream hover:bg-forest-ink/90 px-8 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer">
          Đặt lịch khác
        </button>
      </div>
    );
  }

  const servicesInCat = spaServices.filter((s) => (s.category || "SPA").toUpperCase() === activeCat);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="flex items-center justify-center mb-10">
        {STEP_LABELS.map((label, idx) => {
          const n = idx + 1;
          const done = step > n;
          const active = step === n;
          const canGoBack = n < step;
          return (
            <React.Fragment key={n}>
              <div
                className={`flex items-center gap-2 ${canGoBack ? "cursor-pointer select-none" : ""}`}
                onClick={() => {
                  if (canGoBack) {
                    setStep(n);
                  }
                }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  done ? "bg-forest-ink border-forest-ink text-warm-cream hover:opacity-85"
                  : active ? "border-forest-ink text-forest-ink bg-warm-cream"
                  : "border-sage-mist text-black-olive/40 bg-white"}`}>
                  {done ? <CheckCircle className="w-4 h-4" /> : n}
                </div>
                <span className={`text-[11px] font-semibold uppercase tracking-wider hidden sm:block ${active || done ? "text-forest-ink" : "text-black-olive/40"}`}>{label}</span>
              </div>
              {n < STEP_LABELS.length && <div className={`w-8 sm:w-16 h-0.5 mx-2 ${step > n ? "bg-forest-ink" : "bg-sage-mist"}`} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* STEP 1 - select services */}
      {step === 1 && (
        <div className="bg-warm-cream border border-forest-ink/10 rounded-2xl p-6 sm:p-8 shadow-lg space-y-6 animate-fade-in text-black-olive text-left">
          <div>
            <h3 className="font-serif text-xl font-bold text-forest-ink uppercase tracking-wide">1. Chọn các dịch vụ trị liệu</h3>
            <p className="text-black-olive/70 text-xs mt-1 font-light">Quý khách có thể chọn nhiều dịch vụ khác nhau cho bản thân hoặc nhóm đi cùng.</p>
          </div>

          {/* Categories Tab */}
          <div className="flex border-b border-sage-mist/40 gap-4">
            {CAT_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const active = activeCat === tab.key;
              return (
                <button key={tab.key} type="button" onClick={() => setActiveCat(tab.key)}
                  className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                    active ? "border-forest-ink text-forest-ink" : "border-transparent text-black-olive/55 hover:text-forest-ink"}`}>
                  <TabIcon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </div>

          {servicesInCat.length === 0 ? (
            <p className="text-center text-xs text-black-olive/50 py-10 italic">Chưa có dịch vụ trong nhóm này.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
              {servicesInCat.map((svc) => {
                const isSelected = selectedServices.some(x => x.service.serviceId === svc.serviceId);
                const free = detectPackage(svc, userBookings, allPackages);
                return (
                  <div key={svc.serviceId}
                    className={`text-left p-4 rounded-xl border-2 transition-all flex flex-col gap-2 relative ${
                      isSelected ? "border-forest-ink bg-forest-ink/5 shadow-md" : "border-sage-mist/40 bg-white hover:border-forest-ink/40"
                    }`}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-serif font-semibold text-sm text-black-olive">{svc.name}</span>
                      {free ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700 border border-green-200 shrink-0">Miễn phí theo gói</span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-black-olive/60 font-light line-clamp-2">{svc.description}</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-sage-mist/20 mt-auto">
                      <span className="text-[10px] text-black-olive/60 flex items-center gap-1"><Clock className="w-3 h-3" />{svc.durationMinutes} phút</span>
                      <div className="flex items-center gap-3">
                        {free ? (
                          <span className="text-xs font-bold text-green-700 mr-2">0 đ</span>
                        ) : (
                          <span className="text-xs font-bold text-forest-ink mr-2">{formatPrice(svc.price)}</span>
                        )}
                        <button type="button" onClick={() => toggleService(svc)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
                            isSelected 
                              ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" 
                              : "bg-forest-ink text-warm-cream border-forest-ink hover:bg-forest-ink/90"
                          }`}>
                          {isSelected ? "Bỏ chọn" : "Chọn dịch vụ"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer of Step 1 */}
          {selectedServices.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4 border-t border-sage-mist/40 mt-4 animate-fade-in">
              <div className="text-xs">
                Đã chọn: <span className="font-bold text-forest-ink">{selectedServices.length} dịch vụ</span>
              </div>
              <button type="button" onClick={() => setStep(2)}
                className="bg-forest-ink text-warm-cream hover:bg-forest-ink/90 px-6 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2">
                Tiếp tục chọn thời gian <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2 - date + slot selection per service */}
      {step === 2 && selectedServices.length > 0 && (
        <div className="bg-warm-cream border border-forest-ink/10 rounded-2xl p-6 sm:p-8 shadow-lg space-y-6 animate-fade-in text-black-olive text-left">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-forest-ink uppercase tracking-wide">2. Chọn khung giờ & Số khách</h3>
              <p className="text-black-olive/70 text-xs mt-1 font-light">Cấu hình thời gian phục vụ riêng biệt cho từng dịch vụ đã chọn.</p>
            </div>
            <button type="button" onClick={() => setStep(1)} className="text-[11px] text-forest-ink hover:underline font-semibold flex items-center gap-1 cursor-pointer">
              <ChevronLeft className="w-3.5 h-3.5" /> Quay lại
            </button>
          </div>

          <div className="space-y-6">
            {selectedServices.map((item) => (
              <div key={item.id} className="bg-white border border-sage-mist/60 rounded-xl p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-start pb-2 border-b border-sage-mist/20">
                  <div>
                    <h4 className="font-serif font-semibold text-sm text-forest-ink">{item.service.name}</h4>
                    <p className="text-[10px] text-black-olive/60 mt-0.5">{item.service.durationMinutes} phút</p>
                  </div>
                  {item.isFree && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700 border border-green-200 shrink-0">
                      Miễn phí theo gói
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] font-bold text-forest-ink uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Chọn ngày
                    </span>
                    <input type="date" value={item.date} min={todayStr} max={maxDate}
                      onChange={(e) => updateItemAndFetchSlots(item.id, e.target.value, undefined)}
                      className="w-full px-4 py-2.5 rounded-lg border border-sage-mist bg-white text-xs focus:outline-none focus:border-forest-ink" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-forest-ink uppercase tracking-wider mb-2 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Số lượng khách
                    </span>
                    <input type="number" min={1} max={10} value={item.guestsCount}
                      onChange={(e) => {
                        let val = parseInt(e.target.value, 10);
                        if (isNaN(val) || val < 1) val = "";
                        setSelectedServices(prev => prev.map(x => x.id === item.id ? { ...x, guestsCount: val, selectedSlot: null } : x));
                      }}
                      onBlur={(e) => {
                        let val = parseInt(e.target.value, 10);
                        if (isNaN(val) || val < 1) val = 1;
                        if (val > 10) val = 10;
                        updateItemAndFetchSlots(item.id, undefined, val);
                      }}
                      className="w-full px-4 py-2.5 rounded-lg border border-sage-mist bg-white text-xs focus:outline-none focus:border-forest-ink" />
                  </div>
                </div>

                {item.date && (
                  <div className="space-y-2.5">
                    <span className="block text-[10px] font-bold text-forest-ink uppercase tracking-wider">Khung giờ trống</span>
                    {item.loadingSlots ? (
                      <div className="flex items-center gap-2 py-4 text-xs text-black-olive/60">
                        <Loader2 className="w-4 h-4 animate-spin text-forest-ink" /> Đang tìm khung giờ trống...
                      </div>
                    ) : item.error ? (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {item.error}
                      </div>
                    ) : item.slots.length === 0 ? (
                      <div className="p-3 bg-sage-mist/15 border border-sage-mist/40 text-black-olive/70 text-xs rounded-lg text-center italic">
                        Không còn khung giờ trống đủ tài nguyên trong ngày này. Vui lòng chọn ngày khác hoặc giảm số khách.
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {item.slots.map((slot) => {
                          const isSel = item.selectedSlot?.startDatetime === slot.startDatetime;
                          return (
                            <button key={slot.startDatetime} type="button"
                              onClick={() => {
                                setSelectedServices(prev => prev.map(x => x.id === item.id ? { ...x, selectedSlot: slot } : x));
                              }}
                              className={`py-2 rounded-lg text-xs font-semibold border-2 transition-all cursor-pointer ${
                                isSel ? "border-forest-ink bg-forest-ink text-warm-cream" : "border-sage-mist bg-white text-black-olive hover:border-forest-ink/40"
                              }`}>
                              {slot.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {item.selectedSlot && (
                  <div className="p-4 bg-sage-mist/10 border border-sage-mist/35 rounded-xl space-y-2 text-xs text-left animate-fade-in">
                    <p className="font-bold text-forest-ink uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-forest-ink" />
                      Thông tin khớp nối tự động cho {item.guestsCount} khách:
                    </p>
                    <div className="space-y-2">
                      {Array.from({ length: item.guestsCount }).map((_, idx) => {
                        const tName = item.selectedSlot.therapistNames?.[idx] || item.selectedSlot.therapistName;
                        const rName = item.selectedSlot.roomNames?.[idx] || item.selectedSlot.roomName;
                        return (
                          <div key={idx} className="flex justify-between items-center gap-2 p-2 bg-white border border-sage-mist/20 rounded shadow-sm">
                            <span className="font-semibold text-forest-ink text-[10px]">Khách {idx + 1}:</span>
                            <div className="flex gap-4">
                              <span className="flex items-center gap-1 text-black-olive/80"><User className="w-3.5 h-3.5 text-forest-ink shrink-0" /> {tName}</span>
                              <span className="flex items-center gap-1 text-black-olive/80"><Leaf className="w-3.5 h-3.5 text-forest-ink shrink-0" /> {rName}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-sage-mist/40 gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3.5 border border-forest-ink/30 text-forest-ink text-xs font-semibold uppercase tracking-wider hover:bg-forest-ink/5 transition-all rounded-lg flex items-center cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-1.5" /> Quay lại
            </button>
            <button type="button" 
              onClick={() => setStep(3)} 
              disabled={selectedServices.some(x => !x.selectedSlot)}
              className="bg-forest-ink text-warm-cream hover:bg-forest-ink/90 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2">
              Tiếp tục bước xác nhận <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 - confirm & book */}
      {step === 3 && selectedServices.length > 0 && (
        <div className="bg-warm-cream border border-forest-ink/10 rounded-2xl p-6 sm:p-8 shadow-lg space-y-6 animate-fade-in text-black-olive text-left">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-forest-ink uppercase tracking-wide">3. Xác nhận lịch trình của bạn</h3>
            <button type="button" onClick={() => setStep(2)} className="text-[11px] text-forest-ink hover:underline font-semibold flex items-center gap-1 cursor-pointer">
              <ChevronLeft className="w-3.5 h-3.5" /> Điều chỉnh giờ
            </button>
          </div>

          <div className="border border-sage-mist bg-white rounded-xl p-5 space-y-4 text-sm max-h-[380px] overflow-y-auto scrollbar-thin">
            <h4 className="font-bold text-xs uppercase tracking-wider text-forest-ink">Tóm tắt lịch đặt trị liệu</h4>
            {selectedServices.map((item, idx) => (
              <div key={item.id} className="p-4 bg-warm-cream/30 border border-sage-mist/40 rounded-xl space-y-3">
                <div className="flex justify-between items-start pb-2 border-b border-dashed border-sage-mist/30">
                  <span className="font-semibold text-sm text-black-olive">{idx + 1}. {item.service.name}</span>
                  <span className="font-bold text-forest-ink text-xs">
                    {item.isFree ? "Miễn phí (Gói)" : formatPrice(item.service.price * item.guestsCount)}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-black-olive/75">
                  <p><span className="font-semibold text-black-olive">Thời gian:</span> {formatDateLong(item.selectedSlot.startDatetime)}</p>
                  <p><span className="font-semibold text-black-olive">Số lượng khách:</span> {item.guestsCount} người</p>
                </div>
                <div className="space-y-1.5 pl-2.5 border-l-2 border-forest-ink/30 text-xs">
                  <span className="text-[10px] font-bold text-black-olive/60 uppercase block">Chi tiết phân công chuyên gia:</span>
                  {Array.from({ length: item.guestsCount }).map((_, gIdx) => {
                    const tName = item.selectedSlot.therapistNames?.[gIdx] || item.selectedSlot.therapistName;
                    const rName = item.selectedSlot.roomNames?.[gIdx] || item.selectedSlot.roomName;
                    return (
                      <div key={gIdx} className="flex justify-between bg-white/50 p-1.5 rounded">
                        <span className="text-black-olive/70 font-light">Khách {gIdx + 1}:</span>
                        <span className="font-semibold text-black-olive">{tName} (Phòng {rName})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex justify-between pt-3 border-t border-dashed border-sage-mist text-base font-serif">
              <span className="font-bold text-black-olive">Tổng chi phí thanh toán:</span>
              <span className="font-bold text-forest-ink">
                {formatPrice(selectedServices.reduce((sum, item) => sum + (item.isFree ? 0 : item.service.price * item.guestsCount), 0))}
              </span>
            </div>
          </div>

          {/* BR: Liên kết mã đặt phòng lưu trú */}
          <div className="p-4 bg-warm-cream/60 rounded-xl border border-sage-mist/50 space-y-2">
            <span className="block text-[10px] font-bold text-forest-ink uppercase tracking-wider">
              Mã đặt phòng lưu trú
            </span>
            {selectedServices.every(x => x.isFree) ? (
              <p className="text-xs text-green-700 font-medium">
                Tất cả các dịch vụ đã chọn đều được bao gồm miễn phí trong gói nghỉ dưỡng của bạn.
              </p>
            ) : (userBookings || []).length === 0 ? (
              <p className="text-xs text-red-700 font-medium">
                Quý khách cần có đơn đặt phòng tại resort mới được đặt dịch vụ spa.
                <Link to="/dat-lich" className="underline font-semibold ml-1 hover:text-red-800">Đặt phòng ngay &rarr;</Link>
              </p>
            ) : (
              <select
                value={selectedRoomBookingId}
                onChange={(e) => { setSelectedRoomBookingId(e.target.value); setBookingError(""); }}
                className="w-full px-3 py-2 rounded-md border border-sage-mist bg-white text-xs focus:outline-none focus:border-forest-ink cursor-pointer"
              >
                <option value="">-- Chọn đơn đặt phòng để đính kèm dịch vụ --</option>
                {userBookings.map((b) => (
                  <option key={b.bookingId} value={b.bookingId}>
                    BK-{String(b.bookingId).padStart(4, "0")} ({b.packageName || "Tiêu chuẩn"})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Consent */}
          <div className="p-4 bg-sage-50 rounded-xl border border-sage-200">
            {medicalProfile == null ? (
              <div className="text-red-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Chưa có Hồ sơ Sức khỏe:</span> quý khách cần hoàn thành hồ sơ y tế trước khi đặt hẹn.
                  <Link to="/ho-so-suc-khoe" className="underline font-semibold block mt-1 hover:text-red-700">Tạo hồ sơ sức khỏe ngay &rarr;</Link>
                </div>
              </div>
            ) : (
              <label className="flex items-start gap-3 cursor-pointer text-xs text-black-olive/80 select-none">
                <input type="checkbox" checked={consentChecked}
                  onChange={(e) => { setConsentChecked(e.target.checked); setBookingError(""); }}
                  className="mt-0.5 rounded border-sage-mist focus:ring-forest-ink text-forest-ink" />
                <span>Đồng ý cam kết điều khoản y tế và cho phép kỹ thuật viên truy cập hồ sơ thể trạng để đảm bảo an toàn trị liệu (Nghị định 13/2023/NĐ-CP).</span>
              </label>
            )}
          </div>

          {bookingError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {bookingError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full sm:w-auto px-6 py-4 border border-forest-ink/30 text-forest-ink text-xs font-semibold uppercase tracking-wider hover:bg-forest-ink/5 transition-all rounded-lg flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-1.5" /> Quay lại
            </button>
            <button type="button" onClick={handleBook} disabled={isBooking || medicalProfile == null || !consentChecked || (userBookings || []).length === 0 || (!selectedServices.every(x => x.isFree) && !selectedRoomBookingId)}
              className="flex-1 bg-forest-ink text-warm-cream hover:bg-forest-ink/90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs py-4 rounded-lg uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center justify-center gap-2">
              {isBooking ? (<><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý đặt tất cả...</>) : (<><CheckCircle className="w-4 h-4" /> Xác nhận đặt lịch ngay</>)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
