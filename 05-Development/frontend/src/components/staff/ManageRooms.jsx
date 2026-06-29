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
      await staffApi.updateVillaStatus(parseInt(reportRoomId), {
        status: "MAINTENANCE",
        description: reportIssueDetail,
      });
      setVillas((prev) =>
        prev.map((r) =>
          r.roomId === parseInt(reportRoomId)
            ? { ...r, status: "MAINTENANCE", maintenanceDescription: reportIssueDetail }
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
            <span className="font-semibold block truncate italic text-yellow-800" title={villa.maintenanceDescription || "Liên hệ kỹ thuật"}>
              {villa.maintenanceDescription || "Liên hệ kỹ thuật"}
            </span>
          </div>
        );
      case "CLEANING":
      case "DIRTY":
      case "VACANT_NEEDS_CLEANING":
        return <span className="text-blue-750 font-medium italic">Đang dọn dẹp vệ sinh...</span>;
      case "AVAILABLE":
        return <span className="text-green-750 font-medium italic">Sẵn sàng đón khách</span>;
      case "DEPOSITED":
        return (
          <div>
            <span className="text-[10px] text-indigo-750 block font-medium">Khách chờ check-in:</span>
            <span className="font-bold text-indigo-950 block truncate">
              {villa.guestName || "Khách nghỉ dưỡng"}
            </span>
          </div>
        );
      default:
        return <span className="text-sage-500 italic">{status}</span>;
    }
  };

  const getRoomCardStyle = (roomTypeName, status) => {
    let bgClass = "", borderClass = "";
    switch (status) {
      case "AVAILABLE":   bgClass = "bg-[#f0fff4]"; borderClass = "border-emerald-200"; break;
      case "OCCUPIED":    bgClass = "bg-[#fff5f5]"; borderClass = "border-red-200";    break;
      case "CLEANING":
      case "DIRTY":
      case "VACANT_NEEDS_CLEANING": bgClass = "bg-[#f0f9ff]"; borderClass = "border-sky-200"; break;
      case "MAINTENANCE": bgClass = "bg-[#fffbeb]"; borderClass = "border-amber-200";  break;
      case "DEPOSITED":   bgClass = "bg-[#eef2ff]"; borderClass = "border-indigo-200"; break;
      default:            bgClass = "bg-white";     borderClass = "border-slate-200";
    }
    return `p-5 flex flex-col justify-between h-60 text-left rounded-2xl border ${bgClass} ${borderClass} shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`;
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

  // ─── Render ──────────────────────────────────────────────────────
  // Dynamic stats calculation
  const totalCount = villas.length;
  const availableCount = villas.filter(v => v.status === "AVAILABLE" || v.status === "DEPOSITED").length;
  const cleaningCount = villas.filter(v => ["CLEANING", "DIRTY", "VACANT_NEEDS_CLEANING"].includes(v.status)).length;
  const maintenanceCount = villas.filter(v => v.status === "MAINTENANCE").length;
  const totalRemainingCapacity = villas
    .filter(v => v.status === "AVAILABLE")
    .reduce((sum, v) => sum + (v.capacity || 2), 0);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Summary Row */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Available Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-emerald-500 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Số lượng phòng sẵn sàng</p>
            <p className="text-2xl font-bold text-emerald-700">{availableCount} <span className="text-sm font-normal text-gray-400">/ {totalCount}</span></p>
          </div>
        </div>

        {/* Cleaning Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-sky-500 flex items-center gap-4">
          <div className="p-3 bg-sky-50 rounded-lg text-sky-650">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 01-.586 1.414l-5 5c-.126.126-.254.246-.386.358m15.186.106A2 2 0 0119 14.25a2 2 0 01-2-2V8.5" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Số lượng phòng đang dọn</p>
            <p className="text-2xl font-bold text-sky-700">{cleaningCount}</p>
          </div>
        </div>

        {/* Maintenance Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500 flex items-center gap-4">
          <div className="p-3 bg-orange-50 rounded-lg text-orange-655">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Số lượng phòng bảo trì</p>
            <p className="text-2xl font-bold text-orange-700">{maintenanceCount}</p>
          </div>
        </div>

        {/* Capacity Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-indigo-500 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-650">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tổng sức chứa còn lại</p>
            <p className="text-2xl font-bold text-indigo-700">{totalRemainingCapacity} <span className="text-xs font-normal text-gray-400">người</span></p>
          </div>
        </div>
      </section>

      {/* Dashboard Controls */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Sơ Đồ Phòng / Villa</h3>
            <p className="text-sm text-gray-500">Giám sát trạng thái phòng theo thời gian thực. Thay đổi trạng thái phòng qua hệ thống.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadVillas}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              TẢI LẠI
            </button>
            <button
              onClick={() => setShowReportRoomModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              BÁO PHÒNG HỎNG
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100">
          {/* Status Filters */}
          <div className="flex items-center gap-6 text-sm">
            <span className="text-gray-400 font-medium w-20">Trạng thái</span>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setActiveStatusFilter("all")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  activeStatusFilter === "all" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Mọi trạng thái
              </button>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={activeStatusFilter === "AVAILABLE"}
                  onChange={() => setActiveStatusFilter(activeStatusFilter === "AVAILABLE" ? "all" : "AVAILABLE")}
                  className="rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Sẵn sàng
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={activeStatusFilter === "OCCUPIED"}
                  onChange={() => setActiveStatusFilter(activeStatusFilter === "OCCUPIED" ? "all" : "OCCUPIED")}
                  className="rounded text-red-500 focus:ring-red-500 cursor-pointer"
                />
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> Có khách
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={activeStatusFilter === "CLEANING"}
                  onChange={() => setActiveStatusFilter(activeStatusFilter === "CLEANING" ? "all" : "CLEANING")}
                  className="rounded text-sky-500 focus:ring-sky-500 cursor-pointer"
                />
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span> Dọn phòng
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={activeStatusFilter === "MAINTENANCE"}
                  onChange={() => setActiveStatusFilter(activeStatusFilter === "MAINTENANCE" ? "all" : "MAINTENANCE")}
                  className="rounded text-gray-400 focus:ring-gray-400 cursor-pointer"
                />
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span> Bảo trì
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={activeStatusFilter === "DEPOSITED"}
                  onChange={() => setActiveStatusFilter(activeStatusFilter === "DEPOSITED" ? "all" : "DEPOSITED")}
                  className="rounded text-orange-500 focus:ring-orange-500 cursor-pointer"
                />
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span> Đã cọc
                </span>
              </label>
            </div>
          </div>

          {/* Capacity Filters */}
          <div className="flex items-center gap-6 text-sm">
            <span className="text-gray-400 font-medium w-20">Sức chứa</span>
            <div className="flex flex-wrap items-center gap-4 flex-1">
              <button
                onClick={() => setActiveCapacityFilter("all")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  activeCapacityFilter === "all" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Mọi sức chứa
              </button>
              {["2", "3", "4", "8", "25", "50"].map((cap) => (
                <button
                  key={cap}
                  onClick={() => setActiveCapacityFilter(cap)}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    activeCapacityFilter === cap ? "text-indigo-600 font-bold" : "text-gray-650 hover:text-indigo-600"
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  {cap} người
                </button>
              ))}
            </div>
            <span className="px-3 py-1 bg-indigo-600 text-white rounded-md text-[10px] font-bold">
              {filteredVillas.length} phòng
            </span>
          </div>
        </div>
      </section>

      {/* Grid of Grouped Rooms */}
      <section className="space-y-6">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 flex items-center gap-2 text-red-750 text-xs">
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
          <div className="bg-white border border-gray-200 p-12 text-center rounded-xl">
            <p className="text-sm text-gray-500 font-medium">Không tìm thấy phòng nào phù hợp với bộ lọc.</p>
            <button
              onClick={() => { setActiveTypeFilter("all"); setActiveStatusFilter("all"); setActiveCapacityFilter("all"); }}
              className="mt-3 px-4 py-2 bg-gray-800 text-white text-xs font-semibold rounded-lg hover:bg-gray-900 transition-colors cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}

        {!loading && filteredVillas.length > 0 && (
          <div className="space-y-8">
            {Object.entries(grouped).map(([typeName, roomsOfType]) => (
              <div key={typeName} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-black rounded-full"></div>
                  <h4 className="text-md font-bold text-gray-800 uppercase tracking-tight">
                    {typeName} ({roomsOfType.length} phòng)
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {roomsOfType.map((villa) => (
                    <div key={villa.roomId} className={getRoomCardStyle(villa.roomTypeName, villa.status)}>
                      <div className="space-y-4 flex-grow flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-1 bg-gray-200 rounded text-[10px] font-bold flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                            PHÒNG: {villa.roomNumber}
                          </span>
                          <span className={`text-[10px] font-bold uppercase ${
                            villa.status === "AVAILABLE" ? "text-emerald-600" :
                            villa.status === "OCCUPIED" ? "text-red-600" :
                            villa.status === "MAINTENANCE" ? "text-amber-600" :
                            villa.status === "DEPOSITED" ? "text-indigo-650" : "text-sky-600"
                          }`}>
                            {getStatusLabel(villa.status)}
                          </span>
                        </div>

                        <div className="min-h-[60px] py-2 flex flex-col justify-center">
                          <div className="text-gray-750 italic text-xs">
                            {getStatusDescription(villa.status, villa)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 text-[10px]">
                          <span className="text-gray-400 max-w-[120px] truncate" title={villa.roomTypeName}>
                            {villa.roomTypeName || "—"}
                          </span>
                          <span className="font-bold text-gray-800">
                            {formatPrice(villa.basePrice)}/đêm
                          </span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <select
                          value={villa.status}
                          onChange={(e) => handleUpdateRoomStatus(villa.roomId, e.target.value)}
                          className="w-full text-xs border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white p-2 font-medium cursor-pointer"
                        >
                          {villa.status === "DEPOSITED" && (
                            <option value="DEPOSITED">Đã cọc (Deposited)</option>
                          )}
                          <option value="AVAILABLE">Sẵn sàng (Available)</option>
                          <option value="OCCUPIED">Có khách (Occupied)</option>
                          <option value="CLEANING">Dọn dẹp (Cleaning)</option>
                          <option value="MAINTENANCE">Bảo trì (Maintenance)</option>
                          <option value="DIRTY">Cần dọn (Dirty)</option>
                          <option value="VACANT_NEEDS_CLEANING">Cần dọn dẹp (Needs Cleaning)</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      {/* end of grid section */}

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
