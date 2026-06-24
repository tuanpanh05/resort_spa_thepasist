import React, { useState } from "react";
import { PlusCircle, AlertCircle } from "lucide-react";
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
