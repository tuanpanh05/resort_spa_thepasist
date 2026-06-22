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
      <div className="border-b border-primary-50 pb-3 mb-6">
        <h2 className="text-resort-section text-sage-950 mb-1">
          Bước 3: Chọn Không Gian & Trải Nghiệm
        </h2>
        <p className="text-resort-desc">
          Lựa chọn 1 hoặc nhiều biệt thự nghỉ dưỡng và tích hợp thêm các dịch vụ trị liệu cao cấp đi kèm.
        </p>
      </div>

      {/* Villa Selection Row */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-bold text-sage-900 border-l-2 border-primary-700 pl-3">
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
                className={`border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                  !isAvailable
                    ? "border-red-100 bg-red-50/5 opacity-65 cursor-not-allowed"
                    : isSelected
                    ? "border-primary-800 ring-2 ring-primary-800/10 bg-primary-50/10 cursor-pointer"
                    : "border-primary-100 hover:border-primary-300 bg-white cursor-pointer"
                }`}
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={villaImage}
                    alt={villa.typeName}
                    className={`w-full h-full object-cover transition-all duration-500 ${!isAvailable ? "grayscale contrast-75" : ""}`}
                  />
                  {!isAvailable && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      Hết phòng
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/95 px-3 py-1 font-mono text-xs font-bold text-primary-950 border border-primary-200">
                    {formatCurrency(villa.basePricePerNight)}/đêm
                  </div>
                </div>

                <div className="p-5 flex-grow space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-primary-700 uppercase tracking-wider bg-primary-100/50 px-2 py-0.5">
                      {villaView}
                    </span>
                    <span className="text-[10px] text-sage-400 font-mono font-medium">
                      {villa.areaSqm || 50} m² | {villa.maxOccupancy || 2} Người lớn
                      {villa.availableRoomsCount !== undefined && (
                        <span className={villa.availableRoomsCount > 0 ? "text-sage-500 font-semibold" : "text-red-500 font-semibold"}>
                          {` | Còn ${villa.availableRoomsCount} phòng`}
                        </span>
                      )}
                    </span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-sage-950">
                    {villa.typeName}
                  </h4>
                  <p className="text-xs text-sage-600 font-light leading-relaxed">
                    {villa.description || "Phòng nghỉ dưỡng dưỡng sinh cao cấp thiết kế sang trọng, hòa mình cùng không gian thiên nhiên resort."}
                  </p>
                </div>

                <div className="px-5 pb-5 pt-1 flex items-center justify-between gap-4">
                  {isSelected ? (
                    <div className="flex items-center space-x-2 bg-sage-50 border border-sage-200 px-2 py-1">
                      <span className="text-[10px] font-medium text-sage-600 uppercase tracking-wider">Số lượng:</span>
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
                        className="w-6 h-6 flex items-center justify-center bg-white border border-sage-300 hover:bg-sage-100 text-sage-800 text-xs font-bold transition-colors"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-bold px-1.5 text-sage-950">{roomQty}</span>
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
                        className="w-6 h-6 flex items-center justify-center bg-white border border-sage-300 hover:bg-sage-100 text-sage-800 text-xs font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <div />
                  )}

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 transition-colors duration-200 ${
                      !isAvailable
                        ? "bg-red-50 text-red-600 border border-red-200"
                        : isSelected
                        ? "bg-primary-800 text-white"
                        : "bg-white border border-primary-200 text-sage-600 hover:bg-primary-50"
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
          Chọn thực đơn <ChevronRight className="h-4 w-4 ml-1.5" />
        </button>
      </div>
    </div>
  );
}
