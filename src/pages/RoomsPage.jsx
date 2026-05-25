import React, { useState } from 'react';
import { Maximize, User, Coffee, ArrowRight, Grid, Home, Users } from 'lucide-react';

const allRooms = [
  {
    title: 'Bungalow Gỗ Hướng Suối',
    category: 'Phòng Đôi/Bungalow',
    description: 'Nằm ẩn mình dưới tán cây cổ thụ bên khe suối nhỏ. Thiết kế mở với vách kính lớn đón sương mai, hiên trà bằng tre mộc mạc và bồn tắm gỗ Hinoki thơm ngát ngoài trời.',
    size: '65 m²',
    capacity: '2 Người lớn',
    amenity: 'Ban công suối',
    image: '/room_luxury.png',
  },
  {
    title: 'Bungalow Đá Cuội Bên Rừng',
    category: 'Phòng Đôi/Bungalow',
    description: 'Thiết kế vách đá cuội tự nhiên mộc mạc và sang trọng, nép mình bên sườn đồi thông thơ mộng. Sở hữu bồn tắm đá lộ thiên riêng tư và mái kính ngắm sao đêm tuyệt đẹp.',
    size: '75 m²',
    capacity: '2 Người lớn',
    amenity: 'Mái kính ngắm sao',
    image: '/room_luxury.png',
  },
  {
    title: 'Biệt Thự Đồi Trà Thiền Định',
    category: 'Phòng Gia Đình/Villa',
    description: 'Tọa lạc trên đỉnh đồi lộng gió với tầm nhìn 360 độ ra thung lũng Ngũ Sơn xanh biếc. Tích hợp phòng tập yoga riêng biệt và hồ bơi khoáng nóng mini tràn viền.',
    size: '120 m²',
    capacity: '4 Người lớn',
    amenity: 'Bể bơi riêng',
    image: '/hero_bg.png',
  },
  {
    title: 'Biệt Thự Gia Đình Sen Trắng',
    category: 'Phòng Gia Đình/Villa',
    description: 'Nằm biệt lập bên đồi thông yên tĩnh với vườn hoa sen bao quanh. Thiết kế 3 phòng ngủ tiện nghi, phòng khách và bếp nấu ăn đầy đủ dụng cụ, mang lại cảm giác ấm cúng như chính ngôi nhà của bạn.',
    size: '180 m²',
    capacity: '6 - 8 Người lớn',
    amenity: 'Sân vườn & Bếp riêng',
    image: '/hero_bg.png',
  },
  {
    title: 'Nhà Sàn Cộng Đồng Đông Sơn',
    category: 'Phòng Cộng Đồng/Tập Thể',
    description: 'Công trình kiến trúc nhà sàn gỗ truyền thống quy mô lớn, thiết kế mở đón gió mát núi rừng. Trang bị đệm nằm futon organic cao cấp, không gian sinh hoạt chung rộng rãi phù hợp cho các hoạt động bonding, làm việc nhóm hoặc lửa trại ngoài trời của các công ty.',
    size: '250 m²',
    capacity: '15 - 25 Khách',
    amenity: 'Phù hợp Teambuilding',
    image: '/room_community.png',
  },
  {
    title: 'Biệt Thự Tập Thể Bamboo Retreat',
    category: 'Phòng Cộng Đồng/Tập Thể',
    description: 'Thiết kế thuần tre cao cấp bên hồ tự nhiên. Với 2 tầng lầu rộng rãi, tích hợp sảnh sinh hoạt chung lớn, máy chiếu thuyết trình, và sân hiên mở đón gió. Rất thích hợp cho các phòng ban công ty tổ chức workshop kết hợp nghỉ dưỡng.',
    size: '320 m²',
    capacity: '20 - 30 Khách',
    amenity: 'Sảnh workshop & View hồ',
    image: '/room_community.png',
  },
  {
    title: 'Bungalow Tập Thể Rừng Thông',
    category: 'Phòng Cộng Đồng/Tập Thể',
    description: 'Bungalow tập thể hiện đại bằng gỗ thông mộc mạc, bố trí hệ thống giường tầng tối giản thông minh. Rất thích hợp cho nhóm bạn thân hoặc các phòng ban công ty quy mô nhỏ muốn trải nghiệm nghỉ dưỡng tập thể ấm cúng.',
    size: '110 m²',
    capacity: '8 - 12 Khách',
    amenity: 'Giường tầng thông minh',
    image: '/room_luxury.png',
  },
  {
    title: 'Khu Glamping Dome Tập Thể',
    category: 'Phòng Cộng Đồng/Tập Thể',
    description: 'Cụm 3 lều mái vòm geodesic cao cấp thông nhau, nằm xung quanh một khu vực sinh hoạt lửa trại trung tâm riêng tư. Đầy đủ máy lạnh, nệm êm ái và nhà vệ sinh sinh thái biệt lập. Trải nghiệm cắm trại tập thể đẳng cấp cho nhóm teambuilding.',
    size: '150 m²',
    capacity: '10 - 16 Khách',
    amenity: 'Khu lửa trại riêng',
    image: '/hero_bg.png',
  }
];

const categories = ['Tất cả', 'Phòng Đôi/Bungalow', 'Phòng Gia Đình/Villa', 'Phòng Cộng Đồng/Tập Thể'];

export default function RoomsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const filteredRooms = allRooms.filter(room => {
    return selectedCategory === 'Tất cả' || room.category === selectedCategory;
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
            Từ các bungalow đôi lãng mạn bên suối đến các biệt thự đồi trà khép kín và không gian nhà sàn cộng đồng phục vụ cho các doanh nghiệp teambuilding. Tất cả đều hướng tới sự kết nối mật thiết với thiên nhiên rừng núi.
          </p>
        </div>

        {/* Categories Tab list */}
        <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-4 mb-12 scrollbar-none border-b border-primary-100/50">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-300 ${selectedCategory === cat ? 'bg-primary-900 text-white shadow-sm' : 'bg-white border border-primary-200/30 text-sage-800 hover:bg-primary-50'}`}
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
                className={`flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12 bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-primary-100/50 ${isEven ? '' : 'lg:flex-row-reverse'}`}
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
                      <span className="bg-primary-100 px-2 py-0.5 rounded text-xs font-semibold">{room.amenity}</span>
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
                        <span className="font-normal">{room.size}</span>
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
                  </div>

                  {/* Pricing and Action */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8 pt-4 border-t border-primary-100/50">
                    <div className="text-left">
                      <span className="text-xs text-sage-500 block uppercase tracking-wider">Thông tin báo giá</span>
                      <span className="text-sm text-sage-800 font-medium italic">Vui lòng liên hệ để nhận báo giá theo đoàn</span>
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
