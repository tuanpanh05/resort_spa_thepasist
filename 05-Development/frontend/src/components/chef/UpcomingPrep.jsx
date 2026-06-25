import React, { useState, useEffect } from "react";
import {
  Package,
  CalendarDays,
  Clock,
  CheckCircle2,
  Check,
  Truck,
  ArrowRight,
  Search,
  Flame,
  AlertTriangle
} from "lucide-react";
import Card from "../ui/Card";

export default function UpcomingPrep({
  upcomingOrders,
  handleUpdateOrderStatus,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [selectedPeriod, setSelectedPeriod] = useState("Tất cả");
  
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  const isItemInPeriod = (item, period) => {
    if (period === "Tất cả") return true;
    if (!item.periods) return true;
    const p = item.periods.toLowerCase();
    if (period === "Sáng" && p.includes("breakfast")) return true;
    if (period === "Trưa" && p.includes("lunch")) return true;
    if (period === "Tối" && p.includes("dinner")) return true;
    return false;
  };

  // Bộ lọc: Theo ngày đã chọn VÀ theo từ khóa tìm kiếm
  const filteredOrders = upcomingOrders.filter(o => {
    if (o.date !== selectedDate) return false;
    
    if (selectedPeriod !== "Tất cả") {
      // Legacy order support: check if order has any items for the selected period
      const hasMatchingItems = o.items.some(it => isItemInPeriod(it, selectedPeriod));
      if (!hasMatchingItems && o.period !== selectedPeriod) return false;
    }

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (o.tableNumber && o.tableNumber.toLowerCase().includes(term)) ||
      (o.guestName && o.guestName.toLowerCase().includes(term)) ||
      (o.mealCode && o.mealCode.toLowerCase().includes(term)) ||
      (o.id && String(o.id).toLowerCase().includes(term))
    );
  });

  const pendingOrders = filteredOrders.filter((o) => o.status === "Pending");
  const cookingOrders = filteredOrders.filter((o) => o.status === "Cooking");
  const deliveringOrders = filteredOrders.filter((o) => o.status === "Delivering");
  const completedOrders = filteredOrders.filter((o) => o.status === "Completed");

  // Tính tổng hợp sơ chế cho ngày được chọn
  const prepSummary = {};
  filteredOrders.forEach(o => {
    o.items.filter(item => isItemInPeriod(item, selectedPeriod)).forEach(item => {
      if (!prepSummary[item.name]) prepSummary[item.name] = 0;
      prepSummary[item.name] += item.qty;
    });
  });

  const OrderCard = ({ ord, status, nextStatus, nextStatusText, nextStatusColor }) => {
    const isCompleted = status === "Completed";
    
    return (
      <div
        className={`relative overflow-hidden flex flex-col justify-between min-h-[260px] transition-all duration-500 transform hover:-translate-y-2 rounded-2xl ${
          isCompleted
            ? "border border-gray-100 bg-white/60 opacity-80 backdrop-blur-sm grayscale-[0.2] shadow-sm"
            : "border border-indigo-100/80 bg-white shadow-[0_8px_25px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
        }`}
      >
        <div className="p-5 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-indigo-100/50 pb-4 mb-4 gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold font-mono tracking-widest uppercase px-3 py-1.5 rounded-full border shadow-sm bg-indigo-50 text-indigo-800 border-indigo-200">
                {ord.mealCode ? ord.mealCode : "GUEST ORDER"}
              </span>
            </div>
            {(selectedPeriod !== "Tất cả" ? selectedPeriod : ord.period) && (
              <div className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full font-bold text-[10px] uppercase tracking-widest border border-amber-200 shadow-sm">
                BUỔI {selectedPeriod !== "Tất cả" ? selectedPeriod : ord.period}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="mb-4 bg-indigo-50/30 p-3 rounded-xl border border-indigo-100/40 text-[11px] space-y-2 text-indigo-600 shadow-inner">
            <div className="flex justify-between items-center">
              <span className="truncate font-medium flex-1 text-left" title={ord.guestName}>
                Khách: <strong className="text-indigo-900 font-bold text-[12px] ml-1">{ord.guestName}</strong>
              </span>
            </div>
            <div className="pt-2 border-t border-indigo-100/50 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Bàn:</span>
              <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-mono font-bold border border-emerald-200 shadow-sm">
                {ord.tableNumber}
              </span>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto max-h-[180px] pr-1 space-y-2.5 custom-scrollbar">
            {ord.items.filter(it => isItemInPeriod(it, selectedPeriod)).map((it, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-indigo-100/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:bg-indigo-50/50 transition-colors group">
                <div className="flex items-center">
                  <span className={`flex items-center justify-center h-6 w-6 rounded-full font-mono font-bold text-[11px] mr-3 ${
                      isCompleted ? "bg-indigo-100 text-indigo-500" : "bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-md"
                  }`}>
                    {it.qty}
                  </span>
                  <span className={`text-[12px] font-semibold tracking-wide leading-tight ${isCompleted ? "text-indigo-400 line-through" : "text-indigo-900 group-hover:text-primary-700"}`}>
                    {it.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Notes */}
          {ord.note && (
            <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50/30 border border-amber-200/60 rounded-xl p-3 relative overflow-hidden shadow-sm">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500" />
              <span className="font-bold uppercase tracking-widest text-[9px] flex items-center mb-1 text-amber-800">
                <AlertTriangle className="w-3 h-3 mr-1" /> Ghi chú bếp:
              </span>
              <p className="text-[11px] font-medium text-amber-950 leading-relaxed pl-1">
                {ord.note}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-indigo-100/80 flex justify-between items-center z-10">
          <span className="text-[10px] text-indigo-500 font-mono flex items-center bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-200/60 shadow-sm">
            <Clock className="h-3 w-3 mr-1.5 text-indigo-400" />
            {ord.time}
          </span>
          {nextStatus ? (
            <div className="flex items-center space-x-2 flex-1 ml-4">
              <button
                type="button"
                onClick={() => handleUpdateOrderStatus(ord.id, nextStatus)}
                className={`flex flex-1 items-center justify-center space-x-1.5 px-4 py-2.5 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 ${
                  status === "Pending" ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-[0_8px_20px_rgba(59,130,246,0.3)]" :
                  status === "Cooking" ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-[0_8px_20px_rgba(245,158,11,0.3)]" :
                  status === "Delivering" ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:shadow-[0_8px_20px_rgba(168,85,247,0.3)]" : ""
                }`}
              >
                <span>{nextStatusText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center space-x-1.5 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 shadow-sm">
              <Check className="h-3.5 w-3.5" />
              <span>Đã hoàn tất</span>
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Control Header */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-200/20 via-blue-200/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-200/50 rounded-2xl shadow-sm">
                <Package className="h-8 w-8 text-indigo-600 animate-pulse drop-shadow-md" />
            </div>
            <div>
              <h3 className="font-serif text-3xl text-sage-950 font-bold tracking-tight">
                Đơn Combo Đặt Trước
              </h3>
              <p className="text-[13px] font-medium text-sage-500 mt-2 max-w-xl leading-relaxed">
                Bảng Kanban chuyên biệt để quản lý tiến độ nấu các suất ăn trong gói Combo.
              </p>
            </div>
          </div>
          <div className="relative w-full md:w-auto flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-48 flex items-center bg-indigo-50/50 backdrop-blur-sm shadow-inner rounded-2xl border border-indigo-200/80 transition-all focus-within:ring-2 focus-within:ring-indigo-400">
              <input
                type="date"
                min={getTodayString()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value || getTodayString())}
                className="w-full pl-4 py-3.5 bg-transparent text-[13px] font-bold text-indigo-800 focus:outline-none"
              />
            </div>
            <div className="relative w-full sm:w-40">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full pl-4 pr-10 py-3.5 border border-indigo-200/80 rounded-2xl text-[13px] font-bold text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-indigo-50/50 backdrop-blur-sm shadow-inner transition-all appearance-none"
              >
                <option value="Tất cả">Tất cả các buổi</option>
                <option value="Sáng">Buổi Sáng</option>
                <option value="Trưa">Buổi Trưa</option>
                <option value="Tối">Buổi Tối</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-indigo-600">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-indigo-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm mã, bàn, khách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-3.5 w-full border border-indigo-200/80 rounded-2xl text-[13px] font-medium text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-indigo-50/50 backdrop-blur-sm shadow-inner transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {!selectedDate ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-3xl">
          <CalendarDays className="w-20 h-20 text-indigo-200 mb-6 drop-shadow-sm" />
          <p className="text-indigo-500 font-medium text-sm tracking-wide">Vui lòng chọn một ngày để xem và quản lý tiến độ nấu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 px-2">
          {/* Main Kanban Board (4 Columns) */}
          <div className="xl:col-span-4">
            <div className="flex gap-6 overflow-x-auto pb-8 snap-x custom-scrollbar min-h-[75vh]">
              
              {/* Column 1: Pending */}
              <div className="flex-none w-[340px] lg:w-[calc(25%-18px)] flex flex-col snap-center relative">
                <div className="bg-white/90 backdrop-blur-xl p-4 rounded-t-2xl border border-blue-100 border-b-0 flex justify-between items-center z-10 shadow-sm relative">
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-t-2xl opacity-90" />
                  <h4 className="font-serif text-[13px] font-bold flex items-center space-x-2 tracking-widest uppercase text-blue-900 mt-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    <span>1. Chờ Nhận</span>
                  </h4>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[11px] font-bold shadow-inner border border-blue-200/50">{pendingOrders.length}</span>
                </div>
                <div className="bg-gradient-to-b from-blue-50/40 to-white/30 backdrop-blur-md border border-blue-100 rounded-b-2xl p-4 flex-1 space-y-4 shadow-[0_8px_30px_rgba(59,130,246,0.03)]">
                  {pendingOrders.map((ord) => (
                    <OrderCard key={ord.id} ord={ord} status="Pending" nextStatus="Cooking" nextStatusText="Nhận Nấu" />
                  ))}
                  {pendingOrders.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-blue-300 py-16">
                        <Clock className="w-12 h-12 mb-4 opacity-40 drop-shadow-sm" />
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-center">Trống đơn hàng</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: Cooking */}
              <div className="flex-none w-[340px] lg:w-[calc(25%-18px)] flex flex-col snap-center relative">
                <div className="bg-white/90 backdrop-blur-xl p-4 rounded-t-2xl border border-amber-100 border-b-0 flex justify-between items-center z-10 shadow-sm relative">
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-t-2xl opacity-90" />
                  <h4 className="font-serif text-[13px] font-bold flex items-center space-x-2 tracking-widest uppercase text-amber-900 mt-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                    <span>2. Đang Nấu</span>
                  </h4>
                  <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[11px] font-bold shadow-inner border border-amber-200/50">{cookingOrders.length}</span>
                </div>
                <div className="bg-gradient-to-b from-amber-50/40 to-white/30 backdrop-blur-md border border-amber-100 rounded-b-2xl p-4 flex-1 space-y-4 shadow-[0_8px_30px_rgba(245,158,11,0.03)]">
                  {cookingOrders.map((ord) => (
                    <OrderCard key={ord.id} ord={ord} status="Cooking" nextStatus="Delivering" nextStatusText="Xong Món" />
                  ))}
                  {cookingOrders.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-amber-300 py-16">
                        <Flame className="w-12 h-12 mb-4 opacity-40 drop-shadow-sm" />
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-center">Trống bếp</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3: Delivering */}
              <div className="flex-none w-[340px] lg:w-[calc(25%-18px)] flex flex-col snap-center relative">
                <div className="bg-white/90 backdrop-blur-xl p-4 rounded-t-2xl border border-purple-100 border-b-0 flex justify-between items-center z-10 shadow-sm relative">
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-t-2xl opacity-90" />
                  <h4 className="font-serif text-[13px] font-bold flex items-center space-x-2 tracking-widest uppercase text-purple-900 mt-1">
                    <Truck className="h-4 w-4 text-purple-500" />
                    <span>3. Đang Giao</span>
                  </h4>
                  <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-[11px] font-bold shadow-inner border border-purple-200/50">{deliveringOrders.length}</span>
                </div>
                <div className="bg-gradient-to-b from-purple-50/40 to-white/30 backdrop-blur-md border border-purple-100 rounded-b-2xl p-4 flex-1 space-y-4 shadow-[0_8px_30px_rgba(168,85,247,0.03)]">
                  {deliveringOrders.map((ord) => (
                    <OrderCard key={ord.id} ord={ord} status="Delivering" nextStatus="Completed" nextStatusText="Đã Giao Tới" />
                  ))}
                  {deliveringOrders.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-purple-300 py-16">
                        <Truck className="w-12 h-12 mb-4 opacity-40 drop-shadow-sm" />
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-center">Chờ giao món</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 4: Completed */}
              <div className="flex-none w-[340px] lg:w-[calc(25%-18px)] flex flex-col snap-center relative">
                <div className="bg-white/90 backdrop-blur-xl p-4 rounded-t-2xl border border-emerald-100 border-b-0 flex justify-between items-center z-10 shadow-sm relative">
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-t-2xl opacity-90" />
                  <h4 className="font-serif text-[13px] font-bold flex items-center space-x-2 tracking-widest uppercase text-emerald-900 mt-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>4. Hoàn Tất</span>
                  </h4>
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold shadow-inner border border-emerald-200/50">{completedOrders.length}</span>
                </div>
                <div className="bg-gradient-to-b from-emerald-50/30 to-white/20 backdrop-blur-md border border-emerald-100 rounded-b-2xl p-4 flex-1 space-y-4 shadow-[0_8px_30px_rgba(16,185,129,0.03)]">
                  {completedOrders.map((ord) => (
                    <OrderCard key={ord.id} ord={ord} status="Completed" />
                  ))}
                  {completedOrders.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-emerald-300 py-16">
                        <CheckCircle2 className="w-12 h-12 mb-4 opacity-40 drop-shadow-sm" />
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-center">Chưa có đơn</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Right Sidebar: Prep Summary */}
          <div className="xl:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] sticky top-4">
              <h5 className="font-bold text-indigo-950 border-b border-indigo-100/50 pb-4 mb-5 flex items-center space-x-2 uppercase tracking-wide text-[13px]">
                <Package className="h-5 w-5 text-indigo-600" />
                <span>Sơ Chế Ngày {selectedDate === "Tất cả" ? "(Tất cả)" : formatDate(selectedDate)}</span>
              </h5>
              
              {Object.keys(prepSummary).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 opacity-50">
                  <Package className="w-10 h-10 text-indigo-300 mb-3" />
                  <p className="text-xs text-indigo-800 font-medium text-center">Không có món ăn nào cần chuẩn bị.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                  {Object.keys(prepSummary).sort().map(dishName => (
                    <div key={dishName} className="flex justify-between items-center bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 hover:border-indigo-300 transition-colors shadow-sm group">
                      <span className="text-[12px] font-semibold text-indigo-900 pr-2 leading-tight group-hover:text-primary-700 transition-colors">{dishName}</span>
                      <span className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-mono font-bold px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shadow-[0_2px_10px_rgba(79,70,229,0.3)]">
                        {prepSummary[dishName]} Suất
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
