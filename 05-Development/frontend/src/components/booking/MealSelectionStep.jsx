import React, { useState, useEffect } from "react";
import { Info, AlertTriangle, ArrowLeft, ChevronRight, Check, Clock } from "lucide-react";
import { detectAllergens } from "../../utils/health";
import { COMBOS } from "../../constants/mealCombos";


export default function MealSelectionStep({
  mealBookingDays,
  consentDataProcessing,
  consentSharing,
  packageMenuItems,
  guestInfo,
  selectedAllergies = [],
  otherAllergy = "",
  selectedComboId,
  handleSelectCombo,
  onComboMealsChange,  // NEW: callback(mealSelections) called when combo chosen
  dietaryPreferences = ["omnivore"],
  formatCurrency,
  mealTotal,
  handlePrevStep,
  handleNextStep,
  setMealSelections,
}) {
  // ── BR-10: Real-time cut-off detection ──────────────────────────────────
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const CUTOFF_HOUR = 22;
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = (() => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().split("T")[0]; })();

  useEffect(() => {
    const timer = setInterval(() => setCurrentHour(new Date().getHours()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Check if a specific date is blocked by cut-off rule
  const isCutoffBlocked = (dateStr) => {
    if (!dateStr) return false;
    if (dateStr <= todayStr) return true;  // past / today → always blocked
    if (dateStr === tomorrowStr && currentHour >= CUTOFF_HOUR) return true;
    return false;
  };

  // BR-30: Check if all booking days can still accept selections
  const allDaysBlocked = mealBookingDays.length > 0 &&
    mealBookingDays.every(d => isCutoffBlocked(d));
  // Days that are still open
  const openDays = mealBookingDays.filter(d => !isCutoffBlocked(d));
  // Show cut-off warning when tomorrow is next and it's past 22:00
  const showCutoffWarning = currentHour >= CUTOFF_HOUR && tomorrowStr && mealBookingDays.includes(tomorrowStr);
  const nightsCount = Math.max(1, mealBookingDays.length - 1);
  const guestsCount = Math.max(1, Number(guestInfo.guestsCount || 0) + Number(guestInfo.childrenUnder5 || 0) + Number(guestInfo.children5to12 || 0));
  const [viewMenuCombo, setViewMenuCombo] = React.useState(null);
  const [selectedDishDetail, setSelectedDishDetail] = React.useState(null);

  // ── Compute mealSelections from combo & notify parent ───────────────────
  // Convert internal dailyMenus structure → { "yyyy-MM-dd": { period: { foodId: qty } } }
  const buildMealSelectionsFromCombo = (safeCombo, openBookingDays) => {
    const result = {};
    const actualDaysCount = openBookingDays.length;
    openBookingDays.slice(0, actualDaysCount).forEach((dateStr, dayIndex) => {
      const menuDayIndex = dayIndex % Math.max(1, safeCombo.dailyMenus.length);
      const menu = safeCombo.dailyMenus[menuDayIndex] || [];
      const dateObj = {};
      menu.forEach(item => {
        const period = item.period || "Breakfast";
        if (!dateObj[period]) dateObj[period] = {};

        const qty = item.qty || 1;
        if (!item.noSubstituteFound) {
            dateObj[period][item.foodId] = (dateObj[period][item.foodId] || 0) + qty;
        }
      });
      if (Object.keys(dateObj).length > 0) result[dateStr] = dateObj;
    });
    return result;
  };

  // Whenever selectedComboId or safeCombos change, notify parent
  useEffect(() => {
    if (!onComboMealsChange) return;
    if (!selectedComboId) {
      onComboMealsChange({});
      return;
    }
    const chosen = safeCombos.find(c => c.id === selectedComboId);
    if (!chosen) { onComboMealsChange({}); return; }
    const computed = buildMealSelectionsFromCombo(chosen, openDays);
    onComboMealsChange(computed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedComboId, packageMenuItems, consentDataProcessing, consentSharing, selectedAllergies, otherAllergy]);

  const calculateTotalComboPrice = (combo) => {
    try {
      if (!combo.dailyMenus || combo.dailyMenus.length === 0) return 0;
      let sum = 0;
      const actualDaysCount = openDays.length;
      const chargedGuestsCount = guestsCount;
      openDays.slice(0, actualDaysCount).forEach((date, index) => {
        const menuDayIndex = index % combo.dailyMenus.length;
        const dailyMenu = combo.dailyMenus[menuDayIndex] || [];
        
        dailyMenu.forEach(item => {
          const count = item.qty || 1;
          
          const addPrice = (dish, qty) => {
              if (!dish) return;
              if (dish.isPackageIncluded) {
                  const chargeableQty = Math.max(0, qty - chargedGuestsCount);
                  sum += dish.price * chargeableQty;
              } else {
                  sum += dish.price * qty;
              }
          };

          if (!item.noSubstituteFound) {
              const origDish = packageMenuItems.find(m => m.foodId === item.foodId);
              addPrice(origDish, count);
          }
        });
      });
      return sum;
    } catch (e) {
      console.error("Error calculating combo price:", e);
      return 0;
    }
  };

  const userAllergens = detectAllergens(guestInfo.healthNote);

  const isDishAllergen = (dish) => {
    if (!dish) return false;
    const allergensStr = (Array.isArray(dish.allergens) ? dish.allergens.join(",") : (dish.allergens || "")).toLowerCase();
    const tagsStr = (dish.dietaryTags || "").toLowerCase();

    return (
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
      }))
    );
  };

  const getSafeCombo = (combo) => {
    try {
      if (!consentDataProcessing || !consentSharing) return { ...combo, allergenWarnings: [] };

      const newDailyMenus = [];
      const allergenWarnings = [];

      (combo.dailyMenus || []).forEach(menu => {
        const newMenu = [];
        (menu || []).forEach(item => {
          const dish = packageMenuItems.find((m) => m.foodId === item.foodId);
          if (isDishAllergen(dish)) {
            const substitute = packageMenuItems.find((m) => 
              m.foodId !== item.foodId && 
              m.periods && m.periods.includes(item.period) &&
              m.category === dish.category &&
              !isDishAllergen(m)
            );
            
            if (substitute) {
              newMenu.push({ ...item, foodId: substitute.foodId, isSubstituted: true, originalName: dish.dishName, subName: substitute.dishName, replacedForAll: true });
              const msg = `Thay thế món ${dish.dishName} ➔ ${substitute.dishName}`;
              if (!allergenWarnings.includes(msg)) {
                 allergenWarnings.push(msg);
              }
            } else {
              newMenu.push({ ...item, isSubstituted: true, noSubstituteFound: true, originalName: dish.dishName, replacedForAll: true });
              const msg = `Loại bỏ món ${dish.dishName} (Không tìm được món thay thế an toàn)`;
              if (!allergenWarnings.includes(msg)) {
                 allergenWarnings.push(msg);
              }
            }
          } else {
            newMenu.push(item);
          }
        });
        newDailyMenus.push(newMenu);
      });

      return { ...combo, dailyMenus: newDailyMenus, allergenWarnings };
    } catch (e) {
      console.error("Error in getSafeCombo:", e);
      return { ...combo, dailyMenus: combo.dailyMenus || [], allergenWarnings: [] };
    }
  };

  const generateDynamicDailyMenus = (comboId, items, prefs, totalGuests) => {
    try {
      if (!items || items.length === 0) return [];
      
      const activePrefs = prefs && prefs.length > 0 ? prefs : ["omnivore"];
      const guestDistribution = {};
      const baseQty = Math.floor(totalGuests / activePrefs.length);
      let remainder = totalGuests % activePrefs.length;
      
      activePrefs.forEach(diet => {
          guestDistribution[diet] = baseQty + (remainder > 0 ? 1 : 0);
          remainder--;
      });

      const validDiets = activePrefs.filter(diet => guestDistribution[diet] > 0);
      const fallbackFoodId = items[0]?.foodId;

      const menus = [];
      for (let day = 0; day < 7; day++) {
          const daily = [];
          const periods = ["Breakfast", "Lunch", "Dinner"];
          
          periods.forEach(period => {
              const itemsForPeriod = [];
              
              validDiets.forEach((diet, dIdx) => {
                  let pool = items;
                  
                  // 1. Filter by combo
                  if (comboId === 'detox') {
                      pool = pool.filter(i => {
                          const tags = (i.dietaryTags || "").toLowerCase();
                          return tags.includes("vegan") || tags.includes("vegetarian");
                      });
                  } else if (comboId === 'recovery') {
                      pool = pool.filter(i => {
                          const tags = (i.dietaryTags || "").toLowerCase();
                          return tags.includes("keto") || tags.includes("healthy");
                      });
                  } else if (comboId === 'vip') {
                      pool = pool.filter(i => {
                          const tags = (i.dietaryTags || "").toLowerCase();
                          // VIP includes omnivore, pescatarian, PLUS any diets the user explicitly chose
                          const isVipDefault = tags.includes("omnivore") || tags.includes("pescatarian");
                          const isUserSelected = activePrefs.some(p => tags.includes(p.toLowerCase()));
                          return isVipDefault || isUserSelected;
                      });
                  }
                  
                  // 2. Filter by user diet (only VIP respects individual dietary preferences within the group)
                  if (comboId === 'vip') {
                      const userDietFiltered = pool.filter(i => {
                          const tags = (i.dietaryTags || "").toLowerCase();
                          const lowerDiet = diet.toLowerCase();
                          if (lowerDiet === 'vegan') return tags.includes("vegan");
                          if (lowerDiet === 'vegetarian') return tags.includes("vegetarian") || tags.includes("vegan");
                          if (lowerDiet === 'pescatarian') return tags.includes("pescatarian") || tags.includes("vegetarian") || tags.includes("vegan");
                          return true; // omnivore, etc
                      });
                      if (userDietFiltered.length > 0) {
                          pool = userDietFiltered;
                      }
                  }
                  
                  if (pool.length === 0) pool = items; // fallback if chef hasn't defined any matching items
                  
                  const periodPool = pool.filter(i => {
                      if (Array.isArray(i.periods)) return i.periods.some(per => typeof per === 'string' && per.toLowerCase().includes(period.toLowerCase()));
                      return typeof i.periods === 'string' && i.periods.toLowerCase().includes(period.toLowerCase());
                  });
                  const finalPool = periodPool.length > 0 ? periodPool : pool;
                  
                  const isDrink = i => /nước|drink|thức uống/i.test(i.category || "") || /nước|trà|sinh tố|sữa|ép/i.test(i.dishName || "");
                  const isAppetizer = i => /khai vị|appetizer|salad/i.test(i.category || "") || /gỏi|salad|soup/i.test(i.dishName || "");
                  
                  const nuoc = finalPool.filter(i => isDrink(i));
                  const khai = finalPool.filter(i => isAppetizer(i));
                  const chinh = finalPool.filter(i => !isDrink(i) && !isAppetizer(i));
                  
                  const getId = (subPool, offset) => {
                      if (subPool.length > 0) return subPool[offset % subPool.length].foodId;
                      return finalPool[offset % finalPool.length]?.foodId || fallbackFoodId;
                  };
                  
                  const pIdx = periods.indexOf(period);
                  const id1 = getId(nuoc, day * 3 + dIdx + pIdx * 5);
                  const id2 = getId(khai, day * 3 + 1 + dIdx + pIdx * 5);
                  const id3 = getId(chinh, day * 3 + 2 + dIdx + pIdx * 5);
                  
                  const qty = guestDistribution[diet];
                  
                  [id1, id2, id3].forEach(fid => {
                      if (!fid) return;
                      const existing = itemsForPeriod.find(x => x.foodId === fid);
                      if (existing) {
                          existing.qty += qty;
                      } else {
                          itemsForPeriod.push({ foodId: fid, period, qty });
                      }
                  });
              });
              
              daily.push(...itemsForPeriod);
          });
          menus.push(daily);
      }
      return menus;
    } catch (e) {
      console.error("Error generating dynamic menus:", e);
      return [];
    }
  };

  const safeCombos = React.useMemo(() => {
    try {
      return COMBOS.map(c => {
          const dynamicCombo = { ...c, dailyMenus: generateDynamicDailyMenus(c.id, packageMenuItems, dietaryPreferences, guestsCount) };
          return getSafeCombo(dynamicCombo);
      });
    } catch (e) {
      console.error("Error generating safeCombos:", e);
      return COMBOS;
    }
  }, [packageMenuItems, consentDataProcessing, consentSharing, guestsCount, selectedAllergies, otherAllergy, guestInfo?.healthNote]);

  // Handle combo selection: propagate to parent
  const handleComboClick = (comboId) => {
    if (allDaysBlocked) return;  // BR-10: all days blocked
    handleSelectCombo(comboId);
  };

  const selectedCombo = safeCombos.find(c => c.id === selectedComboId);



  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="border-b border-[#cda250]/15 pb-4 mb-8">
        <h2 className="text-resort-section font-serif text-[#1a2f23] mb-1.5 font-semibold uppercase tracking-wide">
          Bước 4: Chọn Gói Combo Ẩm Thực (Không bắt buộc)
        </h2>
        <p className="text-resort-desc mt-1 text-sage-600 font-light">
          Chọn một gói ẩm thực áp dụng cho tất cả các khách trong suốt {nightsCount} ngày lưu trú. Thực đơn sẽ được Bếp trưởng luân phiên xoay vòng mỗi ngày để đem lại sự đa dạng!
        </p>
      </div>

      {/* ── BR-10: Cut-off Time Warning ─────────────────────────────────── */}
      {showCutoffWarning && (
        <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-xl flex items-start gap-3">
          <Clock className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700">Đã qua giờ đặt trước cho ngày mai!</p>
            <p className="text-xs text-red-600 mt-0.5">
              Thời gian hạn chót (Cut-off) là <strong>{CUTOFF_HOUR}:00</strong>. Bạn không thể đặt trước bữa ăn cho ngày mai nữa. Các ngày còn lại trong lịch vẫn có thể đặt bình thường.
            </p>
          </div>
        </div>
      )}

      {/* BR-30: All days blocked */}
      {allDaysBlocked && mealBookingDays.length > 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Không còn ngày nào có thể đặt trước</p>
            <p className="text-xs text-amber-700 mt-0.5">Tất cả các ngày trong lịch lưu trú đã qua hoặc đã qua cut-off 22:00. Bạn vẫn có thể bỏ qua bước này và tiếp tục xác nhận đặt phòng.</p>
          </div>
        </div>
      )}

      {/* Remaining open days info */}
      {!allDaysBlocked && openDays.length < mealBookingDays.length && openDays.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-xs text-blue-700">
          <Info className="h-4 w-4 flex-shrink-0" />
          <span>Gói combo sẽ áp dụng cho <strong>{openDays.length}</strong> ngày còn có thể đặt trước (từ {openDays[0]} đến {openDays[openDays.length-1]}).</span>
        </div>
      )}

      {/* Auto Filter Banner */}
      {consentDataProcessing && consentSharing ? (
        <div className="mb-6 p-4 bg-[#cda250]/5 border border-[#cda250]/20 rounded-xl text-xs text-[#1a2f23] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <Info className="h-4.5 w-4.5 text-[#cda250] flex-shrink-0" />
            <span>
              <strong>Thực đơn đã được tự động quét theo hồ sơ bệnh lý & chế độ ăn uống.</strong>
            </span>
          </div>
          <span className="bg-[#cda250]/10 text-[#cda250] border border-[#cda250]/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider self-start sm:self-auto rounded">
            Đã Lọc Tự Động
          </span>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-amber-50/50 border border-amber-200 rounded-xl text-xs text-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-600 flex-shrink-0" />
            <span>
              Hệ thống chưa được phép xử lý dữ liệu y tế. Không thể cảnh báo dị ứng.
            </span>
          </div>
        </div>
      )}

      {/* Combo List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {safeCombos.map((combo) => {
          const isSelected = selectedComboId === combo.id;
          const totalComboPrice = calculateTotalComboPrice(combo);
          const actualDaysCount = openDays.length;
          const avgPricePerDay = actualDaysCount > 0 ? totalComboPrice / (guestsCount * actualDaysCount) : 0;
          const hasSubstitutions = combo.allergenWarnings.length > 0;
          const blocked = allDaysBlocked;

          return (
            <div
              key={combo.id}
              className={`group relative border transition-all duration-500 overflow-hidden rounded-2xl flex flex-col h-full ${
                blocked ? "opacity-50 cursor-not-allowed" :
                isSelected
                  ? "cursor-pointer border-[#cda250] shadow-[0_8px_30px_rgba(205,162,80,0.15)] bg-gradient-to-b from-white to-[#cda250]/5 -translate-y-1"
                  : "cursor-pointer border-[#cda250]/15 bg-white shadow-sm hover:shadow-[0_8px_25px_rgba(26,47,35,0.06)] hover:border-[#cda250]/40 hover:-translate-y-1"
              }`}
              onClick={() => !blocked && handleComboClick(combo.id)}
            >
              <div className="relative h-56 overflow-hidden flex-shrink-0">
                <img
                  src={combo.image}
                  alt={combo.name}
                  className={`w-full h-full object-cover transition-transform duration-1000 ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a2f23]/80 via-black/10 to-transparent opacity-80"></div>
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  <div className="bg-black/40 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg w-max">
                    {combo.dailyMenus.length} Thực Đơn Luân Phiên
                  </div>
                  {hasSubstitutions && (
                    <div className="bg-amber-500/90 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 shadow-lg rounded-full flex items-center gap-1.5 w-max">
                      <AlertTriangle className="h-3.5 w-3.5" /> Có Thay Thế Dị Ứng
                    </div>
                  )}
                </div>

                {isSelected && (
                  <div className="absolute top-4 right-4 bg-[#cda250] text-[#070e0a] rounded-full p-1.5 shadow-[0_4px_12px_rgba(205,162,80,0.5)] transform scale-100 animate-fade-in z-10">
                    <Check className="w-5 h-5 stroke-[3px]" />
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-grow relative z-10">
                <h3 className="font-serif text-xl font-bold text-[#1a2f23] leading-snug mb-3 group-hover:text-[#cda250] transition-colors">
                  {combo.name}
                </h3>
                <p className="text-[13px] text-sage-600 font-light leading-relaxed flex-grow mb-5">
                  {combo.description}
                </p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewMenuCombo(combo);
                  }}
                  className="w-full text-[11px] font-bold text-[#1a2f23] flex items-center justify-center py-3 mb-5 rounded-xl border border-[#1a2f23]/10 bg-[#fbfaf7] hover:bg-[#cda250] hover:text-white hover:border-[#cda250] hover:shadow-md transition-all duration-300 group/btn mt-auto"
                >
                  <Info className="w-4 h-4 mr-2 text-sage-500 group-hover/btn:text-white transition-colors flex-shrink-0" /> 
                  <span className="uppercase tracking-[0.15em] whitespace-nowrap">Xem Thực Đơn</span>
                </button>

                {hasSubstitutions && (
                  <div className="mb-5 text-[11px] text-amber-700 font-medium leading-relaxed bg-amber-50/80 p-3 rounded-lg border border-amber-200/50 shadow-sm">
                    <div className="font-bold mb-1 flex items-center uppercase tracking-wider text-[10px]"><AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Khẩu phần thay thế:</div>
                    <ul className="space-y-0.5 list-disc pl-4 text-[10.5px]">
                      {combo.allergenWarnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}

                <div className="space-y-2 pt-5 border-t border-[#1a2f23]/10">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-sage-500">Số lượng:</span>
                    <span className="font-semibold text-[#1a2f23]">{guestsCount} Khách × {actualDaysCount} Ngày</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-sage-500">Trung bình:</span>
                    <span className="font-semibold text-[#1a2f23]">{formatCurrency(avgPricePerDay)}<span className="text-[10px] text-sage-400 font-normal"> / người / ngày</span></span>
                  </div>
                  <div className="flex flex-col items-center justify-center pt-4 mt-2">
                    <span className="text-[10px] font-bold text-sage-500 uppercase tracking-[0.2em] mb-1">Tổng Gói</span>
                    <span className="text-[22px] font-bold text-[#cda250] font-serif leading-none tracking-tight">{formatCurrency(totalComboPrice)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={blocked}
                  className={`mt-6 w-full py-3 rounded-xl font-bold uppercase tracking-wider text-[12px] transition-all duration-300 shadow-sm hover:shadow-md ${
                    blocked ? "bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-not-allowed" :
                    isSelected
                      ? "bg-gradient-to-r from-[#cda250] to-[#b38836] text-white border-none ring-2 ring-[#cda250]/30 ring-offset-2"
                      : "bg-white border-2 border-[#1a2f23] text-[#1a2f23] hover:bg-[#1a2f23] hover:text-white"
                  }`}
                >
                  {blocked ? "Không Còn Đặt Được" : isSelected ? "Đã Chọn" : "Chọn Gói Này"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Summary */}
      <div className="bg-[#cda250]/5 border border-[#cda250]/20 p-5 rounded-2xl flex justify-between items-center">
        <div className="text-sm font-semibold text-[#1a2f23]">
          Tổng phụ phí ẩm thực:
        </div>
        <div className="text-xl font-bold text-[#cda250] font-serif">
          {formatCurrency(mealTotal)}
        </div>
      </div>

      {/* Navigation */}
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
          Xác nhận đơn <ChevronRight className="h-4 w-4 ml-1.5" />
        </button>
      </div>

      {/* Menu Detail Modal */}
      {viewMenuCombo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-[#1a2f23]/90 backdrop-blur-md animate-fade-in" onClick={() => setViewMenuCombo(null)}>
          <div className="bg-[#fbfaf7] rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] w-[98vw] max-w-none h-[96vh] max-h-[96vh] flex flex-col overflow-hidden border border-[#cda250]/40 relative animate-scale-in" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setViewMenuCombo(null)}
              className="absolute top-4 right-4 text-sage-600 hover:text-white hover:bg-red-500 transition-colors p-2 bg-white/80 backdrop-blur-sm rounded-full z-20 shadow-sm"
              title="Đóng"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="p-6 sm:p-8 border-b border-[#cda250]/15 bg-white relative shrink-0">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#cda250] to-transparent opacity-50"></div>
              <h3 className="font-serif text-2xl font-bold text-[#1a2f23]">Thực Đơn Mẫu: {viewMenuCombo.name}</h3>
              <p className="text-sage-600 text-sm mt-2 max-w-3xl leading-relaxed">
                Chu kỳ luân phiên 7 ngày độc quyền của Ngũ Sơn Resort đảm bảo mang đến trải nghiệm ẩm thực đa dạng, phong phú và không trùng lặp các món chính trong suốt kỳ nghỉ của bạn.
              </p>
            </div>
            <div className="p-6 overflow-y-auto bg-[#fbfaf7] flex-1">
              <div className="flex flex-col gap-8">
                {(!viewMenuCombo.dailyMenus || viewMenuCombo.dailyMenus.length === 0) ? (
                  <div className="p-10 text-center text-sage-500 italic font-medium">
                    Thực đơn chi tiết đang được Đầu bếp trưởng lên công thức và cập nhật. Vui lòng thử lại sau!
                  </div>
                ) : Array.from({ length: openDays.length }).map((_, dayIdx) => {
                  const menuDayIndex = dayIdx % Math.max(1, viewMenuCombo.dailyMenus.length);
                  const menu = viewMenuCombo.dailyMenus[menuDayIndex] || [];

                  const visiblePeriods = ["Breakfast", "Lunch", "Dinner"];

                  if (visiblePeriods.length === 0) return null;

                  return (
                    <div key={dayIdx} className="bg-white border border-[#cda250]/20 rounded-xl p-5 shadow-sm">
                      <div className="font-serif font-bold text-2xl text-[#1a2f23] mb-6 pb-4 border-b border-[#cda250]/30 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#cda250]/10 flex items-center justify-center">
                          <span className="w-3 h-3 rounded-full bg-[#cda250]"></span>
                        </div>
                        NGÀY THỨ {dayIdx + 1}
                      </div>
                      <div className="flex flex-col gap-6">
                        {visiblePeriods.map(period => {
                          const itemsInPeriod = menu.filter(i => i.period === period);
                          if (itemsInPeriod.length === 0) return null;
                          const pName = period === "Breakfast" ? "Bữa Sáng" : period === "Lunch" ? "Bữa Trưa" : "Bữa Tối";
                          
                          return (
                            <div key={period} className="flex flex-col min-w-0 bg-white rounded-2xl p-6 border border-[#cda250]/15 shadow-[0_4px_20px_rgba(205,162,80,0.03)] relative overflow-hidden">
                              {/* Decorative background accent */}
                              <div className="absolute top-0 right-0 w-32 h-32 bg-[#cda250]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#1a2f23]/5 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

                              <div className="flex items-center justify-center gap-4 mb-8 relative z-10">
                                <div className="h-[1px] bg-[#cda250]/40 flex-1"></div>
                                <div className="px-6 py-2 border border-[#cda250]/40 rounded-full bg-[#fbfaf7] shadow-sm">
                                  <h4 className="font-serif text-sm sm:text-base font-bold text-[#1a2f23] uppercase tracking-[0.2em] whitespace-nowrap">{pName}</h4>
                                </div>
                                <div className="h-[1px] bg-[#cda250]/40 flex-1"></div>
                              </div>
                              
                              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 relative z-10">
                                {itemsInPeriod.map((item, idx) => {
                                  const count = item.qty || 1;
                                  
                                  // Determine display logic for substitutions
                                  const displays = [];
                                  if (item.isSubstituted && !item.noSubstituteFound) {
                                      displays.push({ dishId: item.foodId, qty: count, isSub: true, msg: `Đổi dị ứng` });
                                  } else if (item.noSubstituteFound) {
                                      displays.push({ dishId: null, qty: 0, isSub: true, msg: `Bị loại bỏ (Dị ứng)` });
                                  } else {
                                      displays.push({ dishId: item.foodId, qty: count, isSub: false });
                                  }

                                  return displays.map((disp, dIdx) => {
                                    if (!disp.dishId && disp.qty === 0) {
                                      return (
                                        <li key={`${idx}-${dIdx}`} className="flex items-start gap-3 p-3 bg-red-50/50 rounded-xl border border-red-100/50">
                                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1 text-xs text-red-600 italic leading-relaxed">{disp.msg}</div>
                                        </li>
                                      );
                                    }
                                    
                                    const dish = packageMenuItems.find(m => m.foodId === disp.dishId);
                                    return (
                                      <li key={`${idx}-${dIdx}`} 
                                        className={`group flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 hover:bg-white hover:shadow-[0_8px_25px_rgba(205,162,80,0.12)] hover:-translate-y-1 cursor-pointer border ${disp.isSub ? 'bg-amber-50/50 border-amber-200/60' : 'bg-[#fbfaf7] border-[#1a2f23]/5'}`}
                                        onClick={() => setSelectedDishDetail({ dish, disp, pName })}
                                      >
                                        <div className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden relative shadow-sm ${disp.isSub ? 'ring-2 ring-amber-400/50' : 'group-hover:ring-2 group-hover:ring-[#cda250]/40 transition-all'}`}>
                                          <img 
                                            src={dish ? dish.image : '/images/dishes/dish_ca_hoi.png'} 
                                            alt={dish ? dish.dishName : 'Dish'} 
                                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${disp.isSub ? 'sepia-[.15]' : ''}`}
                                            onError={(e) => { e.target.src = '/images/dishes/dish_ca_hoi.png' }}
                                          />
                                          <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1 py-0.5 rounded-bl-lg">
                                            x{disp.qty}
                                          </div>
                                          {disp.isSub && (
                                            <div className="absolute bottom-1 left-1 bg-amber-500/90 backdrop-blur-md text-white p-0.5 rounded-full shadow-lg">
                                              <AlertTriangle className="w-2.5 h-2.5" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-1">
                                          <div className={`text-[12px] sm:text-[13px] font-bold leading-tight line-clamp-2 transition-colors ${disp.isSub ? 'text-amber-700' : 'text-[#1a2f23] group-hover:text-[#cda250]'}`} title={dish ? (dish.dishName || dish.name) : "Đang cập nhật"}>
                                            {dish ? (dish.dishName || dish.name || "Chưa cập nhật tên") : "Đang cập nhật"}
                                          </div>
                                          <div className="text-[9px] sm:text-[10px] text-sage-500 uppercase tracking-wider font-bold mt-1 group-hover:text-[#cda250]/90 transition-colors flex items-center gap-0.5">
                                            <span>Xem chi tiết</span>
                                            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -ml-0.5" />
                                          </div>
                                        </div>
                                      </li>
                                    );
                                  });
                                })}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-4 sm:p-6 bg-white border-t border-[#cda250]/15 shrink-0 flex justify-end">
              <button
                type="button"
                onClick={() => setViewMenuCombo(null)}
                className="px-8 py-3 bg-[#1a2f23] text-white hover:bg-[#254231] font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center"
              >
                Đóng Thực Đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dish Detail Sub-Modal */}
      {selectedDishDetail && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in" onClick={() => setSelectedDishDetail(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden relative animate-scale-in" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedDishDetail(null)}
              className="absolute top-4 right-4 text-white hover:bg-white/20 transition-colors p-2.5 bg-black/40 backdrop-blur-md rounded-full z-20 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="relative h-64 sm:h-80 w-full bg-[#fbfaf7]">
              <img 
                src={selectedDishDetail.dish ? selectedDishDetail.dish.image : '/images/dishes/dish_ca_hoi.png'} 
                alt={selectedDishDetail.dish ? selectedDishDetail.dish.dishName : 'Dish'} 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/images/dishes/dish_ca_hoi.png' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 sm:p-8 w-full">
                <div className="text-[#cda250] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-2">{selectedDishDetail.pName}</div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {selectedDishDetail.dish ? (selectedDishDetail.dish.dishName || selectedDishDetail.dish.name || "Chưa cập nhật tên") : "Đang cập nhật"}
                </h3>
              </div>
            </div>
            
            <div className="p-6 sm:p-8 flex flex-col gap-6">
              {selectedDishDetail.disp.msg && (
                <div className="flex items-start gap-4 p-4 sm:p-5 bg-amber-50 rounded-2xl border border-amber-200/50 text-amber-800 shadow-inner">
                  <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5 text-amber-500" />
                  <div>
                    <div className="font-bold text-sm mb-1 uppercase tracking-wider">Lưu ý Điều Chỉnh Dị Ứng</div>
                    <div className="text-sm leading-relaxed">{selectedDishDetail.disp.msg}</div>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-[11px] font-bold text-sage-500 uppercase tracking-widest mb-3 border-b border-[#1a2f23]/10 pb-2">Mô Tả Món Ăn</h4>
                <p className="text-sm sm:text-base text-[#1a2f23] leading-relaxed font-light">
                  {selectedDishDetail.dish && selectedDishDetail.dish.description ? selectedDishDetail.dish.description : "Đang cập nhật mô tả món ăn này. Thành phần dinh dưỡng và nguyên liệu chi tiết sẽ được hiển thị tại đây."}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-[#fbfaf7] p-4 sm:p-5 rounded-2xl border border-[#cda250]/15">
                  <div className="text-[11px] text-sage-500 font-bold uppercase tracking-widest mb-1.5">Khẩu Phần</div>
                  <div className="text-xl font-bold text-[#1a2f23]">x{selectedDishDetail.disp.qty} <span className="text-sm font-medium text-sage-600">Người</span></div>
                </div>
                {selectedDishDetail.dish && selectedDishDetail.dish.price && (
                  <div className="bg-gradient-to-br from-[#cda250]/10 to-[#cda250]/5 p-4 sm:p-5 rounded-2xl border border-[#cda250]/30 shadow-sm">
                    <div className="text-[11px] text-[#cda250] font-bold uppercase tracking-widest mb-1.5">Giá Tiêu Chuẩn</div>
                    <div className="text-xl font-bold text-[#1a2f23]">{formatCurrency(selectedDishDetail.dish.price)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
