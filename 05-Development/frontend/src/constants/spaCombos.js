export const WELLNESS_COMBOS = [
  {
    id: "combo-bliss",
    name: "Combo Thân Tâm An Lạc",
    description: "Hành trình kết hợp giữa Yoga thư giãn nhẹ nhàng, xông hơi đào thải độc tố và massage tinh dầu sen trắng dưỡng ẩm sâu giúp tái tạo hoàn toàn tâm trí.",
    services: [8, 7, 4], // Lớp học Hatha Yoga cá nhân hóa 1-1, Xông hơi thảo dược, Massage toàn thân sen trắng
    badge: "Thư giãn & Tái tạo",
    price: 1700000,
    servicePrices: {
      8: 500000, // Yoga: 500.000đ
      7: 400000, // Xông hơi: 400.000đ
      4: 800000  // Massage: 800.000đ
    }
  },
  {
    id: "combo-spine",
    name: "Combo Phục Hồi Cột Sống",
    description: "Liệu trình chuyên sâu dành cho người đau mỏi cổ vai gáy và cột sống thắt lưng. Kết hợp tập phục hồi Yoga, bấm huyệt đả thông kinh mạch và nắn chỉnh xương khớp.",
    services: [12, 13, 3], // Lớp học Restorative Yoga, Ấn huyệt vai gáy, Nắn chỉnh Chiropractic
    badge: "Trị liệu chuyên sâu",
    price: 3250000,
    servicePrices: {
      12: 550000,  // Restorative Yoga: 550.000đ
      13: 1200000, // Ấn huyệt vai gáy: 1.200.000đ
      3: 1500000   // Chiropractic: 1.500.000đ
    }
  },
  {
    id: "combo-detox",
    name: "Combo Thải Độc Hoàng Gia",
    description: "Quy trình thanh lọc hệ tuần hoàn toàn diện. Bắt đầu với Yoga thở kiểm soát năng lượng, ngâm tắm thảo dược thuốc Dao Đỏ truyền thống và kết thúc bằng massage đá muối Himalaya ấm nóng.",
    services: [10, 2, 1], // Tập thở Pranayama, Tắm lá thuốc Dao Đỏ, Massage đá muối Himalaya
    badge: "Thải độc cơ thể",
    price: 2150000,
    servicePrices: {
      10: 350000,  // Pranayama: 350.000đ
      2: 600000,   // Tắm thuốc Dao Đỏ: 600.000đ
      1: 1200000   // Massage đá muối: 1.200.000đ
    }
  }
];
