import React from "react";
import { Info, AlertTriangle, Minus, Plus, ArrowLeft, ChevronRight } from "lucide-react";
import { mealPeriods, ALLERGY_OPTIONS } from "../../constants/booking";
import { detectAllergens } from "../../utils/health";

export default function MealSelectionStep({
  mealBookingDays,
  selectedMealDate,
  setSelectedMealDate,
  consentDataProcessing,
  consentSharing,
  packageMenuItems,
  dietaryPreference,
  guestInfo,
  selectedAllergies,
  otherAllergy,
  mealSelections,
  updateMealQty,
  formatCurrency,
  getMealSelectedCount,
  mealTotal,
  handlePrevStep,
  handleNextStep,
}) {
  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="border-b border-primary-50 pb-3 mb-6">
        <h2 className="text-resort-section text-sage-950 mb-1">
          Bước 4: Chọn Thực Đơn Trong Gói
        </h2>
        <p className="text-resort-desc">
          Lựa chọn các bữa ăn dinh dưỡng đi kèm trong gói dịch vụ nghỉ dưỡng. Món trong gói miễn
          phí (1 phần/ngày).
        </p>
      </div>

      {/* Date Selection Bar */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-4 mb-4 border-b border-primary-100/50">
        {mealBookingDays.map((date, idx) => {
          const isActive = selectedMealDate === date;
          const dateParts = date.split("-");
          const displayDate = `${dateParts[2]}/${dateParts[1]}`;
          return (
            <button
              key={date}
              onClick={() => setSelectedMealDate(date)}
              className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 flex flex-col items-center justify-center min-w-[90px] border shadow-xs cursor-pointer ${isActive
                  ? "bg-primary-850 border-primary-900 text-white shadow-md -translate-y-0.5"
                  : "bg-white border-primary-100 text-sage-600 hover:border-primary-300 hover:bg-primary-50/30"
                }`}
              style={{ borderRadius: "16px" }}
            >
              <span className="text-[9px] opacity-75 font-semibold">Ngày {idx + 1}</span>
              <span className="font-mono mt-0.5 text-sm">{displayDate}</span>
            </button>
          );
        })}
      </div>

      {/* Auto Filter Banner */}
      {consentDataProcessing && consentSharing ? (
        <div className="mb-6 p-4 bg-primary-50/50 border border-primary-200 text-xs text-primary-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <Info className="h-4.5 w-4.5 text-primary-750 flex-shrink-0" />
            <span>
              <strong>Thực đơn đã được tự động quét theo hồ sơ bệnh lý & chế độ ăn uống.</strong>{" "}
              Các món ăn không phù hợp đã được cảnh báo và khóa tự động.
            </span>
          </div>
          <span className="bg-primary-100 text-primary-800 border border-primary-200 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider self-start sm:self-auto">
            Đã Lọc Tự Động
          </span>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-amber-50 text-amber-800 border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0" />
            <span>
              Hệ thống chưa được phép xử lý dữ liệu y tế. Các món ăn gây dị ứng sẽ{" "}
              <strong>không</strong> được tự động cảnh báo.
            </span>
          </div>
        </div>
      )}

      {/* Meal Periods */}
      {mealPeriods.map((period) => {
        const PeriodIcon = period.icon;
        return (
          <div key={period.key} className="space-y-4 mb-6">
            <div className="flex items-center space-x-2 border-l-2 border-primary-700 pl-3">
              <PeriodIcon className="h-5 w-5 text-primary-800" />
              <h3 className="font-serif text-base font-bold text-sage-900">
                {period.label} ({period.time})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packageMenuItems
                .filter((dish) => dish.isPackageIncluded)
                .filter((dish) => dish.periods.includes(period.key))
                .filter((dish) => {
                  const dayOfWeek = new Date(selectedMealDate).getDay();
                  return dish.availableDays ? dish.availableDays.includes(dayOfWeek) : true;
                })
                .filter((dish) => {
                  if (dietaryPreference === "omnivore") return true;
                  if (!dish.dietaryTags) return false;
                  const tags = dish.dietaryTags.toLowerCase();
                  return tags.includes(dietaryPreference);
                })
                .map((dish) => {
                  const currentQty =
                    mealSelections[selectedMealDate]?.[period.key]?.[dish.foodId] || 0;
                  const userAllergens = detectAllergens(guestInfo.healthNote);

                  // Ensure allergens is a searchable string
                  const allergensStr = (Array.isArray(dish.allergens) ? dish.allergens.join(",") : (dish.allergens || "")).toLowerCase();
                  const tagsStr = (dish.dietaryTags || "").toLowerCase();

                  const isAllergen =
                    (allergensStr.includes("đậu phộng") && userAllergens.includes("peanut")) ||
                    (allergensStr.includes("hải sản") && userAllergens.includes("seafood")) ||
                    selectedAllergies.some((a) => {
                      const lowerA = a.toLowerCase();
                      if (lowerA === "peanuts") return allergensStr.includes("đậu phộng") || allergensStr.includes("peanut") || allergensStr.includes("lạc");
                      if (lowerA === "shellfish") return allergensStr.includes("hải sản") || allergensStr.includes("tôm") || allergensStr.includes("cua") || allergensStr.includes("cá");
                      if (lowerA === "spicy") return allergensStr.includes("cay") || allergensStr.includes("ớt");
                      if (lowerA === "wheat" || lowerA === "gluten") return allergensStr.includes("lúa mì") || allergensStr.includes("gluten") || allergensStr.includes("wheat");
                      if (lowerA === "dairy" || lowerA === "lactose") return allergensStr.includes("sữa") || allergensStr.includes("dairy") || allergensStr.includes("milk");
                      if (lowerA === "soy") return allergensStr.includes("đậu nành") || allergensStr.includes("soy");
                      if (lowerA === "egg" || lowerA === "eggs") return allergensStr.includes("trứng") || allergensStr.includes("egg");
                      if (lowerA === "tree nuts" || lowerA === "treenuts") return allergensStr.includes("hạt cây") || allergensStr.includes("hạt điều") || allergensStr.includes("óc chó") || allergensStr.includes("walnut");
                      if (lowerA === "fish") return allergensStr.includes("cá") || allergensStr.includes("fish");
                      return allergensStr.includes(lowerA) || tagsStr.includes(lowerA);
                    }) ||
                    (otherAllergy && otherAllergy.split(",").some(oa => {
                      const lowerOA = oa.trim().toLowerCase();
                      return lowerOA && (allergensStr.includes(lowerOA) || tagsStr.includes(lowerOA));
                    }));

              return (
              <div
                key={dish.foodId}
                className={`border transition-all duration-300 overflow-hidden ${isAllergen
                    ? "border-red-200 bg-red-50/20 opacity-60"
                    : currentQty > 0
                      ? "border-primary-300 bg-primary-50/10"
                      : "border-primary-100 bg-white hover:border-primary-200"
                  }`}
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.dishName}
                    className="w-full h-full object-cover"
                  />
                  {dish.isPackageIncluded && (
                    <span className="absolute top-2 left-2 bg-green-700 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 shadow-sm">
                      Trong Gói
                    </span>
                  )}
                  {isAllergen && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 flex items-center gap-1 shadow-sm">
                      <AlertTriangle className="h-3 w-3" /> Dị ứng
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-serif text-sm font-bold text-sage-950">
                    {dish.dishName}
                  </h4>
                  <p className="text-[11px] text-sage-500 font-light leading-relaxed line-clamp-2">
                    {dish.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {dish.dietaryTags.split(",").map((tag) => (
                      <span
                        key={tag.trim()}
                        className="text-[9px] font-bold uppercase tracking-wider border border-primary-200 text-primary-800 px-2 py-0.5 bg-primary-50/30"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-primary-50">
                    <span className="font-serif text-sm font-bold text-sage-950">
                      {formatCurrency(dish.price)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateMealQty(selectedMealDate, period.key, dish.foodId, -1)
                        }
                        disabled={currentQty === 0 || isAllergen}
                        className="h-7 w-7 flex items-center justify-center border border-primary-200 text-sage-600 hover:bg-primary-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-mono text-sm font-bold text-sage-950 w-6 text-center">
                        {currentQty}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateMealQty(selectedMealDate, period.key, dish.foodId, 1)
                        }
                        disabled={isAllergen}
                        className={`h-7 w-7 flex items-center justify-center border transition-colors ${isAllergen
                            ? "bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed"
                            : "border-primary-800 bg-primary-800 text-white hover:bg-primary-900 cursor-pointer"
                          }`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              );
                })}
            </div>
          </div>
        );
      })}

      {/* Footer Summary */}
      <div className="bg-primary-50/30 border border-primary-100 p-4 space-y-1">
        <div className="text-xs text-sage-700">
          Tổng cộng chọn: <strong>{getMealSelectedCount()} món</strong>
        </div>
        <div className="text-sm font-semibold text-sage-900">
          Phụ phí dự kiến ngoài gói:{" "}
          <span className="text-primary-900 font-bold font-serif">
            {formatCurrency(mealTotal)}
          </span>
        </div>
        <div className="text-[10px] text-sage-400 italic">
          * Các món Green Juice & Salad được tính 0đ trong giới hạn gói Detox (1 phần/ngày).
        </div>
      </div>

      {/* Navigation */}
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
          className="px-8 py-3.5 bg-primary-800 hover:bg-primary-900 text-white text-resort-button tracking-wider transition-all uppercase rounded-none flex items-center cursor-pointer"
        >
          Kiểm tra đơn đặt <ChevronRight className="h-4 w-4 ml-1.5" />
        </button>
      </div>
    </div>
  );
}
