import React from "react";
import { Heart, UtensilsCrossed, Check, Copy, Info, ShieldCheck, Loader2 } from "lucide-react";
import { DIET_OPTIONS, ALLERGY_OPTIONS } from "../../constants/booking";

export default function ConfirmationStep({
  guestInfo,
  nightsCount,
  dietaryPreferences,
  selectedAllergies,
  otherAllergy,
  physicalCondition,
  selectedVilla,
  selectedRooms,
  roomTypes,
  selectedServices,
  villaTotal,
  mealTotal,
  totalAmount,
  depositAmount,
  remainingAmount,
  formatCurrency,
  handleCopyText,
  copiedField,
  isVerifyingPayment,
  handleVerifyPayment,
  handlePrevStep,
  selectedPackages = [],
}) {
  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="border-b border-[#cda250]/15 pb-4 mb-8">
        <h2 className="text-resort-section font-serif text-[#1a2f23] mb-1.5 font-semibold uppercase tracking-wide">Bước 6: Xác Nhận Đơn Đặt Lịch</h2>
        <p className="text-resort-desc mt-1 text-sage-600 font-light">
          Xác nhận lại toàn bộ thông tin chi tiết trước khi hệ thống tạo mã đặt phòng tạm thời.
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm">
        {/* Part 1: Guest Information Info Card */}
        <div className="bg-[#fbfaf7]/90 border border-[#cda250]/15 p-6 space-y-4 rounded-2xl shadow-xs">
          <h3 className="text-[10px] font-bold text-[#cda250] uppercase tracking-widest border-b border-[#cda250]/10 pb-2">
            Thông tin khách lưu trú
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">
                Họ và tên
              </span>
              <span className="font-semibold text-[#1a2f23]">{guestInfo.fullName}</span>
            </div>
            <div>
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">
                Số điện thoại
              </span>
              <span className="font-semibold text-[#1a2f23]">{guestInfo.phone}</span>
            </div>
            <div>
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">
                Địa chỉ Email
              </span>
              <span className="font-semibold text-[#1a2f23]">{guestInfo.email}</span>
            </div>
            <div>
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">
                Số người đi cùng
              </span>
              <span className="font-semibold text-[#1a2f23]">{guestInfo.guestsCount} Khách hàng</span>
            </div>
            <div>
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">
                Khoảng thời gian nghỉ
              </span>
              <span className="font-semibold text-[#1a2f23]">
                {guestInfo.checkInDate} → {guestInfo.checkOutDate}
              </span>
            </div>
          </div>

          {guestInfo.specialRequest && (
            <div className="pt-2 border-t border-[#cda250]/10 space-y-2">
              <div>
                <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">
                  Yêu cầu đặc biệt
                </span>
                <span className="text-sage-700 italic font-semibold">
                  {guestInfo.specialRequest}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Part 1.5: Health Profile */}
        <div className="bg-[#fbfaf7]/90 border border-[#cda250]/15 p-6 space-y-4 rounded-2xl shadow-xs">
          <h3 className="text-[10px] font-bold text-[#cda250] uppercase tracking-widest border-b border-[#cda250]/10 pb-2 flex items-center gap-2">
            <Heart className="h-3.5 w-3.5 text-rose-500" /> Hồ sơ sức khỏe & Dị ứng
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">
                Chế độ ăn uống
              </span>
              <span className="font-semibold text-[#1a2f23]">
                {Array.isArray(dietaryPreferences)
                  ? dietaryPreferences.map(k => DIET_OPTIONS.find(d => d.key === k)?.label || k).join(", ")
                  : (DIET_OPTIONS.find(d => d.key === dietaryPreferences)?.label || dietaryPreferences || "Không xác định")}
              </span>
            </div>
            <div>
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">
                Dị ứng thực phẩm
              </span>
              <span className="font-semibold text-amber-700">
                {selectedAllergies.length > 0 || otherAllergy
                  ? [
                      ...selectedAllergies.map(
                        (a) => ALLERGY_OPTIONS.find((opt) => opt.key === a)?.label
                      ),
                      otherAllergy,
                    ]
                      .filter(Boolean)
                      .join(", ")
                  : "Không có"}
              </span>
            </div>
            <div className="md:col-span-2">
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">
                Tình trạng thể chất
              </span>
              <span className="font-semibold text-rose-700 whitespace-pre-line">
                {physicalCondition || "Bình thường"}
              </span>
            </div>
          </div>
        </div>

        {/* Part 2: Selected services lists */}
        <div className="bg-white border border-[#cda250]/15 p-6 space-y-4 rounded-2xl shadow-xs">
          <h3 className="text-[10px] font-bold text-[#cda250] uppercase tracking-widest border-b border-[#cda250]/10 pb-2">
            Chi tiết dịch vụ đã chọn
          </h3>

          <div className="space-y-3.5">
            {/* Villa details */}
            {selectedRooms && Object.entries(selectedRooms).map(([roomTypeId, qty]) => {
              const roomType = roomTypes.find((r) => r.roomTypeId === Number(roomTypeId));
              if (!roomType || qty <= 0) return null;
              return (
                <div key={roomTypeId} className="flex justify-between items-start gap-4">
                  <div>
                    <span className="font-serif text-sm font-bold text-[#1a2f23] block">
                      🏡 Biệt thự: {roomType.typeName} (Số lượng: {qty} phòng)
                    </span>
                    <span className="text-[10px] text-sage-400 font-light block mt-0.5">
                      Đơn giá: {formatCurrency(roomType.basePricePerNight)}/đêm × {nightsCount} Đêm × {qty} Phòng
                    </span>
                  </div>
                  <span className="font-semibold text-[#1a2f23]">{formatCurrency(roomType.basePricePerNight * nightsCount * qty)}</span>
                </div>
              );
            })}


            {/* Service items */}
            {selectedServices.map((s) => {
              let itemTotal = 0;
              let descriptionText = "";
              const pricingType = s.pricingType || s.type || "per-guest";
              const serviceTitle = s.name || s.title || "Dịch vụ";
              if (pricingType === "per-guest") {
                itemTotal = s.price * guestInfo.guestsCount;
                descriptionText = `${formatCurrency(s.price)}/khách × ${guestInfo.guestsCount} Khách`;
              } else if (pricingType === "per-guest-per-night") {
                itemTotal = s.price * guestInfo.guestsCount * nightsCount;
                descriptionText = `${formatCurrency(s.price)}/khách/đêm × ${guestInfo.guestsCount} Khách × ${nightsCount} Đêm`;
              } else {
                itemTotal = s.price;
                descriptionText = "Chi phí một lượt";
              }
              return (
                <div
                  key={s.serviceId || s.id}
                  className="flex justify-between items-start gap-4 pt-3 border-t border-[#cda250]/10"
                >
                  <div>
                    <span className="font-serif text-sm font-bold text-[#1a2f23] block">
                      🌿 {serviceTitle}
                    </span>
                    <span className="text-[10px] text-sage-400 font-light block mt-0.5">
                      {descriptionText}
                    </span>
                  </div>
                  <span className="font-semibold text-[#1a2f23]">{formatCurrency(itemTotal)}</span>
                </div>
              );
            })}

            {/* Extra Meal Items */}
            {mealTotal > 0 && (
              <div className="flex justify-between items-start gap-4 pt-3 border-t border-[#cda250]/10">
                <div>
                  <span className="font-serif text-sm font-bold text-[#1a2f23] flex items-center gap-1.5">
                    <UtensilsCrossed className="h-4 w-4 text-[#cda250]" /> Phụ phí ẩm thực / Combo
                  </span>
                  <span className="text-[10px] text-sage-400 font-light block mt-0.5">
                    Các món ăn hoặc Combo dinh dưỡng đã chọn
                  </span>
                </div>
                <span className="font-semibold text-[#1a2f23]">{formatCurrency(mealTotal)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Part 3: Total and Payment info */}
        <div className="bg-[#fbfaf7] border border-[#cda250]/20 p-6 space-y-4 rounded-2xl shadow-xs">
          <div className="flex justify-between items-end pb-4 border-b border-[#cda250]/15 border-dashed">
            <div>
              <span className="text-sage-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                Tổng chi phí dự kiến
              </span>
              <span className="text-[10px] text-sage-400 block font-light">Đã bao gồm 10% VAT & phí dịch vụ</span>
            </div>
            <span className="font-serif text-2xl font-bold text-[#1a2f23]">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-y-3 font-light text-sage-700 text-xs sm:text-sm pt-2">
            <span className="font-medium text-[#1a2f23]">Tiền đặt cọc cần thanh toán (30%):</span>
            <span className="font-bold text-[#cda250] text-right font-mono">{formatCurrency(depositAmount)}</span>

            <span className="font-medium text-sage-600">Số dư thanh toán khi check-out (70%):</span>
            <span className="font-semibold text-sage-800 text-right font-mono">{formatCurrency(remainingAmount)}</span>
          </div>
        </div>

        <div className="p-4 bg-[#fbfaf7] border border-[#cda250]/15 flex items-start space-x-2 text-[10px] text-sage-600 leading-relaxed font-light rounded-xl">
          <Info className="h-4 w-4 text-[#cda250] mt-0.5 flex-shrink-0" />
          <span>
            Vui lòng kiểm tra kỹ các thông tin chi tiết của đơn đặt phòng ở trên. Sau khi nhấn "Xác nhận & Đi đến thanh toán", hệ thống sẽ khởi tạo mã đặt phòng và hóa đơn tạm thời của bạn để thực hiện thanh toán trực tuyến.
          </span>
        </div>

        {/* Submit actions */}
        <div className="sticky bottom-0 bg-[#fbfaf7] border-t border-[#cda250]/15 py-4 -mx-6 sm:-mx-8 px-6 sm:px-8 -mb-6 sm:-mb-8 rounded-b-2xl z-10 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_-8px_20px_-6px_rgba(26,44,34,0.05)]">
          <span className="text-xs text-sage-500 font-semibold flex items-center">
            <ShieldCheck className="h-4.5 w-4.5 text-[#cda250] mr-1.5" />
            Hệ thống đặt lịch Ngũ Sơn Resort & Spa
          </span>

          <div className="flex gap-4 w-full sm:w-auto">
             <button
              type="button"
              onClick={handlePrevStep}
              className="w-full sm:w-auto px-8 py-3.5 border border-[#1a2f23]/30 text-[#1a2f23] text-resort-button tracking-wider hover:bg-[#1a2f23]/5 transition-all uppercase rounded-lg flex items-center justify-center cursor-pointer disabled:opacity-70 font-semibold"
            >
              Quay lại
            </button>
            <button
              type="button"
              disabled={isVerifyingPayment}
              onClick={handleVerifyPayment}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#cda250] hover:bg-[#d9b360] text-[#070e0a] hover:shadow-[0_4px_20px_rgba(205,162,80,0.35)] text-resort-button tracking-widest uppercase rounded-lg transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-70 font-bold"
            >
              {isVerifyingPayment ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" /> Đang tạo đơn đặt...
                </>
              ) : (
                "Xác nhận & Đi đến thanh toán"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
