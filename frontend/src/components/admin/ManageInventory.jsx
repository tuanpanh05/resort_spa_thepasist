import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import Button from "../ui/Button";
import InventoryTable from "./InventoryTable";
import { InventoryModalForm } from "./ModalForm";

export default function ManageInventory({ inventory, setInventory }) {
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

  const localSubmitCreate = (e) => {
    e.preventDefault();
    if (!inventoryForm.name || !inventoryForm.stock || !inventoryForm.minQty) {
      alert("Vui lòng điền đầy đủ thông tin hàng hóa vật tư.");
      return;
    }
    const newInv = {
      id: `INV-${Math.floor(100 + Math.random() * 900)}`,
      name: inventoryForm.name,
      category: inventoryForm.category,
      stock: parseInt(inventoryForm.stock),
      minQty: parseInt(inventoryForm.minQty),
      unit: inventoryForm.unit,
    };
    setInventory((prev) => [...prev, newInv]);
    setShowAddInventoryModal(false);
    alert(`Vật tư "${inventoryForm.name}" đã được tạo thành công.`);
  };

  const handleUpdateStock = (id, delta) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = Math.max(0, item.stock + delta);
          if (newStock < item.minQty) {
            alert(
              `CẢNH BÁO: Số lượng "${item.name}" trong kho đang thấp hơn mức tối thiểu!`,
            );
          }
          return { ...item, stock: newStock };
        }
        return item;
      }),
    );
  };

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
