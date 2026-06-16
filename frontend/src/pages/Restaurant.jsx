import React from "react";
import { ChefHat, Heart, Leaf, Star, Calendar } from "lucide-react";
import serviceDining from "../assets/service_dining.png";

import { restaurantMenus as menus } from "../mockData";

export default function Restaurant() {
  return (
    <div className="bg-[#fafbfa] min-h-screen font-sans">
      {/* HERO BANNER */}
      <div className="relative w-full h-[50vh] sm:h-[65vh] overflow-hidden mb-20">
        <div 
          className="absolute inset-0 bg-fixed bg-cover bg-center opacity-70 mix-blend-multiply"
          style={{ backgroundImage: `url(${serviceDining})` }}
        ></div>
        <div className="absolute inset-0 bg-sage-900/40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sage-900/60 to-[#fafbfa]"></div>
        <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-8 flex flex-col justify-end pb-24">
          <span className="text-primary-200 font-bold tracking-[0.2em] text-xs sm:text-sm uppercase mb-4 animate-slide-up">
            Nhà hàng Ngũ Sơn
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Ẩm Thực Thực Dưỡng
          </h1>
          <p className="text-sage-50 max-w-2xl text-sm sm:text-lg font-light leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Mỗi món ăn là một vị thuốc lành. Trải nghiệm ẩm thực thuần khiết chế biến từ nguồn rau củ quả sinh thái organic tự trồng, nói không với gia vị hóa học và đường tinh luyện.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8">

        {/* Philosophy Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 -mt-32 relative z-10">
          <div className="bg-white/70 backdrop-blur-xl rounded-[32px] p-10 border-[0.5px] border-white shadow-[0_8px_32px_rgba(0,0,0,0.06)] text-center space-y-6 hover:-translate-y-3 transition-all duration-700 group">
            <div className="mx-auto w-20 h-20 flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-full text-primary-800 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(156,167,144,0.4)] transition-all duration-500">
              <Leaf className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-sage-900">
              100% Nguyên Liệu Sạch
            </h3>
            <p className="text-sage-600 text-sm font-light leading-relaxed">
              Rau củ hữu cơ được thu hoạch trực tiếp tại vườn sinh thái Ngũ Sơn mỗi buổi sáng, đảm bảo độ tươi ngon ngọt tự nhiên.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-[32px] p-10 border-[0.5px] border-white shadow-[0_8px_32px_rgba(0,0,0,0.06)] text-center space-y-6 hover:-translate-y-3 transition-all duration-700 group">
            <div className="mx-auto w-20 h-20 flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-full text-primary-800 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(156,167,144,0.4)] transition-all duration-500">
              <ChefHat className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-sage-900">
              Thiết Kế Thực Đơn Riêng
            </h3>
            <p className="text-sage-600 text-sm font-light leading-relaxed">
              Hỗ trợ thiết kế chế độ ăn uống kiêng, ăn chay thực dưỡng hoặc chuyên biệt theo thể trạng sức khỏe.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-[32px] p-10 border-[0.5px] border-white shadow-[0_8px_32px_rgba(0,0,0,0.06)] text-center space-y-6 hover:-translate-y-3 transition-all duration-700 group">
            <div className="mx-auto w-20 h-20 flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-full text-primary-800 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(156,167,144,0.4)] transition-all duration-500">
              <Heart className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-sage-900">
              Không Với Hóa Chất
            </h3>
            <p className="text-sage-600 text-sm font-light leading-relaxed">
              Cam kết không sử dụng bột ngọt hóa học hay chất bảo quản. Độ ngọt thanh mát 100% tự nhiên từ rau củ.
            </p>
          </div>
        </div>

        {/* Menu Showcase Card layout */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-sage-900">
              Thực Đơn Dinh Dưỡng Theo Mùa
            </h2>
            <div className="h-1 w-24 bg-primary-300 mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {menus.map((section, idx) => (
              <div key={idx} className={`bg-white rounded-[40px] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border-[0.5px] border-primary-100/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-700 relative overflow-hidden group ${idx === 1 ? 'lg:mt-12' : ''} ${idx === 2 ? 'lg:mt-24' : ''}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary-100 transition-colors duration-700" />
                <h3 className="relative font-serif text-2xl font-bold text-sage-900 mb-8 flex items-center gap-3">
                  <span className="text-primary-600">✤</span>
                  {section.category}
                </h3>
                <div className="relative space-y-8">
                  {section.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="group/item">
                      <h4 className="font-serif text-lg font-bold text-sage-900 group-hover/item:text-primary-800 transition-colors mb-2">
                        {item.name}
                      </h4>
                      <p className="text-sage-500 text-sm font-light leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="relative rounded-[48px] p-12 sm:p-20 text-center overflow-hidden mb-12 group shadow-[0_20px_60px_rgba(35,56,39,0.2)]">
          <div className="absolute inset-0 bg-sage-950"></div>
          <div
            className="absolute inset-0 bg-fixed bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-[3s]"
            style={{ backgroundImage: `url(${serviceDining})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sage-950 via-sage-900/80 to-transparent"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-10">
            <h3 className="font-serif text-4xl sm:text-6xl font-bold text-white leading-tight">
              Tư Vấn Thực Đơn & Đặt Bàn Khép Kín
            </h3>
            <p className="text-sage-100 text-base sm:text-lg font-light leading-relaxed px-4 opacity-90">
              Quý khách có nhu cầu dùng bữa riêng tư ngắm hoàng hôn ven suối hoặc yêu cầu tư vấn thực đơn thực dưỡng cá nhân hóa từ chuyên gia dinh dưỡng, vui lòng đăng ký trước 2 tiếng.
            </p>
            <a
              href="/dat-lich"
              className="relative overflow-hidden inline-flex items-center justify-center px-12 py-5 rounded-full text-sm font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-amber-200 to-amber-400 text-amber-950 hover:to-amber-300 transition-all duration-500 shadow-[0_0_30px_rgba(245,208,129,0.4)] hover:shadow-[0_0_50px_rgba(245,208,129,0.6)] hover:-translate-y-1.5 group/btn"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]" />
              <Calendar className="mr-3 h-5 w-5 text-amber-900 relative z-10" /> 
              <span className="relative z-10">Liên Hệ Đặt Bàn Ngay</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
