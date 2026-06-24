import React from "react";
import StatCard from "../ui/StatCard";

export default function AdminStats({
  occupiedRoomsCount,
  totalRoomsCount,
  occupancyRate,
  activeStaff,
  warningsCount,
  todayRevenue = 0,
  newBookingsCount = 0,
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 text-left">
      <StatCard
        title="Doanh thu ngày"
        value={todayRevenue > 0 ? `${Math.round(todayRevenue / 1000).toLocaleString("vi-VN")}k` : "0 đ"}
        change={todayRevenue > 0 ? "+100%" : "0%"}
        changeType={todayRevenue > 0 ? "positive" : "neutral"}
      />
      <StatCard
        title="Booking mới"
        value={`${newBookingsCount} đơn`}
        change="Hôm nay"
        changeType="neutral"
      />
      <StatCard
        title="Phòng đang ở"
        value={occupiedRoomsCount}
        change={`/ ${totalRoomsCount} phòng (${occupancyRate}%)`}
        changeType="neutral"
      />
      <StatCard
        title="Nhân sự trực"
        value={`${activeStaff} staff`}
        change="Ca sáng/tối"
        changeType="neutral"
      />
      <StatCard
        title="Cảnh báo hệ thống"
        value={`${warningsCount} ca`}
        change="Cần xử lý"
        changeType="negative"
        className="col-span-2 lg:col-span-1"
      />
    </div>
  );
}
