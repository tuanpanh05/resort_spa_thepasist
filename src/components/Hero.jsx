import React from 'react';
import { Calendar, Flower2, Armchair, ChevronDown } from 'lucide-react';

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with blur effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
        style={{ 
          backgroundImage: "url('/hero_bg.png')",
        }}
      />
      {/* Dark overlay with green tint */}
      <div className="absolute inset-0 bg-hero-overlay" />

      {/* Decorative Blur Spheres for ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200/25 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-300/15 rounded-full filter blur-3xl" />

      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white z-10 pt-24">
        <span className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-primary-200 uppercase tracking-widest mb-6 animate-fade-in">
          <span className="w-1.5 h-1.5 bg-primary-300 rounded-full animate-ping" />
          Khu Nghỉ Dưỡng Trị Liệu Thiên Nhiên
        </span>

        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 animate-slide-up leading-tight drop-shadow-md text-white">
          Ngũ Sơn Resort
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-primary-50/90 font-light mb-10 leading-relaxed animate-slide-up drop-shadow-sm">
          Tìm lại sự cân bằng hoàn hảo cho Thân – Tâm – Trí trong không gian xanh nguyên bản, 
          hòa quyện cùng các liệu trình spa thảo dược, yoga thiền định và vật lý trị liệu chuyên sâu.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-slide-up">
          <a
            href="#booking"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-bold bg-[#233827]/95 text-white hover:bg-[#304d35] transition-all duration-300 shadow-lg border border-white/15 hover:scale-105 cursor-pointer"
          >
            <Calendar className="mr-2 h-5 w-5 text-primary-200" /> Đặt lịch trải nghiệm
          </a>
          <a
            href="#services"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-semibold bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 transition-all duration-300"
          >
            Tìm hiểu dịch vụ
          </a>
        </div>

        {/* Highlight Stats (Floating Glassmorphism cards) */}
        <div className="hidden lg:grid grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto animate-fade-in">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 text-left flex items-start space-x-4">
            <div className="p-3 bg-primary-200/10 rounded-xl text-primary-200">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-white">Xanh Nguyên Bản</h3>
              <p className="text-sm text-primary-100/70 mt-1 font-light">Không gian bảo tồn thiên nhiên ôm trọn cơ thể</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 text-left flex items-start space-x-4">
            <div className="p-3 bg-primary-200/10 rounded-xl text-primary-200">
              <Flower2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-white">Liệu Trình Tự Nhiên</h3>
              <p className="text-sm text-primary-100/70 mt-1 font-light">Kích hoạt khả năng tự chữa lành tự nhiên</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 text-left flex items-start space-x-4">
            <div className="p-3 bg-primary-200/10 rounded-xl text-primary-200">
              <Armchair className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-white">Nghỉ Dưỡng Khép Kín</h3>
              <p className="text-sm text-primary-100/70 mt-1 font-light">Tiện nghi tối giản nâng niu từng giác quan</p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-primary-200/70 text-xs tracking-widest uppercase cursor-pointer hover:text-white transition-colors duration-200">
          <span className="mb-2">Cuộn xuống</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
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
