import React from "react";
import { User, Phone, Mail, Users, Calendar, ChevronRight, Smile } from "lucide-react";

export default function GuestInfoStep({
  guestInfo,
  setGuestInfo,
  formErrors,
  setFormErrors,
  handleNextStep,
  onLookupEmail,
  isLookingUp,
  lookupStatus,
  setLookupStatus,
}) {
  const handleChildrenAgeChange = (field, value) => {
    const val = value.replace(/[^0-9]/g, "");
    let cleanVal = val;
    if (cleanVal.length > 1 && cleanVal.startsWith("0")) {
      cleanVal = cleanVal.replace(/^0+/, "");
    }
    
    const newGuestInfo = {
      ...guestInfo,
      [field]: cleanVal !== "" ? Number(cleanVal) : ""
    };
    
    const under5 = Number(newGuestInfo.childrenUnder5 || 0);
    const between5And12 = Number(newGuestInfo.children5to12 || 0);
    newGuestInfo.childrenCount = under5 + between5And12;
    
    setGuestInfo(newGuestInfo);
    if (setFormErrors) {
      setFormErrors({
        ...formErrors,
        [field]: "",
        childrenCount: ""
      });
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="border-b border-[#cda250]/15 pb-4 mb-8">
        <h2 className="text-resort-section font-serif text-[#1a2f23] mb-1.5 font-semibold uppercase tracking-wide">
          {"Bước 1: Thông Tin Khách Hàng"}
        </h2>
        <p className="text-resort-desc mt-1 text-sage-600 font-light">
          {"Vui lòng nhập các thông tin liên lạc chính xác để tạo hồ sơ khách lưu trú ban đầu."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
        <div>
          <label className="block text-resort-label uppercase text-sage-800 font-semibold mb-2">
            {"Họ và tên"} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={"Nguyễn Văn A"}
              value={guestInfo.fullName}
              onChange={(e) => {
                setGuestInfo({ ...guestInfo, fullName: e.target.value });
                setFormErrors({ ...formErrors, fullName: "" });
              }}
              className={`w-full pl-10 pr-4 py-3 bg-white border text-resort-input text-[#1a2f23] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#cda250] focus:border-[#cda250] transition-all ${
                formErrors.fullName ? "border-red-400" : "border-[#cda250]/20"
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

        <div>
          <label className="block text-resort-label uppercase text-sage-800 font-semibold mb-2">
            {"Số điện thoại"} <span className="text-red-500">*</span>
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
              className={`w-full pl-10 pr-4 py-3 bg-white border text-resort-input text-[#1a2f23] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#cda250] focus:border-[#cda250] transition-all ${
                formErrors.phone ? "border-red-400" : "border-[#cda250]/20"
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

        <div>
          <label className="block text-resort-label uppercase text-sage-800 font-semibold mb-2">
            {"Địa chỉ Email"} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="khachhang@gmail.com"
              value={guestInfo.email}
              onChange={(e) => {
                setGuestInfo({ ...guestInfo, email: e.target.value });
                setFormErrors({ ...formErrors, email: "" });
                setLookupStatus && setLookupStatus("idle");
              }}
              onBlur={(e) => {
                const email = e.target.value;
                if (email && /\S+@\S+\.\S+/.test(email)) {
                  onLookupEmail && onLookupEmail(email);
                }
              }}
              className={`w-full pl-10 pr-4 py-3 bg-white border text-resort-input text-[#1a2f23] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#cda250] focus:border-[#cda250] transition-all ${
                formErrors.email ? "border-red-400" : "border-[#cda250]/20"
              }`}
            />
            <Mail className="h-4.5 w-4.5 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {lookupStatus === "searching" && (
            <span className="text-[10px] text-[#cda250] animate-pulse mt-1.5 block font-medium">
              Đang kiểm tra lịch sử lưu trú của bạn...
            </span>
          )}
          {lookupStatus === "found" && (
            <span className="text-[10px] text-emerald-600 mt-1.5 block font-semibold">
              ✓ Đã tìm thấy và tự động điền hồ sơ khách hàng của bạn.
            </span>
          )}
          {formErrors.email && (
            <span className="text-[10px] text-red-500 font-normal mt-1 block">
              {formErrors.email}
            </span>
          )}
        </div>

        <div>
          <label className="block text-resort-label uppercase text-sage-800 font-semibold mb-2">
            {"Người lớn"} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="VD: 2"
              value={guestInfo.guestsCount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                const cleanVal = val.replace(/^0+/, "");
                setGuestInfo({ ...guestInfo, guestsCount: cleanVal ? Number(cleanVal) : "" });
                setFormErrors({ ...formErrors, guestsCount: "" });
              }}
              className={`w-full pl-10 pr-4 py-3 bg-white border text-resort-input text-[#1a2f23] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#cda250] focus:border-[#cda250] transition-all ${
                formErrors.guestsCount ? "border-red-400" : "border-[#cda250]/20"
              }`}
            />
            <Users className="h-4.5 w-4.5 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {formErrors.guestsCount && (
            <span className="text-[10px] text-red-500 font-normal mt-1 block">
              {formErrors.guestsCount}
            </span>
          )}
        </div>

        {/* Children details sub-section */}
        <div className="sm:col-span-2 border border-[#cda250]/20 bg-[#cda250]/5 p-5 rounded-xl space-y-4">
          <span className="block text-resort-label uppercase text-sage-800 font-bold tracking-wide border-b border-[#cda250]/15 pb-2">
            Số lượng trẻ em theo độ tuổi
          </span>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase text-sage-700 font-bold mb-1.5">
                Dưới 5 tuổi (Miễn phí)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={guestInfo.childrenUnder5 !== undefined ? guestInfo.childrenUnder5 : ""}
                  onChange={(e) => handleChildrenAgeChange('childrenUnder5', e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 bg-white border text-resort-input text-[#1a2f23] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#cda250] focus:border-[#cda250] transition-all ${
                    formErrors.childrenUnder5 ? "border-red-400" : "border-[#cda250]/20"
                  }`}
                />
                <Smile className="h-4 w-4 text-sage-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
              {formErrors.childrenUnder5 && (
                <span className="text-[9px] text-red-500 font-normal mt-1 block">
                  {formErrors.childrenUnder5}
                </span>
              )}
            </div>
            <div>
              <label className="block text-[11px] uppercase text-sage-700 font-bold mb-1.5">
                Từ 5 - 12 tuổi (Giảm 30%)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={guestInfo.children5to12 !== undefined ? guestInfo.children5to12 : ""}
                  onChange={(e) => handleChildrenAgeChange('children5to12', e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 bg-white border text-resort-input text-[#1a2f23] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#cda250] focus:border-[#cda250] transition-all ${
                    formErrors.children5to12 ? "border-red-400" : "border-[#cda250]/20"
                  }`}
                />
                <Smile className="h-4 w-4 text-sage-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
              {formErrors.children5to12 && (
                <span className="text-[9px] text-red-500 font-normal mt-1 block">
                  {formErrors.children5to12}
                </span>
              )}
            </div>
          </div>
        </div>


        {/* Check In Date */}
        <div>
          <label className="block text-resort-label uppercase text-sage-800 font-semibold mb-2">
            {"Ngày nhận phòng dự kiến"} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={guestInfo.checkInDate}
              onChange={(e) => {
                setGuestInfo({ ...guestInfo, checkInDate: e.target.value });
                setFormErrors({ ...formErrors, checkInDate: "" });
              }}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#cda250]/20 text-resort-input text-[#1a2f23] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#cda250] focus:border-[#cda250] transition-all"
            />
            <Calendar className="h-4.5 w-4.5 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Check Out Date */}
        <div>
          <label className="block text-resort-label uppercase text-sage-800 font-semibold mb-2">
            Ngày trả phòng dự kiến <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={guestInfo.checkOutDate}
              min={guestInfo.checkInDate || undefined}
              onChange={(e) => {
                setGuestInfo({ ...guestInfo, checkOutDate: e.target.value });
                setFormErrors({ ...formErrors, checkOutDate: "" });
              }}
              className={`w-full pl-10 pr-4 py-3 bg-white border text-resort-input text-[#1a2f23] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#cda250] focus:border-[#cda250] transition-all ${
                formErrors.checkOutDate ? "border-red-400" : "border-[#cda250]/20"
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

        <div className="sm:col-span-2">
          <label className="block text-resort-label uppercase text-sage-800 font-semibold mb-2">
            {"Yêu cầu đặc biệt khác"}
          </label>
          <div className="relative">
            <textarea
              placeholder={"VD: Muốn phòng ở khu yên tĩnh, cần bố trí thêm 1 nôi em bé..."}
              rows="2"
              value={guestInfo.specialRequest}
              onChange={(e) => setGuestInfo({ ...guestInfo, specialRequest: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-[#cda250]/20 text-resort-input text-[#1a2f23] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#cda250] focus:border-[#cda250] transition-all"
            />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-[#fbfaf7] border-t border-[#cda250]/15 py-4 -mx-6 sm:-mx-8 px-6 sm:px-8 -mb-6 sm:-mb-8 rounded-b-2xl z-10 flex justify-end shadow-[0_-8px_20px_-6px_rgba(26,44,34,0.05)]">
        <button
          type="button"
          onClick={handleNextStep}
          className="px-8 py-3.5 bg-[#cda250] hover:bg-[#d9b360] text-[#070e0a] hover:shadow-[0_4px_20px_rgba(205,162,80,0.35)] text-resort-button tracking-widest uppercase font-bold rounded-lg transition-all duration-300 flex items-center cursor-pointer"
        >
          {"Khai báo sức khỏe"} <ChevronRight className="h-4 w-4 ml-1.5" />
        </button>
      </div>
    </div>
  );
}
