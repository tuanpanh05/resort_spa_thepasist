import React from "react";
import {
  ShieldAlert,
  Stethoscope,
  Heart,
  CheckSquare,
  Calendar,
} from "lucide-react";

import { therapyTreatments as treatments } from "../mockData";

export default function Therapy() {
  return (
    <div className="bg-[#fafbfa] min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest text-primary-900 uppercase bg-primary-200/60 px-3 py-1.5 rounded-full">
            Vật lý trị liệu
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-sage-900 mt-4 mb-4">
            Vật Lý Trị Liệu & Phục Hồi Chức Năng Chuyên Sâu
          </h1>
          <p className="text-sage-700 font-normal text-base leading-relaxed">
            Chúng tôi cam kết mang lại các liệu trình phục hồi vận động an toàn,
            kết hợp giữa tiến bộ y học hiện đại và thảo dược truyền thống dưới
            sự hướng dẫn trực tiếp từ các bác sĩ đầu ngành.
          </p>
        </div>

        {/* Doctor Team Section */}
        <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-sm border border-primary-100/50 mb-16">
          <div className="flex flex-col md:flex-row items-center gap-8 max-w-4xl mx-auto">
            <div className="h-40 w-40 rounded-3xl bg-[#e3e8e3] flex-shrink-0 flex items-center justify-center text-primary-900 overflow-hidden relative">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/service_therapy.png')" }}
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
            <div className="space-y-4">
              <span className="text-xs font-bold text-primary-900 uppercase tracking-widest bg-primary-100 px-2 py-0.5 rounded">
                Bác sĩ chuyên môn
              </span>
              <h3 className="font-serif text-2xl font-bold text-sage-900">
                Bác sĩ CKI Nguyễn Minh Hải
              </h3>
              <p className="text-sage-800 text-sm leading-relaxed font-normal">
                Nguyên Trưởng khoa Phục hồi chức năng tại bệnh viện lớn, hơn 20
                năm nghiên cứu ứng dụng phương pháp kéo nắn cột sống kết hợp bấm
                huyệt Đông y trị liệu. Bác sĩ Hải trực tiếp thăm khám và đưa ra
                phác đồ tập luyện riêng cho từng khách hàng tại resort.
              </p>
            </div>
          </div>
        </div>

        {/* Therapy Treatments List */}
        <div className="space-y-16 mb-16">
          {treatments.map((treat, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={index}
                className={`flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12 bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-primary-100/50 ${isEven ? "" : "lg:flex-row-reverse"}`}
              >
                {/* Visual Icon Box */}
                <div className="w-full lg:w-1/3 rounded-2xl overflow-hidden shadow-sm bg-primary-50/50 flex flex-col justify-center items-center p-8 border border-primary-100 text-primary-900 min-h-[250px]">
                  <Stethoscope className="h-16 w-16 mb-4 text-primary-800 animate-pulse-subtle" />
                  <span className="text-xs font-bold text-sage-800 tracking-wider text-center">
                    AN TOÀN - Y KHOA - TỰ NHIÊN
                  </span>
                </div>

                {/* Content */}
                <div className="w-full lg:w-2/3 flex flex-col justify-between py-2">
                  <div className="space-y-5">
                    <h3 className="font-serif text-2xl font-bold text-sage-900">
                      {treat.name}
                    </h3>

                    <p className="text-sage-800 text-sm sm:text-base leading-relaxed font-normal">
                      {treat.description}
                    </p>

                    <div className="p-4 bg-sage-50/50 rounded-2xl text-xs sm:text-sm text-sage-800 border border-primary-50">
                      <strong className="text-sage-900 block mb-1">
                        Đối tượng phù hợp:
                      </strong>
                      {treat.suitability}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      {treat.benefits.map((benefit, i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-2 text-sage-800 text-xs"
                        >
                          <CheckSquare className="h-4 w-4 text-primary-800 flex-shrink-0" />
                          <span className="font-semibold">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-primary-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <span className="text-xs text-sage-500 font-light italic">
                      Lưu ý mang theo hồ sơ bệnh án cũ (nếu có) khi khám
                    </span>
                    <a
                      href="/#booking"
                      className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-full text-sm font-semibold bg-primary-900 text-white hover:bg-primary-850 transition-all duration-300 shadow-md hover:scale-105"
                    >
                      Đặt lịch bác sĩ khám
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
