import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Printer,
  Home,
  MessageSquare,
  Star,
  ShieldAlert,
  Info,
  Calendar,
  DollarSign
} from "lucide-react";
import { paymentApi } from "../api";

export default function PaymentResult() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Feedback Form States
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  useEffect(() => {
    // Parse query string parameters from VNPay redirect
    const queryParams = {};
    const searchParams = new URLSearchParams(location.search);
    for (const [key, value] of searchParams.entries()) {
      queryParams[key] = value;
    }

    if (Object.keys(queryParams).length === 0) {
      setLoading(false);
      setErrorMsg("Không tìm thấy dữ liệu giao dịch từ VNPay.");
      return;
    }

    // Call backend to verify callback parameters and update database state
    paymentApi.verifyVNPayCallback(queryParams)
      .then((data) => {
        setInvoice(data);
        setLoading(false);
        
        // Trigger perform-checkout asynchronously so the room status updates to DIRTY immediately
        if (data.status === "PAID") {
          paymentApi.performCheckout(data.invoiceId)
            .catch((err) => {
              console.warn("Auto-checkout warning: ", err.message);
            });
        }
      })
      .catch((err) => {
        setLoading(false);
        setErrorMsg(err.message || "Xác thực chữ ký thanh toán thất bại.");
      });
  }, [location.search]);

  // Handle Feedback Submission
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!invoice) return;

    setSubmittingFeedback(true);
    setFeedbackError(null);

    // Call submit feedback API
    paymentApi.submitFeedback(invoice.bookingId, invoice.userId, rating, comment)
      .then(() => {
        setSubmittingFeedback(false);
        setFeedbackSuccess(true);
        setComment("");
      })
      .catch((err) => {
        setSubmittingFeedback(false);
        setFeedbackError(err.message || "Không thể gửi đánh giá.");
      });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="bg-[#fafbfa] min-h-screen pt-36 pb-20 flex flex-col items-center justify-center font-sans text-sage-950">
        <div className="p-8 bg-white border border-primary-100 text-center shadow-md max-w-md w-full space-y-4">
          <Loader2 className="h-12 w-12 text-primary-800 animate-spin mx-auto" />
          <h3 className="font-serif text-lg font-bold text-sage-900">Đang xác thực giao dịch...</h3>
          <p className="text-xs text-sage-500 font-light leading-relaxed">
            Hệ thống đang kết nối và xác minh chữ ký bảo mật với cổng thanh toán VNPay. Vui lòng không đóng trình duyệt hoặc tải lại trang.
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg || (invoice && invoice.status !== "PAID")) {
    return (
      <div className="bg-[#fafbfa] min-h-screen pt-36 pb-20 font-sans text-sage-950">
        <div className="max-w-xl mx-auto px-6">
          <div className="bg-white border border-red-100 p-8 sm:p-10 text-center shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />
            <div className="inline-flex p-4 bg-red-50 text-red-700 rounded-full mb-6">
              <XCircle className="h-12 w-12" />
            </div>

            <h1 className="font-serif text-xl sm:text-2xl font-normal text-red-700 mb-2">
              Thanh Toán Không Thành Công
            </h1>
            <p className="text-xs sm:text-sm text-sage-600 font-light max-w-md mx-auto mb-8 leading-relaxed">
              {errorMsg || "Giao dịch thanh toán đã bị hủy hoặc gặp sự cố từ cổng thanh toán VNPay. Quý khách vui lòng thử lại hoặc liên hệ với bộ phận hỗ trợ."}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-sage-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-sage-900 transition-all rounded-none cursor-pointer"
              >
                <Home className="h-4 w-4 mr-2" /> Về trang chủ
              </Link>
              <Link
                to="/phong-o"
                className="inline-flex items-center justify-center px-8 py-3 border border-red-600 text-red-600 text-xs font-semibold uppercase tracking-wider hover:bg-red-50/50 transition-all rounded-none"
              >
                Thử thanh toán lại
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafbfa] min-h-screen pt-36 pb-20 font-sans text-sage-950">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Main success panel */}
        <div className="bg-white border border-primary-100 p-8 sm:p-10 shadow-md relative overflow-hidden mb-8">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400" />
          
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex p-4 bg-primary-100 text-primary-850 rounded-full mb-2">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-sage-900">
              Thanh Toán Thành Công!
            </h1>
            <p className="text-xs sm:text-sm text-sage-500 font-light max-w-lg mx-auto leading-relaxed">
              Cảm ơn quý khách đã sử dụng dịch vụ tại Ngũ Sơn Resort & Spa. Giao dịch đã được ghi nhận và đồng bộ trực tiếp vào hệ thống phòng lưu trú của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left: Folio transaction breakdown details */}
            <div className="md:col-span-7 border border-primary-100 bg-primary-50/10 p-6 space-y-4 text-xs sm:text-sm">
              <div className="flex justify-between pb-3 border-b border-primary-100/50">
                <span className="font-bold uppercase tracking-wider text-sage-400 text-[10px]">Chi tiết hóa đơn tổng hợp</span>
                <span className="font-mono text-primary-800 font-bold">HĐ ID: #NS-{invoice?.invoiceId}</span>
              </div>

              <div className="grid grid-cols-2 gap-y-3 font-light text-sage-700">
                <span>Chi phí lưu trú (Villa):</span>
                <span className="font-semibold text-sage-950 text-right">{formatCurrency(invoice?.roomSubtotal)}</span>

                <span>Dịch vụ trị liệu Spa phụ trợ:</span>
                <span className="font-semibold text-sage-950 text-right">{formatCurrency(invoice?.spaSubtotal)}</span>

                <span>Dịch vụ ẩm thực F&B phát sinh:</span>
                <span className="font-semibold text-sage-950 text-right">{formatCurrency(invoice?.foodSubtotal)}</span>

                <span>Thuế giá trị gia tăng & phí (10%):</span>
                <span className="font-semibold text-sage-950 text-right">{formatCurrency(invoice?.taxAndFees)}</span>

                <div className="col-span-2 border-t border-primary-100/50 my-1"></div>

                <span className="font-medium text-sage-900">Tổng cộng hóa đơn:</span>
                <span className="font-bold text-sage-950 text-right">{formatCurrency(invoice?.finalAmount)}</span>

                <span className="font-medium text-sage-900">Khấu trừ tiền đặt cọc (30%):</span>
                <span className="font-bold text-green-700 text-right">-{formatCurrency(invoice?.depositAmount)}</span>
              </div>

              <div className="pt-3.5 border-t border-primary-100 flex justify-between items-center text-sm sm:text-base font-serif">
                <span className="font-normal text-sage-900">Đã thanh toán (VNPay):</span>
                <span className="font-bold text-primary-900">{formatCurrency(invoice?.amountDue)}</span>
              </div>

              {invoice?.vnpayTranId && (
                <div className="pt-3 text-[10px] text-sage-400 border-t border-dashed border-primary-100 flex justify-between">
                  <span>Mã giao dịch cổng VNPay:</span>
                  <span className="font-mono">{invoice.vnpayTranId}</span>
                </div>
              )}
            </div>

            {/* Right: Actions and prints */}
            <div className="md:col-span-5 space-y-6">
              <div className="bg-sage-50/50 border border-primary-200/30 p-5 space-y-3 leading-relaxed text-xs font-light text-sage-600">
                <div className="flex items-center space-x-1.5 text-primary-850 font-bold">
                  <Info className="h-4 w-4" />
                  <span className="uppercase text-[9px] tracking-wider">Thông báo dọn phòng</span>
                </div>
                <p>
                  Theo quy định trả phòng <strong>BR-14</strong>, phòng nghỉ của quý khách đã được chuyển sang trạng thái <strong>DIRTY (Đang dọn dẹp)</strong> để bộ phận buồng phòng tiến hành vệ sinh và khử trùng bằng thảo dược chuẩn bị cho lượt khách tiếp theo.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => window.print()}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-sage-800 text-sage-800 text-xs font-semibold uppercase tracking-wider hover:bg-sage-50 transition-all rounded-none cursor-pointer"
                >
                  <Printer className="h-4 w-4 mr-2" /> In hóa đơn điện tử
                </button>
                <Link
                  to="/"
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-900 transition-all rounded-none cursor-pointer"
                >
                  <Home className="h-4 w-4 mr-2" /> Quay về trang chủ
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Feedback Section (UC23) */}
        <div className="bg-white border border-primary-100 p-8 sm:p-10 shadow-md text-left">
          <div className="flex items-center space-x-2.5 border-b border-primary-50 pb-4 mb-6">
            <MessageSquare className="h-5 w-5 text-primary-800" />
            <h3 className="font-serif text-lg font-normal text-sage-955">Đánh Giá & Phản Hồi Dịch Vụ (UC23)</h3>
          </div>

          {feedbackSuccess ? (
            <div className="p-6 bg-green-50 border border-green-200 text-center space-y-2 text-xs sm:text-sm">
              <CheckCircle2 className="h-10 w-10 text-green-700 mx-auto" />
              <h4 className="font-bold text-green-900">Gửi đánh giá thành công!</h4>
              <p className="text-sage-500 font-light max-w-md mx-auto">
                Cảm ơn đóng góp ý kiến của quý khách. Phản hồi của bạn sẽ giúp Ngũ Sơn Resort nâng cao chất lượng dịch vụ trị liệu và nghỉ dưỡng ngày một tốt hơn.
              </p>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-6 text-xs sm:text-sm">
              <p className="text-sage-500 font-light leading-relaxed">
                Đánh giá chất lượng gói trị liệu, phòng nghỉ, món ăn dinh dưỡng và thái độ phục vụ của nhân viên trị liệu sau kỳ lưu trú của bạn:
              </p>

              {/* Star Rating Select */}
              <div className="space-y-2">
                <span className="block text-[10px] text-sage-400 uppercase tracking-wider font-semibold">Chấm điểm chất lượng</span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-sage-300 hover:text-yellow-400 transition-colors p-1 cursor-pointer"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= (hoverRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-sage-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-sage-500 font-bold ml-2">
                    {rating === 5 && "5 sao (Rất tốt)"}
                    {rating === 4 && "4 sao (Tốt)"}
                    {rating === 3 && "3 sao (Trung bình)"}
                    {rating === 2 && "2 sao (Kém)"}
                    {rating === 1 && "1 sao (Rất tệ)"}
                  </span>
                </div>
              </div>

              {/* Comment Input */}
              <div className="space-y-2">
                <label className="block text-[10px] text-sage-400 uppercase tracking-wider font-semibold">Nhận xét chi tiết</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Quý khách có hài lòng với các buổi trị liệu spa, chế độ dinh dưỡng dưỡng sinh và thái độ của kỹ thuật viên không?..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-3 bg-sage-50/30 border border-primary-200/50 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400 text-sage-950 font-light"
                />
              </div>

              {feedbackError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                  <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0" />
                  <span>{feedbackError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submittingFeedback || !comment.trim()}
                className="inline-flex justify-center px-8 py-3 bg-primary-800 hover:bg-primary-900 text-white text-xs font-semibold uppercase tracking-wider transition-all rounded-none disabled:opacity-70 cursor-pointer"
              >
                {submittingFeedback ? "Đang gửi..." : "Gửi đánh giá dịch vụ"}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
