import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  ArrowLeft,
  Copy,
  Check,
  Calendar,
  User,
  Phone,
  Users,
  Compass,
  AlertCircle,
  ShieldCheck,
  Info,
} from "lucide-react";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingData } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("qr"); // 'qr', 'card', 'counter'
  const [copiedField, setCopiedField] = useState(null); // 'stk', 'amount', 'memo'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Card Form State
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [cardErrors, setCardErrors] = useState({});

  // Default fallback if someone accesses the page directly
  const displayData = bookingData || {
    fullName: "Nguyễn Văn Khách",
    phone: "0901234567",
    checkInDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    guestsCount: "2",
    interest: "all",
    note: "Không có ghi chú đặc biệt.",
  };

  // Pricing calculation
  const getServiceInfo = (interest) => {
    switch (interest) {
      case "dining":
        return { name: "Ẩm Thực Trị Liệu Dinh Dưỡng", price: 1200000 };
      case "spa":
        return { name: "Spa & Trị Liệu Thảo Dược", price: 1800000 };
      case "yoga":
        return { name: "Yoga & Thiền Định Rừng Thông", price: 800000 };
      case "therapy":
        return { name: "Vật Lý Trị Liệu Cột Sống", price: 2200000 };
      case "all":
      default:
        return { name: "Gói Trị Liệu Thân - Tâm - Trí Toàn Diện", price: 3500000 };
    }
  };

  const service = getServiceInfo(displayData.interest);
  const vat = service.price * 0.1;
  const total = service.price + vat;

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  // Copy to clipboard helper
  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Handle card input changes with formatting
  const handleCardChange = (e) => {
    let { name, value } = e.target;

    if (name === "number") {
      value = value
        .replace(/\s?/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .substring(0, 19);
    } else if (name === "expiry") {
      value = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d{2})/, "$1/$2")
        .substring(0, 5);
    } else if (name === "cvv") {
      value = value.replace(/\D/g, "").substring(0, 3);
    } else if (name === "name") {
      value = value.toUpperCase();
    }

    setCardData((prev) => ({ ...prev, [name]: value }));
    if (cardErrors[name]) {
      setCardErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate Card form
  const validateCardForm = () => {
    const errors = {};
    if (cardData.number.replace(/\s/g, "").length !== 16) {
      errors.number = "Số thẻ phải gồm 16 chữ số.";
    }
    if (!cardData.name.trim()) {
      errors.name = "Họ tên chủ thẻ không được để trống.";
    }
    if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      errors.expiry = "Hạn dùng không đúng định dạng (MM/YY).";
    } else {
      const [month, year] = cardData.expiry.split("/").map(Number);
      if (month < 1 || month > 12) {
        errors.expiry = "Tháng hết hạn từ 01 đến 12.";
      }
    }
    if (cardData.cvv.length !== 3) {
      errors.cvv = "Mã CVV phải gồm 3 chữ số.";
    }
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle pay submission
  const handlePaymentSubmit = (e) => {
    e.preventDefault();

    if (paymentMethod === "card" && !validateCardForm()) {
      return;
    }

    setIsProcessing(true);

    // Simulate API verification
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
    }, 2500);
  };

  // Bank transfer info
  const bankInfo = {
    name: "MB BANK (NGÂN HÀNG QUÂN ĐỘI)",
    accountNumber: "190520269999",
    accountHolder: "CONG TY CO PHAN NGU SON RETREAT",
    memo: `NS ${displayData.phone} ${displayData.checkInDate.replace(/-/g, "")}`,
  };

  // QR Code mock SVG
  const qrSvg = (
    <svg className="w-full h-full text-sage-900" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="6" fill="white" />
      {/* Outer borders and positioning boxes */}
      <rect x="8" y="8" width="24" height="24" stroke="currentColor" strokeWidth="4" fill="none" />
      <rect x="14" y="14" width="12" height="12" fill="currentColor" />
      
      <rect x="68" y="8" width="24" height="24" stroke="currentColor" strokeWidth="4" fill="none" />
      <rect x="74" y="14" width="12" height="12" fill="currentColor" />
      
      <rect x="8" y="68" width="24" height="24" stroke="currentColor" strokeWidth="4" fill="none" />
      <rect x="14" y="74" width="12" height="12" fill="currentColor" />

      {/* Decorative QR code blocks */}
      <rect x="38" y="8" width="8" height="8" fill="currentColor" />
      <rect x="52" y="8" width="4" height="8" fill="currentColor" />
      <rect x="60" y="8" width="4" height="4" fill="currentColor" />
      
      <rect x="38" y="20" width="16" height="4" fill="currentColor" />
      <rect x="58" y="20" width="6" height="8" fill="currentColor" />
      
      <rect x="8" y="38" width="8" height="8" fill="currentColor" />
      <rect x="20" y="38" width="12" height="4" fill="currentColor" />
      <rect x="36" y="32" width="20" height="4" fill="currentColor" />
      <rect x="60" y="32" width="8" height="8" fill="currentColor" />
      <rect x="74" y="38" width="18" height="4" fill="currentColor" />

      <rect x="8" y="50" width="4" height="12" fill="currentColor" />
      <rect x="16" y="50" width="16" height="4" fill="currentColor" />
      <rect x="36" y="44" width="8" height="16" fill="currentColor" />
      <rect x="48" y="44" width="16" height="8" fill="currentColor" />
      <rect x="68" y="50" width="8" height="8" fill="currentColor" />
      <rect x="80" y="48" width="12" height="16" fill="currentColor" />

      <rect x="38" y="68" width="4" height="16" fill="currentColor" />
      <rect x="46" y="64" width="16" height="4" fill="currentColor" />
      <rect x="46" y="72" width="12" height="12" fill="currentColor" />
      <rect x="68" y="68" width="8" height="4" fill="currentColor" />
      <rect x="68" y="76" width="24" height="4" fill="currentColor" />
      <rect x="76" y="84" width="16" height="8" fill="currentColor" />
      <rect x="8" y="94" width="24" height="2" fill="currentColor" />

      {/* Center Icon placeholder */}
      <rect x="42" y="42" width="16" height="16" rx="4" fill="white" stroke="currentColor" strokeWidth="2" />
      <path d="M46 50 C46 47, 54 47, 54 50 C54 53, 46 51, 46 54 C46 56, 54 56, 54 54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );

  return (
    <div className="bg-[#fafbfa] min-h-screen pt-28 pb-20 font-sans text-sage-950">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        
        {/* Navigation Breadcrumb back to Home */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-semibold tracking-wider text-sage-600 hover:text-primary-800 transition-colors uppercase"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại trang chủ
          </Link>
          <span className="text-[10px] bg-primary-100/50 border border-primary-200 text-primary-900 px-3 py-1 font-semibold uppercase tracking-wider">
            Secure Payment Gateway
          </span>
        </div>

        {isPaid ? (
          /* Payment success screen */
          <div className="bg-white border border-primary-100 max-w-2xl mx-auto p-8 sm:p-12 text-center shadow-md animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400" />
            
            <div className="inline-flex p-4 bg-primary-100 text-primary-800 rounded-full mb-6">
              <CheckCircle2 className="h-14 w-14" />
            </div>

            <h1 className="font-serif text-3xl font-normal text-sage-900 mb-2">
              Thanh Toán Thành Công!
            </h1>
            <p className="text-sage-600 text-sm max-w-md mx-auto mb-8 font-light leading-relaxed">
              Cảm ơn quý khách đã hoàn tất thanh toán. Phiếu xác nhận đặt lịch trải nghiệm đã được ghi nhận và đồng bộ vào hệ thống quản lý của resort.
            </p>

            {/* Receipt invoice detail box */}
            <div className="border border-primary-100 bg-primary-50/20 text-left p-6 sm:p-8 space-y-4 mb-8 text-xs sm:text-sm">
              <div className="flex justify-between pb-3 border-b border-primary-100">
                <span className="font-bold uppercase tracking-wider text-sage-400 text-[10px]">
                  Thông tin hóa đơn
                </span>
                <span className="font-mono text-primary-800 font-bold">
                  Invoice ID: #NS-{Math.floor(100000 + Math.random() * 900000)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-2.5">
                <span className="text-sage-500 font-light">Khách hàng:</span>
                <span className="font-semibold text-right">{displayData.fullName}</span>

                <span className="text-sage-500 font-light">Số điện thoại:</span>
                <span className="font-semibold text-right">{displayData.phone}</span>

                <span className="text-sage-500 font-light">Ngày nhận phòng:</span>
                <span className="font-semibold text-right">{displayData.checkInDate}</span>

                <span className="text-sage-500 font-light">Số lượng khách:</span>
                <span className="font-semibold text-right">{displayData.guestsCount} Khách</span>

                <span className="text-sage-500 font-light">Dịch vụ đã chọn:</span>
                <span className="font-semibold text-right text-primary-800">{service.name}</span>
              </div>

              <div className="pt-3 border-t border-primary-100 flex justify-between items-center text-sm sm:text-base font-serif">
                <span className="font-normal text-sage-900">Tổng thanh toán:</span>
                <span className="font-bold text-primary-900">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-primary-800 text-white text-xs font-semibold tracking-wider hover:bg-primary-900 transition-all uppercase rounded-none cursor-pointer"
              >
                Về trang chủ
              </Link>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center justify-center px-8 py-3 border border-sage-800 text-sage-800 text-xs font-semibold tracking-wider hover:bg-sage-50 transition-all uppercase rounded-none"
              >
                In hóa đơn tạm tính
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-sage-100 flex justify-center items-center text-[10px] text-sage-400 space-x-2">
              <ShieldCheck className="h-4 w-4 text-primary-600" />
              <span>Giao dịch bảo mật bởi SSL & PCI-DSS Compliance</span>
            </div>
          </div>
        ) : (
          /* Checkout page layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Summary of Booking */}
            <div className="lg:col-span-5 bg-white border border-primary-100 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="border-b border-primary-100 pb-4">
                <span className="text-[10px] font-bold text-primary-750 uppercase tracking-widest block mb-1">
                  Ngũ Sơn Resort
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-normal text-sage-950">
                  Tóm Tắt Đặt Lịch
                </h2>
              </div>

              {/* Guest details items */}
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-center space-x-3 text-sage-700">
                  <User className="h-4.5 w-4.5 text-primary-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase text-sage-400 block tracking-wider leading-none mb-1">
                      Họ và tên khách hàng
                    </span>
                    <span className="font-semibold text-sage-900">{displayData.fullName}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-sage-700">
                  <Phone className="h-4.5 w-4.5 text-primary-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase text-sage-400 block tracking-wider leading-none mb-1">
                      Số điện thoại
                    </span>
                    <span className="font-semibold text-sage-900">{displayData.phone}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-sage-700">
                  <Calendar className="h-4.5 w-4.5 text-primary-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase text-sage-400 block tracking-wider leading-none mb-1">
                      Ngày nhận phòng dự kiến
                    </span>
                    <span className="font-semibold text-sage-900">{displayData.checkInDate}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-sage-700">
                  <Users className="h-4.5 w-4.5 text-primary-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase text-sage-400 block tracking-wider leading-none mb-1">
                      Số khách đi cùng
                    </span>
                    <span className="font-semibold text-sage-900">{displayData.guestsCount} Người</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-sage-700">
                  <Compass className="h-4.5 w-4.5 text-primary-400 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase text-sage-400 block tracking-wider leading-none mb-1">
                      Dịch vụ đăng ký
                    </span>
                    <span className="font-semibold text-primary-850 block leading-tight">
                      {service.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price summary table */}
              <div className="border-t border-primary-100 pt-6 space-y-3.5 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-sage-500 font-light">Giá phòng & Liệu trình:</span>
                  <span className="font-medium">{formatCurrency(service.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sage-500 font-light">Thuế VAT (10%):</span>
                  <span className="font-medium">{formatCurrency(vat)}</span>
                </div>
                <div className="border-t border-primary-100/50 pt-4 flex justify-between items-center text-base sm:text-lg font-serif">
                  <span className="font-normal text-sage-950">Tổng thanh toán:</span>
                  <span className="font-bold text-primary-950">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Policy alert */}
              <div className="p-4 bg-primary-50/50 border border-primary-100 flex items-start space-x-2 text-[10px] text-sage-600 leading-relaxed font-light">
                <Info className="h-4.5 w-4.5 text-primary-600 mt-0.5 flex-shrink-0" />
                <span>
                  Chính sách hủy phòng: Quý khách được hủy lịch miễn phí tối đa 48 giờ trước giờ check-in đã chọn. Mọi giao dịch hoàn trả sẽ thực hiện trong 3-5 ngày làm việc.
                </span>
              </div>
            </div>

            {/* Right Column: Payment Options */}
            <div className="lg:col-span-7 bg-white border border-primary-100 shadow-xs">
              
              {/* Payment Methods tabs selector */}
              <div className="grid grid-cols-3 border-b border-primary-100">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("qr")}
                  className={`py-4 px-2 text-center text-xs font-semibold tracking-wider uppercase border-b-2 flex flex-col items-center justify-center space-y-2 transition-all ${
                    paymentMethod === "qr"
                      ? "border-primary-800 text-primary-900 bg-primary-50/20"
                      : "border-transparent text-sage-400 hover:text-sage-700 bg-white"
                  }`}
                >
                  <QrCode className="h-5 w-5" />
                  <span>Chuyển Khoản QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`py-4 px-2 text-center text-xs font-semibold tracking-wider uppercase border-b-2 flex flex-col items-center justify-center space-y-2 transition-all ${
                    paymentMethod === "card"
                      ? "border-primary-800 text-primary-900 bg-primary-50/20"
                      : "border-transparent text-sage-400 hover:text-sage-700 bg-white"
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Thẻ Quốc Tế</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("counter")}
                  className={`py-4 px-2 text-center text-xs font-semibold tracking-wider uppercase border-b-2 flex flex-col items-center justify-center space-y-2 transition-all ${
                    paymentMethod === "counter"
                      ? "border-primary-800 text-primary-900 bg-primary-50/20"
                      : "border-transparent text-sage-400 hover:text-sage-700 bg-white"
                  }`}
                >
                  <Building className="h-5 w-5" />
                  <span>Tại Quầy Resort</span>
                </button>
              </div>

              {/* Payment Content Panels */}
              <div className="p-6 sm:p-8">
                {paymentMethod === "qr" && (
                  /* 1. BANK TRANSFER & QR */
                  <div className="space-y-6 animate-fade-in text-left">
                    <p className="text-xs sm:text-sm font-light text-sage-600 leading-relaxed">
                      Sử dụng ứng dụng ngân hàng bất kỳ trên điện thoại di động của bạn để quét mã QR bên dưới, hoặc nhập thông tin chuyển khoản chính xác để hệ thống tự động duyệt lịch.
                    </p>

                    <div className="flex flex-col md:flex-row items-center gap-8 bg-primary-50/15 border border-primary-100/50 p-6">
                      
                      {/* Left: QR code frame */}
                      <div className="w-44 h-44 bg-white p-3 border border-primary-100 flex-shrink-0 flex items-center justify-center shadow-xs">
                        {qrSvg}
                      </div>

                      {/* Right: Transfer values list */}
                      <div className="w-full space-y-3.5 text-xs sm:text-sm font-medium">
                        <div>
                          <span className="text-[10px] text-sage-400 uppercase tracking-wider block leading-none mb-1">
                            Ngân hàng thụ hưởng
                          </span>
                          <span className="text-sage-900 font-bold">{bankInfo.name}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-sage-400 uppercase tracking-wider block leading-none mb-1">
                            Số tài khoản
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-primary-900 font-mono font-bold tracking-wider">
                              {bankInfo.accountNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(bankInfo.accountNumber, "stk")}
                              className="text-sage-400 hover:text-primary-850 transition-colors p-1"
                              title="Sao chép số tài khoản"
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
                            Tên người thụ hưởng
                          </span>
                          <span className="text-sage-900 uppercase font-bold">{bankInfo.accountHolder}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-sage-400 uppercase tracking-wider block leading-none mb-1">
                            Số tiền cần chuyển
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-primary-900 font-bold text-base font-serif">
                              {formatCurrency(total)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(total.toString(), "amount")}
                              className="text-sage-400 hover:text-primary-850 transition-colors p-1"
                              title="Sao chép số tiền"
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
                            Nội dung chuyển khoản (Bắt buộc)
                          </span>
                          <div className="flex items-center space-x-2 bg-yellow-50 border border-yellow-200 px-3 py-1.5 self-start">
                            <span className="text-sage-900 font-mono font-bold tracking-wide">
                              {bankInfo.memo}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(bankInfo.memo, "memo")}
                              className="text-sage-450 hover:text-primary-850 transition-colors p-1"
                              title="Sao chép nội dung"
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

                    <div className="pt-4 border-t border-primary-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                      <span className="text-sage-500 font-light flex items-center">
                        <AlertCircle className="h-4 w-4 text-primary-600 mr-1.5 flex-shrink-0" />
                        Hệ thống tự động duyệt lệnh sau 1-2 phút chuyển khoản thành công.
                      </span>
                      <button
                        type="button"
                        onClick={handlePaymentSubmit}
                        disabled={isProcessing}
                        className="w-full sm:w-auto px-8 py-3 bg-primary-800 hover:bg-primary-900 text-white font-semibold tracking-wider uppercase rounded-none transition-all duration-300 disabled:opacity-75 cursor-pointer text-center"
                      >
                        {isProcessing ? "Đang kiểm tra kết nối..." : "Tôi đã chuyển khoản"}
                      </button>
                    </div>
                  </div>
                )}

                {paymentMethod === "card" && (
                  /* 2. VISA / MASTERCARD */
                  <form onSubmit={handlePaymentSubmit} className="space-y-6 animate-fade-in text-left">
                    <p className="text-xs sm:text-sm font-light text-sage-600 leading-relaxed">
                      Cung cấp thông tin thẻ tín dụng hoặc thẻ ghi nợ quốc tế Visa, Mastercard, JCB hoặc Amex để xử lý thanh toán trực tuyến bảo mật.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm font-medium">
                      
                      {/* Card Number field */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-sage-900 uppercase tracking-wider mb-2">
                          Số thẻ
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="number"
                            placeholder="4111 2222 3333 4444"
                            value={cardData.number}
                            onChange={handleCardChange}
                            required
                            className={`w-full px-4 py-3 bg-sage-50/50 border rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400 font-mono tracking-widest text-sm ${
                              cardErrors.number ? "border-red-400" : "border-primary-200/50"
                            }`}
                          />
                          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-sage-400">
                            <CreditCard className="h-5 w-5" />
                          </div>
                        </div>
                        {cardErrors.number && (
                          <span className="text-red-500 text-[10px] mt-1 block font-normal">{cardErrors.number}</span>
                        )}
                      </div>

                      {/* Cardholder Name field */}
                      <div>
                        <label className="block text-xs font-semibold text-sage-900 uppercase tracking-wider mb-2">
                          Tên trên thẻ
                        </label>
                        <input
                          type="text"
                          name="name"
                          placeholder="NGUYEN VAN A"
                          value={cardData.name}
                          onChange={handleCardChange}
                          required
                          className={`w-full px-4 py-3 bg-sage-50/50 border rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400 ${
                            cardErrors.name ? "border-red-400" : "border-primary-200/50"
                          }`}
                        />
                        {cardErrors.name && (
                          <span className="text-red-500 text-[10px] mt-1 block font-normal">{cardErrors.name}</span>
                        )}
                      </div>

                      {/* Expiry & CVV fields grid split */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-sage-900 uppercase tracking-wider mb-2">
                            Hạn dùng (MM/YY)
                          </label>
                          <input
                            type="text"
                            name="expiry"
                            placeholder="12/28"
                            value={cardData.expiry}
                            onChange={handleCardChange}
                            required
                            className={`w-full px-3 py-3 bg-sage-50/50 border rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400 text-center font-mono ${
                              cardErrors.expiry ? "border-red-400" : "border-primary-200/50"
                            }`}
                          />
                          {cardErrors.expiry && (
                            <span className="text-red-500 text-[10px] mt-1 block font-normal">{cardErrors.expiry}</span>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-sage-900 uppercase tracking-wider mb-2">
                            Mã CVV / CVC
                          </label>
                          <input
                            type="password"
                            name="cvv"
                            placeholder="***"
                            value={cardData.cvv}
                            onChange={handleCardChange}
                            required
                            className={`w-full px-3 py-3 bg-sage-50/50 border rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400 text-center font-mono ${
                              cardErrors.cvv ? "border-red-400" : "border-primary-200/50"
                            }`}
                          />
                          {cardErrors.cvv && (
                            <span className="text-red-500 text-[10px] mt-1 block font-normal">{cardErrors.cvv}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-primary-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                      <span className="text-sage-500 font-light flex items-center">
                        <ShieldCheck className="h-4.5 w-4.5 text-primary-600 mr-1.5 flex-shrink-0" />
                        Kết nối mã hóa bảo mật SSL 256-bit
                      </span>
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full sm:w-auto px-8 py-3 bg-primary-800 hover:bg-primary-900 text-white font-semibold tracking-wider uppercase rounded-none transition-all duration-300 disabled:opacity-75 cursor-pointer text-center"
                      >
                        {isProcessing ? "Đang xử lý giao dịch..." : `Thanh toán ${formatCurrency(total)}`}
                      </button>
                    </div>
                  </form>
                )}

                {paymentMethod === "counter" && (
                  /* 3. PAY AT COUNTER */
                  <div className="space-y-6 animate-fade-in text-left">
                    <p className="text-xs sm:text-sm font-light text-sage-600 leading-relaxed">
                      Quý khách có thể lựa chọn hình thức thanh toán sau trực tiếp bằng tiền mặt hoặc quẹt thẻ tại quầy lễ tân khi làm thủ tục check-in tại Ngũ Sơn Resort.
                    </p>

                    <div className="bg-primary-50/20 border border-primary-100 p-6 space-y-4">
                      <h4 className="font-serif text-sm font-bold text-sage-900">
                        Quy trình xác nhận lịch trình
                      </h4>
                      <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-sage-700 font-light leading-relaxed">
                        <li>
                          Hệ thống sẽ giữ lịch tư vấn và dịch vụ tạm thời cho quý khách trong vòng 24h.
                        </li>
                        <li>
                          Trong vòng 15 phút tới, chuyên viên sức khỏe của Ngũ Sơn sẽ gọi điện xác thực lại các yêu cầu đặc biệt của quý khách.
                        </li>
                        <li>
                          Chúng tôi sẽ gửi một mã đặt phòng/dịch vụ (Booking Code) qua SMS/Zalo.
                        </li>
                        <li>
                          Quý khách xuất trình mã này tại quầy lễ tân khi đến resort để tiến hành thanh toán và nhận phòng.
                        </li>
                      </ol>
                    </div>

                    <div className="pt-4 border-t border-primary-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                      <span className="text-sage-500 font-light flex items-center">
                        <AlertCircle className="h-4.5 w-4.5 text-primary-600 mr-1.5 flex-shrink-0" />
                        Miễn phí giữ phòng tạm thời trong 24 giờ.
                      </span>
                      <button
                        type="button"
                        onClick={handlePaymentSubmit}
                        disabled={isProcessing}
                        className="w-full sm:w-auto px-8 py-3 bg-primary-800 hover:bg-primary-900 text-white font-semibold tracking-wider uppercase rounded-none transition-all duration-300 disabled:opacity-75 cursor-pointer text-center"
                      >
                        {isProcessing ? "Đang ghi nhận..." : "Xác nhận đặt tại quầy"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
