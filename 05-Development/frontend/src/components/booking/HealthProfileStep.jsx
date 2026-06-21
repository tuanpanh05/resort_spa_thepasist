import React from "react";
import { AlertTriangle, Leaf, Heart, ShieldAlert, ArrowLeft, ChevronRight } from "lucide-react";
import { DIET_OPTIONS, ALLERGY_OPTIONS } from "../../constants/booking";

export default function HealthProfileStep({
  formErrors,
  dietaryPreference,
  setDietaryPreference,
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
      <div className="border-b border-primary-50 pb-3 mb-6">
        <h2 className="text-resort-section text-sage-950 mb-1">
          Bước 2: Hồ Sơ Sức Khỏe & Chế Độ Ăn
        </h2>
        <p className="text-resort-desc">
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
          <h3 className="text-sm font-bold text-sage-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Leaf className="h-4 w-4 text-primary-700" />
            Chế Độ Ăn Uống
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DIET_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                className={`flex items-center justify-center p-3 rounded-none border cursor-pointer text-xs font-semibold transition-all ${
                  dietaryPreference === opt.key
                    ? "border-primary-800 bg-primary-50 text-primary-900"
                    : "border-primary-100 bg-white text-sage-600 hover:border-primary-300"
                }`}
              >
                <input
                  type="radio"
                  name="dietaryPreference"
                  value={opt.key}
                  checked={dietaryPreference === opt.key}
                  onChange={() => setDietaryPreference(opt.key)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Section 2: Food Allergies */}
        <div>
          <h3 className="text-sm font-bold text-sage-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Dị Ứng Thực Phẩm
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {ALLERGY_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                className={`flex items-center gap-2 p-3 rounded-none border cursor-pointer text-xs font-medium transition-all ${
                  selectedAllergies.includes(opt.key)
                    ? "border-amber-400 bg-amber-50 text-amber-800"
                    : "border-primary-100 bg-white text-sage-600 hover:border-primary-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedAllergies.includes(opt.key)}
                  onChange={() => toggleAllergy(opt.key)}
                  className="w-4 h-4 accent-amber-500"
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
            className="w-full px-4 py-3 bg-sage-50/50 border border-primary-200/50 text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400"
          />
        </div>

        {/* Section 3: Physical Condition */}
        <div>
          <h3 className="text-sm font-bold text-sage-800 uppercase tracking-wider mb-3 flex items-center gap-2">
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
            className="w-full px-4 py-3 bg-sage-50/50 border border-primary-200/50 text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400 resize-none"
          />
        </div>

        {/* Section 4: Explicit Consent */}
        <div className="bg-white border border-primary-100 p-6 sm:p-8 shadow-xs text-left mb-8 lg:mb-0">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="h-5 w-5 text-sage-800" />
            <h3 className="font-serif text-base font-bold text-sage-950 uppercase tracking-wide">
              Bảo Mật Y Tế (NĐ 356)
            </h3>
          </div>
          <p className="text-xs text-sage-600 mb-6 font-light leading-relaxed">
            Dữ liệu về bệnh lý sức khỏe và dị ứng thực phẩm là thông tin y tế nhạy cảm. Theo **Nghị
            định 356/2025/NĐ-CP**, resort yêu cầu sự đồng ý tường minh từ quý khách trước khi xử
            lý dữ liệu để lọc thực đơn.
          </p>

          <div className="bg-sage-50/50 p-4 sm:p-5 border border-primary-100/50">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consentDataProcessing && consentSharing}
                onChange={(e) => {
                  setConsentDataProcessing(e.target.checked);
                  setConsentSharing(e.target.checked);
                }}
                className="w-4 h-4 mt-0.5 accent-primary-700 flex-shrink-0 cursor-pointer"
              />
              <div className="flex flex-col gap-2">
                <span className="text-xs sm:text-sm font-semibold text-sage-900">
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
            <div className="p-4 border border-amber-600/30 text-amber-700 bg-amber-50/50 text-xs mt-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span className="font-semibold">Hệ thống chưa được phép lọc dị ứng.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-primary-50 py-4 -mx-6 sm:-mx-8 px-6 sm:px-8 -mb-6 sm:-mb-8 rounded-b-2xl z-10 flex justify-between gap-4 shadow-[0_-8px_20px_-6px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          onClick={handlePrevStep}
          className="px-8 py-3.5 border border-sage-800 text-sage-800 text-resort-button tracking-wider hover:bg-sage-50 transition-all uppercase rounded-none flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Quay lại
        </button>

        <button
          type="button"
          onClick={handleNextStep}
          className="px-8 py-3.5 bg-primary-800 hover:bg-primary-900 text-white text-resort-button tracking-wider hover:bg-primary-950 transition-all uppercase rounded-none flex items-center cursor-pointer"
        >
          Chọn Villa & Dịch vụ <ChevronRight className="h-4 w-4 ml-1.5" />
        </button>
      </div>
    </div>
  );
}
