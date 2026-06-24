import React from "react";
import { useLanguage } from "../../context/LanguageContext";

export const ROOM_STATUS_MAP = {
  PENDING:     { labelKey: "profile.statusPending", color: "bg-amber-100 text-amber-800 border-amber-200" },
  CONFIRMED:   { labelKey: "profile.statusConfirmed",  color: "bg-blue-100 text-blue-800 border-blue-200" },
  CHECKED_IN:  { labelKey: "profile.statusCheckedIn", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  CHECKED_OUT: { labelKey: "profile.statusCheckedOut", color: "bg-gray-100 text-gray-600 border-gray-200" },
  CANCELLED:   { labelKey: "profile.statusCancelled",       color: "bg-red-100 text-red-700 border-red-200" },
};

export const SPA_STATUS_MAP = {
  PENDING:    { labelKey: "profile.statusPending", color: "bg-amber-100 text-amber-800 border-amber-200" },
  CONFIRMED:  { labelKey: "profile.statusConfirmed",  color: "bg-blue-100 text-blue-800 border-blue-200" },
  COMPLETED:  { labelKey: "profile.statusCompleted",   color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  CANCELLED:  { labelKey: "profile.statusCancelled",       color: "bg-red-100 text-red-700 border-red-200" },
  NO_SHOW:    { labelKey: "profile.statusNoShow",    color: "bg-gray-100 text-gray-500 border-gray-200" },
};

export const FOOD_STATUS_MAP = {
  PENDING:   { labelKey: "profile.statusPending",  color: "bg-amber-100 text-amber-800 border-amber-200" },
  PREPARING: { labelKey: "profile.statusPreparing", color: "bg-blue-100 text-blue-800 border-blue-200 animate-pulse" },
  READY:     { labelKey: "profile.statusReady", color: "bg-purple-100 text-purple-800 border-purple-200 animate-pulse" },
  DELIVERED: { labelKey: "profile.statusDelivered",   color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  CANCELLED: { labelKey: "profile.statusCancelled",       color: "bg-red-100 text-red-700 border-red-200" },
};

export default function StatusBadge({ status, map }) {
  const { t } = useLanguage();
  const entry = map[status] || { label: status, color: "bg-gray-100 text-gray-600 border-gray-200" };
  const label = entry.labelKey ? t(entry.labelKey) : entry.label;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[11px] font-semibold border ${entry.color}`}>
      {label}
    </span>
  );
}
