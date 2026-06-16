import React from "react";
import { User, Phone, Mail, Calendar, Users, ChevronRight } from "lucide-react";

export default function BookingGuestInfo({
  guestInfo,
  setGuestInfo,
  formErrors,
  setFormErrors,
  onNext,
}) {
  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="border-b border-primary-50 pb-3 mb-6">
        <h2 className="text-resort-section text-sage-950 mb-1">
          Bước 1: Thông Tin Khách Hàng
        </h2>
        <p className="text-resort-desc mt-1">
          Vui lòng nhập các thông tin liên lạc chính xác để tạo hồ sơ khách lưu trú ban đầu.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
        {/* Full Name */}
        <div>
          <label className="block text-resort-label uppercase text-sage-900 mb-2">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              value={guestInfo.fullName}
              onChange={(e) => {
                setGuestInfo({ ...guestInfo, fullName: e.target.value });
                setFormErrors({ ...formErrors, fullName: "" });
              }}
              className={`w-full pl-10 pr-4 py-3 bg-sage-50/50 border text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400 ${
                formErrors.fullName ? "border-red-400" : "border-primary-200/50"
              }`}
            />
            <User className="h-4.5 w-4.5 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {formErrors.fullName && (
            <span className="text-[10px] text-red-500 font-normal mt-1 block">
              {formErrors.fullName}
            </span>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-resort-label uppercase text-sage-900 mb-2">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              placeholder="0901234567"
              value={guestInfo.phone}
              onChange={(e) => {
                setGuestInfo({ ...guestInfo, phone: e.target.value });
                setFormErrors({ ...formErrors, phone: "" });
              }}
              className={`w-full pl-10 pr-4 py-3 bg-sage-50/50 border text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400 ${
                formErrors.phone ? "border-red-400" : "border-primary-200/50"
              }`}
            />
            <Phone className="h-4.5 w-4.5 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {formErrors.phone && (
            <span className="text-[10px] text-red-500 font-normal mt-1 block">
              {formErrors.phone}
            </span>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-resort-label uppercase text-sage-900 mb-2">
            Địa chỉ Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="khachhang@gmail.com"
              value={guestInfo.email}
              onChange={(e) => {
                setGuestInfo({ ...guestInfo, email: e.target.value });
                setFormErrors({ ...formErrors, email: "" });
              }}
              className={`w-full pl-10 pr-4 py-3 bg-sage-50/50 border text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400 ${
                formErrors.email ? "border-red-400" : "border-primary-200/50"
              }`}
            />
            <Mail className="h-4.5 w-4.5 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {formErrors.email && (
            <span className="text-[10px] text-red-500 font-normal mt-1 block">
              {formErrors.email}
            </span>
          )}
        </div>

        {/* Guests count */}
        <div>
          <label className="block text-resort-label uppercase text-sage-900 mb-2">
            Số lượng khách hàng
          </label>
          <div className="relative">
            <select
              value={guestInfo.guestsCount}
              onChange={(e) =>
                setGuestInfo({ ...guestInfo, guestsCount: Number(e.target.value) })
              }
              className="w-full pl-10 pr-4 py-3 bg-sage-50/50 border border-primary-200/50 text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400 appearance-none"
            >
              <option value="1">1 Khách nghỉ</option>
              <option value="2">2 Khách nghỉ</option>
              <option value="3">3 Khách nghỉ</option>
              <option value="4">4 Khách nghỉ</option>
              <option value="5">5 Khách nghỉ</option>
              <option value="6">Đoàn nghỉ đông (6+)</option>
            </select>
            <Users className="h-4.5 w-4.5 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Check In Date */}
        <div>
          <label className="block text-resort-label uppercase text-sage-900 mb-2">
            Ngày nhận phòng dự kiến <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={guestInfo.checkInDate}
              onChange={(e) => {
                setGuestInfo({ ...guestInfo, checkInDate: e.target.value });
                setFormErrors({ ...formErrors, checkInDate: "" });
              }}
              className="w-full pl-10 pr-4 py-3 bg-sage-50/50 border border-primary-200/50 text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
            <Calendar className="h-4.5 w-4.5 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Check Out Date */}
        <div>
          <label className="block text-resort-label uppercase text-sage-900 mb-2">
            Ngày trả phòng dự kiến <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={guestInfo.checkOutDate}
              onChange={(e) => {
                setGuestInfo({ ...guestInfo, checkOutDate: e.target.value });
                setFormErrors({ ...formErrors, checkOutDate: "" });
              }}
              className={`w-full pl-10 pr-4 py-3 bg-sage-50/50 border text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400 ${
                formErrors.checkOutDate ? "border-red-400" : "border-primary-200/50"
              }`}
            />
            <Calendar className="h-4.5 w-4.5 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {formErrors.checkOutDate && (
            <span className="text-[10px] text-red-500 font-normal mt-1 block">
              {formErrors.checkOutDate}
            </span>
          )}
        </div>

        {/* Special requests */}
        <div className="sm:col-span-2">
          <label className="block text-resort-label uppercase text-sage-900 mb-2">
            Yêu cầu đặc biệt khác
          </label>
          <div className="relative">
            <textarea
              placeholder="VD: Muốn phòng ở khu yên tĩnh, cần bố trí thêm 1 nôi em bé..."
              rows="2"
              value={guestInfo.specialRequest}
              onChange={(e) =>
                setGuestInfo({ ...guestInfo, specialRequest: e.target.value })
              }
              className="w-full px-4 py-3 bg-sage-50/50 border border-primary-200/50 text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-primary-50 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="px-8 py-3.5 bg-primary-800 hover:bg-primary-900 text-white text-resort-button tracking-widest uppercase rounded-none transition-all duration-300 flex items-center cursor-pointer"
        >
          Khai báo sức khỏe <ChevronRight className="h-4 w-4 ml-1.5" />
        </button>
      </div>
    </div>
  );
}
