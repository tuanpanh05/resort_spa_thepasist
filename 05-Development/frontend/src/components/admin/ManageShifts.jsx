import React from "react";
import { Clock, ShieldCheck, X } from "lucide-react";
import { shiftApi } from "../../api";

export default function ManageShifts({
  shifts,
  swapRequests,
  loadShifts,
  loadSwapRequests,
}) {
  const toggleAttendance = async (id, currentStatus) => {
    const newStatus = currentStatus === "Checked-in" ? "Absent" : "Checked-in";
    try {
      await shiftApi.updateShiftStatus(id, newStatus);
      await loadShifts();
    } catch (err) {
      alert("Lỗi khi cập nhật điểm danh: " + err.message);
    }
  };

  const handleApproveSwap = async (id) => {
    try {
      await shiftApi.approveSwapRequest(id);
      await loadSwapRequests();
      alert("Yêu cầu đổi ca trực đã được phê duyệt.");
    } catch (err) {
      alert("Lỗi khi phê duyệt đổi ca: " + err.message);
    }
  };

  const handleRejectSwap = async (id) => {
    try {
      await shiftApi.rejectSwapRequest(id);
      await loadSwapRequests();
      alert("Yêu cầu đổi ca trực đã bị từ chối.");
    } catch (err) {
      alert("Lỗi khi từ chối đổi ca: " + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Shift Swap Requests */}
      <div className="space-y-4">
        <div>
          <h3 className="font-serif text-lg font-normal text-sage-950">
            Phê Duyệt Yêu Cầu Đổi Ca Trực
          </h3>
          <p className="text-xs text-sage-500">
            Tiếp nhận và xem xét phê duyệt các đề xuất xin đổi ca làm việc giữa
            các nhân viên trong resort.
          </p>
        </div>

        <div className="bg-white border border-primary-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-primary-50/50 text-sage-600 font-bold border-b border-primary-100">
                  <th className="p-4">Mã số</th>
                  <th className="p-4">Nhân viên gửi</th>
                  <th className="p-4">Ca muốn đổi</th>
                  <th className="p-4">Ngày trực gốc</th>
                  <th className="p-4">Nhân viên nhận ca</th>
                  <th className="p-4">Lý do xin đổi</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-center">Phê duyệt quyết định</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50/50">
                {swapRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-primary-50/10">
                    <td className="p-4 font-bold text-primary-950">{req.id}</td>
                    <td className="p-4 font-bold text-sage-950">
                      {req.sender}
                    </td>
                    <td className="p-4 font-semibold text-primary-900">
                      {req.shift}
                    </td>
                    <td className="p-4 text-sage-700">{req.date}</td>
                    <td className="p-4 text-sage-700">{req.receiver}</td>
                    <td className="p-4 text-sage-650 max-w-xs">{req.reason}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-none text-[10px] font-semibold uppercase tracking-wider ${
                          req.status === "Pending"
                            ? "bg-yellow-50 text-yellow-800"
                            : req.status === "Approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        {req.status === "Pending"
                          ? "Đang chờ"
                          : req.status === "Approved"
                            ? "Đã duyệt"
                            : "Từ chối"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {req.status === "Pending" ? (
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleApproveSwap(req.id)}
                            className="px-2.5 py-1.5 bg-primary-100 hover:bg-primary-200 text-primary-900 rounded-none text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleRejectSwap(req.id)}
                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-none text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-sage-400 italic">
                          {req.status === "Approved"
                            ? "Đã thông qua"
                            : "Đã bác bỏ"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Shifts List Section */}
      <div className="space-y-4 pt-4 border-t border-primary-100">
        <div>
          <h3 className="font-serif text-lg font-normal text-sage-950">
            Lịch Roster & Điểm Danh Nhân Sự
          </h3>
          <p className="text-xs text-sage-500">
            Giám sát phân bổ ca trực làm việc của các bộ phận resort theo tuần.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="bg-white border border-primary-100 p-5 space-y-3"
            >
              <div className="flex justify-between items-center pb-2 border-b border-primary-50">
                <span className="font-bold text-sage-950 text-sm">
                  {shift.name}
                </span>
                <span className="text-[10px] text-primary-850 font-semibold tracking-wide uppercase bg-primary-100 px-2 py-0.5">
                  {shift.role}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-sage-700">
                <div className="flex items-center space-x-1.5">
                  <Clock className="h-4 w-4 text-primary-700" />
                  <span>
                    Thời gian:{" "}
                    <span className="font-semibold text-sage-900">
                      {shift.time}
                    </span>
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary-700" />
                  <span>
                    Bộ phận trực:{" "}
                    <span className="font-semibold text-sage-900">
                      {shift.department}
                    </span>
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded-none text-[10px] font-semibold uppercase tracking-wider ${
                    shift.status === "Checked-in"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {shift.status === "Checked-in"
                    ? "Đã chấm công"
                    : "Chưa điểm danh"}
                </span>

                <button
                  onClick={() => toggleAttendance(shift.id, shift.status)}
                  className="px-2.5 py-1 bg-primary-100 hover:bg-primary-200 text-primary-950 font-semibold text-[9px] uppercase tracking-wider border border-primary-250 cursor-pointer"
                >
                  Chấm công nhanh
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
