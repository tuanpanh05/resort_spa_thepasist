import React from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

// 1. Room Modal Form
export function RoomModalForm({
  isOpen,
  onClose,
  title,
  formState,
  setFormState,
  onSubmit,
  isEdit = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={onSubmit} className="space-y-4 text-left">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
              Số/Mã Phòng
            </label>
            <input
              type="text"
              value={formState.id}
              onChange={(e) =>
                setFormState({ ...formState, id: e.target.value })
              }
              disabled={isEdit}
              placeholder="VD: 101, V02"
              className={`w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 ${isEdit ? "bg-sage-50 text-sage-405 cursor-not-allowed" : "bg-white"}`}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
              Tầng
            </label>
            <input
              type="number"
              value={formState.floor}
              onChange={(e) =>
                setFormState({ ...formState, floor: e.target.value })
              }
              min="1"
              className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
            Hạng Phòng
          </label>
          <select
            value={formState.type}
            onChange={(e) =>
              setFormState({ ...formState, type: e.target.value })
            }
            className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
          >
            <option value="Standard">Standard Garden View</option>
            <option value="Deluxe">Deluxe Ocean View</option>
            <option value="Villa">Private Pool Villa</option>
            <option value="VIP">Ngũ Sơn Penthouse Suite</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
              Giá Phòng (mỗi đêm)
            </label>
            <input
              type="text"
              value={formState.price}
              onChange={(e) =>
                setFormState({ ...formState, price: e.target.value })
              }
              placeholder="VD: 1,800,000đ"
              className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
              Số Khách Tối Đa
            </label>
            <input
              type="number"
              value={formState.maxGuests}
              onChange={(e) =>
                setFormState({ ...formState, maxGuests: e.target.value })
              }
              min="1"
              className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
            Ảnh mô phỏng (Tên tệp)
          </label>
          <input
            type="text"
            value={formState.photo}
            onChange={(e) =>
              setFormState({ ...formState, photo: e.target.value })
            }
            placeholder="VD: room_deluxe.jpg"
            className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary">
            {isEdit ? "Lưu thay đổi" : "Tạo mới"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// 2. Account Modal Form
export function AccountModalForm({
  isOpen,
  onClose,
  title,
  formState,
  setFormState,
  onSubmit,
  isEdit = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={onSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
            Họ và tên
          </label>
          <input
            type="text"
            value={formState.name}
            onChange={(e) =>
              setFormState({ ...formState, name: e.target.value })
            }
            className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
            Địa chỉ Email
          </label>
          <input
            type="email"
            value={formState.email}
            onChange={(e) =>
              setFormState({ ...formState, email: e.target.value })
            }
            className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
            Số điện thoại liên lạc
          </label>
          <input
            type="tel"
            value={formState.phone}
            onChange={(e) =>
              setFormState({ ...formState, phone: e.target.value })
            }
            className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
              Chức vụ (Role)
            </label>
            <select
              value={formState.role}
              onChange={(e) =>
                setFormState({ ...formState, role: e.target.value })
              }
              className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
            >
              <option value="Staff">Staff (Lễ tân/Phục vụ)</option>
              <option value="Chef">Chef (Bếp trưởng)</option>
              <option value="Spa">Spa Specialist</option>
              <option value="Yoga">Yoga Trainer</option>
              <option value="Physio">Physiotherapist</option>
              <option value="Manager">Resort Manager</option>
              <option value="Admin">System Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
              Trực thuộc bộ phận
            </label>
            <input
              type="text"
              value={formState.department}
              onChange={(e) =>
                setFormState({ ...formState, department: e.target.value })
              }
              placeholder="Lễ tân, Trị liệu..."
              className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary">
            {isEdit ? "Lưu thay đổi" : "Tạo mới"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// 3. Inventory Modal Form
export function InventoryModalForm({
  isOpen,
  onClose,
  title,
  formState,
  setFormState,
  onSubmit,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={onSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
            Tên Hàng Hóa / Vật Tư
          </label>
          <input
            type="text"
            value={formState.name}
            onChange={(e) =>
              setFormState({ ...formState, name: e.target.value })
            }
            placeholder="VD: Kem massage oải hương"
            className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
              Chuyên Mục
            </label>
            <select
              value={formState.category}
              onChange={(e) =>
                setFormState({ ...formState, category: e.target.value })
              }
              className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
            >
              <option value="Spa trị liệu">Spa & Mỹ phẩm</option>
              <option value="Bếp ăn nhà hàng">Bếp ăn & Thực phẩm</option>
              <option value="Buồng phòng">Buồng phòng & Vải vóc</option>
              <option value="Thiết bị kỹ thuật">Thiết bị & Kỹ thuật</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
              Đơn vị tính
            </label>
            <select
              value={formState.unit}
              onChange={(e) =>
                setFormState({ ...formState, unit: e.target.value })
              }
              className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
            >
              <option value="Lít">Lít (l)</option>
              <option value="Kg">Kilôgam (kg)</option>
              <option value="Cái">Cái / Chiếc</option>
              <option value="Chai">Chai / Hộp</option>
              <option value="Mét">Mét (m)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
              Số Lượng Tồn Nhập
            </label>
            <input
              type="number"
              value={formState.stock}
              onChange={(e) =>
                setFormState({ ...formState, stock: e.target.value })
              }
              min="0"
              placeholder="VD: 50"
              className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
              Mức Cảnh Báo Tối Thiểu
            </label>
            <input
              type="number"
              value={formState.minQty}
              onChange={(e) =>
                setFormState({ ...formState, minQty: e.target.value })
              }
              min="0"
              placeholder="VD: 10"
              className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary">
            Tạo mã
          </Button>
        </div>
      </form>
    </Modal>
  );
}
