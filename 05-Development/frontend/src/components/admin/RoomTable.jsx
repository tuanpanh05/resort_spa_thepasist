import React, { useState } from "react";
import { Image } from "lucide-react";
import Button from "../ui/Button";

export default function RoomTable({
  rooms,
  triggerEditModal,
  handleDeleteRoom,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Filter logic
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.id
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || room.status === statusFilter;
    const matchesType = typeFilter === "all" || room.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Controls */}
      <div className="bg-primary-50/50 border border-primary-100 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm theo số/mã phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-primary-200 bg-white focus:outline-primary-300"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 text-xs border border-primary-200 bg-white focus:outline-primary-300 flex-1 md:flex-initial"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="vacant">Trống</option>
            <option value="occupied">Có khách</option>
            <option value="cleaning">Dọn phòng</option>
            <option value="maintenance">Bảo trì</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 text-xs border border-primary-200 bg-white focus:outline-primary-300 flex-1 md:flex-initial"
          >
            <option value="all">Tất cả hạng phòng</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Villa">Villa</option>
            <option value="VIP">VIP</option>
          </select>
        </div>
      </div>

      {/* Grid of Room Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            className="bg-white border-2 border-primary-300 p-5 flex flex-col justify-between h-60 text-left rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary-500"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-primary-900 uppercase">
                  TẦNG {room.floor} - PHÒNG {room.id}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                    room.status === "vacant"
                      ? "bg-green-50 text-green-700 border border-green-150"
                      : room.status === "occupied"
                        ? "bg-primary-100 text-primary-950 border border-primary-200"
                        : room.status === "cleaning"
                          ? "bg-orange-50 text-orange-800 border border-orange-150"
                          : "bg-red-50 text-red-700 border border-red-150"
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

              <div className="h-24 w-full bg-primary-50/50 rounded-xl overflow-hidden relative flex items-center justify-center border border-primary-250">
                {room.photo ? (
                  <div className="absolute inset-0 flex flex-col justify-end p-2 bg-black/40 text-white text-[10px]">
                    <span className="font-semibold tracking-wide">
                      {room.photo}
                    </span>
                  </div>
                ) : (
                  <Image className="h-8 w-8 text-sage-350" />
                )}
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="font-serif font-normal text-sage-950">
                  {room.type}
                </span>
                <span className="font-semibold text-primary-950">
                  {room.price}/đêm
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-1.5 pt-2 border-t border-primary-100/50 mt-2">
              <Button
                onClick={() => triggerEditModal(room)}
                variant="secondary"
                className="px-3.5 py-1.5 text-[10px] font-semibold rounded-md"
              >
                Sửa
              </Button>
              <Button
                onClick={() => handleDeleteRoom(room.roomId, room.id)}
                variant="danger-light"
                className="px-3.5 py-1.5 text-[10px] font-semibold rounded-md"
              >
                Xóa
              </Button>
            </div>
          </div>
        ))}
        {filteredRooms.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-sage-400 italic">
            Không tìm thấy phòng nghỉ nào phù hợp với bộ lọc.
          </div>
        )}
      </div>
    </div>
  );
}
