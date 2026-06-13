import { useState } from "react";
import {
  LayoutDashboard,
  Utensils,
  ShieldAlert,
  Clock,
  FileText,
  Package,
  X,
  Activity,
  LogOut,
  Flame,
} from "lucide-react";

import {
  chefInitialAllergies as initialAllergies,
  chefInitialFeedbacks as initialFeedbacks,
  chefInitialDishes as initialDishes,
  chefInitialOrders as initialOrders,
  chefInitialIngredients as initialIngredients,
  chefInitialRequests as initialRequests,
} from "../mockData";

// Import sub-components
import OperationLayout from "../layouts/OperationLayout";
import ChefOverview from "../components/chef/ChefOverview";
import ManageAllergies from "../components/chef/ManageAllergies";
import ManageMenu from "../components/chef/ManageMenu";
import ManageOrders from "../components/chef/ManageOrders";
import ManageDishes from "../components/chef/ManageDishes";
import ManageInventory from "../components/chef/ManageInventory";

export default function ChefDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Master System States
  const [allergies] = useState(initialAllergies);
  const [feedbacks] = useState(initialFeedbacks);
  const [dishes, setDishes] = useState(initialDishes);
  const [orders, setOrders] = useState(initialOrders);
  const [ingredients] = useState(initialIngredients);
  const [procurements, setProcurements] = useState(initialRequests);

  // KDS Voice Synthesizer Alert
  const playVoiceAlert = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "vi-VN";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Shared Handlers
  const handleToggleTodayMenu = (id) => {
    setDishes((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, isTodayMenu: !d.isTodayMenu } : d,
      ),
    );
  };

  const handleToggleSoldOut = (id) => {
    setDishes((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextState = !d.soldOut;
          alert(
            `Món ăn "${d.name}" đã được cập nhật thành: ${nextState ? "HẾT HÀNG" : "CÒN HÀNG"}`,
          );
          return { ...d, soldOut: nextState };
        }
        return d;
      }),
    );
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const order = orders.find((ord) => ord.id === orderId);
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return { ...ord, status: newStatus };
        }
        return ord;
      }),
    );
    const nextStatusText =
      newStatus === "Cooking" ? "bắt đầu chuẩn bị" : "hoàn thành";
    const msg = `Đơn hàng ${orderId} của phòng ${order?.room || ""} đã ${nextStatusText}`;
    playVoiceAlert(msg);
  };

  // Allergy Matching helper for orders
  const checkOrderAllergies = (order) => {
    const guestDiet = allergies.find(
      (a) =>
        a.guest.toLowerCase() === order.guestName.toLowerCase() ||
        a.room === order.room,
    );
    if (!guestDiet) return { hasAllergyAlert: false, matchedAllergens: [] };

    let matchedAllergens = [];
    order.items.forEach((item) => {
      const recipe = dishes.find((d) => d.name === item.name);
      if (recipe) {
        recipe.allergens.forEach((alg) => {
          if (guestDiet.allergies.includes(alg)) {
            matchedAllergens.push(alg);
          }
        });
      }
    });

    if (
      guestDiet.allergies.includes("Không ăn cay") &&
      order.items.some((it) => {
        const rec = dishes.find((d) => d.name === it.name);
        return rec && rec.allergens.includes("Cay");
      })
    ) {
      matchedAllergens.push("Cay (Món chứa ớt)");
    }

    return {
      hasAllergyAlert: matchedAllergens.length > 0,
      matchedAllergens,
    };
  };

  return (
    <OperationLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      handleLogout={() => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi khu vực bếp trực?"))
          window.location.href = "/dang-nhap";
      }}
      sidebarItems={[
        {
          id: "overview",
          label: "1. Bếp tổng quan",
          icon: LayoutDashboard,
        },
        {
          id: "allergies",
          label: "2. Cảnh báo dị ứng",
          icon: ShieldAlert,
        },
        {
          id: "menu",
          label: "3. Thực đơn hôm nay",
          icon: Utensils,
        },
        {
          id: "orders",
          label: "4. Đơn đặt món",
          icon: Clock,
        },
        { id: "dishes", label: "5. Danh mục món ăn", icon: FileText },
        {
          id: "inventory",
          label: "6. Kho & Gọi hàng",
          icon: Package,
        },
      ]}
      isMobileMenuOpen={isMobileMenuOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
      userRoleLabel="Bếp trưởng"
      headerTitle={
        activeTab === "overview" ? "1. Bảng Giám Sát Vận Hành Bếp Resort" :
        activeTab === "allergies" ? "2. Giám Sát Dị Ứng Khách Hàng (Allergen Monitor)" :
        activeTab === "menu" ? "3. Quản Lý Thực Đơn Hàng Ngày (Menu Today)" :
        activeTab === "orders" ? "4. Danh Sách Gọi Món & Tiến Độ Nấu" :
        activeTab === "dishes" ? "5. Cơ Sở Dữ Liệu Danh Mục Món Ăn" :
        activeTab === "inventory" ? "6. Kho Nguyên Liệu & Yêu Cầu Thu Mua" : "Quản lý bếp"
      }
      customHeaderRight={
        <div className="flex items-center space-x-2">
          <span className="bg-[#fef3c7] border border-[#fde68a] px-3 py-1 text-[10px] font-bold text-[#b45309] uppercase tracking-wider flex items-center space-x-1">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            <span>Nhà bếp hoạt động</span>
          </span>
        </div>
      }
    >
      {activeTab === "overview" && (
        <ChefOverview
          orders={orders}
          allergies={allergies}
          ingredients={ingredients}
          dishes={dishes}
          feedbacks={feedbacks}
          setActiveTab={setActiveTab}
          checkOrderAllergies={checkOrderAllergies}
        />
      )}

      {activeTab === "allergies" && <ManageAllergies allergies={allergies} />}

      {activeTab === "menu" && (
        <ManageMenu
          dishes={dishes}
          handleToggleSoldOut={handleToggleSoldOut}
          handleToggleTodayMenu={handleToggleTodayMenu}
        />
      )}

      {activeTab === "orders" && (
        <ManageOrders
          orders={orders}
          playVoiceAlert={playVoiceAlert}
          handleUpdateOrderStatus={handleUpdateOrderStatus}
          checkOrderAllergies={checkOrderAllergies}
        />
      )}

      {activeTab === "dishes" && (
        <ManageDishes dishes={dishes} setDishes={setDishes} />
      )}

      {activeTab === "inventory" && (
        <ManageInventory
          ingredients={ingredients}
          procurements={procurements}
          setProcurements={setProcurements}
        />
      )}
    </OperationLayout>
  );
}
