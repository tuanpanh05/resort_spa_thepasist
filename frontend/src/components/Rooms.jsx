import React from "react";
import { Link } from "react-router-dom";
import { Eye, Coffee, Maximize, User, ArrowRight, Leaf } from "lucide-react";

import { mainRoomsList as rooms } from "../mockData";

export default function Rooms() {
  return (
    <section id="rooms" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20">
          <div className="max-w-xl">
            <span className="text-xs font-semibold tracking-[0.25em] text-primary-700 uppercase block mb-3">
              Không gian lưu trú
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-sage-950 mt-4 leading-tight">
              Nơi Trú Ẩn Yên Bình Giữa Đại Ngàn
            </h2>
            <div className="flex items-center space-x-3 mt-4">
              <Leaf className="h-3.5 w-3.5 text-primary-600/80" />
              <div className="h-[1px] w-12 bg-gradient-to-r from-primary-300 to-transparent" />
            </div>
          </div>
          <p className="text-sage-700 font-light text-sm sm:text-base max-w-md mt-6 md:mt-0 leading-relaxed">
            Mỗi căn phòng đều được xây dựng từ vật liệu tự nhiên như gỗ tuyết
            tùng, đá cuội, đất sét nung, đem lại sự ấm cúng và hài hòa phong
            thủy tuyệt đối.
          </p>
        </div>

        {/* Rooms Layout */}
        <div className="space-y-20">
          {rooms.map((room, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={index}
                className={`flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12 ${isEven ? "" : "lg:flex-row-reverse"}`}
              >
                {/* Image Showcase */}
                <div className="w-full lg:w-1/2 overflow-hidden group relative min-h-[380px]">
                  <img
                    src={room.image}
                    alt={room.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-300" />
                </div>

                {/* Content Box */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center py-4">
                  <span className="text-[10px] tracking-[0.2em] font-semibold text-primary-600 uppercase block mb-2">
                    {room.amenity}
                  </span>

                  <h3 className="font-serif text-2xl sm:text-3xl font-normal text-sage-950 mb-4 hover:text-primary-800 transition-colors duration-300">
                    {room.title}
                  </h3>

                  <p className="text-sage-700 font-light text-sm sm:text-base leading-relaxed mb-6">
                    {room.description}
                  </p>

                  {/* Room Specs */}
                  <div className="grid grid-cols-3 gap-4 border-t border-b border-primary-100 py-4 mb-6">
                    <div className="text-left">
                      <span className="text-[10px] text-sage-400 block uppercase tracking-wider mb-1">
                        Diện tích
                      </span>
                      <span className="text-sm font-medium text-sage-800 font-mono">
                        {room.size}
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] text-sage-400 block uppercase tracking-wider mb-1">
                        Sức chứa
                      </span>
                      <span className="text-sm font-medium text-sage-800">
                        {room.capacity}
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] text-sage-400 block uppercase tracking-wider mb-1">
                        Dịch vụ
                      </span>
                      <span className="text-sm font-medium text-sage-800">
                        Ăn sáng thực dưỡng
                      </span>
                    </div>
                  </div>

                  {/* Enriched Content Details */}
                  <div className="grid grid-cols-2 gap-6 pb-6 mb-2 border-b border-primary-100/50 text-left text-xs">
                    <div className="space-y-2">
                      <span className="text-[10px] text-primary-700 block uppercase tracking-wider font-bold">
                        Tiện nghi nổi bật
                      </span>
                      <ul className="space-y-1.5 text-sage-600 font-light">
                        <li className="flex items-center space-x-2">
                          <span className="text-primary-600">✓</span>
                          <span>Bồn tắm khoáng nóng Dao Đỏ</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="text-primary-600">✓</span>
                          <span>Hồ bơi riêng ngoài trời</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="text-primary-600">✓</span>
                          <span>Đưa đón xe điện nội khu 24/7</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] text-primary-700 block uppercase tracking-wider font-bold">
                        Đặc quyền sức khỏe
                      </span>
                      <ul className="space-y-1.5 text-sage-600 font-light">
                        <li className="flex items-center space-x-2">
                          <span className="text-primary-600">✓</span>
                          <span>Yoga & Thiền miễn phí hàng ngày</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="text-primary-600">✓</span>
                          <span>Trà dược liệu phòng ngủ</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="text-primary-600">✓</span>
                          <span>Nước khoáng kiềm giàu Hydro</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-auto pt-4 border-t border-primary-100/50">
                    <div className="text-left">
                      <span className="text-xs text-sage-500 block uppercase tracking-wider">
                        Thông tin báo giá
                      </span>
                      <span className="text-sm text-sage-800 font-medium italic">
                        Liên hệ trực tiếp để nhận ưu đãi tốt nhất
                      </span>
                    </div>
                    <a
                      href="/dat-lich"
                      className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-none text-xs font-semibold tracking-widest bg-primary-800 text-white hover:bg-primary-900 transition-all duration-300 uppercase cursor-pointer"
                    >
                      Liên hệ báo giá
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Rooms Button */}
        <div className="mt-20 text-center">
          <Link
            to="/phong-o"
            className="inline-flex items-center justify-center px-10 py-4 rounded-none text-xs font-semibold tracking-widest border border-sage-900 text-sage-950 hover:bg-sage-900 hover:text-white transition-all duration-300 uppercase"
          >
            Khám phá tất cả các hạng phòng
          </Link>
        </div>
      </div>
    </section>
  );
}
