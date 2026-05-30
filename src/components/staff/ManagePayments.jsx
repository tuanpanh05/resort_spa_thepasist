import React, { useState } from "react";
import { CreditCard, Printer, X } from "lucide-react";

export default function ManagePayments({ payments, setPayments }) {
  const [showInvoicePrintModal, setShowInvoicePrintModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleConfirmCashPayment = (invoiceId) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === invoiceId
          ? { ...p, status: "Paid", method: "Tiền mặt tại quầy" }
          : p,
      ),
    );
    alert(`Đã xác nhận thanh toán tiền mặt cho hóa đơn ${invoiceId}.`);
  };

  const handlePrintInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoicePrintModal(true);
  };

  const handleEditPaymentBlocked = () => {
    alert(
      "Báo lỗi bảo mật: Bạn KHÔNG ĐƯỢC PHÉP chỉnh sửa hoặc cập nhật lịch sử giao dịch thanh toán! Chỉ Admin hoặc Kế toán trưởng được thao tác sửa số liệu.",
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="bg-white border border-primary-100 p-5">
        <div>
          <h3 className="font-serif text-lg font-normal text-sage-950">
            Xác Nhận Hóa Đơn & Thanh Toán
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Xử lý thanh toán khi khách check-out, in hóa đơn tạm tính cho khách
            xem trước, xác nhận thanh toán tiền mặt tại quầy lễ tân.
          </p>
        </div>
      </div>

      <div className="bg-white border border-primary-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-primary-50/50 text-sage-600 font-bold border-b border-primary-100">
                <th className="p-4">Mã HĐ</th>
                <th className="p-4">Khách Hàng</th>
                <th className="p-4">Ngày Lưu Trú</th>
                <th className="p-4">Tiền phòng</th>
                <th className="p-4">Tiền dịch vụ</th>
                <th className="p-4">Tổng Hóa Đơn</th>
                <th className="p-4">Phương Thức</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4 text-center">Tác vụ thu ngân</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50/50">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-primary-50/10">
                  <td className="p-4 font-bold text-primary-950">{p.id}</td>
                  <td className="p-4 font-bold text-sage-950">
                    {p.customerName}
                  </td>
                  <td className="p-4 text-sage-700">{p.checkIn}</td>
                  <td className="p-4 text-sage-700">{p.roomAmount}</td>
                  <td className="p-4 text-sage-700">{p.servicesAmount}</td>
                  <td className="p-4 font-bold text-sage-950">{p.total}</td>
                  <td className="p-4 text-sage-600">{p.method}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase ${
                        p.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {p.status === "Paid" ? "Đã thu" : "Chờ thu"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      {p.status === "Unpaid" ? (
                        <button
                          onClick={() => handleConfirmCashPayment(p.id)}
                          className="px-2.5 py-1.5 bg-primary-800 hover:bg-primary-900 text-white rounded-none text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
                        >
                          Thu tiền mặt
                        </button>
                      ) : (
                        <button
                          onClick={handleEditPaymentBlocked}
                          className="px-2.5 py-1.5 bg-sage-100 hover:bg-sage-200 text-sage-500 rounded-none text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
                        >
                          Sửa hóa đơn
                        </button>
                      )}
                      <button
                        onClick={() => handlePrintInvoice(p)}
                        className="p-1.5 bg-primary-100 hover:bg-primary-200 text-primary-950 rounded-none cursor-pointer"
                        title="Xem hóa đơn thanh toán"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Print Modal */}
      {showInvoicePrintModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto print:p-0 print:shadow-none">
            <div className="flex justify-between items-center border-b border-primary-50 pb-3 print:hidden">
              <h3 className="font-serif text-lg font-normal text-sage-950">
                Xem trước hóa đơn thanh toán
              </h3>
              <button
                onClick={() => setShowInvoicePrintModal(false)}
                className="text-sage-400 hover:text-sage-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 text-left" id="staff-print-area">
              <div className="flex justify-between items-start border-b border-primary-100 pb-4">
                <div>
                  <h2 className="font-serif text-xl font-normal text-primary-900 uppercase">
                    NGŨ SƠN RESORT & SPA
                  </h2>
                  <p className="text-[10px] text-sage-500 mt-1">
                    Hòa Sơn, Hòa Vang, Đà Nẵng, Việt Nam
                  </p>
                  <p className="text-[10px] text-sage-500">
                    Hotline: +84 236 3888 999
                  </p>
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-sm text-sage-950">
                    HÓA ĐƠN ĐIỆN TỬ
                  </h4>
                  <p className="text-[10px] text-sage-500 mt-1">
                    Mã hóa đơn: {selectedInvoice?.id}
                  </p>
                  <p className="text-[10px] text-sage-500">
                    Ngày xuất: {new Date().toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-sage-400 block uppercase tracking-wider">
                    Khách Hàng
                  </span>
                  <span className="font-bold text-sage-950">
                    {selectedInvoice?.customerName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-sage-400 block uppercase tracking-wider">
                    Ngày checkin
                  </span>
                  <span className="font-bold text-sage-950">
                    {selectedInvoice?.checkIn}
                  </span>
                </div>
              </div>

              <div className="border-t border-primary-100 pt-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-primary-100 text-sage-500 font-bold">
                      <th className="py-2 text-left">Hạng Mục</th>
                      <th className="py-2 text-right">Đơn Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-primary-50/50">
                      <td className="py-3 font-semibold text-sage-900">
                        Chi phí lưu trú (Mã: {selectedInvoice?.bookingId})
                      </td>
                      <td className="py-3 text-right font-bold text-sage-950">
                        {selectedInvoice?.roomAmount}
                      </td>
                    </tr>
                    <tr className="border-b border-primary-50/50">
                      <td className="py-3 font-semibold text-sage-900">
                        Dịch vụ bổ trợ (Spa, Dining, Giặt là...)
                      </td>
                      <td className="py-3 text-right font-bold text-sage-950">
                        {selectedInvoice?.servicesAmount}
                      </td>
                    </tr>
                    <tr className="border-b border-primary-100 bg-primary-50/20">
                      <td className="py-3 font-bold text-primary-900">
                        Tổng cộng thanh toán (VND)
                      </td>
                      <td className="py-3 text-right font-bold text-primary-950">
                        {selectedInvoice?.total}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-4">
                <div>
                  <span className="text-[10px] text-sage-400 block uppercase tracking-wider">
                    Phương thức
                  </span>
                  <span className="font-semibold text-sage-800">
                    {selectedInvoice?.method === "Cash"
                      ? "Tiền mặt tại quầy"
                      : selectedInvoice?.method === "Banking"
                        ? "Chuyển khoản Banking"
                        : selectedInvoice?.method === "Tiền mặt tại quầy"
                          ? "Tiền mặt"
                          : selectedInvoice?.method}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-sage-400 block uppercase tracking-wider">
                    Trạng thái
                  </span>
                  <span
                    className={`font-bold uppercase ${selectedInvoice?.status === "Paid" ? "text-green-700" : "text-red-700"}`}
                  >
                    {selectedInvoice?.status === "Paid"
                      ? "ĐÃ HOÀN TẤT THANH TOÁN"
                      : "CHƯA THANH TOÁN (CÒN NỢ)"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50 print:hidden">
              <button
                type="button"
                onClick={() => setShowInvoicePrintModal(false)}
                className="px-4 py-2 border border-primary-100 text-xs font-semibold uppercase tracking-wider hover:bg-primary-50 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-primary-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-900 cursor-pointer flex items-center space-x-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>In hóa đơn (Ctrl+P)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
