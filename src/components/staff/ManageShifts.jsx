import React, { useState } from "react";
import { Clock, PlusCircle, X } from "lucide-react";

export default function ManageShifts({
  clockState,
  setClockState,
  shiftSwapRequests,
  setShiftSwapRequests,
  handleClockIn,
  handleClockOut,
}) {
  const [showSwapRequestModal, setShowSwapRequestModal] = useState(false);
  const [swapForm, setSwapForm] = useState({
    date: "2026-05-26",
    shiftType: "Ca Sáng (06:00 - 14:00)",
    targetEmployee: "",
    reason: "",
  });

  const handleSwapShiftSubmit = (e) => {
    e.preventDefault();
    if (!swapForm.targetEmployee || !swapForm.reason) {
      alert("Vui lòng điền nhân viên muốn đổi và lý do.");
      return;
    }
    const newReq = {
      id: Date.now(),
      ...swapForm,
      status: "Chờ duyệt",
      requestedTime: "Vừa xong",
    };
    setShiftSwapRequests((prev) => [newReq, ...prev]);
    setShowSwapRequestModal(false);
    setSwapForm({
      date: "2026-05-26",
      shiftType: "Ca Sáng (06:00 - 14:00)",
      targetEmployee: "",
      reason: "",
    });
    alert("Yêu cầu đổi ca làm việc đã được chuyển tới quản lý phê duyệt.");
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Attendance Clocking Card */}
      <div className="bg-white border border-primary-100 p-6">
        <h3 className="font-serif text-lg font-normal text-sage-950 mb-4 pb-2 border-b border-primary-50">
          Ghi Nhận Chấm Công & Điểm Danh Ca Trực
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <p className="text-xs text-sage-650">
              Nhấp vào nút **Vào ca** hoặc **Ra ca** để hệ thống tự động ghi
              nhận giờ làm việc thực tế của bạn hôm nay.
            </p>
            <div className="flex space-x-3">
              {!clockState.isClockedIn ? (
                <button
                  onClick={handleClockIn}
                  className="px-6 py-3 bg-primary-800 hover:bg-primary-900 text-white rounded-none font-semibold text-xs tracking-wider uppercase cursor-pointer"
                >
                  Vào ca (Clock In)
                </button>
              ) : (
                <button
                  onClick={handleClockOut}
                  className="px-6 py-3 bg-red-800 hover:bg-red-900 text-white rounded-none font-semibold text-xs tracking-wider uppercase cursor-pointer"
                >
                  Ra ca (Clock Out)
                </button>
              )}
            </div>
          </div>

          <div className="bg-primary-50/20 border border-primary-100 p-4 space-y-2 text-xs">
            <h4 className="font-bold text-primary-950 uppercase tracking-wide">
              Nhật Ký Trực Ca Hôm Nay
            </h4>
            {clockState.history.length === 0 ? (
              <p className="text-sage-400 italic font-light">
                Chưa có lịch sử điểm danh ca trực hôm nay.
              </p>
            ) : (
              <ul className="space-y-1 list-disc list-inside text-sage-700">
                {clockState.history.map((log, idx) => (
                  <li key={idx} className="font-light">
                    {log}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Roster shift swapping */}
      <div className="space-y-4 pt-4 border-t border-primary-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-serif text-lg font-normal text-sage-950">
              Yêu Cầu Xin Đổi Ca Trực
            </h3>
            <p className="text-xs text-sage-500 mt-1">
              Đề xuất xin hoán đổi ca làm việc với các đồng nghiệp khác gửi lên
              Ban Giám Đốc/Admin phê duyệt.
            </p>
          </div>
          <button
            onClick={() => setShowSwapRequestModal(true)}
            className="px-5 py-2.5 bg-primary-800 hover:bg-primary-900 text-white rounded-none text-xs font-semibold tracking-wider flex items-center space-x-1.5 cursor-pointer shadow-sm uppercase"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Đăng ký đổi ca trực</span>
          </button>
        </div>

        <div className="bg-white border border-primary-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-primary-50/50 text-sage-600 font-bold border-b border-primary-100">
                  <th className="p-4">Ngày xin đổi</th>
                  <th className="p-4">Loại Ca Trực</th>
                  <th className="p-4">Đổi Với Nhân Viên</th>
                  <th className="p-4">Lý Do Đề Xuất</th>
                  <th className="p-4">Thời gian gửi</th>
                  <th className="p-4 text-center">Trạng Thái Phê Duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50/50">
                {shiftSwapRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-primary-50/10">
                    <td className="p-4 font-bold text-primary-950">
                      {req.date}
                    </td>
                    <td className="p-4 font-semibold text-sage-900">
                      {req.shiftType}
                    </td>
                    <td className="p-4 text-sage-700">{req.targetEmployee}</td>
                    <td className="p-4 text-sage-800 max-w-xs">{req.reason}</td>
                    <td className="p-4 text-sage-500 font-mono">
                      {req.requestedTime}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-none text-[10px] font-semibold uppercase tracking-wider ${
                          req.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : req.status === "Rejected"
                              ? "bg-red-50 text-red-700"
                              : "bg-yellow-50 text-yellow-800"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {shiftSwapRequests.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-4 text-center text-sage-400 italic"
                    >
                      Chưa có yêu cầu xin đổi ca nào được tạo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Swap Shift Modal */}
      {showSwapRequestModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-primary-50 pb-3">
              <h3 className="font-serif text-lg font-normal text-sage-950">
                Đăng Ký Đề Xuất Xin Đổi Ca Trực
              </h3>
              <button
                onClick={() => setShowSwapRequestModal(false)}
                className="text-sage-400 hover:text-sage-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSwapShiftSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Ngày Muốn Đổi
                  </label>
                  <input
                    type="date"
                    value={swapForm.date}
                    onChange={(e) =>
                      setSwapForm({ ...swapForm, date: e.target.value })
                    }
                    className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Đổi Với Đồng Nghiệp
                  </label>
                  <input
                    type="text"
                    value={swapForm.targetEmployee}
                    onChange={(e) =>
                      setSwapForm({
                        ...swapForm,
                        targetEmployee: e.target.value,
                      })
                    }
                    placeholder="VD: Trần Văn B"
                    className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Ca Muốn Đổi
                </label>
                <select
                  value={swapForm.shiftType}
                  onChange={(e) =>
                    setSwapForm({ ...swapForm, shiftType: e.target.value })
                  }
                  className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
                >
                  <option value="Ca Sáng (06:00 - 14:00)">
                    Ca Sáng (06:00 - 14:00)
                  </option>
                  <option value="Ca Chiều (14:00 - 22:00)">
                    Ca Chiều (14:00 - 22:00)
                  </option>
                  <option value="Ca Đêm (22:00 - 06:00)">
                    Ca Đêm (22:00 - 06:00)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Lý Do Đề Xuất Đổi Ca
                </label>
                <textarea
                  value={swapForm.reason}
                  onChange={(e) =>
                    setSwapForm({ ...swapForm, reason: e.target.value })
                  }
                  rows="3"
                  placeholder="Ghi rõ lý do: Bận việc gia đình đột xuất..."
                  className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50">
                <button
                  type="button"
                  onClick={() => setShowSwapRequestModal(false)}
                  className="px-4 py-2 border border-primary-100 text-xs font-semibold uppercase tracking-wider hover:bg-primary-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-900 cursor-pointer"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
