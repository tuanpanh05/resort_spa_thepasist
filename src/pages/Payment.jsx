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
import { paymentApi } from "../api";

export default function Payment() {
  const [searchParams, setSearchParams] = useSearchParams();
  const invoiceIdParam = searchParams.get("invoiceId");
  
  const [invoiceId, setInvoiceId] = useState(invoiceIdParam ? parseInt(invoiceIdParam) : 2);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [paymentMethod, setPaymentMethod] = useState("vnpay"); // 'vnpay', 'cash'
  const [copiedField, setCopiedField] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);
    paymentApi.getInvoice(invoiceId)
      .then((data) => {
        setInvoice(data);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg(err.message || `Không thể tìm thấy hóa đơn #${invoiceId} trong hệ thống.`);
        setLoading(false);
      });
  }, [invoiceId]);

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

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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
          // Cash payment successful. We perform checkout as well (BR-14)
          paymentApi.performCheckout(invoiceId)
            .then(() => {
              setIsProcessing(false);
              setIsPaid(true);
              setInvoice(data);
            })
            .catch((err) => {
              console.warn("Perform checkout failed after cash payment: ", err);
              setIsProcessing(false);
              setIsPaid(true); // Still consider paid
            });
        })
        .catch((err) => {
          setIsProcessing(false);
          alert(err.message || "Lỗi khi xác nhận thanh toán tiền mặt.");
        });
    }
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
        
        {/* Navigation & Selector Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-semibold tracking-wider text-sage-600 hover:text-primary-800 transition-colors uppercase"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại trang chủ
          </Link>
          
          <div className="flex items-center space-x-2 bg-primary-50/50 border border-primary-200/50 px-3 py-1.5 self-stretch sm:self-auto">
            <span className="text-[10px] text-sage-500 font-bold uppercase tracking-wider">Mô phỏng hóa đơn test:</span>
            <select 
              value={invoiceId} 
              onChange={handleSelectInvoice}
              className="bg-white border border-primary-200 text-xs text-sage-950 font-bold px-2.5 py-1 focus:outline-none"
            >
              <option value={1}>HĐ #1 (Trần Khách Hàng - Cọc Detox)</option>
              <option value={2}>HĐ #2 (Lê Minh Châu - Phòng thường)</option>
            </select>
          </div>
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
                Thanh Toán Thành Công!
              </h1>
              <p className="text-xs sm:text-sm text-sage-600 max-w-md mx-auto mb-8 font-light leading-relaxed">
                Cảm ơn quý khách đã hoàn tất thanh toán hóa đơn. Thủ tục Check-out đã được thực hiện tự động và trạng thái phòng đã đổi thành **DIRTY** để vệ sinh.
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
                  <span className="font-bold text-green-700 text-right uppercase">ĐÃ THANH TOÁN</span>

                  <span className="text-sage-500 font-light">Hình thức thanh toán:</span>
                  <span className="font-semibold text-right text-primary-850">Tiền mặt tại quầy</span>
                </div>

                <div className="pt-3 border-t border-primary-100 flex justify-between items-center text-sm sm:text-base font-serif">
                  <span className="font-normal text-sage-900">Tổng thanh toán:</span>
                  <span className="font-bold text-primary-900">{formatCurrency(invoice?.amountDue || invoice?.finalAmount)}</span>
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

                {/* Price summary table */}
                <div className="border-t border-primary-100 pt-6 space-y-3.5 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-sage-500 font-light">Tiền phòng (Villa):</span>
                    <span className="font-semibold font-mono">{formatCurrency(invoice?.roomSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sage-500 font-light">Trị liệu Spa phát sinh:</span>
                    <span className="font-semibold font-mono">{formatCurrency(invoice?.spaSubtotal)}</span>
                  </div>
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
                    <span className="text-sage-900 font-medium">Tổng cộng Folio phòng:</span>
                    <span className="font-bold font-mono">{formatCurrency(invoice?.finalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-green-700 bg-green-50/50 p-1.5 px-2.5">
                    <span className="font-medium">Đã khấu trừ tiền đặt cọc (30%):</span>
                    <span className="font-bold font-mono">-{formatCurrency(invoice?.depositAmount)}</span>
                  </div>
                  
                  <div className="border-t border-primary-100 pt-4 flex justify-between items-center text-base sm:text-lg font-serif">
                    <span className="font-normal text-sage-950">Dư nợ cần thanh toán:</span>
                    <span className="font-bold text-primary-950 font-mono">{formatCurrency(invoice?.amountDue)}</span>
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
                        Bạn sẽ được chuyển hướng an toàn sang cổng **VNPay Sandbox** (môi trường test) để thực hiện thanh toán dư nợ hóa đơn.
                      </p>

                      <div className="bg-[#f3f7f5] border border-primary-100 p-5 space-y-4">
                        <h4 className="font-serif text-sm font-bold text-sage-900 flex items-center space-x-1.5">
                          <ShieldCheck className="h-4.5 w-4.5 text-primary-800" />
                          <span>Thông tin thẻ test VNPay Sandbox (NCB)</span>
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5 text-xs font-light text-sage-700">
                          <div>
                            <span className="text-[10px] text-sage-400 uppercase tracking-wider block">Ngân hàng</span>
                            <span className="font-semibold text-sage-950">NCB (Ngân hàng Quốc Dân)</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-sage-400 uppercase tracking-wider block">Số thẻ test</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold font-mono text-sage-950">970419852613143212</span>
                              <button 
                                type="button"
                                onClick={() => handleCopy("970419852613143212", "card")}
                                className="text-sage-400 hover:text-primary-800 p-0.5"
                                title="Copy số thẻ"
                              >
                                {copiedField === "card" ? <Check className="h-3.5 w-3.5 text-green-700" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-sage-400 uppercase tracking-wider block">Tên chủ thẻ</span>
                            <span className="font-semibold text-sage-950">NGUYEN VAN A</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-sage-400 uppercase tracking-wider block">Ngày phát hành</span>
                            <span className="font-semibold text-sage-950 font-mono">07/15</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-sage-400 uppercase tracking-wider block">Mã xác thực OTP</span>
                            <span className="font-semibold text-sage-950 font-mono">123456</span>
                          </div>
                        </div>
                      </div>

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
                        Phương thức thanh toán tiền mặt tại quầy lễ tân. Lễ tân sẽ xác nhận thu tiền trực tiếp từ khách hàng và đóng hóa đơn.
                      </p>

                      <div className="bg-sage-50 border border-primary-100 p-5 space-y-4">
                        <h4 className="font-serif text-sm font-bold text-sage-900">
                          Quy trình thanh toán tại quầy
                        </h4>
                        <ol className="list-decimal list-inside space-y-2 text-xs text-sage-700 font-light leading-relaxed">
                          <li>
                            Lễ tân kiểm tra kỹ bảng dồn dịch vụ (Folio) để đảm bảo không còn buổi spa hay đơn ăn nào ở trạng thái chờ (Consolidated Constraint).
                          </li>
                          <li>
                            Khách hàng thanh toán số tiền còn lại ({formatCurrency(invoice?.amountDue)}) bằng tiền mặt hoặc thẻ POS tại quầy.
                          </li>
                          <li>
                            Lễ tân nhấn nút "Xác nhận đã thu tiền" để hệ thống tự động ghi nhật ký (Audit Trail) và chuyển phòng sang trạng thái cần dọn dẹp (**DIRTY**).
                          </li>
                        </ol>
                      </div>

                      <div className="pt-4 border-t border-primary-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                        <span className="text-sage-500 font-light flex items-center">
                          <AlertCircle className="h-4.5 w-4.5 text-primary-600 mr-1.5 flex-shrink-0" />
                          Hệ thống sẽ cập nhật trạng thái phòng nghỉ lập tức sau khi nhấn xác nhận.
                        </span>
                        <button
                          type="button"
                          onClick={handlePaymentSubmit}
                          disabled={isProcessing}
                          className="w-full sm:w-auto px-8 py-3.5 bg-primary-800 hover:bg-primary-900 text-white text-xs font-semibold uppercase tracking-wider rounded-none transition-all duration-300 disabled:opacity-75 cursor-pointer text-center flex items-center justify-center"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="animate-spin mr-2 h-4 w-4" /> Đang xác nhận...
                            </>
                          ) : (
                            "Xác nhận đã thu tiền"
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
