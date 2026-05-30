import React from "react";
import { Calendar, Users, Target, CheckCircle2, Sliders } from "lucide-react";

import { eventsVenues as venues } from "../mockData";

export default function Events() {
  return (
    <div className="bg-[#fafbfa] min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest text-primary-900 uppercase bg-primary-200/60 px-3 py-1.5 rounded-full">
            Hội nghị sinh thái
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-sage-900 mt-4 mb-4">
            Không Gian Sự Kiện & Hội Thảo Hòa Cùng Thiên Nhiên
          </h1>
          <p className="text-sage-700 font-normal text-base leading-relaxed">
            Ngũ Sơn Resort cung cấp dịch vụ tổ chức hội thảo, khóa huấn luyện
            chiến lược, hội nghị khách hàng kết hợp nghỉ dưỡng trị liệu sức khỏe
            độc đáo cho các doanh nghiệp, tổ chức.
          </p>
        </div>

        {/* Venues Grid */}
        <div className="space-y-16 mb-20">
          {venues.map((venue, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={index}
                className={`flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12 bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-primary-100/50 ${isEven ? "" : "lg:flex-row-reverse"}`}
              >
                {/* Visual Block (Styled geometric placeholder representing the modern clean event hall space) */}
                <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden shadow-sm bg-[#e3e8e3] flex flex-col justify-center items-center p-8 relative min-h-[300px]">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-80"
                    style={{ backgroundImage: "url('/hero_bg.png')" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/10" />
                  <div className="relative z-10 text-white text-center space-y-3">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
                      Diện tích: {venue.area}
                    </span>
                    <h3 className="font-serif text-2xl font-bold">
                      {venue.name}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="w-full lg:w-1/2 flex flex-col justify-between py-2">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center text-primary-900 text-xs font-bold uppercase tracking-widest space-x-1.5 mb-2">
                        <Users className="h-4.5 w-4.5 text-primary-700" />
                        <span>Sức chứa: {venue.capacity}</span>
                      </div>
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900">
                        {venue.name}
                      </h2>
                    </div>

                    <p className="text-sage-800 text-sm sm:text-base leading-relaxed font-normal">
                      {venue.description}
                    </p>

                    {/* Venue Specs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {venue.highlights.map((highlight, i) => (
                        <div
                          key={i}
                          className="flex items-start space-x-2.5 text-sage-800 text-sm"
                        >
                          <CheckCircle2 className="h-4.5 w-4.5 text-primary-700 flex-shrink-0 mt-0.5" />
                          <span className="font-medium">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-8 pt-6 border-t border-primary-50 flex items-center justify-between">
                    <span className="text-xs text-sage-500 font-light italic">
                      Tặng kèm gói trà chiều thực dưỡng cho hội thảo
                    </span>
                    <a
                      href="/#booking"
                      className="inline-flex items-center justify-center px-6 py-3.5 rounded-full text-sm font-semibold bg-primary-900 text-white hover:bg-primary-850 transition-all duration-300 shadow-md hover:scale-105"
                    >
                      Yêu cầu báo giá hội nghị
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Corporate Team Building Promo Card */}
        <div className="bg-[#233827] rounded-[32px] p-8 text-center text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold">
              Gói Retreat Doanh Nghiệp Cấp Cao
            </h3>
            <p className="text-primary-100/70 text-sm font-light leading-relaxed">
              Trọn gói bao gồm phòng họp hội thảo, ẩm thực thực dưỡng organic,
              liệu trình ngâm chân spa thảo dược giải tỏa căng thẳng cho cán bộ
              nhân viên và các giờ tập yoga thiền định giải phóng tư duy.
            </p>
            <a
              href="/#booking"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-semibold bg-primary-200 text-sage-950 hover:bg-primary-300 transition-all duration-300 shadow-md hover:scale-105"
            >
              <Calendar className="mr-2 h-4.5 w-4.5 text-sage-950" /> Liên hệ tư
              vấn chương trình
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
