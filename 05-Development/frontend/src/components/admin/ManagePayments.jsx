import React, { useState } from "react";
import { CreditCard, Printer, X } from "lucide-react";

export default function ManagePayments({ payments, setPayments }) {
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [showInvoicePrintModal, setShowInvoicePrintModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    servicesAmount: "",
    total: "",
    method: "Cash",
    status: "Unpaid",
  });

  const triggerEditModal = (p) => {
    setSelectedPayment(p);
    setPaymentForm({
      amount: p.roomAmount,
      servicesAmount: p.servicesAmount,
      total: p.total,
      method: p.method,
      status: p.status,
    });
    setShowEditPaymentModal(true);
  };

  const triggerPrintModal = (p) => {
    setSelectedPayment(p);
    setShowInvoicePrintModal(true);
  };

  const localSubmitUpdate = (e) => {
    e.preventDefault();
    setPayments((prev) =>
      prev.map((p) =>
        p.id === selectedPayment.id
          ? {
              ...p,
              roomAmount: paymentForm.amount,
              servicesAmount: paymentForm.servicesAmount,
              total: paymentForm.total,
              method: paymentForm.method,
              status: paymentForm.status,
            }
          : p,
      ),
    );
    setShowEditPaymentModal(false);
    alert("Hóa đơn đã được cập nhật.");
  };

  const handlePrintAction = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="bg-white border border-primary-100 p-6">
        <div>
          <h3 className="font-serif text-lg font-normal text-sage-950">
            Sổ Nhật Ký Hóa Đơn & Giao Dịch
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Giám sát toàn bộ dòng tiền, hóa đơn đặt phòng, tiền cọc phòng và
            thanh toán các dịch vụ phát sinh của khách.
          </p>
        </div>
      </div>

      <div className="bg-white border border-primary-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-primary-50/50 text-sage-600 font-bold border-b border-primary-100">
                <th className="p-4">Mã Booking</th>
                <th className="p-4">Khách Hàng</th>
                <th className="p-4">Ngày checkin</th>
                <th className="p-4">Tiền phòng</th>
                <th className="p-4">Tiền dịch vụ</th>
                <th className="p-4">Tổng Hóa Đơn</th>
                <th className="p-4">Thanh Toán Qua</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4 text-center">Tác Vụ</th>
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
                      className={`px-2 py-0.5 rounded-none text-[10px] font-semibold uppercase tracking-wider ${
                        p.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {p.status === "Paid" ? "Đã thu" : "Chưa thu"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => triggerEditModal(p)}
                        className="px-2.5 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-950 rounded-none text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
                      >
                        Sửa thu chi
                      </button>
                      <button
                        onClick={() => triggerPrintModal(p)}
                        className="p-1.5 bg-primary-100 hover:bg-primary-200 text-primary-950 rounded-none cursor-pointer"
                        title="In hóa đơn chi tiết"
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

      {/* Edit Payment Modal */}
      {showEditPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-primary-50 pb-3">
              <h3 className="font-serif text-lg font-normal text-sage-950">
                Hiệu Chỉnh Hóa Đơn: {selectedPayment?.id}
              </h3>
              <button
                onClick={() => setShowEditPaymentModal(false)}
                className="text-sage-400 hover:text-sage-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={localSubmitUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Khách Hàng
                </label>
                <input
                  type="text"
                  value={selectedPayment?.customerName || ""}
                  disabled
                  className="w-full p-2.5 border border-primary-100 text-xs bg-sage-50 text-sage-400 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Tiền phòng
                  </label>
                  <input
                    type="text"
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, amount: e.target.value })
                    }
                    className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Tiền dịch vụ phát sinh
                  </label>
                  <input
                    type="text"
                    value={paymentForm.servicesAmount}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        servicesAmount: e.target.value,
                      })
                    }
                    className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Tổng cộng Hóa Đơn
                </label>
                <input
                  type="text"
                  value={paymentForm.total}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, total: e.target.value })
                  }
                  className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Hình thức thanh toán
                  </label>
                  <select
                    value={paymentForm.method}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, method: e.target.value })
                    }
                    className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
                  >
                    <option value="Cash">Cash (Tiền mặt)</option>
                    <option value="Banking">Banking (Chuyển khoản)</option>
                    <option value="Visa/Master">Visa / Master Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Trạng thái thu
                  </label>
                  <select
                    value={paymentForm.status}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, status: e.target.value })
                    }
                    className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
                  >
                    <option value="Paid">Đã thu toàn bộ</option>
                    <option value="Unpaid">Chưa thu / Nợ hóa đơn</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50">
                <button
                  type="button"
                  onClick={() => setShowEditPaymentModal(false)}
                  className="px-4 py-2 border border-primary-100 text-xs font-semibold uppercase tracking-wider hover:bg-primary-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-900 cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Invoice Modal */}
      {showInvoicePrintModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto print:p-0 print:shadow-none">
            <div className="flex justify-between items-center border-b border-primary-50 pb-3 print:hidden">
              <h3 className="font-serif text-lg font-normal text-sage-950">
                Xem trước hóa đơn in ấn
              </h3>
              <button
                onClick={() => setShowInvoicePrintModal(false)}
                className="text-sage-400 hover:text-sage-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Print Area */}
            <div className="space-y-6 text-left" id="print-area">
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
                    HÓA ĐƠN CHI TIẾT
                  </h4>
                  <p className="text-[10px] text-sage-500 mt-1">
                    Mã: {selectedPayment?.id}
                  </p>
                  <p className="text-[10px] text-sage-500">
                    Ngày in: {new Date().toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-sage-400 block uppercase tracking-wider">
                    Khách Hàng
                  </span>
                  <span className="font-bold text-sage-950">
                    {selectedPayment?.customerName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-sage-400 block uppercase tracking-wider">
                    Ngày checkin
                  </span>
                  <span className="font-bold text-sage-950">
                    {selectedPayment?.checkIn}
                  </span>
                </div>
              </div>

              <div className="border-t border-primary-100 pt-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-primary-100 text-sage-500 font-bold">
                      <th className="py-2 text-left">Hạng Mục</th>
                      <th className="py-2 text-right">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-primary-50/50">
                      <td className="py-3 font-semibold text-sage-900">
                        Chi phí phòng lưu trú ({selectedPayment?.id})
                      </td>
                      <td className="py-3 text-right font-bold text-sage-950">
                        {selectedPayment?.roomAmount}
                      </td>
                    </tr>
                    <tr className="border-b border-primary-50/50">
                      <td className="py-3 font-semibold text-sage-900">
                        Chi phí dịch vụ bổ trợ phát sinh
                      </td>
                      <td className="py-3 text-right font-bold text-sage-950">
                        {selectedPayment?.servicesAmount}
                      </td>
                    </tr>
                    <tr className="border-b border-primary-100 bg-primary-50/20">
                      <td className="py-3 font-bold text-primary-950">
                        Tổng thanh toán (Đã gồm VAT)
                      </td>
                      <td className="py-3 text-right font-bold text-primary-950">
                        {selectedPayment?.total}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-4">
                <div>
                  <span className="text-[10px] text-sage-400 block uppercase tracking-wider">
                    Hình thức
                  </span>
                  <span className="font-semibold text-sage-800">
                    {selectedPayment?.method === "Cash"
                      ? "Tiền mặt (VND)"
                      : selectedPayment?.method === "Banking"
                        ? "Chuyển khoản liên ngân hàng"
                        : "Thẻ Visa / Master"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-sage-400 block uppercase tracking-wider">
                    Tình trạng hóa đơn
                  </span>
                  <span
                    className={`font-bold uppercase ${selectedPayment?.status === "Paid" ? "text-green-700" : "text-red-700"}`}
                  >
                    {selectedPayment?.status === "Paid"
                      ? "ĐÃ HOÀN TẤT THU"
                      : "CHƯA THANH TOÁN (CÒN NỢ)"}
                  </span>
                </div>
              </div>

              <div className="pt-8 text-center border-t border-primary-50 text-[10px] text-sage-400 italic">
                Cảm ơn quý khách đã tin tưởng và chọn dịch vụ dưỡng trị liệu của
                Ngũ Sơn Resort!
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
                onClick={handlePrintAction}
                className="px-5 py-2 bg-primary-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-900 cursor-pointer flex items-center space-x-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>Thực hiện In (Ctrl+P)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
