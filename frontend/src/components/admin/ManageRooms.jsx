import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import Button from "../ui/Button";
import RoomTable from "./RoomTable";
import { RoomModalForm } from "./ModalForm";

export default function ManageRooms({ rooms, setRooms, handleDeleteRoom }) {
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
    });
    setShowEditRoomModal(true);
  };

  const localSubmitCreate = (e) => {
    e.preventDefault();
    if (!roomForm.id || !roomForm.price) {
      alert("Vui lòng điền mã phòng và giá phòng.");
      return;
    }
    const exists = rooms.some((r) => r.id === roomForm.id);
    if (exists) {
      alert("Mã phòng này đã tồn tại trên hệ thống!");
      return;
    }
    const newRoom = {
      ...roomForm,
      floor: parseInt(roomForm.floor),
      status: "vacant",
    };
    setRooms((prev) => [...prev, newRoom]);
    setShowAddRoomModal(false);
    alert(`Phòng ${roomForm.id} đã được khởi tạo thành công.`);
  };

  const localSubmitUpdate = (e) => {
    e.preventDefault();
    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoom.id
          ? { ...r, ...roomForm, floor: parseInt(roomForm.floor) }
          : r,
      ),
    );
    setShowEditRoomModal(false);
    alert("Thông tin phòng nghỉ đã được cập nhật.");
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
