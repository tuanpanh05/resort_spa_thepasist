import React from "react";
import { Check } from "lucide-react";

export default function BookingWizardHeader({ step, bookingStatus }) {
  if (bookingStatus === "CONFIRMED") return null;

  const steps = [
    { number: 1, label: "Thông tin khách" },
    { number: 2, label: "Hồ sơ sức khỏe" },
    { number: 3, label: "Chọn Villa & Dịch vụ" },
    { number: 4, label: "Thực đơn trong gói" },
    { number: 5, label: "Xác nhận đơn" },
    { number: 6, label: "Thanh toán cọc" },
  ];

  return (
    <div className="mb-12 max-w-4xl mx-auto">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary-100 z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary-600 transition-all duration-500 z-0"
          style={{ width: `${((step - 1) / 5) * 100}%` }}
        />

        {/* Step indicator node points */}
        {steps.map((s) => {
          const isActive = step >= s.number;
          const isCurrent = step === s.number;
          return (
            <div key={s.number} className="flex flex-col items-center z-10">
              <div
                className={`h-9 w-9 flex items-center justify-center font-semibold text-xs transition-all duration-300 ${
                  isActive
                    ? "bg-primary-800 text-white border-2 border-primary-800"
                    : "bg-white text-sage-400 border-2 border-primary-100"
                } ${isCurrent ? "scale-110 shadow-md ring-4 ring-primary-100" : ""}`}
              >
                {step > s.number ? <Check className="h-4 w-4" /> : s.number}
              </div>
              <span
                className={`mt-2.5 text-resort-stepper transition-colors duration-300 hidden md:block ${
                  isActive ? "text-sage-950 font-medium" : "text-sage-400"
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
