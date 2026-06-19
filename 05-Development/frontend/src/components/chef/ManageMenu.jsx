import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";

export default function ManageMenu({
  dishes,
  handleToggleSoldOut,
  handleToggleTodayMenu,
}) {
  const [dishFilter, setDishFilter] = useState("All");

  const activeTodayDishes = dishes.filter(
    (d) => d.isTodayMenu && (dishFilter === "All" || (d.periods && d.periods.includes(dishFilter))),
  );

  const inactiveDishes = dishes.filter((d) => !d.isTodayMenu);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header & Filters */}
      <Card className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="card-title text-primary-950">
            Danh Sách Thực Đơn Hàng Ngày
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Đặt món ăn phục vụ cho Sáng, Trưa, Tối. Báo hết hàng hoặc tạm tắt
            món ăn trên menu trực tuyến.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", "Breakfast", "Lunch", "Dinner"].map((period) => (
            <Button
              key={period}
              onClick={() => setDishFilter(period)}
              variant={dishFilter === period ? "primary" : "outline"}
              className="px-4 py-2 text-xs"
            >
              {period === "All" && "Tất cả"}
              {period === "Breakfast" && "Sáng"}
              {period === "Lunch" && "Trưa"}
              {period === "Dinner" && "Tối"}
            </Button>
          ))}
        </div>
      </Card>

      {/* Menu Today Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTodayDishes.map((dish) => (
          <Card
            key={dish.id}
            className={`p-6 flex flex-col justify-between h-60 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 ${
              dish.soldOut
                ? "border-red-200 bg-red-50/30 opacity-80"
                : "border-primary-100 hover:border-primary-400"
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-mono font-bold text-sage-400 uppercase tracking-widest">
                  {dish.id}
                </span>
                <div className="flex gap-1">
                  {(dish.periods || ["Breakfast"]).map((dPeriod) => (
                    <span
                      key={dPeriod}
                      className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                        dPeriod === "Breakfast"
                          ? "bg-amber-100 text-amber-800"
                          : dPeriod === "Lunch"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {dPeriod}
                    </span>
                  ))}
                </div>
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
                {new Intl.NumberFormat("vi-VN").format(dish.price)}đ
              </span>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleToggleSoldOut(dish.id)}
                  variant={dish.soldOut ? "secondary" : "danger"}
                  className="px-3 py-1.5 text-[10px]"
                >
                  {dish.soldOut ? "Còn hàng" : "Hết hàng"}
                </Button>
                <Button
                  onClick={() => handleToggleTodayMenu(dish.id)}
                  variant="outline"
                  className="px-3 py-1.5 text-[10px]"
                >
                  Tắt
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {activeTodayDishes.length === 0 && (
          <div className="col-span-full bg-white border border-sage-200 p-8 text-center text-sage-400 italic">
            Không có món ăn nào đang mở phục vụ cho bữa này.
          </div>
        )}
      </div>

      {/* Quick action: Add other dishes to menu */}
      <Card className="bg-primary-50/50 p-6">
        <h3 className="card-title text-primary-950 mb-4 uppercase tracking-wide">
          Món Ăn Đang Tắt - Kích Hoạt Lên Thực Đơn Hôm Nay
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {inactiveDishes.map((d) => (
            <Card
              key={d.id}
              className="p-4 flex justify-between items-center text-xs"
            >
              <div>
                <h4 className="font-bold text-sage-900">{d.name}</h4>
                <span className="text-[10px] text-sage-400 block mt-1 font-mono">
                  {d.category} - {new Intl.NumberFormat("vi-VN").format(d.price)}đ
                </span>
              </div>
              <Button
                onClick={() => handleToggleTodayMenu(d.id)}
                variant="primary"
                className="px-3 py-1.5 flex items-center space-x-1.5 text-[9px]"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Bật</span>
              </Button>
            </Card>
          ))}
          {inactiveDishes.length === 0 && (
            <p className="text-xs text-sage-400 italic text-center py-4 col-span-full">
              Tất cả món ăn trong lịch hôm nay đều đang được hiển thị.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
