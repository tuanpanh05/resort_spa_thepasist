import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { radius } from "../styles/designSystem";

// Sub-components
import BookingGuestInfo from "../components/booking/BookingGuestInfo";
import BookingHealthProfile from "../components/booking/BookingHealthProfile";
import BookingVillaServices from "../components/booking/BookingVillaServices";
import BookingConfirmation from "../components/booking/BookingConfirmation";
import BookingPayment from "../components/booking/BookingPayment";
import BookingSuccess from "../components/booking/BookingSuccess";
import BookingSummaryWidget from "../components/booking/BookingSummaryWidget";

// Data
import { villasList, servicesList } from "../data/bookingData";

export default function BookingPage() {
  // Wizard Step State: 1 = Guest Info, 2 = Select Villa & Services, 3 = Review, 4 = Payment QR
  const [step, setStep] = useState(1);

  // Status Trackers
  const [bookingStatus, setBookingStatus] = useState("DRAFT"); // DRAFT -> PENDING_PAYMENT -> CONFIRMED
  const [paymentStatus, setPaymentStatus] = useState("UNPAID"); // UNPAID -> PENDING -> PAID

  // Step 1: Guest Information
  const [guestInfo, setGuestInfo] = useState({
    fullName: "",
    phone: "",
    email: "",
    checkInDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
    checkOutDate: new Date(Date.now() + 172800000).toISOString().split("T")[0], // Day after tomorrow
    guestsCount: 2,
    healthNote: "",
    specialRequest: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Step 2: Health Profile
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [otherAllergy, setOtherAllergy] = useState("");
  const [dietaryPreference, setDietaryPreference] = useState("omnivore");
  const [physicalCondition, setPhysicalCondition] = useState("");
  const [consentDataProcessing, setConsentDataProcessing] = useState(false);
  const [consentSharing, setConsentSharing] = useState(false);

  const toggleAllergy = (key) => {
    setSelectedAllergies((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Step 3: Selected Room & Services
  const [selectedVillaId, setSelectedVillaId] = useState(villasList[0].id);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);

  // Loading States
  const [isConfirming, setIsConfirming] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  // Calculates nights between check-in and check-out
  const [nightsCount, setNightsCount] = useState(1);

  useEffect(() => {
    const checkIn = new Date(guestInfo.checkInDate);
    const checkOut = new Date(guestInfo.checkOutDate);
    if (checkOut > checkIn) {
      const diffTime = Math.abs(checkOut - checkIn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNightsCount(diffDays);
    } else {
      setNightsCount(0);
    }
  }, [guestInfo.checkInDate, guestInfo.checkOutDate]);

  // Selected Villa Info
  const selectedVilla = villasList.find((v) => v.id === selectedVillaId);

  // Calculates Pricing Breakdown
  const villaTotal = selectedVilla ? selectedVilla.price * nightsCount : 0;
  
  let servicesTotal = 0;
  const selectedServices = servicesList.filter((s) => selectedServiceIds.includes(s.id));
  
  selectedServices.forEach((s) => {
    if (s.type === "per-guest") {
      servicesTotal += s.price * guestInfo.guestsCount;
    } else if (s.type === "per-guest-per-night") {
      servicesTotal += s.price * guestInfo.guestsCount * nightsCount;
    } else {
      // flat fee
      servicesTotal += s.price;
    }
  });

  const totalAmount = villaTotal + servicesTotal;
  const depositAmount = totalAmount * 0.3; // 30% deposit
  const remainingAmount = totalAmount * 0.7; // 70% paid at counter

  // Form input validation for Step 1
  const validateStep1 = () => {
    const errors = {};
    if (!guestInfo.fullName.trim()) errors.fullName = "Vui lòng nhập họ và tên.";
    if (!guestInfo.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!/^[0-9+-\s]{9,12}$/.test(guestInfo.phone)) {
      errors.phone = "Số điện thoại không hợp lệ.";
    }
    if (!guestInfo.email.trim()) {
      errors.email = "Vui lòng nhập địa chỉ email.";
    } else if (!/\S+@\S+\.\S+/.test(guestInfo.email)) {
      errors.email = "Địa chỉ email không hợp lệ.";
    }

    const checkIn = new Date(guestInfo.checkInDate);
    const checkOut = new Date(guestInfo.checkOutDate);
    
    if (checkOut <= checkIn) {
      errors.checkOutDate = "Ngày trả phòng phải sau ngày nhận phòng.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    if (!consentDataProcessing || !consentSharing) {
      errors.consent = "Bạn phải đồng ý với cả hai điều khoản xử lý và chia sẻ dữ liệu sức khỏe để tiếp tục (theo Nghị định 356/2025/NĐ-CP).";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigations between steps
  const handleNextStep = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    if (step > 1 && step < 5) {
      setStep(step - 1);
    }
  };

  // Submit Draft and go to Payment
  const handleConfirmBooking = () => {
    setIsConfirming(true);
    setTimeout(() => {
      setIsConfirming(false);
      setBookingStatus("PENDING_PAYMENT");
      setPaymentStatus("PENDING");
      setStep(5);
    }, 1800);
  };

  // Verify deposit payment QR code
  const handleVerifyPayment = () => {
    setIsVerifyingPayment(true);
    setTimeout(() => {
      setIsVerifyingPayment(false);
      setBookingStatus("CONFIRMED");
      setPaymentStatus("PAID");
    }, 2000);
  };

  // Toggle selected service add-ons
  const handleToggleService = (srvId) => {
    setSelectedServiceIds((prev) =>
      prev.includes(srvId) ? prev.filter((id) => id !== srvId) : [...prev, srvId]
    );
  };

  return (
    <div className="bg-[#fafbfa] min-h-screen pt-28 pb-20 font-sans text-sage-950">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        
        {/* Navigation Breadcrumbs */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-semibold tracking-wider text-sage-600 hover:text-primary-800 transition-colors uppercase"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại trang chủ
          </Link>
          <span className="text-[10px] bg-primary-100/50 border border-primary-200 text-primary-900 px-3 py-1 font-semibold uppercase tracking-wider">
            Booking Wizard
          </span>
        </div>

        {/* Page Header Title */}
        <div className="text-center mb-12">
          <h1 className="text-resort-title text-sage-950 mb-3 uppercase tracking-wide">
            Đặt Lịch Trị Liệu & Nghỉ Dưỡng
          </h1>
          <p className="text-resort-desc max-w-lg mx-auto">
            Khởi động hành trình phục hồi thân-tâm tại không gian xanh thanh bình của Ngũ Sơn Resort.
          </p>
        </div>

        {/* Wizard Header (Steps Progress Bar) */}
        {bookingStatus !== "CONFIRMED" && (
          <div className="mb-12 max-w-4xl mx-auto">
            <div className="flex items-center justify-between relative">
              
              {/* Progress Line */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary-100 z-0" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary-600 transition-all duration-500 z-0"
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              />

              {/* Step indicator node points */}
              {[
                { number: 1, label: "Thông tin khách" },
                { number: 2, label: "Hồ sơ sức khỏe" },
                { number: 3, label: "Chọn Villa & Dịch vụ" },
                { number: 4, label: "Xác nhận đơn" },
                { number: 5, label: "Thanh toán cọc" },
              ].map((s) => {
                const isActive = step >= s.number;
                const isCurrent = step === s.number;
                return (
                  <div key={s.number} className="flex flex-col items-center z-10">
                    <div
                      className={`h-9 w-9 flex items-center justify-center font-semibold text-xs transition-all duration-300 ${
                        isActive
                          ? "bg-primary-800 text-white border-2 border-primary-800"
                          : "bg-white text-sage-400 border-2 border-primary-100"
                      } ${isCurrent ? "scale-110 shadow-md ring-4 ring-primary-100" : ""}`}
                    >
                      {step > s.number ? <Check className="h-4 w-4" /> : s.number}
                    </div>
                    <span
                      className={`mt-2.5 text-resort-stepper transition-colors duration-300 hidden md:block ${
                        isActive ? "text-sage-950 font-medium" : "text-sage-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP PANELS CONTAINER */}
        {bookingStatus === "CONFIRMED" ? (
          <BookingSuccess
            guestInfo={guestInfo}
            nightsCount={nightsCount}
            selectedVilla={selectedVilla}
            selectedServices={selectedServices}
            totalAmount={totalAmount}
            depositAmount={depositAmount}
            remainingAmount={remainingAmount}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 8 Columns: Dynamic Step Form Panel */}
            <div className={`lg:col-span-8 bg-white border border-primary-100 p-6 sm:p-8 shadow-xs ${radius.card}`}>
              
              {step === 1 && (
                <BookingGuestInfo
                  guestInfo={guestInfo}
                  setGuestInfo={setGuestInfo}
                  formErrors={formErrors}
                  setFormErrors={setFormErrors}
                  onNext={handleNextStep}
                />
              )}

              {step === 2 && (
                <BookingHealthProfile
                  formErrors={formErrors}
                  consentDataProcessing={consentDataProcessing}
                  setConsentDataProcessing={setConsentDataProcessing}
                  consentSharing={consentSharing}
                  setConsentSharing={setConsentSharing}
                  dietaryPreference={dietaryPreference}
                  setDietaryPreference={setDietaryPreference}
                  selectedAllergies={selectedAllergies}
                  toggleAllergy={toggleAllergy}
                  otherAllergy={otherAllergy}
                  setOtherAllergy={setOtherAllergy}
                  physicalCondition={physicalCondition}
                  setPhysicalCondition={setPhysicalCondition}
                  onPrev={handlePrevStep}
                  onNext={handleNextStep}
                />
              )}

              {step === 3 && (
                <BookingVillaServices
                  villasList={villasList}
                  servicesList={servicesList}
                  selectedVillaId={selectedVillaId}
                  setSelectedVillaId={setSelectedVillaId}
                  selectedServiceIds={selectedServiceIds}
                  handleToggleService={handleToggleService}
                  onPrev={handlePrevStep}
                  onNext={handleNextStep}
                />
              )}

              {step === 4 && (
                <BookingConfirmation
                  guestInfo={guestInfo}
                  nightsCount={nightsCount}
                  dietaryPreference={dietaryPreference}
                  selectedAllergies={selectedAllergies}
                  otherAllergy={otherAllergy}
                  physicalCondition={physicalCondition}
                  selectedVilla={selectedVilla}
                  selectedServices={selectedServices}
                  villaTotal={villaTotal}
                  isConfirming={isConfirming}
                  onPrev={handlePrevStep}
                  onConfirm={handleConfirmBooking}
                />
              )}

              {step === 5 && (
                <BookingPayment
                  guestInfo={guestInfo}
                  depositAmount={depositAmount}
                  isVerifyingPayment={isVerifyingPayment}
                  onVerify={handleVerifyPayment}
                />
              )}
            </div>

            {/* Right 4 Columns: Dynamic Booking Bill Summary Widget */}
            <BookingSummaryWidget
              nightsCount={nightsCount}
              selectedServices={selectedServices}
              guestInfo={guestInfo}
              bookingStatus={bookingStatus}
              paymentStatus={paymentStatus}
              villaTotal={villaTotal}
              totalAmount={totalAmount}
              depositAmount={depositAmount}
              remainingAmount={remainingAmount}
            />
          </div>
        )}
      </div>
    </div>
  );
}
