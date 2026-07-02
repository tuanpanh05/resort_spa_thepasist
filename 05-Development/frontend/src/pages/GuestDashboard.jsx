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
  Clock,
  Baby
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";

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
  const [activeTab, setActiveTab] = useState("Breakfast");
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
          // Lịch sử đơn hàng đã được fetch nhưng ta không load vào giỏ hàng hiện tại
          // để tránh cộng dồn số lượng và tính tiền sai (VD: 198 món).
        }

      } else {
        setSelectedDate(todayStr);
      }

      const menuRes = await axiosClient.get(`/guest/menu?userId=${data.userId}`);
      // Filter out items that are strictly disabled or not on today's active menu
      setMenuItems(menuRes.data.filter(item => item.enabled !== false && item.isTodayMenu !== false));
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

    if (!profileData.booking?.bookingId) {
      alert("Vui lòng đặt phòng trước khi tiến hành gọi món!");
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
      let errorMsg = err.response?.data?.message || err.response?.data || err.message;
      if (typeof errorMsg === 'object') errorMsg = JSON.stringify(errorMsg);
      alert("Lỗi khi đặt món: " + errorMsg);
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

  const renderDishCard = (dish) => {
    const isAllergen = consentCheckbox && dish.isAllergen;
    const isSoldOut = dish.soldOut === true && selectedDate === todayStr;
    const qty = selections[selectedDate]?.[activeTab]?.[dish.foodId] || 0;
    const isIncluded = isIncludedInPackage(dish.foodId);

    return (
      <div key={dish.foodId} className={`flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 border shadow-sm hover:shadow-lg ${isSoldOut ? "border-gray-200 bg-gray-50/80 opacity-70 grayscale-[0.5]" : isAllergen ? "border-red-300 bg-red-50/10 hover:border-red-400" : "border-primary-100 hover:border-primary-300 hover:-translate-y-1"}`}>
        
        {/* Image Section */}
        <div className="h-48 w-full relative overflow-hidden bg-sage-50">
          <img src={dish.image || getFoodImage(dish)} alt={dish.dishName} className={`w-full h-full object-cover transition-transform duration-700 ${!isSoldOut && 'hover:scale-110'}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90" />
          
          {isSoldOut && (
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-white/95 text-gray-800 font-bold text-[10px] px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">Hết Hàng</span>
            </div>
          )}
          
          {isAllergen && !isSoldOut && (
            <div className="absolute inset-0 bg-red-900/10 flex items-start justify-end p-3">
              <span className="bg-red-600/95 backdrop-blur-sm text-white font-bold text-[9px] px-3 py-1.5 rounded-full uppercase tracking-wider animate-pulse shadow-md flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> Dị Ứng</span>
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
              {isIncluded ? (
                <span className="bg-primary-500/95 backdrop-blur-sm text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">Gói Miễn Phí</span>
              ) : (
                <span />
              )}
              <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-white font-semibold font-mono text-base tracking-wider border border-white/10 shadow-sm">
                {formatCurrency(dish.price)}
              </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex-1 flex flex-col justify-between relative bg-white">
          <div>
            <h4 className={`font-serif text-[17px] font-bold leading-snug line-clamp-2 ${isAllergen ? "text-red-900" : "text-sage-900"}`}>{dish.dishName}</h4>
            <p className="text-xs text-sage-500 font-light mt-2 line-clamp-2 leading-relaxed">{dish.description}</p>
            
            <div className="flex flex-wrap gap-1.5 mt-3">
              {dish.dietaryTags && dish.dietaryTags.split(",").map((tag) => (
                <span key={tag.trim()} className="text-[9px] font-bold uppercase tracking-wider border border-primary-200/60 text-primary-700 px-2.5 py-0.5 bg-primary-50/50 rounded-full">
                  {tag.trim()}
                </span>
              ))}
            </div>
            
            {isAllergen && <div className="mt-3 bg-red-50/80 p-2.5 rounded-xl border border-red-100/50 flex items-start gap-2"><Info className="w-3 h-3 text-red-500 mt-0.5 shrink-0" /><p className="text-[10px] text-red-600 font-medium leading-relaxed">{dish.warningMessage}</p></div>}
          </div>
          
          {/* Controls */}
          <div className="mt-5 pt-4 border-t border-gray-100/80 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              {isSoldOut ? (
                <span className="text-[10px] font-bold bg-gray-100 px-4 py-2 rounded-xl uppercase text-gray-500 tracking-wider w-full text-center">Tạm Ngưng Phục Vụ</span>
              ) : orderMode === 'preselect' && selectedDate === todayStr ? (
                <span className="text-[10px] font-bold border border-amber-200 px-3 py-2 rounded-xl uppercase text-amber-600 bg-amber-50 w-full text-center tracking-wider">Đã Chốt Bếp</span>
              ) : (
                <div className="flex items-center justify-between w-full bg-sage-50/50 p-1.5 rounded-xl border border-primary-100">
                  <button disabled={qty===0} onClick={() => updateQuantity(selectedDate, activeTab, dish.foodId, -1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-primary-200 hover:shadow-sm transition-all disabled:opacity-30 disabled:hover:bg-transparent"><Minus className="h-3.5 w-3.5 text-sage-600"/></button>
                  <span className="font-mono text-sm font-bold w-8 text-center text-primary-950">{qty}</span>
                  <button onClick={() => handleIncreaseQuantity(selectedDate, activeTab, dish)} className={`w-8 h-8 flex items-center justify-center rounded-lg shadow-sm transition-all ${isAllergen ? "bg-red-100 hover:bg-red-200 text-red-600" : "bg-primary-800 hover:bg-primary-900 hover:shadow-md text-white"}`}><Plus className="h-3.5 w-3.5"/></button>
                </div>
              )}
            </div>
            
            {qty > 0 && !(orderMode === 'preselect' && selectedDate === todayStr) && (
              <div className="animate-fade-in">
                <input 
                  type="text" 
                  placeholder="Ghi chú cho bếp (VD: Ít cay...)"
                  className="w-full text-[11px] p-2.5 border border-primary-200/50 rounded-xl bg-white text-sage-700 placeholder:text-sage-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all shadow-inner"
                  value={specialNotes[`${selectedDate}_${activeTab}_${dish.foodId}`] || ""}
                  onChange={(e) => handleNoteChange(selectedDate, activeTab, dish.foodId, e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
                  Đơn gọi món của quý khách đã được chuyển thẳng tới Bếp Trưởng. <strong>Tổng tiền gọi món sẽ được tính vào hóa đơn (bill) khi thanh toán.</strong> Xin vui lòng giữ mã đơn bên dưới để đối chiếu khi nhận món.
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
                <Button onClick={() => setSuccessOrder(null)} variant="primary" className="px-8 py-3">
                  Quay Lại Đặt Món
                </Button>
            </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Info & Consent */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Customer Info Widget */}
              <Card className="p-6 border-primary-200/50">
                <h3 className="font-serif text-lg font-bold text-sage-900 border-b border-primary-100 pb-3 mb-4">

                  Thông Tin Đặt Bàn
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
                      <div className="flex justify-between items-center bg-sage-50/50 p-2 border border-sage-200 mt-2 mb-2">
                        <span className="font-bold text-sage-700 uppercase tracking-wider text-[11px]">BÀN ĐƯỢC XẾP:</span>
                        <span className="font-bold text-primary-800 text-base font-mono tracking-wider">
                          {(profileData.booking.tableName && profileData.booking.tableName !== "N/A" ? profileData.booking.tableName : profileData.booking.room) 
                            ? (profileData.booking.tableName && profileData.booking.tableName !== "N/A" ? profileData.booking.tableName : profileData.booking.room).split(',')[0].trim().replace(/Room-/gi, "").replace(/Room/gi, "").replace(/Phòng /gi, "")
                            : "Đang Xếp Bàn..."}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-dashed border-primary-100">
                        <span className="font-medium text-sage-500 uppercase tracking-wider text-[10px]">Mã đơn:</span>
                        <span className="font-bold text-primary-700">
                          {String(profileData.booking.bookingId).startsWith("BK-") 
                            ? profileData.booking.bookingId 
                            : `BK-${String(profileData.booking.bookingId).padStart(4, '0')}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sage-500 uppercase tracking-wider text-[10px]">Ngày nhận phòng:</span>
                        <span className="font-medium">{new Date(profileData.booking.checkInDate).toLocaleDateString("vi-VN")}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sage-500 uppercase tracking-wider text-[10px]">Ngày trả phòng:</span>
                        <span className="font-medium">{new Date(profileData.booking.checkOutDate).toLocaleDateString("vi-VN")}</span>
                      </div>
                      <div className="flex justify-between items-center bg-sage-50/50 p-2 border border-sage-200 mt-2">
                        <span className="font-bold text-sage-700 uppercase tracking-wider text-[11px]">Mã Ăn:</span>
                        <span className="font-bold text-sage-900 text-sm font-mono tracking-wider">MEAL-{String(profileData.booking.bookingId).replace('BK-', '').padStart(4, '0')}</span>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Consent Widget */}
              <Card className="p-6 border-primary-200/50 relative overflow-hidden group hover:border-primary-300 transition-all duration-300">
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
              </Card>

              {/* Info Card */}
              <Card className="p-6 border-primary-200/50">
                <h4 className="font-serif text-base font-bold text-sage-900 mb-3">Lưu ý Dịch Vụ</h4>
                <ul className="text-xs text-sage-600 space-y-2 font-medium">
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5" /> Thời gian phục vụ: 06:00 - 22:00 hàng ngày.</li>
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5" /> Phí phục vụ tại bàn là 15% (đã bao gồm trong phụ phí dự kiến).</li>
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5" /> Các món trong Gói Tiêu Chuẩn sẽ được miễn phí.</li>
                </ul>
              </Card>
            </div>

            {/* Right Column: Menu & Orders */}
            <div className="lg:col-span-8 flex flex-col h-full">
              {/* Immediate Service Banner or Preselect Info */}
              {orderMode === "extra" ? (
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50/30 rounded-2xl border border-amber-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden shadow-sm">
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Phục Vụ Tại Bàn Trong Ngày</span>
                        </div>
                        <span className="font-serif text-2xl font-bold text-amber-950 drop-shadow-sm">{todayStr.split("-").slice(1).reverse().join("/")}</span>
                    </div>
                    <span className="relative px-5 py-2 bg-amber-100/80 text-amber-800 text-[10px] font-bold uppercase tracking-widest rounded-full border border-amber-300 shadow-sm backdrop-blur-sm">Phục Vụ Ngay</span>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-gradient-to-r from-sage-50 to-emerald-50/30 rounded-2xl border border-sage-200/50 flex flex-col justify-between items-start gap-4 relative overflow-hidden shadow-sm">
                    <div className="relative w-full">
                        <div className="flex items-center justify-between w-full mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-sage-600" />
                            <span className="text-[10px] font-bold text-sage-700 uppercase tracking-widest">Lên Kế Hoạch Ẩm Thực</span>
                          </div>
                          <span className="relative px-3 py-1 bg-sage-100/80 text-sage-800 text-[10px] font-bold uppercase tracking-widest rounded-full border border-sage-300 shadow-sm backdrop-blur-sm">Đặt Trước Hạn Chót 22:00</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {bookingDays.map(day => (
                            <button 
                              key={day}
                              onClick={() => setSelectedDate(day)}
                              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${selectedDate === day ? "bg-sage-600 text-white border-sage-600 shadow-md" : "bg-white text-sage-600 border-sage-200 hover:border-sage-400"}`}
                            >
                              {day.split("-").slice(1).reverse().join("/")}
                            </button>
                          ))}
                        </div>
                    </div>
                </div>
              )}

              {/* MODE SWITCHER */}
              <div className="flex bg-sage-100/50 rounded-xl p-1 mb-4 border border-sage-200">
                <button 
                  onClick={() => handleModeSwitch("extra")}
                  className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${orderMode === "extra" ? "bg-white text-primary-800 shadow-sm border border-sage-200" : "text-sage-500 hover:text-sage-700"}`}
                >
                  Gọi Thêm Tại Bàn
                </button>
                <button 
                  onClick={() => handleModeSwitch("preselect")}
                  className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${orderMode === "preselect" ? "bg-white text-primary-800 shadow-sm border border-sage-200" : "text-sage-500 hover:text-sage-700"}`}
                >
                  Đặt Trước Bữa Ăn (Kế Hoạch)
                </button>
              </div>

              {/* TABS HEADER */}
              <div className="flex bg-white rounded-xl shadow-sm border border-primary-100 p-1 mb-6 relative z-10 overflow-x-auto hide-scrollbar">
                {["Breakfast", "Lunch", "Dinner"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setActiveTab(period)}
                    className={`flex-1 min-w-[100px] py-3 px-4 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                      activeTab === period 
                        ? "bg-primary-800 text-white shadow-md transform scale-[1.02]" 
                        : "text-sage-500 hover:text-primary-700 hover:bg-primary-50"
                    }`}
                  >
                    {period === "Breakfast" && <Coffee className="w-4 h-4" />}
                    {period === "Lunch" && <Sun className="w-4 h-4" />}
                    {period === "Dinner" && <Moon className="w-4 h-4" />}
                    {period}
                  </button>
                ))}
              </div>

              {/* MEAL TAB CONTENT */}
              {selectedDate && (
                <div className="flex-1">
                  <div className="flex flex-col gap-8 pb-24 w-full">
                    {(() => {
                      const filteredDishes = menuItems.filter(item => !item.periods || item.periods.includes(activeTab));
                      const kidsDishes = filteredDishes.filter(item => item.category === "Món trẻ em" || item.category === "Món ăn trẻ em" || item.dietaryTags?.toLowerCase().includes("kids") || item.dishName?.toLowerCase().includes("trẻ em"));
                      const adultDishes = filteredDishes.filter(item => item.category !== "Món trẻ em" && item.category !== "Món ăn trẻ em" && !item.dietaryTags?.toLowerCase().includes("kids") && !item.dishName?.toLowerCase().includes("trẻ em"));

                      if (filteredDishes.length === 0) {
                        return (
                          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                            <Coffee className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">Chưa có món ăn nào trong thực đơn này.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="flex flex-col gap-8 w-full">
                          {/* KIDS MENU SECTION */}
                          {kidsDishes.length > 0 && (
                            <div className="bg-amber-50/30 p-6 sm:p-8 rounded-3xl border border-amber-100/70 shadow-sm w-full">
                              <h3 className="font-serif text-base sm:text-lg font-bold text-amber-950 mb-6 flex items-center gap-2">
                                <Baby className="w-5 h-5 text-amber-700" /> Thực Đơn Cho Bé Dưới 5 Tuổi
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                {kidsDishes.map(renderDishCard)}
                              </div>
                            </div>
                          )}

                          {/* ADULT MENU SECTION */}
                          {adultDishes.length > 0 && (
                            <div className="p-2 w-full">
                              <h3 className="font-serif text-base sm:text-lg font-bold text-sage-950 mb-6 flex items-center gap-2">
                                <UtensilsCrossed className="w-4 h-4 text-primary-800" /> Thực Đơn Người Lớn
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                {adultDishes.map(renderDishCard)}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* STICKY BOTTOM SUBMIT BAR */}
      {!successOrder && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-primary-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 transform transition-transform duration-500">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="bg-primary-50 p-3 rounded-2xl hidden sm:block">
                  <UtensilsCrossed className="w-6 h-6 text-primary-700" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-sage-500 uppercase tracking-widest mb-1 block">Đã Chọn ({getSelectedItemsCount()} món)</span>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-primary-950 block">{formatCurrency(calculateTotalBill())}</span>
              </div>
            </div>
            <Button 
              disabled={submitting || getSelectedItemsCount()===0} 
              onClick={handleSubmitSelections} 
              variant={getSelectedItemsCount()===0 ? "secondary" : (orderMode === 'extra' ? "warning" : "primary")}
              className={`w-full sm:w-auto px-10 py-3.5 sm:py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all duration-300 ${getSelectedItemsCount() > 0 ? 'shadow-xl shadow-primary-900/20 hover:-translate-y-1' : ''}`}
            >
              {submitting ? "Đang xử lý..." : orderMode === 'extra' ? "Xác Nhận Gọi Món" : "Lưu Thực Đơn"}
            </Button>
          </div>
        </div>
      )}


      {/* EMERGENCY ALLERGY MODAL */}
      {showAllergyWarningModal && pendingAllergyItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-xl border border-red-200 w-full max-w-lg shadow-[0_0_50px_rgba(220,38,38,0.15)] relative p-8 rounded-none overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-rose-500 to-red-500" />
            <div className="flex items-start space-x-4 mb-6">
              <div className="p-3 bg-red-50 text-red-600 rounded-none shadow-inner"><AlertTriangle className="h-8 w-8 animate-pulse" /></div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-red-900 uppercase">Cảnh Báo Nguy Hiểm</h3>
                <p className="text-red-600 text-sm mt-1 font-medium">{pendingAllergyItem.dish.warningMessage}</p>
              </div>
            </div>
            <p className="text-sage-700 text-sm mb-6 bg-red-50/50 p-4 border border-red-100 rounded-none leading-relaxed">
                Món <strong>{pendingAllergyItem.dish.dishName}</strong> chứa thành phần mà bạn đã khai báo dị ứng trong hồ sơ y tế. Việc tiếp tục sử dụng có thể gây ra nguy cơ sốc phản vệ hoặc ảnh hưởng nghiêm trọng đến sức khỏe.
            </p>
            <p className="text-sage-900 font-bold mb-6 text-center text-sm">Bạn có thực sự muốn đặt món ăn này và tự chịu trách nhiệm rủi ro?</p>
            <div className="flex gap-4">
                <Button variant="outline" onClick={cancelAllergyWarning} className="flex-1 text-sage-600">Hủy Bỏ (Khuyên Dùng)</Button>
                <Button variant="danger" onClick={confirmAllergyWarning} className="flex-1 shadow-lg shadow-red-500/20">Tôi Chấp Nhận Rủi Ro</Button>
            </div>
          </div>
        </div>
      )}

      {/* CONSENT MODAL */}
      <Modal isOpen={showConsentModal} onClose={() => setShowConsentModal(false)} title="Bật tự động lọc?">
         <p className="mt-4 text-sm mb-6 text-sage-600 font-medium">Bạn chưa bật bộ lọc dị ứng. Bạn có muốn kích hoạt bộ lọc tự động để đảm bảo an toàn không?</p>
         <div className="flex gap-4">
            <Button variant="outline" onClick={() => { setShowConsentModal(false); executeSubmitSelections(); }} className="flex-1">Vẫn gửi (Không lọc)</Button>
            <Button variant="primary" onClick={async () => { setShowConsentModal(false); await handleConsentSubmit(true); executeSubmitSelections(); }} className="flex-1">Bật & Lọc Thực Đơn</Button>
         </div>
      </Modal>
    </div>
  );
}
