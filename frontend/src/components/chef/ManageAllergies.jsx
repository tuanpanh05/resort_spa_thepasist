import React, { useState } from "react";
import { Search, Check } from "lucide-react";

export default function ManageAllergies({ allergies }) {
  const [allergySearch, setAllergySearch] = useState("");

  const filteredAllergies = allergies.filter(
    (item) =>
      item.guest.toLowerCase().includes(allergySearch.toLowerCase()) ||
      item.room.includes(allergySearch),
  );

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Search Header */}
      <div className="bg-white border border-sage-200/60 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-sage-950">
            Theo Dõi Chi Tiết Dị Ứng Khách Hàng.
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Giám sát các loại dị ứng đặc thù của khách lưu trú để lập thực đơn
            món ăn an toàn.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center text-sage-400 h-4.5 w-4.5 pointer-events-none mt-2.5" />
          <input
            type="text"
            value={allergySearch}
            onChange={(e) => setAllergySearch(e.target.value)}
            placeholder="Tìm khách hàng hoặc số phòng..."
            className="w-full pl-9 pr-4 py-2.5 rounded-none border border-sage-200 text-xs focus:outline-none focus:ring-1 focus:ring-sage-800 bg-white placeholder-sage-400"
          />
        </div>
      </div>

      {/* Allergies Table */}
      <div className="bg-white border border-sage-200/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-sage-50/50 text-sage-600 font-bold border-b border-sage-200/50">
                <th className="p-4">Mã KH</th>
                <th className="p-4">Họ và Tên</th>
                <th className="p-4">Số Phòng</th>
                <th className="p-4">Ngày nhận phòng</th>
                <th className="p-4">Dị ứng ghi chú (Allergies)</th>
                <th className="p-4">Chế độ ăn (Dietary Profile)</th>
                <th className="p-4 text-center">Trạng thái an toàn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {filteredAllergies.map((item) => (
                <tr key={item.id} className="hover:bg-sage-50/30">
                  <td className="p-4 font-mono font-bold text-sage-400">
                    {item.id}
                  </td>
                  <td className="p-4 font-bold text-sage-950">{item.guest}</td>
                  <td className="p-4 font-bold text-sage-900 font-mono">
                    PHÒNG {item.room}
                  </td>
                  <td className="p-4 text-sage-600">{item.checkIn}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {item.allergies.length > 0 ? (
                        item.allergies.map((alg, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded-none text-[10px] font-bold text-white ${
                              alg === "Hải sản" || alg === "Đậu phộng"
                                ? "bg-red-700"
                                : "bg-amber-700"
                            }`}
                          >
                            {alg}
                          </span>
                        ))
                      ) : (
                        <span className="text-sage-400 italic text-[10px]">
                          Không có dị ứng đặc biệt
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-[#fef3c7] text-[#b45309] text-[10px] font-bold font-mono">
                      {item.dietary}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center space-x-1 text-green-700 bg-green-50 px-2.5 py-0.5 border border-green-150 font-bold text-[10px]">
                      <Check className="h-3 w-3" />
                      <span>Bếp đã ghi nhận</span>
                    </span>
                  </td>
                </tr>
              ))}
              {filteredAllergies.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="p-8 text-center text-sage-400 italic"
                  >
                    Không tìm thấy khách hàng nào khớp với tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
