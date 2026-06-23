import React from "react";
import {
  Clock,
  AlertOctagon,
  Package,
  Utensils,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import StatCard from "../ui/StatCard";
import Card from "../ui/Card";

export default function ChefOverview({
  orders,
  allergies,
  ingredients,
  dishes,
  feedbacks,
  setActiveTab,
  checkOrderAllergies,
}) {
  const pendingOrCookingOrders = orders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled");
  const criticalAllergies = allergies.filter((a) => a.allergies.length > 0);
  const lowStockIngredients = ingredients.filter((i) => i.status !== "Đầy đủ");
  const todayMenuCount = dishes.filter((d) => d.isTodayMenu).length;

  // Calculate total meal portions needed today
  const totalPortionsCount = pendingOrCookingOrders.reduce((sum, ord) => {
    return sum + ord.items.reduce((itemSum, item) => itemSum + item.qty, 0);
  }, 0);

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Today Focus KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Đơn hàng hiện tại" 
          value={`${pendingOrCookingOrders.length} đơn`} 
          change={`Tổng số suất: ${totalPortionsCount} phần`} 
          icon={Clock}
        />
        <StatCard 
          title="Cảnh báo dị ứng" 
          value={`${criticalAllergies.length} khách ở`} 
          change="Cực kỳ quan trọng"
          changeType="negative"
          icon={AlertOctagon}
          className="border-red-200"
        />
        <StatCard 
          title="Nguyên liệu sắp hết" 
          value={`${lowStockIngredients.length} loại`} 
          change="Kho tủ mát bếp trực"
          changeType="negative"
          icon={Package}
        />
        <StatCard 
          title="Món thực đơn ngày" 
          value={`${todayMenuCount} món`} 
          change="Đang mở phục vụ"
          changeType="positive"
          icon={Utensils}
        />
      </div>

      {/* Critical Allergy Broadcast banner */}
      <div className="bg-white border-l-4 border-red-500 border-t border-r border-b border-sage-200/60 p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-red-50 text-red-700 border border-red-150">
            <ShieldAlert className="h-5.5 w-5.5" />
          </div>
          <div className="flex-grow">
            <h3 className="text-sm font-serif font-bold text-sage-950 uppercase tracking-wide">
              Chỉ thị Bếp Trưởng Về An Toàn Dị Ứng Khách Lưu Trú
            </h3>
            <p className="text-xs text-sage-600 mt-2 leading-relaxed">
              Yêu cầu toàn bộ nhân viên bếp đối chiếu nghiêm ngặt danh sách gọi
              món với hồ sơ dị ứng bên dưới. Mọi món ăn của khách có ghi nhận dị
              ứng <strong>tuyệt đối không để nhiễm chéo</strong> công cụ nấu,
              dầu chiên, hoặc thớt thái.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-5">
              {criticalAllergies.map((item) => (
                <div
                  key={item.id}
                  className="bg-sage-50/50 border border-sage-200/55 p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-sage-500 font-mono font-bold">
                        PHÒNG {item.room}
                      </span>
                      <span className="text-red-700 font-bold uppercase text-[9px] tracking-wider">
                        {item.dietary}
                      </span>
                    </div>
                    <h4 className="text-xs font-serif font-bold text-sage-900 mt-2">
                      {item.guest}
                    </h4>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.allergies.map((alg, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-red-750 text-white text-[9px] font-semibold tracking-wider"
                      >
                        {alg}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Feedbacks list & Live Order Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Guest dish feedbacks */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5 border-b border-primary-100 pb-3">
              <h3 className="card-title text-primary-950">
                Phản Hồi & Đánh Giá Món Ăn
              </h3>
              <span className="text-[10px] text-sage-400 font-semibold">
                {feedbacks.length} bình luận
              </span>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className={`p-4 border text-xs ${fb.status === "Complaint" ? "bg-amber-50/40 border-amber-200/60" : "bg-sage-50/20 border-sage-100"}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sage-900">
                        {fb.guest} (Phòng {fb.room})
                      </span>
                      <span className="text-sage-400 block text-[10px] mt-1 font-light">
                        Gọi món:{" "}
                        <strong className="text-sage-700 font-medium">
                          {fb.dish}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 bg-white border border-sage-200/60 px-2 py-0.5">
                      <span className="text-[10px] text-amber-500">★</span>
                      <span className="text-[10px] font-bold text-sage-800">
                        {fb.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-sage-600 mt-2.5 italic font-light leading-relaxed">
                    "{fb.comment}"
                  </p>
                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-sage-100/65 text-[10px]">
                    <span
                      className={`px-2 py-0.5 rounded-none font-bold uppercase text-[8px] tracking-wider ${fb.status === "Complaint" ? "bg-red-50 text-red-700 border border-red-100" : "bg-sage-50 text-sage-800 border border-sage-150"}`}
                    >
                      {fb.status === "Complaint" ? "Cần sửa món" : "Hài lòng"}
                    </span>
                    <span className="text-sage-400 font-light">{fb.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Live Kitchen Order Summary */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5 border-b border-primary-100 pb-3">
              <h3 className="card-title text-primary-950">
                Đơn Gọi Món Đang Chờ Nấu
              </h3>
              <button
                onClick={() => setActiveTab("orders")}
                className="text-xs text-sage-850 hover:text-sage-950 font-bold uppercase tracking-wider"
              >
                Xem KDS Queue
              </button>
            </div>
            <div className="space-y-3">
              {pendingOrCookingOrders.slice(0, 3).map((ord) => {
                const alertInfo = checkOrderAllergies(ord);
                return (
                  <div
                    key={ord.id}
                    className={`p-4 border flex items-center justify-between text-xs transition-all ${alertInfo.hasAllergyAlert ? "bg-red-50/30 border-red-300 animate-pulse" : "bg-sage-50/20 border-sage-100"}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sage-900">
                          {ord.id}
                        </span>
                        <span className="text-sage-300">|</span>
                        <span className="font-medium text-sage-600">
                          Phòng {ord.room} ({ord.origin})
                        </span>
                      </div>
                      <div className="text-sage-800 pt-1">
                        {ord.items.map((it, idx) => (
                          <span key={idx} className="font-semibold block">
                            {it.qty}x {it.name}
                          </span>
                        ))}
                      </div>
                      {ord.note && (
                        <div className="bg-amber-50/50 border-l-2 border-amber-500 text-amber-800 p-2 text-[10px] font-medium mt-1 leading-snug">
                          Lưu ý từ khách: {ord.note}
                        </div>
                      )}
                      {alertInfo.hasAllergyAlert && (
                        <span className="text-[10px] text-red-700 font-bold block flex items-center space-x-1 mt-1.5">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>
                            Cảnh báo: Trùng nhóm dị ứng (
                            {alertInfo.matchedAllergens.join(", ")})
                          </span>
                        </span>
                      )}
                    </div>
                    <div>
                      <span
                        className={`px-2.5 py-1 text-[9px] font-bold uppercase border ${ord.status === "Pending" ? "bg-blue-50 text-blue-800 border-blue-150" : "bg-amber-50 text-amber-800 border-amber-150"}`}
                      >
                        {ord.status === "Pending" ? "Chờ nhận" : "Đang nấu"}
                      </span>
                    </div>
                  </div>
                );
              })}
              {pendingOrCookingOrders.length === 0 && (
                <p className="text-xs text-sage-400 text-center py-12 italic">
                  Bếp hiện tại không có đơn gọi món nào đang chờ.
                </p>
              )}
            </div>
          </div>

          <div className="p-4 bg-primary-50/50 border border-primary-200/50 rounded-none text-xs mt-6">
            <h4 className="font-bold text-primary-800 font-serif">
              Tip Vận Hành Bếp:
            </h4>
            <p className="text-sage-600 mt-1 font-light leading-relaxed">
              Sử dụng lò hấp chuẩn nhiệt độ 85°C đối với nấm đùi gà để giữ trọn
              vẹn vị thanh đạm thực dưỡng của resort.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
