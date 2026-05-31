import React, { useState } from "react";
import {
  Calendar,
  Phone,
  User,
  Users,
  Compass,
  CheckCircle2,
  Loader2,
  Leaf,
} from "lucide-react";

export default function BookingForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    checkInDate: "",
    guestsCount: "2",
    interest: "all",
    note: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.checkInDate) {
      alert("Vui lòng điền các thông tin bắt buộc.");
      return;
    }

    setIsLoading(true);
    // Simulate API request
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section
      id="booking"
      className="py-24 bg-gradient-to-b from-[#f8faf7] to-[#f0f5ee] relative overflow-hidden"
    >
      {/* Decorative blurry gradients */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-primary-200/20 rounded-full filter blur-3xl -translate-y-1/2" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/30 rounded-full filter blur-3xl" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest text-primary-900 uppercase bg-primary-200/60 px-3 py-1.5 rounded-full">
            Đặt chỗ & Tư vấn
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-sage-900 mt-4 mb-4">
            Khởi Đầu Hành Trình Chữa Lành
          </h2>
          <div className="flex items-center justify-center space-x-3 mt-4 mb-6">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-primary-300" />
            <Leaf className="h-3.5 w-3.5 text-primary-600/80" />
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-primary-300" />
          </div>
          <p className="text-sage-800 font-normal text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Để lại thông tin dưới đây, chuyên viên tư vấn sức khỏe của Ngũ Sơn
            Resort sẽ liên hệ hỗ trợ bạn thiết kế liệu trình phù hợp nhất trong
            15 phút.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-xl border border-primary-200/30">
          {isSubmitted ? (
            <div className="text-center py-12 px-4 animate-fade-in">
              <div className="inline-flex p-4 bg-primary-200/60 text-primary-900 rounded-full mb-6">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-sage-900 mb-3">
                Đăng Ký Thành Công!
              </h3>
              <p className="text-sage-800 max-w-md mx-auto font-normal text-base leading-relaxed">
                Cảm ơn Quý khách{" "}
                <strong className="text-sage-900 font-bold">
                  {formData.fullName}
                </strong>
                . Chúng tôi đã tiếp nhận yêu cầu đặt dịch vụ vào ngày{" "}
                {formData.checkInDate}. Chuyên viên tư vấn sẽ liên hệ lại qua số
                điện thoại{" "}
                <strong className="text-sage-900 font-bold">
                  {formData.phone}
                </strong>{" "}
                sớm nhất có thể.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    fullName: "",
                    phone: "",
                    checkInDate: "",
                    guestsCount: "2",
                    interest: "all",
                    note: "",
                  });
                }}
                className="mt-8 px-6 py-2.5 rounded-full text-sm font-semibold bg-primary-900 hover:bg-primary-800 text-white transition-all cursor-pointer shadow-md"
              >
                Gửi yêu cầu mới
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full name input */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-semibold text-sage-900 uppercase tracking-wider mb-2"
                  >
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sage-400">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      required
                      placeholder="Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3 bg-sage-50/50 border border-primary-200/50 rounded-2xl text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Phone input */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-semibold text-sage-900 uppercase tracking-wider mb-2"
                  >
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sage-400">
                      <Phone className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      required
                      placeholder="0901234567"
                      value={formData.phone}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3 bg-sage-50/50 border border-primary-200/50 rounded-2xl text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Arrival Date */}
                <div>
                  <label
                    htmlFor="checkInDate"
                    className="block text-xs font-semibold text-sage-900 uppercase tracking-wider mb-2"
                  >
                    Ngày dự kiến đến <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sage-400">
                      <Calendar className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="date"
                      name="checkInDate"
                      id="checkInDate"
                      required
                      value={formData.checkInDate}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3 bg-sage-50/50 border border-primary-200/50 rounded-2xl text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Guest select */}
                <div>
                  <label
                    htmlFor="guestsCount"
                    className="block text-xs font-semibold text-sage-900 uppercase tracking-wider mb-2"
                  >
                    Số lượng khách
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sage-400">
                      <Users className="h-4.5 w-4.5" />
                    </div>
                    <select
                      name="guestsCount"
                      id="guestsCount"
                      value={formData.guestsCount}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3 bg-sage-50/50 border border-primary-200/50 rounded-2xl text-sage-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all text-sm appearance-none font-medium"
                    >
                      <option value="1">1 Khách</option>
                      <option value="2">2 Khách</option>
                      <option value="3-4">3 - 4 Khách</option>
                      <option value="5+">Đoàn trên 5 khách</option>
                    </select>
                  </div>
                </div>

                {/* Interest Area */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-sage-900 uppercase tracking-wider mb-3">
                    Dịch vụ quan tâm chính
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { id: "all", label: "Tất cả dịch vụ" },
                      { id: "dining", label: "Ẩm thực dinh dưỡng" },
                      { id: "spa", label: "Spa trị liệu" },
                      { id: "yoga", label: "Yoga & Thiền" },
                      { id: "therapy", label: "Vật lý trị liệu" },
                    ].map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-center justify-center p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all text-center ${formData.interest === item.id ? "bg-primary-200 border-primary-400 text-primary-900 shadow-sm" : "bg-white border-primary-200/60 hover:bg-primary-50 text-sage-800"}`}
                      >
                        <input
                          type="radio"
                          name="interest"
                          value={item.id}
                          checked={formData.interest === item.id}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Message input */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="note"
                    className="block text-xs font-semibold text-sage-900 uppercase tracking-wider mb-2"
                  >
                    Yêu cầu đặc biệt hoặc Tình trạng sức khỏe cần lưu ý
                  </label>
                  <textarea
                    name="note"
                    id="note"
                    rows="3"
                    placeholder="Quý khách có chấn thương xương khớp, chế độ ăn kiêng cụ thể, hay yêu cầu đặc biệt khác..."
                    value={formData.note}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-sage-50/50 border border-primary-200/50 rounded-2xl text-sage-900 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all text-sm resize-none font-medium"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto min-w-[200px] inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-semibold bg-primary-900 hover:bg-primary-800 text-white transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] disabled:opacity-75 disabled:scale-100 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" /> Đang xử
                      lý...
                    </>
                  ) : (
                    "Đăng ký tư vấn ngay"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
