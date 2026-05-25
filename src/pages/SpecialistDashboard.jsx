import { useState } from 'react';
import { 
  Flower, Heart, Calendar, Users, Package, Clock, ShieldCheck, X, Check, 
  PlusCircle, Edit, Search, Play, CheckCircle2, ChevronRight, LogOut, 
  Activity, AlertTriangle, Sparkles, Sliders, Clipboard, RefreshCw, BarChart2
} from 'lucide-react';

// ==========================================
// MOCK DATA FOR SPECIALIST DEPARTMENTS
// ==========================================

// 1. SPA DEPARTMENT DATA
const initialSpaAppointments = [
  { id: 'SPA-8801', guest: 'Trần Thị Mai', room: '101', service: 'Massage Trị Liệu Đá Núi Lửa', therapist: 'Nguyễn Thu Thảo', time: '09:00 - 10:30', status: 'Pending', note: 'Khách thích lực vừa phải, tập trung vai gáy' },
  { id: 'SPA-8802', guest: 'David Miller', room: '302', service: 'Tắm Ngâm Lá Thảo Dược Dao Đỏ', therapist: 'Lê Văn Tùng', time: '11:00 - 12:00', status: 'In Progress', note: 'Không dùng tinh dầu sả, dùng tinh dầu oải hương' },
  { id: 'SPA-8803', guest: 'Phan Thanh Thủy', room: '104', service: 'Massage Trị Liệu Đá Núi Lửa', therapist: 'Nguyễn Thu Thảo', time: '14:00 - 15:30', status: 'Completed', note: 'Khách dị ứng nhẹ với phấn hoa' }
];

const initialSpaRooms = [
  { name: 'Phòng VIP Hoa Sen (Sen Room)', type: 'VIP Trị liệu', status: 'Occupied', currentGuest: 'David Miller' },
  { name: 'Phòng Thảo Dược Đôi (Twin Herbal Room)', type: 'Ngâm tắm thảo dược', status: 'Vacant', currentGuest: '' },
  { name: 'Phòng Trị Liệu 1 (Therapy Room 1)', type: 'Massage đá nóng', status: 'Cleaning', currentGuest: '' },
  { name: 'Phòng Trị Liệu 2 (Therapy Room 2)', type: 'Massage bấm huyệt', status: 'Vacant', currentGuest: '' }
];

const initialSpaInventory = [
  { id: 'SPI-01', name: 'Tinh dầu Oải Hương (Lavender Oil)', stock: 5, unit: 'Chai 500ml', minQty: 3, status: 'Đầy đủ' },
  { id: 'SPI-02', name: 'Lá tắm thảo dược Dao Đỏ khô', stock: 12, unit: 'Gói 1kg', minQty: 15, status: 'Sắp hết' },
  { id: 'SPI-03', name: 'Đá nóng bazan trị liệu (Bộ)', stock: 8, unit: 'Bộ 16 viên', minQty: 5, status: 'Đầy đủ' },
  { id: 'SPI-04', name: 'Khăn trải giường thảo dược', stock: 2, unit: 'Bộ drap', minQty: 10, status: 'Sắp hết' }
];

// 2. YOGA DEPARTMENT DATA
const initialYogaClasses = [
  { id: 'YOG-101', name: 'Lớp Thiền Định Phục Hồi (Meditation)', instructor: 'Yogi Master Ananda', time: '06:00 - 07:15', location: 'Sàn gỗ ngắm hoàng hôn sát biển', registeredCount: 8, registeredGuests: ['David Miller', 'Trần Thị Mai', 'Nguyễn Bích Liên', 'Lê Hoàng Nam', 'Phạm Minh Tuấn', 'Vũ Đức Thành', 'Trần Văn Tấn', 'Lê Thị Thu'] },
  { id: 'YOG-102', name: 'Hatha Yoga Cơ Bản', instructor: 'Yogi Master Ananda', time: '08:30 - 09:45', location: 'Sân cỏ hướng vườn thiền', registeredCount: 4, registeredGuests: ['Nguyễn Bích Liên', 'Lê Hoàng Nam', 'Phan Thanh Thủy', 'Đỗ Quốc Khánh'] },
  { id: 'YOG-103', name: 'Yoga Bay Trị Liệu Cột Sống (Aerial Yoga)', instructor: 'Coach Thu Hằng', time: '16:30 - 17:45', location: 'Phòng Yoga Vòm Kính', registeredCount: 3, registeredGuests: ['Trần Thị Mai', 'Phan Thanh Thủy', 'Lê Hoàng Nam'] }
];

const initialYogaEquipment = [
  { name: 'Thảm tập Yoga Cao Su Tự Nhiên', total: 30, clean: 25, laundry: 5, bad: 0 },
  { name: 'Gạch xốp trợ thế Yoga (Blocks)', total: 40, clean: 40, laundry: 0, bad: 0 },
  { name: 'Dây đai kéo giãn Yoga (Straps)', total: 20, clean: 18, laundry: 2, bad: 0 },
  { name: 'Võng tập Yoga Bay (Hammocks)', total: 15, clean: 15, laundry: 0, bad: 0 }
];

const initialAttendance = {
  'YOG-101': { 'David Miller': true, 'Trần Thị Mai': true, 'Nguyễn Bích Liên': false, 'Lê Hoàng Nam': true },
  'YOG-102': { 'Nguyễn Bích Liên': true, 'Lê Hoàng Nam': false, 'Phan Thanh Thủy': true },
  'YOG-103': { 'Trần Thị Mai': false, 'Phan Thanh Thủy': false }
};

// 3. PHYSIOTHERAPY DEPARTMENT DATA
const initialPhysioAppointments = [
  { id: 'PHY-001', guest: 'Lê Hoàng Nam', room: '201', diagnosis: 'Đau cột sống thắt lưng cấp L4-L5', service: 'Kéo giãn cột sống máy + Siêu âm', therapist: 'Dr. Nguyễn Quốc Hải', time: '08:30 - 09:30', status: 'Pending' },
  { id: 'PHY-002', guest: 'Phạm Minh Tuấn', room: '102', diagnosis: 'Hội chứng thoái hóa khớp gối giai đoạn 2', service: 'Laser trị liệu + Sóng ngắn', therapist: 'Dr. Nguyễn Quốc Hải', time: '10:00 - 11:00', status: 'In Progress' },
  { id: 'PHY-003', guest: 'Vũ Đức Thành', room: '302', diagnosis: 'Cứng khớp vai sau chấn thương thể thao', service: 'Vận động trị liệu khớp vai', therapist: 'Therapist Minh Đức', time: '15:00 - 16:00', status: 'Completed' }
];

const initialPatientRecords = [
  { 
    guest: 'Lê Hoàng Nam', 
    room: '201', 
    history: [
      { date: '2026-05-23', symptoms: 'Đau thắt lưng lan mông trái, VAS 7/10', therapy: 'Chườm nóng + Điện xung + Kéo dãn lực 20kg', progress: 'Sau kéo dãn giảm đau nhẹ, VAS còn 6/10' },
      { date: '2026-05-24', symptoms: 'Đau âm ỉ thắt lưng, co thắt cơ dựng sống hai bên', therapy: 'Siêu âm trị liệu tần số 1MHz + Kéo dãn lực 22kg', progress: 'Cơ lưng mềm hơn, cúi người đỡ buốt, VAS 5/10' }
    ],
    recommendations: 'Tránh ngồi quá 45 phút, không bê vác vật nặng. Tập bài tập phục hồi cơ lõi Core Exercise ngày 2 lần.'
  },
  { 
    guest: 'Phạm Minh Tuấn', 
    room: '102', 
    history: [
      { date: '2026-05-24', symptoms: 'Đau mặt trước khớp gối phải khi leo cầu thang, sưng nề nhẹ', therapy: 'Laser cường độ cao khớp gối + Chườm lạnh', progress: 'Đỡ sưng khớp, cảm giác căng tức đầu gối giảm' }
    ],
    recommendations: 'Hạn chế đi cầu thang bộ. Đeo băng thun hỗ trợ khớp gối khi đi bộ.'
  }
];

const initialPhysioEquipment = [
  { name: 'Máy Kéo Giãn Cột Sống Tự Động', code: 'EQ-PHY-01', status: 'Available', usageHours: 120 },
  { name: 'Thiết Bị Laser Trị Liệu Cường Độ Cao', code: 'EQ-PHY-02', status: 'Available', usageHours: 85 },
  { name: 'Máy Siêu Âm Trị Liệu Đa Tần', code: 'EQ-PHY-03', status: 'Under Maintenance', usageHours: 240 },
  { name: 'Hệ Thống Thử Sức Cơ Vận Động', code: 'EQ-PHY-04', status: 'Occupied', usageHours: 110 }
];

export default function SpecialistDashboard() {
  // Active Role switcher: 'spa' | 'yoga' | 'physio'
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('specialistRole') || 'spa';
  });

  const isLocked = !!localStorage.getItem('specialistRole');
  
  // Tab within active role
  const [activeTab, setActiveTab] = useState('overview');

  // 1. Spa States
  const [spaAppointments, setSpaAppointments] = useState(initialSpaAppointments);
  const [spaRooms, setSpaRooms] = useState(initialSpaRooms);
  const [spaInventory] = useState(initialSpaInventory);
  
  // 2. Yoga States
  const [yogaClasses] = useState(initialYogaClasses);
  const [yogaEquipment, setYogaEquipment] = useState(yogaEquipmentStateChanger);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [selectedYogaClassId, setSelectedYogaClassId] = useState('YOG-101');

  // 3. Physio States
  const [physioAppointments, setPhysioAppointments] = useState(initialPhysioAppointments);
  const [patientRecords, setPatientRecords] = useState(initialPatientRecords);
  const [physioEquipment, setPhysioEquipment] = useState(initialPhysioEquipment);

  // Search & Modals
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState('Lê Hoàng Nam');
  const [showRequestInventoryModal, setShowRequestInventoryModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ name: 'Tinh dầu Oải Hương', qty: '' });

  // Form states for clinical physio note
  const [newPhysioRecord, setNewPhysioRecord] = useState({ symptoms: '', therapy: '', progress: '' });

  // Mobile navigation
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper to init Yoga equipment state
  function yogaEquipmentStateChanger() {
    return initialYogaEquipment;
  }

  // Handle switching major roles
  const handleRoleChange = (role) => {
    setActiveRole(role);
    setActiveTab('overview');
  };

  // ==========================================
  // SPA ACTIONS
  // ==========================================
  const handleUpdateSpaStatus = (id, newStatus) => {
    setSpaAppointments(prev => prev.map(app => {
      if (app.id === id) {
        alert(`Đã chuyển ca trị liệu của ${app.guest} sang: ${
          newStatus === 'In Progress' ? 'Đang trị liệu' : 'Đã hoàn thành'
        }`);
        return { ...app, status: newStatus };
      }
      return app;
    }));
  };

  const handleToggleRoomStatus = (roomName) => {
    setSpaRooms(prev => prev.map(room => {
      if (room.name === roomName) {
        let nextStatus = 'Vacant';
        if (room.status === 'Vacant') nextStatus = 'Occupied';
        else if (room.status === 'Occupied') nextStatus = 'Cleaning';
        
        return { ...room, status: nextStatus, currentGuest: nextStatus === 'Occupied' ? 'Khách đặt chỗ' : '' };
      }
      return room;
    }));
  };

  const handleRequestSpaInventory = (e) => {
    e.preventDefault();
    if (!requestForm.qty) {
      alert('Vui lòng nhập số lượng.');
      return;
    }
    alert(`Đã gửi yêu cầu cấp thêm ${requestForm.qty} đơn vị nguyên liệu: ${requestForm.name}.`);
    setShowRequestInventoryModal(false);
    setRequestForm({ name: 'Tinh dầu Oải Hương', qty: '' });
  };

  // ==========================================
  // YOGA ACTIONS
  // ==========================================
  const handleToggleAttendance = (classId, guestName) => {
    setAttendance(prev => {
      const classAttendance = prev[classId] || {};
      const currentVal = !!classAttendance[guestName];
      return {
        ...prev,
        [classId]: {
          ...classAttendance,
          [guestName]: !currentVal
        }
      };
    });
  };

  const handleEquipmentClean = (name) => {
    setYogaEquipment(prev => prev.map(eq => {
      if (eq.name === name && eq.laundry > 0) {
        alert(`Đã vệ sinh sạch sẽ thảm/dây đai tập: ${name}`);
        return { ...eq, clean: eq.clean + 1, laundry: eq.laundry - 1 };
      }
      return eq;
    }));
  };

  // ==========================================
  // PHYSIO ACTIONS
  // ==========================================
  const handleUpdatePhysioStatus = (id, newStatus) => {
    setPhysioAppointments(prev => prev.map(app => {
      if (app.id === id) {
        alert(`Đã cập nhật trạng thái ca trị liệu máy sang: ${newStatus}`);
        return { ...app, status: newStatus };
      }
      return app;
    }));
  };

  const handleAddClinicalRecord = (e) => {
    e.preventDefault();
    if (!newPhysioRecord.symptoms || !newPhysioRecord.therapy) {
      alert('Vui lòng điền triệu chứng lâm sàng và chỉ định trị liệu.');
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    
    setPatientRecords(prev => prev.map(record => {
      if (record.guest === selectedPatientName) {
        const nextHistory = [
          ...record.history,
          { 
            date: todayStr, 
            symptoms: newPhysioRecord.symptoms, 
            therapy: newPhysioRecord.therapy, 
            progress: newPhysioRecord.progress || 'Tiến triển bình thường'
          }
        ];
        return { ...record, history: nextHistory };
      }
      return record;
    }));

    setShowAddRecordModal(false);
    setNewPhysioRecord({ symptoms: '', therapy: '', progress: '' });
    alert('Đã cập nhật thành công hồ sơ bệnh án phục hồi trị liệu.');
  };

  const handleToggleMachineStatus = (code) => {
    setPhysioEquipment(prev => prev.map(eq => {
      if (eq.code === code) {
        const nextStatus = eq.status === 'Available' ? 'Under Maintenance' : eq.status === 'Under Maintenance' ? 'Occupied' : 'Available';
        return { ...eq, status: nextStatus };
      }
      return eq;
    }));
  };

  return (
    <div className="admin-theme min-h-screen bg-[#fafbfa] flex flex-col lg:flex-row antialiased text-slate-800 pt-0 relative">
      
      {/* Mobile Header Menu */}
      <header className="lg:hidden w-full bg-[#0a5c53] text-white px-4 py-3.5 flex items-center justify-between shadow-md z-30">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-[#14b8a6] rounded-xl text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-base font-bold leading-tight">Trung Tâm Trị Liệu & Yoga</h1>
            <span className="text-[9px] text-teal-300 font-bold uppercase tracking-wider block">Wellness Center Hub</span>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-teal-850 hover:bg-teal-800 transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Sliders className="h-6 w-6" />}
        </button>
      </header>

      {/* Backdrop for Mobile Navigation */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-25"
        />
      )}

      {/* ==========================================
          SIDEBAR NAVIGATION (DRAWER FOR MOBILE)
          ========================================== */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#073b35] text-white flex flex-col z-30 transition-transform duration-300 shadow-xl border-r border-[#042824] lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Profile and Role selection header */}
        <div className="p-6 border-b border-[#0d524a] bg-[#05322d]">
          <div className="flex items-center space-x-3 mb-5">
            <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-[#073b35] font-black border border-teal-300 shadow-inner">
              WS
            </div>
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">Chuyên Viên Trị Liệu</h4>
              <span className="text-[10px] text-teal-300 font-semibold tracking-wider block uppercase">Wellness Staff</span>
            </div>
          </div>

          {/* Role selector buttons */}
          <div className="space-y-1.5 pt-2">
            {isLocked ? (
              <div>
                <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest mb-1.5 block">Quyền Hạn Được Phân</p>
                <div className="bg-[#0c4a43] border border-teal-500/20 rounded-xl p-3 flex items-center space-x-2.5 shadow-inner">
                  {activeRole === 'spa' && <Flower className="h-5 w-5 text-teal-350" />}
                  {activeRole === 'yoga' && <Heart className="h-5 w-5 text-teal-350" />}
                  {activeRole === 'physio' && <Activity className="h-5 w-5 text-teal-350" />}
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {activeRole === 'spa' && 'Nhân viên Spa'}
                      {activeRole === 'yoga' && 'HLV Yoga & Thiền'}
                      {activeRole === 'physio' && 'Chuyên viên VLTL'}
                    </span>
                    <span className="text-[9px] text-teal-350/90 font-medium block">Đã khóa theo tài khoản</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-[#052924] border border-[#0d524a] p-2 rounded-xl mb-3">
                  <span className="text-[8px] text-amber-300 font-bold block">⚠️ CHẾ ĐỘ DEMO (DEVELOPER/ADMIN)</span>
                  <span className="text-[8px] text-teal-300 font-light block leading-normal">
                    Đăng nhập tài khoản Spa/Yoga/Physio để xem giao diện bị giới hạn phân quyền.
                  </span>
                </div>
                <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest mb-1.5 block">Chọn Bộ Phận Chuyên Môn</p>
                {[
                  { id: 'spa', label: 'Spa & Trị Liệu Đá Nóng', icon: Flower },
                  { id: 'yoga', label: 'HLV Yoga & Thiền Định', icon: Heart },
                  { id: 'physio', label: 'Vật Lý Trị Liệu Cột Sống', icon: Activity }
                ].map(role => {
                  const Icon = role.icon;
                  const isSelected = activeRole === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleRoleChange(role.id)}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        isSelected ? 'bg-teal-400 text-[#073b35] shadow-md font-extrabold' : 'text-teal-100 hover:bg-[#0d524a]/50 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{role.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Tab navigation relative to selected role */}
        <nav className="flex-grow py-6 px-3.5 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest px-3.5 mb-2 block">Nghiệp Vụ Bộ Phận</p>
          
          {/* SPA TABS */}
          {activeRole === 'spa' && [
            { id: 'overview', label: '1. Thống kê & Sơ đồ phòng', icon: BarChart2 },
            { id: 'appointments', label: '2. Lịch hẹn trị liệu', icon: Calendar, badge: `${spaAppointments.filter(a => a.status !== 'Completed').length}` },
            { id: 'inventory', label: '3. Kho dầu & Thảo dược', icon: Package, badge: `${spaInventory.filter(i => i.status !== 'Đầy đủ').length}` }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-150 cursor-pointer ${isActive ? 'bg-[#14b8a6] text-white shadow-md' : 'text-teal-200 hover:bg-[#0d524a]/50 hover:text-white'}`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </div>
                {tab.badge && tab.badge !== '0' && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0 ml-1.5 ${isActive ? 'bg-teal-900 text-white' : 'bg-teal-900/50 text-teal-300'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* YOGA TABS */}
          {activeRole === 'yoga' && [
            { id: 'overview', label: '1. Lịch lớp Yoga ngày', icon: Calendar },
            { id: 'attendance', label: '2. Điểm danh học viên', icon: Users },
            { id: 'equipment', label: '3. Quản lý thảm & dụng cụ', icon: Package }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-150 cursor-pointer ${isActive ? 'bg-[#14b8a6] text-white shadow-md' : 'text-teal-200 hover:bg-[#0d524a]/50 hover:text-white'}`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </div>
              </button>
            );
          })}

          {/* PHYSIOTHERAPY TABS */}
          {activeRole === 'physio' && [
            { id: 'overview', label: '1. Danh sách ca trị liệu', icon: Clock, badge: `${physioAppointments.filter(a => a.status !== 'Completed').length}` },
            { id: 'records', label: '2. Bệnh án & Phục hồi', icon: Clipboard },
            { id: 'equipment', label: '3. Giám sát thiết bị máy', icon: Sliders }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-150 cursor-pointer ${isActive ? 'bg-[#14b8a6] text-white shadow-md' : 'text-teal-200 hover:bg-[#0d524a]/50 hover:text-white'}`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </div>
                {tab.badge && tab.badge !== '0' && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0 ml-1.5 ${isActive ? 'bg-teal-900 text-white' : 'bg-teal-900/50 text-teal-300'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Exit portal button */}
        <div className="p-4 border-t border-[#0d524a] bg-[#05322d]">
          <button 
            onClick={() => { 
              if (confirm('Bạn muốn quay lại đăng nhập?')) {
                localStorage.removeItem('specialistRole');
                window.location.href = '/dang-nhap';
              }
            }} 
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-teal-900 hover:bg-red-950 text-teal-300 hover:text-red-300 text-xs font-bold transition-all cursor-pointer border border-[#0d524a]"
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất hệ thống</span>
          </button>
        </div>
      </aside>

      {/* ==========================================
          MAIN CONTAINER AREA
          ========================================== */}
      <main className="flex-grow min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen custom-scrollbar">
        
        {/* Dynamic sub-header banner */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-teal-100 mb-6 gap-3">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
              {activeRole === 'spa' && activeTab === 'overview' && 'Spa: Giám sát sơ đồ phòng trị liệu'}
              {activeRole === 'spa' && activeTab === 'appointments' && 'Spa: Lịch hẹn ca trị liệu của khách'}
              {activeRole === 'spa' && activeTab === 'inventory' && 'Spa: Bảng kiểm kê tinh dầu thảo dược'}
              
              {activeRole === 'yoga' && activeTab === 'overview' && 'Yoga: Lịch lớp học Yoga trong ngày'}
              {activeRole === 'yoga' && activeTab === 'attendance' && 'Yoga: Bảng điểm danh học viên đăng ký'}
              {activeRole === 'yoga' && activeTab === 'equipment' && 'Yoga: Giám sát dụng cụ tập luyện'}

              {activeRole === 'physio' && activeTab === 'overview' && 'Vật lý trị liệu: Ca trị liệu máy'}
              {activeRole === 'physio' && activeTab === 'records' && 'Vật lý trị liệu: Bệnh án & Tiến trình phục hồi'}
              {activeRole === 'physio' && activeTab === 'equipment' && 'Vật lý trị liệu: Trạng thái máy móc trị liệu'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Bộ phận chuyên trách: <strong className="text-teal-700 font-bold uppercase">{
                activeRole === 'spa' ? 'Khu Vực Spa & Xông Hơi' :
                activeRole === 'yoga' ? 'Học Viện Thiền Định & Yoga' : 'Khoa Phục Hồi Chức Năng Cột Sống'
              }</strong>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="p-2 bg-teal-50 border border-teal-100 rounded-xl px-3.5 py-1 text-[10px] font-bold text-[#0a5c53] uppercase tracking-wider flex items-center space-x-1.5 shadow-3xs">
              <Activity className="h-3.5 w-3.5 animate-pulse text-[#14b8a6]" />
              <span>Wellness Center Live</span>
            </span>
          </div>
        </header>

        {/* ======================================================================
            ROLE 1: SPA DEPARTMENT PANELS
            ====================================================================== */}
        {activeRole === 'spa' && (
          <div className="space-y-6">
            
            {/* TAB 1: SPA OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in text-left">
                {/* Stats cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-4 border border-teal-50 shadow-xs flex items-center space-x-3.5">
                    <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
                      <Calendar className="h-5.5 w-5.5" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Hẹn hôm nay</p>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">{spaAppointments.length} ca đặt</h3>
                      <span className="text-[8px] text-teal-600 font-medium">Đã bao gồm vãng lai</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-teal-50 shadow-xs flex items-center space-x-3.5">
                    <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                      <Clock className="h-5.5 w-5.5" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Đang trị liệu</p>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">{spaAppointments.filter(a => a.status === 'In Progress').length} ca</h3>
                      <span className="text-[8px] text-amber-600 font-medium">Trong phòng trị liệu</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-teal-50 shadow-xs flex items-center space-x-3.5">
                    <div className="p-3 bg-red-50 text-red-700 rounded-xl">
                      <AlertTriangle className="h-5.5 w-5.5" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Dược liệu sắp hết</p>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">{spaInventory.filter(i => i.status !== 'Đầy đủ').length} loại</h3>
                      <span className="text-[8px] text-red-600 font-medium">Cần đặt thêm gấp</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-teal-50 shadow-xs flex items-center space-x-3.5">
                    <div className="p-3 bg-green-50 text-green-700 rounded-xl">
                      <ShieldCheck className="h-5.5 w-5.5" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Phòng spa trống</p>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">{spaRooms.filter(r => r.status === 'Vacant').length} phòng</h3>
                      <span className="text-[8px] text-green-600 font-medium">Sẵn sàng nhận khách</span>
                    </div>
                  </div>
                </div>

                {/* Sơ đồ phòng trị liệu Spa */}
                <div className="bg-white border border-teal-50 rounded-3xl p-6 shadow-xs">
                  <h3 className="font-serif text-lg font-bold text-slate-900 mb-5">Sơ Đồ & Tình Trạng Hoạt Động Phòng Trị Liệu Spa</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {spaRooms.map(room => (
                      <div 
                        key={room.name} 
                        className={`rounded-2xl border p-4 flex flex-col justify-between h-44 text-left shadow-2xs transition-all ${
                          room.status === 'Occupied' ? 'bg-[#f0fdf4] border-green-200' :
                          room.status === 'Cleaning' ? 'bg-[#fffbeb] border-amber-200' : 'bg-slate-50/50 border-slate-100'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">{room.type}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wide ${
                              room.status === 'Occupied' ? 'bg-green-100 text-green-800' :
                              room.status === 'Cleaning' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {room.status === 'Occupied' ? 'Đang có khách' : room.status === 'Cleaning' ? 'Đang dọn dẹp' : 'Đang Trống'}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm mt-1">{room.name}</h4>
                          {room.currentGuest && (
                            <p className="text-xs text-slate-500 font-medium flex items-center">
                              <Users className="h-3.5 w-3.5 mr-1 text-teal-600" />
                              <span>Khách: <strong className="text-slate-700">{room.currentGuest}</strong></span>
                            </p>
                          )}
                        </div>

                        <div className="pt-2.5 border-t border-slate-150 flex justify-between items-center mt-2">
                          <span className="text-[10px] text-slate-400">Trạng thái đổi</span>
                          <button
                            onClick={() => handleToggleRoomStatus(room.name)}
                            className="px-2.5 py-1 bg-white hover:bg-teal-50 border border-slate-200 text-teal-800 rounded-lg text-[9px] font-bold cursor-pointer"
                          >
                            Đổi trạng thái
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SPA APPOINTMENTS */}
            {activeTab === 'appointments' && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="bg-white border border-teal-50 rounded-3xl p-5 shadow-xs flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Danh Sách Ca Đặt Trị Liệu Spa Trong Ngày</h3>
                    <p className="text-xs text-slate-500">Giám sát giờ giấc khách đến trị liệu, phân công kỹ thuật viên xoa bóp bấm huyệt và thảo dược tắm.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {spaAppointments.map(app => (
                    <div 
                      key={app.id} 
                      className={`bg-white rounded-3xl border shadow-xs p-5 flex flex-col justify-between min-h-[220px] h-auto transition-all ${
                        app.status === 'In Progress' ? 'border-amber-300 ring-2 ring-amber-50' : 
                        app.status === 'Completed' ? 'border-green-200 opacity-80' : 'border-slate-200/60'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                          <div>
                            <span className="text-[9px] font-mono text-slate-400 font-bold block">{app.id}</span>
                            <span className="text-xs font-bold text-[#0a5c53] font-mono block mt-0.5">PHÒNG {app.room}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            app.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                            app.status === 'In Progress' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-green-100 text-green-800'
                          }`}>
                            {app.status === 'Pending' ? 'Chờ phục vụ' : app.status === 'In Progress' ? 'Đang trị liệu' : 'Đã xong'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 mt-1">{app.service}</h4>
                        <div className="space-y-1 text-xs text-slate-600 font-medium">
                          <p className="flex items-center"><Users className="h-3.5 w-3.5 mr-1.5 text-teal-600" />Khách: <strong className="text-slate-800 ml-1">{app.guest}</strong></p>
                          <p className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1.5 text-teal-600" />Thời gian: <span className="font-mono text-slate-800 ml-1">{app.time}</span></p>
                          <p className="flex items-center"><ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-teal-600" />KTV phụ trách: <span className="text-slate-700 ml-1">{app.therapist}</span></p>
                        </div>

                        {app.note && (
                          <div className="bg-amber-50 border-l-2 border-amber-500 text-amber-800 p-2.5 rounded-r-lg text-[10px] font-light leading-relaxed mt-2.5">
                            Yêu cầu đặc biệt: {app.note}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center mt-3">
                        <span className="text-[10px] text-slate-400">Tác vụ KTV</span>
                        <div className="flex space-x-1">
                          {app.status === 'Pending' && (
                            <button
                              onClick={() => handleUpdateSpaStatus(app.id, 'In Progress')}
                              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-bold cursor-pointer flex items-center space-x-1"
                            >
                              <Play className="h-3 w-3" />
                              <span>Vào Trị Liệu</span>
                            </button>
                          )}
                          {app.status === 'In Progress' && (
                            <button
                              onClick={() => handleUpdateSpaStatus(app.id, 'Completed')}
                              className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[10px] font-bold cursor-pointer flex items-center space-x-1"
                            >
                              <Check className="h-3 w-3" />
                              <span>Hoàn thành ca</span>
                            </button>
                          )}
                          {app.status === 'Completed' && (
                            <span className="text-[10px] font-bold text-green-600 uppercase flex items-center space-x-0.5">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Đã phục vụ</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: SPA INVENTORY */}
            {activeTab === 'inventory' && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="bg-white border border-teal-50 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Bảng Kiểm Kê Tinh Dầu & Dược Liệu Spa</h3>
                    <p className="text-xs text-slate-500">Giám sát lượng tinh dầu xông, dược thảo ngâm bồn Dao Đỏ, đá bazan trị liệu.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setRequestForm({ name: 'Lá tắm thảo dược Dao Đỏ khô', qty: '' });
                      setShowRequestInventoryModal(true);
                    }}
                    className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md"
                  >
                    <PlusCircle className="h-4.5 w-4.5" />
                    <span>Yêu Cầu Cấp Nguyên Liệu</span>
                  </button>
                </div>

                <div className="bg-white border border-teal-50 rounded-3xl shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-teal-50/20 text-slate-600 font-bold border-b border-teal-50">
                          <th className="p-4">Mã VL</th>
                          <th className="p-4">Tên nguyên liệu thảo dược</th>
                          <th className="p-4">Lượng tồn hiện có</th>
                          <th className="p-4">Đơn vị tính</th>
                          <th className="p-4">Định mức tối thiểu</th>
                          <th className="p-4">Đánh giá trạng thái</th>
                          <th className="p-4 text-center">Yêu cầu nhanh</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-teal-50/10">
                        {spaInventory.map(item => (
                          <tr key={item.id} className="hover:bg-teal-50/5">
                            <td className="p-4 font-mono font-bold text-slate-400">{item.id}</td>
                            <td className="p-4 font-bold text-slate-800">{item.name}</td>
                            <td className={`p-4 font-bold text-sm ${item.stock < item.minQty ? 'text-red-600' : 'text-slate-800'}`}>{item.stock}</td>
                            <td className="p-4 text-slate-600">{item.unit}</td>
                            <td className="p-4 text-slate-400 font-mono">{item.minQty}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                item.status === 'Đầy đủ' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => {
                                  setRequestForm({ name: item.name, qty: '10' });
                                  setShowRequestInventoryModal(true);
                                }}
                                className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 rounded-lg text-[9px] font-bold cursor-pointer"
                              >
                                Đặt thêm +10
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

          </div>
        )}

        {/* ======================================================================
            ROLE 2: YOGA DEPARTMENT PANELS
            ====================================================================== */}
        {activeRole === 'yoga' && (
          <div className="space-y-6">
            
            {/* TAB 1: YOGA CLASSES */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="bg-white border border-teal-50 rounded-2xl p-5 shadow-xs">
                  <h3 className="font-bold text-sm text-slate-900">Lịch Các Lớp Học Yoga & Thiền Trong Ngày</h3>
                  <p className="text-xs text-slate-500">Giám sát khung giờ, huấn luyện viên phụ trách và địa điểm các lớp Yoga phục hồi ngoài trời/phòng kính.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {yogaClasses.map(cls => (
                    <div 
                      key={cls.id} 
                      className="bg-white rounded-3xl border border-teal-50 p-5 shadow-xs flex flex-col justify-between min-h-[200px]"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-teal-700 font-mono uppercase bg-teal-50 px-2 py-0.5 rounded">{cls.id}</span>
                          <span className="text-xs text-slate-500 font-mono font-bold flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1 text-[#14b8a6]" />
                            {cls.time}
                          </span>
                        </div>

                        <h4 className="font-serif font-bold text-slate-900 text-base leading-tight mt-1">{cls.name}</h4>
                        <div className="space-y-1 text-xs text-slate-600 font-medium">
                          <p>Huấn luyện viên: <strong className="text-slate-800">{cls.instructor}</strong></p>
                          <p>Địa điểm tập: <span className="text-slate-700">{cls.location}</span></p>
                        </div>

                        <div className="flex items-center space-x-1.5 text-xs text-teal-800 bg-teal-50/50 p-2.5 rounded-xl border border-teal-100">
                          <Users className="h-4 w-4" />
                          <span>Học viên đăng ký: <strong className="text-teal-900 font-bold">{cls.registeredCount} khách</strong></span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex justify-end mt-4">
                        <button
                          onClick={() => {
                            setSelectedYogaClassId(cls.id);
                            setActiveTab('attendance');
                          }}
                          className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Điểm danh học viên</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: YOGA ATTENDANCE CHECK */}
            {activeTab === 'attendance' && (
              <div className="space-y-6 animate-fade-in text-left">
                {/* Class selector */}
                <div className="bg-white border border-teal-50 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Bảng Điểm Danh Lớp Yoga Khách Sạn</h3>
                    <p className="text-xs text-slate-500">Chọn lớp và tích chọn để điểm danh nhanh khi khách hàng tới thảm tập.</p>
                  </div>
                  <div className="space-y-1.5 w-full sm:w-80">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Chọn lớp để điểm danh</label>
                    <select
                      value={selectedYogaClassId}
                      onChange={(e) => setSelectedYogaClassId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white text-xs font-bold text-slate-800"
                    >
                      {yogaClasses.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name} ({cls.time})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Attendance list */}
                <div className="bg-white border border-teal-50 rounded-3xl p-6 shadow-xs max-w-xl mx-auto">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                    <h4 className="font-bold text-sm text-slate-900 font-serif">
                      Lớp: {yogaClasses.find(c => c.id === selectedYogaClassId)?.name}
                    </h4>
                    <span className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-xl">
                      Đã đến: {
                        Object.values(attendance[selectedYogaClassId] || {}).filter(Boolean).length
                      } / {
                        yogaClasses.find(c => c.id === selectedYogaClassId)?.registeredCount
                      } khách
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* List registered guests for selected class */}
                    {(yogaClasses.find(c => c.id === selectedYogaClassId)?.registeredGuests || []).map(guest => {
                      const isPresent = !!(attendance[selectedYogaClassId] || {})[guest];
                      return (
                        <div 
                          key={guest}
                          onClick={() => handleToggleAttendance(selectedYogaClassId, guest)}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all hover:bg-teal-50/30 ${
                            isPresent ? 'bg-teal-50/50 border-teal-200' : 'border-slate-150 bg-slate-50/30'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              isPresent ? 'bg-teal-600 text-white shadow-3xs' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {guest.split(' ').pop()?.substring(0, 1)}
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-slate-900">{guest}</span>
                          </div>

                          <div className="flex items-center">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold mr-3 ${
                              isPresent ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {isPresent ? 'Đã có mặt' : 'Chưa đến'}
                            </span>
                            <div className={`h-5.5 w-5.5 rounded-md border flex items-center justify-center transition-all ${
                              isPresent ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isPresent && <Check className="h-4 w-4 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: YOGA EQUIPMENT */}
            {activeTab === 'equipment' && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="bg-white border border-teal-50 rounded-2xl p-5 shadow-xs">
                  <h3 className="font-bold text-sm text-slate-900">Quản Lý Thảm Tập & Thiết Bị Yoga</h3>
                  <p className="text-xs text-slate-500">Giám sát lượng thảm đang giặt sấy (laundry), thảm sạch sẵn dùng và thảm hỏng cần thanh lý.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {yogaEquipment.map(eq => (
                    <div key={eq.name} className="bg-white border border-teal-50 rounded-3xl p-5 shadow-xs text-left flex flex-col justify-between h-52">
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">{eq.name}</h4>
                        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                          <div className="bg-teal-50 p-2 rounded-xl">
                            <span className="text-[10px] text-teal-700 font-bold block">Sạch</span>
                            <strong className="text-base font-bold text-teal-900">{eq.clean}</strong>
                          </div>
                          <div className="bg-amber-50 p-2 rounded-xl">
                            <span className="text-[10px] text-amber-700 font-bold block">Giặt</span>
                            <strong className="text-base font-bold text-amber-900">{eq.laundry}</strong>
                          </div>
                          <div className="bg-slate-100 p-2 rounded-xl">
                            <span className="text-[10px] text-slate-500 font-bold block">Tổng</span>
                            <strong className="text-base font-bold text-slate-800">{eq.total}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center mt-3">
                        <span className="text-[9px] text-slate-400">Giặt sấy xong?</span>
                        <button
                          onClick={() => handleEquipmentClean(eq.name)}
                          disabled={eq.laundry === 0}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold cursor-pointer transition-all ${
                            eq.laundry === 0 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800'
                          }`}
                        >
                          Trả thảm sạch
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ======================================================================
            ROLE 3: PHYSIOTHERAPY (VẬT LÝ TRỊ LIỆU) PANELS
            ====================================================================== */}
        {activeRole === 'physio' && (
          <div className="space-y-6">
            
            {/* TAB 1: PHYSIO APPOINTMENTS */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="bg-white border border-teal-50 rounded-2xl p-5 shadow-xs">
                  <h3 className="font-bold text-sm text-slate-900">Danh Sách Khách Hàng Trị Liệu Cơ Xương Khớp Trong Ngày</h3>
                  <p className="text-xs text-slate-500">Giám sát các ca tập vận động trị liệu cột sống hoặc chiếu laser phục hồi chấn thương cơ khớp.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {physioAppointments.map(app => (
                    <div 
                      key={app.id} 
                      className={`bg-white rounded-3xl border shadow-xs p-5 flex flex-col justify-between min-h-[220px] h-auto transition-all ${
                        app.status === 'In Progress' ? 'border-amber-300 ring-2 ring-amber-50' : 
                        app.status === 'Completed' ? 'border-green-200 opacity-80' : 'border-slate-200/60'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                          <div>
                            <span className="text-[9px] font-mono text-slate-400 font-bold block">{app.id}</span>
                            <span className="text-xs font-bold text-teal-800 font-mono block mt-0.5">PHÒNG {app.room}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            app.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                            app.status === 'In Progress' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-green-100 text-green-800'
                          }`}>
                            {app.status === 'Pending' ? 'Chờ phục vụ' : app.status === 'In Progress' ? 'Đang trị liệu' : 'Đã xong'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-950 mt-1">{app.service}</h4>
                        
                        <div className="bg-red-50 text-red-800 p-2.5 rounded-xl border border-red-100 text-[10px] font-bold mt-1">
                          Triệu chứng: {app.diagnosis}
                        </div>

                        <div className="space-y-1 text-xs text-slate-600 font-medium pt-2">
                          <p>Bệnh nhân: <strong className="text-slate-800">{app.guest}</strong></p>
                          <p>Giờ hẹn trực: <span className="font-mono text-slate-800">{app.time}</span></p>
                          <p>Bác sĩ điều trị: <span className="text-slate-700">{app.therapist}</span></p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center mt-3">
                        <span className="text-[10px] text-slate-400">Trạng thái trị liệu</span>
                        <div className="flex space-x-1">
                          {app.status === 'Pending' && (
                            <button
                              onClick={() => handleUpdatePhysioStatus(app.id, 'In Progress')}
                              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-bold cursor-pointer"
                            >
                              Khởi Động Máy
                            </button>
                          )}
                          {app.status === 'In Progress' && (
                            <button
                              onClick={() => handleUpdatePhysioStatus(app.id, 'Completed')}
                              className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[10px] font-bold cursor-pointer"
                            >
                              Tắt Máy & Xong
                            </button>
                          )}
                          {app.status === 'Completed' && (
                            <span className="text-[10px] font-bold text-green-600 uppercase flex items-center space-x-0.5">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Hoàn thành phục hồi</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: PHYSIO PATIENT TREATMENT RECORDS */}
            {activeTab === 'records' && (
              <div className="space-y-6 animate-fade-in text-left">
                {/* Patient selection */}
                <div className="bg-white border border-teal-50 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Bệnh Án & Tiến Trình Phục Hồi Chức Năng</h3>
                    <p className="text-xs text-slate-500">Xem lịch sử các buổi tập, ghi chú của bác sĩ và bài tập phục hồi tại nhà.</p>
                  </div>
                  <div className="space-y-1.5 w-full sm:w-80">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Chọn hồ sơ bệnh nhân</label>
                    <select
                      value={selectedPatientName}
                      onChange={(e) => setSelectedPatientName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white text-xs font-bold text-slate-800"
                    >
                      {patientRecords.map(rec => (
                        <option key={rec.guest} value={rec.guest}>{rec.guest} (Phòng {rec.room})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Patient Records Detail View */}
                {selectedPatientName && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Tiến trình trị liệu */}
                    <div className="bg-white border border-teal-50 rounded-3xl p-6 shadow-xs col-span-2 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h4 className="font-bold text-slate-900 font-serif text-sm">
                          Bệnh nhân: {selectedPatientName}
                        </h4>
                        <button
                          onClick={() => setShowAddRecordModal(true)}
                          className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span>Ghi chẩn đoán buổi hôm nay</span>
                        </button>
                      </div>

                      {/* Timeline of sessions */}
                      <div className="relative border-l-2 border-teal-100 ml-4 pl-6 space-y-5 py-2">
                        {patientRecords.find(r => r.guest === selectedPatientName)?.history.map((hist, idx) => (
                          <div key={idx} className="relative">
                            <span className="absolute -left-9.5 top-0 h-7 w-7 rounded-full bg-teal-50 border-2 border-teal-500 flex items-center justify-center text-[10px] font-bold text-teal-800">
                              {idx + 1}
                            </span>
                            <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl text-xs space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-mono text-slate-400 font-bold">{hist.date}</span>
                                <span className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded font-bold uppercase text-[8px]">Buổi điều trị {idx + 1}</span>
                              </div>
                              <p className="text-slate-950 font-bold">Lâm sàng: <span className="font-normal text-slate-600">{hist.symptoms}</span></p>
                              <p className="text-slate-950 font-bold">Chỉ định trị liệu: <span className="font-normal text-slate-600">{hist.therapy}</span></p>
                              <div className="p-2 bg-green-50/50 text-green-800 rounded-lg border border-green-100 font-medium">
                                Đánh giá tiến triển: {hist.progress}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dặn dò của bác sĩ */}
                    <div className="bg-white border border-teal-50 rounded-3xl p-6 shadow-xs space-y-4">
                      <h4 className="font-serif text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Dặn Dò Của Bác Sĩ & Chuyên Gia</h4>
                      <div className="p-4 bg-teal-50/40 text-teal-850 rounded-2xl border border-teal-100 font-light text-xs leading-relaxed">
                        {patientRecords.find(r => r.guest === selectedPatientName)?.recommendations}
                      </div>
                      
                      <div className="p-3 bg-red-50 text-red-950 rounded-2xl text-xs font-semibold">
                        <h5 className="font-bold text-red-700 flex items-center space-x-1">
                          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>Lưu ý chống chỉ định:</span>
                        </h5>
                        <p className="font-light text-[11px] mt-1 text-red-800 leading-snug">
                          Không chườm nóng nếu sưng đỏ khớp gối cấp. Tránh tư thế cúi lưng gập người quá mức (Flexion).
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PHYSIO EQUIPMENT */}
            {activeTab === 'equipment' && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="bg-white border border-teal-50 rounded-2xl p-5 shadow-xs">
                  <h3 className="font-bold text-sm text-slate-900">Giám Sát Máy Móc Trị Liệu Chuyên Dụng</h3>
                  <p className="text-xs text-slate-500">Giám sát tình trạng hoạt động và đổi trạng thái bảo trì đối với các máy kéo cột sống, máy laser trị liệu.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {physioEquipment.map(eq => (
                    <div key={eq.code} className="bg-white border border-teal-50 rounded-3xl p-5 shadow-xs text-left flex flex-col justify-between h-52">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-bold text-slate-400 font-mono uppercase">{eq.code}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            eq.status === 'Available' ? 'bg-green-100 text-green-700' :
                            eq.status === 'Under Maintenance' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {eq.status === 'Available' ? 'Hoạt động tốt' : eq.status === 'Under Maintenance' ? 'Bảo trì' : 'Đang sử dụng'}
                          </span>
                        </div>
                        <h4 className="font-serif text-slate-800 text-sm font-bold leading-tight mt-1">{eq.name}</h4>
                        <span className="text-[10px] text-slate-400 block mt-1.5">Số giờ hoạt động tích lũy: <strong className="text-slate-700 font-mono">{eq.usageHours} giờ</strong></span>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center mt-3">
                        <span className="text-[9px] text-slate-400">Tác vụ kỹ thuật</span>
                        <button
                          onClick={() => handleToggleMachineStatus(eq.code)}
                          className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 rounded-lg text-[9px] font-bold cursor-pointer"
                        >
                          Đổi trạng thái
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* ======================================================================
          MODALS
          ====================================================================== */}

      {/* 1. Modal Thêm Bệnh Án Vật Lý Trị Liệu */}
      {showAddRecordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-teal-100 shadow-2xl relative">
            <button 
              onClick={() => setShowAddRecordModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Clipboard className="h-5 w-5 text-teal-700" />
              <span>Ghi Bệnh Án Buổi Hôm Nay: {selectedPatientName}</span>
            </h3>

            <form onSubmit={handleAddClinicalRecord} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Triệu chứng lâm sàng *</label>
                <input 
                  type="text" 
                  value={newPhysioRecord.symptoms} 
                  onChange={(e) => setNewPhysioRecord(prev => ({ ...prev, symptoms: e.target.value }))}
                  placeholder="Ví dụ: Đau mỏi thắt lưng, co cứng cơ, VAS 6/10"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Chỉ định trị liệu hôm nay *</label>
                <input 
                  type="text" 
                  value={newPhysioRecord.therapy} 
                  onChange={(e) => setNewPhysioRecord(prev => ({ ...prev, therapy: e.target.value }))}
                  placeholder="Ví dụ: Siêu âm 1.5W + Kéo giãn thắt lưng 22kg"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Đánh giá tiến triển sau buổi điều trị</label>
                <textarea 
                  value={newPhysioRecord.progress} 
                  onChange={(e) => setNewPhysioRecord(prev => ({ ...prev, progress: e.target.value }))}
                  rows="2"
                  placeholder="Ví dụ: Giảm buốt lan xuống mông, cột sống di động tốt hơn, VAS 4/10"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white text-slate-900 font-light"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddRecordModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer"
                >
                  Đóng
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-teal-700 text-white rounded-xl font-bold hover:bg-teal-800 cursor-pointer"
                >
                  Lưu bệnh án
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Gửi Yêu Cầu Kho Dược Liệu Spa */}
      {showRequestInventoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-teal-100 shadow-2xl relative">
            <button 
              onClick={() => setShowRequestInventoryModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Package className="h-5 w-5 text-teal-700" />
              <span>Yêu Cầu Cấp Nguyên Liệu Spa</span>
            </h3>

            <form onSubmit={handleRequestSpaInventory} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Nguyên liệu cần cấp</label>
                <input 
                  type="text" 
                  value={requestForm.name} 
                  disabled
                  className="w-full p-2.5 rounded-xl border border-slate-150 bg-slate-100 text-slate-600 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Số lượng yêu cầu cấp</label>
                <input 
                  type="number" 
                  value={requestForm.qty} 
                  onChange={(e) => setRequestForm(prev => ({ ...prev, qty: e.target.value }))}
                  placeholder="Ví dụ: 10"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowRequestInventoryModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer"
                >
                  Đóng
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-teal-700 text-white rounded-xl font-bold hover:bg-teal-800 cursor-pointer"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
