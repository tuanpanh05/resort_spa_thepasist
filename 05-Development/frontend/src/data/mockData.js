// ==========================================
// CENTRALIZED MOCK DATA FOR SWP391 PROJECT
// ==========================================

// ------------------------------------------
// 1. ADMIN DASHBOARD MOCK DATA
// ------------------------------------------

export const adminInitialAccounts = [
  {
    id: "ACC-001",
    name: "Trần Thị Mai",
    email: "maitran@gmail.com",
    phone: "0901234567",
    role: "Customer",
    status: "Active",
    dateCreated: "2026-01-10",
  },
  {
    id: "ACC-002",
    name: "Lê Hoàng Nam",
    email: "namle@gmail.com",
    phone: "0987654321",
    role: "Customer",
    status: "Active",
    dateCreated: "2026-02-15",
  },
  {
    id: "ACC-003",
    name: "Lê Thị Thu",
    email: "thule@nguson.com",
    phone: "0905556667",
    role: "Staff",
    status: "Active",
    dateCreated: "2026-03-20",
    department: "Lễ tân",
  },
  {
    id: "ACC-004",
    name: "Nguyễn Văn Huy",
    email: "huynguyen@nguson.com",
    phone: "0903334445",
    role: "Spa",
    status: "Active",
    dateCreated: "2025-11-05",
    department: "Trực Spa đá nóng",
  },
  {
    id: "ACC-005",
    name: "Phạm Văn Long",
    email: "longpham@nguson.com",
    phone: "0906667778",
    role: "Physio",
    status: "Active",
    dateCreated: "2026-04-12",
    department: "Vật lý trị liệu",
  },
  {
    id: "ACC-006",
    name: "Nguyễn Ngũ Sơn",
    email: "admin@nguson.com",
    phone: "0999888999",
    role: "Admin",
    status: "Active",
    dateCreated: "2025-09-01",
    department: "Ban Giám Đốc",
  },
  {
    id: "ACC-007",
    name: "Trần Văn Bếp",
    email: "chef@nguson.com",
    phone: "0908889999",
    role: "Chef",
    status: "Active",
    dateCreated: "2025-12-10",
    department: "Nhà bếp resort",
  },
  {
    id: "ACC-008",
    name: "Master Yoga Ananda",
    email: "yoga@nguson.com",
    phone: "0907778888",
    role: "Yoga",
    status: "Active",
    dateCreated: "2026-01-05",
    department: "Khu Yoga bờ biển",
  },
];

export const adminInitialRooms = [
  {
    id: "101",
    type: "VIP",
    status: "occupied",
    floor: 1,
    price: "4,500,000đ",
    maxGuests: 4,
    photo: "room_vip_view.jpg",
  },
  {
    id: "102",
    type: "Standard",
    status: "vacant",
    floor: 1,
    price: "1,800,000đ",
    maxGuests: 2,
    photo: "room_std_garden.jpg",
  },
  {
    id: "103",
    type: "Deluxe",
    status: "maintenance",
    floor: 1,
    price: "2,900,000đ",
    maxGuests: 2,
    photo: "room_deluxe_forest.jpg",
    issue: "Hỏng vòi sen nhà tắm",
  },
  {
    id: "104",
    type: "Villa",
    status: "cleaning",
    floor: 1,
    price: "5,800,000đ",
    maxGuests: 6,
    photo: "room_villa_ocean.jpg",
  },
  {
    id: "201",
    type: "Standard",
    status: "occupied",
    floor: 2,
    price: "1,800,000đ",
    maxGuests: 2,
    photo: "room_std_garden.jpg",
  },
  {
    id: "202",
    type: "Deluxe",
    status: "occupied",
    floor: 2,
    price: "2,900,000đ",
    maxGuests: 2,
    photo: "room_deluxe_forest.jpg",
  },
  {
    id: "203",
    type: "Villa",
    status: "vacant",
    floor: 2,
    price: "5,800,000đ",
    maxGuests: 6,
    photo: "room_villa_ocean.jpg",
  },
  {
    id: "204",
    type: "VIP",
    status: "cleaning",
    floor: 2,
    price: "4,500,000đ",
    maxGuests: 4,
    photo: "room_vip_view.jpg",
  },
  {
    id: "301",
    type: "Villa",
    status: "vacant",
    floor: 3,
    price: "5,800,000đ",
    maxGuests: 6,
    photo: "room_villa_ocean.jpg",
  },
  {
    id: "302",
    type: "Villa",
    status: "occupied",
    floor: 3,
    price: "5,800,000đ",
    maxGuests: 6,
    photo: "room_villa_ocean.jpg",
  },
  {
    id: "303",
    type: "VIP",
    status: "maintenance",
    floor: 3,
    price: "4,500,000đ",
    maxGuests: 4,
    photo: "room_vip_view.jpg",
    issue: "Điều hòa chảy nước",
  },
  {
    id: "304",
    type: "Standard",
    status: "vacant",
    floor: 3,
    price: "1,800,000đ",
    maxGuests: 2,
    photo: "room_std_garden.jpg",
  },
];

export const adminInitialServices = [
  {
    id: "SRV-01",
    name: "Massage Trị Liệu Đá Núi Lửa",
    price: "1,200,000đ",
    type: "Spa",
    enabled: true,
  },
  {
    id: "SRV-02",
    name: "Tắm Ngâm Lá Thảo Dược Dao Đỏ",
    price: "800,000đ",
    type: "Spa",
    enabled: true,
  },
  {
    id: "SRV-03",
    name: "Súp sâm yến mạch thực dưỡng",
    price: "450,000đ",
    type: "Restaurant",
    enabled: true,
  },
  {
    id: "SRV-04",
    name: "Giặt khô hấp đầm lụa tơ tằm",
    price: "180,000đ",
    type: "Laundry",
    enabled: true,
  },
  {
    id: "SRV-05",
    name: "Xe đưa đón Sân Bay Đà Nẵng",
    price: "700,000đ",
    type: "Transport",
    enabled: true,
  },
  {
    id: "SRV-06",
    name: "Tour ngắm hoàng hôn Sơn Trà",
    price: "1,500,000đ",
    type: "Tour",
    enabled: true,
  },
];

export const adminInitialPayments = [
  {
    id: "TXN-001",
    date: "2026-05-25",
    bookingId: "BK-8902",
    amount: "4,500,000đ",
    servicesAmount: "1,200,000đ",
    total: "5,700,000đ",
    method: "Chuyển khoản VNPAY",
    status: "Paid",
  },
  {
    id: "TXN-002",
    date: "2026-05-25",
    bookingId: "BK-8903",
    amount: "3,200,000đ",
    servicesAmount: "450,000đ",
    total: "3,650,000đ",
    method: "Momo",
    status: "Paid",
  },
  {
    id: "TXN-003",
    date: "2026-05-24",
    bookingId: "BK-8906",
    amount: "6,400,000đ",
    servicesAmount: "320,000đ",
    total: "6,720,000đ",
    method: "Thẻ tín dụng",
    status: "Paid",
  },
  {
    id: "TXN-004",
    date: "2026-05-24",
    bookingId: "BK-8905",
    amount: "2,900,000đ",
    servicesAmount: "0đ",
    total: "2,900,000đ",
    method: "Tiền mặt",
    status: "Unpaid",
  },
];

export const adminInitialFeedbacks = [
  {
    id: 1,
    guest: "Trần Thị Mai",
    room: "101",
    rating: 5,
    comment:
      "Không gian tĩnh lặng, liệu trình ngâm chân lá thuốc Dao Đỏ giúp tôi ngủ rất ngon. Dịch vụ tuyệt vời!",
    reply: "Cảm ơn chị Mai đã dành thời gian gửi phản hồi tốt cho resort!",
    time: "2 giờ trước",
  },
  {
    id: 2,
    guest: "Lê Hoàng Nam",
    room: "201",
    rating: 5,
    comment: "Khu spa trị liệu rất đẳng cấp, chuyên viên chu đáo, nhiệt tình.",
    reply: "",
    time: "1 ngày trước",
  },
];

export const adminInitialComplaints = [
  {
    id: 101,
    room: "103",
    guest: "Khách ở phòng 103",
    content: "Vòi sen tắm chảy nước rất yếu, cần sửa chữa thiết bị.",
    status: "Open",
    time: "1 giờ trước",
    feedback: "",
  },
  {
    id: 102,
    room: "303",
    guest: "Lễ tân báo",
    content: "Phòng 303 điều hòa chảy nước lạnh nhỏ giọt trên sàn gỗ.",
    status: "Open",
    time: "4 giờ trước",
    feedback: "",
  },
];

export const adminInitialInventory = [
  {
    id: "INV-01",
    name: "Tinh dầu Sả Chanh (Lít)",
    category: "Spa trị liệu",
    stock: 12,
    minQty: 5,
    unit: "Lít",
    status: "Đầy đủ",
  },
  {
    id: "INV-02",
    name: "Lá thuốc tắm Dao Đỏ tươi (Kg)",
    category: "Spa trị liệu",
    stock: 45,
    minQty: 10,
    unit: "Kg",
    status: "Đầy đủ",
  },
  {
    id: "INV-03",
    name: "Bộ drap trải giường Luxury (Bộ)",
    category: "Buồng phòng",
    stock: 3,
    minQty: 15,
    unit: "Bộ",
    status: "Sắp hết",
  },
  {
    id: "INV-04",
    name: "Bột trà xanh Matcha Nhật (Kg)",
    category: "Nhà hàng thực dưỡng",
    stock: 0,
    minQty: 2,
    unit: "Kg",
    status: "Hết hàng",
  },
];

export const adminInitialShifts = [
  {
    empName: "Lê Thị Thu",
    day: "Thứ Hai",
    date: "25/05",
    shiftName: "Ca Sáng (06:00 - 14:00)",
    role: "Lễ tân chính",
    clockIn: "05:58",
    clockOut: "14:02",
    status: "Present",
  },
  {
    empName: "Nguyễn Văn Huy",
    day: "Thứ Hai",
    date: "25/05",
    shiftName: "Ca Chiều (14:00 - 22:00)",
    role: "Trưởng bộ phận Spa",
    clockIn: "13:50",
    clockOut: "22:05",
    status: "Present",
  },
  {
    empName: "Phạm Văn Long",
    day: "Thứ Hai",
    date: "25/05",
    shiftName: "Ca Đêm (22:00 - 06:00)",
    role: "Kỹ thuật viên",
    clockIn: "--",
    clockOut: "--",
    status: "Absent",
  },
];

export const adminInitialSwapRequests = [
  {
    id: 201,
    date: "2026-05-26",
    shiftType: "Ca Sáng (06:00 - 14:00)",
    applicant: "Lê Thị Thu",
    targetEmployee: "Nguyễn Văn Huy",
    reason: "Giải quyết việc gia đình đột xuất",
    status: "Pending",
  },
];

export const adminInitialWarnings = [
  {
    id: 1,
    text: "Phòng 303: Điều hòa chảy nước, cần kỹ thuật xử lý gấp.",
    type: "maintenance",
    time: "10 phút trước",
  },
  {
    id: 2,
    text: "Phòng 104: Đang dọn vệ sinh kéo dài quá 2 tiếng.",
    type: "cleaning",
    time: "45 phút trước",
  },
];

export const adminOccupancyChartData = [
  { day: "T2", val: 55, revenue: 32 },
  { day: "T3", val: 60, revenue: 38 },
  { day: "T4", val: 50, revenue: 30 },
  { day: "T5", val: 68, revenue: 45 },
  { day: "T6", val: 85, revenue: 65 },
  { day: "T7", val: 95, revenue: 88 },
  { day: "CN", val: 90, revenue: 80 },
];

// ------------------------------------------
// 2. STAFF DASHBOARD MOCK DATA
// ------------------------------------------

export const staffInitialRooms = [
  {
    id: "101",
    type: "Luxury Suite",
    status: "occupied",
    floor: 1,
    price: "4,500,000đ",
    guestName: "Trần Thị Mai",
  },
  {
    id: "102",
    type: "Forest Bungalow",
    status: "vacant",
    floor: 1,
    price: "3,200,000đ",
    guestName: "",
  },
  {
    id: "103",
    type: "Garden Villa",
    status: "maintenance",
    floor: 1,
    price: "5,800,000đ",
    guestName: "",
    issue: "Hỏng vòi sen nhà tắm",
  },
  {
    id: "104",
    type: "Luxury Suite",
    status: "cleaning",
    floor: 1,
    price: "4,500,000đ",
    guestName: "",
  },
  {
    id: "201",
    type: "Forest Bungalow",
    status: "occupied",
    floor: 2,
    price: "3,200,000đ",
    guestName: "Lê Hoàng Nam",
  },
  {
    id: "202",
    type: "Forest Bungalow",
    status: "occupied",
    floor: 2,
    price: "3,200,000đ",
    guestName: "Nguyễn Văn Hùng",
  },
  {
    id: "203",
    type: "Garden Villa",
    status: "vacant",
    floor: 2,
    price: "5,800,000đ",
    guestName: "",
  },
  {
    id: "204",
    type: "Luxury Suite",
    status: "cleaning",
    floor: 2,
    price: "4,500,000đ",
    guestName: "",
  },
  {
    id: "301",
    type: "Garden Villa",
    status: "vacant",
    floor: 3,
    price: "5,800,000đ",
    guestName: "",
  },
  {
    id: "302",
    type: "Garden Villa",
    status: "occupied",
    floor: 3,
    price: "5,800,000đ",
    guestName: "Vũ Đức Thành",
  },
  {
    id: "303",
    type: "Luxury Suite",
    status: "maintenance",
    floor: 3,
    price: "4,500,000đ",
    guestName: "",
    issue: "Điều hòa chảy nước",
  },
  {
    id: "304",
    type: "Forest Bungalow",
    status: "vacant",
    floor: 3,
    price: "3,200,000đ",
    guestName: "",
  },
];

export const staffInitialBookings = [
  {
    id: "BK-8902",
    guest: "Trần Thị Mai",
    phone: "0901234567",
    room: "101",
    checkIn: "2026-05-25",
    status: "Checked In",
    amount: "4,500,000đ",
    specialNotes: "Phòng hướng biển, Check-in muộn",
  },
  {
    id: "BK-8903",
    guest: "Lê Hoàng Nam",
    phone: "0987654321",
    room: "201",
    checkIn: "2026-05-25",
    status: "Checked In",
    amount: "3,200,000đ",
    specialNotes: "Yêu cầu thêm giường phụ (Extra bed)",
  },
  {
    id: "BK-8904",
    guest: "Phạm Minh Tuấn",
    phone: "0912345678",
    room: "Chưa gán",
    checkIn: "2026-05-26",
    status: "Confirmed",
    amount: "5,800,000đ",
    specialNotes: "Khách VIP, thích yên tĩnh",
  },
  {
    id: "BK-8905",
    guest: "Nguyễn Thanh Hương",
    phone: "0934567890",
    room: "203",
    checkIn: "2026-05-27",
    status: "Pending",
    amount: "2,900,000đ",
    specialNotes: "Cần xe đón tại sân bay lúc 14:00",
  },
  {
    id: "BK-8906",
    guest: "Vũ Đức Thành",
    phone: "0978901234",
    room: "302",
    checkIn: "2026-05-24",
    status: "Checked In",
    amount: "6,400,000đ",
    specialNotes: "Late check-out ngày 27/5",
  },
];

export const staffInitialServices = [
  {
    id: "SO-101",
    room: "101",
    category: "Spa booking",
    detail: "Massage Đá nóng thảo dược (90 phút)",
    price: "1,200,000đ",
    status: "In Progress",
    time: "14:30",
  },
  {
    id: "SO-102",
    room: "201",
    category: "Restaurant order",
    detail: "Súp sâm yến mạch thực dưỡng & trà sen",
    price: "450,000đ",
    status: "Pending",
    time: "17:45",
  },
  {
    id: "SO-103",
    room: "302",
    category: "Room service",
    detail: "Ăn tối tại phòng: Cơm lứt muối mè & Nước ép hữu cơ",
    price: "320,000đ",
    status: "Completed",
    time: "12:00",
  },
  {
    id: "SO-104",
    room: "101",
    category: "Laundry",
    detail: "Giặt khô đầm lụa tơ tằm",
    price: "180,000đ",
    status: "Pending",
    time: "09:15",
  },
  {
    id: "SO-105",
    room: "201",
    category: "Tour booking",
    detail: "Tour ngắm hoàng hôn bán đảo Sơn Trà",
    price: "1,500,000đ",
    status: "Completed",
    time: "Thứ Hai",
  },
];

export const staffInitialComplaints = [
  {
    id: 1,
    guest: "Nguyễn Văn Hùng",
    room: "202",
    content: "Wifi trong góc phòng hơi yếu, thỉnh thoảng mất kết nối.",
    status: "Open",
    time: "1 giờ trước",
    feedback: "",
  },
  {
    id: 2,
    guest: "Trần Thị Mai",
    room: "101",
    content: "Gối hơi cao, cần đổi 2 gối lông vũ mềm hơn.",
    status: "Resolved",
    time: "3 giờ trước",
    feedback: "Đã giao gối mới lúc 15:00",
  },
  {
    id: 3,
    guest: "Vũ Đức Thành",
    room: "302",
    content: "Có tiếng ồn nhỏ phát ra từ dàn lạnh điều hòa lúc đêm muộn.",
    status: "Open",
    time: "5 giờ trước",
    feedback: "",
  },
];

export const staffInitialPayments = [
  {
    id: "INV-8801",
    bookingId: "BK-8902",
    guest: "Trần Thị Mai",
    room: "101",
    amount: "4,500,000đ",
    servicesAmount: "1,200,000đ",
    total: "5,700,000đ",
    method: "Chuyển khoản VNPAY",
    status: "Paid",
  },
  {
    id: "INV-8802",
    bookingId: "BK-8903",
    guest: "Lê Hoàng Nam",
    room: "201",
    amount: "3,200,000đ",
    servicesAmount: "450,000đ",
    total: "3,650,000đ",
    method: "Tiền mặt",
    status: "Unpaid",
  },
  {
    id: "INV-8803",
    bookingId: "BK-8906",
    guest: "Vũ Đức Thành",
    room: "302",
    amount: "6,400,000đ",
    servicesAmount: "320,000đ",
    total: "6,720,000đ",
    method: "Thẻ tín dụng",
    status: "Paid",
  },
];

export const staffInitialShifts = [
  {
    day: "Thứ Hai",
    date: "25/05",
    shiftName: "Ca Sáng (06:00 - 14:00)",
    role: "Lễ tân chính",
    status: "Completed",
  },
  {
    day: "Thứ Ba",
    date: "26/05",
    shiftName: "Ca Sáng (06:00 - 14:00)",
    role: "Lễ tân chính",
    status: "Upcoming",
  },
  {
    day: "Thứ Tư",
    date: "27/05",
    shiftName: "Ca Chiều (14:00 - 22:00)",
    role: "Lễ tân chính",
    status: "Upcoming",
  },
  {
    day: "Thứ Năm",
    date: "28/05",
    shiftName: "Ca Chiều (14:00 - 22:00)",
    role: "Hỗ trợ đón tiếp",
    status: "Upcoming",
  },
  {
    day: "Thứ Sáu",
    date: "29/05",
    shiftName: "Nghỉ tuần",
    role: "-",
    status: "Day Off",
  },
  {
    day: "Thứ Bảy",
    date: "30/05",
    shiftName: "Ca Sáng (06:00 - 14:00)",
    role: "Lễ tân chính",
    status: "Upcoming",
  },
  {
    day: "Chủ Nhật",
    date: "31/05",
    shiftName: "Ca Sáng (06:00 - 14:00)",
    role: "Trực quầy VIP",
    status: "Upcoming",
  },
];

export const staffInitialChatMessages = [
  {
    sender: "Guest (Phòng 101)",
    text: "Cho mình xin thêm 2 chai nước suối nhé lễ tân.",
    time: "10:15",
  },
  {
    sender: "Lễ tân (Bạn)",
    text: "Dạ vâng ạ, bộ phận buồng phòng đang mang nước lên phòng 101 ngay lập tức ạ.",
    time: "10:17",
  },
  { sender: "Guest (Phòng 101)", text: "Cảm ơn bạn rất nhiều!", time: "10:18" },
];

// ------------------------------------------
// 3. CHEF DASHBOARD MOCK DATA
// ------------------------------------------

export const chefInitialAllergies = [
  {
    id: "ALG-001",
    guest: "Trần Thị Mai",
    room: "101",
    allergies: ["Hải sản", "Không ăn cay"],
    dietary: "Halal",
    checkIn: "2026-05-25",
  },
  {
    id: "ALG-002",
    guest: "Lê Hoàng Nam",
    room: "201",
    allergies: ["Đậu phộng"],
    dietary: "Gluten-Free",
    checkIn: "2026-05-25",
  },
  {
    id: "ALG-003",
    guest: "David Miller",
    room: "302",
    allergies: [],
    dietary: "Vegan",
    checkIn: "2026-05-24",
  },
  {
    id: "ALG-004",
    guest: "Phan Thanh Thủy",
    room: "104",
    allergies: ["Đậu phộng", "Hải sản"],
    dietary: "Vegetarian",
    checkIn: "2026-05-26",
  },
  {
    id: "ALG-005",
    guest: "Nguyễn Bích Liên",
    room: "202",
    allergies: ["Không gluten"],
    dietary: "Vegetarian",
    checkIn: "2026-05-25",
  },
];

export const chefInitialFeedbacks = [
  {
    id: 1,
    guest: "David Miller",
    room: "302",
    rating: 5,
    dish: "Súp sâm yến mạch thực dưỡng",
    comment: "Súp rất ngon, thanh đạm và tốt cho sức khỏe. Sẽ gọi lại!",
    time: "1 giờ trước",
    status: "Positive",
  },
  {
    id: 2,
    guest: "Trần Thị Mai",
    room: "101",
    rating: 3,
    dish: "Nấm nướng lá lốt",
    comment: "Món ăn hơi nhạt, nước chấm đi kèm chưa được đậm đà lắm.",
    time: "3 giờ trước",
    status: "Complaint",
  },
  {
    id: 3,
    guest: "Lê Hoàng Nam",
    room: "201",
    rating: 2,
    dish: "Chè hạt sen nhãn nhục",
    comment: "Tôi thấy hạt sen hơi cứng và ngọt gắt quá.",
    time: "1 ngày trước",
    status: "Complaint",
  },
];

export const chefInitialDishes = [
  {
    id: "DSH-01",
    name: "Cháo Yến Mạch Hạt Chia",
    price: "120,000đ",
    category: "Breakfast",
    description: "Cháo yến mạch nguyên cám nấu cùng hạt chia, hạt óc chó và dâu tây tươi.",
    ingredients: "Yến mạch, Hạt chia, Hạt óc chó, Dâu tây",
    allergens: [],
    isTodayMenu: true,
    period: "Breakfast",
    soldOut: false,
    enabled: true,
  },
  {
    id: "DSH-02",
    name: "Bún Gạo Lứt Chay",
    price: "150,000đ",
    category: "Breakfast",
    description: "Bún nưa ăn kèm đậu hũ non, nấm đùi gà và nước dùng ngọt thanh từ củ quả.",
    ingredients: "Bún gạo lứt, Đậu hũ non, Nấm đùi gà, Nước dùng rau củ",
    allergens: [],
    isTodayMenu: true,
    period: "Breakfast",
    soldOut: false,
    enabled: true,
  },
  {
    id: "DSH-03",
    name: "Bánh Mì Nguyên Cám Trứng Chần",
    price: "140,000đ",
    category: "Breakfast",
    description: "Bánh mì đen nguyên cám nướng giòn kèm bơ sáp và trứng chần.",
    ingredients: "Bánh mì nguyên cám, Bơ sáp, Trứng",
    allergens: [],
    isTodayMenu: true,
    period: "Breakfast",
    soldOut: false,
    enabled: true,
  },
  {
    id: "DSH-04",
    name: "Phở Gạo Lứt Bò Thảo Mộc",
    price: "250,000đ",
    category: "Breakfast",
    description: "Phở nấu từ gạo lứt nảy mầm, nước dùng hầm xương bò thảo mộc trong 12h.",
    ingredients: "Bánh phở gạo lứt, Thịt bò, Nước hầm xương, Thảo mộc",
    allergens: [],
    isTodayMenu: true,
    period: "Breakfast",
    soldOut: false,
    enabled: true,
  },
  {
    id: "DSH-05",
    name: "Nước Ép Green Detox",
    price: "95,000đ",
    category: "Drink",
    description: "Nước ép giải độc gan từ cần tây hữu cơ, táo xanh, cải xoăn và gừng.",
    ingredients: "Cần tây, Táo xanh, Cải xoăn, Gừng",
    allergens: [],
    isTodayMenu: true,
    period: "Breakfast",
    soldOut: false,
    enabled: true,
  },
  {
    id: "DSH-06",
    name: "Trà Thảo Mộc Hoa Cúc",
    price: "85,000đ",
    category: "Drink",
    description: "Trà hoa cúc ủ lạnh thanh nhiệt, giúp an thần và dễ tiêu hóa.",
    ingredients: "Hoa cúc, Cỏ ngọt",
    allergens: [],
    isTodayMenu: true,
    period: "Lunch",
    soldOut: false,
    enabled: true,
  },
  {
    id: "DSH-07",
    name: "Organic Avocado Quinoa Salad",
    price: "180,000đ",
    category: "Lunch",
    description: "Salad diêm mạch hữu cơ với bơ sáp cắt lát, hạt bí ngô và sốt chanh mật ong.",
    ingredients: "Diêm mạch, Bơ sáp, Hạt bí, Mật ong",
    allergens: [],
    isTodayMenu: true,
    period: "Lunch",
    soldOut: false,
    enabled: true,
  },
  {
    id: "DSH-08",
    name: "Mì Soba Lạnh Nhật Bản",
    price: "210,000đ",
    category: "Lunch",
    description: "Mì kiều mạch Nhật Bản thanh mát, ăn kèm rong biển và nước tương dashi nấm.",
    ingredients: "Mì Soba, Rong biển, Nước tương Dashi",
    allergens: [],
    isTodayMenu: true,
    period: "Lunch",
    soldOut: false,
    enabled: true,
  },
  {
    id: "DSH-09",
    name: "Cơm Gạo Lứt Ngũ Sắc",
    price: "160,000đ",
    category: "Lunch",
    description: "Cơm gạo lứt dẻo nấu cùng đậu gà, bắp, đậu hà lan và hạt sen.",
    ingredients: "Gạo lứt, Đậu gà, Bắp, Đậu hà lan, Hạt sen",
    allergens: [],
    isTodayMenu: true,
    period: "Lunch",
    soldOut: false,
    enabled: true,
  },
  {
    id: "DSH-10",
    name: "Cá Hồi Áp Chảo Măng Tây",
    price: "450,000đ",
    category: "Dinner",
    description: "Cá hồi Na Uy áp chảo sốt bơ chanh ăn kèm măng tây nướng.",
    ingredients: "Cá hồi, Măng tây, Bơ, Chanh",
    allergens: ["Hải sản"],
    isTodayMenu: true,
    period: "Dinner",
    soldOut: false,
    enabled: true,
  },
  {
    id: "DSH-11",
    name: "Ginseng Chicken Soup",
    price: "320,000đ",
    category: "Dinner",
    description: "Canh gà hầm sâm và táo đỏ bổ trung ích khí, hỗ trợ phục hồi sức khỏe.",
    ingredients: "Gà, Nhân sâm, Táo đỏ",
    allergens: [],
    isTodayMenu: true,
    period: "Dinner",
    soldOut: false,
    enabled: true,
  },
  {
    id: "DSH-12",
    name: "Súp Bí Đỏ Hạnh Nhân",
    price: "150,000đ",
    category: "Dinner",
    description: "Súp bí đỏ sánh mịn nấu cùng sữa hạnh nhân hữu cơ và dầu olive.",
    ingredients: "Bí đỏ, Sữa hạnh nhân, Dầu olive",
    allergens: ["Đậu phộng"],
    isTodayMenu: true,
    period: "Dinner",
    soldOut: false,
    enabled: true,
  },
  {
    id: "DSH-13",
    name: "Steak Bò Wagyu",
    price: "1,250,000đ",
    category: "Dinner",
    description: "Thăn nội bò Wagyu nướng than hoa mềm tan, ăn kèm rau củ nướng.",
    ingredients: "Thịt bò Wagyu, Rau củ, Tiêu đen",
    allergens: [],
    isTodayMenu: true,
    period: "Dinner",
    soldOut: false,
    enabled: true,
  },
  {
    id: "DSH-14",
    name: "Tôm Sú Rim Tỏi Ớt",
    price: "390,000đ",
    category: "Dinner",
    description: "Tôm sú biển tươi ngon rim tỏi ớt thơm lừng cay cay ngọt ngọt.",
    ingredients: "Tôm sú, Tỏi, Ớt",
    allergens: ["Hải sản", "Cay"],
    isTodayMenu: true,
    period: "Dinner",
    soldOut: false,
    enabled: true,
  }
];

export const chefInitialOrders = [
  {
    id: "ORD-5501",
    guestName: "Trần Thị Mai",
    room: "101",
    origin: "Room Service",
    items: [
      { name: "Tôm rim tỏi ớt (Món mặn)", qty: 1 },
      { name: "Súp sâm yến mạch thực dưỡng", qty: 1 },
    ],
    note: "Làm thật ít cay giúp tôi nhé!",
    status: "Pending",
    time: "10 phút trước",
  },
  {
    id: "ORD-5502",
    guestName: "David Miller",
    room: "302",
    origin: "Restaurant",
    items: [
      { name: "Salad bơ hạt diêm mạch", qty: 1 },
      { name: "Mì căn xào sả ớt thực dưỡng", qty: 1 },
    ],
    note: "Không lấy hành lá",
    status: "Cooking",
    time: "15 phút trước",
  },
  {
    id: "ORD-5503",
    guestName: "Lê Hoàng Nam",
    room: "201",
    origin: "Room Service",
    items: [{ name: "Nấm nướng lá lốt cốt dừa", qty: 1 }],
    note: "Mang kèm muỗng nĩa",
    status: "Delivering",
    time: "45 phút trước",
  },
  {
    id: "ORD-5504",
    guestName: "Phan Thanh Thủy",
    room: "104",
    origin: "Room Service",
    items: [
      { name: "Súp sâm yến mạch thực dưỡng", qty: 1 },
      { name: "Salad bơ hạt diêm mạch", qty: 1 },
    ],
    note: "",
    status: "Completed",
    time: "1 giờ trước",
  },
  {
    id: "ORD-5505",
    guestName: "Nguyễn Bích Liên",
    room: "202",
    origin: "Restaurant",
    items: [{ name: "Lẩu nấm Ngũ Sơn chay", qty: 1 }],
    note: "Bàn 7, không cần đồ tráng miệng",
    status: "Completed",
    time: "2 giờ trước",
  },
];

export const chefInitialIngredients = [
  {
    id: "ING-01",
    name: "Đậu hũ non organic (Khay)",
    category: "Đồ mát",
    stock: 15,
    minQty: 5,
    unit: "Khay",
    status: "Đầy đủ",
  },
  {
    id: "ING-02",
    name: "Nấm đùi gà tươi (Kg)",
    category: "Rau củ",
    stock: 8,
    minQty: 10,
    unit: "Kg",
    status: "Sắp hết",
  },
  {
    id: "ING-03",
    name: "Tôm sú biển tươi (Kg)",
    category: "Hải sản",
    stock: 12,
    minQty: 4,
    unit: "Kg",
    status: "Đầy đủ",
  },
  {
    id: "ING-04",
    name: "Nhân sâm Hàn Quốc tươi (Củ)",
    category: "Dược liệu",
    stock: 3,
    minQty: 5,
    unit: "Củ",
    status: "Sắp hết",
  },
  {
    id: "ING-05",
    name: "Bơ đậu phộng sấy (Hũ)",
    category: "Gia vị",
    stock: 0,
    minQty: 3,
    unit: "Hũ",
    status: "Hết hàng",
  },
  {
    id: "ING-06",
    name: "Gạo lứt đỏ nương (Kg)",
    category: "Khô",
    stock: 45,
    minQty: 15,
    unit: "Kg",
    status: "Đầy đủ",
  },
];

export const chefInitialRequests = [
  {
    id: "REQ-01",
    name: "Bơ đậu phộng sấy",
    qty: 10,
    unit: "Hũ",
    date: "2026-05-25",
    status: "Chờ duyệt",
  },
  {
    id: "REQ-02",
    name: "Nấm đùi gà tươi",
    qty: 15,
    unit: "Kg",
    date: "2026-05-26",
    status: "Chờ duyệt",
  },
];

// ------------------------------------------
// 4. SPECIALIST DASHBOARD MOCK DATA
// ------------------------------------------

export const specialistInitialSpaAppointments = [
  {
    id: "SPA-8801",
    guest: "Trần Thị Mai",
    room: "101",
    service: "Massage Trị Liệu Đá Núi Lửa",
    therapist: "Nguyễn Thu Thảo",
    time: "09:00 - 10:30",
    status: "Pending",
    note: "Khách thích lực vừa phải, tập trung vai gáy",
  },
  {
    id: "SPA-8802",
    guest: "David Miller",
    room: "302",
    service: "Tắm Ngâm Lá Thảo Dược Dao Đỏ",
    therapist: "Lê Văn Tùng",
    time: "11:00 - 12:00",
    status: "In Progress",
    note: "Không dùng tinh dầu sả, dùng tinh dầu oải hương",
  },
  {
    id: "SPA-8803",
    guest: "Phan Thanh Thủy",
    room: "104",
    service: "Massage Trị Liệu Đá Núi Lửa",
    therapist: "Nguyễn Thu Thảo",
    time: "14:00 - 15:30",
    status: "Completed",
    note: "Khách dị ứng nhẹ với phấn hoa",
  },
];

export const specialistInitialSpaRooms = [
  {
    name: "Phòng VIP Hoa Sen (Sen Room)",
    type: "VIP Trị liệu",
    status: "Occupied",
    currentGuest: "David Miller",
  },
  {
    name: "Phòng Thảo Dược Đôi (Twin Herbal Room)",
    type: "Ngâm tắm thảo dược",
    status: "Vacant",
    currentGuest: "",
  },
  {
    name: "Phòng Trị Liệu 1 (Therapy Room 1)",
    type: "Massage đá nóng",
    status: "Cleaning",
    currentGuest: "",
  },
  {
    name: "Phòng Trị Liệu 2 (Therapy Room 2)",
    type: "Massage bấm huyệt",
    status: "Vacant",
    currentGuest: "",
  },
];

export const specialistInitialSpaInventory = [
  {
    id: "SPI-01",
    name: "Tinh dầu Oải Hương (Lavender Oil)",
    stock: 5,
    unit: "Chai 500ml",
    minQty: 3,
    status: "Đầy đủ",
  },
  {
    id: "SPI-02",
    name: "Lá tắm thảo dược Dao Đỏ khô",
    stock: 12,
    unit: "Gói 1kg",
    minQty: 15,
    status: "Sắp hết",
  },
  {
    id: "SPI-03",
    name: "Đá nóng bazan trị liệu (Bộ)",
    stock: 8,
    unit: "Bộ 16 viên",
    minQty: 5,
    status: "Đầy đủ",
  },
  {
    id: "SPI-04",
    name: "Khăn trải giường thảo dược",
    stock: 2,
    unit: "Bộ drap",
    minQty: 10,
    status: "Sắp hết",
  },
];

export const specialistInitialYogaClasses = [
  {
    id: "YOG-101",
    name: "Lớp Thiền Định Phục Hồi (Meditation)",
    instructor: "Yogi Master Ananda",
    time: "06:00 - 07:15",
    location: "Sàn gỗ ngắm hoàng hôn sát biển",
    registeredCount: 8,
    registeredGuests: [
      "David Miller",
      "Trần Thị Mai",
      "Nguyễn Bích Liên",
      "Lê Hoàng Nam",
      "Phạm Minh Tuấn",
      "Vũ Đức Thành",
      "Trần Văn Tấn",
      "Lê Thị Thu",
    ],
  },
  {
    id: "YOG-102",
    name: "Hatha Yoga Cơ Bản",
    instructor: "Yogi Master Ananda",
    time: "08:30 - 09:45",
    location: "Sân cỏ hướng vườn thiền",
    registeredCount: 4,
    registeredGuests: [
      "Nguyễn Bích Liên",
      "Lê Hoàng Nam",
      "Phan Thanh Thủy",
      "Đỗ Quốc Khánh",
    ],
  },
  {
    id: "YOG-103",
    name: "Yoga Bay Trị Liệu Cột Sống (Aerial Yoga)",
    instructor: "Coach Thu Hằng",
    time: "16:30 - 17:45",
    location: "Phòng Yoga Vòm Kính",
    registeredCount: 3,
    registeredGuests: ["Trần Thị Mai", "Phan Thanh Thủy", "Lê Hoàng Nam"],
  },
];

export const specialistInitialYogaEquipment = [
  {
    name: "Thảm tập Yoga Cao Su Tự Nhiên",
    total: 30,
    clean: 25,
    laundry: 5,
    bad: 0,
  },
  {
    name: "Gạch xốp trợ thế Yoga (Blocks)",
    total: 40,
    clean: 40,
    laundry: 0,
    bad: 0,
  },
  {
    name: "Dây đai kéo giãn Yoga (Straps)",
    total: 20,
    clean: 18,
    laundry: 2,
    bad: 0,
  },
  {
    name: "Võng tập Yoga Bay (Hammocks)",
    total: 15,
    clean: 15,
    laundry: 0,
    bad: 0,
  },
];

export const specialistInitialAttendance = {
  "YOG-101": {
    "David Miller": true,
    "Trần Thị Mai": true,
    "Nguyễn Bích Liên": false,
    "Lê Hoàng Nam": true,
  },
  "YOG-102": {
    "Nguyễn Bích Liên": true,
    "Lê Hoàng Nam": false,
    "Phan Thanh Thủy": true,
  },
  "YOG-103": { "Trần Thị Mai": false, "Phan Thanh Thủy": false },
};

export const specialistInitialPhysioAppointments = [
  {
    id: "PHY-001",
    guest: "Lê Hoàng Nam",
    room: "201",
    diagnosis: "Đau cột sống thắt lưng cấp L4-L5",
    service: "Kéo giãn cột sống máy + Siêu âm",
    therapist: "Dr. Nguyễn Quốc Hải",
    time: "08:30 - 09:30",
    status: "Pending",
  },
  {
    id: "PHY-002",
    guest: "Phạm Minh Tuấn",
    room: "102",
    diagnosis: "Hội chứng thoái hóa khớp gối giai đoạn 2",
    service: "Laser trị liệu + Sóng ngắn",
    therapist: "Dr. Nguyễn Quốc Hải",
    time: "10:00 - 11:00",
    status: "In Progress",
  },
  {
    id: "PHY-003",
    guest: "Vũ Đức Thành",
    room: "302",
    diagnosis: "Cứng khớp vai sau chấn thương thể thao",
    service: "Vận động trị liệu khớp vai",
    therapist: "Therapist Minh Đức",
    time: "15:00 - 16:00",
    status: "Completed",
  },
];

export const specialistInitialPatientRecords = [
  {
    guest: "Lê Hoàng Nam",
    room: "201",
    history: [
      {
        date: "2026-05-23",
        symptoms: "Đau thắt lưng lan mông trái, VAS 7/10",
        therapy: "Chườm nóng + Điện xung + Kéo dãn lực 20kg",
        progress: "Sau kéo dãn giảm đau nhẹ, VAS còn 6/10",
      },
      {
        date: "2026-05-24",
        symptoms: "Đau âm ỉ thắt lưng, co thắt cơ dựng sống hai bên",
        therapy: "Siêu âm trị liệu tần số 1MHz + Kéo dãn lực 22kg",
        progress: "Cơ lưng mềm hơn, cúi người đỡ buốt, VAS 5/10",
      },
    ],
    recommendations:
      "Tránh ngồi quá 45 phút, không bê vác vật nặng. Tập bài tập phục hồi cơ lõi Core Exercise ngày 2 lần.",
  },
  {
    guest: "Phạm Minh Tuấn",
    room: "102",
    history: [
      {
        date: "2026-05-24",
        symptoms: "Đau mặt trước khớp gối phải khi leo cầu thang, sưng nề nhẹ",
        therapy: "Laser cường độ cao khớp gối + Chườm lạnh",
        progress: "Đỡ sưng khớp, cảm giác căng tức đầu gối giảm",
      },
    ],
    recommendations:
      "Hạn chế đi cầu thang bộ. Đeo băng thun hỗ trợ khớp gối khi đi bộ.",
  },
];

export const specialistInitialPhysioEquipment = [
  {
    name: "Máy Kéo Giãn Cột Sống Tự Động",
    code: "EQ-PHY-01",
    status: "Available",
    usageHours: 120,
  },
  {
    name: "Thiết Bị Laser Trị Liệu Cường Độ Cao",
    code: "EQ-PHY-02",
    status: "Available",
    usageHours: 85,
  },
  {
    name: "Máy Siêu Âm Trị Liệu Đa Tần",
    code: "EQ-PHY-03",
    status: "Under Maintenance",
    usageHours: 240,
  },
  {
    name: "Hệ Thống Thử Sức Cơ Vận Động",
    code: "EQ-PHY-04",
    status: "Occupied",
    usageHours: 110,
  },
];

// ------------------------------------------
// 5. LANDING & STATIC CONTENT MOCK DATA
// ------------------------------------------

// Rooms.jsx
export const mainRoomsList = [
  {
    title: "Bungalow Gỗ Hướng Suối",
    description:
      "Nằm ẩn mình dưới tán cây cổ thụ bên khe suối nhỏ. Thiết kế mở với vách kính lớn đón sương mai, hiên trà bằng tre mộc mạc và bồn tắm gỗ Hinoki thơm ngát ngoài trời.",
    size: "65 m²",
    capacity: "2 Người lớn",
    amenity: "Ban công suối",
    price: "3.200.000đ",
    image: "/room_luxury.png",
  },
  {
    title: "Biệt Thự Đồi Trà Thiền Định",
    description:
      "Tọa lạc trên đỉnh đồi lộng gió với tầm nhìn 360 độ ra thung lũng Ngũ Sơn xanh biếc. Tích hợp phòng tập yoga riêng biệt và hồ bơi khoáng nóng mini tràn viền.",
    size: "120 m²",
    capacity: "4 Người lớn",
    amenity: "Bể bơi riêng",
    price: "5.800.000đ",
    image: "/hero_bg.png",
  },
];

// RoomsPage.jsx
export const roomsPageAllRooms = [
  {
    title: "Bungalow Gỗ Hướng Suối",
    category: "Phòng Đôi/Bungalow",
    description:
      "Nằm ẩn mình dưới tán cây cổ thụ bên khe suối nhỏ. Thiết kế mở với vách kính lớn đón sương mai, hiên trà bằng tre mộc mạc và bồn tắm gỗ Hinoki thơm ngát ngoài trời.",
    size: "65 m²",
    capacity: "2 Người lớn",
    amenity: "Ban công suối",
    image: "/room_luxury.png",
  },
  {
    title: "Bungalow Đá Cuội Bên Rừng",
    category: "Phòng Đôi/Bungalow",
    description:
      "Thiết kế vách đá cuội tự nhiên mộc mạc và sang trọng, nép mình bên sườn đồi thông thơ mộng. Sở hữu bồn tắm đá lộ thiên riêng tư và mái kính ngắm sao đêm tuyệt đẹp.",
    size: "75 m²",
    capacity: "2 Người lớn",
    amenity: "Mái kính ngắm sao",
    image: "/room_luxury.png",
  },
  {
    title: "Biệt Thự Đồi Trà Thiền Định",
    category: "Phòng Gia Đình/Villa",
    description:
      "Tọa lạc trên đỉnh đồi lộng gió với tầm nhìn 360 độ ra thung lũng Ngũ Sơn xanh biếc. Tích hợp phòng tập yoga riêng biệt và hồ bơi khoáng nóng mini tràn viền.",
    size: "120 m²",
    capacity: "4 Người lớn",
    amenity: "Bể bơi riêng",
    image: "/hero_bg.png",
  },
  {
    title: "Biệt Thự Gia Đình Sen Trắng",
    category: "Phòng Gia Đình/Villa",
    description:
      "Nằm biệt lập bên đồi thông yên tĩnh với vườn hoa sen bao quanh. Thiết kế 3 phòng ngủ tiện nghi, phòng khách và bếp nấu ăn đầy đủ dụng cụ, mang lại cảm giác ấm cúng như chính ngôi nhà của bạn.",
    size: "180 m²",
    capacity: "6 - 8 Người lớn",
    amenity: "Sân vườn & Bếp riêng",
    image: "/hero_bg.png",
  },
  {
    title: "Nhà Sàn Cộng Đồng Đông Sơn",
    category: "Phòng Cộng Đồng/Tập Thể",
    description:
      "Công trình kiến trúc nhà sàn gỗ truyền thống quy mô lớn, thiết kế mở đón gió mát núi rừng. Trang bị đệm nằm futon organic cao cấp, không gian sinh hoạt chung rộng rãi phù hợp cho các hoạt động bonding, làm việc nhóm hoặc lửa trại ngoài trời của các công ty.",
    size: "250 m²",
    capacity: "15 - 25 Khách",
    amenity: "Phù hợp Teambuilding",
    image: "/room_community.png",
  },
  {
    title: "Biệt Thự Tập Thể Bamboo Retreat",
    category: "Phòng Cộng Đồng/Tập Thể",
    description:
      "Thiết kế thuần tre cao cấp bên hồ tự nhiên. Với 2 tầng lầu rộng rãi, tích hợp sảnh sinh hoạt chung lớn, máy chiếu thuyết trình, và sân hiên mở đón gió. Rất thích hợp cho các phòng ban công ty tổ chức workshop kết hợp nghỉ dưỡng.",
    size: "320 m²",
    capacity: "20 - 30 Khách",
    amenity: "Sảnh workshop & View hồ",
    image: "/room_community.png",
  },
  {
    title: "Bungalow Tập Thể Rừng Thông",
    category: "Phòng Cộng Đồng/Tập Thể",
    description:
      "Bungalow tập thể hiện đại bằng gỗ thông mộc mạc, bố trí hệ thống giường tầng tối giản thông minh. Rất thích hợp cho nhóm bạn thân hoặc các phòng ban công ty quy mô nhỏ muốn trải nghiệm nghỉ dưỡng tập thể ấm cúng.",
    size: "110 m²",
    capacity: "8 - 12 Khách",
    amenity: "Giường tầng thông minh",
    image: "/room_luxury.png",
  },
  {
    title: "Khu Glamping Dome Tập Thể",
    category: "Phòng Cộng Đồng/Tập Thể",
    description:
      "Cụm 3 lều mái vòm geodesic cao cấp thông nhau, nằm xung quanh một khu vực sinh hoạt lửa trại trung tâm riêng tư. Đầy đủ máy lạnh, nệm êm ái và nhà vệ sinh sinh thái biệt lập. Trải nghiệm cắm trại tập thể đẳng cấp cho nhóm teambuilding.",
    size: "150 m²",
    capacity: "10 - 16 Khách",
    amenity: "Khu lửa trại riêng",
    image: "/hero_bg.png",
  },
];

export const roomsPageCategories = [
  "Tất cả",
  "Phòng Đôi/Bungalow",
  "Phòng Gia Đình/Villa",
  "Phòng Cộng Đồng/Tập Thể",
];

// Yoga.jsx
export const yogaPrograms = [
  {
    title: "Yoga Hatha Đón Bình Minh",
    description:
      "Bài tập khởi động toàn diện vào lúc 5:30 sáng trên sàn gỗ thông mở hướng ra thung lũng. Giúp kéo giãn cơ xương khớp, thúc đẩy tuần hoàn máu và đánh thức cơ thể một cách nhẹ nhàng nhất đón ngày mới.",
    level: "Mọi cấp độ (Cơ bản đến Trung cấp)",
    duration: "60 Phút",
    coach: "Master Kim Nguyễn (15 năm kinh nghiệm)",
  },
  {
    title: "Thiền Thở & Tĩnh Tâm Sâu",
    description:
      "Các bài thực hành kiểm soát hơi thở Pranayama kết hợp thiền âm thanh chuông xoay Tây Tạng. Hỗ trợ xoa dịu lo âu, cải thiện chứng mất ngủ và giảm căng thẳng hệ thần kinh trung ương nhanh chóng.",
    level: "Mọi cấp độ",
    duration: "45 Phút",
    coach: "Thiền sư Minh Đạo",
  },
  {
    title: "Chánh Niệm Đi Bộ (Forest Forest Walk)",
    description:
      "Liệu trình thiền hành đi chân trần trên thảm cỏ xuyên qua rừng thông nguyên sinh. Học cách giữ nhịp thở đồng bộ với bước chân, cảm nhận trọn vẹn xúc giác với đất mẹ giúp sạc lại năng lượng sinh học tự nhiên.",
    level: "Mọi cấp độ",
    duration: "90 Phút",
    coach: "Hướng dẫn viên Dân Tộc Địa Phương",
  },
];

// Spa.jsx
export const spaTherapies = [
  {
    name: "Massage Trị Liệu Đá Núi Lửa",
    description:
      "Sử dụng những viên đá bazan tự nhiên được hấp nóng trong tinh dầu thảo dược để massage sâu vào mô cơ. Phục hồi hoàn toàn cơ bắp bị căng cứng, kích thích tuần hoàn máu và đem lại giấc ngủ sâu.",
    duration: "90 Phút / 120 Phút",
    benefits: [
      "Giảm căng thẳng cơ bắp sâu",
      "Cải thiện tuần hoàn máu",
      "Đào thải độc tố tích tụ",
      "Hỗ trợ ngủ sâu ngon giấc",
    ],
    image: "/service_spa.png",
  },
  {
    name: "Tắm Ngâm Lá Thảo Dược Dao Đỏ",
    description:
      "Bản sắc chăm sóc sức khỏe độc đáo sử dụng hơn 30 loại lá thuốc tươi hái trực tiếp từ độ cao 1.500m. Nước ngâm nóng thảo dược giúp thư giãn mạch máu, giảm đau mỏi xương khớp và nuôi dưỡng làn da căng mượt.",
    duration: "45 Phút / 60 Phút",
    benefits: [
      "Làm ấm sâu cơ thể",
      "Hỗ trợ giảm đau khớp",
      "Làm mịn và sáng da tự nhiên",
      "Xua tan mỏi mệt tức thì",
    ],
    image: "/room_luxury.png",
  },
  {
    name: "Liệu Trình Trẻ Hóa Da Tự Nhiên",
    description:
      "Chăm sóc da mặt chuyên sâu kết hợp thảo mộc organic tươi (nghệ tây, mật ong rừng Ngũ Sơn, cám gạo sữa) và phương pháp massage bấm huyệt Kobi-Do giúp lưu thông bạch huyết, săn chắc cơ mặt.",
    duration: "75 Phút",
    benefits: [
      "Trẻ hóa cơ mặt tự nhiên",
      "Cấp ẩm sâu từ thiên nhiên",
      "Làm sáng tông da xỉn màu",
      "Massage đầu cổ vai gáy thư giãn",
    ],
    image: "/service_dining.png",
  },
];

// Therapy.jsx
export const therapyTreatments = [
  {
    name: "Liệu Pháp Nắn Chỉnh Cột Sống & Đĩa Đệm",
    description:
      "Áp dụng các kỹ thuật nắn chỉnh cơ xương cột sống kết hợp kéo giãn cơ học tự động. Giúp làm giảm chèn ép rễ thần kinh, tăng khe khớp, rất hiệu quả cho bệnh nhân đau thần kinh tọa, thoát vị đĩa đệm nhẹ hoặc đau mỏi thắt lưng cấp tính.",
    suitability:
      "Người ngồi nhiều, người bị thoát vị đĩa đệm nhẹ, đau mỏi thắt lưng mãn tính.",
    benefits: [
      "Giải phóng chèn ép rễ thần kinh",
      "Kéo giãn cột sống an toàn, êm ái",
      "Tăng tuần hoàn dinh dưỡng cho đĩa đệm",
    ],
  },
  {
    name: "Giải Cơ Chuyên Sâu Bằng Nhiệt Thảo Dược",
    description:
      "Kết hợp xoa bóp trị liệu Đông y và đắp thuốc thảo dược nóng lên các vùng cơ bị co thắt, xơ cứng. Nhiệt lượng từ thảo dược thẩm thấu sâu qua da giúp đánh tan các điểm đau xơ cứng cơ vai gáy, bả vai.",
    suitability:
      "Người bị co thắt cơ vai gáy do stress, vận động viên bị căng cơ.",
    benefits: [
      "Đánh tan xơ cứng cơ vai gáy",
      "Tăng lưu lượng tuần hoàn cơ khớp",
      "Hiệu quả thư giãn sâu ngay lập tức",
    ],
  },
];

// Restaurant.jsx
export const restaurantMenus = [
  {
    category: "Món Khai Vị Thanh Lọc",
    items: [
      {
        name: "Súp Sen Bách Hợp Chùm Ngây",
        desc: "Hạt sen quê tươi ninh nhừ cùng bách hợp và lá chùm ngây bổ dưỡng giúp an thần, ngủ ngon.",
        price: "95.000đ",
      },
      {
        name: "Gỏi Ngũ Sắc Rong Nho Organic",
        desc: "Rong nho biển tươi giòn phối trộn rau củ hữu cơ rưới sốt chanh leo chua ngọt dịu.",
        price: "120.000đ",
      },
    ],
  },
  {
    category: "Món Chính Bồi Bổ",
    items: [
      {
        name: "Cơm Gạo Lứt Hoàng Bào Hạt Sen",
        desc: "Cơm gạo lứt đỏ Điện Biên dẻo bùi hấp trong lá sen tươi cùng hạt sen, nấm hương rừng.",
        price: "165.000đ",
      },
      {
        name: "Lẩu Nấm Nấm Quý Ngũ Sơn",
        desc: "Nước dùng rau củ ninh 12 giờ ngọt thanh cùng các loại nấm tươi hữu cơ quý hiếm.",
        price: "380.000đ",
      },
    ],
  },
  {
    category: "Nước Uống & Trà Thiền",
    items: [
      {
        name: "Trà Sâm Sen Mật Ong Rừng",
        desc: "Trà sâm Ngũ Sơn hảo hạng hòa quyện mật ong rừng thiên nhiên giải độc, bồi bổ sinh khí.",
        price: "65.000đ",
      },
      {
        name: "Nước Cỏ Ngọt Nha Đam Ép Lạnh",
        desc: "Nha đam tươi xay nhuyễn cùng lá cỏ ngọt thanh nhiệt cơ thể không chứa đường tinh luyện.",
        price: "50.000đ",
      },
    ],
  },
];

// Promotions.jsx
export const promotionsPromos = [
  {
    title: "Gói Trị Liệu Cột Sống Chuyên Sâu 3N2Đ",
    description:
      "Liệu trình toàn diện gồm 3 ngày 2 đêm phòng nghỉ hướng suối, bác sĩ CKI Hải khám phác đồ riêng biệt, 02 buổi kéo giãn vật lý trị liệu cột sống, 02 buổi bấm huyệt giải cơ và miễn phí các buổi tập yoga thiền định đón bình minh.",
    period: "Áp dụng đến 31-08-2026",
    discount: "Ưu đãi trọn gói đặc biệt",
    code: "SPINERECOVERY",
  },
  {
    title: "Combo Cuối Tuần Zen Retreat 2N1Đ",
    description:
      "Trọn gói nghỉ dưỡng cuối tuần nạp năng lượng gồm 1 đêm phòng nghỉ, 2 bữa ăn thực dưỡng cân bằng ngũ vị tại nhà hàng, 1 suất massage đá nóng thảo dược 90 phút tại spa trị liệu.",
    period: "Áp dụng Thứ 6 - Chủ Nhật hàng tuần",
    discount: "Tiết kiệm 15% so với mua lẻ",
    code: "WEEKENDZEN",
  },
  {
    title: "Ưu Đãi Đặc Quyền Gia Đình Chữa Lành",
    description:
      "Khi đặt từ 2 đêm Bungalow liên tiếp cho gia đình: Tặng kèm lớp học nấu món chay thực dưỡng cùng Chef Lê Vy, tặng liệu trình tắm ngâm lá Dao Đỏ cho bố mẹ và 1 suất workshop vẽ tranh cho bé.",
    period: "Áp dụng cho gia đình từ 3 người",
    discount: "Miễn phí các hoạt động gia đình",
    code: "FAMILYLOVE",
  },
];

// Events.jsx
export const eventsVenues = [
  {
    name: "Đại Sảnh Hội Nghị Ngũ Sơn",
    description:
      "Không gian khán phòng lớn xây dựng từ gỗ tuyết tùng sang trọng với các vách kính lớn view rừng thông mát mẻ. Hệ thống màn hình LED, âm thanh, ánh sáng tiêu chuẩn cao cấp, phù hợp cho các buổi hội nghị quốc tế, lễ ký kết hoặc Gala Dinner.",
    capacity: "Từ 80 đến 180 khách",
    area: "250 m²",
    highlights: [
      "Màn hình LED P2.5 siêu nét",
      "Bục phát biểu gỗ tuyết tùng",
      "Hệ thống âm thanh hội thảo chuyên nghiệp",
      "Thiết lập bàn theo yêu cầu (Classroom, Theater...)",
    ],
  },
  {
    name: "Nhà Tre Sinh Thái (Bamboo Pavilion)",
    description:
      "Lấy cảm hứng từ những đóa sen nở rộ, công trình kiến trúc bằng tre độc đáo này mang lại không gian thảo luận mở tràn ngập ánh sáng tự nhiên. Rất thích hợp cho các buổi workshop sáng tạo, khóa tu tập, hoặc họp chiến lược nội bộ của doanh nghiệp.",
    capacity: "Từ 20 đến 60 khách",
    area: "120 m²",
    highlights: [
      "Thiết kế tre nứa thoáng đạt tự nhiên",
      "Không gian mở đón gió mát",
      "Trang bị sẵn thảm thiền và bồ đoàn",
      "Tầm nhìn bao quát thung lũng xanh",
    ],
  },
];

// Blog.jsx
export const blogPostsList = [
  {
    title: "5 Bài Tập Yoga Đơn Giản Giúp Giảm Đau Cột Sống Cho Dân Văn Phòng",
    excerpt:
      "Đau mỏi vai gáy và cột sống là căn bệnh kinh niên của dân văn phòng. Hãy cùng Ngũ Sơn tìm hiểu 5 tư thế yoga nhẹ nhàng dễ thực hành ngay tại bàn làm việc.",
    author: "Master Kim Nguyễn",
    date: "20-05-2026",
    category: "Yoga & Thiền",
    image: "/service_yoga.png",
  },
  {
    title: "Ẩm Thực Thực Dưỡng: Ăn Thế Nào Để Cân Bằng Thân - Tâm?",
    excerpt:
      "Quy tắc ăn uống thực dưỡng không chỉ giúp thải độc mà còn cân bằng năng lượng âm dương trong cơ thể. Khám phá các nguyên liệu tự nhiên đem lại năng lượng xanh.",
    author: "Chef Lê Vy",
    date: "15-05-2026",
    category: "Ẩm Thực",
    image: "/service_dining.png",
  },
  {
    title: "Liệu Pháp Xông Hơi Thuốc Nam: Thải Độc Và Tái Tạo Làn Da Khỏe Mạnh",
    excerpt:
      "Xông hơi bằng các loại lá thuốc nam quý hiếm thu hái tại vườn thảo dược Ngũ Sơn giúp thông thoáng lỗ chân lông, giải cảm và mang lại tinh thần sảng khoái.",
    author: "Dược sĩ Thu Trang",
    date: "10-05-2026",
    category: "Spa Trị Liệu",
    image: "/service_spa.png",
  },
  {
    title:
      "Vật Lý Trị Liệu Cho Người Thoát Vị Đĩa Đệm: Những Sai Lầm Cần Tránh",
    excerpt:
      "Kéo giãn cột sống và nắn chỉnh cơ học cần được thực hiện đúng cách dưới sự giám sát chuyên môn. Tìm hiểu những sai lầm phổ biến khi tự tập luyện phục hồi.",
    author: "Bác sĩ Minh Hải",
    date: "05-05-2026",
    category: "Vật Lý Trị Liệu",
    image: "/service_therapy.png",
  },
];

export const blogCategoriesList = [
  "Tất cả",
  "Yoga & Thiền",
  "Ẩm Thực",
  "Spa Trị Liệu",
  "Vật Lý Trị Liệu",
  "Lối sống xanh",
];
