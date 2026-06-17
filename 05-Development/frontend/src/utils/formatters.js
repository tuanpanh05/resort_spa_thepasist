export const fmtDate = (val) => val ? new Date(val).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
export const fmtDateTime = (val) => val ? new Date(val).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
export const fmtCurrency = (val) => val != null ? Number(val).toLocaleString("vi-VN") + " ₫" : "—";
