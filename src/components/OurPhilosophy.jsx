import React from "react";

export default function OurPhilosophy() {
  return (
    <section className="py-24 bg-[#fafbfa] text-sage-950 font-sans border-b border-sage-200/50">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-primary-600 block">
            Triết Lý Sống Chậm
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-tight">
            Thân – Tâm – Trí Khỏe Mạnh
          </h2>
          <div className="h-[1px] w-12 bg-primary-300 mx-auto mt-6" />
          <p className="text-sm sm:text-base text-sage-600 font-light leading-relaxed pt-2">
            Tại Ngũ Sơn, chúng tôi tin rằng sự thư thái đích thực chỉ đạt được
            khi ba yếu tố cốt lõi của con người được nuôi dưỡng trong sự hòa hợp
            hoàn hảo với tự nhiên.
          </p>
        </div>

        {/* Philosophy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-8 lg:gap-16">
          {/* Than */}
          <div className="space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="w-12 h-12 bg-primary-100 flex items-center justify-center font-serif text-xl text-primary-800 rounded-none border border-primary-200">
              Thân
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-sage-900">
              Nuôi Dưỡng Bản Thể
            </h3>
            <p className="text-xs sm:text-sm text-sage-650 font-light leading-relaxed">
              Giải phóng mọi căng thẳng thể chất thông qua liệu pháp tắm khoáng
              nóng thảo dược, chế độ ăn thực dưỡng hữu cơ (farm-to-table) và các
              bài tập vận động trị liệu cột sống chuyên sâu.
            </p>
            <ul className="text-left text-[11px] text-sage-500 font-medium space-y-2 pt-2 self-start md:self-auto">
              <li className="flex items-center space-x-2">
                <span className="text-primary-600">✓</span>
                <span>Ẩm thực trị liệu 100% hữu cơ</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-primary-600">✓</span>
                <span>Tắm bùn khoáng nóng ngâm thảo dược</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-primary-600">✓</span>
                <span>Phục hồi cơ khớp cột sống</span>
              </li>
            </ul>
          </div>

          {/* Tam */}
          <div className="space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="w-12 h-12 bg-primary-100 flex items-center justify-center font-serif text-xl text-primary-800 rounded-none border border-primary-200">
              Tâm
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-sage-900">
              Tìm Về An Yên
            </h3>
            <p className="text-xs sm:text-sm text-sage-650 font-light leading-relaxed">
              Lắng dịu tâm trí giữa tiếng gió ngàn rừng thông qua những buổi
              thiền hành sáng sớm, yoga dòng chảy năng lượng và các bài tập hít
              thở thư giãn sâu giải tỏa lo âu.
            </p>
            <ul className="text-left text-[11px] text-sage-500 font-medium space-y-2 pt-2 self-start md:self-auto">
              <li className="flex items-center space-x-2">
                <span className="text-primary-600">✓</span>
                <span>Thiền hành rừng thông sớm mai</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-primary-600">✓</span>
                <span>Hatha Yoga phục hồi tâm trí</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-primary-600">✓</span>
                <span>Liệu pháp chuông xoay Tây Tạng</span>
              </li>
            </ul>
          </div>

          {/* Tri */}
          <div className="space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="w-12 h-12 bg-primary-100 flex items-center justify-center font-serif text-xl text-primary-800 rounded-none border border-primary-200">
              Trí
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-sage-900">
              Khai Mở Tuệ Giác
            </h3>
            <p className="text-xs sm:text-sm text-sage-650 font-light leading-relaxed">
              Tái tạo trí tuệ thông qua không gian yên tĩnh tuyệt đối cho việc
              đọc sách, chương trình "Digital Detox" ngắt kết nối công nghệ và
              các hội thảo thảo luận sức khỏe tự nhiên.
            </p>
            <ul className="text-left text-[11px] text-sage-500 font-medium space-y-2 pt-2 self-start md:self-auto">
              <li className="flex items-center space-x-2">
                <span className="text-primary-600">✓</span>
                <span>Không gian Digital Detox ngắt kết nối</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-primary-600">✓</span>
                <span>Thư viện sách triết học & sức khỏe</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-primary-600">✓</span>
                <span>Trà đạo & Chia sẻ y học cổ truyền</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
