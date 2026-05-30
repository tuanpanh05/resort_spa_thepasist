import React from "react";
import { Calendar, Heart, Award, ArrowRight, UserCheck } from "lucide-react";

import { yogaPrograms as programs } from "../mockData";

export default function Yoga() {
  return (
    <div className="bg-[#fafbfa] min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest text-primary-900 uppercase bg-primary-200/60 px-3 py-1.5 rounded-full">
            Yoga & Thiền định
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-sage-900 mt-4 mb-4">
            Tìm Lại Sự Tĩnh Lặng Giữa Đại Ngàn
          </h1>
          <p className="text-sage-700 font-normal text-base leading-relaxed">
            Các lớp học yoga ngoài trời và thiền chánh niệm tại Ngũ Sơn được
            thiết kế tỉ mỉ nhằm giúp bạn thanh lọc tâm trí, gia tăng dẻo dai và
            sạc đầy năng lượng tích cực từ tự nhiên.
          </p>
        </div>

        {/* Coaches / Masters Profile Section */}
        <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-sm border border-primary-100/50 mb-16">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900 text-center mb-10">
            Giảng Viên Đồng Hành Của Bạn
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="h-28 w-28 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center text-primary-900">
                <UserCheck className="h-12 w-12" />
              </div>
              <div className="text-center sm:text-left space-y-2">
                <span className="text-xs font-bold text-primary-900 uppercase tracking-widest bg-primary-100 px-2 py-0.5 rounded">
                  Master Yoga
                </span>
                <h4 className="font-serif text-lg font-bold text-sage-900">
                  Master Kim Nguyễn
                </h4>
                <p className="text-sage-700 text-xs font-light leading-relaxed">
                  Học tập tại Rishikesh (Ấn Độ), hơn 15 năm đào tạo các liệu
                  trình yoga trị liệu cột sống và phục hồi chấn thương sâu cho
                  học viên quốc tế.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="h-28 w-28 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center text-primary-900">
                <UserCheck className="h-12 w-12" />
              </div>
              <div className="text-center sm:text-left space-y-2">
                <span className="text-xs font-bold text-primary-900 uppercase tracking-widest bg-primary-100 px-2 py-0.5 rounded">
                  Thiền Sư
                </span>
                <h4 className="font-serif text-lg font-bold text-sage-900">
                  Thiền Sư Minh Đạo
                </h4>
                <p className="text-sage-700 text-xs font-light leading-relaxed">
                  Chuyên gia chánh niệm ứng dụng, hướng dẫn các khóa thiền thở
                  hơi thở bụng Vipassana giúp chữa lành hội chứng lo âu, mất
                  ngủ.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Yoga Programs List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {programs.map((prog, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-primary-100/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-900 bg-primary-100 px-2.5 py-1 rounded-md inline-block">
                  {prog.duration} / lớp
                </span>

                <h3 className="font-serif text-xl font-bold text-sage-900">
                  {prog.title}
                </h3>

                <p className="text-sage-800 text-sm font-normal leading-relaxed">
                  {prog.description}
                </p>

                <div className="border-t border-primary-50 pt-4 space-y-2 text-xs text-sage-700 font-medium">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-primary-700 mr-2" /> Trình
                    độ: {prog.level}
                  </div>
                  <div className="flex items-center">
                    <UserCheck className="h-4 w-4 text-primary-700 mr-2" />{" "}
                    Hướng dẫn: {prog.coach}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-primary-50">
                <a
                  href="/#booking"
                  className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-primary-900 hover:text-primary-800"
                >
                  Đăng ký lớp học <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
