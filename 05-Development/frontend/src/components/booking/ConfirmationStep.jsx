import React from "react";
import { Heart, UtensilsCrossed, Check, Copy, Info, ShieldCheck, Loader2 } from "lucide-react";
import { DIET_OPTIONS, ALLERGY_OPTIONS } from "../../constants/booking";

export default function ConfirmationStep({
  guestInfo,
  nightsCount,
  dietaryPreference,
  selectedAllergies,
  otherAllergy,
  physicalCondition,
  selectedVilla,
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
      <div className="border-b border-primary-50 pb-3 mb-6">
        <h2 className="text-resort-section text-sage-950 mb-1">Bước 6: Xác Nhận Đơn Đặt Lịch</h2>
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
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">
                Họ và tên
              </span>
              <span className="font-semibold text-sage-900">{guestInfo.fullName}</span>
            </div>
            <div>
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">
                Số điện thoại
              </span>
              <span className="font-semibold text-sage-900">{guestInfo.phone}</span>
            </div>
            <div>
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">
                Địa chỉ Email
              </span>
              <span className="font-semibold text-sage-900">{guestInfo.email}</span>
            </div>
            <div>
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">
                Số người đi cùng
              </span>
              <span className="font-semibold text-sage-900">{guestInfo.guestsCount} Khách hàng</span>
            </div>
            <div>
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">
                Khoảng thời gian nghỉ
              </span>
              <span className="font-semibold text-sage-900">
                {guestInfo.checkInDate} → {guestInfo.checkOutDate}
              </span>
            </div>
          </div>

          {guestInfo.specialRequest && (
            <div className="pt-2 border-t border-primary-100/50 space-y-2">
              <div>
                <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">
                  Yêu cầu đặc biệt
                </span>
                <span className="text-sage-700 italic font-medium">
                  {guestInfo.specialRequest}
                </span>
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
              <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">
                Chế độ ăn uống
              </span>
              <span className="font-semibold text-sage-900">
                {DIET_OPTIONS.find((d) => d.key === dietaryPreference)?.label || dietaryPreference}
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
        <div className="bg-white border border-primary-100 p-6 space-y-4">
          <h3 className="text-[10px] font-bold text-primary-800 uppercase tracking-widest border-b border-primary-100 pb-2">
            Chi tiết dịch vụ đã chọn
          </h3>

          <div className="space-y-3.5">
            {/* Villa details */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="font-serif text-sm font-bold text-sage-950 block">
                  🏡 Biệt thự: {selectedVilla?.typeName || selectedVilla?.title}
                </span>
                <span className="text-[10px] text-sage-400 font-light block mt-0.5">
                  Đơn giá: {formatCurrency(selectedVilla?.basePricePerNight || selectedVilla?.price)}/đêm × {nightsCount} Đêm
                </span>
              </div>
              <span className="font-semibold text-sage-900">{formatCurrency(villaTotal)}</span>
            </div>

            {/* Retreat Package details */}
            {selectedPackages && selectedPackages.map((pkg) => (
              <div key={pkg.packageId} className="flex justify-between items-start gap-4 pt-3 border-t border-primary-100/50">
                <div>
                  <span className="font-serif text-sm font-bold text-sage-950 block">
                    🎁 Gói trị liệu: {pkg.name}
                  </span>
                  <span className="text-[10px] text-sage-400 font-light block mt-0.5">
                    Mục tiêu: {pkg.goal} | Thời lượng: {pkg.durationText || `${pkg.durationDays} ngày`}
                  </span>
                </div>
                <span className="font-semibold text-sage-900">{formatCurrency(pkg.price)}</span>
              </div>
            ))}

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

            {/* Extra Meal Items */}
            {mealTotal > 0 && (
              <div className="flex justify-between items-start gap-4 pt-3 border-t border-primary-100/50">
                <div>
                  <span className="font-serif text-sm font-bold text-sage-950 flex items-center gap-1.5">
                    <UtensilsCrossed className="h-4 w-4 text-primary-800" /> Phụ thu gọi món bổ
                    sung
                  </span>
                  <span className="text-[10px] text-sage-400 font-light block mt-0.5">
                    Các món ăn gọi thêm nằm ngoài tiêu chuẩn gói
                  </span>
                </div>
                <span className="font-semibold text-sage-900">{formatCurrency(mealTotal)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Part 3: Total and Payment info */}
        <div className="bg-primary-50/15 border border-primary-100 p-6 space-y-4">
          <div className="flex justify-between items-end pb-4 border-b border-primary-100 border-dashed">
            <div>
              <span className="text-sage-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                Tổng chi phí dự kiến
              </span>
              <span className="text-[10px] text-sage-400 block font-light">Đã bao gồm 10% VAT & phí dịch vụ</span>
            </div>
            <span className="font-serif text-2xl font-bold text-primary-950">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-y-3 font-light text-sage-700 text-xs sm:text-sm pt-2">
            <span>Tiền đặt cọc cần thanh toán (30%):</span>
            <span className="font-bold text-primary-900 text-right">{formatCurrency(depositAmount)}</span>

            <span>Số dư thanh toán khi check-out (70%):</span>
            <span className="font-semibold text-sage-950 text-right">{formatCurrency(remainingAmount)}</span>
          </div>
        </div>

        <div className="p-4 bg-primary-50/50 border border-primary-100/50 flex items-start space-x-2 text-[10px] text-sage-600 leading-relaxed font-light">
          <Info className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
          <span>
            Vui lòng kiểm tra kỹ các thông tin chi tiết của đơn đặt phòng ở trên. Sau khi nhấn "Xác nhận & Đi đến thanh toán", hệ thống sẽ khởi tạo mã đặt phòng và hóa đơn tạm thời của bạn để thực hiện thanh toán trực tuyến.
          </span>
        </div>

        {/* Submit actions */}
        <div className="pt-6 border-t border-primary-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xs text-sage-500 font-light flex items-center">
            <ShieldCheck className="h-4.5 w-4.5 text-primary-600 mr-1.5" />
            Hệ thống đặt lịch Ngũ Sơn Resort & Spa
          </span>

          <div className="flex gap-4 w-full sm:w-auto">
             <button
              type="button"
              onClick={handlePrevStep}
              className="w-full sm:w-auto px-8 py-3.5 border border-sage-800 text-sage-800 text-resort-button tracking-wider hover:bg-sage-50 transition-all uppercase rounded-none flex items-center justify-center cursor-pointer disabled:opacity-70 font-semibold"
            >
              Quay lại
            </button>
            <button
              type="button"
              disabled={isVerifyingPayment}
              onClick={handleVerifyPayment}
              className="w-full sm:w-auto px-8 py-3.5 bg-primary-800 hover:bg-primary-900 text-white text-resort-button tracking-widest uppercase rounded-none transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-70 font-semibold"
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
