import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckSquare,
} from "lucide-react";
import AdminStats from "./AdminStats";
import { adminApi } from "../../api";

// TODO: Replace with real API when backend provides GET /api/admin/operational-warnings
const MOCK_WARNINGS = [
  {
    id: 1,
    text: "Phòng 303: Điều hòa chảy nước, cần kỹ thuật xử lý gấp.",
    type: "maintenance",
    time: "10 phút trước",
  },
  {
    id: 2,
    text: "Phòng 104: Đang dọn vệ sinh kéo dài quá 2 tiếng.",
    type: "cleaning",
    time: "45 phút trước",
  },
];

export default function AdminOverview({
  rooms,
  occupancyRate,
  occupiedRoomsCount,
  setActiveTab,
  occupancyChartData,
  payments,
  swapRequests,
}) {
  // Fetch real staff count from API
  const [activeStaff, setActiveStaff] = useState(0);

  useEffect(() => {
    adminApi.getAllUsers()
      .then((users) => {
        const count = users.filter(
          (u) => u.role === "STAFF" || u.role === "RECEPTIONIST"
        ).length;
        setActiveStaff(count);
      })
      .catch(() => {
        // silently fail – stats will show 0
      });
  }, []);

  const pendingPayments = payments.filter((p) => p.status === "Unpaid").length;
  const pendingSwaps = swapRequests.length;

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Today Focus KPIs */}
      <AdminStats
        occupiedRoomsCount={occupiedRoomsCount}
        totalRoomsCount={rooms.length}
        occupancyRate={occupancyRate}
        activeStaff={activeStaff}
        warningsCount={MOCK_WARNINGS.length}
      />

      {/* Grid: Actions Checklist & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Action Priority Checklist */}
        <div className="bg-white border border-primary-100 p-6 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-primary-50">
            <h3 className="font-serif text-base font-bold text-sage-950 uppercase tracking-wider">
              Việc Cần Xử Lý Hôm Nay
            </h3>
            <span className="text-[9px] bg-primary-100 text-primary-900 px-2 py-0.5 font-bold uppercase tracking-wider">
              Today Focus
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3.5 p-4 bg-[#f5f5f0]/50 border border-primary-100/50">
              <CheckSquare className="h-5 w-5 text-primary-800 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold text-sage-900 uppercase tracking-wide">
                  Duyệt các yêu cầu đổi ca trực nhân viên
                </p>
                <p className="text-xs text-sage-500 mt-1 font-light leading-relaxed">
                  Hiện đang có {pendingSwaps} yêu cầu đổi lịch trực từ bộ phận
                  Spa và Buồng phòng cần quản lý phê duyệt.
                </p>
                <button
                  onClick={() => setActiveTab("shifts")}
                  className="text-xs text-primary-850 font-bold uppercase tracking-wider hover:underline mt-3 flex items-center space-x-1.5"
                >
                  <span>Duyệt ca trực</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-4 bg-[#f5f5f0]/50 border border-primary-100/50">
              <CheckSquare className="h-5 w-5 text-primary-800 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold text-sage-900 uppercase tracking-wide">
                  Xác nhận thanh toán các hóa đơn phát sinh
                </p>
                <p className="text-xs text-sage-500 mt-1 font-light leading-relaxed">
                  Có {pendingPayments} hóa đơn dịch vụ spa/bếp phòng chưa được
                  đối soát thanh toán cuối ca.
                </p>
                <button
                  onClick={() => setActiveTab("payments")}
                  className="text-xs text-primary-850 font-bold uppercase tracking-wider hover:underline mt-3 flex items-center space-x-1.5"
                >
                  <span>Mở Sổ giao dịch</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-4 bg-[#f5f5f0]/50 border border-primary-100/50">
              <CheckSquare className="h-5 w-5 text-primary-800 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold text-sage-900 uppercase tracking-wide">
                  Kiểm tra và duyệt vật tư nhập kho
                </p>
                <p className="text-xs text-sage-500 mt-1 font-light leading-relaxed">
                  Một số dược liệu tinh dầu spa và thực phẩm bếp trực đang ở
                  dưới hạn mức tối thiểu.
                </p>
                <button
                  onClick={() => setActiveTab("inventory")}
                  className="text-xs text-primary-850 font-bold uppercase tracking-wider hover:underline mt-3 flex items-center space-x-1.5"
                >
                  <span>Đối soát kho</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Occupancy Graph & Critical Alerts */}
        <div className="space-y-6">
          {/* Occupancy trends visual */}
          <div className="bg-white border border-primary-100 p-6">
            <h3 className="font-serif text-sm font-bold text-sage-950 uppercase tracking-wider mb-5">
              Xu Hướng Lấp Đầy Phòng
            </h3>

            <div className="h-44 w-full flex items-end justify-between px-2 border-b border-primary-50 pb-2 relative">
              <svg
                className="absolute inset-0 h-full w-full px-2"
                viewBox="0 0 250 160"
                preserveAspectRatio="none"
              >
                <path
                  d={`M 15 ${160 - occupancyChartData[0].val * 1.3} 
                     L 50 ${160 - occupancyChartData[1].val * 1.3} 
                     L 85 ${160 - occupancyChartData[2].val * 1.3} 
                     L 120 ${160 - occupancyChartData[3].val * 1.3} 
                     L 155 ${160 - occupancyChartData[4].val * 1.3} 
                     L 190 ${160 - occupancyChartData[5].val * 1.3} 
                     L 225 ${160 - occupancyChartData[6].val * 1.3}`}
                  fill="none"
                  stroke="#4d5743"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {occupancyChartData.map((d, i) => (
                  <circle
                    key={i}
                    cx={15 + i * 35}
                    cy={160 - d.val * 1.3}
                    r="3"
                    fill="#d4d9ce"
                    stroke="#4d5743"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>

              {occupancyChartData.map((d, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center z-10 w-8"
                >
                  <span className="text-[8px] font-bold text-primary-950">
                    {d.val}%
                  </span>
                  <span className="text-[8px] text-sage-400 mt-1 uppercase font-mono">
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active alerts log feed – TODO: Replace with real GET /api/admin/warnings */}
          <div className="bg-white border border-primary-100 p-6 space-y-4">
            <h3 className="font-serif text-sm font-bold text-sage-950 uppercase tracking-wider mb-2">
              Cảnh Báo Vận Hành
            </h3>
            <div className="space-y-3">
              {MOCK_WARNINGS.slice(0, 3).map((w) => (
                <div
                  key={w.id}
                  className="p-3 bg-red-50/20 border border-red-150 flex items-start space-x-2 text-[11px]"
                >
                  <AlertTriangle className="h-4 w-4 text-red-750 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-950">{w.text}</p>
                    <p className="text-sage-400 text-[9px] mt-0.5 font-mono">
                      {w.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
