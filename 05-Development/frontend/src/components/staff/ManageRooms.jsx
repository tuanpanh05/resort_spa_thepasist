import React, { useState, useEffect } from "react";
import { PlusCircle, X, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { staffApi } from "../../api";

/**
 * UC09: ManageRooms — Villa Status Management Dashboard.
 * Connects to real backend APIs for listing rooms and updating statuses.
 * Supports ADR-003 state transitions including VACANT_NEEDS_CLEANING.
 */
export default function ManageRooms({ rooms: mockRooms, setRooms, setComplaints }) {
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showReportRoomModal, setShowReportRoomModal] = useState(false);
  const [reportRoomId, setReportRoomId] = useState("");
  const [reportIssueDetail, setReportIssueDetail] = useState("");

  // Load villas from API
  useEffect(() => {
    loadVillas();
  }, []);

  const loadVillas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await staffApi.getVillas();
      setVillas(data);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách phòng.");
      setVillas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoomStatus = async (roomId, newStatus) => {
    try {
      await staffApi.updateVillaStatus(roomId, newStatus);
      setVillas((prev) =>
        prev.map((r) =>
          r.roomId === roomId ? { ...r, status: newStatus } : r
        )
      );
      alert(`Đã cập nhật trạng thái phòng thành "${getStatusLabel(newStatus)}".`);
    } catch (err) {
      alert("Lỗi cập nhật trạng thái: " + (err.message || "Không xác định"));
    }
  };

  const handleReportBrokenRoom = async (e) => {
    e.preventDefault();
    if (!reportRoomId || !reportIssueDetail) {
      alert("Vui lòng điền phòng hỏng và chi tiết sự cố.");
      return;
    }
    try {
      await staffApi.updateVillaStatus(parseInt(reportRoomId), "MAINTENANCE");
      setVillas((prev) =>
        prev.map((r) =>
          r.roomId === parseInt(reportRoomId)
            ? { ...r, status: "MAINTENANCE" }
            : r
        )
      );
      setShowReportRoomModal(false);
      setReportRoomId("");
      setReportIssueDetail("");
      alert(`Đã báo cáo phòng hỏng và chuyển sang trạng thái Bảo trì.`);
    } catch (err) {
      alert("Lỗi: " + (err.message || "Không thể cập nhật trạng thái phòng."));
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "AVAILABLE": return "Sẵn sàng";
      case "OCCUPIED": return "Có khách";
      case "MAINTENANCE": return "Bảo trì";
      case "DIRTY": return "Cần dọn";
      case "CLEANING": return "Dọn phòng";
      case "VACANT_NEEDS_CLEANING": return "Cần dọn dẹp";
      default: return status;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-50 text-green-700 border-green-150";
      case "OCCUPIED":
        return "bg-primary-100 text-primary-950 border-primary-200";
      case "CLEANING":
      case "DIRTY":
      case "VACANT_NEEDS_CLEANING":
        return "bg-orange-50 text-orange-850 border-orange-150";
      case "MAINTENANCE":
        return "bg-red-50 text-red-800 border-red-150";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getStatusDescription = (status, villa) => {
    switch (status) {
      case "OCCUPIED":
        return (
          <div>
            <span className="text-[10px] text-sage-400 block">Khách đang ở:</span>
            <span className="font-bold text-sage-900 block truncate">
              {villa.guestName || "Khách nghỉ dưỡng"}
            </span>
          </div>
        );
      case "MAINTENANCE":
        return (
          <div className="text-red-750">
            <span className="text-[10px] text-red-500 block">Đang bảo trì</span>
            <span className="font-semibold block truncate italic">Liên hệ kỹ thuật</span>
          </div>
        );
      case "CLEANING":
      case "DIRTY":
      case "VACANT_NEEDS_CLEANING":
        return <span className="text-orange-750 font-medium italic">Đang dọn dẹp vệ sinh...</span>;
      case "AVAILABLE":
        return <span className="text-green-750 font-medium italic">Sẵn sàng đón khách</span>;
      default:
        return <span className="text-sage-500 italic">{status}</span>;
    }
  };

  // Format price
  const formatPrice = (val) => {
    if (!val) return "—";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="bg-white border border-primary-100 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-normal text-sage-950">
            Sơ Đồ Phòng / Villa
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Giám sát trạng thái phòng theo thời gian thực. Thay đổi trạng thái phòng qua hệ thống.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadVillas}
            className="px-4 py-2.5 bg-primary-100 hover:bg-primary-200 text-primary-900 rounded-none text-xs font-semibold tracking-wider flex items-center space-x-1.5 cursor-pointer uppercase"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Tải lại</span>
          </button>
          <button
            onClick={() => setShowReportRoomModal(true)}
            className="px-5 py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-none text-xs font-semibold tracking-wider flex items-center space-x-1.5 cursor-pointer shadow-sm uppercase"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Báo phòng hỏng</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 flex items-center gap-2 text-red-700 text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-sage-500">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm">Đang tải dữ liệu phòng...</span>
        </div>
      )}

      {/* Room Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {villas.map((villa) => (
            <div
              key={villa.roomId}
              className="bg-white border-2 border-primary-300 p-5 flex flex-col justify-between h-60 text-left rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary-500"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-primary-900 uppercase">
                    {villa.roomNumber}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border ${getStatusStyle(villa.status)}`}
                  >
                    {getStatusLabel(villa.status)}
                  </span>
                </div>

                <div className="h-20 w-full bg-primary-50/50 rounded-xl overflow-hidden relative flex flex-col justify-center px-3 border border-primary-250 text-xs">
                  {getStatusDescription(villa.status, villa)}
                </div>

                <div className="flex justify-between items-center text-[10px] pt-1">
                  <span className="font-serif font-normal text-sage-955">
                    {villa.roomTypeName || "—"}
                  </span>
                  <span className="font-semibold text-primary-950">
                    {formatPrice(villa.basePrice)}/đêm
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-1.5 pt-2 border-t border-primary-100/50 mt-2">
                <select
                  value={villa.status}
                  onChange={(e) => handleUpdateRoomStatus(villa.roomId, e.target.value)}
                  className="p-1.5 border border-primary-250 text-[10px] focus:outline-none bg-white cursor-pointer rounded-md w-full font-semibold"
                >
                  <option value="AVAILABLE">Sẵn sàng (Available)</option>
                  <option value="OCCUPIED">Có khách (Occupied)</option>
                  <option value="CLEANING">Dọn dẹp (Cleaning)</option>
                  <option value="MAINTENANCE">Bảo trì (Maintenance)</option>
                  <option value="VACANT_NEEDS_CLEANING">Cần dọn (Needs Cleaning)</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

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
                  {villas.map((r) => (
                    <option key={r.roomId} value={r.roomId}>
                      {r.roomNumber} ({r.roomTypeName || "—"})
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
