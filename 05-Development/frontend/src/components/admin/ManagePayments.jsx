import React, { useState } from "react";
import { CreditCard, Printer, X } from "lucide-react";

export default function ManagePayments({ payments }) {
  const [showInvoicePrintModal, setShowInvoicePrintModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const triggerPrintModal = (p) => {
    setSelectedInvoice(p);
    setShowInvoicePrintModal(true);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const formatStayDates = (inDate, outDate) => {
    if (!inDate || !outDate) return "—";
    const d1 = new Date(inDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    const d2 = new Date(outDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    return `${d1} - ${d2}`;
  };

  // Filter payments
  const filteredPayments = (payments || []).filter((p) => {
    const matchesSearch =
      p.invoiceId?.toString().includes(searchTerm) ||
      (p.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.roomNumber || "").toLowerCase().includes(searchTerm.toLowerCase());

    const isPaid = p.status?.toUpperCase() === "PAID";
    const isPendingDeposit = p.bookingStatus === "PENDING_DEPOSIT";
    const statusVal = isPaid ? "paid" : isPendingDeposit ? "pending_deposit" : "unpaid";

    const matchesStatus = statusFilter === "all" || statusVal === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="bg-white border border-primary-100 p-6">
        <div>
          <h3 className="font-serif text-lg font-normal text-sage-955">
            Sổ Nhật Ký Hóa Đơn & Giao Dịch
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Giám sát toàn bộ dòng tiền, hóa đơn đặt phòng, tiền cọc phòng và thanh toán các dịch vụ phát sinh của khách.
          </p>
        </div>
      </div>

      {/* Search and Filters Controls */}
      <div className="bg-primary-50/50 border border-primary-100 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm theo tên khách, số phòng, mã hóa đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-primary-200 bg-white focus:outline-primary-300"
          />
        </div>
        <div className="w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 text-xs border border-primary-200 bg-white focus:outline-primary-300 w-full md:w-48"
          >
            <option value="all">Tất cả hóa đơn</option>
            <option value="paid">Đã thu (PAID)</option>
            <option value="pending_deposit">Chờ đặt cọc</option>
            <option value="unpaid">Chờ thanh toán (UNPAID)</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-primary-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-primary-50/50 text-sage-600 font-bold border-b border-primary-100">
                <th className="p-4">Mã HĐ</th>
                <th className="p-4">Khách Hàng</th>
                <th className="p-4">Phòng</th>
                <th className="p-4">Thời Gian Lưu Trú</th>
                <th className="p-4 text-right">Tổng HĐ (100%)</th>
                <th className="p-4 text-right">Đã Cọc (30%)</th>
                <th className="p-4 text-right">Còn Nợ (Cọc/70%+DV)</th>
                <th className="p-4 text-center">Trạng Thái</th>
                <th className="p-4 text-center">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50/50">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-sage-400 italic">
                    Không tìm thấy dữ liệu hóa đơn nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isPaid = p.status?.toUpperCase() === "PAID";
                  const methodText = p.vnpayTranId ? "VNPAY" : "Tiền mặt tại quầy";
                  const isPendingDeposit = p.bookingStatus === "PENDING_DEPOSIT";

                  return (
                    <tr key={p.invoiceId} className="hover:bg-primary-50/10">
                      <td className="p-4 font-bold text-primary-955">#NS-{p.invoiceId}</td>
                      <td className="p-4 font-bold text-sage-955">
                        {p.customerName || "Khách vãng lai"}
                      </td>
                      <td className="p-4 text-sage-700">
                        <span className="px-1.5 py-0.5 bg-primary-100 text-primary-900 font-semibold font-mono">
                          {p.roomNumber || "Chưa gán"}
                        </span>
                      </td>
                      <td className="p-4 text-sage-700">
                        {formatStayDates(p.checkInDate, p.checkOutDate)}
                      </td>
                      <td className="p-4 text-right font-semibold text-sage-950">
                        {formatCurrency(p.finalAmount)}
                      </td>
                      <td className="p-4 text-right text-sage-600">
                        {formatCurrency(p.depositAmount)}
                      </td>
                      <td className={`p-4 text-right font-bold ${isPaid ? "text-green-700" : "text-red-700"}`}>
                        {isPaid
                          ? "0 ₫"
                          : isPendingDeposit
                            ? `${formatCurrency(p.finalAmount * 0.3)} (Cọc)`
                            : formatCurrency(p.amountDue)}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider ${
                            isPaid
                              ? "bg-green-100 text-green-700"
                              : isPendingDeposit
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-50 text-red-700"
                          }`}
                        >
                          {isPaid ? "Đã thu" : isPendingDeposit ? "Chờ cọc" : "Chờ thu"}
                        </span>
                        {isPaid && (
                          <span className="block text-[9px] text-sage-400 mt-0.5 italic">
                            ({methodText})
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => triggerPrintModal(p)}
                            className="p-1.5 bg-primary-100 hover:bg-primary-200 text-primary-950 rounded-none cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"
                            title="In hóa đơn chi tiết"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span>Chi tiết</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Invoice Modal */}
      {showInvoicePrintModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto print:p-0 print:shadow-none border border-primary-200">
            <div className="flex justify-between items-center border-b border-primary-50 pb-3 print:hidden">
              <h3 className="font-serif text-lg font-normal text-sage-955">
                Xem trước hóa đơn thanh toán
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
                  <h2 className="font-serif text-xl font-normal text-primary-900 uppercase tracking-wide">
                    NGŨ SƠN RESORT & SPA
                  </h2>
                  <p className="text-[10px] text-sage-500 mt-1">
                    Hòa Sơn, Hòa Vang, Đà Nẵng, Việt Nam
                  </p>
                  <p className="text-[10px] text-sage-500">
                    Hotline: +84 236 3888 999 | Email: billing@ngusonresort.com
                  </p>
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-sm text-sage-950 uppercase tracking-wider">
                    HÓA ĐƠN CHI TIẾT
                  </h4>
                  <p className="text-[10px] text-red-800 mt-1 font-bold">
                    Mã hóa đơn: #NS-{selectedInvoice.invoiceId}
                  </p>
                  <p className="text-[10px] text-sage-500">
                    Mã đặt phòng: #BK-{selectedInvoice.bookingId}
                  </p>
                  <p className="text-[10px] text-sage-500">
                    Ngày in: {formatDate(selectedInvoice.paymentTime || new Date())}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-primary-50/20 p-4 border border-primary-50">
                <div>
                  <span className="text-[10px] text-sage-400 block uppercase tracking-wider font-semibold">
                    Khách Hàng
                  </span>
                  <span className="font-bold text-sage-955 block text-sm mt-0.5">
                    {selectedInvoice.customerName || "Khách vãng lai"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-sage-400 block uppercase tracking-wider font-semibold">
                    Phòng Đã Gán
                  </span>
                  <span className="font-bold text-primary-950 block text-sm mt-0.5 font-mono">
                    {selectedInvoice.roomNumber || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-sage-400 block uppercase tracking-wider font-semibold">
                    Ngày Nhận Phòng (Check-in)
                  </span>
                  <span className="font-medium text-sage-900 block mt-0.5">
                    {formatDate(selectedInvoice.checkInDate)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-sage-400 block uppercase tracking-wider font-semibold">
                    Ngày Trả Phòng (Check-out)
                  </span>
                  <span className="font-medium text-sage-900 block mt-0.5">
                    {formatDate(selectedInvoice.checkOutDate)}
                  </span>
                </div>
              </div>

              <div className="border-t border-primary-100 pt-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-primary-100 text-sage-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2 text-left">Hạng Mục</th>
                      <th className="py-2 text-right">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-50">
                    <tr>
                      <td className="py-3 font-semibold text-sage-900">
                        Chi phí phòng nghỉ & Gói trị liệu
                      </td>
                      <td className="py-3 text-right font-bold text-sage-955">
                        {formatCurrency(selectedInvoice.roomSubtotal)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-sage-900">
                        Chi phí Dịch vụ Spa trị liệu phát sinh
                      </td>
                      <td className="py-3 text-right font-bold text-sage-955">
                        {formatCurrency(selectedInvoice.spaSubtotal)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-sage-900">
                        Chi phí Ẩm thực tại nhà hàng & Room Service
                      </td>
                      <td className="py-3 text-right font-bold text-sage-955">
                        {formatCurrency(selectedInvoice.foodSubtotal)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-sage-500 italic">
                        Thuế GTGT & Phí dịch vụ (10%)
                      </td>
                      <td className="py-3 text-right text-sage-600">
                        {formatCurrency(selectedInvoice.taxAndFees)}
                      </td>
                    </tr>
                    <tr className="bg-primary-50/20 font-bold text-primary-950 border-t border-primary-200">
                      <td className="py-3 px-2 text-primary-900">
                        TỔNG HÓA ĐƠN TỔNG CỘNG (100%)
                      </td>
                      <td className="py-3 px-2 text-right text-primary-950 text-sm">
                        {formatCurrency(selectedInvoice.finalAmount)}
                      </td>
                    </tr>
                    <tr className="text-green-700 font-semibold bg-green-50/20">
                      <td className="py-3 px-2">
                        Đã thanh toán tiền đặt cọc trước (30%)
                      </td>
                      <td className="py-3 px-2 text-right">
                        - {formatCurrency(selectedInvoice.depositAmount)}
                      </td>
                    </tr>
                    <tr className="bg-red-50/20 font-bold text-red-950 border-t-2 border-red-100">
                      <td className="py-3 px-2 text-red-900">
                        SỐ TIỀN CÒN NỢ CẦN THU (70% + DV)
                      </td>
                      <td className="py-3 px-2 text-right text-red-700 text-base">
                        {selectedInvoice.status?.toUpperCase() === "PAID"
                          ? "0 ₫ (Đã thanh toán)"
                          : formatCurrency(selectedInvoice.amountDue)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-primary-100 bg-primary-50/10 p-4">
                <div>
                  <span className="text-[10px] text-sage-400 block uppercase tracking-wider font-semibold">
                    Phương Thức Thanh Toán
                  </span>
                  <span className="font-semibold text-sage-800 text-sm mt-0.5">
                    {selectedInvoice.status?.toUpperCase() === "PAID"
                      ? (selectedInvoice.vnpayTranId ? "Chuyển khoản VNPAY" : "Tiền mặt tại quầy")
                      : "Chưa thanh toán"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-sage-400 block uppercase tracking-wider font-semibold">
                    Tình Trạng Hóa Đơn
                  </span>
                  <span
                    className={`font-bold text-sm mt-0.5 block uppercase ${
                      selectedInvoice.status?.toUpperCase() === "PAID"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {selectedInvoice.status?.toUpperCase() === "PAID"
                      ? "ĐÃ HOÀN TẤT THU"
                      : "CHƯA THANH TOÁN (CÒN NỢ)"}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-center text-sage-400 italic pt-6">
                Cảm ơn quý khách đã tin tưởng và chọn dịch vụ dưỡng trị liệu của Ngũ Sơn Resort!
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
                onClick={handlePrintAction => window.print()}
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
