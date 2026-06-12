import React from "react";
import { Heart, Sparkles, Clock, CheckCircle } from "lucide-react";

import { spaTherapies as therapies } from "../mockData";

export default function Spa() {
  return (
    <div className="bg-[#fafbfa] min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest text-primary-900 uppercase bg-primary-200/60 px-3 py-1.5 rounded-full">
            Spa & Trị Liệu Thảo Dược
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-sage-900 mt-4 mb-4">
            Đánh Thức Giác Quan - Khơi Nguồn Sinh Khí
          </h1>
          <p className="text-sage-700 font-normal text-base leading-relaxed">
            Hòa mình vào không gian thơm ngát tinh dầu, tiếng nhạc suối êm dịu
            và trải nghiệm các liệu pháp bấm huyệt cổ truyền kết hợp thảo mộc
            tươi hái tại vườn sinh thái của chúng tôi.
          </p>
        </div>

        {/* Therapy Details Layout */}
        <div className="space-y-16">
          {therapies.map((therapy, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={index}
                className={`flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12 bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-primary-100/50 ${isEven ? "" : "lg:flex-row-reverse"}`}
              >
                {/* Image */}
                <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden shadow-sm min-h-[300px] relative">
                  <img
                    src={therapy.image}
                    alt={therapy.name}
                    className="w-full h-full min-h-[300px] object-cover"
                  />
                  <div className="absolute inset-0 bg-black/5" />
                </div>

                {/* Content */}
                <div className="w-full lg:w-1/2 flex flex-col justify-between py-2">
                  <div className="space-y-6">
                    {/* Header */}
                    <div>
                      <div className="flex items-center text-primary-900 text-xs font-bold uppercase tracking-widest space-x-1.5 mb-2">
                        <Clock className="h-4 w-4 text-primary-700" />
                        <span>Thời lượng: {therapy.duration}</span>
                      </div>
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900">
                        {therapy.name}
                      </h2>
                    </div>

                    <p className="text-sage-800 text-sm sm:text-base leading-relaxed font-normal">
                      {therapy.description}
                    </p>

                    {/* Benefits Checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {therapy.benefits.map((benefit, i) => (
                        <div
                          key={i}
                          className="flex items-start space-x-2.5 text-sage-800 text-sm"
                        >
                          <CheckCircle className="h-4.5 w-4.5 text-primary-700 flex-shrink-0 mt-0.5" />
                          <span className="font-medium">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-8 pt-6 border-t border-primary-50 flex items-center justify-between">
                    <span className="text-xs text-sage-500 font-light italic">
                      Đặt lịch trước để được chuẩn bị thảo dược tươi
                    </span>
                    <a
                      href="/dat-lich"
                      className="inline-flex items-center justify-center px-6 py-3.5 rounded-full text-sm font-semibold bg-primary-900 text-white hover:bg-primary-850 transition-all duration-300 shadow-md hover:scale-105"
                    >
                      Đăng ký tư vấn liệu trình
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
