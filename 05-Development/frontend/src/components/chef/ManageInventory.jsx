import React, { useState } from "react";
import { PlusCircle, X, Package } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Modal from "../ui/Modal";
import { Table } from "../ui/Table";

export default function ManageInventory({
  ingredients,
  setIngredients,
  procurements,
  setProcurements,
}) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [editingIng, setEditingIng] = useState(null);
  const [requestForm, setRequestForm] = useState({
    name: "Nấm đùi gà tươi",
    qty: "",
    unit: "Kg",
  });

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!setIngredients) return;
    
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id === editingIng.id) {
          const stock = parseFloat(editingIng.stock);
          const minQty = parseFloat(editingIng.minQty);
          let status = "Đầy đủ";
          if (stock === 0) status = "Hết hàng";
          else if (stock < minQty) status = "Sắp hết";
          return { ...ing, stock, minQty, status };
        }
        return ing;
      })
    );
    setEditingIng(null);
  };

  const handleCreateRequest = (e) => {
    e.preventDefault();
    if (!requestForm.qty) {
      alert("Vui lòng điền số lượng cần nhập.");
      return;
    }
    const newReq = {
      id: `REQ-${Math.floor(10 + Math.random() * 90)}`,
      name: requestForm.name,
      qty: parseFloat(requestForm.qty),
      unit: requestForm.unit,
      date: new Date().toISOString().split("T")[0],
      status: "Chờ duyệt",
    };
    setProcurements((prev) => [newReq, ...prev]);
    setShowRequestModal(false);
    setRequestForm({ name: "Nấm đùi gà tươi", qty: "", unit: "Kg" });
    alert(
      `Đã gửi yêu cầu mua thêm ${newReq.qty} ${newReq.unit} ${newReq.name} lên phòng quản trị.`,
    );
  };

  const handleApproveRequest = (reqId) => {
    const req = procurements.find((r) => r.id === reqId);
    if (!req) return;

    setProcurements((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: "Đã nhập kho" } : r))
    );

    if (setIngredients) {
      setIngredients((prev) =>
        prev.map((ing) => {
          if (ing.name === req.name) {
            const stock = parseFloat(ing.stock) + parseFloat(req.qty);
            const minQty = parseFloat(ing.minQty);
            let status = "Đầy đủ";
            if (stock === 0) status = "Hết hàng";
            else if (stock < minQty) status = "Sắp hết";
            return { ...ing, stock, status };
          }
          return ing;
        })
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header Actions */}
      <Card className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="card-title text-primary-950">
            Kho Nguyên Liệu Bếp & Đề Xuất Thu Mua
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Giám sát lượng tồn thực tế của thực phẩm trong tủ mát/kho bếp trực.
            Tạo đơn đề xuất mua hàng khi cạn kiệt.
          </p>
        </div>
        <Button
          onClick={() => {
            const firstIng = ingredients[0]?.name || "Nấm đùi gà tươi";
            const firstUnit = ingredients[0]?.unit || "Kg";
            setRequestForm({ name: firstIng, qty: "", unit: firstUnit });
            setShowRequestModal(true);
          }}
          variant="primary"
          className="px-4 py-2.5 flex items-center space-x-1.5 shadow-sm"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Yêu Cầu Nhập Nguyên Liệu</span>
        </Button>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ingredients Stock Table */}
        <Card className="p-6 col-span-2 space-y-4">
          <h3 className="card-title text-primary-950 border-b border-primary-100 pb-2.5">
            Nguyên Liệu Trong Kho Bếp
          </h3>

          <Table
            headers={[
              "Nguyên liệu",
              "Phân nhóm",
              "Tồn kho",
              "Hạn mức tối thiểu",
              "Đơn vị",
              "Trạng thái",
              ""
            ]}
          >
            {ingredients.map((ing) => (
              <tr key={ing.id} className="hover:bg-primary-50/30">
                <td className="p-3 font-bold text-primary-950">{ing.name}</td>
                <td className="p-3 text-sage-600">{ing.category}</td>
                <td
                  className={`p-3 font-bold font-mono ${
                    ing.stock === 0
                      ? "text-red-600"
                      : ing.stock < ing.minQty
                        ? "text-amber-600"
                        : "text-primary-900"
                  }`}
                >
                  {ing.stock}
                </td>
                <td className="p-3 text-sage-500 font-mono">
                  {ing.minQty}
                </td>
                <td className="p-3 text-sage-500">{ing.unit}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      ing.status === "Đầy đủ"
                        ? "bg-green-50 text-green-700 border border-green-150"
                        : ing.status === "Sắp hết"
                          ? "bg-amber-50 text-[#b45309] border border-amber-150"
                          : "bg-red-50 text-red-700 border border-red-150"
                    }`}
                  >
                    {ing.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button 
                    onClick={() => setEditingIng({ ...ing })}
                    className="text-[10px] text-sage-600 hover:text-primary-950 font-bold underline cursor-pointer"
                  >
                    SỬA
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        {/* Purchase Orders Log */}
        <Card className="p-6 space-y-4">
          <h3 className="card-title text-primary-950 border-b border-primary-100 pb-2.5">
            Nhật Ký Yêu Cầu Nhập Hàng
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {procurements.map((req) => (
              <div
                key={req.id}
                className="p-3.5 bg-primary-50/50 border border-primary-100 text-xs space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary-900">{req.name}</span>
                  <span
                    className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                      req.status === "Chờ duyệt"
                        ? "bg-amber-50 text-amber-800 border border-amber-150"
                        : "bg-green-50 text-green-800 border border-green-150"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-sage-500">
                  <span>
                    Số lượng:{" "}
                    <strong className="text-primary-800 font-bold">
                      {req.qty} {req.unit}
                    </strong>
                  </span>
                  <span>Ngày: {req.date}</span>
                </div>
                <div className="flex justify-between items-end mt-1.5">
                  <div className="text-[9px] font-mono text-sage-400">
                    Yêu cầu: {req.id}
                  </div>
                  {req.status === "Chờ duyệt" && (
                    <Button
                      onClick={() => handleApproveRequest(req.id)}
                      variant="primary"
                      className="px-2 py-1 text-[9px]"
                    >
                      Duyệt & Nhập Kho
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {procurements.length === 0 && (
              <p className="text-xs text-sage-400 italic text-center py-10">
                Chưa gửi yêu cầu nhập hàng nào.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Request Stock Requisition Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title={
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-primary-800" />
            <span>Yêu Cầu Nhập Thêm Thực Phẩm</span>
          </div>
        }
      >
        <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-primary-800">
              Chọn nguyên liệu cần nhập
            </label>
            <select
              value={requestForm.name}
              onChange={(e) => {
                const selectedIng = ingredients.find(
                  (ing) => ing.name === e.target.value,
                );
                setRequestForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                  unit: selectedIng ? selectedIng.unit : prev.unit,
                }));
              }}
              className="w-full p-2.5 border border-primary-200 bg-white text-primary-900 focus:outline-none focus:border-primary-800"
            >
              {ingredients.map((ing) => (
                <option key={ing.id} value={ing.name}>
                  {ing.name} ({ing.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-primary-800">
                Số lượng yêu cầu
              </label>
              <input
                type="number"
                value={requestForm.qty}
                onChange={(e) =>
                  setRequestForm((prev) => ({
                    ...prev,
                    qty: e.target.value,
                  }))
                }
                placeholder="Ví dụ: 15"
                className="w-full p-2.5 border border-primary-200 bg-white text-primary-900 focus:outline-none focus:border-primary-800"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-primary-800">
                Đo bằng đơn vị
              </label>
              <input
                type="text"
                value={requestForm.unit}
                onChange={(e) =>
                  setRequestForm((prev) => ({
                    ...prev,
                    unit: e.target.value,
                  }))
                }
                placeholder="Kg / Khay / Chai"
                className="w-full p-2.5 border border-primary-200 bg-white text-primary-900 font-bold focus:outline-none focus:border-primary-800"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-primary-100">
            <Button
              type="button"
              onClick={() => setShowRequestModal(false)}
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
              Gửi yêu cầu
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Inventory Modal */}
      {/* Edit Inventory Modal */}
      <Modal
        isOpen={!!editingIng}
        onClose={() => setEditingIng(null)}
        title={
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-primary-800" />
            <span>Cập Nhật Tồn Kho</span>
          </div>
        }
      >
        {editingIng && (
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-primary-800">Tên nguyên liệu</label>
              <input
                type="text"
                value={editingIng.name}
                disabled
                className="w-full p-2.5 border border-primary-200 bg-primary-50 text-primary-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-primary-800">Tồn kho hiện tại ({editingIng.unit})</label>
                <input
                  type="number"
                  value={editingIng.stock}
                  onChange={(e) => setEditingIng(prev => ({ ...prev, stock: e.target.value }))}
                  className="w-full p-2.5 border border-primary-200 bg-white text-primary-900 focus:outline-none focus:border-primary-800 font-mono font-bold"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-primary-800">Mức tối thiểu ({editingIng.unit})</label>
                <input
                  type="number"
                  value={editingIng.minQty}
                  onChange={(e) => setEditingIng(prev => ({ ...prev, minQty: e.target.value }))}
                  className="w-full p-2.5 border border-primary-200 bg-white text-primary-900 focus:outline-none focus:border-primary-800 font-mono font-bold text-primary-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-primary-100">
              <Button
                type="button"
                onClick={() => setEditingIng(null)}
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
                Lưu thay đổi
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
