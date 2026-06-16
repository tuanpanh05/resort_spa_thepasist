import React, { useState } from "react";
import { Edit, Lock, Unlock, KeyRound } from "lucide-react";
import { Table } from "../ui/Table";
import Button from "../ui/Button";

export default function AccountTable({
  accounts,
  triggerEditModal,
  handleToggleAccountStatus,
  handleResetPassword,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filtering accounts
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || acc.role === roleFilter;
    const matchesStatus = statusFilter === "all" || acc.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const headers = [
    "Mã User",
    "Họ và Tên",
    "Email",
    "Số điện thoại",
    "Quyền (Role)",
    "Trực bộ phận",
    "Trạng thái",
    "Tác vụ quản trị",
  ];

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="bg-primary-50/50 border border-primary-100 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm theo tên, email, mã user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-primary-200 bg-white focus:outline-primary-300"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-2 text-xs border border-primary-200 bg-white focus:outline-primary-300 flex-1 md:flex-initial"
          >
            <option value="all">Tất cả chức vụ</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Staff">Staff</option>
            <option value="Chef">Chef</option>
            <option value="Spa">Spa</option>
            <option value="Yoga">Yoga</option>
            <option value="Physio">Physio</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 text-xs border border-primary-200 bg-white focus:outline-primary-300 flex-1 md:flex-initial"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Active">Đang chạy</option>
            <option value="Blocked">Đã khóa</option>
          </select>
        </div>
      </div>

      {/* Account Table */}
      <Table headers={headers}>
        {filteredAccounts.map((acc) => (
          <tr key={acc.id} className="hover:bg-primary-50/10">
            <td className="p-4 font-bold text-primary-950">{acc.id}</td>
            <td className="p-4 font-bold text-sage-950">{acc.name}</td>
            <td className="p-4 text-sage-700">{acc.email}</td>
            <td className="p-4 text-sage-700 font-mono">{acc.phone}</td>
            <td className="p-4">
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  acc.role === "Admin"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : acc.role === "Manager"
                      ? "bg-amber-50 text-amber-700 border-amber-250"
                      : acc.role === "Staff"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : acc.role === "Chef"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : acc.role === "Spa"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-250"
                            : acc.role === "Yoga"
                              ? "bg-rose-50 text-rose-700 border-rose-250"
                              : acc.role === "Physio"
                                ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                                : "bg-green-50 text-green-700 border-green-200"
                }`}
              >
                {acc.role}
              </span>
            </td>
            <td className="p-4 text-sage-600 font-medium">
              {acc.department || "-"}
            </td>
            <td className="p-4">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  acc.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {acc.status === "Active" ? "Đang chạy" : "Đã Khóa"}
              </span>
            </td>
            <td className="p-4 text-center">
              <div className="flex items-center justify-center space-x-1.5">
                <button
                  onClick={() => triggerEditModal(acc)}
                  className="p-1.5 bg-primary-50 hover:bg-primary-100 text-primary-950 rounded-none cursor-pointer"
                  title="Sửa quyền / Thông tin"
                >
                  <Edit className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleToggleAccountStatus(acc.id)}
                  className={`p-1.5 rounded-none cursor-pointer ${
                    acc.status === "Active"
                      ? "bg-red-50 hover:bg-red-100 text-red-700"
                      : "bg-green-50 hover:bg-green-100 text-green-700"
                  }`}
                  title={acc.status === "Active" ? "Khóa tài khoản" : "Mở khóa"}
                >
                  {acc.status === "Active" ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Unlock className="h-4 w-4" />
                  )}
                </button>

                <button
                  onClick={() => handleResetPassword(acc.name)}
                  className="p-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-850 rounded-none cursor-pointer"
                  title="Reset Password"
                >
                  <KeyRound className="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {filteredAccounts.length === 0 && (
          <tr>
            <td
              colSpan={headers.length}
              className="p-8 text-center text-xs text-sage-400 italic"
            >
              Không tìm thấy tài khoản nhân sự nào phù hợp.
            </td>
          </tr>
        )}
      </Table>
    </div>
  );
}
