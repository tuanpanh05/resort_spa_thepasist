import React, { useState, useEffect, useCallback } from "react";
import { Leaf, AlertTriangle, Heart, ShieldCheck, Info, CheckCircle2, Trash2, Save } from "lucide-react";
import { medicalApi } from "../../services/api";
import { ALLERGY_OPTIONS, DIET_OPTIONS } from "../../constants/options";

export default function HealthTab() {
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [otherAllergy, setOtherAllergy] = useState("");
  const [dietaryPreference, setDietaryPreference] = useState("omnivore");
  const [physicalCondition, setPhysicalCondition] = useState("");
  const [consentProcessing, setConsentProcessing] = useState(false);
  const [consentSharing, setConsentSharing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [existing, setExisting] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const p = await medicalApi.getMyProfile();
      if (p && p.explicitConsentSigned) {
        setExisting(p);
        setConsentProcessing(true);
        setConsentSharing(true);
        if (p.foodAllergies) {
          try {
            const parsed = JSON.parse(p.foodAllergies);
            setSelectedAllergies(parsed.selected || []);
            setOtherAllergy(parsed.other || "");
            setDietaryPreference(parsed.diet || "omnivore");
          } catch {
            setOtherAllergy(p.foodAllergies);
          }
        }
        if (p.physicalCondition) setPhysicalCondition(p.physicalCondition);
      }
    } catch {
      /* no profile yet */
    } finally {
      setLoadingInit(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const toggleAllergy = (key) =>
    setSelectedAllergies((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!consentProcessing || !consentSharing) {
      setError("Bạn phải đồng ý với cả hai điều khoản để tiếp tục (theo Nghị định 356/2025/NĐ-CP).");
      return;
    }
    const foodAllergiesJson = JSON.stringify({
      selected: selectedAllergies,
      other: otherAllergy,
      diet: dietaryPreference,
    });
    setLoading(true);
    try {
      await medicalApi.saveMyProfile(physicalCondition, foodAllergiesJson, true);
      setSuccess("Hồ sơ sức khỏe đã được lưu thành công! Dữ liệu được mã hóa AES-256.");
      await loadProfile();
    } catch (err) {
      setError(err.message || "Không thể lưu hồ sơ sức khỏe.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      await medicalApi.deleteMyProfile();
      setExisting(null);
      setSelectedAllergies([]);
      setOtherAllergy("");
      setPhysicalCondition("");
      setConsentProcessing(false);
      setConsentSharing(false);
      setShowDeleteConfirm(false);
      setSuccess("Hồ sơ sức khỏe đã được xóa vĩnh viễn.");
    } catch (err) {
      setError(err.message || "Không thể xóa hồ sơ sức khỏe.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingInit)
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-3 border-primary-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      {existing && (
        <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Hồ sơ đã được lưu</p>
            <p className="text-xs text-emerald-700">
              Cập nhật lần cuối:{" "}
              {existing.updatedAt ? new Date(existing.updatedAt).toLocaleString("vi-VN") : "—"}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-md bg-red-50 text-red-700 text-sm border border-red-200 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3.5 rounded-md bg-emerald-50 text-emerald-700 text-sm border border-emerald-200 flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Dietary preference */}
        <div className="bg-white rounded-md p-2 pb-6 border-b border-primary-100">
          <h4 className="text-xs font-bold text-sage-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Leaf className="h-4 w-4 text-primary-700" /> Chế Độ Ăn Uống
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DIET_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                className={`flex items-center justify-center p-2.5 rounded-md border cursor-pointer text-xs font-semibold transition-all ${
                  dietaryPreference === opt.key
                    ? "border-primary-800 bg-primary-50 text-primary-900"
                    : "border-primary-100 bg-white text-sage-600 hover:border-primary-300"
                }`}
              >
                <input
                  type="radio"
                  name="diet"
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

        {/* Food allergies */}
        <div className="bg-white rounded-md p-2 pb-6 border-b border-primary-100">
          <h4 className="text-xs font-bold text-sage-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" /> Dị Ứng Thực Phẩm
          </h4>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {ALLERGY_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                className={`flex items-center gap-2 p-2.5 rounded-md border cursor-pointer text-xs font-medium transition-all ${
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
            className="w-full px-2 py-2.5 border-b border-primary-200 bg-transparent text-sm text-sage-800 focus:outline-none focus:border-primary-800 rounded-none transition-all duration-200"
          />
        </div>

        {/* Physical condition */}
        <div className="bg-white rounded-md p-2 pb-6 border-b border-primary-100">
          <h4 className="text-xs font-bold text-sage-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500" /> Tình Trạng Thể Chất
          </h4>
          <p className="text-xs text-sage-500 mb-3">
            Ví dụ: Đau lưng, thoát vị đĩa đệm, huyết áp cao, tiểu đường, đang mang thai... Thông tin
            này được mã hóa và chỉ Kỹ thuật viên Spa/Vật lý trị liệu mới được xem.
          </p>
          <textarea
            value={physicalCondition}
            onChange={(e) => setPhysicalCondition(e.target.value)}
            rows={4}
            placeholder="Mô tả tình trạng sức khỏe thể chất của bạn..."
            className="w-full px-2 py-3 border-b border-primary-200 bg-transparent text-sm text-sage-800 focus:outline-none focus:border-primary-800 rounded-none resize-none transition-all duration-200"
          />
        </div>

        {/* Consent */}
        <div className="bg-amber-50/70 border-l-4 border-amber-500 rounded-md p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-600" />
            <h4 className="text-sm font-bold text-amber-800">
              Đồng Ý Thu Thập Dữ Liệu Nhạy Cảm (Nghị định 356/2025/NĐ-CP)
            </h4>
          </div>
          <p className="text-xs text-amber-700">
            Theo Nghị định về Bảo vệ Dữ liệu Cá nhân, việc thu thập thông tin sức khỏe yêu cầu sự
            đồng ý rõ ràng và riêng biệt của bạn.
          </p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="consent-processing"
              checked={consentProcessing}
              onChange={(e) => setConsentProcessing(e.target.checked)}
              className="w-5 h-5 mt-0.5 accent-amber-600 flex-shrink-0"
            />
            <span className="text-xs text-amber-900 leading-relaxed">
              <strong>Đồng ý Xử lý Dữ liệu Sức khỏe:</strong> Tôi đồng ý cho Ngũ Sơn Resort lưu trữ
              và xử lý thông tin dị ứng thực phẩm và tình trạng thể chất của tôi, được mã hóa
              AES-256, nhằm mục đích cung cấp dịch vụ nghỉ dưỡng phù hợp.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="consent-sharing"
              checked={consentSharing}
              onChange={(e) => setConsentSharing(e.target.checked)}
              className="w-5 h-5 mt-0.5 accent-amber-600 flex-shrink-0"
            />
            <span className="text-xs text-amber-900 leading-relaxed">
              <strong>Đồng ý Chia sẻ Có Giới hạn:</strong> Tôi đồng ý để thông tin dị ứng thực phẩm
              của tôi được chia sẻ với bộ phận bếp, và thông tin thể chất được chia sẻ với kỹ thuật
              viên Spa/trị liệu. Các nhân sự khác không được xem dữ liệu này.
            </span>
          </label>
          <div className="flex items-start gap-2 pt-1">
            <Info className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-600">
              Bạn có thể thu hồi sự đồng ý và xóa vĩnh viễn hồ sơ sức khỏe bất cứ lúc nào.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-md text-sm font-semibold bg-primary-900 hover:bg-primary-800 text-white shadow-md transition-all duration-300 hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4" />
              {existing ? "Cập Nhật Hồ Sơ Sức Khỏe" : "Lưu Hồ Sơ Sức Khỏe"}
            </>
          )}
        </button>
      </form>

      {/* Delete section */}
      {existing && (
        <div className="pt-4 border-t border-red-100">
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 rounded-md text-sm font-semibold border border-red-300 text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" /> Xóa Vĩnh Viễn Hồ Sơ Sức Khỏe
            </button>
          ) : (
            <div className="bg-red-50/70 border-l-4 border-red-500 rounded-md p-5 space-y-4">
              <p className="text-sm font-semibold text-red-800 text-center">
                ⚠️ Bạn có chắc chắn muốn xóa vĩnh viễn hồ sơ sức khỏe?
              </p>
              <p className="text-xs text-red-600 text-center">
                Hành động này không thể hoàn tác. Toàn bộ dữ liệu sức khỏe và dị ứng sẽ bị xóa hoàn
                toàn.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="py-2.5 rounded-md text-sm font-semibold border border-sage-300 text-sage-700 hover:bg-sage-50 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="py-2.5 rounded-md text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Xác Nhận Xóa"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
