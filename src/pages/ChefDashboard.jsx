import { useState } from 'react';
import { 
  LayoutDashboard, Utensils, AlertTriangle, Package, MessageSquare, 
  PlusCircle, Check, X, Search, Sparkles, Clock, DollarSign, LogOut, 
  ShieldAlert, Activity, FileText, CheckCircle2, Flame, Heart, AlertOctagon
} from 'lucide-react';

// ==========================================
// MOCK DATA FOR KITCHEN & CULINARY SYSTEM
// ==========================================

const initialAllergies = [
  { id: 'ALG-001', guest: 'Trần Thị Mai', room: '101', allergies: ['Hải sản', 'Không ăn cay'], dietary: 'Halal', checkIn: '2026-05-25' },
  { id: 'ALG-002', guest: 'Lê Hoàng Nam', room: '201', allergies: ['Đậu phộng'], dietary: 'Gluten-Free', checkIn: '2026-05-25' },
  { id: 'ALG-003', guest: 'David Miller', room: '302', allergies: [], dietary: 'Vegan', checkIn: '2026-05-24' },
  { id: 'ALG-004', guest: 'Phan Thanh Thủy', room: '104', allergies: ['Đậu phộng', 'Hải sản'], dietary: 'Vegetarian', checkIn: '2026-05-26' },
  { id: 'ALG-005', guest: 'Nguyễn Bích Liên', room: '202', allergies: ['Không gluten'], dietary: 'Vegetarian', checkIn: '2026-05-25' }
];

const initialFeedbacks = [
  { id: 1, guest: 'David Miller', room: '302', rating: 5, dish: 'Súp sâm yến mạch thực dưỡng', comment: 'Súp rất ngon, thanh đạm và tốt cho sức khỏe. Sẽ gọi lại!', time: '1 giờ trước', status: 'Positive' },
  { id: 2, guest: 'Trần Thị Mai', room: '101', rating: 3, dish: 'Nấm nướng lá lốt', comment: 'Món ăn hơi nhạt, nước chấm đi kèm chưa được đậm đà lắm.', time: '3 giờ trước', status: 'Complaint' },
  { id: 3, guest: 'Lê Hoàng Nam', room: '201', rating: 2, dish: 'Chè hạt sen nhãn nhục', comment: 'Tôi thấy hạt sen hơi cứng và ngọt gắt quá.', time: '1 ngày trước', status: 'Complaint' }
];

const initialDishes = [
  { id: 'DSH-01', name: 'Súp sâm yến mạch thực dưỡng', price: '450,000đ', category: 'Khai vị', description: 'Yến mạch organic kết hợp nhân sâm Hàn Quốc, kỷ tử và táo đỏ giúp bổ khí huyết.', ingredients: 'Yến mạch (50g), Nhân sâm (10g), Táo đỏ (2 quả), Kỷ tử (5g)', allergens: [], isTodayMenu: true, period: 'Breakfast', soldOut: false, enabled: true },
  { id: 'DSH-02', name: 'Mì căn xào sả ớt thực dưỡng', price: '280,000đ', category: 'Món chính', description: 'Mì căn dai ngon xào sả bằm và ớt hiểm, ăn kèm cơm gạo lứt.', ingredients: 'Mì căn chay (150g), Sả (2 củ), Ớt hiểm (1 quả), Hạt nêm chay', allergens: ['Cay'], isTodayMenu: true, period: 'Lunch', soldOut: false, enabled: true },
  { id: 'DSH-03', name: 'Nấm nướng lá lốt cốt dừa', price: '320,000đ', category: 'Món chính', description: 'Nấm đùi gà cuộn lá lốt nướng than hoa, rưới sốt nước cốt dừa béo ngậy.', ingredients: 'Nấm đùi gà (100g), Lá lốt (10 lá), Nước cốt dừa (30ml), Đậu phộng rang', allergens: ['Đậu phộng'], isTodayMenu: true, period: 'Dinner', soldOut: false, enabled: true },
  { id: 'DSH-04', name: 'Salad bơ hạt diêm mạch', price: '350,000đ', category: 'Món chính', description: 'Bơ sáp lát mỏng trộn hạt diêm mạch (quinoa), cà chua bi và nước sốt chanh leo chua thanh.', ingredients: 'Bơ sáp (0.5 quả), Hạt diêm mạch (30g), Cà chua bi (50g), Chanh leo', allergens: [], isTodayMenu: true, period: 'Lunch', soldOut: false, enabled: true },
  { id: 'DSH-05', name: 'Gỏi cuốn chay sốt tương lạc', price: '190,000đ', category: 'Khai vị', description: 'Gỏi cuốn rau sống, đậu hũ chiên và bún tươi, chấm sốt tương đen pha bơ lạc.', ingredients: 'Đậu hũ (50g), Rau thơm, Bánh tráng, Tương đen, Bơ đậu phộng', allergens: ['Đậu phộng'], isTodayMenu: false, period: 'Lunch', soldOut: false, enabled: true },
  { id: 'DSH-06', name: 'Lẩu nấm Ngũ Sơn chay', price: '850,000đ', category: 'Món chính', description: 'Nước dùng lẩu hầm từ củ quả ngọt lịm ăn kèm 5 loại nấm tươi quý hiếm.', ingredients: 'Nấm mối chay (50g), Nấm kim châm (50g), Nấm đùi gà (50g), Củ cải, Cà rốt', allergens: [], isTodayMenu: false, period: 'Dinner', soldOut: false, enabled: true },
  { id: 'DSH-07', name: 'Tôm rim tỏi ớt (Món mặn)', price: '390,000đ', category: 'Món chính', description: 'Tôm sú biển tươi ngon rim tỏi ớt thơm lừng cay cay ngọt ngọt.', ingredients: 'Tôm sú (150g), Tỏi bằm, Ớt hiểm, Gia vị cốt biển', allergens: ['Hải sản', 'Cay'], isTodayMenu: true, period: 'Dinner', soldOut: false, enabled: true }
];

const initialOrders = [
  { id: 'ORD-5501', guestName: 'Trần Thị Mai', room: '101', origin: 'Room Service', items: [{ name: 'Tôm rim tỏi ớt (Món mặn)', qty: 1 }, { name: 'Súp sâm yến mạch thực dưỡng', qty: 1 }], note: 'Làm thật ít cay giúp tôi nhé!', status: 'Pending', time: '10 phút trước' },
  { id: 'ORD-5502', guestName: 'David Miller', room: '302', origin: 'Restaurant', items: [{ name: 'Salad bơ hạt diêm mạch', qty: 1 }, { name: 'Mì căn xào sả ớt thực dưỡng', qty: 1 }], note: 'Không lấy hành lá', status: 'Cooking', time: '15 phút trước' },
  { id: 'ORD-5503', guestName: 'Lê Hoàng Nam', room: '201', origin: 'Room Service', items: [{ name: 'Nấm nướng lá lốt cốt dừa', qty: 1 }], note: 'Mang kèm muỗng nĩa', status: 'Completed', time: '1 giờ trước' }
];

const initialIngredients = [
  { id: 'ING-01', name: 'Đậu hũ non organic (Khay)', category: 'Đồ mát', stock: 15, minQty: 5, unit: 'Khay', status: 'Đầy đủ' },
  { id: 'ING-02', name: 'Nấm đùi gà tươi (Kg)', category: 'Rau củ', stock: 8, minQty: 10, unit: 'Kg', status: 'Sắp hết' },
  { id: 'ING-03', name: 'Tôm sú biển tươi (Kg)', category: 'Hải sản', stock: 12, minQty: 4, unit: 'Kg', status: 'Đầy đủ' },
  { id: 'ING-04', name: 'Nhân sâm Hàn Quốc tươi (Củ)', category: 'Dược liệu', stock: 3, minQty: 5, unit: 'Củ', status: 'Sắp hết' },
  { id: 'ING-05', name: 'Bơ đậu phộng sấy (Hũ)', category: 'Gia vị', stock: 0, minQty: 3, unit: 'Hũ', status: 'Hết hàng' },
  { id: 'ING-06', name: 'Gạo lứt đỏ nương (Kg)', category: 'Khô', stock: 45, minQty: 15, unit: 'Kg', status: 'Đầy đủ' }
];

const initialRequests = [
  { id: 'REQ-01', name: 'Bơ đậu phộng sấy', qty: 10, unit: 'Hũ', date: '2026-05-25', status: 'Chờ duyệt' },
  { id: 'REQ-02', name: 'Nấm đùi gà tươi', qty: 15, unit: 'Kg', date: '2026-05-26', status: 'Chờ duyệt' }
];

export default function ChefDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Core system states
  const [allergies] = useState(initialAllergies);
  const [feedbacks] = useState(initialFeedbacks);
  const [dishes, setDishes] = useState(initialDishes);
  const [orders, setOrders] = useState(initialOrders);
  const [ingredients] = useState(initialIngredients);
  const [procurements, setProcurements] = useState(initialRequests);

  // Search & Filters
  const [allergySearch, setAllergySearch] = useState('');
  const [dishFilter, setDishFilter] = useState('All');

  // Modals
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [showEditDishModal, setShowEditDishModal] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Forms states
  const [dishForm, setForm] = useState({ name: '', price: '', category: 'Món chính', description: '', ingredients: '', allergens: '', period: 'Lunch', isTodayMenu: true });
  const [requestForm, setRequestForm] = useState({ name: 'Nấm đùi gà tươi', qty: '', unit: 'Kg' });

  // Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Voice Synthesis Alert (KDS Audio Simulator)
  const playVoiceAlert = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // ==========================================
  // HANDLERS
  // ==========================================

  // Menu Today functions
  const handleToggleTodayMenu = (id) => {
    setDishes(prev => prev.map(d => d.id === id ? { ...d, isTodayMenu: !d.isTodayMenu } : d));
  };

  const handleToggleSoldOut = (id) => {
    setDishes(prev => prev.map(d => {
      if (d.id === id) {
        const nextState = !d.soldOut;
        alert(`Món ăn "${d.name}" đã được cập nhật thành: ${nextState ? 'HẾT HÀNG' : 'CÒN HÀNG'}`);
        return { ...d, soldOut: nextState };
      }
      return d;
    }));
  };

  const handleToggleEnabled = (id) => {
    setDishes(prev => prev.map(d => d.id === id ? { ...d, enabled: !d.enabled } : d));
  };

  // Orders functions
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const order = orders.find(ord => ord.id === orderId);
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, status: newStatus };
      }
      return ord;
    }));
    const nextStatusText = newStatus === 'Cooking' ? 'bắt đầu chuẩn bị' : 'hoàn thành';
    const msg = `Đơn hàng ${orderId} của phòng ${order?.room || ''} đã ${nextStatusText}`;
    playVoiceAlert(msg);
  };

  // Dish Database functions
  const handleAddDish = (e) => {
    e.preventDefault();
    if (!dishForm.name || !dishForm.price) {
      alert('Vui lòng điền đầy đủ tên và giá món ăn.');
      return;
    }
    const newDish = {
      id: `DSH-${Math.floor(10 + Math.random() * 90)}`,
      name: dishForm.name,
      price: dishForm.price.includes('đ') ? dishForm.price : `${dishForm.price}đ`,
      category: dishForm.category,
      description: dishForm.description,
      ingredients: dishForm.ingredients,
      allergens: dishForm.allergens ? dishForm.allergens.split(',').map(s => s.trim()) : [],
      isTodayMenu: dishForm.isTodayMenu,
      period: dishForm.period,
      soldOut: false,
      enabled: true
    };
    setDishes(prev => [...prev, newDish]);
    setShowAddDishModal(false);
    setForm({ name: '', price: '', category: 'Món chính', description: '', ingredients: '', allergens: '', period: 'Lunch', isTodayMenu: true });
    alert('Món mới đã được lưu vào cơ sở dữ liệu.');
  };

  const openEditDish = (dish) => {
    setSelectedDish(dish);
    setForm({ 
      name: dish.name, 
      price: dish.price, 
      category: dish.category, 
      description: dish.description, 
      ingredients: dish.ingredients, 
      allergens: dish.allergens.join(', '), 
      period: dish.period, 
      isTodayMenu: dish.isTodayMenu 
    });
    setShowEditDishModal(true);
  };

  const handleUpdateDish = (e) => {
    e.preventDefault();
    setDishes(prev => prev.map(d => d.id === selectedDish.id ? { 
      ...d, 
      name: dishForm.name, 
      price: dishForm.price.includes('đ') ? dishForm.price : `${dishForm.price}đ`,
      category: dishForm.category,
      description: dishForm.description,
      ingredients: dishForm.ingredients,
      allergens: dishForm.allergens ? dishForm.allergens.split(',').map(s => s.trim()) : [],
      period: dishForm.period,
      isTodayMenu: dishForm.isTodayMenu
    } : d));
    setShowEditDishModal(false);
    setSelectedDish(null);
    setForm({ name: '', price: '', category: 'Món chính', description: '', ingredients: '', allergens: '', period: 'Lunch', isTodayMenu: true });
    alert('Đã cập nhật thông tin món ăn.');
  };

  const handleDeleteDish = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa món này ra khỏi cơ sở dữ liệu?')) {
      setDishes(prev => prev.filter(d => d.id !== id));
      alert('Đã xóa món ăn.');
    }
  };

  // Kitchen Inventory functions
  const handleCreateRequest = (e) => {
    e.preventDefault();
    if (!requestForm.qty) {
      alert('Vui lòng điền số lượng cần nhập.');
      return;
    }
    const newReq = {
      id: `REQ-${Math.floor(10 + Math.random() * 90)}`,
      name: requestForm.name,
      qty: parseFloat(requestForm.qty),
      unit: requestForm.unit,
      date: new Date().toISOString().split('T')[0],
      status: 'Chờ duyệt'
    };
    setProcurements(prev => [newReq, ...prev]);
    setShowRequestModal(false);
    setRequestForm({ name: 'Nấm đùi gà tươi', qty: '', unit: 'Kg' });
    alert(`Đã gửi yêu cầu mua thêm ${newReq.qty} ${newReq.unit} ${newReq.name} lên phòng quản trị.`);
  };

  // Helper to match order with allergies
  const checkOrderAllergies = (order) => {
    // Find guest allergies
    const guestDiet = allergies.find(a => a.guest.toLowerCase() === order.guestName.toLowerCase() || a.room === order.room);
    if (!guestDiet) return { hasAllergyAlert: false, matchedAllergens: [] };

    let matchedAllergens = [];
    order.items.forEach(item => {
      // Find recipe in database
      const recipe = dishes.find(d => d.name === item.name);
      if (recipe) {
        // Compare allergens list
        recipe.allergens.forEach(alg => {
          if (guestDiet.allergies.includes(alg)) {
            matchedAllergens.push(alg);
          }
        });
      }
    });

    // Special check for Cay (spicy note)
    if (guestDiet.allergies.includes('Không ăn cay') && order.items.some(it => {
      const rec = dishes.find(d => d.name === it.name);
      return rec && rec.allergens.includes('Cay');
    })) {
      matchedAllergens.push('Cay (Món chứa ớt)');
    }

    return {
      hasAllergyAlert: matchedAllergens.length > 0,
      matchedAllergens
    };
  };

  return (
    <div className="admin-theme min-h-screen bg-[#f7f8f6] flex flex-col lg:flex-row antialiased text-sage-950 font-sans pt-0 relative">
      
      {/* Mobile Top Header Bar */}
      <header className="lg:hidden w-full bg-[#1b2b11] text-white px-4 py-3 flex items-center justify-between shadow-md z-30">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-[#f59e0b] rounded-lg text-sage-950">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-base font-bold leading-tight">Ngũ Sơn Bếp Trực</h1>
            <span className="text-[9px] text-[#facc15] font-bold tracking-wider uppercase block">Kitchen Hub</span>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-sage-800 text-white hover:bg-sage-750 transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Utensils className="h-6 w-6" />}
        </button>
      </header>

      {/* Backdrop for mobile drawer */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-20"
        />
      )}

      {/* ==========================================
          SIDEBAR NAVIGATION (DRAWER ON MOBILE)
          ========================================== */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#1b2b11] text-white flex flex-col z-30 transition-transform duration-350 shadow-xl border-r border-[#15220c] lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#25391c] flex items-center space-x-3 bg-[#17250e]/50 hidden lg:flex">
          <div className="p-2.5 bg-[#f59e0b] rounded-xl text-sage-950 shadow-md">
            <Flame className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-white leading-tight">Ngũ Sơn Resort</h1>
            <span className="text-[10px] text-[#facc15] font-bold tracking-widest uppercase block">Kitchen Operating System</span>
          </div>
        </div>

        {/* Tab Lists */}
        <nav className="flex-grow py-6 px-3.5 space-y-1.5 overflow-y-auto custom-scrollbar">
          {[
            { id: 'overview', label: '1. Bếp tổng quan', icon: LayoutDashboard },
            { id: 'allergies', label: '2. Cảnh báo dị ứng', icon: ShieldAlert, badge: `${allergies.filter(a => a.allergies.length > 0).length}` },
            { id: 'menu', label: '3. Thực đơn hôm nay', icon: Utensils, badge: `${dishes.filter(d => d.isTodayMenu).length}` },
            { id: 'orders', label: '4. Đơn đặt món', icon: Clock, badge: `${orders.filter(o => o.status !== 'Completed').length}` },
            { id: 'dishes', label: '5. Danh mục món ăn', icon: FileText },
            { id: 'inventory', label: '6. Kho & Gọi hàng', icon: Package, badge: `${ingredients.filter(i => i.status !== 'Đầy đủ').length}` }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-150 cursor-pointer ${isActive ? 'bg-[#f59e0b] text-[#1b2b11] shadow-md scale-[1.01]' : 'text-[#ccd5c8] hover:bg-[#25391c]/50 hover:text-white'}`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`h-4.5 w-4.5 flex-shrink-0 ${isActive ? 'text-[#1b2b11]' : 'text-[#a3b899]'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>
                {item.badge && item.badge !== '0' && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0 ml-1.5 ${isActive ? 'bg-[#1b2b11] text-white' : 'bg-[#facc15]/20 text-[#facc15]'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Kitchen User Profile */}
        <div className="p-4 border-t border-[#25391c] bg-[#121f0b]/55">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-[#facc15] flex items-center justify-center text-sage-950 font-bold border border-[#f59e0b] shadow-inner text-sm">
                BT
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">Bếp Trưởng Ngũ Sơn</h4>
                <span className="text-[10px] text-[#a3b899]">Kitchen Executive Chef</span>
              </div>
            </div>
            <button 
              onClick={() => { if(confirm('Bạn có chắc chắn muốn đăng xuất khỏi khu vực bếp trực?')) window.location.href = '/dang-nhap'; }} 
              className="p-2 rounded-lg text-[#a3b899] hover:text-[#f87171] hover:bg-[#25391c]/50 transition-all cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ==========================================
          MAIN CONTAINER AREA
          ========================================== */}
      <main className="flex-grow min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen custom-scrollbar">
        
        {/* Top Header Title */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-sage-250/30 mb-6 gap-3">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-sage-950 leading-tight">
              {activeTab === 'overview' && '1. Bảng Giám Sát Vận Hành Bếp Resort'}
              {activeTab === 'allergies' && '2. Giám Sát Dị Ứng Khách Hàng (Allergen Monitor)'}
              {activeTab === 'menu' && '3. Quản Lý Thực Đơn Hàng Ngày (Menu Today)'}
              {activeTab === 'orders' && '4. Danh Sách Gọi Món & Tiến Độ Nấu'}
              {activeTab === 'dishes' && '5. Cơ Sở Dữ Liệu Danh Mục Món Ăn'}
              {activeTab === 'inventory' && '6. Kho Nguyên Liệu & Yêu Cầu Thu Mua'}
            </h2>
            <p className="text-[11px] text-sage-500 font-medium mt-0.5">Tiêu chuẩn vận hành: Tuyệt đối an toàn sức khỏe & Vệ sinh an toàn thực phẩm</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="p-2 bg-[#fef3c7] border border-[#fde68a] rounded-xl px-3 py-1 text-[10px] font-bold text-[#b45309] uppercase tracking-wider flex items-center space-x-1">
              <Activity className="h-3.5 w-3.5 animate-pulse" />
              <span>Nhà bếp hoạt động</span>
            </span>
          </div>
        </header>

        {/* ==========================================
            TAB 1: OVERVIEW DASHBOARD
            ========================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-sage-200/50 shadow-xs flex items-center space-x-3.5">
                <div className="p-3 bg-[#eff6ff] text-[#2563eb] rounded-xl">
                  <Clock className="h-5.5 w-5.5" />
                </div>
                <div>
                  <p className="text-[9px] text-sage-400 font-bold uppercase tracking-wider">Đơn đang chờ</p>
                  <h3 className="text-lg font-bold text-sage-900 mt-0.5">{orders.filter(o => o.status !== 'Completed').length} đơn</h3>
                  <span className="text-[8px] text-blue-600 font-medium">Nhà hàng & Room Service</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-sage-200/50 shadow-xs flex items-center space-x-3.5">
                <div className="p-3 bg-[#fef2f2] text-[#dc2626] rounded-xl">
                  <AlertOctagon className="h-5.5 w-5.5" />
                </div>
                <div>
                  <p className="text-[9px] text-sage-400 font-bold uppercase tracking-wider">Ca dị ứng ở</p>
                  <h3 className="text-lg font-bold text-sage-900 mt-0.5">{allergies.filter(a => a.allergies.length > 0).length} khách</h3>
                  <span className="text-[8px] text-red-600 font-medium font-bold uppercase">Cực kỳ quan trọng!</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-sage-200/50 shadow-xs flex items-center space-x-3.5">
                <div className="p-3 bg-[#fef3c7] text-[#d97706] rounded-xl">
                  <Package className="h-5.5 w-5.5" />
                </div>
                <div>
                  <p className="text-[9px] text-sage-400 font-bold uppercase tracking-wider">Nguyên liệu thiếu</p>
                  <h3 className="text-lg font-bold text-sage-900 mt-0.5">{ingredients.filter(i => i.status !== 'Đầy đủ').length} loại</h3>
                  <span className="text-[8px] text-orange-600 font-medium">Cần yêu cầu thêm</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-sage-200/50 shadow-xs flex items-center space-x-3.5">
                <div className="p-3 bg-[#ecfdf5] text-[#059669] rounded-xl">
                  <Utensils className="h-5.5 w-5.5" />
                </div>
                <div>
                  <p className="text-[9px] text-sage-400 font-bold uppercase tracking-wider">Món thực đơn hôm nay</p>
                  <h3 className="text-lg font-bold text-sage-900 mt-0.5">{dishes.filter(d => d.isTodayMenu).length} món</h3>
                  <span className="text-[8px] text-green-600 font-medium">Đang mở phục vụ</span>
                </div>
              </div>
            </div>

            {/* Critical Allergy Broadcast */}
            <div className="bg-red-50 border border-red-200 rounded-3xl p-5 shadow-xs">
              <div className="flex items-start space-x-3.5">
                <div className="p-2 bg-red-100 text-red-700 rounded-xl">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-sm font-bold text-red-950">Broadcast: Chỉ thị Bếp Trưởng Về An Toàn Dị Ứng Khách Lưu Trú</h3>
                  <p className="text-xs text-red-800 mt-1 leading-relaxed">
                    Yêu cầu toàn bộ nhân viên bếp đối chiếu nghiêm ngặt danh sách gọi món với hồ sơ dị ứng bên dưới. 
                    Mọi món ăn của khách có ghi nhận dị ứng **tuyệt đối không để nhiễm chéo** công cụ nấu, dầu chiên, hoặc thớt thái.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                    {allergies.filter(a => a.allergies.length > 0).map(item => (
                      <div key={item.id} className="bg-white/80 border border-red-100 p-3 rounded-2xl flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-sage-950 font-mono">PHÒNG {item.room}</span>
                            <span className="text-red-700 bg-red-100 px-1.5 py-0.5 rounded uppercase text-[8px]">{item.dietary}</span>
                          </div>
                          <h4 className="text-xs font-bold text-sage-900 mt-1">{item.guest}</h4>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.allergies.map((alg, i) => (
                            <span key={i} className="px-2 py-0.5 bg-red-700 text-white rounded text-[8px] font-bold">
                              Dị ứng: {alg}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Feedbacks & Low Stock Ingredients in Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Feedback list */}
              <div className="bg-white border border-sage-200/50 rounded-3xl p-5 shadow-xs text-left">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-serif text-base font-bold text-sage-950">Phản Hồi & Đánh Giá Món Ăn Mới Nhất</h3>
                  <span className="text-[10px] text-sage-400 font-semibold">{feedbacks.length} bình luận</span>
                </div>
                <div className="space-y-3.5 max-h-80 overflow-y-auto custom-scrollbar">
                  {feedbacks.map(fb => (
                    <div key={fb.id} className={`p-3.5 rounded-2xl border text-xs ${fb.status === 'Complaint' ? 'bg-[#fffbeb] border-[#fde68a]' : 'bg-sage-50/50 border-sage-100'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-sage-900">{fb.guest} (Phòng {fb.room})</span>
                          <span className="text-sage-400 block text-[9px] font-light mt-0.5">Gọi món: <strong className="text-sage-700 font-bold">{fb.dish}</strong></span>
                        </div>
                        <div className="flex items-center space-x-1 bg-white border border-sage-200/50 px-2 py-0.5 rounded-lg">
                          <span className="text-[10px] font-bold text-amber-500">★</span>
                          <span className="text-[10px] font-bold text-sage-800">{fb.rating}</span>
                        </div>
                      </div>
                      <p className="text-sage-600 mt-2 italic font-light">"{fb.comment}"</p>
                      <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-sage-100 text-[10px]">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[8px] ${fb.status === 'Complaint' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {fb.status === 'Complaint' ? 'Complaint / Cần sửa món' : 'Tốt'}
                        </span>
                        <span className="text-sage-400 font-light">{fb.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Kitchen Order Summary */}
              <div className="bg-white border border-sage-200/50 rounded-3xl p-5 shadow-xs text-left flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-serif text-base font-bold text-sage-950">Hàng Đợi Đơn Gọi Món (Order Queue)</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs text-[#d97706] hover:underline font-bold">Xem tất cả</button>
                  </div>
                  <div className="space-y-2">
                    {orders.filter(o => o.status !== 'Completed').slice(0, 3).map(ord => {
                      const alertInfo = checkOrderAllergies(ord);
                      return (
                        <div key={ord.id} className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${alertInfo.hasAllergyAlert ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-sage-50/50 border-sage-100'}`}>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-sage-900">{ord.id}</span>
                              <span className="text-sage-400 font-light">|</span>
                              <span className="font-medium text-sage-600">Phòng {ord.room} ({ord.origin})</span>
                            </div>
                            <div className="text-sage-800">
                              {ord.items.map((it, idx) => (
                                <span key={idx} className="font-semibold block">{it.qty}x {it.name}</span>
                              ))}
                            </div>
                            {alertInfo.hasAllergyAlert && (
                              <span className="text-[10px] text-red-700 font-bold block flex items-center space-x-1">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                <span>Chú ý dị ứng: {alertInfo.matchedAllergens.join(', ')}</span>
                              </span>
                            )}
                          </div>
                          <div>
                            <span className={`px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase ${ord.status === 'Pending' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {ord.status === 'Pending' ? 'Chờ nhận' : 'Đang chuẩn bị'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {orders.filter(o => o.status !== 'Completed').length === 0 && (
                      <p className="text-xs text-sage-400 text-center py-8 italic">Bếp hiện tại không có đơn gọi món nào đang chờ.</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-[#fefcf8] border border-sage-100 rounded-2xl text-xs mt-4">
                  <h4 className="font-bold text-[#b45309]">Tip Vận Hành Bếp:</h4>
                  <p className="text-sage-600 mt-1 font-light">
                    Sử dụng bếp gas trung tâm cho các món hầm sâm và lò hấp nhiệt độ chuẩn 85°C đối với nấm đùi gà để giữ trọn dưỡng chất thực dưỡng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: ALLERGEN MONITOR (THEO DÕI DỊ ỨNG)
            ========================================== */}
        {activeTab === 'allergies' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="bg-white border border-sage-200/50 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-sm text-sage-950">Theo Dõi Chi Tiết Dị Ứng Khách Hàng</h3>
                <p className="text-xs text-sage-500">Giám sát các loại dị ứng đặc thù của khách lưu trú để lập thực đơn món ăn an toàn.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute inset-y-0 left-0 pl-3 flex items-center text-sage-400 h-4.5 w-4.5 pointer-events-none mt-2.5" />
                <input 
                  type="text"
                  value={allergySearch}
                  onChange={(e) => setAllergySearch(e.target.value)}
                  placeholder="Tìm khách hàng hoặc số phòng..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-sage-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#f59e0b] bg-white placeholder-sage-400"
                />
              </div>
            </div>

            {/* List Allergens Table */}
            <div className="bg-white border border-sage-200/50 rounded-3xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-sage-50/50 text-sage-600 font-bold border-b border-sage-100">
                      <th className="p-4">Mã KH</th>
                      <th className="p-4">Họ và Tên</th>
                      <th className="p-4">Số Phòng</th>
                      <th className="p-4">Ngày nhận phòng</th>
                      <th className="p-4">Dị ứng ghi chú (Allergies)</th>
                      <th className="p-4">Chế độ ăn (Dietary Profile)</th>
                      <th className="p-4 text-center">Trạng thái an toàn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage-50/50">
                    {allergies
                      .filter(item => item.guest.toLowerCase().includes(allergySearch.toLowerCase()) || item.room.includes(allergySearch))
                      .map(item => (
                        <tr key={item.id} className="hover:bg-sage-50/10">
                          <td className="p-4 font-mono font-bold text-sage-400">{item.id}</td>
                          <td className="p-4 font-bold text-sage-950">{item.guest}</td>
                          <td className="p-4 font-bold text-primary-900 font-mono">PHÒNG {item.room}</td>
                          <td className="p-4 text-sage-700">{item.checkIn}</td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {item.allergies.length > 0 ? (
                                item.allergies.map((alg, i) => (
                                  <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                                    alg === 'Hải sản' || alg === 'Đậu phộng' ? 'bg-red-600' : 'bg-amber-600'
                                  }`}>
                                    {alg}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sage-400 italic text-[10px]">Không có dị ứng đặc biệt</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 bg-[#fef3c7] text-[#b45309] rounded text-[10px] font-bold font-mono">
                              {item.dietary}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center space-x-1 text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full font-semibold text-[10px]">
                              <Check className="h-3 w-3" />
                              <span>Bếp đã lưu thông tin</span>
                            </span>
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
            TAB 3: DAILY MENU (QUẢN LÝ THỰC ĐƠN)
            ========================================== */}
        {activeTab === 'menu' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="bg-white border border-sage-200/50 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-sm text-sage-950">Danh Sách Thực Đơn Hàng Ngày</h3>
                <p className="text-xs text-sage-500">Đặt món ăn phục vụ cho Sáng, Trưa, Tối. Báo hết hàng hoặc tạm tắt món ăn trên menu trực tuyến.</p>
              </div>
              <div className="flex space-x-2">
                {['All', 'Breakfast', 'Lunch', 'Dinner'].map(period => (
                  <button
                    key={period}
                    onClick={() => setDishFilter(period)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${dishFilter === period ? 'bg-[#1b2b11] text-white' : 'bg-white border border-sage-200 text-sage-700 hover:bg-sage-50'}`}
                  >
                    {period === 'All' && 'Tất cả'}
                    {period === 'Breakfast' && 'Sáng (Breakfast)'}
                    {period === 'Lunch' && 'Trưa (Lunch)'}
                    {period === 'Dinner' && 'Tối (Dinner)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Today Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dishes
                .filter(d => d.isTodayMenu && (dishFilter === 'All' || d.period === dishFilter))
                .map(dish => (
                  <div 
                    key={dish.id} 
                    className={`bg-white rounded-3xl border shadow-xs p-5 flex flex-col justify-between h-56 transition-all ${dish.soldOut ? 'border-red-200 bg-red-50/20' : 'border-sage-200/50 hover:border-[#f59e0b]/40'}`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-bold text-sage-400 uppercase tracking-widest font-mono">{dish.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase font-mono ${
                          dish.period === 'Breakfast' ? 'bg-amber-100 text-amber-800' :
                          dish.period === 'Lunch' ? 'bg-blue-100 text-blue-800' : 'bg-[#2e1065]/10 text-[#2e1065]'
                        }`}>
                          {dish.period}
                        </span>
                      </div>
                      <h4 className={`text-base font-bold text-sage-950 mt-1.5 ${dish.soldOut ? 'line-through text-sage-400' : ''}`}>{dish.name}</h4>
                      <p className="text-xs text-sage-500 mt-1 line-clamp-2 font-light leading-relaxed">{dish.description}</p>
                      
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {dish.allergens.map((alg, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded text-[9px] font-bold">
                            Chứa: {alg}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-sage-100 mt-3">
                      <span className="font-bold text-sage-950 text-sm">{dish.price}</span>
                      <div className="flex space-x-1.5">
                        <button
                          onClick={() => handleToggleSoldOut(dish.id)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition-all ${
                            dish.soldOut ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-50 hover:bg-red-100 text-red-700'
                          }`}
                        >
                          {dish.soldOut ? 'Còn hàng' : 'Hết hàng (Sold Out)'}
                        </button>
                        <button
                          onClick={() => handleToggleTodayMenu(dish.id)}
                          className="px-3 py-1.5 bg-sage-100 hover:bg-sage-200 text-sage-800 rounded-xl text-[10px] font-bold cursor-pointer"
                        >
                          Tắt Hôm Nay
                        </button>
                      </div>
                    </div>
                  </div>
              ))}
            </div>

            {/* Quick action: Add other dishes to menu */}
            <div className="bg-[#f0f3eb] border border-sage-200/50 rounded-3xl p-6">
              <h3 className="font-serif text-base font-bold text-sage-950 mb-3">Món Ăn Đang Tắt - Kích Hoạt Lên Thực Đơn Hôm Nay</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {dishes.filter(d => !d.isTodayMenu).map(d => (
                  <div key={d.id} className="bg-white border border-sage-250/20 p-4 rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-sage-900">{d.name}</h4>
                      <span className="text-[10px] text-sage-400 block mt-0.5">{d.category} - {d.price}</span>
                    </div>
                    <button
                      onClick={() => handleToggleTodayMenu(d.id)}
                      className="px-2.5 py-1.5 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-lg font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Bật</span>
                    </button>
                  </div>
                ))}
                {dishes.filter(d => !d.isTodayMenu).length === 0 && (
                  <p className="text-xs text-sage-400 italic text-center py-3 col-span-3">Tất cả các món ăn trong cơ sở dữ liệu đều đang hiển thị ở thực đơn hôm nay.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: FOOD ORDERS (ĐƠN ĐẶT MÓN & TIẾN ĐỘ)
            ========================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="bg-white border border-sage-200/50 rounded-2xl p-5 shadow-xs flex justify-between items-center gap-4">
              <div>
                <h3 className="font-bold text-base text-sage-950 flex items-center space-x-2">
                  <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
                  <span>Hệ Thống Màn Kinh KDS (Kitchen Display System) - Báo Món Bằng Giọng Nói</span>
                </h3>
                <p className="text-xs text-sage-500">Thẻ đặt món hiển thị chữ CỰC LỚN, có còi cảnh báo dị ứng nhấp nháy đỏ và nút bấm đọc to đơn hàng tránh sai sót.</p>
              </div>
              <button 
                type="button"
                onClick={() => playVoiceAlert("Hệ thống âm thanh nhà bếp Ngũ Sơn Resort đã sẵn sàng phục vụ.")}
                className="px-4 py-2.5 bg-[#1b2b11] hover:bg-[#25391c] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md"
              >
                <span>🔊 Test Âm Thanh</span>
              </button>
            </div>

            {/* Kanban / Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              
              {/* Cột 1: Đơn Chờ Nhận (Pending) */}
              <div className="bg-[#e0f2fe] border border-blue-200 rounded-3xl p-5 space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h4 className="font-serif text-base font-black text-blue-900 flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-blue-600 animate-ping block" />
                    <span>1. ĐƠN CHỜ NHẬN ({orders.filter(o => o.status === 'Pending').length})</span>
                  </h4>
                </div>
                
                <div className="space-y-4">
                  {orders.filter(o => o.status === 'Pending').map(ord => {
                    const alertInfo = checkOrderAllergies(ord);
                    return (
                      <div 
                        key={ord.id} 
                        className={`bg-white rounded-[24px] border p-5 shadow-sm flex flex-col justify-between min-h-[280px] h-auto transition-all duration-300 ${
                          alertInfo.hasAllergyAlert ? 'border-red-500 ring-4 ring-red-100 bg-red-50/20' : 'border-sage-200/60 hover:border-blue-400'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Card Header */}
                          <div className="flex items-center justify-between border-b border-sage-100 pb-3 gap-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xl sm:text-2xl font-black bg-[#1b2b11] text-[#facc15] px-3.5 py-1.5 rounded-xl shadow-md border border-[#f59e0b]/30">
                                PHÒNG {ord.room}
                              </span>
                              <span className={`px-2 py-1 rounded-lg text-[9px] font-extrabold tracking-wide uppercase ${
                                ord.origin === 'Room Service' ? 'bg-purple-600 text-white shadow-3xs' : 'bg-blue-600 text-white shadow-3xs'
                              }`}>
                                {ord.origin}
                              </span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => {
                                const alertText = alertInfo.hasAllergyAlert 
                                  ? `Đơn hàng phòng ${ord.room}. Cảnh báo dị ứng: ${alertInfo.matchedAllergens.join(', ')}. Gọi món: ${ord.items.map(it => `${it.qty} suất ${it.name}`).join('. ')}`
                                  : `Đơn hàng phòng ${ord.room}. Gọi món: ${ord.items.map(it => `${it.qty} suất ${it.name}`).join('. ')}`;
                                playVoiceAlert(alertText);
                              }}
                              className="px-2 py-1 bg-sage-100 hover:bg-sage-200 text-sage-800 rounded-lg flex items-center justify-center cursor-pointer border border-sage-250/50 shadow-3xs"
                              title="Đọc to đơn hàng"
                            >
                              <span className="text-[10px] font-bold">🔊 Đọc Đơn</span>
                            </button>
                          </div>
                          
                          <div className="flex justify-between items-center text-[10px] text-sage-500 font-semibold">
                            <span>Mã đơn: <span className="font-mono text-sage-900 font-bold">{ord.id}</span></span>
                            <span>Khách: <strong className="text-sage-800">{ord.guestName}</strong></span>
                          </div>

                          {/* Items Stack - KDS Style */}
                          <div className="py-2 border-t border-b border-sage-100 space-y-1.5">
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-sage-50 border border-sage-100 rounded-xl shadow-3xs">
                                <div className="flex items-center">
                                  <span className="flex items-center justify-center h-7 w-7 bg-[#1b2b11] text-[#facc15] font-black rounded-lg text-sm flex-shrink-0 mr-2.5">
                                    x{it.qty}
                                  </span>
                                  <span className="text-xs sm:text-sm font-extrabold text-sage-900 leading-tight">
                                    {it.name}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Notes */}
                          {ord.note && (
                            <div className="bg-[#fffbeb] border-l-4 border-[#d97706] text-[#b45309] p-3 rounded-r-xl text-xs font-bold leading-relaxed mt-2.5 shadow-3xs">
                              Lưu ý từ khách: {ord.note}
                            </div>
                          )}

                          {/* Pulsing Allergy Warning */}
                          {alertInfo.hasAllergyAlert && (
                            <div className="bg-red-600 border border-red-700 text-white rounded-xl p-3 text-[10px] font-black animate-pulse flex items-center space-x-2 mt-2.5 shadow-md">
                              <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0 animate-bounce" />
                              <span className="leading-snug uppercase tracking-wider text-center flex-grow text-[9px]">
                                ⚠️ CẢNH BÁO DỊ ỨNG: DỊ ỨNG {alertInfo.matchedAllergens.join(', ')} ⚠️
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-sage-100 flex justify-between items-center mt-4">
                          <span className="text-[10px] text-sage-400 font-mono flex items-center"><Clock className="h-3 w-3 mr-1" />{ord.time}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(ord.id, 'Cooking')}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm active:scale-95 transition-transform"
                          >
                            NHẬN ĐƠN & NẤU
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {orders.filter(o => o.status === 'Pending').length === 0 && (
                    <p className="text-xs text-sage-400 italic text-center py-12">Hiện không có đơn mới.</p>
                  )}
                </div>
              </div>

              {/* Cột 2: Đang Nấu (Cooking) */}
              <div className="bg-[#fffbeb] border border-amber-200 rounded-3xl p-5 space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h4 className="font-serif text-base font-black text-amber-800 flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-amber-500 animate-pulse block" />
                    <span>2. ĐANG NẤU ({orders.filter(o => o.status === 'Cooking').length})</span>
                  </h4>
                </div>

                <div className="space-y-4">
                  {orders.filter(o => o.status === 'Cooking').map(ord => {
                    const alertInfo = checkOrderAllergies(ord);
                    return (
                      <div 
                        key={ord.id} 
                        className={`bg-white rounded-[24px] border p-5 shadow-sm flex flex-col justify-between min-h-[280px] h-auto transition-all duration-300 ${
                          alertInfo.hasAllergyAlert ? 'border-red-500 ring-4 ring-red-50 bg-red-50/20' : 'border-sage-200/60 hover:border-amber-400'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Card Header */}
                          <div className="flex items-center justify-between border-b border-sage-100 pb-3 gap-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xl sm:text-2xl font-black bg-[#1b2b11] text-[#facc15] px-3.5 py-1.5 rounded-xl shadow-md border border-[#f59e0b]/30">
                                PHÒNG {ord.room}
                              </span>
                              <span className={`px-2 py-1 rounded-lg text-[9px] font-extrabold tracking-wide uppercase ${
                                ord.origin === 'Room Service' ? 'bg-purple-600 text-white shadow-3xs' : 'bg-blue-600 text-white shadow-3xs'
                              }`}>
                                {ord.origin}
                              </span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => {
                                const alertText = alertInfo.hasAllergyAlert 
                                  ? `Đơn hàng phòng ${ord.room}. Cảnh báo dị ứng: ${alertInfo.matchedAllergens.join(', ')}. Gọi món: ${ord.items.map(it => `${it.qty} suất ${it.name}`).join('. ')}`
                                  : `Đơn hàng phòng ${ord.room}. Gọi món: ${ord.items.map(it => `${it.qty} suất ${it.name}`).join('. ')}`;
                                playVoiceAlert(alertText);
                              }}
                              className="px-2 py-1 bg-sage-100 hover:bg-sage-200 text-sage-800 rounded-lg flex items-center justify-center cursor-pointer border border-sage-250/50 shadow-3xs"
                              title="Đọc to đơn hàng"
                            >
                              <span className="text-[10px] font-bold">🔊 Đọc Đơn</span>
                            </button>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-sage-500 font-semibold">
                            <span>Mã đơn: <span className="font-mono text-sage-900 font-bold">{ord.id}</span></span>
                            <span>Khách: <strong className="text-sage-800">{ord.guestName}</strong></span>
                          </div>

                          {/* Items Stack - KDS Style */}
                          <div className="py-2 border-t border-b border-sage-100 space-y-1.5">
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-[#fffdf5] border border-amber-100 rounded-xl shadow-3xs">
                                <div className="flex items-center">
                                  <span className="flex items-center justify-center h-7 w-7 bg-[#d97706] text-white font-black rounded-lg text-sm flex-shrink-0 mr-2.5">
                                    x{it.qty}
                                  </span>
                                  <span className="text-xs sm:text-sm font-extrabold text-sage-900 leading-tight">
                                    {it.name}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Notes */}
                          {ord.note && (
                            <div className="bg-[#fffbeb] border-l-4 border-[#d97706] text-[#b45309] p-3 rounded-r-xl text-xs font-bold leading-relaxed mt-2.5 shadow-3xs">
                              Lưu ý từ khách: {ord.note}
                            </div>
                          )}

                          {/* Pulsing Allergy Warning */}
                          {alertInfo.hasAllergyAlert && (
                            <div className="bg-red-600 border border-red-700 text-white rounded-xl p-3 text-[10px] font-black animate-pulse flex items-center space-x-2 mt-2.5 shadow-md">
                              <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0 animate-bounce" />
                              <span className="leading-snug uppercase tracking-wider text-center flex-grow text-[9px]">
                                ⚠️ CẢNH BÁO DỊ ỨNG: DỊ ỨNG {alertInfo.matchedAllergens.join(', ')} ⚠️
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-sage-100 flex justify-between items-center mt-4">
                          <span className="text-[10px] text-sage-400 font-mono flex items-center"><Clock className="h-3 w-3 mr-1" />{ord.time}</span>
                          <button 
                            type="button"
                            onClick={() => handleUpdateOrderStatus(ord.id, 'Completed')}
                            className="px-4 py-2.5 bg-[#059669] hover:bg-green-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm active:scale-95 transition-transform"
                          >
                            HOÀN THÀNH MÓN
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {orders.filter(o => o.status === 'Cooking').length === 0 && (
                    <p className="text-xs text-sage-400 italic text-center py-12">Không có món đang chuẩn bị.</p>
                  )}
                </div>
              </div>

              {/* Cột 3: Đã Hoàn Thành (Completed) */}
              <div className="bg-[#d1fae5] border border-green-200 rounded-3xl p-5 space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h4 className="font-serif text-base font-black text-green-800 flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-green-600 block" />
                    <span>3. ĐÃ HOÀN THÀNH ({orders.filter(o => o.status === 'Completed').length})</span>
                  </h4>
                </div>

                <div className="space-y-4">
                  {orders.filter(o => o.status === 'Completed').map(ord => (
                    <div 
                      key={ord.id} 
                      className="bg-white rounded-[24px] border border-sage-200/40 p-5 shadow-sm flex flex-col justify-between min-h-[280px] h-auto transition-all hover:border-green-400"
                    >
                      <div className="space-y-3">
                        {/* Card Header */}
                        <div className="flex items-center justify-between border-b border-sage-100 pb-3 gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl sm:text-2xl font-black bg-sage-200 text-sage-800 px-3.5 py-1.5 rounded-xl shadow-md border border-sage-300">
                              PHÒNG {ord.room}
                            </span>
                            <span className="px-2 py-1 rounded-lg text-[9px] font-extrabold tracking-wide uppercase bg-sage-100 text-sage-600">
                              {ord.origin}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-sage-500 font-semibold">
                          <span>Mã đơn: <span className="font-mono text-sage-900 font-bold">{ord.id}</span></span>
                          <span>Khách: <strong className="text-sage-800">{ord.guestName}</strong></span>
                        </div>

                        {/* Items Stack - Completed style */}
                        <div className="py-2 border-t border-b border-sage-100 space-y-1.5">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-green-50/50 border border-green-100 rounded-xl shadow-3xs opacity-80">
                              <div className="flex items-center">
                                <span className="flex items-center justify-center h-7 w-7 bg-green-600 text-white font-black rounded-lg text-sm flex-shrink-0 mr-2.5">
                                  x{it.qty}
                                </span>
                                <span className="text-xs sm:text-sm font-extrabold text-sage-900 line-through leading-tight">
                                  {it.name}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="text-[10px] text-green-700 bg-green-50 p-2.5 rounded-xl border border-green-150 font-bold flex items-center space-x-1.5 mt-2">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
                          <span>Đã phục vụ xong thành công</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-sage-100 flex justify-between items-center mt-4">
                        <span className="text-[10px] text-sage-400 font-mono flex items-center"><Clock className="h-3 w-3 mr-1" />{ord.time}</span>
                        <span className="text-[11px] font-black text-green-600 uppercase flex items-center space-x-1">
                          <Check className="h-4 w-4" />
                          <span>Hoàn thành</span>
                        </span>
                      </div>
                    </div>
                  ))}
                  {orders.filter(o => o.status === 'Completed').length === 0 && (
                    <p className="text-xs text-sage-400 italic text-center py-12">Chưa hoàn thành đơn nào.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 5: DISH DATABASE (QUẢN LÝ MÓN ĂN)
            ========================================== */}
        {activeTab === 'dishes' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="bg-white border border-sage-200/50 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-sm text-sage-950">Cơ Sở Dữ Liệu Danh Mục Món Ăn</h3>
                <p className="text-xs text-sage-500">Lưu trữ toàn bộ công thức, giá cả, thành phần nguyên liệu và danh mục dị ứng của món ăn resort.</p>
              </div>
              <button
                onClick={() => {
                  setForm({ name: '', price: '', category: 'Món chính', description: '', ingredients: '', allergens: '', period: 'Lunch', isTodayMenu: true });
                  setShowAddDishModal(true);
                }}
                className="px-4 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md"
              >
                <PlusCircle className="h-4.5 w-4.5" />
                <span>Thêm Món Ăn Mới</span>
              </button>
            </div>

            {/* Dish list table */}
            <div className="bg-white border border-sage-200/50 rounded-3xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-sage-50/50 text-sage-600 font-bold border-b border-sage-100">
                      <th className="p-4">Mã Món</th>
                      <th className="p-4">Tên Món Ăn</th>
                      <th className="p-4">Phân loại</th>
                      <th className="p-4">Giá tiền</th>
                      <th className="p-4">Thành phần nguyên liệu</th>
                      <th className="p-4">Chứa chất dị ứng</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-center">Tác vụ bếp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage-50/50">
                    {dishes.map(dish => (
                      <tr key={dish.id} className="hover:bg-sage-50/10">
                        <td className="p-4 font-mono font-bold text-sage-500">{dish.id}</td>
                        <td className="p-4">
                          <div>
                            <span className="font-bold text-sage-950 block">{dish.name}</span>
                            <span className="text-[10px] text-sage-400 font-light block line-clamp-1">{dish.description}</span>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-sage-700">{dish.category}</td>
                        <td className="p-4 font-bold text-sage-900 font-mono">{dish.price}</td>
                        <td className="p-4 text-sage-600 font-light max-w-xs truncate" title={dish.ingredients}>{dish.ingredients}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {dish.allergens.length > 0 ? (
                              dish.allergens.map((alg, i) => (
                                <span key={i} className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-[9px] font-bold border border-red-100">
                                  {alg}
                                </span>
                              ))
                            ) : (
                              <span className="text-sage-400 italic text-[10px]">Không có</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            dish.enabled ? 'bg-green-100 text-green-700' : 'bg-sage-100 text-sage-400'
                          }`}>
                            {dish.enabled ? 'Phục vụ' : 'Tạm khóa'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => openEditDish(dish)}
                              className="px-2.5 py-1.5 bg-sage-100 hover:bg-sage-200 text-sage-800 rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteDish(dish.id)}
                              className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Xóa
                            </button>
                            <button
                              onClick={() => handleToggleEnabled(dish.id)}
                              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                                dish.enabled ? 'bg-[#fffbeb] text-amber-700 hover:bg-amber-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                              }`}
                            >
                              {dish.enabled ? 'Tắt' : 'Bật'}
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
            TAB 6: KITCHEN INVENTORY (KHO & GỌI HÀNG)
            ========================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="bg-white border border-sage-200/50 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-sm text-sage-950">Kho Nguyên Liệu Bếp & Đề Xuất Thu Mua</h3>
                <p className="text-xs text-sage-500">Giám sát lượng tồn thực tế của thực phẩm trong tủ mát/kho bếp trực. Tạo đơn đề xuất mua hàng khi cạn kiệt.</p>
              </div>
              <button
                onClick={() => setShowRequestModal(true)}
                className="px-4 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md"
              >
                <PlusCircle className="h-4.5 w-4.5" />
                <span>Yêu Cầu Nhập Nguyên Liệu</span>
              </button>
            </div>

            {/* Inventory table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Bảng nguyên liệu */}
              <div className="bg-white border border-sage-200/50 rounded-3xl p-5 shadow-xs col-span-2 space-y-4">
                <h3 className="font-serif text-base font-bold text-sage-950">Nguyên Liệu Trong Kho Bếp</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-sage-50/50 text-sage-600 font-bold border-b border-sage-100">
                        <th className="p-3">Nguyên liệu</th>
                        <th className="p-3">Phân nhóm</th>
                        <th className="p-3">Tồn kho</th>
                        <th className="p-3">Hạn mức tối thiểu</th>
                        <th className="p-3">Đơn vị</th>
                        <th className="p-3">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sage-50/50">
                      {ingredients.map(ing => (
                        <tr key={ing.id} className="hover:bg-sage-50/10">
                          <td className="p-3 font-bold text-sage-950">{ing.name}</td>
                          <td className="p-3 text-sage-600">{ing.category}</td>
                          <td className={`p-3 font-bold ${ing.stock === 0 ? 'text-red-600' : ing.stock < ing.minQty ? 'text-amber-600' : 'text-sage-900'}`}>{ing.stock}</td>
                          <td className="p-3 text-sage-500 font-mono">{ing.minQty}</td>
                          <td className="p-3 text-sage-500">{ing.unit}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              ing.status === 'Đầy đủ' ? 'bg-green-100 text-green-700' :
                              ing.status === 'Sắp hết' ? 'bg-amber-100 text-[#b45309]' : 'bg-red-100 text-red-700'
                            }`}>
                              {ing.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bảng yêu cầu mua hàng */}
              <div className="bg-white border border-sage-200/50 rounded-3xl p-5 shadow-xs space-y-4">
                <h3 className="font-serif text-base font-bold text-sage-950">Nhật Ký Yêu Cầu Nhập Hàng</h3>
                
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {procurements.map(req => (
                    <div key={req.id} className="p-3 bg-sage-50/50 border border-sage-100 rounded-2xl text-xs space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sage-900">{req.name}</span>
                        <span className={`px-2 py-0.5 rounded-[6px] text-[8px] font-bold uppercase ${
                          req.status === 'Chờ duyệt' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-sage-500 font-light">
                        <span>Số lượng: <strong className="text-sage-800 font-bold">{req.qty} {req.unit}</strong></span>
                        <span>Ngày tạo: {req.date}</span>
                      </div>
                      <div className="text-[9px] font-mono text-sage-400">Đơn yêu cầu: {req.id}</div>
                    </div>
                  ))}
                  {procurements.length === 0 && (
                    <p className="text-xs text-sage-400 italic text-center py-10">Chưa gửi yêu cầu nhập hàng nào.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ==========================================
          MODALS
          ========================================== */}
      
      {/* 1. Modal Thêm Món Ăn Mới */}
      {showAddDishModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-sage-200 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => setShowAddDishModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-sage-100 text-sage-500 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-sage-950 mb-6 flex items-center space-x-2">
              <PlusCircle className="h-5 w-5 text-[#f59e0b]" />
              <span>Thêm Món Ăn Mới Vào Thực Đơn</span>
            </h3>

            <form onSubmit={handleAddDish} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">Tên món ăn *</label>
                  <input 
                    type="text" 
                    value={dishForm.name} 
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ví dụ: Bún chả thực dưỡng"
                    className="w-full p-2.5 rounded-xl border border-sage-200 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] bg-white text-sage-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">Giá bán *</label>
                  <input 
                    type="text" 
                    value={dishForm.price} 
                    onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Ví dụ: 350,000đ"
                    className="w-full p-2.5 rounded-xl border border-sage-200 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] bg-white text-sage-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">Phân loại món</label>
                  <select 
                    value={dishForm.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-sage-200 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] bg-white text-sage-900"
                  >
                    <option value="Khai vị">Khai vị</option>
                    <option value="Món chính">Món chính</option>
                    <option value="Tráng miệng">Tráng miệng</option>
                    <option value="Thức uống">Thức uống</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">Bữa phục vụ</label>
                  <select 
                    value={dishForm.period}
                    onChange={(e) => setForm(prev => ({ ...prev, period: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-sage-200 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] bg-white text-sage-900"
                  >
                    <option value="Breakfast">Breakfast (Sáng)</option>
                    <option value="Lunch">Lunch (Trưa)</option>
                    <option value="Dinner">Dinner (Tối)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">Menu hôm nay?</label>
                  <select 
                    value={dishForm.isTodayMenu ? 'true' : 'false'}
                    onChange={(e) => setForm(prev => ({ ...prev, isTodayMenu: e.target.value === 'true' }))}
                    className="w-full p-2.5 rounded-xl border border-sage-200 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] bg-white text-[#1a2e05] font-bold"
                  >
                    <option value="true">Bật luôn hôm nay</option>
                    <option value="false">Tắt (Lưu kho)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-sage-800">Mô tả chi tiết món ăn</label>
                <textarea 
                  value={dishForm.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="2"
                  placeholder="Mô tả công dụng thực dưỡng, hương vị..."
                  className="w-full p-2.5 rounded-xl border border-sage-200 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] bg-white text-sage-950 font-light"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-sage-800">Nguyên liệu thành phần</label>
                <input 
                  type="text" 
                  value={dishForm.ingredients} 
                  onChange={(e) => setForm(prev => ({ ...prev, ingredients: e.target.value }))}
                  placeholder="Ví dụ: Đậu hũ organic (100g), Sả bằm, Rau sống..."
                  className="w-full p-2.5 rounded-xl border border-sage-200 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] bg-white text-sage-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-sage-800 text-red-700 flex items-center space-x-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Cảnh báo chất dị ứng (nếu có, phẩy ngăn cách)</span>
                </label>
                <input 
                  type="text" 
                  value={dishForm.allergens} 
                  onChange={(e) => setForm(prev => ({ ...prev, allergens: e.target.value }))}
                  placeholder="Ví dụ: Hải sản, Đậu phộng, Cay..."
                  className="w-full p-2.5 rounded-xl border border-red-200 focus:outline-none focus:ring-1 focus:ring-red-600 bg-white text-sage-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-sage-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddDishModal(false)}
                  className="px-4 py-2 bg-sage-100 hover:bg-sage-200 text-sage-800 rounded-xl font-bold cursor-pointer"
                >
                  Đóng
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#f59e0b] text-white rounded-xl font-bold hover:bg-[#d97706] cursor-pointer"
                >
                  Thêm món mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Chỉnh Sửa Món Ăn */}
      {showEditDishModal && selectedDish && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-sage-200 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => {
                setShowEditDishModal(false);
                setSelectedDish(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-sage-100 text-sage-500 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-sage-950 mb-6 flex items-center space-x-2">
              <PlusCircle className="h-5 w-5 text-[#f59e0b]" />
              <span>Chỉnh Sửa Món Ăn: {selectedDish.id}</span>
            </h3>

            <form onSubmit={handleUpdateDish} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">Tên món ăn *</label>
                  <input 
                    type="text" 
                    value={dishForm.name} 
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-sage-200 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] bg-white text-sage-900 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">Giá bán *</label>
                  <input 
                    type="text" 
                    value={dishForm.price} 
                    onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-sage-200 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] bg-white text-sage-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">Phân loại món</label>
                  <select 
                    value={dishForm.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-sage-200 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] bg-white text-sage-900"
                  >
                    <option value="Khai vị">Khai vị</option>
                    <option value="Món chính">Món chính</option>
                    <option value="Tráng miệng">Tráng miệng</option>
                    <option value="Thức uống">Thức uống</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">Bữa phục vụ</label>
                  <select 
                    value={dishForm.period}
                    onChange={(e) => setForm(prev => ({ ...prev, period: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-sage-200 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] bg-white text-sage-900"
                  >
                    <option value="Breakfast">Breakfast (Sáng)</option>
                    <option value="Lunch">Lunch (Trưa)</option>
                    <option value="Dinner">Dinner (Tối)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">Menu hôm nay?</label>
                  <select 
                    value={dishForm.isTodayMenu ? 'true' : 'false'}
                    onChange={(e) => setForm(prev => ({ ...prev, isTodayMenu: e.target.value === 'true' }))}
                    className="w-full p-2.5 rounded-xl border border-sage-200 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] bg-white text-[#1a2e05] font-bold"
                  >
                    <option value="true">Bật hôm nay</option>
                    <option value="false">Tắt hôm nay</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-sage-800">Mô tả chi tiết món ăn</label>
                <textarea 
                  value={dishForm.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="2"
                  className="w-full p-2.5 rounded-xl border border-sage-200 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] bg-white text-sage-950 font-light"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-sage-800">Nguyên liệu thành phần</label>
                <input 
                  type="text" 
                  value={dishForm.ingredients} 
                  onChange={(e) => setForm(prev => ({ ...prev, ingredients: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-sage-200 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] bg-white text-sage-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-sage-800 text-red-705 flex items-center space-x-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Cảnh báo chất dị ứng (phẩy ngăn cách)</span>
                </label>
                <input 
                  type="text" 
                  value={dishForm.allergens} 
                  onChange={(e) => setForm(prev => ({ ...prev, allergens: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-red-200 focus:outline-none focus:ring-1 focus:ring-red-600 bg-white text-sage-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-sage-100">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEditDishModal(false);
                    setSelectedDish(null);
                  }}
                  className="px-4 py-2 bg-sage-100 hover:bg-sage-200 text-sage-800 rounded-xl font-bold cursor-pointer"
                >
                  Đóng
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#f59e0b] text-white rounded-xl font-bold hover:bg-[#d97706] cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Gửi Yêu Cầu Nhập Nguyên Liệu */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-sage-200 shadow-2xl relative">
            <button 
              onClick={() => setShowRequestModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-sage-100 text-sage-500 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-base font-bold text-sage-950 mb-4 flex items-center space-x-2">
              <Package className="h-5 w-5 text-[#f59e0b]" />
              <span>Yêu Cầu Nhập Thêm Thực Phẩm</span>
            </h3>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-sage-800">Chọn nguyên liệu cần nhập</label>
                <select 
                  value={requestForm.name}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-sage-200 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] bg-white text-sage-900"
                >
                  {ingredients.map(ing => (
                    <option key={ing.id} value={ing.name}>{ing.name} ({ing.unit})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">Số lượng yêu cầu</label>
                  <input 
                    type="number" 
                    value={requestForm.qty} 
                    onChange={(e) => setRequestForm(prev => ({ ...prev, qty: e.target.value }))}
                    placeholder="Ví dụ: 10"
                    className="w-full p-2.5 rounded-xl border border-sage-200 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] bg-white text-sage-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-sage-800">Đơn vị đo</label>
                  <input 
                    type="text" 
                    value={requestForm.unit} 
                    onChange={(e) => setRequestForm(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="Kg / Khay / Củ"
                    className="w-full p-2.5 rounded-xl border border-sage-200 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] bg-white text-sage-900 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-sage-100">
                <button 
                  type="button" 
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 bg-sage-100 hover:bg-sage-200 text-sage-800 rounded-xl font-bold cursor-pointer"
                >
                  Đóng
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#f59e0b] text-white rounded-xl font-bold hover:bg-[#d97706] cursor-pointer"
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
