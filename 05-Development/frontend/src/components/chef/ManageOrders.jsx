import React, { useState } from "react";
import {
  Flame,
  Clock,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Check,
  Truck,
  Volume2,
  ArrowRight,
  XCircle,
  Search,
  XSquare
} from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";

export default function ManageOrders({
  orders,
  playVoiceAlert,
  handleUpdateOrderStatus,
  checkOrderAllergies,
  handleCancelItem,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.filter(o => {
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

  const speakOrder = (ord, alertInfo) => {
    const alertText = alertInfo.hasAllergyAlert
      ? `Đơn hàng bàn ${ord.tableNumber}. Cảnh báo dị ứng: ${alertInfo.matchedAllergens.join(", ")}. Gọi món: ${ord.items.map((it) => `${it.qty} suất ${it.name}`).join(". ")}`
      : `Đơn hàng bàn ${ord.tableNumber}. Gọi món: ${ord.items.map((it) => `${it.qty} suất ${it.name}`).join(". ")}`;
    playVoiceAlert(alertText);
  };

  const OrderCard = ({ ord, status, nextStatus, nextStatusText, nextStatusColor }) => {
    const alertInfo = checkOrderAllergies(ord);
    const isCompleted = status === "Completed";
    
    return (
      <div
        className={`relative overflow-hidden flex flex-col justify-between min-h-[260px] transition-all duration-500 transform hover:-translate-y-2 rounded-2xl ${
          alertInfo.hasAllergyAlert && !isCompleted
            ? "border border-red-200 bg-gradient-to-b from-white to-red-50/40 shadow-[0_8px_30px_rgba(239,68,68,0.15)]"
            : isCompleted
            ? "border border-gray-100 bg-white/60 opacity-80 backdrop-blur-sm grayscale-[0.2] shadow-sm"
            : "border border-sage-100/80 bg-white shadow-[0_8px_25px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
        }`}
      >
        {/* Urgent Allergy Ribbon */}
        {alertInfo.hasAllergyAlert && !isCompleted && (
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 flex items-center justify-center space-x-2 animate-pulse z-10 shadow-md">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>NGUY HIỂM: DỊ ỨNG {alertInfo.matchedAllergens.join(", ")}</span>
          </div>
        )}

        <div className={`p-5 flex-1 flex flex-col ${alertInfo.hasAllergyAlert && !isCompleted ? "pt-10" : ""}`}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sage-100/50 pb-4 mb-4 gap-2">
            <div className="flex items-center space-x-2">
              <span className={`text-[11px] font-bold font-mono tracking-widest uppercase px-3 py-1.5 rounded-full border shadow-sm ${
                alertInfo.hasAllergyAlert && !isCompleted ? "bg-red-50 text-red-700 border-red-200" : "bg-sage-50 text-sage-800 border-sage-200"
              }`}>
                {ord.mealCode ? ord.mealCode : "GUEST ORDER"}
              </span>
            </div>
            {!isCompleted && (
              <button
                type="button"
                onClick={() => speakOrder(ord, alertInfo)}
                className="p-2 bg-sage-50/50 hover:bg-sage-100 border border-sage-200/50 text-sage-600 hover:text-sage-900 rounded-full transition-all hover:scale-110 shadow-sm"
                title="Đọc đơn bằng giọng nói"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Metadata */}
          <div className="mb-4 bg-sage-50/30 p-3 rounded-xl border border-sage-100/40 text-[11px] space-y-2 text-sage-600 shadow-inner">
            <div className="flex justify-end items-center">
              <span className="truncate max-w-[200px] text-right font-medium" title={ord.guestName}>
                Khách: <strong className="text-sage-900 font-bold text-[13px]">{ord.guestName}</strong>
              </span>
            </div>
            <div className="pt-2 border-t border-sage-100/50 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-sage-400 tracking-wider">Bàn:</span>
              <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-mono font-bold border border-emerald-200 shadow-sm">
                {ord.tableNumber}
              </span>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-2.5 custom-scrollbar">
            {ord.items.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-sage-100/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:bg-sage-50/50 transition-colors group">
                <div className="flex items-center">
                  <span className={`flex items-center justify-center h-6 w-6 rounded-full font-mono font-bold text-[11px] mr-3 ${
                      isCompleted ? "bg-sage-100 text-sage-500" : "bg-gradient-to-br from-sage-700 to-sage-900 text-white shadow-md"
                  }`}>
                    {it.qty}
                  </span>
                  <span className={`text-[12px] font-semibold tracking-wide leading-tight ${isCompleted ? "text-sage-400 line-through" : "text-sage-800 group-hover:text-primary-700"}`}>
                    {it.name}
                  </span>
                </div>
                {status === "Pending" && handleCancelItem && it.foodId && (
                  <button onClick={() => handleCancelItem(ord.id, it.foodId, it.name)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-all opacity-50 hover:opacity-100" title="Báo hết hàng / Hủy món">
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Customer Notes Removed */}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-sage-100/80 flex justify-between items-center z-10">
          <span className="text-[10px] text-sage-500 font-mono flex items-center bg-sage-50 px-2.5 py-1.5 rounded-lg border border-sage-200/60 shadow-sm">
            <Clock className="h-3 w-3 mr-1.5 text-sage-400" />
            {ord.time}
          </span>
          {nextStatus ? (
            <div className="flex items-center space-x-2 flex-1 ml-4">
              {status === "Pending" && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
                      handleUpdateOrderStatus(ord.id, "Cancelled");
                    }
                  }}
                  className="flex items-center justify-center p-2.5 text-red-500 bg-white hover:bg-red-50 hover:text-red-700 rounded-xl transition-all border border-red-200 shadow-sm hover:shadow-md"
                  title="Hủy đơn hàng"
                >
                  <XSquare className="w-4 h-4" />
                </button>
              )}
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
      {/* KDS Control Header */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 via-primary-200/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200/50 rounded-2xl shadow-sm">
                <Flame className="h-8 w-8 text-amber-600 animate-pulse drop-shadow-md" />
            </div>
            <div>
              <h3 className="font-serif text-3xl text-sage-950 font-bold tracking-tight">
                Điều Phối Bếp KDS
              </h3>
              <p className="text-[13px] font-medium text-sage-500 mt-2 max-w-xl leading-relaxed">
                Hệ thống bảng Kanban thời gian thực. Tự động theo dõi luồng món ăn và hiển thị cảnh báo sức khỏe tối khẩn.
              </p>
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-sage-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm bàn, mã, tên khách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3.5 w-full border border-sage-200/80 rounded-2xl text-[13px] font-medium text-sage-800 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-sage-50/50 backdrop-blur-sm shadow-inner transition-all"
            />
          </div>
        </div>
      </div>

      {/* Kanban Board Layout */}
      <div className="flex gap-6 overflow-x-auto pb-8 pt-2 snap-x custom-scrollbar min-h-[75vh] px-2">
        
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
              <OrderCard key={ord.id} ord={ord} status="Delivering" nextStatus="Completed" nextStatusText="Đã Giao" />
            ))}
            {deliveringOrders.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-purple-300 py-16">
                  <Truck className="w-12 h-12 mb-4 opacity-40 drop-shadow-sm" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-center">Trống giao hàng</p>
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
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-center">Chưa có đơn hoàn tất</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
