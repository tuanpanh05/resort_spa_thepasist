import React, { useState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import { fmtDateTime, fmtCurrency } from "../../utils/formatters";
import { paymentApi, userApi } from "../../api";
import { useLanguage } from "../../context/LanguageContext";

export default function PaymentHistory({ profile }) {
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <div className="space-y-4">
          {invoices.map((inv) => (
            <div key={inv.invoiceId} className="bg-white rounded-md border border-primary-100 p-5 shadow-sm">
              <div className="flex justify-between items-start border-b border-primary-50 pb-3 mb-3 flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-sage-900">{t("profile.paymentInvoiceId")} #{inv.invoiceId}</h4>
                  <p className="text-xs text-sage-400 mt-0.5">{t("profile.paymentCreatedAt")}: {fmtDateTime(inv.createdAt)}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-semibold ${
                  inv.status === "PAID"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}>
                  {inv.status === "PAID" ? t("profile.paymentStatusPaid") : t("profile.paymentStatusUnpaid")}
                </span>
              </div>

              <div className="space-y-2 text-xs text-sage-600">
                <div className="flex justify-between">
                  <span>{t("profile.paymentRefBooking")}:</span>
                  <span className="font-semibold text-sage-800">Booking #{inv.roomBookingId}</span>
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
                  <div className="mt-4 pt-3 border-t border-primary-50 space-y-1 bg-emerald-50/40 p-2.5 rounded-sm">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
