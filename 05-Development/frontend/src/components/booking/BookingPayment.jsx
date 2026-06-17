import React, { useState } from "react";
import { Copy, Check, Info, ShieldCheck, Loader2 } from "lucide-react";
import { formatCurrency } from "../../utils/format";

export default function BookingPayment({
  guestInfo,
  depositAmount,
  isVerifyingPayment,
  onVerify,
}) {
  const [copiedField, setCopiedField] = useState(null);

  const handleCopyText = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const memoText = `NS ${guestInfo.phone} ${guestInfo.checkInDate.replace(/-/g, "")}`;

  // Mock QR Code SVG
  const qrCodeSvg = (
    <svg
      className="w-full h-full text-sage-900"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
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
      <path
        d="M46 50 C46 47, 54 47, 54 50 C54 53, 46 51, 46 54"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );

  return (
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
                {memoText}
              </span>
              <button
                type="button"
                onClick={() => handleCopyText(memoText, "memo")}
                className="text-sage-455 hover:text-primary-850 transition-colors p-1"
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
          Sau khi chuyển khoản cọc thành công, hệ thống đối soát tự động của Ngũ Sơn sẽ ghi nhận và kích hoạt mã Booking trong 1 phút. Nhấn nút xác thực bên dưới để thử nghiệm giả lập thanh toán.
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
          onClick={onVerify}
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
  );
}
