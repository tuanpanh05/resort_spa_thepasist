import React from "react";
import {
  Calendar,
  Users,
  Clock,
  ShieldCheck,
  Play,
  Check,
  CheckCircle2,
} from "lucide-react";

export default function ManageAppointments({
  spaAppointments,
  setSpaAppointments,
}) {
  const handleUpdateSpaStatus = (id, newStatus) => {
    setSpaAppointments((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          alert(
            `Đã chuyển ca trị liệu của ${app.guest} sang: ${
              newStatus === "In Progress" ? "Đang trị liệu" : "Đã hoàn thành"
            }`,
          );
          return { ...app, status: newStatus };
        }
        return app;
      }),
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header Info */}
      <div className="bg-white border border-sage-200/60 p-6">
        <h3 className="font-serif text-lg font-bold text-sage-950">
          Danh Sách Ca Đặt Trị Liệu Spa Trong Ngày
        </h3>
        <p className="text-xs text-sage-500 mt-1">
          Giám sát giờ giấc khách đến trị liệu, phân công kỹ thuật viên xoa bóp
          bấm huyệt và thảo dược tắm.
        </p>
      </div>

      {/* Grid of Appointments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaAppointments.map((app) => (
          <div
            key={app.id}
            className={`bg-white border shadow-xs p-6 flex flex-col justify-between min-h-[220px] h-auto transition-all ${
              app.status === "In Progress"
                ? "border-amber-350 ring-2 ring-amber-50"
                : app.status === "Completed"
                  ? "border-green-200 opacity-80 bg-sage-50/5"
                  : "border-sage-200/60 hover:border-sage-800"
            }`}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start border-b border-sage-100 pb-2.5">
                <div>
                  <span className="text-[9px] font-mono text-sage-400 font-bold block">
                    {app.id}
                  </span>
                  <span className="text-xs font-bold text-sage-800 font-mono block mt-1">
                    PHÒNG {app.room}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                    app.status === "Pending"
                      ? "bg-blue-50 text-blue-800 border border-blue-150"
                      : app.status === "In Progress"
                        ? "bg-amber-50 text-amber-800 border border-amber-150 animate-pulse"
                        : "bg-green-50 text-green-800 border border-green-150"
                  }`}
                >
                  {app.status === "Pending"
                    ? "Chờ phục vụ"
                    : app.status === "In Progress"
                      ? "Đang trị liệu"
                      : "Đã xong"}
                </span>
              </div>

              <h4 className="font-serif text-sm font-bold text-sage-950 mt-1.5">
                {app.service}
              </h4>
              <div className="space-y-1.5 text-xs text-sage-600 font-light pt-1">
                <p className="flex items-center">
                  <Users className="h-3.5 w-3.5 mr-2 text-sage-500" />
                  Khách:{" "}
                  <strong className="text-sage-850 font-semibold">
                    {app.guest}
                  </strong>
                </p>
                <p className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-2 text-sage-500" />
                  Giờ hẹn:{" "}
                  <span className="font-mono text-sage-800">{app.time}</span>
                </p>
                <p className="flex items-center">
                  <ShieldCheck className="h-3.5 w-3.5 mr-2 text-sage-500" />
                  KTV đảm nhận:{" "}
                  <span className="text-sage-700">{app.therapist}</span>
                </p>
              </div>

              {app.note && (
                <div className="bg-amber-50/50 border-l-2 border-amber-500 text-amber-800 p-2.5 text-[10px] font-light leading-relaxed mt-2.5">
                  Yêu cầu: {app.note}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-sage-100 flex justify-between items-center mt-4">
              <span className="text-[10px] text-sage-400 font-medium">
                Tác vụ KTV
              </span>
              <div className="flex space-x-1">
                {app.status === "Pending" && (
                  <button
                    onClick={() => handleUpdateSpaStatus(app.id, "In Progress")}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center space-x-1"
                  >
                    <Play className="h-3 w-3 fill-white" />
                    <span>Bắt đầu ca</span>
                  </button>
                )}
                {app.status === "In Progress" && (
                  <button
                    onClick={() => handleUpdateSpaStatus(app.id, "Completed")}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center space-x-1"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Hoàn thành</span>
                  </button>
                )}
                {app.status === "Completed" && (
                  <span className="text-[10px] font-bold text-green-650 uppercase flex items-center space-x-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Hoàn tất</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {spaAppointments.length === 0 && (
          <p className="text-xs text-sage-400 italic text-center py-8 col-span-3">
            Không có lịch hẹn đặt trị liệu nào hôm nay.
          </p>
        )}
      </div>
    </div>
  );
}
