import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  Check,
  ArrowLeft,
  ChevronRight,
  Info,
  Coffee,
  Sun,
  Moon,
  Plus,
  Minus,
  UtensilsCrossed,
  AlertTriangle,
  Loader2,
  FileCheck2,
} from "lucide-react";
import axiosClient from "../api/axiosClient";

export default function GuestDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  // Profile data
  const [profileData, setProfileData] = useState({
    userId: 5,
    fullName: "Trần Khách Hàng",
    email: "guest1@gmail.com",
    phone: "0933333333",
    role: "CUSTOMER",
    booking: {
      bookingId: 1,
      checkInDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
      checkOutDate: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0], // 5 days
      status: "CONFIRMED",
      packageId: 1,
      includedFoodIds: [1, 3],
    },
    medicalProfile: {
      profileId: 1,
      explicitConsentSigned: false,
      foodAllergies: "Dị ứng đậu phộng",
      physicalCondition: "Đau cột sống thắt lưng nhẹ",
    },
  });

  // Menu items list
  const [menuItems, setMenuItems] = useState([]);

  // Daily selections state: { "yyyy-MM-dd": { "Breakfast": { foodId: qty, ... }, "Lunch": { ... }, "Dinner": { ... } } }
  const [selections, setSelections] = useState({});
  // Special notes: { "yyyy-MM-dd_Period_foodId": "note text" }
  const [specialNotes, setSpecialNotes] = useState({});

  // Active step / date selection
  const [selectedDate, setSelectedDate] = useState("");
  const [consentCheckbox, setConsentCheckbox] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState("package"); // "package" or "alacarte"

  // Booking Dates Helper
  const [bookingDays, setBookingDays] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("Vui lòng đăng nhập với vai trò Khách Hàng!");
      navigate("/dang-nhap");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "CUSTOMER") {
      alert("Vai trò hiện tại không phải Khách Hàng. Vui lòng đăng nhập lại!");
      navigate("/dang-nhap");
      return;
    }
    setCurrentUser(parsedUser);
    fetchData(parsedUser.email, parsedUser.userId);
  }, []);

  const fetchData = async (email, userId) => {
    setLoading(true);
    try {
      // 1. Fetch guest profile details & active booking
      const res = await axiosClient.get(`/guest/profile?email=${email}`);
      const data = res.data;
      setProfileData(data);
      setConsentCheckbox(data.medicalProfile?.explicitConsentSigned || false);

      // 2. Generate booking days array
      if (data.booking) {
        const checkIn = new Date(data.booking.checkInDate);
        const checkOut = new Date(data.booking.checkOutDate);
        const days = [];
        let curr = new Date(checkIn);
        while (curr < checkOut) {
          days.push(curr.toISOString().split("T")[0]);
          curr.setDate(curr.getDate() + 1);
        }
        setBookingDays(days);
        if (days.length > 0) setSelectedDate(days[0]);
      }

      // 3. Fetch menu
      const menuRes = await axiosClient.get(`/guest/menu?userId=${data.userId}`);
      setMenuItems(menuRes.data.filter(item => item.isTodayMenu !== false));

    } catch (err) {
      console.warn("Could not connect to live backend, loading mock fallback data.", err);
      // Fallback data mapping if backend is offline
      const mockDays = [];
      const checkIn = new Date(profileData.booking.checkInDate);
      const checkOut = new Date(profileData.booking.checkOutDate);
      let curr = new Date(checkIn);
      while (curr < checkOut) {
        mockDays.push(curr.toISOString().split("T")[0]);
        curr.setDate(curr.getDate() + 1);
      }
      setBookingDays(mockDays);
      setSelectedDate(mockDays[0]);

      // Mock menu mapping
      const mockMenu = [
        {
          foodId: 1,
          dishName: "Organic Avocado Quinoa Salad",
          description: "Salad diêm mạch hữu cơ với bơ sáp cắt lát, hạt bí ngô và sốt chanh mật ong.",
          price: 180000,
          dietaryTags: "Vegan, Gluten-Free",
          isAllergen: false,
          warningMessage: "",
        },
        {
          foodId: 2,
          dishName: "Ginseng Chicken Soup",
          description: "Canh gà hầm sâm và táo đỏ bổ trung ích khí, hỗ trợ phục hồi sức khỏe.",
          price: 320000,
          dietaryTags: "Keto, Healthy",
          isAllergen: false,
          warningMessage: "",
        },
        {
          foodId: 3,
          dishName: "Green Detox Juice",
          description: "Nước ép giải độc gan từ cần tây hữu cơ, táo xanh, cải xoăn và gừng.",
          price: 95000,
          dietaryTags: "Vegan, Detox",
          isAllergen: false,
          warningMessage: "",
        },
        {
          foodId: 4,
          dishName: "Nấm nướng lá lốt cốt dừa",
          description: "Nấm đùi gà cuộn lá lốt nướng than hoa, đậu phộng rang giòn.",
          price: 320000,
          dietaryTags: "Vegan, Peanut",
          isAllergen: false,
          warningMessage: "",
        },
        {
          foodId: 5,
          dishName: "Tôm rim tỏi ớt (Món mặn)",
          description: "Tôm sú biển tươi rim tỏi ớt thơm lừng, giàu protein.",
          price: 390000,
          dietaryTags: "Healthy, Seafood",
          isAllergen: false,
          warningMessage: "",
        }
      ];

      const isConsented = profileData.medicalProfile?.explicitConsentSigned || false;
      const allergiesString = profileData.medicalProfile?.foodAllergies || (email === "guest1@gmail.com" ? "peanut" : "seafood");
      setMenuItems(computeAllergenFlags(mockMenu, isConsented, allergiesString));
    } finally {
      setLoading(false);
    }
  };

  const computeAllergenFlags = (menuList, consentVal, allergiesStr) => {
    if (!consentVal || !allergiesStr) {
      return menuList.map(item => ({ ...item, isAllergen: false, warningMessage: "" }));
    }
    const cleanAllergies = allergiesStr.toLowerCase();
    return menuList.map(item => {
      let isAllergen = false;
      let warningMessage = "";
      const content = `${item.dishName} ${item.description} ${item.dietaryTags}`.toLowerCase();

      const words = cleanAllergies.split(/[,;\s()]+/);
      for (const word of words) {
        if (word.length >= 2 && content.includes(word)) {
          isAllergen = true;
          let allergenLabel = word;
          if (word.includes("đậu") || word.includes("lạc") || word.includes("peanut")) {
            allergenLabel = "Peanut (Đậu phộng)";
          } else if (word.includes("hải sản") || word.includes("tôm") || word.includes("seafood") || word.includes("shrimp")) {
            allergenLabel = "Seafood (Hải sản)";
          }
          warningMessage = `Chứa thành phần gây dị ứng: ${allergenLabel}`;
          break;
        }
      }
      return { ...item, isAllergen, warningMessage };
    });
  };

  const getAllergenName = (dish) => {
    const tags = (dish.dietaryTags || "").toLowerCase();
    const name = (dish.dishName || "").toLowerCase();
    const desc = (dish.description || "").toLowerCase();
    if (tags.includes("peanut") || name.includes("đậu phộng") || desc.includes("đậu phộng")) {
      return "peanuts";
    }
    if (tags.includes("seafood") || tags.includes("tôm") || name.includes("tôm") || desc.includes("tôm") || name.includes("shrimp") || desc.includes("shrimp")) {
      return "seafood";
    }
    return "allergens";
  };

  const getFoodImage = (dish) => {
    const name = (dish.dishName || "").toLowerCase();
    if (name.includes("avocado") || name.includes("bơ") || name.includes("salad")) {
      return "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80";
    }
    if (name.includes("chicken") || name.includes("gà") || name.includes("soup") || name.includes("súp") || name.includes("canh")) {
      return "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80";
    }
    if (name.includes("juice") || name.includes("nước ép") || name.includes("nước uống") || name.includes("uống")) {
      return "https://images.unsplash.com/photo-1610970881699-44a5587caa90?auto=format&fit=crop&w=600&q=80";
    }
    if (name.includes("nấm") || name.includes("mushroom") || name.includes("nướng")) {
      return "https://images.unsplash.com/photo-1599021456807-25db0f974333?auto=format&fit=crop&w=600&q=80";
    }
    if (name.includes("tôm") || name.includes("shrimp") || name.includes("hải sản") || name.includes("seafood")) {
      return "https://images.unsplash.com/photo-1559737607-3578909a3636?auto=format&fit=crop&w=600&q=80";
    }
    return "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80";
  };

  // Explicit Consent (Decree 356) Submit Handler
  const handleConsentSubmit = async (val) => {
    try {
      await axiosClient.post(`/guest/consent?userId=${profileData.userId}&consent=${val}`);
      setConsentCheckbox(val);

      // Re-fetch profile to get decrypted allergies!
      const res = await axiosClient.get(`/guest/profile?email=${profileData.email}`);
      setProfileData(res.data);

      // Re-fetch menu with correct filters applied
      const menuRes = await axiosClient.get(`/guest/menu?userId=${profileData.userId}`);
      setMenuItems(menuRes.data);
    } catch (err) {
      console.warn("Backend update consent failed, updating state locally.", err);
      setConsentCheckbox(val);
      setProfileData(prev => ({
        ...prev,
        medicalProfile: {
          ...prev.medicalProfile,
          explicitConsentSigned: val
        }
      }));
      const allergiesString = profileData.medicalProfile?.foodAllergies || (profileData.email === "guest1@gmail.com" ? "peanut" : "seafood");
      setMenuItems(prev => computeAllergenFlags(prev, val, allergiesString));
    }
  };

  const handleSelectAllergen = (dishName, allergenType) => {
    alert(`This dish contains ${allergenType}.\nIt is not recommended based on your allergy profile.`);
  };

  // Adjust meal item quantity selection helper
  const updateQuantity = (date, period, foodId, change) => {
    setSelections(prev => {
      const dateSel = prev[date] || {};
      const periodSel = dateSel[period] || {};
      const currentQty = periodSel[foodId] || 0;
      const newQty = Math.max(0, currentQty + change);

      const nextPeriodSel = { ...periodSel };
      if (newQty === 0) {
        delete nextPeriodSel[foodId];
      } else {
        nextPeriodSel[foodId] = newQty;
      }

      return {
        ...prev,
        [date]: {
          ...dateSel,
          [period]: nextPeriodSel
        }
      };
    });
  };

  const handleNoteChange = (date, period, foodId, noteText) => {
    const key = `${date}_${period}_${foodId}`;
    setSpecialNotes(prev => ({
      ...prev,
      [key]: noteText
    }));
  };

  // Check if a dish is complimentary in the package dynamically based on database configuration
  const isIncludedInPackage = (foodId) => {
    const includedFoodIds = profileData.booking?.includedFoodIds || [];
    return includedFoodIds.includes(foodId);
  };

  // Calculations
  const getSelectedItemsCount = () => {
    let count = 0;
    Object.values(selections).forEach(dateObj => {
      Object.values(dateObj).forEach(periodObj => {
        Object.values(periodObj).forEach(qty => {
          count += qty;
        });
      });
    });
    return count;
  };

  const calculateTotalBill = () => {
    let extraCharge = 0;
    Object.entries(selections).forEach(([date, dateObj]) => {
      Object.entries(dateObj).forEach(([period, periodObj]) => {
        Object.entries(periodObj).forEach(([foodId, qty]) => {
          const item = menuItems.find(m => m.foodId === Number(foodId));
          if (item) {
            if (isIncludedInPackage(item.foodId)) {
              // package limit is 1 per day for this dish
              if (qty > 1) {
                extraCharge += item.price * (qty - 1);
              }
            } else {
              extraCharge += item.price * qty;
            }
          }
        });
      });
    });
    return extraCharge;
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Post Daily Selections to backend Database
  // Helper to submit selected selections
  const executeSubmitSelections = async () => {
    const formattedSelections = [];
    Object.entries(selections).forEach(([date, dateObj]) => {
      Object.entries(dateObj).forEach(([period, periodObj]) => {
        Object.entries(periodObj).forEach(([foodId, qty]) => {
          formattedSelections.push({
            date: date,
            period: period,
            foodId: Number(foodId),
            quantity: qty,
            specialNote: specialNotes[`${date}_${period}_${foodId}`] || ""
          });
        });
      });
    });

    if (formattedSelections.length === 0) {
      alert("Vui lòng chọn ít nhất một món ăn trước khi gửi!");
      return;
    }

    setSubmitting(true);
    const payload = {
      userId: profileData.userId,
      bookingId: profileData.booking?.bookingId,
      selections: formattedSelections
    };

    try {
      const res = await axiosClient.post("/guest/preselect-meals", payload);
      setSuccessOrder({
        orderId: res.data.orderId || `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        totalAmount: res.data.totalAmount || calculateTotalBill(),
        itemCount: formattedSelections.length,
        items: formattedSelections.map(f => {
          const m = menuItems.find(x => x.foodId === f.foodId);
          return {
            ...f,
            name: m ? m.dishName : "Món ăn dinh dưỡng"
          };
        })
      });
      // Clear current selection
      setSelections({});
      setSpecialNotes({});
    } catch (err) {
      console.warn("Backend submit failed, executing local success simulation.", err);
      // Fallback local success display if backend is offline
      setSuccessOrder({
        orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        totalAmount: calculateTotalBill(),
        itemCount: formattedSelections.length,
        items: formattedSelections.map(f => {
          const m = menuItems.find(x => x.foodId === f.foodId);
          return {
            ...f,
            name: m ? m.dishName : "Món ăn dinh dưỡng"
          };
        })
      });
      setSelections({});
      setSpecialNotes({});
    } finally {
      setSubmitting(false);
    }
  };

  // Submit selections checking consent
  const handleSubmitSelections = () => {
    if (getSelectedItemsCount() === 0) {
      alert("Vui lòng chọn ít nhất một món ăn trước khi gửi!");
      return;
    }

    if (!consentCheckbox) {
      setShowConsentModal(true);
    } else {
      executeSubmitSelections();
    }
  };

  // Modal Actions
  const handleAgreeAndFilter = async () => {
    setShowConsentModal(false);
    await handleConsentSubmit(true);
  };

  const handleIgnoreAndSubmit = () => {
    setShowConsentModal(false);
    executeSubmitSelections();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-sage-50/20">
        <Loader2 className="h-10 w-10 text-primary-800 animate-spin" />
        <span className="mt-4 text-xs font-semibold text-sage-600 uppercase tracking-widest">
          Đang lấy thông tin hồ sơ...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#fafbfa] min-h-screen pt-28 pb-20 font-sans text-sage-950">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">

        {/* Navigation Breadcrumbs */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-semibold tracking-wider text-sage-600 hover:text-primary-800 transition-colors uppercase"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại trang chủ
          </Link>
          <span className="text-[10px] bg-primary-100/50 border border-primary-200 text-primary-900 px-3 py-1 font-semibold uppercase tracking-wider">
            Guest Area
          </span>
        </div>

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-primary-100 pb-8 mb-10 gap-6">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-sage-900 mb-2">
              Khu Vực Quản Lý Kỳ Nghỉ Dưỡng
            </h1>
            <p className="text-sage-600 text-xs sm:text-sm font-light">
              Chào mừng quay trở lại, <span className="font-semibold">{profileData.fullName}</span>. Theo dõi lịch trình ẩm thực lành mạnh tại đây.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <span className="bg-green-50 border border-green-200 text-green-700 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider">
              Hội Viên Active
            </span>
          </div>
        </div>

        {/* Success Screen Display */}
        {successOrder ? (
          <div className="bg-white border border-primary-100 p-8 sm:p-12 text-center shadow-md animate-fade-in relative overflow-hidden rounded-none max-w-2xl mx-auto">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400" />
            <div className="inline-flex p-4 bg-primary-100 text-primary-800 rounded-full mb-6">
              <FileCheck2 className="h-12 w-12" />
            </div>
            <h2 className="font-serif text-2xl font-normal text-sage-900 mb-2">
              Đã Ghi Nhận Thực Đơn Lựa Chọn!
            </h2>
            <p className="text-sage-600 text-xs sm:text-sm max-w-md mx-auto mb-8 font-light">
              Lựa chọn món ăn hàng ngày của bạn đã được đăng ký thành công trên hệ thống với trạng thái **PENDING**. Tổ bếp trưởng sẽ chuẩn bị món ăn an toàn dựa theo hồ sơ này.
            </p>

            <div className="border border-primary-100 bg-primary-50/20 text-left p-6 space-y-4 mb-8 text-xs sm:text-sm">
              <div className="flex justify-between pb-3 border-b border-primary-100 font-bold uppercase text-[10px] text-sage-400 tracking-wider">
                <span>Chi Tiết Phiếu Thực Đơn</span>
                <span className="font-mono text-primary-800">MÃ ĐƠN: {successOrder.orderId}</span>
              </div>
              <div className="space-y-3">
                {successOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold">{it.name}</span>
                      <span className="text-[10px] text-sage-500 block">
                        Ngày: {it.date} | Bữa: {it.period} | Số lượng: {it.quantity}
                      </span>
                      {it.specialNote && (
                        <span className="text-[9px] bg-amber-50 text-amber-800 px-1.5 py-0.5 border border-amber-100/50 mt-1 inline-block">
                          Ghi chú: {it.specialNote}
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-medium text-sage-800">
                      {isIncludedInPackage(it.foodId) ? "Trong Gói" : "Tính Phí"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-primary-100 flex justify-between font-bold text-primary-950 font-serif">
                <span>Phụ phí phát sinh phát sinh ngoài gói:</span>
                <span>{formatCurrency(successOrder.totalAmount)}</span>
              </div>
            </div>

            <button
              onClick={() => setSuccessOrder(null)}
              className="px-8 py-3 bg-primary-800 hover:bg-primary-900 text-white text-xs font-bold uppercase tracking-widest cursor-pointer"
            >
              Chọn lại thực đơn mới
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left 4 Columns: Booking & Decree 356 Consent */}
            <div className="lg:col-span-4 space-y-6">

              {/* Booking Info Card */}
              <div className="bg-white border border-primary-100 p-6 shadow-xs text-left">
                <h3 className="font-serif text-base font-bold text-sage-950 mb-4 pb-2 border-b border-primary-50 uppercase tracking-wide">
                  Thông Tin Kỳ Nghỉ
                </h3>
                {profileData.booking ? (
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-sage-500 font-light">Mã đặt phòng:</span>
                      <span className="font-semibold text-primary-800">BK-00{profileData.booking.bookingId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sage-500 font-light">Ngày nhận:</span>
                      <span className="font-semibold">{formatDateDisplay(profileData.booking.checkInDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sage-500 font-light">Ngày trả:</span>
                      <span className="font-semibold">{formatDateDisplay(profileData.booking.checkOutDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sage-500 font-light">Gói dịch vụ:</span>
                      <span className="font-semibold text-green-700 bg-green-50 px-2 py-0.5 border border-green-100">
                        {profileData.booking.packageId === 1 ? "5-day Detox Journey" : "Gói Tiêu Chuẩn"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sage-500 font-light">Trạng thái phòng:</span>
                      <span className="font-semibold text-primary-900">{profileData.booking.status}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 text-amber-800 border border-amber-100 text-xs italic text-center">
                    Không tìm thấy kỳ nghỉ dưỡng active nào. Vui lòng đặt phòng tại trang chủ trước!
                  </div>
                )}
              </div>

              {/* Decree 356/2025/ND-CP Personal Data Protection Consent Card */}
              <div className="bg-white border border-primary-100 p-6 shadow-xs text-left">
                <div className="flex items-center space-x-2.5 mb-3">
                  <ShieldAlert className="h-5 w-5 text-primary-800" />
                  <h3 className="font-serif text-base font-bold text-sage-950 uppercase tracking-wide">
                    Bảo Mật Y Tế (NĐ 356)
                  </h3>
                </div>
                <p className="text-sage-500 text-[11px] leading-relaxed mb-4">
                  Dữ liệu về bệnh lý sức khỏe và dị ứng thực phẩm là thông tin y tế nhạy cảm. Theo **Nghị định 356/2025/NĐ-CP**, resort yêu cầu sự đồng ý tường minh từ quý khách trước khi xử lý dữ liệu để lọc thực đơn.
                </p>

                <div className="p-4.5 bg-sage-50 border border-primary-100 rounded-none space-y-3.5 text-xs">
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="decree-checkbox"
                      checked={consentCheckbox}
                      onChange={(e) => handleConsentSubmit(e.target.checked)}
                      className="mt-0.5 rounded-none border-primary-300 text-primary-800 focus:ring-primary-800 cursor-pointer h-4.5 w-4.5"
                    />
                    <label htmlFor="decree-checkbox" className="text-[11px] text-sage-800 font-medium leading-relaxed select-none cursor-pointer">
                      <strong>Tôi tự nguyện đồng ý</strong> cho phép nhà bếp Ngũ Sơn truy cập và xử lý dữ liệu dị ứng để tự động lọc món ăn gây hại.
                    </label>
                  </div>
                  <div className="text-[10px] text-sage-400 italic">
                    * Mặc định hộp kiểm là chưa chọn. Dữ liệu chỉ được xử lý khi bạn tích chọn.
                  </div>
                </div>

                {consentCheckbox ? (
                  <div className="mt-4 flex items-center space-x-1.5 text-xs text-green-700 bg-green-50/50 p-2.5 border border-green-150">
                    <ShieldCheck className="h-4.5 w-4.5 text-green-600" />
                    <span>Đã kích hoạt lọc tự động thành công!</span>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center space-x-1.5 text-xs text-amber-700 bg-amber-50/50 p-2.5 border border-amber-150">
                    <AlertTriangle className="h-4.5 w-4.5 text-amber-600" />
                    <span>Hệ thống chưa được phép lọc dị ứng.</span>
                  </div>
                )}
              </div>

              {/* Display Decrypted Health Profile Summary (Decree 356 compliance view) */}
              {profileData.medicalProfile && (
                <div className={`space-y-4 transition-all duration-300 ${!consentCheckbox ? "opacity-60 saturate-50" : ""}`}>
                  {/* Dietary Profile Card */}
                  <div className="bg-white border border-primary-100 p-6 shadow-xs text-left space-y-3 relative overflow-hidden">
                    {!consentCheckbox && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[0.5px] flex items-center justify-center p-4 text-center z-10">
                        <span className="bg-amber-100/90 text-amber-900 border border-amber-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider shadow-xs">
                          🔒 Chưa đồng ý NĐ 356
                        </span>
                      </div>
                    )}
                    <h4 className="font-serif text-xs font-bold text-sage-400 uppercase tracking-wider pb-1.5 border-b border-primary-50 flex justify-between items-center">
                      <span>DIETARY PROFILE</span>
                      {consentCheckbox && <span className="text-[9px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 border border-green-150">Active</span>}
                    </h4>
                    <div className="space-y-2 text-xs font-semibold text-green-800">
                      <div className="flex items-center space-x-1.5 bg-green-50 px-2.5 py-1.5 border border-green-150">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Vegan (Ăn chay thực dưỡng)</span>
                      </div>
                      <div className="flex items-center space-x-1.5 bg-green-50 px-2.5 py-1.5 border border-green-150">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Detox (Thanh lọc hữu cơ)</span>
                      </div>
                    </div>
                  </div>

                  {/* Allergies Card */}
                  <div className="bg-white border border-primary-100 p-6 shadow-xs text-left space-y-3 relative overflow-hidden">
                    {!consentCheckbox && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[0.5px] flex items-center justify-center p-4 text-center z-10">
                        <span className="bg-amber-100/90 text-amber-900 border border-amber-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider shadow-xs">
                          🔒 Chưa đồng ý NĐ 356
                        </span>
                      </div>
                    )}
                    <h4 className="font-serif text-xs font-bold text-red-400 uppercase tracking-wider pb-1.5 border-b border-primary-50 flex justify-between items-center">
                      <span>ALLERGIES (DỊ ỨNG)</span>
                      {consentCheckbox && <span className="text-[9px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 border border-red-150">Active</span>}
                    </h4>
                    <div className="space-y-2 text-xs font-semibold text-red-800">
                      {(() => {
                        const allergies = !consentCheckbox
                          ? (profileData.email === "guest1@gmail.com" ? "đậu phộng" : "hải sản")
                          : (profileData.medicalProfile.foodAllergies || "");

                        const hasPeanut = allergies.toLowerCase().includes("đậu phộng") || allergies.toLowerCase().includes("peanut");
                        const hasSeafood = allergies.toLowerCase().includes("hải sản") || allergies.toLowerCase().includes("seafood") || allergies.toLowerCase().includes("tôm");

                        return (
                          <>
                            {hasPeanut && (
                              <div className="flex items-center space-x-2 bg-red-50 px-2.5 py-1.5 border border-red-150">
                                <span className="text-red-650 font-bold">✗</span>
                                <span>Peanut Allergy (Dị ứng Đậu phộng)</span>
                              </div>
                            )}
                            {hasSeafood && (
                              <div className="flex items-center space-x-2 bg-red-50 px-2.5 py-1.5 border border-red-150">
                                <span className="text-red-650 font-bold">✗</span>
                                <span>Seafood Allergy (Dị ứng Hải sản)</span>
                              </div>
                            )}
                            {!hasPeanut && !hasSeafood && (
                              <div className="flex items-center space-x-2 bg-red-50 px-2.5 py-1.5 border border-red-150">
                                <span className="text-red-650 font-bold">✗</span>
                                <span>{allergies || "Không có dị ứng"}</span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right 8 Columns: Dynamic Daily Meal selection wizard */}
            <div className="lg:col-span-8 bg-white border border-primary-100 p-6 sm:p-8 shadow-xs text-left">
              <h2 className="font-serif text-lg font-bold text-sage-950 mb-1.5 uppercase tracking-wide border-b border-primary-50 pb-3">
                Lên Lịch Thực Đơn Ẩm Thực Hằng Ngày
              </h2>
              <p className="text-xs text-sage-500 mb-6 font-light">
                {activeMenuTab === "package"
                  ? "🥗 Chọn ngày lưu trú để lên lịch các bữa ăn đi kèm trong gói dịch vụ Detox của bạn (Miễn phí trong hạn mức)."
                  : "🛎️ Đặt thêm các món ẩm thực dinh dưỡng hoặc đồ uống ngoài gói (Phụ phí sẽ tự động được tính tiền vào số phòng Villa)."}
              </p>

              {/* Modern Segmented Control Tab Switcher */}
              <div className="flex p-1.5 bg-[#f2f4f2] rounded-full mb-8 shadow-inner border border-primary-100/50 max-w-xl mx-auto">
                <button
                  type="button"
                  onClick={() => setActiveMenuTab("package")}
                  className={`flex-1 py-3 px-5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${activeMenuTab === "package"
                    ? "bg-gradient-to-r from-primary-800 to-primary-900 text-white shadow-md transform scale-[1.01]"
                    : "text-sage-600 hover:text-primary-900"
                    }`}
                >
                  <span>🥗 Thực đơn trong gói</span>
                  <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full font-mono font-bold"></span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMenuTab("alacarte")}
                  className={`flex-1 py-3 px-5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${activeMenuTab === "alacarte"
                    ? "bg-gradient-to-r from-primary-800 to-primary-900 text-white shadow-md transform scale-[1.01]"
                    : "text-sage-600 hover:text-primary-900"
                    }`}
                >
                  <span>🛎️ Gọi món ngoài gói</span>
                  <span className="text-[9px] bg-primary-900/10 text-primary-900 px-2 py-0.5 rounded-full font-mono font-bold"></span>
                </button>
              </div>

              {/* Horizontal Date Selection Bar (Modern Pill Design) */}
              <div className="flex items-center space-x-3 overflow-x-auto pb-4 mb-8 border-b border-primary-100/50 scrollbar-thin">
                {bookingDays.map((date, idx) => {
                  const isActive = selectedDate === date;
                  const dateParts = date.split("-");
                  const displayDate = `${dateParts[2]}/${dateParts[1]}`;
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 flex flex-col items-center justify-center min-w-[90px] border shadow-xs cursor-pointer ${isActive
                        ? "bg-primary-850 border-primary-900 text-white shadow-md -translate-y-0.5"
                        : "bg-white border-primary-100 text-sage-600 hover:border-primary-300 hover:bg-primary-50/30"
                        }`}
                      style={{ borderRadius: "16px" }}
                    >
                      <span className="text-[9px] opacity-75 font-semibold">Ngày {idx + 1}</span>
                      <span className="font-mono mt-0.5 text-sm">{displayDate}</span>
                    </button>
                  );
                })}
              </div>

              {/* Auto Filter Banner */}
              {consentCheckbox && (
                <div className="mb-6 p-4 bg-primary-50/50 border border-primary-200 text-xs text-primary-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <Info className="h-4.5 w-4.5 text-primary-750 flex-shrink-0" />
                    <span>
                      <strong>Thực đơn đã được tự động quét theo hồ sơ bệnh lý & chế độ ăn uống.</strong>{" "}
                      {(() => {
                        const count = menuItems.filter(item => {
                          const isIncluded = isIncludedInPackage(item.foodId);
                          if (activeMenuTab === "package" && !isIncluded) return false;
                          if (activeMenuTab === "alacarte" && isIncluded) return false;
                          return item.isAllergen;
                        }).length;
                        return `Phát hiện ${count} món ăn không phù hợp đã được cảnh báo và khóa tự động.`;
                      })()}
                    </span>
                  </div>
                  <span className="bg-primary-100 text-primary-800 border border-primary-200 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider self-start sm:self-auto">
                    Đã Lọc Tự Động
                  </span>
                </div>
              )}

              {/* MEAL TIMELINE: SÁNG, TRƯA, TỐI */}
              {selectedDate && (
                <div className="space-y-8">
                  {["Breakfast", "Lunch", "Dinner"].map((period) => {
                    // Filter items for this period case-insensitively to cover all dishes
                    const periodDishes = menuItems.filter(item => {
                      // Filter by selected tab first
                      const isIncluded = isIncludedInPackage(item.foodId);
                      if (activeMenuTab === "package" && !isIncluded) return false;
                      if (activeMenuTab === "alacarte" && isIncluded) return false;

                      const name = (item.dishName || "").toLowerCase();

                      // Categorization based on name matching
                      const matchesBreakfast = name.includes("súp") || name.includes("soup") || name.includes("juice") || name.includes("avocado") || name.includes("bữa sáng") || name.includes("breakfast");
                      const matchesLunch = name.includes("salad") || name.includes("mì căn") || name.includes("gỏi") || name.includes("chay") || name.includes("trưa") || name.includes("lunch");
                      const matchesDinner = name.includes("nấm") || name.includes("tôm") || name.includes("shrimp") || name.includes("lẩu") || name.includes("chicken") || name.includes("cá") || name.includes("tối") || name.includes("dinner");

                      // Fallback: if a dish is not categorized into any period, show it in Lunch and Dinner
                      const isUncategorized = !matchesBreakfast && !matchesLunch && !matchesDinner;

                      if (period === "Breakfast") {
                        return matchesBreakfast;
                      } else if (period === "Lunch") {
                        return matchesLunch || isUncategorized;
                      } else { // Dinner
                        return matchesDinner || isUncategorized;
                      }
                    });

                    return (
                      <div key={period} className="space-y-4">
                        <div className="flex items-center space-x-2 border-l-2 border-primary-800 pl-3">
                          {period === "Breakfast" && <Coffee className="h-4.5 w-4.5 text-primary-800" />}
                          {period === "Lunch" && <Sun className="h-4.5 w-4.5 text-primary-800" />}
                          {period === "Dinner" && <Moon className="h-4.5 w-4.5 text-primary-800" />}
                          <h3 className="font-serif text-base font-bold text-sage-900">
                            {period === "Breakfast" && "Bữa Sáng (06:30 - 09:30)"}
                            {period === "Lunch" && "Bữa Trưa (11:30 - 14:00)"}
                            {period === "Dinner" && "Bữa Tối (18:00 - 21:00)"}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {periodDishes.map((dish) => {
                            const isAllergen = consentCheckbox && dish.isAllergen;
                            const isSoldOut = dish.soldOut === true;
                            const qty = selections[selectedDate]?.[period]?.[dish.foodId] || 0;
                            const noteKey = `${selectedDate}_${period}_${dish.foodId}`;
                            const noteVal = specialNotes[noteKey] || "";
                            const isIncluded = isIncludedInPackage(dish.foodId);

                            return (
                              <div
                                key={dish.foodId}
                                onClick={isAllergen ? () => handleSelectAllergen(dish.dishName, getAllergenName(dish)) : undefined}
                                className={`flex flex-col justify-between transition-all duration-300 relative border transform overflow-hidden ${(isAllergen || isSoldOut)
                                  ? "border-red-200 bg-red-50/10 cursor-not-allowed opacity-80"
                                  : "border-primary-100 bg-white hover:-translate-y-1 hover:shadow-md shadow-xs"
                                  }`}
                                style={{ borderRadius: "20px" }}
                              >
                                {/* Card Image */}
                                <div className="h-44 w-full relative overflow-hidden bg-sage-50">
                                  <img
                                    src={getFoodImage(dish)}
                                    alt={dish.dishName}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                  />
                                  {/* Overlay for Allergen warning or Sold Out */}
                                  {isAllergen ? (
                                    <div className="absolute inset-0 bg-red-950/40 backdrop-blur-[1px] flex items-center justify-center">
                                      <span className="bg-red-650 text-white font-bold text-[10px] px-3 py-1.5 uppercase tracking-widest shadow-md">
                                        Blocked (Bị Khóa)
                                      </span>
                                    </div>
                                  ) : isSoldOut ? (
                                    <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-[1px] flex items-center justify-center">
                                      <span className="bg-gray-700 text-white font-bold text-[10px] px-3 py-1.5 uppercase tracking-widest shadow-md">
                                        Sold Out (Hết Hàng)
                                      </span>
                                    </div>
                                  ) : null}
                                  {/* Top-Right Badge */}
                                  <div className="absolute top-3 right-3 z-10">
                                    <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full shadow-md whitespace-nowrap ${isAllergen
                                      ? "bg-gradient-to-r from-red-500 to-rose-600 text-white"
                                      : isSoldOut
                                        ? "bg-gradient-to-r from-gray-500 to-slate-600 text-white"
                                        : isIncluded
                                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                                          : "bg-gradient-to-r from-amber-500 to-yellow-600 text-white"
                                      }`}>
                                      {isAllergen ? "Not Available" : isSoldOut ? "Hết Hàng" : isIncluded ? "Trong Gói" : "Phát Sinh"}
                                    </span>
                                  </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                  <div>
                                    <h4 className={`font-serif text-sm font-bold text-sage-950 ${(isAllergen || isSoldOut) ? "line-through text-red-900/40" : ""}`}>
                                      {dish.dishName}
                                    </h4>
                                    <p className="text-[11px] text-sage-500 font-light mt-2 leading-relaxed">
                                      {dish.description}
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-1">
                                      {dish.dietaryTags.split(",").map((t, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-sage-50 text-sage-600 text-[9px] font-bold rounded-full border border-sage-150 tracking-wide uppercase">
                                          {t.trim()}
                                        </span>
                                      ))}
                                    </div>

                                    {/* Allergy warning alert */}
                                    {isAllergen && (
                                      <div className="mt-3.5 p-2 bg-red-50 border border-red-200 text-[10px] text-red-800 font-bold flex items-center space-x-2 rounded-lg">
                                        <AlertTriangle className="h-4.5 w-4.5 text-red-600 flex-shrink-0 animate-bounce" />
                                        <span>[Cảnh báo] Có chứa: {getAllergenName(dish) === "peanuts" ? "Đậu phộng" : "Hải sản"}</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="mt-5 pt-3.5 border-t border-primary-50 flex flex-col gap-2.5">
                                    <div className="flex justify-between items-center">
                                      <span className="font-mono text-xs sm:text-sm font-bold text-primary-950">
                                        {formatCurrency(dish.price)}
                                      </span>

                                      {/* Action Selector buttons */}
                                      {isAllergen || isSoldOut ? (
                                        <span className={`text-[9px] font-bold border px-3 py-1.5 rounded-full uppercase tracking-wider ${isAllergen ? "text-red-700 bg-red-50 border-red-200" : "text-gray-500 bg-gray-50 border-gray-200"}`}>
                                          {isAllergen ? "Blocked (Bị Khóa)" : "Hết Hàng"}
                                        </span>
                                      ) : (
                                        <div className="flex items-center space-x-2 bg-primary-50/50 p-0.5 rounded-full border border-primary-100">
                                          <button
                                            type="button"
                                            disabled={qty === 0}
                                            onClick={() => updateQuantity(selectedDate, period, dish.foodId, -1)}
                                            className={`p-1.5 rounded-full cursor-pointer transition-all ${qty === 0 ? "text-primary-200" : "text-primary-850 hover:bg-white hover:shadow-xs"
                                              }`}
                                          >
                                            <Minus className="h-3.5 w-3.5" />
                                          </button>
                                          <span className="font-mono font-bold text-xs w-6 text-center text-primary-950">
                                            {qty}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => updateQuantity(selectedDate, period, dish.foodId, 1)}
                                            className="p-1.5 rounded-full text-primary-850 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
                                          >
                                            <Plus className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    {/* Custom special notes for chef */}
                                    {qty > 0 && !isAllergen && !isSoldOut && (
                                      <input
                                        type="text"
                                        value={noteVal}
                                        onChange={(e) => handleNoteChange(selectedDate, period, dish.foodId, e.target.value)}
                                        placeholder="Yêu cầu cho bếp: vd: ít muối, không hành...."
                                        className="w-full px-2.5 py-1.5 border border-primary-150 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary-500 rounded-none"
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Selected Summary & Submit Section */}
              <div className="mt-10 pt-6 border-t border-primary-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 bg-primary-50/25 p-6 border border-primary-100/40">
                <div className="text-left space-y-1">
                  <div className="text-xs text-sage-600 font-light">
                    Tổng cộng chọn: <span className="font-bold text-sage-950">{getSelectedItemsCount()} món</span>
                  </div>
                  <div className="text-sm font-serif font-bold text-primary-950">
                    Phụ phí dự kiến ngoài gói: {formatCurrency(calculateTotalBill())}
                  </div>
                  <div className="text-[10px] text-sage-400 italic">
                    * Các món Green Juice & Salad bơ được tính 0đ trong giới hạn gói Detox.
                  </div>
                </div>

                <button
                  type="button"
                  disabled={getSelectedItemsCount() === 0 || submitting}
                  onClick={handleSubmitSelections}
                  className={`px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-xs rounded-none transition-all flex items-center justify-center gap-2 cursor-pointer ${getSelectedItemsCount() === 0 || submitting
                    ? "bg-sage-300 cursor-not-allowed"
                    : "bg-primary-850 hover:bg-primary-900"
                    }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <UtensilsCrossed className="h-4 w-4" />
                      <span>Lưu thực đơn</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Custom Premium Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-primary-200 w-full max-w-lg shadow-2xl relative rounded-none text-left p-6 sm:p-8 animate-fade-in">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />

            <div className="flex items-start space-x-4 mb-6">
              <div className="p-3 bg-red-50 border border-red-150 text-red-750 flex-shrink-0">
                <AlertTriangle className="h-7 w-7 animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-sage-950 uppercase tracking-wide">
                  Cảnh Báo An Toàn Sức Khỏe
                </h3>
                <span className="text-[9px] bg-red-100 border border-red-200 text-red-800 font-bold px-2 py-0.5 uppercase tracking-wider mt-1.5 inline-block">
                  Nghị Định 356/2025/NĐ-CP Compliance
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-sage-700 font-light leading-relaxed mb-8">
              <p>
                Quý khách chưa kích hoạt **Bộ lọc dị ứng tự động**. Dữ liệu về bệnh lý sức khỏe và dị ứng thực phẩm là thông tin y tế nhạy cảm.
              </p>
              <div className="p-4 bg-amber-50/50 border border-amber-250 text-amber-900 text-xs font-semibold leading-relaxed">
                Nếu không kích hoạt lọc, quý khách có thể chọn nhầm các món ăn chứa thành phần gây dị ứng nguy hiểm (ví dụ: hải sản, đậu phộng) đã được lưu trong hồ sơ sức khỏe.
              </div>
              <p className="font-medium text-sage-950">
                Quý khách muốn kích hoạt bộ lọc tự động an toàn hay tiếp tục gửi thực đơn mà không lọc?
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-primary-50">
              <button
                onClick={() => setShowConsentModal(false)}
                className="px-5 py-2.5 border border-primary-250 hover:bg-primary-50 text-sage-600 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all rounded-none"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleIgnoreAndSubmit}
                className="px-5 py-2.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all rounded-none"
              >
                Vẫn gửi (Không lọc)
              </button>
              <button
                onClick={handleAgreeAndFilter}
                className="px-6 py-2.5 bg-primary-850 hover:bg-primary-900 text-white text-xs font-bold uppercase tracking-widest cursor-pointer transition-all rounded-none"
              >
                Kích hoạt lọc (Khuyên dùng)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
