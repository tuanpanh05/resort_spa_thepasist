import React, { useState } from "react";
import { PlusCircle } from "lucide-react";

export default function ManageMenu({
  dishes,
  handleToggleSoldOut,
  handleToggleTodayMenu,
}) {
  const [dishFilter, setDishFilter] = useState("All");

  const activeTodayDishes = dishes.filter(
    (d) => d.isTodayMenu && (dishFilter === "All" || d.period === dishFilter),
  );

  const inactiveDishes = dishes.filter((d) => !d.isTodayMenu);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header & Filters */}
      <div className="bg-white border border-sage-200/60 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-sage-950">
            Danh Sách Thực Đơn Hàng Ngày
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Đặt món ăn phục vụ cho Sáng, Trưa, Tối. Báo hết hàng hoặc tạm tắt
            món ăn trên menu trực tuyến.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", "Breakfast", "Lunch", "Dinner"].map((period) => (
            <button
              key={period}
              onClick={() => setDishFilter(period)}
              className={`px-4 py-2 rounded-none text-xs font-bold cursor-pointer tracking-wider uppercase transition-all ${
                dishFilter === period
                  ? "bg-sage-950 text-white"
                  : "bg-white border border-sage-250 text-sage-700 hover:bg-sage-50"
              }`}
            >
              {period === "All" && "Tất cả"}
              {period === "Breakfast" && "Sáng"}
              {period === "Lunch" && "Trưa"}
              {period === "Dinner" && "Tối"}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Today Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTodayDishes.map((dish) => (
          <div
            key={dish.id}
            className={`bg-white rounded-none border p-6 flex flex-col justify-between h-60 transition-all ${
              dish.soldOut
                ? "border-red-200 bg-red-50/10"
                : "border-sage-200 hover:border-sage-800"
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-mono font-bold text-sage-400 uppercase tracking-widest">
                  {dish.id}
                </span>
                <span
                  className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                    dish.period === "Breakfast"
                      ? "bg-amber-100 text-amber-800"
                      : dish.period === "Lunch"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {dish.period}
                </span>
              </div>
              <h4
                className={`text-base font-serif font-bold text-sage-950 mt-2.5 ${dish.soldOut ? "line-through text-sage-400" : ""}`}
              >
                {dish.name}
              </h4>
              <p className="text-xs text-sage-500 mt-2 line-clamp-2 font-light leading-relaxed">
                {dish.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-1">
                {dish.allergens.map((alg, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 bg-red-50 text-red-800 border border-red-100/50 text-[9px] font-semibold"
                  >
                    Chứa: {alg}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3.5 border-t border-sage-100 mt-4">
              <span className="font-bold text-sage-950 font-mono text-sm">
                {dish.price}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleToggleSoldOut(dish.id)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                    dish.soldOut
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-150"
                  }`}
                >
                  {dish.soldOut ? "Còn hàng" : "Hết hàng"}
                </button>
                <button
                  onClick={() => handleToggleTodayMenu(dish.id)}
                  className="px-3 py-1.5 bg-sage-100 hover:bg-sage-200 text-sage-800 border border-sage-200 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Tắt
                </button>
              </div>
            </div>
          </div>
        ))}
        {activeTodayDishes.length === 0 && (
          <div className="col-span-full bg-white border border-sage-200 p-8 text-center text-sage-400 italic">
            Không có món ăn nào đang mở phục vụ cho bữa này.
          </div>
        )}
      </div>

      {/* Quick action: Add other dishes to menu */}
      <div className="bg-sage-50/50 border border-sage-200 p-6">
        <h3 className="font-serif text-base font-bold text-sage-950 mb-4 uppercase tracking-wide">
          Món Ăn Đang Tắt - Kích Hoạt Lên Thực Đơn Hôm Nay
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {inactiveDishes.map((d) => (
            <div
              key={d.id}
              className="bg-white border border-sage-200 p-4 flex justify-between items-center text-xs"
            >
              <div>
                <h4 className="font-bold text-sage-900">{d.name}</h4>
                <span className="text-[10px] text-sage-400 block mt-1 font-mono">
                  {d.category} - {d.price}
                </span>
              </div>
              <button
                onClick={() => handleToggleTodayMenu(d.id)}
                className="px-3 py-1.5 bg-sage-950 hover:bg-sage-800 text-white font-bold flex items-center space-x-1.5 cursor-pointer uppercase text-[9px] tracking-wider"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Bật</span>
              </button>
            </div>
          ))}
          {inactiveDishes.length === 0 && (
            <p className="text-xs text-sage-400 italic text-center py-4 col-span-3">
              Tất cả các món ăn đều đang được hiển thị.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
