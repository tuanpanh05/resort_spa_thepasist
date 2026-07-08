import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Edit, X, Shield, AlertCircle, Loader2, Eye, Users, Bed, CreditCard, Calendar, Plus, LogOut } from "lucide-react";
import { staffApi, bookingApi, masterDataApi, paymentApi, spaApi } from "../../api";
// Check-in flow: validate CCCD/Passport before confirming arrival

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
  const navigate = useNavigate();
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
  const [confirmIdentityDocument, setConfirmIdentityDocument] = useState("");
  const [documentType, setDocumentType] = useState("CCCD");
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
    roomIds: [],
    comboId: "",
    checkInDate: new Date().toISOString().split("T")[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    guestsCount: 1,
    childrenUnder5: 0,
    children5to12: 0,
  });

  const [walkInStep, setWalkInStep] = useState(1);
  const [walkInIdentityDocument, setWalkInIdentityDocument] = useState("");
  const [walkInDocumentType, setWalkInDocumentType] = useState("CCCD");
  const [walkInNationality, setWalkInNationality] = useState("Vietnam");
  const [walkInAccompanyingAdults, setWalkInAccompanyingAdults] = useState([]);
  const [walkInAccompanyingChildren, setWalkInAccompanyingChildren] = useState([]);
  const [walkInVillas, setWalkInVillas] = useState([]);
  const [walkInVillasLoading, setWalkInVillasLoading] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash"); // "cash" | "vnpay"

  useEffect(() => {
    const accAdultsCount = Math.max(0, parseInt(walkInForm.guestsCount || 1) - 1);
    const accChildrenCount = parseInt(walkInForm.childrenUnder5 || 0) + parseInt(walkInForm.children5to12 || 0);

    setWalkInAccompanyingAdults((prev) => {
      const next = [...prev];
      if (accAdultsCount > prev.length) {
        for (let i = prev.length; i < accAdultsCount; i++) {
          next.push({ fullName: "", documentType: "CCCD", identityDocument: "" });
        }
      } else if (accAdultsCount < prev.length) {
        next.splice(accAdultsCount);
      }
      return next;
    });

    setWalkInAccompanyingChildren((prev) => {
      const next = [...prev];
      if (accChildrenCount > prev.length) {
        for (let i = prev.length; i < accChildrenCount; i++) {
          next.push({ fullName: "", relationship: "Con" });
        }
      } else if (accChildrenCount < prev.length) {
        next.splice(accChildrenCount);
      }
      return next;
    });
  }, [walkInForm.guestsCount, walkInForm.childrenUnder5, walkInForm.children5to12]);

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
    setConfirmIdentityDocument("");
    setDocumentType("CCCD");
    setNationality("Vietnam");
    setCheckInError(null);

    const accAdultsCount = Math.max(0, (booking.guestsCount || 1) - 1);
    const accChildrenCount = booking.childrenCount || 0;

    setAdultCount(accAdultsCount);
    setChildCount(accChildrenCount);
    setAccompanyingAdults(Array.from({ length: accAdultsCount }, () => ({ fullName: "", documentType: "CCCD", identityDocument: "", confirmIdentityDocument: "" })));
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
          next.push({ fullName: "", documentType: "CCCD", identityDocument: "", confirmIdentityDocument: "" });
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
      setCheckInError("Vui lòng nhập số CCCD / Hộ chiếu.");
      return;
    }

    // 1. Double Entry matching check for primary guest
    if (identityDocument.trim() !== confirmIdentityDocument.trim()) {
      setCheckInError("Xác nhận số CCCD / Hộ chiếu của khách chính không khớp!");
      return;
    }

    // 2. Format validation for primary guest
    if (documentType === "CCCD") {
      if (!/^0\d{11}$/.test(identityDocument.trim())) {
        setCheckInError("Số Căn cước công dân (CCCD) phải có đúng 12 chữ số và bắt đầu bằng số 0.");
        return;
      }
    } else if (documentType === "PASSPORT") {
      if (!/^[A-Z0-9]{1,9}$/.test(identityDocument.trim())) {
        setCheckInError("Số Hộ chiếu (Passport) chỉ được chứa chữ in hoa và chữ số, độ dài không quá 9 ký tự.");
        return;
      }
    }

    // 3. Validate accompanying adults fields
    for (let i = 0; i < accompanyingAdults.length; i++) {
      const adult = accompanyingAdults[i];
      if (!adult.fullName.trim()) {
        setCheckInError(`Vui lòng nhập Họ và tên cho Khách đi cùng thứ ${i + 1}.`);
        return;
      }
      if (!adult.identityDocument.trim()) {
        setCheckInError(`Vui lòng nhập Số giấy tờ cho Khách đi cùng thứ ${i + 1}.`);
        return;
      }
      // Double Entry check
      if (adult.identityDocument.trim() !== (adult.confirmIdentityDocument || "").trim()) {
        setCheckInError(`Xác nhận số giấy tờ của Khách đi cùng thứ ${i + 1} không khớp!`);
        return;
      }
      // Format validation
      const type = adult.documentType || "CCCD";
      if (type === "CCCD") {
        if (!/^0\d{11}$/.test(adult.identityDocument.trim())) {
          setCheckInError(`Số CCCD của Khách đi cùng thứ ${i + 1} phải có đúng 12 chữ số và bắt đầu bằng số 0.`);
          return;
        }
      } else if (type === "PASSPORT") {
        if (!/^[A-Z0-9]{1,9}$/.test(adult.identityDocument.trim())) {
          setCheckInError(`Số Hộ chiếu của Khách đi cùng thứ ${i + 1} chỉ được chứa chữ in hoa và chữ số, độ dài không quá 9 ký tự.`);
          return;
        }
      }
    }

    // 4. Validate child fields
    for (let i = 0; i < accompanyingChildren.length; i++) {
      if (!accompanyingChildren[i].fullName.trim()) {
        setCheckInError(`Vui lòng nhập Họ và tên cho Trẻ em thứ ${i + 1}.`);
        return;
      }
    }

    // 5. Check duplicate document numbers in the form
    const formDocs = [identityDocument.trim()];
    for (let i = 0; i < accompanyingAdults.length; i++) {
      const doc = accompanyingAdults[i].identityDocument.trim();
      if (formDocs.includes(doc)) {
        setCheckInError(`Phát hiện số giấy tờ bị trùng lặp trong đoàn check-in: ${doc}`);
        return;
      }
      formDocs.push(doc);
    }

    setCheckInLoading(true);
    setCheckInError(null);
    try {
      const mappedGuests = [
        ...accompanyingAdults.map(a => ({ 
          fullName: a.fullName.trim(), 
          identityDocument: a.identityDocument.trim(), 
          documentType: a.documentType || "CCCD",
          relationship: "Khách đi cùng", 
          isChild: false 
        })),
        ...accompanyingChildren.map(c => ({ 
          fullName: c.fullName.trim(), 
          identityDocument: null, 
          documentType: "CCCD",
          relationship: c.relationship.trim(), 
          isChild: true 
        }))
      ];

      await staffApi.performCheckIn({
        bookingId: checkInBooking.bookingId,
        identityDocument: identityDocument.trim(),
        documentType: documentType,
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

  const generateMealsFromCombo = (comboId, items, totalGuests, checkInStr, checkOutStr) => {
    try {
      if (!items || items.length === 0 || !comboId) return {};

      const checkIn = new Date(checkInStr);
      const checkOut = new Date(checkOutStr);
      if (checkOut <= checkIn) return {};

      const days = [];
      let curr = new Date(checkIn);
      while (curr <= checkOut) {
        days.push(curr.toISOString().split("T")[0]);
        curr.setDate(curr.getDate() + 1);
      }

      let pool = items;
      if (comboId === 'detox') {
        pool = pool.filter(i => {
          const tags = (i.dietaryTags || "").toLowerCase();
          return tags.includes("vegan") || tags.includes("vegetarian") || tags.includes("healthy");
        });
      } else if (comboId === 'recovery') {
        pool = pool.filter(i => {
          const tags = (i.dietaryTags || "").toLowerCase();
          return tags.includes("keto") || tags.includes("healthy");
        });
      } else if (comboId === 'vip') {
        pool = pool.filter(i => {
          const tags = (i.dietaryTags || "").toLowerCase();
          return tags.includes("omnivore") || tags.includes("pescatarian") || tags.includes("healthy") || tags.includes("keto");
        });
      }
      if (pool.length === 0) pool = items;

      const fallbackFoodId = items[0]?.foodId;
      const periods = ["Breakfast", "Lunch", "Dinner"];
      const result = {};

      days.forEach((dateStr, dayIndex) => {
        const dateObj = {};
        periods.forEach((period, pIdx) => {
          const periodPool = pool.filter(i => {
            if (Array.isArray(i.periods)) return i.periods.some(per => typeof per === 'string' && per.toLowerCase().includes(period.toLowerCase()));
            return typeof i.periods === 'string' && i.periods.toLowerCase().includes(period.toLowerCase());
          });
          const finalPool = periodPool.length > 0 ? periodPool : pool;

          const isDrink = i => /nước|drink|thức uống/i.test(i.category || "") || /nước|trà|sinh tố|sữa|ép/i.test(i.dishName || i.name || "");
          const isAppetizer = i => /khai vị|appetizer|salad/i.test(i.category || "") || /gỏi|salad|soup/i.test(i.dishName || i.name || "");

          const nuoc = finalPool.filter(i => isDrink(i));
          const khai = finalPool.filter(i => isAppetizer(i));
          const chinh = finalPool.filter(i => !isDrink(i) && !isAppetizer(i));

          const getId = (subPool, offset) => {
            if (subPool.length > 0) return subPool[offset % subPool.length].foodId;
            return finalPool[offset % finalPool.length]?.foodId || fallbackFoodId;
          };

          const id1 = getId(nuoc, dayIndex * 3 + pIdx * 5);
          const id2 = getId(khai, dayIndex * 3 + 1 + pIdx * 5);
          const id3 = getId(chinh, dayIndex * 3 + 2 + pIdx * 5);

          if (!dateObj[period]) dateObj[period] = {};
          [id1, id2, id3].forEach(fid => {
            if (!fid) return;
            dateObj[period][fid] = (dateObj[period][fid] || 0) + totalGuests;
          });
        });
        if (Object.keys(dateObj).length > 0) result[dateStr] = dateObj;
      });

      return result;
    } catch (e) {
      console.error("Lỗi khi sinh thực đơn combo vãng lai:", e);
      return {};
    }
  };

  const openWalkInModal = () => {
    setWalkInStep(1);
    setWalkInIdentityDocument("");
    setWalkInDocumentType("CCCD");
    setWalkInNationality("Vietnam");
    setWalkInAccompanyingAdults([]);
    setWalkInAccompanyingChildren([]);
    setWalkInVillas([]);
    setWalkInForm({
      fullName: "",
      email: "",
      phone: "",
      roomIds: [],
      comboId: "",
      checkInDate: new Date().toISOString().split("T")[0],
      checkOutDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      guestsCount: 1,
      childrenUnder5: 0,
      children5to12: 0,
    });
    setWalkInError(null);
    setShowWalkInModal(true);
  };

  const goToRoomSelection = async () => {
    if (!walkInForm.fullName.trim() || !walkInForm.email.trim() || !walkInForm.phone.trim() || !walkInIdentityDocument.trim()) {
      setWalkInError("Vui lòng điền đầy đủ thông tin người đặt (bao gồm họ tên, SĐT, email) và số CCCD/Passport.");
      return;
    }
    if (new Date(walkInForm.checkOutDate) <= new Date(walkInForm.checkInDate)) {
      setWalkInError("Ngày trả phòng phải sau ngày nhận phòng.");
      return;
    }

    // Validate accompanying guest fields if any
    for (let i = 0; i < walkInAccompanyingAdults.length; i++) {
      const adult = walkInAccompanyingAdults[i];
      if (!adult.fullName.trim() || !adult.identityDocument.trim()) {
        setWalkInError(`Vui lòng điền đầy đủ họ tên và số CCCD/Passport cho người lớn đi cùng #${i + 1}.`);
        return;
      }
    }
    for (let i = 0; i < walkInAccompanyingChildren.length; i++) {
      const child = walkInAccompanyingChildren[i];
      if (!child.fullName.trim()) {
        setWalkInError(`Vui lòng điền đầy đủ họ tên cho trẻ em đi cùng #${i + 1}.`);
        return;
      }
    }

    setWalkInError(null);
    setWalkInVillasLoading(true);
    try {
      const data = await staffApi.getVillas(walkInForm.checkInDate, walkInForm.checkOutDate);
      setWalkInVillas(data || []);
      setWalkInStep(2);
    } catch (err) {
      setWalkInError(err.message || "Lỗi khi lấy danh sách phòng trống.");
    } finally {
      setWalkInVillasLoading(false);
    }
  };

  // Walk-in Booking Submission
  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    if (walkInForm.roomIds.length === 0) {
      setWalkInError("Vui lòng chọn ít nhất 1 phòng trống ở Bước 2.");
      return;
    }
    setWalkInLoading(true);
    setWalkInError(null);
    try {
      const totalGuestsForMeals = parseInt(walkInForm.guestsCount || 1) + parseInt(walkInForm.children5to12 || 0) + parseInt(walkInForm.childrenUnder5 || 0);
      const computedMeals = walkInForm.comboId 
        ? generateMealsFromCombo(walkInForm.comboId, foodMenu, totalGuestsForMeals, walkInForm.checkInDate, walkInForm.checkOutDate)
        : {};

      const dto = {
        fullName: walkInForm.fullName.trim(),
        email: walkInForm.email.trim(),
        phone: walkInForm.phone.trim(),
        roomId: walkInForm.roomIds.length > 0 ? parseInt(walkInForm.roomIds[0]) : null,
        roomIds: walkInForm.roomIds.map(id => parseInt(id)),
        checkInDate: walkInForm.checkInDate + "T14:00:00",
        checkOutDate: walkInForm.checkOutDate + "T12:00:00",
        guestsCount: parseInt(walkInForm.guestsCount || 1),
        childrenUnder5: parseInt(walkInForm.childrenUnder5 || 0),
        children5to12: parseInt(walkInForm.children5to12 || 0),
        childrenCount: parseInt(walkInForm.childrenUnder5 || 0) + parseInt(walkInForm.children5to12 || 0),
        packageIds: [],
        mealSelections: computedMeals,
        // Residency details
        identityDocument: walkInIdentityDocument.trim(),
        documentType: walkInDocumentType,
        nationality: walkInNationality.trim(),
        accompanyingGuests: [
          ...walkInAccompanyingAdults.map(a => ({
            fullName: a.fullName.trim(),
            identityDocument: a.identityDocument.trim(),
            documentType: a.documentType || "CCCD",
            relationship: "Khách đi cùng",
            isChild: false
          })),
          ...walkInAccompanyingChildren.map(c => ({
            fullName: c.fullName.trim(),
            identityDocument: null,
            documentType: "CCCD",
            relationship: c.relationship.trim(),
            isChild: true
          }))
        ]
      };

      console.log("[WalkIn Debug] Sending DTO:", dto);
      const response = await bookingApi.createBooking(dto);
      console.log("[WalkIn Debug] API Response:", response);
      const invoiceId = response.invoiceId;
      if (invoiceId) {
        console.log("[WalkIn Debug] Found invoiceId:", invoiceId);
        const invoiceData = await paymentApi.getInvoice(invoiceId);
        console.log("[WalkIn Debug] Fetched invoice data:", invoiceData);
        setCreatedInvoice(invoiceData);
        setWalkInStep(3);
      } else {
        console.warn("[WalkIn Debug] No invoiceId in response. Redirecting to dashboard.");
        setShowWalkInModal(false);
        // Reset form
        setWalkInForm({
          fullName: "",
          email: "",
          phone: "",
          roomIds: [],
          comboId: "",
          checkInDate: new Date().toISOString().split("T")[0],
          checkOutDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          guestsCount: 1,
          childrenUnder5: 0,
          children5to12: 0,
        });
        setWalkInIdentityDocument("");
        setWalkInAccompanyingAdults([]);
        setWalkInAccompanyingChildren([]);
        setWalkInStep(1);
        await loadAllData();
        alert("Đặt phòng cho khách vãng lai (Walk-in Guest) thành công!");
      }
    } catch (err) {
      console.error("[WalkIn Debug] Exception occurred:", err);
      setWalkInError(err.message || "Không thể đặt phòng cho khách vãng lai.");
    } finally {
      setWalkInLoading(false);
    }
  };

  // Walk-in Deposit Payment Submission
  const handleDepositPayment = async (e) => {
    if (e) e.preventDefault();
    if (!createdInvoice) return;
    setPaymentLoading(true);
    setPaymentError(null);
    try {
      if (paymentMethod === "cash") {
        await paymentApi.markCashPayment(createdInvoice.invoiceId);
        alert(`Xác nhận thanh toán cọc thành công bằng TIỀN MẶT cho hóa đơn #${createdInvoice.invoiceId}. Đơn đặt phòng đã chuyển sang CONFIRMED.`);
      } else {
        const data = await paymentApi.getPaymentUrl(createdInvoice.invoiceId);
        window.open(data.paymentUrl, "_blank");
        alert(`Đã tạo link thanh toán VNPay thành công cho hóa đơn #${createdInvoice.invoiceId}. Một tab thanh toán mới đã được mở. Vui lòng quét mã trên tab mới.`);
      }
      
      // Close modal and reset form state
      setShowWalkInModal(false);
      setWalkInForm({
        fullName: "",
        email: "",
        phone: "",
        roomIds: [],
        comboId: "",
        checkInDate: new Date().toISOString().split("T")[0],
        checkOutDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        guestsCount: 1,
        childrenUnder5: 0,
        children5to12: 0,
      });
      setWalkInIdentityDocument("");
      setWalkInAccompanyingAdults([]);
      setWalkInAccompanyingChildren([]);
      setWalkInStep(1);
      setCreatedInvoice(null);
      await loadAllData();
    } catch (err) {
      setPaymentError(err.message || "Gặp lỗi khi xử lý thanh toán cọc.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Close Walk-in Booking step 3 and leave as pending deposit
  const handleSkipPayment = async () => {
    setShowWalkInModal(false);
    setWalkInForm({
      fullName: "",
      email: "",
      phone: "",
      roomIds: [],
      comboId: "",
      checkInDate: new Date().toISOString().split("T")[0],
      checkOutDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      guestsCount: 1,
      childrenUnder5: 0,
      children5to12: 0,
    });
    setWalkInIdentityDocument("");
    setWalkInAccompanyingAdults([]);
    setWalkInAccompanyingChildren([]);
    setWalkInStep(1);
    setCreatedInvoice(null);
    await loadAllData();
    alert("Đã lưu đặt phòng. Đơn hàng hiện đang ở trạng thái CHỜ ĐẶT CỌC (PENDING_DEPOSIT). Lễ tân có thể xác nhận thanh toán sau.");
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
          <button
            onClick={() => navigate("/dat-lich")}
            className="px-4 py-2 bg-[#cda250] hover:bg-[#b0873a] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 transition-all duration-300"
          >
            <Plus className="h-3.5 w-3.5" />
            Đặt Mới
          </button>
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
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {walkInError && (
              <div className="bg-red-50 border border-red-200 p-3 flex items-center gap-2 text-red-700 rounded text-xs">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{walkInError}</span>
              </div>
            )}

            {walkInStep === 1 ? (
              <div className="space-y-4 text-xs">
                {/* Step 1 Fields */}
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

                {/* Primary Guest Identity Section */}
                <div className="p-3 bg-primary-50/20 border border-primary-100 rounded space-y-2">
                  <span className="font-semibold text-sage-700 text-[10px] block uppercase">
                    Căn cước / Hộ chiếu người đặt <span className="text-red-550">*</span>
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={walkInDocumentType}
                      onChange={(e) => setWalkInDocumentType(e.target.value)}
                      className="p-2 border border-primary-100 rounded bg-white text-xs"
                    >
                      <option value="CCCD">CCCD</option>
                      <option value="PASSPORT">Passport</option>
                    </select>
                    <input
                      type="text"
                      placeholder={walkInDocumentType === "PASSPORT" ? "Số Hộ chiếu" : "Số CCCD"}
                      value={walkInIdentityDocument}
                      onChange={(e) => setWalkInIdentityDocument(e.target.value)}
                      className="p-2 border border-primary-100 rounded bg-white text-xs col-span-2"
                      required
                    />
                  </div>
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

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-1">
                      Người lớn <span className="text-red-550">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={walkInForm.guestsCount}
                      onChange={(e) => setWalkInForm({ ...walkInForm, guestsCount: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full p-2 border border-primary-100 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-1">
                      Trẻ em dưới 5 (Miễn phí)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={walkInForm.childrenUnder5}
                      onChange={(e) => setWalkInForm({ ...walkInForm, childrenUnder5: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full p-2 border border-primary-100 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-1">
                      Trẻ em 5-12 (Giảm 30%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={walkInForm.children5to12}
                      onChange={(e) => setWalkInForm({ ...walkInForm, children5to12: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full p-2 border border-primary-100 rounded bg-white"
                    />
                  </div>
                </div>

                {/* Accompanying Guests list section */}
                {(walkInAccompanyingAdults.length > 0 || walkInAccompanyingChildren.length > 0) && (
                  <div className="border-t border-primary-100 pt-3 space-y-3">
                    <h4 className="text-[10px] font-bold text-sage-800 uppercase tracking-wide">
                      Thông tin khách đi cùng đoàn
                    </h4>

                    {/* Adults */}
                    {walkInAccompanyingAdults.map((adult, index) => (
                      <div key={`walkin-adult-${index}`} className="p-3 bg-sage-50/50 border border-primary-50 rounded space-y-2 text-xs">
                        <span className="font-semibold text-sage-700 text-[10px] block uppercase">
                          Người lớn đi cùng #{index + 1}
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Họ và tên"
                            value={adult.fullName}
                            onChange={(e) => {
                              const updated = [...walkInAccompanyingAdults];
                              updated[index].fullName = e.target.value;
                              setWalkInAccompanyingAdults(updated);
                            }}
                            className="p-2 border border-primary-100 rounded bg-white text-xs col-span-3"
                            required
                          />
                          <select
                            value={adult.documentType || "CCCD"}
                            onChange={(e) => {
                              const updated = [...walkInAccompanyingAdults];
                              updated[index].documentType = e.target.value;
                              setWalkInAccompanyingAdults(updated);
                            }}
                            className="p-2 border border-primary-100 rounded bg-white text-xs"
                          >
                            <option value="CCCD">CCCD</option>
                            <option value="PASSPORT">Passport</option>
                          </select>
                          <input
                            type="text"
                            placeholder={adult.documentType === "PASSPORT" ? "Số Hộ chiếu" : "Số CCCD"}
                            value={adult.identityDocument}
                            onChange={(e) => {
                              const updated = [...walkInAccompanyingAdults];
                              updated[index].identityDocument = e.target.value;
                              setWalkInAccompanyingAdults(updated);
                            }}
                            className="p-2 border border-primary-100 rounded bg-white text-xs col-span-2"
                            required
                          />
                        </div>
                      </div>
                    ))}

                    {/* Children */}
                    {walkInAccompanyingChildren.map((child, index) => (
                      <div key={`walkin-child-${index}`} className="p-3 bg-sky-50/10 border border-sky-100 rounded space-y-2 text-xs">
                        <span className="font-semibold text-sky-700 text-[10px] block uppercase">
                          Trẻ em đi cùng #{index + 1}
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Họ và tên"
                            value={child.fullName}
                            onChange={(e) => {
                              const updated = [...walkInAccompanyingChildren];
                              updated[index].fullName = e.target.value;
                              setWalkInAccompanyingChildren(updated);
                            }}
                            className="p-2 border border-primary-100 rounded bg-white text-xs col-span-2"
                            required
                          />
                          <span className="text-[10px] text-sage-400 self-center">Mối quan hệ:</span>
                          <select
                            value={child.relationship}
                            onChange={(e) => {
                              const updated = [...walkInAccompanyingChildren];
                              updated[index].relationship = e.target.value;
                              setWalkInAccompanyingChildren(updated);
                            }}
                            className="p-2 border border-primary-100 rounded bg-white text-xs cursor-pointer"
                          >
                            <option value="Con">Con ruột</option>
                            <option value="Cháu">Cháu</option>
                            <option value="Em">Em</option>
                            <option value="Khác">Quan hệ khác</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-1">
                    Chọn gói Combo ẩm thực
                  </label>
                  <select
                    value={walkInForm.comboId}
                    onChange={(e) => setWalkInForm({ ...walkInForm, comboId: e.target.value })}
                    className="w-full p-2.5 border border-primary-100 focus:outline-primary-200 bg-white"
                  >
                    <option value="">Không sử dụng gói combo</option>
                    <option value="detox">Gói Detox Thanh Lọc (3 Bữa/Ngày)</option>
                    <option value="recovery">Gói Phục Hồi Năng Lượng (3 Bữa/Ngày)</option>
                    <option value="vip">Gói Thưởng Thức VIP (3 Bữa/Ngày)</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50">
                  <button
                    type="button"
                    onClick={() => setShowWalkInModal(false)}
                    className="px-4 py-2 border border-primary-100 text-xs font-semibold uppercase tracking-wider hover:bg-primary-50 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={goToRoomSelection}
                    disabled={walkInVillasLoading}
                    className="px-6 py-2 bg-primary-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-900 cursor-pointer flex items-center gap-2"
                  >
                    {walkInVillasLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Đang tải...
                      </>
                    ) : (
                      "Tiếp theo"
                    )}
                  </button>
                </div>
              </div>
            ) : walkInStep === 2 ? (
              <form onSubmit={handleWalkInSubmit} className="space-y-4 text-xs">
                {/* Step 2 Fields */}
                <div className="bg-primary-50/30 p-3.5 border border-primary-100 rounded-lg flex flex-col gap-1 text-sage-900">
                  <div>
                    Đoàn khách đăng ký: <strong className="text-primary-700">{walkInForm.guestsCount} Người lớn</strong>
                    {parseInt(walkInForm.childrenUnder5 || 0) + parseInt(walkInForm.children5to12 || 0) > 0 && (
                      <>
                        , <strong className="text-sky-700">{parseInt(walkInForm.childrenUnder5 || 0) + parseInt(walkInForm.children5to12 || 0)} Trẻ em</strong>
                      </>
                    )}
                  </div>
                  <div className="text-[11px] text-sage-500">
                    Chọn các phòng trống phù hợp bên dưới để sắp xếp phòng cho đoàn.
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-sage-500 mb-2">
                    Chọn biệt thự/Phòng trống <span className="text-red-550">*</span>
                  </label>

                  {walkInVillasLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-2 text-sage-400">
                      <Loader2 className="h-8 w-8 animate-spin text-[#cda250]" />
                      <p>Đang tìm kiếm phòng trống khả dụng...</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                        {walkInVillas.filter(v => v.status === "AVAILABLE" || v.status === "available").length === 0 ? (
                          <div className="col-span-2 text-center py-10 text-sage-400 italic bg-sage-50 border border-primary-50 rounded">
                            Không có phòng nào còn trống trong khoảng thời gian đã chọn!
                          </div>
                        ) : (
                          walkInVillas
                            .filter(v => v.status === "AVAILABLE" || v.status === "available")
                            .map((v) => {
                              const isChecked = walkInForm.roomIds.includes(String(v.roomId));
                              return (
                                <div
                                  key={v.roomId}
                                  onClick={() => {
                                    const rid = String(v.roomId);
                                    if (isChecked) {
                                      setWalkInForm({ ...walkInForm, roomIds: walkInForm.roomIds.filter(id => id !== rid) });
                                    } else {
                                      setWalkInForm({ ...walkInForm, roomIds: [...walkInForm.roomIds, rid] });
                                    }
                                  }}
                                  className={`relative p-3 border rounded-xl cursor-pointer select-none transition-all flex flex-col gap-1 text-left ${
                                    isChecked
                                      ? "border-[#cda250] bg-gradient-to-b from-white to-[#cda250]/5 shadow-md ring-1 ring-[#cda250]"
                                      : "border-primary-100 hover:border-primary-200 hover:bg-sage-50/30"
                                  }`}
                                >
                                  <div className="font-bold text-sage-900 text-sm flex items-center justify-between">
                                    <span>Phòng {v.roomNumber}</span>
                                    {isChecked && (
                                      <span className="w-3.5 h-3.5 bg-[#cda250] rounded-full flex items-center justify-center text-white text-[9px] font-black">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-sage-500 font-medium">
                                    {v.roomTypeName}
                                  </div>
                                  <div className="text-[10px] text-primary-600 font-medium mt-1">
                                    Tối đa {v.capacity || 2} khách
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>

                      {walkInForm.roomIds.length > 0 && (
                        <div className="mt-3 flex items-center justify-between p-2.5 bg-sage-50/60 border border-primary-50 rounded-lg text-sage-700">
                          <div>
                            Đã chọn: <strong>{walkInForm.roomIds.length} phòng</strong>
                          </div>
                          <div>
                            Tổng sức chứa: <strong>{walkInForm.roomIds.reduce((sum, rid) => {
                              const r = walkInVillas.find(v => String(v.roomId) === String(rid));
                              return sum + (r ? (r.capacity || 2) : 0);
                            }, 0)} khách</strong>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50">
                  <button
                    type="button"
                    onClick={() => setWalkInStep(1)}
                    className="px-4 py-2 border border-primary-100 text-xs font-semibold uppercase tracking-wider hover:bg-primary-50 cursor-pointer"
                    disabled={walkInLoading}
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={walkInLoading || walkInForm.roomIds.length === 0}
                    className="px-6 py-2 bg-primary-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-900 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {walkInLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Đang tạo đặt phòng...
                      </>
                    ) : (
                      "Tạo đặt phòng"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Step 3: Hóa đơn chi tiết & Lựa chọn phương thức cọc */
              <form onSubmit={handleDepositPayment} className="space-y-4 text-xs text-left">
                {paymentError && (
                  <div className="bg-red-50 border border-red-200 p-3.5 flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {createdInvoice && (
                  <>
                    <div className="border border-primary-100 bg-primary-50/20 p-5 space-y-4 rounded-xl shadow-[0_2px_12px_rgba(26,44,34,0.02)]">
                      <div className="flex justify-between items-center pb-2 border-b border-primary-100/50">
                        <span className="font-bold uppercase tracking-wider text-primary-800 text-[10px]">
                          Thông tin hóa đơn đặt phòng #NS-{createdInvoice.invoiceId}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/50 text-[9px] font-bold uppercase rounded-md">
                          Chờ Đặt Cọc (30%)
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-y-2 text-[11px]">
                        <span className="text-sage-500">Khách hàng đặt:</span>
                        <span className="font-semibold text-right text-sage-950">{walkInForm.fullName}</span>

                        <span className="text-sage-500">Số điện thoại:</span>
                        <span className="font-semibold text-right text-sage-950">{walkInForm.phone}</span>

                        <span className="text-sage-500">Thời gian lưu trú:</span>
                        <span className="font-semibold text-right text-sage-950">
                          {formatDate(walkInForm.checkInDate)} → {formatDate(walkInForm.checkOutDate)}
                        </span>

                        <span className="text-sage-500">Số phòng đã chọn:</span>
                        <span className="font-semibold text-right text-primary-800">
                          {walkInForm.roomIds.map(rid => {
                            const r = villas.find(v => String(v.roomId) === String(rid));
                            return r ? `Phòng ${r.roomNumber}` : rid;
                          }).join(", ")}
                        </span>

                        {walkInForm.comboId && (
                          <>
                            <span className="text-sage-500">Gói combo ẩm thực:</span>
                            <span className="font-semibold text-right text-sage-950">
                              {walkInForm.comboId === "detox"
                                ? "Gói Detox Thanh Lọc"
                                : walkInForm.comboId === "recovery"
                                ? "Gói Phục Hồi Năng Lượng"
                                : "Gói Thưởng Thức VIP"}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="border-t border-dashed border-primary-200/60 pt-3 mt-3 space-y-2 text-[11px]">
                        <div className="flex justify-between text-sage-600">
                          <span>🛏️ Tiền phòng nghỉ:</span>
                          <span className="font-mono font-semibold">{formatCurrency(createdInvoice.roomSubtotal)}</span>
                        </div>
                        {createdInvoice.foodSubtotal > 0 && (
                          <div className="flex justify-between text-sage-600">
                            <span>🍲 Tiền combo đồ ăn đã chọn:</span>
                            <span className="font-mono font-semibold">{formatCurrency(createdInvoice.foodSubtotal)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sage-500 text-[10px] italic">
                          <span>Thuế và phí dịch vụ (10%):</span>
                          <span className="font-mono">{formatCurrency(createdInvoice.taxAndFees)}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-primary-100 flex justify-between items-center text-sm font-serif">
                        <span className="font-normal text-sage-900">Tổng giá trị hóa đơn:</span>
                        <span className="font-bold text-sage-950">{formatCurrency(createdInvoice.finalAmount)}</span>
                      </div>

                      <div className="p-3 bg-amber-50/70 border border-amber-250/50 flex justify-between items-center rounded-lg mt-2 text-xs shadow-sm">
                        <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                          <CreditCard className="h-4 w-4 text-amber-700" />
                          Tiền đặt cọc cần đóng (30%):
                        </span>
                        <span className="font-mono font-black text-amber-800 text-sm">
                          {formatCurrency(createdInvoice.finalAmount * 0.3)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-bold uppercase tracking-wider text-sage-500 mb-2">
                        Chọn phương thức thanh toán cọc <span className="text-red-550">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          onClick={() => setPaymentMethod("cash")}
                          className={`p-4 border rounded-xl cursor-pointer select-none transition-all flex flex-col items-center gap-2 text-center ${
                            paymentMethod === "cash"
                              ? "border-[#cda250] bg-gradient-to-b from-white to-[#cda250]/5 shadow-md ring-1 ring-[#cda250]"
                              : "border-primary-100 hover:border-primary-200 hover:bg-sage-50/30"
                          }`}
                        >
                          <Users className="h-6 w-6 text-[#cda250]" />
                          <div className="font-bold text-sage-900 text-xs">1. Lễ tân xác nhận</div>
                          <div className="text-[10px] text-sage-500 font-medium">Thu tiền mặt tại quầy</div>
                        </div>

                        <div
                          onClick={() => setPaymentMethod("vnpay")}
                          className={`p-4 border rounded-xl cursor-pointer select-none transition-all flex flex-col items-center gap-2 text-center ${
                            paymentMethod === "vnpay"
                              ? "border-[#cda250] bg-gradient-to-b from-white to-[#cda250]/5 shadow-md ring-1 ring-[#cda250]"
                              : "border-primary-100 hover:border-primary-200 hover:bg-sage-50/30"
                          }`}
                        >
                          <CreditCard className="h-6 w-6 text-primary-850" />
                          <div className="font-bold text-sage-900 text-xs">2. Thanh toán VNPay</div>
                          <div className="text-[10px] text-sage-500 font-medium">Tạo link thanh toán trực tuyến</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50">
                  <button
                    type="button"
                    onClick={handleSkipPayment}
                    className="px-4 py-2 border border-primary-100 text-xs font-semibold uppercase tracking-wider hover:bg-primary-50 cursor-pointer text-sage-600 disabled:opacity-50"
                    disabled={paymentLoading}
                  >
                    Bỏ qua & Thanh toán sau
                  </button>
                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className="px-6 py-2 bg-primary-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-900 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {paymentLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Xác nhận thanh toán cọc"
                    )}
                  </button>
                </div>
              </form>
            )}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-sage-500 mb-1">
                    Loại giấy tờ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
                  >
                    <option value="CCCD">Căn cước công dân (CCCD)</option>
                    <option value="PASSPORT">Hộ chiếu (Passport)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-sage-500 mb-1">
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-sage-500 mb-1">
                    Số {documentType === "CCCD" ? "CCCD" : "Hộ chiếu"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={identityDocument}
                    onChange={(e) => setIdentityDocument(e.target.value)}
                    placeholder={documentType === "CCCD" ? "VD: 001123456789 (12 số)" : "VD: B1234567"}
                    className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-sage-500 mb-1">
                    Xác nhận số {documentType === "CCCD" ? "CCCD" : "Hộ chiếu"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={confirmIdentityDocument}
                    onChange={(e) => setConfirmIdentityDocument(e.target.value)}
                    placeholder="Nhập lại chính xác"
                    className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200"
                    required
                  />
                </div>
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
                  <div key={`adult-${index}`} className="p-3 bg-sage-50/50 border border-primary-50 rounded space-y-2.5 text-xs">
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
                        className="p-2 border border-primary-100 rounded bg-white text-xs col-span-2"
                        required
                      />
                      <div className="col-span-2 grid grid-cols-3 gap-2">
                        <select
                          value={adult.documentType || "CCCD"}
                          onChange={(e) => {
                            const updated = [...accompanyingAdults];
                            updated[index].documentType = e.target.value;
                            setAccompanyingAdults(updated);
                          }}
                          className="p-2 border border-primary-100 rounded bg-white text-xs"
                        >
                          <option value="CCCD">CCCD</option>
                          <option value="PASSPORT">Passport</option>
                        </select>
                        <input
                          type="text"
                          placeholder={adult.documentType === "PASSPORT" ? "Số Hộ chiếu" : "Số CCCD"}
                          value={adult.identityDocument}
                          onChange={(e) => {
                            const updated = [...accompanyingAdults];
                            updated[index].identityDocument = e.target.value;
                            setAccompanyingAdults(updated);
                          }}
                          className="p-2 border border-primary-100 rounded bg-white text-xs"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Xác nhận số"
                          value={adult.confirmIdentityDocument || ""}
                          onChange={(e) => {
                            const updated = [...accompanyingAdults];
                            updated[index].confirmIdentityDocument = e.target.value;
                            setAccompanyingAdults(updated);
                          }}
                          className="p-2 border border-primary-100 rounded bg-white text-xs"
                          required
                        />
                      </div>
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
    </div>
  );
}
