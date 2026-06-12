import React from "react";
import { Leaf } from "lucide-react";

export default function WellnessExperiences() {
  const experiences = [
    {
      id: "spa",
      title: "Spa & Trị Liệu Thảo Dược Cổ Truyền",
      description:
        "Lấy cảm hứng từ y học dân gian Việt Nam và các phương pháp thư giãn châu Á, liệu trình tắm lá Dao Đỏ, mát-xa đá bazan và tinh dầu hữu cơ giúp đả thông kinh mạch, lưu thông khí huyết hiệu quả.",
      tag: "Phục Hồi Thể Chất",
      benefits: [
        "Ngâm tắm lá thuốc Dao Đỏ",
        "Massage đá nóng núi lửa",
        "Xông hơi thảo mộc Hoàng Thổ",
      ],
      image:
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "yoga",
      title: "Yoga & Thiền Định Giữa Rừng Thông",
      description:
        "Được hướng dẫn bởi các huấn luyện viên chuyên nghiệp quốc tế, lớp học Hatha Yoga phục hồi và thiền chuông xoay Tây Tạng giúp xoa dịu những lo âu, mở ra chiều sâu tĩnh lặng trong tâm thức của bạn.",
      tag: "Tĩnh Tâm Trị Liệu",
      benefits: [
        "Thiền định forest-bathing",
        "Yoga trị liệu đau mỏi cổ vai gáy",
        "Liệu pháp âm thanh Chuông Xoay",
      ],
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "therapy",
      title: "Vật Lý Trị Liệu Chuyên Sâu Cột Sống",
      description:
        "Chương trình phục hồi chức năng xương khớp, thoát vị đĩa đệm sử dụng các máy xung điện, kéo giãn cột sống hiện đại kết hợp các bài tập nắn chỉnh cơ liên kết chuyên khoa bởi đội ngũ y bác sĩ đầu ngành.",
      tag: "Chăm Sóc Y Khoa",
      benefits: [
        "Kéo giãn cột sống công nghệ cao",
        "Trị liệu laser mềm chống viêm",
        "Bài tập nắn chỉnh khớp cột sống",
      ],
      image:
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <section className="py-24 bg-[#f5f5f0] text-sage-950 font-sans border-b border-sage-200/50">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Header Section */}
        <div className="max-w-2xl mb-20 space-y-4">
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-primary-600 block">
            Trải Nghiệm Độc Bản
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-tight">
            Liệu Trình Chăm Sóc Sức Khỏe
          </h2>
          <div className="flex items-center space-x-3 mt-4">
            <Leaf className="h-3.5 w-3.5 text-primary-600/80" />
            <div className="h-[1px] w-12 bg-gradient-to-r from-primary-300 to-transparent" />
          </div>
          <p className="text-xs sm:text-sm text-sage-600 font-light leading-relaxed pt-2">
            Được thiết kế cá nhân hóa cho từng khách lưu trú nhằm nâng cao hệ
            miễn dịch tự nhiên, giải phóng độc tố và phục hồi năng lượng sống
            nguyên bản.
          </p>
        </div>

        {/* Experience Cards Layout */}
        <div className="space-y-16">
          {experiences.map((exp, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={exp.id}
                className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${
                  isEven ? "" : "lg:flex-row-reverse"
                }`}
              >
                {/* Image panel */}
                <div className="w-full lg:w-1/2 relative overflow-hidden bg-primary-100 aspect-video lg:aspect-[4/3] border border-primary-200">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>

                {/* Info Content Panel */}
                <div className="w-full lg:w-1/2 space-y-6 text-left">
                  <span className="text-[9px] font-bold tracking-[0.25em] text-primary-600 uppercase">
                    {exp.tag}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-normal text-sage-900 leading-tight">
                    {exp.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-sage-650 font-light leading-relaxed">
                    {exp.description}
                  </p>

                  {/* Highlights list */}
                  <div className="pt-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-sage-400 mb-3">
                      Nổi bật trong liệu trình
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-sage-600 font-medium">
                      {exp.benefits.map((b, i) => (
                        <li key={i} className="flex items-center space-x-2">
                          <span className="text-primary-600 text-xs">✓</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
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
