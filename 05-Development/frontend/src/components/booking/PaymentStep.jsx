import React, { useState } from "react";
import { CheckCircle2, Loader2, AlertCircle, Copy, Check, ShieldCheck } from "lucide-react";
import { paymentApi } from "../../api";

export default function PaymentStep({
  bookingId,
  invoiceId,
  depositAmount,
  totalAmount,
  formatCurrency,
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVNPayPayment = () => {
    setIsProcessing(true);
    paymentApi.getPaymentUrl(invoiceId)
      .then((data) => {
        setIsProcessing(false);
        // Redirect the guest to VNPay Sandbox URL
        window.location.href = data.paymentUrl;
      })
      .catch((err) => {
        setIsProcessing(false);
        alert(err.message || "Gặp lỗi khi tạo link thanh toán VNPay. Vui lòng thử lại.");
      });
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="border-b border-primary-50 pb-3 mb-6">
        <h2 className="text-resort-section text-sage-950 mb-1">Bước 6: Thanh Toán Đặt Cọc</h2>
        <p className="text-resort-desc">
          Đơn đặt phòng tạm thời của bạn đã được ghi nhận. Vui lòng hoàn tất thanh toán đặt cọc để xác nhận lịch.
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm">
        {/* Booking success box */}
        <div className="bg-green-50/50 border border-green-200 p-6 text-center space-y-3">
          <CheckCircle2 className="h-12 w-12 text-green-700 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-green-900">Khởi Tạo Đơn Thành Công!</h3>
          <p className="text-xs text-sage-600 font-light max-w-md mx-auto leading-relaxed">
            Hệ thống đã tạo mã đặt phòng tạm thời <strong className="text-sage-900 font-bold">#BK-{bookingId}</strong> và hóa đơn liên kết <strong className="text-sage-900 font-bold">#NS-{invoiceId}</strong>.
          </p>
        </div>

        {/* Amount Summary */}
        <div className="bg-primary-50/10 border border-primary-100 p-6 space-y-4">
          <h4 className="text-[10px] font-bold text-primary-800 uppercase tracking-widest border-b border-primary-100 pb-2">
            Thông tin thanh toán cọc (30%)
          </h4>
          <div className="grid grid-cols-2 gap-y-3 font-light text-sage-700">
            <span>Tổng cộng giá trị booking:</span>
            <span className="font-semibold text-sage-950 text-right">{formatCurrency(totalAmount)}</span>

            <span className="font-medium text-sage-900">Số tiền đặt cọc cần trả (30%):</span>
            <span className="font-bold text-primary-900 text-right text-base">{formatCurrency(depositAmount)}</span>

            <span className="text-xs text-sage-400 font-light col-span-2 pt-1">
              * Số tiền còn lại sẽ được thanh toán sau khi hoàn tất kỳ nghỉ (khi thực hiện check-out).
            </span>
          </div>
        </div>

        {/* VNPay Card Details */}
        <div className="bg-sage-50/40 border border-primary-200/50 p-5 space-y-4">
          <h4 className="font-serif text-sm font-bold text-sage-900 flex items-center space-x-1.5">
            <ShieldCheck className="h-4.5 w-4.5 text-primary-800" />
            <span>Thông tin thẻ test VNPay Sandbox (NCB)</span>
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs font-light text-sage-700">
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

        {/* Submit Actions */}
        <div className="pt-6 border-t border-primary-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xs text-sage-500 font-light flex items-center">
            <AlertCircle className="h-4.5 w-4.5 text-primary-600 mr-1.5 flex-shrink-0" />
            Hệ thống sẽ chuyển bạn sang cổng VNPay Sandbox để thanh toán trực tuyến.
          </span>

          <button
            type="button"
            onClick={handleVNPayPayment}
            disabled={isProcessing}
            className="w-full sm:w-auto px-10 py-4 bg-primary-800 hover:bg-primary-900 text-white text-xs font-semibold uppercase tracking-wider rounded-none transition-all duration-300 disabled:opacity-75 cursor-pointer text-center flex items-center justify-center font-bold"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" /> Đang chuyển hướng...
              </>
            ) : (
              "Thanh toán cọc qua VNPay"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
