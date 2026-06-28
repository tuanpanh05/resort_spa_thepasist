import React, { useState } from "react";
import { PlusCircle, AlertCircle, Package, CheckCircle } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import Button from "../ui/Button";
import InventoryTable from "./InventoryTable";
import { InventoryModalForm } from "./ModalForm";
import { inventoryApi } from "../../api";

export default function ManageInventory({ inventory, loadInventory }) {
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({
    name: "",
    category: "Spa trị liệu",
    stock: "",
    minQty: "",
    unit: "Lít",
  });

  const triggerAddModal = () => {
    setInventoryForm({
      name: "",
      category: "Spa trị liệu",
      stock: "",
      minQty: "",
      unit: "Lít",
    });
    setShowAddInventoryModal(true);
  };

  const localSubmitCreate = async (e) => {
    e.preventDefault();
    if (!inventoryForm.name || !inventoryForm.stock || !inventoryForm.minQty) {
      alert("Vui lòng điền đầy đủ thông tin hàng hóa vật tư.");
      return;
    }
    const payload = {
      name: inventoryForm.name,
      category: inventoryForm.category,
      stock: parseInt(inventoryForm.stock),
      minQty: parseInt(inventoryForm.minQty),
      unit: inventoryForm.unit,
    };
    try {
      await inventoryApi.createInventoryItem(payload);
      setShowAddInventoryModal(false);
      await loadInventory();
      alert(`Vật tư "${inventoryForm.name}" đã được tạo thành công.`);
    } catch (err) {
      alert("Lỗi khi thêm vật tư: " + err.message);
    }
  };

  const handleUpdateStock = async (id, delta) => {
    try {
      const item = inventory.find((x) => x.id === id);
      if (item) {
        const newStock = Math.max(0, item.stock + delta);
        if (newStock < item.minQty) {
          alert(
            `CẢNH BÁO: Số lượng "${item.name}" trong kho đang thấp hơn mức tối thiểu!`
          );
        }
      }
      await inventoryApi.updateStock(id, delta);
      await loadInventory();
    } catch (err) {
      alert("Lỗi khi cập nhật tồn kho: " + err.message);
    }
  };

  const lowStockItems = (inventory || []).filter((item) => item.stock <= item.minQty);
  const lowStockCount = lowStockItems.length;

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <SectionHeader
        title="Quản Lý Kho & Vật Tư Resort"
        description="Giám sát lượng hàng tiêu dùng, nguyên liệu mỹ phẩm spa, tinh dầu thảo dược và vật dụng phòng ngủ."
      >
        <Button
          onClick={triggerAddModal}
          variant="primary"
          className="flex items-center space-x-1.5 w-full sm:w-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Tạo Mã Vật Tư Mới</span>
        </Button>
      </SectionHeader>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary-50 text-primary-900 rounded-xl">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider">Tổng loại vật tư</p>
            <p className="text-2xl font-bold text-sage-900">{inventory.length}</p>
            <p className="text-[10px] text-sage-500 font-medium">Mã hàng hóa tiêu hao</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-xl ${lowStockCount > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider font-semibold">Báo động đỏ</p>
            <p className={`text-2xl font-bold ${lowStockCount > 0 ? "text-red-600 animate-pulse" : "text-green-600"}`}>
              {lowStockCount}
            </p>
            <p className="text-[10px] text-sage-500 font-medium">Đang dưới mức tối thiểu</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider">Tồn kho an toàn</p>
            <p className="text-2xl font-bold text-green-600">
              {inventory.filter(item => item.stock > item.minQty).length}
            </p>
            <p className="text-[10px] text-sage-500 font-medium">Số vật tư ở mức an toàn</p>
          </div>
        </div>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-red-50 border-l-4 border-red-700 p-4 text-xs flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-700 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h4 className="font-bold text-red-900 uppercase tracking-wide">
              Cảnh báo: Có {lowStockCount} vật tư đang ở mức báo động đỏ!
            </h4>
            <p className="text-red-700 mt-1">
              Các mặt hàng sau đã giảm xuống bằng hoặc thấp hơn mức tồn kho tối thiểu:{" "}
              <span className="font-semibold">
                {lowStockItems.map((item) => `${item.name} (${item.stock} ${item.unit})`).join(", ")}
              </span>. 
              Vui lòng xem xét nhập kho bổ sung sớm.
            </p>
          </div>
        </div>
      )}

      <InventoryTable
        inventory={inventory}
        handleUpdateStock={handleUpdateStock}
      />

      {/* Add Inventory Modal */}
      <InventoryModalForm
        isOpen={showAddInventoryModal}
        onClose={() => setShowAddInventoryModal(false)}
        title="Tạo Mã Vật Tư Mới"
        formState={inventoryForm}
        setFormState={setInventoryForm}
        onSubmit={localSubmitCreate}
      />
    </div>
  );
}
