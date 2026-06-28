import React, { useState, useEffect } from "react";
import { PlusCircle, RefreshCw, Trash2, Edit2, Ticket, Percent, DollarSign, Calendar, AlertTriangle, X } from "lucide-react";
import { paymentApi } from "../../api";

export default function ManageVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    maxDiscountAmount: "",
    minBookingAmount: "",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0], // 30 days from now
    usageLimit: 100,
    status: "ACTIVE"
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await paymentApi.getVouchers();
      setVouchers(data || []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách voucher: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      code: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      maxDiscountAmount: "",
      minBookingAmount: "0",
      startDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0],
      usageLimit: 100,
      status: "ACTIVE"
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      code: item.code,
      discountType: item.discountType,
      discountValue: item.discountValue,
      maxDiscountAmount: item.maxDiscountAmount || "",
      minBookingAmount: item.minBookingAmount || "0",
      startDate: item.startDate ? item.startDate.split("T")[0] : new Date().toISOString().split("T")[0],
      expiryDate: item.expiryDate ? item.expiryDate.split("T")[0] : new Date().toISOString().split("T")[0],
      usageLimit: item.usageLimit || 100,
      status: item.status || "ACTIVE"
    });
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa mã giảm giá "${item.code}"?`)) {
      try {
        await paymentApi.deleteVoucher(item.voucherId);
        alert("Đã xóa voucher thành công!");
        fetchVouchers();
      } catch (err) {
        alert("Lỗi khi xóa voucher: " + err.message);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Bước 1: Kiểm tra xem đã nhập mã voucher chưa
    if (!form.code.trim()) {
      alert("Vui lòng nhập mã giảm giá.");
      return;
    }

    // Bước 2: Kiểm tra giá trị giảm giá (Phải lớn hơn 0)
    const discountVal = parseFloat(form.discountValue);
    if (isNaN(discountVal) || discountVal <= 0) {
      alert("Giá trị giảm giá phải lớn hơn 0.");
      return;
    }

    // Bước 3: Nếu là giảm theo phần trăm (%), không cho phép quá 100%
    if (form.discountType === "PERCENTAGE" && discountVal > 100) {
      alert("Giảm giá theo phần trăm không được vượt quá 100%.");
      return;
    }

    // Bước 4: Kiểm tra số tiền giảm tối đa (Không được là số âm)
    if (form.maxDiscountAmount && parseFloat(form.maxDiscountAmount) < 0) {
      alert("Số tiền giảm tối đa không được âm.");
      return;
    }

    // Bước 5: Kiểm tra hóa đơn tối thiểu (Không được là số âm)
    if (form.minBookingAmount && parseFloat(form.minBookingAmount) < 0) {
      alert("Hóa đơn tối thiểu không được âm.");
      return;
    }

    // Bước 6: Kiểm tra số lượt sử dụng tối đa (Phải lớn hơn 0)
    const limit = parseInt(form.usageLimit);
    if (isNaN(limit) || limit <= 0) {
      alert("Giới hạn số lần sử dụng phải lớn hơn 0.");
      return;
    }

    setSaving(true);
    try {
      const dto = {
        ...form,
        discountValue: parseFloat(form.discountValue),
        maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
        minBookingAmount: form.minBookingAmount ? parseFloat(form.minBookingAmount) : 0,
        usageLimit: parseInt(form.usageLimit),
        startDate: form.startDate + "T00:00:00",
        expiryDate: form.expiryDate + "T23:59:59"
      };

      if (editingItem) {
        await paymentApi.updateVoucher(editingItem.voucherId, dto);
        alert("Cập nhật mã giảm giá thành công!");
      } else {
        await paymentApi.createVoucher(dto);
        alert("Tạo mới mã giảm giá thành công!");
      }
      setShowModal(false);
      fetchVouchers();
    } catch (err) {
      alert("Lỗi lưu voucher: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  };

  const getStatusBadgeClass = (voucher) => {
    const now = new Date();
    const expiry = new Date(voucher.expiryDate);
    const start = new Date(voucher.startDate);

    if (voucher.status === "DISABLED") {
      return "bg-gray-100 text-gray-600 border border-gray-200";
    }
    if (expiry < now) {
      return "bg-red-100 text-red-700 border border-red-200";
    }
    if (start > now) {
      return "bg-blue-100 text-blue-700 border border-blue-200";
    }
    if (voucher.usedCount >= voucher.usageLimit) {
      return "bg-amber-100 text-amber-700 border border-amber-200";
    }
    return "bg-green-100 text-green-700 border border-green-200";
  };

  const getStatusText = (voucher) => {
    const now = new Date();
    const expiry = new Date(voucher.expiryDate);
    const start = new Date(voucher.startDate);

    if (voucher.status === "DISABLED") return "Đã khóa";
    if (expiry < now) return "Hết hạn";
    if (start > now) return "Chờ kích hoạt";
    if (voucher.usedCount >= voucher.usageLimit) return "Hết lượt dùng";
    return "Đang chạy";
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="bg-white border border-primary-100 p-5 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="font-serif text-lg font-normal text-sage-955">
            Quản Lý Chương Trình Khuyến Mãi & Voucher
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Thiết lập các chiến dịch giảm giá, mã Voucher chiết khấu trực tiếp trên toàn bộ Guest Folio hóa đơn phòng, spa và ẩm thực của khách hàng.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-primary-850 hover:bg-primary-900 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Tạo Voucher Mới</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-primary-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-primary-50/50 text-sage-600 font-bold border-b border-primary-100">
                <th className="p-4">Mã Code</th>
                <th className="p-4">Hình Thức Giảm</th>
                <th className="p-4">Giá Trị Giảm</th>
                <th className="p-4 text-right">Giảm Tối Đa</th>
                <th className="p-4 text-right">Hóa Đơn Tối Thiểu</th>
                <th className="p-4 text-center">Thời Hạn Mã</th>
                <th className="p-4 text-center">Đã Dùng / Giới Hạn</th>
                <th className="p-4 text-center">Trạng Thái</th>
                <th className="p-4 text-center">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50/50">
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-sage-400 italic">
                    Đang tải danh sách voucher...
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-sage-400 italic">
                    Chưa cấu hình mã giảm giá nào trong hệ thống.
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v.voucherId} className="hover:bg-primary-50/10">
                    <td className="p-4 font-mono font-bold text-primary-950 uppercase tracking-wider">
                      {v.code}
                    </td>
                    <td className="p-4 text-sage-700">
                      {v.discountType === "PERCENTAGE" ? (
                        <span className="flex items-center gap-1">
                          <Percent className="h-3.5 w-3.5 text-sage-500" />
                          <span>Chiết khấu phần trăm</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-sage-500" />
                          <span>Số tiền cố định</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-sage-900">
                      {v.discountType === "PERCENTAGE" ? `${v.discountValue}%` : formatCurrency(v.discountValue)}
                    </td>
                    <td className="p-4 text-right font-medium text-sage-800">
                      {v.maxDiscountAmount ? formatCurrency(v.maxDiscountAmount) : "Không giới hạn"}
                    </td>
                    <td className="p-4 text-right font-medium text-sage-800">
                      {formatCurrency(v.minBookingAmount)}
                    </td>
                    <td className="p-4 text-center text-sage-600 font-light">
                      {formatDate(v.startDate)} - {formatDate(v.expiryDate)}
                    </td>
                    <td className="p-4 text-center text-sage-700">
                      <span className="font-semibold">{v.usedCount}</span> / <span className="font-light text-sage-400">{v.usageLimit}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(v)}`}>
                        {getStatusText(v)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(v)}
                          className="p-1 hover:bg-primary-100 text-sage-600 hover:text-primary-850 cursor-pointer"
                          title="Chỉnh sửa voucher"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(v)}
                          className="p-1 hover:bg-red-50 text-sage-600 hover:text-red-700 cursor-pointer"
                          title="Xóa voucher"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 space-y-4 border border-primary-200">
            <div className="flex justify-between items-center border-b border-primary-50 pb-2">
              <h3 className="font-serif text-base font-semibold text-sage-955 flex items-center gap-1.5">
                <Ticket className="h-4.5 w-4.5 text-primary-800" />
                <span>{editingItem ? `Chỉnh sửa Voucher: ${editingItem.code}` : "Tạo Mã Giảm Giá Mới"}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-sage-400 hover:text-sage-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-sage-500 mb-1">Mã Voucher (Code)</label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().trim() })}
                    placeholder="Ví dụ: KHACHHANG20"
                    disabled={!!editingItem}
                    className="w-full px-3 py-2 border border-primary-200 focus:outline-primary-300 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-sage-500 mb-1">Loại giảm giá</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full p-2 border border-primary-200 focus:outline-primary-300 bg-white"
                  >
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số tiền mặt cố định (VND)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-sage-500 mb-1">Giá trị giảm giá</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    placeholder={form.discountType === "PERCENTAGE" ? "Ví dụ: 10" : "Ví dụ: 100000"}
                    className="w-full px-3 py-2 border border-primary-200 focus:outline-primary-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-sage-500 mb-1">Giảm tối đa (Chỉ áp dụng %)</label>
                  <input
                    type="number"
                    value={form.maxDiscountAmount}
                    onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                    placeholder="Không giới hạn"
                    disabled={form.discountType !== "PERCENTAGE"}
                    className="w-full px-3 py-2 border border-primary-200 focus:outline-primary-300 disabled:bg-sage-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-sage-500 mb-1">Hóa đơn tối thiểu (VND)</label>
                  <input
                    type="number"
                    value={form.minBookingAmount}
                    onChange={(e) => setForm({ ...form, minBookingAmount: e.target.value })}
                    placeholder="Ví dụ: 500000"
                    className="w-full px-3 py-2 border border-primary-200 focus:outline-primary-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-sage-500 mb-1">Giới hạn số lượt sử dụng</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-primary-200 focus:outline-primary-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-sage-500 mb-1">Ngày bắt đầu hoạt động</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-primary-200 focus:outline-primary-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-sage-500 mb-1">Ngày hết hạn sử dụng</label>
                  <input
                    type="date"
                    required
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-primary-200 focus:outline-primary-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-sage-500 mb-1">Trạng thái cấu hình</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full p-2 border border-primary-200 focus:outline-primary-300 bg-white"
                >
                  <option value="ACTIVE">Kích hoạt hoạt động (ACTIVE)</option>
                  <option value="DISABLED">Đình chỉ / Vô hiệu hóa (DISABLED)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-primary-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-primary-200 text-sage-700 hover:bg-primary-50 cursor-pointer uppercase tracking-wider"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-primary-850 hover:bg-primary-900 text-white font-semibold disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                >
                  {saving ? "Đang lưu..." : "Lưu lại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
