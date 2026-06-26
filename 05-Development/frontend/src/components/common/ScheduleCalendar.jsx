import React, { useState, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  CheckCircle, 
  XCircle,
  HelpCircle,
  FileText,
  CalendarDays,
  X
} from "lucide-react";
import { fmtDateTime } from "../../utils/formatters";

// Helper for Vietnamese translations of statuses
const STATUS_MAP = {
  PENDING: { label: "Đang chờ", bg: "bg-blue-50/80 text-blue-700 border-blue-200" },
  CONFIRMED: { label: "Đã xác nhận", bg: "bg-indigo-50/80 text-indigo-700 border-indigo-200" },
  IN_PROGRESS: { label: "Đang phục vụ", bg: "bg-amber-50/80 text-amber-700 border-amber-250 animate-pulse" },
  COMPLETED: { label: "Hoàn thành", bg: "bg-emerald-50/80 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Đã hủy", bg: "bg-rose-50/80 text-rose-700 border-rose-200" },
  NO_SHOW: { label: "Khách vắng mặt", bg: "bg-gray-50/80 text-gray-600 border-gray-200" }
};

export default function ScheduleCalendar({ events = [], userRole = "CUSTOMER", onStatusChange = null }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState("month"); // "month" | "week" | "agenda"
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState("all"); // "all" | "room" | "spa" | "yoga" | "food"

  // 1. Get dates helper
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Filter events based on filterType
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (filterType === "all") return true;
      return e.type === filterType;
    });
  }, [events, filterType]);

  // Navigate dates
  const handlePrev = () => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      if (activeView === "month") next.setMonth(next.getMonth() - 1);
      else if (activeView === "week") next.setDate(next.getDate() - 7);
      else next.setDate(next.getDate() - 1);
      return next;
    });
  };

  const handleNext = () => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      if (activeView === "month") next.setMonth(next.getMonth() + 1);
      else if (activeView === "week") next.setDate(next.getDate() + 7);
      else next.setDate(next.getDate() + 1);
      return next;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Monthly logic
  const monthDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // index of first day of month (0 = Sun, 1 = Mon...)
    const totalDays = new Date(year, month + 1, 0).getDate(); // days in current month
    const prevMonthTotalDays = new Date(year, month, 0).getDate(); // days in prev month

    const days = [];

    // Prev month padding
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // alignment for Mon-start calendar
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthTotalDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding
    const totalCells = 42; // standard 6 rows
    const endOffset = totalCells - days.length;
    for (let i = 1; i <= endOffset; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  // Weekly logic
  const weekDates = useMemo(() => {
    const dates = [];
    const dayOfWeek = currentDate.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() + distanceToMonday);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [currentDate]);

  // Group events by day string (YYYY-MM-DD)
  const eventsByDay = useMemo(() => {
    const map = {};
    filteredEvents.forEach(e => {
      if (!e.startDatetime) return;
      const dateStr = new Date(e.startDatetime).toISOString().split("T")[0];
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(e);
    });
    return map;
  }, [filteredEvents]);

  // Format month text
  const viewHeader = useMemo(() => {
    const months = [
      "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
      "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];
    if (activeView === "month") {
      return `${months[month]} năm ${year}`;
    } else if (activeView === "week") {
      const start = weekDates[0];
      const end = weekDates[6];
      return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
    }
    return `Ngày ${currentDate.getDate()} tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}`;
  }, [activeView, month, year, weekDates, currentDate]);

  const viewDetails = (event) => {
    setSelectedEvent(event);
  };

  const getEventBgColor = (type, status) => {
    const base = STATUS_MAP[status?.toUpperCase()] || STATUS_MAP.CONFIRMED;
    return base.bg;
  };

  return (
    <div className="bg-white border border-sage-200/80 rounded-xl shadow-xs overflow-hidden text-left font-sans select-none">
      {/* Calendar Header Controls */}
      <div className="p-4 sm:p-5 border-b border-sage-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Navigation & Title */}
        <div className="flex items-center gap-3">
          <div className="flex bg-sage-50 border border-sage-200 rounded p-0.5">
            <button 
              onClick={handlePrev} 
              className="p-1 hover:bg-white rounded transition cursor-pointer text-sage-600 hover:text-sage-900 border-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={handleToday}
              className="px-2 py-0.5 text-xs font-semibold hover:bg-white rounded transition cursor-pointer text-sage-600 hover:text-sage-900 border-none"
            >
              Hôm nay
            </button>
            <button 
              onClick={handleNext} 
              className="p-1 hover:bg-white rounded transition cursor-pointer text-sage-600 hover:text-sage-900 border-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-sage-900 leading-none">
            {viewHeader}
          </h3>
        </div>

        {/* Filters and View Switcher */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category filter (only show for customers who have multiple event types) */}
          {userRole === "CUSTOMER" && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 border border-sage-200 bg-white text-xs font-semibold text-sage-700 rounded outline-none focus:border-primary-800"
            >
              <option value="all">Tất cả dịch vụ</option>
              <option value="room">Lưu trú (Đặt phòng)</option>
              <option value="spa">Trị liệu Spa</option>
              <option value="yoga">Lớp học Yoga/Thiền</option>
              <option value="food">Giao món ăn F&B</option>
            </select>
          )}

          {/* View Toggles */}
          <div className="flex bg-sage-50 border border-sage-200 rounded p-0.5 ml-auto md:ml-0">
            <button
              onClick={() => setActiveView("month")}
              className={`px-3 py-1 text-xs font-semibold rounded transition cursor-pointer border-none ${
                activeView === "month" 
                  ? "bg-primary-900 text-white shadow-xs" 
                  : "text-sage-600 hover:text-sage-900"
              }`}
            >
              Tháng
            </button>
            <button
              onClick={() => setActiveView("week")}
              className={`px-3 py-1 text-xs font-semibold rounded transition cursor-pointer border-none ${
                activeView === "week" 
                  ? "bg-primary-900 text-white shadow-xs" 
                  : "text-sage-600 hover:text-sage-900"
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => setActiveView("agenda")}
              className={`px-3 py-1 text-xs font-semibold rounded transition cursor-pointer border-none ${
                activeView === "agenda" 
                  ? "bg-primary-900 text-white shadow-xs" 
                  : "text-sage-600 hover:text-sage-900"
              }`}
            >
              Lịch trình
            </button>
          </div>
        </div>
      </div>

      {/* 2. Monthly View Grid */}
      {activeView === "month" && (
        <div>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-sage-100 bg-sage-50/50 text-center font-bold text-[10px] text-sage-500 uppercase tracking-wider py-2">
            <div>Thứ 2</div>
            <div>Thứ 3</div>
            <div>Thứ 4</div>
            <div>Thứ 5</div>
            <div>Thứ 6</div>
            <div>Thứ 7</div>
            <div>Chủ nhật</div>
          </div>
          {/* Days Grid */}
          <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-sage-100 min-h-[360px] md:min-h-[480px]">
            {monthDays.map((cell, idx) => {
              const dateStr = cell.date.toISOString().split("T")[0];
              const dayEvents = eventsByDay[dateStr] || [];
              const isToday = new Date().toDateString() === cell.date.toDateString();

              return (
                <div 
                  key={idx}
                  className={`p-1.5 sm:p-2.5 flex flex-col justify-between group transition hover:bg-sage-50/20 relative min-h-[60px] ${
                    cell.isCurrentMonth ? "bg-white text-sage-900" : "bg-gray-50/50 text-sage-400"
                  }`}
                >
                  {/* Day header number */}
                  <div className="flex justify-between items-center mb-1">
                    <span 
                      className={`text-xs font-semibold flex items-center justify-center h-5.5 w-5.5 rounded-full ${
                        isToday 
                          ? "bg-primary-900 text-white font-extrabold shadow-inner" 
                          : ""
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>
                  </div>
                  {/* Event slots (shows up to 3 inside cell, then a +count indicator) */}
                  <div className="space-y-1 overflow-hidden mt-1 flex-1">
                    {dayEvents.slice(0, 3).map((e, eIdx) => (
                      <button
                        key={eIdx}
                        onClick={(evt) => {
                          evt.stopPropagation();
                          viewDetails(e);
                        }}
                        className={`w-full text-left truncate text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border border-solid transition-transform hover:scale-[1.02] cursor-pointer ${getEventBgColor(e.type, e.status)}`}
                      >
                        {e.serviceName || "Đặt chỗ"}
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[8px] font-bold text-sage-500 pl-1.5 uppercase">
                        + {dayEvents.length - 3} lịch nữa
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Weekly View Hourly Grid */}
      {activeView === "week" && (
        <div className="overflow-x-auto">
          <div className="min-w-[650px] divide-y divide-sage-100">
            {/* Headers of days */}
            <div className="grid grid-cols-8 border-b border-sage-100 bg-sage-50/60 text-center py-3 font-semibold text-xs">
              <div className="text-sage-400 font-bold uppercase text-[9px] self-center">Múi giờ</div>
              {weekDates.map((d, idx) => {
                const daysOfWeek = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
                const isToday = new Date().toDateString() === d.toDateString();
                return (
                  <div key={idx} className={`flex flex-col items-center py-1 ${isToday ? "bg-primary-50/50 rounded-md" : ""}`}>
                    <span className="text-[10px] text-sage-500 font-bold uppercase">{daysOfWeek[d.getDay()]}</span>
                    <span className={`text-base font-extrabold h-7 w-7 flex items-center justify-center rounded-full mt-0.5 ${isToday ? "bg-primary-900 text-white" : "text-sage-800"}`}>
                      {d.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Hours list rows */}
            {/* Working hours from 7:00 to 21:00 (9:00 PM) */}
            {Array.from({ length: 15 }, (_, i) => {
              const hour = i + 7;
              const formatHour = `${String(hour).padStart(2, "0")}:00`;
              return (
                <div key={i} className="grid grid-cols-8 divide-x divide-sage-100/50 min-h-[50px] hover:bg-sage-50/10">
                  <div className="text-[10px] font-mono text-sage-400 text-right pr-3 font-bold py-1.5">{formatHour}</div>
                  {weekDates.map((dayDate, dayIdx) => {
                    const dayDateStr = dayDate.toISOString().split("T")[0];
                    const dayEvents = eventsByDay[dayDateStr] || [];
                    
                    // Filter events starting in this specific hour slot
                    const hourEvents = dayEvents.filter(e => {
                      if (!e.startDatetime) return false;
                      const d = new Date(e.startDatetime);
                      return d.getHours() === hour;
                    });

                    return (
                      <div key={dayIdx} className="p-1 space-y-1 relative min-h-[50px]">
                        {hourEvents.map((e, eIdx) => (
                          <div
                            key={eIdx}
                            onClick={() => viewDetails(e)}
                            className={`p-1.5 rounded border border-solid text-[9px] sm:text-[10px] font-bold text-left cursor-pointer hover:shadow-xs transition duration-150 ${getEventBgColor(e.type, e.status)}`}
                          >
                            <div className="truncate">{e.serviceName || "Hẹn lịch"}</div>
                            <div className="text-[8px] opacity-80 font-mono mt-0.5 flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {new Date(e.startDatetime).toLocaleTimeString("vi-VN", {hour: "2-digit", minute: "2-digit"})}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Agenda / Timeline View */}
      {activeView === "agenda" && (
        <div className="p-4 sm:p-6 space-y-6 max-h-[500px] overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-sage-400 text-xs italic">
              Không có lịch trình hay hoạt động nào.
            </div>
          ) : (
            <div className="relative border-l border-sage-200 pl-5 space-y-6 ml-2 text-xs">
              {filteredEvents
                .sort((a, b) => new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime())
                .map((e, idx) => {
                  const evDate = new Date(e.startDatetime);
                  const status = STATUS_MAP[e.status?.toUpperCase()] || STATUS_MAP.CONFIRMED;

                  return (
                    <div key={idx} className="relative group hover:bg-sage-50/10 p-3 rounded-lg border border-transparent hover:border-sage-200 transition">
                      {/* Timeline node */}
                      <span className="absolute -left-[27px] top-4.5 bg-white border-2 border-primary-900 rounded-full h-3 w-3 z-10 flex items-center justify-center" />
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2.5">
                        <div className="space-y-1">
                          <span className="text-[10px] text-sage-400 font-mono font-bold block">
                            {evDate.toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                          <h4 
                            onClick={() => viewDetails(e)}
                            className="font-serif text-sm font-bold text-sage-900 hover:text-primary-900 cursor-pointer transition-colors"
                          >
                            {e.serviceName}
                          </h4>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1.5 text-sage-600 text-[11px] font-light">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-sage-400" />
                              {new Date(e.startDatetime).toLocaleTimeString("vi-VN", {hour: "2-digit", minute: "2-digit"})}
                              {e.endDatetime && ` - ${new Date(e.endDatetime).toLocaleTimeString("vi-VN", {hour: "2-digit", minute: "2-digit"})}`}
                            </span>
                            {e.treatmentRoomName && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-sage-400" />
                                Phòng: {e.treatmentRoomName}
                              </span>
                            )}
                            {e.therapistName && (
                              <span className="flex items-center gap-1">
                                <UserIcon className="h-3.5 w-3.5 text-sage-400" />
                                Hướng dẫn/KTV: {e.therapistName}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-sm border ${status.bg} self-start`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* 5. Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-sage-100 text-xs text-left animate-fade-in">
            {/* Modal Header */}
            <div className="bg-primary-900 text-white p-4.5 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono font-bold text-primary-250 uppercase tracking-widest block">Chi tiết lịch hoạt động</span>
                <h4 className="font-serif text-sm font-bold mt-0.5 truncate">{selectedEvent.serviceName}</h4>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded transition cursor-pointer border-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-sage-800 font-light">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-sage-400 font-bold uppercase tracking-wider block">Thời gian</span>
                  <div className="flex items-center gap-1.5 text-sage-900 font-semibold">
                    <Clock className="h-4 w-4 text-primary-700" />
                    <span>
                      {new Date(selectedEvent.startDatetime).toLocaleTimeString("vi-VN", {hour: "2-digit", minute: "2-digit"})}
                      {selectedEvent.endDatetime && ` - ${new Date(selectedEvent.endDatetime).toLocaleTimeString("vi-VN", {hour: "2-digit", minute: "2-digit"})}`}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-sage-400 font-bold uppercase tracking-wider block">Ngày</span>
                  <div className="flex items-center gap-1.5 text-sage-900 font-semibold">
                    <CalendarDays className="h-4 w-4 text-primary-700" />
                    <span>{new Date(selectedEvent.startDatetime).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-sage-400 font-bold uppercase tracking-wider block">Địa điểm / Phòng</span>
                <div className="flex items-center gap-1.5 text-sage-900 font-semibold">
                  <MapPin className="h-4 w-4 text-primary-700" />
                  <span>{selectedEvent.treatmentRoomName || "Khu vực Spa / Yoga bờ biển"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-sage-400 font-bold uppercase tracking-wider block">
                  {userRole === "CUSTOMER" ? "Chuyên viên / HLV phụ trách" : "Tên khách hàng"}
                </span>
                <div className="flex items-center gap-1.5 text-sage-900 font-semibold">
                  <UserIcon className="h-4 w-4 text-primary-700" />
                  <span>{userRole === "CUSTOMER" ? selectedEvent.therapistName : selectedEvent.guestName}</span>
                </div>
              </div>

              {selectedEvent.note && (
                <div className="bg-amber-50/60 border-l-2 border-amber-500 p-3 rounded text-amber-900 leading-relaxed font-normal">
                  <span className="font-bold flex items-center gap-1 mb-1">
                    <FileText className="h-3.5 w-3.5" /> Ghi chú trị liệu (GDPR):
                  </span>
                  {selectedEvent.note}
                </div>
              )}

              {/* Status Badge in detail card */}
              <div className="flex justify-between items-center pt-3 border-t border-sage-100">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-sage-400 font-bold uppercase tracking-wider block">Trạng thái</span>
                  <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-sm border ${STATUS_MAP[selectedEvent.status?.toUpperCase()]?.bg || STATUS_MAP.CONFIRMED.bg}`}>
                    {STATUS_MAP[selectedEvent.status?.toUpperCase()]?.label || "Đã xác nhận"}
                  </span>
                </div>

                {/* Simulated Google Calendar sync icon indicator */}
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-150 px-2 py-1 rounded text-[10px] font-bold">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Google Calendar Synced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
