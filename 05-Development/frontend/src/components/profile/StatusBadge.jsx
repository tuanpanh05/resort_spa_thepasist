import React from "react";

export const ROOM_STATUS_MAP = {
  PENDING:     { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-800 border-amber-200" },
  CONFIRMED:   { label: "Đã xác nhận",  color: "bg-blue-100 text-blue-800 border-blue-200" },
  CHECKED_IN:  { label: "Đã nhận phòng", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  CHECKED_OUT: { label: "Đã trả phòng", color: "bg-gray-100 text-gray-600 border-gray-200" },
  CANCELLED:   { label: "Đã huỷ",       color: "bg-red-100 text-red-700 border-red-200" },
};

export const SPA_STATUS_MAP = {
  PENDING:    { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-800 border-amber-200" },
  CONFIRMED:  { label: "Đã xác nhận",  color: "bg-blue-100 text-blue-800 border-blue-200" },
  COMPLETED:  { label: "Hoàn thành",   color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  CANCELLED:  { label: "Đã huỷ",       color: "bg-red-100 text-red-700 border-red-200" },
  NO_SHOW:    { label: "Không đến",    color: "bg-gray-100 text-gray-500 border-gray-200" },
};

export const FOOD_STATUS_MAP = {
  PENDING:   { label: "Chờ xác nhận",  color: "bg-amber-100 text-amber-800 border-amber-200" },
  PREPARING: { label: "Đang chế biến", color: "bg-blue-100 text-blue-800 border-blue-200 animate-pulse" },
  READY:     { label: "Đang giao món", color: "bg-purple-100 text-purple-800 border-purple-200 animate-pulse" },
  DELIVERED: { label: "Đã giao món",   color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  CANCELLED: { label: "Đã huỷ",       color: "bg-red-100 text-red-700 border-red-200" },
};

export default function StatusBadge({ status, map }) {
  const { label, color } = map[status] || { label: status, color: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[11px] font-semibold border ${color}`}>
      {label}
    </span>
  );
}
