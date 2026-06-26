import React, { useState, useEffect } from "react";
import { specialistApi } from "../../api";
import ScheduleCalendar from "../common/ScheduleCalendar";
import { Loader2, AlertCircle } from "lucide-react";

export default function SpecialistCalendarTab({ activeRole }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSchedule = async () => {
    setLoading(true);
    setError("");
    try {
      const today = new Date();
      // Fetch +/- 3 months to populate the calendar
      const start = new Date(today.getFullYear(), today.getMonth() - 3, 1).toISOString().split("T")[0];
      const end = new Date(today.getFullYear(), today.getMonth() + 3, 0).toISOString().split("T")[0];

      const data = await specialistApi.getTherapistScheduleRange(start, end);
      
      const mapped = (data || []).map(app => ({
        id: app.spaBookingId,
        serviceName: app.serviceName,
        startDatetime: app.startDatetime,
        endDatetime: app.endDatetime,
        status: app.status,
        treatmentRoomName: app.treatmentRoomName,
        guestName: app.guestName,
        note: app.note,
        therapistName: app.therapistName,
        type: activeRole // 'spa' | 'yoga' | 'physio'
      }));

      setEvents(mapped);
    } catch (err) {
      console.error("Error fetching range schedule:", err);
      setError("Không thể tải lịch biểu làm việc.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [activeRole]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-forest-ink" />
        <span className="text-xs text-sage-500 font-semibold uppercase tracking-wider">Đang tải lịch trình...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 max-w-md mx-auto">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-sage-200/60 p-5 rounded-xl shadow-xs">
        <h3 className="font-serif text-lg font-bold text-sage-950">
          Lịch Làm Việc & Giảng Dạy Tuần/Tháng
        </h3>
        <p className="text-xs text-sage-500 mt-1 font-light">
          Theo dõi trực quan tất cả các ca đặt lịch trị liệu spa, vật lý trị liệu và lớp yoga được phân công trong tháng/tuần.
        </p>
      </div>
      <ScheduleCalendar events={events} userRole="THERAPIST" />
    </div>
  );
}
