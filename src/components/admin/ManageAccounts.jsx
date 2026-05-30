import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import Button from "../ui/Button";
import AccountTable from "./AccountTable";
import { AccountModalForm } from "./ModalForm";

export default function ManageAccounts({
  accounts,
  setAccounts,
  handleToggleAccountStatus,
  handleResetPassword,
}) {
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountForm, setAccountForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Staff",
    status: "Active",
    department: "",
  });

  const triggerAddModal = () => {
    setAccountForm({
      name: "",
      email: "",
      phone: "",
      role: "Staff",
      status: "Active",
      department: "",
    });
    setShowAddAccountModal(true);
  };

  const triggerEditModal = (acc) => {
    setSelectedAccount(acc);
    setAccountForm({
      name: acc.name,
      email: acc.email,
      phone: acc.phone,
      role: acc.role,
      status: acc.status,
      department: acc.department || "",
    });
    setShowEditAccountModal(true);
  };

  const localSubmitCreate = (e) => {
    e.preventDefault();
    if (!accountForm.name || !accountForm.email || !accountForm.phone) {
      alert("Vui lòng điền đầy đủ thông tin tài khoản.");
      return;
    }
    const newAcc = {
      id: `ACC-${Math.floor(100 + Math.random() * 900)}`,
      ...accountForm,
      dateCreated: new Date().toISOString().split("T")[0],
    };
    setAccounts((prev) => [...prev, newAcc]);
    setShowAddAccountModal(false);
    alert("Tài khoản mới đã được tạo thành công.");
  };

  const localSubmitUpdate = (e) => {
    e.preventDefault();
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === selectedAccount.id ? { ...acc, ...accountForm } : acc,
      ),
    );
    setShowEditAccountModal(false);
    alert("Thông tin tài khoản đã được cập nhật.");
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header controls */}
      <SectionHeader
        title="Phân Phối & Giám Sát Tài Khoản"
        description="Tạo tài khoản mới, phân chia cấp bậc quyền hạn, khóa hoặc mở khóa tài khoản thành viên."
      >
        <Button
          onClick={triggerAddModal}
          variant="primary"
          className="flex items-center space-x-1.5 w-full sm:w-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Tạo Tài Khoản Mới</span>
        </Button>
      </SectionHeader>

      {/* Account List view */}
      <AccountTable
        accounts={accounts}
        triggerEditModal={triggerEditModal}
        handleToggleAccountStatus={handleToggleAccountStatus}
        handleResetPassword={handleResetPassword}
      />

      {/* Add Account Modal */}
      <AccountModalForm
        isOpen={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
        title="Tạo Tài Khoản Nhân Sự Mới"
        formState={accountForm}
        setFormState={setAccountForm}
        onSubmit={localSubmitCreate}
        isEdit={false}
      />

      {/* Edit Account Modal */}
      <AccountModalForm
        isOpen={showEditAccountModal}
        onClose={() => setShowEditAccountModal(false)}
        title={`Chỉnh Sửa Tài Khoản: ${selectedAccount?.id}`}
        formState={accountForm}
        setFormState={setAccountForm}
        onSubmit={localSubmitUpdate}
        isEdit={true}
      />
    </div>
  );
}
