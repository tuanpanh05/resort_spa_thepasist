import { useState, useEffect } from "react";
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

import axiosClient from "../api/axiosClient";
import {
  chefInitialAllergies as initialAllergies,
  chefInitialFeedbacks as initialFeedbacks,
  chefInitialDishes as initialDishes,
  chefInitialOrders as initialOrders,
  chefInitialIngredients as initialIngredients,
  chefInitialRequests as initialRequests,
  staffInitialTables as initialTables,
} from "../mockData";

// Import sub-components
import ChefOverview from "../components/chef/ChefOverview";
import ManageAllergies from "../components/chef/ManageAllergies";
import ManageMenu from "../components/chef/ManageMenu";
import ManageOrders from "../components/chef/ManageOrders";
import UpcomingPrep from "../components/chef/UpcomingPrep";
import ManageDishes from "../components/chef/ManageDishes";
import ManageInventory from "../components/chef/ManageInventory";
import OperationSidebar from "../components/OperationSidebar";
import ManageTables from "../components/staff/ManageTables";

const extractFirstTable = (roomStr) => {
  if (!roomStr) return "N/A";
  let first = roomStr.split(',')[0].trim();
  return first.replace(/Room-/gi, "").replace(/Room/gi, "").replace(/Phòng /gi, "");
};

export default function ChefDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Master System States
  const [allergies, setAllergies] = useState([]);
  const [feedbacks] = useState(initialFeedbacks);
  const [dishes, setDishes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [procurements, setProcurements] = useState(initialRequests);
  const [tables, setTables] = useState(initialTables);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");

  const computeDynamicTables = (mappedOrders, baseTables) => {
    let currentTables = JSON.parse(JSON.stringify(baseTables));
    const activeRooms = {};

    mappedOrders.forEach(o => {
      if (o.status !== "Completed" && o.status !== "Cancelled" && o.room && o.room !== "N/A") {
        activeRooms[o.room] = o.guestName || "Khách Hàng";
      }
    });

    Object.keys(activeRooms).forEach(roomStr => {
      const existingTableIdx = currentTables.findIndex(t => t.id === roomStr);
      if (existingTableIdx >= 0) {
        currentTables[existingTableIdx].status = "Occupied";
        currentTables[existingTableIdx].currentGuest = activeRooms[roomStr];
      } else {
        currentTables.push({
          id: roomStr,
          status: "Occupied",
          capacity: 4, 
          currentGuest: activeRooms[roomStr]
        });
      }
    });

    return currentTables;
  };

  const fetchOrdersOnly = async (targetDate) => {
    try {
      const dateParam = targetDate ? `?date=${targetDate}` : "";
      const ordersRes = await axiosClient.get(`/chef/orders${dateParam}`);
      const mappedOrders = ordersRes.data.map(item => {
        return {
          id: item.id || `ORD-${item.orderId}`,
          orderId: item.orderId,
          guestName: item.guestName,
          room: extractFirstTable(item.room),
          origin: item.origin === "Room Service" ? "Tại Quán" : (item.origin || "Tại Quán"),
          items: item.items.map(it => ({
            name: it.name,
            qty: it.qty
          })),
          note: item.note,
          status: item.status,
          time: item.time,
          mealCode: item.mealCode
        };
      });
      setOrders(mappedOrders);
      setTables(computeDynamicTables(mappedOrders, tables));
    } catch (err) {
      console.warn("Could not fetch orders for date", err);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchOrdersOnly(selectedDate);
    }
  }, [selectedDate]);

  const fetchChefData = async () => {
    setLoading(true);
    try {
      const [menuRes, ordersRes, upcomingOrdersRes, allergiesRes, tablesRes] = await Promise.all([
        axiosClient.get("/chef/menu"),
        axiosClient.get("/chef/orders"),
        axiosClient.get("/chef/orders/upcoming"),
        axiosClient.get("/guest/chef/allergies"),
        axiosClient.get("/chef/tables")
      ]);

      const mappedAllergies = allergiesRes.data.map(item => {
        let algs = [];
        if (item.allergies && item.allergies !== "Không có") {
          algs = item.allergies.split(",").map(a => a.trim());
        }
        return {
          id: "ALG-" + item.userId,
          guest: item.fullName || "Khách Hàng",
          room: extractFirstTable(item.room),
          allergies: algs,
          dietary: item.dietary || "Healthy",
          checkIn: item.checkIn || "N/A"
        };
      });

      const currentDay = new Date().getDay();

      const mappedDishes = menuRes.data.map(item => {
        let allowedDays = [0, 1, 2, 3, 4, 5, 6];
        if (item.availableDays) {
          allowedDays = item.availableDays.split(',').map(Number);
        }
        const isToday = allowedDays.includes(currentDay);

        let cat = item.category || "Món chính";
        if (cat.trim().toLowerCase() === "food") cat = "Món chính";
        if (cat.trim().toLowerCase() === "drink") cat = "Thức uống";

        return {
          id: item.id || `DSH-${item.foodId}`,
          foodId: item.foodId,
          name: item.name,
          price: item.price,
          category: cat,
          description: item.description,
          ingredients: item.ingredients || "Thành phần tự nhiên",
          allergens: item.allergens || [],
          availableDays: item.availableDays || "0,1,2,3,4,5,6",
          dietaryTags: item.dietaryTags || "",
          image: item.image,
          isPackageIncluded: item.isPackageIncluded,
          periods: item.periods,
          isScheduledForToday: isToday,
          isTodayMenu: item.isTodayMenu !== false,
          soldOut: item.soldOut,
          enabled: true
        };
      });

      const mappedOrders = ordersRes.data.map(item => {
        return {
          id: item.id || `ORD-${item.orderId}`,
          orderId: item.orderId,
          guestName: item.guestName,
          room: extractFirstTable(item.room),
          origin: item.origin === "Room Service" ? "Tại Quán" : (item.origin || "Tại Quán"),
          items: item.items.map(it => ({
            name: it.name,
            qty: it.qty
          })),
          note: item.note,
          status: item.status,
          time: item.time,
          mealCode: item.mealCode
        };
      });

      const mappedUpcomingOrders = upcomingOrdersRes.data.map(item => {
        return {
          id: item.id || `ORD-${item.orderId}`,
          orderId: item.orderId,
          guestName: item.guestName,
          room: extractFirstTable(item.room),
          origin: item.origin === "Room Service" ? "Tại Quán" : item.origin,
          items: item.items.map(it => ({
            name: it.name,
            qty: it.qty,
            periods: it.periods
          })),
          note: item.note,
          status: item.status,
          date: item.date,
          time: item.time,
          period: item.period,
          mealCode: item.mealCode
        };
      });

      setAllergies(mappedAllergies);
      setDishes(mappedDishes);
      setOrders(mappedOrders);
      setUpcomingOrders(mappedUpcomingOrders);
      
      const realTables = tablesRes.data.map(t => ({
        id: t.id,
        status: t.status === "AVAILABLE" ? "Available" : "Occupied",
        capacity: t.capacity,
        currentGuest: null
      }));
      setTables(computeDynamicTables(mappedOrders, realTables));
    } catch (err) {
      console.warn("Could not fetch chef data from live server. Falling back to mock.", err);
      setDishes(initialDishes);
      setOrders(initialOrders);
      setAllergies(initialAllergies);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChefData();
  }, []);

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
  const handleToggleTodayMenu = async (id) => {
    const targetDish = dishes.find(d => d.id === id || d.foodId === id);
    if (!targetDish) return;
    const foodId = targetDish.foodId;
    try {
      await axiosClient.put(`/chef/menu/${foodId}/toggle-today`);
      setDishes((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, isTodayMenu: !d.isTodayMenu } : d,
        ),
      );
    } catch (err) {
      console.warn("Failed to toggle today menu on backend", err);
      setDishes((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, isTodayMenu: !d.isTodayMenu } : d,
        ),
      );
    }
  };

  const handleToggleSoldOut = async (id) => {
    const targetDish = dishes.find(d => d.id === id || d.foodId === id);
    if (!targetDish) return;
    const foodId = targetDish.foodId;
    try {
      await axiosClient.put(`/chef/menu/${foodId}/toggle-sold-out`);
      setDishes((prev) =>
        prev.map((d) => {
          if (d.id === id) {
            const nextState = !d.soldOut;
            alert(
              `Món ăn "${d.name}" đã được cập nhật thành: ${nextState ? "HẾT HÀ5" : "CÒN HÀNG"}`.replace("HẾT HÀ5", "HẾT HÀNG")
            );
            return { ...d, soldOut: nextState };
          }
          return d;
        }),
      );
    } catch (err) {
      console.warn("Failed to toggle sold out on backend", err);
      setDishes((prev) =>
        prev.map((d) => {
          if (d.id === id) {
            const nextState = !d.soldOut;
            alert(
              `Món ăn "${d.name}" đã được cập nhật thành: ${nextState ? "HẾT HÀNG" : "CÒN HÀNG"}`
            );
            return { ...d, soldOut: nextState };
          }
          return d;
        }),
      );
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const numericId = typeof orderId === "string" ? orderId.replace("ORD-", "") : orderId;
    try {
      await axiosClient.put(`/chef/orders/${numericId}/status?status=${newStatus}`);
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            return { ...ord, status: newStatus };
          }
          return ord;
        }),
      );
    } catch (err) {
      console.warn("Failed to update status on backend", err);
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            return { ...ord, status: newStatus };
          }
          return ord;
        }),
      );
    }
    const order = orders.find((ord) => ord.id === orderId);
    const nextStatusText =
      newStatus === "Cooking" ? "bắt đầu chuẩn bị" 
      : newStatus === "Delivering" ? "xong món, đang giao" 
      : newStatus === "Cancelled" ? "bị hủy" 
      : "hoàn thành giao hàng";
    const msg = `Đơn hàng ${orderId} của phòng ${order?.room || ""} đã ${nextStatusText}`;
    playVoiceAlert(msg);
  };

  // Allergy Matching helper for orders
  const handleCancelItem = async (orderId, foodId, dishName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy món "${dishName}" khỏi đơn hàng này do hết hàng?`)) return;

    const numericId = typeof orderId === "string" ? orderId.replace("ORD-", "") : orderId;
    try {
      await axiosClient.delete(`/chef/orders/${numericId}/item/${foodId}`);
      // Refresh orders
      fetchDashboardData();
      alert(`Đã hủy món "${dishName}" thành công.`);
    } catch (err) {
      console.warn("Failed to cancel item", err);
      alert("Lỗi khi hủy món: " + (err.response?.data?.message || err.response?.data || err.message));
    }
  };

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
    <div className="admin-theme min-h-screen bg-[#f7f8f6] flex flex-col lg:flex-row antialiased text-sage-950 font-sans pt-0 relative">
      {/* Mobile Top Header Bar */}
      <header className="lg:hidden w-full bg-[#1b2b11] text-white px-4 py-3 flex items-center justify-between shadow-md z-30">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-[#facc15] text-[#1b2b11] rounded-none">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-base font-bold leading-tight">
              Ngũ Sơn Bếp Trực
            </h1>
            <span className="text-[9px] text-[#facc15] font-bold tracking-wider uppercase block">
              Kitchen Hub
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-sage-800 text-white hover:bg-sage-750 transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Utensils className="h-6 w-6" />
          )}
        </button>
      </header>

      {/* Backdrop for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-20"
        />
      )}

      <OperationSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        userRoleLabel="Executive Chef"
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
              badge: `${allergies.filter((a) => a.allergies.length > 0).length}`,
            },
            {
              id: "menu",
              label: "3. Thực đơn hôm nay",
              icon: Utensils,
              badge: `${dishes.filter((d) => d.isTodayMenu).length}`,
            },
            {
              id: "orders",
              label: "4. Đơn đặt món",
              icon: Clock,
              badge: `${orders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled").length}`,
            },
            {
              id: "upcoming",
              label: "5. Đơn Combo Đặt Trước",
              icon: Package,
              badge: `${upcomingOrders.length}`,
            },
            { id: "dishes", label: "6. Danh mục món ăn", icon: FileText },
            {
              id: "inventory",
              label: "7. Kho & Gọi hàng",
              icon: Package,
              badge: `${ingredients.filter((i) => i.status !== "Đầy đủ").length}`,
            },
            {
              id: "tables",
              label: "8. Quản Lý Bàn",
              icon: LayoutDashboard,
            },
          ]}
      />

      {/* Main Content Area */}
      <main className="flex-grow min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-primary-200 mb-6 gap-3">
          <div>
            <h2 className="dashboard-title text-primary-950">
              {activeTab === "overview" &&
                "1. Bảng Giám Sát Vận Hành Bếp Resort"}
              {activeTab === "allergies" &&
                "2. Giám Sát Dị Ứng Khách Hàng (Allergen Monitor)"}
              {activeTab === "menu" &&
                "3. Quản Lý Thực Đơn Hàng Ngày (Menu Today)"}
              {activeTab === "orders" && "4. Danh Sách Gọi Món & Tiến Độ Nấu"}
              {activeTab === "upcoming" && "5. Quản Lý Đơn Combo Đặt Trước (Upcoming Combos)"}
              {activeTab === "dishes" && "6. Cơ Sở Dữ Liệu Danh Mục Món Ăn"}
              {activeTab === "inventory" &&
                "7. Kho Nguyên Liệu & Yêu Cầu Thu Mua"}
              {activeTab === "tables" &&
                "8. Sơ Đồ Bàn & Đặt Bàn Nhanh"}
            </h2>
            <p className="text-[11px] text-sage-500 font-medium mt-0.5">
              Tiêu chuẩn vận hành: Tuyệt đối an toàn sức khỏe & Vệ sinh an toàn thực phẩm
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="bg-[#fef3c7] border border-[#fde68a] px-3 py-1 text-[10px] font-bold text-[#b45309] uppercase tracking-wider flex items-center space-x-1">
              <Activity className="h-3.5 w-3.5 animate-pulse" />
              <span>Nhà bếp hoạt động</span>
            </span>
          </div>
        </header>

        {/* Tab Render Router */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-sage-200">
            <span className="animate-spin h-8 w-8 border-4 border-sage-800 border-t-transparent rounded-full" />
            <span className="mt-4 text-xs font-semibold text-sage-500 uppercase tracking-widest">
              Đang tải dữ liệu nhà bếp trực tuyến...
            </span>
          </div>
        ) : (
          <>
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
                orders={orders}
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
                handleCancelItem={handleCancelItem}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            )}

            {activeTab === "upcoming" && (
              <UpcomingPrep
                upcomingOrders={upcomingOrders}
                handleUpdateOrderStatus={handleUpdateOrderStatus}
              />
            )}

            {activeTab === "dishes" && (
              <ManageDishes dishes={dishes} setDishes={setDishes} />
            )}

            {activeTab === "inventory" && (
              <ManageInventory
                ingredients={ingredients}
                setIngredients={setIngredients}
                procurements={procurements}
                setProcurements={setProcurements}
              />
            )}

            {activeTab === "tables" && (
              <ManageTables
                tables={tables}
                setTables={setTables}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
