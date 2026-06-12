import React, { useState } from "react";
import { PlusCircle, Image, X } from "lucide-react";

export default function ManageRooms({ rooms, setRooms, setComplaints }) {
  const [showReportRoomModal, setShowReportRoomModal] = useState(false);
  const [reportRoomId, setReportRoomId] = useState("");
  const [reportIssueDetail, setReportIssueDetail] = useState("");

  const handleUpdateRoomStatus = (roomId, newStatus) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              status: newStatus,
              issue: newStatus !== "maintenance" ? "" : r.issue,
            }
          : r,
      ),
    );
    alert(`Đã cập nhật trạng thái phòng ${roomId} sang "${newStatus}".`);
  };

  const handleReportBrokenRoom = (e) => {
    e.preventDefault();
    if (!reportRoomId || !reportIssueDetail) {
      alert("Vui lòng điền phòng hỏng và chi tiết sự cố.");
      return;
    }
    setRooms((prev) =>
      prev.map((r) =>
        r.id === reportRoomId
          ? { ...r, status: "maintenance", issue: reportIssueDetail }
          : r,
      ),
    );

    const newComplaint = {
      id: Date.now(),
      guest: "Kỹ thuật vận hành",
      room: reportRoomId,
      content: `Báo cáo hỏng hóc: ${reportIssueDetail}`,
      status: "Open",
      time: "Vừa xong",
      feedback: "",
    };
    setComplaints((prev) => [newComplaint, ...prev]);
    setShowReportRoomModal(false);
    setReportRoomId("");
    setReportIssueDetail("");
    alert(
      `Đã báo cáo phòng hỏng ${reportRoomId} thành công cho kỹ thuật bộ phận.`,
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="bg-white border border-primary-100 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-normal text-sage-950">
            Sơ Đồ Phòng Theo Ca
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Giám sát nhanh trạng thái sử dụng phòng, báo cáo sự cố dọn dẹp hoặc
            hỏng hóc thiết bị buồng phòng trực tiếp.
          </p>
        </div>
        <button
          onClick={() => setShowReportRoomModal(true)}
          className="px-5 py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-none text-xs font-semibold tracking-wider flex items-center space-x-1.5 cursor-pointer shadow-sm uppercase"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Báo phòng hỏng (Maintenance)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white border-2 border-primary-300 p-5 flex flex-col justify-between h-60 text-left rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary-500"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-primary-900 uppercase">
                  PHÒNG {room.id}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                    room.status === "vacant"
                      ? "bg-green-50 text-green-700 border border-green-150"
                      : room.status === "occupied"
                        ? "bg-primary-100 text-primary-950 border border-primary-200"
                        : room.status === "cleaning"
                          ? "bg-orange-50 text-orange-850 border border-orange-150"
                          : "bg-red-50 text-red-800 border border-red-150"
                  }`}
                >
                  {room.status === "vacant"
                    ? "Trống"
                    : room.status === "occupied"
                      ? "Có khách"
                      : room.status === "cleaning"
                        ? "Dọn phòng"
                        : "Bảo trì"}
                </span>
              </div>

              <div className="h-20 w-full bg-primary-50/50 rounded-xl overflow-hidden relative flex flex-col justify-center px-3 border border-primary-250 text-xs">
                {room.status === "occupied" ? (
                  <div>
                    <span className="text-[10px] text-sage-400 block">
                      Khách đang ở:
                    </span>
                    <span className="font-bold text-sage-900 block truncate">
                      {room.guestName || "Khách nghỉ dưỡng"}
                    </span>
                  </div>
                ) : room.status === "maintenance" ? (
                  <div className="text-red-750">
                    <span className="text-[10px] text-red-500 block">
                      Sự cố hỏng hóc:
                    </span>
                    <span className="font-semibold block truncate italic">
                      "{room.issue || "Chưa cập nhật"}"
                    </span>
                  </div>
                ) : room.status === "cleaning" ? (
                  <span className="text-orange-750 font-medium italic">
                    Đang dọn dẹp vệ sinh...
                  </span>
                ) : (
                  <span className="text-green-750 font-medium italic">
                    Sẵn sàng đón khách
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center text-[10px] pt-1">
                <span className="font-serif font-normal text-sage-955">
                  {room.type}
                </span>
                <span className="font-semibold text-primary-950">
                  Tầng {room.floor}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-1.5 pt-2 border-t border-primary-100/50 mt-2">
              <select
                value={room.status}
                onChange={(e) =>
                  handleUpdateRoomStatus(room.id, e.target.value)
                }
                className="p-1.5 border border-primary-250 text-[10px] focus:outline-none bg-white cursor-pointer rounded-md w-full font-semibold"
              >
                <option value="vacant">Sẵn sàng (Vacant)</option>
                <option value="occupied">Có khách (Occupied)</option>
                <option value="cleaning">Dọn dẹp (Cleaning)</option>
                <option value="maintenance">Bảo trì (Maintenance)</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Report Broken Room Modal */}
      {showReportRoomModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-primary-50 pb-3">
              <h3 className="font-serif text-lg font-normal text-sage-950">
                Báo Cáo Sự Cố Buồng Phòng
              </h3>
              <button
                onClick={() => setShowReportRoomModal(false)}
                className="text-sage-400 hover:text-sage-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReportBrokenRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Số/Mã Phòng Gặp Sự Cố
                </label>
                <select
                  value={reportRoomId}
                  onChange={(e) => setReportRoomId(e.target.value)}
                  className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
                  required
                >
                  <option value="">-- Chọn phòng sự cố --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Phòng {r.id} ({r.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Chi tiết sự cố hỏng hóc
                </label>
                <textarea
                  value={reportIssueDetail}
                  onChange={(e) => setReportIssueDetail(e.target.value)}
                  rows="3"
                  placeholder="VD: Hỏng vòi nước nhà vệ sinh, cháy bóng đèn ngủ..."
                  className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50">
                <button
                  type="button"
                  onClick={() => setShowReportRoomModal(false)}
                  className="px-4 py-2 border border-primary-100 text-xs font-semibold uppercase tracking-wider hover:bg-primary-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-red-900 cursor-pointer"
                >
                  Gửi báo cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
