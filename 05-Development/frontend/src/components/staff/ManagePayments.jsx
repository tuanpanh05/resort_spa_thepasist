import React, { useState, useEffect } from "react";
import { CreditCard, Printer, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { paymentApi } from "../../api";

export default function ManagePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInvoicePrintModal, setShowInvoicePrintModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentApi.getAllInvoices();
      // Sort invoices so unpaid/newest appear first
      const sortedData = (data || []).sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === "UNPAID" ? -1 : 1;
        }
        return b.invoiceId - a.invoiceId;
      });
      setPayments(sortedData);
    } catch (err) {
      console.error("Error loading invoices:", err);
      setError(err.message || "Không thể tải danh sách hóa đơn từ máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCashPayment = async (invoiceId, bookingId, bookingStatus, checkOutDate) => {
    const isDeposit = bookingStatus === "PENDING_DEPOSIT";
    let isEarlyCheckout = false;

    if (isDeposit) {
      if (!window.confirm(`Xác nhận thu tiền mặt ĐẶT CỌC (30%) cho hóa đơn #${invoiceId}?`)) {
        return;
      }
    } else {
      if (checkOutDate) {
        const checkOut = new Date(checkOutDate);
        const now = new Date();
        if (now < checkOut) {
          const formattedCheckOut = checkOut.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });
          const earlyConfirm = window.confirm(
            `Cảnh báo: Thời gian lưu trú của khách chưa kết thúc.\n(Thời gian check-out dự kiến: ${formattedCheckOut})\n\nBạn có chắc chắn muốn xác nhận thanh toán và thực hiện thủ tục TRẢ PHÒNG SỚM (Early Check-out) không?\n\n⚠️ Lưu ý: Tất cả đơn ăn uống đang chế biến/chờ xử lý sẽ bị HỦY tự động.`
          );
          if (!earlyConfirm) {
            return;
          }
          isEarlyCheckout = true;
        } else {
          if (!window.confirm(`Xác nhận thanh toán tiền mặt còn lại và CHECK-OUT cho hóa đơn #${invoiceId}?`)) {
            return;
          }
        }
      } else {
        if (!window.confirm(`Xác nhận thanh toán tiền mặt còn lại và CHECK-OUT cho hóa đơn #${invoiceId}?`)) {
          return;
        }
      }
    }

    setActionLoading(invoiceId);
    try {
      if (!isDeposit && !isEarlyCheckout) {
        // Normal checkout: validate no pending orders first
        if (bookingId) {
          try {
            await paymentApi.validateCheckout(bookingId);
          } catch (err) {
            alert(`Không thể checkout: Khách hàng vẫn còn dịch vụ hoặc đơn ăn uống chưa hoàn thành/hủy bỏ! Chi tiết: ${err.message}`);
            setActionLoading(null);
            return;
          }
        }
      }

      // 1. Đánh dấu thanh toán tiền mặt tại quầy
      await paymentApi.markCashPayment(invoiceId);

      // 2. Thực hiện checkout phù hợp với loại
      if (!isDeposit) {
        if (isEarlyCheckout) {
          // Early checkout: backend sẽ tự hủy đơn F&B pending trước
          await paymentApi.earlyCheckout(invoiceId);
          alert(`Đã xác nhận thanh toán và hoàn tất TRẢ PHÒNG SỚM cho hóa đơn #${invoiceId}.\nCác đơn ăn uống chưa xử lý đã được hủy tự động. Phòng đã chuyển sang trạng thái DIRTY (đang dọn dẹp).`);
        } else {
          await paymentApi.performCheckout(invoiceId);
          alert(`Đã xác nhận thanh toán tiền mặt và hoàn tất check-out cho hóa đơn #${invoiceId}. Phòng đã chuyển sang trạng thái DIRTY (đang dọn dẹp).`);
        }
      } else {
        alert(`Đã xác nhận thu tiền mặt ĐẶT CỌC thành công cho hóa đơn #${invoiceId}. Đơn đặt phòng đã được chuyển sang trạng thái XÁC NHẬN (CONFIRMED).`);
      }

      fetchInvoices(); // Refresh list
    } catch (err) {
      alert(`Gặp lỗi khi xử lý thanh toán: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePrintInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoicePrintModal(true);
  };

  const handleEditPaymentBlocked = () => {
    alert(
      "Cảnh báo bảo mật: Bạn KHÔNG CÓ QUYỀN sửa đổi thông tin số liệu hóa đơn trực tiếp! Mọi điều chỉnh phải được thực hiện thông qua nghiệp vụ thêm/bớt dịch vụ phát sinh hoặc do Admin/Kế toán trưởng phê duyệt.",
    );
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-sage-500 bg-white border border-primary-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary-800 mb-3" />
        <span className="text-xs">Đang tải danh sách hóa đơn từ cơ sở dữ liệu...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 text-left text-red-700 text-xs sm:text-sm space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="font-bold">Lỗi tải dữ liệu hóa đơn</span>
        </div>
        <p>{error}</p>
        <button
          onClick={fetchInvoices}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-semibold text-xs transition-colors cursor-pointer"
        >
          Tải lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header Info */}
      <div className="bg-white border border-primary-100 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg font-normal text-sage-950">
              Quản Lý Hóa Đơn & Check-out Khách Hàng
            </h3>
            <p className="text-xs text-sage-500 mt-1">
              Hệ thống quản lý công nợ phòng nghỉ. Theo dõi số tiền đã cọc (30%), số tiền dịch vụ phát sinh và số tiền còn lại (70% + dịch vụ) cần thu khi check-out.
            </p>
          </div>
          <button
            onClick={fetchInvoices}
            className="self-start sm:self-center px-3 py-1.5 border border-primary-200 text-xs text-sage-700 hover:bg-primary-50 cursor-pointer"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* Invoice Table */}
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
                <th className="p-4 text-center">Tác vụ thu ngân</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50/50">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-sage-400 italic">
                    Không tìm thấy dữ liệu hóa đơn nào trong hệ thống.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const isPaid = p.status?.toUpperCase() === "PAID";
                  const methodText = p.vnpayTranId ? "VNPAY" : "Tiền mặt tại quầy";
                  const isPendingDeposit = p.bookingStatus === "PENDING_DEPOSIT";

                  return (
                    <tr key={p.invoiceId} className="hover:bg-primary-50/10">
                      <td className="p-4 font-bold text-primary-950">#NS-{p.invoiceId}</td>
                      <td className="p-4 font-bold text-sage-950">
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
                        <div className="flex items-center justify-center space-x-1.5">
                          {!isPaid ? (
                            <button
                              onClick={() => handleConfirmCashPayment(p.invoiceId, p.bookingId, p.bookingStatus, p.checkOutDate)}
                              disabled={actionLoading === p.invoiceId}
                              className={`px-2.5 py-1.5 text-white rounded-none text-[10px] font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50 inline-flex items-center gap-1 ${
                                isPendingDeposit
                                  ? "bg-amber-700 hover:bg-amber-800"
                                  : "bg-primary-800 hover:bg-primary-900"
                              }`}
                            >
                              {actionLoading === p.invoiceId ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : isPendingDeposit ? (
                                "Thu tiền cọc"
                              ) : (
                                "Thanh toán & Check-out"
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={handleEditPaymentBlocked}
                              className="px-2.5 py-1.5 bg-sage-100 hover:bg-sage-200 text-sage-400 rounded-none text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
                            >
                              Khóa
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Print Modal */}
      {showInvoicePrintModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto print:p-0 print:shadow-none border border-primary-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-primary-50 pb-3 print:hidden">
              <h3 className="font-serif text-lg font-normal text-sage-950">
                Chi Tiết Hóa Đơn Thanh Toán
              </h3>
              <button
                onClick={() => setShowInvoicePrintModal(false)}
                className="text-sage-400 hover:text-sage-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Print Area */}
            <div className="space-y-6 text-left" id="staff-print-area">
              {/* Branding */}
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
                    HÓA ĐƠN KHÁCH SẠN
                  </h4>
                  <p className="text-[10px] text-red-800 mt-1 font-bold">
                    Mã hóa đơn: #NS-{selectedInvoice.invoiceId}
                  </p>
                  <p className="text-[10px] text-sage-500">
                    Mã đặt phòng: #BK-{selectedInvoice.bookingId}
                  </p>
                  <p className="text-[10px] text-sage-500">
                    Ngày xuất: {formatDate(selectedInvoice.paymentTime || new Date())}
                  </p>
                </div>
              </div>

              {/* Guest & Room Info */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-primary-50/20 p-4 border border-primary-50">
                <div>
                  <span className="text-[10px] text-sage-400 block uppercase tracking-wider font-semibold">
                    Khách Hàng
                  </span>
                  <span className="font-bold text-sage-950 block text-sm mt-0.5">
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

              {/* Items Breakdown Table */}
              <div className="border-t border-primary-100 pt-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-primary-100 text-sage-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2 text-left">Nội Dung Hạng Mục</th>
                      <th className="py-2 text-right">Chi Phí (VND)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-50">
                    <tr>
                      <td className="py-3 font-semibold text-sage-900">
                        Chi phí phòng nghỉ & Gói trị liệu
                      </td>
                      <td className="py-3 text-right font-bold text-sage-950">
                        {formatCurrency(selectedInvoice.roomSubtotal)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-sage-900">
                        Chi phí Dịch vụ Spa trị liệu phát sinh
                      </td>
                      <td className="py-3 text-right font-bold text-sage-950">
                        {formatCurrency(selectedInvoice.spaSubtotal)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-sage-900">
                        Chi phí Ẩm thực tại nhà hàng & Room Service
                      </td>
                      <td className="py-3 text-right font-bold text-sage-950">
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

              {/* Payment Details */}
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
                    Trạng Thái Giao Dịch
                  </span>
                  <span
                    className={`font-bold text-sm mt-0.5 block uppercase ${
                      selectedInvoice.status?.toUpperCase() === "PAID"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {selectedInvoice.status?.toUpperCase() === "PAID"
                      ? "ĐÃ THANH TOÁN XONG"
                      : "CHƯA THANH TOÁN (CÒN NỢ)"}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-center text-sage-400 italic pt-6">
                Cảm ơn Quý khách đã lựa chọn dịch vụ nghỉ dưỡng trị liệu tại Ngũ Sơn Resort & Spa!
              </div>
            </div>

            {/* Modal Actions */}
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
