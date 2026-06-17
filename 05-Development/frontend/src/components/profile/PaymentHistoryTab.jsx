import React, { useState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import { fmtDateTime, fmtCurrency } from "../../utils/format";

export default function PaymentHistoryTab() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Current backend doesn't have an invoices controller endpoint yet.
    // We mock the database seed invoices from resort_spa_db.sql so users can see how they look.
    const mockInvoices = [
      {
        invoiceId: 1,
        roomBookingId: 1,
        roomSubtotal: 12500000,
        spaSubtotal: 0,
        foodSubtotal: 320000,
        taxAndFees: 1282000,
        finalAmount: 14102000,
        depositAmount: 3750000,
        amountDue: 10352000,
        status: "UNPAID",
        vnpayTranId: null,
        paymentTime: null,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        invoiceId: 2,
        roomBookingId: 2,
        roomSubtotal: 9000000,
        spaSubtotal: 1500000,
        foodSubtotal: 415000,
        taxAndFees: 1091500,
        finalAmount: 12006500,
        depositAmount: 2700000,
        amountDue: 0,
        status: "PAID",
        vnpayTranId: "VNP14328905",
        paymentTime: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    const timer = setTimeout(() => {
      setInvoices(mockInvoices);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="inline-flex p-4 rounded-md bg-primary-50 text-primary-300 mb-4">
        <CreditCard className="h-8 w-8" />
      </div>
      <p className="text-sage-500 text-sm">Bạn chưa có lịch sử thanh toán nào.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary-800 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <div key={inv.invoiceId} className="bg-white rounded-md border border-primary-100 p-5 shadow-sm">
              <div className="flex justify-between items-start border-b border-primary-50 pb-3 mb-3 flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-sage-900">Hóa đơn #{inv.invoiceId}</h4>
                  <p className="text-xs text-sage-400 mt-0.5">Ngày tạo: {fmtDateTime(inv.createdAt)}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-semibold ${
                    inv.status === "PAID"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {inv.status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-sage-400 block mb-0.5">Tổng tiền phòng</span>
                  <span className="font-semibold text-sage-800">{fmtCurrency(inv.roomSubtotal)}</span>
                </div>
                <div>
                  <span className="text-sage-400 block mb-0.5">Dịch vụ & Dưỡng sinh</span>
                  <span className="font-semibold text-sage-800">
                    {fmtCurrency(inv.spaSubtotal + inv.foodSubtotal)}
                  </span>
                </div>
                <div>
                  <span className="text-sage-400 block mb-0.5">Thuế & Phí dịch vụ</span>
                  <span className="font-semibold text-sage-800">{fmtCurrency(inv.taxAndFees)}</span>
                </div>
                <div>
                  <span className="text-sage-400 block mb-0.5">Đã đặt cọc (30%)</span>
                  <span className="font-semibold text-green-700">{fmtCurrency(inv.depositAmount)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-primary-50 flex-wrap gap-2 text-xs">
                <div className="flex gap-4">
                  {inv.vnpayTranId && (
                    <div>
                      <span className="text-sage-400">Giao dịch VNPAY: </span>
                      <span className="font-mono font-semibold text-sage-800">{inv.vnpayTranId}</span>
                    </div>
                  )}
                  {inv.paymentTime && (
                    <div>
                      <span className="text-sage-400">Thời gian: </span>
                      <span className="font-semibold text-sage-800">{fmtDateTime(inv.paymentTime)}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sage-500 font-medium">Tổng thanh toán: </span>
                  <span className="text-sm font-bold text-primary-950 font-serif">
                    {fmtCurrency(inv.finalAmount)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
