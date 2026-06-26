import React from "react";
import { Check } from "lucide-react";

export default function BookingWizardHeader({ step, bookingStatus }) {
  if (bookingStatus === "CONFIRMED") return null;

  const steps = [
    { number: 1, label: "Thông tin khách" },
    { number: 2, label: "Hồ sơ sức khỏe" },
    { number: 3, label: "Chọn Villa & Dịch vụ" },
    { number: 4, label: "Chọn Combo Ẩm Thực" },
    { number: 5, label: "Xác nhận đơn" },
  ];

  return (
    <div className="mb-12 max-w-4xl mx-auto">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#cda250]/15 z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#cda250] transition-all duration-500 z-0"
          style={{ width: `${((step - 1) / 4) * 100}%` }}
        />

        {/* Step indicator node points */}
        {steps.map((s) => {
          const isActive = step >= s.number;
          const isCurrent = step === s.number;
          return (
            <div key={s.number} className="flex flex-col items-center z-10">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center font-serif font-semibold text-xs transition-all duration-300 ${
                  isActive
                    ? "bg-[#cda250] text-[#070e0a] border-2 border-[#cda250]"
                    : "bg-white text-sage-400 border-2 border-primary-100/50"
                } ${isCurrent ? "scale-110 shadow-[0_0_15px_rgba(205,162,80,0.4)] ring-4 ring-[#cda250]/20 font-bold" : ""}`}
              >
                {step > s.number ? <Check className="h-4 w-4 stroke-[3px]" /> : s.number}
              </div>
              <span
                className={`mt-2.5 text-resort-stepper transition-colors duration-300 hidden md:block ${
                  isActive ? "text-[#1a2f23] font-medium" : "text-sage-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
