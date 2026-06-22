import React from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";


export default function VillaSelectionStep({
  roomTypes,
  selectedRooms,
  setSelectedRooms,
  selectedServiceIds,
  handleToggleService,
  formatCurrency,
  handlePrevStep,
  handleNextStep,
}) {
  const getRoomTypeView = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("vip")) return "Hướng Hồ Bơi";
    if (lowerName.includes("president")) return "Toàn Cảnh Đồi Trà";
    return "Hướng Vườn";
  };

  const getRoomTypeImage = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("standard")) {
      return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
    } else if (lowerName.includes("vip") || lowerName.includes("pool")) {
      return "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80";
    } else if (lowerName.includes("presidential") || lowerName.includes("suite")) {
      return "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80";
    }
    return "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80";
  };

  return (
    <div className="space-y-8 text-left animate-fade-in">
      <div className="border-b border-[#cda250]/15 pb-4 mb-8">
        <h2 className="text-resort-section font-serif text-[#1a2f23] mb-1.5 font-semibold uppercase tracking-wide">
          Bước 3: Chọn Không Gian & Trải Nghiệm
        </h2>
        <p className="text-resort-desc mt-1 text-sage-600 font-light">
          Lựa chọn 1 hoặc nhiều biệt thự nghỉ dưỡng và tích hợp thêm các dịch vụ trị liệu cao cấp đi kèm.
        </p>
      </div>

      {/* Villa Selection Row */}
      <div className="space-y-4">
        <h3 className="font-serif text-base font-bold text-[#1a2f23] border-l-2 border-[#cda250] pl-3 uppercase tracking-wide mb-4">
          Hạng Phòng & Biệt Thự Nghỉ Dưỡng
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roomTypes.map((villa) => {
            const roomQty = selectedRooms[villa.roomTypeId] || 0;
            const isSelected = roomQty > 0;
            const villaImage = getRoomTypeImage(villa.typeName);
            const villaView = getRoomTypeView(villa.typeName);
            const isAvailable = villa.availableRoomsCount === undefined || villa.availableRoomsCount > 0;

            return (
              <div
                key={villa.roomTypeId}
                onClick={() => {
                  if (isAvailable && roomQty === 0) {
                    setSelectedRooms((prev) => ({
                      ...prev,
                      [villa.roomTypeId]: 1,
                    }));
                  }
                }}
                className={`border shadow-xs rounded-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between hover:shadow-md ${
                  !isAvailable
                    ? "border-red-100 bg-red-50/5 opacity-65 cursor-not-allowed"
                    : isSelected
                    ? "border-[#cda250] ring-2 ring-[#cda250]/20 bg-[#cda250]/5 cursor-pointer"
                    : "border-[#cda250]/15 hover:border-[#cda250]/40 bg-white cursor-pointer"
                }`}
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={villaImage}
                    alt={villa.typeName}
                    className={`w-full h-full object-cover transition-all duration-500 ${!isAvailable ? "grayscale contrast-75" : ""}`}
                  />
                  {!isAvailable && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider shadow-sm rounded">
                      Hết phòng
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/95 px-3 py-1 font-mono text-xs font-bold text-[#1a2f23] border border-[#cda250]/20 rounded-lg shadow-sm">
                    {formatCurrency(villa.basePricePerNight)}/đêm
                  </div>
                </div>

                <div className="p-5 flex-grow space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-[#cda250] uppercase tracking-wider bg-[#cda250]/10 px-2 py-0.5 rounded-full">
                      {villaView}
                    </span>
                    <span className="text-[10px] text-sage-500 font-mono font-medium">
                      {villa.areaSqm || 50} m² | {villa.maxOccupancy || 2} Người lớn
                      {villa.availableRoomsCount !== undefined && (
                        <span className={villa.availableRoomsCount > 0 ? "text-sage-500 font-semibold" : "text-red-500 font-semibold"}>
                          {` | Còn ${villa.availableRoomsCount} phòng`}
                        </span>
                      )}
                    </span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#1a2f23]">
                    {villa.typeName}
                  </h4>
                  <p className="text-xs text-sage-600 font-light leading-relaxed">
                    {villa.description || "Phòng nghỉ dưỡng dưỡng sinh cao cấp thiết kế sang trọng, hòa mình cùng không gian thiên nhiên resort."}
                  </p>
                </div>

                <div className="px-5 pb-5 pt-1 flex items-center justify-between gap-4">
                  {isSelected ? (
                    <div className="flex items-center space-x-2 bg-[#fbfaf7] border border-[#cda250]/15 px-2.5 py-1 rounded-lg">
                      <span className="text-[10px] font-semibold text-sage-600 uppercase tracking-wider">Số lượng:</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRooms((prev) => {
                            const newQty = Math.max(0, roomQty - 1);
                            const next = { ...prev };
                            if (newQty === 0) {
                              delete next[villa.roomTypeId];
                            } else {
                              next[villa.roomTypeId] = newQty;
                            }
                            return next;
                          });
                        }}
                        className="w-6 h-6 flex items-center justify-center bg-white border border-[#cda250]/20 hover:bg-[#cda250]/10 text-sage-800 text-xs font-bold transition-colors rounded"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-bold px-1.5 text-[#1a2f23]">{roomQty}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const maxCount = villa.availableRoomsCount !== undefined ? villa.availableRoomsCount : 5;
                          setSelectedRooms((prev) => ({
                            ...prev,
                            [villa.roomTypeId]: Math.min(maxCount, roomQty + 1),
                          }));
                        }}
                        className="w-6 h-6 flex items-center justify-center bg-white border border-[#cda250]/20 hover:bg-[#cda250]/10 text-sage-800 text-xs font-bold transition-colors rounded"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <div />
                  )}

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 transition-all duration-300 rounded-lg shadow-sm ${
                      !isAvailable
                        ? "bg-red-50 text-red-600 border border-red-200"
                        : isSelected
                        ? "bg-[#cda250] text-[#070e0a] hover:bg-[#d9b360] font-bold hover:shadow-[0_4px_15px_rgba(205,162,80,0.3)]"
                        : "bg-white border border-[#cda250]/20 text-sage-600 hover:bg-[#cda250]/5"
                    }`}
                  >
                    {!isAvailable ? "Hết phòng" : isSelected ? "✓ Đang chọn" : "Chọn phòng"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation actions */}
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
          Đặt Đồ Ăn <ChevronRight className="h-4 w-4 ml-1.5" />
        </button>
      </div>
    </div>
  );
}
