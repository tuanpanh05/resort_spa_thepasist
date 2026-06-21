import React from "react";
import { User, Phone, Mail, Users, Calendar, ChevronRight } from "lucide-react";

export default function GuestInfoStep({
  guestInfo,
  setGuestInfo,
  formErrors,
  setFormErrors,
  handleNextStep,
}) {
  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="border-b border-primary-50 pb-3 mb-6">
        <h2 className="text-resort-section text-sage-950 mb-1">
          {"B\u01b0\u1edbc 1: Th\u00f4ng Tin Kh\u00e1ch H\u00e0ng"}
        </h2>
        <p className="text-resort-desc mt-1">
          {"Vui l\u00f2ng nh\u1eadp c\u00e1c th\u00f4ng tin li\u00ean l\u1ea1c ch\u00ednh x\u00e1c \u0111\u1ec3 t\u1ea1o h\u1ed3 s\u01a1 kh\u00e1ch l\u01b0u tr\u00fa ban \u0111\u1ea7u."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
        <div>
          <label className="block text-resort-label uppercase text-sage-900 mb-2">
            {"H\u1ecd v\u00e0 t\u00ean"} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={"Nguy\u1ec5n V\u0103n A"}
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

        <div>
          <label className="block text-resort-label uppercase text-sage-900 mb-2">
            {"S\u1ed1 \u0111i\u1ec7n tho\u1ea1i"} <span className="text-red-500">*</span>
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

        <div>
          <label className="block text-resort-label uppercase text-sage-900 mb-2">
            {"\u0110\u1ecba ch\u1ec9 Email"} <span className="text-red-500">*</span>
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

        <div>
          <label className="block text-resort-label uppercase text-sage-900 mb-2">
            {"S\u1ed1 l\u01b0\u1ee3ng kh\u00e1ch h\u00e0ng"}
          </label>
          <div className="relative">
            <select
              value={guestInfo.guestsCount}
              onChange={(e) => setGuestInfo({ ...guestInfo, guestsCount: Number(e.target.value) })}
              className="w-full pl-10 pr-4 py-3 bg-sage-50/50 border border-primary-200/50 text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400 appearance-none"
            >
              <option value="1">{"1 Kh\u00e1ch ngh\u1ec9"}</option>
              <option value="2">{"2 Kh\u00e1ch ngh\u1ec9"}</option>
              <option value="3">{"3 Kh\u00e1ch ngh\u1ec9"}</option>
              <option value="4">{"4 Kh\u00e1ch ngh\u1ec9"}</option>
              <option value="5">{"5 Kh\u00e1ch ngh\u1ec9"}</option>
              <option value="6">{"\u0110o\u00e0n ngh\u1ec9 \u0111\u00f4ng (6+)"}</option>
            </select>
            <Users className="h-4.5 w-4.5 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Guest Age */}
        <div>
          <label className="block text-resort-label uppercase text-sage-900 mb-2">
            Số tuổi <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="120"
              placeholder="Ví dụ: 30"
              value={guestInfo.age || ""}
              onChange={(e) => {
                setGuestInfo({ ...guestInfo, age: e.target.value ? Number(e.target.value) : "" });
                setFormErrors({ ...formErrors, age: "" });
              }}
              className={`w-full pl-10 pr-4 py-3 bg-sage-50/50 border text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400 ${
                formErrors.age ? "border-red-400" : "border-primary-200/50"
              }`}
            />
            <User className="h-4.5 w-4.5 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {formErrors.age && (
            <span className="text-[10px] text-red-500 font-normal mt-1 block">
              {formErrors.age}
            </span>
          )}
        </div>

        {/* Check In Date */}
        <div>
          <label className="block text-resort-label uppercase text-sage-900 mb-2">
            {"Ng\u00e0y nh\u1eadn ph\u00f2ng d\u1ef1 ki\u1ebfn"} <span className="text-red-500">*</span>
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
              min={guestInfo.checkInDate || undefined}
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

        <div className="sm:col-span-2">
          <label className="block text-resort-label uppercase text-sage-900 mb-2">
            {"Y\u00eau c\u1ea7u \u0111\u1eb7c bi\u1ec7t kh\u00e1c"}
          </label>
          <div className="relative">
            <textarea
              placeholder={"VD: Mu\u1ed1n ph\u00f2ng \u1edf khu y\u00ean t\u0129nh, c\u1ea7n b\u1ed1 tr\u00ed th\u00eam 1 n\u00f4i em b\u00e9..."}
              rows="2"
              value={guestInfo.specialRequest}
              onChange={(e) => setGuestInfo({ ...guestInfo, specialRequest: e.target.value })}
              className="w-full px-4 py-3 bg-sage-50/50 border border-primary-200/50 text-resort-input text-sage-900 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-primary-50 flex justify-end">
        <button
          type="button"
          onClick={handleNextStep}
          className="px-8 py-3.5 bg-primary-800 hover:bg-primary-900 text-white text-resort-button tracking-widest uppercase rounded-none transition-all duration-300 flex items-center cursor-pointer"
        >
          {"Khai b\u00e1o s\u1ee9c kh\u1ecfe"} <ChevronRight className="h-4 w-4 ml-1.5" />
        </button>
      </div>
    </div>
  );
}
