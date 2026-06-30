import React, { useState, useEffect, useMemo } from "react";
import { staffApi } from "../../api";
import { 
  Search, 
  Users, 
  UserCheck, 
  Baby, 
  RefreshCw, 
  FileSpreadsheet,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Shield,
  CreditCard,
  Phone,
  Mail,
  DoorOpen
} from "lucide-react";

export default function ManageGuests() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const fetchGuests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await staffApi.getGuests();
      setGuests(data || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách khách lưu trú.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Group guests by bookingId
  const groupedBookings = useMemo(() => {
    const map = {};
    guests.forEach((g) => {
      if (!map[g.bookingId]) {
        map[g.bookingId] = {
          bookingId: g.bookingId,
          representativeName: g.representativeName || (g.relationship === "Người đăng ký" ? g.fullName : ""),
          representativePhone: g.representativePhone || "—",
          representativeEmail: g.representativeEmail || "—",
          roomNumber: g.roomNumber || "Chưa gán",
          createdAt: g.createdAt,
          members: []
        };
      }
      if (g.relationship === "Người đăng ký") {
        map[g.bookingId].representativeName = g.fullName;
        if (g.representativePhone) map[g.bookingId].representativePhone = g.representativePhone;
        if (g.representativeEmail) map[g.bookingId].representativeEmail = g.representativeEmail;
      }
      map[g.bookingId].members.push(g);
    });

    // Add fallback for representative name if missing
    return Object.values(map).map((b) => {
      if (!b.representativeName && b.members.length > 0) {
        const primary = b.members.find(m => m.relationship === "Người đăng ký") || b.members[0];
        b.representativeName = primary.fullName;
      }
      return b;
    });
  }, [guests]);

  // Filter grouped bookings
  const filteredBookings = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return groupedBookings.filter((b) => {
      return (
        (b.representativeName || "").toLowerCase().includes(term) ||
        b.bookingId.toString().includes(term) ||
        (b.roomNumber || "").toLowerCase().includes(term) ||
        b.members.some(m => (m.fullName || "").toLowerCase().includes(term) || (m.identityDocument || "").toLowerCase().includes(term))
      );
    });
  }, [groupedBookings, searchTerm]);

  // Find currently selected booking
  const selectedBooking = useMemo(() => {
    if (!selectedBookingId) return null;
    return groupedBookings.find(b => b.bookingId === selectedBookingId);
  }, [groupedBookings, selectedBookingId]);

  const handleExport = () => {
    alert("Đang xuất danh sách khai báo cư trú (Excel)...");
  };

  // If a booking is selected, display the detailed list of guests inside it
  if (selectedBooking) {
    const adults = selectedBooking.members.filter(m => !m.isChild);
    const children = selectedBooking.members.filter(m => m.isChild);

    return (
      <div className="space-y-6 animate-fade-in text-left">
        {/* Standalone Back Button Bar */}
        <div>
          <button
            onClick={() => setSelectedBookingId(null)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-sage-950 hover:bg-primary-50 text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-md border border-primary-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách phòng (Xem chủ phòng)
          </button>
        </div>

        {/* Title Card */}
        <div className="bg-white border border-primary-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h2 className="font-serif text-lg font-normal text-sage-950 flex items-center gap-2">
              <DoorOpen className="h-5 w-5 text-primary-750" />
              Đoàn Khách Lưu Trú — Phòng {selectedBooking.roomNumber}
            </h2>
            <p className="text-xs text-sage-500">
              Chi tiết thành viên cư trú đăng ký theo mã đặt phòng #{selectedBooking.bookingId}.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="p-2.5 bg-primary-750 text-xs text-white hover:bg-primary-850 flex items-center gap-2 cursor-pointer transition-colors duration-150 font-medium"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Xuất Tờ Khai Đoàn (Excel)
          </button>
        </div>

        {/* Representative summary card */}
        <div className="bg-white border border-primary-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-[10px] text-sage-400 font-bold uppercase tracking-wider block">Người đại diện đặt phòng</span>
            <div className="text-sm font-semibold text-sage-900 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-green-600" />
              {selectedBooking.representativeName}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-sage-400 font-bold uppercase tracking-wider block">Số điện thoại liên hệ</span>
            <div className="text-xs text-sage-700 font-mono flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-sage-400" />
              {selectedBooking.representativePhone}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-sage-400 font-bold uppercase tracking-wider block">Email liên hệ</span>
            <div className="text-xs text-sage-700 font-mono flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-sage-400" />
              {selectedBooking.representativeEmail}
            </div>
          </div>
        </div>

        {/* Stats segment cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-primary-100 p-4">
            <span className="text-[10px] text-sage-400 block font-semibold uppercase tracking-wider">Tổng số thành viên</span>
            <span className="text-lg font-semibold text-sage-900">{selectedBooking.members.length} khách</span>
          </div>
          <div className="bg-white border border-primary-100 p-4">
            <span className="text-[10px] text-sage-400 block font-semibold uppercase tracking-wider">Người lớn</span>
            <span className="text-lg font-semibold text-sage-900">{adults.length} người</span>
          </div>
          <div className="bg-white border border-primary-100 p-4">
            <span className="text-[10px] text-sage-400 block font-semibold uppercase tracking-wider">Trẻ em</span>
            <span className="text-lg font-semibold text-sage-900">{children.length} bé</span>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white border border-primary-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-primary-50 border-b border-primary-100 text-sage-500 font-semibold uppercase tracking-wider">
                  <th className="p-4 font-semibold text-[10px]">Họ tên khách</th>
                  <th className="p-4 font-semibold text-[10px]">Số CCCD / Hộ chiếu</th>
                  <th className="p-4 font-semibold text-[10px]">Mối quan hệ</th>
                  <th className="p-4 font-semibold text-[10px]">Phân loại</th>
                  <th className="p-4 font-semibold text-[10px]">Ngày khai báo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50">
                {selectedBooking.members.map((m) => {
                  const isRep = m.relationship === "Người đăng ký";
                  const isChild = m.isChild === true;

                  return (
                    <tr key={m.guestId} className="hover:bg-primary-50/30 transition-colors duration-100">
                      <td className="p-4 font-semibold text-sage-900 flex items-center gap-2">
                        {isChild ? (
                          <Baby className="h-4 w-4 text-sky-500" />
                        ) : isRep ? (
                          <UserCheck className="h-4 w-4 text-green-600" />
                        ) : (
                          <Users className="h-4 w-4 text-indigo-500" />
                        )}
                        {m.fullName}
                      </td>
                      <td className="p-4 font-mono font-medium text-sage-700">
                        {m.identityDocument || "—"}
                      </td>
                      <td className="p-4 font-medium text-sage-800">
                        {m.relationship || "Chưa xác định"}
                      </td>
                      <td className="p-4">
                        {isRep ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                            Đại Diện
                          </span>
                        ) : isChild ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            Trẻ em
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-750 border border-indigo-200">
                            Người lớn
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sage-500">
                        {formatDate(m.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Grouped Booking List view
  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header */}
      <div className="bg-white border border-primary-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-serif text-lg font-normal text-sage-950 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-750" />
            Tra Cứu Khai Báo & Thông Tin Khách Lưu Trú
          </h2>
          <p className="text-xs text-sage-500 mt-1">
            Tra cứu theo phòng và người đại diện đặt phòng để xem danh sách chi tiết các khách cư trú đi cùng đoàn.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchGuests}
            className="p-2.5 border border-primary-100 text-xs text-sage-600 hover:text-primary-750 hover:bg-primary-50/50 flex items-center gap-2 cursor-pointer transition-colors duration-150"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Tải lại
          </button>
          <button
            onClick={handleExport}
            className="p-2.5 bg-primary-750 text-xs text-white hover:bg-primary-850 flex items-center gap-2 cursor-pointer transition-colors duration-150 font-medium"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Xuất Báo Cáo (Excel)
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-primary-100 p-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-sage-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo Tên đại diện, Số phòng, Mã đặt phòng hoặc số giấy tờ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-primary-100 text-xs focus:outline-primary-200"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grouped bookings table */}
      <div className="bg-white border border-primary-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sage-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-primary-750" />
            Đang tải danh sách phòng lưu trú...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-sage-400 text-xs">
            Không tìm thấy phòng lưu trú nào khớp với từ khóa tìm kiếm.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-primary-50 border-b border-primary-100 text-sage-500 font-semibold uppercase tracking-wider">
                  <th className="p-4 font-semibold text-[10px]">Đại diện đặt phòng</th>
                  <th className="p-4 font-semibold text-[10px]">Phòng nghỉ</th>
                  <th className="p-4 font-semibold text-[10px]">Mã đặt phòng</th>
                  <th className="p-4 font-semibold text-[10px]">Số lượng khách</th>
                  <th className="p-4 font-semibold text-[10px]">Khai báo lúc</th>
                  <th className="p-4 font-semibold text-[10px] text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50">
                {filteredBookings.map((b) => {
                  const childCount = b.members.filter(m => m.isChild).length;
                  const adultCount = b.members.length - childCount;

                  return (
                    <tr 
                      key={b.bookingId} 
                      className="hover:bg-primary-50/30 transition-colors duration-100 cursor-pointer"
                      onClick={() => setSelectedBookingId(b.bookingId)}
                    >
                      <td className="p-4">
                        <div className="font-semibold text-sage-900 flex items-center gap-1.5">
                          <UserCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                          {b.representativeName}
                        </div>
                        <div className="text-[10px] text-sage-500 font-mono mt-0.5">
                          SĐT: {b.representativePhone}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-primary-900">
                        Phòng {b.roomNumber}
                      </td>
                      <td className="p-4 font-mono font-semibold text-sage-600">
                        #{b.bookingId}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-100 text-primary-900 border border-primary-200">
                          {b.members.length} khách ({adultCount} NL {childCount > 0 && `• ${childCount} TE`})
                        </span>
                      </td>
                      <td className="p-4 text-sage-500">
                        {formatDate(b.createdAt)}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Avoid double trigger
                            setSelectedBookingId(b.bookingId);
                          }}
                          className="px-3 py-1.5 bg-primary-50 border border-primary-100 text-primary-750 hover:bg-primary-100 hover:text-primary-900 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          Xem đoàn khách
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
