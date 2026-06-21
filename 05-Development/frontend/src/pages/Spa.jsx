import React, { useState, useEffect } from "react";
import {
  Heart, Sparkles, Clock, Loader2, AlertCircle,
  Search, DollarSign, ArrowRight, Leaf, Flame,
  Smile, Activity, X, CheckCircle, Users, Star,
  Minus, Plus
} from "lucide-react";
import { masterDataApi } from "../api";

// ─── Bộ lọc danh mục ────────────────────────────────────────────────────────
const categoryFilters = [
  { label: "Tất cả các gói", value: "", icon: Sparkles },
  { label: "Yoga phục hồi",  value: "YOGA",         icon: Heart    },
  { label: "Thanh lọc cơ thể", value: "DETOX",      icon: Leaf     },
  { label: "Giảm béo",       value: "WEIGHT_LOSS",   icon: Flame    },
  { label: "Thư giãn Stress", value: "STRESS_RELIEF",icon: Smile    },
  { label: "Chăm sóc chung", value: "GENERAL",       icon: Activity },
];

// ─── Nhãn tiếng Việt cho healthGoal ─────────────────────────────────────────
const healthGoalLabel = {
  YOGA:         "Yoga phục hồi",
  DETOX:        "Thanh lọc cơ thể",
  WEIGHT_LOSS:  "Giảm béo",
  STRESS_RELIEF:"Thư giãn Stress",
  GENERAL:      "Chăm sóc chung",
};

// ─── Helper: phút → "X giờ Y phút" ──────────────────────────────────────────
function formatDuration(minutes) {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h} giờ ${m} phút`;
}

// ─── Helper: định dạng giá VND ───────────────────────────────────────────────
function formatPrice(price) {
  if (!price) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
    .format(price)
    .replace("₫", "đ");
}

// ═══════════════════════════════════════════════════════════════════════════════
// Modal chi tiết gói
// ═══════════════════════════════════════════════════════════════════════════════
function PackageDetailModal({ pkg, onClose }) {
  if (!pkg) return null;
  const [guestsCount, setGuestsCount] = useState(1);
  const includesList = pkg.includes ? pkg.includes.split(";").filter(Boolean) : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ảnh banner */}
        <div className="relative h-64 overflow-hidden rounded-t-2xl">
          <img
            src={
              pkg.imageUrl ||
              "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
            }
            alt={pkg.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#003929]/80 to-transparent" />

          {/* Nút đóng */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-2 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge danh mục */}
          <div className="absolute top-4 left-4">
            <span className="bg-[#003929]/90 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-widest backdrop-blur-md">
              {healthGoalLabel[pkg.healthGoal] || pkg.healthGoal}
            </span>
          </div>

          {/* Tiêu đề trên ảnh */}
          <div className="absolute bottom-5 left-6 right-6">
            <h2 className="font-serif text-2xl font-bold text-white leading-tight drop-shadow">
              {pkg.name}
            </h2>
          </div>
        </div>

        {/* Nội dung */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Cột trái: Giới thiệu & Dịch vụ bao gồm */}
            <div className="md:col-span-7 space-y-6">
              {/* Mô tả */}
              <div>
                <h3 className="font-bold text-[#003929] text-sm uppercase tracking-wider mb-2.5">
                  Giới thiệu dịch vụ
                </h3>
                <p className="text-[#5e5e5b] text-sm leading-relaxed">
                  {pkg.description || "Chúng tôi sẽ cung cấp thêm thông tin về dịch vụ này trong thời gian sớm nhất."}
                </p>
              </div>

              {/* Dịch vụ đi kèm */}
              {includesList.length > 0 && (
                <div>
                  <h3 className="font-bold text-[#003929] text-sm uppercase tracking-wider mb-2.5">
                    Dịch vụ bao gồm
                  </h3>
                  <ul className="space-y-2">
                    {includesList.map((inc, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[#363122]">
                        <CheckCircle className="w-4 h-4 text-[#003929] flex-shrink-0 mt-0.5" />
                        <span>{inc.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Đánh giá placeholder */}
              <div className="flex items-center gap-1 pt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-sm text-gray-500 ml-2">5.0 · Dịch vụ cao cấp</span>
              </div>
            </div>

            {/* Cột phải: Thông tin đặt lịch & Tính tiền */}
            <div className="md:col-span-5 flex flex-col gap-5 bg-gray-50/50 rounded-2xl p-5 border border-gray-100/80">
              {/* Thẻ thông tin nhanh */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#003929] shrink-0" />
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase tracking-wider">Thời lượng</span>
                    <span className="font-bold text-[#003929] text-sm">{formatDuration(pkg.durationDays)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-[#003929] shrink-0" />
                  <div>
                    <span className="block text-[10px] text-gray-500 uppercase tracking-wider">Loại dịch vụ</span>
                    <span className="font-bold text-[#003929] text-sm">
                      {healthGoalLabel[pkg.healthGoal] || "Chăm sóc chung"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-200/60" />

              {/* Chọn số lượng khách & Tính tổng tiền */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-[11px] font-bold text-[#003929] uppercase tracking-wider">
                      Số người tham gia
                    </span>
                    <span className="text-[10px] text-gray-500">Tăng giảm số khách</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setGuestsCount((prev) => Math.max(1, prev - 1))}
                      className="text-[#003929] hover:bg-[#f0f9f5] rounded-full p-1 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                      disabled={guestsCount <= 1}
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[3px]" />
                    </button>
                    <span className="w-5 text-center font-bold text-sm text-[#003929]">{guestsCount}</span>
                    <button
                      type="button"
                      onClick={() => setGuestsCount((prev) => prev + 1)}
                      className="text-[#003929] hover:bg-[#f0f9f5] rounded-full p-1 transition-colors cursor-pointer flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                    </button>
                  </div>
                </div>

                <div className="h-px bg-gray-200/60" />

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#5e5e5b]">
                    <span>Đơn giá trên người:</span>
                    <span className="font-semibold text-gray-800">{formatPrice(pkg.price)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-[#003929]">Tổng thanh toán:</span>
                    <span className="text-base font-extrabold text-[#c99543]">{formatPrice(pkg.price * guestsCount)}</span>
                  </div>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="flex flex-col gap-2 pt-2">
                <a
                  href={`/dat-lich?packageId=${pkg.packageId}&guests=${guestsCount}&totalPrice=${pkg.price * guestsCount}`}
                  className="w-full bg-[#003929] text-white text-center py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#00281d] transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <span>Đặt dịch vụ ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={onClose}
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Trang Spa chính
// ═══════════════════════════════════════════════════════════════════════════════
export default function Spa() {
  const [packages, setPackages]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [filters, setFilters] = useState({
    keyword:         "",
    healthGoal:      "",
    minPrice:        "",
    maxPrice:        "",
    maxDurationDays: "",
  });

  // Tải / lọc danh sách gói
  useEffect(() => {
    setLoading(true);
    masterDataApi
      .filterRetreatPackages(filters)
      .then((data) => {
        setPackages(data);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Không thể tải danh sách gói trị liệu.");
        setLoading(false);
      });
  }, [filters.keyword, filters.healthGoal, filters.maxPrice, filters.maxDurationDays]);

  return (
    <div className="min-h-screen bg-[#fcf9f8]">
      {/* ── Modal chi tiết ── */}
      {selectedPackage && (
        <PackageDetailModal
          pkg={selectedPackage}
          onClose={() => setSelectedPackage(null)}
        />
      )}

      {/* ── Hero section ── */}
      <section className="relative min-h-[45vh] flex items-center justify-center text-white py-32 overflow-hidden text-center">
        {/* Background Image with subtle scale for premium feel */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1600&q=80"
            alt="Spa background"
            className="w-full h-full object-cover object-center scale-105 transform"
          />
          {/* Vibrant green overlay layers - brighter & more green */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#024a30]/75 via-[#03623e]/50 to-[#013c26]/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#013522]/30 via-transparent to-[#013522]/30" />
        </div>

        {/* Ambient glow decorative circles - brighter Emerald and Green glow */}
        <div className="absolute inset-0 opacity-35 pointer-events-none z-10">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-emerald-400/40 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute -bottom-20 -right-20 w-[450px] h-[450px] rounded-full bg-[#10b981]/30 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        </div>

        {/* Content container */}
        <div className="relative z-20 max-w-4xl mx-auto px-6">
          {/* Glassmorphic Tagline Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2 rounded-full mb-6 shadow-xl">
            <Leaf className="w-3.5 h-3.5 text-amber-300 fill-amber-300/20" />
            <span className="text-[10px] font-bold text-amber-100 uppercase tracking-[0.3em]">
              Ngũ Sơn Resort & Spa
            </span>
          </div>

          {/* Heading with serif and luxury gold accent */}
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-wide drop-shadow">
            Trị Liệu & <span className="text-[#c99543]">Chăm Sóc</span> Sức Khỏe
          </h1>

          {/* Subtitle with premium line spacing and contrast */}
          <p className="text-gray-100/90 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-light tracking-wide drop-shadow-sm">
            Khám phá các liệu trình chăm sóc sức khỏe đẳng cấp, được thiết kế tinh tế
            để phục hồi sự cân bằng giữa <span className="font-semibold text-amber-200">thân – tâm – trí</span> trong khung cảnh thiên nhiên tuyệt đẹp của Ngũ Sơn.
          </p>
        </div>
      </section>

      {/* ── Bộ lọc danh mục ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap gap-2">
            {categoryFilters.map(({ label, value, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setFilters({ ...filters, healthGoal: value })}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  filters.healthGoal === value
                    ? "bg-[#003929] text-white border-[#003929] shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:text-[#003929] hover:border-[#003929]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                showAdvancedFilters
                  ? "bg-[#003929] text-white border-[#003929]"
                  : "bg-white text-gray-600 border-gray-200 hover:text-[#003929] hover:border-[#003929]"
              }`}
            >
              <span>⚙</span>
              {showAdvancedFilters ? "Đóng bộ lọc" : "Lọc nâng cao"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Bộ lọc nâng cao ── */}
      {showAdvancedFilters && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-100 bg-white shadow-xs rounded-2xl mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Từ khóa */}
            <div className="text-left">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Từ khóa tìm kiếm
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="VD: Yoga, Detox, Thư giãn..."
                  value={filters.keyword}
                  onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#fcf9f8] border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#003929] rounded-xl"
                />
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Giá tối đa */}
            <div className="text-left">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Giá tối đa (VNĐ)
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Không giới hạn"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full pl-8 pr-4 py-2.5 bg-[#fcf9f8] border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#003929] rounded-xl"
                />
                <DollarSign className="h-4 w-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Thời lượng tối đa */}
            <div className="text-left">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Thời lượng tối đa
              </label>
              <select
                value={filters.maxDurationDays}
                onChange={(e) => setFilters({ ...filters, maxDurationDays: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#fcf9f8] border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#003929] rounded-xl appearance-none"
              >
                <option value="">Bất kỳ</option>
                <option value="60">60 phút trở xuống</option>
                <option value="75">75 phút trở xuống</option>
                <option value="90">90 phút trở xuống</option>
                <option value="120">120 phút trở xuống</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── Danh sách gói ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl text-left border-l-2 border-[#c99543] pl-5 md:pl-6">
            <span className="block text-[10px] font-bold text-[#c99543] uppercase tracking-[0.25em] mb-2.5">
              Liệu Pháp Chữa Lành
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#003929] mb-4 leading-tight">
              Các Gói Trị Liệu <span className="font-serif italic font-normal text-[#c99543] ml-1">Đặc Trưng</span>
            </h2>
            <p className="text-[#5e5e5b] text-sm md:text-base leading-relaxed font-light">
              Được thiết kế tinh tế để khôi phục sự cân bằng giữa <span className="font-medium text-[#003929]">thân – tâm – trí</span>,
              mỗi liệu trình tại Ngũ Sơn là một cuộc hành trình cảm giác riêng biệt và đáng nhớ.
            </p>
          </div>
        </div>

        {/* Trạng thái: loading / lỗi / trống / dữ liệu */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#003929]" />
            <span className="text-sm text-[#5e5e5b]">Đang tải danh sách gói trị liệu...</span>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <h3 className="font-bold text-sm">Lỗi tải dữ liệu</h3>
              <p className="text-xs mt-1 leading-relaxed">{error}</p>
            </div>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-3xl bg-white p-8">
            <p className="text-sm text-gray-500">Không tìm thấy gói trị liệu nào phù hợp với bộ lọc của bạn.</p>
            <button
              onClick={() => setFilters({ keyword: "", healthGoal: "", minPrice: "", maxPrice: "", maxDurationDays: "" })}
              className="mt-4 px-5 py-2 bg-[#003929] text-white text-xs font-semibold rounded-full hover:bg-[#00281d] transition-colors cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, idx) => {
              const isFeatured     = idx % 5 === 4;
              const priceFormatted = new Intl.NumberFormat("vi-VN").format(pkg.price / 1000) + "k";
              const includesList   = pkg.includes ? pkg.includes.split(";").filter(Boolean) : [];
              const goalLabel      = healthGoalLabel[pkg.healthGoal] || pkg.healthGoal;
              const imgSrc         = pkg.imageUrl ||
                "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80";

              if (isFeatured) {
                return (
                  <div
                    key={pkg.packageId}
                    className="group bg-[#003929] md:col-span-2 rounded-xl overflow-hidden shadow-lg hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col md:flex-row text-white text-left"
                  >
                    <div className="relative h-72 md:h-full md:w-1/2 overflow-hidden">
                      <img
                        src={imgSrc}
                        alt={pkg.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-[#003929]/20" />
                    </div>
                    <div className="p-10 md:w-1/2 flex flex-col justify-center">
                      <span className="font-sans text-[10px] font-bold text-[#80c4a7] uppercase tracking-widest mb-2">
                        Ưu Đãi Đặc Biệt
                      </span>
                      <span className="text-[10px] font-semibold text-teal-300/80 uppercase tracking-wider mb-4">
                        {goalLabel}
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-white mb-6">
                        {pkg.name}
                      </h3>
                      <p className="text-teal-100/90 text-sm mb-8 leading-relaxed font-normal line-clamp-3">
                        {pkg.description}
                      </p>

                      {includesList.length > 0 && (
                        <div className="mb-6 pt-4 border-t border-teal-800/60">
                          <span className="text-[9px] font-bold text-[#80c4a7] uppercase tracking-wider block mb-2">
                            Dịch vụ đi kèm
                          </span>
                          <ul className="space-y-1 text-xs">
                            {includesList.slice(0, 3).map((inc, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-[#80c4a7]" />
                                <span className="truncate">{inc.trim()}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] block opacity-70 uppercase tracking-wider">Giá dịch vụ</span>
                          <span className="text-2xl font-bold">{priceFormatted}</span>
                          <span className="flex items-center gap-1 mt-1 text-teal-200/80 text-[11px]">
                            <Clock className="h-3 w-3" />
                            {formatDuration(pkg.durationDays)}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedPackage(pkg)}
                          className="bg-white text-[#003929] px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-teal-50 transition-colors cursor-pointer"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              // Card thường
              return (
                <div
                  key={pkg.packageId}
                  className="group bg-white rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,57,41,0.06)] transition-all duration-500 cursor-pointer flex flex-col justify-between text-left"
                >
                  <div>
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={imgSrc}
                        alt={pkg.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-[#003929]/95 text-white text-[10px] font-semibold uppercase px-3 py-1 rounded-full backdrop-blur-md">
                          {goalLabel}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-serif text-base font-bold text-[#363122] line-clamp-2 leading-snug flex-1 mr-2">
                          {pkg.name}
                        </h3>
                        <span className="text-[#003929] font-bold text-sm whitespace-nowrap">{priceFormatted}</span>
                      </div>
                      <p className="text-[#5e5e5b] text-xs mb-4 line-clamp-2 leading-relaxed">
                        {pkg.description}
                      </p>

                      {includesList.length > 0 && (
                        <div className="pt-3 border-t border-gray-100">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                            Bao gồm
                          </span>
                          <ul className="space-y-1 text-xs text-gray-600">
                            {includesList.slice(0, 3).map((inc, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-[#003929]" />
                                <span className="truncate">{inc.trim()}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 pb-6 flex items-center justify-between border-t border-gray-50 pt-4">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatDuration(pkg.durationDays)}</span>
                    </div>
                    <button
                      onClick={() => setSelectedPackage(pkg)}
                      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#003929] hover:underline cursor-pointer"
                    >
                      Xem chi tiết <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Newsletter ── */}
      <section className="bg-[#f0eded] py-20 relative overflow-hidden mt-20 text-center">
        <div className="absolute -right-20 -top-20 opacity-10 pointer-events-none">
          <Sparkles className="w-[300px] h-[300px] text-[#003929]" />
        </div>
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <h2 className="font-serif text-3xl text-[#003929] mb-6">Đăng Ký Nhận Thông Tin Ưu Đãi</h2>
          <p className="text-[#5e5e5b] text-base mb-10 leading-relaxed font-normal">
            Nhận những bí quyết chăm sóc sức khỏe từ thiên nhiên và các chương trình ưu đãi
            độc quyền dành riêng cho thành viên.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); alert("Cảm ơn bạn đã đăng ký nhận thông tin!"); }}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <input
              className="flex-grow max-w-md rounded-full border-none px-8 py-4 bg-white shadow-xs focus:ring-2 focus:ring-[#003929] text-sm text-[#363122]"
              placeholder="Email của bạn"
              type="email"
              required
            />
            <button
              className="bg-[#003929] text-white px-10 py-4 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#00281d] transition-all cursor-pointer"
              type="submit"
            >
              Đăng Ký
            </button>
          </form>
          <p className="mt-6 text-xs text-[#5e5e5b] font-normal">
            Chúng tôi cam kết bảo mật thông tin của bạn.{" "}
            <a className="underline hover:text-[#003929]" href="#">Chính sách bảo mật</a>.
          </p>
        </div>
      </section>
    </div>
  );
}
