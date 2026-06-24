import React, { useState, useEffect } from "react";
import { userApi } from "../../api";
import axiosClient from "../../api/axiosClient";
import ScheduleCalendar from "../common/ScheduleCalendar";
import { Loader2, AlertCircle } from "lucide-react";

export default function GuestCalendarView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError("");
      try {
        const email = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
        const [rooms, spas, profileRes] = await Promise.all([
          userApi.getMyBookings().catch(() => []),
          userApi.getMySpaBookings().catch(() => []),
          email ? axiosClient.get(`/guest/profile?email=${email}`).catch(() => null) : null
        ]);

        const mappedEvents = [];

        // 1. Map Room Bookings
        (rooms || []).forEach(r => {
          // Check-in event
          mappedEvents.push({
            id: `checkin-${r.bookingId}`,
            serviceName: `Nhận phòng (Check-In) - Booking #${r.bookingId}`,
            startDatetime: r.checkInDate,
            endDatetime: r.checkInDate,
            status: r.status === "CHECKED_IN" || r.status === "CHECKED_OUT" ? "COMPLETED" : "CONFIRMED",
            type: "room",
            treatmentRoomName: r.rooms && r.rooms.length > 0 ? r.rooms.map(room => room.roomNumber).join(", ") : "N/A",
            therapistName: "Lễ tân resort"
          });
          // Check-out event
          mappedEvents.push({
            id: `checkout-${r.bookingId}`,
            serviceName: `Trả phòng (Check-Out) - Booking #${r.bookingId}`,
            startDatetime: r.checkOutDate,
            endDatetime: r.checkOutDate,
            status: r.status === "CHECKED_OUT" ? "COMPLETED" : "CONFIRMED",
            type: "room",
            treatmentRoomName: r.rooms && r.rooms.length > 0 ? r.rooms.map(room => room.roomNumber).join(", ") : "N/A",
            therapistName: "Lễ tân resort"
          });
        });

        // 2. Map Spa / Yoga Bookings
        (spas || []).forEach(s => {
          const cat = s.serviceCategory ? s.serviceCategory.toUpperCase() : "";
          const isYoga = cat.includes("YOGA");
          
          mappedEvents.push({
            id: `spa-${s.spaBookingId}`,
            serviceName: s.serviceName || "Dịch vụ trị liệu",
            startDatetime: s.startDatetime,
            endDatetime: s.endDatetime,
            status: s.status || "CONFIRMED",
            type: isYoga ? "yoga" : "spa",
            treatmentRoomName: s.treatmentRoomName || "Khu Spa / Yoga bờ biển",
            therapistName: s.therapistName || "Chuyên viên trị liệu"
          });
        });

        // 3. Map Food Orders
        if (profileRes && profileRes.data && profileRes.data.booking && profileRes.data.booking.orders) {
          const rawOrders = profileRes.data.booking.orders;
          rawOrders.forEach(o => {
            const dishNames = o.details.map(d => `${d.quantity}x ${d.dishName || "Món ăn"}`).join(", ");
            let foodStatus = "CONFIRMED";
            if (o.status === "DELIVERED" || o.status === "READY") {
              foodStatus = "COMPLETED";
            } else if (o.status === "CANCELLED") {
              foodStatus = "CANCELLED";
            } else if (o.status === "PREPARING") {
              foodStatus = "IN_PROGRESS";
            }

            mappedEvents.push({
              id: `food-${o.orderId}`,
              serviceName: `Giao món: ${dishNames || "Đơn hàng ẩm thực"}`,
              startDatetime: o.orderTime,
              endDatetime: o.orderTime,
              status: foodStatus,
              type: "food",
              treatmentRoomName: "Phòng của khách",
              therapistName: "Nhân viên F&B resort"
            });
          });
        }

        setEvents(mappedEvents);
      } catch (err) {
        console.error("Lỗi khi tải lịch trình sự kiện:", err);
        setError("Không thể tải lịch trình hoạt động cá nhân.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary-900" />
        <span className="text-xs text-sage-500 font-semibold uppercase tracking-wider">Đang tải lịch trình...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 max-w-md mx-auto text-left">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-lg font-bold text-sage-950 text-left">
          Lịch Hoạt Động & Lịch Trình Cá Nhân
        </h3>
        <p className="text-xs text-sage-500 mt-1 font-light text-left">
          Xem lịch đặt phòng, thời gian trị liệu spa, giờ học yoga và giao món ăn dưỡng sinh tại phòng.
        </p>
      </div>
      <ScheduleCalendar events={events} userRole="CUSTOMER" />
    </div>
  );
}
