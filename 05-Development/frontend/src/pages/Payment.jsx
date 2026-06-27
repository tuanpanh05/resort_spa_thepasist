import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  QrCode,
  Building,
  CheckCircle2,
  ArrowLeft,
  Copy,
  Check,
  Calendar,
  User,
  AlertCircle,
  ShieldCheck,
  Info,
  Loader2,
  DollarSign
} from "lucide-react";
import { paymentApi, bookingLookupApi } from "../api";

export default function Payment() {
  const [searchParams, setSearchParams] = useSearchParams();
  const invoiceIdParam = searchParams.get("invoiceId");
  
  const [invoiceId, setInvoiceId] = useState(invoiceIdParam ? parseInt(invoiceIdParam) : 2);
  const [invoice, setInvoice] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [paymentMethod, setPaymentMethod] = useState("vnpay"); // 'vnpay', 'cash'
  const [copiedField, setCopiedField] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Voucher states
  const [voucherCode, setVoucherCode] = useState("");
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  useEffect(() => {
    if (invoice && invoice.voucherCode) {
      setVoucherCode(invoice.voucherCode);
    }
  }, [invoice]);

  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);
    paymentApi.getInvoice(invoiceId)
      .then((data) => {
        setInvoice(data);
        setLoading(false);
        const isPaidNow = 
          data.status === "PAID" || 
          (data.bookingStatus === "CONFIRMED" && Number(data.depositAmount || 0) > 0);
        if (isPaidNow) {
          setIsPaid(true);
        }
      })
      .catch((err) => {
        setErrorMsg(err.message || `Không thể tìm thấy hóa đơn #${invoiceId} trong hệ thống.`);
        setLoading(false);
      });
  }, [invoiceId]);

  useEffect(() => {
    if (invoice && invoice.bookingId) {
      bookingLookupApi.getItinerary(invoice.bookingId)
        .then((data) => {
          setItinerary(data);
        })
        .catch((err) => {
          console.warn("Lỗi khi tải lịch trình chi tiết:", err);
        });
    } else {
      setItinerary(null);
    }
  }, [invoice]);

  const handleSelectInvoice = (e) => {
    const val = parseInt(e.target.value);
    setInvoiceId(val);
    setSearchParams({ invoiceId: val.toString() });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);
  };

  const isDepositPayment = invoice?.bookingStatus === "PENDING_DEPOSIT";
  const isDepositFlow =
    isDepositPayment ||
    (invoice?.bookingStatus === "CONFIRMED" &&
      invoice?.status === "UNPAID" &&
      Number(invoice?.depositAmount || 0) > 0);
  const depositPayable = isDepositPayment
    ? Math.ceil(Number(invoice?.finalAmount || 0) * 0.3)
    : Number(invoice?.amountDue || invoice?.finalAmount || 0);
  const displayDueAmount = isDepositPayment ? depositPayable : Number(invoice?.amountDue || 0);

  const hasSpaBookings = itinerary?.timeline?.some(e => e.type === "SPA" && e.status && (e.status.toUpperCase() === "CONFIRMED" || e.status.toUpperCase() === "COMPLETED"));
  const hasPackages = (itinerary?.retreatPackages && itinerary.retreatPackages.length > 0) || itinerary?.packageName;

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setIsApplyingVoucher(true);
    try {
      const updatedInvoice = await paymentApi.applyVoucher(invoiceId, voucherCode.trim());
      setInvoice(updatedInvoice);
      alert("Áp dụng mã giảm giá thành công!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Không thể áp dụng mã giảm giá.");
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = async () => {
    setIsApplyingVoucher(true);
    try {
      const updatedInvoice = await paymentApi.removeVoucher(invoiceId);
      setInvoice(updatedInvoice);
      setVoucherCode("");
      alert("Đã gỡ bỏ mã giảm giá.");
    } catch (err) {
      console.error(err);
      alert(err.message || "Không thể gỡ bỏ mã giảm giá.");
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handlePaymentSubmit = (e) => {
    if (e) e.preventDefault();
    setIsProcessing(true);

    if (paymentMethod === "vnpay") {
      paymentApi.getPaymentUrl(invoiceId)
        .then((data) => {
          setIsProcessing(false);
          // Redirect the guest to VNPay Sandbox URL
          window.location.href = data.paymentUrl;
        })
        .catch((err) => {
          setIsProcessing(false);
          alert(err.message || "Gặp lỗi khi tạo link thanh toán VNPay.");
        });
    } else if (paymentMethod === "cash") {
      paymentApi.markCashPayment(invoiceId)
        .then((data) => {
          if (data.bookingStatus === "CONFIRMED" && data.status === "UNPAID") {
            setIsProcessing(false);
            setIsPaid(true);
            setInvoice(data);
            return;
          }

          // Final check-out payment flow
          paymentApi.performCheckout(invoiceId)
            .then(() => {
              setIsProcessing(false);
              setIsPaid(true);
              setInvoice(data);
            })
            .catch((err) => {
              console.warn("Perform checkout failed after cash payment: ", err);
              setIsProcessing(false);
              setIsPaid(true);
            });
        })
        .catch((err) => {
          setIsProcessing(false);
          alert(err.message || "Lỗi khi xác nhận thanh toán tiền mặt.");
        });
    }
  };

  const handleRefreshStatus = () => {
    setIsProcessing(true);
    paymentApi.getInvoice(invoiceId)
      .then((data) => {
        setInvoice(data);
        setIsProcessing(false);
        
        const isPaidNow = 
          data.status === "PAID" || 
          (data.bookingStatus === "CONFIRMED" && Number(data.depositAmount || 0) > 0);

        if (isPaidNow) {
          setIsPaid(true);
        } else {
          alert("Hóa đơn hiện vẫn chưa được xác nhận thanh toán. Vui lòng liên hệ quầy lễ tân.");
        }
      })
      .catch((err) => {
        setIsProcessing(false);
        alert(err.message || "Không thể tải lại thông tin hóa đơn.");
      });
  };

  if (loading) {
    return (
      <div className="bg-[#fafbfa] min-h-screen pt-36 pb-20 flex flex-col items-center justify-center font-sans text-sage-950">
        <div className="p-8 bg-white border border-primary-100 text-center shadow-md max-w-md w-full space-y-4">
          <Loader2 className="h-12 w-12 text-primary-800 animate-spin mx-auto" />
          <h3 className="font-serif text-lg font-bold text-sage-900">Đang tải hóa đơn...</h3>
          <p className="text-xs text-sage-500 font-light leading-relaxed">
            Hệ thống đang truy xuất dữ liệu Guest Folio từ cơ sở dữ liệu Resort. Vui lòng chờ trong giây lát.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafbfa] min-h-screen pt-28 pb-20 font-sans text-sage-950">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        
        {/* Navigation Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-semibold tracking-wider text-sage-600 hover:text-primary-800 transition-colors uppercase"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại trang chủ
          </Link>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 text-sm mb-8 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-red-650 mx-auto" />
            <p className="font-semibold">{errorMsg}</p>
            <p className="text-xs font-light text-sage-500">
              Vui lòng đảm bảo rằng bạn đã khởi chạy Backend ở cổng 8080 và đã seed đầy đủ dữ liệu database qua file `module5_extension.sql`.
            </p>
          </div>
        )}

        {!errorMsg && (
          isPaid ? (
            /* Payment success screen */
            <div className="bg-white border border-primary-100 max-w-2xl mx-auto p-8 sm:p-12 text-center shadow-md animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400" />
              
              <div className="inline-flex p-4 bg-primary-100 text-primary-800 rounded-full mb-6">
                <CheckCircle2 className="h-14 w-14" />
              </div>

              <h1 className="font-serif text-3xl font-normal text-sage-900 mb-2">
                {isDepositFlow ? "Thanh Toán Cọc Thành Công!" : "Thanh Toán Thành Công!"}
              </h1>
              <p className="text-xs sm:text-sm text-sage-600 max-w-md mx-auto mb-8 font-light leading-relaxed">
                {isDepositFlow
                  ? "Cảm ơn quý khách đã thanh toán tiền cọc. Đặt phòng đã được xác nhận. Số dư còn lại sẽ thanh toán khi trả phòng."
                  : "Cảm ơn quý khách đã hoàn tất thanh toán hóa đơn. Thủ tục Check-out đã được thực hiện tự động và trạng thái phòng đã đổi thành **DIRTY** để vệ sinh."}
              </p>

              {/* Receipt invoice detail box */}
              <div className="border border-primary-100 bg-primary-50/20 text-left p-6 sm:p-8 space-y-4 mb-8 text-xs sm:text-sm">
                <div className="flex justify-between pb-3 border-b border-primary-100">
                  <span className="font-bold uppercase tracking-wider text-sage-400 text-[10px]">
                    Hóa Đơn Tổng Hợp
                  </span>
                  <span className="font-mono text-primary-800 font-bold">
                    Mã Hóa Đơn: #NS-{invoice?.invoiceId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-2.5">
                  <span className="text-sage-500 font-light">Mã khách hàng:</span>
                  <span className="font-semibold text-right">#USR-{invoice?.userId}</span>

                  <span className="text-sage-500 font-light">Mã đặt phòng:</span>
                  <span className="font-semibold text-right">#BK-{invoice?.bookingId}</span>

                  <span className="text-sage-500 font-light">Trạng thái Hóa đơn:</span>
                  <span className={`font-bold text-right uppercase ${isDepositFlow ? "text-amber-700" : "text-green-700"}`}>
                    {isDepositFlow ? "ĐÃ THANH TOÁN CỌC" : "ĐÃ THANH TOÁN"}
                  </span>

                  <span className="text-sage-500 font-light">Hình thức thanh toán:</span>
                  <span className="font-semibold text-right text-primary-850">Tiền mặt tại quầy</span>
                </div>

                {/* Itemized List in Paid Receipt */}
                <div className="border-t border-dashed border-primary-200/50 pt-4 mt-4 space-y-3.5 text-xs">
                  <div className="font-bold text-sage-500 uppercase tracking-wider text-[9px]">Chi tiết các dịch vụ:</div>
                  
                  {/* Room */}
                  <div className="flex justify-between text-sage-600 font-light">
                    <div>
                      <span className="font-semibold text-sage-800">🛏️ {itinerary?.roomTypeName || invoice?.roomNumber || "Phòng nghỉ"}</span>
                      <span className="text-[10px] text-sage-500 block">Số phòng: {itinerary?.roomNumber || invoice?.roomNumber || "N/A"}</span>
                    </div>
                    <span className="font-mono font-semibold">{invoice?.roomSubtotal ? formatCurrency(invoice.roomSubtotal) : "0 ₫"}</span>
                  </div>

                  {/* Spa & Retreat Packages */}
                  {(hasSpaBookings || hasPackages) && (
                    <div className="space-y-1.5">
                      <span className="font-semibold text-sage-800 block">💆‍♀️ Trị liệu Spa phát sinh & Gói dịch vụ:</span>
                      
                      {/* Packages */}
                      {itinerary?.retreatPackages && itinerary.retreatPackages.length > 0 ? (
                        itinerary.retreatPackages.map((pkg, idx) => (
                          <div key={`rec-pkg-${idx}`} className="flex justify-between text-sage-500 text-[10px] pl-4 font-light">
                            <span>🎁 Gói dịch vụ: {pkg.name} ({pkg.durationDays} ngày)</span>
                            <span className="font-mono">{formatCurrency(pkg.price)}</span>
                          </div>
                        ))
                      ) : itinerary?.packageName ? (
                        <div className="flex justify-between text-sage-500 text-[10px] pl-4 font-light">
                          <span>🎁 Gói dịch vụ: {itinerary.packageName} ({itinerary.packageDurationDays} ngày)</span>
                          <span className="font-mono">{itinerary.packagePrice ? formatCurrency(itinerary.packagePrice) : "0 ₫"}</span>
                        </div>
                      ) : null}

                      {/* Individual Spa Sessions */}
                      {itinerary?.timeline
                        ?.filter(e => e.type === "SPA" && e.status && (e.status.toUpperCase() === "CONFIRMED" || e.status.toUpperCase() === "COMPLETED"))
                        .map((event, idx) => (
                          <div key={`rec-spa-${idx}`} className="flex justify-between text-sage-500 text-[10px] pl-4 font-light">
                            <span>💆‍♀️ {event.title}</span>
                            <span className="font-mono">{formatCurrency(event.price)}</span>
                          </div>
                        ))}

                      {invoice?.spaChildDiscount > 0 && (
                        <div className="flex justify-between text-emerald-700 text-[10px] pl-4 font-semibold">
                          <span>👶 Giảm giá dịch vụ Trẻ em:</span>
                          <span className="font-mono">-{formatCurrency(invoice.spaChildDiscount)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Food */}
                  {itinerary?.timeline?.filter(e => e.type === "FOOD" && e.status && (e.status.toUpperCase() === "READY" || e.status.toUpperCase() === "DELIVERED")).length > 0 && (
                    <div className="space-y-1.5">
                      <span className="font-semibold text-sage-800 block">🍲 Dịch vụ ẩm thực F&B:</span>
                      {itinerary.timeline
                        .filter(e => e.type === "FOOD" && e.status && (e.status.toUpperCase() === "READY" || e.status.toUpperCase() === "DELIVERED"))
                        .map((event, idx) => (
                          <div key={idx} className="flex justify-between text-sage-500 text-[10px] pl-4 font-light">
                            <span>{event.title} ({event.description || "Số lượng: 1"})</span>
                            <span className="font-mono">{formatCurrency(event.price)}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-primary-100 flex justify-between items-center text-sm sm:text-base font-serif">
                  <span className="font-normal text-sage-900">
                    {isDepositFlow ? "Tiền cọc đã thanh toán (30%):" : "Tổng thanh toán:"}
                  </span>
                  <span className="font-bold text-primary-900">
                    {formatCurrency(isDepositFlow ? invoice?.depositAmount || depositPayable : invoice?.amountDue || invoice?.finalAmount)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-8 py-3 bg-primary-800 text-white text-xs font-semibold tracking-wider hover:bg-primary-900 transition-all uppercase rounded-none cursor-pointer"
                >
                  Về trang chủ
                </Link>
                <Link
                  to={`/payment-result?vnp_ResponseCode=00&vnp_TxnRef=${invoice?.invoiceId}&vnp_TransactionNo=CASH-${invoice?.invoiceId}`}
                  className="inline-flex items-center justify-center px-8 py-3 border border-sage-800 text-sage-800 text-xs font-semibold tracking-wider hover:bg-sage-50 transition-all uppercase rounded-none cursor-pointer"
                >
                  Xem Trang Feedback
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-sage-100 flex justify-center items-center text-[10px] text-sage-400 space-x-2">
                <ShieldCheck className="h-4 w-4 text-primary-600" />
                <span>Giao dịch hoàn tất và ghi nhận nhật ký hệ thống (BR-26)</span>
              </div>
            </div>
          ) : (
            /* Checkout page layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* Left Column: Summary of Booking */}
              <div className="lg:col-span-5 bg-white border border-primary-100 p-6 sm:p-8 space-y-6 shadow-xs text-left">
                <div className="border-b border-primary-100 pb-4">
                  <span className="text-[10px] font-bold text-primary-750 uppercase tracking-widest block mb-1">
                    Ngũ Sơn Resort & Spa
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-normal text-sage-950 mb-1">
                    Chi Tiết Guest Folio
                  </h2>
                </div>

                {/* Guest details items */}
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="flex items-center space-x-3 text-sage-700">
                    <User className="h-4.5 w-4.5 text-primary-400 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase text-sage-400 block tracking-wider leading-none mb-1">
                        Thông tin khách hàng
                      </span>
                      <span className="font-semibold text-sage-900">Mã KH: #USR-{invoice?.userId}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-sage-700">
                    <Calendar className="h-4.5 w-4.5 text-primary-400 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase text-sage-400 block tracking-wider leading-none mb-1">
                        Mã đặt phòng liên kết
                      </span>
                      <span className="font-semibold text-sage-900">#BK-{invoice?.bookingId}</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Booked Items */}
                <div className="border-t border-primary-100 pt-6 space-y-4 text-xs">
                  <h3 className="font-serif font-bold text-sm text-sage-900 uppercase tracking-wider mb-2">
                    Chi Tiết Dịch Vụ Đã Đặt
                  </h3>

                  {/* Room & Nights */}
                  <div className="space-y-1.5 border-b border-dashed border-primary-100 pb-3">
                    <div className="flex justify-between font-semibold text-sage-900 text-[11px]">
                      <span>🛏️ {itinerary?.roomTypeName || invoice?.roomNumber || "Phòng nghỉ dưỡng"}</span>
                      <span className="font-mono">{invoice?.roomSubtotal ? formatCurrency(invoice.roomSubtotal) : "0 ₫"}</span>
                    </div>
                    <div className="text-[10px] text-sage-500 pl-4 space-y-0.5 font-light">
                      <span className="block">Số phòng: {itinerary?.roomNumber || invoice?.roomNumber || "N/A"}</span>
                      {invoice?.checkInDate && invoice?.checkOutDate && (
                        <span className="block">
                          Thời gian: {new Date(invoice.checkInDate).toLocaleDateString("vi-VN")} - {new Date(invoice.checkOutDate).toLocaleDateString("vi-VN")} ({Math.ceil((new Date(invoice.checkOutDate) - new Date(invoice.checkInDate)) / (1000 * 60 * 60 * 24)) || 1} đêm)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Spa & Retreat Packages */}
                  {(hasSpaBookings || hasPackages) && (
                    <div className="space-y-1.5 border-b border-dashed border-primary-100 pb-3">
                      <div className="font-semibold text-sage-900 text-[11px]">
                        💆‍♀️ Trị liệu Spa & Gói dịch vụ:
                      </div>
                      <div className="space-y-2 pl-4">
                        {/* Retreat Packages */}
                        {itinerary?.retreatPackages && itinerary.retreatPackages.length > 0 ? (
                          itinerary.retreatPackages.map((pkg, idx) => (
                            <div key={`left-pkg-${idx}`} className="text-sage-600 text-[10px] font-light">
                              <div className="font-medium text-primary-750">
                                🎁 Gói dịch vụ: {pkg.name} ({pkg.durationDays} ngày)
                              </div>
                              <div className="text-[9px] text-sage-400 font-light block leading-relaxed mt-0.5">
                                {pkg.description}
                              </div>
                            </div>
                          ))
                        ) : itinerary?.packageName ? (
                          <div className="text-sage-600 text-[10px] font-light">
                            <div className="font-medium text-primary-750">
                              🎁 Gói dịch vụ: {itinerary.packageName} ({itinerary.packageDurationDays} ngày)
                            </div>
                            <div className="text-[9px] text-sage-400 font-light block leading-relaxed mt-0.5">
                              {itinerary.packageDescription}
                            </div>
                          </div>
                        ) : null}

                        {/* Individual Spa Sessions */}
                        {itinerary?.timeline
                          ?.filter(e => e.type === "SPA" && e.status && (e.status.toUpperCase() === "CONFIRMED" || e.status.toUpperCase() === "COMPLETED"))
                          .map((event, idx) => (
                            <div key={`left-spa-${idx}`} className="flex justify-between text-sage-600 text-[10px] font-light pt-1.5 border-t border-dashed border-sage-100/50">
                              <div>
                                <span>💆‍♀️ {event.title}</span>
                                <span className="text-[9px] bg-primary-100 text-primary-800 px-1 py-0.2 ml-1 rounded font-medium">
                                  {event.status.toUpperCase() === "COMPLETED" ? "Đã thực hiện" : "Đã đặt"}
                                </span>
                              </div>
                              <span className="font-mono">{formatCurrency(event.price)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Food Orders */}
                  {itinerary?.timeline?.filter(e => e.type === "FOOD" && e.status && (e.status.toUpperCase() === "READY" || e.status.toUpperCase() === "DELIVERED")).length > 0 && (
                    <div className="space-y-1.5 border-b border-dashed border-primary-100 pb-3">
                      <div className="font-semibold text-sage-900 text-[11px]">
                        🍲 Dịch vụ ẩm thực F&B:
                      </div>
                      <div className="space-y-1.5 pl-4">
                        {itinerary.timeline
                          .filter(e => e.type === "FOOD" && e.status && (e.status.toUpperCase() === "READY" || e.status.toUpperCase() === "DELIVERED"))
                          .map((event, idx) => (
                            <div key={idx} className="flex justify-between text-sage-600 text-[10px] font-light">
                              <div>
                                <span>{event.title}</span>
                                <span className="text-[9px] text-sage-400 font-light block sm:inline sm:ml-1">
                                  ({event.description || "Số lượng: 1"})
                                </span>
                              </div>
                              <span className="font-mono">{formatCurrency(event.price)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Voucher input form */}
                {!isPaid && (
                  <div className="border-t border-primary-100 pt-6 space-y-3">
                    <h4 className="font-serif font-bold text-xs text-sage-900 uppercase tracking-wider">
                      Mã Giảm Giá / Voucher
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        placeholder="Ví dụ: WELCOME10, NGUSON50..."
                        disabled={invoice?.discountAmount > 0 || isApplyingVoucher}
                        className="flex-1 px-3 py-2 text-xs border border-primary-200 focus:outline-primary-300 uppercase bg-white disabled:bg-sage-50 disabled:text-sage-400"
                      />
                      {invoice?.discountAmount > 0 ? (
                        <button
                          type="button"
                          onClick={handleRemoveVoucher}
                          disabled={isApplyingVoucher}
                          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-750 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Gỡ bỏ
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleApplyVoucher}
                          disabled={isApplyingVoucher || !voucherCode.trim()}
                          className="px-4 py-2 bg-primary-850 hover:bg-primary-900 text-white text-xs font-semibold uppercase tracking-wider disabled:opacity-50 transition-all cursor-pointer"
                        >
                          {isApplyingVoucher ? "Đang áp dụng..." : "Áp dụng"}
                        </button>
                      )}
                    </div>
                    {invoice?.discountAmount > 0 && (
                      <p className="text-[10px] text-green-700 font-medium">
                        ✓ Đã áp dụng Voucher thành công!
                      </p>
                    )}
                  </div>
                )}

                {/* Price summary table */}
                <div className="border-t border-primary-100 pt-6 space-y-3.5 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-sage-500 font-light">Tiền phòng (Villa):</span>
                    <span className="font-semibold font-mono">{formatCurrency(invoice?.roomSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sage-500 font-light">Trị liệu Spa phát sinh:</span>
                    <span className="font-semibold font-mono">{formatCurrency((invoice?.spaSubtotal || 0) + (invoice?.spaChildDiscount || 0))}</span>
                  </div>
                  {invoice?.spaChildDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 bg-emerald-50/30 p-1 px-2 font-semibold">
                      <span>Giảm giá dịch vụ Trẻ em:</span>
                      <span className="font-mono">-{formatCurrency(invoice.spaChildDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sage-500 font-light">Dịch vụ ẩm thực F&B phát sinh:</span>
                    <span className="font-semibold font-mono">{formatCurrency(invoice?.foodSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sage-500 font-light">Thuế VAT & Phí dịch vụ (10%):</span>
                    <span className="font-semibold font-mono">{formatCurrency(invoice?.taxAndFees)}</span>
                  </div>
                  
                  <div className="border-t border-dashed border-primary-100 my-1"></div>

                  <div className="flex justify-between">
                    <span className="text-sage-900 font-medium">Tổng cộng Folio phòng (Gốc):</span>
                    <span className="font-bold font-mono">{formatCurrency((invoice?.roomSubtotal || 0) + (invoice?.spaSubtotal || 0) + (invoice?.foodSubtotal || 0) + (invoice?.taxAndFees || 0))}</span>
                  </div>

                  {invoice?.discountAmount > 0 && (
                    <div className="flex justify-between text-green-700 bg-green-50/50 p-1 px-2 font-semibold">
                      <span>Mã giảm giá áp dụng ({invoice.voucherCode}):</span>
                      <span className="font-mono">-{formatCurrency(invoice.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-primary-100 pt-2 font-bold text-sage-955">
                    <span>Tổng thanh toán sau giảm:</span>
                    <span className="font-mono text-primary-900">{formatCurrency(invoice?.finalAmount)}</span>
                  </div>

                  <div className="flex justify-between text-green-700 bg-green-50/50 p-1.5 px-2.5">
                    <span className="font-medium">
                      {isDepositPayment ? "Tiền cọc cần thanh toán (30%):" : "Đã khấu trừ tiền đặt cọc (30%):"}
                    </span>
                    <span className="font-bold font-mono">
                      {isDepositPayment
                        ? formatCurrency(depositPayable)
                        : `-${formatCurrency(invoice?.depositAmount)}`}
                    </span>
                  </div>
                  
                  <div className="border-t border-primary-100 pt-4 flex justify-between items-center text-base sm:text-lg font-serif">
                    <span className="font-normal text-sage-950">
                      {isDepositPayment ? "Số tiền cọc cần thanh toán:" : "Dư nợ cần thanh toán:"}
                    </span>
                    <span className="font-bold text-primary-950 font-mono">{formatCurrency(displayDueAmount)}</span>
                  </div>
                </div>

                {/* Policy alert */}
                <div className="p-4 bg-primary-50/50 border border-primary-100 flex items-start space-x-2 text-[10px] text-sage-600 leading-relaxed font-light">
                  <Info className="h-4.5 w-4.5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Hệ thống sẽ dồn tất cả các khoản chi tiêu spa, F&B từ các quầy bán hàng trung tâm về phòng nghỉ của khách thông qua mã đặt phòng theo tiêu chuẩn **AHLEI & Guest Folio**.
                  </span>
                </div>
              </div>

              {/* Right Column: Payment Options */}
              <div className="lg:col-span-7 bg-white border border-primary-100 shadow-xs text-left">
                
                {/* Payment Methods tabs selector */}
                <div className="grid grid-cols-2 border-b border-primary-100">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("vnpay")}
                    className={`py-4 px-2 text-center text-xs font-semibold tracking-wider uppercase border-b-2 flex flex-col items-center justify-center space-y-2 transition-all ${
                      paymentMethod === "vnpay"
                        ? "border-primary-800 text-primary-900 bg-primary-50/20"
                        : "border-transparent text-sage-400 hover:text-sage-700 bg-white"
                    }`}
                  >
                    <QrCode className="h-5 w-5 mx-auto text-primary-800" />
                    <span>Cổng VNPay Sandbox</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`py-4 px-2 text-center text-xs font-semibold tracking-wider uppercase border-b-2 flex flex-col items-center justify-center space-y-2 transition-all ${
                      paymentMethod === "cash"
                        ? "border-primary-800 text-primary-900 bg-primary-50/20"
                        : "border-transparent text-sage-400 hover:text-sage-700 bg-white"
                    }`}
                  >
                    <Building className="h-5 w-5 mx-auto text-primary-800" />
                    <span>Tiền mặt tại quầy</span>
                  </button>
                </div>

                {/* Payment Content Panels */}
                <div className="p-6 sm:p-8">
                  {paymentMethod === "vnpay" && (
                    /* 1. VNPAY SANDBOX GATEWAY */
                    <div className="space-y-6 animate-fade-in">
                      <p className="text-xs sm:text-sm font-light text-sage-600 leading-relaxed">
                        {isDepositPayment
                          ? "Bạn sẽ được chuyển hướng an toàn sang cổng **VNPay Sandbox** để thanh toán tiền đặt cọc (30%)."
                          : "Bạn sẽ được chuyển hướng an toàn sang cổng **VNPay Sandbox** (môi trường test) để thực hiện thanh toán dư nợ hóa đơn."}
                      </p>

                      {/* Removed sandbox test card NCB info box for production look */}

                      <div className="pt-4 border-t border-primary-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                        <span className="text-sage-500 font-light flex items-center">
                          <AlertCircle className="h-4.5 w-4.5 text-primary-600 mr-1.5 flex-shrink-0" />
                          VNPay Sandbox phản hồi redirect về trang web của resort để xác thực chữ ký bảo mật.
                        </span>
                        <button
                          type="button"
                          onClick={handlePaymentSubmit}
                          disabled={isProcessing}
                          className="w-full sm:w-auto px-8 py-3.5 bg-primary-800 hover:bg-primary-900 text-white text-xs font-semibold uppercase tracking-wider rounded-none transition-all duration-300 disabled:opacity-75 cursor-pointer text-center flex items-center justify-center"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="animate-spin mr-2 h-4 w-4" /> Đang chuyển hướng...
                            </>
                          ) : (
                            "Thanh toán qua VNPay"
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cash" && (
                    /* 2. CASH PAYMENT AT COUNTER */
                    <div className="space-y-6 animate-fade-in">
                      <p className="text-xs sm:text-sm font-light text-sage-600 leading-relaxed">
                        Quý khách vui lòng di chuyển đến quầy Lễ tân của Ngũ Sơn Resort & Spa để thanh toán trực tiếp bằng tiền mặt hoặc thẻ tín dụng (qua máy POS).
                      </p>

                      <div className="bg-sage-50 border border-primary-100 p-5 space-y-4">
                        <h4 className="font-serif text-sm font-bold text-sage-900">
                          Hướng dẫn thanh toán tại quầy
                        </h4>
                        <ol className="list-decimal list-inside space-y-2.5 text-xs text-sage-700 font-light leading-relaxed">
                          <li>
                            Vui lòng cung cấp mã đặt phòng <span className="font-semibold font-mono">#BK-{invoice?.bookingId}</span> hoặc mã hóa đơn <span className="font-semibold font-mono">#NS-{invoice?.invoiceId}</span> cho nhân viên Lễ tân.
                          </li>
                          <li>
                            Nhân viên Lễ tân sẽ đối chiếu chi tiết các dịch vụ sử dụng trong suốt thời gian lưu trú (Guest Folio) và thực hiện thu ngân.
                          </li>
                          <li>
                            Sau khi Lễ tân xác nhận đã thu tiền trên hệ thống, trạng thái hóa đơn của quý khách sẽ tự động cập nhật và hiển thị biên lai thành công tại đây.
                          </li>
                        </ol>
                      </div>

                      <div className="p-4 bg-primary-50/30 border border-dashed border-primary-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-3 text-xs">
                          <div className="h-2.5 w-2.5 bg-amber-500 rounded-full animate-pulse flex-shrink-0" />
                          <div>
                            <span className="font-bold text-sage-800 block">Trạng thái: Chờ Lễ tân xác nhận</span>
                            <span className="text-sage-500 font-light text-[10px] block mt-0.5">
                              Sau khi hoàn tất thanh toán tại quầy, vui lòng nhấn nút bên cạnh để kiểm tra lại trạng thái.
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRefreshStatus}
                          disabled={isProcessing}
                          className="w-full sm:w-auto px-6 py-2.5 bg-primary-800 hover:bg-primary-900 text-white text-xs font-semibold uppercase tracking-wider rounded-none transition-all duration-300 disabled:opacity-75 cursor-pointer text-center flex items-center justify-center font-sans"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="animate-spin mr-2 h-3.5 w-3.5" /> Đang cập nhật...
                            </>
                          ) : (
                            "Kiểm tra trạng thái"
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
