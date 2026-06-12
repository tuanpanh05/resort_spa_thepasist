import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Heart,
  Leaf,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ArrowLeft,
  Save,
  Info,
} from "lucide-react";
import heroBg from "../assets/hero_bg.png";
import { medicalApi } from "../api";

// Food allergy options matching SRS
const ALLERGY_OPTIONS = [
  { key: "peanuts", label: "Đậu phộng (Peanuts)" },
  { key: "gluten", label: "Gluten / Lúa mì" },
  { key: "shellfish", label: "Hải sản có vỏ (Shellfish)" },
  { key: "dairy", label: "Sữa / Lactose" },
  { key: "eggs", label: "Trứng" },
  { key: "soy", label: "Đậu nành (Soy)" },
  { key: "treenuts", label: "Hạt cây (Tree nuts)" },
  { key: "fish", label: "Cá" },
];

// Dietary preference options
const DIET_OPTIONS = [
  { key: "omnivore", label: "Ăn tạp (Omnivore)" },
  { key: "vegetarian", label: "Chay (Vegetarian)" },
  { key: "vegan", label: "Thuần chay (Vegan)" },
  { key: "pescatarian", label: "Ăn cá (Pescatarian)" },
  { key: "keto", label: "Keto" },
  { key: "halal", label: "Halal" },
];

export default function HealthProfile() {
  const navigate = useNavigate();
  const userFullName = localStorage.getItem("userFullName") || sessionStorage.getItem("userFullName") || "Khách hàng";

  // Form state
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [otherAllergy, setOtherAllergy] = useState("");
  const [dietaryPreference, setDietaryPreference] = useState("omnivore");
  const [physicalCondition, setPhysicalCondition] = useState("");
  const [consentDataProcessing, setConsentDataProcessing] = useState(false);
  const [consentSharing, setConsentSharing] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      navigate("/dang-nhap");
      return;
    }
    loadExistingProfile();
  }, []);

  const loadExistingProfile = async () => {
    try {
      setLoadingProfile(true);
      const profile = await medicalApi.getMyProfile();
      if (profile && profile.explicitConsentSigned) {
        setExistingProfile(profile);
        setConsentDataProcessing(true);
        setConsentSharing(true);
        // Restore data to form
        if (profile.foodAllergies) {
          try {
            const parsed = JSON.parse(profile.foodAllergies);
            setSelectedAllergies(parsed.selected || []);
            setOtherAllergy(parsed.other || "");
            setDietaryPreference(parsed.diet || "omnivore");
          } catch {
            setOtherAllergy(profile.foodAllergies);
          }
        }
        if (profile.physicalCondition) {
          setPhysicalCondition(profile.physicalCondition);
        }
      }
    } catch (err) {
      // No profile yet or error - that's OK, user can create one
      console.log("No existing health profile found.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const toggleAllergy = (key) => {
    setSelectedAllergies((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // UC02 Constraint: Both consents are mandatory per Decree 356/2025
    if (!consentDataProcessing || !consentSharing) {
      setError(
        "Bạn phải đồng ý với cả hai điều khoản xử lý và chia sẻ dữ liệu sức khỏe để tiếp tục (theo Nghị định 356/2025/NĐ-CP)."
      );
      return;
    }

    const foodAllergiesJson = JSON.stringify({
      selected: selectedAllergies,
      other: otherAllergy,
      diet: dietaryPreference,
    });

    setLoading(true);
    try {
      await medicalApi.saveMyProfile(
        physicalCondition,
        foodAllergiesJson,
        true
      );
      setSuccess("Hồ sơ sức khỏe đã được lưu thành công! Dữ liệu được mã hóa AES-256.");
      await loadExistingProfile();
    } catch (err) {
      setError(err.message || "Không thể lưu hồ sơ sức khỏe. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      await medicalApi.deleteMyProfile();
      setShowDeleteConfirm(false);
      setExistingProfile(null);
      setSelectedAllergies([]);
      setOtherAllergy("");
      setPhysicalCondition("");
      setConsentDataProcessing(false);
      setConsentSharing(false);
      setSuccess("Hồ sơ sức khỏe của bạn đã được xóa vĩnh viễn khỏi hệ thống.");
    } catch (err) {
      setError(err.message || "Không thể xóa hồ sơ sức khỏe.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-sage-600 text-sm">Đang tải hồ sơ sức khỏe...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative bg-cover bg-center py-24 px-4"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="absolute inset-0 bg-[#233827]/50 backdrop-blur-sm" />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-white/80 hover:text-white text-xs font-semibold mb-6 group transition"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại trang chủ</span>
        </Link>

        {/* Header */}
        <div className="bg-white/95 backdrop-blur-md rounded-md shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-primary-100 rounded-md text-primary-900 mb-3">
              <Heart className="h-6 w-6" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-sage-900">
              Hồ Sơ Sức Khỏe & Chế Độ Ăn
            </h1>
            <p className="text-sm text-sage-600 mt-2">
              Xin chào <strong>{userFullName}</strong>! Thông tin sức khỏe giúp chúng tôi cá nhân hóa dịch vụ Spa, thực đơn và trị liệu dành riêng cho bạn.
            </p>
          </div>

          {/* Existing profile indicator */}
          {existingProfile && (
            <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">Hồ sơ đã được lưu</p>
                <p className="text-xs text-green-700">Cập nhật lần cuối: {existingProfile.updatedAt ? new Date(existingProfile.updatedAt).toLocaleString("vi-VN") : "—"}</p>
              </div>
            </div>
          )}

          {/* Error / Success messages */}
          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 text-red-700 text-sm border border-red-100 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-md bg-green-50 text-green-700 text-sm border border-green-100 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-8">
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
                    className={`flex items-center justify-center p-3 rounded-md border cursor-pointer text-xs font-semibold transition-all ${
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
                    className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer text-xs font-medium transition-all ${
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

            {/* Section 3: Physical Condition */}
            <div>
              <h3 className="text-sm font-bold text-sage-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                Tình Trạng Thể Chất
              </h3>
              <p className="text-xs text-sage-500 mb-3">
                Ví dụ: Đau lưng, thoát vị đĩa đệm, huyết áp cao, tiểu đường, đang mang thai... Thông tin này được mã hóa và chỉ Kỹ thuật viên Spa/Vật lý trị liệu mới được xem.
              </p>
              <textarea
                value={physicalCondition}
                onChange={(e) => setPhysicalCondition(e.target.value)}
                rows={4}
                placeholder="Mô tả tình trạng sức khỏe thể chất của bạn..."
                className="w-full px-2 py-3 border-b border-primary-200 bg-transparent text-sm text-sage-800 focus:outline-none focus:border-primary-800 rounded-none resize-none transition-all duration-200"
              />
            </div>

            {/* Section 4: Explicit Consent Checkboxes (Decree 356/2025) */}
            <div className="bg-amber-50/70 rounded-md p-5 space-y-4 border-l-4 border-amber-500">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-5 w-5 text-amber-600" />
                <h3 className="text-sm font-bold text-amber-800">
                  Đồng Ý Thu Thập Dữ Liệu Nhạy Cảm (Nghị định 356/2025/NĐ-CP)
                </h3>
              </div>
              <p className="text-xs text-amber-700">
                Theo Nghị định về Bảo vệ Dữ liệu Cá nhân, việc thu thập thông tin sức khỏe yêu cầu sự đồng ý rõ ràng và riêng biệt của bạn.
              </p>

              {/* Consent 1: Data Processing */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  id="consent-processing"
                  checked={consentDataProcessing}
                  onChange={(e) => setConsentDataProcessing(e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-amber-600 flex-shrink-0"
                />
                <span className="text-xs text-amber-900 leading-relaxed">
                  <strong>Đồng ý Xử lý Dữ liệu Sức khỏe:</strong> Tôi đồng ý cho Ngũ Sơn Resort lưu trữ và xử lý thông tin dị ứng thực phẩm và tình trạng thể chất của tôi, được mã hóa AES-256, nhằm mục đích cung cấp dịch vụ nghỉ dưỡng phù hợp.
                </span>
              </label>

              {/* Consent 2: Limited Sharing */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  id="consent-sharing"
                  checked={consentSharing}
                  onChange={(e) => setConsentSharing(e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-amber-600 flex-shrink-0"
                />
                <span className="text-xs text-amber-900 leading-relaxed">
                  <strong>Đồng ý Chia sẻ Có Giới hạn:</strong> Tôi đồng ý để thông tin dị ứng thực phẩm của tôi được chia sẻ với bộ phận bếp (để loại bỏ món ăn không an toàn), và thông tin thể chất được chia sẻ với kỹ thuật viên Spa/trị liệu (để điều chỉnh phác đồ trị liệu). Các nhân sự khác không được xem dữ liệu này.
                </span>
              </label>

              <div className="flex items-start gap-2 pt-1">
                <Info className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-600">
                  Bạn có thể thu hồi sự đồng ý và xóa vĩnh viễn hồ sơ sức khỏe bất cứ lúc nào thông qua nút "Xóa Hồ Sơ" bên dưới.
                </p>
              </div>
            </div>

            {/* Submit Button */}
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
                  {existingProfile ? "Cập Nhật Hồ Sơ Sức Khỏe" : "Lưu Hồ Sơ Sức Khỏe"}
                </>
              )}
            </button>
          </form>

          {/* UC05 – Right to Deletion Section */}
          {existingProfile && (
            <div className="mt-8 pt-6 border-t border-red-100">
              <div className="flex items-start gap-3 mb-4">
                <Trash2 className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-red-700">Quyền Xóa Dữ Liệu Sức Khỏe</h3>
                  <p className="text-xs text-red-600 mt-1">
                    Theo Nghị định 356/2025, bạn có quyền yêu cầu xóa vĩnh viễn toàn bộ hồ sơ sức khỏe và dị ứng thực phẩm của mình. Dữ liệu sẽ bị xóa hoàn toàn khỏi hệ thống và không thể phục hồi.
                  </p>
                </div>
              </div>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-3 rounded-md text-sm font-semibold border border-red-300 text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa Vĩnh Viễn Hồ Sơ Sức Khỏe
                </button>
              ) : (
                <div className="bg-red-50/70 border-l-4 border-red-500 rounded-md p-5 space-y-4">
                  <p className="text-sm font-semibold text-red-800 text-center">
                    ⚠️ Bạn có chắc chắn muốn xóa vĩnh viễn hồ sơ sức khỏe?
                  </p>
                  <p className="text-xs text-red-600 text-center">
                    Hành động này không thể hoàn tác. Toàn bộ dữ liệu sức khỏe và dị ứng sẽ bị xóa hoàn toàn.
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
                      onClick={handleDeleteConfirm}
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
      </div>
    </div>
  );
}
