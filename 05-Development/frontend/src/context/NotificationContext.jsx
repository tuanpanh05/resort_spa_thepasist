import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Function to show a toast
  const showToast = useCallback((message, type = "info", duration = 5000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    }
  }, []);

  // Helpers
  const showSuccess = useCallback((msg, dur) => showToast(msg, "success", dur), [showToast]);
  const showError = useCallback((msg, dur) => showToast(msg, "error", dur), [showToast]);
  const showWarning = useCallback((msg, dur) => showToast(msg, "warning", dur), [showToast]);
  const showInfo = useCallback((msg, dur) => showToast(msg, "info", dur), [showToast]);

  // Hook into global window.alert to make the upgrade global & automatic
  useEffect(() => {
    const originalAlert = window.alert;
    
    window.alert = (message) => {
      if (message === undefined || message === null) return;
      const strMsg = String(message);
      const lower = strMsg.toLowerCase();
      
      let type = "info";
      if (
        lower.includes("thành công") || 
        lower.includes("success") || 
        lower.includes("cảm ơn") || 
        lower.includes("ok")
      ) {
        type = "success";
      } else if (
        lower.includes("lỗi") || 
        lower.includes("thất bại") || 
        lower.includes("không") || 
        lower.includes("hỏng") || 
        lower.includes("sai") || 
        lower.includes("error") ||
        lower.includes("fail")
      ) {
        type = "error";
      } else if (
        lower.includes("vui lòng") || 
        lower.includes("cảnh báo") || 
        lower.includes("chú ý") || 
        lower.includes("warning")
      ) {
        type = "warning";
      }

      showToast(strMsg, type);
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [showToast]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-md w-full px-4 sm:px-0 pointer-events-none">
        {toasts.map((toast) => {
          // Determine styles based on luxury resort theme (Sage, Gold, Ivory, Earth)
          let bgColor = "bg-white/95";
          let borderColor = "border-[#cda250]/20";
          let textColor = "text-sage-950";
          let IconComponent = Info;
          let iconColor = "text-[#cda250]";

          if (toast.type === "success") {
            bgColor = "bg-[#f4f7f5]/95"; // Soft sage-white
            borderColor = "border-[#1a2c22]/20";
            textColor = "text-[#1a2c22]";
            iconColor = "text-emerald-600";
            IconComponent = CheckCircle2;
          } else if (toast.type === "error") {
            bgColor = "bg-[#fffafa]/95"; // Soft rose-white
            borderColor = "border-red-200";
            textColor = "text-red-950";
            iconColor = "text-red-500";
            IconComponent = AlertCircle;
          } else if (toast.type === "warning") {
            bgColor = "bg-[#fffdf9]/95"; // Soft warm gold-white
            borderColor = "border-amber-200";
            textColor = "text-amber-950";
            iconColor = "text-amber-500";
            IconComponent = AlertCircle;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-xl border shadow-[0_10px_30px_rgba(26,44,34,0.08)] backdrop-blur-md animate-slide-in transition-all duration-300 ${bgColor} ${borderColor} ${textColor}`}
              style={{
                animation: "toast-slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              }}
            >
              <div className={`mt-0.5 shrink-0 ${iconColor}`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="flex-1 text-sm font-medium leading-5">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-sage-400 hover:text-sage-900 cursor-pointer transition-colors p-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Slide-in Keyframe Animation Style Tag */}
      <style>{`
        @keyframes toast-slide-in {
          from {
            transform: translateX(100%) translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
