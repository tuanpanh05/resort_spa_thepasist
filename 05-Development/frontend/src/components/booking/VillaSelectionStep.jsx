import React from "react";
import { Check, ArrowLeft, ChevronRight } from "lucide-react";
import { villasList, servicesList } from "../../constants/booking";

export default function VillaSelectionStep({
  selectedVillaId,
  setSelectedVillaId,
  selectedServiceIds,
  handleToggleService,
  formatCurrency,
  handlePrevStep,
  handleNextStep,
}) {
  return (
    <div className="space-y-8 text-left animate-fade-in">
      <div className="border-b border-primary-50 pb-3 mb-6">
        <h2 className="text-resort-section text-sage-950 mb-1">
          Bước 3: Chọn Không Gian & Trải Nghiệm
        </h2>
        <p className="text-resort-desc">
          Lựa chọn 1 biệt thự nghỉ dưỡng và tích hợp thêm các dịch vụ trị liệu cao cấp đi kèm.
        </p>
      </div>

      {/* Villa Selection Row */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-bold text-sage-900 border-l-2 border-primary-700 pl-3">
          Hạng Phòng & Biệt Thự Nghỉ Dưỡng
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {villasList.map((villa) => {
            const isSelected = selectedVillaId === villa.id;
            return (
              <div
                key={villa.id}
                onClick={() => setSelectedVillaId(villa.id)}
                className={`border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? "border-primary-800 ring-2 ring-primary-800/10 bg-primary-50/10"
                    : "border-primary-100 hover:border-primary-300 bg-white"
                }`}
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={villa.image}
                    alt={villa.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 px-3 py-1 font-mono text-xs font-bold text-primary-950 border border-primary-200">
                    {formatCurrency(villa.price)}/đêm
                  </div>
                </div>

                <div className="p-5 flex-grow space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-primary-700 uppercase tracking-wider bg-primary-100/50 px-2 py-0.5">
                      {villa.view}
                    </span>
                    <span className="text-[10px] text-sage-400 font-mono font-medium">
                      {villa.size} | {villa.capacity}
                    </span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-sage-950">
                    {villa.title}
                  </h4>
                  <p className="text-xs text-sage-600 font-light leading-relaxed">
                    {villa.description}
                  </p>
                </div>

                <div className="px-5 pb-5 pt-1 flex justify-end">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 ${
                      isSelected
                        ? "bg-primary-800 text-white"
                        : "bg-white border border-primary-200 text-sage-600 hover:bg-primary-50"
                    }`}
                  >
                    {isSelected ? "✓ Đang chọn" : "Chọn phòng"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Addon Services Selection Row */}
      <div className="space-y-4 pt-6 border-t border-primary-50">
        <h3 className="font-serif text-lg font-bold text-sage-900 border-l-2 border-primary-700 pl-3">
          Dịch Vụ Chăm Sóc Sức Khỏe & Tiện Ích
        </h3>

        <div className="space-y-3">
          {servicesList.map((service) => {
            const isSelected = selectedServiceIds.includes(service.id);
            return (
              <div
                key={service.id}
                onClick={() => handleToggleService(service.id)}
                className={`border p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? "border-primary-800 bg-primary-50/20"
                    : "border-primary-100 bg-white hover:border-primary-200"
                }`}
              >
                <div className="flex items-start space-x-3 text-left">
                  <div
                    className={`h-5 w-5 mt-0.5 border flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? "bg-primary-800 border-primary-800 text-white"
                        : "border-primary-300"
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <h4 className="font-serif text-sm sm:text-base font-bold text-sage-950">
                      {service.title}
                    </h4>
                    <p className="text-xs text-sage-500 font-light mt-0.5">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="font-serif text-xs sm:text-sm font-bold text-primary-950 block">
                    {formatCurrency(service.price)}
                  </span>
                  <span className="text-[9px] text-sage-400 block font-medium">
                    {service.type === "per-guest"
                      ? "/khách"
                      : service.type === "per-guest-per-night"
                      ? "/khách/đêm"
                      : "/lượt"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation actions */}
      <div className="pt-6 border-t border-primary-50 flex justify-between gap-4">
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
          Chọn thực đơn <ChevronRight className="h-4 w-4 ml-1.5" />
        </button>
      </div>
    </div>
  );
}
