import React, { useState } from "react";
import { Package } from "lucide-react";
import { Table } from "../ui/Table";
import Button from "../ui/Button";

export default function InventoryTable({ inventory, handleUpdateStock }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // Filtering inventory items
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;

    const isLow = item.stock <= item.minQty;
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && isLow) ||
      (stockFilter === "normal" && !isLow);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const headers = [
    "Mã số",
    "Tên Hàng Hóa Vật Tư",
    "Chuyên Mục",
    "Tồn Kho Hiện Tại",
    "Đơn Vị Tính",
    "Mức Báo Động Đỏ",
    "Tác Vụ Nhập Xuất",
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filters Controls */}
      <div className="bg-primary-50/50 border border-primary-100 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm theo tên vật tư, mã số..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-primary-200 bg-white focus:outline-primary-300"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 text-xs border border-primary-200 bg-white focus:outline-primary-300 flex-1 md:flex-initial"
          >
            <option value="all">Tất cả chuyên mục</option>
            <option value="Spa trị liệu">Spa & Mỹ phẩm</option>
            <option value="Bếp ăn nhà hàng">Bếp ăn & Thực phẩm</option>
            <option value="Buồng phòng">Buồng phòng & Vải vóc</option>
            <option value="Thiết bị kỹ thuật">Thiết bị & Kỹ thuật</option>
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="p-2 text-xs border border-primary-200 bg-white focus:outline-primary-300 flex-1 md:flex-initial"
          >
            <option value="all">Tất cả mức tồn</option>
            <option value="low">Cảnh báo tồn thấp</option>
            <option value="normal">Đủ số lượng</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <Table headers={headers}>
        {filteredInventory.map((item) => {
          const isLow = item.stock <= item.minQty;
          return (
            <tr
              key={item.id}
              className={`hover:bg-primary-50/10 ${isLow ? "bg-red-50/20" : ""}`}
            >
              <td className="p-4 font-bold text-primary-950">{item.id}</td>
              <td className="p-4 font-semibold text-sage-900 flex items-center space-x-2">
                <Package
                  className={`h-4 w-4 flex-shrink-0 ${isLow ? "text-red-650 animate-pulse" : "text-primary-850"}`}
                />
                <span>{item.name}</span>
              </td>
              <td className="p-4 text-sage-750">{item.category}</td>
              <td
                className={`p-4 font-bold ${isLow ? "text-red-750" : "text-sage-950"}`}
              >
                {item.stock}
              </td>
              <td className="p-4 text-sage-500 font-medium">{item.unit}</td>
              <td className="p-4 text-red-650 font-bold font-mono">
                Dưới {item.minQty}
              </td>
              <td className="p-4 text-center">
                <div className="flex items-center justify-center space-x-1.5">
                  <Button
                    onClick={() => handleUpdateStock(item.id, 5)}
                    variant="secondary"
                    className="px-2.5 py-1.5 text-[10px] font-semibold"
                  >
                    Nhập +5
                  </Button>
                  <Button
                    onClick={() => handleUpdateStock(item.id, -5)}
                    disabled={item.stock === 0}
                    variant="danger-light"
                    className="px-2.5 py-1.5 text-[10px] font-semibold"
                  >
                    Xuất -5
                  </Button>
                </div>
              </td>
            </tr>
          );
        })}
        {filteredInventory.length === 0 && (
          <tr>
            <td
              colSpan={headers.length}
              className="p-8 text-center text-xs text-sage-400 italic"
            >
              Không tìm thấy vật tư hàng hóa nào.
            </td>
          </tr>
        )}
      </Table>
    </div>
  );
}
