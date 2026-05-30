import React from "react";
import { Users, Check } from "lucide-react";

export default function ManageAttendance({
  yogaClasses,
  attendance,
  setAttendance,
  selectedYogaClassId,
  setSelectedYogaClassId,
}) {
  const currentClass =
    yogaClasses.find((c) => c.id === selectedYogaClassId) || yogaClasses[0];
  const registeredGuests = currentClass ? currentClass.registeredGuests : [];
  const classAttendance = attendance[selectedYogaClassId] || {};
  const presentCount = Object.values(classAttendance).filter(Boolean).length;

  const handleToggleAttendance = (classId, guestName) => {
    setAttendance((prev) => {
      const classAttendance = prev[classId] || {};
      const currentVal = !!classAttendance[guestName];
      return {
        ...prev,
        [classId]: {
          ...classAttendance,
          [guestName]: !currentVal,
        },
      };
    });
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Selector & Header Info */}
      <div className="bg-white border border-sage-200/60 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-sage-950">
            Bảng Điểm Danh Lớp Yoga Khách Sạn
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Chọn lớp và tích chọn để điểm danh nhanh khi khách hàng tới thảm
            tập.
          </p>
        </div>
        <div className="space-y-1.5 w-full sm:w-80">
          <label className="text-[9px] font-bold text-sage-400 uppercase tracking-widest block">
            Chọn lớp học
          </label>
          <select
            value={selectedYogaClassId}
            onChange={(e) => setSelectedYogaClassId(e.target.value)}
            className="w-full p-2.5 border border-sage-250 bg-white text-xs font-bold text-sage-800 focus:outline-none focus:border-sage-800"
          >
            {yogaClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.time})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance checksheet */}
      {currentClass && (
        <div className="bg-white border border-sage-200/60 p-6 max-w-xl mx-auto">
          <div className="flex justify-between items-center border-b border-sage-100 pb-4 mb-4">
            <h4 className="font-serif font-bold text-sm text-sage-900">
              Lớp: {currentClass.name} ({currentClass.time})
            </h4>
            <span className="text-xs text-sage-500 font-bold bg-sage-50/50 border border-sage-200 px-3 py-1">
              Đã đến: {presentCount} / {currentClass.registeredCount} học viên
            </span>
          </div>

          <div className="space-y-3">
            {registeredGuests.map((guest) => {
              const isPresent = !!classAttendance[guest];
              return (
                <div
                  key={guest}
                  onClick={() => handleToggleAttendance(currentClass.id, guest)}
                  className={`p-3.5 border flex items-center justify-between cursor-pointer transition-all ${
                    isPresent
                      ? "bg-sage-50 border-sage-805"
                      : "border-sage-200 bg-sage-50/10"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-8 w-8 flex items-center justify-center font-bold text-xs ${
                        isPresent
                          ? "bg-sage-950 text-white"
                          : "bg-sage-200 text-sage-600"
                      }`}
                    >
                      {guest.split(" ").pop()?.substring(0, 1)}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-sage-900">
                      {guest}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold mr-3 uppercase tracking-wider ${
                        isPresent
                          ? "bg-green-50 text-green-700 border border-green-150"
                          : "bg-sage-100 text-sage-400"
                      }`}
                    >
                      {isPresent ? "Có mặt" : "Vắng mặt"}
                    </span>
                    <div
                      className={`h-5.5 w-5.5 border flex items-center justify-center transition-all ${
                        isPresent
                          ? "bg-sage-950 border-sage-950 text-white"
                          : "border-sage-300 bg-white"
                      }`}
                    >
                      {isPresent && <Check className="h-4 w-4 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
            {registeredGuests.length === 0 && (
              <p className="text-xs text-sage-400 italic text-center py-8">
                Lớp học này hiện chưa có học viên nào đăng ký.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
