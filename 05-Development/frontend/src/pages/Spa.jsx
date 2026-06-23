import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Heart, Sparkles, Clock, Loader2, AlertCircle,
  Search, DollarSign, ArrowRight, Leaf, Flame,
  Smile, Activity, X, CheckCircle, Users, Star,
  Minus, Plus, ChevronUp
} from "lucide-react";
import { masterDataApi, spaApi, userApi, medicalApi, bookingLookupApi } from "../api";
import resortSpaHeroBg from "../assets/resort_spa_hero_bg.png";

// ─── Bộ lọc danh mục ────────────────────────────────────────────────────────
const categoryFilters = [
  { label: "Tất cả các gói", value: "", icon: Sparkles },
  { label: "Gói Spa đặc trưng",  value: "SPA",         icon: Flame    },
  { label: "Gói Yoga phục hồi", value: "YOGA",      icon: Heart     },
  { label: "Gói Trị liệu chuyên sâu",  value: "THERAPY",   icon: Activity },
];

// ─── Nhãn tiếng Việt cho healthGoal ─────────────────────────────────────────
const healthGoalLabel = {
  SPA:         "Gói Spa & Thư giãn",
  YOGA:        "Gói Yoga phục hồi",
  THERAPY:     "Gói Trị liệu chuyên môn",
};

// ─── Wellness Combos cấu hình sẵn ───────────────────────────────────────────
const WELLNESS_COMBOS = [
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

// ─── Helper: phút → "X giờ Y phút" ──────────────────────────────────────────
function formatDuration(minutes) {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h} giờ ${m} phút`;
}

// ─── Helper: định dạng giá VND ───────────────────────────────────────────────
function formatPrice(price) {
  if (!price) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
    .format(price)
    .replace("₫", "đ");
}

// ─── Helper: định dạng ngày giờ ───────────────────────────────────────────────
function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (err) {
    return dateStr;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Component hiệu ứng cuộn rơi từ trên xuống
// ═══════════════════════════════════════════════════════════════════════════════
function ScrollReveal({ children, delay = 0, className = "" }) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    let observer;
    const timer = setTimeout(() => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            if (ref.current && observer) observer.unobserve(ref.current);
          }
        },
        {
          threshold: 0.1, // kích hoạt sớm khi 10% phần tử xuất hiện
        }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }
    }, 150); // Đợi layout ổn định để tránh tự động kích hoạt trên các thiết bị nhanh hoặc chậm

    return () => {
      clearTimeout(timer);
      if (observer && ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "both",
      }}
      className={`${className} ${isIntersecting ? "animate-slide-down" : "opacity-0"}`}
    >
      {children}
    </div>
  );
}

const STATIC_PACKAGES = [
  {
    packageId: 4,
    name: "Gói Thư Giãn Hoàng Gia (Royal Spa Retreat)",
    description: "Liệu trình thư giãn hoàng gia kết hợp massage tinh dầu hữu cơ thơm mát và liệu pháp đá muối nóng Himalaya giúp giải tỏa hoàn toàn mọi căng thẳng và phục hồi sinh khí.",
    price: 2000000,
    durationDays: 2,
    includes: "Massage đá muối nóng Himalaya (90 phút);Xông hơi thảo dược hoàng cung;Ngâm chân thảo dược & trà dưỡng nhan",
    healthGoal: "SPA",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
  },
  {
    packageId: 1,
    name: "Gói Thanh Lọc & Giải Độc Cơ Thể (Premium Detox)",
    description: "Hành trình thanh lọc cơ thể toàn diện 5 ngày 4 đêm. Thải độc tố, tái tạo tế bào qua chế độ thực dưỡng lành mạnh kết hợp thủy liệu pháp đại tràng.",
    price: 5200000,
    durationDays: 5,
    includes: "Thực đơn nước ép & chay thực dưỡng;Thủy liệu pháp đại tràng thanh lọc;Tắm khoáng nóng & xông hơi đá muối",
    healthGoal: "SPA",
    imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80"
  },
  {
    packageId: 6,
    name: "Gói Hương Trầm Trị Liệu & Trẻ Hóa",
    description: "Trải nghiệm sang trọng kết hợp hương trầm tự nhiên Ngũ Sơn và tinh dầu thông đỏ quý hiếm, kích thích tuần hoàn và mang đến làn da tươi trẻ rạng ngời.",
    price: 2400000,
    durationDays: 2,
    includes: "Massage hương trầm tự nhiên (75 phút);Chăm sóc da mặt thảo dược chuyên sâu;Trị liệu massage đầu kiểu Nhật",
    healthGoal: "SPA",
    imageUrl: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80"
  },
  {
    packageId: 7,
    name: "Gói Sen Vàng Tịnh Tâm (Golden Lotus)",
    description: "Liệu trình chăm sóc sức khỏe lấy cảm hứng từ hoa sen Việt Nam, kết hợp bùn khoáng thiên nhiên giúp dưỡng ẩm sâu và đem lại giấc ngủ ngon lành.",
    price: 1800000,
    durationDays: 1,
    includes: "Massage toàn thân tinh dầu sen trắng (60 phút);Đắp mặt nạ hạt sen tươi;Tắm bùn khoáng thiên nhiên",
    healthGoal: "SPA",
    imageUrl: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&w=800&q=80"
  },
  {
    packageId: 8,
    name: "Gói Suối Khoáng Nóng Trị Liệu (Onsen Healing)",
    description: "Liệu trình ngâm tắm suối khoáng nóng kết hợp xông hơi đá muối hồng ngoại Himalaya và massage Shiatsu bấm huyệt Nhật Bản giúp kích thích lưu thông khí huyết và thư giãn sâu cơ khớp.",
    price: 1600000,
    durationDays: 1,
    includes: "Tắm khoáng nóng Onsen thảo dược;Xông hơi đá muối Himalaya;Massage Shiatsu bấm huyệt Nhật Bản (60 phút)",
    healthGoal: "SPA",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
  },
  {
    packageId: 9,
    name: "Gói Thảo Mộc Bản Địa (Sensory Herb Journey)",
    description: "Liệu trình chăm sóc cơ thể đa giác quan sử dụng thảo dược bản địa tươi mát thu hoạch tại vườn hữu cơ của resort, kết hợp chườm nóng và massage bằng dầu dừa nguyên chất ép lạnh.",
    price: 2200000,
    durationDays: 2,
    includes: "Tẩy tế bào chết bằng bã cà phê & mật ong;Chườm túi thảo dược tươi ấm nóng;Massage dầu dừa tự nhiên ép lạnh",
    healthGoal: "SPA",
    imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80"
  },
  {
    packageId: 2,
    name: "Yoga & Thiền Định Phục Hồi (Mindfulness Weekend)",
    description: "Khóa thiền định và yoga phục hồi tinh thần 3 ngày 2 đêm bên rừng thông. Giúp cân bằng luân xa, xoa dịu tâm trí và tái tạo năng lượng tích cực.",
    price: 3500000,
    durationDays: 3,
    includes: "Lớp học Hatha Yoga cá nhân hóa 1-1;Thiền hành & Thiền chuông xoay Tây Tạng;Tư vấn dinh dưỡng & lối sống lành mạnh",
    healthGoal: "YOGA",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
  },
  {
    packageId: 10,
    name: "Gói Yoga Cân Bằng Năng Lượng (Energy Balance)",
    description: "Huấn luyện Yoga nâng cao kết hợp Vinyasa Yoga năng động và các kỹ thuật hít thở sâu, hỗ trợ giải phóng năng lượng tắc nghẽn ở các cơ cốt lõi.",
    price: 4200000,
    durationDays: 4,
    includes: "3 buổi tập Vinyasa Yoga dòng chảy;Tập thở kiểm soát năng lượng Pranayama;Tắm khoáng phục hồi cơ bắp",
    healthGoal: "YOGA",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"
  },
  {
    packageId: 11,
    name: "Khóa Thiền Tịnh Khẩu & Tắm Rừng (Silent Zen)",
    description: "Khóa trải nghiệm im lặng tuyệt đối trong 2 ngày, kết nối sâu sắc với tự nhiên qua liệu pháp tắm rừng (Shinrin-yoku) và thiền chuông xoay.",
    price: 2000000,
    durationDays: 2,
    includes: "Hướng dẫn tắm rừng Shinrin-yoku;Thiền trà tĩnh tâm bên suối;Trị liệu âm thanh bằng chuông xoay",
    healthGoal: "YOGA",
    imageUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80"
  },
  {
    packageId: 12,
    name: "Gói Yoga Thiền Định Cho Giấc Ngủ (Sleep Well)",
    description: "Liệu trình đặc trị mất ngủ, kết hợp lớp tập Yoga phục hồi nhẹ nhàng buổi tối và thực hành Yoga Nidra (thiền ngủ) để làm dịu hệ thần kinh.",
    price: 2800000,
    durationDays: 3,
    includes: "Huấn luyện thiền giấc ngủ Yoga Nidra;Massage body tinh dầu oải hương;Trà thảo mộc an thần trước khi ngủ",
    healthGoal: "YOGA",
    imageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80"
  },
  {
    packageId: 13,
    name: "Khóa Thiền Sound Bath & Cân Bằng Luân Xa",
    description: "Sử dụng liệu pháp âm thanh cộng hưởng tần số cao của chuông xoay pha lê kết hợp các tư thế yoga phục hồi nhẹ nhàng để đả thông bế tắc ở 7 luân xa chính.",
    price: 3000000,
    durationDays: 3,
    includes: "Liệu pháp Sound Bath bằng chuông pha lê;Lớp học Restorative Yoga phục hồi;Tư vấn kiểm tra tần số luân xa cá nhân",
    healthGoal: "YOGA",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
  },
  {
    packageId: 14,
    name: "Yoga Đón Bình Minh (Sunrise Yoga Retreat)",
    description: "Đánh thức mọi giác quan buổi sáng bên hồ nước tĩnh lặng của resort với chuỗi động tác chào mặt trời, thực hành kỹ thuật thở thanh lọc cơ thể Pranayama và thiền định ngắn.",
    price: 1500000,
    durationDays: 2,
    includes: "3 buổi tập Yoga đón bình minh bên hồ;Kỹ thuật thở thanh lọc Pranayama nâng cao;Bữa sáng dinh dưỡng thực dưỡng sau tập",
    healthGoal: "YOGA",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"
  },
  {
    packageId: 5,
    name: "Nắn Chỉnh Cột Sống & Vật Lý Trị Liệu",
    description: "Gói trị liệu chuyên sâu phục hồi cột sống 4 ngày 3 đêm, chẩn đoán bởi bác sĩ chuyên khoa xương khớp kết hợp nắn chỉnh cơ Chiropractic.",
    price: 4800000,
    durationDays: 4,
    includes: "Khám chẩn đoán cột sống bởi bác sĩ chuyên khoa;2 buổi nắn chỉnh cột sống Chiropractic;Tập phục hồi chức năng cơ cốt lõi",
    healthGoal: "THERAPY",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"
  },
  {
    packageId: 15,
    name: "Trị Liệu Cổ Vai Gáy Chuyên Sâu (Deep Healing)",
    description: "Liệu pháp đặc trị đau mỏi cổ vai gáy kinh niên cho giới văn phòng, sử dụng kỹ thuật ấn huyệt Đông y kết hợp túi chườm thảo dược nóng.",
    price: 1200000,
    durationDays: 1,
    includes: "Ấn huyệt đả thông kinh lạc cổ vai gáy (75 phút);Chườm thảo dược ngải cứu nóng;Ngâm chân thảo dược gừng tươi",
    healthGoal: "THERAPY",
    imageUrl: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80"
  },
  {
    packageId: 3,
    name: "Gói Giảm Cân & Thon Gọn Dáng Vóc (Slimming)",
    description: "Hành trình thon gọn vóc dáng khoa học 7 ngày 6 đêm. Bao gồm huấn luyện thể chất PT 1-1 chuyên sâu và tư vấn chế độ dinh dưỡng lành mạnh.",
    price: 8500000,
    durationDays: 7,
    includes: "Tư vấn dinh dưỡng từ chuyên gia;Tập luyện PT 1-1 đốt mỡ cá nhân hóa;Massage bùn nóng hóa lỏng mỡ thừa",
    healthGoal: "THERAPY",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80"
  },
  {
    packageId: 16,
    name: "Phục Hồi Chấn Thương & Giãn Cơ Thể Thao",
    description: "Dành riêng cho những người hoạt động thể thao cường độ cao, giúp thư giãn cơ sâu bằng máy sóng xung kích và giải tỏa axit lactic.",
    price: 3800000,
    durationDays: 3,
    includes: "Giãn cơ sâu bằng máy sóng xung kích;Massage thể thao giải tỏa axit lactic;Ngâm bồn sục jacuzzi phục hồi",
    healthGoal: "THERAPY",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"
  },
  {
    packageId: 17,
    name: "Điều Trị Đau Cột Sống & Thắt Lưng Chuyên Sâu",
    description: "Hành trình điều trị chuyên biệt cho người thoát vị đĩa đệm, thoái hóa cột sống bằng công nghệ xung điện hiện đại, nắn chỉnh Chiropractic cột sống thắt lưng và bài tập phục hồi cơ cốt lõi chuyên sâu.",
    price: 5800000,
    durationDays: 5,
    includes: "Châm cứu & Xung điện phục hồi xung thần kinh;Nắn chỉnh Chiropractic chuyên khoa cột sống;Bài tập phục hồi nhóm cơ lưng & cơ bụng dưới",
    healthGoal: "THERAPY",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"
  },
  {
    packageId: 18,
    name: "Phục Hồi Thần Kinh & Giải Tỏa Stress Cực Hạn",
    description: "Liệu trình kết hợp y học cổ truyền Đông y như châm cứu ngải cứu vùng đầu cổ gáy, massage ấn huyệt phản xạ cơ bàn chân và ngâm bồn tắm thuốc Dao đỏ giúp giải phóng căng thẳng tâm lý.",
    price: 3200000,
    durationDays: 3,
    includes: "Châm cứu ngải thảo dược ấm đầu cổ gáy;Massage bấm huyệt phản xạ lòng bàn tay/bàn chân;Ngâm bồn tắm gỗ sồi thuốc Dao Đỏ thảo dược",
    healthGoal: "THERAPY",
    imageUrl: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80"
  },
  {
    packageId: 19,
    name: "Thải Độc Hệ Bạch Huyết Toàn Diện (Lymphatic Drainage)",
    description: "Liệu pháp kích thích tuần hoàn lưu thông bạch huyết cơ thể nhằm tăng cường hệ thống miễn dịch, giải quyết tình trạng ứ dịch và đào thải độc tố tích tụ.",
    price: 4100000,
    durationDays: 4,
    includes: "Massage dẫn lưu cơ học hệ bạch huyết toàn diện;Liệu pháp quấn nóng thải độc cơ thể bằng tảo biển;Thực đơn nước ép detox hữu cơ hàng ngày",
    healthGoal: "THERAPY",
    imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80"
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// Modal chi tiết gói
// ═══════════════════════════════════════════════════════════════════════════════
function PackageDetailModal({ pkg, onClose, onBook }) {
  if (!pkg) return null;
  const [guestsCount, setGuestsCount] = useState(1);
  const includesList = pkg.includes ? pkg.includes.split(";").filter(Boolean) : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(29, 11, 13, 0.85)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-warm-cream border border-sage-mist rounded-none w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner image */}
        <div className="relative h-64 overflow-hidden border-b border-sage-mist">
          <img
            src={
              pkg.imageUrl ||
              "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
            }
            alt={pkg.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black-olive/80 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black-olive/40 hover:bg-black-olive/60 text-warm-cream rounded-[1px] p-2 transition-colors cursor-pointer border border-sage-mist/30"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <span className="bg-forest-ink text-warm-cream text-[10px] font-medium uppercase px-3 py-1 rounded-[1px] tracking-wider border border-sage-mist/30">
              {healthGoalLabel[pkg.healthGoal] || pkg.healthGoal}
            </span>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-5 left-6 right-6 text-left">
            <h2 className="font-serif text-2xl font-light text-warm-cream leading-tight drop-shadow tracking-[0.06em] uppercase">
              {pkg.name}
            </h2>
          </div>
        </div>

        {/* Content body */}
        <div className="p-8 text-black-olive text-left">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left: Intro & Includes */}
            <div className="md:col-span-7 space-y-6">
              <div>
                <h3 className="font-bold text-forest-ink text-xs uppercase tracking-wider mb-2.5">
                  Giới thiệu dịch vụ
                </h3>
                <p className="text-black-olive/80 text-sm leading-relaxed">
                  {pkg.description || "Chúng tôi sẽ cung cấp thêm thông tin về dịch vụ này trong thời gian sớm nhất."}
                </p>
              </div>

              {includesList.length > 0 && (
                <div>
                  <h3 className="font-bold text-forest-ink text-xs uppercase tracking-wider mb-2.5">
                    Dịch vụ bao gồm
                  </h3>
                  <ul className="space-y-2">
                    {includesList.map((inc, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs text-black-olive/90">
                        <CheckCircle className="w-4 h-4 text-forest-ink flex-shrink-0 mt-0.5" />
                        <span>{inc.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-1 pt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-lemon-zest text-lemon-zest" />
                ))}
                <span className="text-xs text-forest-ink ml-2">5.0 · Dịch vụ cao cấp</span>
              </div>
            </div>

            {/* Right: Booking Info & calculation */}
            <div className="md:col-span-5 flex flex-col gap-5 bg-sage-mist/20 rounded-[1px] p-5 border border-sage-mist">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-forest-ink">
                  <Clock className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-forest-ink/75 uppercase tracking-wider">Thời lượng</span>
                    <span className="font-bold text-xs">{pkg.durationDays} ngày</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-forest-ink">
                  <Sparkles className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-forest-ink/75 uppercase tracking-wider">Loại dịch vụ</span>
                    <span className="font-bold text-xs">
                      {healthGoalLabel[pkg.healthGoal] || "Chăm sóc chung"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-sage-mist" />

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-[10px] font-bold text-forest-ink uppercase tracking-wider">
                      Số người tham gia
                    </span>
                    <span className="text-[9px] text-forest-ink/75">Tăng giảm số khách</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-[1px] border border-sage-mist shadow-none">
                    <button
                      type="button"
                      onClick={() => setGuestsCount((prev) => Math.max(1, prev - 1))}
                      className="text-black-olive hover:bg-sage-mist/30 rounded-[1px] p-1 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                      disabled={guestsCount <= 1}
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[3px]" />
                    </button>
                    <span className="w-5 text-center font-bold text-sm text-black-olive">{guestsCount}</span>
                    <button
                      type="button"
                      onClick={() => setGuestsCount((prev) => prev + 1)}
                      className="text-black-olive hover:bg-sage-mist/30 rounded-[1px] p-1 transition-colors cursor-pointer flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                    </button>
                  </div>
                </div>

                <div className="h-px bg-sage-mist" />

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-black-olive/80">
                    <span>Đơn giá trên người:</span>
                    <span className="font-semibold text-black-olive">{formatPrice(pkg.price)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-forest-ink">Tổng thanh toán:</span>
                    <span className="text-base font-bold font-serif text-forest-ink">{formatPrice(pkg.price * guestsCount)}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons (Black Olive filled CTA on Warm Cream dialog) */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onBook && onBook(pkg.packageId)}
                  className="w-full bg-black-olive hover:bg-black-olive/90 text-warm-cream text-center py-3 rounded-[1px] text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-black-olive cursor-pointer"
                >
                  <span>Đặt dịch vụ ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 border border-black-olive text-black-olive bg-transparent rounded-[1px] text-xs font-semibold uppercase tracking-wider hover:bg-black-olive hover:text-warm-cream transition-all cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Trang Spa chính
// ═══════════════════════════════════════════════════════════════════════════════
export default function Spa() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get("tab"); // "packages" or "schedule"

  const [packages, setPackages]             = useState([]);
  const [allPackages, setAllPackages]       = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showBackToTop, setShowBackToTop]     = useState(false);
  const [filters, setFilters] = useState({
    keyword:         "",
    healthGoal:      "",
    minPrice:        "",
    maxPrice:        "",
    maxDurationDays: "",
  });

  // Tab State
  const [activeTab, setActiveTab] = useState(tabParam || "packages"); // "packages" or "schedule"

  useEffect(() => {
    if (tabParam === "packages" || tabParam === "schedule") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  // Scheduler States
  const [loadingScheduler, setLoadingScheduler] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [spaServices, setSpaServices] = useState([]);
  const [activeServiceCategory, setActiveServiceCategory] = useState("SPA");
  const [medicalProfile, setMedicalProfile] = useState(null);
  const [healthConsentCheck, setHealthConsentCheck] = useState(false);

  // Form states for spa scheduling
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [startDatetime, setStartDatetime] = useState("");
  const [schedulerGuestsCount, setSchedulerGuestsCount] = useState(1);

  // Combine date and time into startDatetime string
  useEffect(() => {
    if (startDate && startTime) {
      setStartDatetime(`${startDate}T${startTime}`);
    } else {
      setStartDatetime("");
    }
  }, [startDate, startTime]);
  const [isPackageIncluded, setIsPackageIncluded] = useState(false);
  const [selectedRoomBookingId, setSelectedRoomBookingId] = useState("");
  const [isAutoMatching, setIsAutoMatching] = useState(false);
  
  // Auto matched details
  const [matchedTherapist, setMatchedTherapist] = useState(null);
  const [matchedRoom, setMatchedRoom] = useState(null);
  const [matchedEndDatetime, setMatchedEndDatetime] = useState("");
  const [matchError, setMatchError] = useState("");

  // Booking result/status
  const [bookingSuccessData, setBookingSuccessData] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  // Itinerary Cart States
  const [itineraryCart, setItineraryCart] = useState([]);
  const [bulkBookingProgress, setBulkBookingProgress] = useState(null); // { current, total, serviceName }
  const [bulkSuccessData, setBulkSuccessData] = useState(null); // list of successfully scheduled bookings

  // Wellness Combo Scheduling States
  const [activeCombo, setActiveCombo] = useState(null);
  const [comboScheduleModalOpen, setComboScheduleModalOpen] = useState(false);
  const [isComboScheduling, setIsComboScheduling] = useState(false);


  // Gói trị liệu đăng ký thêm ở Spa Page
  const [regSelectedBookingId, setRegSelectedBookingId] = useState("");
  const [regSelectedPackageId, setRegSelectedPackageId] = useState("");
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState("");
  const [regError, setRegError] = useState("");
  const [showPackagePurchase, setShowPackagePurchase] = useState(false);

  // Helper to check if a service is included in a room booking's retreat package
  const getPackageMatchingResult = (service, bookingId) => {
    if (!bookingId || !service) return { matched: false, packageDetail: null };
    const booking = userBookings.find(b => b.bookingId === Number(bookingId));
    if (!booking || !booking.packageName) return { matched: false, packageDetail: null };
    
    // Find matching package object to get its `includes` field
    const pkg = (allPackages || []).find(p => p.name === booking.packageName || p.packageName === booking.packageName)
             || (STATIC_PACKAGES || []).find(p => p.name === booking.packageName || p.packageName === booking.packageName);
             
    if (!pkg || !pkg.includes) return { matched: false, packageDetail: pkg };
    
    const includesArray = pkg.includes.split(";").map(item => item.trim().toLowerCase());
    const svcName = service.name.toLowerCase();
    
    // Fuzzy matching: check if any item in includes contains/matches service name
    const matched = includesArray.some(item => {
      if (svcName.includes(item) || item.includes(svcName)) return true;
      const cleanSvc = svcName.replace(/[^a-z0-9]/g, "");
      const cleanItem = item.replace(/[^a-z0-9]/g, "");
      if (cleanSvc.includes(cleanItem) || cleanItem.includes(cleanSvc)) return true;
      return false;
    });
    
    return { matched, packageDetail: pkg };
  };

  // Tải / lọc danh sách gói từ Database (có fallback sang dữ liệu tĩnh)
  useEffect(() => {
    setLoading(true);
    
    // Helper function thực hiện việc lọc trên một mảng các gói
    const filterList = (list) => {
      return (list || []).filter(pkg => {
        // Lọc theo Category
        if (filters.healthGoal && pkg.healthGoal !== filters.healthGoal) {
          return false;
        }
        
        // Lọc theo từ khóa (Tìm trong Tên, Mô tả, và Dịch vụ bao gồm)
        if (filters.keyword.trim()) {
          const query = filters.keyword.toLowerCase().trim();
          const inName = pkg.name.toLowerCase().includes(query);
          const inDesc = pkg.description.toLowerCase().includes(query);
          const inIncludes = pkg.includes ? pkg.includes.toLowerCase().includes(query) : false;
          if (!inName && !inDesc && !inIncludes) {
            return false;
          }
        }
        
        // Lọc theo giá tối thiểu
        if (filters.minPrice && pkg.price < Number(filters.minPrice)) {
          return false;
        }
        
        // Lọc theo giá tối đa
        if (filters.maxPrice && pkg.price > Number(filters.maxPrice)) {
          return false;
        }
        
        // Lọc theo số ngày tối đa
        if (filters.maxDurationDays && pkg.durationDays > Number(filters.maxDurationDays)) {
          return false;
        }
        
        return true;
      });
    };

    // Gọi API lấy các gói từ Database
    masterDataApi.getRetreatPackages()
      .then((data) => {
        setAllPackages(data || []);
        const filtered = filterList(data);
        setPackages(filtered);
        setError(null);
      })
      .catch((err) => {
        console.warn("Không thể tải các gói trị liệu từ database, chuyển sang dùng dữ liệu tĩnh:", err);
        setAllPackages(STATIC_PACKAGES);
        const filtered = filterList(STATIC_PACKAGES);
        setPackages(filtered);
        setError(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filters]);

  // Load scheduler data
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      return;
    }
    setIsLoggedIn(true);

    if (activeTab === "schedule") {
      setLoadingScheduler(true);
      Promise.all([
        userApi.getProfile().catch(() => null),
        userApi.getMyBookings().catch(() => []),
        masterDataApi.getSpaServices().catch(() => []),
        medicalApi.getMyProfile().catch(() => null),
      ])
        .then(([profile, bookings, services, medProfile]) => {
          setCurrentUser(profile);
          // Only show confirmed room bookings
          const confirmedBookings = (bookings || []).filter(
            b => b.status === "CONFIRMED" || b.status === "CHECK_IN" || b.status === "COMPLETED"
          );
          setUserBookings(confirmedBookings);
          setSpaServices(services || []);
          setMedicalProfile(medProfile);
          setHealthConsentCheck(medProfile?.explicitConsentSigned || false);
          setLoadingScheduler(false);
        })
        .catch((err) => {
          console.error("Error loading scheduler data:", err);
          setLoadingScheduler(false);
        });
    }
  }, [activeTab]);

  // Auto-matching trigger
  useEffect(() => {
    if (selectedServiceId && startDatetime) {
      setMatchError("");
      setMatchedTherapist(null);
      setMatchedRoom(null);
      setIsAutoMatching(true);

      const start = new Date(startDatetime);
      if (start < new Date()) {
        setMatchError("Thời gian bắt đầu không được ở trong quá khứ.");
        setIsAutoMatching(false);
        return;
      }

      // If package included is checked, validate time falls within selected room booking check-in/out
      if (isPackageIncluded && selectedRoomBookingId) {
        const roomBooking = userBookings.find(b => b.bookingId === Number(selectedRoomBookingId));
        if (roomBooking) {
          const checkIn = new Date(roomBooking.checkInDate);
          const checkOut = new Date(roomBooking.checkOutDate);
          if (start < checkIn || start > checkOut) {
            setMatchError(`Thời gian chọn phải nằm trong khoảng lưu trú (${roomBooking.checkInDate.split('T')[0]} - ${roomBooking.checkOutDate.split('T')[0]}).`);
            setIsAutoMatching(false);
            return;
          }
        }
      }

      spaApi.autoMatch(Number(selectedServiceId), startDatetime)
        .then((res) => {
          setMatchedTherapist({ id: res.therapistId, name: res.therapistName });
          setMatchedRoom({ id: res.treatmentRoomId, name: res.roomName });
          setMatchedEndDatetime(res.endDatetime);
        })
        .catch((err) => {
          setMatchError(err.message || "Không tìm thấy kỹ thuật viên hoặc phòng trống.");
        })
        .finally(() => {
          setIsAutoMatching(false);
        });
    }
  }, [selectedServiceId, startDatetime, isPackageIncluded, selectedRoomBookingId, userBookings]);

  const handleRegisterPackage = async (e) => {
    e.preventDefault();
    setRegSuccess("");
    setRegError("");

    if (!regSelectedBookingId) {
      setRegError("Vui lòng chọn đơn đặt phòng.");
      return;
    }
    if (!regSelectedPackageId) {
      setRegError("Vui lòng chọn gói trị liệu muốn đăng ký.");
      return;
    }

    setRegSubmitting(true);
    try {
      const roomBooking = userBookings.find(b => b.bookingId === Number(regSelectedBookingId));
      if (!roomBooking) {
        throw new Error("Không tìm thấy đơn đặt phòng hợp lệ.");
      }

      // Update room booking via lookup-update api
      const payload = {
        email: currentUser.email,
        phone: currentUser.phone,
        packageId: Number(regSelectedPackageId)
      };

      await bookingLookupApi.update(roomBooking.bookingId, payload);

      setRegSuccess(`Đăng ký gói thành công! Chi phí đã được cộng vào hóa đơn phòng BK-${String(roomBooking.bookingId).padStart(4, '0')}.`);
      setRegSelectedPackageId("");

      // Refresh stay bookings list from server
      const updatedBookings = await userApi.getMyBookings().catch(() => []);
      const confirmedBookings = (updatedBookings || []).filter(
        b => b.status === "CONFIRMED" || b.status === "CHECK_IN" || b.status === "COMPLETED"
      );
      setUserBookings(confirmedBookings);
    } catch (err) {
      setRegError(err.message || "Đăng ký gói trị liệu thất bại.");
    } finally {
      setRegSubmitting(false);
    }
  };

  const handleAddToItinerary = (e) => {
    if (e) e.preventDefault();
    setBookingError("");
    setBookingSuccessData(null);
    setBulkSuccessData(null);

    if (!selectedServiceId) {
      setBookingError("Vui lòng chọn dịch vụ trị liệu.");
      return;
    }
    if (!startDatetime) {
      setBookingError("Vui lòng chọn thời gian bắt đầu.");
      return;
    }
    if (!healthConsentCheck) {
      setBookingError("Bạn cần hoàn thành và cam kết hồ sơ sức khỏe trước khi đặt lịch.");
      return;
    }
    if (!matchedTherapist || !matchedRoom) {
      setBookingError("Vui lòng đợi hệ thống khớp nối chuyên gia và phòng trống.");
      return;
    }

    const service = spaServices.find(s => s.serviceId === Number(selectedServiceId));
    if (!service) return;

    // Check for global overlap in current itinerary cart
    const start = new Date(startDatetime);
    const end = new Date(start.getTime() + service.durationMinutes * 60000);

    const overlap = itineraryCart.some(item => {
      const itemStart = new Date(item.startDatetime);
      const itemEnd = new Date(itemStart.getTime() + item.service.durationMinutes * 60000);
      return start < itemEnd && end > itemStart;
    });

    if (overlap) {
      setBookingError("Khung giờ này đã bị trùng với một dịch vụ khác trong lịch trình.");
      return;
    }

    const pkgCheck = getPackageMatchingResult(service, isPackageIncluded ? selectedRoomBookingId : null);
    const isFree = isPackageIncluded && selectedRoomBookingId && pkgCheck.matched;

    const newItem = {
      id: Date.now() + Math.random(),
      service,
      startDatetime,
      roomBookingId: selectedRoomBookingId ? Number(selectedRoomBookingId) : null,
      isPackageIncluded: isFree,
      matchedTherapist,
      matchedRoom,
      matchedEndDatetime,
      price: isFree ? 0 : service.price,
      guestsCount: schedulerGuestsCount
    };

    setItineraryCart(prev => [...prev, newItem].sort((a, b) => new Date(a.startDatetime) - new Date(b.startDatetime)));
    
    // Reset selection form
    setSelectedServiceId("");
    setStartDate("");
    setStartTime("");
    setStartDatetime("");
    setMatchedTherapist(null);
    setMatchedRoom(null);
    setMatchedEndDatetime("");
    setMatchError("");
    setSchedulerGuestsCount(1);
  };

  const handleApplyCombo = async ({ startDateVal, startTimeVal, isPkgVal, roomBookingIdVal, comboGuestsCountVal = 1 }) => {
    setBookingError("");
    setMatchError("");
    setIsComboScheduling(true);

    if (!activeCombo) return;

    try {
      const itemsToAdd = [];
      // Combine date and time to local date
      let currentStart = new Date(`${startDateVal}T${startTimeVal}`);

      if (currentStart < new Date()) {
        throw new Error("Thời gian khởi hành combo không được ở trong quá khứ.");
      }

      // Check package stay date bounds if package selected
      if (isPkgVal && roomBookingIdVal) {
        const roomBooking = userBookings.find(b => b.bookingId === Number(roomBookingIdVal));
        if (roomBooking) {
          const checkIn = new Date(roomBooking.checkInDate);
          const checkOut = new Date(roomBooking.checkOutDate);
          if (currentStart < checkIn || currentStart > checkOut) {
            throw new Error(`Thời gian bắt đầu combo phải nằm trong khoảng lưu trú (${roomBooking.checkInDate.split('T')[0]} - ${roomBooking.checkOutDate.split('T')[0]}).`);
          }
        }
      }

      for (let i = 0; i < activeCombo.services.length; i++) {
        const svcId = activeCombo.services[i];
        const service = spaServices.find(s => s.serviceId === svcId);
        if (!service) {
          throw new Error(`Không tìm thấy cấu hình cho dịch vụ ID: ${svcId}`);
        }

        // Retrieve predefined clean price from combo configuration
        const customPrice = activeCombo.servicePrices?.[service.serviceId] || service.price;

        // Format to YYYY-MM-DDTHH:mm:ss for backend
        // Use timezone offset correction to generate correct local timestamp string
        const tzOffset = currentStart.getTimezoneOffset() * 60000; // in ms
        const localTime = new Date(currentStart.getTime() - tzOffset);
        const isoStartStr = localTime.toISOString().slice(0, 19);

        // Check if there is an overlap in the items we are building or in existing cart
        const sessionEnd = new Date(currentStart.getTime() + service.durationMinutes * 60000);
        
        const overlap = [...itineraryCart, ...itemsToAdd].some(item => {
          const itemStart = new Date(item.startDatetime);
          const itemEnd = new Date(itemStart.getTime() + item.service.durationMinutes * 60000);
          return currentStart < itemEnd && sessionEnd > itemStart;
        });

        if (overlap) {
          throw new Error(`Dịch vụ "${service.name}" (${currentStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}) bị trùng lịch với lịch trình khác đã lên.`);
        }

        // Call autoMatch API only for the first guest
        const matchRes = await spaApi.autoMatch(service.serviceId, isoStartStr);

        const pkgCheck = getPackageMatchingResult(service, isPkgVal ? roomBookingIdVal : null);
        const isFree = isPkgVal && roomBookingIdVal && pkgCheck.matched;

        itemsToAdd.push({
          id: Date.now() + Math.random() + i,
          service,
          startDatetime: isoStartStr,
          roomBookingId: roomBookingIdVal ? Number(roomBookingIdVal) : null,
          isPackageIncluded: isFree,
          matchedTherapist: { id: matchRes.therapistId, name: matchRes.therapistName },
          matchedRoom: { id: matchRes.treatmentRoomId, name: matchRes.roomName },
          matchedEndDatetime: matchRes.endDatetime,
          price: isFree ? 0 : customPrice,
          guestsCount: comboGuestsCountVal,
          comboName: activeCombo.name
        });

        // Add duration of current service + 15 minute transition buffer for next service start time
        currentStart = new Date(sessionEnd.getTime() + 15 * 60000);
      }

      // Add all to itinerary cart and sort chronologically
      setItineraryCart(prev => [...prev, ...itemsToAdd].sort((a, b) => new Date(a.startDatetime) - new Date(b.startDatetime)));

      // Close modal on success
      setComboScheduleModalOpen(false);
      setActiveCombo(null);
    } catch (err) {
      setBookingError(err.message || "Không thể khớp nối tài nguyên tự động cho toàn bộ lộ trình của combo. Vui lòng thử lại với thời gian khác.");
    } finally {
      setIsComboScheduling(false);
    }
  };

  const handleBulkBookItinerary = async (e) => {
    if (e) e.preventDefault();
    setBookingError("");
    setBookingSuccessData(null);
    setBulkSuccessData(null);
    setIsBookingSubmitting(true);

    // Calculate total API calls across all cart items
    let apiCallTotal = 0;
    for (const item of itineraryCart) {
      apiCallTotal += item.guestsCount || 1;
    }

    const successes = [];
    let currentCallIndex = 0;

    try {
      for (let i = 0; i < itineraryCart.length; i++) {
        const item = itineraryCart[i];
        const count = item.guestsCount || 1;

        for (let g = 0; g < count; g++) {
          currentCallIndex++;
          setBulkBookingProgress({
            current: currentCallIndex,
            total: apiCallTotal,
            serviceName: `${item.service.name} (Khách ${g + 1}/${count})`
          });

          const dto = {
            spaServiceId: item.service.serviceId,
            startDatetime: item.startDatetime,
            roomBookingId: item.roomBookingId ? Number(item.roomBookingId) : null,
            therapistId: g === 0 ? (item.matchedTherapist?.id || null) : null,
            treatmentRoomId: g === 0 ? (item.matchedRoom?.id || null) : null,
            isPackageIncluded: item.isPackageIncluded,
            price: item.isPackageIncluded ? 0 : item.price
          };

          const res = await spaApi.schedule(dto);
          successes.push({
            ...res,
            guestLabel: `Khách ${g + 1}`
          });
        }
      }

      setBulkSuccessData(successes);
      setItineraryCart([]); // Clear cart on success
    } catch (err) {
      setBookingError(err.message || "Đặt lộ trình thất bại ở một trong các buổi hẹn. Vui lòng kiểm tra lại trạng thái lịch trình.");
    } finally {
      setIsBookingSubmitting(false);
      setBulkBookingProgress(null);
    }
  };


  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPackageSection = (title, desc, filteredPkgs, IconComponent) => {
    if (filteredPkgs.length === 0) return null;
    return (
      <div className="mb-20 last:mb-0">
        {/* Section Header */}
        <div className="flex items-center gap-4 mb-5 pb-3.5 border-b border-forest-ink/15 text-left">
          <div className="w-10 h-10 rounded-full bg-forest-ink/5 border border-forest-ink/15 flex items-center justify-center text-forest-ink shrink-0">
            {IconComponent && <IconComponent className="w-5 h-5 stroke-[1.5]" />}
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
            <h3 className="text-xl md:text-2xl font-serif font-light text-forest-ink uppercase tracking-wider">
              {title}
            </h3>
            <span className="bg-forest-ink/10 text-forest-ink text-[11px] font-semibold px-2.5 py-0.5 rounded-full w-fit">
              {filteredPkgs.length} gói
            </span>
          </div>
        </div>
        <p className="text-xs md:text-sm text-black-olive/75 mb-10 max-w-3xl leading-relaxed text-left font-light">
          {desc}
        </p>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredPkgs.map((pkg, idx) => {
            const priceFormatted = formatPrice(pkg.price);
            const includesList   = pkg.includes ? pkg.includes.split(";").filter(Boolean) : [];
            const goalLabel      = healthGoalLabel[pkg.healthGoal] || pkg.healthGoal;
            const imgSrc         = pkg.imageUrl || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80";
            const delay          = (idx % 3) * 150;

            return (
              <ScrollReveal key={pkg.packageId} delay={delay}>
                <div
                  onClick={() => setSelectedPackage(pkg)}
                  className="group bg-warm-cream border border-forest-ink/12 rounded-2xl p-6 flex flex-col justify-between text-left cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:border-forest-ink/35 hover:shadow-[0_12px_30px_-10px_rgba(29,35,27,0.15)] h-full"
                >
                  <div>
                    {/* Image Container with Badges */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl mb-5">
                      <img
                        src={imgSrc}
                        alt={pkg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-black-olive/10 group-hover:bg-transparent transition-colors duration-300" />
                      
                      {/* Duration Tag */}
                      <div className="absolute top-3.5 right-3.5">
                        <span className="bg-black-olive/80 backdrop-blur-[2px] text-warm-cream text-[9px] font-bold uppercase px-3 py-1 rounded-full tracking-wider border border-warm-cream/10">
                          {pkg.durationDays} ngày
                        </span>
                      </div>
                      {/* Goal Tag */}
                      <div className="absolute top-3.5 left-3.5">
                        <span className="bg-forest-ink/90 backdrop-blur-[2px] text-warm-cream text-[9px] font-bold uppercase px-3 py-1 rounded-full tracking-wider border border-warm-cream/10">
                          {goalLabel}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="font-serif text-[17px] md:text-[18px] font-semibold text-forest-ink leading-snug tracking-normal line-clamp-2 uppercase min-h-[50px] group-hover:text-forest-ink/85 transition-colors">
                      {pkg.name}
                    </h4>

                    {/* Description */}
                    <p className="mt-2 text-black-olive/75 text-xs leading-relaxed line-clamp-3 min-h-[54px] font-light">
                      {pkg.description}
                    </p>

                    {/* Highlights */}
                    {includesList.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-sage-mist/20">
                        <span className="text-[10px] font-bold text-forest-ink/85 uppercase tracking-wider block mb-2.5">
                          Dịch vụ bao gồm:
                        </span>
                        <ul className="space-y-2 text-xs text-black-olive/80">
                          {includesList.slice(0, 3).map((inc, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <CheckCircle className="w-3.5 h-3.5 text-forest-ink/70 shrink-0 mt-0.5" />
                              <span className="line-clamp-1 font-light">{inc.trim()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Price and CTA */}
                  <div className="mt-5 pt-4 border-t border-sage-mist/20 flex items-center justify-between">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-forest-ink/60">Giá trọn gói</span>
                      <span className="text-forest-ink font-serif font-bold text-[17px]">{priceFormatted}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPackage(pkg);
                      }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase border border-forest-ink/40 text-forest-ink bg-transparent rounded-full px-4 py-2 transition-all duration-300 hover:bg-forest-ink hover:text-warm-cream hover:border-forest-ink cursor-pointer"
                    >
                      <span>Chi tiết</span> <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-forest-ink">
      {/* ── Modal chi tiết ── */}
      {selectedPackage && (
        <PackageDetailModal
          pkg={selectedPackage}
          onClose={() => setSelectedPackage(null)}
          onBook={(packageId) => {
            setSelectedPackage(null);
            setActiveTab("schedule");
            setIsPackageIncluded(true);
            navigate("/spa?tab=schedule", { replace: true });
            setTimeout(() => {
              const element = document.getElementById("spa-scheduler");
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }, 100);
          }}
        />
      )}

      {/* ── Hero section (Thiết kế nền xanh lá & candlelit brasserie) ── */}
      <section className="relative min-h-[45vh] flex items-center justify-center text-white py-32 overflow-hidden text-center">
        {/* Background Image với hiệu ứng scale nhẹ */}
        <div className="absolute inset-0 z-0">
          <img
            src={resortSpaHeroBg}
            alt="Resort Spa Services background"
            className="w-full h-full object-cover object-center scale-100 transform"
          />
          {/* Moody dark forest green gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-forest-ink/85 via-forest-ink/60 to-forest-ink/90" />
        </div>

        {/* Ambient candlelit flicker glow circle (Lemon Zest glow) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none z-10">
          <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-lemon-zest/30 blur-[120px] animate-pulse" style={{ animationDuration: '7s' }} />
        </div>

        {/* Content container */}
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <span className="block text-xs font-bold text-lemon-zest uppercase tracking-[0.3em] mb-4">
            Khơi Nguồn Sinh Khí · Trị Liệu Tự Nhiên
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-warm-cream leading-tight tracking-[0.05em] uppercase mb-6">
            {activeTab === "packages" ? "Gói Trị Liệu Đặc Trưng" : "Đặt Lịch Spa & Trị Liệu"}
          </h1>
          <p className="font-sans text-sm md:text-base text-warm-cream/80 max-w-2xl mx-auto font-light leading-relaxed">
            {activeTab === "packages" 
              ? "Trải nghiệm các liệu trình spa thảo dược, yoga phục hồi và trị liệu chuyên sâu được thiết kế riêng cho kỳ nghỉ dưỡng của bạn."
              : "Lên lịch hẹn trực tuyến với đội ngũ kỹ thuật viên chuyên nghiệp để được chăm sóc sức khỏe toàn diện."}
          </p>
        </div>
      </section>

      {activeTab === "packages" ? (
        <>
          {/* ── Bộ lọc danh mục & các bộ lọc bổ sung ── */}
          <div className="sticky top-20 z-30 bg-forest-ink/95 backdrop-blur-md border-b border-white/10 shadow-lg py-5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
              {/* Category tabs */}
              <div className="flex justify-center">
                <div className="flex items-center gap-2 overflow-x-auto flex-nowrap pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]">
                  {categoryFilters.map(({ label, value, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setFilters({ ...filters, healthGoal: value })}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase border transition-all cursor-pointer flex-shrink-0 ${
                        filters.healthGoal === value
                          ? "bg-lemon-zest text-black-olive border-lemon-zest font-bold shadow-md shadow-lemon-zest/10"
                          : "bg-transparent text-warm-cream border-white/20 hover:border-lemon-zest"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced search and filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 max-w-5xl mx-auto pt-1">
                {/* Search Keyword */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sage-mist/60">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Tìm tên gói, dịch vụ..."
                    value={filters.keyword}
                    onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-full text-xs text-warm-cream placeholder-warm-cream/60 focus:outline-none focus:bg-white/15 focus:border-lemon-zest focus:ring-1 focus:ring-lemon-zest transition-all"
                  />
                  {filters.keyword && (
                    <button
                      onClick={() => setFilters({ ...filters, keyword: "" })}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-warm-cream/50 hover:text-lemon-zest transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Min Price Dropdown / Select */}
                <div>
                  <select
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-full text-xs text-warm-cream focus:outline-none focus:bg-white/15 focus:border-lemon-zest transition-all cursor-pointer appearance-none animate-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M7 9l3 3 3-3' stroke='%23fef6e4' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundPosition: 'right 14px center', backgroundSize: '14px', backgroundRepeat: 'no-repeat' }}
                  >
                    <option value="" className="bg-forest-ink text-warm-cream">Giá tối thiểu (Tất cả)</option>
                    <option value="1000000" className="bg-forest-ink text-warm-cream">Từ 1.000.000 đ</option>
                    <option value="2000000" className="bg-forest-ink text-warm-cream">Từ 2.000.000 đ</option>
                    <option value="3000000" className="bg-forest-ink text-warm-cream">Từ 3.000.000 đ</option>
                    <option value="5000000" className="bg-forest-ink text-warm-cream">Từ 5.000.000 đ</option>
                  </select>
                </div>

                {/* Max Price Dropdown / Select */}
                <div>
                  <select
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-full text-xs text-warm-cream focus:outline-none focus:bg-white/15 focus:border-lemon-zest transition-all cursor-pointer appearance-none animate-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M7 9l3 3 3-3' stroke='%23fef6e4' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundPosition: 'right 14px center', backgroundSize: '14px', backgroundRepeat: 'no-repeat' }}
                  >
                    <option value="" className="bg-forest-ink text-warm-cream">Giá tối đa (Tất cả)</option>
                    <option value="2000000" className="bg-forest-ink text-warm-cream">Đến 2.000.000 đ</option>
                    <option value="3000000" className="bg-forest-ink text-warm-cream">Đến 3.000.000 đ</option>
                    <option value="5000000" className="bg-forest-ink text-warm-cream">Đến 5.000.000 đ</option>
                    <option value="8000000" className="bg-forest-ink text-warm-cream">Đến 8.000.000 đ</option>
                  </select>
                </div>

                {/* Duration select */}
                <div>
                  <select
                    value={filters.maxDurationDays}
                    onChange={(e) => setFilters({ ...filters, maxDurationDays: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-full text-xs text-warm-cream focus:outline-none focus:bg-white/15 focus:border-lemon-zest transition-all cursor-pointer appearance-none animate-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M7 9l3 3 3-3' stroke='%23fef6e4' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundPosition: 'right 14px center', backgroundSize: '14px', backgroundRepeat: 'no-repeat' }}
                  >
                    <option value="" className="bg-forest-ink text-warm-cream">Số ngày tối đa (Tất cả)</option>
                    <option value="1" className="bg-forest-ink text-warm-cream">Trong 1 ngày</option>
                    <option value="2" className="bg-forest-ink text-warm-cream">Tối đa 2 ngày</option>
                    <option value="4" className="bg-forest-ink text-warm-cream">Tối đa 4 ngày</option>
                    <option value="7" className="bg-forest-ink text-warm-cream">Tối đa 7 ngày</option>
                  </select>
                </div>
              </div>

              {/* Reset button if filters active */}
              {(filters.keyword || filters.healthGoal || filters.minPrice || filters.maxPrice || filters.maxDurationDays) && (
                <div className="flex justify-center pt-1">
                  <button
                    onClick={() => setFilters({ keyword: "", healthGoal: "", minPrice: "", maxPrice: "", maxDurationDays: "" })}
                    className="text-[11px] font-bold tracking-wider uppercase text-lemon-zest hover:text-lemon-zest/80 transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
                  >
                    <X className="w-3.5 h-3.5" />
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              )}
            </div>
          </div>          {/* ── Danh sách gói (Nền màu nâu nhẹ `#e6dac9`) ── */}
          <div className="bg-[#e6dac9] text-black-olive">
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">

              {/* Trạng thái: loading / lỗi / trống / dữ liệu */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-forest-ink" />
                  <span className="text-sm text-forest-ink/70">Đang tải danh sách gói trị liệu...</span>
                </div>
              ) : error ? (
                <div className="max-w-md mx-auto p-6 bg-forest-ink/20 border border-sage-mist text-forest-ink rounded-[1px] flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <h3 className="font-bold text-sm">Lỗi tải dữ liệu</h3>
                    <p className="text-xs mt-1 leading-relaxed">{error}</p>
                  </div>
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-forest-ink/20 rounded-2xl p-8 bg-warm-cream/30">
                  <p className="text-sm text-forest-ink/75 font-medium">Không tìm thấy gói trị liệu nào phù hợp với bộ lọc của bạn.</p>
                  <button
                    onClick={() => setFilters({ keyword: "", healthGoal: "", minPrice: "", maxPrice: "", maxDurationDays: "" })}
                    className="mt-5 px-6 py-2.5 bg-forest-ink text-warm-cream text-xs font-bold uppercase tracking-wider rounded-full hover:bg-forest-ink/90 transition-colors cursor-pointer border border-forest-ink shadow-sm"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              ) : (
                <div className="space-y-16">
                  {(() => {
                    const spaPackages = packages.filter(p => p.healthGoal === "SPA");
                    const yogaPackages = packages.filter(p => p.healthGoal === "YOGA");
                    const therapyPackages = packages.filter(p => p.healthGoal === "THERAPY");
                    const otherPackages = packages.filter(p => p.healthGoal !== "SPA" && p.healthGoal !== "YOGA" && p.healthGoal !== "THERAPY");

                    return (
                      <>
                        {renderPackageSection(
                          "Gói Spa & Thư Giãn Đặc Trưng",
                          "Khơi nguồn năng lượng tươi mới với các liệu trình xông hơi đá muối hồng ngoại, tắm khoáng Onsen, ngâm thảo dược cổ truyền và liệu pháp massage đá muối nóng Himalaya chuyên sâu.",
                          spaPackages,
                          Leaf
                        )}

                        {renderPackageSection(
                          "Gói Yoga & Thiền Định Phục Hồi",
                          "Tìm lại sự thanh tịnh trong tâm hồn bên rừng thông yên tĩnh. Khóa tu dưỡng với các kỹ thuật thở Pranayama, thiền hành, phục hồi luân xa bằng trị liệu chuông xoay Tây Tạng.",
                          yogaPackages,
                          Heart
                        )}

                        {renderPackageSection(
                          "Gói Trị Liệu Chuyên Môn Chuyên Sâu",
                          "Liệu pháp điều trị cột sống, đau vai gáy và phục hồi chấn thương được tư vấn trực tiếp bởi bác sĩ chuyên khoa. Kết hợp nắn chỉnh Chiropractic và công nghệ xung điện phục hồi.",
                          therapyPackages,
                          Activity
                        )}

                        {otherPackages.length > 0 && renderPackageSection(
                          "Các Gói Trị Liệu Khác",
                          "Các gói chăm sóc sức khỏe và phục hồi toàn diện khác tại resort.",
                          otherPackages,
                          Sparkles
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </section>
          </div>
        </>
      ) : (
        /* ── INTERACTIVE SPA SCHEDULER TAB (Nền màu nâu nhẹ `#e6dac9`) ── */
        <div id="spa-scheduler" className="bg-[#e6dac9] text-black-olive py-20 px-4 min-h-[60vh] text-left">
          <div className="max-w-6xl mx-auto">
            {!isLoggedIn ? (
              /* Require Login View */
              <div className="max-w-md mx-auto bg-warm-cream border border-forest-ink/10 p-10 text-center rounded-2xl shadow-xl">
                <Sparkles className="w-12 h-12 text-forest-ink mx-auto mb-6 animate-pulse" />
                <h3 className="font-serif text-2xl font-semibold text-forest-ink mb-4 uppercase tracking-wider">
                  Yêu Cầu Đăng Nhập
                </h3>
                <p className="text-black-olive/80 text-sm leading-relaxed mb-8 font-light">
                  Vui lòng đăng nhập tài khoản Hội viên của bạn để lên lịch trị liệu miễn phí theo gói nghỉ dưỡng hoặc đặt thêm dịch vụ trị liệu ngoài gói.
                </p>
                <button
                  onClick={() => navigate("/dang-nhap")}
                  className="w-full bg-forest-ink hover:bg-forest-ink/90 text-warm-cream py-3.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Đăng Nhập Ngay
                </button>
              </div>
            ) : loadingScheduler ? (
              /* Loader View */
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-forest-ink" />
                <span className="text-sm text-forest-ink/75 font-semibold uppercase tracking-widest">Đang tải cấu hình lịch hẹn...</span>
              </div>
            ) : bookingSuccessData ? (
              /* Booking Success view */
              <div className="max-w-2xl mx-auto bg-white border border-forest-ink/20 p-8 sm:p-12 text-center shadow-xl rounded-2xl relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-forest-ink via-lemon-zest to-forest-ink" />
                <div className="inline-flex p-4 bg-green-50 text-forest-ink rounded-full mb-6">
                  <CheckCircle className="h-12 w-12" />
                </div>
                <h2 className="font-serif text-3xl font-normal text-forest-ink mb-3 uppercase tracking-wide">Đặt Lịch Hẹn Thành Công!</h2>
                <p className="text-black-olive/75 text-sm mb-8 font-light leading-relaxed">
                  Lịch hẹn trị liệu của quý khách đã được xác nhận tự động. Thông tin chi tiết lịch làm việc và mã đặt chỗ được cung cấp bên dưới.
                </p>
                
                <div className="border border-sage-mist bg-warm-cream/50 text-left p-6 space-y-4 mb-8 rounded-xl text-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-sage-mist">
                    <span className="font-bold text-[10px] text-black-olive/60 uppercase tracking-wider">Mã đặt hẹn Spa:</span>
                    <span className="text-forest-ink font-mono font-bold text-lg">SPA-{String(bookingSuccessData.spaBookingId).padStart(4, '0')}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-black-olive/70 font-light">Dịch vụ:</span>
                      <span className="font-semibold text-black-olive">{bookingSuccessData.serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black-olive/70 font-light">Thời gian:</span>
                      <span className="font-semibold text-black-olive">{new Date(bookingSuccessData.startDatetime).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black-olive/70 font-light">Chuyên gia:</span>
                      <span className="font-semibold text-black-olive">{bookingSuccessData.therapistName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black-olive/70 font-light">Phòng trị liệu:</span>
                      <span className="font-semibold text-black-olive">{bookingSuccessData.roomName}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-dashed border-sage-mist">
                      <span className="text-black-olive/70 font-light">Hình thức:</span>
                      <span className="font-semibold text-forest-ink">
                        {bookingSuccessData.isPackageIncluded ? "Miễn phí theo gói" : "Tính phí ngoài gói"}
                      </span>
                    </div>
                    {!bookingSuccessData.isPackageIncluded && (
                      <div className="flex justify-between font-bold text-black-olive">
                        <span>Chi phí (Billed to Folio):</span>
                        <span>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(bookingSuccessData.priceAtBooking)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => setBookingSuccessData(null)} 
                    className="bg-forest-ink text-warm-cream hover:bg-forest-ink/90 px-8 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Đặt lịch trị liệu khác
                  </button>
                  <button 
                    onClick={() => navigate("/tai-khoan/lich-su-dat-hang")} 
                    className="border border-forest-ink text-forest-ink hover:bg-forest-ink hover:text-warm-cream px-8 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Xem lịch trình cá nhân
                  </button>
                </div>
              </div>
            ) : bulkSuccessData ? (
              /* Bulk Booking Success view */
              <div className="max-w-3xl mx-auto bg-white border border-forest-ink/20 p-8 sm:p-12 text-center shadow-xl rounded-2xl relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-forest-ink via-lemon-zest to-forest-ink" />
                <div className="inline-flex p-4 bg-green-50 text-forest-ink rounded-full mb-6">
                  <CheckCircle className="h-12 w-12" />
                </div>
                <h2 className="font-serif text-3xl font-normal text-forest-ink mb-3 uppercase tracking-wide">Đặt Lộ Trình Thành Công!</h2>
                <p className="text-black-olive/75 text-sm mb-8 font-light leading-relaxed">
                  Lộ trình trị liệu của quý khách đã được xác nhận tự động. Quy trình các buổi hẹn được sắp xếp theo trình tự thời gian dưới đây:
                </p>
                
                <div className="border border-sage-mist bg-warm-cream/50 text-left p-6 space-y-4 mb-8 rounded-xl text-sm max-h-[400px] overflow-y-auto scrollbar-thin">
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-sage-mist/40">
                    {bulkSuccessData.map((booking) => {
                      return (
                        <div key={booking.spaBookingId} className="relative">
                          {/* Timeline dot */}
                          <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 border-forest-ink bg-white" />
                          
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <div className="flex gap-2">
                                <span className="text-[10px] text-forest-ink font-mono font-bold bg-forest-ink/10 px-2.5 py-0.5 rounded-full">
                                  SPA-{String(booking.spaBookingId).padStart(4, '0')}
                                </span>
                                <span className="text-[10px] text-forest-ink font-mono font-bold bg-forest-ink/10 px-2.5 py-0.5 rounded-full">
                                  {booking.guestLabel || "Khách 1"}
                                </span>
                              </div>
                              <span className="text-[11px] text-black-olive/50 font-mono">
                                {formatDateTime(booking.startDatetime)}
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-black-olive">{booking.serviceName}</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs text-black-olive/70 font-light pt-1">
                              <div>
                                <span className="font-medium text-black-olive/50 block text-[9px] uppercase">Chuyên gia:</span>
                                <span>{booking.therapistName || "Tự động xếp lịch"}</span>
                              </div>
                              <div>
                                <span className="font-medium text-black-olive/50 block text-[9px] uppercase">Phòng trị liệu:</span>
                                <span>{booking.roomName || "Tự động xếp lịch"}</span>
                              </div>
                            </div>
                            <div className="flex justify-between text-xs pt-1.5 border-t border-dashed border-sage-mist/30">
                              <span className="text-black-olive/50">Hình thức:</span>
                              <span className="font-semibold text-forest-ink text-[11px]">
                                {booking.isPackageIncluded ? "Miễn phí theo gói" : `Tính phí ngoài gói (${formatPrice(booking.priceAtBooking)})`}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => setBulkSuccessData(null)} 
                    className="bg-forest-ink text-warm-cream hover:bg-forest-ink/90 px-8 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Lên lộ trình mới
                  </button>
                  <button 
                    onClick={() => navigate("/tai-khoan/lich-su-dat-hang")} 
                    className="border border-forest-ink text-forest-ink hover:bg-forest-ink hover:text-warm-cream px-8 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Xem lịch trình cá nhân
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in text-left">
                {/* 🎁 KÍCH HOẠT GÓI TRỊ LIỆU CHO KỲ LƯU TRÚ */}
                {userBookings.length > 0 && (
                  <div className="bg-white border border-forest-ink/10 shadow-md p-6 rounded-2xl text-left space-y-4 transition-all duration-300">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-forest-ink/5 rounded-full text-forest-ink shrink-0">
                          <Sparkles className="w-5 h-5 text-forest-ink" />
                        </div>
                        <div>
                          <h4 className="font-serif text-base font-bold text-forest-ink uppercase tracking-wide">
                            🎁 Mua thêm Gói Trị Liệu Cho Kỳ Lưu Trú?
                          </h4>
                          <p className="text-black-olive/70 text-xs mt-1 font-light leading-relaxed">
                            Kích hoạt thêm gói trị liệu và cộng trực tiếp chi phí vào hóa đơn phòng (folio) của bạn.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPackagePurchase(!showPackagePurchase)}
                        className="px-4 py-2 border border-forest-ink text-forest-ink hover:bg-forest-ink hover:text-warm-cream transition-all rounded-full text-xs font-semibold uppercase tracking-wider cursor-pointer"
                      >
                        {showPackagePurchase ? "Đóng lại" : "Mua thêm gói"}
                      </button>
                    </div>

                    {showPackagePurchase && (
                      <div className="pt-4 border-t border-sage-mist/30 animate-fade-in">
                        <form onSubmit={handleRegisterPackage} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                          <div className="space-y-1.5 text-left">
                            <label className="block text-[9px] font-bold text-black-olive/60 uppercase">
                              Chọn mã đặt phòng:
                            </label>
                            <select
                              value={regSelectedBookingId}
                              onChange={(e) => {
                                setRegSelectedBookingId(e.target.value);
                                setRegSuccess("");
                                setRegError("");
                              }}
                              className="w-full px-3 py-2.5 rounded-lg border border-sage-mist bg-white text-xs focus:outline-none focus:border-forest-ink"
                              required
                            >
                              <option value="">-- Chọn đơn đặt phòng --</option>
                              {userBookings.map(b => (
                                <option key={b.bookingId} value={b.bookingId}>
                                  BK-{String(b.bookingId).padStart(4, '0')} ({b.checkInDate.split('T')[0]} - {b.checkOutDate.split('T')[0]}) {b.packageName ? `· Gói: ${b.packageName}` : ""}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5 text-left">
                            <label className="block text-[9px] font-bold text-black-olive/60 uppercase">
                              Chọn Gói Trị Liệu muốn mua:
                            </label>
                            <select
                              value={regSelectedPackageId}
                              onChange={(e) => {
                                setRegSelectedPackageId(e.target.value);
                                setRegSuccess("");
                                setRegError("");
                              }}
                              className="w-full px-3 py-2.5 rounded-lg border border-sage-mist bg-white text-xs focus:outline-none focus:border-forest-ink"
                              required
                            >
                              <option value="">-- Chọn Gói Trị Liệu --</option>
                              {(allPackages.length > 0 ? allPackages : STATIC_PACKAGES).map((p) => (
                                <option key={p.packageId} value={p.packageId}>
                                  {p.name} ({new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p.price)})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <button
                              type="submit"
                              disabled={regSubmitting || !regSelectedBookingId || !regSelectedPackageId}
                              className="w-full bg-forest-ink hover:bg-forest-ink/90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs py-3 rounded-lg uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 text-white"
                            >
                              {regSubmitting ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                                  <span>Đang đăng ký...</span>
                                </>
                              ) : (
                                <span>Đăng ký Gói & Ghi hóa đơn</span>
                              )}
                            </button>
                          </div>
                        </form>

                        {regSuccess && (
                          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>{regSuccess}</span>
                          </div>
                        )}

                        {regError && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            <span>{regError}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── WELLNESS COMBOS DECK ── */}
                <div className="bg-white border border-forest-ink/10 shadow-md p-6 rounded-2xl text-left space-y-5">
                  <div className="border-b border-sage-mist/40 pb-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-base font-bold text-forest-ink uppercase tracking-wide flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-forest-ink" />
                        Chọn Nhanh Lộ Trình Cấu Hình Sẵn (Wellness Combos)
                      </h4>
                      <p className="text-black-olive/77 text-xs mt-1 font-light leading-relaxed">
                        Các lộ trình chăm sóc sức khỏe liền mạch xuyên suốt được thiết kế khoa học bởi chuyên gia y tế giúp tối ưu hiệu quả trị liệu.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {WELLNESS_COMBOS.map((combo) => {
                      return (
                        <div 
                          key={combo.id}
                          className="border border-sage-mist/60 rounded-xl p-5 bg-warm-cream/5 flex flex-col justify-between hover:border-forest-ink/40 hover:shadow-md transition-all group"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="bg-forest-ink/15 text-forest-ink text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                                {combo.badge}
                              </span>
                              <span className="text-[10px] text-black-olive/50 font-light">
                                {combo.services.length} buổi
                              </span>
                            </div>
                            <h5 className="font-serif text-sm font-bold text-black-olive uppercase group-hover:text-forest-ink transition-colors">
                              {combo.name}
                            </h5>
                            <p className="text-[11px] text-black-olive/75 font-light leading-relaxed min-h-[50px]">
                              {combo.description}
                            </p>

                            {/* Service steps flow */}
                            <div className="pt-2.5 border-t border-sage-mist/30 space-y-2">
                              <span className="text-[9px] font-bold text-forest-ink/80 uppercase block mb-1">
                                Quy trình các bước:
                              </span>
                              <div className="relative pl-3.5 space-y-2 before:absolute before:left-[3px] before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-sage-mist/40">
                                {combo.services.map((svcId, idx) => {
                                  const service = spaServices.find(s => s.serviceId === svcId);
                                  return (
                                    <div key={svcId} className="text-[10.5px] font-light text-black-olive/80 relative">
                                      <div className="absolute -left-[13px] top-1.5 w-1.5 h-1.5 rounded-full bg-forest-ink/65" />
                                      <span className="font-semibold block">{service?.name}</span>
                                      <span className="text-[9px] text-black-olive/50 font-mono">Dài {service?.durationMinutes} phút · Bước {idx + 1}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 pt-3.5 border-t border-sage-mist/30 flex items-center justify-between">
                            <div>
                              <span className="block text-[8px] uppercase tracking-wider text-black-olive/50">Giá trọn bộ</span>
                              <span className="text-forest-ink font-bold font-serif text-sm">{formatPrice(combo.price)}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveCombo(combo);
                                setComboScheduleModalOpen(true);
                                setBookingError("");
                              }}
                              className="px-3.5 py-2 bg-forest-ink text-warm-cream hover:bg-forest-ink/90 transition-all rounded-md text-[10.5px] font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Áp dụng
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scheduler Form Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Form area: 7 cols */}
                  <form onSubmit={handleAddToItinerary} className="lg:col-span-7 bg-warm-cream border border-forest-ink/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-lg">
                  <div className="border-b border-sage-mist pb-4 mb-4">
                    <h3 className="font-serif text-lg font-bold text-forest-ink uppercase tracking-wide">Hoặc Tự Thiết Kế Lộ Trình Riêng (Chọn Từng Dịch Vụ)</h3>
                    <p className="text-black-olive/70 text-xs mt-1.5 font-light">Chọn từng dịch vụ riêng lẻ dưới đây và lên lịch để thêm vào Lộ trình cá nhân của bạn.</p>
                  </div>

                  {/* Step 1: Chọn dịch vụ trị liệu */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold text-forest-ink uppercase tracking-wider">
                        1. Chọn dịch vụ trị liệu
                      </label>
                      {selectedServiceId && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedServiceId("");
                            setBookingError("");
                          }}
                          className="text-[10px] text-red-600 hover:underline font-semibold cursor-pointer"
                        >
                          Xóa lựa chọn
                        </button>
                      )}
                    </div>
                    
                    {/* Category tabs */}
                    <div className="flex border-b border-sage-mist/40 gap-6 pb-2 overflow-x-auto flex-nowrap scrollbar-none">
                      {[
                        { key: "SPA", label: "Spa & Thư giãn" },
                        { key: "YOGA", label: "Yoga & Thiền định" },
                        { key: "THERAPY", label: "Trị liệu chuyên sâu" }
                      ].map(cat => (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => {
                            setActiveServiceCategory(cat.key);
                            setSelectedServiceId("");
                            setBookingError("");
                          }}
                          className={`pb-2 text-xs font-semibold uppercase tracking-wider transition-all relative border-b-2 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                            activeServiceCategory === cat.key
                              ? "border-forest-ink text-forest-ink font-bold"
                              : "border-transparent text-black-olive/40 hover:text-forest-ink/65"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Services cards list */}
                    <div className="grid grid-cols-1 gap-3 max-h-[380px] overflow-y-auto pr-1.5 scrollbar-thin">
                      {spaServices
                        .filter(svc => {
                          const cat = (svc.category || "SPA").toUpperCase();
                          return cat === activeServiceCategory;
                        })
                        .map((svc) => {
                          // Check package inclusion
                          const isPkg = isPackageIncluded && selectedRoomBookingId;
                          const pkgCheck = getPackageMatchingResult(svc, isPkg ? selectedRoomBookingId : null);
                          const isFree = isPkg && pkgCheck.matched;
                          const isSelected = Number(selectedServiceId) === svc.serviceId;

                          return (
                            <div
                              key={svc.serviceId}
                              onClick={() => {
                                setSelectedServiceId(String(svc.serviceId));
                                setBookingError("");
                                // Auto check registration mode if package included is active
                                if (isPackageIncluded && selectedRoomBookingId) {
                                  const singlePkgCheck = getPackageMatchingResult(svc, selectedRoomBookingId);
                                  if (!singlePkgCheck.matched) {
                                    setBookingError(`Dịch vụ "${svc.name}" không thuộc gói nghỉ dưỡng của bạn. Đã tự động chuyển sang hình thức đặt ngoài gói (tính phí).`);
                                    setIsPackageIncluded(false);
                                  }
                                }
                              }}
                              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 text-left relative group ${
                                isSelected
                                  ? "border-forest-ink bg-forest-ink/[0.03] shadow-md"
                                  : "border-sage-mist/40 bg-white hover:border-forest-ink/30 hover:bg-sage-50/20"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center flex-wrap gap-1.5">
                                    <span className="font-semibold text-black-olive text-sm font-serif group-hover:text-forest-ink transition-colors">
                                      {svc.name}
                                    </span>
                                    {isFree ? (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700 border border-green-200">
                                        Miễn phí theo gói
                                      </span>
                                    ) : isPkg && pkgCheck.packageDetail ? (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                        Ngoài gói
                                      </span>
                                    ) : null}
                                  </div>
                                  <p className="text-[10px] text-black-olive/60 font-light flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{svc.durationMinutes} phút</span>
                                  </p>
                                </div>
                                <div className="text-right">
                                  {isFree ? (
                                    <div className="flex flex-col items-end">
                                      <span className="text-[9px] line-through text-black-olive/40 font-light">
                                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(svc.price)}
                                      </span>
                                      <span className="font-bold text-xs text-green-700">0 đ</span>
                                    </div>
                                  ) : (
                                    <span className="font-bold text-xs text-forest-ink">
                                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(svc.price)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-[11px] text-black-olive/70 font-light leading-relaxed border-t border-sage-mist/20 pt-2 mt-1">
                                {svc.description}
                              </p>
                              {isSelected && (
                                <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-forest-ink text-white flex items-center justify-center shadow-sm">
                                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Step 2: Chọn hình thức đặt lịch (Gói vs Extra) */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-forest-ink uppercase tracking-wider">
                      2. Hình thức đăng ký
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isPackageIncluded 
                          ? "border-forest-ink bg-forest-ink/5" 
                          : "border-sage-mist bg-white/50 hover:border-forest-ink/30"
                      }`}>
                        <input
                          type="radio"
                          name="isPackageIncluded"
                          checked={isPackageIncluded}
                          onChange={() => {
                            setIsPackageIncluded(true);
                            setBookingError("");
                            // Auto select first room booking if available
                            if (userBookings.length > 0) {
                              setSelectedRoomBookingId(String(userBookings[0].bookingId));
                            }
                          }}
                          className="sr-only"
                        />
                        <span className="font-bold text-xs text-forest-ink uppercase">Theo gói nghỉ dưỡng</span>
                        <span className="text-[10px] text-black-olive/60 mt-1 font-light">Sử dụng buổi trị liệu miễn phí có sẵn trong gói.</span>
                      </label>

                      <label className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        !isPackageIncluded 
                          ? "border-forest-ink bg-forest-ink/5" 
                          : "border-sage-mist bg-white/50 hover:border-forest-ink/30"
                      }`}>
                        <input
                          type="radio"
                          name="isPackageIncluded"
                          checked={!isPackageIncluded}
                          onChange={() => {
                            setIsPackageIncluded(false);
                            setSelectedRoomBookingId("");
                            setBookingError("");
                          }}
                          className="sr-only"
                        />
                        <span className="font-bold text-xs text-forest-ink uppercase">Đặt ngoài gói (Tính phí)</span>
                        <span className="text-[10px] text-black-olive/60 mt-1 font-light">Tính phí theo giá dịch vụ và cộng vào hóa đơn phòng.</span>
                      </label>
                    </div>

                    {/* Room Booking Selector if package selected */}
                    {isPackageIncluded && (
                      <div className="p-4 bg-sage-mist/20 rounded-xl border border-sage-mist/40 space-y-2 mt-2">
                        <span className="block text-[9px] font-bold text-black-olive/60 uppercase">Liên kết mã đặt phòng:</span>
                        {userBookings.length === 0 ? (
                          <p className="text-xs text-red-600 font-medium">Bạn hiện không có phòng đặt đang hoạt động có đi kèm gói trị liệu. Vui lòng chọn đặt ngoài gói.</p>
                        ) : (
                          <select
                            value={selectedRoomBookingId}
                            onChange={(e) => {
                              setSelectedRoomBookingId(e.target.value);
                              setBookingError("");
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-sage-mist bg-white text-xs focus:outline-none focus:border-forest-ink"
                            required={isPackageIncluded}
                          >
                            <option value="">-- Chọn mã đặt phòng để hưởng ưu đãi --</option>
                            {userBookings.map(b => (
                              <option key={b.bookingId} value={b.bookingId}>
                                BK-{String(b.bookingId).padStart(4, '0')} (Gói: {b.packageName || "Tiêu chuẩn"}) · {b.checkInDate.split('T')[0]} - {b.checkOutDate.split('T')[0]}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Step 3: Chọn ngày & giờ */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-forest-ink uppercase tracking-wider">
                      3. Chọn ngày & giờ trị liệu
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-[9px] text-black-olive/60 uppercase font-bold mb-1">Ngày trị liệu:</span>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            setBookingError("");
                          }}
                          className="w-full px-4 py-2.5 rounded-lg border border-sage-mist bg-white text-xs focus:outline-none focus:border-forest-ink"
                          required
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] text-black-olive/60 uppercase font-bold mb-1">Giờ trị liệu:</span>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => {
                            setStartTime(e.target.value);
                            setBookingError("");
                          }}
                          className="w-full px-4 py-2.5 rounded-lg border border-sage-mist bg-white text-xs focus:outline-none focus:border-forest-ink"
                          required
                        />
                      </div>
                    </div>
                    {isPackageIncluded && selectedRoomBookingId && (
                      <p className="text-[10px] text-forest-ink font-light mt-1">
                        * Lịch hẹn phải nằm trong khoảng ngày lưu trú của phòng nghỉ.
                      </p>
                    )}
                  </div>

                  {/* Số lượng khách đi cùng */}
                  <div className="space-y-2 py-2 border-t border-b border-sage-mist/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="block text-[10px] font-bold text-forest-ink uppercase tracking-wider">
                          Số lượng khách hàng:
                        </span>
                        <span className="text-[9px] text-black-olive/50 block mt-0.5">Đặt lịch đồng thời cho cả gia đình hoặc nhóm bạn</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-sage-mist/60 select-none">
                        <button
                          type="button"
                          onClick={() => setSchedulerGuestsCount((prev) => Math.max(1, prev - 1))}
                          className="text-black-olive hover:bg-sage-mist/30 rounded p-1 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center border-none bg-transparent"
                          disabled={schedulerGuestsCount <= 1}
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[3px]" />
                        </button>
                        <span className="w-5 text-center font-bold text-sm text-black-olive">{schedulerGuestsCount}</span>
                        <button
                          type="button"
                          onClick={() => setSchedulerGuestsCount((prev) => Math.min(5, prev + 1))}
                          className="text-black-olive hover:bg-sage-mist/30 rounded p-1 transition-colors cursor-pointer flex items-center justify-center border-none bg-transparent"
                          disabled={schedulerGuestsCount >= 5}
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Auto-matching Result display */}
                  {selectedServiceId && startDatetime && (
                    <div className="p-5 rounded-xl border border-forest-ink/10 bg-white space-y-3 shadow-inner">
                      <span className="block text-[9px] font-bold text-forest-ink uppercase tracking-widest">
                        Khớp Nối Tài Nguyên Tự Động (Auto-match)
                      </span>
                      {isAutoMatching ? (
                        <div className="flex items-center gap-2 py-2 text-xs text-black-olive/60">
                          <Loader2 className="w-4 h-4 animate-spin text-forest-ink" />
                          <span>Đang kiểm tra và tìm chuyên gia trống lịch...</span>
                        </div>
                      ) : matchError ? (
                        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{matchError}</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="bg-sage-50/50 p-3 rounded-lg border border-sage-mist">
                            <span className="block text-[9px] text-black-olive/50 uppercase font-bold">Kỹ thuật viên đề xuất:</span>
                            <span className="font-semibold text-black-olive text-sm mt-1 block">{matchedTherapist?.name}</span>
                          </div>
                          <div className="bg-sage-50/50 p-3 rounded-lg border border-sage-mist">
                            <span className="block text-[9px] text-black-olive/50 uppercase font-bold">Phòng trị liệu đề xuất:</span>
                            <span className="font-semibold text-black-olive text-sm mt-1 block">{matchedRoom?.name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* GDPR / Decree 13/2023/ND-CP Compliance */}
                  <div className="p-4 bg-sage-50 rounded-xl border border-sage-200 space-y-3">
                    <span className="block text-[9px] font-bold text-black-olive uppercase tracking-wider">
                      Cam kết bảo mật & Quyền lợi y tế
                    </span>
                    {medicalProfile === null ? (
                      <div className="p-4 bg-red-900/10 border border-red-500/30 text-red-900 text-xs rounded-xl flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Chưa có Hồ sơ Sức khỏe:</span> Quý khách bắt buộc phải hoàn thành hồ sơ y tế và cam kết điều khoản trước khi đặt hẹn.
                          <Link to="/ho-so-suc-khoe" className="underline font-semibold block mt-1 hover:text-red-700">Tạo hồ sơ sức khỏe ngay &rarr;</Link>
                        </div>
                      </div>
                    ) : (
                      <label className="flex items-start gap-3 cursor-pointer group text-xs text-black-olive/80 select-none">
                        <input
                          type="checkbox"
                          checked={healthConsentCheck}
                          onChange={(e) => {
                            setHealthConsentCheck(e.target.checked);
                            setBookingError("");
                            // Silent auto-save in backend to enable frictionless scheduling
                            medicalApi.saveMyProfile(medicalProfile.physicalCondition || "", medicalProfile.foodAllergies || "", e.target.checked)
                              .then(res => setMedicalProfile(res))
                              .catch(err => console.error("Error auto-saving consent:", err));
                          }}
                          className="mt-0.5 rounded border-sage-mist focus:ring-forest-ink text-forest-ink"
                        />
                        <span>Đồng ý cam kết điều khoản y tế và cho phép bộ phận kỹ thuật viên trị liệu truy cập hồ sơ thể trạng để bảo đảm an toàn trị liệu (Nghị định 13/2023/NĐ-CP).</span>
                      </label>
                    )}
                  </div>

                  {/* Error display */}
                  {bookingError && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isBookingSubmitting || !selectedServiceId || !startDatetime || !healthConsentCheck || isAutoMatching || !!matchError}
                    className="w-full bg-forest-ink text-warm-cream hover:bg-forest-ink/90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs py-4 rounded-lg uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Thêm buổi này vào Lịch trình</span>
                  </button>
                </form>

                {/* Sidebar summary: 5 cols */}
                <div className="lg:col-span-5 bg-white border border-sage-mist rounded-2xl p-6 space-y-6 shadow-md">
                  <div className="flex items-center justify-between border-b border-sage-mist pb-3">
                    <h4 className="font-serif text-lg font-bold text-black-olive flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-forest-ink" />
                      Lộ trình của bạn
                    </h4>
                    {itineraryCart.length > 0 && (
                      <span className="bg-forest-ink/10 text-forest-ink text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        {itineraryCart.length} buổi
                      </span>
                    )}
                  </div>

                  {itineraryCart.length === 0 ? (
                    <div className="text-center py-10 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-sage-mist/10 flex items-center justify-center mx-auto text-sage-mist">
                        <Leaf className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5 px-4">
                        <p className="text-xs text-black-olive/50 font-light italic">
                          Chưa có buổi trị liệu nào trong lộ trình.
                        </p>
                        <p className="text-[10px] text-black-olive/60 leading-relaxed font-light">
                          Hãy chọn dịch vụ ở bên trái và bấm <span className="font-semibold text-forest-ink">"Thêm buổi này vào Lịch trình"</span> để thiết lập quy trình chăm sóc bản thân (Yoga &rarr; Spa &rarr; Trị liệu).
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Vertical Timeline */}
                      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-sage-mist/30">
                        {itineraryCart.map((item) => {
                          const isYoga = (item.service.category || "").toUpperCase() === "YOGA";
                          const isTherapy = (item.service.category || "").toUpperCase() === "THERAPY";
                          
                          let categoryColor = "border-emerald-200 bg-emerald-50 text-emerald-800";
                          let categoryLabel = "Spa & Thư giãn";
                          if (isYoga) {
                            categoryColor = "border-amber-200 bg-amber-50 text-amber-800";
                            categoryLabel = "Yoga & Thiền định";
                          } else if (isTherapy) {
                            categoryColor = "border-blue-200 bg-blue-50 text-blue-800";
                            categoryLabel = "Trị liệu chuyên sâu";
                          }

                          return (
                            <div key={item.id} className="relative group/item">
                              {/* Timeline dot */}
                              <div className={`absolute -left-[23px] top-1.5 w-3 h-3 rounded-full border-2 bg-white transition-all group-hover/item:scale-125 ${
                                isYoga ? "border-amber-500" : isTherapy ? "border-blue-500" : "border-emerald-500"
                              }`} />

                              {/* Card */}
                              <div className="p-4 rounded-xl border border-sage-mist/40 bg-warm-cream/20 relative space-y-2 group-hover/item:border-forest-ink/20 group-hover/item:bg-warm-cream/40 transition-all">
                                {/* Delete button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setItineraryCart(prev => prev.filter(x => x.id !== item.id));
                                    setBookingError("");
                                  }}
                                  className="absolute top-3 right-3 text-black-olive/40 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>

                                {/* Date-Time & Category */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-black-olive text-[11px] font-mono">
                                    {formatDateTime(item.startDatetime)}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${categoryColor}`}>
                                    {categoryLabel}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-forest-ink/10 text-forest-ink border border-forest-ink/20">
                                    {item.guestsCount || 1} khách
                                  </span>
                                </div>

                                {/* Service Name */}
                                <h5 className="font-bold text-xs text-black-olive pr-6 leading-tight">
                                  {item.service.name}
                                </h5>

                                {/* Resource allocations & Details */}
                                <div className="text-[10px] text-black-olive/60 font-light space-y-1">
                                  <p className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-black-olive/40" />
                                    <span>Thời lượng: {item.service.durationMinutes} phút</span>
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <Users className="w-3 h-3 text-black-olive/40" />
                                    <span>Chuyên gia: {item.matchedTherapist?.name || "Tự động xếp lịch"} {item.guestsCount > 1 ? `(+ ${item.guestsCount - 1} tự động xếp)` : ""}</span>
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <Leaf className="w-3 h-3 text-black-olive/40" />
                                    <span>Phòng: {item.matchedRoom?.name || "Tự động xếp lịch"} {item.guestsCount > 1 ? `(+ ${item.guestsCount - 1} tự động xếp)` : ""}</span>
                                  </p>
                                </div>

                                {/* Price / Package inclusion */}
                                <div className="pt-2 border-t border-sage-mist/20 flex justify-between items-center text-xs">
                                  <span className="text-[10px] text-black-olive/50 font-light">Hình thức:</span>
                                  <span className={`font-semibold ${item.isPackageIncluded ? "text-emerald-700 font-bold" : "text-forest-ink"} flex flex-col items-end`}>
                                    {item.isPackageIncluded ? (
                                      <span>Trọn gói miễn phí</span>
                                    ) : (
                                      <>
                                        <span>{formatPrice(item.price * (item.guestsCount || 1))} ({item.guestsCount || 1} khách)</span>
                                        {item.comboName && (
                                          <span className="text-[9px] text-black-olive/50 font-light italic mt-0.5">
                                            Phân bổ từ {item.comboName}
                                          </span>
                                        )}
                                      </>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-sage-mist" />

                      {/* Cost Summary Aggregator */}
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center text-black-olive/70 font-light">
                          <span>Tổng giá trị dịch vụ:</span>
                          <span className="font-semibold text-black-olive">
                            {formatPrice(itineraryCart.reduce((sum, item) => sum + (item.service.price * (item.guestsCount || 1)), 0))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-black-olive/70 font-light">
                          <span>Ưu đãi trọn gói (Khấu trừ):</span>
                          <span className="font-semibold text-emerald-700">
                            -{formatPrice(itineraryCart.reduce((sum, item) => sum + (item.isPackageIncluded ? (item.service.price * (item.guestsCount || 1)) : 0), 0))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-dashed border-sage-mist font-bold text-black-olive text-sm">
                          <span>Tổng chi phí thanh toán:</span>
                          <span className="text-base font-serif text-forest-ink font-bold">
                            {formatPrice(itineraryCart.reduce((sum, item) => sum + (item.isPackageIncluded ? 0 : (item.service.price * (item.guestsCount || 1))), 0))}
                          </span>
                        </div>
                      </div>

                      {/* Action Button / Progress */}
                      {isBookingSubmitting && bulkBookingProgress ? (
                        <div className="p-4 bg-sage-mist/20 rounded-xl border border-sage-mist/40 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-forest-ink">
                            <Loader2 className="w-4 h-4 animate-spin text-forest-ink" />
                            <span>
                              Đang đăng ký buổi {bulkBookingProgress.current} trên {bulkBookingProgress.total}...
                            </span>
                          </div>
                          <p className="text-[10px] text-black-olive/70 leading-normal font-light">
                            {bulkBookingProgress.serviceName}
                          </p>
                          <div className="w-full bg-sage-mist/30 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-forest-ink h-full transition-all duration-350"
                              style={{ width: `${(bulkBookingProgress.current / bulkBookingProgress.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleBulkBookItinerary}
                          className="w-full bg-forest-ink text-warm-cream hover:bg-forest-ink/90 font-semibold text-xs py-4 rounded-lg uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Xác nhận đặt lộ trình ({itineraryCart.length} buổi)</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* ── Newsletter (Nền màu xanh lá cây Forest Ink) ── */}
      <section className="bg-forest-ink text-warm-cream py-20 relative overflow-hidden text-center border-t border-sage-mist/30">
        <div className="absolute -right-20 -top-20 opacity-10 pointer-events-none">
          <Sparkles className="w-[300px] h-[300px] text-lemon-zest/10" />
        </div>
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <h2 className="font-serif text-3xl font-light text-white mb-6">Đăng Ký Nhận Thông Tin Ưu Đãi</h2>
          <p className="text-warm-cream/80 text-sm mb-10 leading-relaxed font-normal">
            Nhận những bí quyết chăm sóc sức khỏe từ thiên nhiên và các chương trình ưu đãi
            độc quyền dành riêng cho thành viên.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); alert("Cảm ơn bạn đã đăng ký nhận thông tin!"); }}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <input
              className="flex-grow max-w-md rounded-[1px] border border-sage-mist px-6 py-4 bg-white/10 focus:outline-none focus:border-lemon-zest text-sm text-warm-cream placeholder-gray-400"
              placeholder="Email của bạn"
              type="email"
              required
            />
            <button
              className="bg-lemon-zest text-black-olive border border-lemon-zest px-10 py-4 rounded-[1px] text-xs font-semibold uppercase tracking-wider hover:bg-lemon-zest/90 transition-all cursor-pointer"
              type="submit"
            >
              Đăng Ký
            </button>
          </form>
          <p className="mt-6 text-xs text-sage-mist font-normal">
            Chúng tôi cam kết bảo mật thông tin của bạn.{" "}
            <a className="underline hover:text-warm-cream" href="#">Chính sách bảo mật</a>.
          </p>
        </div>
      </section>

      {/* ── Modal Lên Lịch Cho Combo ── */}
      {comboScheduleModalOpen && activeCombo && (
        <div className="fixed inset-0 bg-black-olive/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-warm-cream border border-forest-ink/15 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-fade-in text-left">
            <button
              onClick={() => {
                setComboScheduleModalOpen(false);
                setActiveCombo(null);
                setBookingError("");
              }}
              className="absolute top-4 right-4 text-black-olive/40 hover:text-black-olive/80 transition-colors cursor-pointer bg-transparent border-none"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="bg-forest-ink text-warm-cream text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              {activeCombo.badge}
            </span>
            <h3 className="font-serif text-xl font-bold text-forest-ink mt-3 uppercase tracking-wide">
              Đặt Lộ Trình: {activeCombo.name}
            </h3>
            <p className="text-black-olive/70 text-xs mt-1.5 font-light leading-relaxed">
              Vui lòng chọn thời gian bắt đầu của lộ trình. Hệ thống sẽ tự động xếp lịch nối tiếp cho cả {activeCombo.services.length} dịch vụ trong combo.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const isPkg = formData.get("isPkg") === "true";
                const roomBookingId = formData.get("roomBookingId");
                const startDateVal = formData.get("startDate");
                const startTimeVal = formData.get("startTime");
                const comboGuestsCountVal = Number(formData.get("comboGuestsCount") || 1);

                await handleApplyCombo({
                  startDateVal,
                  startTimeVal,
                  isPkgVal: isPkg,
                  roomBookingIdVal: roomBookingId,
                  comboGuestsCountVal
                });
              }}
              className="mt-6 space-y-4 text-xs"
            >
              {/* Select Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-forest-ink uppercase tracking-wider">
                    Ngày khởi hành:
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    className="w-full px-3 py-2 rounded-lg border border-sage-mist bg-white text-xs focus:outline-none focus:border-forest-ink"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-forest-ink uppercase tracking-wider">
                    Giờ khởi hành:
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    className="w-full px-3 py-2 rounded-lg border border-sage-mist bg-white text-xs focus:outline-none focus:border-forest-ink"
                    required
                  />
                </div>
              </div>

              {/* Select Number of Guests */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-forest-ink uppercase tracking-wider">
                  Số lượng khách hàng:
                </label>
                <select
                  name="comboGuestsCount"
                  className="w-full px-3 py-2 rounded-lg border border-sage-mist bg-white text-xs focus:outline-none focus:border-forest-ink"
                >
                  <option value="1">1 khách (Chỉ riêng bạn)</option>
                  <option value="2">2 khách (Bạn & 1 người đi cùng)</option>
                  <option value="3">3 khách (Đi nhóm 3 người)</option>
                  <option value="4">4 khách (Đi nhóm 4 người)</option>
                  <option value="5">5 khách (Đi nhóm 5 người)</option>
                </select>
              </div>

              {/* Registration Mode */}
              <div className="space-y-2 pt-2 border-t border-sage-mist/20">
                <label className="block text-[10px] font-bold text-forest-ink uppercase tracking-wider">
                  Hình thức đăng ký:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-3 bg-white border border-sage-mist/60 rounded-lg cursor-pointer hover:border-forest-ink/30">
                    <input
                      type="radio"
                      name="isPkg"
                      value="true"
                      defaultChecked
                      onChange={() => {
                        const selectEl = document.getElementById("combo-room-select-container");
                        if (selectEl) selectEl.style.display = "block";
                      }}
                      className="text-forest-ink focus:ring-forest-ink"
                    />
                    <span className="font-semibold text-black-olive">Theo gói nghỉ dưỡng</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 bg-white border border-sage-mist/60 rounded-lg cursor-pointer hover:border-forest-ink/30">
                    <input
                      type="radio"
                      name="isPkg"
                      value="false"
                      onChange={() => {
                        const selectEl = document.getElementById("combo-room-select-container");
                        if (selectEl) selectEl.style.display = "none";
                      }}
                      className="text-forest-ink focus:ring-forest-ink"
                    />
                    <span className="font-semibold text-black-olive">Đặt ngoài gói (Tính phí)</span>
                  </label>
                </div>
              </div>

              {/* Room Booking Select */}
              <div id="combo-room-select-container" className="space-y-1.5 p-3.5 bg-sage-mist/20 rounded-lg border border-sage-mist/30">
                <label className="block text-[9px] font-bold text-black-olive/60 uppercase">
                  Liên kết mã đặt phòng để miễn phí:
                </label>
                {userBookings.length === 0 ? (
                  <p className="text-red-700 font-medium">Bạn hiện không có phòng đặt đang hoạt động có đi kèm gói trị liệu. Vui lòng chọn đặt ngoài gói.</p>
                ) : (
                  <select
                    name="roomBookingId"
                    className="w-full px-3 py-2 rounded-md border border-sage-mist bg-white text-xs focus:outline-none focus:border-forest-ink"
                  >
                    <option value="">-- Chọn đơn đặt phòng --</option>
                    {userBookings.map(b => (
                      <option key={b.bookingId} value={b.bookingId}>
                        BK-{String(b.bookingId).padStart(4, '0')} ({b.packageName || "Tiêu chuẩn"})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Errors in modal */}
              {bookingError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isComboScheduling}
                className="w-full bg-forest-ink hover:bg-forest-ink/90 text-warm-cream py-3 rounded-lg uppercase tracking-wider font-semibold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isComboScheduling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-warm-cream" />
                    <span>Đang lên lộ trình & khớp nối chuyên gia...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Xác nhận lên lịch lộ trình</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Back-to-Top Floating Circle Button ── */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-10 h-10 rounded-[40px] bg-forest-ink hover:bg-forest-ink/90 text-warm-cream flex items-center justify-center transition-all duration-300 z-50 cursor-pointer border-none shadow-none"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
