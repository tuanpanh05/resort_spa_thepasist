import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bed,
  Users,
  Flower,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  Package,
  Lock,
  ShieldCheck,
  Clock,
  LogOut,
  Menu,
} from "lucide-react";

import {
  adminInitialAccounts as initialAccounts,
  adminInitialRooms as initialRooms,
  adminInitialServices as initialServices,
  adminInitialPayments as initialPayments,
  adminInitialFeedbacks as initialFeedbacks,
  adminInitialComplaints as initialComplaints,
  adminInitialInventory as initialInventory,
  adminInitialShifts as initialShifts,
  adminInitialSwapRequests as initialSwapRequests,
  adminInitialWarnings as initialWarnings,
  adminOccupancyChartData as occupancyChartData,
} from "../mockData";

// Import sub-components
import OperationLayout from "../layouts/OperationLayout";
import AdminOverview from "../components/admin/AdminOverview";
import ManageAccounts from "../components/admin/ManageAccounts";
import ManageRooms from "../components/admin/ManageRooms";
import ManageServices from "../components/admin/ManageServices";
import ManageSupport from "../components/admin/ManageSupport";
import ManagePayments from "../components/admin/ManagePayments";
import ManageShifts from "../components/admin/ManageShifts";
import ManageInventory from "../components/admin/ManageInventory";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Master states
  const [accounts, setAccounts] = useState(initialAccounts);
  const [rooms, setRooms] = useState(initialRooms);
  const [services, setServices] = useState(initialServices);
  const [payments, setPayments] = useState(initialPayments);
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);
  const [complaints, setComplaints] = useState(initialComplaints);
  const [inventory, setInventory] = useState(initialInventory);
  const [shifts] = useState(initialShifts);
  const [swapRequests, setSwapRequests] = useState(initialSwapRequests);
  const [warnings] = useState(initialWarnings);

  // Stats calculation
  const totalRoomsCount = rooms.length;
  const occupiedRoomsCount = rooms.filter(
    (r) => r.status === "occupied",
  ).length;
  const occupancyRate =
    totalRoomsCount > 0
      ? Math.round((occupiedRoomsCount / totalRoomsCount) * 100)
      : 0;

  // Sidebar config
  const sidebarItems = [
    { id: "dashboard", label: "Tổng Quan Vận Hành", icon: LayoutDashboard },
    { id: "users", label: "Quản Lý Tài Khoản", icon: Users },
    { id: "rooms", label: "Quản Lý Phòng Nghỉ", icon: Bed },
    { id: "services", label: "Quản Lý Dịch Vụ", icon: Flower },
    { id: "support", label: "Phản Hồi & Khiếu Nại", icon: MessageSquare },
    { id: "payments", label: "Nhật Ký Hóa Đơn", icon: CreditCard },
    { id: "shifts", label: "Điều Hành Ca Trực", icon: Clock },
    { id: "inventory", label: "Kho Vật Tư Tiêu Hao", icon: Package },
  ];

  // Room CRUD helper
  const handleDeleteRoom = (id) => {
    if (
      window.confirm(`Bạn có chắc chắn muốn xóa Phòng ${id} khỏi hệ thống?`)
    ) {
      setRooms((prev) => prev.filter((r) => r.id !== id));
      alert(`Phòng ${id} đã được xóa.`);
    }
  };

  const handleLogout = () => {
    alert("Đang đăng xuất khỏi phiên làm việc Admin...");
    navigate("/dang-nhap");
  };

  return (
    <OperationLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      handleLogout={handleLogout}
      sidebarItems={sidebarItems}
      isMobileMenuOpen={isMobileMenuOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
      userRoleLabel="Admin"
      headerTitle={
        activeTab === "dashboard" ? "1. Bảng Tổng Quan Vận Hành Resort" :
        activeTab === "users" ? "2. Quản Lý Tài Khoản (User Management)" :
        activeTab === "rooms" ? "3. Quản Lý Phòng & Loại Phòng Resort" :
        activeTab === "services" ? "4. Danh Mục Dịch Vụ Resort & Yoga" :
        activeTab === "support" ? "5. Cổng Tiếp Nhận & Hỗ Trợ Khách Hàng" :
        activeTab === "payments" ? "6. Sổ Nhật Ký Hóa Đơn & Giao Dịch" :
        activeTab === "shifts" ? "7. Điều Hành Ca Làm Việc & Attendance" :
        activeTab === "inventory" ? "8. Quản Lý Kho & Vật Tư Resort" : "Quản trị hệ thống"
      }
    >
      {activeTab === "dashboard" && (
        <AdminOverview
          accounts={accounts}
          rooms={rooms}
          warnings={warnings}
          occupancyRate={occupancyRate}
          occupiedRoomsCount={occupiedRoomsCount}
          setActiveTab={setActiveTab}
          occupancyChartData={occupancyChartData}
          payments={payments}
          swapRequests={swapRequests}
        />
      )}

      {activeTab === "users" && (
        <ManageAccounts />
      )}

      {activeTab === "rooms" && (
        <ManageRooms
          rooms={rooms}
          setRooms={setRooms}
          handleDeleteRoom={handleDeleteRoom}
        />
      )}

      {activeTab === "services" && (
        <ManageServices />
      )}

      {activeTab === "support" && (
        <ManageSupport
          feedbacks={feedbacks}
          setFeedbacks={setFeedbacks}
          complaints={complaints}
          setComplaints={setComplaints}
        />
      )}

      {activeTab === "payments" && (
        <ManagePayments payments={payments} setPayments={setPayments} />
      )}

      {activeTab === "shifts" && (
        <ManageShifts
          shifts={shifts}
          swapRequests={swapRequests}
          setSwapRequests={setSwapRequests}
        />
      )}

      {activeTab === "inventory" && (
        <ManageInventory
          inventory={inventory}
          setInventory={setInventory}
        />
      )}
    </OperationLayout>
  );
}
