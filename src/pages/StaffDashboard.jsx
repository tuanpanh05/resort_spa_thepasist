import { useState } from 'react';
import {
  LayoutDashboard, CalendarRange, Bed, Flower, MessageSquare,
  CreditCard, Clock, Check, X, ShieldAlert, LogOut, AlertTriangle,
  Plus, Printer, RefreshCw, Send, CheckCircle2, UserCheck, Menu
} from 'lucide-react';

// ==========================================
// MOCK INITIAL DATA FOR STAFF OPERATIONAL SYSTEM
// ==========================================

const initialRooms = [
  { id: '101', type: 'Luxury Suite', status: 'occupied', floor: 1, price: '4,500,000đ', guestName: 'Trần Thị Mai' },
  { id: '102', type: 'Forest Bungalow', status: 'vacant', floor: 1, price: '3,200,000đ', guestName: '' },
  { id: '103', type: 'Garden Villa', status: 'maintenance', floor: 1, price: '5,800,000đ', guestName: '', issue: 'Hỏng vòi sen nhà tắm' },
  { id: '104', type: 'Luxury Suite', status: 'cleaning', floor: 1, price: '4,500,000đ', guestName: '' },
  { id: '201', type: 'Forest Bungalow', status: 'occupied', floor: 2, price: '3,200,000đ', guestName: 'Lê Hoàng Nam' },
  { id: '202', type: 'Forest Bungalow', status: 'occupied', floor: 2, price: '3,200,000đ', guestName: 'Nguyễn Văn Hùng' },
  { id: '203', type: 'Garden Villa', status: 'vacant', floor: 2, price: '5,800,000đ', guestName: '' },
  { id: '204', type: 'Luxury Suite', status: 'cleaning', floor: 2, price: '4,500,000đ', guestName: '' },
  { id: '301', type: 'Garden Villa', status: 'vacant', floor: 3, price: '5,800,000đ', guestName: '' },
  { id: '302', type: 'Garden Villa', status: 'occupied', floor: 3, price: '5,800,000đ', guestName: 'Vũ Đức Thành' },
  { id: '303', type: 'Luxury Suite', status: 'maintenance', floor: 3, price: '4,500,000đ', guestName: '', issue: 'Điều hòa chảy nước' },
  { id: '304', type: 'Forest Bungalow', status: 'vacant', floor: 3, price: '3,200,000đ', guestName: '' },
];

const initialBookings = [
  { id: 'BK-8902', guest: 'Trần Thị Mai', phone: '0901234567', room: '101', checkIn: '2026-05-25', status: 'Checked In', amount: '4,500,000đ', specialNotes: 'Phòng hướng biển, Check-in muộn' },
  { id: 'BK-8903', guest: 'Lê Hoàng Nam', phone: '0987654321', room: '201', checkIn: '2026-05-25', status: 'Checked In', amount: '3,200,000đ', specialNotes: 'Yêu cầu thêm giường phụ (Extra bed)' },
  { id: 'BK-8904', guest: 'Phạm Minh Tuấn', phone: '0912345678', room: 'Chưa gán', checkIn: '2026-05-26', status: 'Confirmed', amount: '5,800,000đ', specialNotes: 'Khách VIP, thích yên tĩnh' },
  { id: 'BK-8905', guest: 'Nguyễn Thanh Hương', phone: '0934567890', room: '203', checkIn: '2026-05-27', status: 'Pending', amount: '2,900,000đ', specialNotes: 'Cần xe đón tại sân bay lúc 14:00' },
  { id: 'BK-8906', guest: 'Vũ Đức Thành', phone: '0978901234', room: '302', checkIn: '2026-05-24', status: 'Checked In', amount: '6,400,000đ', specialNotes: 'Late check-out ngày 27/5' },
];

const initialServices = [
  { id: 'SO-101', room: '101', category: 'Spa booking', detail: 'Massage Đá nóng thảo dược (90 phút)', price: '1,200,000đ', status: 'In Progress', time: '14:30' },
  { id: 'SO-102', room: '201', category: 'Restaurant order', detail: 'Súp sâm yến mạch thực dưỡng & trà sen', price: '450,000đ', status: 'Pending', time: '17:45' },
  { id: 'SO-103', room: '302', category: 'Room service', detail: 'Ăn tối tại phòng: Cơm lứt muối mè & Nước ép hữu cơ', price: '320,000đ', status: 'Completed', time: '12:00' },
  { id: 'SO-104', room: '101', category: 'Laundry', detail: 'Giặt khô đầm lụa tơ tằm', price: '180,000đ', status: 'Pending', time: '09:15' },
  { id: 'SO-105', room: '201', category: 'Tour booking', detail: 'Tour ngắm hoàng hôn bán đảo Sơn Trà', price: '1,500,000đ', status: 'Completed', time: 'Thứ Hai' }
];

const initialComplaints = [
  { id: 1, guest: 'Nguyễn Văn Hùng', room: '202', content: 'Wifi trong góc phòng hơi yếu, thỉnh thoảng mất kết nối.', status: 'Open', time: '1 giờ trước', feedback: '' },
  { id: 2, guest: 'Trần Thị Mai', room: '101', content: 'Gối hơi cao, cần đổi 2 gối lông vũ mềm hơn.', status: 'Resolved', time: '3 giờ trước', feedback: 'Đã giao gối mới lúc 15:00' },
  { id: 3, guest: 'Vũ Đức Thành', room: '302', content: 'Có tiếng ồn nhỏ phát ra từ dàn lạnh điều hòa lúc đêm muộn.', status: 'Open', time: '5 giờ trước', feedback: '' }
];

const initialPayments = [
  { id: 'INV-8801', bookingId: 'BK-8902', guest: 'Trần Thị Mai', room: '101', amount: '4,500,000đ', servicesAmount: '1,200,000đ', total: '5,700,000đ', method: 'Chuyển khoản VNPAY', status: 'Paid' },
  { id: 'INV-8802', bookingId: 'BK-8903', guest: 'Lê Hoàng Nam', room: '201', amount: '3,200,000đ', servicesAmount: '450,000đ', total: '3,650,000đ', method: 'Tiền mặt', status: 'Unpaid' },
  { id: 'INV-8803', bookingId: 'BK-8906', guest: 'Vũ Đức Thành', room: '302', amount: '6,400,000đ', servicesAmount: '320,000đ', total: '6,720,000đ', method: 'Thẻ tín dụng', status: 'Paid' }
];

const initialShifts = [
  { day: 'Thứ Hai', date: '25/05', shiftName: 'Ca Sáng (06:00 - 14:00)', role: 'Lễ tân chính', status: 'Completed' },
  { day: 'Thứ Ba', date: '26/05', shiftName: 'Ca Sáng (06:00 - 14:00)', role: 'Lễ tân chính', status: 'Upcoming' },
  { day: 'Thứ Tư', date: '27/05', shiftName: 'Ca Chiều (14:00 - 22:00)', role: 'Lễ tân chính', status: 'Upcoming' },
  { day: 'Thứ Năm', date: '28/05', shiftName: 'Ca Chiều (14:00 - 22:00)', role: 'Hỗ trợ đón tiếp', status: 'Upcoming' },
  { day: 'Thứ Sáu', date: '29/05', shiftName: 'Nghỉ tuần', role: '-', status: 'Day Off' },
  { day: 'Thứ Bảy', date: '30/05', shiftName: 'Ca Sáng (06:00 - 14:00)', role: 'Lễ tân chính', status: 'Upcoming' },
  { day: 'Chủ Nhật', date: '31/05', shiftName: 'Ca Sáng (06:00 - 14:00)', role: 'Trực quầy VIP', status: 'Upcoming' }
];

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // React States for entities
  const [bookings, setBookings] = useState(initialBookings);
  const [rooms, setRooms] = useState(initialRooms);
  const [services, setServices] = useState(initialServices);
  const [complaints, setComplaints] = useState(initialComplaints);
  const [payments, setPayments] = useState(initialPayments);
  const [shiftSwapRequests, setShiftSwapRequests] = useState([]);

  // Modals controller states
  const [selectedBookingForNotes, setSelectedBookingForNotes] = useState(null);
  const [showAssignRoomModal, setShowAssignRoomModal] = useState(false);
  const [bookingToAssign, setBookingToAssign] = useState(null);
  const [showReportRoomModal, setShowReportRoomModal] = useState(false);
  const [reportRoomId, setReportRoomId] = useState('');
  const [reportIssueDetail, setReportIssueDetail] = useState('');
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddComplaintModal, setShowAddComplaintModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoicePrintModal, setShowInvoicePrintModal] = useState(false);
  const [showSwapRequestModal, setShowSwapRequestModal] = useState(false);

  // Clock Attendance States
  const [clockState, setClockState] = useState({
    isClockedIn: false,
    clockInTime: null,
    clockOutTime: null,
    history: []
  });

  // Forms inputs state
  const [notesFormValue, setNotesFormValue] = useState('');
  const [serviceOrderForm, setServiceOrderForm] = useState({ room: '102', category: 'Spa booking', detail: '', price: '' });
  const [complaintForm, setComplaintForm] = useState({ guest: '', room: '101', content: '' });
  const [swapForm, setSwapForm] = useState({ date: '2026-05-26', shiftType: 'Ca Sáng (06:00 - 14:00)', targetEmployee: '', reason: '' });

  // Quick statistical indicators
  const todayBookingsCount = bookings.length;
  const checkinsToday = bookings.filter(b => b.status === 'Checked In' && b.checkIn === '2026-05-25').length;
  const pendingServicesCount = services.filter(s => s.status === 'Pending').length;
  const vacantRoomsCount = rooms.filter(r => r.status === 'vacant').length;
  const cleaningRoomsCount = rooms.filter(r => r.status === 'cleaning').length;
  const maintenanceRoomsCount = rooms.filter(r => r.status === 'maintenance').length;
  const occupiedRoomsCount = rooms.filter(r => r.status === 'occupied').length;

  // Mock chat system
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Guest (Phòng 101)', text: 'Cho mình xin thêm 2 chai nước suối nhé lễ tân.', time: '10:15' },
    { sender: 'Lễ tân (Bạn)', text: 'Dạ vâng ạ, bộ phận buồng phòng đang mang nước lên phòng 101 ngay lập tức ạ.', time: '10:17' },
    { sender: 'Guest (Phòng 101)', text: 'Cảm ơn bạn rất nhiều!', time: '10:18' }
  ]);
  const [newChatInput, setNewChatInput] = useState('');

  // 1. Quản lý Booking / Reservation Handlers
  const handleConfirmBooking = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Confirmed' } : b));
    alert(`Đã xác nhận đặt phòng ${id}.`);
  };

  const handleCheckIn = (booking) => {
    if (booking.room === 'Chưa gán') {
      alert('Vui lòng gán phòng trước khi thực hiện Check-in!');
      setBookingToAssign(booking);
      setShowAssignRoomModal(true);
      return;
    }
    // Update booking status
    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'Checked In' } : b));
    // Update room status to occupied
    setRooms(prev => prev.map(r => r.id === booking.room ? { ...r, status: 'occupied', guestName: booking.guest } : r));
    alert(`Đã hoàn tất thủ tục Check-in cho khách ${booking.guest} vào phòng ${booking.room}.`);
  };

  const handleCheckOut = (booking) => {
    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'Checked Out' } : b));
    // Update room status to cleaning
    setRooms(prev => prev.map(r => r.id === booking.room ? { ...r, status: 'cleaning', guestName: '' } : r));

    // Auto-update or insert invoice record
    const invoiceExists = payments.find(p => p.bookingId === booking.id);
    if (invoiceExists) {
      setPayments(prev => prev.map(p => p.bookingId === booking.id ? { ...p, status: 'Paid' } : p));
    }
    alert(`Đã hoàn tất check-out phòng ${booking.room}. Phòng được đưa vào danh sách chờ dọn dẹp.`);
  };

  const handleCancelBookingBlocked = () => {
    // LOCK / BLOCKED FOR STAFF ACTION
    alert('Báo lỗi hệ thống: Bạn không có quyền HỦY ĐẶT PHÒNG! Thao tác này chỉ dành cho Admin hoặc Manager của resort.');
  };

  const handleUpdateBookingStatus = (id, newStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    alert(`Đã cập nhật trạng thái đơn đặt phòng ${id} thành "${newStatus}".`);
  };

  const openEditNotesModal = (booking) => {
    setSelectedBookingForNotes(booking);
    setNotesFormValue(booking.specialNotes || '');
  };

  const handleSaveSpecialNotes = (e) => {
    e.preventDefault();
    setBookings(prev => prev.map(b => b.id === selectedBookingForNotes.id ? { ...b, specialNotes: notesFormValue } : b));
    setSelectedBookingForNotes(null);
    alert('Đã cập nhật yêu cầu đặc biệt của khách hàng.');
  };

  // 2. Quản lý Phòng Handlers
  const handleUpdateRoomStatus = (roomId, newStatus) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: newStatus, issue: newStatus !== 'maintenance' ? '' : r.issue } : r));
  };

  const handleAssignRoomSubmit = (roomId) => {
    if (!bookingToAssign) return;
    setBookings(prev => prev.map(b => b.id === bookingToAssign.id ? { ...b, room: roomId } : b));
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, guestName: bookingToAssign.guest } : r));
    setShowAssignRoomModal(false);
    setBookingToAssign(null);
    alert(`Đã gán phòng ${roomId} thành công cho khách hàng.`);
  };

  const handleReportBrokenRoom = (e) => {
    e.preventDefault();
    if (!reportRoomId || !reportIssueDetail) {
      alert('Vui lòng điền phòng hỏng và chi tiết sự cố.');
      return;
    }
    // Set room to maintenance
    setRooms(prev => prev.map(r => r.id === reportRoomId ? { ...r, status: 'maintenance', issue: reportIssueDetail } : r));
    // Add a complaint or notification entry
    const newComplaint = {
      id: Date.now(),
      guest: 'Kỹ thuật vận hành',
      room: reportRoomId,
      content: `Báo cáo hỏng hóc: ${reportIssueDetail}`,
      status: 'Open',
      time: 'Vừa xong',
      feedback: ''
    };
    setComplaints(prev => [newComplaint, ...prev]);
    setShowReportRoomModal(false);
    setReportRoomId('');
    setReportIssueDetail('');
    alert(`Đã báo cáo phòng hỏng ${reportRoomId} thành công cho kỹ thuật bộ phận.`);
  };

  // 3. Dịch vụ Resort Handlers
  const handleCreateServiceOrder = (e) => {
    e.preventDefault();
    if (!serviceOrderForm.detail || !serviceOrderForm.price) {
      alert('Vui lòng điền mô tả dịch vụ và đơn giá.');
      return;
    }
    const newOrder = {
      id: `SO-${Math.floor(100 + Math.random() * 900)}`,
      ...serviceOrderForm,
      status: 'Pending',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    setServices(prev => [newOrder, ...prev]);
    setShowAddServiceModal(false);
    setServiceOrderForm({ room: '102', category: 'Spa booking', detail: '', price: '' });
    alert(`Đã khởi tạo yêu cầu dịch vụ ${newOrder.id} cho phòng ${newOrder.room}.`);
  };

  const handleUpdateServiceStatus = (id, newStatus) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  // 4. Hỗ trợ khách hàng Handlers
  const handleAddComplaint = (e) => {
    e.preventDefault();
    if (!complaintForm.guest || !complaintForm.content) {
      alert('Vui lòng nhập tên khách và nội dung phàn hồi.');
      return;
    }
    const newComp = {
      id: Date.now(),
      guest: complaintForm.guest,
      room: complaintForm.room,
      content: complaintForm.content,
      status: 'Open',
      time: 'Vừa xong',
      feedback: ''
    };
    setComplaints(prev => [newComp, ...prev]);
    setShowAddComplaintModal(false);
    setComplaintForm({ guest: '', room: '101', content: '' });
    alert('Đã ghi nhận yêu cầu / khiếu nại của khách hàng.');
  };

  const handleResolveComplaint = (id, responseText) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'Resolved', feedback: responseText || 'Đã xử lý xong' } : c));
    alert('Đã cập nhật trạng thái khiếu nại thành "Đã giải quyết".');
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!newChatInput.trim()) return;
    const newMessage = {
      sender: 'Lễ tân (Bạn)',
      text: newChatInput,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMessage]);
    setNewChatInput('');

    // Quick automated reply bot
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        sender: 'Hệ thống hỗ trợ',
        text: 'Tin nhắn hỗ trợ của bạn đã được ghi nhận vào hệ thống liên lạc.',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  // 5. Thanh toán & Invoice Handlers
  const handleConfirmCashPayment = (invoiceId) => {
    setPayments(prev => prev.map(p => p.id === invoiceId ? { ...p, status: 'Paid', method: 'Tiền mặt tại quầy' } : p));
    alert(`Đã xác nhận thanh toán tiền mặt cho hóa đơn ${invoiceId}.`);
  };

  const handlePrintInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoicePrintModal(true);
  };

  const handleEditPaymentBlocked = () => {
    // LOCK / BLOCKED FOR STAFF ACTION
    alert('Báo lỗi bảo mật: Bạn KHÔNG ĐƯỢC PHÉP chỉnh sửa hoặc cập nhật lịch sử giao dịch thanh toán! Chỉ Admin hoặc Kế toán trưởng được thao tác sửa số liệu.');
  };

  // 6. Lịch làm việc & Điểm danh ca
  const handleClockIn = () => {
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setClockState(prev => ({
      ...prev,
      isClockedIn: true,
      clockInTime: timeStr,
      clockOutTime: null,
      history: [`Vào ca lúc ${timeStr} ngày 25/05/2026`, ...prev.history]
    }));
    alert(`Điểm danh vào ca làm việc thành công lúc ${timeStr}! Chúc bạn một ngày làm việc hiệu quả.`);
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

  const handleSwapShiftSubmit = (e) => {
    e.preventDefault();
    if (!swapForm.targetEmployee || !swapForm.reason) {
      alert('Vui lòng điền nhân viên muốn đổi và lý do.');
      return;
    }
    const newReq = {
      id: Date.now(),
      ...swapForm,
      status: 'Chờ duyệt',
      requestedTime: 'Vừa xong'
    };
    setShiftSwapRequests(prev => [newReq, ...prev]);
    setShowSwapRequestModal(false);
    setSwapForm({ date: '2026-05-26', shiftType: 'Ca Sáng (06:00 - 14:00)', targetEmployee: '', reason: '' });
    alert('Yêu cầu đổi ca làm việc đã được chuyển tới quản lý phê duyệt.');
  };

  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống nhân viên?')) {
      window.location.href = '/dang-nhap';
    }
  };

  return (
    <div className="admin-theme min-h-screen bg-[#fafbfa] flex flex-col lg:flex-row antialiased text-sage-900 pt-0 relative">

      {/* Mobile Top Navbar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#1a2e05] text-white sticky top-0 z-40 shadow-md">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-primary-200 rounded text-primary-950">
            <Flower className="h-4 w-4" />
          </div>
          <span className="font-serif text-sm font-bold tracking-wide">Ngũ Sơn Staff</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 focus:outline-none cursor-pointer"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Mobile Sidebar overlay/backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-45 lg:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ==========================================
          SIDEBAR NAVIGATION (Drawer on Mobile, Static on Desktop)
          ========================================== */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#1a2e05] text-white flex flex-col flex-shrink-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:z-30 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Sidebar Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-primary-200 rounded-lg text-primary-950">
              <Flower className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-white tracking-wide">Ngũ Sơn Resort</h1>
              <p className="text-[10px] text-primary-200/70 uppercase tracking-widest font-semibold">Staff Dashboard</p>
            </div>
          </div>
          {/* Close menu button on mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1 text-white/70 hover:text-white hover:bg-white/10 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Staff Identity Block */}
        <div className="p-4 mx-4 my-3 bg-white/5 rounded-2xl flex items-center space-x-3 border border-white/10">
          <div className="h-10 w-10 rounded-full bg-primary-300 text-primary-950 font-bold flex items-center justify-center text-sm shadow-inner flex-shrink-0">
            LT
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-white truncate">Lê Thị Thu (Staff)</h4>
            <p className="text-[9px] text-primary-300 font-medium">Bản lễ tân trực chính</p>
          </div>
        </div>

        {/* Menu Navigation Items */}
        <nav className="flex-grow px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          <button
            onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${activeTab === 'dashboard' ? 'bg-primary-200 text-primary-950 shadow-md' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard className="h-4.5 w-4.5 flex-shrink-0" />
            <span>Tổng Quan Ca Trực</span>
          </button>

          <button
            onClick={() => { setActiveTab('bookings'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${activeTab === 'bookings' ? 'bg-primary-200 text-primary-950 shadow-md' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
          >
            <CalendarRange className="h-4.5 w-4.5 flex-shrink-0" />
            <span>Quản Lý Đặt Phòng</span>
          </button>

          <button
            onClick={() => { setActiveTab('rooms'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${activeTab === 'rooms' ? 'bg-primary-200 text-primary-950 shadow-md' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
          >
            <Bed className="h-4.5 w-4.5 flex-shrink-0" />
            <span>Sơ Đồ Phòng Trực</span>
          </button>

          <button
            onClick={() => { setActiveTab('services'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${activeTab === 'services' ? 'bg-primary-200 text-primary-950 shadow-md' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
          >
            <Flower className="h-4.5 w-4.5 flex-shrink-0" />
            <span>Dịch Vụ Phát Sinh</span>
          </button>

          <button
            onClick={() => { setActiveTab('support'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${activeTab === 'support' ? 'bg-primary-200 text-primary-950 shadow-md' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
          >
            <MessageSquare className="h-4.5 w-4.5 flex-shrink-0" />
            <span>Hỗ Trợ Khách Hàng</span>
          </button>

          <button
            onClick={() => { setActiveTab('payments'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${activeTab === 'payments' ? 'bg-primary-200 text-primary-950 shadow-md' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
          >
            <CreditCard className="h-4.5 w-4.5 flex-shrink-0" />
            <span>Thanh Toán & Hóa Đơn</span>
          </button>

          <button
            onClick={() => { setActiveTab('shifts'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${activeTab === 'shifts' ? 'bg-primary-200 text-primary-950 shadow-md' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
          >
            <Clock className="h-4.5 w-4.5 flex-shrink-0" />
            <span>Lịch Làm & Điểm Danh</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold text-red-200 hover:bg-red-950/40 hover:text-white transition-all duration-150 cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* ==========================================
          MAIN AREA CONTENT
          ========================================== */}
      <main className="flex-grow flex flex-col overflow-y-auto max-h-screen p-6 lg:p-8 custom-scrollbar">

        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-primary-100 mb-6 gap-4">
          <div>
            <span className="text-xs font-bold text-primary-700 tracking-wider uppercase">Hệ Thống Vận Hành Kỹ Thuật Số</span>
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-sage-900 mt-1">
              {activeTab === 'dashboard' && 'Tổng Quan Ca Làm Việc'}
              {activeTab === 'bookings' && 'Quản Lý Đơn Đặt Phòng'}
              {activeTab === 'rooms' && 'Sơ Đồ Phòng Theo Ca'}
              {activeTab === 'services' && 'Xử Lý Dịch Vụ Phát Sinh'}
              {activeTab === 'support' && 'Hỗ Trợ & Tiếp Nhận Complaint'}
              {activeTab === 'payments' && 'Xác Nhận Hóa Đơn & Thanh Toán'}
              {activeTab === 'shifts' && 'Điểm Danh & Đổi Ca Trực'}
            </h2>
          </div>

          {/* Quick Info widgets */}
          <div className="flex items-center space-x-3">
            {/* Quick Attendance Widget in Header */}
            <div className="flex items-center space-x-2 bg-primary-100/70 border border-primary-200/50 rounded-2xl px-4 py-2 text-xs">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="font-semibold text-sage-800">
                Ca Trực Sáng
              </span>
              <span className="text-sage-400">|</span>
              <span className="font-medium text-primary-900">
                {clockState.isClockedIn ? `Đã điểm danh vào` : 'Chưa điểm danh vào'}
              </span>
            </div>
          </div>
        </header>

        {/* ==========================================
            TAB 1: BASIC DASHBOARD (STAFF OPERATIONAL OVERVIEW)
            ========================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

              <div className="bg-white rounded-3xl p-5 border border-primary-100 shadow-sm flex items-center space-x-4">
                <div className="p-3.5 bg-blue-50 text-blue-700 rounded-2xl">
                  <CalendarRange className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-sage-500 font-bold uppercase tracking-wider">Đặt phòng</p>
                  <h3 className="text-xl font-bold text-sage-900 mt-1">{todayBookingsCount}</h3>
                  <span className="text-[9px] text-sage-400">Đơn phòng tổng ca</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-primary-100 shadow-sm flex items-center space-x-4">
                <div className="p-3.5 bg-green-50 text-green-700 rounded-2xl">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-sage-500 font-bold uppercase tracking-wider">Lượt Check-in</p>
                  <h3 className="text-xl font-bold text-sage-900 mt-1">{checkinsToday}</h3>
                  <span className="text-[9px] text-green-600 font-semibold">Hôm nay</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-primary-100 shadow-sm flex items-center space-x-4">
                <div className="p-3.5 bg-orange-50 text-orange-700 rounded-2xl">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-sage-500 font-bold uppercase tracking-wider">Yêu cầu DV</p>
                  <h3 className="text-xl font-bold text-sage-900 mt-1">{pendingServicesCount}</h3>
                  <span className="text-[9px] text-orange-600 font-medium">Đang chờ xử lý</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-primary-100 shadow-sm flex items-center space-x-4">
                <div className="p-3.5 bg-primary-100 text-primary-900 rounded-2xl">
                  <Bed className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-sage-500 font-bold uppercase tracking-wider">Phòng Trống</p>
                  <h3 className="text-xl font-bold text-sage-900 mt-1">{vacantRoomsCount}</h3>
                  <span className="text-[9px] text-primary-700 font-medium">{occupiedRoomsCount} phòng đang ở</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-primary-100 shadow-sm flex items-center space-x-4">
                <div className="p-3.5 bg-yellow-50 text-yellow-700 rounded-2xl">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-sage-500 font-bold uppercase tracking-wider">Bảo Trì / Dọn</p>
                  <h3 className="text-xl font-bold text-sage-900 mt-1">{maintenanceRoomsCount + cleaningRoomsCount}</h3>
                  <span className="text-[9px] text-yellow-600 font-medium">{maintenanceRoomsCount} hỏng, {cleaningRoomsCount} cần dọn</span>
                </div>
              </div>
            </div>

            {/* Dashboard content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Daily Tasks Check-in / Check-out checklist */}
              <div className="lg:col-span-2 bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-serif text-lg font-bold text-sage-900">Danh Sách Check-in / Check-out Hôm Nay</h3>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs font-semibold text-primary-800 hover:underline flex items-center space-x-1"
                  >
                    <span>Xem tất cả đơn</span>
                    <span>&rarr;</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-primary-100 text-sage-500 font-bold">
                        <th className="pb-3">Mã đơn</th>
                        <th className="pb-3">Khách hàng</th>
                        <th className="pb-3">Gợi ý phòng</th>
                        <th className="pb-3">Ngày đến</th>
                        <th className="pb-3">Trạng thái</th>
                        <th className="pb-3 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-50/50">
                      {bookings.slice(0, 4).map((b) => (
                        <tr key={b.id} className="hover:bg-primary-50/20">
                          <td className="py-3 font-semibold text-primary-950">{b.id}</td>
                          <td className="py-3 font-medium text-sage-950">
                            <div>{b.guest}</div>
                            <div className="text-[10px] text-sage-400">{b.phone}</div>
                          </td>
                          <td className="py-3">
                            <span className={`px-2.5 py-1 rounded-full font-bold ${b.room === 'Chưa gán' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-primary-100 text-primary-900'}`}>
                              Phòng {b.room}
                            </span>
                          </td>
                          <td className="py-3 text-sage-600">{b.checkIn}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${b.status === 'Checked In' ? 'bg-green-100 text-green-700' :
                                b.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                              }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {b.status === 'Confirmed' && (
                              <button
                                onClick={() => handleCheckIn(b)}
                                className="px-3 py-1 bg-green-900 hover:bg-green-800 text-white rounded-lg font-bold text-[10px]"
                              >
                                Check-in
                              </button>
                            )}
                            {b.status === 'Checked In' && (
                              <button
                                onClick={() => handleCheckOut(b)}
                                className="px-3 py-1 bg-primary-900 hover:bg-primary-850 text-white rounded-lg font-bold text-[10px]"
                              >
                                Check-out
                              </button>
                            )}
                            {b.status === 'Checked Out' && (
                              <span className="text-sage-400 font-semibold italic text-[10px]">Hoàn thành</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-sage-900 mb-4">Thao Tác Nhanh Theo Ca</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => {
                        setServiceOrderForm({ room: '101', category: 'Room service', detail: '', price: '' });
                        setShowAddServiceModal(true);
                      }}
                      className="w-full flex items-center justify-between p-3.5 bg-primary-50/50 hover:bg-primary-50 border border-primary-100 rounded-2xl text-left text-xs font-semibold text-primary-950 transition-colors"
                    >
                      <span className="flex items-center space-x-2.5">
                        <Flower className="h-4.5 w-4.5 text-primary-900" />
                        <span>Order Dịch Vụ Mới Cho Khách</span>
                      </span>
                      <Plus className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setShowReportRoomModal(true)}
                      className="w-full flex items-center justify-between p-3.5 bg-red-50/40 hover:bg-red-50 border border-red-100 rounded-2xl text-left text-xs font-semibold text-red-950 transition-colors"
                    >
                      <span className="flex items-center space-x-2.5">
                        <AlertTriangle className="h-4.5 w-4.5 text-red-700" />
                        <span>Báo Cáo Phòng Hỏng Cần Sửa</span>
                      </span>
                      <Plus className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => {
                        // Open support / complaint form
                        setShowAddComplaintModal(true);
                      }}
                      className="w-full flex items-center justify-between p-3.5 bg-blue-50/40 hover:bg-blue-50 border border-blue-100 rounded-2xl text-left text-xs font-semibold text-blue-950 transition-colors"
                    >
                      <span className="flex items-center space-x-2.5">
                        <MessageSquare className="h-4.5 w-4.5 text-blue-700" />
                        <span>Tiếp Nhận Ý Kiến / Phàn Nàn</span>
                      </span>
                      <Plus className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setShowSwapRequestModal(true)}
                      className="w-full flex items-center justify-between p-3.5 bg-yellow-50/40 hover:bg-yellow-50 border border-yellow-100 rounded-2xl text-left text-xs font-semibold text-yellow-950 transition-colors"
                    >
                      <span className="flex items-center space-x-2.5">
                        <Clock className="h-4.5 w-4.5 text-yellow-700" />
                        <span>Đăng Ký Đổi Ca Trực Trình Admin</span>
                      </span>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Clock-in panel inside dashboard */}
                <div className="mt-6 pt-6 border-t border-primary-50">
                  <div className="bg-[#1a2e05]/5 p-4 rounded-2xl border border-primary-100 text-xs">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-primary-900">Điểm danh ca hôm nay</span>
                      <span className="text-[10px] text-sage-400">25/05/2026</span>
                    </div>
                    {!clockState.isClockedIn ? (
                      <button
                        onClick={handleClockIn}
                        className="w-full py-2.5 bg-primary-900 hover:bg-primary-850 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-sm"
                      >
                        <Clock className="h-4 w-4" />
                        <span>VÀO CA (CLOCK IN)</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleClockOut}
                        className="w-full py-2.5 bg-red-950 hover:bg-red-900 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-sm"
                      >
                        <Clock className="h-4 w-4" />
                        <span>RA CA (CLOCK OUT)</span>
                      </button>
                    )}
                    {clockState.isClockedIn && (
                      <p className="text-[10px] text-green-700 font-semibold mt-2 text-center">
                        ✓ Bạn đã vào ca trực từ {clockState.clockInTime}
                      </p>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Services Pending Execution & Live Complaints */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Service Requests */}
              <div className="bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-serif text-lg font-bold text-sage-900">Yêu Cầu Dịch Vụ Mới Phát Sinh</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold text-[10px]">
                    {pendingServicesCount} Đang chờ
                  </span>
                </div>
                <div className="space-y-3">
                  {services.filter(s => s.status !== 'Completed').slice(0, 3).map(s => (
                    <div key={s.id} className="flex justify-between items-center p-3.5 bg-primary-50/30 border border-primary-100/50 rounded-2xl">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-primary-950">Phòng {s.room}</span>
                          <span className="text-[10px] bg-primary-100 text-primary-900 px-2 py-0.2 rounded font-semibold">{s.category}</span>
                        </div>
                        <p className="text-xs text-sage-700 mt-1">{s.detail}</p>
                        <span className="text-[10px] text-sage-400">Yêu cầu lúc: {s.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {s.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateServiceStatus(s.id, 'In Progress')}
                            className="px-2.5 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold text-[10px]"
                          >
                            Thực hiện
                          </button>
                        )}
                        {s.status === 'In Progress' && (
                          <button
                            onClick={() => handleUpdateServiceStatus(s.id, 'Completed')}
                            className="px-2.5 py-1 bg-green-950 hover:bg-green-900 text-white rounded-lg font-bold text-[10px]"
                          >
                            Hoàn tất
                          </button>
                        )}
                        <span className="text-xs font-bold text-sage-900 ml-2">{s.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer complaints and support feedback */}
              <div className="bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-serif text-lg font-bold text-sage-900">Khiếu Nại & Phản Hồi Từ Khách</h3>
                  <button
                    onClick={() => setActiveTab('support')}
                    className="text-xs font-semibold text-primary-800 hover:underline"
                  >
                    Mở cổng hỗ trợ
                  </button>
                </div>
                <div className="space-y-3">
                  {complaints.slice(0, 3).map(c => (
                    <div key={c.id} className="p-3.5 bg-red-50/20 border border-red-100/50 rounded-2xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-xs text-sage-900">Khách: {c.guest} (Phòng {c.room})</span>
                          <span className="text-[10px] text-sage-400 block">{c.time}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${c.status === 'Open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {c.status === 'Open' ? 'Chưa giải quyết' : 'Đã xử lý'}
                        </span>
                      </div>
                      <p className="text-xs text-sage-700 mt-2 italic font-light">"{c.content}"</p>
                      {c.status === 'Open' ? (
                        <div className="mt-2.5 flex space-x-2">
                          <input
                            type="text"
                            placeholder="Ghi chú phản hồi xử lý..."
                            id={`comp-reply-${c.id}`}
                            className="flex-grow px-3 py-1 text-xs border border-primary-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary-900"
                          />
                          <button
                            onClick={() => {
                              const val = document.getElementById(`comp-reply-${c.id}`).value;
                              handleResolveComplaint(c.id, val);
                            }}
                            className="px-3 py-1 bg-primary-900 text-white rounded-lg text-[10px] font-bold"
                          >
                            Xác nhận
                          </button>
                        </div>
                      ) : (
                        <p className="text-[10px] text-sage-500 mt-2 font-medium bg-green-50/50 p-2 rounded">
                          Phản hồi: {c.feedback}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: BOOKING MANAGEMENT
            ========================================== */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter and stats row */}
            <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-sage-500 uppercase mr-2">Trạng thái lọc:</span>
                <button className="px-3.5 py-1.5 bg-primary-900 text-white text-xs font-bold rounded-xl shadow-sm">Tất cả đặt phòng</button>
                <button className="px-3.5 py-1.5 bg-primary-50 text-sage-700 hover:bg-primary-100 text-xs font-bold rounded-xl">Chờ xác nhận (Pending)</button>
                <button className="px-3.5 py-1.5 bg-primary-50 text-sage-700 hover:bg-primary-100 text-xs font-bold rounded-xl">Đã Checked In</button>
              </div>

              {/* Action error check details */}
              <div className="text-[10px] text-red-700 font-semibold bg-red-50 border border-red-100 rounded-xl px-4 py-2 flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 text-red-600" />
                <span>Nhân viên bị chặn thao tác: HỦY ĐƠN HÀNG (chỉ xem hoặc báo admin).</span>
              </div>
            </div>

            {/* Bookings List Layout */}
            <div className="bg-white border border-primary-100 rounded-[32px] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-primary-50">
                <h3 className="font-serif text-lg font-bold text-sage-900">Danh Sách Toàn Bộ Lịch Đặt Phòng Trong Kỳ</h3>
              </div>

              {/* Desktop view table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-primary-50/50 text-sage-600 font-bold border-b border-primary-100">
                      <th className="p-4">Mã Booking</th>
                      <th className="p-4">Khách hàng</th>
                      <th className="p-4">Thông tin phòng</th>
                      <th className="p-4">Ngày nhận phòng</th>
                      <th className="p-4">Yêu cầu đặc biệt (Notes)</th>
                      <th className="p-4">Giá tiền</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-center">Hành động tác nghiệp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-50/50">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-primary-50/10">
                        <td className="p-4 font-bold text-primary-950">{b.id}</td>
                        <td className="p-4 font-semibold text-sage-950">
                          <div>{b.guest}</div>
                          <div className="text-[10px] font-normal text-sage-500">{b.phone}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full font-bold ${b.room === 'Chưa gán' ? 'bg-yellow-100 text-yellow-800' : 'bg-primary-100 text-primary-900'}`}>
                            {b.room === 'Chưa gán' ? 'Chưa gán phòng' : `Phòng ${b.room}`}
                          </span>
                          {b.room === 'Chưa gán' && (
                            <button
                              onClick={() => {
                                setBookingToAssign(b);
                                setShowAssignRoomModal(true);
                              }}
                              className="block text-[10px] text-primary-700 hover:underline mt-1 font-bold cursor-pointer"
                            >
                              Gán phòng ngay &rarr;
                            </button>
                          )}
                        </td>
                        <td className="p-4 text-sage-600 font-medium">{b.checkIn}</td>
                        <td className="p-4 font-light text-sage-700 max-w-xs">
                          {b.specialNotes ? (
                            <div className="bg-primary-50/40 p-2 rounded-xl border border-primary-100/50 text-[10px] relative group">
                              <span>{b.specialNotes}</span>
                              <button
                                onClick={() => openEditNotesModal(b)}
                                className="block text-primary-850 hover:underline text-[9px] font-semibold mt-1 cursor-pointer"
                              >
                                Sửa ghi chú
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => openEditNotesModal(b)}
                              className="text-[10px] text-sage-400 hover:text-primary-900 flex items-center space-x-1 cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Thêm ghi chú đặc biệt</span>
                            </button>
                          )}
                        </td>
                        <td className="p-4 font-bold text-sage-900">{b.amount}</td>
                        <td className="p-4">
                          <select
                            value={b.status}
                            onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                            className="bg-primary-50 border border-primary-100 text-sage-800 rounded px-2 py-1 text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-primary-900 cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Checked In">Checked In</option>
                            <option value="Checked Out">Checked Out</option>
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {b.status === 'Pending' && (
                              <button
                                onClick={() => handleConfirmBooking(b.id)}
                                className="px-2.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Xác nhận
                              </button>
                            )}

                            {b.status === 'Confirmed' && (
                              <button
                                onClick={() => handleCheckIn(b)}
                                className="px-2.5 py-1.5 bg-green-950 hover:bg-green-900 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Check-in
                              </button>
                            )}

                            {b.status === 'Checked In' && (
                              <button
                                onClick={() => handleCheckOut(b)}
                                className="px-2.5 py-1.5 bg-primary-900 hover:bg-primary-850 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Check-out
                              </button>
                            )}

                            <button
                              onClick={handleCancelBookingBlocked}
                              className="px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Hủy đơn
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="block lg:hidden space-y-4 p-4 bg-primary-50/5">
                {bookings.map((b) => (
                  <div key={b.id} className="p-4 bg-white border border-primary-100 rounded-2xl space-y-3 shadow-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-primary-950">{b.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${b.status === 'Checked In' ? 'bg-green-100 text-green-700' :
                          b.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[9px] text-sage-500 font-bold block uppercase tracking-wider">Khách hàng</span>
                        <span className="font-semibold text-sage-950 block truncate">{b.guest}</span>
                        <span className="text-[10px] text-sage-400 block">{b.phone}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-sage-500 font-bold block uppercase tracking-wider">Phòng gán</span>
                        <span className="font-semibold text-sage-950 block mt-0.5">
                          {b.room === 'Chưa gán' ? (
                            <button
                              onClick={() => {
                                setBookingToAssign(b);
                                setShowAssignRoomModal(true);
                              }}
                              className="text-[10px] text-primary-700 hover:underline font-bold"
                            >
                              Gán phòng &rarr;
                            </button>
                          ) : (
                            <span className="bg-primary-100 text-primary-900 px-2 py-0.5 rounded font-bold text-[10px]">
                              Phòng {b.room}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-[9px] text-sage-500 font-bold block uppercase tracking-wider">Ngày đến</span>
                        <span className="text-sage-700">{b.checkIn}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-sage-500 font-bold block uppercase tracking-wider">Tổng tiền</span>
                        <span className="font-bold text-primary-950">{b.amount}</span>
                      </div>
                    </div>

                    {b.specialNotes ? (
                      <div className="p-2.5 bg-primary-50/40 border border-primary-100/50 rounded-xl text-[10px] text-sage-700">
                        <span className="font-semibold block text-primary-900 text-[9px] uppercase tracking-wider">Ghi chú đặc biệt:</span>
                        {b.specialNotes}
                      </div>
                    ) : null}

                    <div className="pt-3 border-t border-primary-50 flex items-center justify-between gap-2 flex-wrap">
                      <button
                        onClick={() => openEditNotesModal(b)}
                        className="px-3.5 py-2 bg-primary-50 hover:bg-primary-100 text-primary-950 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Ghi chú
                      </button>

                      <div className="flex gap-2">
                        {b.status === 'Pending' && (
                          <button
                            onClick={() => handleConfirmBooking(b.id)}
                            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                          >
                            Xác nhận
                          </button>
                        )}
                        {b.status === 'Confirmed' && (
                          <button
                            onClick={() => handleCheckIn(b)}
                            className="px-4 py-2 bg-green-950 hover:bg-green-900 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                          >
                            Check-in
                          </button>
                        )}
                        {b.status === 'Checked In' && (
                          <button
                            onClick={() => handleCheckOut(b)}
                            className="px-4 py-2 bg-primary-900 hover:bg-primary-850 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                          >
                            Check-out
                          </button>
                        )}
                        <button
                          onClick={handleCancelBookingBlocked}
                          className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: ROOM MANAGEMENT (SƠ ĐỒ PHÒNG)
            ========================================== */}
        {activeTab === 'rooms' && (
          <div className="space-y-6 animate-fade-in">
            {/* Status explanation */}
            <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                <span className="text-sage-500 uppercase">Chú giải trạng thái phòng:</span>
                <span className="flex items-center space-x-1.5">
                  <span className="h-3.5 w-3.5 rounded bg-green-100 border border-green-300 block" />
                  <span className="text-green-800">Trống (Available)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="h-3.5 w-3.5 rounded bg-blue-100 border border-blue-300 block" />
                  <span className="text-blue-800">Đang ở (Occupied)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="h-3.5 w-3.5 rounded bg-orange-100 border border-orange-300 block" />
                  <span className="text-orange-800">Đang dọn dẹp (Cleaning)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="h-3.5 w-3.5 rounded bg-red-100 border border-red-300 block" />
                  <span className="text-red-800">Bảo trì (Maintenance)</span>
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowReportRoomModal(true)}
                  className="px-4 py-2 bg-red-950 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 hover:bg-red-900 transition-colors"
                >
                  <AlertTriangle className="h-4.5 w-4.5" />
                  <span>Báo hỏng phòng</span>
                </button>
              </div>
            </div>

            {/* Room Layout Grid */}
            <div className="bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-sage-900 mb-6">Sơ Đồ Phòng Resort Theo Tầng</h3>

              <div className="space-y-8">
                {/* Loop floors */}
                {[1, 2, 3].map(floor => (
                  <div key={floor} className="space-y-3">
                    <h4 className="text-xs font-bold text-sage-500 uppercase tracking-widest pl-1 border-l-2 border-primary-900">
                      TẦNG {floor}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {rooms.filter(r => r.floor === floor).map(r => (
                        <div
                          key={r.id}
                          className={`p-5 rounded-2xl border transition-all duration-200 shadow-sm relative flex flex-col justify-between h-40 ${r.status === 'vacant' ? 'bg-green-50/50 border-green-200 hover:border-green-400' :
                              r.status === 'occupied' ? 'bg-blue-50/50 border-blue-200 hover:border-blue-400' :
                                r.status === 'cleaning' ? 'bg-orange-50/50 border-orange-200 hover:border-orange-400' :
                                  'bg-red-50/50 border-red-200 hover:border-red-400'
                            }`}
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="font-serif text-xl font-bold text-sage-950">Phòng {r.id}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${r.status === 'vacant' ? 'bg-green-100 text-green-800' :
                                  r.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                                    r.status === 'cleaning' ? 'bg-orange-100 text-orange-800' :
                                      'bg-red-100 text-red-800'
                                }`}>
                                {r.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-sage-500 font-medium mt-1">{r.type}</p>

                            {/* Guest details if occupied */}
                            {r.status === 'occupied' && (
                              <p className="text-[11px] text-sage-900 font-semibold mt-2.5 bg-blue-100/30 p-1.5 rounded-lg">
                                Khách: {r.guestName}
                              </p>
                            )}

                            {/* Issue details if maintenance */}
                            {r.status === 'maintenance' && (
                              <p className="text-[10px] text-red-700 font-semibold mt-2.5 bg-red-100/30 p-1.5 rounded-lg flex items-center space-x-1">
                                <AlertTriangle className="h-3 w-3 text-red-600" />
                                <span className="truncate">{r.issue}</span>
                              </p>
                            )}
                          </div>

                          <div className="pt-3 border-t border-primary-50 flex items-center justify-between mt-auto">
                            {/* Dropdown status update for staff */}
                            <select
                              value={r.status}
                              onChange={(e) => handleUpdateRoomStatus(r.id, e.target.value)}
                              className="bg-white border border-primary-100 text-sage-700 rounded px-1.5 py-0.5 text-[9px] focus:outline-none"
                            >
                              <option value="vacant">Có sẵn (Vacant)</option>
                              <option value="occupied">Đang ở (Occupied)</option>
                              <option value="cleaning">Đang dọn (Cleaning)</option>
                              <option value="maintenance">Bảo trì (Maintenance)</option>
                            </select>

                            {/* Assign or Detail trigger */}
                            {r.status === 'vacant' && (
                              <button
                                onClick={() => {
                                  // Open assign modal for this room
                                  const unassigned = bookings.find(b => b.room === 'Chưa gán');
                                  if (unassigned) {
                                    setBookingToAssign(unassigned);
                                    handleAssignRoomSubmit(r.id);
                                  } else {
                                    alert('Hiện không có đơn đặt phòng nào chưa gán phòng.');
                                  }
                                }}
                                className="text-[9px] bg-primary-900 text-white hover:bg-primary-850 px-2 py-0.5 rounded font-bold"
                              >
                                Gán phòng nhanh
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: RESORT SERVICES
            ========================================== */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-fade-in">
            {/* Create new service button */}
            <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-sm flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-sm text-sage-900">Danh Sách Hóa Đơn Dịch Vụ Theo Ca</h3>
                <p className="text-xs text-sage-500 mt-0.5 font-light">Thêm, theo dõi trạng thái các dịch vụ phát sinh (Spa, giặt là, xe cộ, nhà hàng) của khách hàng.</p>
              </div>

              <button
                onClick={() => setShowAddServiceModal(true)}
                className="px-4 py-2.5 bg-primary-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 hover:bg-primary-850 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Thêm service order</span>
              </button>
            </div>

            {/* Active service orders grid */}
            <div className="bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm">
              {/* Desktop view table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-primary-100 text-sage-500 font-bold">
                      <th className="pb-3">Mã đơn dịch vụ</th>
                      <th className="pb-3">Phòng</th>
                      <th className="pb-3">Loại dịch vụ</th>
                      <th className="pb-3">Chi tiết nội dung</th>
                      <th className="pb-3">Đơn giá</th>
                      <th className="pb-3">Giờ yêu cầu</th>
                      <th className="pb-3">Trạng thái thực thi</th>
                      <th className="pb-3 text-right">Cập nhật</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-50/50">
                    {services.map(s => (
                      <tr key={s.id} className="hover:bg-primary-50/10">
                        <td className="py-4 font-bold text-primary-950">{s.id}</td>
                        <td className="py-4 font-semibold">Phòng {s.room}</td>
                        <td className="py-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-100 text-primary-900">
                            {s.category}
                          </span>
                        </td>
                        <td className="py-4 text-sage-700 max-w-xs">{s.detail}</td>
                        <td className="py-4 font-bold text-sage-900">{s.price}</td>
                        <td className="py-4 text-sage-500">{s.time}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${s.status === 'Completed' ? 'bg-green-100 text-green-700' :
                              s.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {s.status === 'Pending' && (
                              <button
                                onClick={() => handleUpdateServiceStatus(s.id, 'In Progress')}
                                className="px-2.5 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Đang làm
                              </button>
                            )}
                            {s.status === 'In Progress' && (
                              <button
                                onClick={() => handleUpdateServiceStatus(s.id, 'Completed')}
                                className="px-2.5 py-1 bg-green-950 hover:bg-green-900 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Hoàn tất
                              </button>
                            )}
                            {s.status !== 'Completed' && (
                              <button
                                onClick={() => handleUpdateServiceStatus(s.id, 'Cancelled')}
                                className="px-2 py-1 text-red-700 hover:bg-red-50 rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Hủy
                              </button>
                            )}
                            {s.status === 'Completed' && (
                              <span className="text-sage-400 font-semibold italic text-[10px] pr-2">Đã bàn giao</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="block lg:hidden space-y-4">
                {services.map(s => (
                  <div key={s.id} className="p-4 bg-primary-50/10 border border-primary-100 rounded-2xl space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary-950">{s.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${s.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          s.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {s.status}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sage-950">Phòng {s.room}</span>
                        <span className="px-2 py-0.2 bg-primary-100 text-primary-900 rounded font-semibold text-[9px]">{s.category}</span>
                      </div>
                      <p className="text-sage-700 mt-1.5 font-light">{s.detail}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2.5 border-t border-primary-50">
                      <span className="font-bold text-primary-950">{s.price} <span className="text-[10px] font-light text-sage-400">({s.time})</span></span>

                      <div className="flex space-x-1.5">
                        {s.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateServiceStatus(s.id, 'In Progress')}
                            className="px-3.5 py-1.5 bg-yellow-600 hover:bg-yellow-755 text-white rounded-xl font-bold text-xs cursor-pointer"
                          >
                            Đang làm
                          </button>
                        )}
                        {s.status === 'In Progress' && (
                          <button
                            onClick={() => handleUpdateServiceStatus(s.id, 'Completed')}
                            className="px-3.5 py-1.5 bg-green-950 hover:bg-green-900 text-white rounded-xl font-bold text-xs cursor-pointer"
                          >
                            Hoàn tất
                          </button>
                        )}
                        {s.status !== 'Completed' && (
                          <button
                            onClick={() => handleUpdateServiceStatus(s.id, 'Cancelled')}
                            className="px-2.5 py-1.5 text-red-700 hover:bg-red-50 rounded-xl font-bold text-xs cursor-pointer"
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 5: CUSTOMER SUPPORT (HỖ TRỢ KHÁCH)
            ========================================== */}
        {activeTab === 'support' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Complaints / Feedbacks list */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-serif text-lg font-bold text-sage-900">Tiếp Nhận & Xử Lý Khiếu Nại (Complaints)</h3>
                    <button
                      onClick={() => setShowAddComplaintModal(true)}
                      className="px-3.5 py-1.5 bg-primary-900 text-white text-xs font-bold rounded-xl hover:bg-primary-850"
                    >
                      Ghi nhận phản ánh mới
                    </button>
                  </div>

                  <div className="space-y-4">
                    {complaints.map(c => (
                      <div key={c.id} className="p-4 bg-primary-50/20 border border-primary-100 rounded-2xl">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-sage-900">{c.guest}</span>
                            <span className="text-[10px] bg-primary-100 text-primary-900 px-2 py-0.2 rounded font-semibold">Phòng {c.room}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.status === 'Open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                            {c.status === 'Open' ? 'Đang mở / Chờ xử lý' : 'Đã xử lý xong'}
                          </span>
                        </div>
                        <p className="text-xs text-sage-700 mt-2 italic font-light">"{c.content}"</p>
                        <p className="text-[9px] text-sage-400 mt-1">Ghi nhận: {c.time}</p>

                        {c.status === 'Open' ? (
                          <div className="mt-3 pt-3 border-t border-primary-50 flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder="Nhập ghi chú cách xử lý / phản hồi lại khách..."
                              id={`comp-tab-reply-${c.id}`}
                              className="flex-grow px-3 py-1.5 text-xs border border-primary-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary-900"
                            />
                            <button
                              onClick={() => {
                                const val = document.getElementById(`comp-tab-reply-${c.id}`).value;
                                handleResolveComplaint(c.id, val);
                              }}
                              className="px-4 py-1.5 bg-primary-900 text-white rounded-xl text-xs font-bold"
                            >
                              Giải quyết
                            </button>
                          </div>
                        ) : (
                          <div className="mt-2.5 bg-green-50/50 border border-green-100 rounded-xl p-2.5 text-xs">
                            <span className="font-bold text-green-900 block text-[10px] uppercase">Ghi nhận giải pháp:</span>
                            <p className="text-sage-800 font-medium mt-0.5">{c.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Support Mock Chat */}
              <div className="bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm flex flex-col h-[500px]">
                <h3 className="font-serif text-lg font-bold text-sage-900 border-b border-primary-50 pb-3">
                  Cổng Chat Khách Hàng (Internal)
                </h3>

                {/* Message display area */}
                <div className="flex-grow my-4 overflow-y-auto space-y-3 pr-2 custom-scrollbar text-xs">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col ${msg.sender.includes('Lễ tân') ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[9px] text-sage-400 mb-0.5 px-1">{msg.sender}</div>
                      <div className={`p-3 rounded-2xl max-w-[85%] ${msg.sender.includes('Lễ tân') ? 'bg-primary-900 text-white rounded-tr-none' : 'bg-primary-50 text-sage-950 rounded-tl-none border border-primary-100'
                        }`}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-sage-400 mt-0.5 px-1">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* Message input area */}
                <form onSubmit={handleSendChatMessage} className="pt-3 border-t border-primary-50 flex items-center space-x-2">
                  <input
                    type="text"
                    value={newChatInput}
                    onChange={(e) => setNewChatInput(e.target.value)}
                    placeholder="Gõ tin nhắn hỗ trợ khách..."
                    className="flex-grow px-3.5 py-2.5 border border-primary-200 rounded-2xl text-xs bg-primary-50/30 focus:outline-none focus:ring-1 focus:ring-primary-900"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-primary-900 hover:bg-primary-850 text-white rounded-2xl transition-colors"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 6: PAYMENTS & INVOICES (THANH TOÁN)
            ========================================== */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-fade-in">
            {/* Payment security info */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-3xl flex items-start space-x-3">
              <ShieldAlert className="h-5 w-5 text-yellow-800 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-yellow-900 block">Quy định bảo mật giao dịch (Role Staff):</span>
                <p className="text-yellow-800 font-light mt-0.5">
                  Nhân viên chỉ có quyền xem hóa đơn, check payment status và in hóa đơn cho khách. Thao tác **CHỈNH SỬA / XÓA LỊCH SỬ GIAO DỊCH** đã thanh toán bị vô hiệu hóa hoàn toàn để ngăn chặn gian lận tài chính.
                </p>
              </div>
            </div>

            {/* Invoices list */}
            <div className="bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-serif text-lg font-bold text-sage-900">Danh Sách Hóa Đơn Lưu Trú & Dịch Vụ</h3>
              </div>

              {/* Desktop view table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-primary-100 text-sage-500 font-bold">
                      <th className="pb-3">Số Hóa Đơn</th>
                      <th className="pb-3">Khách hàng</th>
                      <th className="pb-3">Mã đơn phòng</th>
                      <th className="pb-3">Phòng ở</th>
                      <th className="pb-3">Tiền phòng</th>
                      <th className="pb-3">Tiền dịch vụ</th>
                      <th className="pb-3">Tổng cộng</th>
                      <th className="pb-3">Hình thức</th>
                      <th className="pb-3">Trạng thái</th>
                      <th className="pb-3 text-right">Tác vụ nhân sự</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-50/50">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-primary-50/10">
                        <td className="py-4 font-bold text-primary-950">{p.id}</td>
                        <td className="py-4 font-semibold text-sage-950">{p.guest}</td>
                        <td className="py-4 text-sage-600 font-medium">{p.bookingId}</td>
                        <td className="py-4">
                          <span className="bg-primary-100 text-primary-900 px-2 py-0.5 rounded font-bold">
                            Phòng {p.room}
                          </span>
                        </td>
                        <td className="py-4 text-sage-600">{p.amount}</td>
                        <td className="py-4 text-sage-600">{p.servicesAmount}</td>
                        <td className="py-4 font-bold text-sage-900">{p.total}</td>
                        <td className="py-4 font-medium text-sage-700">{p.method}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${p.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {p.status === 'Paid' ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {p.status === 'Unpaid' && (
                              <button
                                onClick={() => handleConfirmCashPayment(p.id)}
                                className="px-2.5 py-1.5 bg-green-900 hover:bg-green-800 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Nhận tiền mặt
                              </button>
                            )}

                            <button
                              onClick={() => handlePrintInvoice(p)}
                              className="p-1.5 bg-primary-100 hover:bg-primary-200 text-primary-900 rounded-lg text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                              title="In hóa đơn xuất"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              <span>In</span>
                            </button>

                            <button
                              onClick={handleEditPaymentBlocked}
                              className="px-2 py-1 text-red-700 hover:bg-red-50 rounded-lg text-[10px] font-medium cursor-pointer"
                              title="Sửa giao dịch (Blocked)"
                            >
                              Sửa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="block lg:hidden space-y-4">
                {payments.map(p => (
                  <div key={p.id} className="p-4 bg-primary-50/10 border border-primary-100 rounded-2xl space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary-950">{p.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${p.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {p.status === 'Paid' ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[9px] text-sage-500 font-bold block uppercase tracking-wider">Khách hàng</span>
                        <span className="font-semibold text-sage-950">{p.guest}</span>
                        <span className="text-[10px] text-sage-400 block">{p.bookingId}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-sage-500 font-bold block uppercase tracking-wider">Phòng ở</span>
                        <span className="bg-primary-100 text-primary-900 px-2 py-0.5 rounded font-bold inline-block mt-0.5">Phòng {p.room}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[11px] bg-white border border-primary-50 rounded-xl p-2.5">
                      <div>
                        <span className="text-[9px] text-sage-400 block">Tiền phòng</span>
                        <span className="font-medium">{p.amount}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-sage-400 block">Tiền dịch vụ</span>
                        <span className="font-medium">{p.servicesAmount}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-sage-400 block font-bold text-primary-900">Tổng</span>
                        <span className="font-bold text-sage-900">{p.total}</span>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-primary-50 flex items-center justify-between flex-wrap gap-2">
                      <span className="text-sage-600">Hình thức: <span className="font-medium text-sage-800">{p.method}</span></span>

                      <div className="flex gap-2">
                        {p.status === 'Unpaid' && (
                          <button
                            onClick={() => handleConfirmCashPayment(p.id)}
                            className="px-3.5 py-2 bg-green-900 hover:bg-green-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Nhận tiền mặt
                          </button>
                        )}
                        <button
                          onClick={() => handlePrintInvoice(p)}
                          className="p-2 bg-primary-100 hover:bg-primary-200 text-primary-900 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <Printer className="h-4 w-4" />
                          <span>In</span>
                        </button>
                        <button
                          onClick={handleEditPaymentBlocked}
                          className="px-3 py-1.5 text-red-700 hover:bg-red-50 rounded-xl text-xs font-medium cursor-pointer"
                        >
                          Sửa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 7: SHIFTS & ATTENDANCE (LỊCH TRỰC CA)
            ========================================== */}
        {activeTab === 'shifts' && (
          <div className="space-y-6 animate-fade-in">
            {/* Shifts list and clock system side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Shift Attendance Control */}
              <div className="bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-sage-900 mb-4">Điểm Danh Chấm Công Ca Trực</h3>
                  <p className="text-xs text-sage-500 font-light leading-relaxed mb-6">
                    Sử dụng các nút bên dưới để thực hiện bấm giờ điểm danh vào ca và ra ca làm việc hàng ngày của bạn. Dữ liệu sẽ được tự động báo về cho Admin.
                  </p>

                  <div className="space-y-4">
                    {/* Live Clock Display */}
                    <div className="bg-primary-50/50 border border-primary-100 rounded-2xl p-5 text-center">
                      <span className="text-[10px] text-sage-400 block uppercase font-bold tracking-wider">GIỜ THỜI GIAN THỰC</span>
                      <span className="text-2xl font-serif font-bold text-primary-900 block mt-1">23:38:57</span>
                      <span className="text-[10px] text-sage-600 block mt-0.5">Thứ Hai, ngày 25 tháng 5, 2026</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleClockIn}
                        disabled={clockState.isClockedIn}
                        className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm ${clockState.isClockedIn ? 'bg-sage-100 text-sage-400 cursor-not-allowed' : 'bg-primary-900 hover:bg-primary-850 text-white'
                          }`}
                      >
                        <CheckCircle2 className="h-4.5 w-4.5" />
                        <span>VÀO CA</span>
                      </button>

                      <button
                        onClick={handleClockOut}
                        disabled={!clockState.isClockedIn}
                        className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm ${!clockState.isClockedIn ? 'bg-sage-100 text-sage-400 cursor-not-allowed' : 'bg-red-950 hover:bg-red-900 text-white'
                          }`}
                      >
                        <X className="h-4.5 w-4.5" />
                        <span>RA CA</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Clock history list */}
                <div className="mt-6 pt-6 border-t border-primary-50">
                  <h4 className="text-xs font-bold text-sage-900 mb-3">Nhật Ký Điểm Danh Gần Đây</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1 text-[11px] text-sage-600 font-light">
                    {clockState.history.length === 0 ? (
                      <p className="italic text-sage-400">Chưa ghi nhận điểm danh trong ngày.</p>
                    ) : (
                      clockState.history.map((h, i) => (
                        <div key={i} className="flex items-center space-x-2 py-1 border-b border-primary-50/50">
                          <Check className="h-3.5 w-3.5 text-green-700 flex-shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Weekly Shift schedule */}
              <div className="lg:col-span-2 bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-serif text-lg font-bold text-sage-900">Lịch Trực Ca Tuần Này</h3>
                    <button
                      onClick={() => setShowSwapRequestModal(true)}
                      className="px-3.5 py-1.5 bg-primary-100 hover:bg-primary-200 text-primary-900 text-xs font-bold rounded-xl flex items-center space-x-1"
                    >
                      <RefreshCw className="h-3.5 w-3.5 animate-spin-hover" />
                      <span>Yêu cầu đổi ca trực</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-primary-100 text-sage-500 font-bold">
                          <th className="pb-3">Thứ/Ngày</th>
                          <th className="pb-3">Tên Ca Trực</th>
                          <th className="pb-3">Vai trò phân công</th>
                          <th className="pb-3 text-right">Trạng thái ca</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary-50/50">
                        {initialShifts.map((s, idx) => (
                          <tr key={idx} className="hover:bg-primary-50/10">
                            <td className="py-3 font-semibold text-sage-950">{s.day} ({s.date})</td>
                            <td className="py-3 font-medium text-primary-950">{s.shiftName}</td>
                            <td className="py-3 text-sage-700">{s.role}</td>
                            <td className="py-3 text-right">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${s.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                  s.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-sage-100 text-sage-500'
                                }`}>
                                {s.status === 'Completed' && 'Đã trực'}
                                {s.status === 'Upcoming' && 'Sắp trực'}
                                {s.status === 'Day Off' && 'Nghỉ tuần'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Shift Swap Requests submitted */}
                {shiftSwapRequests.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-primary-50">
                    <h4 className="text-xs font-bold text-sage-900 mb-3">Đơn xin đổi ca chờ Admin phê duyệt</h4>
                    <div className="space-y-2">
                      {shiftSwapRequests.map(r => (
                        <div key={r.id} className="p-3 bg-yellow-50/50 border border-yellow-100 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-sage-900">Đổi ngày {r.date} ({r.shiftType})</span>
                            <p className="text-[10px] text-sage-500 mt-0.5">Chuyển cho: {r.targetEmployee} | Lý do: {r.reason}</p>
                          </div>
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-[9px] font-bold">
                            {r.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ==========================================
          MODALS & OVERLAYS INTERFACES
          ========================================== */}

      {/* 1. Modal update Booking Special Notes */}
      {selectedBookingForNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] border border-primary-100 p-6 sm:p-8 w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-lg font-bold text-sage-900">Ghi Chú Yêu Cầu Đặc Biệt</h3>
              <button onClick={() => setSelectedBookingForNotes(null)} className="p-1 text-sage-400 hover:text-sage-900 rounded-full hover:bg-primary-50">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSpecialNotes} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Khách hàng: {selectedBookingForNotes.guest}</label>
                <textarea
                  value={notesFormValue}
                  onChange={(e) => setNotesFormValue(e.target.value)}
                  placeholder="Ví dụ: Khách muốn hướng biển, late check-in sau 21h, thêm giường phụ extra bed..."
                  rows={4}
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent text-sage-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForNotes(null)}
                  className="px-4 py-2 border border-primary-200 rounded-xl text-xs font-semibold text-sage-700 hover:bg-primary-50"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-900 text-white rounded-xl text-xs font-bold hover:bg-primary-850"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Assign Room for Guest */}
      {showAssignRoomModal && bookingToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] border border-primary-100 p-6 sm:p-8 w-full max-w-lg shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-sage-900">Chọn Phòng Gán Cho Khách</h3>
                <p className="text-xs text-sage-500 font-light mt-0.5">Khách hàng: {bookingToAssign.guest} ({bookingToAssign.phone})</p>
              </div>
              <button onClick={() => setShowAssignRoomModal(false)} className="p-1 text-sage-400 hover:text-sage-900 rounded-full hover:bg-primary-50">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold text-sage-500 block uppercase">Danh sách phòng Trống khả dụng:</span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {rooms.filter(r => r.status === 'vacant').map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleAssignRoomSubmit(r.id)}
                    className="p-4 border border-green-200 bg-green-50/20 rounded-2xl hover:border-green-500 text-left transition-all"
                  >
                    <span className="font-serif text-sm font-bold block text-sage-950">Phòng {r.id}</span>
                    <span className="text-[10px] text-sage-500 block mt-0.5">{r.type}</span>
                    <span className="text-[10px] font-semibold text-primary-900 mt-1 block">{r.price}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-primary-50">
                <button
                  onClick={() => setShowAssignRoomModal(false)}
                  className="px-4 py-2 border border-primary-200 rounded-xl text-xs font-semibold text-sage-700 hover:bg-primary-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Report Broken Room */}
      {showReportRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] border border-primary-100 p-6 sm:p-8 w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-lg font-bold text-sage-900">Báo Cáo Sự Cố Phòng Hỏng</h3>
              <button onClick={() => setShowReportRoomModal(false)} className="p-1 text-sage-400 hover:text-sage-900 rounded-full hover:bg-primary-50">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReportBrokenRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Chọn Phòng Gặp Sự Cố</label>
                <select
                  value={reportRoomId}
                  onChange={(e) => setReportRoomId(e.target.value)}
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                  required
                >
                  <option value="">-- Chọn phòng sự cố --</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>Phòng {r.id} ({r.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Chi Tiết Hỏng Hóc / Cần Sửa</label>
                <textarea
                  value={reportIssueDetail}
                  onChange={(e) => setReportIssueDetail(e.target.value)}
                  placeholder="Ví dụ: Vòi sen chảy yếu, vỡ bóng đèn phòng khách, điều hòa không mát lạnh..."
                  rows={4}
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportRoomModal(false)}
                  className="px-4 py-2 border border-primary-200 rounded-xl text-xs font-semibold text-sage-700 hover:bg-primary-50"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-950 hover:bg-red-900 text-white rounded-xl text-xs font-bold"
                >
                  Gửi kỹ thuật báo hỏng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Add Service Order */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] border border-primary-100 p-6 sm:p-8 w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-lg font-bold text-sage-900">Tạo Hóa Đơn Dịch Vụ Mới</h3>
              <button onClick={() => setShowAddServiceModal(false)} className="p-1 text-sage-400 hover:text-sage-900 rounded-full hover:bg-primary-50">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateServiceOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Phòng Sử Dụng</label>
                <select
                  value={serviceOrderForm.room}
                  onChange={(e) => setServiceOrderForm({ ...serviceOrderForm, room: e.target.value })}
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                >
                  {rooms.filter(r => r.status === 'occupied').map(r => (
                    <option key={r.id} value={r.id}>Phòng {r.id} ({r.guestName})</option>
                  ))}
                  {rooms.filter(r => r.status !== 'occupied').map(r => (
                    <option key={r.id} value={r.id}>Phòng {r.id} (Trống)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Loại Dịch Vụ</label>
                <select
                  value={serviceOrderForm.category}
                  onChange={(e) => setServiceOrderForm({ ...serviceOrderForm, category: e.target.value })}
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                >
                  <option value="Spa booking">Spa booking</option>
                  <option value="Restaurant order">Restaurant order</option>
                  <option value="Room service">Room service</option>
                  <option value="Laundry">Laundry</option>
                  <option value="Tour booking">Tour booking</option>
                  <option value="Transport service">Transport service</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Chi Tiết Yêu Cầu / Tên Liệu Trình / Đồ Ăn</label>
                <input
                  type="text"
                  value={serviceOrderForm.detail}
                  onChange={(e) => setServiceOrderForm({ ...serviceOrderForm, detail: e.target.value })}
                  placeholder="Ví dụ: Liệu trình đá nóng 90p, súp cua, 2 áo sơ mi giặt hấp..."
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Đơn Giá Thực Tế</label>
                <input
                  type="text"
                  value={serviceOrderForm.price}
                  onChange={(e) => setServiceOrderForm({ ...serviceOrderForm, price: e.target.value })}
                  placeholder="Ví dụ: 1,200,000đ"
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-4 py-2 border border-primary-200 rounded-xl text-xs font-semibold text-sage-700 hover:bg-primary-50"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-900 hover:bg-primary-850 text-white rounded-xl text-xs font-bold"
                >
                  Tạo Order dịch vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal Add Customer Feedback / Complaint */}
      {showAddComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] border border-primary-100 p-6 sm:p-8 w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-lg font-bold text-sage-900">Ghi Nhận Phản Ánh Khách Hàng</h3>
              <button onClick={() => setShowAddComplaintModal(false)} className="p-1 text-sage-400 hover:text-sage-900 rounded-full hover:bg-primary-50">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Tên Khách Hàng</label>
                <input
                  type="text"
                  value={complaintForm.guest}
                  onChange={(e) => setComplaintForm({ ...complaintForm, guest: e.target.value })}
                  placeholder="Ví dụ: Trần Thị Mai"
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Số Phòng Phản Ánh</label>
                <select
                  value={complaintForm.room}
                  onChange={(e) => setComplaintForm({ ...complaintForm, room: e.target.value })}
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>Phòng {r.id}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Nội Dung Ý Kiến / Phàn Nàn</label>
                <textarea
                  value={complaintForm.content}
                  onChange={(e) => setComplaintForm({ ...complaintForm, content: e.target.value })}
                  placeholder="Nội dung khiếu nại của khách để lưu vết xử lý..."
                  rows={4}
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddComplaintModal(false)}
                  className="px-4 py-2 border border-primary-200 rounded-xl text-xs font-semibold text-sage-700 hover:bg-primary-50"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-900 hover:bg-primary-850 text-white rounded-xl text-xs font-bold"
                >
                  Ghi nhận vào ca trực
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal Print Invoice View */}
      {showInvoicePrintModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] border border-primary-100 p-6 sm:p-8 w-full max-w-lg shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6 border-b border-primary-50 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-sage-900">Chi Tiết & In Hóa Đơn</h3>
                <p className="text-[10px] text-sage-400 mt-0.5">Hóa đơn số: {selectedInvoice.id} | Ngày in: 25/05/2026</p>
              </div>
              <button onClick={() => {
                setShowInvoicePrintModal(false);
                setSelectedInvoice(null);
              }} className="p-1 text-sage-400 hover:text-sage-900 rounded-full hover:bg-primary-50">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Printable Area Layout */}
            <div id="printable-invoice" className="p-4 bg-primary-50/10 border border-primary-100 rounded-2xl text-xs space-y-4 font-mono">
              <div className="text-center border-b border-primary-100 pb-3">
                <span className="font-bold text-sm tracking-wide block uppercase">NGŨ SƠN RESORT & SPA</span>
                <span className="text-[9px] text-sage-500 font-light block">Hòa Vang, Đà Nẵng, Việt Nam</span>
                <span className="text-[9px] text-sage-500 font-light block">Hotline: 1900 8888</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="font-bold text-sage-600 block">KHÁCH HÀNG:</span>
                  <span>{selectedInvoice.guest}</span>
                </div>
                <div>
                  <span className="font-bold text-sage-600 block">SỐ PHÒNG:</span>
                  <span>Phòng {selectedInvoice.room}</span>
                </div>
                <div>
                  <span className="font-bold text-sage-600 block">MÃ ĐƠN PHÒNG:</span>
                  <span>{selectedInvoice.bookingId}</span>
                </div>
                <div>
                  <span className="font-bold text-sage-600 block">PHƯƠNG THỨC:</span>
                  <span>{selectedInvoice.method}</span>
                </div>
              </div>

              <div className="border-t border-b border-primary-100 py-3 text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span>Tiền thuê phòng nghỉ dưỡng:</span>
                  <span className="font-bold">{selectedInvoice.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiền dịch vụ phát sinh (Spa/Nhà hàng/Giặt là):</span>
                  <span className="font-bold">{selectedInvoice.servicesAmount}</span>
                </div>
                <div className="flex justify-between text-xs font-bold pt-2 border-t border-primary-50 text-primary-950">
                  <span>TỔNG CỘNG THANH TOÁN:</span>
                  <span>{selectedInvoice.total}</span>
                </div>
              </div>

              <div className="text-center text-[9px] text-sage-500 font-light pt-2">
                <span>Cảm ơn quý khách đã lưu trú tại Ngũ Sơn Resort!</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-6 border-t border-primary-50 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowInvoicePrintModal(false);
                  setSelectedInvoice(null);
                }}
                className="px-4 py-2 border border-primary-200 rounded-xl text-xs font-semibold text-sage-700 hover:bg-primary-50"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 bg-primary-900 text-white rounded-xl text-xs font-bold hover:bg-primary-850 flex items-center space-x-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>In hóa đơn ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal Shift Swap Request */}
      {showSwapRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] border border-primary-100 p-6 sm:p-8 w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-lg font-bold text-sage-900">Đơn Đăng Ký Đổi Ca Trực</h3>
              <button onClick={() => setShowSwapRequestModal(false)} className="p-1 text-sage-400 hover:text-sage-900 rounded-full hover:bg-primary-50">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSwapShiftSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Chọn Ngày Muốn Đổi</label>
                <input
                  type="date"
                  value={swapForm.date}
                  onChange={(e) => setSwapForm({ ...swapForm, date: e.target.value })}
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Ca Trực Muốn Đổi</label>
                <select
                  value={swapForm.shiftType}
                  onChange={(e) => setSwapForm({ ...swapForm, shiftType: e.target.value })}
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                >
                  <option value="Ca Sáng (06:00 - 14:00)">Ca Sáng (06:00 - 14:00)</option>
                  <option value="Ca Chiều (14:00 - 22:00)">Ca Chiều (14:00 - 22:00)</option>
                  <option value="Ca Đêm (22:00 - 06:00)">Ca Đêm (22:00 - 06:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Nhân Viên Muốn Đổi Ca Cùng</label>
                <input
                  type="text"
                  value={swapForm.targetEmployee}
                  onChange={(e) => setSwapForm({ ...swapForm, targetEmployee: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn Huy (Mã NV EMP-01)"
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Lý Do Đổi Ca</label>
                <textarea
                  value={swapForm.reason}
                  onChange={(e) => setSwapForm({ ...swapForm, reason: e.target.value })}
                  placeholder="Nêu lý do đổi ca trực (Giải quyết việc cá nhân, ốm đau, đi học...)"
                  rows={3}
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSwapRequestModal(false)}
                  className="px-4 py-2 border border-primary-200 rounded-xl text-xs font-semibold text-sage-700 hover:bg-primary-50"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-900 hover:bg-primary-850 text-white rounded-xl text-xs font-bold"
                >
                  Gửi đơn trình duyệt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
