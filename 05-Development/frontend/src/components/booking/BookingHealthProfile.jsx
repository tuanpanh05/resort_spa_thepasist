import React from "react";
import { ArrowLeft, ChevronRight, Leaf, AlertTriangle, Heart, ShieldCheck } from "lucide-react";
import { ALLERGY_OPTIONS, DIET_OPTIONS } from "../../constants/options";

export default function BookingHealthProfile({
  formErrors,
  consentDataProcessing,
  setConsentDataProcessing,
  consentSharing,
  setConsentSharing,
  dietaryPreference,
  setDietaryPreference,
  selectedAllergies,
  toggleAllergy,
  otherAllergy,
  setOtherAllergy,
  physicalCondition,
  setPhysicalCondition,
  onPrev,
  onNext,
}) {
  return (
    <div className="space-y-8 text-left animate-fade-in">
      <div className="border-b border-primary-50 pb-3 mb-6">
        <h2 className="text-resort-section text-sage-950 mb-1">
          Bước 2: Hồ Sơ Sức Khỏe & Chế Độ Ăn
        </h2>
        <p className="text-resort-desc">
          Thông tin sức khỏe giúp chúng tôi cá nhân hóa dịch vụ Spa, thực đơn và trị liệu dành riêng cho bạn. Dữ liệu sẽ được mã hóa và bảo mật.
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
            Ví dụ: Đau lưng, huyết áp cao, đang mang thai... Thông tin này chỉ Kỹ thuật viên trị liệu mới được xem.
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
        <div className="bg-amber-50/70 p-5 space-y-4 border-l-4 border-amber-500 rounded-sm">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-bold text-amber-800">
              Cam Kết Thu Thập Dữ Liệu (Nghị định 356/2025/NĐ-CP)
            </h3>
          </div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={consentDataProcessing}
              onChange={(e) => setConsentDataProcessing(e.target.checked)}
              className="w-4 h-4 mt-1 accent-amber-600 flex-shrink-0"
            />
            <span className="text-xs text-amber-900">
              <strong>Đồng ý Xử lý Dữ liệu Sức khỏe:</strong> Tôi đồng ý cho Ngũ Sơn Resort lưu trữ và xử lý thông tin sức khỏe của tôi (được mã hóa AES-256) nhằm cung cấp dịch vụ phù hợp.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={consentSharing}
              onChange={(e) => setConsentSharing(e.target.checked)}
              className="w-4 h-4 mt-1 accent-amber-600 flex-shrink-0"
            />
            <span className="text-xs text-amber-900">
              <strong>Đồng ý Chia sẻ Có Giới hạn:</strong> Tôi đồng ý chia sẻ thông tin dị ứng với bộ phận Bếp và thông tin thể chất với Kỹ thuật viên Spa.
            </span>
          </label>
        </div>
      </div>

      <div className="pt-6 border-t border-primary-50 flex justify-between gap-4">
        <button
          type="button"
          onClick={onPrev}
          className="px-8 py-3.5 border border-sage-800 text-sage-800 text-resort-button tracking-wider hover:bg-sage-50 transition-all uppercase rounded-none flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Quay lại
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-8 py-3.5 bg-primary-800 hover:bg-primary-900 text-white text-resort-button tracking-wider hover:bg-primary-950 transition-all uppercase rounded-none flex items-center cursor-pointer"
        >
          Chọn Villa & Dịch vụ <ChevronRight className="h-4 w-4 ml-1.5" />
        </button>
      </div>
    </div>
  );
}
