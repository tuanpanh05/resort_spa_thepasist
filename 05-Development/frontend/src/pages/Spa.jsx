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
import SpaBookingWizard from "../components/booking/SpaBookingWizard";

// ─── Bộ lọc danh mục ────────────────────────────────────────────────────────
const categoryFilters = [
  { label: "Tất cả các gói", value: "", icon: Sparkles },
  { label: "Gói Spa đặc trưng",  value: "SPA",         icon: Flame    },
  { label: "Gói Yoga phục hồi", value: "YOGA",      icon: Heart     },
  { label: "Gói Trị liệu chuyên sâu",  value: "THERAPY",   icon: Activity },
  { label: "Dịch vụ trẻ em",  value: "KID",   icon: Smile },
];

// ─── Nhãn tiếng Việt cho healthGoal ─────────────────────────────────────────
const healthGoalLabel = {
  SPA:         "Gói Spa & Thư giãn",
  YOGA:        "Gói Yoga phục hồi",
  THERAPY:     "Gói Trị liệu chuyên môn",
  KID:         "Dịch vụ trẻ em",
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

    // Gọi API lọc các gói từ Backend
    masterDataApi.filterRetreatPackages(filters)
      .then((data) => {
        setPackages(data || []);
        setError(null);
      })
      .catch((err) => {
        console.warn("Không thể lọc từ backend, chuyển sang lọc dữ liệu tĩnh trên client:", err);
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
        masterDataApi.getRetreatPackages().catch(() => []),
      ])
        .then(([profile, bookings, services, medProfile, packagesData]) => {
          setCurrentUser(profile);
          // Only show confirmed room bookings
          const confirmedBookings = (bookings || []).filter(
            b => b.status === "CONFIRMED" || b.status === "CHECK_IN" || b.status === "COMPLETED"
          );
          setUserBookings(confirmedBookings);
          setSpaServices(services || []);
          setMedicalProfile(medProfile);
          setHealthConsentCheck(medProfile?.explicitConsentSigned || false);
          setAllPackages(packagesData || []);
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
                    const kidPackages = packages.filter(p => p.healthGoal === "KID");
                    const otherPackages = packages.filter(p => p.healthGoal !== "SPA" && p.healthGoal !== "YOGA" && p.healthGoal !== "THERAPY" && p.healthGoal !== "KID");

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

                        {renderPackageSection(
                          "Dịch Vụ & Trị Liệu Trẻ Em",
                          "Bao gồm khu vui chơi giải trí, công viên nước và các liệu trình ngâm tắm thảo dược Dao Đỏ, massage tinh dầu tràm kháng khuẩn giúp trẻ thư giãn, nâng cao thể trạng.",
                          kidPackages,
                          Smile
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
            ) : (
              <SpaBookingWizard
                spaServices={spaServices}
                userBookings={userBookings}
                allPackages={allPackages}
                medicalProfile={medicalProfile}
                currentUser={currentUser}
              />
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
