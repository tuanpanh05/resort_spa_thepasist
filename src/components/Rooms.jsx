import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Coffee, Maximize, User, ArrowRight } from 'lucide-react';

const rooms = [
  {
    title: 'Bungalow Gỗ Hướng Suối',
    description: 'Nằm ẩn mình dưới tán cây cổ thụ bên khe suối nhỏ. Thiết kế mở với vách kính lớn đón sương mai, hiên trà bằng tre mộc mạc và bồn tắm gỗ Hinoki thơm ngát ngoài trời.',
    size: '65 m²',
    capacity: '2 Người lớn',
    amenity: 'Ban công suối',
    price: '3.200.000đ',
    image: '/room_luxury.png',
  },
  {
    title: 'Biệt Thự Đồi Trà Thiền Định',
    description: 'Tọa lạc trên đỉnh đồi lộng gió với tầm nhìn 360 độ ra thung lũng Ngũ Sơn xanh biếc. Tích hợp phòng tập yoga riêng biệt và hồ bơi khoáng nóng mini tràn viền.',
    size: '120 m²',
    capacity: '4 Người lớn',
    amenity: 'Bể bơi riêng',
    price: '5.800.000đ',
    image: '/hero_bg.png', // reusing our gorgeous hero image which looks like a hilltop resort with pool
  }
];

export default function Rooms() {
  return (
    <section id="rooms" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-widest text-primary-900 uppercase bg-primary-200/60 px-3 py-1.5 rounded-full">
              Không gian lưu trú
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-sage-900 mt-4 leading-tight">
              Nơi Trú Ẩn Yên Bình Giữa Đại Ngàn
            </h2>
            <div className="h-1 w-16 bg-primary-300 mt-6 mb-0 rounded-full" />
          </div>
          <p className="text-sage-800 font-normal text-base sm:text-lg max-w-md mt-6 md:mt-0 leading-relaxed">
            Mỗi căn phòng đều được xây dựng từ vật liệu tự nhiên như gỗ tuyết tùng, đá cuội, đất sét nung, đem lại sự ấm cúng và hài hòa phong thủy tuyệt đối.
          </p>
        </div>

        {/* Rooms Layout */}
        <div className="space-y-16">
          {rooms.map((room, index) => {
            const isEven = index % 2 === 0;
            return (
              <div 
                key={index} 
                className={`flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12 ${isEven ? '' : 'lg:flex-row-reverse'}`}
              >
                {/* Image Showcase */}
                <div className="w-full lg:w-1/2 rounded-3xl overflow-hidden shadow-md group relative min-h-[350px] lg:min-h-auto">
                  <img 
                    src={room.image} 
                    alt={room.title} 
                    className="w-full h-full min-h-[350px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                </div>

                {/* Content Box */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center py-4">
                  <span className="text-sm font-semibold text-primary-900 flex items-center space-x-1 mb-2">
                    <span>Nổi bật</span>
                    <span>•</span>
                    <span className="bg-primary-100 px-2 py-0.5 rounded text-xs font-semibold">{room.amenity}</span>
                  </span>
                  
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900 mb-4 hover:text-primary-900 transition-colors duration-200">
                    {room.title}
                  </h3>
                  
                  <p className="text-sage-800 font-normal text-base leading-relaxed mb-6">
                    {room.description}
                  </p>

                  {/* Room Specs */}
                  <div className="grid grid-cols-3 gap-4 border-t border-b border-primary-100 py-4 mb-8">
                    <div className="flex items-center space-x-2 text-sage-800 text-sm">
                      <Maximize className="h-4.5 w-4.5 text-primary-800" />
                      <span className="font-normal">{room.size}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sage-800 text-sm">
                      <User className="h-4.5 w-4.5 text-primary-800" />
                      <span className="font-normal">{room.capacity}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sage-800 text-sm">
                      <Coffee className="h-4.5 w-4.5 text-primary-800" />
                      <span className="font-normal">Bao gồm ăn sáng</span>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-auto pt-4 border-t border-primary-100/50">
                    <div className="text-left">
                      <span className="text-xs text-sage-500 block uppercase tracking-wider">Thông tin báo giá</span>
                      <span className="text-sm text-sage-800 font-medium italic">Liên hệ trực tiếp để nhận ưu đãi tốt nhất</span>
                    </div>
                    <a
                      href="#booking"
                      className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-semibold bg-primary-900 text-white hover:bg-primary-800 transition-all duration-300 shadow-md hover:shadow-primary-900/10 hover:scale-105"
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
        <div className="mt-16 text-center">
          <Link
            to="/phong-o"
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-full text-base font-bold bg-primary-200 text-sage-950 hover:bg-primary-300 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105"
          >
            <span>Khám phá tất cả các hạng phòng</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
