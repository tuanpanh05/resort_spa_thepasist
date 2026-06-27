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
  const [selectedService, setSelectedService] = useState(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  // BR: Spa services require an active resort room booking to attach the folio.
  const [selectedRoomBookingId, setSelectedRoomBookingId] = useState("");

  const [medicalProfile, setMedicalProfile] = useState(initProfile);
  const [consentChecked, setConsentChecked] = useState(initProfile?.explicitConsentSigned || false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => { setMedicalProfile(initProfile); setConsentChecked(initProfile?.explicitConsentSigned || false); }, [initProfile]);

  const todayStr = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split("T")[0];

  const matchedPackage = selectedService ? detectPackage(selectedService, userBookings, allPackages) : null;
  const isFree = !!matchedPackage;

  // Fetch slots when service + date are chosen
  useEffect(() => {
    if (!selectedService || !selectedDate) return;
    setSlots([]); setSelectedSlot(null); setSlotsError(""); setLoadingSlots(true);
    spaApi.getAvailableSlots(selectedService.serviceId, selectedDate)
      .then((data) => setSlots(data || []))
      .catch((err) => setSlotsError(err.message || "Không thể tải khung giờ trống."))
      .finally(() => setLoadingSlots(false));
  }, [selectedService, selectedDate]);

  const goService = (svc) => { setSelectedService(svc); setSelectedDate(""); setSlots([]); setSelectedSlot(null); setStep(2); };

  const handleBook = async () => {
    setBookingError("");
    if (!consentChecked) { setBookingError("Bạn cần đồng ý cam kết điều khoản y tế trước khi đặt lịch."); return; }
    if (!selectedSlot) { setBookingError("Vui lòng chọn khung giờ trị liệu."); return; }

    // BR: Phải có đặt phòng lưu trú tại resort mới được đặt dịch vụ spa.
    if ((userBookings || []).length === 0) {
      setBookingError("Bạn cần có đặt phòng lưu trú tại resort trước khi đặt dịch vụ spa. Vui lòng đặt phòng trước.");
      return;
    }
    // Free (package) booking đã gắn sẵn mã đặt phòng theo gói; booking tính phí cần chọn mã đặt phòng.
    const effectiveRoomBookingId = isFree ? matchedPackage.bookingId : (selectedRoomBookingId ? Number(selectedRoomBookingId) : null);
    if (!effectiveRoomBookingId) {
      setBookingError("Vui lòng chọn mã đặt phòng lưu trú để gắn dịch vụ spa.");
      return;
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
      const payload = {
        spaServiceId: selectedService.serviceId,
        startDatetime: selectedSlot.startDatetime,
        therapistId: selectedSlot.therapistId,
        treatmentRoomId: selectedSlot.treatmentRoomId,
        isPackageIncluded: isFree,
        roomBookingId: effectiveRoomBookingId,
        price: isFree ? 0 : selectedService.price,
      };
      const result = await spaApi.schedule(payload);
      setBookingResult(result);
    } catch (err) {
      setBookingError(err.message || "Đặt lịch thất bại. Vui lòng thử lại.");
    } finally {
      setIsBooking(false);
    }
  };

  const resetAll = () => {
    setBookingResult(null); setStep(1); setSelectedService(null);
    setSelectedDate(""); setSlots([]); setSelectedSlot(null); setBookingError(""); setSelectedRoomBookingId("");
  };

  // ----- Success screen -----------------------------------------------------
  if (bookingResult) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-forest-ink/20 p-8 sm:p-12 text-center shadow-xl rounded-2xl relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-forest-ink via-lemon-zest to-forest-ink" />
        <div className="inline-flex p-4 bg-green-50 text-forest-ink rounded-full mb-6">
          <CheckCircle className="h-12 w-12" />
        </div>
        <h2 className="font-serif text-3xl font-normal text-forest-ink mb-3 uppercase tracking-wide">
          Đặt Lịch Thành Công!
        </h2>
        <p className="text-black-olive/75 text-sm mb-6 font-light leading-relaxed">
          Lịch hẹn trị liệu của quý khách đã được xác nhận.
        </p>

        <div className="border border-sage-mist bg-warm-cream/50 text-left p-6 space-y-3 mb-6 rounded-xl text-sm">
          <div className="flex justify-between items-center pb-3 border-b border-sage-mist">
            <span className="font-bold text-[10px] text-black-olive/60 uppercase tracking-wider">Mã đặt hẹn:</span>
            <span className="text-forest-ink font-mono font-bold text-lg">SPA-{String(bookingResult.spaBookingId).padStart(4, "0")}</span>
          </div>
          <div className="flex justify-between"><span className="text-black-olive/70 font-light">Dịch vụ:</span><span className="font-semibold text-black-olive">{bookingResult.serviceName}</span></div>
          <div className="flex justify-between"><span className="text-black-olive/70 font-light">Thời gian:</span><span className="font-semibold text-black-olive">{formatDateLong(bookingResult.startDatetime)}</span></div>
          <div className="flex justify-between"><span className="text-black-olive/70 font-light">Chuyên gia:</span><span className="font-semibold text-black-olive">{bookingResult.therapistName}</span></div>
          <div className="flex justify-between"><span className="text-black-olive/70 font-light">Phòng trị liệu:</span><span className="font-semibold text-black-olive">{bookingResult.roomName}</span></div>
          <div className="flex justify-between pt-2 border-t border-dashed border-sage-mist">
            <span className="text-black-olive/70 font-light">Hình thức:</span>
            <span className="font-semibold text-forest-ink">{bookingResult.isPackageIncluded ? "Miễn phí theo gói" : formatPrice(bookingResult.priceAtBooking)}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-left bg-sage-50 border border-sage-200 rounded-xl p-4 mb-6 text-xs text-black-olive/80">
          <Mail className="w-4 h-4 text-forest-ink shrink-0 mt-0.5" />
          <span>
            Email xác nhận đã được gửi đến <span className="font-semibold text-forest-ink">{currentUser?.email || "hộp thư của bạn"}</span>.
            Chúng tôi sẽ gửi thêm email nhắc lịch trước giờ hẹn 1 tiếng.
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
    <div className="max-w-4xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center justify-center mb-10">
        {STEP_LABELS.map((label, idx) => {
          const n = idx + 1;
          const done = step > n;
          const active = step === n;
          return (
            <React.Fragment key={n}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  done ? "bg-forest-ink border-forest-ink text-warm-cream"
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

      {/* STEP 1 - service */}
      {step === 1 && (
        <div className="bg-warm-cream border border-forest-ink/10 rounded-2xl p-6 sm:p-8 shadow-lg space-y-6 animate-fade-in">
          <div>
            <h3 className="font-serif text-xl font-bold text-forest-ink uppercase tracking-wide">1. Chọn dịch vụ trị liệu</h3>
            <p className="text-black-olive/70 text-xs mt-1 font-light">Chọn một dịch vụ bạn muốn trải nghiệm.</p>
          </div>
          <div className="flex border-b border-sage-mist/40 gap-4 sm:gap-6 pb-2 overflow-x-auto scrollbar-none">
            {CAT_TABS.map((c) => {
              const Icon = c.icon;
              return (
                <button key={c.key} type="button" onClick={() => setActiveCat(c.key)}
                  className={`pb-2 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeCat === c.key ? "border-forest-ink text-forest-ink" : "border-transparent text-black-olive/40 hover:text-forest-ink/65"}`}>
                  <Icon className="w-3.5 h-3.5" /> {c.label}
                </button>
              );
            })}
          </div>

          {servicesInCat.length === 0 ? (
            <p className="text-center text-xs text-black-olive/50 py-10 italic">Chưa có dịch vụ trong nhóm này.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
              {servicesInCat.map((svc) => {
                const free = detectPackage(svc, userBookings, allPackages);
                return (
                  <button key={svc.serviceId} type="button" onClick={() => goService(svc)}
                    className="text-left p-4 rounded-xl border-2 border-sage-mist/40 bg-white hover:border-forest-ink/40 hover:shadow-md transition-all cursor-pointer group flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-serif font-semibold text-sm text-black-olive group-hover:text-forest-ink">{svc.name}</span>
                      {free ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700 border border-green-200 shrink-0">Miễn phí theo gói</span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-black-olive/60 font-light line-clamp-2">{svc.description}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-sage-mist/20 mt-auto">
                      <span className="text-[10px] text-black-olive/60 flex items-center gap-1"><Clock className="w-3 h-3" />{svc.durationMinutes} phút</span>
                      {free ? (
                        <span className="text-xs font-bold text-green-700">0 đ</span>
                      ) : (
                        <span className="text-xs font-bold text-forest-ink">{formatPrice(svc.price)}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STEP 2 - date + slot */}
      {step === 2 && selectedService && (
        <div className="bg-warm-cream border border-forest-ink/10 rounded-2xl p-6 sm:p-8 shadow-lg space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-forest-ink uppercase tracking-wide">2. Chọn khung giờ</h3>
              <p className="text-black-olive/70 text-xs mt-1 font-light">Dịch vụ: <span className="font-semibold text-forest-ink">{selectedService.name}</span> · {selectedService.durationMinutes} phút</p>
            </div>
            <button type="button" onClick={() => setStep(1)} className="text-[11px] text-forest-ink hover:underline font-semibold flex items-center gap-1 cursor-pointer">
              <ChevronLeft className="w-3.5 h-3.5" /> Đổi dịch vụ
            </button>
          </div>

          <div>
            <span className="block text-[10px] font-bold text-forest-ink uppercase tracking-wider mb-2 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Chọn ngày</span>
            <input type="date" value={selectedDate} min={todayStr} max={maxDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-64 px-4 py-2.5 rounded-lg border border-sage-mist bg-white text-xs focus:outline-none focus:border-forest-ink" />
          </div>

          {selectedDate && (
            <div>
              <span className="block text-[10px] font-bold text-forest-ink uppercase tracking-wider mb-3">Khung giờ trống</span>
              {loadingSlots ? (
                <div className="flex items-center gap-2 py-6 text-xs text-black-olive/60"><Loader2 className="w-4 h-4 animate-spin text-forest-ink" /> Đang tìm khung giờ còn trống...</div>
              ) : slotsError ? (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{slotsError}</div>
              ) : slots.length === 0 ? (
                <div className="p-4 bg-sage-mist/15 border border-sage-mist/40 text-black-olive/70 text-xs rounded-lg text-center italic">
                  Không còn khung giờ trống trong ngày này. Vui lòng chọn ngày khác.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {slots.map((slot) => {
                    const sel = selectedSlot && selectedSlot.startDatetime === slot.startDatetime;
                    return (
                      <button key={slot.startDatetime} type="button" onClick={() => setSelectedSlot(slot)}
                        className={`py-2.5 rounded-lg text-xs font-semibold border-2 transition-all cursor-pointer ${
                          sel ? "border-forest-ink bg-forest-ink text-warm-cream" : "border-sage-mist bg-white text-black-olive hover:border-forest-ink/40"}`}>
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {selectedSlot && (
            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => setStep(3)}
                className="bg-forest-ink text-warm-cream hover:bg-forest-ink/90 px-6 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2">
                Tiếp tục <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 3 - confirm */}
      {step === 3 && selectedService && selectedSlot && (
        <div className="bg-warm-cream border border-forest-ink/10 rounded-2xl p-6 sm:p-8 shadow-lg space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-forest-ink uppercase tracking-wide">3. Xác nhận & đặt lịch</h3>
            <button type="button" onClick={() => setStep(2)} className="text-[11px] text-forest-ink hover:underline font-semibold flex items-center gap-1 cursor-pointer">
              <ChevronLeft className="w-3.5 h-3.5" /> Đổi giờ
            </button>
          </div>

          <div className="border border-sage-mist bg-white rounded-xl p-5 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-black-olive/70 font-light">Dịch vụ:</span><span className="font-semibold text-black-olive">{selectedService.name}</span></div>
            <div className="flex justify-between"><span className="text-black-olive/70 font-light">Thời gian:</span><span className="font-semibold text-black-olive">{formatDateLong(selectedSlot.startDatetime)}</span></div>
            <div className="flex justify-between"><span className="text-black-olive/70 font-light flex items-center gap-1"><User className="w-3.5 h-3.5" />Chuyên gia:</span><span className="font-semibold text-black-olive">{selectedSlot.therapistName}</span></div>
            <div className="flex justify-between"><span className="text-black-olive/70 font-light flex items-center gap-1"><Leaf className="w-3.5 h-3.5" />Phòng:</span><span className="font-semibold text-black-olive">{selectedSlot.roomName}</span></div>
            <div className="flex justify-between pt-2 border-t border-dashed border-sage-mist">
              <span className="text-black-olive/70 font-light">Chi phí:</span>
              {isFree ? (
                <span className="font-bold text-green-700 flex flex-col items-end">
                  <span className="text-[10px] line-through text-black-olive/40 font-light">{formatPrice(selectedService.price)}</span>
                  Miễn phí theo gói {matchedPackage.packageName}
                </span>
              ) : (
                <span className="font-bold text-forest-ink">{formatPrice(selectedService.price)} <span className="text-[10px] font-light text-black-olive/50">(tính vào hóa đơn)</span></span>
              )}
            </div>
          </div>

          {/* BR: Liên kết mã đặt phòng lưu trú (bắt buộc) */}
          <div className="p-4 bg-warm-cream/60 rounded-xl border border-sage-mist/50 space-y-2">
            <span className="block text-[10px] font-bold text-forest-ink uppercase tracking-wider">
              Mã đặt phòng lưu trú
            </span>
            {isFree ? (
              <p className="text-xs text-green-700 font-medium">
                Đã gắn với đơn đặt phòng BK-{String(matchedPackage.bookingId).padStart(4, "0")} (miễn phí theo gói {matchedPackage.packageName}).
              </p>
            ) : (userBookings || []).length === 0 ? (
              <p className="text-xs text-red-700 font-medium">
                Bạn cần có đặt phòng lưu trú tại resort trước khi đặt dịch vụ spa.
                <Link to="/dat-lich" className="underline font-semibold ml-1 hover:text-red-800">Đặt phòng ngay &rarr;</Link>
              </p>
            ) : (
              <select
                value={selectedRoomBookingId}
                onChange={(e) => { setSelectedRoomBookingId(e.target.value); setBookingError(""); }}
                className="w-full px-3 py-2 rounded-md border border-sage-mist bg-white text-xs focus:outline-none focus:border-forest-ink"
              >
                <option value="">-- Chọn đơn đặt phòng --</option>
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
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{bookingError}</div>
          )}

          <button type="button" onClick={handleBook} disabled={isBooking || medicalProfile == null || !consentChecked || (userBookings || []).length === 0 || (!isFree && !selectedRoomBookingId)}
            className="w-full bg-forest-ink text-warm-cream hover:bg-forest-ink/90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs py-4 rounded-lg uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center justify-center gap-2">
            {isBooking ? (<><Loader2 className="w-4 h-4 animate-spin" /> Đang đặt lịch...</>) : (<><Sparkles className="w-4 h-4" /> Đặt lịch ngay</>)}
          </button>
        </div>
      )}
    </div>
  );
}
