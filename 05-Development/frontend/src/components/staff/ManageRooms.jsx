import React, { useState, useEffect } from "react";
import { PlusCircle, X, Loader2, AlertCircle, RefreshCw, Crown, Gem, Sparkles } from "lucide-react";
import { staffApi } from "../../api";

/**
 * UC09: ManageRooms — Villa Status Management Dashboard.
 * Connects to real backend APIs for listing rooms and updating statuses.
 * Supports ADR-003 state transitions including VACANT_NEEDS_CLEANING.
 * Now includes Jp-style pill filter bar for room type & status filtering.
 */
export default function ManageRooms({ rooms: mockRooms, setRooms, setComplaints }) {
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states (Jp Design System pill filter)
  const [activeTypeFilter, setActiveTypeFilter] = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [activeCapacityFilter, setActiveCapacityFilter] = useState("all");

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
        prev.map((r) => (r.roomId === roomId ? { ...r, status: newStatus } : r))
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
          r.roomId === parseInt(reportRoomId) ? { ...r, status: "MAINTENANCE" } : r
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

  // ─── Status helpers ────────────────────────────────────────────
  const getStatusLabel = (status) => {
    switch (status) {
      case "AVAILABLE": return "Sẵn sàng";
      case "OCCUPIED": return "Có khách";
      case "MAINTENANCE": return "Bảo trì";
      case "DIRTY": return "Cần dọn";
      case "CLEANING": return "Dọn phòng";
      case "VACANT_NEEDS_CLEANING": return "Cần dọn dẹp";
      case "DEPOSITED": return "Đã cọc";
      default: return status;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "AVAILABLE": return "bg-green-50 text-green-700 border-green-200";
      case "OCCUPIED": return "bg-red-50 text-red-650 border-red-200";
      case "CLEANING":
      case "DIRTY":
      case "VACANT_NEEDS_CLEANING": return "bg-blue-50 text-blue-700 border-blue-200";
      case "MAINTENANCE": return "bg-yellow-50 text-yellow-750 border-yellow-200";
      case "DEPOSITED": return "bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse";
      default: return "bg-gray-50 text-gray-600 border-gray-200";
    }
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
      case "DEPOSITED":
        return <span className="text-indigo-750 font-semibold italic">Đã cọc - Chờ check-in hôm nay</span>;
      default:
        return <span className="text-sage-500 italic">{status}</span>;
    }
  };

  const getRoomCardStyle = (roomTypeName, status) => {
    const lower = (roomTypeName || "").toLowerCase();
    let bgClass = "", borderClass = "";
    switch (status) {
      case "AVAILABLE":   bgClass = "bg-emerald-100 hover:bg-emerald-200/80"; borderClass = "border-emerald-350"; break;
      case "OCCUPIED":    bgClass = "bg-rose-100 hover:bg-rose-200/80";       borderClass = "border-rose-350";    break;
      case "CLEANING":
      case "DIRTY":
      case "VACANT_NEEDS_CLEANING": bgClass = "bg-sky-100 hover:bg-sky-200/80"; borderClass = "border-sky-350"; break;
      case "MAINTENANCE": bgClass = "bg-amber-100 hover:bg-amber-200/80";    borderClass = "border-amber-350";  break;
      case "DEPOSITED":   bgClass = "bg-indigo-100 hover:bg-indigo-200/80";   borderClass = "border-indigo-350 shadow-sm"; break;
      default:            bgClass = "bg-white hover:bg-slate-50";             borderClass = "border-slate-200";
    }
    const base = "p-5 flex flex-col justify-between h-60 text-left rounded-2xl transition-all duration-300 relative overflow-hidden";
    if (lower.includes("president") || lower.includes("suite"))
      return `${base} ${bgClass} border-2 border-amber-400 ring-4 ring-amber-400/20 shadow-md hover:shadow-lg`;
    if (lower.includes("vip") || lower.includes("villa") || lower.includes("pool"))
      return `${base} ${bgClass} border-2 border-indigo-300 ring-2 ring-indigo-300/10 shadow-sm hover:shadow-md`;
    return `${base} ${bgClass} border-2 ${borderClass} shadow-xs`;
  };

  const getRoomIcon = (roomTypeName) => {
    const lower = (roomTypeName || "").toLowerCase();
    if (lower.includes("president") || lower.includes("suite"))
      return <Crown className="h-4.5 w-4.5 text-amber-500 fill-amber-500/20 animate-pulse mr-1.5" />;
    if (lower.includes("vip") || lower.includes("villa") || lower.includes("pool"))
      return <Gem className="h-4 w-4 text-indigo-550 mr-1.5" />;
    return <Sparkles className="h-3.5 w-3.5 text-slate-400 mr-1.5" />;
  };

  const formatPrice = (val) => {
    if (!val) return "—";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  // ─── Filter definitions ─────────────────────────────────────────
  const TYPE_FILTERS = [
    { id: "all",       label: "Tất cả" },
    { id: "president", label: "🏆 President" },
    { id: "vip",       label: "💎 VIP" },
    { id: "standard",  label: "🛏 Standard" },
  ];

  const STATUS_FILTERS = [
    { id: "all",         label: "Mọi trạng thái" },
    { id: "AVAILABLE",   label: "✅ Sẵn sàng" },
    { id: "OCCUPIED",    label: "🔴 Có khách" },
    { id: "CLEANING",    label: "🔵 Dọn phòng" },
    { id: "MAINTENANCE", label: "🔧 Bảo trì" },
    { id: "DEPOSITED",   label: "💰 Đã cọc" },
  ];

  const CAPACITY_FILTERS = [
    { id: "all", label: "Mọi sức chứa" },
    { id: "2",   label: "👥 2 người" },
    { id: "3",   label: "👥 3 người" },
    { id: "4",   label: "👨‍👩‍👧‍👦 4 người" },
    { id: "8",   label: "👥 8 người" },
    { id: "25",  label: "👥 25 người" },
    { id: "50",  label: "👥 50 người" },
  ];

  const getTypeCategory = (roomTypeName) => {
    const lower = (roomTypeName || "").toLowerCase();
    if (lower.includes("president")) return "president";
    if (lower.includes("vip"))       return "vip";
    return "standard";
  };

  const filteredVillas = villas.filter((villa) => {
    const matchType     = activeTypeFilter === "all" || getTypeCategory(villa.roomTypeName) === activeTypeFilter;
    const matchStatus   = activeStatusFilter === "all"
      || villa.status === activeStatusFilter
      || (activeStatusFilter === "CLEANING" && ["CLEANING", "DIRTY", "VACANT_NEEDS_CLEANING"].includes(villa.status));
    const matchCapacity = activeCapacityFilter === "all"
      || String(villa.capacity) === activeCapacityFilter;
    return matchType && matchStatus && matchCapacity;
  });

  const grouped = filteredVillas.reduce((acc, villa) => {
    const k = villa.roomTypeName || "Hạng phòng khác";
    if (!acc[k]) acc[k] = [];
    acc[k].push(villa);
    return acc;
  }, {});

  // ─── Pill Tab Component (Jp Design System) ───────────────────────
  const PillTab = ({ id, label, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      style={{
        borderRadius: "100px",
        fontFamily: "'Inter', 'Satoshi', ui-sans-serif, system-ui, sans-serif",
        letterSpacing: "0.020em",
        transition: "background 0.18s ease, color 0.18s ease",
        cursor: "pointer",
        border: "none",
        outline: "none",
        padding: "8px 18px",
        background: active ? "#202020" : "transparent",
        color: active ? "#ffffff" : "#333333",
        fontSize: "13px",
        fontWeight: "500",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="space-y-0 animate-fade-in text-left">

      {/* Header */}
      <div className="bg-white border border-primary-100 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-normal text-sage-950">Sơ Đồ Phòng / Villa</h3>
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

      {/* ── Jp-style Pill Filter Bar ── */}
      {!loading && villas.length > 0 && (
        <div
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #e6e6e6",
            borderTop: "1px solid #e6e6e6",
            padding: "14px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "24px",
          }}
        >


          {/* Row 2: Status filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "2px", flexWrap: "wrap" }}>
            <span style={{
              fontSize: "11px", fontWeight: "500", color: "#838383",
              letterSpacing: "0.020em", marginRight: "10px", whiteSpace: "nowrap",
              fontFamily: "'Inter', ui-sans-serif, sans-serif", minWidth: "70px",
            }}>
              Trạng thái
            </span>
            {STATUS_FILTERS.map((f) => (
              <PillTab key={f.id} id={f.id} label={f.label}
                active={activeStatusFilter === f.id} onClick={setActiveStatusFilter} />
            ))}
          </div>

          {/* Hairline divider */}
          <div style={{ height: "1px", background: "#e6e6e6" }} />

          {/* Row 3: Capacity filter + count badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "2px", flexWrap: "wrap" }}>
            <span style={{
              fontSize: "11px", fontWeight: "500", color: "#838383",
              letterSpacing: "0.020em", marginRight: "10px", whiteSpace: "nowrap",
              fontFamily: "'Inter', ui-sans-serif, sans-serif", minWidth: "70px",
            }}>
              Sức chứa
            </span>
            {CAPACITY_FILTERS.map((f) => (
              <PillTab key={f.id} id={f.id} label={f.label}
                active={activeCapacityFilter === f.id} onClick={setActiveCapacityFilter} />
            ))}
            {/* Result count badge — Jp indigo-pulse accent */}
            <span style={{
              marginLeft: "auto",
              borderRadius: "100px",
              background: "#4177ff",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: "500",
              padding: "4px 14px",
              letterSpacing: "0.020em",
              fontFamily: "'Inter', ui-sans-serif, sans-serif",
            }}>
              {filteredVillas.length} phòng
            </span>
          </div>
        </div>
      )}

      {/* Content wrapper */}
      <div className="space-y-6" style={{ paddingTop: "0" }}>

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

        {/* Empty filtered state */}
        {!loading && filteredVillas.length === 0 && villas.length > 0 && (
          <div style={{
            textAlign: "center", padding: "64px 24px", color: "#838383",
            fontFamily: "'Inter', ui-sans-serif, sans-serif",
          }}>
            <div style={{ fontSize: "38px", marginBottom: "12px", opacity: 0.4 }}>🔍</div>
            <p style={{ fontSize: "14px", fontWeight: "500", color: "#333333" }}>Không có phòng phù hợp</p>
            <p style={{ fontSize: "13px", marginTop: "4px" }}>Thử chọn loại phòng hoặc trạng thái khác.</p>
            <button
              onClick={() => { setActiveTypeFilter("all"); setActiveStatusFilter("all"); setActiveCapacityFilter("all"); }}
              style={{
                marginTop: "16px", borderRadius: "100px", background: "#202020",
                color: "#ffffff", fontSize: "13px", fontWeight: "500", padding: "8px 18px",
                border: "none", cursor: "pointer", letterSpacing: "0.020em",
              }}
            >
              Xem tất cả phòng
            </button>
          </div>
        )}

        {/* Room Grid grouped by roomTypeName */}
        {!loading && filteredVillas.length > 0 && (
          <div className="space-y-8">
            {Object.entries(grouped).map(([typeName, roomsOfType]) => (
              <div key={typeName} className="space-y-4">
                <h4 className="font-serif text-sm font-bold text-sage-900 border-l-4 border-primary-700 pl-3 uppercase tracking-wider">
                  {typeName} ({roomsOfType.length} phòng)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {roomsOfType.map((villa) => (
                    <div key={villa.roomId} className={getRoomCardStyle(villa.roomTypeName, villa.status)}>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-extrabold text-primary-955 bg-primary-100/80 border border-primary-250 px-2 py-0.5 uppercase rounded-sm font-mono flex items-center">
                            {getRoomIcon(villa.roomTypeName)}
                            <span>Phòng: {villa.roomNumber}</span>
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border ${getStatusStyle(villa.status)}`}>
                            {getStatusLabel(villa.status)}
                          </span>
                        </div>

                        <div className="h-20 w-full bg-white/70 backdrop-blur-xs rounded-xl overflow-hidden relative flex flex-col justify-center px-3 border border-white/80 text-xs">
                          {getStatusDescription(villa.status, villa)}
                        </div>

                        <div className="flex justify-between items-center text-[10px] pt-1">
                          <span className="font-serif font-normal text-sage-955">{villa.roomTypeName || "—"}</span>
                          <span className="font-semibold text-primary-955">{formatPrice(villa.basePrice)}/đêm</span>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-1.5 pt-2 border-t border-primary-100/50 mt-2">
                        <select
                          value={villa.status}
                          onChange={(e) => handleUpdateRoomStatus(villa.roomId, e.target.value)}
                          className="p-1.5 border border-primary-250 text-[10px] focus:outline-none bg-white cursor-pointer rounded-md w-full font-semibold"
                        >
                          {villa.status === "DEPOSITED" && (
                            <option value="DEPOSITED">Đã cọc (Deposited)</option>
                          )}
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

      </div>{/* end content wrapper */}

      {/* Report Broken Room Modal */}
      {showReportRoomModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-primary-50 pb-3">
              <h3 className="font-serif text-lg font-normal text-sage-950">Báo Cáo Sự Cố Buồng Phòng</h3>
              <button onClick={() => setShowReportRoomModal(false)} className="text-sage-400 hover:text-sage-900 cursor-pointer">
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
                <button type="button" onClick={() => setShowReportRoomModal(false)}
                  className="px-4 py-2 border border-primary-100 text-xs font-semibold uppercase tracking-wider hover:bg-primary-50 cursor-pointer">
                  Hủy
                </button>
                <button type="submit"
                  className="px-4 py-2 bg-red-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-red-900 cursor-pointer">
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
