import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarRange, Bed, Flower, MessageSquare,
  CreditCard, Clock, X, LogOut, Menu
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
import StaffOverview from '../components/staff/StaffOverview';
import ManageBookings from '../components/staff/ManageBookings';
import ManageRooms from '../components/staff/ManageRooms';
import ManageServices from '../components/staff/ManageServices';
import ManageSupport from '../components/staff/ManageSupport';
import ManagePayments from '../components/staff/ManagePayments';
import ManageShifts from '../components/staff/ManageShifts';

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
  const sidebarItems = [
    { id: 'dashboard', label: 'Tổng Quan Ca Trực', icon: LayoutDashboard },
    { id: 'bookings', label: 'Quản Lý Đặt Phòng', icon: CalendarRange },
    { id: 'rooms', label: 'Sơ Đồ Phòng Trực', icon: Bed },
    { id: 'services', label: 'Dịch Vụ Phát Sinh', icon: Flower },
    { id: 'support', label: 'Hỗ Trợ Khách Hàng', icon: MessageSquare },
    { id: 'payments', label: 'Thanh Toán & Hóa Đơn', icon: CreditCard },
    { id: 'shifts', label: 'Lịch Làm & Điểm Danh', icon: Clock }
  ];

  return (
    <div className="admin-theme min-h-screen bg-[#fafbfa] flex flex-col lg:flex-row antialiased text-sage-900 pt-0 relative text-left">

      {/* Mobile Top Navbar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-primary-950 text-white sticky top-0 z-40 shadow-md">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-primary-800 rounded text-white">
            <Flower className="h-4 w-4" />
          </div>
          <span className="font-serif text-sm font-normal tracking-wide">Ngũ Sơn Staff</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 focus:outline-none cursor-pointer"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-45 lg:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-primary-950 text-white flex flex-col flex-shrink-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:z-30 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-primary-850 rounded-lg text-white">
              <Flower className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-serif text-base font-normal text-white tracking-wide">Ngũ Sơn Resort</h1>
              <p className="text-[10px] text-primary-200/70 uppercase tracking-widest font-semibold">Staff Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1 text-white/70 hover:text-white hover:bg-white/10 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Staff Identity Block */}
        <div className="p-4 mx-4 my-3 bg-white/5 rounded-none flex items-center space-x-3 border border-white/10">
          <div className="h-10 w-10 rounded-none bg-primary-300 text-primary-950 font-bold flex items-center justify-center text-sm shadow-inner flex-shrink-0">
            LT
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-white truncate">Lê Thị Thu (Staff)</h4>
            <p className="text-[9px] text-primary-300 font-medium">Lễ tân trực chính</p>
          </div>
        </div>

        {/* Menu Navigation Items */}
        <nav className="flex-grow px-3 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-none text-xs font-semibold tracking-wider transition-all duration-150 cursor-pointer ${isActive
                    ? 'bg-primary-800 text-white font-bold'
                    : 'text-primary-100/70 hover:bg-primary-900 hover:text-white'
                  }`}
              >
                <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-none text-xs font-semibold text-red-200 hover:bg-red-950/40 hover:text-white transition-all duration-150 cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Area Content */}
      <main className="flex-grow flex flex-col overflow-y-auto max-h-screen p-6 lg:p-8 custom-scrollbar">
        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-primary-100 mb-6 gap-4">
          <div>
            <span className="text-xs font-bold text-primary-700 tracking-wider uppercase">Hệ Thống Vận Hành Kỹ Thuật Số</span>
            <h2 className="font-serif text-2xl lg:text-3xl font-normal text-sage-955 mt-1">
              {activeTab === 'dashboard' && 'Tổng Quan Ca Làm Việc'}
              {activeTab === 'bookings' && 'Quản Lý Đơn Đặt Phòng'}
              {activeTab === 'rooms' && 'Sơ Đồ Phòng Theo Ca'}
              {activeTab === 'services' && 'Xử Lý Dịch Vụ Phát Sinh'}
              {activeTab === 'support' && 'Hỗ Trợ & Tiếp Nhận Complaint'}
              {activeTab === 'payments' && 'Xác Nhận Hóa Đơn & Thanh Toán'}
              {activeTab === 'shifts' && 'Điểm Danh & Đổi Ca Trực'}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-primary-100/70 border border-primary-200/50 rounded-none px-4 py-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-semibold text-sage-800">Ca Trực Sáng</span>
              <span className="text-sage-400">|</span>
              <span className="font-semibold text-primary-900">
                {clockState.isClockedIn ? `Đang trực ca` : 'Chưa điểm danh vào'}
              </span>
            </div>
          </div>
        </header>

        {/* Tab panels rendering */}
        <div className="flex-grow">
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
            />
          )}

          {activeTab === 'rooms' && (
            <ManageRooms
              rooms={rooms}
              setRooms={setRooms}
              setComplaints={setComplaints}
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
        </div>
      </main>

    </div>
  );
}
