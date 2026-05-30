import React from "react";
import StatCard from "../ui/StatCard";

export default function AdminStats({
  occupiedRoomsCount,
  totalRoomsCount,
  occupancyRate,
  activeStaff,
  warningsCount,
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 text-left">
      <StatCard
        title="Doanh thu ngày"
        value="15,650k"
        change="+12%"
        changeType="positive"
      />
      <StatCard
        title="Booking mới"
        value="4 đơn"
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
