import React from "react";
import { ChefHat, Heart, Leaf, Star, Calendar } from "lucide-react";

import { restaurantMenus as menus } from "../mockData";

export default function Restaurant() {
  return (
    <div className="bg-[#fafbfa] min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest text-primary-900 uppercase bg-primary-200/60 px-3 py-1.5 rounded-full">
            Nhà hàng Ngũ Sơn
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-sage-900 mt-4 mb-4">
            Ẩm Thực Thực Dưỡng - Dưỡng Chất Cho Thân Tâm
          </h1>
          <p className="text-sage-700 font-normal text-base leading-relaxed">
            Mỗi món ăn là một vị thuốc lành. Trải nghiệm ẩm thực thuần khiết chế
            biến từ nguồn rau củ quả sinh thái organic tự trồng trong khuôn viên
            resort, nói không với gia vị hóa học và đường tinh luyện.
          </p>
        </div>

        {/* Philosophy Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-3xl p-6 border border-primary-100/50 shadow-sm text-center space-y-4">
            <div className="inline-flex p-3 bg-primary-100 rounded-2xl text-primary-900">
              <Leaf className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-sage-900">
              100% Nguyên Liệu Sạch
            </h3>
            <p className="text-sage-700 text-sm font-light leading-relaxed">
              Rau củ hữu cơ được thu hoạch trực tiếp tại vườn sinh thái Ngũ Sơn
              mỗi buổi sáng, đảm bảo độ tươi ngon ngọt tự nhiên tối đa.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-primary-100/50 shadow-sm text-center space-y-4">
            <div className="inline-flex p-3 bg-primary-100 rounded-2xl text-primary-900">
              <ChefHat className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-sage-900">
              Thiết Kế Thực Đơn Riêng
            </h3>
            <p className="text-sage-700 text-sm font-light leading-relaxed">
              Hỗ trợ thiết kế chế độ ăn uống kiêng, ăn chay thực dưỡng hoặc thực
              đơn chuyên biệt theo thể trạng sức khỏe của từng vị khách.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-primary-100/50 shadow-sm text-center space-y-4">
            <div className="inline-flex p-3 bg-primary-100 rounded-2xl text-primary-900">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-sage-900">
              Nói Không Với Hóa Chất
            </h3>
            <p className="text-sage-700 text-sm font-light leading-relaxed">
              Cam kết không sử dụng bột ngọt hóa học, chất bảo quản hay phụ gia
              nhân tạo. Độ ngọt thanh mát 100% tự nhiên từ rau củ và cỏ ngọt.
            </p>
          </div>
        </div>

        {/* Menu Showcase Card layout */}
        <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-sm border border-primary-100/50 mb-16">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900 text-center mb-10">
            Thực Đơn Dinh Dưỡng Theo Mùa
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {menus.map((section, idx) => (
              <div key={idx} className="space-y-6">
                <h3 className="font-serif text-xl font-bold text-primary-900 border-b border-primary-100 pb-3">
                  {section.category}
                </h3>
                <div className="space-y-6">
                  {section.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="space-y-1.5 group">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-sans text-sm font-bold text-sage-900 group-hover:text-primary-800 transition-colors">
                          {item.name}
                        </h4>
                        {/* Remove price as per previous guideline or show as a premium display */}
                      </div>
                      <p className="text-sage-700 text-xs font-light leading-relaxed">
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
        <div className="bg-[#233827] rounded-[32px] p-8 text-center text-white relative overflow-hidden shadow-lg">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: "url('/service_dining.png')" }}
          />
          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold">
              Đặt Bàn & Thiết Kế Thực Đơn
            </h3>
            <p className="text-primary-100/70 text-sm font-light">
              Quý khách có nhu cầu đặt bàn ngắm hoàng hôn ven suối hoặc yêu cầu
              tư vấn thực đơn thực dưỡng cá nhân hóa, vui lòng đăng ký trước 2
              tiếng.
            </p>
            <a
              href="/#booking"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-semibold bg-primary-200 text-sage-950 hover:bg-primary-300 transition-all duration-300 shadow-md hover:scale-105"
            >
              <Calendar className="mr-2 h-4.5 w-4.5 text-sage-950" /> Liên hệ
              đặt bàn ngay
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
