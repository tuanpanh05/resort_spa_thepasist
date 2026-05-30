import React, { useState } from "react";
import { PlusCircle, X } from "lucide-react";

export default function ManageServices({ services, setServices }) {
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    price: "",
    type: "Spa",
    enabled: true,
  });

  const triggerAddModal = () => {
    setServiceForm({ name: "", price: "", type: "Spa", enabled: true });
    setShowAddServiceModal(true);
  };

  const triggerEditModal = (s) => {
    setSelectedService(s);
    setServiceForm({
      name: s.name,
      price: s.price,
      type: s.type,
      enabled: s.enabled,
    });
    setShowEditServiceModal(true);
  };

  const localSubmitCreate = (e) => {
    e.preventDefault();
    if (!serviceForm.name || !serviceForm.price) {
      alert("Vui lòng nhập tên dịch vụ và đơn giá.");
      return;
    }
    const newService = {
      id: `SRV-${Math.floor(100 + Math.random() * 900)}`,
      ...serviceForm,
    };
    setServices((prev) => [...prev, newService]);
    setShowAddServiceModal(false);
    alert(`Dịch vụ "${serviceForm.name}" đã được tạo thành công.`);
  };

  const localSubmitUpdate = (e) => {
    e.preventDefault();
    setServices((prev) =>
      prev.map((s) =>
        s.id === selectedService.id ? { ...s, ...serviceForm } : s,
      ),
    );
    setShowEditServiceModal(false);
    alert("Thông tin dịch vụ đã được cập nhật.");
  };

  const handleToggleServiceEnabled = (id) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return { ...s, enabled: !s.enabled };
        }
        return s;
      }),
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="bg-white border border-primary-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-normal text-sage-950">
            Quản Lý Toàn Bộ Dịch Vụ Resort
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Thêm danh mục dịch vụ mới, cập nhật giá bán hoặc tạm ngưng các dịch
            vụ (Spa, Restaurant, Laundry, Transport, Tour).
          </p>
        </div>
        <button
          onClick={triggerAddModal}
          className="px-5 py-2.5 bg-primary-800 hover:bg-primary-900 text-white rounded-none text-xs font-semibold tracking-wider flex items-center space-x-1.5 cursor-pointer shadow-sm uppercase"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Thêm Dịch Vụ Mới</span>
        </button>
      </div>

      <div className="bg-white border border-primary-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-primary-50/50 text-sage-600 font-bold border-b border-primary-100">
                <th className="p-4">Mã DV</th>
                <th className="p-4">Tên Dịch Vụ</th>
                <th className="p-4">Phân Loại</th>
                <th className="p-4">Đơn Giá Cấu Hình</th>
                <th className="p-4">Trạng Thái Kinh Doanh</th>
                <th className="p-4 text-center">Tác Vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50/50">
              {services.map((s) => (
                <tr
                  key={s.id}
                  className={`hover:bg-primary-50/10 ${!s.enabled && "opacity-60 bg-sage-50/20"}`}
                >
                  <td className="p-4 font-bold text-primary-950">{s.id}</td>
                  <td className="p-4 font-semibold text-sage-900">{s.name}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-primary-100 text-primary-900">
                      {s.type}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-sage-950">{s.price}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-none text-[10px] font-semibold uppercase tracking-wider ${s.enabled ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"}`}
                    >
                      {s.enabled ? "Hoạt động" : "Tạm ngưng"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => triggerEditModal(s)}
                        className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-950 rounded-none text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
                      >
                        Sửa giá
                      </button>
                      <button
                        onClick={() => handleToggleServiceEnabled(s.id)}
                        className={`px-3 py-1.5 rounded-none text-[10px] font-semibold uppercase tracking-wider cursor-pointer ${s.enabled ? "bg-yellow-50 text-yellow-800 hover:bg-yellow-100" : "bg-green-50 text-green-800 hover:bg-green-100"}`}
                      >
                        {s.enabled ? "Tắt" : "Bật"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-primary-50 pb-3">
              <h3 className="font-serif text-lg font-normal text-sage-950">
                Khởi Tạo Dịch Vụ Mới
              </h3>
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="text-sage-400 hover:text-sage-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={localSubmitCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Tên Dịch Vụ
                </label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, name: e.target.value })
                  }
                  placeholder="VD: Tour chèo thuyền Kaya, Trị liệu đá nóng"
                  className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Loại Dịch Vụ
                  </label>
                  <select
                    value={serviceForm.type}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, type: e.target.value })
                    }
                    className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
                  >
                    <option value="Spa">Spa trị liệu</option>
                    <option value="Restaurant">Nhà hàng / Ẩm thực</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Therapy">Vật lý trị liệu</option>
                    <option value="Laundry">Dịch vụ giặt là</option>
                    <option value="Tour">Dịch vụ Tour du lịch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Đơn Giá Cấu Hình
                  </label>
                  <input
                    type="text"
                    value={serviceForm.price}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, price: e.target.value })
                    }
                    placeholder="VD: 450,000đ"
                    className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-4 py-2 border border-primary-100 text-xs font-semibold uppercase tracking-wider hover:bg-primary-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-900 cursor-pointer"
                >
                  Tạo mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditServiceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-primary-50 pb-3">
              <h3 className="font-serif text-lg font-normal text-sage-950">
                Sửa Đơn Giá Dịch Vụ
              </h3>
              <button
                onClick={() => setShowEditServiceModal(false)}
                className="text-sage-400 hover:text-sage-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={localSubmitUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Tên Dịch Vụ
                </label>
                <input
                  type="text"
                  value={serviceForm.name}
                  disabled
                  className="w-full p-2.5 border border-primary-100 text-xs bg-sage-50 text-sage-400 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Loại Dịch Vụ
                  </label>
                  <input
                    type="text"
                    value={serviceForm.type}
                    disabled
                    className="w-full p-2.5 border border-primary-100 text-xs bg-sage-50 text-sage-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Đơn Giá Mới
                  </label>
                  <input
                    type="text"
                    value={serviceForm.price}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, price: e.target.value })
                    }
                    className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50">
                <button
                  type="button"
                  onClick={() => setShowEditServiceModal(false)}
                  className="px-4 py-2 border border-primary-100 text-xs font-semibold uppercase tracking-wider hover:bg-primary-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-900 cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
