import React from "react";

/**
 * Modal component to display detailed billing information, including room breakdown, meals,
 * services, totals, deposits, remaining amount, and booking/payment statuses.
 */
export default function DetailModal({
  isOpen,
  onClose,
  nightsCount,
  selectedRooms,
  roomTypes,
  mealTotal,
  selectedServices,
  guestInfo,
  formatCurrency,
  selectedVilla,
  selectedPackages = [],
  totalAmount,
  depositAmount,
  remainingAmount,
  bookingStatus,
  paymentStatus,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-lg w-full p-6 overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Chi Tiết Thanh Toán
        </h3>
        {/* Room breakdown */}
        <div className="space-y-2 text-sm">
          {selectedRooms && Object.entries(selectedRooms).map(([roomTypeId, qty]) => {
            const roomType = roomTypes.find(r => r.roomTypeId === Number(roomTypeId));
            if (!roomType || qty <= 0) return null;
            return (
              <div key={roomTypeId} className="flex justify-between font-medium">
                <span>🏡 {roomType.typeName} ({qty} phòng × {nightsCount} đêm):</span>
                <span className="font-mono">{formatCurrency(roomType.basePricePerNight * nightsCount * qty)}</span>
              </div>
            );
          })}
        </div>
        {/* Meal costs */}
        {mealTotal > 0 && (
          <div className="flex justify-between font-medium pt-2 border-t border-primary-50 mt-4">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12l9 5-9-18-9 18z"/></svg>
              Thực đơn ngoài gói:
            </span>
            <span className="font-mono">{formatCurrency(mealTotal)}</span>
          </div>
        )}
        {/* Services */}
        {selectedServices.length > 0 && (
          <div className="pt-2 border-t border-primary-50 space-y-2 mt-4">
            <span className="text-xs uppercase tracking-wider block font-bold text-gray-600">
              Dịch vụ đi kèm
            </span>
            {selectedServices.map(s => {
              let itemCost = 0;
              if (s.type === "per-guest") itemCost = s.price * guestInfo.guestsCount;
              else if (s.type === "per-guest-per-night")
                itemCost = s.price * guestInfo.guestsCount * nightsCount;
              else itemCost = s.price;
              return (
                <div key={s.id} className="flex justify-between text-gray-600 text-xs">
                  <span className="truncate pr-4">• {s.title.split("&")[0].trim()}</span>
                  <span className="font-mono">{formatCurrency(itemCost)}</span>
                </div>
              );
            })}
          </div>
        )}
        {/* Totals */}
        <div className="pt-4 border-t border-[#cda250]/15 space-y-2.5 mt-4">
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
        {/* Statuses */}
        <div className="pt-4 border-t border-[#cda250]/15 space-y-2 text-xs font-mono font-medium text-sage-500 bg-[#cda250]/5 p-3 rounded-lg border border-[#cda250]/10">
          <div className="flex justify-between">
            <span>BOOKING STATUS:</span>
            <span
              className={`font-bold ${
                bookingStatus === "CONFIRMED"
                  ? "text-emerald-700 font-semibold"
                  : bookingStatus === "PENDING_PAYMENT"
                  ? "text-amber-700 font-semibold"
                  : "text-sage-600"
              }`}
            >
              {bookingStatus}
            </span>
          </div>
          <div className="flex justify-between">
            <span>PAYMENT STATUS:</span>
            <span
              className={`font-bold ${
                paymentStatus === "PAID"
                  ? "text-emerald-700 font-semibold"
                  : paymentStatus === "PENDING"
                  ? "text-amber-700 font-semibold"
                  : "text-sage-600"
              }`}
            >
              {paymentStatus}
            </span>
          </div>
        </div>
        <button
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition"
          onClick={onClose}
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
