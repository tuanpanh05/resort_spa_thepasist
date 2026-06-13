import React, { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import Modal from "./ui/Modal";
import heroBg from "../assets/hero_bg.png";

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    // Simulate API request
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with blur effect */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
        style={{
          backgroundImage: `url(${heroBg})`,
        }}
      />
      {/* Dark overlay with green tint */}
      <div className="absolute inset-0 bg-hero-overlay" />

      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-6 sm:px-8 text-center text-white z-10 pt-32 font-sans">
        <span className="block text-xs sm:text-sm font-semibold tracking-[0.25em] text-primary-200 uppercase mb-6 animate-fade-in">
          Khu Nghỉ Dưỡng Trị Liệu Thiên Nhiên
        </span>

        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-normal tracking-wide mb-8 animate-slide-up leading-tight text-white drop-shadow-sm">
          Ngũ Sơn Resort
        </h1>

        <p className="max-w-xl mx-auto text-sm sm:text-base md:text-lg text-white/80 font-light mb-12 leading-relaxed tracking-wide animate-slide-up">
          Tìm lại sự cân bằng hoàn hảo cho Thân – Tâm – Trí trong không gian
          xanh nguyên bản, hòa quyện cùng các liệu trình spa thảo dược, yoga
          thiền định và vật lý trị liệu chuyên sâu.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 animate-slide-up">
          <a
            href="/dat-lich"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-none text-xs font-semibold tracking-widest bg-white text-primary-950 hover:bg-white/90 transition-all duration-300 uppercase cursor-pointer"
          >
            Đặt lịch trải nghiệm
          </a>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-none text-xs font-semibold tracking-widest border border-white/40 text-white hover:bg-white/10 transition-all duration-300 uppercase cursor-pointer bg-transparent"
          >
            Tìm hiểu dịch vụ
          </button>
        </div>
      </div>

      {/* Consultation Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Yêu Cầu Tư Vấn Dịch Vụ"
      >
        {isSubmitted ? (
          <div className="text-center py-6 px-4 animate-fade-in font-sans">
            <div className="inline-flex p-3 bg-primary-100 text-primary-800 rounded-full mb-4">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h4 className="font-serif text-lg font-bold text-sage-900 mb-2">
              Gửi Yêu Cầu Thành Công!
            </h4>
            <p className="text-xs sm:text-sm text-sage-600 font-light leading-relaxed mb-6">
              Cảm ơn quý khách **{formData.fullName}** đã đăng ký. Đội ngũ chuyên viên tư vấn trị liệu của Ngũ Sơn Resort sẽ liên hệ hỗ trợ bạn qua SĐT **{formData.phone}** trong vòng 15 phút.
            </p>
            <button
              onClick={handleCloseModal}
              className="px-6 py-2 bg-primary-800 text-white hover:bg-primary-900 text-xs font-semibold uppercase tracking-wider rounded-none cursor-pointer"
            >
              Đóng hộp thoại
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs sm:text-sm text-sage-900">
            <p className="text-[11px] text-sage-500 font-light leading-relaxed">
              Vui lòng điền thông tin bên dưới để đăng ký nhận tư vấn lộ trình chăm sóc sức khỏe cá nhân hóa miễn phí.
            </p>
            
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-sage-800 mb-1.5">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2.5 bg-sage-50/50 border rounded-none text-sage-900 focus:outline-none focus:ring-1 focus:ring-primary-450 ${
                  errors.fullName ? "border-red-400" : "border-primary-200/50"
                }`}
              />
              {errors.fullName && (
                <span className="text-[10px] text-red-500 font-normal mt-1 block">{errors.fullName}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-sage-800 mb-1.5">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="0901234567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2.5 bg-sage-50/50 border rounded-none text-sage-900 focus:outline-none focus:ring-1 focus:ring-primary-450 ${
                    errors.phone ? "border-red-400" : "border-primary-200/50"
                  }`}
                />
                {errors.phone && (
                  <span className="text-[10px] text-red-500 font-normal mt-1 block">{errors.phone}</span>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-sage-800 mb-1.5">
                  Địa chỉ Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="khach@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2.5 bg-sage-50/50 border rounded-none text-sage-900 focus:outline-none focus:ring-1 focus:ring-primary-450 ${
                    errors.email ? "border-red-400" : "border-primary-200/50"
                  }`}
                />
                {errors.email && (
                  <span className="text-[10px] text-red-500 font-normal mt-1 block">{errors.email}</span>
                )}
              </div>
            </div>

            {/* Interest Selection */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-sage-800 mb-1.5">
                Dịch vụ cần tư vấn chính
              </label>
              <select
                name="interest"
                value={formData.interest}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-sage-50/50 border border-primary-200/50 text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-450 appearance-none font-semibold"
              >
                <option value="spa">Spa & Trị Liệu Thảo Dược</option>
                <option value="yoga">Yoga & Thiền Định Phục Hồi</option>
                <option value="physio">Vật Lý Trị Liệu Cột Sống</option>
                <option value="meals">Ẩm Thực Dinh Dưỡng Thực Dưỡng</option>
                <option value="general">Tư vấn chọn Villa & Đặt phòng</option>
              </select>
            </div>

            {/* Message Area */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-sage-800 mb-1.5">
                Nội dung câu hỏi / tình trạng sức khỏe cần lưu ý
              </label>
              <textarea
                name="message"
                placeholder="VD: Muốn đặt phòng nghỉ dưỡng kết hợp chữa đau vai gáy trị liệu..."
                rows="3"
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-sage-50/50 border border-primary-200/50 text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-450 font-medium resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2.5 border border-primary-200 text-sage-700 hover:bg-sage-50 text-xs font-semibold uppercase tracking-wider rounded-none cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-primary-800 hover:bg-primary-900 text-white text-xs font-semibold uppercase tracking-wider rounded-none cursor-pointer flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-1.5 h-4 w-4" /> Đang gửi...
                  </>
                ) : (
                  "Gửi yêu cầu"
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </section>
  );
}
