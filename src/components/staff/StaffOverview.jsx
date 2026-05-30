import React from "react";
import {
  CalendarRange,
  UserCheck,
  Clock,
  Bed,
  AlertTriangle,
  Plus,
  Flower,
  MessageSquare,
  Check,
  UserMinus,
  Users,
} from "lucide-react";

export default function StaffOverview({
  bookings,
  rooms,
  services,
  complaints,
  shiftSwapRequests,
  setBookings,
  setRooms,
  setServices,
  setComplaints,
  setPayments,
  setShiftSwapRequests,
  clockState,
  setClockState,
  setActiveTab,
  setShowAddServiceModal,
  setShowReportRoomModal,
  setShowAddComplaintModal,
  setShowSwapRequestModal,
  handleCheckIn,
  handleCheckOut,
  handleClockIn,
  handleClockOut,
}) {
  // Stats
  const inHouseGuests = bookings.filter((b) => b.status === "Checked In");
  const checkinsToday = bookings.filter((b) => b.status === "Confirmed");
  const checkoutsToday = bookings.filter((b) => b.status === "Checked In");
  const pendingServices = services.filter((s) => s.status !== "Completed");
  const openComplaints = complaints.filter((c) => c.status === "Open");

  const handleResolveComplaint = (id, responseText) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "Resolved",
              feedback: responseText || "Đã xử lý xong",
            }
          : c,
      ),
    );
    alert('Đã cập nhật trạng thái khiếu nại thành "Đã giải quyết".');
  };

  const handleUpdateServiceStatus = (id, newStatus) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)),
    );
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Shift Roster & Clock-in Banner */}
      <div className="bg-white border border-primary-100 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h3 className="font-serif text-base font-bold text-sage-950 uppercase tracking-wider">
            Thông Tin Ca Trực Hôm Nay
          </h3>
          <p className="text-xs text-sage-500 font-light">
            Bộ phận: Lễ tân sảnh Resort Ngũ Sơn. Thời gian ca trực: Sáng (06:00
            - 14:00).
          </p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {clockState.isClockedIn && (
            <span className="text-[10px] text-green-700 font-bold bg-green-50 border border-green-150 px-3 py-2 uppercase tracking-wider flex items-center">
              <span className="h-2 w-2 bg-green-600 rounded-full mr-2 animate-ping" />
              <span>Đang trong ca trực ({clockState.clockInTime})</span>
            </span>
          )}
          {!clockState.isClockedIn ? (
            <button
              onClick={handleClockIn}
              className="px-5 py-2.5 bg-primary-800 hover:bg-primary-900 text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm"
            >
              VÀO CA (CLOCK IN)
            </button>
          ) : (
            <button
              onClick={handleClockOut}
              className="px-5 py-2.5 bg-red-50 hover:bg-red-100 border border-red-150 text-red-700 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              RA CA (CLOCK OUT)
            </button>
          )}
        </div>
      </div>

      {/* Roster Tasks: Arrivals and Departures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* checkin Roster */}
        <div className="bg-white border border-primary-100 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-primary-50 pb-3">
            <h4 className="font-serif text-sm font-bold text-sage-950 uppercase tracking-wider flex items-center">
              <UserCheck className="h-4.5 w-4.5 mr-2 text-primary-800" />
              <span>Khách Đến Nhận Phòng ({checkinsToday.length})</span>
            </h4>
            <span className="text-[9px] bg-primary-100 text-primary-900 px-2 py-0.5 font-bold uppercase tracking-wider">
              Check-in
            </span>
          </div>

          <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
            {checkinsToday.map((b) => (
              <div
                key={b.id}
                className="p-4 bg-primary-50/20 border border-primary-100/50 flex justify-between items-center text-xs"
              >
                <div>
                  <span className="font-mono text-[9px] text-sage-400 font-bold block">
                    {b.id}
                  </span>
                  <span className="font-bold text-sage-900 block mt-0.5">
                    {b.guest}
                  </span>
                  <span className="text-[10px] text-sage-500 font-mono">
                    P.{b.room} | SĐT: {b.phone}
                  </span>
                </div>
                <button
                  onClick={() => handleCheckIn(b)}
                  className="px-3.5 py-2 bg-primary-800 hover:bg-primary-900 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Xử lý Check-in
                </button>
              </div>
            ))}
            {checkinsToday.length === 0 && (
              <p className="text-xs text-sage-400 italic py-10 text-center">
                Không có khách nào đang chờ check-in.
              </p>
            )}
          </div>
        </div>

        {/* checkout Roster */}
        <div className="bg-white border border-primary-100 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-primary-50 pb-3">
            <h4 className="font-serif text-sm font-bold text-sage-950 uppercase tracking-wider flex items-center">
              <UserMinus className="h-4.5 w-4.5 mr-2 text-red-700" />
              <span>Khách Trả Phòng ({checkoutsToday.length})</span>
            </h4>
            <span className="text-[9px] bg-red-50 text-red-705 px-2 py-0.5 font-bold uppercase tracking-wider border border-red-100">
              Check-out
            </span>
          </div>

          <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
            {checkoutsToday.map((b) => (
              <div
                key={b.id}
                className="p-4 bg-red-50/10 border border-red-150/50 flex justify-between items-center text-xs"
              >
                <div>
                  <span className="font-mono text-[9px] text-sage-400 font-bold block">
                    {b.id}
                  </span>
                  <span className="font-bold text-sage-900 block mt-0.5">
                    {b.guest}
                  </span>
                  <span className="text-[10px] text-sage-500 font-mono">
                    P.{b.room} | Đang lưu trú
                  </span>
                </div>
                <button
                  onClick={() => handleCheckOut(b)}
                  className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Xử lý Check-out
                </button>
              </div>
            ))}
            {checkoutsToday.length === 0 && (
              <p className="text-xs text-sage-400 italic py-10 text-center">
                Không có ca check-out nào đang chờ xử lý.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Guest Roster and Services/Complaints Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* In-House Guests List */}
        <div className="bg-white border border-primary-100 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-primary-50 pb-3">
            <h4 className="font-serif text-sm font-bold text-sage-950 uppercase tracking-wider flex items-center">
              <Users className="h-4.5 w-4.5 mr-2 text-primary-800" />
              <span>Khách Đang Lưu Trú ({inHouseGuests.length})</span>
            </h4>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {inHouseGuests.map((guest) => (
              <div
                key={guest.id}
                className="p-3 bg-sage-50/50 border border-sage-150 text-xs flex justify-between items-center"
              >
                <div>
                  <span className="font-bold text-sage-900 block">
                    {guest.guest}
                  </span>
                  <span className="text-[10px] text-sage-500 font-mono">
                    Phòng: {guest.room} | Đến: {guest.checkIn}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-150 text-[9px] font-bold uppercase tracking-wider">
                  Lưu trú
                </span>
              </div>
            ))}
            {inHouseGuests.length === 0 && (
              <p className="text-xs text-sage-400 italic py-10 text-center">
                Hiện tại không có khách đang lưu trú tại resort.
              </p>
            )}
          </div>
        </div>

        {/* Services & Complaints Queue */}
        <div className="lg:col-span-2 bg-white border border-primary-100 p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-primary-50 pb-3">
            <h4 className="font-serif text-sm font-bold text-sage-950 uppercase tracking-wider flex items-center">
              <Flower className="h-4.5 w-4.5 mr-2 text-primary-800" />
              <span>Yêu Cầu Dịch Vụ Cần Xử Lý ({pendingServices.length})</span>
            </h4>
            <button
              onClick={() => setShowAddServiceModal(true)}
              className="text-[10px] font-bold text-primary-800 uppercase tracking-wider hover:underline"
            >
              + Tạo Service Order
            </button>
          </div>

          <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
            {pendingServices.map((s) => (
              <div
                key={s.id}
                className="p-4 bg-primary-50/20 border border-primary-100 flex justify-between items-center text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sage-900">
                      Phòng {s.room}
                    </span>
                    <span className="text-[9px] bg-primary-100 text-primary-900 px-1.5 py-0.2 border border-primary-200 uppercase font-mono">
                      {s.category}
                    </span>
                  </div>
                  <p className="text-sage-650 mt-1 font-light leading-normal">
                    {s.detail}
                  </p>
                  <span className="text-[10px] text-sage-400 font-mono">
                    Báo giờ: {s.time}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  {s.status === "Pending" ? (
                    <button
                      onClick={() =>
                        handleUpdateServiceStatus(s.id, "In Progress")
                      }
                      className="px-2.5 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Thực hiện
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleUpdateServiceStatus(s.id, "Completed")
                      }
                      className="px-2.5 py-1.5 bg-primary-850 hover:bg-primary-950 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Xong
                    </button>
                  )}
                  <span className="font-bold font-mono text-sage-900">
                    {s.price}
                  </span>
                </div>
              </div>
            ))}
            {pendingServices.length === 0 && (
              <p className="text-xs text-sage-400 italic py-10 text-center">
                Không có yêu cầu dịch vụ nào đang chờ.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Complaints log */}
      <div className="bg-white border border-primary-100 p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-primary-50 pb-3">
          <h4 className="font-serif text-sm font-bold text-sage-950 uppercase tracking-wider flex items-center">
            <MessageSquare className="h-4.5 w-4.5 mr-2 text-red-750" />
            <span>
              Phản Hồi & Sự Cố Phòng Của Khách ({openComplaints.length})
            </span>
          </h4>
          <div className="flex space-x-3 text-[10px] font-bold">
            <button
              onClick={() => setShowReportRoomModal(true)}
              className="text-red-700 hover:underline uppercase"
            >
              + Báo sự cố
            </button>
            <button
              onClick={() => setShowAddComplaintModal(true)}
              className="text-primary-800 hover:underline uppercase"
            >
              + Ghi phản hồi
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {openComplaints.slice(0, 4).map((c) => (
            <div
              key={c.id}
              className="p-4 bg-red-50/15 border border-red-150 text-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start pb-2 border-b border-red-100/30">
                  <span className="font-bold text-sage-900">
                    Phòng: {c.room} ({c.guest})
                  </span>
                  <span className="text-[10px] text-sage-400 font-mono">
                    {c.time}
                  </span>
                </div>
                <p className="text-sage-650 mt-2.5 italic font-light leading-relaxed">
                  "{c.content}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-red-100/30 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Ghi chú cách giải quyết..."
                  id={`staff-comp-reply-${c.id}`}
                  className="flex-grow px-3 py-1.5 text-xs border border-primary-150 rounded-none bg-white focus:outline-none"
                />
                <button
                  onClick={() => {
                    const val = document.getElementById(
                      `staff-comp-reply-${c.id}`,
                    ).value;
                    handleResolveComplaint(c.id, val);
                  }}
                  className="px-3.5 py-1.5 bg-primary-800 hover:bg-primary-900 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Giải Quyết
                </button>
              </div>
            </div>
          ))}
          {openComplaints.length === 0 && (
            <p className="text-xs text-sage-400 italic py-10 col-span-2 text-center">
              Không có khiếu nại hay sự cố phòng nào chưa giải quyết.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
