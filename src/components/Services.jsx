import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Sparkles, Activity, Compass } from 'lucide-react';

const services = [
  {
    title: 'Ẩm Thực Thực Dưỡng',
    description: 'Bữa ăn được thiết kế từ nguyên liệu hữu cơ thuần khiết, cân bằng dinh dưỡng giúp thanh lọc cơ thể và tăng cường hệ miễn dịch.',
    icon: Utensils,
    image: '/service_dining.png',
    tag: 'Dinh dưỡng sạch',
    link: '/nha-hang'
  },
  {
    title: 'Spa & Trị Liệu Thảo Dược',
    description: 'Các liệu pháp bấm huyệt cổ truyền, xông hơi thuốc nam và chườm đá nóng giúp lưu thông khí huyết và giải tỏa áp lực.',
    icon: Sparkles,
    image: '/service_spa.png',
    tag: 'Thư giãn sâu',
    link: '/spa'
  },
  {
    title: 'Yoga & Thiền Định',
    description: 'Hòa mình vào thiên nhiên với các buổi thực hành thiền thở và yoga đón bình minh trên thảm cỏ xanh mướt.',
    icon: Compass,
    image: '/service_yoga.png',
    tag: 'Tĩnh lặng tâm hồn',
    link: '/yoga'
  },
  {
    title: 'Vật Lý Trị Liệu',
    description: 'Liệu trình nắn chỉnh cột sống, phục hồi cơ khớp chuyên biệt dưới sự theo dõi sát sao của các chuyên gia y học cổ truyền.',
    icon: Activity,
    image: '/service_therapy.png',
    tag: 'Phục hồi thể chất',
    link: '/vat-ly-tri-lieu'
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-[#f8faf7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest text-primary-900 uppercase bg-primary-200/60 px-3 py-1.5 rounded-full">
            Trải nghiệm thư giãn
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-sage-900 mt-4 mb-6 leading-tight">
            Hành Trình Chữa Lành Tự Nhiên
          </h2>
          <div className="h-1 w-16 bg-primary-300 mx-auto rounded-full mb-6" />
          <p className="text-sage-800 font-normal text-base sm:text-lg leading-relaxed">
            Tại Ngũ Sơn Resort, chúng tôi kết hợp hoàn hảo giữa không gian nghỉ dưỡng biệt lập và các phương pháp chăm sóc sức khỏe tự nhiên, mang lại sự tái tạo năng lượng trọn vẹn nhất.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div 
                key={index} 
                className="group relative flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-primary-100/50 hover:-translate-y-2"
              >
                {/* Image Container with zoom on hover */}
                <div className="h-56 w-full overflow-hidden relative">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                  
                  {/* Category Tag */}
                  <span className="absolute top-4 left-4 text-xs font-semibold bg-white/95 text-sage-800 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                    {service.tag}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Icon & Title */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2.5 bg-primary-200/50 rounded-2xl text-primary-900 transition-colors duration-300 group-hover:bg-primary-900 group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-sage-900 group-hover:text-primary-900 transition-colors duration-300">
                        {service.title}
                      </h3>
                    </div>
                    {/* Description */}
                    <p className="text-sage-800 font-normal text-sm sm:text-base leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Read More Link */}
                  <div className="mt-6 pt-4 border-t border-primary-50">
                    <Link 
                      to={service.link} 
                      className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-primary-900 hover:text-primary-850 group-hover:translate-x-1 transition-all duration-300"
                    >
                      Tìm hiểu thêm &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
