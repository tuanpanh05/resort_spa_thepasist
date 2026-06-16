import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Users,
  AlertCircle,
  Compass,
  ArrowLeft,
  Check,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Info,
  ChevronRight,
  Loader2,
  Heart,
  Leaf,
  AlertTriangle,
} from "lucide-react";
import { colors, radius, shadows } from "../styles/designSystem";
import { masterDataApi, bookingApi } from "../api";

// Food allergy options matching SRS
const ALLERGY_OPTIONS = [
  { key: "peanuts", label: "Đậu phộng (Peanuts)" },
  { key: "gluten", label: "Gluten / Lúa mì" },
  { key: "shellfish", label: "Hải sản có vỏ (Shellfish)" },
  { key: "dairy", label: "Sữa / Lactose" },
  { key: "eggs", label: "Trứng" },
  { key: "soy", label: "Đậu nành (Soy)" },
  { key: "treenuts", label: "Hạt cây (Tree nuts)" },
  { key: "fish", label: "Cá" },
];

// Dietary preference options
const DIET_OPTIONS = [
  { key: "omnivore", label: "Ăn tạp (Omnivore)" },
  { key: "vegetarian", label: "Chay (Vegetarian)" },
  { key: "vegan", label: "Thuần chay (Vegan)" },
  { key: "pescatarian", label: "Ăn cá (Pescatarian)" },
  { key: "keto", label: "Keto" },
  { key: "halal", label: "Halal" },
];

// Mock data list for Villas (matching room items from mockData.js or rooms page)
const villasList = [
  {
    id: "wood-bungalow",
    roomId: 2,
    title: "Bungalow Gỗ Hướng Suối",
    description: "Nằm ẩn mình dưới tán cây cổ thụ bên khe suối nhỏ. Thiết kế mở vách kính đón sương mai, bồn Hinoki thơm ngát.",
    price: 3200000,
    size: "65 m²",
    capacity: "2 Người lớn",
    view: "Hướng Suối",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "zen-villa",
    roomId: 3,
    title: "Biệt Thự Đồi Trà Thiền Định",
    description: "Tọa lạc trên đỉnh đồi lộng gió view 360 độ ra thung lũng Ngũ Sơn. Tích hợp phòng tập yoga riêng biệt và hồ bơi khoáng nóng.",
    price: 5800000,
    size: "120 m²",
    capacity: "4 Người lớn",
    view: "Thung Lũng & Đồi Trà",
    image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "lotus-family-villa",
    roomId: 4,
    title: "Biệt Thự Gia Đình Sen Trắng",
    description: "Nằm biệt lập bên đồi thông yên tĩnh với vườn sen bao quanh. Thiết kế 3 phòng ngủ tiện nghi, phòng khách và bếp đầy đủ.",
    price: 7500000,
    size: "180 m²",
    capacity: "6 - 8 Người lớn",
    view: "Đồi Thông & Hồ Sen",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "pebble-bungalow",
    roomId: 2,
    title: "Bungalow Đá Cuội Bên Rừng",
    description: "Vách đá cuội tự nhiên mộc mạc và sang trọng sườn đồi thông. Sở hữu bồn tắm lộ thiên và mái kính ngắm sao đêm tuyệt đẹp.",
    price: 3800000,
    size: "75 m²",
    capacity: "2 Người lớn",
    view: "Rừng Thông",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  },
];

// Mock data list for Wellness Services
const servicesList = [
  {
    id: "srv-spa",
    title: "Spa & Trị Liệu Thảo Dược Cổ Truyền",
    description: "Ngâm lá thuốc Dao Đỏ đun trong nồi đồng, massage đá nóng và xông hơi thảo mộc.",
    price: 800000,
    type: "per-guest",
  },
  {
    id: "srv-yoga",
    title: "Hatha Yoga Phục Hồi & Thiền Chuông Xoay",
    description: "Buổi thiền hành sớm mai kết hợp lớp yoga trị liệu trị liệu mỏi cổ vai gáy.",
    price: 500000,
    type: "per-guest",
  },
  {
    id: "srv-physio",
    title: "Vật Lý Trị Liệu Xương Khớp Cột Sống",
    description: "Chương trình nắn chỉnh cột sống chuyên sâu thực hiện bởi bác sĩ y khoa.",
    price: 1200000,
    type: "per-guest",
  },
  {
    id: "srv-meals",
    title: "Gói Ẩm Thực Thực Dưỡng Organic (3 bữa/ngày)",
    description: "Chế độ ăn hữu cơ thuần tự nhiên giúp đào thải độc tố cơ thể hiệu quả.",
    price: 1000000,
    type: "per-guest-per-night",
  },
  {
    id: "srv-pickup",
    title: "Xe Điện Đón Tiễn Sân Bay Đà Nẵng",
    description: "Xe sang đón tiễn hai chiều đảm bảo sự thoải mái tối đa cho hành trình.",
    price: 600000,
    type: "flat",
  },
];

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const packageIdParam = searchParams.get("packageId");

  // Wizard Step State: 1 = Guest Info, 2 = Select Villa & Services, 3 = Review, 4 = Payment QR
  const [step, setStep] = useState(1);

  // Retreat package from URL (UC07)
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingError, setBookingError] = useState(null);

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

  // Copy helper
  const [copiedField, setCopiedField] = useState(null);

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

  useEffect(() => {
    if (!packageIdParam) return;

    masterDataApi.getRetreatPackages()
      .then((packages) => {
        const pkg = packages.find((p) => p.packageId === Number(packageIdParam));
        if (!pkg) return;
        setSelectedPackage(pkg);

        const checkIn = guestInfo.checkInDate;
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + (pkg.durationDays || 1));
        const checkOut = checkOutDate.toISOString().split("T")[0];

        setGuestInfo((prev) => ({
          ...prev,
          checkOutDate: checkOut,
        }));
      })
      .catch(() => {
        setBookingError("Không thể tải thông tin gói trị liệu.");
      });
  }, [packageIdParam]);

  // Selected Villa Info
  const selectedVilla = villasList.find((v) => v.id === selectedVillaId);

  // Calculates Pricing Breakdown
  const villaTotal = selectedPackage
    ? Number(selectedPackage.price || 0)
    : selectedVilla
    ? selectedVilla.price * nightsCount
    : 0;
  
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
  const handleConfirmBooking = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setBookingError("Vui lòng đăng nhập tài khoản trước khi xác nhận đặt phòng.");
      navigate("/dang-nhap");
      return;
    }

    if (!selectedVilla?.roomId) {
      setBookingError("Vui lòng chọn biệt thự hợp lệ.");
      return;
    }

    setIsConfirming(true);
    setBookingError(null);

    const dto = {
      packageId: selectedPackage ? selectedPackage.packageId : null,
      roomId: selectedVilla.roomId,
      checkInDate: `${guestInfo.checkInDate}T14:00:00`,
      checkOutDate: `${guestInfo.checkOutDate}T12:00:00`,
    };

    try {
      const response = await bookingApi.createBooking(dto);
      navigate(`/payment?invoiceId=${response.invoiceId}`);
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("403")) {
        setBookingError("Phiên đăng nhập hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại.");
        navigate("/dang-nhap");
      } else {
        setBookingError(msg || "Không thể tạo đơn đặt phòng.");
      }
      setIsConfirming(false);
    }
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

  // Helper formatting for currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  // Copy bank field text helper
  const handleCopyText = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Mock QR Code SVG
  const qrCodeSvg = (
    <svg className="w-full h-full text-sage-900" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="4" fill="white" />
      <rect x="6" y="6" width="22" height="22" stroke="currentColor" strokeWidth="4" fill="none" />
      <rect x="11" y="11" width="12" height="12" fill="currentColor" />
      <rect x="72" y="6" width="22" height="22" stroke="currentColor" strokeWidth="4" fill="none" />
      <rect x="77" y="11" width="12" height="12" fill="currentColor" />
      <rect x="6" y="72" width="22" height="22" stroke="currentColor" strokeWidth="4" fill="none" />
      <rect x="11" y="77" width="12" height="12" fill="currentColor" />
      
      <rect x="34" y="6" width="8" height="8" fill="currentColor" />
      <rect x="48" y="6" width="12" height="4" fill="currentColor" />
      <rect x="34" y="18" width="16" height="4" fill="currentColor" />
      <rect x="54" y="14" width="8" height="12" fill="currentColor" />
      
      <rect x="6" y="34" width="8" height="4" fill="currentColor" />
      <rect x="20" y="34" width="18" height="4" fill="currentColor" />
      <rect x="44" y="30" width="12" height="12" fill="currentColor" />
      <rect x="60" y="34" width="6" height="18" fill="currentColor" />
      <rect x="72" y="34" width="22" height="4" fill="currentColor" />
      
      <rect x="6" y="44" width="12" height="12" fill="currentColor" />
      <rect x="22" y="44" width="4" height="20" fill="currentColor" />
      <rect x="30" y="48" width="10" height="4" fill="currentColor" />
      <rect x="72" y="44" width="10" height="20" fill="currentColor" />
      <rect x="86" y="44" width="8" height="8" fill="currentColor" />
      
      <rect x="6" y="60" width="4" height="8" fill="currentColor" />
      <rect x="14" y="60" width="14" height="4" fill="currentColor" />
      <rect x="34" y="60" width="14" height="14" fill="currentColor" />
      <rect x="52" y="60" width="12" height="4" fill="currentColor" />
      
      <rect x="34" y="78" width="18" height="4" fill="currentColor" />
      <rect x="56" y="70" width="12" height="18" fill="currentColor" />
      <rect x="72" y="72" width="22" height="4" fill="currentColor" />
      <rect x="72" y="80" width="10" height="14" fill="currentColor" />
      <rect x="86" y="80" width="8" height="8" fill="currentColor" />
      <rect x="6" y="90" width="24" height="4" fill="currentColor" />
      
      {/* Center Icon */}
      <rect x="42" y="42" width="16" height="16" rx="3" fill="white" stroke="currentColor" strokeWidth="2" />
      <path d="M46 50 C46 47, 54 47, 54 50 C54 53, 46 51, 46 54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );

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
          /* FINAL SUCCESS STATE DISPLAY SCREEN */
          <div className={`bg-white border border-primary-100 max-w-2xl mx-auto p-8 sm:p-12 text-center shadow-md animate-fade-in relative overflow-hidden ${radius.card}`}>
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400" />
            
            <div className="inline-flex p-4 bg-primary-100 text-primary-800 rounded-full mb-6">
              <CheckCircle2 className="h-14 w-14" />
            </div>

            <h1 className="font-serif text-3xl font-normal text-sage-900 mb-2">
              Đặt Phòng Thành Công!
            </h1>
            <p className="text-sage-600 text-xs sm:text-sm max-w-md mx-auto mb-8 font-light leading-relaxed">
              Cảm ơn quý khách đã tin tưởng lựa chọn Ngũ Sơn Resort. Giao dịch đặt cọc đã được xác minh thành công. Chi tiết đặt phòng đã được lưu ở trạng thái **CONFIRMED**.
            </p>

            {/* Final receipt breakdown */}
            <div className="border border-primary-100 bg-primary-50/20 text-left p-6 sm:p-8 space-y-4 mb-8 text-xs sm:text-sm">
              <div className="flex justify-between pb-3 border-b border-primary-100">
                <span className="font-bold uppercase tracking-wider text-sage-400 text-[10px]">
                  Phiếu Đặt Lịch Trị Liệu & Nghỉ Dưỡng
                </span>
                <span className="font-mono text-primary-800 font-bold">
                  CODE: BK-{Math.floor(100000 + Math.random() * 900000)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-2.5">
                <span className="text-sage-500 font-light">Họ và tên khách hàng:</span>
                <span className="font-semibold text-right">{guestInfo.fullName}</span>

                <span className="text-sage-500 font-light">Số điện thoại liên lạc:</span>
                <span className="font-semibold text-right">{guestInfo.phone}</span>

                <span className="text-sage-500 font-light">Địa chỉ email:</span>
                <span className="font-semibold text-right">{guestInfo.email}</span>

                <span className="text-sage-500 font-light">Thời gian lưu trú:</span>
                <span className="font-semibold text-right">
                  {guestInfo.checkInDate} → {guestInfo.checkOutDate} ({nightsCount} Đêm)
                </span>

                <span className="text-sage-500 font-light">Số khách đi cùng:</span>
                <span className="font-semibold text-right">{guestInfo.guestsCount} Khách</span>

                <span className="text-sage-500 font-light">Căn biệt thự đã chọn:</span>
                <span className="font-semibold text-right text-primary-800">{selectedVilla?.title}</span>

                {selectedServices.length > 0 && (
                  <>
                    <span className="text-sage-500 font-light">Các dịch vụ kèm theo:</span>
                    <span className="font-semibold text-right text-sage-700">
                      {selectedServices.map((s) => s.title.split("&")[0].trim()).join(", ")}
                    </span>
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-primary-100 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-sage-500 font-light">Tổng chi phí đặt phòng:</span>
                  <span className="font-semibold text-sage-950">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-green-700 font-semibold bg-green-50 px-2 py-1">
                  <span>Số tiền cọc đã thanh toán (30%):</span>
                  <span>{formatCurrency(depositAmount)}</span>
                </div>
                <div className="flex justify-between text-primary-950 font-bold border-t border-primary-100/50 pt-2 text-sm sm:text-base font-serif">
                  <span>Số tiền cần trả tại quầy (70%):</span>
                  <span>{formatCurrency(remainingAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-primary-800 text-white text-resort-button tracking-wider hover:bg-primary-900 transition-all uppercase rounded-none cursor-pointer"
              >
                Về trang chủ
              </Link>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center justify-center px-8 py-3 border border-sage-800 text-sage-800 text-resort-button tracking-wider hover:bg-sage-50 transition-all uppercase rounded-none"
              >
                In phiếu xác nhận
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-sage-100 flex justify-center items-center text-[10px] text-sage-400 space-x-2">
              <ShieldCheck className="h-4.5 w-4.5 text-primary-600" />
              <span>Giao dịch bảo mật SSL. Email xác nhận đặt phòng đã được gửi tự động.</span>
            </div>
          </div>
        ) : (
          /* ACTIVE STEPS FLOW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 8 Columns: Dynamic Step Form Panel */}
            <div className={`lg:col-span-8 bg-white border border-primary-100 p-6 sm:p-8 shadow-xs ${radius.card}`}>
              
              {/* Step 1 Page Content Panel */}
              {step === 1 && (
                <div className="space-y-6 text-left animate-fade-in">
                  <div className="border-b border-primary-50 pb-3 mb-6">
                    <h2 className="text-resort-section text-sage-950 mb-1">
                      Bước 1: Thông Tin Khách Hàng
                    </h2>
                    <p className="text-resort-desc mt-1">
                      Vui lòng nhập các thông tin liên lạc chính xác để tạo hồ sơ khách lưu trú ban đầu.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
                    
                    {/* Full Name */}
                    <div>
                      <label className="block text-resort-label uppercase text-sage-900 mb-2">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Nguyễn Văn A"
                          value={guestInfo.fullName}
                          onChange={(e) => {
                            setGuestInfo({ ...guestInfo, fullName: e.target.value });
                            setFormErrors({ ...formErrors, fullName: "" });
                          }}
                          className={`w-full pl-10 pr-4 py-3 bg-sage-50/50 border text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400 ${
                            formErrors.fullName ? "border-red-400" : "border-primary-200/50"
                          }`}
                        />
                        <User className="h-4.5 w-4.5 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                      {formErrors.fullName && <span className="text-[10px] text-red-500 font-normal mt-1 block">{formErrors.fullName}</span>}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-resort-label uppercase text-sage-900 mb-2">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          placeholder="0901234567"
                          value={guestInfo.phone}
                          onChange={(e) => {
                            setGuestInfo({ ...guestInfo, phone: e.target.value });
                            setFormErrors({ ...formErrors, phone: "" });
                          }}
                          className={`w-full pl-10 pr-4 py-3 bg-sage-50/50 border text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400 ${
                            formErrors.phone ? "border-red-400" : "border-primary-200/50"
                          }`}
                        />
                        <Phone className="h-4.5 w-4.5 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                      {formErrors.phone && <span className="text-[10px] text-red-500 font-normal mt-1 block">{formErrors.phone}</span>}
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-resort-label uppercase text-sage-900 mb-2">
                        Địa chỉ Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="khachhang@gmail.com"
                          value={guestInfo.email}
                          onChange={(e) => {
                            setGuestInfo({ ...guestInfo, email: e.target.value });
                            setFormErrors({ ...formErrors, email: "" });
                          }}
                          className={`w-full pl-10 pr-4 py-3 bg-sage-50/50 border text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400 ${
                            formErrors.email ? "border-red-400" : "border-primary-200/50"
                          }`}
                        />
                        <Mail className="h-4.5 w-4.5 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                      {formErrors.email && <span className="text-[10px] text-red-500 font-normal mt-1 block">{formErrors.email}</span>}
                    </div>

                    {/* Guests count */}
                    <div>
                      <label className="block text-resort-label uppercase text-sage-900 mb-2">
                        Số lượng khách hàng
                      </label>
                      <div className="relative">
                        <select
                          value={guestInfo.guestsCount}
                          onChange={(e) => setGuestInfo({ ...guestInfo, guestsCount: Number(e.target.value) })}
                          className="w-full pl-10 pr-4 py-3 bg-sage-50/50 border border-primary-200/50 text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400 appearance-none"
                        >
                          <option value="1">1 Khách nghỉ</option>
                          <option value="2">2 Khách nghỉ</option>
                          <option value="3">3 Khách nghỉ</option>
                          <option value="4">4 Khách nghỉ</option>
                          <option value="5">5 Khách nghỉ</option>
                          <option value="6">Đoàn nghỉ đông (6+)</option>
                        </select>
                        <Users className="h-4.5 w-4.5 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* Check In Date */}
                    <div>
                      <label className="block text-resort-label uppercase text-sage-900 mb-2">
                        Ngày nhận phòng dự kiến <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={guestInfo.checkInDate}
                          onChange={(e) => {
                            setGuestInfo({ ...guestInfo, checkInDate: e.target.value });
                            setFormErrors({ ...formErrors, checkInDate: "" });
                          }}
                          className="w-full pl-10 pr-4 py-3 bg-sage-50/50 border border-primary-200/50 text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400"
                        />
                        <Calendar className="h-4.5 w-4.5 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* Check Out Date */}
                    <div>
                      <label className="block text-resort-label uppercase text-sage-900 mb-2">
                        Ngày trả phòng dự kiến <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={guestInfo.checkOutDate}
                          onChange={(e) => {
                            setGuestInfo({ ...guestInfo, checkOutDate: e.target.value });
                            setFormErrors({ ...formErrors, checkOutDate: "" });
                          }}
                          className={`w-full pl-10 pr-4 py-3 bg-sage-50/50 border text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400 ${
                            formErrors.checkOutDate ? "border-red-400" : "border-primary-200/50"
                          }`}
                        />
                        <Calendar className="h-4.5 w-4.5 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                      {formErrors.checkOutDate && <span className="text-[10px] text-red-500 font-normal mt-1 block">{formErrors.checkOutDate}</span>}
                    </div>

                    {/* Removed Health Note from here as it is now in Step 2 */}

                    {/* Special requests */}
                    <div className="sm:col-span-2">
                      <label className="block text-resort-label uppercase text-sage-900 mb-2">
                        Yêu cầu đặc biệt khác
                      </label>
                      <div className="relative">
                        <textarea
                          placeholder="VD: Muốn phòng ở khu yên tĩnh, cần bố trí thêm 1 nôi em bé..."
                          rows="2"
                          value={guestInfo.specialRequest}
                          onChange={(e) => setGuestInfo({ ...guestInfo, specialRequest: e.target.value })}
                          className="w-full px-4 py-3 bg-sage-50/50 border border-primary-200/50 text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-primary-50 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-8 py-3.5 bg-primary-800 hover:bg-primary-900 text-white text-resort-button tracking-widest uppercase rounded-none transition-all duration-300 flex items-center cursor-pointer"
                    >
                      Khai báo sức khỏe <ChevronRight className="h-4 w-4 ml-1.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 Page Content Panel */}
              {step === 2 && (
                <div className="space-y-8 text-left animate-fade-in">
                  <div className="border-b border-primary-50 pb-3 mb-6">
                    <h2 className="text-resort-section text-sage-950 mb-1">
                      Bước 2: Hồ Sơ Sức Khỏe & Chế Độ Ăn
                    </h2>
                    <p className="text-resort-desc">
                      Thông tin sức khỏe giúp chúng tôi cá nhân hóa dịch vụ Spa, thực đơn và trị liệu dành riêng cho bạn. Dữ liệu sẽ được mã hóa và bảo mật.
                    </p>
                  </div>

                  {formErrors.consent && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm border border-red-100 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{formErrors.consent}</span>
                    </div>
                  )}

                  <div className="space-y-8">
                    {/* Section 1: Dietary Preference */}
                    <div>
                      <h3 className="text-sm font-bold text-sage-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-primary-700" />
                        Chế Độ Ăn Uống
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {DIET_OPTIONS.map((opt) => (
                          <label
                            key={opt.key}
                            className={`flex items-center justify-center p-3 rounded-none border cursor-pointer text-xs font-semibold transition-all ${
                              dietaryPreference === opt.key
                                ? "border-primary-800 bg-primary-50 text-primary-900"
                                : "border-primary-100 bg-white text-sage-600 hover:border-primary-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="dietaryPreference"
                              value={opt.key}
                              checked={dietaryPreference === opt.key}
                              onChange={() => setDietaryPreference(opt.key)}
                              className="sr-only"
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Section 2: Food Allergies */}
                    <div>
                      <h3 className="text-sm font-bold text-sage-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        Dị Ứng Thực Phẩm
                      </h3>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {ALLERGY_OPTIONS.map((opt) => (
                          <label
                            key={opt.key}
                            className={`flex items-center gap-2 p-3 rounded-none border cursor-pointer text-xs font-medium transition-all ${
                              selectedAllergies.includes(opt.key)
                                ? "border-amber-400 bg-amber-50 text-amber-800"
                                : "border-primary-100 bg-white text-sage-600 hover:border-primary-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedAllergies.includes(opt.key)}
                              onChange={() => toggleAllergy(opt.key)}
                              className="w-4 h-4 accent-amber-500"
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={otherAllergy}
                        onChange={(e) => setOtherAllergy(e.target.value)}
                        placeholder="Dị ứng khác (nếu có)..."
                        className="w-full px-4 py-3 bg-sage-50/50 border border-primary-200/50 text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
                    </div>

                    {/* Section 3: Physical Condition */}
                    <div>
                      <h3 className="text-sm font-bold text-sage-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Heart className="h-4 w-4 text-rose-500" />
                        Tình Trạng Thể Chất
                      </h3>
                      <p className="text-xs text-sage-500 mb-3">
                        Ví dụ: Đau lưng, huyết áp cao, đang mang thai... Thông tin này chỉ Kỹ thuật viên trị liệu mới được xem.
                      </p>
                      <textarea
                        value={physicalCondition}
                        onChange={(e) => setPhysicalCondition(e.target.value)}
                        rows={3}
                        placeholder="Mô tả tình trạng sức khỏe thể chất của bạn..."
                        className="w-full px-4 py-3 bg-sage-50/50 border border-primary-200/50 text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400 resize-none"
                      />
                    </div>

                    {/* Section 4: Explicit Consent */}
                    <div className="bg-amber-50/70 p-5 space-y-4 border-l-4 border-amber-500 rounded-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="h-5 w-5 text-amber-600" />
                        <h3 className="text-sm font-bold text-amber-800">
                          Cam Kết Thu Thập Dữ Liệu (Nghị định 356/2025/NĐ-CP)
                        </h3>
                      </div>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={consentDataProcessing}
                          onChange={(e) => setConsentDataProcessing(e.target.checked)}
                          className="w-4 h-4 mt-1 accent-amber-600 flex-shrink-0"
                        />
                        <span className="text-xs text-amber-900">
                          <strong>Đồng ý Xử lý Dữ liệu Sức khỏe:</strong> Tôi đồng ý cho Ngũ Sơn Resort lưu trữ và xử lý thông tin sức khỏe của tôi (được mã hóa AES-256) nhằm cung cấp dịch vụ phù hợp.
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={consentSharing}
                          onChange={(e) => setConsentSharing(e.target.checked)}
                          className="w-4 h-4 mt-1 accent-amber-600 flex-shrink-0"
                        />
                        <span className="text-xs text-amber-900">
                          <strong>Đồng ý Chia sẻ Có Giới hạn:</strong> Tôi đồng ý chia sẻ thông tin dị ứng với bộ phận Bếp và thông tin thể chất với Kỹ thuật viên Spa.
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-primary-50 flex justify-between gap-4">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-8 py-3.5 border border-sage-800 text-sage-800 text-resort-button tracking-wider hover:bg-sage-50 transition-all uppercase rounded-none flex items-center"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1.5" /> Quay lại
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-8 py-3.5 bg-primary-800 hover:bg-primary-900 text-white text-resort-button tracking-wider hover:bg-primary-950 transition-all uppercase rounded-none flex items-center cursor-pointer"
                    >
                      Chọn Villa & Dịch vụ <ChevronRight className="h-4 w-4 ml-1.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 Page Content Panel */}
              {step === 3 && (
                <div className="space-y-8 text-left animate-fade-in">
                  <div className="border-b border-primary-50 pb-3 mb-6">
                    <h2 className="text-resort-section text-sage-950 mb-1">
                      Bước 3: Chọn Không Gian & Trải Nghiệm
                    </h2>
                    <p className="text-resort-desc">
                      Lựa chọn 1 biệt thự nghỉ dưỡng và tích hợp thêm các dịch vụ trị liệu cao cấp đi kèm.
                    </p>
                  </div>

                  {/* Villa Selection Row */}
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-bold text-sage-900 border-l-2 border-primary-700 pl-3">
                      Hạng Phòng & Biệt Thự Nghỉ Dưỡng
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {villasList.map((villa) => {
                        const isSelected = selectedVillaId === villa.id;
                        return (
                          <div
                            key={villa.id}
                            onClick={() => setSelectedVillaId(villa.id)}
                            className={`border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
                              isSelected
                                ? "border-primary-800 ring-2 ring-primary-800/10 bg-primary-50/10"
                                : "border-primary-100 hover:border-primary-300 bg-white"
                            }`}
                          >
                            <div className="relative h-44 overflow-hidden">
                              <img
                                src={villa.image}
                                alt={villa.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-3 right-3 bg-white/95 px-3 py-1 font-mono text-xs font-bold text-primary-950 border border-primary-200">
                                {formatCurrency(villa.price)}/đêm
                              </div>
                            </div>
                            
                            <div className="p-5 flex-grow space-y-2.5">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-primary-700 uppercase tracking-wider bg-primary-100/50 px-2 py-0.5">
                                  {villa.view}
                                </span>
                                <span className="text-[10px] text-sage-400 font-mono font-medium">
                                  {villa.size} | {villa.capacity}
                                </span>
                              </div>
                              <h4 className="font-serif text-base font-bold text-sage-950">
                                {villa.title}
                              </h4>
                              <p className="text-xs text-sage-600 font-light leading-relaxed">
                                {villa.description}
                              </p>
                            </div>
                            
                            <div className="px-5 pb-5 pt-1 flex justify-end">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 ${
                                  isSelected
                                    ? "bg-primary-800 text-white"
                                    : "bg-white border border-primary-200 text-sage-600 hover:bg-primary-50"
                                }`}
                              >
                                {isSelected ? "✓ Đang chọn" : "Chọn phòng"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Addon Services Selection Row */}
                  <div className="space-y-4 pt-6 border-t border-primary-50">
                    <h3 className="font-serif text-lg font-bold text-sage-900 border-l-2 border-primary-700 pl-3">
                      Dịch Vụ Chăm Sóc Sức Khỏe & Tiện Ích
                    </h3>
                    
                    <div className="space-y-3">
                      {servicesList.map((service) => {
                        const isSelected = selectedServiceIds.includes(service.id);
                        return (
                          <div
                            key={service.id}
                            onClick={() => handleToggleService(service.id)}
                            className={`border p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer transition-all duration-300 ${
                              isSelected
                                ? "border-primary-800 bg-primary-50/20"
                                : "border-primary-100 bg-white hover:border-primary-200"
                            }`}
                          >
                            <div className="flex items-start space-x-3 text-left">
                              <div
                                className={`h-5 w-5 mt-0.5 border flex items-center justify-center flex-shrink-0 ${
                                  isSelected ? "bg-primary-800 border-primary-800 text-white" : "border-primary-300"
                                }`}
                              >
                                {isSelected && <Check className="h-3.5 w-3.5" />}
                              </div>
                              <div>
                                <h4 className="font-serif text-sm sm:text-base font-bold text-sage-950">
                                  {service.title}
                                </h4>
                                <p className="text-xs text-sage-500 font-light mt-0.5">
                                  {service.description}
                                </p>
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <span className="font-serif text-xs sm:text-sm font-bold text-primary-950 block">
                                {formatCurrency(service.price)}
                              </span>
                              <span className="text-[9px] text-sage-400 block font-medium">
                                {service.type === "per-guest"
                                  ? "/khách"
                                  : service.type === "per-guest-per-night"
                                  ? "/khách/đêm"
                                  : "/lượt"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation actions */}
                  <div className="pt-6 border-t border-primary-50 flex justify-between gap-4">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-8 py-3.5 border border-sage-800 text-sage-800 text-resort-button tracking-wider hover:bg-sage-50 transition-all uppercase rounded-none flex items-center"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1.5" /> Quay lại
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-8 py-3.5 bg-primary-800 hover:bg-primary-900 text-white text-resort-button tracking-wider hover:bg-primary-950 transition-all uppercase rounded-none flex items-center cursor-pointer"
                    >
                      Kiểm tra đơn đặt <ChevronRight className="h-4 w-4 ml-1.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4 Page Content Panel */}
              {step === 4 && (
                <div className="space-y-6 text-left animate-fade-in">
                  <div className="border-b border-primary-50 pb-3 mb-6">
                    <h2 className="text-resort-section text-sage-950 mb-1">
                      Bước 4: Xác Nhận Đơn Đặt Lịch
                    </h2>
                    <p className="text-resort-desc">
                      Xác nhận lại toàn bộ thông tin chi tiết trước khi hệ thống tạo mã đặt phòng tạm thời.
                    </p>
                    {selectedPackage && (
                      <p className="text-xs text-primary-800 mt-2 font-medium">
                        Gói trị liệu: {selectedPackage.name} — {formatCurrency(Number(selectedPackage.price))}
                      </p>
                    )}
                  </div>

                  {bookingError && (
                    <div className="mb-4 p-4 bg-red-50 text-red-700 text-sm border border-red-100 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <div className="space-y-6 text-xs sm:text-sm">
                    {/* Part 1: Guest Information Info Card */}
                    <div className="bg-primary-50/15 border border-primary-100 p-6 space-y-4">
                      <h3 className="text-[10px] font-bold text-primary-800 uppercase tracking-widest border-b border-primary-100 pb-2">
                        Thông tin khách lưu trú
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Họ và tên</span>
                          <span className="font-semibold text-sage-900">{guestInfo.fullName}</span>
                        </div>
                        <div>
                          <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Số điện thoại</span>
                          <span className="font-semibold text-sage-900">{guestInfo.phone}</span>
                        </div>
                        <div>
                          <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Địa chỉ Email</span>
                          <span className="font-semibold text-sage-900">{guestInfo.email}</span>
                        </div>
                        <div>
                          <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Số người đi cùng</span>
                          <span className="font-semibold text-sage-900">{guestInfo.guestsCount} Khách hàng</span>
                        </div>
                        <div>
                          <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Khoảng thời gian nghỉ</span>
                          <span className="font-semibold text-sage-900">
                            {guestInfo.checkInDate} → {guestInfo.checkOutDate} ({nightsCount} Đêm)
                          </span>
                        </div>
                      </div>

                      {guestInfo.specialRequest && (
                        <div className="pt-2 border-t border-primary-100/50 space-y-2">
                          <div>
                            <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Yêu cầu đặc biệt</span>
                            <span className="text-sage-700 italic font-medium">{guestInfo.specialRequest}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Part 1.5: Health Profile */}
                    <div className="bg-primary-50/15 border border-primary-100 p-6 space-y-4">
                      <h3 className="text-[10px] font-bold text-primary-800 uppercase tracking-widest border-b border-primary-100 pb-2 flex items-center gap-2">
                        <Heart className="h-3 w-3" /> Hồ sơ sức khỏe & Dị ứng
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Chế độ ăn uống</span>
                          <span className="font-semibold text-sage-900">
                            {DIET_OPTIONS.find(d => d.key === dietaryPreference)?.label || dietaryPreference}
                          </span>
                        </div>
                        <div>
                          <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Dị ứng thực phẩm</span>
                          <span className="font-semibold text-amber-700">
                            {selectedAllergies.length > 0 || otherAllergy ? (
                              [
                                ...selectedAllergies.map(a => ALLERGY_OPTIONS.find(opt => opt.key === a)?.label),
                                otherAllergy
                              ].filter(Boolean).join(", ")
                            ) : "Không có"}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Tình trạng thể chất</span>
                          <span className="font-semibold text-rose-700 whitespace-pre-line">{physicalCondition || "Bình thường"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Part 2: Selected services lists */}
                    <div className="bg-white border border-primary-100 p-6 space-y-4">
                      <h3 className="text-[10px] font-bold text-primary-800 uppercase tracking-widest border-b border-primary-100 pb-2">
                        Chi tiết dịch vụ đã chọn
                      </h3>
                      
                      <div className="space-y-3.5">
                        {/* Villa details */}
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="font-serif text-sm font-bold text-sage-950 block">
                              🏡 {selectedVilla?.title}
                            </span>
                            <span className="text-[10px] text-sage-400 font-light block mt-0.5">
                              Đơn giá: {formatCurrency(selectedVilla?.price)}/đêm × {nightsCount} Đêm
                            </span>
                          </div>
                          <span className="font-semibold text-sage-900">{formatCurrency(villaTotal)}</span>
                        </div>

                        {/* Service items */}
                        {selectedServices.map((s) => {
                          let itemTotal = 0;
                          let descriptionText = "";
                          if (s.type === "per-guest") {
                            itemTotal = s.price * guestInfo.guestsCount;
                            descriptionText = `${formatCurrency(s.price)}/khách × ${guestInfo.guestsCount} Khách`;
                          } else if (s.type === "per-guest-per-night") {
                            itemTotal = s.price * guestInfo.guestsCount * nightsCount;
                            descriptionText = `${formatCurrency(s.price)}/khách/đêm × ${guestInfo.guestsCount} Khách × ${nightsCount} Đêm`;
                          } else {
                            itemTotal = s.price;
                            descriptionText = "Chi phí một lượt";
                          }
                          return (
                            <div key={s.id} className="flex justify-between items-start gap-4 pt-3 border-t border-primary-100/50">
                              <div>
                                <span className="font-serif text-sm font-bold text-sage-950 block">
                                  🌿 {s.title}
                                </span>
                                <span className="text-[10px] text-sage-400 font-light block mt-0.5">
                                  {descriptionText}
                                </span>
                              </div>
                              <span className="font-semibold text-sage-900">{formatCurrency(itemTotal)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Navigation actions */}
                  <div className="pt-6 border-t border-primary-50 flex justify-between gap-4">
                    <button
                      type="button"
                      disabled={isConfirming}
                      onClick={handlePrevStep}
                      className="px-6 py-3.5 border border-sage-800 text-sage-800 text-resort-button tracking-widest uppercase rounded-none hover:bg-sage-50 transition-all flex items-center disabled:opacity-50"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1.5" /> Quay lại
                    </button>
                    
                    <button
                      type="button"
                      disabled={isConfirming}
                      onClick={handleConfirmBooking}
                      className="px-8 py-3.5 bg-primary-800 hover:bg-primary-900 text-white text-resort-button tracking-widest uppercase rounded-none transition-all duration-300 flex items-center cursor-pointer disabled:opacity-70"
                    >
                      {isConfirming ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" /> Đang tạo đơn đặt...
                        </>
                      ) : (
                        <>
                          Xác nhận & Thanh toán cọc <ChevronRight className="h-4 w-4 ml-1.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5 Page Content Panel */}
              {step === 5 && (
                <div className="space-y-6 text-left animate-fade-in">
                  <div className="border-b border-primary-50 pb-3 mb-6">
                    <h2 className="text-resort-section text-sage-950 mb-1">
                      Bước 5: Thanh Toán Đặt Cọc
                    </h2>
                    <p className="text-resort-desc">
                      Vui lòng thanh toán khoản cọc 30% qua ngân hàng để kích hoạt trạng thái xác nhận đặt phòng tự động.
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-8 bg-primary-50/15 border border-primary-100 p-6">
                    
                    {/* Left: QR Frame */}
                    <div className="w-44 h-44 bg-white p-3 border border-primary-100 flex-shrink-0 flex items-center justify-center shadow-xs">
                      {qrCodeSvg}
                    </div>

                    {/* Right: Bank Transfer Values details */}
                    <div className="w-full space-y-3.5 text-xs sm:text-sm font-medium">
                      <div>
                        <span className="text-[10px] text-sage-400 uppercase tracking-wider block leading-none mb-1">
                          Ngân hàng thụ hưởng
                        </span>
                        <span className="text-sage-900 font-bold">MB BANK (NGÂN HÀNG QUÂN ĐỘI)</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-sage-400 uppercase tracking-wider block leading-none mb-1">
                          Số tài khoản
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-primary-900 font-mono font-bold tracking-wider">
                            190520269999
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyText("190520269999", "stk")}
                            className="text-sage-400 hover:text-primary-850 transition-colors p-1"
                          >
                            {copiedField === "stk" ? (
                              <Check className="h-4 w-4 text-green-700" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-sage-400 uppercase tracking-wider block leading-none mb-1">
                          Chủ tài khoản
                        </span>
                        <span className="text-sage-900 uppercase font-bold">CONG TY CO PHAN NGU SON RETREAT</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-sage-400 uppercase tracking-wider block leading-none mb-1">
                          Số tiền đặt cọc (30%)
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-primary-900 font-bold text-base font-serif">
                            {formatCurrency(depositAmount)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(depositAmount.toString(), "amount")}
                            className="text-sage-400 hover:text-primary-850 transition-colors p-1"
                          >
                            {copiedField === "amount" ? (
                              <Check className="h-4 w-4 text-green-700" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-sage-400 uppercase tracking-wider block leading-none mb-1">
                          Nội dung chuyển khoản
                        </span>
                        <div className="flex items-center space-x-2 bg-yellow-50 border border-yellow-250 px-3 py-1.5 self-start">
                          <span className="text-sage-900 font-mono font-bold tracking-wide">
                            NS {guestInfo.phone} {guestInfo.checkInDate.replace(/-/g, "")}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(`NS ${guestInfo.phone} ${guestInfo.checkInDate.replace(/-/g, "")}`, "memo")}
                            className="text-sage-450 hover:text-primary-850 transition-colors p-1"
                          >
                            {copiedField === "memo" ? (
                              <Check className="h-4 w-4 text-green-700" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-primary-50/50 border border-primary-100/50 flex items-start space-x-2 text-[10px] text-sage-600 leading-relaxed font-light">
                    <Info className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Sau khi chuyển khoản cọc thành công, hệ thống robot đối soát của Ngũ Sơn sẽ ghi nhận và kích hoạt mã Booking trong 1 phút. Nhấn nút xác thực bên dưới để thử nghiệm giả lập thanh toán.
                    </span>
                  </div>

                  {/* Submit actions */}
                  <div className="pt-6 border-t border-primary-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span className="text-xs text-sage-500 font-light flex items-center">
                      <ShieldCheck className="h-4.5 w-4.5 text-primary-600 mr-1.5" />
                      Hệ thống thanh toán bảo mật tự động
                    </span>
                    
                    <button
                      type="button"
                      disabled={isVerifyingPayment}
                      onClick={handleVerifyPayment}
                      className="w-full sm:w-auto px-8 py-3.5 bg-primary-800 hover:bg-primary-900 text-white text-resort-button tracking-widest uppercase rounded-none transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-70"
                    >
                      {isVerifyingPayment ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" /> Đang kiểm tra đối soát...
                        </>
                      ) : (
                        "Tôi đã chuyển khoản thành công"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right 4 Columns: Dynamic Booking Bill Summary Stick Widget */}
            <div className="lg:col-span-4 space-y-6">
              <div className={`bg-white border border-primary-100 p-6 shadow-xs text-left sticky top-28 ${radius.card}`}>
                <h3 className="font-serif text-lg font-bold text-sage-950 border-b border-primary-100 pb-3 mb-4">
                  Chi Tiết Thanh Toán
                </h3>
                
                {/* Villa total display */}
                <div className="space-y-3.5 text-xs sm:text-sm">
                  <div className="flex justify-between font-medium">
                    <span className="text-sage-800">Biệt thự ({nightsCount} đêm):</span>
                    <span className="text-sage-950 font-mono">{formatCurrency(villaTotal)}</span>
                  </div>

                  {/* Addon list */}
                  {selectedServices.length > 0 && (
                    <div className="pt-2 border-t border-primary-50 space-y-2">
                      <span className="text-[10px] text-sage-400 uppercase tracking-wider block font-bold">Dịch vụ đi kèm</span>
                      {selectedServices.map((s) => {
                        let itemCost = 0;
                        if (s.type === "per-guest") itemCost = s.price * guestInfo.guestsCount;
                        else if (s.type === "per-guest-per-night") itemCost = s.price * guestInfo.guestsCount * nightsCount;
                        else itemCost = s.price;
                        return (
                          <div key={s.id} className="flex justify-between text-sage-600 text-xs">
                            <span className="truncate pr-4">• {s.title.split("&")[0].trim()}</span>
                            <span className="font-mono">{formatCurrency(itemCost)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Billing status flags */}
                  <div className="pt-4 border-t border-primary-100 space-y-2.5">
                    <div className="flex justify-between font-serif text-base text-sage-950">
                      <span>Tổng chi phí:</span>
                      <span className="font-bold">{formatCurrency(totalAmount)}</span>
                    </div>

                    <div className="flex justify-between text-xs font-semibold text-green-700 bg-green-50/50 p-2">
                      <span>Cọc trước (30%):</span>
                      <span className="font-mono">{formatCurrency(depositAmount)}</span>
                    </div>

                    <div className="flex justify-between text-xs text-sage-500 p-2 border border-dashed border-primary-100">
                      <span>Trả tại quầy (70%):</span>
                      <span className="font-mono">{formatCurrency(remainingAmount)}</span>
                    </div>
                  </div>

                  {/* Technical statuses details */}
                  <div className="pt-4 border-t border-primary-50 space-y-2 text-[10px] font-mono font-medium text-sage-400 bg-primary-50/30 p-3">
                    <div className="flex justify-between">
                      <span>BOOKING STATUS:</span>
                      <span className={`font-bold ${bookingStatus === "CONFIRMED" ? "text-green-700" : bookingStatus === "PENDING_PAYMENT" ? "text-amber-700" : "text-sage-500"}`}>
                        {bookingStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>PAYMENT STATUS:</span>
                      <span className={`font-bold ${paymentStatus === "PAID" ? "text-green-700" : paymentStatus === "PENDING" ? "text-amber-700" : "text-sage-500"}`}>
                        {paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
