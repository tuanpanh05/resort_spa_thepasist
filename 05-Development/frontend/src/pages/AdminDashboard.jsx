import { useState, useEffect } from "react";
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
import { paymentApi, staffApi, complaintsApi } from "../api";

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
import AdminSidebar from "../components/admin/AdminSidebar";
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
  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState(initialServices);
  const [payments, setPayments] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [inventory, setInventory] = useState(() => {
    const local = localStorage.getItem("admin_inventory");
    return local ? JSON.parse(local) : initialInventory;
  });
  const [shifts, setShifts] = useState(() => {
    const local = localStorage.getItem("admin_shifts");
    return local ? JSON.parse(local) : [
      { id: 1, name: "Lê Thị Thu", role: "Lễ tân chính", time: "Ca Sáng (06:00 - 14:00)", department: "Lễ tân", status: "Checked-in" },
      { id: 2, name: "Nguyễn Văn Huy", role: "Trưởng bộ phận Spa", time: "Ca Chiều (14:00 - 22:00)", department: "Bộ phận Spa", status: "Checked-in" },
      { id: 3, name: "Phạm Văn Long", role: "Kỹ thuật viên", time: "Ca Đêm (22:00 - 06:00)", department: "Kỹ thuật", status: "Absent" }
    ];
  });
  const [swapRequests, setSwapRequests] = useState(() => {
    const local = localStorage.getItem("admin_swap_requests");
    return local ? JSON.parse(local) : [
      {
        id: 201,
        sender: "Lê Thị Thu",
        shift: "Ca Sáng (06:00 - 14:00)",
        date: "2026-05-26",
        receiver: "Nguyễn Văn Huy",
        reason: "Giải quyết việc gia đình đột xuất",
        status: "Pending"
      }
    ];
  });

  const loadRooms = async () => {
    try {
      const data = await staffApi.getVillas();
      const mapped = data.map((v) => {
        let mappedStatus = "vacant";
        if (v.status === "OCCUPIED" || v.status === "DEPOSITED") {
          mappedStatus = "occupied";
        } else if (v.status === "MAINTENANCE") {
          mappedStatus = "maintenance";
        } else if (v.status === "DIRTY" || v.status === "CLEANING" || v.status === "VACANT_NEEDS_CLEANING") {
          mappedStatus = "cleaning";
        }
        return {
          id: v.roomNumber,
          roomId: v.roomId,
          type: v.roomTypeName || "Standard",
          status: mappedStatus,
          floor: parseInt(v.roomNumber?.split("-")[1]?.charAt(0)) || 1,
          price: (v.basePrice || 1800000).toLocaleString("vi-VN") + "đ",
          maxGuests: v.capacity || 2,
          photo: v.roomTypeName?.includes("Bungalow Gỗ")
            ? "room_luxury.png"
            : v.roomTypeName?.includes("Biệt Thự")
              ? "hero_bg.png"
              : "room_community.png",
        };
      });
      setRooms(mapped);
    } catch (err) {
      console.error("Error loading rooms:", err);
    }
  };

  const loadComplaints = async () => {
    try {
      const data = await complaintsApi.getAllComplaints();
      const mapped = data.map((c) => ({
        id: c.id,
        roomId: c.roomNumber,
        customerName: c.guestName,
        details: c.content,
        timeReceived: new Date(c.createdAt).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
        }),
        status: c.status,
        solution: c.feedback || "",
      }));
      setComplaints(mapped);
    } catch (err) {
      console.error("Error loading complaints:", err);
    }
  };

  const loadFeedbacks = async () => {
    try {
      const data = await paymentApi.getAllFeedbacks(true); // Get all, including toxic
      const mapped = data.map((f) => ({
        id: f.feedbackId,
        customerName: f.userFullName || "Khách ẩn danh",
        serviceUsed: `Gói Đặt #${f.bookingId}`,
        date: new Date(f.createdAt).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        rating: f.rating,
        comment: f.comment,
        isToxic: f.isToxic,
        reply: f.isToxic ? "[Bị ẩn vì chứa nội dung độc hại]" : "",
      }));
      setFeedbacks(mapped);
    } catch (err) {
      console.error("Error loading feedbacks:", err);
    }
  };

  const loadPayments = async () => {
    try {
      const data = await paymentApi.getAllInvoices();
      setPayments(data || []);
    } catch (err) {
      console.error("Error loading payments:", err);
    }
  };

  useEffect(() => {
    Promise.all([
      loadRooms(),
      loadComplaints(),
      loadFeedbacks(),
      loadPayments()
    ]).catch((err) => {
      console.error("Error initializing dashboard data:", err);
    });
  }, []);

  // Save local data to localStorage when they change
  useEffect(() => {
    localStorage.setItem("admin_inventory", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("admin_shifts", JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem("admin_swap_requests", JSON.stringify(swapRequests));
  }, [swapRequests]);

  // Room CRUD handlers
  const handleCreateRoom = async (roomData) => {
    try {
      const payload = {
        roomNumber: roomData.id,
        roomTypeName: roomData.type,
        status: "AVAILABLE",
      };
      await staffApi.createVilla(payload);
      await loadRooms();
      return true;
    } catch (err) {
      alert("Lỗi khi thêm phòng: " + err.message);
      return false;
    }
  };

  const handleUpdateRoom = async (roomId, roomData) => {
    try {
      const payload = {
        roomNumber: roomData.id,
        roomTypeName: roomData.type,
        status: roomData.status === "vacant" ? "AVAILABLE" : roomData.status === "occupied" ? "OCCUPIED" : roomData.status === "cleaning" ? "DIRTY" : "MAINTENANCE",
      };
      await staffApi.updateVilla(roomId, payload);
      await loadRooms();
      return true;
    } catch (err) {
      alert("Lỗi khi cập nhật phòng: " + err.message);
      return false;
    }
  };

  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (
      window.confirm(`Bạn có chắc chắn muốn xóa Phòng ${roomNumber} khỏi hệ thống?`)
    ) {
      try {
        await staffApi.deleteVilla(roomId);
        await loadRooms();
        alert(`Phòng ${roomNumber} đã được xóa thành công.`);
      } catch (err) {
        alert("Lỗi khi xóa phòng: " + err.message);
      }
    }
  };

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

  const handleLogout = () => {
    alert("Đang đăng xuất khỏi phiên làm việc Admin...");
    navigate("/dang-nhap");
  };

  return (
    <div className="admin-theme min-h-screen bg-primary-50 flex flex-col lg:flex-row text-left relative">
      {/* Mobile Top Navbar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-primary-950 text-white sticky top-0 z-40 shadow-md">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-primary-850 rounded text-white">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="font-serif text-sm font-normal tracking-wide">
            Ngũ Sơn Admin
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 focus:outline-none cursor-pointer"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Sidebar Layout */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
        sidebarItems={sidebarItems}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-y-auto max-h-screen custom-scrollbar min-w-0">
        {/* Top Header navbar */}
        <header className="h-16 bg-white border-b border-primary-100 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h1 className="font-serif text-lg font-normal text-sage-950">
              {activeTab === "dashboard" && "1. Bảng Tổng Quan Vận Hành Resort"}
              {activeTab === "users" &&
                "2. Quản Lý Tài Khoản (User Management)"}
              {activeTab === "rooms" && "3. Quản Lý Phòng & Loại Phòng Resort"}
              {activeTab === "services" && "4. Danh Mục Dịch Vụ Resort & Yoga"}
              {activeTab === "support" &&
                "5. Cổng Tiếp Nhận & Hỗ Trợ Khách Hàng"}
              {activeTab === "payments" && "6. Sổ Nhật Ký Hóa Đơn & Giao Dịch"}
              {activeTab === "shifts" &&
                "7. Điều Hành Ca Làm Việc & Attendance"}
              {activeTab === "inventory" && "8. Quản Lý Kho & Vật Tư Resort"}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-[10px] font-bold text-primary-900 bg-primary-100 px-3 py-1 uppercase tracking-wider">
              Phiên trực: System Admin
            </span>
          </div>
        </header>

        {/* Scrollable views content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === "dashboard" && (
            <AdminOverview
              accounts={accounts}
              rooms={rooms}
              complaints={complaints}
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
              handleCreateRoom={handleCreateRoom}
              handleUpdateRoom={handleUpdateRoom}
              handleDeleteRoom={handleDeleteRoom}
            />
          )}

          {activeTab === "services" && (
            <ManageServices />
          )}

          {activeTab === "support" && (
            <ManageSupport
              feedbacks={feedbacks}
              complaints={complaints}
              loadFeedbacks={loadFeedbacks}
              loadComplaints={loadComplaints}
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
        </div>
      </main>
    </div>
  );
}
