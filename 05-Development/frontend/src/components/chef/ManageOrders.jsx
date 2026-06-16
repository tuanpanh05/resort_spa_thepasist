import React from "react";
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
  XCircle
} from "lucide-react";

export default function ManageOrders({
  orders,
  playVoiceAlert,
  handleUpdateOrderStatus,
  checkOrderAllergies,
  handleCancelItem,
}) {
  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const cookingOrders = orders.filter((o) => o.status === "Cooking");
  const deliveringOrders = orders.filter((o) => o.status === "Delivering");
  const completedOrders = orders.filter((o) => o.status === "Completed");

  const speakOrder = (ord, alertInfo) => {
    const alertText = alertInfo.hasAllergyAlert
      ? `Đơn hàng phòng ${ord.room}. Cảnh báo dị ứng: ${alertInfo.matchedAllergens.join(", ")}. Gọi món: ${ord.items.map((it) => `${it.qty} suất ${it.name}`).join(". ")}`
      : `Đơn hàng phòng ${ord.room}. Gọi món: ${ord.items.map((it) => `${it.qty} suất ${it.name}`).join(". ")}`;
    playVoiceAlert(alertText);
  };

  const OrderCard = ({ ord, status, nextStatus, nextStatusText, nextStatusColor }) => {
    const alertInfo = checkOrderAllergies(ord);
    const isCompleted = status === "Completed";
    
    return (
      <div
        className={`relative overflow-hidden flex flex-col justify-between min-h-[260px] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl rounded-xl ${
          alertInfo.hasAllergyAlert && !isCompleted
            ? "border-2 border-red-500 bg-red-50/30 shadow-[0_4px_20px_rgba(239,68,68,0.2)]"
            : isCompleted
            ? "border border-sage-200 bg-white opacity-70"
            : "border border-sage-200 bg-white shadow-sm"
        }`}
      >
        {/* Urgent Allergy Ribbon */}
        {alertInfo.hasAllergyAlert && !isCompleted && (
          <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 flex items-center justify-center space-x-2 animate-pulse z-10">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>NGUY HIỂM: DỊ ỨNG {alertInfo.matchedAllergens.join(", ")}</span>
          </div>
        )}

        <div className={`p-5 flex-1 flex flex-col ${alertInfo.hasAllergyAlert && !isCompleted ? "pt-10" : ""}`}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sage-100 pb-3 mb-3 gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold font-mono bg-sage-900 text-white px-3 py-1 rounded-md shadow-inner">
                {ord.mealCode ? `MÃ: ${ord.mealCode}` : "MÃ: N/A"}
              </span>
            </div>
            {!isCompleted && (
              <button
                type="button"
                onClick={() => speakOrder(ord, alertInfo)}
                className="p-1.5 bg-sage-50 hover:bg-sage-100 border border-sage-200 text-sage-800 rounded-full transition-colors"
                title="Đọc đơn bằng giọng nói"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Metadata */}
          <div className="flex justify-between items-center text-[10px] text-sage-500 font-mono mb-3">
            <span>Đơn: {ord.id}</span>
            <span className="text-[10px] bg-sage-100 text-sage-800 px-1.5 py-0.5 rounded font-bold border border-sage-200">
              Phòng: {ord.room}
            </span>
            <span className="truncate max-w-[120px] text-right" title={ord.guestName}>
              Khách: <strong className="text-sage-800">{ord.guestName}</strong>
            </span>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {ord.items.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-sage-50/50 rounded-lg border border-sage-100/50 hover:bg-sage-50 transition-colors">
                <div className="flex items-center">
                  <span className={`flex items-center justify-center h-6 w-6 rounded-md text-white font-mono font-bold text-xs mr-3 ${
                      isCompleted ? "bg-sage-400" : "bg-sage-800"
                  }`}>
                    {it.qty}
                  </span>
                  <span className={`text-xs font-semibold ${isCompleted ? "text-sage-500 line-through" : "text-sage-900"}`}>
                    {it.name}
                  </span>
                </div>
                {status === "Pending" && handleCancelItem && it.foodId && (
                  <button onClick={() => handleCancelItem(ord.id, it.foodId, it.name)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors" title="Báo hết hàng / Hủy món">
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Customer Notes */}
          {ord.note && (
            <div className="mt-3 bg-amber-50/80 border-l-4 border-amber-500 text-amber-900 p-3 text-[11px] font-medium rounded-r-lg">
              <span className="font-bold uppercase tracking-wider text-[9px] block mb-0.5 text-amber-700">Ghi chú bếp:</span>
              {ord.note}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-sage-50/50 border-t border-sage-100 flex justify-between items-center">
          <span className="text-[10px] text-sage-500 font-mono flex items-center bg-white px-2 py-1 rounded-md border border-sage-200 shadow-sm">
            <Clock className="h-3 w-3 mr-1.5 text-sage-400" />
            {ord.time}
          </span>
          {nextStatus ? (
            <button
              type="button"
              onClick={() => handleUpdateOrderStatus(ord.id, nextStatus)}
              className={`flex items-center space-x-1.5 px-4 py-2 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition-all hover:-translate-y-0.5 ${nextStatusColor}`}
            >
              <span>{nextStatusText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 flex items-center space-x-1 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
              <Check className="h-3.5 w-3.5" />
              <span>Đã hoàn tất</span>
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* KDS Control Header */}
      <div className="bg-white rounded-xl border border-sage-200/60 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-100/40 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h3 className="font-serif text-2xl font-bold text-sage-900 flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
                <Flame className="h-6 w-6 text-amber-600 animate-pulse" />
            </div>
            <span>Màn Hình Điều Phối Bếp KDS</span>
          </h3>
          <p className="text-sm text-sage-500 mt-2 max-w-2xl">
            Quản lý quy trình chế biến theo mô hình Kanban. Hệ thống tự động đẩy cảnh báo dị ứng lên mức cao nhất đối với các thành phần nguy hiểm.
          </p>
        </div>
      </div>

      {/* Kanban Board Layout */}
      <div className="flex gap-6 overflow-x-auto pb-4 snap-x custom-scrollbar min-h-[70vh]">
        
        {/* Column 1: Pending */}
        <div className="flex-none w-[320px] lg:w-[calc(25%-18px)] flex flex-col snap-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-t-xl text-white shadow-md flex justify-between items-center z-10">
            <h4 className="font-serif text-sm font-bold flex items-center space-x-2 tracking-wide uppercase">
              <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
              <span>1. CHỜ NHẬN</span>
            </h4>
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">{pendingOrders.length}</span>
          </div>
          <div className="bg-blue-50/50 border border-t-0 border-blue-200/80 rounded-b-xl p-4 flex-1 space-y-4">
            {pendingOrders.map((ord) => (
              <OrderCard key={ord.id} ord={ord} status="Pending" nextStatus="Cooking" nextStatusText="Nhận Nấu" nextStatusColor="bg-blue-600 hover:bg-blue-700" />
            ))}
            {pendingOrders.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-blue-300/60 py-12">
                  <Clock className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-xs font-medium uppercase tracking-widest text-center">Trống đơn hàng</p>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Cooking */}
        <div className="flex-none w-[320px] lg:w-[calc(25%-18px)] flex flex-col snap-center">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 rounded-t-xl text-white shadow-md flex justify-between items-center z-10">
            <h4 className="font-serif text-sm font-bold flex items-center space-x-2 tracking-wide uppercase">
              <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              <span>2. ĐANG NẤU</span>
            </h4>
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">{cookingOrders.length}</span>
          </div>
          <div className="bg-amber-50/50 border border-t-0 border-amber-200/80 rounded-b-xl p-4 flex-1 space-y-4">
            {cookingOrders.map((ord) => (
              <OrderCard key={ord.id} ord={ord} status="Cooking" nextStatus="Delivering" nextStatusText="Xong Món" nextStatusColor="bg-amber-600 hover:bg-amber-700" />
            ))}
            {cookingOrders.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-amber-300/60 py-12">
                  <Flame className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-xs font-medium uppercase tracking-widest text-center">Trống bếp</p>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Delivering */}
        <div className="flex-none w-[320px] lg:w-[calc(25%-18px)] flex flex-col snap-center">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-t-xl text-white shadow-md flex justify-between items-center z-10">
            <h4 className="font-serif text-sm font-bold flex items-center space-x-2 tracking-wide uppercase">
              <Truck className="h-4 w-4 text-white" />
              <span>3. ĐANG GIAO</span>
            </h4>
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">{deliveringOrders.length}</span>
          </div>
          <div className="bg-purple-50/50 border border-t-0 border-purple-200/80 rounded-b-xl p-4 flex-1 space-y-4">
            {deliveringOrders.map((ord) => (
              <OrderCard key={ord.id} ord={ord} status="Delivering" nextStatus="Completed" nextStatusText="Đã Giao" nextStatusColor="bg-purple-600 hover:bg-purple-700" />
            ))}
            {deliveringOrders.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-purple-300/60 py-12">
                  <Truck className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-xs font-medium uppercase tracking-widest text-center">Trống giao hàng</p>
              </div>
            )}
          </div>
        </div>

        {/* Column 4: Completed */}
        <div className="flex-none w-[320px] lg:w-[calc(25%-18px)] flex flex-col snap-center">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 rounded-t-xl text-white shadow-md flex justify-between items-center z-10">
            <h4 className="font-serif text-sm font-bold flex items-center space-x-2 tracking-wide uppercase">
              <CheckCircle2 className="h-4 w-4 text-white" />
              <span>4. HOÀN TẤT</span>
            </h4>
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">{completedOrders.length}</span>
          </div>
          <div className="bg-emerald-50/30 border border-t-0 border-emerald-200/50 rounded-b-xl p-4 flex-1 space-y-4">
            {completedOrders.map((ord) => (
              <OrderCard key={ord.id} ord={ord} status="Completed" />
            ))}
            {completedOrders.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-emerald-300/60 py-12">
                  <CheckCircle2 className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-xs font-medium uppercase tracking-widest text-center">Chưa có đơn hoàn tất</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
