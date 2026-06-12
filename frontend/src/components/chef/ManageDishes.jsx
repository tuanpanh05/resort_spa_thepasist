import React, { useState } from "react";
import { PlusCircle, X, AlertTriangle } from "lucide-react";

export default function ManageDishes({ dishes, setDishes }) {
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [showEditDishModal, setShowEditDishModal] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);

  const [dishForm, setForm] = useState({
    name: "",
    price: "",
    category: "Món chính",
    description: "",
    ingredients: "",
    allergens: "",
    period: "Lunch",
    isTodayMenu: true,
  });

  const handleToggleEnabled = (id) => {
    setDishes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d)),
    );
  };

  const handleDeleteDish = (id) => {
    if (
      window.confirm("Bạn có chắc chắn muốn xóa món này ra khỏi cơ sở dữ liệu?")
    ) {
      setDishes((prev) => prev.filter((d) => d.id !== id));
      alert("Đã xóa món ăn.");
    }
  };

  const triggerAddModal = () => {
    setForm({
      name: "",
      price: "",
      category: "Món chính",
      description: "",
      ingredients: "",
      allergens: "",
      period: "Lunch",
      isTodayMenu: true,
    });
    setShowAddDishModal(true);
  };

  const triggerEditModal = (dish) => {
    setSelectedDish(dish);
    setForm({
      name: dish.name,
      price: dish.price,
      category: dish.category,
      description: dish.description,
      ingredients: dish.ingredients,
      allergens: dish.allergens.join(", "),
      period: dish.period,
      isTodayMenu: dish.isTodayMenu,
    });
    setShowEditDishModal(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!dishForm.name || !dishForm.price) {
      alert("Vui lòng điền đầy đủ tên và giá món ăn.");
      return;
    }
    const newDish = {
      id: `DSH-${Math.floor(10 + Math.random() * 90)}`,
      name: dishForm.name,
      price: dishForm.price.includes("đ")
        ? dishForm.price
        : `${dishForm.price}đ`,
      category: dishForm.category,
      description: dishForm.description,
      ingredients: dishForm.ingredients,
      allergens: dishForm.allergens
        ? dishForm.allergens.split(",").map((s) => s.trim())
        : [],
      isTodayMenu: dishForm.isTodayMenu,
      period: dishForm.period,
      soldOut: false,
      enabled: true,
    };
    setDishes((prev) => [...prev, newDish]);
    setShowAddDishModal(false);
    alert(`Món ăn "${dishForm.name}" đã được lưu vào cơ sở dữ liệu.`);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setDishes((prev) =>
      prev.map((d) =>
        d.id === selectedDish.id
          ? {
              ...d,
              name: dishForm.name,
              price: dishForm.price.includes("đ")
                ? dishForm.price
                : `${dishForm.price}đ`,
              category: dishForm.category,
              description: dishForm.description,
              ingredients: dishForm.ingredients,
              allergens: dishForm.allergens
                ? dishForm.allergens.split(",").map((s) => s.trim())
                : [],
              period: dishForm.period,
              isTodayMenu: dishForm.isTodayMenu,
            }
          : d,
      ),
    );
    setShowEditDishModal(false);
    setSelectedDish(null);
    alert("Đã cập nhật thông tin món ăn.");
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Table Header Controls */}
      <div className="bg-white border border-sage-200/60 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-sage-950">
            Cơ Sở Dữ Liệu Danh Mục Món Ăn
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Lưu trữ toàn bộ công thức, giá cả, thành phần nguyên liệu và danh
            mục dị ứng của món ăn resort.
          </p>
        </div>
        <button
          onClick={triggerAddModal}
          className="px-4 py-2.5 bg-sage-950 hover:bg-sage-800 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer shadow-sm"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Thêm Món Ăn Mới</span>
        </button>
      </div>

      {/* Dishes Table */}
      <div className="bg-white border border-sage-200/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-sage-50/50 text-sage-600 font-bold border-b border-sage-200/50">
                <th className="p-4">Mã Món</th>
                <th className="p-4">Tên Món Ăn</th>
                <th className="p-4">Phân loại</th>
                <th className="p-4">Giá tiền</th>
                <th className="p-4">Thành phần nguyên liệu</th>
                <th className="p-4">Chứa chất dị ứng</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-center">Tác vụ bếp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {dishes.map((dish) => (
                <tr key={dish.id} className="hover:bg-sage-50/30">
                  <td className="p-4 font-mono font-bold text-sage-500">
                    {dish.id}
                  </td>
                  <td className="p-4">
                    <div>
                      <span className="font-bold text-sage-950 block">
                        {dish.name}
                      </span>
                      <span className="text-[10px] text-sage-400 font-light block line-clamp-1 mt-0.5">
                        {dish.description}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-sage-700">
                    {dish.category}
                  </td>
                  <td className="p-4 font-bold text-sage-900 font-mono">
                    {dish.price}
                  </td>
                  <td
                    className="p-4 text-sage-600 font-light max-w-xs truncate"
                    title={dish.ingredients}
                  >
                    {dish.ingredients}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {dish.allergens.length > 0 ? (
                        dish.allergens.map((alg, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100/55 text-[9px] font-bold"
                          >
                            {alg}
                          </span>
                        ))
                      ) : (
                        <span className="text-sage-400 italic text-[10px]">
                          Không có
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        dish.enabled
                          ? "bg-green-105 text-green-700 border border-green-150"
                          : "bg-sage-100 text-sage-400"
                      }`}
                    >
                      {dish.enabled ? "Phục vụ" : "Tạm khóa"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => triggerEditModal(dish)}
                        className="px-2.5 py-1.5 bg-sage-50 hover:bg-sage-100 border border-sage-200 text-sage-800 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteDish(dish.id)}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-150 text-red-750 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Xóa
                      </button>
                      <button
                        onClick={() => handleToggleEnabled(dish.id)}
                        className={`px-2.5 py-1.5 border text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                          dish.enabled
                            ? "bg-amber-50 text-amber-800 border-amber-205 hover:bg-amber-100"
                            : "bg-green-50 text-green-800 border-green-155 hover:bg-green-100"
                        }`}
                      >
                        {dish.enabled ? "Tắt" : "Bật"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dish Modal */}
      {showAddDishModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-lg w-full p-6 sm:p-8 border border-sage-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddDishModal(false)}
              className="absolute top-4 right-4 p-2 text-sage-400 hover:text-sage-900 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-lg font-bold text-sage-950 mb-6 flex items-center space-x-2">
              <PlusCircle className="h-5 w-5 text-sage-800" />
              <span>Thêm Món Ăn Mới Vào Thực Đơn</span>
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">
                    Tên món ăn *
                  </label>
                  <input
                    type="text"
                    value={dishForm.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Ví dụ: Súp nấm thực dưỡng"
                    className="w-full p-2.5 border border-sage-200 focus:outline-none focus:border-sage-800 bg-white text-sage-900"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">
                    Giá bán *
                  </label>
                  <input
                    type="text"
                    value={dishForm.price}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, price: e.target.value }))
                    }
                    placeholder="Ví dụ: 180,000đ"
                    className="w-full p-2.5 border border-sage-200 focus:outline-none focus:border-sage-800 bg-white text-sage-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">
                    Phân loại món
                  </label>
                  <select
                    value={dishForm.category}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full p-2.5 border border-sage-200 bg-white text-sage-900"
                  >
                    <option value="Khai vị">Khai vị</option>
                    <option value="Món chính">Món chính</option>
                    <option value="Tráng miệng">Tráng miệng</option>
                    <option value="Thức uống">Thức uống</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">
                    Bữa phục vụ
                  </label>
                  <select
                    value={dishForm.period}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, period: e.target.value }))
                    }
                    className="w-full p-2.5 border border-sage-200 bg-white text-sage-900"
                  >
                    <option value="Breakfast">Breakfast (Sáng)</option>
                    <option value="Lunch">Lunch (Trưa)</option>
                    <option value="Dinner">Dinner (Tối)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">
                    Menu hôm nay?
                  </label>
                  <select
                    value={dishForm.isTodayMenu ? "true" : "false"}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        isTodayMenu: e.target.value === "true",
                      }))
                    }
                    className="w-full p-2.5 border border-sage-200 bg-white text-[#1a2e05] font-bold"
                  >
                    <option value="true">Bật luôn hôm nay</option>
                    <option value="false">Tắt (Lưu kho)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-sage-800">
                  Mô tả chi tiết món ăn
                </label>
                <textarea
                  value={dishForm.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows="2"
                  placeholder="Mô tả công dụng thực dưỡng, hương vị..."
                  className="w-full p-2.5 border border-sage-200 bg-white text-sage-950 font-light"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-sage-800">
                  Nguyên liệu thành phần
                </label>
                <input
                  type="text"
                  value={dishForm.ingredients}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      ingredients: e.target.value,
                    }))
                  }
                  placeholder="Ví dụ: Nấm hương organic (50g), Đậu phụ..."
                  className="w-full p-2.5 border border-sage-200 bg-white text-sage-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-red-700 flex items-center space-x-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Cảnh báo chất dị ứng (phẩy ngăn cách)</span>
                </label>
                <input
                  type="text"
                  value={dishForm.allergens}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, allergens: e.target.value }))
                  }
                  placeholder="Ví dụ: Đậu phộng, Hải sản..."
                  className="w-full p-2.5 border border-red-200 focus:outline-none focus:ring-1 focus:ring-red-650 bg-white text-sage-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-sage-100">
                <button
                  type="button"
                  onClick={() => setShowAddDishModal(false)}
                  className="px-4 py-2 border border-sage-200 hover:bg-sage-50 text-sage-800 rounded-none font-bold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sage-950 text-white rounded-none font-bold hover:bg-sage-800 cursor-pointer"
                >
                  Thêm món mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Dish Modal */}
      {showEditDishModal && selectedDish && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-lg w-full p-6 sm:p-8 border border-sage-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowEditDishModal(false);
                setSelectedDish(null);
              }}
              className="absolute top-4 right-4 p-2 text-sage-400 hover:text-sage-900 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-lg font-bold text-sage-950 mb-6 flex items-center space-x-2">
              <PlusCircle className="h-5 w-5 text-sage-850" />
              <span>Chỉnh Sửa Món Ăn: {selectedDish.id}</span>
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">
                    Tên món ăn *
                  </label>
                  <input
                    type="text"
                    value={dishForm.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full p-2.5 border border-sage-200 bg-white text-sage-900 font-bold"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">
                    Giá bán *
                  </label>
                  <input
                    type="text"
                    value={dishForm.price}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, price: e.target.value }))
                    }
                    className="w-full p-2.5 border border-sage-200 bg-white text-sage-900 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">
                    Phân loại món
                  </label>
                  <select
                    value={dishForm.category}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full p-2.5 border border-sage-200 bg-white text-sage-900"
                  >
                    <option value="Khai vị">Khai vị</option>
                    <option value="Món chính">Món chính</option>
                    <option value="Tráng miệng">Tráng miệng</option>
                    <option value="Thức uống">Thức uống</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">
                    Bữa phục vụ
                  </label>
                  <select
                    value={dishForm.period}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, period: e.target.value }))
                    }
                    className="w-full p-2.5 border border-sage-200 bg-white text-sage-900"
                  >
                    <option value="Breakfast">Breakfast (Sáng)</option>
                    <option value="Lunch">Lunch (Trưa)</option>
                    <option value="Dinner">Dinner (Tối)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">
                    Menu hôm nay?
                  </label>
                  <select
                    value={dishForm.isTodayMenu ? "true" : "false"}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        isTodayMenu: e.target.value === "true",
                      }))
                    }
                    className="w-full p-2.5 border border-sage-200 bg-white text-[#1a2e05] font-bold"
                  >
                    <option value="true">Bật hôm nay</option>
                    <option value="false">Tắt hôm nay</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-sage-800">
                  Mô tả chi tiết món ăn
                </label>
                <textarea
                  value={dishForm.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows="2"
                  className="w-full p-2.5 border border-sage-200 bg-white text-sage-950 font-light"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-sage-800">
                  Nguyên liệu thành phần
                </label>
                <input
                  type="text"
                  value={dishForm.ingredients}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      ingredients: e.target.value,
                    }))
                  }
                  className="w-full p-2.5 border border-sage-200 bg-white text-sage-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-red-700 flex items-center space-x-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Cảnh báo chất dị ứng (phẩy ngăn cách)</span>
                </label>
                <input
                  type="text"
                  value={dishForm.allergens}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, allergens: e.target.value }))
                  }
                  className="w-full p-2.5 border border-red-200 focus:outline-none focus:ring-1 focus:ring-red-650 bg-white text-sage-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-sage-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditDishModal(false);
                    setSelectedDish(null);
                  }}
                  className="px-4 py-2 border border-sage-200 hover:bg-sage-50 text-sage-800 rounded-none font-bold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sage-950 text-white rounded-none font-bold hover:bg-sage-800 cursor-pointer"
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
