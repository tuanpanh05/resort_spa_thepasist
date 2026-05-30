import React, { useState } from "react";
import { Search, Edit, X } from "lucide-react";

export default function ManageBookings({
  bookings,
  rooms,
  payments,
  setBookings,
  setRooms,
  setPayments,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedBookingForNotes, setSelectedBookingForNotes] = useState(null);
  const [notesFormValue, setNotesFormValue] = useState("");

  const [showAssignRoomModal, setShowAssignRoomModal] = useState(false);
  const [bookingToAssign, setBookingToAssign] = useState(null);

  const handleCheckIn = (booking) => {
    if (booking.room === "Chưa gán") {
      setBookingToAssign(booking);
      setShowAssignRoomModal(true);
      return;
    }
    setBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id ? { ...b, status: "Checked In" } : b,
      ),
    );
    setRooms((prev) =>
      prev.map((r) =>
        r.id === booking.room
          ? { ...r, status: "occupied", guestName: booking.guest }
          : r,
      ),
    );
    alert(`Đã check-in cho ${booking.guest} vào phòng ${booking.room}.`);
  };

  const handleCheckOut = (booking) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id ? { ...b, status: "Checked Out" } : b,
      ),
    );
    setRooms((prev) =>
      prev.map((r) =>
        r.id === booking.room ? { ...r, status: "cleaning", guestName: "" } : r,
      ),
    );

    const invoiceExists = payments.find((p) => p.bookingId === booking.id);
    if (invoiceExists) {
      setPayments((prev) =>
        prev.map((p) =>
          p.bookingId === booking.id ? { ...p, status: "Paid" } : p,
        ),
      );
    }
    alert(`Đã check-out phòng ${booking.room}. Phòng đang được dọn dẹp.`);
  };

  const openEditNotes = (booking) => {
    setSelectedBookingForNotes(booking);
    setNotesFormValue(booking.specialNotes || "");
  };

  const handleSaveSpecialNotes = (e) => {
    e.preventDefault();
    setBookings((prev) =>
      prev.map((b) =>
        b.id === selectedBookingForNotes.id
          ? { ...b, specialNotes: notesFormValue }
          : b,
      ),
    );
    setSelectedBookingForNotes(null);
    alert("Đã cập nhật yêu cầu đặc biệt.");
  };

  const handleAssignRoomSubmit = (roomId) => {
    if (!bookingToAssign) return;
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingToAssign.id ? { ...b, room: roomId } : b,
      ),
    );
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId ? { ...r, guestName: bookingToAssign.guest } : r,
      ),
    );
    setShowAssignRoomModal(false);
    setBookingToAssign(null);
    alert(`Đã gán phòng ${roomId} cho khách.`);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="bg-white border border-primary-100 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-normal text-sage-950">
            Quản Lý Đơn Đặt Phòng
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Tìm kiếm thông tin khách hàng nghỉ dưỡng, thực hiện check-in nhanh,
            gán số phòng trực tiếp.
          </p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white border border-primary-100 p-5 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-sage-400" />
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng, mã đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-primary-100 text-xs focus:outline-primary-200"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
          >
            <option value="All">Tất cả đơn</option>
            <option value="Confirmed">Chờ Check-in</option>
            <option value="Checked In">Đang lưu trú</option>
            <option value="Checked Out">Đã check-out</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-primary-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-primary-50/50 text-sage-600 font-bold border-b border-primary-100">
                <th className="p-4">Mã đơn</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Ngày lưu trú</th>
                <th className="p-4">Hạng phòng</th>
                <th className="p-4">Số phòng</th>
                <th className="p-4">Ghi chú đặc biệt</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-center">Tác vụ ca lễ tân</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50/50">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-primary-50/10">
                  <td className="p-4 font-bold text-primary-950">{b.id}</td>
                  <td className="p-4 font-semibold text-sage-950">
                    <div>{b.guest}</div>
                    <div className="text-[10px] text-sage-400 font-mono mt-0.5">
                      {b.phone}
                    </div>
                  </td>
                  <td className="p-4 text-sage-700">
                    <div>
                      {b.checkIn} &rarr; {b.checkOut}
                    </div>
                  </td>
                  <td className="p-4 text-sage-650">{b.roomType}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-none text-[10px] font-bold ${
                        b.room === "Chưa gán"
                          ? "bg-yellow-50 text-yellow-800"
                          : "bg-primary-100 text-primary-900"
                      }`}
                    >
                      {b.room === "Chưa gán"
                        ? "Chưa gán phòng"
                        : `Phòng ${b.room}`}
                    </span>
                  </td>
                  <td className="p-4 max-w-xs truncate text-sage-600 font-light italic">
                    {b.specialNotes || "Không có yêu cầu"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider ${
                        b.status === "Checked In"
                          ? "bg-green-100 text-green-700"
                          : b.status === "Confirmed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      {b.status === "Confirmed" && (
                        <>
                          <button
                            onClick={() => {
                              setBookingToAssign(b);
                              setShowAssignRoomModal(true);
                            }}
                            className="px-2.5 py-1.5 bg-primary-100 hover:bg-primary-200 text-primary-900 rounded-none text-[10px] font-semibold uppercase tracking-wider"
                          >
                            Gán phòng
                          </button>
                          <button
                            onClick={() => handleCheckIn(b)}
                            className="px-2.5 py-1.5 bg-primary-800 hover:bg-primary-900 text-white rounded-none text-[10px] font-semibold uppercase tracking-wider"
                          >
                            Check-in
                          </button>
                        </>
                      )}
                      {b.status === "Checked In" && (
                        <button
                          onClick={() => handleCheckOut(b)}
                          className="px-2.5 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-none text-[10px] font-semibold uppercase tracking-wider"
                        >
                          Check-out
                        </button>
                      )}
                      <button
                        onClick={() => openEditNotes(b)}
                        className="p-1.5 bg-primary-50 hover:bg-primary-100 text-primary-950 rounded-none"
                        title="Ghi chú dịch vụ đặc biệt"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Room Modal */}
      {showAssignRoomModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-primary-50 pb-3">
              <h3 className="font-serif text-lg font-normal text-sage-950">
                Gán Số Phòng Khách Sạn
              </h3>
              <button
                onClick={() => setShowAssignRoomModal(false)}
                className="text-sage-400 hover:text-sage-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-sage-600">
                Lựa chọn một phòng trống phù hợp hạng phòng **
                {bookingToAssign?.roomType}** để gán cho khách hàng **
                {bookingToAssign?.guest}**.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {rooms
                  .filter(
                    (r) =>
                      r.status === "vacant" &&
                      r.type
                        .toLowerCase()
                        .includes(
                          bookingToAssign?.roomType.split(" ")[0].toLowerCase(),
                        ),
                  )
                  .map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleAssignRoomSubmit(r.id)}
                      className="p-3 border border-primary-100 bg-primary-50/20 hover:bg-primary-100 text-center font-bold text-xs text-primary-950 cursor-pointer"
                    >
                      Phòng {r.id}
                    </button>
                  ))}
                {rooms.filter(
                  (r) =>
                    r.status === "vacant" &&
                    r.type
                      .toLowerCase()
                      .includes(
                        bookingToAssign?.roomType.split(" ")[0].toLowerCase(),
                      ),
                ).length === 0 && (
                  <p className="text-xs text-red-650 col-span-3">
                    Không còn phòng trống thuộc hạng phòng này!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Special Notes Modal */}
      {selectedBookingForNotes && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-primary-50 pb-3">
              <h3 className="font-serif text-lg font-normal text-sage-950">
                Ghi Chú Đặc Biệt Của Khách
              </h3>
              <button
                onClick={() => setSelectedBookingForNotes(null)}
                className="text-sage-400 hover:text-sage-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSpecialNotes} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Ghi chú (Dị ứng, giờ bay, trẻ em...)
                </label>
                <textarea
                  value={notesFormValue}
                  onChange={(e) => setNotesFormValue(e.target.value)}
                  rows="4"
                  className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200"
                  placeholder="Nhập ghi chú yêu cầu đặc biệt của khách hàng..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForNotes(null)}
                  className="px-4 py-2 border border-primary-100 text-xs font-semibold uppercase tracking-wider hover:bg-primary-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-900 cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
