import React, { useState, useEffect } from "react";
import {
  Heart, Sparkles, Clock, Loader2, AlertCircle,
  Search, DollarSign, ArrowRight, Leaf, Flame,
  Smile, Activity, X, CheckCircle, Users, Star,
  Minus, Plus, ChevronUp
} from "lucide-react";
import { masterDataApi } from "../api";
import resortSpaHeroBg from "../assets/resort_spa_hero_bg.png";

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
// Component hiệu ứng cuộn rơi từ trên xuống
// ═══════════════════════════════════════════════════════════════════════════════
function ScrollReveal({ children, delay = 0, className = "" }) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    let observer;
    const timer = setTimeout(() => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            if (ref.current && observer) observer.unobserve(ref.current);
          }
        },
        {
          threshold: 0.1, // kích hoạt sớm khi 10% phần tử xuất hiện
        }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }
    }, 150); // Đợi layout ổn định để tránh tự động kích hoạt trên các thiết bị nhanh hoặc chậm

    return () => {
      clearTimeout(timer);
      if (observer && ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "both",
      }}
      className={`${className} ${isIntersecting ? "animate-slide-down" : "opacity-0"}`}
    >
      {children}
    </div>
  );
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
      style={{ backgroundColor: "rgba(29, 11, 13, 0.85)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-warm-cream border border-sage-mist rounded-none w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner image */}
        <div className="relative h-64 overflow-hidden border-b border-sage-mist">
          <img
            src={
              pkg.imageUrl ||
              "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
            }
            alt={pkg.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black-olive/80 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black-olive/40 hover:bg-black-olive/60 text-warm-cream rounded-[1px] p-2 transition-colors cursor-pointer border border-sage-mist/30"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <span className="bg-forest-ink text-warm-cream text-[10px] font-medium uppercase px-3 py-1 rounded-[1px] tracking-wider border border-sage-mist/30">
              {healthGoalLabel[pkg.healthGoal] || pkg.healthGoal}
            </span>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-5 left-6 right-6 text-left">
            <h2 className="font-serif text-2xl font-light text-warm-cream leading-tight drop-shadow tracking-[0.06em] uppercase">
              {pkg.name}
            </h2>
          </div>
        </div>

        {/* Content body */}
        <div className="p-8 text-black-olive text-left">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left: Intro & Includes */}
            <div className="md:col-span-7 space-y-6">
              <div>
                <h3 className="font-bold text-forest-ink text-xs uppercase tracking-wider mb-2.5">
                  Giới thiệu dịch vụ
                </h3>
                <p className="text-black-olive/80 text-sm leading-relaxed">
                  {pkg.description || "Chúng tôi sẽ cung cấp thêm thông tin về dịch vụ này trong thời gian sớm nhất."}
                </p>
              </div>

              {includesList.length > 0 && (
                <div>
                  <h3 className="font-bold text-forest-ink text-xs uppercase tracking-wider mb-2.5">
                    Dịch vụ bao gồm
                  </h3>
                  <ul className="space-y-2">
                    {includesList.map((inc, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs text-black-olive/90">
                        <CheckCircle className="w-4 h-4 text-forest-ink flex-shrink-0 mt-0.5" />
                        <span>{inc.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-1 pt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-lemon-zest text-lemon-zest" />
                ))}
                <span className="text-xs text-forest-ink ml-2">5.0 · Dịch vụ cao cấp</span>
              </div>
            </div>

            {/* Right: Booking Info & calculation */}
            <div className="md:col-span-5 flex flex-col gap-5 bg-sage-mist/20 rounded-[1px] p-5 border border-sage-mist">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-forest-ink">
                  <Clock className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-forest-ink/75 uppercase tracking-wider">Thời lượng</span>
                    <span className="font-bold text-xs">{formatDuration(pkg.durationDays)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-forest-ink">
                  <Sparkles className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-forest-ink/75 uppercase tracking-wider">Loại dịch vụ</span>
                    <span className="font-bold text-xs">
                      {healthGoalLabel[pkg.healthGoal] || "Chăm sóc chung"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-sage-mist" />

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-[10px] font-bold text-forest-ink uppercase tracking-wider">
                      Số người tham gia
                    </span>
                    <span className="text-[9px] text-forest-ink/75">Tăng giảm số khách</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-[1px] border border-sage-mist shadow-none">
                    <button
                      type="button"
                      onClick={() => setGuestsCount((prev) => Math.max(1, prev - 1))}
                      className="text-black-olive hover:bg-sage-mist/30 rounded-[1px] p-1 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                      disabled={guestsCount <= 1}
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[3px]" />
                    </button>
                    <span className="w-5 text-center font-bold text-sm text-black-olive">{guestsCount}</span>
                    <button
                      type="button"
                      onClick={() => setGuestsCount((prev) => prev + 1)}
                      className="text-black-olive hover:bg-sage-mist/30 rounded-[1px] p-1 transition-colors cursor-pointer flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                    </button>
                  </div>
                </div>

                <div className="h-px bg-sage-mist" />

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-black-olive/80">
                    <span>Đơn giá trên người:</span>
                    <span className="font-semibold text-black-olive">{formatPrice(pkg.price)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-forest-ink">Tổng thanh toán:</span>
                    <span className="text-base font-bold font-serif text-forest-ink">{formatPrice(pkg.price * guestsCount)}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons (Black Olive filled CTA on Warm Cream dialog) */}
              <div className="flex flex-col gap-2 pt-2">
                <a
                  href={`/dat-lich?packageId=${pkg.packageId}&guests=${guestsCount}&totalPrice=${pkg.price * guestsCount}`}
                  className="w-full bg-black-olive hover:bg-black-olive/90 text-warm-cream text-center py-3 rounded-[1px] text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-black-olive"
                >
                  <span>Đặt dịch vụ ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={onClose}
                  className="w-full py-3 border border-black-olive text-black-olive bg-transparent rounded-[1px] text-xs font-semibold uppercase tracking-wider hover:bg-black-olive hover:text-warm-cream transition-all cursor-pointer"
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
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showBackToTop, setShowBackToTop]     = useState(false);
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
  }, [filters.healthGoal]);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-forest-ink">
      {/* ── Modal chi tiết ── */}
      {selectedPackage && (
        <PackageDetailModal
          pkg={selectedPackage}
          onClose={() => setSelectedPackage(null)}
        />
      )}

      {/* ── Hero section (Thiết kế nền xanh lá & candlelit brasserie) ── */}
      <section className="relative min-h-[45vh] flex items-center justify-center text-white py-32 overflow-hidden text-center">
        {/* Background Image với hiệu ứng scale nhẹ */}
        <div className="absolute inset-0 z-0">
          <img
            src={resortSpaHeroBg}
            alt="Resort Spa Services background"
            className="w-full h-full object-cover object-center scale-100 transform"
          />
          {/* Moody dark forest green gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-forest-ink/85 via-forest-ink/60 to-forest-ink/90" />
        </div>

        {/* Ambient candlelit flicker glow circle (Lemon Zest glow) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none z-10">
          <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-lemon-zest/30 blur-[120px] animate-pulse" style={{ animationDuration: '7s' }} />
        </div>

        {/* Content container */}
        <div className="relative z-20 max-w-4xl mx-auto px-6">
          {/* Tagline Badge theo phong cách tối giản không bo cong tròn của Limón */}
          <div className="inline-flex items-center gap-2 bg-warm-cream/10 border border-warm-cream/25 px-5 py-2 rounded-[1px] mb-6 shadow-none">
            <Leaf className="w-3.5 h-3.5 text-lemon-zest fill-lemon-zest/20" />
            <span className="text-[10px] font-bold text-warm-cream uppercase tracking-[0.3em]">
              Ngũ Sơn Resort & Spa
            </span>
          </div>

          {/* Heading với điểm nhấn màu vàng Lemon Zest */}
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-wide drop-shadow">
            Trị Liệu & <span className="text-lemon-zest">Chăm Sóc</span> Sức Khỏe
          </h1>

          {/* Subtitle với độ tương phản cao */}
          <p className="text-warm-cream/90 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-light tracking-wide drop-shadow-sm">
            Khám phá các liệu trình chăm sóc sức khỏe đẳng cấp, được thiết kế tinh tế
            để phục hồi sự cân bằng giữa <span className="font-semibold text-lemon-zest">thân – tâm – trí</span> trong khung cảnh candlelit thư giãn của Ngũ Sơn.
          </p>
        </div>
      </section>

      {/* ── Bộ lọc danh mục (Cùng một hàng, bo tròn lại) ── */}
      <div className="sticky top-20 z-30 bg-forest-ink border-b border-sage-mist/30 shadow-none py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          {/* Dòng các danh mục - Cuộn ngang trên mobile/màn hình nhỏ, hiển thị hàng đơn, căn giữa */}
          <div className="flex items-center gap-2 overflow-x-auto flex-nowrap pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]">
            {categoryFilters.map(({ label, value, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setFilters({ ...filters, healthGoal: value })}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase border transition-all cursor-pointer flex-shrink-0 ${
                  filters.healthGoal === value
                    ? "bg-lemon-zest text-black-olive border-lemon-zest"
                    : "bg-transparent text-warm-cream border-sage-mist hover:border-lemon-zest"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Danh sách gói (Nền màu nâu nhẹ `#e6dac9`) ── */}
      <div className="bg-[#e6dac9] text-black-olive">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl text-left border-l border-forest-ink pl-5 md:pl-6">
              <span className="block text-xs font-bold text-forest-ink uppercase tracking-[0.25em] mb-2.5">
                Liệu Pháp Chữa Lành
              </span>
              <h2 className="font-sans text-[30px] md:text-[36px] font-medium text-forest-ink mb-4 leading-tight tracking-[1.08px] uppercase">
                Các Gói Trị Liệu <span className="font-serif italic font-normal text-forest-ink ml-1 lowercase">Đặc Trưng</span>
              </h2>
              <p className="text-forest-ink/90 text-[19px] leading-[1.30] tracking-[0.57px] font-normal max-w-[640px]">
                Được thiết kế tinh tế để khôi phục sự cân bằng giữa <span className="font-medium text-forest-ink">thân – tâm – trí</span>,
                mỗi liệu trình tại Ngũ Sơn là một cuộc hành trình cảm giác riêng biệt và đáng nhớ.
              </p>
            </div>
          </div>

          {/* Trạng thái: loading / lỗi / trống / dữ liệu */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-forest-ink" />
              <span className="text-sm text-forest-ink/70">Đang tải danh sách gói trị liệu...</span>
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto p-6 bg-forest-ink/20 border border-sage-mist text-forest-ink rounded-[1px] flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h3 className="font-bold text-sm">Lỗi tải dữ liệu</h3>
                <p className="text-xs mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-sage-mist rounded-none p-8">
              <p className="text-sm text-forest-ink/70">Không tìm thấy gói trị liệu nào phù hợp với bộ lọc của bạn.</p>
              <button
                onClick={() => setFilters({ keyword: "", healthGoal: "", minPrice: "", maxPrice: "", maxDurationDays: "" })}
                className="mt-4 px-5 py-2 bg-black-olive text-warm-cream text-xs font-semibold rounded-[1px] hover:bg-black-olive/90 transition-colors cursor-pointer border border-black-olive"
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

                const delay = isFeatured ? 0 : (idx % 3) * 200;

                if (isFeatured) {
                  return (
                    <ScrollReveal key={pkg.packageId} delay={delay} className="md:col-span-3">
                      <div
                        className="group bg-black-olive w-full rounded-2xl overflow-hidden border border-sage-mist/20 shadow-none hover:border-lemon-zest transition-all duration-500 cursor-pointer flex flex-col md:flex-row text-warm-cream text-left"
                      >
                        <div className="p-10 md:w-[45%] flex flex-col justify-center space-y-6">
                          <div className="space-y-2">
                            <span className="block font-sans text-xs font-bold text-sage-mist uppercase tracking-widest">
                              Dịch Vụ Đặc Trưng
                            </span>
                            <span className="text-xs font-semibold text-lemon-zest uppercase tracking-wider block">
                              {goalLabel}
                            </span>
                          </div>
                          <h3 className="font-sans text-[30px] md:text-[36px] font-medium text-lemon-zest leading-tight tracking-[1.08px] uppercase">
                            {pkg.name}
                          </h3>
                          <p className="text-warm-cream/90 text-[19px] leading-[1.30] tracking-[0.57px] font-normal line-clamp-3">
                            {pkg.description}
                          </p>

                          {includesList.length > 0 && (
                            <div className="pt-4 border-t border-sage-mist/25">
                              <span className="text-[10px] font-bold text-sage-mist uppercase tracking-wider block mb-2">
                                Dịch vụ đi kèm:
                              </span>
                              <ul className="space-y-1 text-xs">
                                {includesList.slice(0, 3).map((inc, i) => (
                                  <li key={i} className="flex items-center gap-1.5 text-warm-cream/80">
                                    <span className="w-1.5 h-1.5 rounded-full bg-warm-cream" />
                                    <span className="truncate">{inc.trim()}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-sage-mist/20">
                            <div>
                              <span className="text-[10px] block opacity-70 uppercase tracking-wider text-sage-mist">Giá dịch vụ</span>
                              <span className="text-2xl font-bold font-serif text-lemon-zest">{priceFormatted}</span>
                              <span className="flex items-center gap-1 mt-1 text-sage-mist text-xs">
                                <Clock className="h-3.5 w-3.5" />
                                {formatDuration(pkg.durationDays)}
                              </span>
                            </div>
                            <button
                              onClick={() => setSelectedPackage(pkg)}
                              className="bg-lemon-zest text-black-olive hover:bg-lemon-zest/90 border border-lemon-zest px-6 py-3 rounded-[1px] text-[16px] font-semibold uppercase tracking-[0.64px] transition-colors cursor-pointer"
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                        <div className="relative min-h-[300px] md:w-[55%] overflow-hidden">
                          <img
                            src={imgSrc}
                            alt={pkg.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80";
                            }}
                          />
                          <div className="absolute inset-0 bg-black-olive/20" />
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                }

                // Card thường (Có viền bo tròn 2px đậm rõ nét, nền warm-cream, ảnh aspect-[4/3] bo tròn, tên gói trên ảnh)
                return (
                  <ScrollReveal key={pkg.packageId} delay={delay}>
                    <div
                      onClick={() => setSelectedPackage(pkg)}
                      className="group bg-warm-cream border-2 border-forest-ink/25 rounded-2xl p-6 flex flex-col justify-between text-left cursor-pointer transition-all duration-300 hover:border-forest-ink/65 hover:shadow-md h-full"
                    >
                      <div>
                        {/* Ảnh bo góc với kích thước lớn aspect-[4/3] và tên gói đè lên ảnh */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                          <img
                            src={imgSrc}
                            alt={pkg.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80";
                            }}
                          />
                          {/* Gradient đen che mờ chân ảnh để chữ hiển thị rõ ràng */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black-olive/90 via-black-olive/30 to-transparent" />

                          {/* Category badge ở góc trên trái */}
                          <div className="absolute top-3 left-3">
                            <span className="bg-forest-ink text-warm-cream text-[10px] font-medium uppercase px-2.5 py-0.5 rounded-[1px] border border-sage-mist/30 tracking-wider">
                              {goalLabel}
                            </span>
                          </div>

                          {/* Tên gói hiển thị đè trên ảnh ở góc dưới */}
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="font-sans text-[18px] font-semibold text-warm-cream leading-snug tracking-wide line-clamp-2 uppercase">
                              {pkg.name}
                            </h3>
                          </div>
                        </div>

                        {/* Dịch vụ đi kèm (Lược bỏ phần mô tả giới thiệu như yêu cầu) */}
                        <div className="mt-4">
                          {includesList.length > 0 && (
                            <div className="pt-1">
                              <span className="text-[10px] font-bold text-forest-ink uppercase tracking-wider block mb-1.5">
                                Bao gồm:
                              </span>
                              <ul className="space-y-1.5 text-xs text-forest-ink/90">
                                {includesList.slice(0, 3).map((inc, i) => (
                                  <li key={i} className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-forest-ink rounded-full" />
                                    <span className="truncate">{inc.trim()}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order / View Detail & Giá dịch vụ */}
                      <div className="mt-5 flex items-center justify-between border-t border-sage-mist/30 pt-3">
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-forest-ink/60">Giá dịch vụ</span>
                          <span className="text-forest-ink font-serif font-bold text-[18px]">{priceFormatted}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="flex items-center gap-1 text-forest-ink/75 text-xs">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatDuration(pkg.durationDays)}</span>
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPackage(pkg);
                            }}
                            className="inline-flex items-center gap-1 text-[13px] font-semibold tracking-[0.04em] uppercase text-forest-ink hover:underline cursor-pointer bg-transparent border-none p-0 mt-1"
                          >
                            Xem chi tiết <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ── Newsletter (Nền màu xanh lá cây Forest Ink) ── */}
      <section className="bg-forest-ink text-warm-cream py-20 relative overflow-hidden text-center border-t border-sage-mist/30">
        <div className="absolute -right-20 -top-20 opacity-10 pointer-events-none">
          <Sparkles className="w-[300px] h-[300px] text-lemon-zest/10" />
        </div>
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <h2 className="font-serif text-3xl font-light text-white mb-6">Đăng Ký Nhận Thông Tin Ưu Đãi</h2>
          <p className="text-warm-cream/80 text-sm mb-10 leading-relaxed font-normal">
            Nhận những bí quyết chăm sóc sức khỏe từ thiên nhiên và các chương trình ưu đãi
            độc quyền dành riêng cho thành viên.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); alert("Cảm ơn bạn đã đăng ký nhận thông tin!"); }}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <input
              className="flex-grow max-w-md rounded-[1px] border border-sage-mist px-6 py-4 bg-white/10 focus:outline-none focus:border-lemon-zest text-sm text-warm-cream placeholder-gray-400"
              placeholder="Email của bạn"
              type="email"
              required
            />
            <button
              className="bg-lemon-zest text-black-olive border border-lemon-zest px-10 py-4 rounded-[1px] text-xs font-semibold uppercase tracking-wider hover:bg-lemon-zest/90 transition-all cursor-pointer"
              type="submit"
            >
              Đăng Ký
            </button>
          </form>
          <p className="mt-6 text-xs text-sage-mist font-normal">
            Chúng tôi cam kết bảo mật thông tin của bạn.{" "}
            <a className="underline hover:text-warm-cream" href="#">Chính sách bảo mật</a>.
          </p>
        </div>
      </section>

      {/* ── Back-to-Top Floating Circle Button ── */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-10 h-10 rounded-[40px] bg-forest-ink hover:bg-forest-ink/90 text-warm-cream flex items-center justify-center transition-all duration-300 z-50 cursor-pointer border-none shadow-none"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
