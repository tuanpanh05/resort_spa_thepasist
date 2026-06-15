import React, { useState, useEffect } from "react";
import { Heart, Sparkles, Clock, CheckCircle, Loader2, AlertCircle, Search, DollarSign, ArrowRight, Leaf, Flame, Smile, Activity } from "lucide-react";
import { masterDataApi } from "../api";

const healthGoals = [
  {
    value: "",
    label: "Tất cả nhu cầu",
    description: "Khám phá toàn bộ các chương trình trị liệu nghỉ dưỡng tại resort.",
    icon: Sparkles,
    color: "from-sage-50 to-emerald-50/50 text-sage-800 border-sage-200",
    activeBg: "bg-primary-900 border-primary-900 text-white shadow-md shadow-primary-900/20"
  },
  {
    value: "YOGA",
    label: "Tập Yoga phục hồi",
    description: "Cân bằng thân - tâm, kiểm soát hơi thở và cải thiện sự dẻo dai.",
    icon: Heart,
    color: "from-emerald-50 to-teal-50/50 text-emerald-800 border-emerald-200",
    activeBg: "bg-emerald-800 border-emerald-800 text-white shadow-md shadow-emerald-800/20"
  },
  {
    value: "DETOX",
    label: "Thanh lọc cơ thể",
    description: "Đào thải độc tố, thanh khiết cơ thể kết hợp ăn uống thực dưỡng.",
    icon: Leaf,
    color: "from-cyan-50 to-blue-50/50 text-cyan-800 border-cyan-200",
    activeBg: "bg-teal-800 border-teal-800 text-white shadow-md shadow-teal-800/20"
  },
  {
    value: "WEIGHT_LOSS",
    label: "Giảm béo thon gọn",
    description: "Lộ trình đốt mỡ, săn chắc cơ thể và xây dựng lối sống lành mạnh.",
    icon: Flame,
    color: "from-orange-50 to-amber-50/50 text-orange-800 border-orange-200",
    activeBg: "bg-orange-850 border-orange-850 text-white shadow-md shadow-orange-850/20"
  },
  {
    value: "STRESS_RELIEF",
    label: "Thư giãn & Trị liệu stress",
    description: "Giải tỏa áp lực tinh thần, xoa dịu cơ bắp và tìm lại sự bình yên.",
    icon: Smile,
    color: "from-purple-50 to-indigo-50/50 text-purple-800 border-purple-200",
    activeBg: "bg-indigo-850 border-indigo-850 text-white shadow-md shadow-indigo-850/20"
  },
  {
    value: "GENERAL",
    label: "Chăm sóc chung",
    description: "Nâng cao thể trạng tổng thể, tăng cường đề kháng và sinh khí.",
    icon: Activity,
    color: "from-blue-50 to-indigo-50/50 text-blue-800 border-blue-200",
    activeBg: "bg-blue-800 border-blue-800 text-white shadow-md shadow-blue-800/20"
  }
];

export default function Spa() {
  const [activeTab, setActiveTab] = useState("spa"); // "spa" or "packages"
  
  // Spa Services states
  const [therapies, setTherapies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Retreat Packages states
  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [packagesError, setPackagesError] = useState(null);
  
  // Retreat Packages filter state
  const [filters, setFilters] = useState({
    keyword: "",
    healthGoal: "",
    minPrice: "",
    maxPrice: "",
    maxDurationDays: ""
  });

  // Fetch Spa Services
  useEffect(() => {
    masterDataApi.getSpaServices(false)
      .then((data) => {
        setTherapies(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Không thể tải danh sách liệu trình spa.");
        setLoading(false);
      });
  }, []);

  // Fetch / Filter Retreat Packages
  useEffect(() => {
    if (activeTab === "packages") {
      setPackagesLoading(true);
      masterDataApi.filterRetreatPackages(filters)
        .then((data) => {
          setPackages(data);
          setPackagesLoading(false);
        })
        .catch((err) => {
          setPackagesError(err.message || "Không thể tải danh sách gói trị liệu.");
          setPackagesLoading(false);
        });
    }
  }, [activeTab, filters]);

  return (
    <div className="bg-[#fafbfa] min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-widest text-primary-900 uppercase bg-primary-200/60 px-3 py-1.5 rounded-full">
            Spa & Trị Liệu Thảo Dược
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-sage-900 mt-4 mb-4">
            Đánh Thức Giác Quan - Khơi Nguồn Sinh Khí
          </h1>
          <p className="text-sage-700 font-normal text-base leading-relaxed">
            Hòa mình vào không gian thơm ngát tinh dầu, tiếng nhạc suối êm dịu
            và trải nghiệm các liệu pháp bấm huyệt cổ truyền kết hợp thảo mộc
            tươi hái tại vườn sinh thái của chúng tôi.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-[#f0f2f0] p-1.5 rounded-full flex space-x-1 border border-primary-100">
            <button
              onClick={() => setActiveTab("spa")}
              className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                activeTab === "spa"
                  ? "bg-primary-900 text-white shadow-sm"
                  : "text-sage-600 hover:text-primary-900"
              }`}
            >
              Liệu Trình Spa
            </button>
            <button
              onClick={() => setActiveTab("packages")}
              className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                activeTab === "packages"
                  ? "bg-primary-900 text-white shadow-sm"
                  : "text-sage-600 hover:text-primary-900"
              }`}
            >
              Gói Trị Liệu Sức Khỏe (Retreat Packages)
            </button>
          </div>
        </div>

        {activeTab === "spa" ? (
          /* ============================================================ */
          /* SPA SERVICES TAB VIEW                                        */
          /* ============================================================ */
          loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary-800" />
              <span className="text-sm text-sage-600">Đang tải danh sách liệu trình...</span>
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm">Lỗi tải dữ liệu</h3>
                <p className="text-xs mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
          ) : (
            /* Therapy Details Layout */
            <div className="space-y-16">
              {therapies.map((therapy, index) => {
                const isEven = index % 2 === 0;
                const benefitsList = therapy.benefits ? therapy.benefits.split(";") : [];
                const durationStr = therapy.durationMinutes ? `${therapy.durationMinutes} Phút` : "N/A";
                return (
                  <div
                    key={therapy.serviceId || index}
                    className={`flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12 bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-primary-100/50 ${isEven ? "" : "lg:flex-row-reverse"}`}
                  >
                    {/* Image */}
                    <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden shadow-sm min-h-[300px] relative">
                      <img
                        src={therapy.imageUrl || "/service_spa.png"}
                        alt={therapy.name}
                        className="w-full h-full min-h-[300px] object-cover"
                      />
                      <div className="absolute inset-0 bg-black/5" />
                    </div>

                    {/* Content */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-between py-2">
                      <div className="space-y-6">
                        {/* Header */}
                        <div>
                          <div className="flex items-center text-primary-900 text-xs font-bold uppercase tracking-widest space-x-1.5 mb-2">
                            <Clock className="h-4 w-4 text-primary-700" />
                            <span>Thời lượng: {durationStr}</span>
                          </div>
                          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900">
                            {therapy.name}
                          </h2>
                        </div>

                        <p className="text-sage-800 text-sm sm:text-base leading-relaxed font-normal">
                          {therapy.description}
                        </p>

                        {/* Benefits Checklist */}
                        {benefitsList.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {benefitsList.map((benefit, i) => (
                              <div
                                key={i}
                                className="flex items-start space-x-2.5 text-sage-800 text-sm"
                              >
                                <CheckCircle className="h-4.5 w-4.5 text-primary-700 flex-shrink-0 mt-0.5" />
                                <span className="font-medium">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-8 pt-6 border-t border-primary-50 flex items-center justify-between">
                        <span className="text-xs text-sage-500 font-light italic">
                          Đặt lịch trước để được chuẩn bị thảo dược tươi
                        </span>
                        <a
                          href="/dat-lich"
                          className="inline-flex items-center justify-center px-6 py-3.5 rounded-full text-sm font-semibold bg-primary-900 text-white hover:bg-primary-850 transition-all duration-300 shadow-md hover:scale-105"
                        >
                          Đăng ký tư vấn liệu trình
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* ============================================================ */
          /* RETREAT PACKAGES TAB VIEW (UC6 Search & Filters)              */
          /* ============================================================ */
          <div className="space-y-10">
            {/* Health Need Selector Cards */}
            <div className="text-left space-y-4">
              <div className="border-l-4 border-primary-900 pl-4">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-sage-950">
                  Lọc theo nhu cầu & mục đích trị liệu
                </h2>
                <p className="text-sage-600 text-xs sm:text-sm mt-1">
                  Chọn mục tiêu cải thiện sức khỏe cốt lõi phù hợp nhất cho kỳ nghỉ dưỡng của bạn.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {healthGoals.map((goal) => {
                  const Icon = goal.icon;
                  const isActive = filters.healthGoal === goal.value;
                  return (
                    <button
                      key={goal.value}
                      onClick={() => setFilters({ ...filters, healthGoal: goal.value })}
                      className={`text-left p-5 rounded-[24px] border transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-1 ${
                        isActive
                          ? goal.activeBg
                          : `bg-gradient-to-br ${goal.color} hover:shadow-xs border-primary-100/50`
                      }`}
                    >
                      <div className="space-y-3">
                        <div className={`p-2.5 rounded-2xl w-fit ${isActive ? "bg-white/10" : "bg-white shadow-xs"}`}>
                          <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-primary-950"}`} />
                        </div>
                        <h3 className="font-serif text-sm font-bold leading-snug">
                          {goal.label}
                        </h3>
                      </div>
                      <p className={`text-[10px] leading-relaxed mt-2.5 font-normal ${isActive ? "text-white/80" : "text-sage-600"}`}>
                        {goal.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white border border-primary-100 rounded-3xl p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                
                {/* Search Keyword */}
                <div className="md:col-span-4 text-left">
                  <label className="block text-[10px] font-bold text-sage-400 uppercase tracking-wider mb-2">
                    Từ khóa tìm kiếm
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="VD: Yoga, Detox, Chữa lành..."
                      value={filters.keyword}
                      onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-sage-50/50 border border-primary-100 text-xs text-sage-950 focus:outline-none focus:ring-1 focus:ring-primary-400 rounded-xl"
                    />
                    <Search className="h-4.5 w-4.5 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Health Goal */}
                <div className="md:col-span-3 text-left">
                  <label className="block text-[10px] font-bold text-sage-400 uppercase tracking-wider mb-2">
                    Mục tiêu sức khỏe
                  </label>
                  <select
                    value={filters.healthGoal}
                    onChange={(e) => setFilters({ ...filters, healthGoal: e.target.value })}
                    className="w-full px-3 py-2.5 bg-sage-50/50 border border-primary-100 text-xs text-sage-950 focus:outline-none focus:ring-1 focus:ring-primary-400 rounded-xl appearance-none"
                  >
                    <option value="">Tất cả mục tiêu</option>
                    <option value="YOGA">Tập Yoga (YOGA)</option>
                    <option value="DETOX">Thành lọc cơ thể (DETOX)</option>
                    <option value="WEIGHT_LOSS">Giảm béo (WEIGHT_LOSS)</option>
                    <option value="STRESS_RELIEF">Thư giãn (STRESS_RELIEF)</option>
                    <option value="GENERAL">Chăm sóc chung (GENERAL)</option>
                  </select>
                </div>

                {/* Price Range */}
                <div className="md:col-span-3 text-left">
                  <label className="block text-[10px] font-bold text-sage-400 uppercase tracking-wider mb-2">
                    Giá tối đa (VND)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Không giới hạn"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="w-full pl-8 pr-4 py-2.5 bg-sage-50/50 border border-primary-100 text-xs text-sage-950 focus:outline-none focus:ring-1 focus:ring-primary-400 rounded-xl"
                    />
                    <DollarSign className="h-4.5 w-4.5 text-sage-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Max Duration */}
                <div className="md:col-span-2 text-left">
                  <label className="block text-[10px] font-bold text-sage-400 uppercase tracking-wider mb-2">
                    Số ngày tối đa
                  </label>
                  <select
                    value={filters.maxDurationDays}
                    onChange={(e) => setFilters({ ...filters, maxDurationDays: e.target.value })}
                    className="w-full px-3 py-2.5 bg-sage-50/50 border border-primary-100 text-xs text-sage-950 focus:outline-none focus:ring-1 focus:ring-primary-400 rounded-xl appearance-none"
                  >
                    <option value="">Bất kỳ</option>
                    <option value="3">3 ngày trở xuống</option>
                    <option value="5">5 ngày trở xuống</option>
                    <option value="7">7 ngày trở xuống</option>
                    <option value="10">10 ngày trở xuống</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Packages Results Content */}
            {packagesLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary-800" />
                <span className="text-sm text-sage-600">Đang tìm kiếm các gói trị liệu...</span>
              </div>
            ) : packagesError ? (
              <div className="max-w-md mx-auto p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm">Lỗi tải dữ liệu</h3>
                  <p className="text-xs mt-1 leading-relaxed">{packagesError}</p>
                </div>
              </div>
            ) : packages.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-primary-200 rounded-3xl bg-white p-8">
                <p className="text-sm text-sage-500 font-light">Không tìm thấy gói trị liệu nào phù hợp với bộ lọc.</p>
                <button
                  onClick={() => setFilters({ keyword: "", healthGoal: "", minPrice: "", maxPrice: "", maxDurationDays: "" })}
                  className="mt-4 px-5 py-2 bg-primary-800 text-white text-xs font-semibold rounded-full hover:bg-primary-900 transition-colors cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {packages.map((pkg) => {
                  const includesList = pkg.includes ? pkg.includes.split(";") : [];
                  const priceStr = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(pkg.price);
                  return (
                    <div
                      key={pkg.packageId}
                      className="bg-white rounded-3xl border border-primary-100/50 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative"
                    >
                      <div>
                        {/* Image */}
                        <div className="h-48 overflow-hidden relative">
                          <img
                            src={pkg.imageUrl || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"}
                            alt={pkg.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3 bg-primary-900 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {pkg.healthGoal || "GENERAL"}
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6 space-y-4 text-left">
                          <span className="text-[10px] font-bold text-primary-700 tracking-wider uppercase block">
                            Chương trình: {pkg.durationDays} Ngày / {pkg.durationDays - 1} Đêm
                          </span>
                          <h3 className="font-serif text-lg font-bold text-sage-900 leading-snug">
                            {pkg.name}
                          </h3>
                          <p className="text-sage-800 text-xs leading-relaxed line-clamp-3">
                            {pkg.description}
                          </p>

                          {/* Includes checklist */}
                          {includesList.length > 0 && (
                            <div className="pt-3 border-t border-primary-50">
                              <span className="text-[9px] font-bold text-sage-400 uppercase tracking-wider block mb-2">
                                Bao gồm trong gói
                              </span>
                              <ul className="space-y-1.5 text-xs text-sage-800">
                                {includesList.slice(0, 3).map((item, idx) => (
                                  <li key={idx} className="flex items-center space-x-1.5">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary-700 flex-shrink-0" />
                                    <span className="truncate">{item}</span>
                                  </li>
                                ))}
                                {includesList.length > 3 && (
                                  <li className="text-[10px] text-sage-400 font-light italic">
                                    + {includesList.length - 3} dịch vụ khác...
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Action footer */}
                      <div className="p-6 pt-0 border-t border-primary-50 mt-4 flex items-center justify-between">
                        <div className="text-left">
                          <span className="text-[9px] text-sage-400 uppercase tracking-wider block font-light">Trọn gói</span>
                          <strong className="text-sm text-primary-950 font-bold">{priceStr}</strong>
                        </div>
                        <a
                          href={`/dat-lich?packageId=${pkg.packageId}`}
                          className="inline-flex items-center justify-center px-4 py-2.5 bg-primary-900 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-primary-850 transition-colors rounded-full"
                        >
                          Đặt gói ngay <ArrowRight className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
