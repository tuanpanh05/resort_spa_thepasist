import React from "react";
import { AlertTriangle, Leaf, Heart, ShieldAlert, ArrowLeft, ChevronRight } from "lucide-react";
import { DIET_OPTIONS, ALLERGY_OPTIONS } from "../../constants/booking";

export default function HealthProfileStep({
  formErrors,
  dietaryPreferences,
  toggleDietaryPreference,
  selectedAllergies,
  toggleAllergy,
  otherAllergy,
  setOtherAllergy,
  physicalCondition,
  setPhysicalCondition,
  consentDataProcessing,
  setConsentDataProcessing,
  consentSharing,
  setConsentSharing,
  handlePrevStep,
  handleNextStep,
}) {
  return (
    <div className="space-y-8 text-left animate-fade-in">
      <div className="border-b border-[#cda250]/15 pb-4 mb-8">
        <h2 className="text-resort-section font-serif text-[#1a2f23] mb-1.5 font-semibold uppercase tracking-wide">
          Bước 2: Hồ Sơ Sức Khỏe & Chế Độ Ăn
        </h2>
        <p className="text-resort-desc text-sage-600 font-light">
          Thông tin sức khỏe giúp chúng tôi cá nhân hóa dịch vụ Spa, thực đơn và trị liệu dành riêng
          cho bạn. Dữ liệu sẽ được mã hóa và bảo mật.
        </p>
      </div>

      {formErrors.consent && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm border border-red-100 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{formErrors.consent}</span>
        </div>
      )}

      <div className="space-y-8">
        {/* Section 1: Dietary Preference */}
        <div>
          <h3 className="text-sm font-semibold text-[#1a2f23] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Leaf className="h-4 w-4 text-[#cda250]" />
            Chế Độ Ăn Uống
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DIET_OPTIONS.map((opt) => {
              const isSelected = dietaryPreferences && dietaryPreferences.includes(opt.key);
              return (
                <label
                  key={opt.key}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-xs font-semibold transition-all ${
                    isSelected
                      ? "border-[#cda250] bg-[#cda250]/10 text-[#1a2f23] shadow-sm"
                      : "border-[#cda250]/15 bg-white text-sage-600 hover:border-[#cda250]/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleDietaryPreference(opt.key)}
                    className="w-4 h-4 accent-[#cda250] rounded cursor-pointer"
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
        </div>

        {/* Section 2: Food Allergies */}
        <div>
          <h3 className="text-sm font-semibold text-[#1a2f23] uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Dị Ứng Thực Phẩm
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {ALLERGY_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-xs font-semibold transition-all ${
                  selectedAllergies.includes(opt.key)
                    ? "border-[#cda250] bg-[#cda250]/10 text-[#1a2f23] shadow-sm"
                    : "border-[#cda250]/15 bg-white text-sage-600 hover:border-[#cda250]/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedAllergies.includes(opt.key)}
                  onChange={() => toggleAllergy(opt.key)}
                  className="w-4 h-4 accent-[#cda250] rounded cursor-pointer"
                />
                {opt.label}
              </label>
            ))}
          </div>
          <input
            type="text"
            value={otherAllergy}
            onChange={(e) => setOtherAllergy(e.target.value)}
            placeholder="Dị ứng khác (nếu có)..."
            className="w-full px-4 py-3 bg-white border border-[#cda250]/20 text-resort-input text-[#1a2f23] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#cda250] focus:border-[#cda250] transition-all"
          />
        </div>

        {/* Section 3: Physical Condition */}
        <div>
          <h3 className="text-sm font-semibold text-[#1a2f23] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500" />
            Tình Trạng Thể Chất
          </h3>
          <p className="text-xs text-sage-500 mb-3">
            Ví dụ: Đau lưng, huyết áp cao, đang mang thai... Thông tin này chỉ Kỹ thuật viên trị
            liệu mới được xem.
          </p>
          <textarea
            value={physicalCondition}
            onChange={(e) => setPhysicalCondition(e.target.value)}
            rows={3}
            placeholder="Mô tả tình trạng sức khỏe thể chất của bạn..."
            className="w-full px-4 py-3 bg-white border border-[#cda250]/20 text-resort-input text-[#1a2f23] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#cda250] focus:border-[#cda250] transition-all resize-none"
          />
        </div>

        {/* Section 4: Explicit Consent */}
        <div className="bg-white border border-[#cda250]/20 p-6 sm:p-8 shadow-[0_4px_20px_rgba(26,44,34,0.02)] text-left mb-8 lg:mb-0 rounded-2xl">
          <div className="flex items-center gap-2.5 mb-4">
            <ShieldAlert className="h-5 w-5 text-[#cda250]" />
            <h3 className="font-serif text-base font-bold text-[#1a2f23] uppercase tracking-wide">
              Bảo Mật Y Tế (NĐ 356)
            </h3>
          </div>
          <p className="text-xs text-sage-600 mb-6 font-light leading-relaxed">
            Dữ liệu về bệnh lý sức khỏe và dị ứng thực phẩm là thông tin y tế nhạy cảm. Theo **Nghị
            định 356/2025/NĐ-CP**, resort yêu cầu sự đồng ý tường minh từ quý khách trước khi xử
            lý dữ liệu để lọc thực đơn.
          </p>

          <div className="bg-[#fbfaf7] p-4 sm:p-5 border border-[#cda250]/15 rounded-xl">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consentDataProcessing && consentSharing}
                onChange={(e) => {
                  setConsentDataProcessing(e.target.checked);
                  setConsentSharing(e.target.checked);
                }}
                className="w-4 h-4 mt-0.5 accent-[#cda250] flex-shrink-0 cursor-pointer"
              />
              <div className="flex flex-col gap-2">
                <span className="text-xs sm:text-sm font-semibold text-[#1a2f23]">
                  Tôi tự nguyện đồng ý cho phép nhà bếp Ngũ Sơn truy cập và xử lý dữ liệu dị ứng để
                  tự động lọc món ăn gây hại.
                </span>
                <span className="text-[10px] sm:text-xs text-sage-500 italic">
                  * Mặc định hộp kiểm là chưa chọn. Dữ liệu chỉ được xử lý khi bạn tích chọn.
                </span>
              </div>
            </label>
          </div>

          {!(consentDataProcessing && consentSharing) && (
            <div className="p-4 border border-amber-500/20 text-amber-800 bg-amber-50/30 text-xs mt-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600" />
                <span className="font-semibold">Hệ thống chưa được phép lọc dị ứng.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-[#fbfaf7] border-t border-[#cda250]/15 py-4 -mx-6 sm:-mx-8 px-6 sm:px-8 -mb-6 sm:-mb-8 rounded-b-2xl z-10 flex justify-between gap-4 shadow-[0_-8px_20px_-6px_rgba(26,44,34,0.05)]">
        <button
          type="button"
          onClick={handlePrevStep}
          className="px-8 py-3.5 border border-[#1a2f23]/30 text-[#1a2f23] text-resort-button tracking-wider hover:bg-[#1a2f23]/5 transition-all uppercase rounded-lg flex items-center font-semibold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Quay lại
        </button>

        <button
          type="button"
          onClick={handleNextStep}
          className="px-8 py-3.5 bg-[#cda250] hover:bg-[#d9b360] text-[#070e0a] hover:shadow-[0_4px_20px_rgba(205,162,80,0.35)] text-resort-button tracking-wider transition-all uppercase rounded-lg flex items-center cursor-pointer font-bold"
        >
          Chọn Villa & Dịch vụ <ChevronRight className="h-4 w-4 ml-1.5" />
        </button>
      </div>
    </div>
  );
}
