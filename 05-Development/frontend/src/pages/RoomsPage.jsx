import React, { useState } from "react";
import {
  Maximize,
  User,
  Coffee,
  ArrowRight,
  Grid,
  Home,
  Users,
  Sparkles,
  Info,
  Calendar,
  Crown,
  Compass,
  Feather,
} from "lucide-react";

import {
  roomsPageAllRooms as allRooms,
  roomsPageCategories as categories,
} from "../mockData";

export default function RoomsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  // Map starting prices based on category for luxury feel
  const getStartingPrice = (category) => {
    if (category.includes("Bungalow")) return "1.800.000 ₫";
    if (category.includes("Villa")) return "3.600.000 ₫";
    return "9.000.000 ₫"; // Group/Collective
  };

  const filteredRooms = allRooms.filter((room) => {
    return selectedCategory === "Tất cả" || room.category === selectedCategory;
  });

  // Custom ScrollReveal effect hook component inside page
  const ScrollReveal = ({ children, delay = 0 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = React.useRef(null);

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        },
        { threshold: 0.08 }
      );
      if (ref.current) observer.observe(ref.current);
      return () => {
        if (ref.current) observer.unobserve(ref.current);
      };
    }, []);

    return (
      <div
        ref={ref}
        className={`transition-all duration-1000 transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </div>
    );
  };

  return (
    <div className="bg-[#faf8f5] text-[#1a2f23] min-h-screen font-sans overflow-x-hidden selection:bg-[#cda250] selection:text-[#070e0a]">
      
      {/* Fixed Side Vertical Index (Luxury Lookbook Index) */}
      <div className="hidden xl:flex fixed left-8 top-1/2 -translate-y-1/2 z-50 flex-col gap-8 text-[9px] font-bold text-[#b28a50]/50 uppercase tracking-[0.25em] pointer-events-none">
        <div className="flex items-center gap-3 rotate-90 origin-left translate-x-2.5">
          <span className="w-8 h-[1px] bg-[#cda250]/40" />
          <span>01 // KHÔNG GIAN</span>
        </div>
        <div className="flex items-center gap-3 rotate-90 origin-left translate-x-2.5 mt-16">
          <span className="w-8 h-[1px] bg-[#cda250]/40" />
          <span>02 // HẠNG PHÒNG</span>
        </div>
        <div className="flex items-center gap-3 rotate-90 origin-left translate-x-2.5 mt-16">
          <span className="w-8 h-[1px] bg-[#cda250]/40" />
          <span>03 // BẢNG SO SÁNH</span>
        </div>
        <div className="flex items-center gap-3 rotate-90 origin-left translate-x-2.5 mt-16">
          <span className="w-8 h-[1px] bg-[#cda250]/40" />
          <span>04 // REVIEW</span>
        </div>
      </div>

      {/* 1. Parallax Cinematic Hero Banner with Double Gold Borders */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-32 border-b border-[#cda250]/15">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 transition-transform duration-[15000ms] scale-105"
          style={{ backgroundImage: `url('/resort_spa_hero_bg.png')` }}
        />
        {/* Soft Warm Ivory Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f5]/20 via-[#faf8f5]/75 to-[#faf8f5]" />
        
        {/* Double luxury thin gold wire frames */}
        <div className="absolute inset-x-6 inset-y-10 border border-[#cda250]/20 pointer-events-none rounded-[36px]" />
        <div className="absolute inset-x-10 inset-y-14 border border-[#cda250]/10 pointer-events-none rounded-[28px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#b28a50] bg-white border border-[#cda250]/25 px-5 py-2.5 rounded-full shadow-md shadow-[#cda250]/5">
              <Crown className="h-3 w-3 text-[#b28a50] animate-pulse" />
              Ngũ Sơn Signature Living
            </span>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-8xl font-light tracking-wide text-[#1a2f23] leading-tight">
              KHÔNG GIAN NGHỈ DƯỠNG <br/>
              <span className="italic font-serif text-[#cda250] font-normal">Độc Bản & Trị Liệu</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="w-20 h-[1px] bg-[#cda250]/40 mx-auto my-8" />
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <p className="text-sage-700 font-sans text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light tracking-wide opacity-90">
              Được kiến tạo từ nguồn cảm hứng sâu sắc với thiên nhiên rừng núi, từng căn Bungalow mộc mạc bên suối hay các Biệt thự đồi trà biệt lập đều mở ra hành trình chữa lành, cân bằng trọn vẹn thân - tâm - trí.
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* 2. Minimalist Text Tabs Category Filter (Sticky header) */}
      <div className="bg-[#faf8f5]/90 border-b border-[#cda250]/15 py-6 sticky top-[72px] z-40 transition-all duration-300 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-8 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative py-2 text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer ${
                    active ? "text-[#b28a50]" : "text-sage-500/80 hover:text-[#1a2f23]"
                  }`}
                >
                  <span>{cat}</span>
                  <span 
                    className={`absolute bottom-0 left-0 h-[1.5px] bg-[#cda250] transition-all duration-300 ${
                      active ? "w-full" : "w-0"
                    }`} 
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Catalog-Style Luxury Showcase List (Overlapping Lookbook layout) */}
      <div className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-40">
            {filteredRooms.map((room, index) => {
              const isEven = index % 2 === 0;
              const formattedNumber = String(index + 1).padStart(2, "0");
              return (
                <ScrollReveal key={index}>
                  <div className={`flex flex-col lg:flex-row items-stretch ${isEven ? "" : "lg:flex-row-reverse"} relative`}>
                    
                    {/* Background Serif Numbering behind overlap card */}
                    <span className="hidden lg:block absolute -top-12 left-1/2 -translate-x-1/2 font-serif text-[180px] font-bold text-[#cda250]/10 select-none pointer-events-none">
                      {formattedNumber}
                    </span>

                    {/* Image Column: 65% width with zoom and organic curves */}
                    <div className="w-full lg:w-[65%] rounded-tl-[100px] rounded-br-[100px] rounded-tr-[24px] rounded-bl-[24px] overflow-hidden shadow-xl relative min-h-[420px] lg:min-h-[500px] flex items-stretch border border-[#cda250]/15 group z-0">
                      <img
                        src={room.image}
                        alt={room.title}
                        className="w-full h-full min-h-[420px] object-cover transition-transform duration-[8000ms] group-hover:scale-105"
                      />
                      {/* Light gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f5]/85 via-transparent to-transparent pointer-events-none" />
                      
                      {/* Floating luxurious tags */}
                      <span className="absolute top-6 left-6 text-[9px] font-semibold uppercase tracking-[0.25em] bg-white/90 backdrop-blur-md text-[#b28a50] border border-[#cda250]/20 px-5 py-2.5 rounded-full shadow-md">
                        {room.category}
                      </span>
                      
                      <span className="absolute bottom-6 right-6 text-[10px] font-medium tracking-wide bg-white/95 backdrop-blur-md text-[#1a2f23] px-5 py-2.5 rounded-md border border-[#cda250]/15 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#cda250] animate-pulse" />
                        {room.amenity}
                      </span>
                    </div>

                    {/* Overlapping Content Column: floats and overlaps the image */}
                    <div className={`w-full lg:w-[48%] bg-white/95 backdrop-blur-xl border border-[#cda250]/20 p-8 sm:p-12 shadow-[0_30px_70px_rgba(26,44,34,0.06)] rounded-2xl z-10 flex flex-col justify-between space-y-8 lg:self-center ${
                      isEven ? "lg:-ml-24" : "lg:-mr-24"
                    }`}>
                      <div className="space-y-6">
                        <span className="text-[10px] font-bold text-[#b28a50] uppercase tracking-[0.25em] bg-[#faf8f5] border border-[#cda250]/20 px-3 py-1.5 rounded inline-flex items-center gap-1.5">
                          <Crown className="h-3.5 w-3.5 text-[#b28a50]" />
                          Ngũ Sơn Living Suite
                        </span>
                        
                        <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#1a2f23] tracking-wide leading-tight border-b border-[#cda250]/15 pb-4">
                          {room.title}
                        </h2>

                        <p className="text-sage-700 font-sans text-sm leading-relaxed font-light tracking-wide opacity-95">
                          {room.description}
                        </p>

                        {/* Wellness Menu Specifications (Refined spec lines instead of badges) */}
                        <div className="grid grid-cols-3 gap-6 pt-4 border-b border-[#cda250]/15 pb-6">
                          <div className="space-y-1">
                            <span className="text-[8px] text-sage-400 font-bold uppercase tracking-[0.15em] block">Không gian</span>
                            <span className="font-serif text-base text-[#1a2f23] font-light">{room.size}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[8px] text-sage-400 font-bold uppercase tracking-[0.15em] block">Sức chứa</span>
                            <span className="font-serif text-base text-[#1a2f23] font-light">{room.capacity}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[8px] text-sage-400 font-bold uppercase tracking-[0.15em] block">Phương pháp</span>
                            <span className="font-serif text-base text-[#1a2f23] font-light">Trị liệu</span>
                          </div>
                        </div>

                        {/* Spacious Wellness Menu List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 text-xs text-left">
                          <div className="space-y-3">
                            <span className="text-[9px] text-[#b28a50] font-bold uppercase tracking-[0.2em] block pl-2 border-l border-[#cda250]">
                              Tiện ích đi kèm
                            </span>
                            <ul className="space-y-2 text-sage-600 font-light pl-2">
                              <li className="flex items-center gap-2">• Bồn tắm khoáng nóng gỗ Hinoki</li>
                              <li className="flex items-center gap-2">• Ban công thông xanh viễn cảnh</li>
                              <li className="flex items-center gap-2">• Hồ khoáng tràn đồi riêng biệt</li>
                            </ul>
                          </div>

                          <div className="space-y-3">
                            <span className="text-[9px] text-[#b28a50] font-bold uppercase tracking-[0.2em] block pl-2 border-l border-[#cda250]">
                              Liệu trình trị liệu
                            </span>
                            <ul className="space-y-2 text-sage-600 font-light pl-2">
                              <li className="flex items-center gap-2">• Lớp Thiền & Yoga tĩnh tâm sáng</li>
                              <li className="flex items-center gap-2">• Nước kiềm hydro đào thải độc</li>
                              <li className="flex items-center gap-2">• Trà an thần hữu cơ thảo mộc</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Pricing and Lookbook Action */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 pt-6 border-t border-[#cda250]/15">
                        <div className="text-left flex flex-col justify-center">
                          <span className="text-[9px] text-[#b28a50] font-bold uppercase tracking-[0.2em]">Báo giá trọn gói</span>
                          <span className="text-xl font-serif text-[#1a2f23] font-light tracking-wide mt-1">
                            Giá từ {getStartingPrice(room.category)} <span className="text-[11px] text-sage-500 font-sans font-light">/ đêm</span>
                          </span>
                        </div>
                        
                        <a
                          href="/dat-lich"
                          className="px-8 py-4 text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-[#cda250] to-[#b1893c] text-[#070e0a] hover:from-[#d9b360] hover:to-[#c29a4a] transition-all duration-300 shadow-md shadow-[#cda250]/10 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer group"
                        >
                          <span>Yêu cầu báo giá</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </a>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Room Comparison Matrix Section */}
      <div className="bg-[#f4f2ec] py-32 border-t border-b border-[#cda250]/15 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-20 relative z-10">
          <ScrollReveal>
            <div className="max-w-xl mx-auto space-y-4">
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#b28a50] uppercase block">So Sánh Đặc Quyền</span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1a2f23] leading-tight">Lựa Chọn Không Gian Phù Hợp</h2>
              <div className="w-12 h-[1px] bg-[#cda250]/30 mx-auto mt-4" />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="overflow-x-auto shadow-xl rounded-2xl border border-[#cda250]/15 bg-white/80 backdrop-blur-md">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#faf8f5] text-[#b28a50] font-bold uppercase tracking-wider border-b border-[#cda250]/15">
                    <th className="p-6 font-serif text-sm">Hạng phòng / Villa</th>
                    <th className="p-6">Diện tích</th>
                    <th className="p-6">Sức chứa tối đa</th>
                    <th className="p-6">Bồn tắm / Trị liệu</th>
                    <th className="p-6">Hồ bơi riêng</th>
                    <th className="p-6">Đặc trưng tầm nhìn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cda250]/15 font-sans tracking-wide text-sage-700">
                  <tr className="hover:bg-[#faf8f5]/50 transition-colors">
                    <td className="p-6 font-bold text-[#1a2f23] text-sm">Bungalow Hướng Suối / Rừng</td>
                    <td className="p-6 font-mono">65 - 75 m²</td>
                    <td className="p-6">2 Người lớn</td>
                    <td className="p-6">Bồn gỗ Hinoki lộ thiên ngoài trời</td>
                    <td className="p-6">Không có (Hồ bơi tràn chung)</td>
                    <td className="p-6 text-[#b28a50] font-semibold">Khe suối tự nhiên hoặc sườn rừng thông</td>
                  </tr>
                  <tr className="hover:bg-[#faf8f5]/50 transition-colors">
                    <td className="p-6 font-bold text-[#1a2f23] text-sm">Biệt Thự Đồi Trà / Sen Trắng</td>
                    <td className="p-6 font-mono">120 - 180 m²</td>
                    <td className="p-6">4 - 8 Người lớn</td>
                    <td className="p-6">Hồ khoáng nóng mini & Yoga deck riêng</td>
                    <td className="p-6">Có (Hồ bơi khoáng tràn viền riêng)</td>
                    <td className="p-6 text-[#b28a50] font-semibold">Tầm nhìn 360 độ đỉnh đồi trà hoặc hồ sen</td>
                  </tr>
                  <tr className="hover:bg-[#faf8f5]/50 transition-colors">
                    <td className="p-6 font-bold text-[#1a2f23] text-sm">Nhà Sàn / Biệt Thự Tập Thể</td>
                    <td className="p-6 font-mono">110 - 320 m²</td>
                    <td className="p-6">8 - 30 Người lớn</td>
                    <td className="p-6">Khu thiền chung & bồn khoáng lớn</td>
                    <td className="p-6">Tùy hạng biệt thự view hồ</td>
                    <td className="p-6 text-[#b28a50] font-semibold">Rừng thông bạt ngàn hoặc mặt hồ yên ả</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* 5. Luxury Testimonial Letters (Hand-written styled) */}
      <div className="py-32 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-20">
          <ScrollReveal>
            <div className="max-w-xl mx-auto space-y-4">
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#b28a50] uppercase block">Trải Nghiệm Thực Tế</span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1a2f23] leading-tight">Chia Sẻ Từ Khách Lưu Trú</h2>
              <div className="w-12 h-[1px] bg-[#cda250]/30 mx-auto mt-4" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
            <ScrollReveal delay={100}>
              <div className="p-10 bg-white border border-[#cda250]/15 rounded-3xl relative shadow-xl backdrop-blur-sm group hover:border-[#cda250]/35 transition-all duration-300">
                <span className="text-5xl text-[#cda250]/15 font-serif absolute top-4 right-8">“</span>
                <div className="space-y-6">
                  <p className="text-sm text-sage-650 font-light italic leading-relaxed tracking-wide">
                    "Mọi chi tiết trong Bungalow gỗ hướng suối đều toát lên vẻ tinh tế, mộc mạc và sang trọng. Nằm ngâm mình trong bồn Hinoki thơm lừng ngoài trời nghe tiếng suối róc rách, sương mai lùa qua ô cửa kính mang lại cảm giác bình yên đến lạ kỳ mà không resort nào có được."
                  </p>
                  <div className="border-t border-[#cda250]/10 pt-4 flex justify-between items-center text-[10px]">
                    <span className="font-bold text-[#1a2f23] uppercase tracking-wider">Chị Khánh Chi</span>
                    <span className="text-sage-400 font-mono">Bungalow 101 • 05/2026</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="p-10 bg-white border border-[#cda250]/15 rounded-3xl relative shadow-xl backdrop-blur-sm group hover:border-[#cda250]/35 transition-all duration-300">
                <span className="text-5xl text-[#cda250]/15 font-serif absolute top-4 right-8">“</span>
                <div className="space-y-6">
                  <p className="text-sm text-sage-650 font-light italic leading-relaxed tracking-wide">
                    "Chúng tôi tổ chức kỳ nghỉ teambuilding cho công ty tại khu Nhà sàn Đông Sơn. Kiến trúc trần tre gỗ cao rộng mát mẻ, đệm nằm êm ái organic sạch sẽ. Buổi tối đốt lửa trại giữa ngút ngàn thông reo là kỉ niệm vô cùng tuyệt vời cho toàn phòng ban."
                  </p>
                  <div className="border-t border-[#cda250]/10 pt-4 flex justify-between items-center text-[10px]">
                    <span className="font-bold text-[#1a2f23] uppercase tracking-wider">Anh Hoàng Minh</span>
                    <span className="text-sage-400 font-mono">Nhà sàn 501 • 06/2026</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* 6. Minimalist fine-line Workflow Steps */}
      <div className="bg-[#f4f2ec] py-32 text-center border-t border-[#cda250]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          <ScrollReveal>
            <div className="max-w-xl mx-auto space-y-4">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#b28a50] uppercase block">Đặt Phòng Đơn Giản</span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1a2f23] leading-tight">Quy Trình Liên Hệ Trực Quan</h2>
              <div className="w-12 h-[1px] bg-[#cda250]/30 mx-auto mt-4" />
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10 text-center">
            <ScrollReveal delay={100}>
              <div className="space-y-4 group">
                <div className="w-12 h-12 rounded-full bg-white text-[#b28a50] border border-[#cda250]/40 flex items-center justify-center font-bold font-mono text-sm mx-auto shadow-md group-hover:border-[#cda250] transition-colors duration-300">01</div>
                <h5 className="font-sans text-xs font-bold text-[#1a2f23] uppercase tracking-wider">Chọn Hạng Phòng</h5>
                <p className="text-xs text-sage-600 font-light leading-relaxed max-w-xs mx-auto">
                  Tham khảo danh sách phòng đôi, biệt thự đồi trà hoặc khu nhà sàn lớn phù hợp với nhu cầu.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="space-y-4 group">
                <div className="w-12 h-12 rounded-full bg-white text-[#b28a50] border border-[#cda250]/40 flex items-center justify-center font-bold font-mono text-sm mx-auto shadow-md group-hover:border-[#cda250] transition-colors duration-300">02</div>
                <h5 className="font-sans text-xs font-bold text-[#1a2f23] uppercase tracking-wider">Gửi Thông Tin Yêu Cầu</h5>
                <p className="text-xs text-sage-600 font-light leading-relaxed max-w-xs mx-auto">
                  Click nút "Nhận tư vấn báo giá" để gửi thông tin về đoàn khách và thời gian mong muốn nghỉ dưỡng.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="space-y-4 group">
                <div className="w-12 h-12 rounded-full bg-white text-[#b28a50] border border-[#cda250]/40 flex items-center justify-center font-bold font-mono text-sm mx-auto shadow-md group-hover:border-[#cda250] transition-colors duration-300">03</div>
                <h5 className="font-sans text-xs font-bold text-[#1a2f23] uppercase tracking-wider">Nhận Tư Vấn Chi Tiết</h5>
                <p className="text-xs text-sage-600 font-light leading-relaxed max-w-xs mx-auto">
                  CSKH sẽ liên lạc lại trong vòng 2 giờ để gửi chiết khấu đặc biệt kèm theo thực đơn trị liệu đi kèm.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="space-y-4 group">
                <div className="w-12 h-12 rounded-full bg-white text-[#b28a50] border border-[#cda250]/40 flex items-center justify-center font-bold font-mono text-sm mx-auto shadow-md group-hover:border-[#cda250] transition-colors duration-300">04</div>
                <h5 className="font-sans text-xs font-bold uppercase tracking-wider text-[#1a2f23]">Tận Hưởng Kỳ Nghỉ</h5>
                <p className="text-xs text-sage-600 font-light leading-relaxed max-w-xs mx-auto">
                  Hoàn tất đặt lịch cọc và chuẩn bị sẵn sàng cho hành trình cân bằng năng lượng tuyệt diệu tại Ngũ Sơn.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
