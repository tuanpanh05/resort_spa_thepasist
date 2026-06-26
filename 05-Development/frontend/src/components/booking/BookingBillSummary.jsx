import React, { useState } from "react";
import DetailModal from "./DetailModal";
import { UtensilsCrossed } from "lucide-react";

/**
 * BookingBillSummary – Giao diện chi tiết thanh toán gốc.
 * Hiển thị đầy đủ bảng chi phí (tổng, cọc, trả tại quầy) và nút Xem chi tiết.
 */
export default function BookingBillSummary({
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

  // Placeholder khi chưa có villa được chọn
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

      {/* Villa total display */}
      <div className="space-y-3.5 text-xs sm:text-sm">
        {selectedRooms && Object.entries(selectedRooms).map(([roomTypeId, qty]) => {
          const roomType = roomTypes.find((r) => r.roomTypeId === Number(roomTypeId));
          if (!roomType || qty <= 0) return null;
          return (
            <div key={roomTypeId} className="flex justify-between font-medium">
              <span className="text-sage-800">
                🏡 {roomType.typeName} ({qty} phòng × {nightsCount} đêm):
              </span>
              <span className="text-sage-950 font-mono">
                {formatCurrency(roomType.basePricePerNight * nightsCount * qty)}
              </span>
            </div>
          );
        })}


        {/* Meal costs */}
        {mealTotal > 0 && (
          <div className="flex justify-between font-medium pt-2 border-t border-primary-50">
            <span className="text-sage-800 flex items-center gap-1">
              <UtensilsCrossed className="h-3.5 w-3.5" /> Phụ phí ẩm thực / Combo:
            </span>
            <span className="text-sage-950 font-mono">{formatCurrency(mealTotal)}</span>
          </div>
        )}

        {/* Addon list */}
        {selectedServices.length > 0 && (
          <div className="pt-2 border-t border-primary-50 space-y-2">
            <span className="text-[10px] text-sage-400 uppercase tracking-wider block font-bold">
              Dịch vụ đi kèm
            </span>
            {selectedServices.map((s) => {
              let itemCost = 0;
              const pricingType = s.pricingType || s.type || "per-guest";
              const serviceTitle = s.name || s.title || "Dịch vụ";
              if (pricingType === "per-guest") itemCost = s.price * guestInfo.guestsCount;
              else if (pricingType === "per-guest-per-night")
                itemCost = s.price * guestInfo.guestsCount * nightsCount;
              else itemCost = s.price;
              return (
                <div key={s.serviceId || s.id} className="flex justify-between text-sage-600 text-xs">
                  <span className="truncate pr-4">• {serviceTitle.split("&")[0].trim()}</span>
                  <span className="font-mono">{formatCurrency(itemCost)}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Billing status flags */}
        <div className="pt-4 border-t border-[#cda250]/15 space-y-2.5">
          <div className="flex justify-between font-serif text-base text-[#1a2f23]">
            <span>Tổng chi phí:</span>
            <span className="font-bold">{formatCurrency(totalAmount)}</span>
          </div>

          <div className="flex justify-between text-xs font-semibold text-[#1a2f23] bg-[#cda250]/10 p-2.5 rounded-lg border border-[#cda250]/20">
            <span>Cọc trước (30%):</span>
            <span className="font-mono">{formatCurrency(depositAmount)}</span>
          </div>

          <div className="flex justify-between text-xs text-sage-600 p-2.5 border border-dashed border-[#cda250]/30 rounded-lg bg-white/50">
            <span>Trả tại quầy (70%):</span>
            <span className="font-mono">{formatCurrency(remainingAmount)}</span>
          </div>
        </div>
      </div>

      {/* Nút mở chi tiết */}
      <button
        className="mt-4 w-full bg-resort-green hover:bg-resort-green-dark text-white font-medium py-2 px-4 rounded transition"
        onClick={() => setDetailOpen(true)}
      >
        Xem chi tiết
      </button>

      {/* Modal chi tiết */}
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
