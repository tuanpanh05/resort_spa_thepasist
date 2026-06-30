import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarRange, Bed, Flower, MessageSquare,
  CreditCard, Clock, X, LogOut, Menu, FileText, User
} from 'lucide-react';

import {
  staffInitialRooms as initialRooms,
  staffInitialBookings as initialBookings,
  staffInitialServices as initialServices,
  staffInitialComplaints as initialComplaints,
  staffInitialPayments as initialPayments,
  staffInitialChatMessages
} from '../mockData';
import { complaintsApi, shiftApi, userApi, staffApi, incurredServicesApi } from '../api';

// Import sub-components
import OperationLayout from '../layouts/OperationLayout';
import ManageBookings from '../components/staff/ManageBookings';
import ManageRooms from '../components/staff/ManageRooms';
import ManageServices from '../components/staff/ManageServices';
import ManageSupport from '../components/staff/ManageSupport';
import ManagePayments from '../components/staff/ManagePayments';
import ManageShifts from '../components/staff/ManageShifts';
import BookingItinerary from '../components/staff/BookingItinerary';
import StaffProfile from '../components/staff/StaffProfile';

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole") || "";
    if (!token) {
      navigate("/dang-nhap");
      return;
    }
    const roleUpper = role.toUpperCase();
    if (roleUpper !== "STAFF" && roleUpper !== "RECEPTIONIST" && roleUpper !== "ADMIN" && roleUpper !== "MANAGER") {
      alert("Bạn không có quyền truy cập vào khu vực nhân viên!");
      navigate("/");
      return;
    }

    // Load active staff profile and sync attendance status from database
    userApi.getProfile()
      .then(user => {
        setCurrentUser(user);
        syncClockState(user);
      })
      .catch(err => console.error("Không thể tải thông tin nhân viên:", err));
  }, [navigate]);

  const syncClockState = async (user) => {
    const role = (user.role || "").toUpperCase();
    if (role === "ADMIN" || role === "MANAGER") {
      // Admins and Managers bypass the clock-in block
      setClockState({
        isClockedIn: true,
        clockInTime: "System",
        clockOutTime: null,
        history: ["Quản trị viên / Quản lý luôn có quyền truy cập."]
      });
      return;
    }

    try {
      const list = await shiftApi.getAllShifts();
      const userShift = list.find(s => s.name === user.fullName);
      if (userShift) {
        const isClockedIn = userShift.status === "Checked-in" || userShift.status === "Checked-In";
        setClockState({
          isClockedIn,
          clockInTime: isClockedIn ? "08:00" : null,
          clockOutTime: null,
          history: isClockedIn ? [`Vào ca lúc 08:00 ngày hôm nay (Đã đồng bộ từ Database)`] : []
        });
      }
    } catch (err) {
      console.error("Lỗi khi đồng bộ ca trực từ database:", err);
    }
  };

  // Load complaints from backend database
  useEffect(() => {
    complaintsApi.getAllComplaints()
      .then(list => setComplaints(list || []))
      .catch(err => console.error("Lỗi khi tải khiếu nại:", err));
  }, []);

  // Load incurred services from backend database
  useEffect(() => {
    incurredServicesApi.getAllServices()
      .then(list => setServices(list || []))
      .catch(err => console.error("Lỗi khi tải dịch vụ phát sinh:", err));
  }, []);

  // Load rooms from backend database and map to frontend format
  useEffect(() => {
    staffApi.getVillas()
      .then(list => {
        const mapped = (list || []).map(r => ({
          id: r.roomNumber,
          roomNumber: r.roomNumber,
          roomId: r.roomId,
          status: (r.status || "").toLowerCase(),
          type: r.roomType?.typeName || "Villa",
        }));
        setRooms(mapped);
      })
      .catch(err => console.error("Lỗi khi tải danh sách phòng:", err));
  }, []);

  // Master React States for entities
  const [bookings, setBookings] = useState(initialBookings);
  const [rooms, setRooms] = useState(initialRooms);
  const [services, setServices] = useState(initialServices);
  const [complaints, setComplaints] = useState(initialComplaints);
  const [payments, setPayments] = useState(initialPayments);
  const [shiftSwapRequests, setShiftSwapRequests] = useState([]);
  const [selectedItineraryBookingId, setSelectedItineraryBookingId] = useState(null);

  // Clock Attendance States
  const [clockState, setClockState] = useState({
    isClockedIn: false,
    clockInTime: null,
    clockOutTime: null,
    history: []
  });

  const handleCheckIn = (booking) => {
    if (booking.room === 'Chưa gán') {
      alert('Vui lòng gán phòng trước khi thực hiện Check-in!');
      setActiveTab('bookings');
      return;
    }
    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'Checked In' } : b));
    setRooms(prev => prev.map(r => r.id === booking.room ? { ...r, status: 'occupied', guestName: booking.guest } : r));
    alert(`Đã hoàn tất thủ tục Check-in cho khách ${booking.guest} vào phòng ${booking.room}.`);
  };

  const handleCheckOut = (booking) => {
    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'Checked Out' } : b));
    setRooms(prev => prev.map(r => r.id === booking.room ? { ...r, status: 'cleaning', guestName: '' } : r));

    const invoiceExists = payments.find(p => p.bookingId === booking.id);
    if (invoiceExists) {
      setPayments(prev => prev.map(p => p.bookingId === booking.id ? { ...p, status: 'Paid' } : p));
    }
    alert(`Đã hoàn tất check-out phòng ${booking.room}. Phòng được đưa vào danh sách chờ dọn dẹp.`);
  };

  const handleClockIn = async () => {
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    try {
      if (currentUser) {
        await shiftApi.clockInByName(
          currentUser.fullName, 
          "Checked-in", 
          currentUser.role === "STAFF" ? "Lễ tân chính" : currentUser.role,
          "Lễ tân"
        );
      }
      setClockState(prev => ({
        ...prev,
        isClockedIn: true,
        clockInTime: timeStr,
        clockOutTime: null,
        history: [`Vào ca lúc ${timeStr} ngày hôm nay`, ...prev.history]
      }));
      alert(`Điểm danh vào ca làm việc thành công lúc ${timeStr} (Đã cập nhật Database)!`);
    } catch (err) {
      alert("Lỗi lưu điểm danh vào ca trực: " + err.message);
    }
  };

  const handleClockOut = async () => {
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    try {
      if (currentUser) {
        await shiftApi.clockInByName(
          currentUser.fullName, 
          "Absent", 
          currentUser.role === "STAFF" ? "Lễ tân chính" : currentUser.role,
          "Lễ tân"
        );
      }
      setClockState(prev => ({
        ...prev,
        isClockedIn: false,
        clockOutTime: timeStr,
        history: [`Ra ca lúc ${timeStr} ngày hôm nay (Lưu vào Database)`, ...prev.history]
      }));
      alert(`Điểm danh ra ca làm việc thành công lúc ${timeStr} (Đã cập nhật Database)!`);
    } catch (err) {
      alert("Lỗi lưu điểm danh ra ca: " + err.message);
    }
  };

  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống nhân viên?')) {
      navigate('/dang-nhap');
    }
  };

  // Sidebar item list
  // UC10: Navigate to itinerary tab from bookings list
  const handleViewItinerary = (bookingId) => {
    setSelectedItineraryBookingId(bookingId);
    setActiveTab('itinerary');
  };

  const sidebarItems = [
    { id: 'bookings', label: 'Quản Lý Đặt Phòng', icon: CalendarRange },
    { id: 'rooms', label: 'Sơ Đồ Phòng Trực', icon: Bed },
    { id: 'itinerary', label: 'Chi Tiết & Lịch Trình', icon: FileText },
    { id: 'services', label: 'Dịch Vụ Phát Sinh', icon: Flower },
    { id: 'support', label: 'Hỗ Trợ Khách Hàng', icon: MessageSquare },
    { id: 'payments', label: 'Thanh Toán & Hóa Đơn', icon: CreditCard },
    { id: 'shifts', label: 'Lịch Làm & Điểm Danh', icon: Clock },
    { id: 'profile', label: 'Hồ Sơ Của Tôi', icon: User }
  ];

  return (
    <OperationLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      handleLogout={handleLogout}
      sidebarItems={sidebarItems}
      isMobileMenuOpen={isMobileMenuOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
      userRoleLabel="Lễ tân"
      headerTitle={
        activeTab === 'bookings' ? 'Quản Lý Đơn Đặt Phòng' :
        activeTab === 'rooms' ? 'Sơ Đồ Phòng Theo Ca' :
        activeTab === 'itinerary' ? 'Chi Tiết Đặt Phòng & Lịch Trình' :
        activeTab === 'services' ? 'Xử Lý Dịch Vụ Phát Sinh' :
        activeTab === 'support' ? 'Hỗ Trợ & Tiếp Nhận Complaint' :
        activeTab === 'payments' ? 'Xác Nhận Hóa Đơn & Thanh Toán' :
        activeTab === 'shifts' ? 'Điểm Danh & Đổi Ca Trực' :
        activeTab === 'profile' ? 'Hồ Sơ & Công Nợ Nhân Viên' : 'Vận Hành Kỹ Thuật Số'
      }
      customHeaderRight={
        <div className="flex items-center space-x-2 bg-primary-100/70 border border-primary-200/50 rounded-none px-4 py-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-semibold text-sage-800">Ca Trực Sáng</span>
          <span className="text-sage-400">|</span>
          <span className="font-semibold text-primary-900">
            {clockState.isClockedIn ? `Đang trực ca` : 'Chưa điểm danh vào'}
          </span>
        </div>
      }
    >


      <div className="relative min-h-[600px] flex flex-col flex-1">
        {/* Clock-in Security Block Overlay for other tabs */}
        {activeTab !== 'shifts' && !clockState.isClockedIn && (
          <div className="absolute inset-0 bg-[#faf8f5]/65 backdrop-blur-md z-40 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="max-w-md bg-white border border-[#cda250]/30 p-8 shadow-2xl space-y-6 text-center">
              <div className="w-16 h-16 bg-[#faf8f5] border border-[#cda250]/20 rounded-full flex items-center justify-center mx-auto text-[#cda250]">
                <Clock className="h-8 w-8 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-xl font-normal text-sage-950">Chưa Điểm Danh Vào Ca</h3>
                <p className="text-xs text-sage-500 leading-relaxed">
                  Theo quy định vận hành của Ngũ Sơn Resort, bạn cần thực hiện điểm danh vào ca trực trước khi thao tác các tác vụ đặt phòng và check-in khách hàng.
                </p>
              </div>
              <button
                onClick={handleClockIn}
                className="w-full py-3 bg-primary-800 hover:bg-primary-900 text-white rounded-none text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(26,44,34,0.1)]"
              >
                Điểm danh vào ca trực ngay
              </button>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <ManageBookings
            bookings={bookings}
            rooms={rooms}
            payments={payments}
            setBookings={setBookings}
            setRooms={setRooms}
            setPayments={setPayments}
            onViewItinerary={handleViewItinerary}
          />
        )}

        {activeTab === 'rooms' && (
          <ManageRooms
            rooms={rooms}
            setRooms={setRooms}
            setComplaints={setComplaints}
          />
        )}

        {activeTab === 'itinerary' && (
          <BookingItinerary
            bookingId={selectedItineraryBookingId}
            onClose={() => {
              setSelectedItineraryBookingId(null);
              setActiveTab('bookings');
            }}
          />
        )}

        {activeTab === 'services' && (
          <ManageServices
            services={services}
            setServices={setServices}
            rooms={rooms}
          />
        )}

        {activeTab === 'support' && (
          <ManageSupport
            complaints={complaints}
            setComplaints={setComplaints}
            rooms={rooms}
          />
        )}

        {activeTab === 'payments' && (
          <ManagePayments />
        )}

        {activeTab === 'shifts' && (
          <ManageShifts
            clockState={clockState}
            setClockState={setClockState}
            shiftSwapRequests={shiftSwapRequests}
            setShiftSwapRequests={setShiftSwapRequests}
            handleClockIn={handleClockIn}
            handleClockOut={handleClockOut}
          />
        )}

        {activeTab === 'profile' && (
          <StaffProfile />
        )}
      </div>
    </OperationLayout>
  );
}
