import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Crown,
  Leaf,
  ArrowRight,
  X,
  CheckCircle2,
  Loader2,
  Calendar,
  ChevronRight,
  Star,
  Compass,
  ShieldCheck,
} from "lucide-react";

import { mainRoomsList } from "../mockData";

// Local assets
import resortHeroBg from "../assets/resort_spa_hero_bg.png";
import serviceSpa from "../assets/service_spa.png";
import serviceYoga from "../assets/service_yoga.png";
import serviceTherapy from "../assets/service_therapy.png";

// Reusable ScrollReveal wrapper component using IntersectionObserver
function ScrollReveal({ children, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[1200ms] cubic-bezier(0.16, 1, 0.3, 1) transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Custom luxury consultation request modal
function ConsultationModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    interest: "spa",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên.";
    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!/^[0-9+-\s]{9,12}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không đúng định dạng.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập địa chỉ email.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Địa chỉ email không hợp lệ.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const handleClose = () => {
    onClose();
    setIsSubmitted(false);
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      interest: "spa",
      message: "",
    });
    setErrors({});
  };

  return (
    <div className="fixed inset-0 bg-[#070e0a]/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 border border-[#2d5a3b]/25 max-w-lg w-full p-8 sm:p-10 shadow-[0_30px_70px_rgba(26,44,34,0.18)] text-left rounded-3xl relative animate-fade-in text-[#14291c]">
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-sage-600 hover:text-[#2d5a3b] transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="inline-flex p-4 bg-[#2d5a3b]/10 text-[#2d5a3b] rounded-full border border-[#2d5a3b]/25 animate-pulse">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h4 className="font-serif text-2xl font-light text-[#14291c]">
              Gửi Yêu Cầu Thành Công!
            </h4>
            <p className="text-xs sm:text-sm text-[#2b4d37] font-light leading-relaxed max-w-md mx-auto">
              Cảm ơn quý khách <strong className="text-[#070e0a]">{formData.fullName}</strong> đã đăng ký. Đội ngũ chuyên viên tư vấn trị liệu của Ngũ Sơn Resort sẽ liên hệ hỗ trợ bạn qua SĐT <strong className="text-[#070e0a]">{formData.phone}</strong> trong vòng 15 phút.
            </p>
            <button
              onClick={handleClose}
              className="px-8 py-3 bg-[#2d5a3b] text-white hover:bg-[#3b754e] text-xs font-bold uppercase tracking-widest rounded-full transition-colors duration-300 cursor-pointer"
            >
              Đóng hộp thoại
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 border-b border-[#2d5a3b]/15 pb-4">
              <span className="text-xs font-bold text-[#2d5a3b] uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Crown className="h-3 w-3 text-[#2d5a3b]" />
                Royal Consultation Request
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#14291c]">
                Đăng Ký Tư Vấn Trị Liệu
              </h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#375a43]">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white border border-[#2d5a3b]/25 rounded-lg text-[#14291c] placeholder-sage-400 focus:outline-none focus:ring-1 focus:ring-[#2d5a3b] transition-colors text-sm ${errors.fullName ? "border-red-400" : ""
                    }`}
                />
                {errors.fullName && (
                  <span className="text-xs text-red-600 block">{errors.fullName}</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#375a43]">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white border border-[#2d5a3b]/25 rounded-lg text-[#14291c] placeholder-sage-400 focus:outline-none focus:ring-1 focus:ring-[#2d5a3b] transition-colors text-sm ${errors.phone ? "border-red-400" : ""
                      }`}
                  />
                  {errors.phone && (
                    <span className="text-xs text-red-600 block">{errors.phone}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#375a43]">
                    Địa chỉ Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="khach@gmail.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white border border-[#2d5a3b]/25 rounded-lg text-[#14291c] placeholder-sage-400 focus:outline-none focus:ring-1 focus:ring-[#2d5a3b] transition-colors text-sm ${errors.email ? "border-red-400" : ""
                      }`}
                  />
                  {errors.email && (
                    <span className="text-xs text-red-600 block">{errors.email}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#375a43]">
                  Lộ trình trị liệu cần tư vấn
                </label>
                <select
                  name="interest"
                  value={formData.interest}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-[#2d5a3b]/25 text-[#14291c] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2d5a3b] appearance-none font-semibold cursor-pointer text-sm"
                >
                  <option value="spa">Spa & Tắm Lá Thuốc Cổ Truyền</option>
                  <option value="yoga">Thiền & Hatha Yoga Phục Hồi</option>
                  <option value="physio">Vật Lý Trị Liệu Xương Khớp Cột Sống</option>
                  <option value="meals">Chế Độ Thực Dưỡng Chữa Lành</option>
                  <option value="general">Hạng Phòng / Căn Biệt Thự Nghỉ Dưỡng</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#375a43]">
                  Ghi chú tình trạng sức khỏe / Mong muốn đặc biệt
                </label>
                <textarea
                  name="message"
                  placeholder="VD: Cần tư vấn lộ trình giảm đau khớp gối..."
                  rows="3"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-[#2d5a3b]/25 text-[#14291c] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2d5a3b] resize-none text-sm"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-[#2d5a3b]/15">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 border border-[#2d5a3b]/25 text-sage-600 hover:bg-[#2d5a3b]/5 text-xs font-bold uppercase tracking-widest rounded-full transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-2.5 bg-gradient-to-r from-[#2d5a3b] to-[#1e3d27] hover:from-[#3b754e] hover:to-[#264a30] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" /> Đang gửi...
                  </>
                ) : (
                  "Gửi yêu cầu"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Wellness experiences mock data
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
      image: serviceSpa,
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
      image: serviceYoga,
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
      image: serviceTherapy,
    },
  ];

  // A Day at Ngu Son schedule data
  const schedule = [
    {
      time: "06:30",
      title: "Bình Minh Thiền Định Rừng Thông",
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

  // Guest stories testimonials data
  const guestStories = [
    {
      name: "Nguyễn Bích Phương",
      stayDate: "Tháng 4, 2026",
      title: "Hành trình trọn vẹn tái sinh Thân - Tâm - Trí",
      text: "Sau 3 ngày ngắt kết nối với công việc, được ngâm mình trong thảo dược lá tắm Dao Đỏ cổ truyền và thiền chuông xoay, tôi cảm giác như cơ thể mình được thanh lọc hoàn toàn. Cảm ơn sự tận tâm của đội ngũ trị liệu tại Ngũ Sơn.",
      roomType: "Sen Sanctuary Villa",
    },
    {
      name: "Trần Minh Hoàng",
      stayDate: "Tháng 5, 2026",
      title: "Khôi phục cột sống sau nhiều năm đau nhức",
      text: "Các bài tập vật lý trị liệu cột sống kết hợp máy laser chuyên dụng cùng các bữa ăn thực dưỡng giàu hydro đã làm khớp gối của tôi dịu đi rất nhiều. Đây là resort duy nhất tôi thấy tập trung sâu sắc vào trị liệu y khoa thực tế.",
      roomType: "Thông Forest Villa",
    },
    {
      name: "Elizabeth Vance",
      stayDate: "Tháng 3, 2026",
      title: "A true wellness retreat that exceeded my expectations",
      text: "The sunrise yoga sessions and fresh farm-to-table organic foods were incredible. No TV, no notifications - just the sound of wind in the pine forest. My sleep quality improved instantly. I will definitely return next year.",
      roomType: "Mây Valley Premium Villa",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-[#d5e5d3] via-[#e2ebe0] to-[#cbdcc9] text-[#14291c] min-h-screen font-sans overflow-x-hidden selection:bg-[#2d5a3b]/20 selection:text-[#2d5a3b]">

      {/* 1. Cinematic Hero Banner */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-32 border-b border-[#2d5a3b]/10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 transition-transform duration-[12000ms] scale-105"
          style={{ backgroundImage: `url(${resortHeroBg})` }}
        />
        {/* Soft Natural Sage Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#d5e5d3]/15 via-[#e2ebe0]/80 to-[#d5e5d3]" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.3em] text-[#2d5a3b] bg-white/90 border border-[#2d5a3b]/20 px-6 py-3 rounded-full shadow-sm shadow-[#2d5a3b]/5">
              <Crown className="h-3.5 w-3.5 text-[#2d5a3b] animate-pulse" />
              Ngũ Sơn Signature Living
            </span>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <h1 className="font-serif text-4xl sm:text-6xl md:text-8xl font-light tracking-wide text-[#14291c] leading-tight">
              NƠI TRẢI NGHIỆM <br />
              <span className="italic font-serif text-[#2d5a3b] font-normal">Trị Liệu Tự Nhiên</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="w-24 h-[1px] bg-[#2d5a3b]/30 mx-auto my-8" />
          </ScrollReveal>

          <ScrollReveal delay={450}>
            <p className="text-[#2b4d37] text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto font-light tracking-wide opacity-95">
              Hãy đặt chân vào vùng đất của tĩnh lặng và phục hồi. Nơi mỗi vị khách đều được đón tiếp như những vị hoàng đế, trải nghiệm các liệu trình y học cổ truyền và tận hưởng đặc quyền sống chánh niệm trọn vẹn.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={600}>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
              <a
                href="/dat-lich"
                className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 text-xs font-bold tracking-widest bg-gradient-to-r from-[#2d5a3b] to-[#1e3d27] text-white hover:from-[#3b754e] hover:to-[#264a30] transition-all duration-300 shadow-md hover:-translate-y-0.5 hover:scale-105 uppercase cursor-pointer rounded-full"
              >
                Đặt lịch trải nghiệm
              </a>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 text-xs font-bold tracking-widest border border-[#2d5a3b]/30 text-[#2d5a3b] hover:bg-[#2d5a3b]/10 hover:text-[#14291c] transition-all duration-300 uppercase cursor-pointer bg-white/40 backdrop-blur-sm shadow-sm rounded-full"
              >
                Nhận tư vấn Trị Liệu
              </button>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* 2. Philosophy Section (Triết Lý Sống Chậm) */}
      <div className="py-32 bg-transparent relative border-b border-[#2d5a3b]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-24 space-y-4">
              <span className="text-xs font-bold tracking-[0.25em] text-[#2d5a3b] uppercase block">
                NỀN TẢNG CHỮA LÀNH
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#14291c] leading-tight">
                Triết Lý Sống Chậm Thân - Tâm - Trí
              </h2>
              <div className="flex items-center justify-center space-x-3 mt-6">
                <div className="h-[1px] w-8 bg-[#2d5a3b]/30" />
                <Leaf className="h-4 w-4 text-[#2d5a3b]/75" />
                <div className="h-[1px] w-8 bg-[#2d5a3b]/30" />
              </div>
              <p className="text-sm text-[#2b4d37] font-light leading-relaxed max-w-lg mx-auto">
                Tại Ngũ Sơn, sự thư thái và tái sinh đích thực đạt được khi ba yếu tố cốt lõi của sinh mệnh được kết nối đồng điệu với nhịp đập tự nhiên.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">

            {/* Thân */}
            <ScrollReveal delay={100}>
              <div className="bg-white/70 backdrop-blur-md border border-[#2d5a3b]/10 p-8 sm:p-10 rounded-3xl relative shadow-[0_20px_50px_rgba(45,90,59,0.03)] hover:border-[#2d5a3b]/30 hover:shadow-[0_25px_60px_rgba(45,90,59,0.07)] hover:-translate-y-2 transition-all duration-550 group flex flex-col justify-between min-h-[380px]">
                <div className="absolute -top-10 right-6 font-serif text-[110px] font-bold text-[#2d5a3b]/5 select-none group-hover:text-[#2d5a3b]/10 transition-colors duration-500">I</div>
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-[#eef4ed] text-[#2d5a3b] border border-[#2d5a3b]/25 flex items-center justify-center font-serif text-lg rounded-xl">Thân</div>
                  <h3 className="font-serif text-xl sm:text-2xl font-light text-[#14291c] tracking-wide pt-2">Nuôi Dưỡng Bản Thể</h3>
                  <p className="text-sm text-[#2b4d37] font-light leading-relaxed">
                    Giải phóng mọi tắc nghẽn thể chất bằng liệu pháp tắm lá thuốc Dao Đỏ, ngâm mình trong dòng khoáng nóng gỗ Tuyết Tùng và các chế độ dinh dưỡng trị liệu thực dưỡng.
                  </p>
                </div>
                <ul className="text-xs text-[#2d5a3b] space-y-2 pt-6 border-t border-[#2d5a3b]/10 mt-6 font-semibold">
                  <li className="flex items-center gap-2">• Ẩm thực hữu cơ 100% tự nhiên</li>
                  <li className="flex items-center gap-2">• Ngâm lá thuốc Dao Đỏ lộ thiên</li>
                  <li className="flex items-center gap-2">• Phục hồi cơ khớp cột sống</li>
                </ul>
              </div>
            </ScrollReveal>

            {/* Tâm */}
            <ScrollReveal delay={200}>
              <div className="bg-white/70 backdrop-blur-md border border-[#2d5a3b]/10 p-8 sm:p-10 rounded-3xl relative shadow-[0_20px_50px_rgba(45,90,59,0.03)] hover:border-[#2d5a3b]/30 hover:shadow-[0_25px_60px_rgba(45,90,59,0.07)] hover:-translate-y-2 transition-all duration-550 group flex flex-col justify-between min-h-[380px]">
                <div className="absolute -top-10 right-6 font-serif text-[110px] font-bold text-[#2d5a3b]/5 select-none group-hover:text-[#2d5a3b]/10 transition-colors duration-500">II</div>
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-[#eef4ed] text-[#2d5a3b] border border-[#2d5a3b]/25 flex items-center justify-center font-serif text-lg rounded-xl">Tâm</div>
                  <h3 className="font-serif text-xl sm:text-2xl font-light text-[#14291c] tracking-wide pt-2">Tìm Về Tĩnh Lặng</h3>
                  <p className="text-sm text-[#2b4d37] font-light leading-relaxed">
                    Lắng nghe hơi thở giữa sương mai đồi thông. Xoa dịu tâm trí thông qua những buổi Hatha Yoga phục hồi sức sống và âm thanh trầm bổng từ chuông xoay Tây Tạng.
                  </p>
                </div>
                <ul className="text-xs text-[#2d5a3b] space-y-2 pt-6 border-t border-[#2d5a3b]/10 mt-6 font-semibold">
                  <li className="flex items-center gap-2">• Thiền định Forest Bathing sớm mai</li>
                  <li className="flex items-center gap-2">• Yoga dòng chảy năng lượng phục hồi</li>
                  <li className="flex items-center gap-2">• Liệu pháp chuông xoay Tây Tạng</li>
                </ul>
              </div>
            </ScrollReveal>

            {/* Trí */}
            <ScrollReveal delay={300}>
              <div className="bg-white/70 backdrop-blur-md border border-[#2d5a3b]/10 p-8 sm:p-10 rounded-3xl relative shadow-[0_20px_50px_rgba(45,90,59,0.03)] hover:border-[#2d5a3b]/30 hover:shadow-[0_25px_60px_rgba(45,90,59,0.07)] hover:-translate-y-2 transition-all duration-550 group flex flex-col justify-between min-h-[380px]">
                <div className="absolute -top-10 right-6 font-serif text-[110px] font-bold text-[#2d5a3b]/5 select-none group-hover:text-[#2d5a3b]/10 transition-colors duration-500">III</div>
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-[#eef4ed] text-[#2d5a3b] border border-[#2d5a3b]/25 flex items-center justify-center font-serif text-lg rounded-xl">Trí</div>
                  <h3 className="font-serif text-xl sm:text-2xl font-light text-[#14291c] tracking-wide pt-2">Khai Mở Tuệ Giác</h3>
                  <p className="text-sm text-[#2b4d37] font-light leading-relaxed">
                    Khám phá sự uyên bác từ y học cổ truyền. Khởi động chương trình Digital Detox để ngắt kết nối với thế giới công nghệ ồn ào và quay về đối thoại nội tâm.
                  </p>
                </div>
                <ul className="text-xs text-[#2d5a3b] space-y-2 pt-6 border-t border-[#2d5a3b]/10 mt-6 font-semibold">
                  <li className="flex items-center gap-2">• Không gian Digital Detox ngắt kết nối</li>
                  <li className="flex items-center gap-2">• Thư viện sách sức khỏe & triết học</li>
                  <li className="flex items-center gap-2">• Trà đạo đàm đạo y học tự nhiên</li>
                </ul>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </div>

      {/* 3. Wellness Experiences (Trải Nghiệm Trị Liệu) */}
      <div className="py-16 bg-transparent relative border-b border-[#2d5a3b]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <ScrollReveal>
            <div className="max-w-2xl mb-12 space-y-4 text-left">
              <span className="text-xs font-bold tracking-[0.25em] text-[#2d5a3b] uppercase block">
                LỘ TRÌNH ĐỘC BẢN
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#14291c] leading-tight">
                Liệu Pháp Chữa Lành Trị Liệu Cao Cấp
              </h2>
              <div className="w-16 h-[1.5px] bg-[#2d5a3b] mt-4" />
              <p className="text-sm text-[#2b4d37] font-light leading-relaxed pt-2">
                Các phương pháp chăm sóc sức khỏe chủ động được nghiên cứu và thiết kế chuyên biệt bởi các bác sĩ đầu ngành y học tự nhiên.
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-16">
            {experiences.map((exp, index) => {
              const isEven = index % 2 === 0;
              const formattedNumber = String(index + 1).padStart(2, "0");
              return (
                <ScrollReveal key={exp.id}>
                  <div className={`flex flex-col lg:flex-row items-stretch ${isEven ? "" : "lg:flex-row-reverse"} relative`}>

                    {/* Serif Numbering background */}
                    <span className="hidden lg:block absolute -top-16 left-1/2 -translate-x-1/2 font-serif text-[180px] font-bold text-[#2d5a3b]/6 select-none pointer-events-none z-0">
                      {formattedNumber}
                    </span>

                    {/* Image Column */}
                    <div className="w-full lg:w-[62%] rounded-tl-[90px] rounded-br-[90px] rounded-tr-[16px] rounded-bl-[16px] overflow-hidden shadow-xl relative min-h-[380px] lg:min-h-[460px] flex items-stretch border border-[#2d5a3b]/12 group z-0">
                      <img
                        src={exp.image}
                        alt={exp.title}
                        className="w-full h-full object-cover transition-transform duration-[8000ms] group-hover:scale-105"
                      />
                      {/* Light Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#ebf2ea]/85 via-transparent to-transparent pointer-events-none" />

                      <span className="absolute top-6 left-6 text-xs font-semibold uppercase tracking-[0.2em] bg-white/95 backdrop-blur-md text-[#2d5a3b] border border-[#2d5a3b]/15 px-5 py-2.5 rounded-full shadow-sm">
                        Ngũ Sơn Retreat
                      </span>
                    </div>

                    {/* Overlapping Details Card */}
                    <div className={`w-full lg:w-[46%] bg-white/80 backdrop-blur-md border border-white/60 p-8 sm:p-12 shadow-[0_20px_50px_rgba(45,90,59,0.03)] hover:shadow-[0_30px_70px_rgba(45,90,59,0.07)] rounded-3xl z-10 flex flex-col justify-between space-y-6 lg:self-center transition-all duration-500 ${isEven ? "lg:-ml-24" : "lg:-mr-24"
                      }`}>
                      <div className="space-y-4">
                        <span className="text-xs font-bold text-[#2d5a3b] uppercase tracking-[0.2em] bg-[#eef4ed] border border-[#2d5a3b]/15 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
                          <Crown className="h-3.5 w-3.5 text-[#2d5a3b]" />
                          {exp.tag}
                        </span>

                        <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#14291c] tracking-wide leading-tight border-b border-[#2d5a3b]/10 pb-4">
                          {exp.title}
                        </h3>

                        <p className="text-[#2b4d37] text-sm font-light leading-relaxed opacity-95 text-left">
                          {exp.description}
                        </p>
                      </div>

                      {/* Spa Menu Specs */}
                      <div className="pt-4 border-t border-[#2d5a3b]/10">
                        <span className="text-xs text-[#2d5a3b] font-bold uppercase tracking-[0.2em] block mb-3 pl-2 border-l-2 border-[#2d5a3b]">
                          Liệu trình chi tiết bao gồm
                        </span>
                        <ul className="space-y-2 text-xs text-[#2b4d37] font-light pl-2">
                          {exp.benefits.map((benefit, bIdx) => (
                            <li key={bIdx} className="flex items-center gap-2.5 text-left">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#2d5a3b]" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 flex justify-start">
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="inline-flex items-center gap-2 text-xs font-bold text-[#2d5a3b] hover:text-[#14291c] uppercase tracking-widest transition-colors duration-300 cursor-pointer group"
                        >
                          <span>Liên hệ đặt lịch</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>

                  </div>
                </ScrollReveal>
              );
            })}
          </div>

        </div>
      </div>

      {/* 4. Rooms Showcase Section */}
      <div className="py-16 bg-gradient-to-b from-transparent via-[#dce8db]/25 to-transparent border-b border-[#2d5a3b]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 text-left">
              <div className="max-w-xl">
                <span className="text-xs font-bold tracking-[0.25em] text-[#2d5a3b] uppercase block">
                  BIỆT THỰ NGHỈ DƯỠNG
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#14291c] leading-tight mt-3">
                  Không Gian Lưu Trú Độc Bản Gần Gũi Thiên Nhiên
                </h2>
                <div className="w-16 h-[1.5px] bg-[#2d5a3b] mt-4" />
              </div>
              <p className="text-[#2b4d37] font-light text-sm max-w-md leading-relaxed">
                Tọa lạc riêng tư bên bờ suối róc rách hay ẩn mình giữa vạt thông xanh. Từng căn Bungalow, Villa được xây dựng hoàn toàn từ gỗ tuyết tùng, đá cuội và lá tranh organic mang lại năng lượng phong thủy vượng khí.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            {mainRoomsList.map((room, index) => {
              const formattedNumber = String(index + 1).padStart(2, "0");
              return (
                <ScrollReveal key={index} delay={index * 150}>
                  <div className="group relative flex flex-col justify-between h-full bg-white/80 backdrop-blur-md border border-[#2d5a3b]/10 hover:border-[#2d5a3b]/25 rounded-3xl overflow-hidden transition-all duration-500 shadow-[0_15px_45px_rgba(45,90,59,0.03)] hover:shadow-[0_25px_60px_rgba(45,90,59,0.08)]">

                    {/* Number Overlay */}
                    <span className="absolute top-4 right-6 font-serif text-6xl font-bold text-[#2d5a3b]/10 select-none pointer-events-none group-hover:text-[#2d5a3b]/15 transition-colors duration-500 z-10">
                      {formattedNumber}
                    </span>

                    {/* Image */}
                    <div className="w-full aspect-[16/10] overflow-hidden relative border-b border-[#2d5a3b]/10">
                      <img
                        src={room.image}
                        alt={room.title}
                        className="w-full h-full object-cover transition-transform duration-[6000ms] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-[#f5f7f4]/5 group-hover:bg-transparent transition-colors duration-500" />
                    </div>

                    {/* Details Box */}
                    <div className="p-8 sm:p-10 space-y-6 flex flex-col justify-between flex-grow">
                      <div className="space-y-3 text-left">
                        <span className="text-xs font-bold text-[#2d5a3b] uppercase tracking-[0.2em] bg-[#eef4ed] border border-[#2d5a3b]/15 px-3 py-1 rounded-full inline-block">
                          {room.amenity}
                        </span>
                        <h3 className="font-serif text-2xl font-light text-[#14291c] group-hover:text-[#2d5a3b] transition-colors duration-300">
                          {room.title}
                        </h3>
                        <p className="text-sm text-[#2b4d37] font-light leading-relaxed">
                          {room.description}
                        </p>
                      </div>

                      {/* Specs */}
                      <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-[#2d5a3b]/10 text-xs text-left">
                        <div>
                          <span className="text-[10px] text-[#4d7058] font-bold uppercase tracking-wider block mb-1">Diện tích</span>
                          <span className="font-serif text-sm font-light text-[#14291c]">{room.size}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#4d7058] font-bold uppercase tracking-wider block mb-1">Sức chứa</span>
                          <span className="font-serif text-sm font-light text-[#14291c]">{room.capacity}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#4d7058] font-bold uppercase tracking-wider block mb-1">Dịch vụ</span>
                          <span className="font-serif text-sm font-light text-[#14291c]">Thực dưỡng</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-4">
                        <div className="text-left">
                          <span className="text-[8px] text-[#2d5a3b] font-bold uppercase tracking-wider block">Giá tham khảo</span>
                          <span className="font-serif text-lg text-[#1a2f23] font-light mt-0.5 block">{room.price} <span className="text-[10px] text-sage-400">/ đêm</span></span>
                        </div>

                        <Link
                          to="/phong-o"
                          className="px-6 py-3 bg-gradient-to-r from-[#2d5a3b] to-[#1e3d27] text-white hover:from-[#3b754e] hover:to-[#264a30] text-[10px] font-bold uppercase tracking-widest text-center transition-all duration-300 shadow-md hover:-translate-y-0.5 rounded-full"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>

                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          <div className="mt-20 text-center">
            <ScrollReveal>
              <Link
                to="/phong-o"
                className="inline-flex items-center gap-2 px-10 py-4 text-xs font-bold uppercase tracking-widest border border-[#2d5a3b]/30 text-[#2d5a3b] hover:text-[#1a2f23] hover:bg-white/5 transition-all duration-300 cursor-pointer rounded-full"
              >
                <span>Khám Phá Tất Cả Hạng Phòng</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </ScrollReveal>
          </div>

        </div>
      </div>

      {/* 5. A Day at Ngu Son Timeline Section */}
      <div className="py-16 bg-transparent relative border-b border-[#2d5a3b]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
              <span className="text-xs font-bold tracking-[0.25em] text-[#2d5a3b] uppercase block">
                NHỊP ĐIỆU HOÀNG GIA
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#14291c] leading-tight">
                Một Ngày Trải Nghiệm Chánh Niệm
              </h2>
              <div className="flex items-center justify-center space-x-3 mt-6">
                <div className="h-[1px] w-8 bg-[#2d5a3b]/30" />
                <Leaf className="h-4 w-4 text-[#2d5a3b]/75" />
                <div className="h-[1px] w-8 bg-[#2d5a3b]/30" />
              </div>
              <p className="text-sm text-[#2b4d37] font-light leading-relaxed max-w-lg mx-auto">
                Hành trình nghỉ dưỡng được thiết kế khoa học dựa theo nhịp sinh học tự nhiên của cơ thể để tối ưu khả năng tự chữa lành của tế bào.
              </p>
            </div>
          </ScrollReveal>

          {/* Timeline */}
          <div className="relative border-l border-[#2d5a3b]/20 max-w-3xl mx-auto pl-8 sm:pl-16 space-y-8 py-2">
            {schedule.map((item, idx) => (
              <ScrollReveal key={idx} delay={idx * 100}>
                <div className="relative group text-left">

                  {/* Bullet */}
                  <span className="absolute -left-[45px] sm:-left-[69px] top-1.5 h-8 w-8 rounded-full bg-[#eef4ed] border border-[#2d5a3b]/20 flex items-center justify-center text-xs font-mono font-bold text-[#2d5a3b] group-hover:bg-[#2d5a3b] group-hover:text-white group-hover:border-[#2d5a3b] transition-colors duration-300 shadow-md">
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Card Content */}
                  <div className="bg-white/80 backdrop-blur-md border border-[#2d5a3b]/10 p-6 sm:p-8 space-y-3 rounded-2xl shadow-[0_10px_35px_rgba(45,90,59,0.02)] hover:border-[#2d5a3b]/25 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#2d5a3b] bg-[#eef4ed] px-3 py-1 border border-[#2d5a3b]/15 rounded">
                        ⏱ {item.time}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#4d7058]">
                        {item.activity}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg sm:text-xl font-light text-[#14291c] pt-1">
                      {item.title}
                    </h3>

                    <p className="text-sm text-[#2b4d37] font-light leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </div>

      {/* 6. Guest Stories Section (Thư Tay Trải Nghiệm) */}
      <div className="py-16 bg-transparent relative border-b border-[#2d5a3b]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
              <span className="text-xs font-bold tracking-[0.25em] text-[#2d5a3b] uppercase block">
                CẢM NHẬN KHÁCH LƯU TRÚ
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#14291c] leading-tight">
                Nhật Ký Trải Nghiệm Chữa Lành
              </h2>
              <div className="flex items-center justify-center space-x-3 mt-6">
                <div className="h-[1px] w-8 bg-[#2d5a3b]/30" />
                <Leaf className="h-4 w-4 text-[#2d5a3b]/75" />
                <div className="h-[1px] w-8 bg-[#2d5a3b]/30" />
              </div>
              <p className="text-sm text-[#2b4d37] font-light leading-relaxed max-w-lg mx-auto">
                Những bức thư cảm ơn từ những tâm hồn đã tìm lại nguồn sức sống sảng khoái và sự thư thái viên mãn tại Ngũ Sơn.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {guestStories.map((story, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="bg-white/80 backdrop-blur-md border border-[#2d5a3b]/10 p-8 flex flex-col justify-between text-left shadow-[0_15px_45px_rgba(45,90,59,0.03)] rounded-2xl group hover:border-[#2d5a3b]/25 transition-all duration-300 min-h-[340px]">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-center text-xs text-[#2d5a3b] font-semibold border-b border-[#2d5a3b]/10 pb-3">
                      <span className="font-bold uppercase tracking-wider">{story.roomType}</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} className="h-3 w-3 fill-amber-500 stroke-none" />
                        ))}
                      </div>
                    </div>

                    <h3 className="font-serif text-lg font-light text-[#14291c] italic leading-snug">
                      "{story.title}"
                    </h3>

                    <p className="text-sm text-[#2b4d37] font-light leading-relaxed italic">
                      "{story.text}"
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#2d5a3b]/10 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-[#14291c] block">{story.name}</span>
                      <span className="text-[10px] text-sage-400 font-light block mt-0.5">{story.stayDate}</span>
                    </div>
                    <span className="text-xs font-bold text-[#2d5a3b] bg-[#eef4ed] border border-[#2d5a3b]/15 px-3 py-1 rounded-full uppercase tracking-wider">
                      Khách Thân Thiết
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </div>

      {/* 7. Bottom Booking CTA Section (Royal Invite Scroll) */}
      <div className="py-16 bg-transparent relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#2d5a3b]/5 rounded-full filter blur-3xl -translate-y-1/2 pointer-events-none" />
        <div className="absolute -bottom-20 right-0 w-96 h-96 bg-[#2d5a3b]/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-br from-[#dce8db] via-[#edf4ed] to-[#dce8db] border border-[#2d5a3b]/15 rounded-[40px] p-12 sm:p-20 shadow-[0_20px_50px_rgba(45,90,59,0.06)] relative overflow-hidden text-center">
            <ScrollReveal>
              <div className="space-y-8 max-w-3xl mx-auto">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#2d5a3b] bg-white border border-[#2d5a3b]/20 px-5 py-2.5 rounded-full shadow-sm">
                  <Crown className="h-3.5 w-3.5 text-[#2d5a3b]" />
                  Royal Invitation
                </span>

                <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-[#14291c] leading-tight">
                  Khởi Đầu Hành Trình <br />
                  <span className="italic font-serif text-[#2d5a3b] font-normal">Tái Sinh Sức Khỏe</span>
                </h2>

                <div className="flex items-center justify-center space-x-3 py-2">
                  <div className="h-[1px] w-12 bg-[#2d5a3b]/30" />
                  <Leaf className="h-4 w-4 text-[#2d5a3b]/75" />
                  <div className="h-[1px] w-12 bg-[#2d5a3b]/30" />
                </div>

                <p className="text-[#2b4d37] font-light text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                  Chọn biệt thự nghỉ dưỡng lý tưởng bên sườn đồi, lên lịch trình spa trị liệu cá nhân hóa và các buổi thiền định chuyên sâu. Mọi đặc quyền cao cấp nhất đang đón chờ hành trình chữa lành của quý khách.
                </p>

                <div className="pt-8">
                  <Link
                    to="/dat-lich"
                    className="inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-[#2d5a3b] to-[#1e3d27] text-white hover:from-[#3b754e] hover:to-[#264a30] text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-[#2d5a3b]/20 hover:-translate-y-0.5 hover:scale-103 cursor-pointer group rounded-full"
                  >
                    <Calendar className="h-4 w-4 mr-2 group-hover:rotate-6 transition-transform" />
                    Đặt biệt thự & Liệu trình trị liệu
                  </Link>
                </div>

                {/* Benefits list */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 max-w-2xl mx-auto text-xs text-[#2b4d37] font-semibold border-t border-[#2d5a3b]/15">
                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#2d5a3b]" />
                    <span>Bảo mật giao dịch tuyệt đối</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Compass className="h-4 w-4 text-[#2d5a3b]" />
                    <span>Lộ trình cá nhân hóa 1:1</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Leaf className="h-4 w-4 text-[#2d5a3b]" />
                    <span>Hoàn hủy phòng linh hoạt 48h</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Royal Consultation Modal Portal Overlay */}
      <ConsultationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </div>
  );
}
