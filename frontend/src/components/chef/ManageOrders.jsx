import React from "react";
import {
  Flame,
  Clock,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Check,
} from "lucide-react";

export default function ManageOrders({
  orders,
  playVoiceAlert,
  handleUpdateOrderStatus,
  checkOrderAllergies,
}) {
  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const cookingOrders = orders.filter((o) => o.status === "Cooking");
  const completedOrders = orders.filter((o) => o.status === "Completed");

  const speakOrder = (ord, alertInfo) => {
    const alertText = alertInfo.hasAllergyAlert
      ? `Đơn hàng phòng ${ord.room}. Cảnh báo dị ứng: ${alertInfo.matchedAllergens.join(", ")}. Gọi món: ${ord.items.map((it) => `${it.qty} suất ${it.name}`).join(". ")}`
      : `Đơn hàng phòng ${ord.room}. Gọi món: ${ord.items.map((it) => `${it.qty} suất ${it.name}`).join(". ")}`;
    playVoiceAlert(alertText);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* KDS Control Header */}
      <div className="bg-white border border-sage-200/60 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-sage-950 flex items-center space-x-2">
            <Flame className="h-5 w-5 text-amber-600 animate-pulse" />
            <span>Màn Hình Điều Phối Bếp KDS (Kitchen Display System)</span>
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Theo dõi tiến độ nấu nướng theo thời gian thực. Hỗ trợ cảnh báo dị
            ứng bằng giọng nói tiếng Việt chuẩn.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            playVoiceAlert(
              "Hệ thống âm thanh nhà bếp Ngũ Sơn Resort đã sẵn sàng phục vụ.",
            )
          }
          className="px-4 py-2.5 bg-sage-950 hover:bg-sage-800 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 cursor-pointer shadow-sm"
        >
          <span>🔊 Test Âm Thanh</span>
        </button>
      </div>

      {/* KDS Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Column 1: Pending */}
        <div className="bg-blue-50/40 border border-blue-200/80 p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-blue-200/50 pb-2">
            <h4 className="font-serif text-sm font-bold text-blue-900 flex items-center space-x-2">
              <span className="h-2 w-2 bg-blue-600 animate-ping" />
              <span>1. CHỜ NHẬN ({pendingOrders.length})</span>
            </h4>
          </div>

          <div className="space-y-4">
            {pendingOrders.map((ord) => {
              const alertInfo = checkOrderAllergies(ord);
              return (
                <div
                  key={ord.id}
                  className={`bg-white border p-5 flex flex-col justify-between min-h-[260px] ${
                    alertInfo.hasAllergyAlert
                      ? "border-red-400 ring-2 ring-red-100 bg-red-50/10"
                      : "border-sage-200"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-sage-100 pb-2.5 gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold font-mono bg-sage-950 text-white px-2.5 py-1">
                          P.{ord.room}
                        </span>
                        <span className="text-[9px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 px-1.5 py-0.5 border border-blue-100">
                          {ord.origin}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakOrder(ord, alertInfo)}
                        className="px-2 py-1 bg-sage-50 hover:bg-sage-100 border border-sage-200 text-sage-800 text-[10px] font-bold uppercase tracking-wider"
                      >
                        🔊 Đọc Đơn
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="flex justify-between items-center text-[10px] text-sage-400 font-mono">
                      <span>Mã: {ord.id}</span>
                      <span>
                        Khách:{" "}
                        <strong className="text-sage-800 font-semibold">
                          {ord.guestName}
                        </strong>
                      </span>
                    </div>

                    {/* Items */}
                    <div className="py-2 border-t border-b border-sage-50 space-y-1.5">
                      {ord.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-sage-50/50 border border-sage-100/50"
                        >
                          <div className="flex items-center">
                            <span className="flex items-center justify-center h-6 w-6 bg-sage-900 text-white font-mono font-bold text-xs mr-2">
                              x{it.qty}
                            </span>
                            <span className="text-xs font-semibold text-sage-900">
                              {it.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Customer Notes */}
                    {ord.note && (
                      <p className="bg-amber-50/50 border-l-2 border-amber-500 text-amber-800 p-2.5 text-[10px] font-medium leading-relaxed">
                        Lưu ý: {ord.note}
                      </p>
                    )}

                    {/* Allergy Warning */}
                    {alertInfo.hasAllergyAlert && (
                      <div className="bg-red-700 text-white p-2.5 text-[9px] font-bold uppercase tracking-wider flex items-center space-x-1.5 animate-pulse">
                        <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                        <span>
                          CẢNH BÁO DỊ ỨNG: DỊ ỨNG{" "}
                          {alertInfo.matchedAllergens.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-sage-100 flex justify-between items-center mt-4">
                    <span className="text-[10px] text-sage-400 font-mono flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {ord.time}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateOrderStatus(ord.id, "Cooking")}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Nhận & Nấu
                    </button>
                  </div>
                </div>
              );
            })}
            {pendingOrders.length === 0 && (
              <p className="text-xs text-sage-400 italic text-center py-12">
                Hiện tại không có đơn mới chờ nhận.
              </p>
            )}
          </div>
        </div>

        {/* Column 2: Cooking */}
        <div className="bg-amber-50/40 border border-amber-200/80 p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-amber-200/50 pb-2">
            <h4 className="font-serif text-sm font-bold text-amber-900 flex items-center space-x-2">
              <span className="h-2 w-2 bg-amber-500 animate-pulse" />
              <span>2. ĐANG NẤU ({cookingOrders.length})</span>
            </h4>
          </div>

          <div className="space-y-4">
            {cookingOrders.map((ord) => {
              const alertInfo = checkOrderAllergies(ord);
              return (
                <div
                  key={ord.id}
                  className={`bg-white border p-5 flex flex-col justify-between min-h-[260px] ${
                    alertInfo.hasAllergyAlert
                      ? "border-red-400 ring-2 ring-red-100 bg-red-50/10"
                      : "border-sage-200"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-sage-100 pb-2.5 gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold font-mono bg-sage-950 text-white px-2.5 py-1">
                          P.{ord.room}
                        </span>
                        <span className="text-[9px] font-bold tracking-wider uppercase bg-amber-50 text-amber-700 px-1.5 py-0.5 border border-amber-100">
                          {ord.origin}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakOrder(ord, alertInfo)}
                        className="px-2 py-1 bg-sage-50 hover:bg-sage-100 border border-sage-200 text-sage-800 text-[10px] font-bold uppercase tracking-wider"
                      >
                        🔊 Đọc Đơn
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="flex justify-between items-center text-[10px] text-sage-400 font-mono">
                      <span>Mã: {ord.id}</span>
                      <span>
                        Khách:{" "}
                        <strong className="text-sage-800 font-semibold">
                          {ord.guestName}
                        </strong>
                      </span>
                    </div>

                    {/* Items */}
                    <div className="py-2 border-t border-b border-sage-50 space-y-1.5">
                      {ord.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-sage-50/50 border border-sage-100/50"
                        >
                          <div className="flex items-center">
                            <span className="flex items-center justify-center h-6 w-6 bg-amber-700 text-white font-mono font-bold text-xs mr-2">
                              x{it.qty}
                            </span>
                            <span className="text-xs font-semibold text-sage-900">
                              {it.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Customer Notes */}
                    {ord.note && (
                      <p className="bg-amber-50/50 border-l-2 border-amber-500 text-amber-800 p-2.5 text-[10px] font-medium leading-relaxed">
                        Lưu ý: {ord.note}
                      </p>
                    )}

                    {/* Allergy Warning */}
                    {alertInfo.hasAllergyAlert && (
                      <div className="bg-red-700 text-white p-2.5 text-[9px] font-bold uppercase tracking-wider flex items-center space-x-1.5 animate-pulse">
                        <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                        <span>
                          CẢNH BÁO DỊ ỨNG: DỊ ỨNG{" "}
                          {alertInfo.matchedAllergens.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-sage-100 flex justify-between items-center mt-4">
                    <span className="text-[10px] text-sage-400 font-mono flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {ord.time}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateOrderStatus(ord.id, "Completed")
                      }
                      className="px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Xong món
                    </button>
                  </div>
                </div>
              );
            })}
            {cookingOrders.length === 0 && (
              <p className="text-xs text-sage-400 italic text-center py-12">
                Không có món ăn nào đang nấu.
              </p>
            )}
          </div>
        </div>

        {/* Column 3: Completed */}
        <div className="bg-sage-50/50 border border-sage-200 p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-sage-200/50 pb-2">
            <h4 className="font-serif text-sm font-bold text-sage-800 flex items-center space-x-2">
              <span className="h-2 w-2 bg-green-650" />
              <span>3. HOÀN THÀNH ({completedOrders.length})</span>
            </h4>
          </div>

          <div className="space-y-4">
            {completedOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white border border-sage-200 p-5 flex flex-col justify-between min-h-[260px] opacity-85"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-sage-100 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold font-mono bg-sage-200 text-sage-700 px-2.5 py-1">
                        P.{ord.room}
                      </span>
                      <span className="text-[9px] font-bold tracking-wider uppercase bg-sage-100 text-sage-500 px-1.5 py-0.5 border border-sage-150">
                        {ord.origin}
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex justify-between items-center text-[10px] text-sage-400 font-mono">
                    <span>Mã: {ord.id}</span>
                    <span>Khách: {ord.guestName}</span>
                  </div>

                  {/* Items */}
                  <div className="py-2 border-t border-b border-sage-50 space-y-1.5">
                    {ord.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-sage-50/20 border border-sage-100/55"
                      >
                        <div className="flex items-center">
                          <span className="flex items-center justify-center h-6 w-6 bg-sage-300 text-sage-705 font-mono font-bold text-xs mr-2">
                            x{it.qty}
                          </span>
                          <span className="text-xs font-medium text-sage-550 line-through">
                            {it.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Completion Label */}
                  <div className="text-[10px] text-green-700 bg-green-50/50 p-2 border border-green-150 font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Đã bàn giao cho nhân viên</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-sage-100 flex justify-between items-center mt-4">
                  <span className="text-[10px] text-sage-400 font-mono flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {ord.time}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 flex items-center space-x-1">
                    <Check className="h-3.5 w-3.5" />
                    <span>Đã giao</span>
                  </span>
                </div>
              </div>
            ))}
            {completedOrders.length === 0 && (
              <p className="text-xs text-sage-400 italic text-center py-12">
                Bếp chưa hoàn thành đơn nào trong ca.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
