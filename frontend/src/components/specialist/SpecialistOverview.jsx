import React from "react";
import {
  Calendar,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Users,
  Play,
  Check,
  CheckCircle2,
} from "lucide-react";

export default function SpecialistOverview({
  activeRole,
  setActiveTab,
  setSelectedYogaClassId,
  spaAppointments,
  spaRooms,
  setSpaRooms,
  spaInventory,
  yogaClasses,
  physioAppointments,
  setPhysioAppointments,
}) {
  // Handlers
  const handleToggleRoomStatus = (roomName) => {
    setSpaRooms((prev) =>
      prev.map((room) => {
        if (room.name === roomName) {
          let nextStatus = "Vacant";
          if (room.status === "Vacant") nextStatus = "Occupied";
          else if (room.status === "Occupied") nextStatus = "Cleaning";

          return {
            ...room,
            status: nextStatus,
            currentGuest: nextStatus === "Occupied" ? "Khách đặt chỗ" : "",
          };
        }
        return room;
      }),
    );
  };

  const handleUpdatePhysioStatus = (id, newStatus) => {
    setPhysioAppointments((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          alert(`Đã cập nhật trạng thái ca trị liệu máy sang: ${newStatus}`);
          return { ...app, status: newStatus };
        }
        return app;
      }),
    );
  };

  // --- SPA OVERVIEW ---
  if (activeRole === "spa") {
    const activeAppts = spaAppointments.filter(
      (a) => a.status === "In Progress",
    );
    const incomingAppts = spaAppointments.filter((a) => a.status === "Pending");
    const vacantRoomsCount = spaRooms.filter(
      (r) => r.status === "Vacant",
    ).length;

    return (
      <div className="space-y-8 animate-fade-in text-left">
        {/* KPI Summary Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 border border-sage-200/60 flex flex-col justify-between">
            <span className="text-[10px] text-sage-400 font-bold uppercase tracking-wider">
              Hẹn hôm nay
            </span>
            <span className="text-xl font-serif font-bold text-sage-950 mt-2">
              {spaAppointments.length} lịch đặt
            </span>
          </div>

          <div className="bg-white p-6 border border-sage-200/60 flex flex-col justify-between">
            <span className="text-[10px] text-sage-400 font-bold uppercase tracking-wider">
              Ca đang diễn ra
            </span>
            <span className="text-xl font-serif font-bold text-amber-700 mt-2">
              {activeAppts.length} trị liệu
            </span>
          </div>

          <div className="bg-white p-6 border border-sage-200/60 flex flex-col justify-between">
            <span className="text-[10px] text-sage-400 font-bold uppercase tracking-wider">
              Khách sắp đến
            </span>
            <span className="text-xl font-serif font-bold text-blue-700 mt-2">
              {incomingAppts.length} ca chờ
            </span>
          </div>

          <div className="bg-white p-6 border border-sage-200/60 flex flex-col justify-between">
            <span className="text-[10px] text-sage-400 font-bold uppercase tracking-wider">
              Lịch phòng trống
            </span>
            <span className="text-xl font-serif font-bold text-green-700 mt-2">
              {vacantRoomsCount} phòng
            </span>
          </div>
        </div>

        {/* Live Active Treatments & Incoming queue */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Incoming & Active Appointments */}
          <div className="lg:col-span-2 bg-white border border-sage-200/60 p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-sage-950 uppercase tracking-wide border-b border-sage-100 pb-3">
              Danh sách ca chờ & đang phục vụ
            </h3>
            <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
              {spaAppointments
                .filter((a) => a.status !== "Completed")
                .map((app) => (
                  <div
                    key={app.id}
                    className={`p-4 border flex items-center justify-between text-xs ${app.status === "In Progress" ? "border-amber-350 bg-amber-50/10" : "border-sage-200"}`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sage-900">
                          {app.guest} (P.{app.room})
                        </span>
                        <span className="text-[9px] bg-sage-100 text-sage-800 px-1.5 py-0.2 uppercase font-mono">
                          {app.time}
                        </span>
                      </div>
                      <p className="text-sage-600 mt-1 font-semibold">
                        {app.service}
                      </p>
                      <p className="text-[10px] text-sage-450">
                        KTV: {app.therapist}{" "}
                        {app.note && `| Ghi chú: ${app.note}`}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${app.status === "In Progress" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}
                    >
                      {app.status === "In Progress" ? "Đang làm" : "Đang chờ"}
                    </span>
                  </div>
                ))}
              {spaAppointments.filter((a) => a.status !== "Completed")
                .length === 0 && (
                <p className="text-xs text-sage-400 italic py-10 text-center">
                  Không có lịch hẹn dở dang nào.
                </p>
              )}
            </div>
          </div>

          {/* Room slots map */}
          <div className="bg-white border border-sage-200/60 p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-sage-950 uppercase tracking-wide border-b border-sage-100 pb-3">
              Lịch trống & Dọn dẹp
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {spaRooms.map((room) => (
                <div
                  key={room.name}
                  className="p-3 border border-sage-200 flex justify-between items-center text-xs"
                >
                  <div>
                    <span className="font-bold text-sage-900 block">
                      {room.name}
                    </span>
                    <span className="text-[9px] text-sage-400 block font-mono">
                      {room.type}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                      room.status === "Vacant"
                        ? "bg-green-50 text-green-700 border border-green-150"
                        : room.status === "Cleaning"
                          ? "bg-amber-50 text-amber-800 border border-amber-150"
                          : "bg-sage-100 text-sage-700 border border-sage-150"
                    }`}
                  >
                    {room.status === "Vacant"
                      ? "Trống"
                      : room.status === "Cleaning"
                        ? "Dọn"
                        : "Đầy"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- YOGA OVERVIEW ---
  if (activeRole === "yoga") {
    return (
      <div className="space-y-6 animate-fade-in text-left">
        <div className="bg-white border border-sage-200/60 p-6">
          <h3 className="font-serif text-base font-bold text-sage-950 uppercase tracking-wide">
            Lịch Lớp Yoga & Điểm Danh Ngày
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Quản lý lịch dạy lớp học yoga phục hồi và điểm danh học viên đăng ký
            thảm tập.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {yogaClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-white border border-sage-200 p-6 flex flex-col justify-between min-h-[180px]"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold font-mono text-primary-700 bg-primary-50 px-2 py-0.5 border border-primary-200">
                    {cls.id}
                  </span>
                  <span className="text-xs text-sage-500 font-mono font-bold">
                    {cls.time}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sage-950 text-base">
                  {cls.name}
                </h4>
                <p className="text-xs text-sage-600 font-light">
                  HLV: {cls.instructor} | Vị trí: {cls.location}
                </p>
                <p className="text-xs font-bold text-sage-800 bg-sage-50 p-2 border border-sage-150">
                  Đăng ký: {cls.registeredCount} học viên
                </p>
              </div>
              <div className="pt-4 border-t border-sage-100 flex justify-end mt-4">
                <button
                  onClick={() => {
                    setSelectedYogaClassId(cls.id);
                    setActiveTab("attendance");
                  }}
                  className="px-3 py-1.5 bg-sage-950 hover:bg-sage-800 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Điểm danh nhanh
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- PHYSIO OVERVIEW ---
  if (activeRole === "physio") {
    return (
      <div className="space-y-6 animate-fade-in text-left">
        <div className="bg-white border border-sage-200/60 p-6">
          <h3 className="font-serif text-base font-bold text-sage-950 uppercase tracking-wide">
            Ca Trị Liệu Cơ Xương Khớp Hôm Nay
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Giám sát quy trình khởi động thiết bị máy kéo giãn cột sống hoặc
            chiếu laser trị liệu khớp gối.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {physioAppointments.map((app) => (
            <div
              key={app.id}
              className={`bg-white border p-5 flex flex-col justify-between min-h-[220px] h-auto transition-all ${
                app.status === "In Progress"
                  ? "border-amber-350 ring-2 ring-amber-50"
                  : app.status === "Completed"
                    ? "border-green-200 opacity-80"
                    : "border-sage-200/60"
              }`}
            >
              <div className="space-y-2.5">
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
                          ? "bg-amber-100 text-amber-800 border border-amber-150 animate-pulse"
                          : "bg-green-100 text-green-800 border border-green-150"
                    }`}
                  >
                    {app.status === "Pending"
                      ? "Chờ máy"
                      : app.status === "In Progress"
                        ? "Đang chạy"
                        : "Đã xong"}
                  </span>
                </div>

                <h4 className="font-serif font-bold text-sage-900 text-sm">
                  {app.service}
                </h4>
                <div className="bg-red-50 text-red-800 p-2 border border-red-150 text-[10px] font-bold">
                  Triệu chứng: {app.diagnosis}
                </div>

                <div className="space-y-1 text-xs text-sage-600 font-light pt-1.5">
                  <p>
                    Bệnh nhân:{" "}
                    <strong className="text-sage-850 font-semibold">
                      {app.guest}
                    </strong>
                  </p>
                  <p>
                    Hẹn lúc:{" "}
                    <span className="font-mono text-sage-800">{app.time}</span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-sage-100 flex justify-between items-center mt-3">
                <span className="text-[10px] text-sage-400">Điều hành</span>
                <div className="flex space-x-1">
                  {app.status === "Pending" && (
                    <button
                      onClick={() =>
                        handleUpdatePhysioStatus(app.id, "In Progress")
                      }
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Bật máy
                    </button>
                  )}
                  {app.status === "In Progress" && (
                    <button
                      onClick={() =>
                        handleUpdatePhysioStatus(app.id, "Completed")
                      }
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Tắt máy
                    </button>
                  )}
                  {app.status === "Completed" && (
                    <span className="text-[10px] font-bold text-green-600 uppercase flex items-center space-x-1 font-mono">
                      <Check className="h-3.5 w-3.5" />
                      <span>Xong ca</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
