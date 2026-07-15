import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Trash2, AlertTriangle } from "lucide-react";
import { fmtDateTime, fmtCurrency } from "../../utils/formatters";
import { paymentApi, userApi } from "../../api";
import { useLanguage } from "../../context/LanguageContext";

export default function PaymentHistory({ profile }) {
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [hiddenInvoiceIds, setHiddenInvoiceIds] = useState(() => {
    try {
      const saved = localStorage.getItem("hidden_invoice_ids");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        let uId = profile?.userId;
        if (!uId) {
          const userProfile = await userApi.getProfile();
          uId = userProfile?.userId;
        }
        if (uId) {
          const data = await paymentApi.getInvoicesByUserId(uId);
          // Sort invoices by createdAt descending (newest first)
          const sorted = (data || []).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          setInvoices(sorted);
        }
      } catch (err) {
        console.error("Lỗi khi tải hóa đơn:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [profile?.userId]);

  useEffect(() => {
    if (invoices && invoices.length > 0 && hiddenInvoiceIds.length > 0) {
      try {
        const savedBookings = localStorage.getItem("hidden_booking_ids");
        const hiddenBookings = savedBookings ? JSON.parse(savedBookings).map(String) : [];
        let updated = false;

        hiddenInvoiceIds.forEach(invId => {
          const matchedInv = invoices.find(inv => String(inv.invoiceId) === String(invId));
          if (matchedInv && matchedInv.bookingId) {
            const bIdStr = String(matchedInv.bookingId);
            if (!hiddenBookings.includes(bIdStr)) {
              hiddenBookings.push(bIdStr);
              updated = true;
            }
          }
        });

        if (updated) {
          localStorage.setItem("hidden_booking_ids", JSON.stringify(hiddenBookings));
        }
      } catch (e) {
        console.error("Migration of hidden bookings failed:", e);
      }
    }
  }, [invoices, hiddenInvoiceIds]);

  const confirmDelete = () => {
    if (deleteTargetId) {
      const targetInvoice = invoices.find(inv => inv.invoiceId === deleteTargetId);
      const updated = [...hiddenInvoiceIds, deleteTargetId];
      setHiddenInvoiceIds(updated);
      try {
        localStorage.setItem("hidden_invoice_ids", JSON.stringify(updated));

        if (targetInvoice && targetInvoice.bookingId) {
          const savedBookings = localStorage.getItem("hidden_booking_ids");
          const hiddenBookings = savedBookings ? JSON.parse(savedBookings).map(String) : [];
          const bIdStr = String(targetInvoice.bookingId);
          if (!hiddenBookings.includes(bIdStr)) {
            hiddenBookings.push(bIdStr);
            localStorage.setItem("hidden_booking_ids", JSON.stringify(hiddenBookings));
          }
        }
      } catch (e) {
        console.error("Failed to save hidden invoice/booking IDs:", e);
      }
      setDeleteTargetId(null);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    if (hiddenInvoiceIds.includes(inv.invoiceId)) return false;
    if (filterDate) {
      if (!inv.createdAt) return false;
      const invDateStr = inv.createdAt.split("T")[0];
      return invDateStr === filterDate;
    }
    return true;
  });

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="inline-flex p-4 rounded-md bg-primary-50 text-primary-300 mb-4">
        <CreditCard className="h-8 w-8" />
      </div>
      <p className="text-sage-500 text-sm">{t("profile.paymentEmpty")}</p>
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
        <>
          {/* Date Filter Block */}
          <div className="bg-white border border-primary-100 rounded-md p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs font-semibold text-sage-700 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-primary-700" />
              Lọc hóa đơn theo ngày tạo:
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-1.5 border border-primary-200 rounded text-xs text-sage-700 focus:outline-none focus:border-primary-500 bg-white w-full sm:w-auto cursor-pointer"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate("")}
                  className="px-2.5 py-1.5 bg-sage-100 hover:bg-sage-200 text-sage-750 text-xs font-semibold rounded cursor-pointer transition-colors whitespace-nowrap"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-dashed border-primary-200 rounded-md p-5">
              <div className="inline-flex p-4 rounded-md bg-primary-50 text-primary-300 mb-4">
                <CreditCard className="h-8 w-8" />
              </div>
              <p className="text-sage-500 text-xs max-w-sm">
                {filterDate 
                  ? `Không tìm thấy hóa đơn nào được tạo trong ngày ${new Date(filterDate).toLocaleDateString("vi-VN")}.` 
                  : "Danh sách hóa đơn của bạn hiện đang trống hoặc tất cả đã bị ẩn."}
              </p>
              {filterDate && (
                <button
                  onClick={() => setFilterDate("")}
                  className="mt-4 px-4 py-2 bg-primary-900 hover:bg-primary-800 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Xem tất cả hóa đơn
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {filteredInvoices.map((inv) => (
                <div key={inv.invoiceId} className="bg-white rounded-md border border-primary-100 p-5 shadow-sm">
                  <div className="flex justify-between items-start border-b border-primary-50 pb-3 mb-3 flex-wrap gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-sage-900">{t("profile.paymentInvoiceId")} #{inv.invoiceId}</h4>
                      <p className="text-xs text-sage-400 mt-0.5">{t("profile.paymentCreatedAt")}: {fmtDateTime(inv.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-semibold ${
                        inv.bookingStatus === "CANCELLED"
                          ? "bg-red-50 text-red-800 border border-red-200"
                          : inv.status === "PAID"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}>
                        {inv.bookingStatus === "CANCELLED" 
                          ? t("profile.statusCancelled") 
                          : inv.status === "PAID" 
                            ? t("profile.paymentStatusPaid") 
                            : t("profile.paymentStatusUnpaid")}
                      </span>
                      <button
                        onClick={() => setDeleteTargetId(inv.invoiceId)}
                        title="Ẩn hóa đơn này"
                        className="p-1.5 text-sage-400 hover:text-red-650 hover:bg-red-50 transition-colors rounded cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-sage-600">
                    <div className="flex justify-between">
                      <span>{t("profile.paymentRefBooking")}:</span>
                      <span className="font-semibold text-sage-800">Booking #{inv.bookingId}</span>
                    </div>
                    <div className="flex justify-between pl-3 border-l-2 border-primary-100">
                      <span>{t("profile.paymentRoomSubtotal")}:</span>
                      <span>{fmtCurrency(inv.roomSubtotal)}</span>
                    </div>
                    <div className="flex justify-between pl-3 border-l-2 border-primary-100">
                      <span>{t("profile.paymentSpaSubtotal")}:</span>
                      <span>{fmtCurrency(inv.spaSubtotal)}</span>
                    </div>
                    <div className="flex justify-between pl-3 border-l-2 border-primary-100">
                      <span>{t("profile.paymentFoodSubtotal")}:</span>
                      <span>{fmtCurrency(inv.foodSubtotal)}</span>
                    </div>
                    <div className="flex justify-between pl-3 border-l-2 border-primary-100">
                      <span>{t("profile.paymentTaxFees")}:</span>
                      <span>{fmtCurrency(inv.taxAndFees)}</span>
                    </div>
                    <div className="border-t border-primary-50 my-2" />
                    <div className="flex justify-between text-sm font-bold text-sage-900">
                      <span>{t("profile.paymentTotalAmount")}:</span>
                      <span>{fmtCurrency(inv.finalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-emerald-700">
                      <span>{t("profile.paymentDepositPaid")}:</span>
                      <span>-{fmtCurrency(inv.depositAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-rose-700">
                      <span>{t("profile.paymentAmountDue")}:</span>
                      <span>{inv.status === "PAID" ? fmtCurrency(0) : fmtCurrency(inv.amountDue)}</span>
                    </div>

                    {inv.status === "PAID" && (
                      <div className="mt-4 pt-3 border-t border-primary-50 space-y-1 bg-emerald-50/40 p-2.5 rounded-sm animate-fade-in">
                        <p className="font-semibold text-emerald-800 text-[11px] uppercase tracking-wider">{t("profile.paymentVnpayTitle")}</p>
                        <div className="flex justify-between text-[11px] text-emerald-700 mt-1">
                          <span>{t("profile.paymentVnpayId")}:</span>
                          <span className="font-mono font-medium">{inv.vnpayTranId}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-emerald-700">
                          <span>{t("profile.paymentVnpayTime")}:</span>
                          <span>{fmtDateTime(inv.paymentTime)}</span>
                        </div>
                      </div>
                    )}

                    {(inv.status === "PAID" || ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"].includes(inv.bookingStatus)) && (
                      <div className="mt-4 pt-3 border-t border-primary-100 flex justify-end">
                        <Link
                          to={`/payment?invoiceId=${inv.invoiceId}`}
                          target="_blank"
                          className="inline-flex items-center justify-center px-3.5 py-1.5 border border-primary-800 text-primary-800 hover:bg-primary-800 hover:text-white text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Xem chi tiết hóa đơn & In
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-white max-w-sm w-full p-6 shadow-xl border border-primary-100 rounded-md text-left mx-4 animate-fade-in">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="p-2 bg-red-50 text-red-750 rounded-full flex-shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-sage-900">
                  Xác nhận xóa hóa đơn
                </h3>
                <p className="text-xs text-sage-500 mt-1.5 leading-relaxed">
                  Bạn có chắc chắn muốn xóa hóa đơn <strong>#NS-{deleteTargetId}</strong> khỏi danh sách hiển thị không? 
                  Hóa đơn sẽ bị ẩn khỏi tài khoản của bạn và hành động này không thể hoàn tác.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 border-t border-primary-50 pt-4 mt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 border border-sage-200 hover:bg-sage-50 text-sage-700 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

