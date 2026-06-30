import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import AdminStats from "./AdminStats";
import { adminApi, paymentApi } from "../../api";

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
  complaints = [],
}) {
  // Fetch real staff count from API
  const [activeStaff, setActiveStaff] = useState(0);

  // Revenue Dashboard Stats State
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [revenueData, setRevenueData] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [hoveredMonth, setHoveredMonth] = useState(null);

  // AI Forecast state variables
  const [dashboardMode, setDashboardMode] = useState("historical"); // "historical" or "forecast"
  const [forecastMonths, setForecastMonths] = useState(3);
  const [forecastData, setForecastData] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [hoveredForecastMonth, setHoveredForecastMonth] = useState(null);

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

  useEffect(() => {
    setRevenueLoading(true);
    paymentApi.getRevenueDashboard(selectedYear)
      .then((data) => {
        setRevenueData(data);
        setRevenueLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching revenue dashboard data:", err);
        setRevenueLoading(false);
      });
  }, [selectedYear]);

  useEffect(() => {
    if (dashboardMode === "forecast") {
      setForecastLoading(true);
      paymentApi.getRevenueForecast(forecastMonths)
        .then((data) => {
          setForecastData(data);
          setForecastLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching revenue forecast:", err);
          setForecastLoading(false);
        });
    }
  }, [dashboardMode, forecastMonths]);

  const handleExportExcel = async () => {
    try {
      const blob = await paymentApi.exportRevenueExcel(selectedYear);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `BaoCaoVanHanh_${selectedYear}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Lỗi khi xuất Excel: " + err.message);
    }
  };

  const handleExportPdf = async () => {
    try {
      const blob = await paymentApi.exportRevenuePdf(selectedYear);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `BaoCaoVanHanh_${selectedYear}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Lỗi khi xuất PDF: " + err.message);
    }
  };



  // Calculate stats dynamically
  const today = new Date().toDateString();
  const todayRevenue = payments
    .filter((p) => p.status?.toUpperCase() === "PAID" && p.paymentTime && new Date(p.paymentTime).toDateString() === today)
    .reduce((sum, p) => sum + (p.finalAmount || 0), 0);

  const newBookingsCount = payments
    .filter((p) => p.createdAt && new Date(p.createdAt).toDateString() === today)
    .length;

  const activeWarnings = complaints
    .filter((c) => c.status?.toLowerCase() === "open")
    .map((c) => ({
      id: c.id,
      text: `Phòng ${c.roomId}: ${c.details}`,
      type: "maintenance",
      time: c.timeReceived || "Vừa xong",
    }));

  // Donut chart calculations
  const roomRev = revenueData?.totalRoomRevenue || 0;
  const spaRev = revenueData?.totalSpaRevenue || 0;
  const foodRev = revenueData?.totalFoodRevenue || 0;
  const totalRev = roomRev + spaRev + foodRev;

  const roomPct = totalRev > 0 ? roomRev / totalRev : 0;
  const spaPct = totalRev > 0 ? spaRev / totalRev : 0;
  const foodPct = totalRev > 0 ? foodRev / totalRev : 0;

  const circumference = 2 * Math.PI * 50; // ~314.159
  const roomDash = roomPct * circumference;
  const spaDash = spaPct * circumference;
  const foodDash = foodPct * circumference;

  const roomOffset = 0;
  const spaOffset = roomDash;
  const foodOffset = roomDash + spaDash;

  // Stacked Bar Chart calculations
  const monthlyData = revenueData?.monthlyBreakdown || [];
  const maxTotal = monthlyData.reduce((max, item) => {
    const val = (item.roomRevenue || 0) + (item.spaRevenue || 0) + (item.foodRevenue || 0);
    return val > max ? val : max;
  }, 0) || 1;

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Today Focus KPIs */}
      <AdminStats
        occupiedRoomsCount={occupiedRoomsCount}
        totalRoomsCount={rooms.length}
        occupancyRate={occupancyRate}
        activeStaff={activeStaff}
        warningsCount={activeWarnings.length}
        todayRevenue={todayRevenue}
        newBookingsCount={newBookingsCount}
      />

      {/* Revenue Analytics Section */}
      <div className="bg-white border border-primary-100 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-primary-50">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setDashboardMode("historical")}
              className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all duration-150 ${
                dashboardMode === "historical"
                  ? "border-[#5c6d50] text-sage-950"
                  : "border-transparent text-sage-400 hover:text-sage-600"
              }`}
            >
              Phân Tích Lịch Sử
            </button>
            <button
              onClick={() => setDashboardMode("forecast")}
              className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all duration-150 ${
                dashboardMode === "forecast"
                  ? "border-[#5c6d50] text-sage-950"
                  : "border-transparent text-sage-400 hover:text-sage-600"
              }`}
            >
              ✨ AI Dự Báo Doanh Thu
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {dashboardMode === "historical" ? (
              <>
                <button
                  onClick={handleExportExcel}
                  className="flex items-center space-x-1 text-[10px] bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 font-bold uppercase tracking-wide cursor-pointer shadow-sm transition-all duration-150 border border-emerald-600"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Xuất Excel</span>
                </button>
                <button
                  onClick={handleExportPdf}
                  className="flex items-center space-x-1 text-[10px] bg-red-700 hover:bg-red-800 text-white px-3 py-1.5 font-bold uppercase tracking-wide cursor-pointer shadow-sm transition-all duration-150 border border-red-600"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Xuất PDF</span>
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-sage-400 font-bold uppercase tracking-wider">Năm thống kê:</span>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="text-xs bg-[#f5f5f0] border border-primary-200 px-2 py-1.5 focus:outline-none font-bold text-sage-950 uppercase tracking-wide cursor-pointer"
                  >
                    <option value={2025}>Năm 2025</option>
                    <option value={2026}>Năm 2026</option>
                    <option value={2027}>Năm 2027</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-sage-400 font-bold uppercase tracking-wider">Thời gian dự báo:</span>
                <select
                  value={forecastMonths}
                  onChange={(e) => setForecastMonths(parseInt(e.target.value))}
                  className="text-xs bg-[#f5f5f0] border border-primary-200 px-2 py-1.5 focus:outline-none font-bold text-sage-950 uppercase tracking-wide cursor-pointer"
                >
                  <option value={3}>3 Tháng tới</option>
                  <option value={6}>6 Tháng tới</option>
                  <option value={12}>12 Tháng tới</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {dashboardMode === "historical" ? (
          revenueLoading ? (
            <div className="h-64 flex items-center justify-center text-sage-500 font-light text-xs">
              Đang tải dữ liệu doanh thu...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Donut Chart - Breakdown */}
            <div className="flex flex-col items-center justify-center p-6 border border-primary-100 bg-[#f5f5f0]/30">
              <h4 className="text-xs font-bold text-sage-900 uppercase tracking-wider mb-6 text-center">
                Cơ Cấu Doanh Thu Dịch Vụ
              </h4>
              
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-center gap-6 w-full">
                {/* SVG Donut */}
                <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                  <svg width="128" height="128" viewBox="0 0 128 128" className="transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="50"
                      fill="transparent"
                      stroke="#f5f5f0"
                      strokeWidth="16"
                    />
                    {totalRev > 0 ? (
                      <>
                        {roomDash > 0 && (
                          <circle
                            cx="64"
                            cy="64"
                            r="50"
                            fill="transparent"
                            stroke="#5c6d50"
                            strokeWidth="16"
                            strokeDasharray={`${roomDash} ${circumference}`}
                            strokeDashoffset={-roomOffset}
                            className="transition-all duration-500 ease-out"
                          />
                        )}
                        {spaDash > 0 && (
                          <circle
                            cx="64"
                            cy="64"
                            r="50"
                            fill="transparent"
                            stroke="#7fa192"
                            strokeWidth="16"
                            strokeDasharray={`${spaDash} ${circumference}`}
                            strokeDashoffset={-spaOffset}
                            className="transition-all duration-500 ease-out"
                          />
                        )}
                        {foodDash > 0 && (
                          <circle
                            cx="64"
                            cy="64"
                            r="50"
                            fill="transparent"
                            stroke="#dcae68"
                            strokeWidth="16"
                            strokeDasharray={`${foodDash} ${circumference}`}
                            strokeDashoffset={-foodOffset}
                            className="transition-all duration-500 ease-out"
                          />
                        )}
                      </>
                    ) : (
                      <circle
                        cx="64"
                        cy="64"
                        r="50"
                        fill="transparent"
                        stroke="#e2e8f0"
                        strokeWidth="16"
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[9px] text-sage-400 font-bold uppercase tracking-wider">Tổng</span>
                    <span className="text-xs font-serif font-bold text-sage-950">
                      {Math.round(totalRev / 1000).toLocaleString("vi-VN")}k
                    </span>
                  </div>
                </div>

                {/* Legends */}
                <div className="flex-1 space-y-3 text-left w-full">
                  <div className="flex items-start space-x-2">
                    <span className="w-3 h-3 bg-[#5c6d50] block shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-bold text-sage-900 uppercase tracking-wide">Phòng & Gói nghỉ dưỡng</p>
                      <p className="text-xs text-sage-600 font-medium">
                        {roomRev.toLocaleString("vi-VN")} đ ({totalRev > 0 ? Math.round(roomPct * 100) : 0}%)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-3 h-3 bg-[#7fa192] block shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-bold text-sage-900 uppercase tracking-wide">Dịch vụ Spa trị liệu</p>
                      <p className="text-xs text-sage-600 font-medium">
                        {spaRev.toLocaleString("vi-VN")} đ ({totalRev > 0 ? Math.round(spaPct * 100) : 0}%)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-3 h-3 bg-[#dcae68] block shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-bold text-sage-900 uppercase tracking-wide">Thực phẩm & Bếp Resort</p>
                      <p className="text-xs text-sage-600 font-medium">
                        {foodRev.toLocaleString("vi-VN")} đ ({totalRev > 0 ? Math.round(foodPct * 100) : 0}%)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stacked Bar Chart - Monthly Trends */}
            <div className="lg:col-span-2 flex flex-col p-6 border border-primary-100 bg-[#f5f5f0]/30 relative">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xs font-bold text-sage-900 uppercase tracking-wider">
                  Doanh Thu Theo Các Tháng
                </h4>
                <div className="flex items-center space-x-4 text-[9px] text-sage-400 font-bold uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 bg-[#5c6d50] block shrink-0" />
                    <span>Phòng/Gói</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 bg-[#7fa192] block shrink-0" />
                    <span>Spa</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 bg-[#dcae68] block shrink-0" />
                    <span>Ẩm thực</span>
                  </div>
                </div>
              </div>
              
              <div className="h-44 w-full flex items-end justify-between px-2 border-b border-primary-150 pb-2 relative">
                {monthlyData.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-sage-500 font-light text-xs">
                    Chưa có dữ liệu cho năm này.
                  </div>
                ) : (
                  monthlyData.map((item, idx) => {
                    const r = item.roomRevenue || 0;
                    const s = item.spaRevenue || 0;
                    const f = item.foodRevenue || 0;
                    const tot = r + s + f;
                    const heightPercent = maxTotal > 0 ? (tot / maxTotal) * 100 : 0;
                    const isHovered = hoveredMonth === idx;
                    
                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center justify-end h-full z-10 w-[7%] group relative cursor-pointer"
                        onMouseEnter={() => setHoveredMonth(idx)}
                        onMouseLeave={() => setHoveredMonth(null)}
                      >
                        {/* Stacked Bar */}
                        <div
                          className="w-full flex flex-col justify-end bg-transparent transition-all duration-300 relative"
                          style={{ height: `${Math.max(heightPercent, 2)}%`, minHeight: "6px" }}
                        >
                          {tot > 0 ? (
                            <>
                              <div
                                style={{ height: `${(f / tot) * 100}%` }}
                                className="w-full bg-[#dcae68] transition-all"
                              />
                              <div
                                style={{ height: `${(s / tot) * 100}%` }}
                                className="w-full bg-[#7fa192] transition-all"
                              />
                              <div
                                style={{ height: `${(r / tot) * 100}%` }}
                                className="w-full bg-[#5c6d50] transition-all animate-height-grow"
                              />
                            </>
                          ) : (
                            <div className="w-full h-1 bg-sage-200" />
                          )}
                        </div>
                        {/* Month Label */}
                        <span className="text-[9px] text-sage-500 mt-1 uppercase font-mono tracking-tight whitespace-nowrap">
                          {item.label?.split("/")[0]?.replace("Tháng ", "T") || `T${idx + 1}`}
                        </span>

                        {/* Custom hover tooltip */}
                        {isHovered && tot > 0 && (
                          <div className="absolute bottom-full mb-2 bg-sage-950 text-white p-3 shadow-xl z-50 text-[10px] w-48 pointer-events-none border border-primary-800 text-left">
                            <p className="font-bold border-b border-white/20 pb-1 mb-1.5 uppercase font-serif tracking-wider">
                              {item.label}
                            </p>
                            <div className="space-y-1 font-light">
                              <div className="flex justify-between">
                                <span className="opacity-80">Gói Villa:</span>
                                <span className="font-bold text-[#b4cfa9]">{r.toLocaleString("vi-VN")} đ</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-80">Spa:</span>
                                <span className="font-bold text-[#a0cfbc]">{s.toLocaleString("vi-VN")} đ</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-80">Ẩm thực:</span>
                                <span className="font-bold text-[#ffd79d]">{f.toLocaleString("vi-VN")} đ</span>
                              </div>
                              <div className="flex justify-between border-t border-white/20 pt-1 mt-1 font-bold">
                                <span>Tổng cộng:</span>
                                <span>{tot.toLocaleString("vi-VN")} đ</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        forecastLoading ? (
          <div className="h-64 flex items-center justify-center text-sage-500 font-light text-xs">
            Đang phân tích và dự báo doanh thu bằng AI...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side: Forecast Chart (Col span 2) */}
            <div className="lg:col-span-2 flex flex-col p-6 border border-primary-100 bg-[#f5f5f0]/30 relative">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xs font-bold text-sage-900 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-[#5c6d50]" />
                  Doanh Thu Dự Báo Tương Lai
                </h4>
                <div className="flex items-center space-x-4 text-[9px] text-sage-400 font-bold uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 bg-[#5c6d50]/70 border border-[#5c6d50] border-dashed block shrink-0" />
                    <span>Dự báo Phòng</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 bg-[#7fa192]/70 border border-[#7fa192] border-dashed block shrink-0" />
                    <span>Dự báo Spa</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 bg-[#dcae68]/70 border border-[#dcae68] border-dashed block shrink-0" />
                    <span>Dự báo Ẩm thực</span>
                  </div>
                </div>
              </div>

              <div className="h-44 w-full flex items-end justify-around px-4 border-b border-primary-150 pb-2 relative">
                {!forecastData || !forecastData.forecastData || forecastData.forecastData.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-sage-500 font-light text-xs">
                    Chưa có dữ liệu dự báo.
                  </div>
                ) : (
                  (() => {
                    const fData = forecastData.forecastData;
                    const maxForecastTotal = fData.reduce((max, item) => {
                      const val = (item.roomRevenue || 0) + (item.spaRevenue || 0) + (item.foodRevenue || 0);
                      return val > max ? val : max;
                    }, 0) || 1;

                    return fData.map((item, idx) => {
                      const r = item.roomRevenue || 0;
                      const s = item.spaRevenue || 0;
                      const f = item.foodRevenue || 0;
                      const tot = r + s + f;
                      const heightPercent = (tot / maxForecastTotal) * 100;
                      const isHovered = hoveredForecastMonth === idx;

                      return (
                        <div
                          key={idx}
                          className="flex flex-col items-center justify-end h-full z-10 w-[12%] group relative cursor-pointer"
                          onMouseEnter={() => setHoveredForecastMonth(idx)}
                          onMouseLeave={() => setHoveredForecastMonth(null)}
                        >
                          {/* Stacked Bar with dashed border to signify prediction */}
                          <div
                            className="w-full flex flex-col justify-end bg-transparent transition-all duration-300 relative border border-dashed border-[#5c6d50]/40"
                            style={{ height: `${Math.max(heightPercent, 2)}%`, minHeight: "6px" }}
                          >
                            {tot > 0 ? (
                              <>
                                <div
                                  style={{ height: `${(f / tot) * 100}%` }}
                                  className="w-full bg-[#dcae68]/70 border-b border-dashed border-white/20"
                                />
                                <div
                                  style={{ height: `${(s / tot) * 100}%` }}
                                  className="w-full bg-[#7fa192]/70 border-b border-dashed border-white/20"
                                />
                                <div
                                  style={{ height: `${(r / tot) * 100}%` }}
                                  className="w-full bg-[#5c6d50]/70"
                                />
                              </>
                            ) : (
                              <div className="w-full h-1 bg-sage-200" />
                            )}
                          </div>
                          {/* Label */}
                          <span className="text-[9px] text-sage-500 font-bold mt-1.5 uppercase font-mono tracking-tight whitespace-nowrap">
                            {item.label?.split(" ")[1] || item.label}
                          </span>

                          {/* Hover Tooltip */}
                          {isHovered && tot > 0 && (
                            <div className="absolute bottom-full mb-2 bg-sage-950 text-white p-3 shadow-xl z-50 text-[10px] w-48 pointer-events-none border border-primary-800 text-left">
                              <p className="font-bold border-b border-white/20 pb-1 mb-1.5 uppercase font-serif tracking-wider flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-amber-300" />
                                {item.label} (Dự kiến)
                              </p>
                              <div className="space-y-1 font-light">
                                <div className="flex justify-between">
                                  <span className="opacity-80">Gói Villa:</span>
                                  <span className="font-bold text-[#b4cfa9]">{r.toLocaleString("vi-VN")} đ</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="opacity-80">Spa:</span>
                                  <span className="font-bold text-[#a0cfbc]">{s.toLocaleString("vi-VN")} đ</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="opacity-80">Ẩm thực:</span>
                                  <span className="font-bold text-[#ffd79d]">{f.toLocaleString("vi-VN")} đ</span>
                                </div>
                                <div className="flex justify-between border-t border-white/20 pt-1 mt-1 font-bold text-amber-300">
                                  <span>Tổng dự kiến:</span>
                                  <span>{tot.toLocaleString("vi-VN")} đ</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()
                )}
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[9px] bg-primary-100/70 border border-primary-200 text-[#5c6d50] px-2 py-0.5 font-semibold font-mono tracking-wide uppercase">
                  Phương pháp: {forecastData?.methodUsed || "AI Engine"}
                </span>
                <span className="text-[9px] text-sage-400 italic">
                  * Thể hiện dưới dạng cột đứt nét để phân biệt với dữ liệu thực tế
                </span>
              </div>
            </div>

            {/* Right side: AI Analysis */}
            <div className="flex flex-col p-6 border border-sage-200/60 bg-[#5c6d50]/5 relative justify-between">
              <div>
                <h4 className="text-xs font-bold text-sage-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#5c6d50]" />
                  Đánh Giá Xu Hướng AI
                </h4>
                <div className="text-xs text-sage-800 leading-relaxed font-light text-left overflow-y-auto max-h-48 pr-1 custom-scrollbar">
                  {forecastData?.aiAnalysis ? (
                    <p className="whitespace-pre-line italic">
                      "{forecastData.aiAnalysis}"
                    </p>
                  ) : (
                    <p className="text-sage-400 italic">
                      Không có phân tích từ AI khả dụng.
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-sage-200/40 text-[9px] text-sage-450 uppercase font-mono tracking-wider text-left">
                Hệ thống phân tích Ngũ Sơn
              </div>
            </div>
          </div>
        )
      )}</div>

      {/* Active alerts log feed */}
      <div className="bg-white border border-primary-100 p-6 space-y-4">
        <h3 className="font-serif text-sm font-bold text-sage-950 uppercase tracking-wider mb-2">
          Cảnh Báo Vận Hành
        </h3>
        <div className="space-y-3">
          {activeWarnings.length === 0 ? (
            <p className="text-xs text-sage-450 italic">Không có cảnh báo vận hành nào cần xử lý.</p>
          ) : (
            activeWarnings.map((w) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

