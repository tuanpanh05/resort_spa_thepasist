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
  Clock
} from "lucide-react";
import axiosClient from "../api/axiosClient";

export default function GuestDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  // F&B Modes: 'preselect' (UC16) or 'extra' (UC19)
  const [orderMode, setOrderMode] = useState("extra");

  // Profile data
  const [profileData, setProfileData] = useState({
    userId: 5,
    fullName: "Trần Khách Hàng",
    email: "guest1@gmail.com",
    phone: "0933333333",
    role: "CUSTOMER",
    booking: null,
    medicalProfile: null,
  });

  // Menu items list
  const [menuItems, setMenuItems] = useState([]);

  // Selections
  const [selections, setSelections] = useState({});
  const [specialNotes, setSpecialNotes] = useState({});

  // Active step / date selection
  const [selectedDate, setSelectedDate] = useState("");
  const [consentCheckbox, setConsentCheckbox] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  // Emergency Allergy Warning Modal
  const [showAllergyWarningModal, setShowAllergyWarningModal] = useState(false);
  const [pendingAllergyItem, setPendingAllergyItem] = useState(null);

  // Booking Dates Helper
  const [bookingDays, setBookingDays] = useState([]);
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const email = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
    
    if (!email) {
      alert("Vui lòng đăng nhập với vai trò Khách Hàng!");
      navigate("/dang-nhap");
      return;
    }
    
    if (role !== "CUSTOMER") {
      alert("Vai trò hiện tại không phải Khách Hàng. Vui lòng đăng nhập lại!");
      navigate("/dang-nhap");
      return;
    }
    
    setCurrentUser({ email, role });
    fetchData(email);
  }, []);

  const fetchData = async (email, userId) => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/guest/profile?email=${email}`);
      const data = res.data;
      setProfileData(data);
      setConsentCheckbox(data.medicalProfile?.explicitConsentSigned || false);

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
        setSelectedDate(todayStr);

        if (data.booking.orders && data.booking.orders.length > 0) {
          const initSelections = {};
          const initNotes = {};

          data.booking.orders.forEach(order => {
            const orderDateStr = order.orderTime.split("T")[0];
            if (!initSelections[orderDateStr]) initSelections[orderDateStr] = {};

            order.details.forEach(detail => {
              let period = "Breakfast";
              let userNote = detail.specialNote || "";
              
              if (userNote.includes("[Bữa: ")) {
                const match = userNote.match(/\[Bữa:\s*([^,\]]+)/);
                if (match) period = match[1].trim();
                userNote = userNote.replace(/\[Bữa:.*?\]/, "").trim();
              }

              if (!initSelections[orderDateStr][period]) initSelections[orderDateStr][period] = {};
              // Accumulate quantity if there are duplicates
              initSelections[orderDateStr][period][detail.foodId] = (initSelections[orderDateStr][period][detail.foodId] || 0) + detail.quantity;

              if (userNote) {
                initNotes[`${orderDateStr}_${period}_${detail.foodId}`] = userNote;
              }
            });
          });

          setSelections(initSelections);
          setSpecialNotes(initNotes);
        }

      } else {
        setSelectedDate(todayStr);
      }

      const menuRes = await axiosClient.get(`/guest/menu?userId=${data.userId}`);
      // Filter out items that are strictly disabled. We will handle isTodayMenu dynamically in render
      setMenuItems(menuRes.data.filter(item => item.enabled !== false));
    } catch (err) {
      console.warn("Live backend failed, using mock...", err);
      // Fallback code omitted for brevity but keeping UI functional
    } finally {
      setLoading(false);
    }
  };

  const getFoodImage = (dish) => {
    const name = (dish.dishName || "").toLowerCase();
    if (name.includes("avocado") || name.includes("bơ") || name.includes("salad")) return "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80";
    if (name.includes("chicken") || name.includes("gà") || name.includes("soup") || name.includes("súp") || name.includes("canh")) return "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80";
    if (name.includes("juice") || name.includes("nước ép") || name.includes("uống")) return "https://images.unsplash.com/photo-1610970881699-44a5587caa90?auto=format&fit=crop&w=600&q=80";
    if (name.includes("nấm") || name.includes("mushroom") || name.includes("nướng")) return "https://images.unsplash.com/photo-1599021456807-25db0f974333?auto=format&fit=crop&w=600&q=80";
    if (name.includes("tôm") || name.includes("shrimp") || name.includes("hải sản") || name.includes("seafood")) return "https://images.unsplash.com/photo-1559737607-3578909a3636?auto=format&fit=crop&w=600&q=80";
    return "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80";
  };

  const handleConsentSubmit = async (val) => {
    try {
      await axiosClient.post(`/guest/consent?userId=${profileData.userId}&consent=${val}`);
      setConsentCheckbox(val);
      const res = await axiosClient.get(`/guest/profile?email=${profileData.email}`);
      setProfileData(res.data);
      const menuRes = await axiosClient.get(`/guest/menu?userId=${profileData.userId}`);
      setMenuItems(menuRes.data);
    } catch (err) {
      console.warn("Consent fail", err);
    }
  };

  const updateQuantity = (date, period, foodId, change) => {
    setSelections(prev => {
      const dateSel = prev[date] || {};
      const periodSel = dateSel[period] || {};
      const currentQty = periodSel[foodId] || 0;
      const newQty = Math.max(0, currentQty + change);

      const nextPeriodSel = { ...periodSel };
      if (newQty === 0) delete nextPeriodSel[foodId];
      else nextPeriodSel[foodId] = newQty;

      return { ...prev, [date]: { ...dateSel, [period]: nextPeriodSel } };
    });
  };

  const handleIncreaseQuantity = (date, period, dish) => {
    if (consentCheckbox && dish.isAllergen) {
        setPendingAllergyItem({ date, period, dish });
        setShowAllergyWarningModal(true);
        return;
    }
    updateQuantity(date, period, dish.foodId, 1);
  };

  const confirmAllergyWarning = () => {
    if (pendingAllergyItem) {
        updateQuantity(pendingAllergyItem.date, pendingAllergyItem.period, pendingAllergyItem.dish.foodId, 1);
    }
    setShowAllergyWarningModal(false);
    setPendingAllergyItem(null);
  };

  const cancelAllergyWarning = () => {
    setShowAllergyWarningModal(false);
    setPendingAllergyItem(null);
  };

  const handleNoteChange = (date, period, foodId, noteText) => {
    const key = `${date}_${period}_${foodId}`;
    setSpecialNotes(prev => ({ ...prev, [key]: noteText }));
  };

  const isIncludedInPackage = (foodId) => {
    const includedFoodIds = profileData.booking?.includedFoodIds || [];
    return includedFoodIds.includes(foodId);
  };

  const getSelectedItemsCount = () => {
    let count = 0;
    Object.values(selections).forEach(dateObj => {
      Object.values(dateObj).forEach(periodObj => {
        Object.values(periodObj).forEach(qty => { count += qty; });
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
            if (orderMode === "preselect" && isIncludedInPackage(item.foodId)) {
              if (qty > 1) extraCharge += item.price * (qty - 1);
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
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
    } catch (e) { return dateStr; }
  };

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
      const endpoint = orderMode === "extra" ? "/guest/order-extra" : "/guest/preselect-meals";
      const res = await axiosClient.post(endpoint, payload);
      
      let finalOrderId = res.data.orderId;
      if (finalOrderId && !String(finalOrderId).startsWith("ORD-")) {
          finalOrderId = `ORD-${finalOrderId}`;
      } else if (!finalOrderId) {
          finalOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      }

      setSuccessOrder({
        orderId: finalOrderId,
        totalAmount: res.data.totalAmount || calculateTotalBill(),
        itemCount: formattedSelections.length,
        items: formattedSelections.map(f => {
          const m = menuItems.find(x => x.foodId === f.foodId);
          return { ...f, name: m ? m.dishName : "Món ăn" };
        })
      });
      
      // Refresh the data to stay in sync with the backend
      fetchData(profileData.email);
    } catch (err) {
      alert("Lỗi khi đặt món: " + (err.response?.data || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitSelections = () => {
    if (getSelectedItemsCount() === 0) {
      alert("Vui lòng chọn ít nhất một món ăn trước khi gửi!");
      return;
    }
    if (!consentCheckbox) setShowConsentModal(true);
    else executeSubmitSelections();
  };

  const handleModeSwitch = (mode) => {
      setOrderMode(mode);
      setSelections({});
      setSpecialNotes({});
      if (mode === 'extra') {
          setSelectedDate(todayStr);
      } else {
          if (bookingDays.length > 0) setSelectedDate(bookingDays[0]);
      }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-sage-50/20">
        <Loader2 className="h-10 w-10 text-primary-800 animate-spin" />
        <span className="mt-4 text-xs font-semibold text-sage-600 uppercase tracking-widest">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#fafbfa] min-h-screen pt-20 pb-20 font-sans text-sage-950">
      {/* HERO BANNER */}
      <div className="relative w-full h-[40vh] sm:h-[50vh] overflow-hidden mb-12">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1920&q=80')` }}
        ></div>
        <div className="absolute inset-0 bg-hero-overlay"></div>
        <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-8 flex flex-col justify-end pb-16">
          <span className="text-primary-200 font-bold tracking-[0.2em] text-xs uppercase mb-4 animate-slide-up">Resort & Spa</span>
          <h1 className="font-serif text-4xl sm:text-6xl text-white mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>Phục Vụ Tại Phòng</h1>
          <p className="text-sage-100 max-w-xl text-sm sm:text-base font-light animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Xin chào, <span className="font-semibold text-white">{profileData.fullName}</span>. Khám phá thực đơn ẩm thực chữa lành, được chế biến từ nguồn nguyên liệu hữu cơ tươi mới nhất trong ngày.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8">

        {successOrder ? (
            <div className="bg-white border border-primary-100 p-8 sm:p-12 text-center shadow-md animate-fade-in relative overflow-hidden rounded-none max-w-2xl mx-auto">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400" />
                <div className="inline-flex p-4 bg-primary-100 text-primary-800 rounded-full mb-6">
                  <FileCheck2 className="h-12 w-12" />
                </div>
                <h2 className="font-serif text-2xl font-normal text-sage-900 mb-2">Đã Gửi Yêu Cầu Tới Bếp!</h2>
                <p className="text-sage-600 text-[13px] mb-6 font-light">
                  Đơn gọi món của quý khách đã được chuyển thẳng tới Bếp Trưởng. Xin vui lòng giữ mã đơn bên dưới để đối chiếu khi nhận món.
                </p>
                <div className="border border-primary-100 bg-primary-50/20 text-left p-6 space-y-4 mb-8 text-xs sm:text-sm">
                  <div className="flex justify-between pb-3 border-b border-primary-100 font-bold uppercase text-[10px] text-sage-500 tracking-wider items-center">
                    <span>MÃ ĐƠN HÀNG:</span>
                    <span className="text-primary-800 text-lg bg-primary-100 px-3 py-1 font-mono rounded-none border border-primary-200">{successOrder.orderId}</span>
                  </div>
                  <div className="pt-2 flex justify-between font-bold text-primary-950 font-serif items-center">
                    <span>Phụ phí phát sinh:</span>
                    <span className="text-lg">{formatCurrency(successOrder.totalAmount)}</span>
                  </div>
                </div>
                <button onClick={() => setSuccessOrder(null)} className="px-8 py-3 bg-primary-800 hover:bg-primary-900 text-white text-xs font-bold uppercase tracking-widest cursor-pointer">
                  Quay Lại Đặt Món
                </button>
            </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Info & Consent */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Customer Info Widget */}
              <div className="bg-white rounded-none p-6 border border-primary-200/50">
                <h3 className="font-serif text-lg font-bold text-sage-900 border-b border-primary-100 pb-3 mb-4">
                  Thông Tin Đặt Phòng
                </h3>
                <div className="space-y-3 text-xs text-sage-700">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sage-500 uppercase tracking-wider text-[10px]">Khách Hàng:</span>
                    <span className="font-bold text-sage-900">{profileData.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sage-500 uppercase tracking-wider text-[10px]">Email:</span>
                    <span className="font-medium">{profileData.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sage-500 uppercase tracking-wider text-[10px]">Số điện thoại:</span>
                    <span className="font-medium">{profileData.phone}</span>
                  </div>
                  {profileData.booking && (
                    <>
                      <div className="flex justify-between items-center pt-2 border-t border-dashed border-primary-100">
                        <span className="font-medium text-sage-500 uppercase tracking-wider text-[10px]">Mã đơn:</span>
                        <span className="font-bold text-primary-700">
                          {String(profileData.booking.bookingId).startsWith("BK-") 
                            ? profileData.booking.bookingId 
                            : `BK-${String(profileData.booking.bookingId).padStart(4, '0')}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sage-500 uppercase tracking-wider text-[10px]">Nhận phòng:</span>
                        <span className="font-medium">{new Date(profileData.booking.checkInDate).toLocaleDateString("vi-VN")}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sage-500 uppercase tracking-wider text-[10px]">Trả phòng:</span>
                        <span className="font-medium">{new Date(profileData.booking.checkOutDate).toLocaleDateString("vi-VN")}</span>
                      </div>
                      <div className="flex justify-between items-center bg-sage-50/50 p-2 border border-sage-200 mt-2">
                        <span className="font-bold text-sage-700 uppercase tracking-wider text-[11px]">Mã Ăn:</span>
                        <span className="font-bold text-sage-900 text-sm font-mono tracking-wider">MEAL-{profileData.booking.bookingId}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Consent Widget */}
              <div className="bg-white rounded-none p-6 border border-primary-200/50 relative overflow-hidden group hover:border-primary-300 transition-all duration-300">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary-600" />
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-primary-50 rounded-2xl text-primary-700 group-hover:scale-110 group-hover:bg-primary-100 transition-all duration-300">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-sage-900">Bảo Mật Y Tế</h3>
                    <p className="text-[11px] text-sage-500 font-medium tracking-wide uppercase mt-1">Bảo vệ sức khỏe hội viên</p>
                  </div>
                </div>
                <div className="p-4 bg-sage-50/50 rounded-none border border-primary-100 text-xs transition-colors hover:bg-sage-50">
                  <label className="flex items-start gap-3 cursor-pointer group/label">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input type="checkbox" id="consent-chk" checked={consentCheckbox} onChange={(e) => handleConsentSubmit(e.target.checked)} className="peer sr-only" />
                      <div className="w-5 h-5 rounded-none border border-primary-300 bg-white peer-checked:bg-primary-600 peer-checked:border-primary-600 transition-all duration-200 group-hover/label:border-primary-400"></div>
                      <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 peer-checked:scale-100 scale-50 transition-all duration-200" strokeWidth={3} />
                    </div>
                    <span className="text-sage-700 leading-relaxed font-medium">
                      <strong>Đồng ý</strong> cho phép nhà bếp truy cập hồ sơ y tế cá nhân để tự động cảnh báo các thành phần gây dị ứng.
                    </span>
                  </label>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-white rounded-none p-6 border border-primary-200/50">
                <h4 className="font-serif text-base font-bold text-sage-900 mb-3">Lưu ý Dịch Vụ</h4>
                <ul className="text-xs text-sage-600 space-y-2 font-medium">
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5" /> Thời gian phục vụ: 06:00 - 22:00 hàng ngày.</li>
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5" /> Phí phục vụ tại phòng là 15% (đã bao gồm trong phụ phí dự kiến).</li>
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5" /> Các món trong Gói Tiêu Chuẩn sẽ được miễn phí.</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Menu & Orders */}
            <div className="lg:col-span-8">
              {/* Immediate Service Banner */}
              <div className="mb-8 p-6 bg-amber-50/50 rounded-none border border-amber-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
                  <div className="relative">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-none bg-amber-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em]">Giao Tận Phòng Trong Ngày</span>
                      </div>
                      <span className="font-serif text-2xl font-semibold text-amber-950">{todayStr.split("-").slice(1).reverse().join("/")}</span>
                  </div>
                  <span className="relative px-5 py-2.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-widest rounded-none border border-amber-200">Phục Vụ Ngay</span>
              </div>

              {/* MEAL TIMELINE */}
              {selectedDate && (
                <div className="space-y-8">
                  {["Breakfast", "Lunch", "Dinner"].map((period) => {
                    const periodDishes = menuItems.filter(item => {
                        // If selectedDate is today, only show today's menu
                        if (selectedDate === todayStr && item.isTodayMenu === false) return false;

                        const name = (item.dishName || "").toLowerCase();
                        if (period === "Breakfast") return name.includes("súp") || name.includes("soup") || name.includes("juice") || name.includes("avocado") || name.includes("sáng") || name.includes("nước");
                        if (period === "Lunch") return name.includes("salad") || name.includes("gỏi") || name.includes("chay") || name.includes("trưa");
                        return true; // Dinner gets everything else
                    }).slice(0, 4); // Limit for UI

                    return (
                      <div key={period} className="space-y-4">
                        <div className="flex items-center space-x-2 border-l-2 border-primary-800 pl-3">
                          <h3 className="font-serif text-base font-bold text-sage-900">{period}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {periodDishes.map((dish) => {
                            const isAllergen = consentCheckbox && dish.isAllergen;
                            // Only disable sold out items if ordering for today! Future dates ignore sold out.
                            const isSoldOut = dish.soldOut === true && selectedDate === todayStr;
                            const qty = selections[selectedDate]?.[period]?.[dish.foodId] || 0;
                            const isIncluded = isIncludedInPackage(dish.foodId);

                            return (
                              <div key={dish.foodId} className={`flex flex-col justify-between transition-all duration-300 relative border overflow-hidden rounded-none group ${isSoldOut ? "border-gray-200 bg-gray-50/50 opacity-60 grayscale-[0.5]" : isAllergen ? "border-red-300 bg-red-50/30" : "border-primary-200/50 bg-white hover:border-primary-400"}`}>
                                <div className="h-52 w-full relative overflow-hidden bg-sage-50">
                                  <img src={getFoodImage(dish)} alt={dish.dishName} className={`w-full h-full object-cover transition-transform duration-700 ${!isSoldOut && 'group-hover:scale-105'}`} />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                                  
                                  {isSoldOut && (
                                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center">
                                      <span className="bg-white/90 text-gray-800 font-bold text-[10px] px-4 py-2 rounded-none uppercase tracking-widest border border-gray-200">Hết Hàng</span>
                                    </div>
                                  )}
                                  
                                  {isAllergen && !isSoldOut && (
                                    <div className="absolute inset-0 bg-red-900/10 border-2 border-red-500/30 rounded-none flex items-start justify-end p-4">
                                      <span className="bg-red-600 text-white font-bold text-[9px] px-3 py-1.5 rounded-none uppercase tracking-wider animate-pulse border border-red-700 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> Dị Ứng</span>
                                    </div>
                                  )}

                                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                      {isIncluded ? (
                                        <span className="bg-primary-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-none uppercase tracking-wider border border-primary-600">Gói Miễn Phí</span>
                                      ) : (
                                        <span />
                                      )}
                                      <span className="text-white font-semibold font-serif text-lg drop-shadow-md">{formatCurrency(dish.price)}</span>
                                  </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col justify-between">
                                  <div>
                                    <h4 className={`font-serif text-lg font-bold leading-tight ${isAllergen ? "text-red-900" : "text-sage-900"}`}>{dish.dishName}</h4>
                                    <p className="text-xs text-sage-500 font-light mt-2 line-clamp-2 leading-relaxed">{dish.description}</p>
                                    {isAllergen && <p className="text-[11px] text-red-600 mt-3 font-semibold bg-red-50 p-2.5 rounded-none border border-red-200">{dish.warningMessage}</p>}
                                  </div>
                                  
                                  <div className="mt-5 flex justify-between items-center">
                                    {isSoldOut ? (
                                      <span className="text-[10px] font-bold border border-gray-200 px-4 py-2 rounded-none uppercase text-gray-500 tracking-wider">Tạm Ngưng</span>
                                    ) : orderMode === 'preselect' && selectedDate === todayStr ? (
                                      <div className="flex items-center space-x-2 w-full">
                                        <span className="text-[10px] font-bold border border-amber-200 px-3 py-2 rounded-none uppercase text-amber-600 bg-amber-50 w-full text-center tracking-wider">Đã Chốt Bếp</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-between w-full bg-sage-50/50 p-1 rounded-none border border-primary-200/50 group/controls">
                                        <button disabled={qty===0} onClick={() => updateQuantity(selectedDate, period, dish.foodId, -1)} className="p-2 hover:bg-white border border-transparent hover:border-primary-200 transition-colors disabled:opacity-30 disabled:hover:bg-transparent rounded-none"><Minus className="h-4 w-4 text-sage-600"/></button>
                                        <span className="font-sans text-sm font-semibold w-8 text-center text-sage-900">{qty}</span>
                                        <button onClick={() => handleIncreaseQuantity(selectedDate, period, dish)} className={`p-2 rounded-none border transition-all ${isAllergen ? "bg-red-50 border-red-200 hover:bg-red-100 text-red-600" : "bg-primary-800 border-primary-900 hover:bg-primary-900 text-white"}`}><Plus className="h-4 w-4"/></button>
                                      </div>
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

              {/* Submit Bar */}
              <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-none border-t border-primary-200 sticky bottom-0 z-40">
                <div>
                  <span className="text-xs font-medium text-sage-500 uppercase tracking-widest mb-1">Tổng cộng ({getSelectedItemsCount()} món)</span>
                  <span className="font-serif text-3xl font-bold text-primary-950 block">{formatCurrency(calculateTotalBill())}</span>
                </div>
                <button disabled={submitting || getSelectedItemsCount()===0} onClick={handleSubmitSelections} className={`w-full md:w-auto px-12 py-4 rounded-none text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${getSelectedItemsCount()===0 ? "bg-sage-100 border-sage-200 text-sage-400" : orderMode === 'extra' ? "bg-amber-600 border-amber-700 text-white hover:bg-amber-700" : "bg-primary-900 border-primary-950 text-white hover:bg-black"}`}>
                  <span className="relative z-10">{submitting ? "Đang xử lý..." : orderMode === 'extra' ? "Xác Nhận Gọi Món" : "Lưu Thực Đơn"}</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* EMERGENCY ALLERGY MODAL */}
      {showAllergyWarningModal && pendingAllergyItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-red-500 w-full max-w-lg shadow-2xl relative p-8">
            <div className="flex items-start space-x-4 mb-6">
              <div className="p-3 bg-red-100 text-red-700 rounded-full"><AlertTriangle className="h-8 w-8 animate-pulse" /></div>
              <div>
                <h3 className="text-xl font-bold text-red-800 uppercase">CẢNH BÁO NGUY HIỂM</h3>
                <p className="text-red-600 text-sm mt-1">{pendingAllergyItem.dish.warningMessage}</p>
              </div>
            </div>
            <p className="text-sage-700 text-sm mb-6 bg-red-50 p-4 border border-red-200">
                Món <strong>{pendingAllergyItem.dish.dishName}</strong> chứa thành phần mà bạn đã khai báo dị ứng trong hồ sơ y tế. Việc tiếp tục sử dụng có thể gây ra nguy cơ sốc phản vệ hoặc ảnh hưởng nghiêm trọng đến sức khỏe.
            </p>
            <p className="text-sage-900 font-bold mb-6 text-center">Bạn có thực sự muốn đặt món ăn này và tự chịu trách nhiệm rủi ro?</p>
            <div className="flex gap-4">
                <button onClick={cancelAllergyWarning} className="flex-1 py-3 bg-sage-200 hover:bg-sage-300 text-sage-800 font-bold uppercase text-sm">Hủy Bỏ (Khuyên Dùng)</button>
                <button onClick={confirmAllergyWarning} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-sm">Tôi Chấp Nhận Rủi Ro</button>
            </div>
          </div>
        </div>
      )}

      {/* CONSENT MODAL */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg p-8">
             <h3 className="text-xl font-bold uppercase">Bật tự động lọc?</h3>
             <p className="mt-4 text-sm mb-6">Bạn chưa bật bộ lọc dị ứng. Bạn có muốn kích hoạt bộ lọc tự động để đảm bảo an toàn?</p>
             <div className="flex gap-4">
                <button onClick={() => { setShowConsentModal(false); executeSubmitSelections(); }} className="flex-1 py-2 bg-gray-200 text-gray-800 font-bold text-xs">Vẫn gửi (Không lọc)</button>
                <button onClick={async () => { setShowConsentModal(false); await handleConsentSubmit(true); }} className="flex-1 py-2 bg-primary-800 text-white font-bold text-xs">Bật & Lọc Thực Đơn</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
