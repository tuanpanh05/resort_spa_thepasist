import React from "react";
import { PlusCircle, AlertTriangle } from "lucide-react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

export default function DishFormModal({
  isOpen,
  mode, // "add" or "edit"
  dishForm,
  setForm,
  onSubmit,
  onClose,
  selectedDishId, // For Edit mode title
}) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      title={
        <div className="flex items-center space-x-2">
          <PlusCircle className="h-5 w-5 text-primary-800" />
          <span>
            {mode === "add"
              ? "Thêm Món Ăn Mới Vào Thực Đơn"
              : `Chỉnh Sửa Món Ăn: ${selectedDishId}`}
          </span>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4 text-xs text-left max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-sage-800">Tên món ăn *</label>
              <input
                type="text"
                value={dishForm.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ví dụ: Súp nấm thực dưỡng"
                className={`w-full p-2.5 border border-sage-200 focus:outline-none focus:border-sage-800 bg-white text-sage-900 ${mode === "edit" ? "font-bold" : ""}`}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-sage-800">Giá bán *</label>
              <input
                type="text"
                value={dishForm.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="Ví dụ: 180,000đ"
                className={`w-full p-2.5 border border-sage-200 focus:outline-none focus:border-sage-800 bg-white text-sage-900 ${mode === "edit" ? "font-mono font-bold" : ""}`}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-sage-800">Phân loại món</label>
              <select
                value={dishForm.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full p-2.5 border border-sage-200 bg-white text-sage-900"
              >
                <option value="Khai vị">Khai vị</option>
                <option value="Món chính">Món chính</option>
                <option value="Tráng miệng">Tráng miệng</option>
                <option value="Thức uống">Thức uống</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-sage-800">Bữa phục vụ</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {[
                  { id: "Breakfast", label: "Sáng" },
                  { id: "Lunch", label: "Trưa" },
                  { id: "Dinner", label: "Tối" },
                ].map((periodOption) => {
                  const isChecked = dishForm.periods.includes(periodOption.id);
                  return (
                    <label
                      key={periodOption.id}
                      className={`flex items-center space-x-1.5 px-3 py-2 border cursor-pointer transition-colors text-xs ${
                        isChecked
                          ? "bg-sage-50 border-sage-500 text-sage-900"
                          : "bg-white border-sage-200 text-sage-600 hover:border-sage-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setForm((prev) => {
                            const newPeriods = checked
                              ? [...prev.periods, periodOption.id]
                              : prev.periods.filter((p) => p !== periodOption.id);
                            return { ...prev, periods: newPeriods };
                          });
                        }}
                        className="w-3.5 h-3.5 text-sage-600 border-sage-300 focus:ring-sage-500 rounded-none cursor-pointer"
                      />
                      <span className="font-bold">{periodOption.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-sage-800">Menu hôm nay?</label>
              <select
                value={dishForm.isTodayMenu ? "true" : "false"}
                onChange={(e) => setForm((prev) => ({ ...prev, isTodayMenu: e.target.value === "true" }))}
                className="w-full p-2.5 border border-sage-200 bg-white text-[#1a2e05] font-bold"
              >
                <option value="true">{mode === "add" ? "Bật luôn hôm nay" : "Bật hôm nay"}</option>
                <option value="false">{mode === "add" ? "Tắt (Lưu kho)" : "Tắt hôm nay"}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-sage-800">Lịch phục vụ</label>
              <select
                value={dishForm.availableDays}
                onChange={(e) => setForm((prev) => ({ ...prev, availableDays: e.target.value }))}
                className="w-full p-2.5 border border-sage-200 bg-white text-sage-900"
              >
                <option value="0,1,2,3,4,5,6">Tất cả các ngày</option>
                <option value="1,3,5">Ngày chẵn (Thứ 2, 4, 6)</option>
                <option value="0,2,4,6">Ngày lẻ (Thứ 3, 5, 7, CN)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-sage-800">Trạng thái món trong gói</label>
              <select
                value={dishForm.isPackageIncluded ? "true" : "false"}
                onChange={(e) => setForm((prev) => ({ ...prev, isPackageIncluded: e.target.value === "true" }))}
                className="w-full p-2.5 border border-sage-200 bg-white text-sage-900"
              >
                <option value="true">Trong gói (Miễn phí)</option>
                <option value="false">Ngoài gói (Có phụ phí)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-sage-800">Mô tả chi tiết món ăn</label>
            <textarea
              value={dishForm.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows="2"
              placeholder="Mô tả công dụng thực dưỡng, hương vị..."
              className="w-full p-2.5 border border-sage-200 bg-white text-sage-950 font-light"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-sage-800">Chế độ ăn (Dietary Tags)</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {[
                { id: "Omnivore", label: "Ăn tạp (Omnivore)" },
                { id: "Pescatarian", label: "Ăn cá (Pescatarian)" },
                { id: "Vegetarian", label: "Chay (Vegetarian)" },
                { id: "Vegan", label: "Thuần chay (Vegan)" },
                { id: "Keto", label: "Keto" },
                { id: "Halal", label: "Halal" },
              ].map((diet) => {
                const isChecked = dishForm.dietaryTags.includes(diet.id);
                return (
                  <label key={diet.id} className="flex items-center space-x-2 cursor-pointer p-2 border border-sage-200 hover:bg-sage-50">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        let currentTags = dishForm.dietaryTags ? dishForm.dietaryTags.split(',').map(t => t.trim()).filter(Boolean) : [];
                        if (e.target.checked) {
                          if (!currentTags.includes(diet.id)) currentTags.push(diet.id);
                        } else {
                          currentTags = currentTags.filter(t => t !== diet.id);
                        }
                        setForm((prev) => ({ ...prev, dietaryTags: currentTags.join(', ') }));
                      }}
                      className="h-4 w-4 text-sage-800 focus:ring-sage-800 border-gray-300 rounded"
                    />
                    <span className="text-xs font-medium text-sage-700">{diet.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-sage-800">Đường dẫn hình ảnh (URL)</label>
            <input
              type="text"
              value={dishForm.image}
              onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
              placeholder="Ví dụ: /images/dishes/ten_anh.png hoặc https://..."
              className="w-full p-2.5 border border-sage-200 bg-white text-sage-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-sage-800">Nguyên liệu thành phần</label>
            <input
              type="text"
              value={dishForm.ingredients}
              onChange={(e) => setForm((prev) => ({ ...prev, ingredients: e.target.value }))}
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
              onChange={(e) => setForm((prev) => ({ ...prev, allergens: e.target.value }))}
              placeholder="Ví dụ: Đậu phộng, Hải sản..."
              className="w-full p-2.5 border border-red-200 focus:outline-none focus:ring-1 focus:ring-red-650 bg-white text-sage-900"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-primary-100">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="px-4 py-2"
            >
              Đóng
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="px-5 py-2"
            >
              {mode === "add" ? "Thêm món mới" : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
    </Modal>
  );
}
