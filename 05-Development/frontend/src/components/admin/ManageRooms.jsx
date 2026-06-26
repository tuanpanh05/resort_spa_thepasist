import React, { useState } from "react";
import { PlusCircle, Bed, CheckCircle, Users, Wrench } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import Button from "../ui/Button";
import RoomTable from "./RoomTable";
import { RoomModalForm } from "./ModalForm";

export default function ManageRooms({ rooms, handleCreateRoom, handleUpdateRoom, handleDeleteRoom }) {
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    id: "",
    type: "Standard",
    floor: 1,
    price: "1,800,000đ",
    maxGuests: 2,
    photo: "room_std_garden.jpg",
  });

  const triggerAddModal = () => {
    setRoomForm({
      id: "",
      type: "Standard",
      floor: 1,
      price: "1,800,000đ",
      maxGuests: 2,
      photo: "room_std_garden.jpg",
    });
    setShowAddRoomModal(true);
  };

  const triggerEditModal = (room) => {
    setSelectedRoom(room);
    setRoomForm({
      id: room.id,
      type: room.type,
      floor: room.floor,
      price: room.price,
      maxGuests: room.maxGuests,
      photo: room.photo || "",
      status: room.status,
    });
    setShowEditRoomModal(true);
  };

  const localSubmitCreate = async (e) => {
    e.preventDefault();
    if (!roomForm.id) {
      alert("Vui lòng điền mã phòng.");
      return;
    }
    const success = await handleCreateRoom(roomForm);
    if (success) {
      setShowAddRoomModal(false);
    }
  };

  const localSubmitUpdate = async (e) => {
    e.preventDefault();
    const success = await handleUpdateRoom(selectedRoom.roomId, roomForm);
    if (success) {
      setShowEditRoomModal(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <SectionHeader
        title="Quản Lý Phòng & Loại Phòng Resort"
        description="Cập nhật giá bán, sửa thông tin loại phòng: Standard, Deluxe, Villa, VIP hoặc tải ảnh phòng."
      >
        <Button
          onClick={triggerAddModal}
          variant="primary"
          className="flex items-center space-x-1.5 w-full sm:w-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Thêm Phòng Mới</span>
        </Button>
      </SectionHeader>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary-50 text-primary-900 rounded-xl">
            <Bed className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider">Tổng số phòng</p>
            <p className="text-2xl font-bold text-sage-900">{rooms.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider">Phòng trống</p>
            <p className="text-2xl font-bold text-green-600">
              {rooms.filter((r) => r.status === "vacant").length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider">Có khách</p>
            <p className="text-2xl font-bold text-blue-600">
              {rooms.filter((r) => r.status === "occupied").length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider">Bảo trì / Dọn dẹp</p>
            <p className="text-2xl font-bold text-amber-600">
              {rooms.filter((r) => r.status === "cleaning" || r.status === "maintenance").length}
            </p>
          </div>
        </div>
      </div>

      <RoomTable
        rooms={rooms}
        triggerEditModal={triggerEditModal}
        handleDeleteRoom={handleDeleteRoom}
      />

      {/* Add Room Modal */}
      <RoomModalForm
        isOpen={showAddRoomModal}
        onClose={() => setShowAddRoomModal(false)}
        title="Thêm Phòng Nghỉ Mới"
        formState={roomForm}
        setFormState={setRoomForm}
        onSubmit={localSubmitCreate}
        isEdit={false}
      />

      {/* Edit Room Modal */}
      <RoomModalForm
        isOpen={showEditRoomModal}
        onClose={() => setShowEditRoomModal(false)}
        title={`Chỉnh Sửa Phòng Nghỉ: ${selectedRoom?.id}`}
        formState={roomForm}
        setFormState={setRoomForm}
        onSubmit={localSubmitUpdate}
        isEdit={true}
      />
    </div>
  );
}
