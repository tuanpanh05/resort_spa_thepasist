import React, { useState } from "react";
import { PlusCircle, X, Package } from "lucide-react";

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
      <div className="bg-white border border-sage-200/60 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-sage-950">
            Kho Nguyên Liệu Bếp & Đề Xuất Thu Mua
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Giám sát lượng tồn thực tế của thực phẩm trong tủ mát/kho bếp trực.
            Tạo đơn đề xuất mua hàng khi cạn kiệt.
          </p>
        </div>
        <button
          onClick={() => {
            const firstIng = ingredients[0]?.name || "Nấm đùi gà tươi";
            const firstUnit = ingredients[0]?.unit || "Kg";
            setRequestForm({ name: firstIng, qty: "", unit: firstUnit });
            setShowRequestModal(true);
          }}
          className="px-4 py-2.5 bg-sage-950 hover:bg-sage-800 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer shadow-sm"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Yêu Cầu Nhập Nguyên Liệu</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ingredients Stock Table */}
        <div className="bg-white border border-sage-200/60 p-6 col-span-2 space-y-4">
          <h3 className="font-serif text-base font-bold text-sage-950 border-b border-sage-100 pb-2.5">
            Nguyên Liệu Trong Kho Bếp
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-sage-50/50 text-sage-600 font-bold border-b border-sage-200/50">
                  <th className="p-3">Nguyên liệu</th>
                  <th className="p-3">Phân nhóm</th>
                  <th className="p-3">Tồn kho</th>
                  <th className="p-3">Hạn mức tối thiểu</th>
                  <th className="p-3">Đơn vị</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {ingredients.map((ing) => (
                  <tr key={ing.id} className="hover:bg-sage-50/30">
                    <td className="p-3 font-bold text-sage-950">{ing.name}</td>
                    <td className="p-3 text-sage-600">{ing.category}</td>
                    <td
                      className={`p-3 font-bold font-mono ${
                        ing.stock === 0
                          ? "text-red-600"
                          : ing.stock < ing.minQty
                            ? "text-amber-600"
                            : "text-sage-900"
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
                        className="text-[10px] text-sage-600 hover:text-sage-950 font-bold underline"
                      >
                        SỬA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Purchase Orders Log */}
        <div className="bg-white border border-sage-200/60 p-6 space-y-4">
          <h3 className="font-serif text-base font-bold text-sage-950 border-b border-sage-100 pb-2.5">
            Nhật Ký Yêu Cầu Nhập Hàng
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {procurements.map((req) => (
              <div
                key={req.id}
                className="p-3.5 bg-sage-50/50 border border-sage-150 text-xs space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sage-900">{req.name}</span>
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
                    <strong className="text-sage-800 font-bold">
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
                    <button
                      onClick={() => handleApproveRequest(req.id)}
                      className="px-2 py-1 bg-sage-900 hover:bg-sage-800 text-white text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Duyệt & Nhập Kho
                    </button>
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
        </div>
      </div>

      {/* Request Stock Requisition Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-sm w-full p-6 border border-sage-200 shadow-2xl relative">
            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute top-4 right-4 p-2 text-sage-400 hover:text-sage-900 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-base font-bold text-sage-950 mb-4 flex items-center space-x-2">
              <Package className="h-5 w-5 text-sage-800" />
              <span>Yêu Cầu Nhập Thêm Thực Phẩm</span>
            </h3>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-sage-800">
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
                  className="w-full p-2.5 border border-sage-200 bg-white text-sage-900 focus:outline-none focus:border-sage-800"
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
                  <label className="font-semibold text-sage-800">
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
                    className="w-full p-2.5 border border-sage-200 bg-white text-sage-900 focus:outline-none focus:border-sage-800"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">
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
                    className="w-full p-2.5 border border-sage-200 bg-white text-sage-900 font-bold focus:outline-none focus:border-sage-800"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-sage-100">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 border border-sage-200 hover:bg-sage-50 text-sage-800 rounded-none font-bold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sage-950 text-white rounded-none font-bold hover:bg-sage-800 cursor-pointer"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Inventory Modal */}
      {editingIng && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-sm w-full p-6 border border-sage-200 shadow-2xl relative">
            <button
              onClick={() => setEditingIng(null)}
              className="absolute top-4 right-4 p-2 text-sage-400 hover:text-sage-900 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-base font-bold text-sage-950 mb-4 flex items-center space-x-2">
              <Package className="h-5 w-5 text-sage-800" />
              <span>Cập Nhật Tồn Kho</span>
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-sage-800">Tên nguyên liệu</label>
                <input
                  type="text"
                  value={editingIng.name}
                  disabled
                  className="w-full p-2.5 border border-sage-200 bg-sage-50 text-sage-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">Tồn kho hiện tại ({editingIng.unit})</label>
                  <input
                    type="number"
                    value={editingIng.stock}
                    onChange={(e) => setEditingIng(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full p-2.5 border border-sage-200 bg-white text-sage-900 focus:outline-none focus:border-sage-800 font-mono font-bold"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">Mức tối thiểu ({editingIng.unit})</label>
                  <input
                    type="number"
                    value={editingIng.minQty}
                    onChange={(e) => setEditingIng(prev => ({ ...prev, minQty: e.target.value }))}
                    className="w-full p-2.5 border border-sage-200 bg-white text-sage-900 focus:outline-none focus:border-sage-800 font-mono font-bold text-sage-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-sage-100">
                <button
                  type="button"
                  onClick={() => setEditingIng(null)}
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
