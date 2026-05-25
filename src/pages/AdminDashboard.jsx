import { useState } from 'react';
import { 
  LayoutDashboard, Bed, Users, Flower, 
  CreditCard, MessageSquare, 
  AlertTriangle, X, 
  Star, DollarSign, LogOut, Sparkles, PlusCircle, Package, Lock, Unlock, KeyRound, Edit, ShieldCheck, Printer, Send, Image, Clock
} from 'lucide-react';

// ==========================================
// MOCK DATA FOR RESORT SYSTEM (UPGRADED)
// ==========================================

const initialAccounts = [
  { id: 'ACC-001', name: 'Trần Thị Mai', email: 'maitran@gmail.com', phone: '0901234567', role: 'Customer', status: 'Active', dateCreated: '2026-01-10' },
  { id: 'ACC-002', name: 'Lê Hoàng Nam', email: 'namle@gmail.com', phone: '0987654321', role: 'Customer', status: 'Active', dateCreated: '2026-02-15' },
  { id: 'ACC-003', name: 'Lê Thị Thu', email: 'thule@nguson.com', phone: '0905556667', role: 'Staff', status: 'Active', dateCreated: '2026-03-20', department: 'Lễ tân' },
  { id: 'ACC-004', name: 'Nguyễn Văn Huy', email: 'huynguyen@nguson.com', phone: '0903334445', role: 'Spa', status: 'Active', dateCreated: '2025-11-05', department: 'Trực Spa đá nóng' },
  { id: 'ACC-005', name: 'Phạm Văn Long', email: 'longpham@nguson.com', phone: '0906667778', role: 'Physio', status: 'Active', dateCreated: '2026-04-12', department: 'Vật lý trị liệu' },
  { id: 'ACC-006', name: 'Nguyễn Ngũ Sơn', email: 'admin@nguson.com', phone: '0999888999', role: 'Admin', status: 'Active', dateCreated: '2025-09-01', department: 'Ban Giám Đốc' },
  { id: 'ACC-007', name: 'Trần Văn Bếp', email: 'chef@nguson.com', phone: '0908889999', role: 'Chef', status: 'Active', dateCreated: '2025-12-10', department: 'Nhà bếp resort' },
  { id: 'ACC-008', name: 'Master Yoga Ananda', email: 'yoga@nguson.com', phone: '0907778888', role: 'Yoga', status: 'Active', dateCreated: '2026-01-05', department: 'Khu Yoga bờ biển' }
];

const initialRooms = [
  { id: '101', type: 'VIP', status: 'occupied', floor: 1, price: '4,500,000đ', maxGuests: 4, photo: 'room_vip_view.jpg' },
  { id: '102', type: 'Standard', status: 'vacant', floor: 1, price: '1,800,000đ', maxGuests: 2, photo: 'room_std_garden.jpg' },
  { id: '103', type: 'Deluxe', status: 'maintenance', floor: 1, price: '2,900,000đ', maxGuests: 2, photo: 'room_deluxe_forest.jpg', issue: 'Hỏng vòi sen nhà tắm' },
  { id: '104', type: 'Villa', status: 'cleaning', floor: 1, price: '5,800,000đ', maxGuests: 6, photo: 'room_villa_ocean.jpg' },
  { id: '201', type: 'Standard', status: 'occupied', floor: 2, price: '1,800,000đ', maxGuests: 2, photo: 'room_std_garden.jpg' },
  { id: '202', type: 'Deluxe', status: 'occupied', floor: 2, price: '2,900,000đ', maxGuests: 2, photo: 'room_deluxe_forest.jpg' },
  { id: '203', type: 'Villa', status: 'vacant', floor: 2, price: '5,800,000đ', maxGuests: 6, photo: 'room_villa_ocean.jpg' },
  { id: '204', type: 'VIP', status: 'cleaning', floor: 2, price: '4,500,000đ', maxGuests: 4, photo: 'room_vip_view.jpg' },
  { id: '301', type: 'Villa', status: 'vacant', floor: 3, price: '5,800,000đ', maxGuests: 6, photo: 'room_villa_ocean.jpg' },
  { id: '302', type: 'Villa', status: 'occupied', floor: 3, price: '5,800,000đ', maxGuests: 6, photo: 'room_villa_ocean.jpg' },
  { id: '303', type: 'VIP', status: 'maintenance', floor: 3, price: '4,500,000đ', maxGuests: 4, photo: 'room_vip_view.jpg', issue: 'Điều hòa chảy nước' },
  { id: '304', type: 'Standard', status: 'vacant', floor: 3, price: '1,800,000đ', maxGuests: 2, photo: 'room_std_garden.jpg' },
];


const initialServices = [
  { id: 'SRV-01', name: 'Massage Trị Liệu Đá Núi Lửa', price: '1,200,000đ', type: 'Spa', enabled: true },
  { id: 'SRV-02', name: 'Tắm Ngâm Lá Thảo Dược Dao Đỏ', price: '800,000đ', type: 'Spa', enabled: true },
  { id: 'SRV-03', name: 'Súp sâm yến mạch thực dưỡng', price: '450,000đ', type: 'Restaurant', enabled: true },
  { id: 'SRV-04', name: 'Giặt khô hấp đầm lụa tơ tằm', price: '180,000đ', type: 'Laundry', enabled: true },
  { id: 'SRV-05', name: 'Xe đưa đón Sân Bay Đà Nẵng', price: '700,000đ', type: 'Transport', enabled: true },
  { id: 'SRV-06', name: 'Tour ngắm hoàng hôn Sơn Trà', price: '1,500,000đ', type: 'Tour', enabled: true }
];


const initialPayments = [
  { id: 'TXN-001', date: '2026-05-25', bookingId: 'BK-8902', amount: '4,500,000đ', servicesAmount: '1,200,000đ', total: '5,700,000đ', method: 'Chuyển khoản VNPAY', status: 'Paid' },
  { id: 'TXN-002', date: '2026-05-25', bookingId: 'BK-8903', amount: '3,200,000đ', servicesAmount: '450,000đ', total: '3,650,000đ', method: 'Momo', status: 'Paid' },
  { id: 'TXN-003', date: '2026-05-24', bookingId: 'BK-8906', amount: '6,400,000đ', servicesAmount: '320,000đ', total: '6,720,000đ', method: 'Thẻ tín dụng', status: 'Paid' },
  { id: 'TXN-004', date: '2026-05-24', bookingId: 'BK-8905', amount: '2,900,000đ', servicesAmount: '0đ', total: '2,900,000đ', method: 'Tiền mặt', status: 'Unpaid' }
];

const initialFeedbacks = [
  { id: 1, guest: 'Trần Thị Mai', room: '101', rating: 5, comment: 'Không gian tĩnh lặng, liệu trình ngâm chân lá thuốc Dao Đỏ giúp tôi ngủ rất ngon. Dịch vụ tuyệt vời!', reply: 'Cảm ơn chị Mai đã dành thời gian gửi phản hồi tốt cho resort!', time: '2 giờ trước' },
  { id: 2, guest: 'Lê Hoàng Nam', room: '201', rating: 5, comment: 'Khu spa trị liệu rất đẳng cấp, chuyên viên chu đáo, nhiệt tình.', reply: '', time: '1 ngày trước' }
];

const initialComplaints = [
  { id: 101, room: '103', guest: 'Khách ở phòng 103', content: 'Vòi sen tắm chảy nước rất yếu, cần sửa chữa thiết bị.', status: 'Open', time: '1 giờ trước', feedback: '' },
  { id: 102, room: '303', guest: 'Lễ tân báo', content: 'Phòng 303 điều hòa chảy nước lạnh nhỏ giọt trên sàn gỗ.', status: 'Open', time: '4 giờ trước', feedback: '' }
];

const initialInventory = [
  { id: 'INV-01', name: 'Tinh dầu Sả Chanh (Lít)', category: 'Spa trị liệu', stock: 12, minQty: 5, unit: 'Lít', status: 'Đầy đủ' },
  { id: 'INV-02', name: 'Lá thuốc tắm Dao Đỏ tươi (Kg)', category: 'Spa trị liệu', stock: 45, minQty: 10, unit: 'Kg', status: 'Đầy đủ' },
  { id: 'INV-03', name: 'Bộ drap trải giường Luxury (Bộ)', category: 'Buồng phòng', stock: 3, minQty: 15, unit: 'Bộ', status: 'Sắp hết' },
  { id: 'INV-04', name: 'Bột trà xanh Matcha Nhật (Kg)', category: 'Nhà hàng thực dưỡng', stock: 0, minQty: 2, unit: 'Kg', status: 'Hết hàng' },
];

const initialShifts = [
  { empName: 'Lê Thị Thu', day: 'Thứ Hai', date: '25/05', shiftName: 'Ca Sáng (06:00 - 14:00)', role: 'Lễ tân chính', clockIn: '05:58', clockOut: '14:02', status: 'Present' },
  { empName: 'Nguyễn Văn Huy', day: 'Thứ Hai', date: '25/05', shiftName: 'Ca Chiều (14:00 - 22:00)', role: 'Trưởng bộ phận Spa', clockIn: '13:50', clockOut: '22:05', status: 'Present' },
  { empName: 'Phạm Văn Long', day: 'Thứ Hai', date: '25/05', shiftName: 'Ca Đêm (22:00 - 06:00)', role: 'Kỹ thuật viên', clockIn: '--', clockOut: '--', status: 'Absent' }
];

const initialSwapRequests = [
  { id: 201, date: '2026-05-26', shiftType: 'Ca Sáng (06:00 - 14:00)', applicant: 'Lê Thị Thu', targetEmployee: 'Nguyễn Văn Huy', reason: 'Giải quyết việc gia đình đột xuất', status: 'Pending' }
];

const initialWarnings = [
  { id: 1, text: 'Phòng 303: Điều hòa chảy nước, cần kỹ thuật xử lý gấp.', type: 'maintenance', time: '10 phút trước' },
  { id: 2, text: 'Phòng 104: Đang dọn vệ sinh kéo dài quá 2 tiếng.', type: 'cleaning', time: '45 phút trước' }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Entities states
  const [accounts, setAccounts] = useState(initialAccounts);
  const [rooms, setRooms] = useState(initialRooms);
  const [services, setServices] = useState(initialServices);
  const [payments, setPayments] = useState(initialPayments);
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);
  const [complaints, setComplaints] = useState(initialComplaints);
  const [inventory, setInventory] = useState(initialInventory);
  const [shifts] = useState(initialShifts);
  const [swapRequests, setSwapRequests] = useState(initialSwapRequests);
  const [warnings] = useState(initialWarnings);

  
  // Modals management
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showInvoicePrintModal, setShowInvoicePrintModal] = useState(false);

  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);

  // Form input bindings
  const [accountForm, setAccountForm] = useState({ name: '', email: '', phone: '', role: 'Staff', status: 'Active', department: '' });
  const [roomForm, setRoomForm] = useState({ id: '', type: 'Standard', floor: 1, price: '1,800,000đ', maxGuests: 2, photo: 'room_std_garden.jpg' });
  const [serviceForm, setServiceForm] = useState({ name: '', price: '', type: 'Spa', enabled: true });
  const [paymentForm, setPaymentForm] = useState({ amount: '', servicesAmount: '', total: '', method: 'Cash', status: 'Unpaid' });
  const [inventoryForm, setInventoryForm] = useState({ name: '', category: 'Spa trị liệu', stock: '', minQty: '', unit: 'Lít' });
  const [feedbackReplyText, setFeedbackReplyText] = useState({});
  const [complaintReplyText, setComplaintReplyText] = useState({});

  // Stats calculators
  const totalRoomsCount = rooms.length;
  const vacantRoomsCount = rooms.filter(r => r.status === 'vacant').length;
  const occupiedRoomsCount = rooms.filter(r => r.status === 'occupied').length;
  const occupancyRate = Math.round((occupiedRoomsCount / totalRoomsCount) * 100);

  // SVG Chart Mock Data Points (Monday to Sunday)
  const occupancyChartData = [
    { day: 'T2', val: 55, revenue: 32 },
    { day: 'T3', val: 60, revenue: 38 },
    { day: 'T4', val: 50, revenue: 30 },
    { day: 'T5', val: 68, revenue: 45 },
    { day: 'T6', val: 85, revenue: 65 },
    { day: 'T7', val: 95, revenue: 88 },
    { day: 'CN', val: 90, revenue: 80 }
  ];

  // ==========================================
  // 1. QUẢN LÝ TÀI KHOẢN (USER MANAGEMENT) HANDLERS
  // ==========================================
  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (!accountForm.name || !accountForm.email || !accountForm.phone) {
      alert('Vui lòng điền đầy đủ thông tin tài khoản.');
      return;
    }
    const newAcc = {
      id: `ACC-${Math.floor(100 + Math.random() * 900)}`,
      ...accountForm,
      dateCreated: new Date().toISOString().split('T')[0]
    };
    setAccounts(prev => [...prev, newAcc]);
    setShowAddAccountModal(false);
    setAccountForm({ name: '', email: '', phone: '', role: 'Staff', status: 'Active', department: '' });
    alert('Tài khoản mới đã được tạo thành công.');
  };

  const handleToggleAccountStatus = (id) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === id) {
        const nextStatus = acc.status === 'Active' ? 'Blocked' : 'Active';
        alert(`Tài khoản ${acc.name} đã được chuyển sang trạng thái: ${nextStatus === 'Active' ? 'Hoạt động' : 'Bị Khóa'}.`);
        return { ...acc, status: nextStatus };
      }
      return acc;
    }));
  };

  const handleResetPassword = (name) => {
    const newPass = Math.random().toString(36).substring(2, 10).toUpperCase();
    alert(`Đã reset mật khẩu của tài khoản "${name}". Mật khẩu tạm thời mới là: ${newPass}`);
  };

  const openEditAccount = (acc) => {
    setSelectedAccount(acc);
    setAccountForm({ name: acc.name, email: acc.email, phone: acc.phone, role: acc.role, status: acc.status, department: acc.department || '' });
    setShowEditAccountModal(true);
  };

  const handleUpdateAccount = (e) => {
    e.preventDefault();
    setAccounts(prev => prev.map(acc => acc.id === selectedAccount.id ? { ...acc, ...accountForm } : acc));
    setShowEditAccountModal(false);
    setSelectedAccount(null);
    alert('Thông tin tài khoản đã được cập nhật thành công.');
  };

  // ==========================================
  // 2. QUẢN LÝ PHÒNG (ROOM MANAGEMENT) HANDLERS
  // ==========================================
  const submitNewRoom = (e) => {
    e.preventDefault();
    if (!roomForm.id || !roomForm.price) {
      alert('Vui lòng nhập đầy đủ thông tin phòng.');
      return;
    }
    const newRoom = {
      ...roomForm,
      status: 'vacant'
    };
    setRooms(prev => [...prev, newRoom]);
    setShowAddRoomModal(false);
    setRoomForm({ id: '', type: 'Standard', floor: 1, price: '1,800,000đ', maxGuests: 2, photo: 'room_std_garden.jpg' });
    alert(`Đã thêm phòng ${newRoom.id} vào hệ thống resort.`);
  };

  const openEditRoom = (room) => {
    setSelectedRoom(room);
    setRoomForm({ id: room.id, type: room.type, floor: room.floor, price: room.price, maxGuests: room.maxGuests, photo: room.photo });
    setShowEditRoomModal(true);
  };

  const handleUpdateRoom = (e) => {
    e.preventDefault();
    setRooms(prev => prev.map(r => r.id === selectedRoom.id ? { ...r, ...roomForm } : r));
    setShowEditRoomModal(false);
    setSelectedRoom(null);
    alert('Cập nhật thông tin phòng thành công.');
  };

  const handleDeleteRoom = (id) => {
    if (confirm(`Bạn có chắc chắn muốn XÓA phòng ${id} vĩnh viễn khỏi resort?`)) {
      setRooms(prev => prev.filter(r => r.id !== id));
      alert(`Đã xóa phòng ${id}.`);
    }
  };

  const handleRoomPhotoUploadMock = () => {
    const mockFileNames = ['phong_vip_ban_ban.jpg', 'phong_std_view_nui.jpg', 'phong_deluxe_lake.jpg', 'phong_villa_cay_xanh.jpg'];
    const randomFile = mockFileNames[Math.floor(Math.random() * mockFileNames.length)];
    setRoomForm(prev => ({ ...prev, photo: randomFile }));
    alert(`Đã tải ảnh lên thành công (Giả lập file: ${randomFile})`);
  };

  // ==========================================
  // 3. QUẢN LÝ RESORT SERVICES HANDLERS
  // ==========================================
  const handleAddService = (e) => {
    e.preventDefault();
    if (!serviceForm.name || !serviceForm.price) {
      alert('Vui lòng điền tên dịch vụ và giá bán.');
      return;
    }
    const newSrv = {
      id: `SRV-${Math.floor(100 + Math.random() * 900)}`,
      ...serviceForm
    };
    setServices(prev => [...prev, newSrv]);
    setShowAddServiceModal(false);
    setServiceForm({ name: '', price: '', type: 'Spa', enabled: true });
    alert('Dịch vụ mới đã được thêm thành công.');
  };

  const openEditService = (srv) => {
    setSelectedService(srv);
    setServiceForm({ name: srv.name, price: srv.price, type: srv.type, enabled: srv.enabled });
    setShowEditServiceModal(true);
  };

  const handleUpdateService = (e) => {
    e.preventDefault();
    setServices(prev => prev.map(s => s.id === selectedService.id ? { ...s, ...serviceForm } : s));
    setShowEditServiceModal(false);
    setSelectedService(null);
    alert('Đã cập nhật dịch vụ.');
  };

  const handleToggleServiceEnabled = (id) => {
    setServices(prev => prev.map(s => {
      if (s.id === id) {
        const nextState = !s.enabled;
        alert(`Dịch vụ ${s.name} đã được ${nextState ? 'Kích Hoạt' : 'Tạm Ngưng'}.`);
        return { ...s, enabled: nextState };
      }
      return s;
    }));
  };

  // ==========================================
  // 4. HỖ TRỢ KHÁCH HÀNG HANDLERS
  // ==========================================
  const handleSendFeedbackReply = (id) => {
    const text = feedbackReplyText[id];
    if (!text) {
      alert('Vui lòng điền nội dung phản hồi.');
      return;
    }
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, reply: text } : f));
    alert('Đã gửi phản hồi thành công cho khách hàng.');
  };

  const handleResolveComplaint = (id) => {
    const reply = complaintReplyText[id] || 'Ban quản lý đã ghi nhận và kỹ thuật đã xử lý xong.';
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'Resolved', feedback: reply } : c));
    alert(`Đã ghi nhận phương án và đóng khiếu nại #${id}.`);
  };

  // ==========================================
  // 5. THANH TOÁN (PAYMENT EDITING RIGHTS FOR ADMIN)
  // ==========================================
  const openEditPayment = (pay) => {
    setSelectedPayment(pay);
    setPaymentForm({ amount: pay.amount, servicesAmount: pay.servicesAmount, total: pay.total, method: pay.method, status: pay.status });
    setShowEditPaymentModal(true);
  };

  const handleUpdatePayment = (e) => {
    e.preventDefault();
    setPayments(prev => prev.map(p => p.id === selectedPayment.id ? { ...p, ...paymentForm } : p));
    setShowEditPaymentModal(false);
    setSelectedPayment(null);
    alert('Admin đã cập nhật giao dịch thanh toán thành công.');
  };

  const handleConfirmCashPayment = (id) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'Paid', method: 'Tiền mặt tại quầy' } : p));
    alert('Đã xác nhận thanh toán tiền mặt thành công.');
  };

  // ==========================================
  // 6. QUẢN LÝ LỊCH TRỰC & PHÊ DUYỆT CA
  // ==========================================
  const handleApproveSwapRequest = (id) => {
    setSwapRequests(prev => prev.map(req => {
      if (req.id === id) {
        alert(`Đã duyệt đơn đổi ca trực của ${req.applicant}. Lịch trực đã được đồng bộ lại.`);
        return { ...req, status: 'Approved' };
      }
      return req;
    }));
  };

  const handleRejectSwapRequest = (id) => {
    setSwapRequests(prev => prev.map(req => {
      if (req.id === id) {
        alert(`Đã từ chối đơn đổi ca trực của ${req.applicant}.`);
        return { ...req, status: 'Rejected' };
      }
      return req;
    }));
  };

  // ==========================================
  // 7. QUẢN LÝ KHO (INVENTORY) HANDLERS
  // ==========================================
  const handleQuickRestock = (id) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newStock = item.stock + 10;
        const newStatus = newStock >= item.minQty ? 'Đầy đủ' : 'Sắp hết';
        return { ...item, stock: newStock, status: newStatus };
      }
      return item;
    }));
  };

  const handleCreateInventory = (e) => {
    e.preventDefault();
    if (!inventoryForm.name || !inventoryForm.stock || !inventoryForm.minQty) {
      alert('Vui lòng điền đầy đủ các thông tin kho hàng.');
      return;
    }
    const stockVal = parseInt(inventoryForm.stock);
    const minQtyVal = parseInt(inventoryForm.minQty);
    let initStatus = 'Đầy đủ';
    if (stockVal === 0) initStatus = 'Hết hàng';
    else if (stockVal < minQtyVal) initStatus = 'Sắp hết';

    const newItem = {
      id: `INV-${Math.floor(10 + Math.random() * 90)}`,
      name: inventoryForm.name,
      category: inventoryForm.category,
      stock: stockVal,
      minQty: minQtyVal,
      unit: inventoryForm.unit,
      status: initStatus
    };
    setInventory(prev => [...prev, newItem]);
    setShowAddInventoryModal(false);
    setInventoryForm({ name: '', category: 'Spa trị liệu', stock: '', minQty: '', unit: 'Lít' });
    alert('Vật tư mới đã được khai báo vào kho.');
  };

  return (
    <div className="admin-theme min-h-screen bg-[#fafbfa] flex flex-col lg:flex-row antialiased text-sage-900 pt-0 relative">
      
      {/* ==========================================
          SIDEBAR NAVIGATION
          ========================================== */}
      <aside className="w-full lg:w-64 bg-sage-900 text-white flex flex-col flex-shrink-0 z-20 shadow-xl border-r border-sage-800">
        {/* Brand Header */}
        <div className="p-6 border-b border-sage-850 flex items-center space-x-3 bg-sage-950/20">
          <div className="p-2.5 bg-primary-200 rounded-xl text-sage-950 shadow-md">
            <Sparkles className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-white leading-tight">Ngũ Sơn Resort</h1>
            <span className="text-[10px] text-sage-400 font-bold tracking-widest uppercase block">Admin Portal</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-grow py-6 px-3.5 space-y-1.5 overflow-y-auto custom-scrollbar">
          {[
            { id: 'dashboard', label: '1. Tổng quan', icon: LayoutDashboard },
            { id: 'users', label: '2. Quản lý tài khoản', icon: Users, badge: `${accounts.length}` },
            { id: 'rooms', label: '3. Quản lý phòng', icon: Bed, badge: `${vacantRoomsCount}` },
            { id: 'services', label: '4. Dịch vụ resort', icon: Flower, badge: `${services.length}` },
            { id: 'support', label: '5. Hỗ trợ khách', icon: MessageSquare, badge: `${complaints.filter(c => c.status === 'Open').length}` },
            { id: 'payments', label: '6. Thanh toán', icon: CreditCard, badge: `${payments.filter(p => p.status === 'Unpaid').length}` },
            { id: 'shifts', label: '7. Ca trực & Lịch làm', icon: Clock, badge: `${swapRequests.filter(s => s.status === 'Pending').length}` },
            { id: 'inventory', label: '8. Quản lý kho', icon: Package, badge: `${inventory.filter(i => i.status !== 'Đầy đủ').length}` }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-150 cursor-pointer ${isActive ? 'bg-primary-200 text-sage-950 shadow-md scale-[1.01]' : 'text-sage-300 hover:bg-sage-800/50 hover:text-white'}`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`h-4.5 w-4.5 flex-shrink-0 ${isActive ? 'text-sage-950' : 'text-sage-400'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>
                {item.badge && item.badge !== '0' && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ml-1.5 ${isActive ? 'bg-sage-900 text-white' : 'bg-sage-850 text-primary-200'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Admin Profile */}
        <div className="p-4 border-t border-sage-850 bg-sage-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-sage-950 font-bold border border-primary-300 shadow-inner text-sm">
                AD
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">Admin Quản lý</h4>
                <span className="text-[11px] text-sage-400">Ban quản trị Resort</span>
              </div>
            </div>
            <button 
              onClick={() => { if(confirm('Bạn có chắc chắn muốn đăng xuất?')) window.location.href = '/dang-nhap'; }} 
              className="p-2 rounded-lg text-sage-400 hover:text-red-400 hover:bg-sage-800/50 transition-all cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ==========================================
          MAIN CONTENT VIEW AREA
          ========================================== */}
      <main className="flex-grow min-h-screen flex flex-col p-6 lg:p-8 overflow-y-auto max-h-screen custom-scrollbar">
        
        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-primary-100 mb-6 gap-4">
          <div>
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-sage-950 leading-tight">
              {activeTab === 'dashboard' && '1. Bảng Tổng Quan Vận Hành Resort'}
              {activeTab === 'users' && '2. Quản Lý Tài Khoản (User Management)'}
              {activeTab === 'rooms' && '3. Quản Lý Phòng & Loại Phòng Resort'}
              {activeTab === 'services' && '4. Danh Mục Dịch Vụ Resort & Yoga'}
              {activeTab === 'support' && '5. Cổng Tiếp Nhận & Hỗ Trợ Khách Hàng'}
              {activeTab === 'payments' && '6. Sổ Nhật Ký Hóa Đơn & Giao Dịch'}
              {activeTab === 'shifts' && '7. Điều Hành Ca Làm Việc & Attendance'}
              {activeTab === 'inventory' && '8. Quản Lý Kho & Vật Tư Resort'}
            </h2>
            <p className="text-xs text-sage-500 font-medium mt-0.5">Quyền hạn tối cao: Quản trị hệ thống toàn diện</p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-primary-100 border border-primary-200/50 rounded-2xl px-4 py-2 text-xs font-semibold text-primary-900">
              Chế độ: Admin / Manager
            </div>
          </div>
        </header>

        {/* ==========================================
            TAB 1: OVERVIEW DASHBOARD
            ========================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-primary-100 shadow-sm flex items-center space-x-4">
                <div className="p-3.5 bg-green-50 text-green-700 rounded-2xl">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-sage-500 font-bold uppercase tracking-wider">Doanh Thu Ngày</p>
                  <h3 className="text-xl font-bold text-sage-900 mt-1">15,650,000đ</h3>
                  <span className="text-[9px] text-green-600 font-medium">+12% so với hôm qua</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-primary-100 shadow-sm flex items-center space-x-4">
                <div className="p-3.5 bg-primary-100 text-primary-900 rounded-2xl">
                  <Bed className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-sage-500 font-bold uppercase tracking-wider">Tỷ Lệ Lấp Đầy</p>
                  <h3 className="text-xl font-bold text-sage-900 mt-1">{occupancyRate}%</h3>
                  <span className="text-[9px] text-primary-700 font-medium">{occupiedRoomsCount} phòng đang ở</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-primary-100 shadow-sm flex items-center space-x-4">
                <div className="p-3.5 bg-blue-50 text-blue-700 rounded-2xl">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-sage-500 font-bold uppercase tracking-wider">Tổng Account</p>
                  <h3 className="text-xl font-bold text-sage-900 mt-1">{accounts.length}</h3>
                  <span className="text-[9px] text-sage-400">Khách hàng & nhân sự</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-primary-100 shadow-sm flex items-center space-x-4">
                <div className="p-3.5 bg-red-50 text-red-700 rounded-2xl">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-sage-500 font-bold uppercase tracking-wider">Cảnh Báo Vận Hành</p>
                  <h3 className="text-xl font-bold text-sage-900 mt-1">{warnings.length}</h3>
                  <span className="text-[9px] text-red-600 font-medium">Cần xử lý kỹ thuật</span>
                </div>
              </div>
            </div>

            {/* SVG Occupancy and Revenue Chart */}
            <div className="bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-sage-950 mb-6">Biểu Đồ Xu Hướng Lấp Đầy Phòng & Doanh Thu Tuần</h3>
              
              <div className="h-64 w-full flex items-end justify-between px-4 border-b border-primary-100 pb-3 relative">
                {/* SVG Graph Drawing */}
                <svg className="absolute inset-0 h-full w-full px-4" viewBox="0 0 500 240" preserveAspectRatio="none">
                  {/* Occupancy Line */}
                  <path 
                    d={`M 35 ${240 - occupancyChartData[0].val * 2} 
                       L 100 ${240 - occupancyChartData[1].val * 2} 
                       L 165 ${240 - occupancyChartData[2].val * 2} 
                       L 230 ${240 - occupancyChartData[3].val * 2} 
                       L 295 ${240 - occupancyChartData[4].val * 2} 
                       L 360 ${240 - occupancyChartData[5].val * 2} 
                       L 425 ${240 - occupancyChartData[6].val * 2}`}
                    fill="none" 
                    stroke="#1a2e05" 
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Dots on nodes */}
                  {occupancyChartData.map((d, i) => (
                    <circle 
                      key={i} 
                      cx={35 + i * 65} 
                      cy={240 - d.val * 2} 
                      r="4.5" 
                      fill="#d9f99d" 
                      stroke="#1a2e05" 
                      strokeWidth="2.5" 
                    />
                  ))}
                </svg>

                {/* Week Day Labels */}
                {occupancyChartData.map((d, index) => (
                  <div key={index} className="flex flex-col items-center space-y-1.5 z-10 w-12">
                    <span className="text-[10px] font-bold text-primary-900 bg-primary-100 px-2 py-0.5 rounded-full">{d.val}%</span>
                    <span className="text-[10px] font-semibold text-sage-500">{d.day}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-6 justify-center mt-5 text-xs font-semibold">
                <div className="flex items-center space-x-2">
                  <span className="h-3 w-6 bg-primary-900 rounded block" />
                  <span className="text-sage-700">Tỷ lệ lấp đầy phòng (%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-200 border-2 border-primary-900 block" />
                  <span className="text-sage-700">Chỉ số đo lường hiệu suất (KPIs)</span>
                </div>
              </div>
            </div>

            {/* Warnings list */}
            <div className="bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-sage-950 mb-4">Cảnh Báo Vận Hành Đang Diễn Ra</h3>
              <div className="space-y-3">
                {warnings.map(w => (
                  <div key={w.id} className="p-3.5 bg-red-50 border border-red-100 rounded-2xl flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4.5 w-4.5 text-red-700" />
                      <span className="font-semibold text-red-950">{w.text}</span>
                    </div>
                    <span className="text-sage-500 font-light">{w.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: USER MANAGEMENT (QUẢN LÝ TÀI KHOẢN)
            ========================================== */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header controls */}
            <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-semibold text-sm text-sage-950">Phân Phối & Giám Sát Tài Khoản</h3>
                <p className="text-xs text-sage-500">Tạo tài khoản mới, phân chia cấp bậc quyền hạn, khóa hoặc mở khóa tài khoản thành viên.</p>
              </div>
              <button 
                onClick={() => setShowAddAccountModal(true)}
                className="px-4 py-2.5 bg-primary-900 hover:bg-primary-850 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md"
              >
                <PlusCircle className="h-4.5 w-4.5" />
                <span>Tạo Tài Khoản Mới</span>
              </button>
            </div>

            {/* Account List view */}
            <div className="bg-white border border-primary-100 rounded-[32px] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-primary-50/50 text-sage-600 font-bold border-b border-primary-100">
                      <th className="p-4">Mã User</th>
                      <th className="p-4">Họ và Tên</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Số điện thoại</th>
                      <th className="p-4">Quyền (Role)</th>
                      <th className="p-4">Trực bộ phận</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-center">Tác vụ quản trị</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-50/50">
                    {accounts.map(acc => (
                      <tr key={acc.id} className="hover:bg-primary-50/10">
                        <td className="p-4 font-bold text-primary-950">{acc.id}</td>
                        <td className="p-4 font-bold text-sage-950">{acc.name}</td>
                        <td className="p-4 text-sage-700">{acc.email}</td>
                        <td className="p-4 text-sage-700 font-mono">{acc.phone}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            acc.role === 'Admin' ? 'bg-red-50 text-red-700 border-red-200' :
                            acc.role === 'Manager' ? 'bg-amber-50 text-amber-700 border-amber-250' :
                            acc.role === 'Staff' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            acc.role === 'Chef' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            acc.role === 'Spa' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' :
                            acc.role === 'Yoga' ? 'bg-rose-50 text-rose-700 border-rose-250' :
                            acc.role === 'Physio' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-green-50 text-green-700 border-green-200'
                          }`}>
                            {acc.role}
                          </span>
                        </td>
                        <td className="p-4 text-sage-600 font-medium">{acc.department || '-'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            acc.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {acc.status === 'Active' ? 'Đang chạy' : 'Đã Khóa'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button 
                              onClick={() => openEditAccount(acc)}
                              className="p-1.5 bg-primary-50 hover:bg-primary-100 text-primary-950 rounded-lg cursor-pointer"
                              title="Sửa quyền / Thông tin"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button 
                              onClick={() => handleToggleAccountStatus(acc.id)}
                              className={`p-1.5 rounded-lg cursor-pointer ${
                                acc.status === 'Active' ? 'bg-red-50 hover:bg-red-100 text-red-700' : 'bg-green-50 hover:bg-green-100 text-green-700'
                              }`}
                              title={acc.status === 'Active' ? 'Khóa tài khoản' : 'Mở khóa'}
                            >
                              {acc.status === 'Active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                            </button>

                            <button 
                              onClick={() => handleResetPassword(acc.name)}
                              className="p-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 rounded-lg cursor-pointer"
                              title="Reset Password"
                            >
                              <KeyRound className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: ROOM MANAGEMENT
            ========================================== */}
        {activeTab === 'rooms' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-semibold text-sm text-sage-950">Quản Lý Phòng & Loại Phòng Resort</h3>
                <p className="text-xs text-sage-500">Cập nhật giá bán, sửa thông tin loại phòng: Standard, Deluxe, Villa, VIP hoặc tải ảnh phòng.</p>
              </div>
              <button 
                onClick={() => setShowAddRoomModal(true)}
                className="px-4 py-2.5 bg-primary-900 hover:bg-primary-850 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md"
              >
                <PlusCircle className="h-4.5 w-4.5" />
                <span>Thêm Phòng Mới</span>
              </button>
            </div>

            <div className="bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {rooms.map(room => (
                <div 
                  key={room.id}
                  className="bg-[#1a2e05]/5 rounded-2xl border border-primary-100 p-4 flex flex-col justify-between h-56 text-left"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-primary-900 uppercase">TẦNG {room.floor} - PHÒNG {room.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        room.status === 'vacant' ? 'bg-green-100 text-green-800' :
                        room.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                        room.status === 'cleaning' ? 'bg-orange-100 text-orange-850' : 'bg-red-100 text-red-800'
                      }`}>
                        {room.status}
                      </span>
                    </div>

                    <div className="h-24 w-full bg-sage-200 rounded-xl overflow-hidden relative flex items-center justify-center border border-primary-100">
                      {room.photo ? (
                        <div className="absolute inset-0 flex flex-col justify-end p-2 bg-black/30 text-white text-[10px]">
                          <span className="font-semibold">{room.photo}</span>
                        </div>
                      ) : (
                        <Image className="h-8 w-8 text-sage-400" />
                      )}
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="font-serif font-bold text-sage-950">{room.type}</span>
                      <span className="font-bold text-primary-950">{room.price}/đêm</span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-1.5 pt-2 border-t border-primary-100/50 mt-2">
                    <button 
                      onClick={() => openEditRoom(room)}
                      className="px-2.5 py-1.5 bg-primary-100 hover:bg-primary-200 text-primary-900 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Sửa
                    </button>
                    <button 
                      onClick={() => handleDeleteRoom(room.id)}
                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: RESORT SERVICES
            ========================================== */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-semibold text-sm text-sage-950">Quản Lý Toàn Bộ Dịch Vụ Resort</h3>
                <p className="text-xs text-sage-500">Thêm danh mục dịch vụ mới, cập nhật giá bán hoặc tạm ngưng các dịch vụ (Spa, Restaurant, Laundry, Transport, Tour).</p>
              </div>
              <button 
                onClick={() => setShowAddServiceModal(true)}
                className="px-4 py-2.5 bg-primary-900 hover:bg-primary-850 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md"
              >
                <PlusCircle className="h-4.5 w-4.5" />
                <span>Thêm Dịch Vụ Mới</span>
              </button>
            </div>

            <div className="bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-primary-50/50 text-sage-600 font-bold border-b border-primary-100">
                      <th className="p-4">Mã DV</th>
                      <th className="p-4">Tên Dịch Vụ</th>
                      <th className="p-4">Phân Loại</th>
                      <th className="p-4">Đơn Giá Cấu Hình</th>
                      <th className="p-4">Trạng Thái Kinh Doanh</th>
                      <th className="p-4 text-center">Tác Vụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-50/50">
                    {services.map(s => (
                      <tr key={s.id} className={`hover:bg-primary-50/10 ${!s.enabled && 'opacity-60 bg-sage-50/20'}`}>
                        <td className="p-4 font-bold text-primary-950">{s.id}</td>
                        <td className="p-4 font-semibold text-sage-900">{s.name}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-100 text-primary-900">
                            {s.type}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-sage-950">{s.price}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.enabled ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                            {s.enabled ? 'Đang hoạt động' : 'Tạm ngưng'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button 
                              onClick={() => openEditService(s)}
                              className="px-2.5 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-950 rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Sửa giá
                            </button>
                            <button 
                              onClick={() => handleToggleServiceEnabled(s.id)}
                              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer ${s.enabled ? 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100' : 'bg-green-50 text-green-800 hover:bg-green-100'}`}
                            >
                              {s.enabled ? 'Tắt' : 'Bật'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 5: CUSTOMER SUPPORT
            ========================================== */}
        {activeTab === 'support' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Complaints resolver */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm">
                  <h3 className="font-serif text-lg font-bold text-sage-950 mb-5">Danh Sách Phản Ánh & Complaint Từ Khách</h3>
                  
                  <div className="space-y-4">
                    {complaints.map(c => (
                      <div key={c.id} className="p-4 bg-primary-50/20 border border-primary-100 rounded-2xl">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-primary-950">Phòng {c.room}</span>
                            <span className="text-[10px] text-sage-400 font-light">{c.time}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.status === 'Open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {c.status === 'Open' ? 'Chưa giải quyết' : 'Đã giải quyết'}
                          </span>
                        </div>
                        <p className="text-xs text-sage-700 mt-2 italic">"{c.content}"</p>

                        {c.status === 'Open' ? (
                          <div className="mt-3 pt-3 border-t border-primary-100/50 flex space-x-2">
                            <input 
                              type="text" 
                              placeholder="Nhập phương án giải quyết khiếu nại..." 
                              value={complaintReplyText[c.id] || ''}
                              onChange={(e) => setComplaintReplyText({ ...complaintReplyText, [c.id]: e.target.value })}
                              className="flex-grow px-3 py-1.5 text-xs border border-primary-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary-900"
                            />
                            <button 
                              onClick={() => handleResolveComplaint(c.id)}
                              className="px-4 py-1.5 bg-primary-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                            >
                              Xác nhận
                            </button>
                          </div>
                        ) : (
                          <div className="mt-2.5 bg-green-50/50 border border-green-100 rounded-xl p-2.5 text-xs text-sage-800">
                            <span className="font-bold text-green-900 block text-[10px] uppercase">Ghi nhận giải pháp:</span>
                            <p className="font-medium mt-0.5">{c.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feedbacks reviews */}
                <div className="bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm">
                  <h3 className="font-serif text-lg font-bold text-sage-950 mb-5">Đánh Giá & Trả Lời Khách Hàng (Feedback)</h3>
                  
                  <div className="space-y-4">
                    {feedbacks.map(f => (
                      <div key={f.id} className="p-4 bg-sage-50/30 border border-primary-50 rounded-2xl">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-sage-950">{f.guest} (Phòng {f.room})</span>
                          <span className="flex items-center text-yellow-500">
                            {Array.from({ length: f.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-current" />
                            ))}
                          </span>
                        </div>
                        <p className="text-xs text-sage-700 mt-2 font-light">"{f.comment}"</p>

                        {!f.reply ? (
                          <div className="mt-3 pt-3 border-t border-primary-50 flex space-x-2">
                            <input 
                              type="text" 
                              placeholder="Nhập câu trả lời đánh giá..." 
                              value={feedbackReplyText[f.id] || ''}
                              onChange={(e) => setFeedbackReplyText({ ...feedbackReplyText, [f.id]: e.target.value })}
                              className="flex-grow px-3 py-1.5 text-xs border border-primary-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary-900"
                            />
                            <button 
                              onClick={() => handleSendFeedbackReply(f.id)}
                              className="px-4 py-1.5 bg-primary-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                            >
                              Gửi phản hồi
                            </button>
                          </div>
                        ) : (
                          <div className="mt-2.5 bg-primary-50/40 border border-primary-100/50 rounded-xl p-2.5 text-xs text-sage-800">
                            <span className="font-bold text-primary-900 block text-[10px] uppercase">Phản hồi của Resort:</span>
                            <p className="font-medium mt-0.5">{f.reply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat Support Mock Panel */}
              <div className="bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm flex flex-col h-[500px]">
                <h3 className="font-serif text-lg font-bold text-sage-950 border-b border-primary-50 pb-3">
                  Cổng Chat Hỗ Trợ Kỹ Thuật Số
                </h3>
                
                <div className="flex-grow my-4 overflow-y-auto space-y-3 pr-2 custom-scrollbar text-xs">
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] text-sage-400 mb-0.5">Staff (Lễ tân Lê Thị Thu)</span>
                    <div className="p-3 bg-primary-50 text-sage-950 rounded-2xl rounded-tl-none border border-primary-100 max-w-[85%]">
                      Dạ anh chị Admin ơi, phòng 303 điều hòa bị chảy nước nhiều quá, khách phàn nàn quá ạ. Anh chị báo kỹ thuật giúp em.
                    </div>
                    <span className="text-[8px] text-sage-400 mt-0.5">23:50</span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-sage-400 mb-0.5">Bạn (Admin)</span>
                    <div className="p-3 bg-primary-900 text-white rounded-2xl rounded-tr-none max-w-[85%]">
                      Chào em, anh đã ghi nhận và vừa mở phiếu báo hỏng chuyển trực tiếp cho kỹ thuật viên Phạm Văn Long rồi nhé. Long sẽ lên kiểm tra ngay lập tức.
                    </div>
                    <span className="text-[8px] text-sage-400 mt-0.5">23:51</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-primary-50 flex items-center space-x-2">
                  <input 
                    type="text" 
                    placeholder="Gõ tin nhắn phản hồi hệ thống..." 
                    className="flex-grow px-3.5 py-2.5 border border-primary-200 rounded-2xl text-xs bg-primary-50/30 focus:outline-none focus:ring-1 focus:ring-primary-900"
                  />
                  <button className="p-2.5 bg-primary-900 text-white rounded-2xl cursor-pointer">
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 6: PAYMENTS & INVOICES (THANH TOÁN)
            ========================================== */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-fade-in">
            {/* Privilege indicator */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-3xl flex items-start space-x-3">
              <ShieldCheck className="h-5 w-5 text-green-800 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-green-900 block">Đặc quyền cấp Quản trị (Admin/Manager):</span>
                <p className="text-green-800 font-light mt-0.5">
                  Tài khoản của bạn có toàn quyền **CHỈNH SỬA CHI TIẾT GIAO DỊCH** hóa đơn (thay đổi giá trị tiền phòng, tiền dịch vụ, hình thức thanh toán) để hỗ trợ hoàn tiền hoặc điều chỉnh hóa đơn đặc biệt cho khách hàng.
                </p>
              </div>
            </div>

            <div className="bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-primary-100 text-sage-500 font-bold">
                      <th className="pb-3">Mã GD</th>
                      <th className="pb-3">Khách hàng</th>
                      <th className="pb-3">Phòng ở</th>
                      <th className="pb-3">Tiền phòng</th>
                      <th className="pb-3">Tiền dịch vụ</th>
                      <th className="pb-3 font-bold text-primary-950">Tổng cộng</th>
                      <th className="pb-3">Phương thức</th>
                      <th className="pb-3">Ngày thanh toán</th>
                      <th className="pb-3">Trạng thái</th>
                      <th className="pb-3 text-right">Tác vụ quản trị</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-50/50">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-primary-50/10">
                        <td className="py-4 font-bold text-primary-950">{p.id}</td>
                        <td className="py-4 font-semibold text-sage-950">{p.guest}</td>
                        <td className="py-4">
                          <span className="bg-primary-100 text-primary-900 px-2.5 py-0.5 rounded font-bold text-[10px]">
                            Phòng {p.room}
                          </span>
                        </td>
                        <td className="py-4 text-sage-600">{p.amount}</td>
                        <td className="py-4 text-sage-600">{p.servicesAmount}</td>
                        <td className="py-4 font-bold text-sage-900">{p.total}</td>
                        <td className="py-4 text-sage-700 font-medium">{p.method}</td>
                        <td className="py-4 text-sage-500">{p.date}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${p.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
                              onClick={() => { setSelectedPayment(p); setShowInvoicePrintModal(true); }}
                              className="p-1.5 bg-primary-100 hover:bg-primary-200 text-primary-900 rounded-lg text-[10px] font-bold cursor-pointer"
                              title="In hóa đơn"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </button>

                            <button 
                              onClick={() => openEditPayment(p)}
                              className="px-2.5 py-1.5 bg-primary-900 hover:bg-primary-850 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Sửa GD
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 7: SHIFTS & ATTENDANCE (LỊCH TRỰC CA)
            ========================================== */}
        {activeTab === 'shifts' && (
          <div className="space-y-6 animate-fade-in">
            {/* Shifts list */}
            <div className="bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-sage-950 mb-5">Phân Công Ca Làm & Nhật Ký Attendance Nhân Sự</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-primary-100 text-sage-500 font-bold bg-primary-50/30">
                      <th className="p-3">Nhân Viên</th>
                      <th className="p-3">Thứ/Ngày</th>
                      <th className="p-3">Ca Trực</th>
                      <th className="p-3">Nhiệm vụ phân công</th>
                      <th className="p-3">Chấm giờ vào (In)</th>
                      <th className="p-3">Chấm giờ ra (Out)</th>
                      <th className="p-3 text-right">Trạng thái điểm danh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-50/50">
                    {shifts.map((s, index) => (
                      <tr key={index} className="hover:bg-primary-50/10">
                        <td className="p-3 font-bold text-sage-950">{s.empName}</td>
                        <td className="p-3 text-sage-700">{s.day} ({s.date})</td>
                        <td className="p-3 font-medium text-primary-950">{s.shiftName}</td>
                        <td className="p-3 text-sage-600 font-medium">{s.role}</td>
                        <td className="p-3 font-mono font-bold text-primary-900">{s.clockIn}</td>
                        <td className="p-3 font-mono font-bold text-primary-900">{s.clockOut}</td>
                        <td className="p-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            s.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {s.status === 'Present' ? 'Có mặt' : 'Vắng mặt'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Shift swap approval */}
            <div className="bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-sage-950 mb-5">Danh Sách Yêu Cầu Đổi Ca Chờ Phê Duyệt</h3>
              
              <div className="space-y-4">
                {swapRequests.map(r => (
                  <div key={r.id} className="p-4 bg-yellow-50/40 border border-yellow-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sage-900">{r.applicant}</span>
                        <span className="text-[10px] text-sage-500">Xin đổi ca vào ngày: {r.date}</span>
                      </div>
                      <p className="text-sage-700 mt-1.5 font-medium">Đổi ca: <span className="text-primary-900">{r.shiftType}</span> đổi sang với nhân viên <span className="text-primary-900">{r.targetEmployee}</span>.</p>
                      <p className="text-[10px] text-sage-500 italic mt-1 font-light">"Lý do: {r.reason}"</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {r.status === 'Pending' ? (
                        <>
                          <button 
                            onClick={() => handleApproveSwapRequest(r.id)}
                            className="px-3.5 py-1.5 bg-green-900 hover:bg-green-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Duyệt đơn
                          </button>
                          <button 
                            onClick={() => handleRejectSwapRequest(r.id)}
                            className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Từ chối
                          </button>
                        </>
                      ) : (
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                          r.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {r.status === 'Approved' ? 'Đã phê duyệt' : 'Đã từ chối'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 8: INVENTORY MANAGEMENT
            ========================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header inventory block */}
            <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-semibold text-sm text-sage-950">Quản Lý Kho & Vật Tư Resort</h3>
                <p className="text-xs text-sage-500">Giám sát lượng tồn kho thực tế, nhập kho nhanh hoặc bổ sung các danh mục vật tư mới.</p>
              </div>
              <button 
                onClick={() => setShowAddInventoryModal(true)}
                className="px-4 py-2.5 bg-primary-900 hover:bg-primary-850 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md"
              >
                <PlusCircle className="h-4.5 w-4.5" />
                <span>Khai Báo Vật Tư</span>
              </button>
            </div>

            {/* Inventory table */}
            <div className="bg-white border border-primary-100 rounded-[32px] p-6 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-primary-50/50 text-sage-600 font-bold border-b border-primary-100">
                      <th className="p-4">Mã Vật Tư</th>
                      <th className="p-4">Tên Sản Phẩm / Vật Tư</th>
                      <th className="p-4">Danh Mục Sử Dụng</th>
                      <th className="p-4 text-center">Số Lượng Tồn</th>
                      <th className="p-4 text-center">Mức Tối Thiểu</th>
                      <th className="p-4 text-center">Trạng Thái Kho</th>
                      <th className="p-4 text-right">Tác Vụ Nhập Kho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-50/50">
                    {inventory.map(item => (
                      <tr key={item.id} className="hover:bg-primary-50/10">
                        <td className="p-4 font-bold text-primary-950">{item.id}</td>
                        <td className="p-4 font-bold text-sage-900">{item.name}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-xl bg-sage-50 border border-primary-100 text-sage-700 font-medium">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-sage-950">{item.stock} {item.unit}</td>
                        <td className="p-4 text-center font-mono font-medium text-sage-500">{item.minQty} {item.unit}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            item.status === 'Đầy đủ' ? 'bg-green-100 text-green-700' :
                            item.status === 'Sắp hết' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleQuickRestock(item.id)}
                            className="px-3 py-1.5 bg-primary-900 hover:bg-primary-850 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Nhập 10
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ==========================================
          MODALS & OVERLAYS INTERFACES
          ========================================== */}
      
      {/* 1. Add User Account Modal */}
      {showAddAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[32px] border border-primary-100 p-6 sm:p-8 w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6 border-b border-primary-50 pb-4">
              <h3 className="font-serif text-lg font-bold text-sage-950">Tạo Tài Khoản Mới</h3>
              <button onClick={() => setShowAddAccountModal(false)} className="p-1 text-sage-400 hover:text-sage-950 rounded-full hover:bg-primary-50 cursor-pointer">
                <X className="h-5.5 w-5.5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Họ và Tên</label>
                <input 
                  type="text"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Địa Chỉ Email</label>
                <input 
                  type="email"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                  placeholder="name@nguson.com"
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Số Điện Thoại</label>
                <input 
                  type="text"
                  value={accountForm.phone}
                  onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                  placeholder="090xxxxxxx"
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Cấp Quyền (Role)</label>
                  <select 
                    value={accountForm.role}
                    onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value })}
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                  >
                    <option value="Customer">Customer (Khách hàng)</option>
                    <option value="Staff">Staff (Lễ tân/Dọn dẹp)</option>
                    <option value="Chef">Chef (Bếp trưởng)</option>
                    <option value="Spa">Spa (Nhân viên Spa)</option>
                    <option value="Yoga">Yoga (HLV Yoga)</option>
                    <option value="Physio">Physio (Chuyên viên VLTL)</option>
                    <option value="Manager">Manager (Quản lý)</option>
                    <option value="Admin">Admin (Quản trị viên)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Bộ Phận / Ghi chú</label>
                  <input 
                    type="text"
                    value={accountForm.department}
                    onChange={(e) => setAccountForm({ ...accountForm, department: e.target.value })}
                    placeholder="Lễ tân, Kỹ thuật..."
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowAddAccountModal(false)}
                  className="px-4 py-2 border border-primary-200 rounded-xl text-xs font-semibold text-sage-700 hover:bg-primary-50 cursor-pointer"
                >
                  Đóng
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-primary-900 text-white rounded-xl text-xs font-bold hover:bg-primary-850 cursor-pointer"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit User Account Modal */}
      {showEditAccountModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[32px] border border-primary-100 p-6 sm:p-8 w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6 border-b border-primary-50 pb-4">
              <h3 className="font-serif text-lg font-bold text-sage-950">Sửa Quyền & Tài Khoản</h3>
              <button onClick={() => setShowEditAccountModal(false)} className="p-1 text-sage-400 hover:text-sage-950 rounded-full hover:bg-primary-50 cursor-pointer">
                <X className="h-5.5 w-5.5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Họ và Tên</label>
                <input 
                  type="text"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Cấp Quyền (Role)</label>
                  <select 
                    value={accountForm.role}
                    onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value })}
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                  >
                    <option value="Customer">Customer (Khách hàng)</option>
                    <option value="Staff">Staff (Lễ tân/Dọn dẹp)</option>
                    <option value="Chef">Chef (Bếp trưởng)</option>
                    <option value="Spa">Spa (Nhân viên Spa)</option>
                    <option value="Yoga">Yoga (HLV Yoga)</option>
                    <option value="Physio">Physio (Chuyên viên VLTL)</option>
                    <option value="Manager">Manager (Quản lý)</option>
                    <option value="Admin">Admin (Quản trị viên)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Bộ Phận / Trực ban</label>
                  <input 
                    type="text"
                    value={accountForm.department}
                    onChange={(e) => setAccountForm({ ...accountForm, department: e.target.value })}
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowEditAccountModal(false)}
                  className="px-4 py-2 border border-primary-200 rounded-xl text-xs font-semibold text-sage-700 hover:bg-primary-50 cursor-pointer"
                >
                  Đóng
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-primary-900 text-white rounded-xl text-xs font-bold hover:bg-primary-850 cursor-pointer"
                >
                  Cập nhật tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Room Modal */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[32px] border border-primary-100 p-6 sm:p-8 w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6 border-b border-primary-50 pb-4">
              <h3 className="font-serif text-lg font-bold text-sage-950">Khai Báo Phòng Mới</h3>
              <button onClick={() => setShowAddRoomModal(false)} className="p-1 text-sage-400 hover:text-sage-950 rounded-full hover:bg-primary-50 cursor-pointer">
                <X className="h-5.5 w-5.5" />
              </button>
            </div>

            <form onSubmit={submitNewRoom} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Số Phòng</label>
                  <input 
                    type="text"
                    value={roomForm.id}
                    onChange={(e) => setRoomForm({ ...roomForm, id: e.target.value })}
                    placeholder="Ví dụ: 105"
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Tầng</label>
                  <input 
                    type="number"
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: parseInt(e.target.value) })}
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Loại Phòng</label>
                  <select 
                    value={roomForm.type}
                    onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Villa">Villa</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Sức chứa tối đa</label>
                  <input 
                    type="number"
                    value={roomForm.maxGuests}
                    onChange={(e) => setRoomForm({ ...roomForm, maxGuests: parseInt(e.target.value) })}
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Giá Phòng (/Đêm)</label>
                <input 
                  type="text"
                  value={roomForm.price}
                  onChange={(e) => setRoomForm({ ...roomForm, price: e.target.value })}
                  placeholder="Ví dụ: 1,800,000đ"
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-4 py-2 border border-primary-200 rounded-xl text-xs font-semibold text-sage-700 hover:bg-primary-50 cursor-pointer"
                >
                  Đóng
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-primary-900 text-white rounded-xl text-xs font-bold hover:bg-primary-850 cursor-pointer"
                >
                  Tạo phòng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Edit Room Modal */}
      {showEditRoomModal && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[32px] border border-primary-100 p-6 sm:p-8 w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6 border-b border-primary-50 pb-4">
              <h3 className="font-serif text-lg font-bold text-sage-950">Sửa Phòng {selectedRoom.id}</h3>
              <button onClick={() => setShowEditRoomModal(false)} className="p-1 text-sage-400 hover:text-sage-950 rounded-full hover:bg-primary-50 cursor-pointer">
                <X className="h-5.5 w-5.5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRoom} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Loại Phòng</label>
                  <select 
                    value={roomForm.type}
                    onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Villa">Villa</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Giá phòng/đêm</label>
                  <input 
                    type="text"
                    value={roomForm.price}
                    onChange={(e) => setRoomForm({ ...roomForm, price: e.target.value })}
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Tầng</label>
                  <input 
                    type="number"
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: parseInt(e.target.value) })}
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Sức chứa tối đa</label>
                  <input 
                    type="number"
                    value={roomForm.maxGuests}
                    onChange={(e) => setRoomForm({ ...roomForm, maxGuests: parseInt(e.target.value) })}
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                    required
                  />
                </div>
              </div>

              {/* Upload Room photo simulation */}
              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Ảnh Phòng</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="text"
                    value={roomForm.photo}
                    readOnly
                    className="flex-grow p-3 border border-primary-200 rounded-2xl bg-primary-50/30 text-xs text-sage-800 font-mono"
                  />
                  <button 
                    type="button" 
                    onClick={handleRoomPhotoUploadMock}
                    className="px-4 py-3 bg-[#1a2e05]/10 hover:bg-[#1a2e05]/20 text-[#1a2e05] rounded-2xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Image className="h-4 w-4" />
                    <span>Upload ảnh</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowEditRoomModal(false)}
                  className="px-4 py-2 border border-primary-200 rounded-xl text-xs font-semibold text-sage-700 hover:bg-primary-50 cursor-pointer"
                >
                  Đóng
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-primary-900 text-white rounded-xl text-xs font-bold hover:bg-primary-850 cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Add Resort Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[32px] border border-primary-100 p-6 sm:p-8 w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6 border-b border-primary-50 pb-4">
              <h3 className="font-serif text-lg font-bold text-sage-950">Thêm Dịch Vụ Resort Mới</h3>
              <button onClick={() => setShowAddServiceModal(false)} className="p-1 text-sage-400 hover:text-sage-950 rounded-full hover:bg-primary-50 cursor-pointer">
                <X className="h-5.5 w-5.5" />
              </button>
            </div>

            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Tên Dịch Vụ</label>
                <input 
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="Ví dụ: Tour ngắm san hô Cù Lao Chàm"
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Đơn Giá Cấu Hình</label>
                  <input 
                    type="text"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    placeholder="Ví dụ: 1,500,000đ"
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Phân Loại</label>
                  <select 
                    value={serviceForm.type}
                    onChange={(e) => setServiceForm({ ...serviceForm, type: e.target.value })}
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                  >
                    <option value="Spa">Spa</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Laundry">Laundry</option>
                    <option value="Transport">Transport</option>
                    <option value="Tour">Tour</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-4 py-2 border border-primary-200 rounded-xl text-xs font-semibold text-sage-700 hover:bg-primary-50 cursor-pointer"
                >
                  Đóng
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-primary-900 text-white rounded-xl text-xs font-bold hover:bg-primary-850 cursor-pointer"
                >
                  Khai báo dịch vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Edit Resort Service Modal */}
      {showEditServiceModal && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[32px] border border-primary-100 p-6 sm:p-8 w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6 border-b border-primary-50 pb-4">
              <h3 className="font-serif text-lg font-bold text-sage-950">Sửa Dịch Vụ Resort</h3>
              <button onClick={() => setShowEditServiceModal(false)} className="p-1 text-sage-400 hover:text-sage-950 rounded-full hover:bg-primary-50 cursor-pointer">
                <X className="h-5.5 w-5.5" />
              </button>
            </div>

            <form onSubmit={handleUpdateService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Tên Dịch Vụ</label>
                <input 
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Cấu hình Đơn Giá</label>
                  <input 
                    type="text"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Phân Loại</label>
                  <select 
                    value={serviceForm.type}
                    onChange={(e) => setServiceForm({ ...serviceForm, type: e.target.value })}
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                  >
                    <option value="Spa">Spa</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Laundry">Laundry</option>
                    <option value="Transport">Transport</option>
                    <option value="Tour">Tour</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowEditServiceModal(false)}
                  className="px-4 py-2 border border-primary-200 rounded-xl text-xs font-semibold text-sage-700 hover:bg-primary-50 cursor-pointer"
                >
                  Đóng
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-primary-900 text-white rounded-xl text-xs font-bold hover:bg-primary-850 cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Edit Payment Transaction Modal */}
      {showEditPaymentModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[32px] border border-primary-100 p-6 sm:p-8 w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6 border-b border-primary-50 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-sage-950">Chỉnh Sửa Giao Dịch Hóa Đơn</h3>
                <p className="text-[10px] text-sage-400 mt-0.5">Admin sửa hóa đơn: {selectedPayment.id}</p>
              </div>
              <button onClick={() => setShowEditPaymentModal(false)} className="p-1 text-sage-400 hover:text-sage-950 rounded-full hover:bg-primary-50 cursor-pointer">
                <X className="h-5.5 w-5.5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Tiền Phòng</label>
                  <input 
                    type="text"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Tiền Dịch Vụ</label>
                  <input 
                    type="text"
                    value={paymentForm.servicesAmount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, servicesAmount: e.target.value })}
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Tổng Số Tiền Hóa Đơn</label>
                <input 
                  type="text"
                  value={paymentForm.total}
                  onChange={(e) => setPaymentForm({ ...paymentForm, total: e.target.value })}
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Phương thức</label>
                  <select 
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                  >
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="Chuyển khoản VNPAY">Chuyển khoản VNPAY</option>
                    <option value="Momo">Momo</option>
                    <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Trạng Thái</label>
                  <select 
                    value={paymentForm.status}
                    onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                  >
                    <option value="Unpaid">Unpaid (Chưa thanh toán)</option>
                    <option value="Paid">Paid (Đã thanh toán)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowEditPaymentModal(false)}
                  className="px-4 py-2 border border-primary-200 rounded-xl text-xs font-semibold text-sage-700 hover:bg-primary-50 cursor-pointer"
                >
                  Đóng
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-primary-900 text-white rounded-xl text-xs font-bold hover:bg-primary-850 cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Print Invoice View Modal */}
      {showInvoicePrintModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[32px] border border-primary-100 p-6 sm:p-8 w-full max-w-lg shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6 border-b border-primary-50 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-sage-950">In Hóa Đơn Xuất Bản</h3>
                <p className="text-[10px] text-sage-400 mt-0.5">Mã Giao Dịch: {selectedPayment.id}</p>
              </div>
              <button onClick={() => { setShowInvoicePrintModal(false); setSelectedPayment(null); }} className="p-1 text-sage-400 hover:text-sage-950 rounded-full hover:bg-primary-50 cursor-pointer">
                <X className="h-5.5 w-5.5" />
              </button>
            </div>

            <div className="p-5 bg-primary-50/10 border border-primary-100 rounded-2xl text-xs space-y-4 font-mono">
              <div className="text-center border-b border-primary-100 pb-3">
                <span className="font-bold text-sm tracking-wide block uppercase">NGŨ SƠN RESORT & SPA</span>
                <span className="text-[9px] text-sage-500 font-light block">Thung lũng Ngũ Sơn, Hòa Vang, Đà Nẵng</span>
                <span className="text-[9px] text-sage-500 font-light block">Hotline ban điều hành: 1900 8888</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="font-bold text-sage-600 block">KHÁCH HÀNG:</span>
                  <span>{selectedPayment.guest}</span>
                </div>
                <div>
                  <span className="font-bold text-sage-600 block">MÃ GD ĐƠN PHÒNG:</span>
                  <span>{selectedPayment.bookingId}</span>
                </div>
                <div>
                  <span className="font-bold text-sage-600 block">SỐ PHÒNG:</span>
                  <span>Phòng {selectedPayment.room}</span>
                </div>
                <div>
                  <span className="font-bold text-sage-600 block">PHƯƠNG THỨC GD:</span>
                  <span>{selectedPayment.method}</span>
                </div>
              </div>

              <div className="border-t border-b border-primary-100 py-3 text-[10px] space-y-1.5">
                <div className="flex justify-between">
                  <span>Tiền phòng lưu trú:</span>
                  <span className="font-bold">{selectedPayment.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiền dịch vụ phát sinh:</span>
                  <span className="font-bold">{selectedPayment.servicesAmount}</span>
                </div>
                <div className="flex justify-between text-xs font-bold pt-2 border-t border-primary-50 text-primary-950">
                  <span>TỔNG CỘNG HÓA ĐƠN:</span>
                  <span>{selectedPayment.total}</span>
                </div>
              </div>

              <div className="text-center text-[9px] text-sage-500 font-light pt-2">
                <span>Cảm ơn quý khách đã lưu trú tại Ngũ Sơn Resort!</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-6 border-t border-primary-50 mt-6">
              <button 
                type="button" 
                onClick={() => { setShowInvoicePrintModal(false); setSelectedPayment(null); }}
                className="px-4 py-2 border border-primary-200 rounded-xl text-xs font-semibold text-sage-700 hover:bg-primary-50 cursor-pointer"
              >
                Đóng
              </button>
              <button 
                onClick={() => { window.print(); }}
                className="px-5 py-2 bg-primary-900 text-white rounded-xl text-xs font-bold hover:bg-primary-850 flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>In ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Add Inventory Item Modal */}
      {showAddInventoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[32px] border border-primary-100 p-6 sm:p-8 w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6 border-b border-primary-50 pb-4">
              <h3 className="font-serif text-lg font-bold text-sage-950">Khai Báo Thiết Bị / Vật Tư Mới</h3>
              <button onClick={() => setShowAddInventoryModal(false)} className="p-1 text-sage-400 hover:text-sage-950 rounded-full hover:bg-primary-50 cursor-pointer">
                <X className="h-5.5 w-5.5" />
              </button>
            </div>

            <form onSubmit={handleCreateInventory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Tên vật tư / sản phẩm</label>
                <input 
                  type="text"
                  value={inventoryForm.name}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                  placeholder="Ví dụ: Khăn tắm Luxury 70x140cm"
                  className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Đơn Vị Tính</label>
                  <select 
                    value={inventoryForm.unit}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })}
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                  >
                    <option value="Lít">Lít</option>
                    <option value="Kg">Kg</option>
                    <option value="Bộ">Bộ</option>
                    <option value="Chai">Chai</option>
                    <option value="Thùng">Thùng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Danh mục sử dụng</label>
                  <select 
                    value={inventoryForm.category}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, category: e.target.value })}
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                  >
                    <option value="Spa trị liệu">Spa trị liệu</option>
                    <option value="Buồng phòng">Buồng phòng</option>
                    <option value="Nhà hàng thực dưỡng">Nhà hàng thực dưỡng</option>
                    <option value="Kỹ thuật">Kỹ thuật</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Số lượng nhập tồn ban đầu</label>
                  <input 
                    type="number"
                    value={inventoryForm.stock}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, stock: e.target.value })}
                    placeholder="Ví dụ: 30"
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Mức tối thiểu cần cảnh báo</label>
                  <input 
                    type="number"
                    value={inventoryForm.minQty}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, minQty: e.target.value })}
                    placeholder="Ví dụ: 10"
                    className="w-full p-3.5 border border-primary-200 rounded-2xl bg-primary-50/20 text-xs focus:outline-none text-sage-950 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowAddInventoryModal(false)}
                  className="px-4 py-2 border border-primary-200 rounded-xl text-xs font-semibold text-sage-700 hover:bg-primary-50 cursor-pointer"
                >
                  Đóng
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-primary-900 text-white rounded-xl text-xs font-bold hover:bg-primary-850 cursor-pointer"
                >
                  Khai báo tồn kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
