import React, { useState } from "react";
import { PlusCircle, X } from "lucide-react";

export default function ManageServices({ services, setServices, rooms }) {
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [serviceOrderForm, setServiceOrderForm] = useState({
    room: "101",
    category: "Spa booking",
    detail: "",
    price: "",
  });

  const triggerAddModal = () => {
    setServiceOrderForm({
      room: rooms[0]?.id || "101",
      category: "Spa booking",
      detail: "",
      price: "",
    });
    setShowAddServiceModal(true);
  };

  const handleCreateServiceOrder = (e) => {
    e.preventDefault();
    if (!serviceOrderForm.detail || !serviceOrderForm.price) {
      alert("Vui lòng điền mô tả dịch vụ và đơn giá.");
      return;
    }
    const newOrder = {
      id: `SO-${Math.floor(100 + Math.random() * 900)}`,
      ...serviceOrderForm,
      status: "Pending",
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setServices((prev) => [newOrder, ...prev]);
    setShowAddServiceModal(false);
    setServiceOrderForm({
      room: rooms[0]?.id || "101",
      category: "Spa booking",
      detail: "",
      price: "",
    });
    alert(
      `Đã khởi tạo yêu cầu dịch vụ ${newOrder.id} cho phòng ${newOrder.room}.`,
    );
  };

  const handleUpdateServiceStatus = (id, newStatus) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)),
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="bg-white border border-primary-100 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-normal text-sage-950">
            Xử Lý Dịch Vụ Phát Sinh
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Ghi nhận order ăn uống tại phòng (Room Service), giặt là hoặc đặt
            lịch trị liệu spa theo nhu cầu của khách hàng.
          </p>
        </div>
        <button
          onClick={triggerAddModal}
          className="px-5 py-2.5 bg-primary-800 hover:bg-primary-900 text-white rounded-none text-xs font-semibold tracking-wider flex items-center space-x-1.5 cursor-pointer shadow-sm uppercase"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Ghi nhận order mới</span>
        </button>
      </div>

      <div className="bg-white border border-primary-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-primary-50/50 text-sage-600 font-bold border-b border-primary-100">
                <th className="p-4">Mã số order</th>
                <th className="p-4">Số Phòng</th>
                <th className="p-4">Phân Loại Dịch Vụ</th>
                <th className="p-4">Chi Tiết Cụ Thể</th>
                <th className="p-4">Thời gian</th>
                <th className="p-4">Đơn giá thu</th>
                <th className="p-4">Trạng thái xử lý</th>
                <th className="p-4 text-center">Tiến độ thực hiện</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50/50">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-primary-50/10">
                  <td className="p-4 font-bold text-primary-950">{s.id}</td>
                  <td className="p-4 font-bold text-sage-950">
                    Phòng {s.room}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-primary-100 text-primary-900 uppercase">
                      {s.category}
                    </span>
                  </td>
                  <td className="p-4 text-sage-700 max-w-xs">{s.detail}</td>
                  <td className="p-4 text-sage-500 font-mono">{s.time}</td>
                  <td className="p-4 font-bold text-sage-950">{s.price}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-none text-[10px] font-semibold uppercase tracking-wider ${
                        s.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : s.status === "In Progress"
                            ? "bg-yellow-50 text-yellow-800"
                            : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {s.status === "Completed"
                        ? "Hoàn thành"
                        : s.status === "In Progress"
                          ? "Đang làm"
                          : "Đang chờ"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      {s.status === "Pending" && (
                        <button
                          onClick={() =>
                            handleUpdateServiceStatus(s.id, "In Progress")
                          }
                          className="px-2.5 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 rounded-none text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
                        >
                          Thực hiện
                        </button>
                      )}
                      {s.status === "In Progress" && (
                        <button
                          onClick={() =>
                            handleUpdateServiceStatus(s.id, "Completed")
                          }
                          className="px-2.5 py-1.5 bg-primary-850 hover:bg-primary-900 text-white rounded-none text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
                        >
                          Hoàn tất
                        </button>
                      )}
                      {s.status === "Completed" && (
                        <span className="text-[11px] text-sage-400 italic">
                          Đã giao khách
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Service Order Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-primary-50 pb-3">
              <h3 className="font-serif text-lg font-normal text-sage-950">
                Ghi Nhận Yêu Cầu Dịch Vụ Phát Sinh
              </h3>
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="text-sage-400 hover:text-sage-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateServiceOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Số Phòng
                  </label>
                  <select
                    value={serviceOrderForm.room}
                    onChange={(e) =>
                      setServiceOrderForm({
                        ...serviceOrderForm,
                        room: e.target.value,
                      })
                    }
                    className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
                  >
                    {rooms
                      .filter((r) => r.status === "occupied")
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          Phòng {r.id}
                        </option>
                      ))}
                    {rooms.filter((r) => r.status === "occupied").length ===
                      0 &&
                      rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          Phòng {r.id}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Phân Loại Dịch Vụ
                  </label>
                  <select
                    value={serviceOrderForm.category}
                    onChange={(e) =>
                      setServiceOrderForm({
                        ...serviceOrderForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
                  >
                    <option value="Spa booking">Spa & Trị liệu</option>
                    <option value="Room service">Room Service (Ăn uống)</option>
                    <option value="Laundry service">Giặt là quần áo</option>
                    <option value="Minibar">Sử dụng Minibar</option>
                    <option value="Transport/Tour">
                      Thuê xe / Tour du lịch
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Chi tiết mô tả yêu cầu
                </label>
                <input
                  type="text"
                  value={serviceOrderForm.detail}
                  onChange={(e) =>
                    setServiceOrderForm({
                      ...serviceOrderForm,
                      detail: e.target.value,
                    })
                  }
                  placeholder="VD: 1 Cơm chiên hải sản, 2 lon Coca-cola..."
                  className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Giá Tiền Thanh Toán (đơn vị: đ)
                </label>
                <input
                  type="text"
                  value={serviceOrderForm.price}
                  onChange={(e) =>
                    setServiceOrderForm({
                      ...serviceOrderForm,
                      price: e.target.value,
                    })
                  }
                  placeholder="VD: 350,000đ"
                  className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200"
                  required
                />
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
                  Tạo Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
