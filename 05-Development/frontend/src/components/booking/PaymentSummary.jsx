import React, { useState } from "react";
import DetailModal from "./DetailModal";

/**
 * PaymentSummary – Giao diện hiển thị Tổng tiền và Tiền cọc (30%)
 * Giữ nguyên các props và chức năng hiện tại (mở modal để xem chi tiết).
 */
export default function PaymentSummary({
  nightsCount,
  villaTotal,
  mealTotal,
  selectedRooms,
  roomTypes,
  selectedServices,
  guestInfo,
  totalAmount,
  depositAmount,
  remainingAmount,
  bookingStatus,
  paymentStatus,
  formatCurrency,
  selectedVilla,
  selectedPackages = [],
}) {
  const [detailOpen, setDetailOpen] = useState(false);

  // Placeholder khi chưa chọn villa
  if (villaTotal === 0) {
    return (
      <div className="bg-[#fbfaf7]/95 border border-[#cda250]/20 p-6 shadow-[0_15px_40px_rgba(26,44,34,0.05)] text-left rounded-2xl backdrop-blur-md">
        <h3 className="font-serif text-lg font-normal text-[#1a2f23] border-b border-[#cda250]/15 pb-3 mb-4 tracking-wide uppercase">
          Chi Tiết Thanh Toán
        </h3>
        <div className="py-8 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#cda250]/10 border border-[#cda250]/25">
            <span className="text-[#cda250] text-lg font-serif">📋</span>
          </div>
          <p className="text-xs text-[#1a2f23] font-medium">Chưa có thông tin thanh toán</p>
          <p className="text-[11px] text-sage-500 font-light leading-relaxed max-w-[220px] mx-auto">
            Vui lòng hoàn thành khai báo và chọn hạng phòng/biệt thự ở Bước 3 để hiển thị bảng tính phí chi tiết.
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-primary-50 space-y-2 text-[10px] font-mono font-medium text-sage-400 bg-primary-50/30 p-3">
          <div className="flex justify-between"><span>BOOKING STATUS:</span><span className="font-bold text-sage-500">{bookingStatus}</span></div>
          <div className="flex justify-between"><span>PAYMENT STATUS:</span><span className="font-bold text-sage-500">{paymentStatus}</span></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fbfaf7]/95 border border-[#cda250]/20 p-6 shadow-[0_15px_40px_rgba(26,44,34,0.05)] text-left rounded-2xl backdrop-blur-md">
      <h3 className="font-serif text-lg font-normal text-[#1a2f23] border-b border-[#cda250]/15 pb-3 mb-4 tracking-wide uppercase">
        Chi Tiết Thanh Toán
      </h3>

      {/* Tổng tiền và tiền cọc */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-base text-[#1a2f23] font-serif">
          <span className="font-medium">Tổng chi phí:</span>
          <span className="font-bold text-xl">{formatCurrency(totalAmount)}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-[#1a2f23] bg-[#cda250]/10 p-2.5 rounded-lg border border-[#cda250]/20">
          <span>Cọc trước (30%):</span>
          <span className="font-mono">{formatCurrency(depositAmount)}</span>
        </div>
      </div>

      {/* Nút mở chi tiết */}
      <button
        className="mt-4 w-full bg-resort-green hover:bg-resort-green-dark text-white font-medium py-2 px-4 rounded transition"
        onClick={() => setDetailOpen(true)}
      >
        Xem chi tiết
      </button>

      {/* Modal chi tiết (giữ nguyên chức năng) */}
      <DetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        nightsCount={nightsCount}
        selectedRooms={selectedRooms}
        roomTypes={roomTypes}
        mealTotal={mealTotal}
        selectedServices={selectedServices}
        guestInfo={guestInfo}
        formatCurrency={formatCurrency}
        selectedVilla={selectedVilla}
        selectedPackages={selectedPackages}
        totalAmount={totalAmount}
        depositAmount={depositAmount}
        remainingAmount={remainingAmount}
        bookingStatus={bookingStatus}
        paymentStatus={paymentStatus}
      />
    </div>
  );
}
