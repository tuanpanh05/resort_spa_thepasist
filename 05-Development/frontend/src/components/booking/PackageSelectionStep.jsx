import React, { useState } from "react";
import { Check, ArrowLeft, ChevronRight, Sparkles, Filter } from "lucide-react";

export default function PackageSelectionStep({
  retreatPackages,
  spaServices,
  guestInfo,
  selectedPackageIds = [],
  setSelectedPackageIds,
  formatCurrency,
  handlePrevStep,
  handleNextStep,
}) {
  // Filters state
  const [selectedGoal, setSelectedGoal] = useState("all");
  const [selectedSpaService, setSelectedSpaService] = useState("all");
  const [viewingPackage, setViewingPackage] = useState(null);

  const handleTogglePackage = (pkgId) => {
    setSelectedPackageIds((prev) =>
      prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId]
    );
  };

  // Health goals matching list (matches healthGoal field in DTO)
  const healthGoals = [
    { key: "all", label: "Tất cả các gói" },
    { key: "YOGA", label: "Yoga & Thiền" },
    { key: "DETOX", label: "Thải độc & Detox" },
    { key: "STRESS_RELIEF", label: "Giảm căng thẳng" },
    { key: "WEIGHT_LOSS", label: "Giảm cân & Giữ dáng" },
    { key: "GENERAL", label: "Trị liệu chuyên sâu" },
    { key: "KID", label: "Dịch vụ trẻ em" }
  ];

  // Helper to determine recommendation
  const getRecommendation = () => {
    const guests = guestInfo.guestsCount || 1;
    const age = guestInfo.age || 30;

    // Logic based on age >= 50
    if (age >= 50) {
      return {
        packageId: 5, // Spine Recovery & Physical Therapy
        reason: "💡 Phù hợp cho khách hàng lớn tuổi cần phục hồi chức năng cột sống và xương khớp.",
        badge: "Gợi ý: Trị Liệu Cột Sống & Phục Hồi"
      };
    }

    // Logic based on guest count
    if (guests === 1) {
      return {
        packageId: 1, // 5-day Detox Journey
        reason: "💡 Phù hợp cho hành trình thải độc (Detox) và phục hồi năng lượng cá nhân chuyên sâu.",
        badge: "Gợi ý: Thải độc cá nhân"
      };
    } else if (guests === 2) {
      return {
        packageId: 2, // Mindfulness & Yoga Weekend
        reason: "💡 Phù hợp cho cặp đôi nghỉ ngơi, tập thiền định & yoga giải tỏa stress cuối tuần.",
        badge: "Gợi ý: Cặp đôi thư giãn"
      };
    } else {
      return {
        packageId: 3, // Weight Loss & Slimming Journey
        reason: "💡 Phù hợp cho nhóm/gia đình cùng tham gia chế độ ăn khoa học & tập luyện giảm cân.",
        badge: "Gợi ý: Gia đình & Nhóm"
      };
    }
  };

  const recommendation = getRecommendation();

  // Helper to map package images
  const getPackageImage = (id, goal = "") => {
    const images = {
      1: "/service_spa.png",
      2: "/service_yoga.png",
      3: "/service_dining.png",
      4: "/service_therapy.png",
      5: "/service_therapy.png",
    };
    
    if (images[id]) return images[id];
    
    // Fallback based on healthGoal or title keywords
    const lowerGoal = (goal || "").toLowerCase();
    if (lowerGoal.includes("detox") || lowerGoal.includes("thải độc")) return "/service_spa.png";
    if (lowerGoal.includes("yoga") || lowerGoal.includes("thiền")) return "/service_yoga.png";
    if (lowerGoal.includes("slim") || lowerGoal.includes("giảm cân") || lowerGoal.includes("ăn uống")) return "/service_dining.png";
    if (lowerGoal.includes("stress") || lowerGoal.includes("căng thẳng")) return "/service_therapy.png";
    if (lowerGoal.includes("trị liệu") || lowerGoal.includes("chữa lành")) return "/service_therapy.png";
    
    return "/service_spa.png";
  };

  // Helper to check if a package includes a specific spa service
  const matchesSpaService = (pkg, serviceId) => {
    if (serviceId === "all") return true;
    const service = spaServices.find(s => s.serviceId === Number(serviceId));
    if (!service) return true;

    // Check if the package's includes column contains keywords of the service name
    const includes = (pkg.includes || "").toLowerCase();
    const serviceName = service.name.toLowerCase();

    // Map English spa service names to Vietnamese keywords inside includes string
    if (serviceName.includes("stone") || serviceName.includes("đá")) {
      return includes.includes("đá") || includes.includes("stone") || includes.includes("massage");
    }
    if (serviceName.includes("red leaf") || serviceName.includes("dao")) {
      return includes.includes("dao") || includes.includes("lá thuốc") || includes.includes("tắm ngâm");
    }
    if (serviceName.includes("spinal") || serviceName.includes("cột sống")) {
      return includes.includes("cột sống") || includes.includes("nắn chỉnh") || includes.includes("vật lý");
    }

    return includes.includes(serviceName);
  };

  // Filter packages list
  const filteredPackages = retreatPackages.filter(pkg => {
    // Filter by health goal
    const matchesGoal = selectedGoal === "all" || pkg.healthGoal === selectedGoal;
    // Filter by spa service included
    const matchesSpa = matchesSpaService(pkg, selectedSpaService);

    return matchesGoal && matchesSpa;
  });

  // Sort: Recommended package first
  const sortedPackages = [...filteredPackages].sort((a, b) => {
    const isARec = recommendation.packageId === a.packageId;
    const isBRec = recommendation.packageId === b.packageId;
    if (isARec && !isBRec) return -1;
    if (!isARec && isBRec) return 1;
    return 0;
  });

  return (
    <div className="space-y-8 text-left animate-fade-in">
      <div className="border-b border-[#cda250]/15 pb-4 mb-8">
        <h2 className="text-resort-section font-serif text-[#1a2f23] mb-1.5 font-semibold uppercase tracking-wide">
          Bước 5: Chọn Gói Trị Liệu & Nghỉ Dưỡng
        </h2>
        <p className="text-resort-desc mt-1 text-sage-600 font-light">
          Lựa chọn gói trị liệu toàn diện. Đây là phần cốt lõi của hành trình phục hồi sức khỏe tại resort.
        </p>
      </div>

      {/* 1. Suggestion Alert Box */}
      <div className="bg-gradient-to-r from-[#cda250]/15 to-[#cda250]/5 border border-[#cda250]/20 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start space-x-3.5 text-left">
          <div className="p-2.5 bg-[#cda250]/15 text-[#1a2f23] rounded-full mt-0.5 flex-shrink-0">
            <Sparkles className="h-5 w-5 text-[#cda250]" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#cda250] uppercase tracking-widest block mb-0.5">
              Gợi ý dành riêng cho bạn
            </span>
            <p className="text-xs text-sage-600 font-semibold leading-relaxed">
              Dựa trên thông tin đăng ký ({guestInfo.guestsCount} khách, {guestInfo.age} tuổi):
            </p>
            <p className="text-xs text-[#1a2f23] font-bold mt-1">
              {recommendation.reason}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={() => handleTogglePackage(recommendation.packageId)}
            className={`w-full sm:w-auto px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-lg border cursor-pointer ${
              selectedPackageIds.includes(recommendation.packageId)
                ? "bg-emerald-700 border-emerald-700 text-white hover:bg-emerald-800 hover:shadow-[0_4px_15px_rgba(4,120,87,0.3)]"
                : "bg-[#cda250] border-[#cda250] text-[#070e0a] hover:bg-[#d9b360] hover:shadow-[0_4px_15px_rgba(205,162,80,0.3)]"
            }`}
          >
            {selectedPackageIds.includes(recommendation.packageId) ? "✓ Đang Chọn Gói Này" : "Chọn Gói Này"}
          </button>
        </div>
      </div>

      {/* 2. Filters Row */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-serif text-sm font-bold text-[#1a2f23] flex items-center gap-1.5 uppercase tracking-wider">
            <Filter className="h-4.5 w-4.5 text-[#cda250]" /> Bộ lọc tìm kiếm nhanh
          </h3>
        </div>

        {/* Goal Tags */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedGoal("all")}
            className={`px-4 py-2 text-xs transition-all duration-300 rounded-full border cursor-pointer font-semibold ${
              selectedGoal === "all"
                ? "bg-[#cda250] border-[#cda250] text-[#070e0a] font-bold"
                : "bg-white border-[#cda250]/20 text-[#1a2f23] hover:border-[#cda250]/50"
            }`}
          >
            {"Tất cả các gói"}
          </button>
          {healthGoals.filter(g => g.key !== "all").map(g => (
            <button
              key={g.key}
              type="button"
              onClick={() => setSelectedGoal(g.key)}
              className={`px-4 py-2 text-xs transition-all duration-300 rounded-full border cursor-pointer font-semibold ${
                selectedGoal === g.key
                  ? "bg-[#cda250] border-[#cda250] text-[#070e0a] font-bold"
                  : "bg-white border-[#cda250]/20 text-[#1a2f23] hover:border-[#cda250]/50"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Spa Service Filter Dropdown */}
        <div className="max-w-xs text-xs">
          <label className="block text-sage-500 font-medium mb-1.5">Lọc theo dịch vụ Spa có trong gói:</label>
          <select
            value={selectedSpaService}
            onChange={(e) => setSelectedSpaService(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#cda250]/20 text-[#1a2f23] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#cda250] focus:border-[#cda250] transition-all"
          >
            <option value="all">-- Chọn tất cả dịch vụ Spa --</option>
            {spaServices.map(s => (
              <option key={s.serviceId} value={s.serviceId}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Packages Grid */}
      <div className="space-y-6">
        {sortedPackages.length === 0 ? (
          <div className="border border-[#cda250]/20 rounded-2xl p-12 text-center text-sage-500 bg-white">
            Không tìm thấy gói nghỉ dưỡng nào khớp với điều kiện lọc. Vui lòng thử đổi bộ lọc.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {sortedPackages.map((pkg) => {
              const isSelected = selectedPackageIds.includes(pkg.packageId);
              const isRecommended = recommendation.packageId === pkg.packageId;
              const pkgImage = pkg.imageUrl || getPackageImage(pkg.packageId, pkg.goal || pkg.name);

              return (
                <div
                  key={pkg.packageId}
                  className={`border flex flex-col md:flex-row transition-all duration-300 overflow-hidden shadow-xs rounded-2xl hover:shadow-md ${
                    isSelected
                      ? "border-[#cda250] ring-2 ring-[#cda250]/20 bg-[#cda250]/5"
                      : "border-[#cda250]/15 bg-white hover:border-[#cda250]/30"
                  }`}
                >
                  {/* Package Image */}
                  <div className="relative w-full md:w-72 h-48 md:h-auto flex-shrink-0 bg-[#fbfaf7]">
                    <img
                      src={pkgImage}
                      alt={pkg.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/service_spa.png";
                      }}
                      className="w-full h-full object-cover"
                    />
                    {isRecommended && (
                      <span className="absolute top-3 left-3 bg-[#cda250] text-[#070e0a] font-bold text-[9px] uppercase tracking-wider px-2 py-1 rounded">
                        🌟 {recommendation.badge}
                      </span>
                    )}
                    <span className="absolute bottom-3 left-3 bg-white/90 text-[#1a2f23] font-bold text-[10px] border border-[#cda250]/20 px-2 py-0.5 rounded uppercase tracking-wide">
                      {pkg.durationText || `${pkg.durationDays} ngày`}
                    </span>
                  </div>

                  {/* Package Info */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-serif text-base sm:text-lg font-bold text-[#1a2f23]">
                          {pkg.name}
                        </h4>
                        <span className="font-mono text-sm sm:text-base font-bold text-[#1a2f23] flex-shrink-0">
                          {formatCurrency(pkg.price)}
                        </span>
                      </div>

                      <span className="inline-block text-[9px] font-bold text-[#cda250] uppercase tracking-wider bg-[#cda250]/10 px-2.5 py-0.5 rounded-full leading-none">
                        Mục tiêu: {pkg.goal}
                      </span>

                      <p className="text-xs text-sage-600 font-light leading-relaxed">
                        {pkg.description}
                      </p>

                      {/* Included services */}
                      {pkg.includes && (
                        <div className="pt-2">
                          <span className="text-[10px] text-sage-400 font-bold uppercase tracking-wider block mb-1">
                            Trị liệu đi kèm trong gói:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {pkg.includes.split(";").map((item, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-[#fbfaf7] text-sage-700 border border-[#cda250]/15 px-2 py-0.5 rounded-full font-medium"
                              >
                                ✓ {item.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-[#cda250]/15">
                      <button
                        type="button"
                        onClick={() => setViewingPackage(pkg)}
                        className="text-xs font-bold uppercase tracking-widest text-[#cda250] hover:text-[#d9b360] transition-colors p-1 cursor-pointer"
                      >
                        Xem chi tiết gói
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePackage(pkg.packageId)}
                        className={`text-xs font-bold uppercase tracking-widest px-6 py-2.5 cursor-pointer rounded-lg transition-all ${
                          isSelected
                            ? "bg-[#cda250] text-[#070e0a] hover:bg-[#d9b360] font-bold hover:shadow-[0_4px_15px_rgba(205,162,80,0.3)]"
                            : "bg-white border border-[#cda250]/20 text-[#1a2f23] hover:bg-[#cda250]/5"
                        }`}
                      >
                        {isSelected ? "✓ Đang chọn" : "Chọn gói trị liệu"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Action Buttons */}
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
          Kiểm tra đơn đặt <ChevronRight className="h-4 w-4 ml-1.5" />
        </button>
      </div>
      {/* 5. Package Details Modal */}
      {viewingPackage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in text-left">
          <div className="bg-white max-w-lg w-full max-h-[90vh] overflow-hidden border border-[#cda250]/20 shadow-2xl rounded-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#cda250]/10 bg-[#fbfaf7] flex justify-between items-center">
              <h3 className="font-serif text-base font-bold text-[#1a2f23]">
                Chi Tiết Gói: {viewingPackage.name}
              </h3>
              <button
                type="button"
                onClick={() => setViewingPackage(null)}
                className="text-sage-400 hover:text-[#cda250] text-lg font-bold p-1 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Image */}
              <div className="w-full h-44 bg-sage-100 overflow-hidden rounded-xl">
                <img
                  src={viewingPackage.imageUrl || getPackageImage(viewingPackage.packageId, viewingPackage.goal || viewingPackage.name)}
                  alt={viewingPackage.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/service_spa.png";
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* General info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Mục tiêu sức khỏe</span>
                  <span className="font-bold text-[#1a2f23] uppercase bg-[#cda250]/10 px-2 py-0.5 inline-block rounded-full">
                    {viewingPackage.goal || viewingPackage.healthGoal || "Trị liệu"}
                  </span>
                </div>
                <div>
                  <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Thời lượng</span>
                  <span className="font-bold text-sage-800">
                    {viewingPackage.durationText || `${viewingPackage.durationDays} ngày`}
                  </span>
                </div>
                <div>
                  <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Giá trọn gói</span>
                  <span className="font-bold text-lg text-[#1a2f23] font-mono">
                    {formatCurrency(viewingPackage.price)}
                  </span>
                </div>
                <div>
                  <span className="text-sage-400 block text-[9px] uppercase tracking-wider mb-0.5">Đối tượng tối đa</span>
                  <span className="font-bold text-sage-800">
                    {viewingPackage.maxGuests || 2} Khách / phòng
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-sage-500">Mô tả hành trình</h4>
                <p className="text-xs text-sage-700 leading-relaxed font-light">
                  {viewingPackage.description}
                </p>
              </div>

              {/* Included therapies */}
              {viewingPackage.includes && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-sage-500">
                    Liệu pháp & hoạt động bao gồm:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {viewingPackage.includes.split(";").map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2 bg-[#fbfaf7] p-2 border border-[#cda250]/10 rounded-lg">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span className="text-sage-700 font-medium">{item.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Default amenities */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-sage-500">Đặc quyền nghỉ dưỡng tiêu chuẩn:</h4>
                <ul className="text-xs text-sage-600 font-light space-y-1">
                  <li>• Lưu trú tại Căn biệt thự xanh sang trọng đã lựa chọn</li>
                  <li>• Bác sĩ chuyên khoa thăm khám sức khỏe đầu vào và tư vấn phác đồ</li>
                  <li>• Sử dụng miễn phí nước kiềm Hydrogen hoạt hóa</li>
                  <li>• Tham gia lớp Yoga phục hồi & Thiền định chuông xoay mỗi sáng</li>
                  <li>• Thưởng thức ẩm thực hữu cơ, thực dưỡng tốt cho hệ tiêu hóa</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-[#cda250]/10 bg-[#fbfaf7] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setViewingPackage(null)}
                className="px-5 py-2 border border-[#1a2f23]/30 text-[#1a2f23] hover:bg-[#1a2f23]/5 text-xs font-semibold uppercase tracking-wider rounded-lg cursor-pointer transition-all"
              >
                Đóng lại
              </button>
              <button
                type="button"
                onClick={() => {
                  handleTogglePackage(viewingPackage.packageId);
                  setViewingPackage(null);
                }}
                className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all ${
                  selectedPackageIds.includes(viewingPackage.packageId)
                    ? "bg-emerald-700 text-white hover:bg-emerald-800"
                    : "bg-[#cda250] hover:bg-[#d9b360] text-[#070e0a]"
                }`}
              >
                {selectedPackageIds.includes(viewingPackage.packageId) ? "✓ Đang chọn" : "Chọn gói trị liệu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
