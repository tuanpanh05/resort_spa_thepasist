import React from "react";
import { Link } from "react-router-dom";
import { Leaf, CalendarDays, ShieldCheck, Compass } from "lucide-react";
import { radius, shadows } from "../styles/designSystem";

export default function BookingForm() {
  return (
    <section
      id="booking"
      className="py-28 bg-gradient-to-b from-[#f8faf7] to-[#f0f5ee] relative overflow-hidden"
    >
      {/* Decorative organic blurry ambient lights */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary-200/25 rounded-full filter blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute -bottom-20 right-0 w-96 h-96 bg-primary-150/35 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 sm:px-8 relative z-10 text-center">
        {/* Section Header */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <span className="text-xs font-semibold tracking-[0.25em] text-primary-800 bg-primary-200/50 px-4 py-2 uppercase inline-block">
            Đặt lịch & Trải nghiệm
          </span>
          
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-sage-950 leading-tight">
            Khởi Đầu Hành Trình Chữa Lành
          </h2>

          {/* Leaf Elegant Divider */}
          <div className="flex items-center justify-center space-x-3 py-2">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary-300" />
            <Leaf className="h-4 w-4 text-primary-600/80" />
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary-300" />
          </div>

          <p className="text-sage-800 font-light text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Lên lịch trình trị liệu chuyên sâu, thiền định rừng thông và chọn biệt thự nghỉ dưỡng mộc mạc lý tưởng của bạn chỉ trong 4 bước đơn giản cùng Bộ trình Đặt phòng thông minh của Ngũ Sơn.
          </p>

          {/* CTA Actions */}
          <div className="pt-8">
            <Link
              to="/dat-lich"
              className="inline-flex items-center justify-center px-10 py-4.5 bg-primary-800 text-white text-xs font-semibold tracking-widest uppercase rounded-none hover:bg-primary-900 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <CalendarDays className="h-4 w-4 mr-2 group-hover:rotate-[8deg] transition-transform" />
              Đặt phòng & Liệu trình ngay
            </Link>
          </div>
          
          {/* Reassurance benefits bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 max-w-2xl mx-auto text-xs text-sage-500 font-medium border-t border-primary-200/35">
            <div className="flex items-center justify-center space-x-2">
              <ShieldCheck className="h-4.5 w-4.5 text-primary-600 flex-shrink-0" />
              <span>Bảo mật giao dịch tuyệt đối</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Compass className="h-4.5 w-4.5 text-primary-600 flex-shrink-0" />
              <span>Cá nhân hóa liệu trình trị liệu</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Leaf className="h-4.5 w-4.5 text-primary-600 flex-shrink-0" />
              <span>Hoàn hủy phòng linh hoạt 48h</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
