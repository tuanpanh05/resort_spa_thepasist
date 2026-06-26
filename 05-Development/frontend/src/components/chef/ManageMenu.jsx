import React, { useState } from "react";
import { PlusCircle, Trash2, Utensils, AlertTriangle, Clock, Archive } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";

export default function ManageMenu({
  dishes,
  orders = [],
  handleToggleSoldOut,
  handleToggleTodayMenu,
}) {
  const [dishFilter, setDishFilter] = useState("All");

  const activeTodayDishes = dishes.filter(
    (d) => d.isTodayMenu && (dishFilter === "All" || (d.periods && d.periods.includes(dishFilter))),
  );

  const inactiveDishes = dishes.filter((d) => !d.isTodayMenu);

  const totalMenuToday = activeTodayDishes.length;
  const soldOutCount = activeTodayDishes.filter(d => d.soldOut).length;
  const pendingOrdersCount = orders.filter(o => o.status === "Pending" || o.status === "Cooking").length;
  const inactiveCount = inactiveDishes.length;

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-sage-500 uppercase tracking-wider">Tổng món hôm nay</span>
            <div className="bg-sage-100 p-1.5 rounded">
              <Utensils className="w-4 h-4 text-sage-600" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-sage-950 font-serif flex items-baseline space-x-2">
              <span>{totalMenuToday}</span>
              <span className="text-sm font-medium text-sage-800">món</span>
            </h4>
            <p className="text-[10px] text-sage-500 mt-1">Đang mở phục vụ</p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-sage-500 uppercase tracking-wider">Món đã hết hàng</span>
            <div className="bg-sage-100 p-1.5 rounded">
              <AlertTriangle className="w-4 h-4 text-sage-600" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-sage-950 font-serif flex items-baseline space-x-2">
              <span>{soldOutCount}</span>
              <span className="text-sm font-medium text-sage-800">món</span>
            </h4>
            <p className="text-[10px] text-sage-500 mt-1">{soldOutCount === 0 ? "Nguyên liệu đầy đủ" : "Cần bổ sung"}</p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-sage-500 uppercase tracking-wider">Tổng đơn chờ nấu</span>
            <div className="bg-sage-100 p-1.5 rounded">
              <Clock className="w-4 h-4 text-sage-600" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-sage-950 font-serif flex items-baseline space-x-2">
              <span>{pendingOrdersCount}</span>
              <span className="text-sm font-medium text-sage-800">đơn</span>
            </h4>
            <p className="text-[10px] text-sage-500 mt-1">Chưa hoàn tất</p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-sage-500 uppercase tracking-wider">Món đang tạm tắt</span>
            <div className="bg-sage-100 p-1.5 rounded">
              <Archive className="w-4 h-4 text-sage-600" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-sage-950 font-serif flex items-baseline space-x-2">
              <span>{inactiveCount}</span>
              <span className="text-sm font-medium text-sage-800">món</span>
            </h4>
            <p className="text-[10px] text-sage-500 mt-1">Lưu trong kho</p>
          </div>
        </Card>
      </div>

      {/* Header & Filters */}
      <Card className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="card-title text-primary-950">
            Danh Sách Thực Đơn Hàng Ngày
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Quản lý món ăn phục vụ Sáng, Trưa, Tối. Cập nhật trạng thái hết hàng và theo dõi số lượng đang chờ nấu.
          </p>
        </div>
        <div className="flex flex-wrap gap-0 border border-sage-900 rounded overflow-hidden">
          {["All", "Breakfast", "Lunch", "Dinner"].map((period) => (
            <button
              key={period}
              onClick={() => setDishFilter(period)}
              className={`px-6 py-2 text-xs font-bold uppercase transition-colors ${dishFilter === period ? "bg-sage-900 text-white" : "bg-white text-sage-900 hover:bg-sage-50"} ${period !== "All" ? "border-l border-sage-900" : ""}`}
            >
              {period === "All" && "Tất cả"}
              {period === "Breakfast" && "Sáng"}
              {period === "Lunch" && "Trưa"}
              {period === "Dinner" && "Tối"}
            </button>
          ))}
        </div>
      </Card>

      {/* Menu Today Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-8">
        {activeTodayDishes.map((dish) => {
          const pendingQty = orders
            .filter(o => o.status === "Pending" || o.status === "Cooking")
            .reduce((sum, o) => {
              const item = o.items.find(i => i.name === dish.name);
              return sum + (item ? item.qty : 0);
            }, 0);

          return (
          <div 
            key={dish.id} 
            className={`group flex flex-col sm:flex-row bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgba(26,47,35,0.08)] transition-all duration-300 border ${
              dish.soldOut ? 'border-red-200/50 opacity-80' : 'border-[#cda250]/20 hover:border-[#cda250]/50'
            }`}
          >
            {/* Image Area */}
            <div className="relative sm:w-48 h-48 sm:h-auto shrink-0 overflow-hidden bg-[#fbfaf7]">
              <img 
                src={dish.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                alt={dish.name} 
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${dish.soldOut ? 'grayscale-[50%]' : ''}`} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-90"></div>
              
              <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1.5 pr-20">
                {(dish.periods || ["Breakfast"]).map((dPeriod) => (
                  <span
                    key={dPeriod}
                    className="bg-white/95 backdrop-blur text-[9px] font-bold px-2 py-0.5 rounded-full text-[#1a2f23] shadow-sm uppercase tracking-wider"
                  >
                    {dPeriod}
                  </span>
                ))}
              </div>
              
              <div className="absolute top-3 right-3">
                <span className={`flex items-center px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider text-white shadow-sm ${
                  !dish.soldOut ? 'bg-green-600/90' : 'bg-red-600/90'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${!dish.soldOut ? 'bg-white' : 'bg-red-200'}`}></span>
                  {!dish.soldOut ? "Còn Hàng" : "Hết Hàng"}
                </span>
              </div>

              <div className="absolute bottom-3 left-3">
                <div className="text-[10px] text-white/90 font-mono font-bold uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                  {dish.id} • {dish.category}
                </div>
              </div>
            </div>
            
            {/* Details Area */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col relative bg-white min-w-0">
              <div className="flex justify-between items-start mb-2 gap-3">
                <h4 className={`flex-1 min-w-0 text-lg font-serif font-bold text-[#1a2f23] leading-tight group-hover:text-[#cda250] transition-colors line-clamp-2 ${dish.soldOut ? "line-through text-sage-400" : ""}`}>
                  {dish.name}
                </h4>
                <div className="shrink-0 text-sm sm:text-[15px] font-bold text-[#cda250] font-mono bg-[#cda250]/10 px-2.5 py-1 rounded-lg">
                  {new Intl.NumberFormat("vi-VN").format(dish.price)}đ
                </div>
              </div>
              
              <p className="text-xs text-sage-600 line-clamp-2 mb-4 leading-relaxed font-light">
                {dish.description || "Chưa có mô tả chi tiết cho món ăn này."}
              </p>

              {dish.allergens && dish.allergens.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {dish.allergens.map((alg, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100/50 rounded text-[9px] font-semibold flex items-center"
                    >
                      <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                      Chứa: {alg}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="mt-auto pt-4 border-t border-sage-100 flex flex-col gap-3">
                <div className="flex justify-between items-center text-[10px] text-sage-500 font-mono">
                  <span>Tình trạng bếp:</span>
                  <span className={`px-2 py-1 font-bold rounded-md ${
                      pendingQty > 0 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-sage-50 text-sage-500 border border-sage-200"
                    }`}>
                    {pendingQty} suất đang chờ
                  </span>
                </div>

                <div className="flex space-x-2 w-full">
                  <button
                    type="button"
                    onClick={() => handleToggleSoldOut(dish.id)}
                    className={`flex-1 py-2 text-[10px] font-bold tracking-wider rounded-lg transition-all ${
                      dish.soldOut 
                        ? "bg-sage-100 text-sage-700 hover:bg-sage-200" 
                        : "bg-[#c81e1e] hover:bg-[#a51919] text-white shadow-sm hover:shadow"
                    }`}
                  >
                    {dish.soldOut ? "CÒN HÀNG" : "BÁO HẾT HÀNG"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleTodayMenu(dish.id)}
                    className="px-4 py-2 text-[10px] font-bold tracking-wider rounded-lg border-2 border-sage-200 bg-white text-sage-800 hover:bg-sage-50 hover:border-sage-300 transition-all"
                  >
                    TẮT
                  </button>
                </div>
              </div>
            </div>
          </div>
        )})}
        {activeTodayDishes.length === 0 && (
          <div className="col-span-full bg-white border border-sage-200 p-8 rounded-xl text-center text-sage-400 italic">
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
