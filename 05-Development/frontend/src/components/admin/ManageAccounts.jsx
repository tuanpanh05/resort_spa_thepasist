import React, { useState, useEffect } from "react";
import { PlusCircle, RefreshCw, ShieldCheck, Ban, Trash2, Edit2, AlertTriangle, Search, Users } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import Button from "../ui/Button";
import { adminApi } from "../../api";

const ROLE_OPTIONS = ["ADMIN", "STAFF", "THERAPIST", "CHEF", "RECEPTIONIST", "MANAGER"];
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "BANNED"];

const ROLE_BADGE = {
  ADMIN: "bg-purple-100 text-purple-800",
  STAFF: "bg-blue-100 text-blue-800",
  THERAPIST: "bg-teal-100 text-teal-800",
  CHEF: "bg-orange-100 text-orange-800",
  RECEPTIONIST: "bg-sky-100 text-sky-800",
  MANAGER: "bg-indigo-100 text-indigo-800",
  GUEST: "bg-gray-100 text-gray-600",
};

const STATUS_BADGE = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-yellow-100 text-yellow-800",
  BANNED: "bg-red-100 text-red-800",
};

export default function ManageAccounts() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", password: "", role: "STAFF", status: "ACTIVE",
  });
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone && user.phone.includes(searchQuery));
    const matchesRole = selectedRole === "ALL" || user.role === selectedRole;
    const matchesStatus = selectedStatus === "ALL" || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError("Không thể tải danh sách tài khoản: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ fullName: "", email: "", phone: "", password: "", role: "STAFF", status: "ACTIVE" });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ fullName: user.fullName, email: user.email, phone: user.phone || "", password: "", role: user.role, status: user.status });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingUser) {
        // UC03: Update role and status
        await adminApi.updateUser(editingUser.userId, formData.role, formData.status);
      } else {
        // UC03: Create new staff account
        if (!formData.password || formData.password.length < 6) {
          setError("Mật khẩu phải có ít nhất 6 ký tự.");
          setSaving(false);
          return;
        }
        await adminApi.createUser({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }, formData.role);
      }
      setShowModal(false);
      await fetchUsers();
    } catch (err) {
      setError(err.message || "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "ACTIVE" ? "BANNED" : "ACTIVE";
    const action = newStatus === "BANNED" ? "khóa" : "mở khóa";
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản ${user.fullName}?`)) return;
    try {
      await adminApi.updateUser(user.userId, user.role, newStatus);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Xóa vĩnh viễn tài khoản "${user.fullName}" (${user.email})? Hành động này không thể hoàn tác.`)) return;
    try {
      await adminApi.deleteUser(user.userId);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Phân Phối & Giám Sát Tài Khoản"
        description="Tạo tài khoản nhân sự mới, phân chia quyền hạn (RBAC) và giám sát trạng thái tài khoản."
      >
        <div className="flex gap-2">
          <Button onClick={fetchUsers} variant="outline" className="flex items-center gap-1.5">
            <RefreshCw className="h-4 w-4" />
            <span>Tải lại</span>
          </Button>
          <Button onClick={openCreateModal} variant="primary" className="flex items-center gap-1.5">
            <PlusCircle className="h-4 w-4" />
            <span>Tạo Tài Khoản Mới</span>
          </Button>
        </div>
      </SectionHeader>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary-50 text-primary-900 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider">Tổng nhân viên</p>
            <p className="text-2xl font-bold text-sage-900">{users.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider">Đang hoạt động</p>
            <p className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === "ACTIVE").length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Ban className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider">Đã khóa</p>
            <p className="text-2xl font-bold text-red-600">
              {users.filter(u => u.status === "BANNED").length}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-sage-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm theo họ tên, email, sđt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-primary-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800 bg-primary-50/20"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full md:w-40 px-3 py-2 rounded-xl border border-primary-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800 bg-white"
          >
            <option value="ALL">Tất cả vai trò</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-40 px-3 py-2 rounded-xl border border-primary-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800 bg-white"
          >
            <option value="ALL">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 border-4 border-primary-800 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-primary-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-primary-50 border-b border-primary-100">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-sage-700 text-xs uppercase tracking-wider">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-sage-700 text-xs uppercase tracking-wider">Họ tên</th>
                  <th className="text-left py-3 px-4 font-semibold text-sage-700 text-xs uppercase tracking-wider">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-sage-700 text-xs uppercase tracking-wider">Vai trò</th>
                  <th className="text-left py-3 px-4 font-semibold text-sage-700 text-xs uppercase tracking-wider">Trạng thái</th>
                  <th className="text-center py-3 px-4 font-semibold text-sage-700 text-xs uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-sage-400 text-sm">
                      {users.length === 0 ? "Chưa có tài khoản nhân sự nào." : "Không tìm thấy nhân viên phù hợp."}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.userId} className="hover:bg-primary-50/30 transition-colors">
                      <td className="py-3 px-4 text-sage-500 text-xs font-mono">#{user.userId}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-sage-900">{user.fullName}</p>
                        <p className="text-xs text-sage-500">{user.phone || "—"}</p>
                      </td>
                      <td className="py-3 px-4 text-sage-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${ROLE_BADGE[user.role] || "bg-gray-100 text-gray-600"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_BADGE[user.status] || ""}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            title="Chỉnh sửa vai trò"
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            title={user.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${user.status === "ACTIVE" ? "text-amber-500 hover:bg-amber-50" : "text-green-500 hover:bg-green-50"}`}
                          >
                            {user.status === "ACTIVE" ? <Ban className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            title="Xóa tài khoản"
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          >
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="font-serif text-xl font-bold text-sage-900 mb-6">
              {editingUser ? `Chỉnh sửa: ${editingUser.fullName}` : "Tạo Tài Khoản Nhân Sự Mới"}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingUser && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-sage-700 uppercase tracking-wider block mb-1">Họ và Tên *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-primary-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-sage-700 uppercase tracking-wider block mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-primary-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
                      placeholder="staff@nguson.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-sage-700 uppercase tracking-wider block mb-1">Số Điện Thoại</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-primary-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
                      placeholder="0901234567"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-sage-700 uppercase tracking-wider block mb-1">Mật Khẩu *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-primary-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
                      placeholder="Tối thiểu 6 ký tự"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-semibold text-sage-700 uppercase tracking-wider block mb-1">Vai Trò (Role) *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-primary-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800 bg-white"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <p className="text-xs text-sage-500 mt-1">
                  RBAC: Chef chỉ xem dị ứng thực phẩm | Therapist chỉ xem tình trạng thể lý | Receptionist không xem dữ liệu sức khỏe.
                </p>
              </div>

              {editingUser && (
                <div>
                  <label className="text-xs font-semibold text-sage-700 uppercase tracking-wider block mb-1">Trạng Thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-primary-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800 bg-white"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setError(""); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-sage-300 text-sage-700 hover:bg-sage-50 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary-900 hover:bg-primary-800 text-white transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (editingUser ? "Cập Nhật" : "Tạo Tài Khoản")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
