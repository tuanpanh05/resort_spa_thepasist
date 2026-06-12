import React from "react";
import { Tag, Calendar, ShieldCheck, ArrowRight } from "lucide-react";

import { promotionsPromos as promos } from "../mockData";

export default function Promotions() {
  return (
    <div className="bg-[#fafbfa] min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest text-primary-900 uppercase bg-primary-200/60 px-3 py-1.5 rounded-full">
            Khuyến mãi độc quyền
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-sage-900 mt-4 mb-4">
            Đánh Thức Năng Lượng - Tối Ưu Trải Nghiệm
          </h1>
          <p className="text-sage-700 font-normal text-base leading-relaxed">
            Khám phá các chương trình ưu đãi đặc quyền nghỉ dưỡng kết hợp gói
            phục hồi sức khỏe, chăm sóc tinh thần được thiết kế chuyên sâu tại
            Ngũ Sơn Resort.
          </p>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {promos.map((promo, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-primary-100/50 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              {/* Corner Tag */}
              <div className="absolute top-0 right-0 bg-primary-200 text-primary-900 text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">
                Ưu đãi
              </div>

              <div className="space-y-5">
                <span className="text-xs font-bold text-primary-900 flex items-center space-x-1.5">
                  <Tag className="h-4.5 w-4.5" />
                  <span>{promo.discount}</span>
                </span>

                <h3 className="font-serif text-xl font-bold text-sage-900 leading-snug">
                  {promo.title}
                </h3>

                <p className="text-sage-800 text-sm font-normal leading-relaxed">
                  {promo.description}
                </p>

                <div className="pt-4 border-t border-primary-50 space-y-2 text-xs text-sage-600 font-medium">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-primary-700 mr-2" /> Thời
                    hạn: {promo.period}
                  </div>
                  <div className="flex items-center">
                    <ShieldCheck className="h-4 w-4 text-primary-700 mr-2" /> Mã
                    đăng ký:{" "}
                    <strong className="text-sage-900 select-all ml-1">
                      {promo.code}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-primary-50">
                <a
                  href="/dat-lich"
                  className="w-full inline-flex items-center justify-center py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-900 text-white hover:bg-primary-850 transition-all shadow-sm"
                >
                  Nhận báo giá ưu đãi
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
