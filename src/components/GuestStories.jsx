import React from "react";

export default function GuestStories() {
  const stories = [
    {
      name: "Nguyễn Bích Phương",
      stayDate: "Tháng 4, 2026",
      title: "Hành trình trọn vẹn tái sinh Thân - Tâm - Trí",
      text: "Sau 3 ngày ngắt kết nối với công việc, được ngâm mình trong thảo dược lá tắm Dao Đỏ cổ truyền và thiền chuông xoay, tôi cảm giác như cơ thể mình được thanh lọc hoàn toàn. Cảm ơn sự tận tâm của đội ngũ trị liệu tại Ngũ Sơn.",
      rating: 5,
      roomType: "Sen Sanctuary Villa",
    },
    {
      name: "Trần Minh Hoàng",
      stayDate: "Tháng 5, 2026",
      title: "Khôi phục cột sống thắt lưng sau nhiều năm đau nhức",
      text: "Các bài tập vật lý trị liệu cột sống kết hợp máy laser chuyên dụng cùng các bữa ăn thực dưỡng giàu hydro đã làm khớp gối của tôi dịu đi rất nhiều. Đây là resort duy nhất tôi thấy tập trung sâu sắc vào trị liệu y khoa thực tế.",
      rating: 5,
      roomType: "Thông Forest Villa",
    },
    {
      name: "Elizabeth Vance",
      stayDate: "Tháng 3, 2026",
      title: "A true wellness retreat that exceeded my expectations",
      text: "The sunrise yoga sessions and fresh farm-to-table organic foods were incredible. No TV, no notifications - just the sound of wind in the pine forest. My sleep quality improved instantly. I will definitely return next year.",
      rating: 5,
      roomType: "Mây Valley Premium Villa",
    },
  ];

  return (
    <section className="py-24 bg-[#f5f5f0] text-sage-950 font-sans border-b border-sage-200/50">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-primary-600 block">
            Cảm Nhận Thực Tế
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-tight">
            Nhật Ký Trải Nghiệm Khách Hàng
          </h2>
          <div className="h-[1px] w-12 bg-primary-300 mx-auto mt-6" />
          <p className="text-sm sm:text-base text-sage-600 font-light leading-relaxed pt-2">
            Những chia sẻ chân thực từ những tâm hồn đã tìm lại sự cân bằng,
            phục hồi sức khỏe thể chất và tâm trí sau kỳ nghỉ tại Ngũ Sơn.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story, i) => (
            <div
              key={i}
              className="bg-white border border-primary-100 p-8 flex flex-col justify-between text-left shadow-2xs group hover:border-primary-800 transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Rating & Room Info */}
                <div className="flex justify-between items-center text-[10px] text-sage-400 font-semibold border-b border-sage-100 pb-3">
                  <span className="font-mono text-primary-850 font-bold uppercase tracking-wider">
                    {story.roomType}
                  </span>
                  <div className="flex items-center space-x-1 text-amber-500">
                    {"★".repeat(story.rating)}
                  </div>
                </div>

                <h3 className="font-serif text-lg font-bold text-sage-900 leading-tight">
                  "{story.title}"
                </h3>

                <p className="text-xs sm:text-sm text-sage-600 font-light leading-relaxed italic">
                  "{story.text}"
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-sage-100 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-sage-900 block">
                    {story.name}
                  </span>
                  <span className="text-[10px] text-sage-450 font-light block mt-0.5">
                    {story.stayDate}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-primary-650 bg-primary-50 px-2 py-0.5 border border-primary-100 uppercase tracking-wider">
                  Verified Guest
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
