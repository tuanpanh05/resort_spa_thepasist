import React from "react";
import { UtensilsCrossed } from "lucide-react";
import { radius } from "../../styles/designSystem";

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
  if (villaTotal === 0) {
    return (
      <div
        className={`bg-white border border-primary-100 p-6 shadow-xs text-left sticky top-28 ${radius.card}`}
      >
        <h3 className="font-serif text-lg font-bold text-sage-950 border-b border-primary-100 pb-3 mb-4">
          Chi Tiết Thanh Toán
        </h3>
        <div className="py-8 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-50/50 border border-primary-100">
            <span className="text-xl">📋</span>
          </div>
          <p className="text-xs text-sage-600 font-medium">Chưa có thông tin thanh toán</p>
          <p className="text-[11px] text-sage-400 font-light leading-relaxed max-w-[220px] mx-auto">
            Vui lòng hoàn thành khai báo và chọn hạng phòng/biệt thự ở Bước 3 để hiển thị bảng tính phí chi tiết.
          </p>
        </div>
        
        {/* Technical statuses details */}
        <div className="mt-4 pt-4 border-t border-primary-50 space-y-2 text-[10px] font-mono font-medium text-sage-400 bg-primary-50/30 p-3">
          <div className="flex justify-between">
            <span>BOOKING STATUS:</span>
            <span className="font-bold text-sage-500">{bookingStatus}</span>
          </div>
          <div className="flex justify-between">
            <span>PAYMENT STATUS:</span>
            <span className="font-bold text-sage-500">{paymentStatus}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border border-primary-100 p-6 shadow-xs text-left sticky top-28 ${radius.card}`}
    >
      <h3 className="font-serif text-lg font-bold text-sage-950 border-b border-primary-100 pb-3 mb-4">
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

        {/* Retreat package display */}
        {selectedPackages && selectedPackages.map((pkg) => (
          <div key={pkg.packageId} className="flex justify-between font-medium pt-2 border-t border-primary-50">
            <span className="text-sage-800">Gói trị liệu ({pkg.name}):</span>
            <span className="text-sage-950 font-mono">{formatCurrency(pkg.price)}</span>
          </div>
        ))}

        {/* Meal costs */}
        {mealTotal > 0 && (
          <div className="flex justify-between font-medium pt-2 border-t border-primary-50">
            <span className="text-sage-800 flex items-center gap-1">
              <UtensilsCrossed className="h-3.5 w-3.5" /> Thực đơn ngoài gói:
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
              if (s.type === "per-guest") itemCost = s.price * guestInfo.guestsCount;
              else if (s.type === "per-guest-per-night")
                itemCost = s.price * guestInfo.guestsCount * nightsCount;
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
            <span
              className={`font-bold ${
                bookingStatus === "CONFIRMED"
                  ? "text-green-700"
                  : bookingStatus === "PENDING_PAYMENT"
                  ? "text-amber-700"
                  : "text-sage-500"
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
                  ? "text-green-700"
                  : paymentStatus === "PENDING"
                  ? "text-amber-700"
                  : "text-sage-500"
              }`}
            >
              {paymentStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
