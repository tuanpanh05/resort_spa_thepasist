import React, { useState, useEffect } from "react";
import { PlusCircle, X, Loader2, AlertCircle, RefreshCw, Crown, Gem, Sparkles } from "lucide-react";
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
        return "bg-green-50 text-green-700 border-green-200";
      case "OCCUPIED":
        return "bg-red-50 text-red-650 border-red-200";
      case "CLEANING":
      case "DIRTY":
      case "VACANT_NEEDS_CLEANING":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "MAINTENANCE":
        return "bg-yellow-50 text-yellow-750 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getStatusContainerStyle = (status) => {
    return "h-20 w-full bg-white/70 backdrop-blur-xs rounded-xl overflow-hidden relative flex flex-col justify-center px-3 border border-white/80 text-xs";
  };

  const getStatusDescription = (status, villa) => {
    switch (status) {
      case "OCCUPIED":
        return (
          <div>
            <span className="text-[10px] text-red-500 block font-medium">Khách đang ở:</span>
            <span className="font-bold text-red-950 block truncate">
              {villa.guestName || "Khách nghỉ dưỡng"}
            </span>
          </div>
        );
      case "MAINTENANCE":
        return (
          <div>
            <span className="text-[10px] text-yellow-600 block font-bold">Đang bảo trì</span>
            <span className="font-semibold block truncate italic text-yellow-800">Liên hệ kỹ thuật</span>
          </div>
        );
      case "CLEANING":
      case "DIRTY":
      case "VACANT_NEEDS_CLEANING":
        return <span className="text-blue-750 font-medium italic">Đang dọn dẹp vệ sinh...</span>;
      case "AVAILABLE":
        return <span className="text-green-750 font-medium italic">Sẵn sàng đón khách</span>;
      default:
        return <span className="text-sage-500 italic">{status}</span>;
    }
  };

  const getRoomCardStyle = (roomTypeName, status) => {
    const lower = (roomTypeName || "").toLowerCase();
    
    let bgClass = "";
    let borderClass = "";
    
    switch (status) {
      case "AVAILABLE":
        bgClass = "bg-emerald-100 hover:bg-emerald-200/80";
        borderClass = "border-emerald-350 hover:border-emerald-450";
        break;
      case "OCCUPIED":
        bgClass = "bg-rose-100 hover:bg-rose-200/80";
        borderClass = "border-rose-350 hover:border-rose-450";
        break;
      case "CLEANING":
      case "DIRTY":
      case "VACANT_NEEDS_CLEANING":
        bgClass = "bg-sky-100 hover:bg-sky-200/80";
        borderClass = "border-sky-350 hover:border-sky-450";
        break;
      case "MAINTENANCE":
        bgClass = "bg-amber-100 hover:bg-amber-200/80";
        borderClass = "border-amber-350 hover:border-amber-450";
        break;
      default:
        bgClass = "bg-white hover:bg-slate-50";
        borderClass = "border-slate-200 hover:border-slate-350";
    }

    const baseClass = "p-5 flex flex-col justify-between h-60 text-left rounded-2xl transition-all duration-300 relative overflow-hidden";

    if (lower.includes("presidential") || lower.includes("president") || lower.includes("suite")) {
      return `${baseClass} ${bgClass} border-2 border-amber-400 ring-4 ring-amber-400/20 shadow-md hover:shadow-lg`;
    }
    if (lower.includes("vip") || lower.includes("villa") || lower.includes("pool")) {
      return `${baseClass} ${bgClass} border-2 border-indigo-300 ring-2 ring-indigo-300/10 shadow-sm hover:shadow-md`;
    }
    
    return `${baseClass} ${bgClass} border-2 ${borderClass} shadow-xs`;
  };

  const getRoomIcon = (roomTypeName) => {
    const lower = (roomTypeName || "").toLowerCase();
    if (lower.includes("presidential") || lower.includes("president") || lower.includes("suite")) {
      return <Crown className="h-4.5 w-4.5 text-amber-500 fill-amber-500/20 animate-pulse mr-1.5" />;
    }
    if (lower.includes("vip") || lower.includes("villa") || lower.includes("pool")) {
      return <Gem className="h-4 w-4 text-indigo-550 mr-1.5" />;
    }
    return <Sparkles className="h-3.5 w-3.5 text-slate-400 mr-1.5" />;
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

      {/* Room Grid grouped by roomTypeName */}
      {!loading && (
        <div className="space-y-8">
          {Object.entries(
            villas.reduce((groups, villa) => {
              const typeName = villa.roomTypeName || "Hạng phòng khác";
              if (!groups[typeName]) groups[typeName] = [];
              groups[typeName].push(villa);
              return groups;
            }, {})
          ).map(([typeName, roomsOfType]) => (
            <div key={typeName} className="space-y-4">
              <h4 className="font-serif text-sm font-bold text-sage-900 border-l-4 border-primary-700 pl-3 uppercase tracking-wider">
                {typeName} ({roomsOfType.length} phòng)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {roomsOfType.map((villa) => (
                  <div
                    key={villa.roomId}
                    className={getRoomCardStyle(villa.roomTypeName, villa.status)}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold text-primary-955 bg-primary-100/80 border border-primary-250 px-2 py-0.5 uppercase rounded-sm font-mono flex items-center">
                          {getRoomIcon(villa.roomTypeName)}
                          <span>Phòng: {villa.roomNumber}</span>
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border ${getStatusStyle(villa.status)}`}
                        >
                          {getStatusLabel(villa.status)}
                        </span>
                      </div>

                      <div className={getStatusContainerStyle(villa.status)}>
                        {getStatusDescription(villa.status, villa)}
                      </div>

                      <div className="flex justify-between items-center text-[10px] pt-1">
                        <span className="font-serif font-normal text-sage-955">
                          {villa.roomTypeName || "—"}
                        </span>
                        <span className="font-semibold text-primary-955">
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
