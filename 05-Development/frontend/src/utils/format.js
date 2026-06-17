// Date formatting: DD/MM/YYYY
export const fmtDate = (val) =>
  val ? new Date(val).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

// Date time formatting: DD/MM/YYYY, HH:MM
export const fmtDateTime = (val) =>
  val
    ? new Date(val).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

// Currency formatting with trailing '₫'
export const fmtCurrency = (val) => (val != null ? Number(val).toLocaleString("vi-VN") + " ₫" : "—");

// Currency formatting standard VND
export const formatCurrency = (val) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};
