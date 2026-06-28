import React, { useState, useEffect } from "react";
import { Search, Edit, X, UserCheck, Shield, AlertCircle, Loader2, Eye, Users, Bed, CreditCard, Calendar, Plus, LogOut } from "lucide-react";
import { staffApi, bookingApi, masterDataApi, paymentApi, bookingLookupApi } from "../../api";

/**
 * UC08: ManageBookings — Arrivals Dashboard & Check-In Management.
 * Connects to real backend APIs for listing bookings and performing check-in.
 * Check-In modal collects CCCD/Passport per Vietnamese Residence Law 2020.
 * Enhanced with Overview Stat Cards, Date Filter, and Walk-in Guest Form.
 */
export default function ManageBookings({
  bookings: mockBookings,
  rooms,
  payments,
  setBookings,
  setRooms,
  setPayments,
  onViewItinerary,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [arrivals, setArrivals] = useState([]);
  const [villas, setVillas] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check-Out modal states
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [checkOutBooking, setCheckOutBooking] = useState(null);
  const [checkoutInvoice, setCheckoutInvoice] = useState(null);
  const [checkoutItinerary, setCheckoutItinerary] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutVoucherCode, setCheckoutVoucherCode] = useState("");
  const [isApplyingCheckoutVoucher, setIsApplyingCheckoutVoucher] = useState(false);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState("CASH");

  // Check-In modal state
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInBooking, setCheckInBooking] = useState(null);
  const [identityDocument, setIdentityDocument] = useState("");
  const [nationality, setNationality] = useState("Vietnam");
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInError, setCheckInError] = useState(null);
  const [adultCount, setAdultCount] = useState(0);
  const [childCount, setChildCount] = useState(0);
  const [accompanyingAdults, setAccompanyingAdults] = useState([]);
  const [accompanyingChildren, setAccompanyingChildren] = useState([]);

  // Walk-in guest modal state
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInLoading, setWalkInLoading] = useState(false);
  const [walkInError, setWalkInError] = useState(null);
  const [walkInForm, setWalkInForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    roomId: "",
    packageId: "",
    checkInDate: new Date().toISOString().split("T")[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    guestsCount: 1
  });

  // Walk-in options dropdown and extra service modals
  const [showWalkInDropdown, setShowWalkInDropdown] = useState(false);
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupResults, setLookupResults] = useState([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);
  const [selectedLookupBooking, setSelectedLookupBooking] = useState(null);

  const [showAddExtraModal, setShowAddExtraModal] = useState(false);
  const [extraLoading, setExtraLoading] = useState(false);
  const [extraError, setExtraError] = useState(null);
  const [extraItinerary, setExtraItinerary] = useState(null);
  const [extraForm, setExtraForm] = useState({
    roomId: "",
    packageId: "",
    checkInDate: "",
    checkOutDate: "",
    foodMenuId: "",
    foodQuantity: 1,
    spaServiceId: "",
    spaStartDatetime: ""
  });
  
  const [foodMenu, setFoodMenu] = useState([]);
  const [spaServices, setSpaServices] = useState([]);

  // Load all operational data from API
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [arrivalsData, villasData, packagesData, foodData, spaData] = await Promise.all([
        staffApi.getArrivals(),
        staffApi.getVillas(),
        masterDataApi.getRetreatPackages(),
        staffApi.getFoodMenu().catch(() => []),
        masterDataApi.getSpaServices().catch(() => [])
      ]);
      setArrivals(arrivalsData || []);
      setVillas(villasData || []);
      setPackages(packagesData || []);
      setFoodMenu(foodData || []);
      setSpaServices(spaData || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách dữ liệu vận hành.");
      setArrivals([]);
      setVillas([]);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  // Open Check-In modal
  const openCheckInModal = (booking) => {
    setCheckInBooking(booking);
    setIdentityDocument("");
    setNationality("Vietnam");
    setCheckInError(null);

    const accAdultsCount = Math.max(0, (booking.guestsCount || 1) - 1);
    const accChildrenCount = booking.childrenCount || 0;

    setAdultCount(accAdultsCount);
    setChildCount(accChildrenCount);
    setAccompanyingAdults(Array.from({ length: accAdultsCount }, () => ({ fullName: "", identityDocument: "" })));
    setAccompanyingChildren(Array.from({ length: accChildrenCount }, () => ({ fullName: "", relationship: "Con" })));

    setShowCheckInModal(true);
  };

  const handleAdultCountChange = (newCount) => {
    const count = Math.max(0, parseInt(newCount) || 0);
    setAdultCount(count);
    setAccompanyingAdults((prev) => {
      const next = [...prev];
      if (count > prev.length) {
        for (let i = prev.length; i < count; i++) {
          next.push({ fullName: "", identityDocument: "" });
        }
      } else if (count < prev.length) {
        next.splice(count);
      }
      return next;
    });
  };

  const handleChildCountChange = (newCount) => {
    const count = Math.max(0, parseInt(newCount) || 0);
    setChildCount(count);
    setAccompanyingChildren((prev) => {
      const next = [...prev];
      if (count > prev.length) {
        for (let i = prev.length; i < count; i++) {
          next.push({ fullName: "", relationship: "Con" });
        }
      } else if (count < prev.length) {
        next.splice(count);
      }
      return next;
    });
  };

  // Perform Check-In via API
  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!identityDocument.trim()) {
      setCheckInError("Vui lòng nhập số CCCD / Hộ chiếu (bắt buộc theo Luật Cư trú 2020).");
      return;
    }

    // Validate that all adult fields are filled
    for (let i = 0; i < accompanyingAdults.length; i++) {
      if (!accompanyingAdults[i].fullName.trim() || !accompanyingAdults[i].identityDocument.trim()) {
        setCheckInError(`Vui lòng nhập đầy đủ Họ tên và CCCD cho Khách đi cùng thứ ${i + 1}.`);
        return;
      }
    }
    // Validate child fields
    for (let i = 0; i < accompanyingChildren.length; i++) {
      if (!accompanyingChildren[i].fullName.trim()) {
        setCheckInError(`Vui lòng nhập Họ và tên cho Trẻ em thứ ${i + 1}.`);
        return;
      }
    }

    setCheckInLoading(true);
    setCheckInError(null);
    try {
      const mappedGuests = [
        ...accompanyingAdults.map(a => ({ fullName: a.fullName.trim(), identityDocument: a.identityDocument.trim(), relationship: "Khách đi cùng", isChild: false })),
        ...accompanyingChildren.map(c => ({ fullName: c.fullName.trim(), identityDocument: null, relationship: c.relationship.trim(), isChild: true }))
      ];

      await staffApi.performCheckIn({
        bookingId: checkInBooking.bookingId,
        identityDocument: identityDocument.trim(),
        nationality: nationality.trim(),
        accompanyingGuests: mappedGuests
      });
      setShowCheckInModal(false);
      await loadAllData();
      alert(`Check-in thành công cho khách ${checkInBooking.guestName}!`);
    } catch (err) {
      setCheckInError(err.message || "Không thể thực hiện check-in.");
    } finally {
      setCheckInLoading(false);
    }
  };

  // Walk-in Booking Submission
  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    if (!walkInForm.fullName.trim() || !walkInForm.email.trim() || !walkInForm.phone.trim() || !walkInForm.roomId) {
      setWalkInError("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }
    setWalkInLoading(true);
    setWalkInError(null);
    try {
      const dto = {
        fullName: walkInForm.fullName.trim(),
        email: walkInForm.email.trim(),
        phone: walkInForm.phone.trim(),
        roomId: parseInt(walkInForm.roomId),
        checkInDate: walkInForm.checkInDate,
        checkOutDate: walkInForm.checkOutDate,
        guestsCount: parseInt(walkInForm.guestsCount || 1),
        packageIds: walkInForm.packageId ? [parseInt(walkInForm.packageId)] : [],
      };

      await bookingApi.createBooking(dto);
      setShowWalkInModal(false);
      // Reset form
      setWalkInForm({
        fullName: "",
        email: "",
        phone: "",
        roomId: "",
        packageId: "",
        checkInDate: new Date().toISOString().split("T")[0],
        checkOutDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        guestsCount: 1
      });
      await loadAllData();
      alert("Đặt phòng cho khách vãng lai (Walk-in Guest) thành công!");
    } catch (err) {
      setWalkInError(err.message || "Không thể đặt phòng cho khách vãng lai.");
    } finally {
      setWalkInLoading(false);
    }
  };

  const handleLookupSubmit = async (e) => {
    e.preventDefault();
    if (!lookupEmail.trim() || !lookupPhone.trim()) {
      setLookupError("Vui lòng điền cả Email và Số điện thoại.");
      return;
    }
    setLookupLoading(true);
    setLookupError(null);
    setLookupResults([]);
    setSelectedLookupBooking(null);
    try {
      const results = await bookingLookupApi.lookup(lookupEmail.trim(), lookupPhone.trim());
      const activeBookings = (results || []).filter(b => b.status === "CONFIRMED" || b.status === "CHECKED_IN");
      setLookupResults(activeBookings);
      if (activeBookings.length === 0) {
        setLookupError("Không tìm thấy đặt phòng nào đang hoạt động cho Email và Số điện thoại này.");
      }
    } catch (err) {
      setLookupError(err.message || "Lỗi khi tra cứu đặt phòng.");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleAddExtraSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLookupBooking) {
      setExtraError("Vui lòng chọn một đặt phòng trước.");
      return;
    }
    
    if (!extraForm.roomId && !extraForm.packageId && !extraForm.foodMenuId && !extraForm.spaServiceId) {
      setExtraError("Vui lòng chọn ít nhất một dịch vụ để đặt thêm.");
      return;
    }

    setExtraLoading(true);
    setExtraError(null);
    try {
      const payload = {
        roomId: extraForm.roomId ? parseInt(extraForm.roomId) : null,
        packageId: extraForm.packageId ? parseInt(extraForm.packageId) : null,
        checkInDate: extraForm.checkInDate || null,
        checkOutDate: extraForm.checkOutDate || null,
        foodMenuId: extraForm.foodMenuId ? parseInt(extraForm.foodMenuId) : null,
        foodQuantity: extraForm.foodMenuId ? parseInt(extraForm.foodQuantity || 1) : null,
        spaServiceId: extraForm.spaServiceId ? parseInt(extraForm.spaServiceId) : null,
        spaStartDatetime: extraForm.spaServiceId ? extraForm.spaStartDatetime : null
      };

      const res = await staffApi.addExtraServices(selectedLookupBooking.bookingId, payload);
      
      alert(`Đặt thêm dịch vụ thành công!\nPhát sinh: ${formatCurrency(res.totalAddedPrice || 0)}\nCọc thêm: ${formatCurrency(res.additionalDeposit || 0)}`);
      
      setShowAddExtraModal(false);
      setShowLookupModal(false);
      setExtraForm({
        roomId: "",
        packageId: "",
        checkInDate: "",
        checkOutDate: "",
        foodMenuId: "",
        foodQuantity: 1,
        spaServiceId: "",
        spaStartDatetime: ""
      });
      setSelectedLookupBooking(null);
      await loadAllData();
    } catch (err) {
      setExtraError(err.message || "Không thể đặt thêm dịch vụ.");
    } finally {
      setExtraLoading(false);
    }
  };

  // Format error messages to hide raw database/SQL exceptions from guests/staff
  const cleanErrorMessage = (err) => {
    const msg = err?.message || "";
    if (msg.includes("constraint") || msg.includes("execute statement") || msg.includes("SQL") || msg.includes("constraint") || msg.includes("foreign key") || msg.includes("check constraint")) {
      return "Hệ thống gặp sự cố khi đồng bộ hóa đơn với Cơ sở dữ liệu. Vui lòng liên hệ quản trị viên hoặc kiểm tra kết nối DB.";
    }
    return msg || "Đã xảy ra lỗi không xác định.";
  };

  // Open Check-Out & Generate Invoice details
  const openCheckOutModal = async (booking) => {
    setCheckOutBooking(booking);
    setCheckoutInvoice(null);
    setCheckoutItinerary(null);
    setCheckoutError(null);
    setCheckoutVoucherCode("");
    setShowCheckOutModal(true);
    setCheckoutLoading(true);
    try {
      // 1. Create or get existing invoice
      const invoiceData = await paymentApi.createInvoice(booking.bookingId);
      setCheckoutInvoice(invoiceData);
      
      // 2. Get itinerary details (timeline services)
      const itineraryData = await bookingLookupApi.getItinerary(booking.bookingId);
      setCheckoutItinerary(itineraryData);
    } catch (err) {
      setCheckoutError(cleanErrorMessage(err));
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Perform standard Cash payment & Check-out
  const handlePerformCheckout = async () => {
    if (!checkoutInvoice) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      // 1. Mark cash payment (pays off remaining amount)
      await paymentApi.markCashPayment(checkoutInvoice.invoiceId);
      
      // 2. Perform checkout
      await paymentApi.performCheckout(checkoutInvoice.invoiceId);
      
      alert(`Đã hoàn tất check-out cho khách ${checkOutBooking.guestName}! Phòng đã chuyển sang trạng thái cần vệ sinh (DIRTY).`);
      setShowCheckOutModal(false);
      await loadAllData();
    } catch (err) {
      setCheckoutError(cleanErrorMessage(err));
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Perform early/force check-out (cancels pending F&B)
  const handleForceCheckout = async () => {
    if (!checkoutInvoice) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      // Mark cash payment
      await paymentApi.markCashPayment(checkoutInvoice.invoiceId);
      
      // Perform early checkout (force cancel pending food and checkout)
      await paymentApi.earlyCheckout(checkoutInvoice.invoiceId);
      
      alert(`Đã hoàn tất check-out sớm (Hủy cưỡng bức các đơn ăn uống chưa phục vụ) cho khách ${checkOutBooking.guestName}!`);
      setShowCheckOutModal(false);
      await loadAllData();
    } catch (err) {
      setCheckoutError(cleanErrorMessage(err));
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Apply voucher at counter
  const handleApplyCheckoutVoucher = async () => {
    if (!checkoutInvoice || !checkoutVoucherCode.trim()) return;
    setIsApplyingCheckoutVoucher(true);
    setCheckoutError(null);
    try {
      const updated = await paymentApi.applyVoucher(checkoutInvoice.invoiceId, checkoutVoucherCode.trim());
      setCheckoutInvoice(updated);
      alert("Áp dụng mã giảm giá thành công!");
    } catch (err) {
      setCheckoutError(cleanErrorMessage(err));
    } finally {
      setIsApplyingCheckoutVoucher(false);
    }
  };

  // Remove voucher at counter
  const handleRemoveCheckoutVoucher = async () => {
    if (!checkoutInvoice) return;
    setIsApplyingCheckoutVoucher(true);
    setCheckoutError(null);
    try {
      const updated = await paymentApi.removeVoucher(checkoutInvoice.invoiceId);
      setCheckoutInvoice(updated);
      setCheckoutVoucherCode("");
      alert("Đã gỡ bỏ mã giảm giá.");
    } catch (err) {
      setCheckoutError(cleanErrorMessage(err));
    } finally {
      setIsApplyingCheckoutVoucher(false);
    }
  };

  // Format currency
  const formatCurrency = (val) => {
    if (!val) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  // Check if check-in date is reached or passed
  const isCheckInAllowed = (checkInDateStr) => {
    if (!checkInDateStr) return false;
    const checkIn = new Date(checkInDateStr);
    checkIn.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today >= checkIn;
  };

  // Filter arrivals
  const filteredArrivals = arrivals.filter((b) => {
    const matchesSearch =
      (b.guestName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(b.bookingId).includes(searchTerm);
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "CONFIRMED" && b.status === "CONFIRMED") ||
      (statusFilter === "CHECKED_IN" && b.status === "CHECKED_IN") ||
      (statusFilter === "PENDING_DEPOSIT" && b.status === "PENDING_DEPOSIT");

    // Date filter logic
    const todayStr = new Date().toISOString().split("T")[0];
    const checkInStr = b.checkInDate ? b.checkInDate.split("T")[0] : "";
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    let matchesDate = true;
    if (dateFilter === "Today") {
      matchesDate = checkInStr === todayStr;
    } else if (dateFilter === "Tomorrow") {
      matchesDate = checkInStr === tomorrowStr;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate stats
  const expectedArrivals = arrivals.filter(b => b.status === "CONFIRMED").length;
  const inHouse = arrivals.filter(b => b.status === "CHECKED_IN").length;
  const pendingDeposit = arrivals.filter(b => b.status === "PENDING_DEPOSIT").length;
  const availableVillasCount = villas.filter(v => v.status === "AVAILABLE" || v.status === "available").length;

  // Status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-blue-50 text-blue-700 border border-blue-200/50";
      case "CHECKED_IN":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
      case "CHECKED_OUT":
        return "bg-gray-50 text-gray-600 border border-gray-250/50";
      case "PENDING_DEPOSIT":
        return "bg-amber-50 text-amber-700 border border-amber-200/50";
      default:
        return "bg-gray-50 text-gray-500 border border-gray-200/50";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "CONFIRMED": return "Chờ Check-in";
      case "CHECKED_IN": return "Đang lưu trú";
      case "CHECKED_OUT": return "Đã trả phòng";
      case "PENDING_DEPOSIT": return "Chờ đặt cọc";
      default: return status;
    }
  };

  // Calculate dynamic totals for Add Extra Services modal
  const getExtraServicesTotals = () => {
    if (!showAddExtraModal || !selectedLookupBooking) return { roomTotal: 0, pkgTotal: 0, foodTotal: 0, spaTotal: 0, totalAdded: 0, roomNights: 0 };
    
    let roomTotal = 0;
    let roomNights = 0;
    if (extraForm.roomId) {
      const selectedRoom = villas.find(v => String(v.roomId) === String(extraForm.roomId));
      if (extraForm.checkInDate && extraForm.checkOutDate) {
        const start = new Date(extraForm.checkInDate);
        const end = new Date(extraForm.checkOutDate);
        const diffTime = end - start;
        roomNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      if (roomNights <= 0) roomNights = 1;
      roomTotal = (selectedRoom ? (selectedRoom.basePrice || selectedRoom.basePricePerNight || 0) : 0) * roomNights;
    }

    let pkgTotal = 0;
    if (extraForm.packageId) {
      const selectedPkg = packages.find(p => String(p.packageId) === String(extraForm.packageId));
      pkgTotal = selectedPkg ? (selectedPkg.price || 0) : 0;
    }

    let foodTotal = 0;
    if (extraForm.foodMenuId) {
      const selectedFood = foodMenu.find(f => String(f.foodId) === String(extraForm.foodMenuId));
      const qty = parseInt(extraForm.foodQuantity) || 1;
      foodTotal = (selectedFood ? (selectedFood.price || 0) : 0) * qty;
    }

    let spaTotal = 0;
    if (extraForm.spaServiceId) {
      const selectedSpa = spaServices.find(s => String(s.serviceId) === String(extraForm.spaServiceId));
      spaTotal = selectedSpa ? (selectedSpa.price || 0) : 0;
    }

    const totalAdded = roomTotal + pkgTotal + foodTotal + spaTotal;
    return { roomTotal, pkgTotal, foodTotal, spaTotal, totalAdded, roomNights };
  };

  const { roomTotal, pkgTotal, foodTotal, spaTotal, totalAdded, roomNights } = getExtraServicesTotals();

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header */}
      <div className="bg-white border border-primary-100 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-[0_2px_10px_rgba(26,44,34,0.02)]">
        <div>
          <h3 className="font-serif text-lg font-normal text-sage-950">
            Quản Lý Đơn Đặt Phòng & Check-In
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Danh sách đặt phòng từ hệ thống. Thực hiện check-in với xác minh CCCD/Hộ chiếu (Luật Cư trú 2020).
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <button
              onClick={() => setShowWalkInDropdown(!showWalkInDropdown)}
              className="w-full px-4 py-2 bg-[#cda250] hover:bg-[#b0873a] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 transition-all duration-300"
            >
              <Plus className="h-3.5 w-3.5" />
              Khách vãng lai (Walk-in)
            </button>
            {showWalkInDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-primary-100 shadow-xl z-50 py-1 text-xs">
                <button
                  onClick={() => {
                    setShowWalkInDropdown(false);
                    setShowWalkInModal(true);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-primary-50 text-sage-800 font-semibold cursor-pointer transition-colors"
                >
                  ➕ Đặt phòng mới
                </button>
                <button
                  onClick={() => {
                    setShowWalkInDropdown(false);
                    setShowLookupModal(true);
                    setLookupEmail("");
                    setLookupPhone("");
                    setLookupError(null);
                    setLookupResults([]);
                    setSelectedLookupBooking(null);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-primary-50 text-sage-800 font-semibold cursor-pointer border-t border-primary-50 transition-colors"
                >
                  🔄 Đặt thêm dịch vụ
                </button>
              </div>
            )}
          </div>
          <button
            onClick={loadAllData}
            className="px-3 py-2 border border-primary-100 hover:bg-primary-50 text-sage-600 hover:text-sage-900 text-xs font-semibold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 transition-all"
            title="Tải lại dữ liệu"
          >
            <Loader2 className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Expected Arrivals Card */}
        <div className="bg-white border border-[#cda250]/20 p-5 shadow-[0_4px_20px_rgba(26,44,34,0.03)] flex items-center justify-between transition-all duration-300 hover:shadow-[0_10px_30px_rgba(26,44,34,0.08)] hover:-translate-y-0.5">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-sage-500">Chờ Check-in hôm nay</p>
            <p className="text-2xl font-serif font-semibold text-sage-950">{expectedArrivals}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        {/* In-House Guests Card */}
        <div className="bg-white border border-[#cda250]/20 p-5 shadow-[0_4px_20px_rgba(26,44,34,0.03)] flex items-center justify-between transition-all duration-300 hover:shadow-[0_10px_30px_rgba(26,44,34,0.08)] hover:-translate-y-0.5">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-sage-500">Khách đang lưu trú</p>
            <p className="text-2xl font-serif font-semibold text-sage-950">{inHouse}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Available Rooms Card */}
        <div className="bg-white border border-[#cda250]/20 p-5 shadow-[0_4px_20px_rgba(26,44,34,0.03)] flex items-center justify-between transition-all duration-300 hover:shadow-[0_10px_30px_rgba(26,44,34,0.08)] hover:-translate-y-0.5">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-sage-500">Villa trống sẵn sàng</p>
            <p className="text-2xl font-serif font-semibold text-sage-950">{availableVillasCount}</p>
          </div>
          <div className="p-3 bg-[#faf8f5] text-[#cda250] border border-[#cda250]/30 rounded-lg">
            <Bed className="h-5 w-5" />
          </div>
        </div>

        {/* Pending Deposit Card */}
        <div className="bg-white border border-[#cda250]/20 p-5 shadow-[0_4px_20px_rgba(26,44,34,0.03)] flex items-center justify-between transition-all duration-300 hover:shadow-[0_10px_30px_rgba(26,44,34,0.08)] hover:-translate-y-0.5">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-sage-500">Đơn chờ đặt cọc</p>
            <p className="text-2xl font-serif font-semibold text-sage-950">{pendingDeposit}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-lg">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 flex items-center gap-2 text-red-700 text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter panel */}
      <div className="bg-white border border-primary-100 p-5 flex flex-col sm:flex-row gap-4 items-center shadow-[0_2px_10px_rgba(26,44,34,0.01)]">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-sage-400" />
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng, mã đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-primary-100 text-xs focus:outline-primary-200"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="CONFIRMED">Chờ Check-in</option>
              <option value="CHECKED_IN">Đang lưu trú</option>
              <option value="PENDING_DEPOSIT">Chờ đặt cọc</option>
            </select>
          </div>
          <div className="flex-1 sm:w-40">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full p-2 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
            >
              <option value="All">Mọi ngày lưu trú</option>
              <option value="Today">Đến hôm nay</option>
              <option value="Tomorrow">Đến ngày mai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-sage-500">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm font-medium">Đang tải dữ liệu đặt phòng...</span>
        </div>
      )}

      {/* Bookings Table */}
      {!loading && (
        <div className="bg-white border border-primary-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-primary-50/50 text-sage-600 font-bold border-b border-primary-100">
                  <th className="p-4">Mã đơn</th>
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Ngày lưu trú</th>
                  <th className="p-4">Phòng / Villa</th>
                  <th className="p-4">Gói trị liệu</th>
                  <th className="p-4">Đã cọc</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-center">Tác vụ lễ tân</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50/50">
                {filteredArrivals.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-sage-400 italic bg-[#fafbf9]">
                      Không tìm thấy đơn đặt phòng nào phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredArrivals.map((b) => (
                    <tr key={b.bookingId} className="hover:bg-primary-50/10">
                      <td className="p-4 font-bold text-primary-950">
                        #{b.bookingId}
                      </td>
                      <td className="p-4 font-semibold text-sage-950">
                        <div>{b.guestName || "—"}</div>
                        <div className="text-[10px] text-sage-400 font-mono mt-0.5">
                          {b.guestPhone || b.guestEmail || ""}
                        </div>
                        {b.specialRequests && (
                          <div className="mt-1.5 text-[10px] text-amber-700 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded font-normal inline-block max-w-[200px] break-words" title={b.specialRequests}>
                            <strong>YC đặc biệt:</strong> {b.specialRequests}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sage-700">
                        <div>
                          {formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {b.roomNumber ? (
                            b.roomNumber.split(", ").map((num) => (
                              <span
                                key={num}
                                className="px-2 py-0.5 bg-primary-100 text-primary-900 border border-primary-200/50 text-[10px] font-bold uppercase rounded-md tracking-wider shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                              >
                                {num}
                              </span>
                            ))
                          ) : (
                            <span className="px-2 py-0.5 bg-yellow-50 text-yellow-800 border border-yellow-250/50 text-[10px] font-bold uppercase rounded-md">
                              Chưa gán phòng
                            </span>
                          )}
                        </div>
                        {b.roomTypeName && (
                          <div className="text-[10px] text-sage-500 mt-1.5 italic font-medium max-w-[220px] truncate" title={b.roomTypeName}>
                            {b.roomTypeName}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sage-600 text-[11px]">
                        {b.packageName || "Không có gói"}
                      </td>
                      <td className="p-4 font-semibold text-primary-850 text-[11px]">
                        {formatCurrency(b.depositPaid)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(b.status)}`}>
                          {getStatusLabel(b.status)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {b.status === "CONFIRMED" && (
                            isCheckInAllowed(b.checkInDate) ? (
                              <button
                                onClick={() => openCheckInModal(b)}
                                className="px-2.5 py-1.5 bg-primary-800 hover:bg-primary-900 text-white rounded-none text-[10px] font-semibold uppercase tracking-wider cursor-pointer flex items-center gap-1 transition-colors"
                              >
                                <UserCheck className="h-3 w-3" />
                                Check-in
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-red-650 bg-red-50 border border-red-200/50 px-2 py-1.5 rounded-none uppercase select-none">
                                Chưa đến ngày check-in
                              </span>
                            )
                          )}
                          {b.status === "CHECKED_IN" && (
                            <button
                              onClick={() => openCheckOutModal(b)}
                              className="px-2.5 py-1.5 bg-red-700 hover:bg-red-850 text-white rounded-none text-[10px] font-semibold uppercase tracking-wider cursor-pointer flex items-center gap-1 transition-colors"
                            >
                              <LogOut className="h-3 w-3" />
                              Check-out
                            </button>
                          )}
                          {onViewItinerary && (
                            <button
                              onClick={() => onViewItinerary(b.bookingId)}
                              className="p-1.5 bg-primary-50 hover:bg-primary-100 text-primary-950 rounded-none cursor-pointer transition-colors"
                              title="Xem lịch trình"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
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

      {/* Walk-in Booking Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-primary-50 pb-3">
              <h3 className="font-serif text-lg font-normal text-sage-950 flex items-center gap-2">
                <Bed className="h-5 w-5 text-[#cda250]" />
                Nhận Khách Vãng Lai (Walk-in Booking)
              </h3>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="text-sage-400 hover:text-sage-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {walkInError && (
              <div className="bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{walkInError}</span>
              </div>
            )}

            <form onSubmit={handleWalkInSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Tên khách hàng <span className="text-red-550">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={walkInForm.fullName}
                    onChange={(e) => setWalkInForm({ ...walkInForm, fullName: e.target.value })}
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full p-2.5 border border-primary-100 focus:outline-primary-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Số điện thoại <span className="text-red-550">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={walkInForm.phone}
                    onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                    placeholder="VD: 0987654321"
                    className="w-full p-2.5 border border-primary-100 focus:outline-primary-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Email khách hàng <span className="text-red-550">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={walkInForm.email}
                  onChange={(e) => setWalkInForm({ ...walkInForm, email: e.target.value })}
                  placeholder="VD: guest@gmail.com"
                  className="w-full p-2.5 border border-primary-100 focus:outline-primary-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Ngày nhận phòng <span className="text-red-550">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={walkInForm.checkInDate}
                    onChange={(e) => setWalkInForm({ ...walkInForm, checkInDate: e.target.value })}
                    className="w-full p-2.5 border border-primary-100 focus:outline-primary-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Ngày trả phòng <span className="text-red-550">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={walkInForm.checkOutDate}
                    onChange={(e) => setWalkInForm({ ...walkInForm, checkOutDate: e.target.value })}
                    className="w-full p-2.5 border border-primary-100 focus:outline-primary-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Chọn biệt thự/Phòng trống <span className="text-red-550">*</span>
                  </label>
                  <select
                    required
                    value={walkInForm.roomId}
                    onChange={(e) => setWalkInForm({ ...walkInForm, roomId: e.target.value })}
                    className="w-full p-2.5 border border-primary-100 focus:outline-primary-200 bg-white"
                  >
                    <option value="">-- Chọn phòng khả dụng --</option>
                    {villas
                      .filter((v) => v.status === "AVAILABLE" || v.status === "available")
                      .map((v) => (
                        <option key={v.roomId} value={v.roomId}>
                          Phòng {v.roomNumber} ({v.roomTypeName} - Tối đa {v.capacity || 2} khách)
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Chọn gói Retreat trị liệu
                  </label>
                  <select
                    value={walkInForm.packageId}
                    onChange={(e) => setWalkInForm({ ...walkInForm, packageId: e.target.value })}
                    className="w-full p-2.5 border border-primary-100 focus:outline-primary-200 bg-white"
                  >
                    <option value="">Không sử dụng gói</option>
                    {packages.map((pkg) => (
                      <option key={pkg.packageId} value={pkg.packageId}>
                        {pkg.name} ({pkg.durationDays} ngày - {formatCurrency(pkg.price)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Số lượng khách
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={walkInForm.guestsCount}
                  onChange={(e) => setWalkInForm({ ...walkInForm, guestsCount: e.target.value })}
                  className="w-full p-2.5 border border-primary-100 focus:outline-primary-200"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 border border-primary-100 text-xs font-semibold uppercase tracking-wider hover:bg-primary-50 cursor-pointer"
                  disabled={walkInLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={walkInLoading}
                  className="px-6 py-2 bg-primary-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-900 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {walkInLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Tạo đặt phòng
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check-In Modal — UC08 with CCCD/Passport collection (Residence Law 2020) */}
      {showCheckInModal && checkInBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 space-y-5 shadow-2xl rounded-xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-primary-50 pb-3">
              <h3 className="font-serif text-lg font-normal text-sage-950 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary-700" />
                Thủ Tục Check-In
              </h3>
              <button
                onClick={() => setShowCheckInModal(false)}
                className="text-sage-400 hover:text-sage-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Booking summary */}
            <div className="bg-primary-50/50 border border-primary-100 p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-sage-500">Mã đặt phòng:</span>
                <span className="font-bold text-primary-900">#{checkInBooking.bookingId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sage-500">Khách hàng:</span>
                <span className="font-semibold">{checkInBooking.guestName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sage-500">Số điện thoại:</span>
                <span className="font-semibold">{checkInBooking.guestPhone || "—"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sage-500">Email:</span>
                <span className="font-semibold font-mono">{checkInBooking.guestEmail || "—"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sage-500">Phòng / Villa:</span>
                <span className="font-semibold">{checkInBooking.roomNumber || "Chưa gán"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-sage-500">Tiền cọc đã thanh toán:</span>
                <span className="font-bold text-green-700">{formatCurrency(checkInBooking.depositPaid)}</span>
              </div>
            </div>

            {/* Legal notice */}
            <div className="bg-yellow-50 border border-yellow-200 p-3 text-[11px] text-yellow-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Luật Cư trú Việt Nam 2020:</strong> Bắt buộc thu thập thông tin CCCD/Hộ chiếu
                để khai báo tạm trú cho cơ quan Công an địa phương. Dữ liệu được mã hóa AES-256 khi lưu trữ.
              </span>
            </div>

            {checkInError && (
              <div className="bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{checkInError}</span>
              </div>
            )}

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Số CCCD / Hộ chiếu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={identityDocument}
                  onChange={(e) => setIdentityDocument(e.target.value)}
                  placeholder="VD: 012345678901 hoặc B1234567"
                  className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Quốc tịch <span className="text-red-500">*</span>
                </label>
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
                  required
                >
                  <option value="Vietnam">Việt Nam</option>
                  <option value="China">Trung Quốc</option>
                  <option value="Japan">Nhật Bản</option>
                  <option value="South Korea">Hàn Quốc</option>
                  <option value="USA">Hoa Kỳ</option>
                  <option value="France">Pháp</option>
                  <option value="Australia">Úc</option>
                  <option value="UK">Anh</option>
                  <option value="Other">Khác</option>
                </select>
              </div>

              {/* Accompanying Guests Config */}
              <div className="border-t border-primary-100 pt-3 space-y-3">
                <h4 className="text-xs font-bold text-sage-800 uppercase tracking-wide">
                  Khách đi cùng phòng
                </h4>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-sage-500 uppercase mb-1">
                      Số người lớn đi kèm
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={adultCount}
                      onChange={(e) => handleAdultCountChange(e.target.value)}
                      className="w-full p-2 border border-primary-100 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-sage-500 uppercase mb-1">
                      Số trẻ em đi kèm
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={childCount}
                      onChange={(e) => handleChildCountChange(e.target.value)}
                      className="w-full p-2 border border-primary-100 rounded bg-white"
                    />
                  </div>
                </div>

                {/* Accompanying Adults list */}
                {accompanyingAdults.map((adult, index) => (
                  <div key={`adult-${index}`} className="p-3 bg-sage-50/50 border border-primary-50 rounded space-y-2 text-xs">
                    <span className="font-semibold text-sage-700 text-[10px] block uppercase">
                      Người lớn đi cùng #{index + 1}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Họ và tên"
                        value={adult.fullName}
                        onChange={(e) => {
                          const updated = [...accompanyingAdults];
                          updated[index].fullName = e.target.value;
                          setAccompanyingAdults(updated);
                        }}
                        className="p-2 border border-primary-100 rounded bg-white text-xs"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Số CCCD / Hộ chiếu"
                        value={adult.identityDocument}
                        onChange={(e) => {
                          const updated = [...accompanyingAdults];
                          updated[index].identityDocument = e.target.value;
                          setAccompanyingAdults(updated);
                        }}
                        className="p-2 border border-primary-100 rounded bg-white text-xs"
                        required
                      />
                    </div>
                  </div>
                ))}

                {/* Accompanying Children list */}
                {accompanyingChildren.map((child, index) => (
                  <div key={`child-${index}`} className="p-3 bg-sky-50/20 border border-sky-100 rounded space-y-2 text-xs">
                    <span className="font-semibold text-sky-700 text-[10px] block uppercase">
                      Trẻ em đi cùng #{index + 1}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Họ và tên"
                        value={child.fullName}
                        onChange={(e) => {
                          const updated = [...accompanyingChildren];
                          updated[index].fullName = e.target.value;
                          setAccompanyingChildren(updated);
                        }}
                        className="p-2 border border-primary-100 rounded bg-white text-xs"
                        required
                      />
                      <select
                        value={child.relationship}
                        onChange={(e) => {
                          const updated = [...accompanyingChildren];
                          updated[index].relationship = e.target.value;
                          setAccompanyingChildren(updated);
                        }}
                        className="p-2 border border-primary-100 rounded bg-white text-xs cursor-pointer"
                      >
                        <option value="Con">Con ruột</option>
                        <option value="Cháu">Cháu</option>
                        <option value="Em">Em</option>
                        <option value="Bố/Mẹ">Bố / Mẹ</option>
                        <option value="Khác">Quan hệ khác</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="px-4 py-2 border border-primary-100 text-xs font-semibold uppercase tracking-wider hover:bg-primary-50 cursor-pointer"
                  disabled={checkInLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={checkInLoading}
                  className="px-6 py-2 bg-primary-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-900 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {checkInLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-3 w-3" />
                      Xác nhận Check-In
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Checkout Modal */}
      {showCheckOutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh] text-left border-t-4 border-red-700 relative">
            <button
              onClick={() => setShowCheckOutModal(false)}
              className="absolute top-4 right-4 text-sage-400 hover:text-sage-950 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-primary-50 pb-3">
              <h3 className="font-serif text-lg font-bold text-sage-950 flex items-center gap-2">
                <LogOut className="h-5 w-5 text-red-700" />
                Thủ Tục Trả Phòng & Hóa Đơn Tổng Hợp (Guest Folio)
              </h3>
              <p className="text-xs text-sage-500 mt-1">
                Xem chi tiết các dịch vụ sử dụng, áp dụng giảm giá và xác nhận thanh toán dư nợ tại quầy.
              </p>
            </div>

            {checkoutLoading && !checkoutInvoice ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3 text-sage-500">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-xs font-semibold uppercase tracking-wider">Đang tải hóa đơn Guest Folio...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {checkoutError && (
                  <div className="bg-red-50 border border-red-200 text-red-750 p-4 text-xs font-medium space-y-2">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="h-4.5 w-4.5 text-red-600 flex-shrink-0" />
                      <span>{checkoutError}</span>
                    </div>
                    {checkoutError.includes("chế biến") && (
                      <div className="pt-2 border-t border-red-200/50 flex justify-end">
                        <button
                          type="button"
                          onClick={handleForceCheckout}
                          className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold uppercase tracking-wider text-[10px] cursor-pointer border-none"
                        >
                          Hủy cưỡng bức và Check-out sớm
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Guest Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-primary-50/20 p-4 text-xs">
                  <div>
                    <span className="text-sage-400 block uppercase tracking-wider text-[9px] mb-1">Khách lưu trú</span>
                    <strong className="text-sage-900 text-sm">{checkOutBooking?.guestName}</strong>
                    <div className="text-sage-500 font-mono mt-0.5">{checkOutBooking?.guestPhone}</div>
                  </div>
                  <div>
                    <span className="text-sage-400 block uppercase tracking-wider text-[9px] mb-1">Mã đặt phòng / Phòng</span>
                    <strong className="text-sage-900 text-sm">#BK-{checkOutBooking?.bookingId}</strong>
                    <div className="text-sage-500 font-mono mt-0.5">Phòng: {checkOutBooking?.roomNumber || "Chưa gán"}</div>
                  </div>
                </div>

                {/* Detailed Booked Items */}
                <div className="border border-primary-100 bg-[#fafbfa] p-4 text-xs space-y-4">
                  <h4 className="font-serif font-bold text-sage-900 uppercase tracking-wider border-b border-primary-50 pb-2">
                    Chi Tiết Dịch Vụ Đã Đặt
                  </h4>

                  {/* Room & Nights */}
                  <div className="flex justify-between border-b border-dashed border-primary-50 pb-2">
                    <div>
                      <span className="font-semibold text-sage-800">🛏️ Tiền phòng / Villa ({checkOutBooking?.roomTypeName})</span>
                      <span className="text-[10px] text-sage-400 block mt-0.5">
                        Thời gian: {formatDate(checkOutBooking?.checkInDate)} - {formatDate(checkOutBooking?.checkOutDate)}
                      </span>
                    </div>
                    <span className="font-mono font-semibold">{formatCurrency(checkoutInvoice?.roomSubtotal)}</span>
                  </div>

                  {/* Spa */}
                  {checkoutItinerary?.timeline?.some(e => e.type === "SPA" && e.status && (e.status.toUpperCase() === "CONFIRMED" || e.status.toUpperCase() === "COMPLETED")) && (
                    <div className="border-b border-dashed border-primary-50 pb-2 space-y-1.5">
                      <span className="font-semibold text-sage-800">💆‍♀️ Trị liệu Spa:</span>
                      <div className="space-y-1.5 pl-4">
                        {checkoutItinerary.timeline
                          .filter(e => e.type === "SPA" && e.status && (e.status.toUpperCase() === "CONFIRMED" || e.status.toUpperCase() === "COMPLETED"))
                          .map((event, idx) => (
                            <div key={`left-spa-${idx}`} className="flex justify-between text-sage-600">
                              <span>💆‍♀️ {event.title}</span>
                              <span className="font-mono">{formatCurrency(event.price)}</span>
                            </div>
                          ))}
                        {checkoutInvoice?.spaChildDiscount > 0 && (
                          <div className="flex justify-between text-emerald-700 font-semibold">
                            <span>👶 Giảm giá dịch vụ Trẻ em:</span>
                            <span className="font-mono">-{formatCurrency(checkoutInvoice.spaChildDiscount)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* F&B */}
                  {checkoutItinerary?.timeline?.some(e => e.type === "FOOD" && e.status && (e.status.toUpperCase() === "READY" || e.status.toUpperCase() === "DELIVERED" || e.status.toUpperCase() === "PENDING" || e.status.toUpperCase() === "PREPARING")) && (
                    <div className="border-b border-dashed border-primary-50 pb-2 space-y-1.5">
                      <span className="font-semibold text-sage-800">🍲 Dịch vụ ẩm thực F&B:</span>
                      <div className="space-y-1.5 pl-4">
                        {checkoutItinerary.timeline
                          .filter(e => e.type === "FOOD" && e.status && (e.status.toUpperCase() === "READY" || e.status.toUpperCase() === "DELIVERED" || e.status.toUpperCase() === "PENDING" || e.status.toUpperCase() === "PREPARING"))
                          .map((event, idx) => (
                            <div key={idx} className="flex justify-between text-sage-600">
                              <span>{event.title} ({event.description || "Số lượng: 1"})</span>
                              <span className="font-mono">{formatCurrency(event.price)}</span>
                            </div>
                          ))}
                        {checkoutInvoice?.foodChildDiscount > 0 && (
                          <div className="flex justify-between text-emerald-700 font-semibold">
                            <span>👶 Giảm giá ẩm thực Trẻ em:</span>
                            <span className="font-mono">-{formatCurrency(checkoutInvoice.foodChildDiscount)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Voucher input form */}
                <div className="border-t border-primary-50 pt-4 space-y-2 text-xs">
                  <h4 className="font-serif font-bold text-sage-900 uppercase tracking-wider">
                    Mã Giảm Giá / Voucher
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={checkoutVoucherCode}
                      onChange={(e) => setCheckoutVoucherCode(e.target.value)}
                      placeholder="Ví dụ: WELCOME10, NGUSON50..."
                      disabled={checkoutInvoice?.discountAmount > 0 || isApplyingCheckoutVoucher}
                      className="flex-1 px-3 py-2 text-xs border border-primary-200 focus:outline-primary-300 uppercase bg-white disabled:bg-sage-50 disabled:text-sage-400"
                    />
                    {checkoutInvoice?.discountAmount > 0 ? (
                      <button
                        type="button"
                        onClick={handleRemoveCheckoutVoucher}
                        disabled={isApplyingCheckoutVoucher}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-750 font-bold uppercase tracking-wider cursor-pointer border-none"
                      >
                        Gỡ bỏ
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCheckoutVoucher}
                        disabled={isApplyingCheckoutVoucher || !checkoutVoucherCode.trim()}
                        className="px-6 py-2 bg-primary-800 hover:bg-primary-900 text-white font-bold uppercase tracking-wider disabled:opacity-50 transition-all cursor-pointer border-none"
                      >
                        {isApplyingCheckoutVoucher ? "Đang áp dụng..." : "Áp dụng"}
                      </button>
                    )}
                  </div>
                  {checkoutInvoice?.discountAmount > 0 && (
                    <p className="text-[10px] text-green-700 font-medium">
                      ✓ Đã áp dụng Voucher thành công!
                    </p>
                  )}
                </div>


                {/* Payment Method Selector */}
                <div className="border-t border-primary-50 pt-4 space-y-2.5 text-xs">
                  <h4 className="font-serif font-bold text-sage-900 uppercase tracking-wider">
                    Phương Thức Thanh Toán
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`flex items-center gap-2.5 p-3 border cursor-pointer transition-all rounded-lg ${checkoutPaymentMethod === 'CASH' ? 'border-[#cda250] bg-[#cda250]/5 font-semibold text-sage-900 shadow-sm' : 'border-primary-100 bg-white text-sage-600 hover:border-primary-200'}`}>
                      <input
                        type="radio"
                        name="checkoutPaymentMethod"
                        value="CASH"
                        checked={checkoutPaymentMethod === "CASH"}
                        onChange={() => setCheckoutPaymentMethod("CASH")}
                        className="accent-[#cda250] h-4 w-4"
                      />
                      <span>Thanh toán tại quầy (Tiền mặt / POS)</span>
                    </label>
                    <label className={`flex items-center gap-2.5 p-3 border cursor-pointer transition-all rounded-lg ${checkoutPaymentMethod === 'VNPAY' ? 'border-[#cda250] bg-[#cda250]/5 font-semibold text-sage-900 shadow-sm' : 'border-primary-100 bg-white text-sage-600 hover:border-primary-200'}`}>
                      <input
                        type="radio"
                        name="checkoutPaymentMethod"
                        value="VNPAY"
                        checked={checkoutPaymentMethod === "VNPAY"}
                        onChange={() => setCheckoutPaymentMethod("VNPAY")}
                        className="accent-[#cda250] h-4 w-4"
                      />
                      <span>Thanh toán qua VNPay</span>
                    </label>
                  </div>
                </div>

                {checkoutPaymentMethod === 'VNPAY' && (
                  <div className="bg-blue-50/50 border border-blue-200/50 text-blue-800 p-4 text-xs font-normal space-y-1 rounded-lg">
                    <p className="font-semibold">ℹ️ Hướng dẫn thanh toán VNPay:</p>
                    <p>Khách hàng quét mã VNPay QR hiển thị trên màn hình phụ tại quầy hoặc từ Email hóa đơn để hoàn tất thanh toán nốt phần dư nợ.</p>
                    <p className="text-[10px] text-sage-500 italic mt-2">(Phần quét mã kết nối thiết bị chuyên dụng do nhân viên kỹ thuật khác phụ trách kết nối)</p>
                  </div>
                )}

                {/* Pricing summary */}
                <div className="border-t border-primary-100 pt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-sage-500">Tiền phòng (Villa):</span>
                    <span className="font-semibold font-mono">{formatCurrency(checkoutInvoice?.roomSubtotal)}</span>
                  </div>
                  
                  {/* Grouped Extra Services Total */}
                  {((checkoutInvoice?.spaSubtotal || 0) + (checkoutInvoice?.foodSubtotal || 0)) > 0 && (
                    <div className="p-2.5 bg-sage-50/50 border border-primary-100/50 rounded-lg space-y-1.5 my-1">
                      <div className="flex justify-between text-xs font-bold text-sage-900">
                        <span>✨ Dịch vụ thêm phát sinh (Spa & Ẩm thực):</span>
                        <span className="font-mono text-[#cda250]">{formatCurrency((checkoutInvoice?.spaSubtotal || 0) + (checkoutInvoice?.foodSubtotal || 0))}</span>
                      </div>
                      <div className="pl-3 space-y-1 text-[11px] text-sage-600">
                        <div className="flex justify-between">
                          <span>• Trị liệu Spa phát sinh:</span>
                          <span className="font-mono">{formatCurrency((checkoutInvoice?.spaSubtotal || 0) + (checkoutInvoice?.spaChildDiscount || 0))}</span>
                        </div>
                        {checkoutInvoice?.spaChildDiscount > 0 && (
                          <div className="flex justify-between text-emerald-700 font-semibold pl-4">
                            <span>Giảm giá dịch vụ Trẻ em (Spa):</span>
                            <span className="font-mono">-{formatCurrency(checkoutInvoice.spaChildDiscount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>• Dịch vụ ẩm thực F&B phát sinh:</span>
                          <span className="font-mono">{formatCurrency((checkoutInvoice?.foodSubtotal || 0) + (checkoutInvoice?.foodChildDiscount || 0))}</span>
                        </div>
                        {checkoutInvoice?.foodChildDiscount > 0 && (
                          <div className="flex justify-between text-emerald-700 font-semibold pl-4">
                            <span>Giảm giá ẩm thực Trẻ em (F&B):</span>
                            <span className="font-mono">-{formatCurrency(checkoutInvoice.foodChildDiscount)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-sage-500">Thuế VAT & Phí dịch vụ (10%):</span>
                    <span className="font-semibold font-mono">{formatCurrency(checkoutInvoice?.taxAndFees)}</span>
                  </div>

                  <div className="border-t border-dashed border-primary-100 my-1"></div>

                  <div className="flex justify-between text-sm">
                    <span className="text-sage-900 font-semibold">Tổng cộng Folio phòng (Gốc):</span>
                    <span className="font-bold font-mono">{formatCurrency((checkoutInvoice?.roomSubtotal || 0) + (checkoutInvoice?.spaSubtotal || 0) + (checkoutInvoice?.foodSubtotal || 0) + (checkoutInvoice?.taxAndFees || 0))}</span>
                  </div>

                  {checkoutInvoice?.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Mã giảm giá áp dụng ({checkoutInvoice.voucherCode}):</span>
                      <span className="font-mono">-{formatCurrency(checkoutInvoice.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-emerald-700 bg-emerald-50/50 p-2 font-semibold">
                    <span>Đã đặt cọc thanh toán (30%):</span>
                    <span className="font-mono">-{formatCurrency(checkoutInvoice?.depositAmount)}</span>
                  </div>

                  <div className="flex justify-between items-center text-base bg-primary-50 p-3 font-serif border border-primary-100">
                    <span className="font-bold text-sage-950">Số tiền còn lại cần thanh toán:</span>
                    <span className="font-bold text-primary-950 font-mono text-lg">{formatCurrency(checkoutInvoice?.amountDue)}</span>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50">
                  <button
                    type="button"
                    onClick={() => setShowCheckOutModal(false)}
                    className="px-4 py-2 border border-primary-100 text-xs font-semibold uppercase tracking-wider hover:bg-primary-50 cursor-pointer"
                    disabled={checkoutLoading}
                  >
                    Đóng
                  </button>
                  {checkoutPaymentMethod === 'CASH' ? (
                    <button
                      type="button"
                      onClick={handlePerformCheckout}
                      disabled={checkoutLoading}
                      className="px-6 py-2 bg-red-750 hover:bg-red-850 text-white text-xs font-semibold uppercase tracking-wider cursor-pointer flex items-center gap-2 disabled:opacity-50 border-none animate-fade-in"
                    >
                      {checkoutLoading ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <LogOut className="h-3.5 w-3.5" />
                          Xác nhận nhận tiền mặt & Check-out
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={true}
                      className="px-6 py-2 bg-blue-600 text-white text-xs font-semibold uppercase tracking-wider opacity-55 cursor-not-allowed border-none animate-fade-in"
                    >
                      Thanh toán VNPay (Chờ người khác xử lý)
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lookup Booking Modal (Đặt Thêm Dịch Vụ) */}
      {showLookupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg w-full p-6 space-y-6 shadow-2xl rounded-xl relative border-t-4 border-[#cda250]">
            <button
              onClick={() => setShowLookupModal(false)}
              className="absolute top-4 right-4 text-sage-400 hover:text-sage-950 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-primary-50 pb-3">
              <h3 className="font-serif text-lg font-bold text-sage-950 flex items-center gap-2">
                <Search className="h-5 w-5 text-[#cda250]" />
                Tra Cứu Đặt Phòng Hoạt Động (Đặt Thêm)
              </h3>
              <p className="text-xs text-sage-500 mt-1">
                Nhập Email và Số điện thoại lúc đăng ký của khách vãng lai để xác minh phòng lưu trú.
              </p>
            </div>

            {lookupError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}

            <form onSubmit={handleLookupSubmit} className="space-y-4 text-xs text-left">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-sage-500 uppercase mb-1">
                    Email khách hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    placeholder="VD: guest@gmail.com"
                    className="w-full p-2.5 border border-primary-100 rounded bg-white focus:outline-primary-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-sage-500 uppercase mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value)}
                    placeholder="VD: 0358432463"
                    className="w-full p-2.5 border border-primary-100 rounded bg-white focus:outline-primary-200"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={lookupLoading}
                  className="px-6 py-2 bg-primary-800 hover:bg-primary-900 text-white font-bold uppercase tracking-wider disabled:opacity-50 transition-all cursor-pointer border-none flex items-center gap-2"
                >
                  {lookupLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Đang tìm kiếm...
                    </>
                  ) : (
                    "Xác nhận & Tra cứu"
                  )}
                </button>
              </div>
            </form>

            {/* Lookup Results */}
            {lookupResults.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-primary-50 text-left">
                <h4 className="font-semibold text-sage-800 uppercase tracking-wider text-[10px]">
                  Danh sách đặt phòng tìm thấy:
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {lookupResults.map((b) => (
                    <div
                      key={b.bookingId}
                      onClick={() => {
                        setSelectedLookupBooking(b);
                        setShowAddExtraModal(true);
                        setExtraError(null);
                        setExtraItinerary(null);
                        setExtraForm({
                          roomId: "",
                          packageId: "",
                          checkInDate: b.checkInDate ? b.checkInDate.split("T")[0] : "",
                          checkOutDate: b.checkOutDate ? b.checkOutDate.split("T")[0] : "",
                          foodMenuId: "",
                          foodQuantity: 1,
                          spaServiceId: "",
                          spaStartDatetime: ""
                        });
                        bookingLookupApi.getItinerary(b.bookingId)
                          .then(itineraryData => setExtraItinerary(itineraryData))
                          .catch(err => console.error("Lỗi khi tải lịch trình dịch vụ đã đặt: ", err));
                      }}
                      className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center justify-between text-xs hover:border-[#cda250] hover:bg-[#cda250]/5 ${selectedLookupBooking?.bookingId === b.bookingId ? 'border-[#cda250] bg-[#cda250]/5 font-semibold text-sage-950 shadow-sm' : 'border-primary-100 bg-white text-sage-600'}`}
                    >
                      <div>
                        <strong>Mã đặt: #BK-{b.bookingId}</strong>
                        <div className="text-[10px] text-sage-500 mt-0.5">
                          Thời gian: {new Date(b.checkInDate).toLocaleDateString()} - {new Date(b.checkOutDate).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(b.status)}`}>
                        {getStatusLabel(b.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Extra Services Modal (Đặt thêm dịch vụ) */}
      {showAddExtraModal && selectedLookupBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg w-full p-6 space-y-5 shadow-2xl rounded-xl relative border-t-4 border-[#cda250] overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowAddExtraModal(false)}
              className="absolute top-4 right-4 text-sage-400 hover:text-sage-950 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-primary-50 pb-2 text-left">
              <h3 className="font-serif text-lg font-bold text-sage-950 flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#cda250]" />
                Đặt Thêm Dịch Vụ Cho Đơn #BK-{selectedLookupBooking.bookingId}
              </h3>
              <p className="text-xs text-sage-500 mt-1">
                Bổ sung Phòng, Gói Retreat, Món ăn hoặc dịch vụ trị liệu Spa vào hóa đơn của phòng.
              </p>
            </div>

            {extraError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{extraError}</span>
              </div>
            )}

            {/* Already Booked Services Section */}
            <div className="p-3.5 bg-primary-50/20 border border-primary-100/50 rounded-lg text-left space-y-2.5">
              <h4 className="font-bold text-sage-900 text-[10px] uppercase tracking-wide flex items-center gap-1.5 border-b border-primary-50 pb-1.5">
                📋 CÁC DỊCH VỤ KHÁCH ĐÃ ĐẶT TẠI RESORT
              </h4>
              
              <div className="grid grid-cols-2 gap-2 text-[11px] text-sage-700">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wide font-bold text-sage-400">Biệt thự / Villa hiện tại</span>
                  <strong className="text-sage-900 mt-0.5">
                    {selectedLookupBooking.roomNumber ? `Phòng ${selectedLookupBooking.roomNumber}` : "Chưa gán phòng"}
                  </strong>
                  <span className="text-[10px] text-sage-500 italic mt-0.5">{selectedLookupBooking.roomTypeName || "N/A"}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wide font-bold text-sage-400">Gói trị liệu Retreat</span>
                  <strong className="text-sage-900 mt-0.5">{selectedLookupBooking.packageName || "Không dùng gói"}</strong>
                </div>
              </div>

              {/* Other timeline items (Spa, Food) */}
              <div className="space-y-1.5 pt-2 border-t border-dashed border-primary-100">
                <span className="text-[9px] uppercase tracking-wide font-bold text-sage-400 block">Danh sách dịch vụ phát sinh (Ẩm thực & Spa)</span>
                {extraItinerary?.timeline && extraItinerary.timeline.length > 0 ? (
                  <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                    {extraItinerary.timeline.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] text-sage-600 bg-white p-2 border border-primary-100 rounded-md shadow-xs">
                        <span className="truncate max-w-[250px] font-medium">
                          {item.type === "SPA" ? "💆‍♀️ Spa" : item.type === "FOOD" ? "🍲 F&B" : "✨ Dịch vụ"}: {item.title} {item.description ? `(${item.description})` : ""}
                        </span>
                        <span className="font-mono text-primary-950 font-bold flex-shrink-0">{item.price ? formatCurrency(item.price) : "Miễn phí"}</span>
                      </div>
                    ))}
                  </div>
                ) : extraItinerary ? (
                  <div className="text-[10px] text-sage-400 italic pt-1 text-center">Chưa có dịch vụ Spa/Ẩm thực phát sinh.</div>
                ) : (
                  <div className="text-[10px] text-sage-400 italic pt-1 text-center animate-pulse">Đang tải danh sách dịch vụ đã đặt...</div>
                )}
              </div>
            </div>

            <form onSubmit={handleAddExtraSubmit} className="space-y-4 text-xs text-left">
              
              {/* Option 1: Add Room */}
              <div className={`p-3 border rounded-lg space-y-3 ${selectedLookupBooking.status !== "CHECKED_IN" ? 'bg-gray-50 border-gray-250 opacity-75' : 'bg-sage-50/30 border-primary-100'}`}>
                <h4 className="font-bold text-sage-800 text-[10px] uppercase tracking-wide flex items-center gap-1">
                  🛏️ 1. Thêm Phòng/Villa (Không yêu cầu đặt cọc)
                </h4>
                {selectedLookupBooking.status !== "CHECKED_IN" ? (
                  <p className="text-[10px] text-red-650 font-semibold italic bg-red-50 p-2 border border-red-100/50 rounded-md">
                    ⚠️ Chỉ hỗ trợ đặt thêm phòng khi khách hàng đã thực hiện Check-in lưu trú (Trạng thái hiện tại: {getStatusLabel(selectedLookupBooking.status)}).
                  </p>
                ) : (
                  <div>
                    <label className="block text-[10px] font-semibold text-sage-500 uppercase mb-1">Chọn Villa</label>
                    <select
                      value={extraForm.roomId}
                      onChange={(e) => setExtraForm({ ...extraForm, roomId: e.target.value })}
                      className="w-full p-2 border border-primary-100 rounded bg-white text-xs focus:outline-primary-200"
                    >
                      <option value="">-- Không thêm phòng --</option>
                      {villas
                        .filter(v => v.status === "AVAILABLE" || v.status === "available")
                        .map(v => (
                          <option key={v.roomId} value={v.roomId}>
                            Phòng {v.roomNumber} - {v.roomTypeName} ({formatCurrency(v.basePrice || v.basePricePerNight)}/đêm)
                          </option>
                        ))}
                    </select>
                  </div>
                )}
                {selectedLookupBooking.status === "CHECKED_IN" && extraForm.roomId && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-sage-500 uppercase mb-1">Check-in</label>
                      <input
                        type="date"
                        value={extraForm.checkInDate}
                        onChange={(e) => setExtraForm({ ...extraForm, checkInDate: e.target.value })}
                        className="w-full p-2 border border-primary-100 rounded bg-white text-xs focus:outline-primary-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-sage-500 uppercase mb-1">Check-out</label>
                      <input
                        type="date"
                        value={extraForm.checkOutDate}
                        onChange={(e) => setExtraForm({ ...extraForm, checkOutDate: e.target.value })}
                        className="w-full p-2 border border-primary-100 rounded bg-white text-xs focus:outline-primary-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: Add Package */}
              <div className="p-3 bg-sage-50/30 border border-primary-100 rounded-lg space-y-2">
                <h4 className="font-bold text-sage-800 text-[10px] uppercase tracking-wide flex items-center gap-1">
                  📦 2. Thêm Gói Retreat Trị Liệu
                </h4>
                <select
                  value={extraForm.packageId}
                  onChange={(e) => setExtraForm({ ...extraForm, packageId: e.target.value })}
                  className="w-full p-2 border border-primary-100 rounded bg-white text-xs focus:outline-primary-200"
                >
                  <option value="">-- Không thêm gói --</option>
                  {packages.map(p => (
                    <option key={p.packageId} value={p.packageId}>
                      {p.name} - {formatCurrency(p.price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Option 3: Add F&B */}
              <div className="p-3 bg-sage-50/30 border border-primary-100 rounded-lg space-y-2">
                <h4 className="font-bold text-sage-800 text-[10px] uppercase tracking-wide flex items-center gap-1">
                  🍲 3. Đặt Thêm Đồ Ăn (F&B)
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-semibold text-sage-500 uppercase mb-1">Món ăn</label>
                    <select
                      value={extraForm.foodMenuId}
                      onChange={(e) => setExtraForm({ ...extraForm, foodMenuId: e.target.value })}
                      className="w-full p-2 border border-primary-100 rounded bg-white text-xs focus:outline-primary-200"
                    >
                      <option value="">-- Không thêm đồ ăn --</option>
                      {foodMenu.map(f => (
                        <option key={f.foodId} value={f.foodId}>
                          {f.name || f.dishName} ({formatCurrency(f.price)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-sage-500 uppercase mb-1">Số lượng</label>
                    <input
                      type="number"
                      min="1"
                      value={extraForm.foodQuantity}
                      onChange={(e) => setExtraForm({ ...extraForm, foodQuantity: e.target.value })}
                      className="w-full p-2 border border-primary-100 rounded bg-white text-xs focus:outline-primary-200"
                    />
                  </div>
                </div>
              </div>

              {/* Option 4: Add Spa */}
              <div className="p-3 bg-sage-50/30 border border-primary-100 rounded-lg space-y-2">
                <h4 className="font-bold text-sage-800 text-[10px] uppercase tracking-wide flex items-center gap-1">
                  💆‍♀️ 4. Đặt Thêm Dịch Vụ Spa Trị Liệu (Tự Động Ghép Cặp)
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-sage-500 uppercase mb-1">Gói dịch vụ Spa</label>
                    <select
                      value={extraForm.spaServiceId}
                      onChange={(e) => setExtraForm({ ...extraForm, spaServiceId: e.target.value })}
                      className="w-full p-2 border border-primary-100 rounded bg-white text-xs focus:outline-primary-200"
                    >
                      <option value="">-- Không thêm Spa --</option>
                      {spaServices.map(s => (
                        <option key={s.serviceId} value={s.serviceId}>
                          {s.name} - {formatCurrency(s.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-sage-500 uppercase mb-1">Thời gian bắt đầu</label>
                    <input
                      type="datetime-local"
                      value={extraForm.spaStartDatetime}
                      onChange={(e) => setExtraForm({ ...extraForm, spaStartDatetime: e.target.value })}
                      className="w-full p-2 border border-primary-100 rounded bg-white text-xs focus:outline-primary-200"
                    />
                  </div>
                </div>
              </div>

            {/* Pricing Summary Card */}
            {totalAdded > 0 && (
              <div className="p-3.5 bg-primary-50/50 border border-primary-100 rounded-lg space-y-1.5 text-left text-[11px] text-sage-800 my-2">
                <h5 className="font-bold text-sage-900 text-[10px] uppercase tracking-wider border-b border-primary-100 pb-1 mb-1">
                  🛒 TÓM TẮT CHI PHÍ ĐẶT THÊM
                </h5>
                {roomTotal > 0 && (
                  <div className="flex justify-between">
                    <span>🏨 Tiền phòng thêm ({roomNights} đêm):</span>
                    <span className="font-semibold font-mono">{formatCurrency(roomTotal)}</span>
                  </div>
                )}
                {pkgTotal > 0 && (
                  <div className="flex justify-between">
                    <span>📦 Gói Retreat thêm:</span>
                    <span className="font-semibold font-mono">{formatCurrency(pkgTotal)}</span>
                  </div>
                )}
                {foodTotal > 0 && (
                  <div className="flex justify-between">
                    <span>🍲 Ẩm thực F&B thêm:</span>
                    <span className="font-semibold font-mono">{formatCurrency(foodTotal)}</span>
                  </div>
                )}
                {spaTotal > 0 && (
                  <div className="flex justify-between">
                    <span>💆‍♀️ Trị liệu Spa thêm:</span>
                    <span className="font-semibold font-mono">{formatCurrency(spaTotal)}</span>
                  </div>
                )}
                <div className="border-t border-dashed border-primary-200 my-1"></div>
                <div className="flex justify-between font-bold text-sage-950 text-xs">
                  <span>Tổng tiền phát sinh:</span>
                  <span className="font-mono text-[#cda250]">{formatCurrency(totalAdded)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-emerald-700 font-semibold bg-emerald-50/50 p-1 border border-emerald-100/50 rounded">
                  <span>Tiền cọc cần thanh toán tại quầy:</span>
                  <span className="font-mono">0 ₫ (Thanh toán 100% khi Check-out)</span>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-3 border-t border-primary-50">
                <button
                  type="button"
                  onClick={() => setShowAddExtraModal(false)}
                  className="px-4 py-2 border border-primary-100 text-xs font-semibold uppercase hover:bg-primary-50 cursor-pointer"
                  disabled={extraLoading}
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={extraLoading}
                  className="px-6 py-2 bg-[#cda250] hover:bg-[#b0873a] text-white text-xs font-semibold uppercase tracking-wider disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2 border-none"
                >
                  {extraLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-3 w-3" />
                      Xác Nhận Đặt Thêm Dịch Vụ
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
