import React, { useState } from "react";
import { PlusCircle, X, Package } from "lucide-react";

export default function ManageInventory({ spaInventory }) {
  const [showRequestInventoryModal, setShowRequestInventoryModal] =
    useState(false);
  const [requestForm, setRequestForm] = useState({
    name: "Tinh dầu Oải Hương",
    qty: "",
  });

  const handleRequestSpaInventory = (e) => {
    e.preventDefault();
    if (!requestForm.qty) {
      alert("Vui lòng nhập số lượng.");
      return;
    }
    alert(
      `Đã gửi yêu cầu cấp thêm ${requestForm.qty} đơn vị nguyên liệu: ${requestForm.name}.`,
    );
    setShowRequestInventoryModal(false);
    setRequestForm({ name: "Tinh dầu Oải Hương", qty: "" });
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header Panel */}
      <div className="bg-white border border-sage-200/60 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-sage-950">
            Bảng Kiểm Kê Tinh Dầu & Dược Liệu Spa
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Giám sát lượng tinh dầu xông, dược thảo ngâm bồn Dao Đỏ, đá bazan
            trị liệu.
          </p>
        </div>
        <button
          onClick={() => {
            const firstItem = spaInventory[0]?.name || "Tinh dầu Oải Hương";
            setRequestForm({ name: firstItem, qty: "" });
            setShowRequestInventoryModal(true);
          }}
          className="px-4 py-2.5 bg-sage-950 hover:bg-sage-800 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer shadow-sm"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Yêu Cầu Cấp Nguyên Liệu</span>
        </button>
      </div>

      {/* Spa Inventory Table */}
      <div className="bg-white border border-sage-200/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-sage-50/50 text-sage-600 font-bold border-b border-sage-200/50">
                <th className="p-4">Mã VL</th>
                <th className="p-4">Tên nguyên liệu thảo dược</th>
                <th className="p-4">Lượng tồn hiện có</th>
                <th className="p-4">Đơn vị tính</th>
                <th className="p-4">Định mức tối thiểu</th>
                <th className="p-4">Đánh giá trạng thái</th>
                <th className="p-4 text-center">Yêu cầu nhanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {spaInventory.map((item) => (
                <tr key={item.id} className="hover:bg-sage-50/30">
                  <td className="p-4 font-mono font-bold text-sage-400">
                    {item.id}
                  </td>
                  <td className="p-4 font-bold text-sage-950">{item.name}</td>
                  <td
                    className={`p-4 font-bold text-sm font-mono ${item.stock < item.minQty ? "text-red-650" : "text-sage-800"}`}
                  >
                    {item.stock}
                  </td>
                  <td className="p-4 text-sage-600">{item.unit}</td>
                  <td className="p-4 text-sage-400 font-mono">{item.minQty}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        item.status === "Đầy đủ"
                          ? "bg-green-50 text-green-700 border border-green-150"
                          : "bg-red-50 text-red-705 border border-red-150"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => {
                        setRequestForm({ name: item.name, qty: "10" });
                        setShowRequestInventoryModal(true);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-sage-50 border border-sage-250 text-sage-800 text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Đặt thêm +10
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Spa Request Inventory Requisition Modal */}
      {showRequestInventoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-sm w-full p-6 border border-sage-200 shadow-2xl relative">
            <button
              onClick={() => setShowRequestInventoryModal(false)}
              className="absolute top-4 right-4 p-2 text-sage-400 hover:text-sage-900 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-base font-bold text-sage-950 mb-4 flex items-center space-x-2">
              <Package className="h-5 w-5 text-sage-800" />
              <span>Yêu Cầu Cấp Nguyên Liệu Spa</span>
            </h3>

            <form
              onSubmit={handleRequestSpaInventory}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  Nguyên liệu cần cấp
                </label>
                <select
                  value={requestForm.name}
                  onChange={(e) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full p-2.5 border border-sage-200 bg-white text-sage-900 focus:outline-none focus:border-sage-800"
                >
                  {spaInventory.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name} ({item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  Số lượng yêu cầu cấp
                </label>
                <input
                  type="number"
                  value={requestForm.qty}
                  onChange={(e) =>
                    setRequestForm((prev) => ({ ...prev, qty: e.target.value }))
                  }
                  placeholder="Ví dụ: 10"
                  className="w-full p-2.5 border border-sage-200 bg-white text-sage-900 focus:outline-none focus:border-sage-800"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-sage-100">
                <button
                  type="button"
                  onClick={() => setShowRequestInventoryModal(false)}
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
    </div>
  );
}
