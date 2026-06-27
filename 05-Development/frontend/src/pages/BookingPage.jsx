import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axiosClient from "../api/axiosClient";
import { medicalApi, userApi, masterDataApi, bookingLookupApi } from "../api";

// servicesList and villasList removed — now using live API data (spaServices, roomTypes)

import BookingWizardHeader from "../components/booking/BookingWizardHeader";
import GuestInfoStep from "../components/booking/GuestInfoStep";
import HealthProfileStep from "../components/booking/HealthProfileStep";
import VillaSelectionStep from "../components/booking/VillaSelectionStep";
import MealSelectionStep from "../components/booking/MealSelectionStep";
import ConfirmationStep from "../components/booking/ConfirmationStep";
import BookingBillSummary from "../components/booking/BookingBillSummary";
import BookingSuccess from "../components/booking/BookingSuccess";

export default function BookingPage() {
  const navigate = useNavigate();

  // Wizard Step State: 1 = Guest Info, 2 = Select Villa & Services, 3 = Review, 4 = Payment QR
  const [step, setStep] = useState(1);

  // Spa services
  const [spaServices, setSpaServices] = useState([]);

  // Status Trackers
  const bookingStatus = "DRAFT"; // DRAFT -> PENDING_PAYMENT -> CONFIRMED
  const paymentStatus = "UNPAID"; // UNPAID -> PENDING -> PAID

  // Step 1: Guest Information
  const [guestInfo, setGuestInfo] = useState(() => ({
    fullName: "",
    phone: "",
    email: "",
    checkInDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
    checkOutDate: new Date(Date.now() + 172800000).toISOString().split("T")[0], // Day after tomorrow
    guestsCount: 2,
    childrenCount: 0,
    childrenUnder5: 0,
    children5to12: 0,
    healthNote: "",
    specialRequest: "",
  }));

  const [formErrors, setFormErrors] = useState({});

  // Step 2: Health Profile
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [otherAllergy, setOtherAllergy] = useState("");
  const [dietaryPreferences, setDietaryPreferences] = useState(["omnivore"]);
  const [physicalCondition, setPhysicalCondition] = useState("");
  const [consentDataProcessing, setConsentDataProcessing] = useState(false);
  const [consentSharing, setConsentSharing] = useState(false);

  const toggleAllergy = (key) => {
    setSelectedAllergies((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleDietaryPreference = (key) => {
    setDietaryPreferences((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Step 3: Selected Room & Services
  const [selectedRooms, setSelectedRooms] = useState({}); // { [roomTypeId]: quantity }
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);

  // Step 4: Meal Selections { "yyyy-MM-dd": { "Breakfast": { foodId: qty }, ... } }
  const [mealSelections, setMealSelections] = useState({});
  const [selectedComboId, setSelectedComboId] = useState(null);
  const [selectedMealDate, setSelectedMealDate] = useState("");
  const [mealBookingDays, setMealBookingDays] = useState([]);
  const [packageMenuItems, setPackageMenuItems] = useState([]);


  // Copy helper
  const [copiedField, setCopiedField] = useState(null);

  // Loading States
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupStatus, setLookupStatus] = useState("idle"); // idle, searching, found, not_found

  const handleEmailLookup = async (emailToLookup) => {
    if (!emailToLookup || !/\S+@\S+\.\S+/.test(emailToLookup)) {
      return;
    }
    setIsLookingUp(true);
    setLookupStatus("searching");
    try {
      const profile = await bookingLookupApi.getGuestProfile(emailToLookup);
      if (profile) {
        setGuestInfo((prev) => ({
          ...prev,
          fullName: profile.fullName || prev.fullName,
          phone: profile.phone || prev.phone,
        }));

        // Auto-fill health profile if exists
        if (profile.medicalProfile) {
          const mp = profile.medicalProfile;
          if (mp.explicitConsentSigned) {
            setConsentDataProcessing(true);
            setConsentSharing(true);
            if (mp.foodAllergies) {
              try {
                const parsed = JSON.parse(mp.foodAllergies);
                setSelectedAllergies(parsed.selected || []);
                setOtherAllergy(parsed.other || "");
                setDietaryPreferences([parsed.diet || "omnivore"]);
              } catch (e) {
                console.error("Failed to parse foodAllergies:", e);
                setOtherAllergy(mp.foodAllergies);
              }
            }
            if (mp.physicalCondition) {
              setPhysicalCondition(mp.physicalCondition);
            }
          }
        }
        setLookupStatus("found");
      } else {
        setLookupStatus("not_found");
      }
    } catch (err) {
      console.warn("Email lookup failed or user not found:", err);
      setLookupStatus("not_found");
    } finally {
      setIsLookingUp(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    const fetchMenuStatus = async () => {
      try {
        const res = await axiosClient.get("/chef/menu");
        const validDishes = res.data.filter(item =>
          item.enabled !== false &&
          item.isTodayMenu !== false
        );

        const mappedDishes = validDishes.map(item => ({
          foodId: item.foodId,
          dishName: item.name,
          description: item.description,
          price: item.price,
          category: item.category || "",
          dietaryTags: item.dietaryTags || "",
          allergens: item.allergens || [],
          image: item.image,
          isPackageIncluded: item.isPackageIncluded,
          periods: item.periods || ["Lunch"],
          availableDays: item.availableDays ? item.availableDays.split(",").map(Number) : [0, 1, 2, 3, 4, 5, 6]
        }));

        setPackageMenuItems(mappedDishes);
      } catch (err) {
        console.error("Failed to fetch live menu status", err);
      }
    };
    fetchMenuStatus();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;
      try {
        const u = await userApi.getProfile();
        if (u) {
          setGuestInfo((prev) => ({
            ...prev,
            fullName: u.fullName || prev.fullName,
            phone: u.phone || prev.phone,
            email: u.email || prev.email,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch user profile for booking info", err);
      }
    };

    const fetchHealthProfile = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;
      try {
        const p = await medicalApi.getMyProfile();
        if (p && p.explicitConsentSigned) {
          setConsentDataProcessing(true);
          setConsentSharing(true);
          if (p.foodAllergies) {
            try {
              const parsed = JSON.parse(p.foodAllergies);
              setSelectedAllergies(parsed.selected || []);
              setOtherAllergy(parsed.other || "");
              setDietaryPreferences(parsed.diet ? [parsed.diet] : ["omnivore"]);
            } catch (e) {
              console.error("Failed to parse foodAllergies:", e);
              setOtherAllergy(p.foodAllergies);
            }
          }
          if (p.physicalCondition) {
            setPhysicalCondition(p.physicalCondition);
          }
        }
      } catch (err) {
        console.error("Failed to fetch medical profile for booking info", err);
      }
    };

    fetchUserProfile();
    fetchHealthProfile();
  }, []);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const checkIn = guestInfo.checkInDate ? guestInfo.checkInDate.split("T")[0] : null;
        const checkOut = guestInfo.checkOutDate ? guestInfo.checkOutDate.split("T")[0] : null;
        const data = await masterDataApi.getRoomTypes(checkIn, checkOut);
        setRoomTypes(data);

        // Auto-adjust selectedRooms if checkIn/checkOut change makes rooms unavailable or exceeds availability
        setSelectedRooms((prev) => {
          const next = { ...prev };
          let changed = false;
          Object.keys(next).forEach((roomTypeId) => {
            const rt = data.find((r) => r.roomTypeId === Number(roomTypeId));
            const maxCount = rt && rt.availableRoomsCount !== undefined ? rt.availableRoomsCount : 0;
            if (next[roomTypeId] > maxCount) {
              if (maxCount === 0) {
                delete next[roomTypeId];
              } else {
                next[roomTypeId] = maxCount;
              }
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      } catch (err) {
        console.error("Failed to fetch room types from database", err);
      }
    };
    fetchRoomTypes();
  }, [guestInfo.checkInDate, guestInfo.checkOutDate]);

  useEffect(() => {
    const fetchPackagesAndServices = async () => {
      try {
        const svcs = await masterDataApi.getSpaServices();
        setSpaServices(svcs);
      } catch (err) {
        console.error("Failed to fetch spa services:", err);
      }
    };
    fetchPackagesAndServices();
  }, []);

  const [nightsCount, setNightsCount] = useState(2);

  // Automatically calculate nightsCount based on checkInDate and checkOutDate
  useEffect(() => {
    if (guestInfo.checkInDate && guestInfo.checkOutDate) {
      const checkIn = new Date(guestInfo.checkInDate);
      const checkOut = new Date(guestInfo.checkOutDate);
      if (checkOut > checkIn) {
        const diffTime = Math.abs(checkOut - checkIn);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setNightsCount(diffDays);
      } else {
        setNightsCount(0);
      }
    }
  }, [guestInfo.checkInDate, guestInfo.checkOutDate]);

  // Adjust checkOutDate if checkInDate changes and becomes >= checkOutDate
  useEffect(() => {
    if (guestInfo.checkInDate && guestInfo.checkOutDate) {
      const checkIn = new Date(guestInfo.checkInDate);
      const checkOut = new Date(guestInfo.checkOutDate);
      if (checkOut <= checkIn) {
        const nextDay = new Date(checkIn);
        nextDay.setDate(nextDay.getDate() + 2); // Default stay duration of 2 nights
        setGuestInfo((prev) => ({ ...prev, checkOutDate: nextDay.toISOString().split("T")[0] }));
      }
    }
  }, [guestInfo.checkInDate, guestInfo.checkOutDate]);

  useEffect(() => {
    const checkIn = new Date(guestInfo.checkInDate);
    const checkOut = new Date(guestInfo.checkOutDate);
    if (checkOut > checkIn) {
      const days = [];
      let curr = new Date(checkIn);
      while (curr <= checkOut) {
        days.push(curr.toISOString().split("T")[0]);
        curr.setDate(curr.getDate() + 1);
      }
      setMealBookingDays(days);
      if (days.length > 0 && (!selectedMealDate || !days.includes(selectedMealDate))) {
        setSelectedMealDate(days[0]);
      }
    } else {
      setMealBookingDays([]);
    }
    setSelectedComboId(null);
    setMealSelections({});
  }, [guestInfo.checkInDate, guestInfo.checkOutDate, selectedMealDate]);

  const selectedVillaIdFirst = Object.keys(selectedRooms).find(id => selectedRooms[id] > 0);
  const selectedVilla = selectedVillaIdFirst ? roomTypes.find((v) => v.roomTypeId === Number(selectedVillaIdFirst)) : null;

  const calculateVillaTotal = () => {
    let total = 0;
    Object.entries(selectedRooms).forEach(([roomTypeId, qty]) => {
      const roomType = roomTypes.find((r) => r.roomTypeId === Number(roomTypeId));
      if (roomType && qty > 0) {
        total += roomType.basePricePerNight * nightsCount * qty;
      }
    });
    return total;
  };
  const villaTotal = calculateVillaTotal();

  const chargedGuestsCount = Number(guestInfo.guestsCount || 0) + Number(guestInfo.childrenUnder5 || 0) + Number(guestInfo.children5to12 || 0);
  let servicesTotalBeforeDiscount = 0;
  let childDiscountUnder5 = 0;
  let childDiscount5to12 = 0;
  // Use spaServices fetched from API instead of mock servicesList
  const selectedServices = spaServices.filter((s) => selectedServiceIds.includes(s.id || s.serviceId));
  selectedServices.forEach((s) => {
    const pricingType = s.pricingType || s.type || "per-guest";
    let basePriceForService = 0;
    if (pricingType === "per-guest") {
      basePriceForService = s.price;
    } else if (pricingType === "per-guest-per-night") {
      basePriceForService = s.price * nightsCount;
    }

    if (basePriceForService > 0) {
      servicesTotalBeforeDiscount += basePriceForService * chargedGuestsCount;
      childDiscountUnder5 += basePriceForService * Number(guestInfo.childrenUnder5 || 0) * 1.0;
      childDiscount5to12 += basePriceForService * Number(guestInfo.children5to12 || 0) * 0.3;
    } else {
      servicesTotalBeforeDiscount += s.price;
    }
  });

  const servicesTotal = servicesTotalBeforeDiscount - childDiscountUnder5 - childDiscount5to12;

  const calculateMealTotal = () => {
    let extra = 0;
    Object.values(mealSelections).forEach((dateObj) => {
      Object.values(dateObj).forEach((periodObj) => {
        Object.entries(periodObj).forEach(([foodId, qty]) => {
          const item = packageMenuItems.find((m) => m.foodId === Number(foodId));
          if (item) {
            if (item.isPackageIncluded) {
              if (qty > 1) extra += item.price * (qty - 1);
            } else {
              extra += item.price * qty;
            }
          }
        });
      });
    });
    return extra;
  };
  const mealTotal = calculateMealTotal();

  // BR-CHILD: Giảm giá food cho trẻ em
  // Trẻ dưới 5: miễn phí 100% phần food tương ứng (theo tỷ lệ)
  // Trẻ 5-12: giảm 30% phần food tương ứng (theo tỷ lệ)
  const totalPeople = Number(guestInfo.guestsCount || 0) + Number(guestInfo.childrenUnder5 || 0) + Number(guestInfo.children5to12 || 0);
  let foodChildDiscountUnder5 = 0;
  let foodChildDiscount5to12 = 0;
  if (totalPeople > 0 && mealTotal > 0) {
    const under5Count = Number(guestInfo.childrenUnder5 || 0);
    const child5to12Count = Number(guestInfo.children5to12 || 0);
    foodChildDiscountUnder5 = mealTotal * (under5Count / totalPeople) * 1.0;    // 100% miễn phí
    foodChildDiscount5to12 = mealTotal * (child5to12Count / totalPeople) * 0.3; // giảm 30%
  }
  // Cộng dồn giảm giá food vào giảm giá trẻ em chung (Spa + Food)
  childDiscountUnder5 += foodChildDiscountUnder5;
  childDiscount5to12 += foodChildDiscount5to12;

  const getMealSelectedCount = () => {
    let count = 0;
    Object.values(mealSelections).forEach((dateObj) => {
      Object.values(dateObj).forEach((periodObj) => {
        Object.values(periodObj).forEach((qty) => { count += qty; });
      });
    });
    return count;
  };

  const updateMealQty = (date, period, foodId, change) => {
    setMealSelections((prev) => {
      const dateSel = prev[date] || {};
      const periodSel = dateSel[period] || {};
      const currentQty = periodSel[foodId] || 0;
      const newQty = Math.max(0, currentQty + change);
      const nextPeriodSel = { ...periodSel };
      if (newQty === 0) { delete nextPeriodSel[foodId]; } else { nextPeriodSel[foodId] = newQty; }
      return { ...prev, [date]: { ...dateSel, [period]: nextPeriodSel } };
    });
  };

  // Called by MealSelectionStep whenever the combo-derived meals are computed
  const handleComboMealsChange = (computedMeals) => {
    setMealSelections(computedMeals);
  };

  const handleSelectCombo = (comboId) => {
    if (selectedComboId === comboId) {
      setSelectedComboId(null);
      setMealSelections({});
    } else {
      setSelectedComboId(comboId);
    }
  };

  const selectedPackages = [];
  const mealAfterDiscount = mealTotal - foodChildDiscountUnder5 - foodChildDiscount5to12;
  const baseTotal = villaTotal + servicesTotal + Math.max(0, mealAfterDiscount);
  // Add 10% VAT & service fee to match backend calculations
  const totalAmount = baseTotal * 1.1;
  const depositAmount = totalAmount * 0.3;
  const remainingAmount = totalAmount * 0.7;

  const validateStep1 = () => {
    const errors = {};
    if (!guestInfo.fullName.trim()) errors.fullName = "Vui lòng nhập họ và tên.";
    if (!guestInfo.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!/^[0-9+-\s]{9,12}$/.test(guestInfo.phone)) {
      errors.phone = "Số điện thoại không hợp lệ.";
    }
    if (!guestInfo.email.trim()) {
      errors.email = "Vui lòng nhập địa chỉ email.";
    } else if (!/\S+@\S+\.\S+/.test(guestInfo.email)) {
      errors.email = "Địa chỉ email không hợp lệ.";
    }
    if (!guestInfo.guestsCount || Number(guestInfo.guestsCount) <= 0) {
      errors.guestsCount = "Số lượng khách hàng phải là số nguyên dương.";
    }
    if (guestInfo.childrenCount !== "" && (isNaN(guestInfo.childrenCount) || Number(guestInfo.childrenCount) < 0)) {
      errors.childrenCount = "Số lượng trẻ em phải là số không âm.";
    }
    if (guestInfo.childrenUnder5 !== "" && (isNaN(guestInfo.childrenUnder5) || Number(guestInfo.childrenUnder5) < 0)) {
      errors.childrenUnder5 = "Số lượng trẻ em dưới 5 tuổi phải là số không âm.";
    }
    if (guestInfo.children5to12 !== "" && (isNaN(guestInfo.children5to12) || Number(guestInfo.children5to12) < 0)) {
      errors.children5to12 = "Số lượng trẻ em từ 5 đến 12 tuổi phải là số không âm.";
    }

    const checkIn = new Date(guestInfo.checkInDate);
    const checkOut = new Date(guestInfo.checkOutDate);
    if (checkOut <= checkIn) {
      errors.checkOutDate = "Ngày trả phòng phải sau ngày nhận phòng.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    setFormErrors(errors);
    return true;
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (validateStep1()) {
        const count = Number(guestInfo.guestsCount || 0) + Number(guestInfo.children5to12 || 0);
        
        let currentRoomTypes = roomTypes;
        if (!currentRoomTypes || currentRoomTypes.length === 0) {
          try {
            const checkIn = guestInfo.checkInDate ? guestInfo.checkInDate.split("T")[0] : null;
            const checkOut = guestInfo.checkOutDate ? guestInfo.checkOutDate.split("T")[0] : null;
            currentRoomTypes = await masterDataApi.getRoomTypes(checkIn, checkOut);
            setRoomTypes(currentRoomTypes);
          } catch (e) {
            console.error("Failed to load room types:", e);
          }
        }

        const totalCapacity = currentRoomTypes.reduce((sum, rt) => {
          const count = rt.availableRoomsCount !== undefined ? rt.availableRoomsCount : 0;
          const cap = rt.maxOccupancy !== undefined ? rt.maxOccupancy : 0;
          return sum + (count * cap);
        }, 0);

        if (totalCapacity < count) {
          alert(`Hiện tại khu nghỉ dưỡng không còn đủ phòng trống để đáp ứng số lượng khách của bạn (Số khách yêu cầu: ${count} người, tổng sức chứa tối đa còn lại: ${totalCapacity} người). Mong quý khách thông cảm.`);
          navigate("/");
          return;
        }

        if (count > 100) {
          const confirmOk = window.confirm("Bạn có chắc chắn muốn đặt phòng cho đoàn khách số lượng lớn này không?");
          if (!confirmOk) {
            return;
          }
        }
        
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    } else if (step === 3) {
      const hasSelectedRoom = Object.values(selectedRooms).some((qty) => qty > 0);
      if (!hasSelectedRoom) {
        alert("Vui lòng chọn ít nhất một biệt thự nghỉ dưỡng ở Bước 3 trước khi tiếp tục.");
        return;
      }
      // Check if any selected room type has available rooms < selected quantity
      for (const [roomTypeId, qty] of Object.entries(selectedRooms)) {
        if (qty > 0) {
          const rt = roomTypes.find((r) => r.roomTypeId === Number(roomTypeId));
          const maxCount = rt && rt.availableRoomsCount !== undefined ? rt.availableRoomsCount : 0;
          if (qty > maxCount) {
            alert(`Hạng phòng "${rt ? rt.typeName : ''}" đã không còn đủ phòng trống cho số lượng bạn chọn trong khoảng thời gian này.`);
            return;
          }
        }
      }
      // Check if total max occupancy of selected rooms is sufficient for total guests (adults + children 5-12)
      const totalGuests = Number(guestInfo.guestsCount || 0) + Number(guestInfo.children5to12 || 0);
      let totalCapacity = 0;
      Object.entries(selectedRooms).forEach(([roomTypeId, qty]) => {
        if (qty > 0) {
          const rt = roomTypes.find((r) => r.roomTypeId === Number(roomTypeId));
          if (rt) {
            totalCapacity += (rt.maxOccupancy || 2) * qty;
          }
        }
      });

      if (totalGuests > totalCapacity) {
        const confirmOk = window.confirm(
          `Không đủ phòng! Sức chứa tối đa của các biệt thự đã chọn (${totalCapacity} người) không đủ cho số lượng khách của bạn (${totalGuests} người).\n\nBạn có chắc chắn muốn tiếp tục đặt đơn này không?\n\nNhấn 'OK' để tiếp tục đặt đơn, hoặc nhấn 'Cancel' để thoát ra trang chủ.`
        );
        if (!confirmOk) {
          navigate("/");
          return;
        }
      }
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  const handlePrevStep = () => {
    if (step > 1 && step < 6) {
      setStep(step - 1);
    }
  };

  const handleVerifyPayment = async () => {
    setIsVerifyingPayment(true);
    try {
      // Resolve numeric service IDs from spaServices API data
      const numericServiceIds = selectedServiceIds
        .map(id => {
          const svc = spaServices.find(s => (s.id || s.serviceId) === id);
          return svc ? (svc.serviceId || svc.id) : null;
        })
        .filter(id => id !== null && typeof id === "number");

      const payload = {
        fullName: guestInfo.fullName,
        email: guestInfo.email,
        phone: guestInfo.phone,
        checkInDate: (guestInfo.checkInDate ? guestInfo.checkInDate.split("T")[0] : "") + "T14:00:00",
        checkOutDate: (guestInfo.checkOutDate ? guestInfo.checkOutDate.split("T")[0] : "") + "T12:00:00",
        guestsCount: guestInfo.guestsCount,
        childrenCount: guestInfo.childrenCount || 0,
        childrenUnder5: guestInfo.childrenUnder5 || 0,
        children5to12: guestInfo.children5to12 || 0,
        villaId: selectedVillaIdFirst ? Number(selectedVillaIdFirst) : null,
        roomId: 1,
        roomQuantity: selectedVillaIdFirst ? selectedRooms[selectedVillaIdFirst] : 1,
        roomTypeQuantities: selectedRooms,
        packageId: null,
        packageIds: [],
        serviceIds: numericServiceIds,
        allergies: selectedAllergies.join(", ") + (otherAllergy ? ", " + otherAllergy : ""),
        explicitConsentSigned: consentDataProcessing && consentSharing,
        mealSelections: mealSelections,
        specialRequests: guestInfo.specialRequest || ""
      };

      const res = await axiosClient.post('/bookings/create', payload);
      const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
      console.log("Booking created successfully:", data);

      if (data && data.invoiceId) {
        navigate(`/payment?invoiceId=${data.invoiceId}`);
      } else {
        alert("Đặt phòng thành công, nhưng không tìm thấy thông tin hóa đơn.");
      }
    } catch (err) {
      console.error("Failed to create booking", err);
      console.error("Failed to create booking. Response:", err.response);
      const errMsg = typeof err.response?.data === "object"
        ? (err.response.data.message || JSON.stringify(err.response.data))
        : (err.response?.data || err.message || "Đặt phòng thất bại. Vui lòng kiểm tra lại thông tin.");
      alert(errMsg);
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handleToggleService = (srvId) => {
    setSelectedServiceIds((prev) =>
      prev.includes(srvId) ? prev.filter((id) => id !== srvId) : [...prev, srvId]
    );
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  const handleCopyText = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="bg-[#faf8f5] min-h-screen pt-28 pb-20 font-sans text-[#1a2f23] selection:bg-[#cda250]/20">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Navigation Breadcrumbs */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-semibold tracking-wider text-sage-600 hover:text-[#cda250] transition-colors uppercase"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại trang chủ
          </Link>
          <span className="text-[10px] bg-[#cda250]/10 border border-[#cda250]/30 text-[#1a2f23] px-4 py-1.5 font-semibold uppercase tracking-widest rounded-full">
            Booking Wizard
          </span>
        </div>

        {/* Page Header Title */}
        <div className="text-center mb-12">
          <h1 className="text-resort-title font-serif text-[#1a2f23] mb-3 uppercase tracking-wider">
            Đặt Lịch Trị Liệu & Nghỉ Dưỡng
          </h1>
          <p className="text-resort-desc max-w-lg mx-auto text-sage-600 font-light">
            Khởi động hành trình phục hồi thân-tâm tại không gian xanh thanh bình của Ngũ Sơn Resort.
          </p>
        </div>

        {/* Wizard Header */}
        <BookingWizardHeader step={step} bookingStatus={bookingStatus} />

        {/* STEP PANELS CONTAINER */}
        {bookingStatus === "CONFIRMED" ? (
          <BookingSuccess
            guestInfo={guestInfo}
            nightsCount={nightsCount}
            selectedVilla={selectedVilla}
            selectedRooms={selectedRooms}
            roomTypes={roomTypes}
            selectedServices={selectedServices}
            totalAmount={totalAmount}
            depositAmount={depositAmount}
            remainingAmount={remainingAmount}
            formatCurrency={formatCurrency}
            selectedPackages={selectedPackages}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Columns: Dynamic Step Form Panel */}
            <div className="lg:col-span-8 bg-[#fbfaf7]/95 border border-[#cda250]/20 p-6 sm:p-8 shadow-[0_15px_40px_rgba(26,44,34,0.05)] rounded-2xl backdrop-blur-md transition-all duration-300">
              {step === 1 && (
                <GuestInfoStep
                  guestInfo={guestInfo}
                  setGuestInfo={setGuestInfo}
                  formErrors={formErrors}
                  setFormErrors={setFormErrors}
                  handleNextStep={handleNextStep}
                  onLookupEmail={handleEmailLookup}
                  isLookingUp={isLookingUp}
                  lookupStatus={lookupStatus}
                  setLookupStatus={setLookupStatus}
                />
              )}
              {step === 2 && (
                <HealthProfileStep
                  formErrors={formErrors}
                  dietaryPreferences={dietaryPreferences}
                  toggleDietaryPreference={toggleDietaryPreference}
                  selectedAllergies={selectedAllergies}
                  toggleAllergy={toggleAllergy}
                  otherAllergy={otherAllergy}
                  setOtherAllergy={setOtherAllergy}
                  physicalCondition={physicalCondition}
                  setPhysicalCondition={setPhysicalCondition}
                  consentDataProcessing={consentDataProcessing}
                  setConsentDataProcessing={setConsentDataProcessing}
                  consentSharing={consentSharing}
                  setConsentSharing={setConsentSharing}
                  handlePrevStep={handlePrevStep}
                  handleNextStep={handleNextStep}
                />
              )}
              {step === 3 && (
                <VillaSelectionStep
                  roomTypes={roomTypes}
                  selectedRooms={selectedRooms}
                  setSelectedRooms={setSelectedRooms}
                  selectedServiceIds={selectedServiceIds}
                  handleToggleService={handleToggleService}
                  formatCurrency={formatCurrency}
                  handlePrevStep={handlePrevStep}
                  handleNextStep={handleNextStep}
                />
              )}
              {step === 4 && (
                <MealSelectionStep
                  mealBookingDays={mealBookingDays}
                  selectedMealDate={selectedMealDate}
                  setSelectedMealDate={setSelectedMealDate}
                  consentDataProcessing={consentDataProcessing}
                  consentSharing={consentSharing}
                  packageMenuItems={packageMenuItems}
                  dietaryPreferences={dietaryPreferences}
                  guestInfo={guestInfo}
                  selectedAllergies={selectedAllergies}
                  otherAllergy={otherAllergy}
                  mealSelections={mealSelections}
                  selectedComboId={selectedComboId}
                  handleSelectCombo={handleSelectCombo}
                  onComboMealsChange={handleComboMealsChange}
                  setMealSelections={setMealSelections}
                  updateMealQty={updateMealQty}
                  formatCurrency={formatCurrency}
                  getMealSelectedCount={getMealSelectedCount}
                  mealTotal={mealTotal}
                  handlePrevStep={handlePrevStep}
                  handleNextStep={handleNextStep}
                  selectedComboId={selectedComboId}
                  handleSelectCombo={handleSelectCombo}
                />
              )}
              {step === 5 && (
                <ConfirmationStep
                  guestInfo={guestInfo}
                  nightsCount={nightsCount}
                  dietaryPreferences={dietaryPreferences}
                  selectedAllergies={selectedAllergies}
                  otherAllergy={otherAllergy}
                  physicalCondition={physicalCondition}
                  selectedVilla={selectedVilla}
                  selectedRooms={selectedRooms}
                  roomTypes={roomTypes}
                  selectedServices={selectedServices}
                  villaTotal={villaTotal}
                  mealTotal={mealTotal}
                  totalAmount={totalAmount}
                  depositAmount={depositAmount}
                  remainingAmount={remainingAmount}
                  formatCurrency={formatCurrency}
                  handleCopyText={handleCopyText}
                  copiedField={copiedField}
                  isVerifyingPayment={isVerifyingPayment}
                  handleVerifyPayment={handleVerifyPayment}
                  handlePrevStep={handlePrevStep}
                  selectedPackages={selectedPackages}
                  servicesTotalBeforeDiscount={servicesTotalBeforeDiscount}
                  childDiscountUnder5={childDiscountUnder5}
                  childDiscount5to12={childDiscount5to12}
                  chargedGuestsCount={chargedGuestsCount}
                />
              )}
            </div>

            {/* Right 4 Columns: Dynamic Booking Bill Summary Stick Widget */}
            <div className="lg:col-span-4 space-y-6">
              <BookingBillSummary
                nightsCount={nightsCount}
                villaTotal={villaTotal}
                mealTotal={mealTotal}
                selectedRooms={selectedRooms}
                roomTypes={roomTypes}
                selectedServices={selectedServices}
                guestInfo={guestInfo}
                totalAmount={totalAmount}
                depositAmount={depositAmount}
                remainingAmount={remainingAmount}
                bookingStatus={bookingStatus}
                paymentStatus={paymentStatus}
                formatCurrency={formatCurrency}
                selectedVilla={selectedVilla}
                selectedPackages={selectedPackages}
                servicesTotalBeforeDiscount={servicesTotalBeforeDiscount}
                childDiscountUnder5={childDiscountUnder5}
                childDiscount5to12={childDiscount5to12}
                chargedGuestsCount={chargedGuestsCount}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
