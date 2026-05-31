import React from "react";
import heroBg from "../assets/hero_bg.png";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with blur effect */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
        style={{
          backgroundImage: `url(${heroBg})`,
        }}
      />
      {/* Dark overlay with green tint */}
      <div className="absolute inset-0 bg-hero-overlay" />

      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-6 sm:px-8 text-center text-white z-10 pt-32">
        <span className="block text-xs sm:text-sm font-semibold tracking-[0.25em] text-primary-200 uppercase mb-6 animate-fade-in">
          Khu Nghỉ Dưỡng Trị Liệu Thiên Nhiên
        </span>

        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-normal tracking-wide mb-8 animate-slide-up leading-tight text-white drop-shadow-sm">
          Ngũ Sơn Resort
        </h1>

        <p className="max-w-xl mx-auto text-sm sm:text-base md:text-lg text-white/80 font-light mb-12 leading-relaxed tracking-wide animate-slide-up">
          Tìm lại sự cân bằng hoàn hảo cho Thân – Tâm – Trí trong không gian
          xanh nguyên bản, hòa quyện cùng các liệu trình spa thảo dược, yoga
          thiền định và vật lý trị liệu chuyên sâu.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 animate-slide-up">
          <a
            href="#booking"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-none text-xs font-semibold tracking-widest bg-white text-primary-950 hover:bg-white/90 transition-all duration-300 uppercase cursor-pointer"
          >
            Đặt lịch trải nghiệm
          </a>
          <a
            href="#services"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-none text-xs font-semibold tracking-widest border border-white/40 text-white hover:bg-white/10 transition-all duration-300 uppercase"
          >
            Tìm hiểu dịch vụ
          </a>
        </div>
      </div>
    </section>
  );
}

// Simple Helper Leaf Icon for this file
function Leaf(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 2 8a7 7 0 0 1-10 10Z" />
      <path d="M9.8 6.1C10.5 9 12 11.5 15 13" />
    </svg>
  );
}
