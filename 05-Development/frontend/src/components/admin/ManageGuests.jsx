import React, { useState, useEffect } from "react";
import { staffApi } from "../../api";
import { 
  Search, 
  Users, 
  UserCheck, 
  Baby, 
  RefreshCw, 
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";

export default function ManageGuests() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // all, representative, accompanying, child
  const [docFilter, setDocFilter] = useState("all"); // all, cccd, passport

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

  // Filter guests
  const filteredGuests = guests.filter((g) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      (g.fullName || "").toLowerCase().includes(term) ||
      (g.identityDocument || "").toLowerCase().includes(term) ||
      (g.representativeName || "").toLowerCase().includes(term) ||
      (g.representativePhone || "").toLowerCase().includes(term) ||
      (g.roomNumber || "").toLowerCase().includes(term);

    const isRep = g.relationship === "Người đăng ký";
    const isChild = g.isChild === true;
    const isAccompanying = !isRep && !isChild;

    let matchesRole = true;
    if (roleFilter === "representative") matchesRole = isRep;
    else if (roleFilter === "accompanying") matchesRole = isAccompanying;
    else if (roleFilter === "child") matchesRole = isChild;

    const isCccd = g.identityDocument && /^0\d{11}$/.test(g.identityDocument.trim());
    let matchesDoc = true;
    if (docFilter === "cccd") matchesDoc = isCccd;
    else if (docFilter === "passport") matchesDoc = g.identityDocument && !isCccd;

    return matchesSearch && matchesRole && matchesDoc;
  });

  const handleExport = () => {
    alert("Đang xuất danh sách khai báo cư trú (Excel)...");
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header and statistics */}
      <div className="bg-white border border-primary-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-serif text-lg font-normal text-sage-950 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-750" />
            Tra Cứu Khai Báo & Thông Tin Khách Lưu Trú
          </h2>
          <p className="text-xs text-sage-500 mt-1">
            Quản lý hồ sơ cư trú, tra cứu thông tin căn cước công dân/hộ chiếu của khách chính và khách đi cùng.
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
            Xuất Tờ Khai (Excel)
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-primary-100 p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-sage-400" />
          <input
            type="text"
            placeholder="Tìm theo tên khách, số giấy tờ, tên đại diện, số phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-primary-100 text-xs focus:outline-primary-200"
          />
        </div>
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full p-2 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="representative">Người đại diện đặt phòng</option>
            <option value="accompanying">Người lớn đi cùng</option>
            <option value="child">Trẻ em đi cùng</option>
          </select>
        </div>
        <div>
          <select
            value={docFilter}
            onChange={(e) => setDocFilter(e.target.value)}
            className="w-full p-2 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
          >
            <option value="all">Mọi loại giấy tờ</option>
            <option value="cccd">Căn cước công dân (CCCD)</option>
            <option value="passport">Hộ chiếu (Passport)</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Summary Info cards */}
      {!loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-primary-100 p-4 flex items-center gap-3">
            <div className="p-3 bg-primary-50 rounded text-primary-750">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-sage-400 block font-semibold uppercase tracking-wider">Tổng khách trú</span>
              <span className="text-lg font-semibold text-sage-900">{guests.length}</span>
            </div>
          </div>
          <div className="bg-white border border-primary-100 p-4 flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded text-green-700">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-sage-400 block font-semibold uppercase tracking-wider">Người đại diện</span>
              <span className="text-lg font-semibold text-sage-900">
                {guests.filter(g => g.relationship === "Người đăng ký").length}
              </span>
            </div>
          </div>
          <div className="bg-white border border-primary-100 p-4 flex items-center gap-3">
            <div className="p-3 bg-indigo-50 rounded text-indigo-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-sage-400 block font-semibold uppercase tracking-wider">Người lớn đi cùng</span>
              <span className="text-lg font-semibold text-sage-900">
                {guests.filter(g => g.relationship !== "Người đăng ký" && !g.isChild).length}
              </span>
            </div>
          </div>
          <div className="bg-white border border-primary-100 p-4 flex items-center gap-3">
            <div className="p-3 bg-sky-50 rounded text-sky-700">
              <Baby className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-sage-400 block font-semibold uppercase tracking-wider">Trẻ em đi cùng</span>
              <span className="text-lg font-semibold text-sage-900">
                {guests.filter(g => g.isChild).length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Table view */}
      <div className="bg-white border border-primary-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sage-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-primary-750" />
            Đang tải dữ liệu khách lưu trú...
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="p-12 text-center text-sage-400 text-xs">
            Không có khách lưu trú nào phù hợp với bộ lọc tìm kiếm.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-primary-50 border-b border-primary-100 text-sage-500 font-semibold uppercase tracking-wider">
                  <th className="p-4 font-semibold text-[10px]">Tên khách</th>
                  <th className="p-4 font-semibold text-[10px]">Số CCCD / Hộ chiếu</th>
                  <th className="p-4 font-semibold text-[10px]">Vai trò</th>
                  <th className="p-4 font-semibold text-[10px]">Người đại diện đặt phòng</th>
                  <th className="p-4 font-semibold text-[10px]">Phòng</th>
                  <th className="p-4 font-semibold text-[10px]">Khai báo lúc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50">
                {filteredGuests.map((g) => {
                  const isRep = g.relationship === "Người đăng ký";
                  const isChild = g.isChild === true;

                  return (
                    <tr key={g.guestId} className="hover:bg-primary-50/30 transition-colors duration-100">
                      <td className="p-4 font-semibold text-sage-900 flex items-center gap-2">
                        {isChild ? (
                          <Baby className="h-4 w-4 text-sky-500 flex-shrink-0" />
                        ) : isRep ? (
                          <UserCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <Users className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                        )}
                        {g.fullName}
                      </td>
                      <td className="p-4 font-mono font-medium text-sage-700">
                        {g.identityDocument || "—"}
                      </td>
                      <td className="p-4">
                        {isRep ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                            Đại Diện
                          </span>
                        ) : isChild ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            Trẻ em ({g.relationship || "Con"})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-750 border border-indigo-200">
                            Khách Đi Cùng
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {isRep ? (
                          <span className="text-sage-400 italic">Chính chủ đại diện</span>
                        ) : (
                          <div>
                            <div className="font-semibold text-sage-900">{g.representativeName || "—"}</div>
                            <div className="text-[10px] text-sage-500 font-mono mt-0.5">
                              {g.representativePhone} {g.representativePhone && g.representativeEmail && "•"} {g.representativeEmail}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-bold text-primary-900">
                        Phòng {g.roomNumber || "—"}
                      </td>
                      <td className="p-4 text-sage-500">
                        {formatDate(g.createdAt)}
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
