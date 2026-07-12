import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { radius } from "../../styles/designSystem";

export default function BookingSuccess({
  guestInfo,
  nightsCount,
  selectedVilla,
  selectedRooms,
  roomTypes,
  selectedServices,
  totalAmount,
  depositAmount,
  remainingAmount,
  formatCurrency,
  selectedPackages = [],
}) {
  return (
    <div
      className={`bg-white border border-primary-100 max-w-2xl mx-auto p-8 sm:p-12 text-center shadow-md animate-fade-in relative overflow-hidden ${radius.card}`}
    >
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400" />

      <div className="inline-flex p-4 bg-primary-100 text-primary-800 rounded-full mb-6">
        <CheckCircle2 className="h-14 w-14" />
      </div>

      <h1 className="font-serif text-3xl font-normal text-sage-900 mb-2">Đặt Phòng Thành Công!</h1>
      <p className="text-sage-600 text-xs sm:text-sm max-w-md mx-auto mb-8 font-light leading-relaxed">
        Cảm ơn quý khách đã tin tưởng lựa chọn Ngũ Sơn Resort. Giao dịch đặt cọc đã được xác minh
        thành công. Chi tiết đặt phòng đã được lưu ở trạng thái **CONFIRMED**.
      </p>

      {/* Final receipt breakdown */}
      <div className="border border-primary-100 bg-primary-50/20 text-left p-6 sm:p-8 space-y-4 mb-8 text-xs sm:text-sm">
        <div className="flex justify-between pb-3 border-b border-primary-100">
          <span className="font-bold uppercase tracking-wider text-sage-400 text-[10px]">
            Phiếu Đặt Lịch Trị Liệu & Nghỉ Dưỡng
          </span>
          <span className="font-mono text-primary-800 font-bold">
            CODE: BK-{Math.floor(100000 + Math.random() * 900000)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-y-2.5">
          <span className="text-sage-500 font-light">Họ và tên khách hàng:</span>
          <span className="font-semibold text-right">{guestInfo.fullName}</span>

          <span className="text-sage-500 font-light">Số điện thoại liên lạc:</span>
          <span className="font-semibold text-right">{guestInfo.phone}</span>

          <span className="text-sage-500 font-light">Địa chỉ email:</span>
          <span className="font-semibold text-right">{guestInfo.email}</span>

          <span className="text-sage-500 font-light">Thời gian lưu trú:</span>
          <span className="font-semibold text-right">
            {guestInfo.checkInDate} → {guestInfo.checkOutDate}
          </span>

          <span className="text-sage-500 font-light">Số khách đi cùng:</span>
          <span className="font-semibold text-right">
            {guestInfo.guestsCount} Người lớn
            {guestInfo.childrenCount > 0 ? (
              `, ${guestInfo.childrenCount} Trẻ em` + (
                (guestInfo.childrenUnder5 > 0 || guestInfo.children5to12 > 0)
                  ? ` (${[
                      guestInfo.childrenUnder5 > 0 ? `${guestInfo.childrenUnder5} dưới 5t` : "",
                      guestInfo.children5to12 > 0 ? `${guestInfo.children5to12} 5-12t` : ""
                    ].filter(Boolean).join(", ")})`
                  : ""
              )
            ) : ""}
          </span>

          <span className="text-sage-500 font-light">Căn biệt thự đã chọn:</span>
          <span className="font-semibold text-right text-primary-800">
            {selectedRooms && Object.entries(selectedRooms)
              .map(([roomTypeId, qty]) => {
                const roomType = roomTypes.find((r) => r.roomTypeId === Number(roomTypeId));
                return roomType && qty > 0 ? `${roomType.typeName} (x${qty})` : "";
              })
              .filter(Boolean)
              .join(", ")
            }
          </span>


          {selectedServices.length > 0 && (
            <>
              <span className="text-sage-500 font-light">Các dịch vụ kèm theo:</span>
              <span className="font-semibold text-right text-sage-700">
                {selectedServices.map((s) => s.title.split("&")[0].trim()).join(", ")}
              </span>
            </>
          )}

          <span className="text-sage-500 font-bold mt-4 pt-4 border-t border-primary-100">
            MÃ ĂN (Dùng để gọi món):
          </span>
          <span className="font-bold text-right text-lg text-primary-900 mt-4 pt-4 border-t border-primary-100">
            MEAL-{Math.floor(100 + Math.random() * 900)}
          </span>
        </div>

        <div className="pt-4 border-t border-primary-100 space-y-2.5 text-xs">
          <div className="flex justify-between">
            <span className="text-sage-500 font-light">Thuế VAT & Phí dịch vụ (10%):</span>
            <span className="font-semibold text-sage-950 font-mono">{formatCurrency(totalAmount - Math.round(totalAmount / 1.1))}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-primary-50/50">
            <span className="text-sage-500 font-light">Tổng chi phí đặt phòng:</span>
            <span className="font-semibold text-sage-950">{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between text-green-700 font-semibold bg-green-50 px-2 py-1">
            <span>Số tiền cọc đã thanh toán (30%):</span>
            <span>{formatCurrency(depositAmount)}</span>
          </div>
          <div className="flex justify-between text-primary-950 font-bold border-t border-primary-100/50 pt-2 text-sm sm:text-base font-serif">
            <span>Số tiền cần trả tại quầy (70%):</span>
            <span>{formatCurrency(remainingAmount)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center justify-center px-8 py-3 bg-primary-800 text-white text-resort-button tracking-wider hover:bg-primary-900 transition-all uppercase rounded-none cursor-pointer"
        >
          Về trang chủ
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center justify-center px-8 py-3 border border-sage-800 text-sage-800 text-resort-button tracking-wider hover:bg-sage-50 transition-all uppercase rounded-none"
        >
          In phiếu xác nhận
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-sage-100 flex justify-center items-center text-[10px] text-sage-400 space-x-2">
        <ShieldCheck className="h-4.5 w-4.5 text-primary-600" />
        <span>Giao dịch bảo mật SSL. Email xác nhận đặt phòng đã được gửi tự động.</span>
      </div>
    </div>
  );
}
