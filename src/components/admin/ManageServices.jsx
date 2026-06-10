import React, { useState, useEffect } from "react";
import { PlusCircle, RefreshCw, Edit2, Trash2, Package, Flower, Bed, AlertTriangle } from "lucide-react";
import { masterDataApi } from "../../api";

const CATEGORY_OPTIONS = ["BODY", "FACE", "YOGA", "PHYSIO", "MEDITATION", "OTHER"];

const TABS = [
  { id: "spa", label: "Dịch Vụ Spa", icon: Flower },
  { id: "retreat", label: "Gói Retreat", icon: Package },
  { id: "roomtype", label: "Loại Phòng", icon: Bed },
];

export default function ManageServices() {
  const [activeTab, setActiveTab] = useState("spa");
  const [spaServices, setSpaServices] = useState([]);
  const [retreatPackages, setRetreatPackages] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const [spaForm, setSpaForm] = useState({ name: "", description: "", category: "BODY", durationMinutes: 60, price: "", status: "ACTIVE" });
  const [retreatForm, setRetreatForm] = useState({ name: "", description: "", durationDays: 3, price: "", includes: "", status: "ACTIVE" });
  const [roomForm, setRoomForm] = useState({ typeName: "", description: "", basePricePerNight: "", maxOccupancy: 2, areaSqm: "" });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [spa, retreat, rooms] = await Promise.all([
        masterDataApi.getSpaServices(true),
        masterDataApi.getRetreatPackages(true),
        masterDataApi.getRoomTypes(),
      ]);
      setSpaServices(spa);
      setRetreatPackages(retreat);
      setRoomTypes(rooms);
    } catch (err) {
      setError("Không thể tải dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    if (activeTab === "spa") setSpaForm({ name: "", description: "", category: "BODY", durationMinutes: 60, price: "", status: "ACTIVE" });
    if (activeTab === "retreat") setRetreatForm({ name: "", description: "", durationDays: 3, price: "", includes: "", status: "ACTIVE" });
    if (activeTab === "roomtype") setRoomForm({ typeName: "", description: "", basePricePerNight: "", maxOccupancy: 2, areaSqm: "" });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    if (activeTab === "spa") setSpaForm({ name: item.name, description: item.description || "", category: item.category || "BODY", durationMinutes: item.durationMinutes || 60, price: item.price || "", status: item.status || "ACTIVE" });
    if (activeTab === "retreat") setRetreatForm({ name: item.name, description: item.description || "", durationDays: item.durationDays || 3, price: item.price || "", includes: item.includes || "", status: item.status || "ACTIVE" });
    if (activeTab === "roomtype") setRoomForm({ typeName: item.typeName, description: item.description || "", basePricePerNight: item.basePricePerNight || "", maxOccupancy: item.maxOccupancy || 2, areaSqm: item.areaSqm || "" });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (activeTab === "spa") {
        const dto = { ...spaForm, price: parseFloat(spaForm.price) };
        if (editingItem) await masterDataApi.updateSpaService(editingItem.serviceId, dto);
        else await masterDataApi.createSpaService(dto);
      } else if (activeTab === "retreat") {
        const dto = { ...retreatForm, price: parseFloat(retreatForm.price) };
        if (editingItem) await masterDataApi.updateRetreatPackage(editingItem.packageId, dto);
        else await masterDataApi.createRetreatPackage(dto);
      } else {
        const dto = { ...roomForm, basePricePerNight: parseFloat(roomForm.basePricePerNight), areaSqm: parseInt(roomForm.areaSqm) || null };
        if (editingItem) await masterDataApi.updateRoomType(editingItem.roomTypeId, dto);
        else await masterDataApi.createRoomType(dto);
      }
      setShowModal(false);
      await fetchAll();
    } catch (err) {
      setError(err.message || "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const name = item.name || item.typeName;
    if (!window.confirm(`Xóa "${name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      if (activeTab === "spa") await masterDataApi.deleteSpaService(item.serviceId);
      else if (activeTab === "retreat") await masterDataApi.deleteRetreatPackage(item.packageId);
      else await masterDataApi.deleteRoomType(item.roomTypeId);
      await fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const currentData = activeTab === "spa" ? spaServices : activeTab === "retreat" ? retreatPackages : roomTypes;

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header */}
      <div className="bg-white border border-primary-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-normal text-sage-950">Quản Lý Master Data – Dịch Vụ & Gói Nghỉ</h3>
          <p className="text-xs text-sage-500 mt-1">Quản lý danh mục dịch vụ Spa, gói Retreat và loại phòng. Kết nối database trực tiếp.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAll}
            className="px-4 py-2.5 border border-primary-200 text-primary-900 text-xs font-semibold flex items-center gap-1.5 hover:bg-primary-50 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-primary-800 hover:bg-primary-900 text-white text-xs font-semibold tracking-wider flex items-center gap-1.5 cursor-pointer uppercase"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Thêm Mới</span>
          </button>
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 bg-primary-50 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === tab.id ? "bg-white text-primary-900 shadow-sm" : "text-sage-600 hover:text-sage-800"}`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Data table */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 border-4 border-primary-800 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-primary-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-primary-50/50 text-sage-600 font-bold border-b border-primary-100">
                  <th className="p-4">ID</th>
                  <th className="p-4">Tên</th>
                  {activeTab === "spa" && <><th className="p-4">Danh mục</th><th className="p-4">Thời gian</th></>}
                  {activeTab === "retreat" && <th className="p-4">Số ngày</th>}
                  {activeTab === "roomtype" && <><th className="p-4">Sức chứa</th><th className="p-4">Diện tích</th></>}
                  <th className="p-4">Giá</th>
                  {(activeTab === "spa" || activeTab === "retreat") && <th className="p-4">Trạng thái</th>}
                  <th className="p-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50/50">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-sage-400">
                      Chưa có dữ liệu nào. Nhấn "Thêm Mới" để bắt đầu.
                    </td>
                  </tr>
                ) : (
                  currentData.map((item) => (
                    <tr key={item.serviceId || item.packageId || item.roomTypeId} className="hover:bg-primary-50/20">
                      <td className="p-4 font-mono text-sage-400">#{item.serviceId || item.packageId || item.roomTypeId}</td>
                      <td className="p-4 font-semibold text-sage-900">
                        {item.name || item.typeName}
                        {item.description && <p className="text-xs text-sage-400 mt-0.5 truncate max-w-48">{item.description}</p>}
                      </td>
                      {activeTab === "spa" && (
                        <>
                          <td className="p-4"><span className="px-2 py-0.5 bg-primary-100 text-primary-900 text-[10px] font-bold rounded">{item.category}</span></td>
                          <td className="p-4 text-sage-600">{item.durationMinutes} phút</td>
                        </>
                      )}
                      {activeTab === "retreat" && <td className="p-4 text-sage-600">{item.durationDays} ngày</td>}
                      {activeTab === "roomtype" && (
                        <>
                          <td className="p-4 text-sage-600">{item.maxOccupancy} người</td>
                          <td className="p-4 text-sage-600">{item.areaSqm ? `${item.areaSqm}m²` : "—"}</td>
                        </>
                      )}
                      <td className="p-4 font-bold text-sage-900">
                        {item.price || item.basePricePerNight ? `${Number(item.price || item.basePricePerNight).toLocaleString("vi-VN")} ₫` : "—"}
                      </td>
                      {(activeTab === "spa" || activeTab === "retreat") && (
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${item.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"}`}>
                            {item.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}
                          </span>
                        </td>
                      )}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded cursor-pointer">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(item)} className="p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer">
                            <Trash2 className="h-4 w-4" />
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
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold text-sage-900">
              {editingItem ? "Chỉnh Sửa" : "Tạo Mới"} – {TABS.find(t => t.id === activeTab)?.label}
            </h3>
            {error && <div className="p-3 bg-red-50 rounded-xl text-sm text-red-700">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === "spa" && (
                <>
                  <Field label="Tên Dịch Vụ *" value={spaForm.name} onChange={v => setSpaForm({...spaForm, name: v})} required />
                  <Field label="Mô tả" value={spaForm.description} onChange={v => setSpaForm({...spaForm, description: v})} textarea />
                  <div className="grid grid-cols-2 gap-3">
                    <SelectField label="Danh Mục" value={spaForm.category} options={CATEGORY_OPTIONS} onChange={v => setSpaForm({...spaForm, category: v})} />
                    <Field label="Thời gian (phút)" type="number" value={spaForm.durationMinutes} onChange={v => setSpaForm({...spaForm, durationMinutes: v})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Giá (VNĐ) *" type="number" value={spaForm.price} onChange={v => setSpaForm({...spaForm, price: v})} required />
                    <SelectField label="Trạng thái" value={spaForm.status} options={["ACTIVE", "INACTIVE"]} onChange={v => setSpaForm({...spaForm, status: v})} />
                  </div>
                </>
              )}
              {activeTab === "retreat" && (
                <>
                  <Field label="Tên Gói Retreat *" value={retreatForm.name} onChange={v => setRetreatForm({...retreatForm, name: v})} required />
                  <Field label="Mô tả" value={retreatForm.description} onChange={v => setRetreatForm({...retreatForm, description: v})} textarea />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Số ngày *" type="number" value={retreatForm.durationDays} onChange={v => setRetreatForm({...retreatForm, durationDays: v})} required />
                    <Field label="Giá (VNĐ) *" type="number" value={retreatForm.price} onChange={v => setRetreatForm({...retreatForm, price: v})} required />
                  </div>
                  <Field label="Bao gồm (dịch vụ kèm theo)" value={retreatForm.includes} onChange={v => setRetreatForm({...retreatForm, includes: v})} textarea />
                  <SelectField label="Trạng thái" value={retreatForm.status} options={["ACTIVE", "INACTIVE"]} onChange={v => setRetreatForm({...retreatForm, status: v})} />
                </>
              )}
              {activeTab === "roomtype" && (
                <>
                  <Field label="Tên Loại Phòng *" value={roomForm.typeName} onChange={v => setRoomForm({...roomForm, typeName: v})} required />
                  <Field label="Mô tả" value={roomForm.description} onChange={v => setRoomForm({...roomForm, description: v})} textarea />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Giá/đêm (VNĐ)" type="number" value={roomForm.basePricePerNight} onChange={v => setRoomForm({...roomForm, basePricePerNight: v})} />
                    <Field label="Sức chứa" type="number" value={roomForm.maxOccupancy} onChange={v => setRoomForm({...roomForm, maxOccupancy: v})} />
                  </div>
                  <Field label="Diện tích (m²)" type="number" value={roomForm.areaSqm} onChange={v => setRoomForm({...roomForm, areaSqm: v})} />
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setError(""); }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-sage-300 text-sage-700 hover:bg-sage-50 cursor-pointer">Hủy</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary-800 hover:bg-primary-900 text-white cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (editingItem ? "Cập Nhật" : "Tạo Mới")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper sub-components
function Field({ label, value, onChange, type = "text", required = false, textarea = false }) {
  const cls = "w-full p-2.5 border border-primary-200 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-800";
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className={cls} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} className={cls} />
      }
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full p-2.5 border border-primary-200 text-xs rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary-800">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
