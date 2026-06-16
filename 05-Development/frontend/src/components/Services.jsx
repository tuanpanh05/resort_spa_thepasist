import React from "react";
import { Link } from "react-router-dom";
import { Utensils, Sparkles, Activity, Compass } from "lucide-react";

const services = [
  {
    title: "Ẩm Thực Thực Dưỡng",
    description:
      "Bữa ăn được thiết kế từ nguyên liệu hữu cơ thuần khiết, cân bằng dinh dưỡng giúp thanh lọc cơ thể và tăng cường hệ miễn dịch.",
    icon: Utensils,
    image: "/service_dining.png",
    tag: "Dinh dưỡng sạch",
    link: "/nha-hang",
  },
  {
    title: "Spa & Trị Liệu Thảo Dược",
    description:
      "Các liệu pháp bấm huyệt cổ truyền, xông hơi thuốc nam và chườm đá nóng giúp lưu thông khí huyết và giải tỏa áp lực.",
    icon: Sparkles,
    image: "/service_spa.png",
    tag: "Thư giãn sâu",
    link: "/spa",
  },
  {
    title: "Yoga & Thiền Định",
    description:
      "Hòa mình vào thiên nhiên với các buổi thực hành thiền thở và yoga đón bình minh trên thảm cỏ xanh mướt.",
    icon: Compass,
    image: "/service_yoga.png",
    tag: "Tĩnh lặng tâm hồn",
    link: "/yoga",
  },
  {
    title: "Vật Lý Trị Liệu",
    description:
      "Liệu trình nắn chỉnh cột sống, phục hồi cơ khớp chuyên biệt dưới sự theo dõi sát sao của các chuyên gia y học cổ truyền.",
    icon: Activity,
    image: "/service_therapy.png",
    tag: "Phục hồi thể chất",
    link: "/vat-ly-tri-lieu",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-[#fbfbfa]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-semibold tracking-[0.25em] text-primary-700 uppercase block mb-3">
            Trải nghiệm thư giãn
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-sage-950 mt-4 mb-6 leading-tight">
            Hành Trình Chữa Lành Tự Nhiên
          </h2>
          <p className="text-sage-700 font-light text-sm sm:text-base leading-relaxed">
            Tại Ngũ Sơn Resort, chúng tôi kết hợp hoàn hảo giữa không gian nghỉ
            dưỡng biệt lập và các phương pháp chăm sóc sức khỏe tự nhiên, mang
            lại sự tái tạo năng lượng trọn vẹn nhất.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {services.map((service, index) => {
            return (
              <div
                key={index}
                className="group flex flex-col bg-transparent transition-all duration-300"
              >
                {/* Image Container */}
                <div className="h-60 w-full overflow-hidden relative mb-6">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>

                {/* Card Content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {/* Tag */}
                    <span className="text-[10px] tracking-[0.2em] font-semibold text-primary-600 uppercase block mb-2">
                      {service.tag}
                    </span>
                    {/* Title */}
                    <h3 className="font-serif text-lg font-normal text-sage-950 mb-3 group-hover:text-primary-800 transition-colors duration-300">
                      {service.title}
                    </h3>
                    {/* Description */}
                    <p className="text-sage-700 font-light text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Read More Link */}
                  <div className="mt-6">
                    <Link
                      to={service.link}
                      className="inline-block text-[11px] font-semibold uppercase tracking-widest text-sage-950 border-b border-sage-950/20 pb-0.5 hover:border-sage-950 transition-all duration-300"
                    >
                      Tìm hiểu thêm
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
