import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { colors, radius, shadows } from "../styles/designSystem";
import axiosClient from "../api/axiosClient";
import { medicalApi, userApi } from "../api";

import { villasList, servicesList } from "../constants/booking";
import { detectAllergens } from "../utils/health";

import BookingWizardHeader from "../components/booking/BookingWizardHeader";
import GuestInfoStep from "../components/booking/GuestInfoStep";
import HealthProfileStep from "../components/booking/HealthProfileStep";
import VillaSelectionStep from "../components/booking/VillaSelectionStep";
import MealSelectionStep from "../components/booking/MealSelectionStep";
import ConfirmationStep from "../components/booking/ConfirmationStep";
import BookingBillSummary from "../components/booking/BookingBillSummary";
import BookingSuccess from "../components/booking/BookingSuccess";
import PaymentStep from "../components/booking/PaymentStep";

export default function BookingPage() {
  const navigate = useNavigate();

  // Wizard Step State: 1 = Guest Info, 2 = Select Villa & Services, 3 = Review, 4 = Payment QR
  const [step, setStep] = useState(1);

  const [createdInvoiceId, setCreatedInvoiceId] = useState(null);
  const [createdBookingId, setCreatedBookingId] = useState(null);

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
  const [selectedVillaId, setSelectedVillaId] = useState(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);

  // Step 4: Meal Selections { "yyyy-MM-dd": { "Breakfast": { foodId: qty }, ... } }
  const [mealSelections, setMealSelections] = useState({});
  const [selectedMealDate, setSelectedMealDate] = useState("");
  const [mealBookingDays, setMealBookingDays] = useState([]);

  // Copy helper
  const [copiedField, setCopiedField] = useState(null);

  // Loading States
  const [isConfirming, setIsConfirming] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  // Live Menu Status from Chef
  const [packageMenuItems, setPackageMenuItems] = useState([]);

  useEffect(() => {
    const fetchMenuStatus = async () => {
      try {
        const res = await axiosClient.get("/chef/menu");
        const validDishes = res.data.filter(item =>
          item.enabled !== false &&
          item.isTodayMenu !== false &&
          item.isPackageIncluded !== false
        );

        const mappedDishes = validDishes.map(item => ({
          foodId: item.foodId,
          dishName: item.name,
          description: item.description,
          price: item.price,
          dietaryTags: item.dietaryTags || "",
          allergens: item.allergens || [],
          image: item.image,
          isPackageIncluded: item.isPackageIncluded,
          periods: item.periods || ["Lunch"],
          availableDays: item.availableDays ? item.availableDays.split(",").map(Number) : [0, 1, 2, 3, 4, 5, 6]
        }));

        setPackageMenuItems(mappedDishes);
      } catch (err) {
        console.error("Failed to fetch live menu status", err);
      }
    };
    fetchMenuStatus();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;
      try {
        const u = await userApi.getProfile();
        if (u) {
          setGuestInfo((prev) => ({
            ...prev,
            fullName: u.fullName || prev.fullName,
            phone: u.phone || prev.phone,
            email: u.email || prev.email,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch user profile for booking info", err);
      }
    };

    const fetchHealthProfile = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;
      try {
        const p = await medicalApi.getMyProfile();
        if (p && p.explicitConsentSigned) {
          setConsentDataProcessing(true);
          setConsentSharing(true);
          if (p.foodAllergies) {
            try {
              const parsed = JSON.parse(p.foodAllergies);
              setSelectedAllergies(parsed.selected || []);
              setOtherAllergy(parsed.other || "");
              setDietaryPreference(parsed.diet || "omnivore");
            } catch {
              setOtherAllergy(p.foodAllergies);
            }
          }
          if (p.physicalCondition) {
            setPhysicalCondition(p.physicalCondition);
          }
        }
      } catch (err) {
        console.error("Failed to fetch medical profile for booking info", err);
      }
    };

    fetchUserProfile();
    fetchHealthProfile();
  }, []);

  const [nightsCount, setNightsCount] = useState(1);

  useEffect(() => {
    const checkIn = new Date(guestInfo.checkInDate);
    const checkOut = new Date(guestInfo.checkOutDate);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn) {
      setNightsCount(0);
      return;
    }

    const diffMs = checkOut.getTime() - checkIn.getTime();
    setNightsCount(Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }, [guestInfo.checkInDate, guestInfo.checkOutDate]);

  useEffect(() => {
    const checkIn = new Date(guestInfo.checkInDate);
    const checkOut = new Date(guestInfo.checkOutDate);
    if (checkOut > checkIn) {
      const days = [];
      let curr = new Date(checkIn);
      while (curr <= checkOut) {
        days.push(curr.toISOString().split("T")[0]);
        curr.setDate(curr.getDate() + 1);
      }
      setMealBookingDays(days);
      if (days.length > 0 && (!selectedMealDate || !days.includes(selectedMealDate))) {
        setSelectedMealDate(days[0]);
      }
    } else {
      setMealBookingDays([]);
    }
  }, [guestInfo.checkInDate, guestInfo.checkOutDate]);

  const selectedVilla = villasList.find((v) => v.id === selectedVillaId);
  const villaTotal = selectedVilla ? selectedVilla.price * nightsCount : 0;

  let servicesTotal = 0;
  const selectedServices = servicesList.filter((s) => selectedServiceIds.includes(s.id));
  selectedServices.forEach((s) => {
    if (s.type === "per-guest") {
      servicesTotal += s.price * guestInfo.guestsCount;
    } else if (s.type === "per-guest-per-night") {
      servicesTotal += s.price * guestInfo.guestsCount * nightsCount;
    } else {
      servicesTotal += s.price;
    }
  });

  const calculateMealTotal = () => {
    let extra = 0;
    Object.entries(mealSelections).forEach(([date, dateObj]) => {
      Object.entries(dateObj).forEach(([period, periodObj]) => {
        Object.entries(periodObj).forEach(([foodId, qty]) => {
          const item = packageMenuItems.find((m) => m.foodId === Number(foodId));
          if (item) {
            if (item.isPackageIncluded) {
              if (qty > 1) extra += item.price * (qty - 1);
            } else {
              extra += item.price * qty;
            }
          }
        });
      });
    });
    return extra;
  };
  const mealTotal = calculateMealTotal();

  const getMealSelectedCount = () => {
    let count = 0;
    Object.values(mealSelections).forEach((dateObj) => {
      Object.values(dateObj).forEach((periodObj) => {
        Object.values(periodObj).forEach((qty) => { count += qty; });
      });
    });
    return count;
  };

  const updateMealQty = (date, period, foodId, change) => {
    setMealSelections((prev) => {
      const dateSel = prev[date] || {};
      const periodSel = dateSel[period] || {};
      const currentQty = periodSel[foodId] || 0;
      const newQty = Math.max(0, currentQty + change);
      const nextPeriodSel = { ...periodSel };
      if (newQty === 0) { delete nextPeriodSel[foodId]; } else { nextPeriodSel[foodId] = newQty; }
      return { ...prev, [date]: { ...dateSel, [period]: nextPeriodSel } };
    });
  };

  const totalAmount = villaTotal + servicesTotal + mealTotal;
  const depositAmount = totalAmount * 0.3;
  const remainingAmount = totalAmount * 0.7;

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
    setFormErrors(errors);
    return true;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    } else if (step === 3) {
      if (!selectedVillaId) {
        alert("Vui lòng chọn một hạng phòng/biệt thự nghỉ dưỡng trước khi tiếp tục.");
        return;
      }
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  const handlePrevStep = () => {
    if (step > 1 && step < 6) {
      setStep(step - 1);
    }
  };

  const handleVerifyPayment = async () => {
    setIsVerifyingPayment(true);
    try {
      const villaIdMap = {
        "wood-bungalow": 1,
        "zen-villa": 2,
        "lotus-family-villa": 3,
        "pebble-bungalow": 4
      };
      const numericVillaId = villaIdMap[selectedVillaId] || 1;

      const serviceIdMap = {
        "srv-spa": 1,
        "srv-yoga": 2,
        "srv-physio": 3,
        "srv-meals": 4,
        "srv-pickup": 5
      };
      const numericServiceIds = selectedServiceIds.map(id => serviceIdMap[id] || 1);

      const payload = {
        fullName: guestInfo.fullName,
        email: guestInfo.email,
        phone: guestInfo.phone,
        checkInDate: (guestInfo.checkInDate ? guestInfo.checkInDate.split("T")[0] : "") + "T14:00:00",
        checkOutDate: (guestInfo.checkOutDate ? guestInfo.checkOutDate.split("T")[0] : "") + "T12:00:00",
        guestsCount: guestInfo.guestsCount,
        villaId: numericVillaId,
        roomId: 1, // Default room ID to satisfy @NotNull validation if enabled
        packageId: 1,
        serviceIds: numericServiceIds,
        allergies: selectedAllergies.join(", ") + (otherAllergy ? ", " + otherAllergy : ""),
        explicitConsentSigned: consentDataProcessing && consentSharing,
        mealSelections: mealSelections
      };

      const res = await axiosClient.post('/bookings/create', payload);
      const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
      console.log("Booking created successfully:", data);

      if (data && data.invoiceId) {
        setCreatedInvoiceId(data.invoiceId);
        setCreatedBookingId(data.bookingId);
        setStep(6);
      } else {
        alert("Không thể khởi tạo hóa đơn thanh toán cho đặt phòng này. Phản hồi từ Server: " + JSON.stringify(res.data));
      }
    } catch (err) {
      console.error("Failed to create booking", err);
      console.error("Failed to create booking. Response:", err.response);
      const errMsg = typeof err.response?.data === 'string'
        ? err.response.data
        : (err.response?.data?.message || err.message || "Đã xảy ra lỗi trong quá trình đặt phòng. Vui lòng thử lại.");
      alert(errMsg);
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handleToggleService = (srvId) => {
    setSelectedServiceIds((prev) =>
      prev.includes(srvId) ? prev.filter((id) => id !== srvId) : [...prev, srvId]
    );
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  const handleCopyText = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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

        {/* Wizard Header */}
        <BookingWizardHeader step={step} bookingStatus={bookingStatus} />

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
            formatCurrency={formatCurrency}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Columns: Dynamic Step Form Panel */}
            <div className={`lg:col-span-8 bg-white border border-primary-100 p-6 sm:p-8 shadow-xs ${radius.card}`}>
              {step === 1 && (
                <GuestInfoStep
                  guestInfo={guestInfo}
                  setGuestInfo={setGuestInfo}
                  formErrors={formErrors}
                  setFormErrors={setFormErrors}
                  handleNextStep={handleNextStep}
                />
              )}
              {step === 2 && (
                <HealthProfileStep
                  formErrors={formErrors}
                  dietaryPreference={dietaryPreference}
                  setDietaryPreference={setDietaryPreference}
                  selectedAllergies={selectedAllergies}
                  toggleAllergy={toggleAllergy}
                  otherAllergy={otherAllergy}
                  setOtherAllergy={setOtherAllergy}
                  physicalCondition={physicalCondition}
                  setPhysicalCondition={setPhysicalCondition}
                  consentDataProcessing={consentDataProcessing}
                  setConsentDataProcessing={setConsentDataProcessing}
                  consentSharing={consentSharing}
                  setConsentSharing={setConsentSharing}
                  handlePrevStep={handlePrevStep}
                  handleNextStep={handleNextStep}
                />
              )}
              {step === 3 && (
                <VillaSelectionStep
                  selectedVillaId={selectedVillaId}
                  setSelectedVillaId={setSelectedVillaId}
                  selectedServiceIds={selectedServiceIds}
                  handleToggleService={handleToggleService}
                  formatCurrency={formatCurrency}
                  handlePrevStep={handlePrevStep}
                  handleNextStep={handleNextStep}
                />
              )}
              {step === 4 && (
                <MealSelectionStep
                  mealBookingDays={mealBookingDays}
                  selectedMealDate={selectedMealDate}
                  setSelectedMealDate={setSelectedMealDate}
                  consentDataProcessing={consentDataProcessing}
                  consentSharing={consentSharing}
                  packageMenuItems={packageMenuItems}
                  dietaryPreference={dietaryPreference}
                  guestInfo={guestInfo}
                  selectedAllergies={selectedAllergies}
                  otherAllergy={otherAllergy}
                  mealSelections={mealSelections}
                  updateMealQty={updateMealQty}
                  formatCurrency={formatCurrency}
                  getMealSelectedCount={getMealSelectedCount}
                  mealTotal={mealTotal}
                  handlePrevStep={handlePrevStep}
                  handleNextStep={handleNextStep}
                />
              )}
              {step === 5 && (
                <ConfirmationStep
                  guestInfo={guestInfo}
                  nightsCount={nightsCount}
                  dietaryPreference={dietaryPreference}
                  selectedAllergies={selectedAllergies}
                  otherAllergy={otherAllergy}
                  physicalCondition={physicalCondition}
                  selectedVilla={selectedVilla}
                  selectedServices={selectedServices}
                  villaTotal={villaTotal}
                  mealTotal={mealTotal}
                  totalAmount={totalAmount}
                  depositAmount={depositAmount}
                  remainingAmount={remainingAmount}
                  formatCurrency={formatCurrency}
                  handleCopyText={handleCopyText}
                  copiedField={copiedField}
                  isVerifyingPayment={isVerifyingPayment}
                  handleVerifyPayment={handleVerifyPayment}
                  handlePrevStep={handlePrevStep}
                />
              )}
              {step === 6 && (
                <PaymentStep
                  bookingId={createdBookingId}
                  invoiceId={createdInvoiceId}
                  depositAmount={depositAmount}
                  totalAmount={totalAmount}
                  formatCurrency={formatCurrency}
                />
              )}
            </div>

            {/* Right 4 Columns: Dynamic Booking Bill Summary Stick Widget */}
            <div className="lg:col-span-4 space-y-6">
              <BookingBillSummary
                nightsCount={nightsCount}
                villaTotal={villaTotal}
                mealTotal={mealTotal}
                selectedServices={selectedServices}
                guestInfo={guestInfo}
                totalAmount={totalAmount}
                depositAmount={depositAmount}
                remainingAmount={remainingAmount}
                bookingStatus={bookingStatus}
                paymentStatus={paymentStatus}
                formatCurrency={formatCurrency}
                selectedVilla={selectedVilla}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
