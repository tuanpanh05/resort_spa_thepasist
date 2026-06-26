import React, { useState } from "react";
import { PlusCircle, X, AlertTriangle } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import DishFormModal from "./DishFormModal";
import Button from "../ui/Button";
import Card from "../ui/Card";
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
    periods: ["Lunch"],
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
      periods: ["Lunch"],
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
    const VALID_TAGS = ["Omnivore", "Pescatarian", "Vegetarian", "Vegan", "Keto", "Halal"];
    const sanitizedTags = dish.dietaryTags 
      ? dish.dietaryTags.split(',').map(t => t.trim()).filter(t => VALID_TAGS.includes(t)).join(', ')
      : "";

    setForm({
      name: dish.name,
      price: dish.price,
      category: dish.category || "Món chính",
      description: dish.description,
      ingredients: dish.ingredients,
      allergens: dish.allergens.join(", "),
      periods: (dish.periods && dish.periods.length > 0) ? dish.periods : ["Lunch"],
      isTodayMenu: dish.isTodayMenu,
      availableDays: dish.availableDays || "0,1,2,3,4,5,6",
      isPackageIncluded: dish.isPackageIncluded !== false,
      image: dish.image || "",
      dietaryTags: sanitizedTags,
    });
    setShowEditDishModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!dishForm.name || !dishForm.price) {
      alert("Vui lòng điền đầy đủ tên và giá món ăn.");
      return;
    }

    const VALID_TAGS = ["Omnivore", "Pescatarian", "Vegetarian", "Vegan", "Keto", "Halal"];
    const sanitizedTags = dishForm.dietaryTags 
      ? dishForm.dietaryTags.split(',').map(t => t.trim()).filter(t => VALID_TAGS.includes(t)).join(', ')
      : "";

    const payload = {
      name: dishForm.name,
      price: dishForm.price,
      category: dishForm.category,
      description: dishForm.description,
      ingredients: dishForm.ingredients,
      allergens: dishForm.allergens ? dishForm.allergens.split(",").map((s) => s.trim()) : [],
      isTodayMenu: dishForm.isTodayMenu,
      availableDays: dishForm.availableDays,
      periods: dishForm.periods.join(","),
      image: dishForm.image,
      dietaryTags: sanitizedTags,
      isPackageIncluded: dishForm.isPackageIncluded,
      enabled: true
    };

    try {
      const res = await axiosClient.post("/chef/menu", payload);
      if (res.data.success) {
        const savedDish = res.data.dish;
        const newDish = {
          id: `DSH-${String(savedDish.foodId).padStart(2, '0')}`,
          foodId: savedDish.foodId,
          name: savedDish.dishName,
          price: savedDish.price,
          category: dishForm.category,
          dietaryTags: savedDish.dietaryTags || dishForm.dietaryTags,
          description: savedDish.description,
          ingredients: savedDish.ingredients || "Thành phần dinh dưỡng tự nhiên",
          allergens: dishForm.allergens ? dishForm.allergens.split(",").map((s) => s.trim()) : [],
          isTodayMenu: savedDish.isTodayMenu,
          availableDays: savedDish.availableDays || dishForm.availableDays,
          image: savedDish.imageUrl || "",
          isPackageIncluded: savedDish.isPackageIncluded !== false,
          periods: savedDish.periods ? savedDish.periods.split(",").map(s => s.trim()) : dishForm.periods,
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
    const VALID_TAGS = ["Omnivore", "Pescatarian", "Vegetarian", "Vegan", "Keto", "Halal"];
    const sanitizedTags = dishForm.dietaryTags 
      ? dishForm.dietaryTags.split(',').map(t => t.trim()).filter(t => VALID_TAGS.includes(t)).join(', ')
      : "";

    const payload = {
      name: dishForm.name,
      price: dishForm.price,
      category: dishForm.category,
      description: dishForm.description,
      ingredients: dishForm.ingredients,
      allergens: dishForm.allergens ? dishForm.allergens.split(",").map((s) => s.trim()) : [],
      isTodayMenu: dishForm.isTodayMenu,
      availableDays: dishForm.availableDays,
      periods: dishForm.periods.join(","),
      image: dishForm.image,
      dietaryTags: sanitizedTags,
      isPackageIncluded: dishForm.isPackageIncluded,
      enabled: selectedDish.enabled
    };

    try {
      const res = await axiosClient.put(`/chef/menu/${foodId}`, payload);
      if (res.data.success) {
        const savedDish = res.data.dish;
        setDishes((prev) =>
          prev.map((d) =>
            d.id === selectedDish.id
              ? {
                ...d,
                name: savedDish.dishName,
                price: savedDish.price,
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
      <Card className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="card-title text-primary-950">
            Cơ Sở Dữ Liệu Danh Mục Món Ăn
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Lưu trữ toàn bộ công thức, giá cả, thành phần nguyên liệu và danh
            mục dị ứng của món ăn resort.
          </p>
        </div>
        <Button
          onClick={triggerAddModal}
          variant="primary"
          className="px-4 py-2.5 flex items-center space-x-1.5 shadow-sm"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Thêm Món Ăn Mới</span>
        </Button>
      </Card>

      {/* Dishes Grid View */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-8">
        {dishes.map((dish) => (
          <div 
            key={dish.id} 
            className={`group flex flex-col sm:flex-row bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgba(26,47,35,0.08)] transition-all duration-300 border ${
              dish.enabled ? 'border-[#cda250]/20 hover:border-[#cda250]/50' : 'border-sage-200/50 opacity-80'
            }`}
          >
            {/* Image Area */}
            <div className="relative sm:w-48 h-48 sm:h-auto shrink-0 overflow-hidden bg-[#fbfaf7]">
              <img 
                src={dish.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                alt={dish.name} 
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!dish.enabled ? 'grayscale-[50%]' : ''}`} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-90"></div>
              
              <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1.5 pr-20">
                {dish.dietaryTags && dish.dietaryTags.split(',').map((tag, idx) => {
                  const t = tag.trim();
                  if (!t) return null;
                  return (
                    <span key={idx} className="bg-white/95 backdrop-blur text-[9px] font-bold px-2 py-0.5 rounded-full text-[#1a2f23] shadow-sm uppercase tracking-wider">
                      {t}
                    </span>
                  );
                })}
              </div>
              
              <div className="absolute top-3 right-3">
                <span className={`flex items-center px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider text-white shadow-sm ${
                  dish.enabled ? 'bg-green-600/90' : 'bg-sage-600/90'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dish.enabled ? 'bg-white' : 'bg-sage-200'}`}></span>
                  {dish.enabled ? "Phục Vụ" : "Tạm Khóa"}
                </span>
              </div>

              <div className="absolute bottom-3 left-3">
                <div className="text-[10px] text-white/90 font-mono font-bold uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                  {dish.id} • {dish.category}
                </div>
              </div>
            </div>
            
            {/* Details Area */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col relative bg-white min-w-0">
              <div className="flex justify-between items-start mb-2 gap-3">
                <h4 className="flex-1 min-w-0 text-lg font-serif font-bold text-[#1a2f23] leading-tight group-hover:text-[#cda250] transition-colors line-clamp-2">
                  {dish.name}
                </h4>
                <div className="shrink-0 text-sm sm:text-[15px] font-bold text-[#cda250] font-mono bg-[#cda250]/10 px-2.5 py-1 rounded-lg">
                  {new Intl.NumberFormat("vi-VN").format(dish.price)}đ
                </div>
              </div>
              
              <p className="text-xs text-sage-600 line-clamp-2 mb-4 leading-relaxed font-light">
                {dish.description || "Chưa có mô tả chi tiết cho món ăn này."}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <div className="text-[9px] text-sage-400 font-bold uppercase tracking-widest mb-1.5 border-b border-sage-100 pb-1">Bữa ăn</div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {dish.periods && dish.periods.map(p => (
                      <span key={p} className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                        p === "Breakfast" ? "bg-amber-50 text-amber-700 border border-amber-200/50" :
                        p === "Lunch" ? "bg-blue-50 text-blue-700 border border-blue-200/50" :
                        "bg-indigo-50 text-indigo-700 border border-indigo-200/50"
                      }`}>
                        {p === "Breakfast" ? "Sáng" : p === "Lunch" ? "Trưa" : "Tối"}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-sage-400 font-bold uppercase tracking-widest mb-1.5 border-b border-sage-100 pb-1">Dị ứng</div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {dish.allergens && dish.allergens.length > 0 ? (
                      dish.allergens.map((alg, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-100 text-[9px] font-bold flex items-center tracking-wide">
                          <AlertTriangle className="w-2.5 h-2.5 mr-1" /> {alg}
                        </span>
                      ))
                    ) : (
                      <span className="text-sage-400 italic text-[10px] mt-0.5 font-medium flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"></span> An toàn
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Actions & Footer */}
              <div className="pt-4 border-t border-sage-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-auto">
                <div className="flex-1 min-w-0 text-[10px] text-sage-500 font-light truncate w-full" title={dish.ingredients}>
                   <span className="font-semibold text-sage-600">Nguyên liệu:</span> {dish.ingredients || "Tự nhiên"}
                </div>
                <div className="flex items-center space-x-1.5 shrink-0 w-full sm:w-auto justify-end">
                  <Button onClick={() => triggerEditModal(dish)} variant="outline" className="px-2.5 sm:px-3 py-1.5 text-[10px] rounded-lg border-sage-300 hover:bg-sage-50">Sửa</Button>
                  <Button onClick={() => handleDeleteDish(dish.id)} variant="danger-light" className="px-2.5 sm:px-3 py-1.5 text-[10px] rounded-lg">Xóa</Button>
                  <Button onClick={() => handleToggleEnabled(dish.id)} variant={dish.enabled ? "warning" : "secondary"} className={`px-2.5 sm:px-3 py-1.5 text-[10px] rounded-lg ${dish.enabled ? '' : 'bg-sage-800 text-white hover:bg-sage-900'}`}>
                    {dish.enabled ? "Tắt" : "Bật"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
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
