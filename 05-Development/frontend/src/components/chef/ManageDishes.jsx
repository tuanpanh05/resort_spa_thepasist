import React, { useState } from "react";
import { PlusCircle, X, AlertTriangle } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import DishFormModal from "./DishFormModal";

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
    availableDays: "0,1,2,3,4,5,6",
    isPackageIncluded: true,
    image: "",
    dietaryTags: "",
  });

  const handleToggleEnabled = async (id) => {
    const targetDish = dishes.find((d) => d.id === id);
    if (!targetDish) return;
    const foodId = targetDish.foodId;
    try {
      await axiosClient.put(`/chef/menu/${foodId}/toggle-enabled`);
      setDishes((prev) =>
        prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d)),
      );
    } catch (err) {
      console.error("Failed to toggle enabled", err);
      alert("Lỗi khi thay đổi trạng thái phục vụ món ăn.");
    }
  };

  const handleDeleteDish = async (id) => {
    const targetDish = dishes.find((d) => d.id === id);
    if (!targetDish) return;
    const foodId = targetDish.foodId;

    if (
      window.confirm("Bạn có chắc chắn muốn xóa món này ra khỏi cơ sở dữ liệu?")
    ) {
      try {
        await axiosClient.delete(`/chef/menu/${foodId}`);
        setDishes((prev) => prev.filter((d) => d.id !== id));
        alert("Đã xóa món ăn khỏi cơ sở dữ liệu.");
      } catch (err) {
        console.error("Failed to delete dish", err);
        alert("Lỗi khi xóa món ăn khỏi cơ sở dữ liệu (món ăn có thể đang có trong đơn đặt hàng của khách).");
      }
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
      availableDays: "0,1,2,3,4,5,6",
      isPackageIncluded: true,
      image: "",
      dietaryTags: "",
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
      period: dish.period || "Lunch",
      isTodayMenu: dish.isTodayMenu,
      availableDays: dish.availableDays || "0,1,2,3,4,5,6",
      isPackageIncluded: dish.isPackageIncluded !== false,
      image: dish.image || "",
      dietaryTags: dish.dietaryTags || "",
    });
    setShowEditDishModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!dishForm.name || !dishForm.price) {
      alert("Vui lòng điền đầy đủ tên và giá món ăn.");
      return;
    }

    const payload = {
      name: dishForm.name,
      price: dishForm.price,
      category: dishForm.category,
      description: dishForm.description,
      ingredients: dishForm.ingredients,
      allergens: dishForm.allergens ? dishForm.allergens.split(",").map((s) => s.trim()) : [],
      isTodayMenu: dishForm.isTodayMenu,
      availableDays: dishForm.availableDays,
      period: dishForm.period,
      image: dishForm.image,
      dietaryTags: dishForm.dietaryTags,
      isPackageIncluded: dishForm.isPackageIncluded,
      enabled: true
    };

    try {
      const res = await axiosClient.post("/chef/menu", payload);
      if (res.data.success) {
        const savedDish = res.data.dish;
        const formatPrice = (p) => {
          return new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(p) + "đ";
        };
        const newDish = {
          id: `DSH-${String(savedDish.foodId).padStart(2, '0')}`,
          foodId: savedDish.foodId,
          name: savedDish.dishName,
          price: formatPrice(savedDish.price),
          category: dishForm.category,
          dietaryTags: savedDish.dietaryTags || dishForm.dietaryTags,
          description: savedDish.description,
          ingredients: savedDish.ingredients || "Thành phần dinh dưỡng tự nhiên",
          allergens: dishForm.allergens ? dishForm.allergens.split(",").map((s) => s.trim()) : [],
          isTodayMenu: savedDish.isTodayMenu,
          availableDays: savedDish.availableDays || dishForm.availableDays,
          image: savedDish.imageUrl || "",
          isPackageIncluded: savedDish.isPackageIncluded !== false,
          periods: savedDish.periods ? savedDish.periods.split(",").map(s => s.trim()) : [dishForm.period],
          soldOut: savedDish.soldOut,
          enabled: savedDish.enabled
        };
        setDishes((prev) => [...prev, newDish]);
        setShowAddDishModal(false);
        alert(`Món ăn "${dishForm.name}" đã được lưu vào cơ sở dữ liệu.`);
      }
    } catch (err) {
      console.error("Failed to add dish", err);
      alert("Lỗi khi lưu món ăn vào cơ sở dữ liệu.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const foodId = selectedDish.foodId;
    const payload = {
      name: dishForm.name,
      price: dishForm.price,
      category: dishForm.category,
      description: dishForm.description,
      ingredients: dishForm.ingredients,
      allergens: dishForm.allergens ? dishForm.allergens.split(",").map((s) => s.trim()) : [],
      isTodayMenu: dishForm.isTodayMenu,
      availableDays: dishForm.availableDays,
      period: dishForm.period,
      image: dishForm.image,
      dietaryTags: dishForm.dietaryTags,
      isPackageIncluded: dishForm.isPackageIncluded,
      enabled: selectedDish.enabled
    };

    try {
      const res = await axiosClient.put(`/chef/menu/${foodId}`, payload);
      if (res.data.success) {
        const savedDish = res.data.dish;
        const formatPrice = (p) => {
          return new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(p) + "đ";
        };
        setDishes((prev) =>
          prev.map((d) =>
            d.id === selectedDish.id
              ? {
                ...d,
                name: savedDish.dishName,
                price: formatPrice(savedDish.price),
                category: dishForm.category,
                dietaryTags: savedDish.dietaryTags || dishForm.dietaryTags,
                description: savedDish.description,
                ingredients: savedDish.ingredients || "Thành phần dinh dưỡng tự nhiên",
                allergens: dishForm.allergens ? dishForm.allergens.split(",").map((s) => s.trim()) : [],
                isTodayMenu: savedDish.isTodayMenu,
                availableDays: savedDish.availableDays || dishForm.availableDays,
                image: savedDish.imageUrl || d.image,
                isPackageIncluded: savedDish.isPackageIncluded !== false,
                periods: savedDish.periods ? savedDish.periods.split(",").map(s => s.trim()) : d.periods,
                enabled: savedDish.enabled,
              }
              : d
          )
        );
        setShowEditDishModal(false);
        setSelectedDish(null);
        alert("Đã cập nhật thông tin món ăn vào cơ sở dữ liệu.");
      }
    } catch (err) {
      console.error("Failed to update dish", err);
      alert("Lỗi khi cập nhật món ăn vào cơ sở dữ liệu.");
    }
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
                <th className="p-4">Hình ảnh</th>
                <th className="p-4">Tên Món Ăn</th>
                <th className="p-4">Phân loại</th>
                <th className="p-4">Chế độ ăn</th>
                <th className="p-4">Giá tiền</th>
                <th className="p-4">Lịch phục vụ</th>
                <th className="p-4">Bữa ăn</th>
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
                    <img 
                      src={dish.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                      alt={dish.name} 
                      className="w-12 h-12 rounded object-cover border border-sage-200" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
                      }}
                    />
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
                  <td className="p-4 text-[10px] font-medium text-sage-600">
                    {dish.dietaryTags}
                  </td>
                  <td className="p-4 font-bold text-sage-900 font-mono">
                    {dish.price}
                  </td>
                  <td className="p-4 text-[10px] text-sage-700 font-bold tracking-wide uppercase">
                    {dish.availableDays === "1,3,5" 
                      ? "Chẵn (2,4,6)" 
                      : dish.availableDays === "0,2,4,6" 
                      ? "Lẻ (3,5,7,CN)" 
                      : dish.availableDays === "0,1,2,3,4,5,6" 
                      ? "Mỗi ngày" 
                      : "Tùy chỉnh"}
                  </td>
                  <td className="p-4 text-[10px] font-bold">
                    <div className="flex flex-wrap gap-1">
                      {dish.periods && dish.periods.map(p => (
                        <span key={p} className={`px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${
                          p === "Breakfast" ? "bg-amber-100 text-amber-800" :
                          p === "Lunch" ? "bg-blue-100 text-blue-800" :
                          "bg-purple-100 text-purple-800"
                        }`}>
                          {p === "Breakfast" ? "Sáng" : p === "Lunch" ? "Trưa" : "Tối"}
                        </span>
                      ))}
                    </div>
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
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${dish.enabled
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
                        className={`px-2.5 py-1.5 border text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${dish.enabled
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
      <DishFormModal
        isOpen={showAddDishModal}
        mode="add"
        dishForm={dishForm}
        setForm={setForm}
        onSubmit={handleAddSubmit}
        onClose={() => setShowAddDishModal(false)}
      />

      <DishFormModal
        isOpen={showEditDishModal && selectedDish !== null}
        mode="edit"
        dishForm={dishForm}
        setForm={setForm}
        onSubmit={handleEditSubmit}
        onClose={() => {
          setShowEditDishModal(false);
          setSelectedDish(null);
        }}
        selectedDishId={selectedDish?.id}
      />
    </div>
  );
}
