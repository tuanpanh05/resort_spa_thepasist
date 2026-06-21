import React from "react";
import { radius } from "../../styles/designSystem";

export default function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  className = "",
}) {
  return (
    <div
      className={`bg-white p-6 border border-primary-100 flex flex-col justify-between ${radius.card} ${className}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-sage-400 font-bold uppercase tracking-wider">
          {title}
        </p>
        {Icon && (
          <div className="p-2 bg-primary-50 text-primary-700">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="flex items-baseline space-x-1 mt-2">
        <span className="text-xl font-serif font-bold text-sage-950">
          {value}
        </span>
        {change && (
          <span
            className={`text-[10px] font-medium ${
              changeType === "positive"
                ? "text-green-700"
                : changeType === "negative"
                  ? "text-red-700"
                  : "text-sage-500"
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
