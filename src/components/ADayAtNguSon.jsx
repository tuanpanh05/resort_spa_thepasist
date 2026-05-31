import React from "react";
import { Leaf } from "lucide-react";

export default function ADayAtNguSon() {
  const schedule = [
    {
      time: "06:30",
      title: "Bình Minh Thiền Định rừng thông",
      description:
        "Đón nhận tia nắng đầu tiên xuyên qua kẽ lá, hít thở bầu không khí tinh khiết và bắt đầu ngày mới bằng bài thiền hành giải phóng căng thẳng.",
      activity: "Thiền Định & Prana Breathing",
    },
    {
      time: "08:00",
      title: "Bữa Sáng Thực Dưỡng Hữu Cơ",
      description:
        "Thực đơn chế biến từ rau xanh, nấm thảo dược thu hoạch ngay tại vườn hữu cơ của resort, cung cấp nguồn dinh dưỡng sạch khởi đầu ngày mới.",
      activity: "Trị Liệu Dinh Dưỡng Sạch",
    },
    {
      time: "14:00",
      title: "Liệu Trình Tắm Thảo Dược & Ngâm Khoáng",
      description:
        "Lá thuốc Dao Đỏ đun trong nồi đồng kết hợp bùn khoáng nóng thiên nhiên giúp thư giãn cơ sâu, đào thải kim loại nặng qua da.",
      activity: "Spa Trị Liệu Phục Hồi Thể Chất",
    },
    {
      time: "17:30",
      title: "Trà Chiều Hoàng Hôn Thung Lũng",
      description:
        "Thưởng trà hoa cúc mật ong rừng và các loại bánh yến mạch thô, ngắm hoàng hôn buông xuống thung lũng Ngũ Sơn lãng mạn.",
      activity: "Thực Hành Chánh Niệm",
    },
    {
      time: "20:00",
      title: "Ẩm Thực Thực Dưỡng Trị Liệu Tối",
      description:
        "Bữa tối nhẹ nhàng với súp sâm bổ lượng, cơm gạo lứt hạt sen, nuôi dưỡng hệ tiêu hóa và chuẩn bị cho giấc ngủ sâu.",
      activity: "Organic Dinner & Sleep Therapy",
    },
  ];

  return (
    <section className="py-24 bg-[#fafbfa] text-sage-950 font-sans border-b border-sage-200/50">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-primary-600 block">
            Nhịp Điệu Sống Chậm
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-tight">
            Một Ngày Tại Ngũ Sơn
          </h2>
          <div className="flex items-center justify-center space-x-3 mt-6">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-primary-300" />
            <Leaf className="h-3.5 w-3.5 text-primary-600/80" />
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-primary-300" />
          </div>
          <p className="text-sm sm:text-base text-sage-600 font-light leading-relaxed pt-2">
            Hành trình chánh niệm được thiết kế theo đồng hồ sinh học tự nhiên,
            dẫn dắt bạn qua những khoảnh khắc phục hồi Thân – Tâm – Trí toàn
            diện.
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="relative border-l border-primary-200 max-w-3xl mx-auto pl-8 sm:pl-12 space-y-12 py-2">
          {schedule.map((item, idx) => (
            <div key={idx} className="relative group text-left">
              {/* Timeline Dot Indicator */}
              <span className="absolute -left-[41px] sm:-left-[57px] top-1 h-6 w-6 sm:h-8 sm:w-8 rounded-none bg-primary-50 border border-primary-300 flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold text-primary-850 group-hover:bg-primary-950 group-hover:text-white group-hover:border-primary-950 transition-colors duration-300">
                {idx + 1}
              </span>

              {/* Box Content */}
              <div className="bg-[#f5f5f0]/50 border border-primary-100 p-6 sm:p-8 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="text-sm font-mono font-bold text-primary-800 bg-primary-100 px-2.5 py-0.5 border border-primary-150/50">
                    ⏱ {item.time}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-sage-400">
                    {item.activity}
                  </span>
                </div>

                <h3 className="font-serif text-lg sm:text-xl font-bold text-sage-900 mt-1">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-sage-600 font-light leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
