import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  Clock,
  ShieldCheck,
  Play,
  Check,
  CheckCircle2,
  Loader2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { specialistApi } from "../../api";

export default function ManageAppointments() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchSchedule = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await specialistApi.getTherapistSchedule(selectedDate);
      setAppointments(data || []);
    } catch (err) {
      console.error("Error fetching therapist schedule:", err);
      setError(err.message || "Không thể tải lịch làm việc ngày này.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate]);

  const handleUpdateSpaStatus = async (bookingId, newStatus) => {
    setActionLoadingId(bookingId);
    try {
      await specialistApi.updateStatus(bookingId, newStatus);
      alert(`Đã chuyển ca trị liệu sang: ${
        newStatus === "IN_PROGRESS" ? "Đang trị liệu" : "Đã hoàn thành"
      }`);
      fetchSchedule(); // Refresh data
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Cập nhật trạng thái thất bại: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatTimeRange = (startStr, endStr) => {
    if (!startStr) return "";
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);
      const pad = (num) => String(num).padStart(2, "0");
      return `${pad(start.getHours())}:${pad(start.getMinutes())} - ${pad(end.getHours())}:${pad(end.getMinutes())}`;
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header Info */}
      <div className="bg-white border border-sage-200/60 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-xl shadow-xs">
        <div>
          <h3 className="font-serif text-lg font-bold text-sage-950">
            Danh Sách Ca Đặt Trị Liệu Spa Trong Ngày
          </h3>
          <p className="text-xs text-sage-500 mt-1 font-light">
            Giám sát giờ giấc khách đến trị liệu, thực hiện cập nhật tiến độ trị liệu của khách hàng.
          </p>
        </div>
        
        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-sage-700">Chọn ngày làm việc:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 border border-sage-300 bg-white text-xs rounded focus:outline-none focus:border-forest-ink"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-forest-ink" />
          <span className="text-xs text-sage-500 uppercase tracking-wider font-semibold">Đang tải lịch trình...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 max-w-md mx-auto">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-sage-200 p-8 rounded-xl">
          <p className="text-xs text-sage-500 font-medium">Không có lịch hẹn đặt trị liệu nào trong ngày này.</p>
        </div>
      ) : (
        /* Grid of Appointments */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((app) => {
            const isPending = app.status === "CONFIRMED";
            const isInProgress = app.status === "IN_PROGRESS";
            const isCompleted = app.status === "COMPLETED";
            const isCancelled = app.status === "CANCELLED";
            const isNoShow = app.status === "NO_SHOW";
            
            return (
              <div
                key={app.spaBookingId}
                className={`bg-white border shadow-xs p-6 flex flex-col justify-between min-h-[220px] h-auto transition-all rounded-xl ${
                  isInProgress
                    ? "border-amber-350 ring-2 ring-amber-50"
                    : isCompleted
                      ? "border-green-200 opacity-80 bg-sage-50/5"
                      : "border-sage-200/60 hover:border-sage-800"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start border-b border-sage-100 pb-2.5">
                    <div>
                      <span className="text-[9px] font-mono text-sage-400 font-bold block">
                        SPA-{String(app.spaBookingId).padStart(4, '0')}
                      </span>
                      <span className="text-xs font-bold text-sage-800 font-mono block mt-1 uppercase">
                        PHÒNG: {app.treatmentRoomName || "CHƯA PHÂN"}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-sm ${
                        isPending
                          ? "bg-blue-50 text-blue-800 border border-blue-150"
                          : isInProgress
                            ? "bg-amber-50 text-amber-800 border border-amber-150 animate-pulse"
                            : isCompleted
                              ? "bg-green-50 text-green-800 border border-green-150"
                              : "bg-red-50 text-red-800 border border-red-150"
                      }`}
                    >
                      {isPending
                        ? "Chờ phục vụ"
                        : isInProgress
                          ? "Đang trị liệu"
                          : isCompleted
                            ? "Đã xong"
                            : isCancelled
                              ? "Đã hủy"
                              : "No Show"}
                    </span>
                  </div>

                  <h4 className="font-serif text-sm font-bold text-sage-950 mt-1.5">
                    {app.serviceName}
                  </h4>
                  <div className="space-y-1.5 text-xs text-sage-600 font-light pt-1">
                    <p className="flex items-center">
                      <Users className="h-3.5 w-3.5 mr-2 text-sage-500" />
                      Khách:{" "}
                      <strong className="text-sage-850 font-semibold">
                        {app.guestName}
                      </strong>
                    </p>
                    <p className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-2 text-sage-500" />
                      Giờ hẹn:{" "}
                      <span className="font-mono text-sage-800">{formatTimeRange(app.startDatetime, app.endDatetime)}</span>
                    </p>
                    <p className="flex items-center">
                      <ShieldCheck className="h-3.5 w-3.5 mr-2 text-sage-500" />
                      KTV đảm nhận:{" "}
                      <span className="text-sage-700">{app.therapistName}</span>
                    </p>
                  </div>

                  {/* GDPR Physical conditions decryption check */}
                  {app.note && (
                    <div className="bg-amber-50/50 border-l-2 border-amber-500 text-amber-800 p-2.5 text-[10px] font-light leading-relaxed mt-2.5 rounded">
                      <span className="font-bold">Hồ sơ thể trạng (GDPR):</span> {app.note}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-sage-100 flex justify-between items-center mt-4">
                  <span className="text-[10px] text-sage-400 font-medium">
                    Tác vụ KTV
                  </span>
                  <div className="flex space-x-1">
                    {actionLoadingId === app.spaBookingId ? (
                      <span className="text-[10px] text-sage-500 italic">Đang cập nhật...</span>
                    ) : (
                      <>
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleUpdateSpaStatus(app.spaBookingId, "IN_PROGRESS")}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center space-x-1 rounded-sm border-none"
                            >
                              <Play className="h-3 w-3 fill-white" />
                              <span>Bắt đầu ca</span>
                            </button>
                            <button
                              onClick={() => handleUpdateSpaStatus(app.spaBookingId, "NO_SHOW")}
                              className="px-2 py-1.5 bg-red-650 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer rounded-sm border-none"
                              title="Khách không đến"
                            >
                              No Show
                            </button>
                          </>
                        )}
                        {isInProgress && (
                          <button
                            onClick={() => handleUpdateSpaStatus(app.spaBookingId, "COMPLETED")}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center space-x-1 rounded-sm border-none"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Hoàn thành</span>
                          </button>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] font-bold text-green-600 uppercase flex items-center space-x-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Hoàn tất</span>
                          </span>
                        )}
                        {(isCancelled || isNoShow) && (
                          <span className="text-[10px] font-bold text-red-600 uppercase flex items-center space-x-1">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>{isCancelled ? "Đã hủy" : "Vắng mặt"}</span>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
