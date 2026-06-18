import React from "react";
import { ArrowLeft, ChevronRight, Loader2, Heart } from "lucide-react";
import { formatCurrency } from "../../utils/format";
import { DIET_OPTIONS, ALLERGY_OPTIONS } from "../../constants/options";

export default function BookingConfirmation({
  guestInfo,
  nightsCount,
  dietaryPreference,
  selectedAllergies,
  otherAllergy,
  physicalCondition,
  selectedVilla,
  selectedServices,
  villaTotal,
  isConfirming,
  onPrev,
  onConfirm,
}) {
  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="border-b border-primary-50 pb-3 mb-6">
        <h2 className="text-resort-section text-sage-950 mb-1">
          Bước 4: Xác Nhận Đơn Đặt Lịch
        </h2>
        <p className="text-resort-desc">
          Xác nhận lại toàn bộ thông tin chi tiết trước khi hệ thống tạo mã đặt phòng tạm thời.
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm">
        {/* Part 1: Guest Information Info Card */}
        <div className="bg-primary-50/15 border border-primary-100 p-6 space-y-4">
          <h3 className="text-[10px] font-bold text-primary-800 uppercase tracking-widest border-b border-primary-100 pb-2">
            Thông tin khách lưu trú
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Họ và tên</span>
              <span className="font-semibold text-sage-900">{guestInfo.fullName}</span>
            </div>
            <div>
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Số điện thoại</span>
              <span className="font-semibold text-sage-900">{guestInfo.phone}</span>
            </div>
            <div>
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Địa chỉ Email</span>
              <span className="font-semibold text-sage-900">{guestInfo.email}</span>
            </div>
            <div>
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Số người đi cùng</span>
              <span className="font-semibold text-sage-900">{guestInfo.guestsCount} Khách hàng</span>
            </div>
            <div>
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Khoảng thời gian nghỉ</span>
              <span className="font-semibold text-sage-900">
                {guestInfo.checkInDate} → {guestInfo.checkOutDate}
              </span>
            </div>
          </div>

          {guestInfo.specialRequest && (
            <div className="pt-2 border-t border-primary-100/50 space-y-2">
              <div>
                <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Yêu cầu đặc biệt</span>
                <span className="text-sage-700 italic font-medium">{guestInfo.specialRequest}</span>
              </div>
            </div>
          )}
        </div>

        {/* Part 1.5: Health Profile */}
        <div className="bg-primary-50/15 border border-primary-100 p-6 space-y-4">
          <h3 className="text-[10px] font-bold text-primary-800 uppercase tracking-widest border-b border-primary-100 pb-2 flex items-center gap-2">
            <Heart className="h-3 w-3" /> Hồ sơ sức khỏe & Dị ứng
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Chế độ ăn uống</span>
              <span className="font-semibold text-sage-900">
                {DIET_OPTIONS.find((d) => d.key === dietaryPreference)?.label || dietaryPreference}
              </span>
            </div>
            <div>
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Dị ứng thực phẩm</span>
              <span className="font-semibold text-amber-700">
                {selectedAllergies.length > 0 || otherAllergy ? (
                  [
                    ...selectedAllergies.map((a) => ALLERGY_OPTIONS.find((opt) => opt.key === a)?.label),
                    otherAllergy,
                  ]
                    .filter(Boolean)
                    .join(", ")
                ) : "Không có"}
              </span>
            </div>
            <div className="md:col-span-2">
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Tình trạng thể chất</span>
              <span className="font-semibold text-rose-700 whitespace-pre-line">{physicalCondition || "Bình thường"}</span>
            </div>
          </div>
        </div>

        {/* Part 2: Selected services lists */}
        <div className="bg-white border border-primary-100 p-6 space-y-4">
          <h3 className="text-[10px] font-bold text-primary-800 uppercase tracking-widest border-b border-primary-100 pb-2">
            Chi tiết dịch vụ đã chọn
          </h3>

          <div className="space-y-3.5">
            {/* Villa details */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="font-serif text-sm font-bold text-sage-950 block">
                  🏡 {selectedVilla?.title}
                </span>
                <span className="text-[10px] text-sage-400 font-light block mt-0.5">
                  Đơn giá: {formatCurrency(selectedVilla?.price)}/đêm × {nightsCount} Đêm
                </span>
              </div>
              <span className="font-semibold text-sage-900">{formatCurrency(villaTotal)}</span>
            </div>

            {/* Service items */}
            {selectedServices.map((s) => {
              let itemTotal = 0;
              let descriptionText = "";
              if (s.type === "per-guest") {
                itemTotal = s.price * guestInfo.guestsCount;
                descriptionText = `${formatCurrency(s.price)}/khách × ${guestInfo.guestsCount} Khách`;
              } else if (s.type === "per-guest-per-night") {
                itemTotal = s.price * guestInfo.guestsCount * nightsCount;
                descriptionText = `${formatCurrency(s.price)}/khách/đêm × ${guestInfo.guestsCount} Khách × ${nightsCount} Đêm`;
              } else {
                itemTotal = s.price;
                descriptionText = "Chi phí một lượt";
              }
              return (
                <div
                  key={s.id}
                  className="flex justify-between items-start gap-4 pt-3 border-t border-primary-100/50"
                >
                  <div>
                    <span className="font-serif text-sm font-bold text-sage-950 block">
                      🌿 {s.title}
                    </span>
                    <span className="text-[10px] text-sage-400 font-light block mt-0.5">
                      {descriptionText}
                    </span>
                  </div>
                  <span className="font-semibold text-sage-900">{formatCurrency(itemTotal)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation actions */}
      <div className="pt-6 border-t border-primary-50 flex justify-between gap-4">
        <button
          type="button"
          disabled={isConfirming}
          onClick={onPrev}
          className="px-6 py-3.5 border border-sage-800 text-sage-800 text-resort-button tracking-widest uppercase rounded-none hover:bg-sage-50 transition-all flex items-center disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Quay lại
        </button>

        <button
          type="button"
          disabled={isConfirming}
          onClick={onConfirm}
          className="px-8 py-3.5 bg-primary-800 hover:bg-primary-900 text-white text-resort-button tracking-widest uppercase rounded-none transition-all duration-300 flex items-center cursor-pointer disabled:opacity-70"
        >
          {isConfirming ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" /> Đang tạo đơn đặt...
            </>
          ) : (
            <>
              Xác nhận & Thanh toán cọc <ChevronRight className="h-4 w-4 ml-1.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
