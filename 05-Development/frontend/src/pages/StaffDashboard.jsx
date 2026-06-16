import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarRange, Bed, Flower, MessageSquare,
  CreditCard, Clock, X, LogOut, Menu, FileText
} from 'lucide-react';

import {
  staffInitialRooms as initialRooms,
  staffInitialBookings as initialBookings,
  staffInitialServices as initialServices,
  staffInitialComplaints as initialComplaints,
  staffInitialPayments as initialPayments,
  staffInitialChatMessages
} from '../mockData';

// Import sub-components
import OperationLayout from '../layouts/OperationLayout';
import StaffOverview from '../components/staff/StaffOverview';
import ManageBookings from '../components/staff/ManageBookings';
import ManageRooms from '../components/staff/ManageRooms';
import ManageServices from '../components/staff/ManageServices';
import ManageSupport from '../components/staff/ManageSupport';
import ManagePayments from '../components/staff/ManagePayments';
import ManageShifts from '../components/staff/ManageShifts';
import BookingItinerary from '../components/staff/BookingItinerary';

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Master React States for entities
  const [bookings, setBookings] = useState(initialBookings);
  const [rooms, setRooms] = useState(initialRooms);
  const [services, setServices] = useState(initialServices);
  const [complaints, setComplaints] = useState(initialComplaints);
  const [payments, setPayments] = useState(initialPayments);
  const [shiftSwapRequests, setShiftSwapRequests] = useState([]);
  const [selectedItineraryBookingId, setSelectedItineraryBookingId] = useState(null);

  // Modals visibility controller states (shared)
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showReportRoomModal, setShowReportRoomModal] = useState(false);
  const [showAddComplaintModal, setShowAddComplaintModal] = useState(false);
  const [showSwapRequestModal, setShowSwapRequestModal] = useState(false);

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

  const handleClockIn = () => {
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setClockState(prev => ({
      ...prev,
      isClockedIn: true,
      clockInTime: timeStr,
      clockOutTime: null,
      history: [`Vào ca lúc ${timeStr} ngày 25/05/2026`, ...prev.history]
    }));
    alert(`Điểm danh vào ca làm việc thành công lúc ${timeStr}! Chúc bạn làm việc hiệu quả.`);
  };

  const handleClockOut = () => {
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setClockState(prev => ({
      ...prev,
      isClockedIn: false,
      clockOutTime: timeStr,
      history: [`Ra ca lúc ${timeStr} ngày 25/05/2026 (Hoàn thành ca trực)`, ...prev.history]
    }));
    alert(`Điểm danh ra ca làm việc thành công lúc ${timeStr}! Cảm ơn bạn.`);
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
    { id: 'dashboard', label: 'Tổng Quan Ca Trực', icon: LayoutDashboard },
    { id: 'bookings', label: 'Quản Lý Đặt Phòng', icon: CalendarRange },
    { id: 'rooms', label: 'Sơ Đồ Phòng Trực', icon: Bed },
    { id: 'itinerary', label: 'Chi Tiết & Lịch Trình', icon: FileText },
    { id: 'services', label: 'Dịch Vụ Phát Sinh', icon: Flower },
    { id: 'support', label: 'Hỗ Trợ Khách Hàng', icon: MessageSquare },
    { id: 'payments', label: 'Thanh Toán & Hóa Đơn', icon: CreditCard },
    { id: 'shifts', label: 'Lịch Làm & Điểm Danh', icon: Clock }
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
        activeTab === 'dashboard' ? 'Tổng Quan Ca Làm Việc' :
        activeTab === 'bookings' ? 'Quản Lý Đơn Đặt Phòng' :
        activeTab === 'rooms' ? 'Sơ Đồ Phòng Theo Ca' :
        activeTab === 'itinerary' ? 'Chi Tiết Đặt Phòng & Lịch Trình' :
        activeTab === 'services' ? 'Xử Lý Dịch Vụ Phát Sinh' :
        activeTab === 'support' ? 'Hỗ Trợ & Tiếp Nhận Complaint' :
        activeTab === 'payments' ? 'Xác Nhận Hóa Đơn & Thanh Toán' :
        activeTab === 'shifts' ? 'Điểm Danh & Đổi Ca Trực' : 'Vận Hành Kỹ Thuật Số'
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
      {activeTab === 'dashboard' && (
        <StaffOverview
          bookings={bookings}
          rooms={rooms}
          services={services}
          complaints={complaints}
          shiftSwapRequests={shiftSwapRequests}
          setBookings={setBookings}
          setRooms={setRooms}
          setServices={setServices}
          setComplaints={setComplaints}
          setPayments={setPayments}
          setShiftSwapRequests={setShiftSwapRequests}
          clockState={clockState}
          setClockState={setClockState}
          setActiveTab={setActiveTab}
          setShowAddServiceModal={setShowAddServiceModal}
          setShowReportRoomModal={setShowReportRoomModal}
          setShowAddComplaintModal={setShowAddComplaintModal}
          setShowSwapRequestModal={setShowSwapRequestModal}
          handleCheckIn={handleCheckIn}
          handleCheckOut={handleCheckOut}
          handleClockIn={handleClockIn}
          handleClockOut={handleClockOut}
        />
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
        <ManagePayments
          payments={payments}
          setPayments={setPayments}
        />
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
    </OperationLayout>
  );
}
