import React, { useState } from "react";
import {
  Maximize,
  User,
  Coffee,
  ArrowRight,
  Grid,
  Home,
  Users,
} from "lucide-react";

import {
  roomsPageAllRooms as allRooms,
  roomsPageCategories as categories,
} from "../mockData";

export default function RoomsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const filteredRooms = allRooms.filter((room) => {
    return selectedCategory === "Tất cả" || room.category === selectedCategory;
  });

  return (
    <div className="bg-[#fafbfa] min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest text-primary-900 uppercase bg-primary-200/60 px-3 py-1.5 rounded-full">
            Phòng nghỉ Ngũ Sơn
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-sage-900 mt-4 mb-4">
            Hệ Thống Phòng Nghỉ Dưỡng Trị Liệu
          </h1>
          <p className="text-sage-700 font-normal text-base leading-relaxed">
            Từ các bungalow đôi lãng mạn bên suối đến các biệt thự đồi trà khép
            kín và không gian nhà sàn cộng đồng phục vụ cho các doanh nghiệp
            teambuilding. Tất cả đều hướng tới sự kết nối mật thiết với thiên
            nhiên rừng núi.
          </p>
        </div>

        {/* Categories Tab list */}
        <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-4 mb-12 scrollbar-none border-b border-primary-100/50">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-300 ${selectedCategory === cat ? "bg-primary-900 text-white shadow-sm" : "bg-white border border-primary-200/30 text-sage-800 hover:bg-primary-50"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Detailed Rooms Layout */}
        <div className="space-y-16">
          {filteredRooms.map((room, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={index}
                className={`flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12 bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-primary-100/50 ${isEven ? "" : "lg:flex-row-reverse"}`}
              >
                {/* Image Showcase */}
                <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden shadow-sm group relative min-h-[300px] lg:min-h-auto">
                  <img
                    src={room.image}
                    alt={room.title}
                    className="w-full h-full min-h-[300px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />

                  {/* Category Badge overlay */}
                  <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider bg-white/95 text-sage-900 px-3 py-1 rounded-full shadow-sm">
                    {room.category}
                  </span>
                </div>

                {/* Content Box */}
                <div className="w-full lg:w-1/2 flex flex-col justify-between py-2">
                  <div className="space-y-6">
                    <span className="text-sm font-semibold text-primary-900 flex items-center space-x-1.5">
                      <span>Đặc trưng</span>
                      <span>•</span>
                      <span className="bg-primary-100 px-2 py-0.5 rounded text-xs font-semibold">
                        {room.amenity}
                      </span>
                    </span>

                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900">
                      {room.title}
                    </h2>

                    <p className="text-sage-800 font-normal text-sm sm:text-base leading-relaxed">
                      {room.description}
                    </p>

                    {/* Room Specs */}
                    <div className="grid grid-cols-3 gap-4 border-t border-b border-primary-100 py-4">
                      <div className="flex items-center space-x-2 text-sage-800 text-xs sm:text-sm">
                        <Maximize className="h-4.5 w-4.5 text-primary-800" />
                        <span className="font-normal font-mono">
                          {room.size}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sage-800 text-xs sm:text-sm">
                        <User className="h-4.5 w-4.5 text-primary-800" />
                        <span className="font-normal">{room.capacity}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sage-800 text-xs sm:text-sm">
                        <Coffee className="h-4.5 w-4.5 text-primary-800" />
                        <span className="font-normal">Ăn sáng thực dưỡng</span>
                      </div>
                    </div>

                    {/* Enriched Details */}
                    <div className="grid grid-cols-2 gap-4 text-xs pt-2 text-left">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-primary-700 block uppercase tracking-wider font-bold">
                          Tiện nghi resort
                        </span>
                        <ul className="space-y-1 text-sage-600 font-light">
                          <li className="flex items-center space-x-1.5">
                            <span className="text-primary-600">✓</span>
                            <span>Bồn tắm khoáng nóng thảo mộc</span>
                          </li>
                          <li className="flex items-center space-x-1.5">
                            <span className="text-primary-600">✓</span>
                            <span>Ban công ngắm rừng thông</span>
                          </li>
                          <li className="flex items-center space-x-1.5">
                            <span className="text-primary-600">✓</span>
                            <span>Hồ bơi tràn bờ (Tùy hạng phòng)</span>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-primary-700 block uppercase tracking-wider font-bold">
                          Trị liệu & Sức khỏe
                        </span>
                        <ul className="space-y-1 text-sage-600 font-light">
                          <li className="flex items-center space-x-1.5">
                            <span className="text-primary-600">✓</span>
                            <span>Lớp Thiền & Yoga miễn phí hàng ngày</span>
                          </li>
                          <li className="flex items-center space-x-1.5">
                            <span className="text-primary-600">✓</span>
                            <span>Nước uống kiềm giàu hydro</span>
                          </li>
                          <li className="flex items-center space-x-1.5">
                            <span className="text-primary-600">✓</span>
                            <span>Trà thảo mộc hữu cơ giấc ngủ sâu</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8 pt-4 border-t border-primary-100/50">
                    <div className="text-left">
                      <span className="text-xs text-sage-500 block uppercase tracking-wider">
                        Thông tin báo giá
                      </span>
                      <span className="text-sm text-sage-800 font-medium italic">
                        Vui lòng liên hệ để nhận báo giá theo đoàn
                      </span>
                    </div>
                    <a
                      href="/#booking"
                      className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-semibold bg-primary-900 text-white hover:bg-primary-800 transition-all duration-300 shadow-md hover:scale-105"
                    >
                      Liên hệ nhận báo giá
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
