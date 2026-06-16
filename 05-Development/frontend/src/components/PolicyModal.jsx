import React, { useEffect } from "react";
import { X, Shield, FileText, Lock, Leaf, ChevronRight } from "lucide-react";

// ─── CHÍNH SÁCH BẢO MẬT ───────────────────────────────────────────────────────
const PRIVACY_SECTIONS = [
  {
    icon: "🛡️",
    title: "1. Thông tin chúng tôi thu thập",
    content: [
      "Họ và tên đầy đủ, địa chỉ email, số điện thoại liên hệ.",
      "Số CMND / Hộ chiếu (được mã hóa AES-256 theo Nghị định 356/2025/NĐ-CP và Luật Cư trú 2020).",
      "Thông tin sức khỏe và hồ sơ y tế (được mã hóa và chỉ lưu có thời hạn trong kỳ nghỉ dưỡng).",
      "Thông tin đặt phòng, lịch sử giao dịch và phản hồi dịch vụ.",
    ],
  },
  {
    icon: "🔐",
    title: "2. Mục đích sử dụng thông tin",
    content: [
      "Xác minh danh tính hội viên và quản lý tài khoản.",
      "Lập báo cáo lưu trú trình công an theo quy định pháp luật Việt Nam.",
      "Cá nhân hóa trải nghiệm nghỉ dưỡng: thực đơn dinh dưỡng, liệu pháp spa phù hợp.",
      "Gửi thông báo đặt phòng, nhắc lịch liệu trình qua email / SMS.",
      "Phân tích vận hành và cải thiện chất lượng dịch vụ resort.",
    ],
  },
  {
    icon: "🔒",
    title: "3. Bảo mật dữ liệu",
    content: [
      "Mật khẩu được lưu trữ dưới dạng mã băm một chiều (BCrypt) — không ai có thể đọc mật khẩu của bạn.",
      "Dữ liệu sức khỏe và CMND/Hộ chiếu được mã hóa AES-256 (tại chỗ) trước khi lưu vào cơ sở dữ liệu.",
      "Hệ thống áp dụng phân quyền nghiêm ngặt (RBAC): Chuyên viên spa chỉ thấy ghi chú thể chất; Đầu bếp chỉ thấy thông tin dị ứng thực phẩm; Lễ tân không thấy dữ liệu y tế.",
      "Mọi kết nối dữ liệu đều được bảo vệ bằng HTTPS/SSL.",
    ],
  },
  {
    icon: "🗑️",
    title: "4. Quyền xóa dữ liệu",
    content: [
      "Sau khi kỳ nghỉ dưỡng kết thúc, toàn bộ hồ sơ sức khỏe và dị ứng thực phẩm sẽ được xóa vĩnh viễn khỏi hệ thống theo quy trình tự động.",
      "Hội viên có quyền yêu cầu xóa thông tin cá nhân nhạy cảm bất kỳ lúc nào qua trang Quản lý Hồ sơ.",
      "Yêu cầu xóa sẽ được xử lý trong vòng 7 ngày làm việc.",
    ],
  },
  {
    icon: "🤝",
    title: "5. Chia sẻ thông tin với bên thứ ba",
    content: [
      "Ngũ Sơn Resort không bán thông tin cá nhân cho bất kỳ bên thứ ba nào.",
      "Thông tin chỉ được chia sẻ với cơ quan công an theo quy định pháp luật (báo cáo lưu trú).",
      "Cổng thanh toán VNPay nhận dữ liệu giao dịch tối thiểu cần thiết, không bao gồm thông tin y tế.",
    ],
  },
  {
    icon: "📞",
    title: "6. Liên hệ",
    content: [
      "Email bảo mật: privacy@ngusonresort.vn",
      "Điện thoại: 1900 xxxx (Thứ 2 – Thứ 7, 8:00 – 17:00)",
      "Địa chỉ: Khu nghỉ dưỡng Ngũ Sơn, Ninh Bình, Việt Nam",
    ],
  },
];

// ─── ĐIỀU KHOẢN HỘI VIÊN ─────────────────────────────────────────────────────
const TERMS_SECTIONS = [
  {
    icon: "🌿",
    title: "1. Điều kiện đăng ký hội viên",
    content: [
      "Hội viên phải từ 18 tuổi trở lên và cung cấp thông tin chính xác, đầy đủ khi đăng ký.",
      "Mỗi cá nhân chỉ được đăng ký một tài khoản hội viên.",
      "Tài khoản hội viên là cá nhân, không được chuyển nhượng cho người khác.",
      "Hội viên phải cập nhật thông tin nếu có thay đổi (số điện thoại, email) để nhận thông báo kịp thời.",
    ],
  },
  {
    icon: "🏨",
    title: "2. Quyền lợi hội viên",
    content: [
      "Đặt phòng, gói nghỉ dưỡng và dịch vụ spa trực tuyến 24/7.",
      "Nhận ưu đãi hội viên và mã khuyến mãi độc quyền.",
      "Lưu lịch sử đặt phòng và hành trình nghỉ dưỡng.",
      "Quản lý hồ sơ sức khỏe cá nhân để nhận trải nghiệm được cá nhân hóa.",
      "Đặt trước các buổi liệu trình spa và yoga với chuyên viên yêu thích.",
      "Nhận nhắc lịch tự động qua email trước 1 giờ mỗi buổi liệu trình.",
    ],
  },
  {
    icon: "📋",
    title: "3. Chính sách đặt phòng",
    content: [
      "Xác nhận đặt phòng yêu cầu thanh toán đặt cọc trực tuyến qua VNPay.",
      "Thay đổi hoặc hủy đặt phòng phải thực hiện trước 48 giờ so với giờ check-in.",
      "Hủy trong vòng 48 giờ trước check-in có thể bị trừ phí hủy theo chính sách từng gói dịch vụ.",
      "Resort có quyền từ chối hoặc hủy đặt phòng trong trường hợp thông tin hội viên không hợp lệ.",
    ],
  },
  {
    icon: "🧘",
    title: "4. Quy định sử dụng dịch vụ spa & yoga",
    content: [
      "Hội viên cần khai báo tình trạng sức khỏe trước khi sử dụng liệu trình spa và yoga.",
      "Không sử dụng rượu bia trước khi tham gia liệu trình.",
      "Trẻ em dưới 16 tuổi phải có người giám hộ khi sử dụng spa.",
      "Hội viên có trách nhiệm thông báo về các dị ứng hoặc bệnh lý đặc biệt để được phục vụ an toàn.",
    ],
  },
  {
    icon: "🍃",
    title: "5. Quy định hành vi & ứng xử",
    content: [
      "Hội viên cam kết giữ gìn môi trường yên tĩnh, thư giãn của khu nghỉ dưỡng.",
      "Nghiêm cấm các hành vi gây ồn ào, quấy rối hoặc ảnh hưởng đến trải nghiệm của các khách khác.",
      "Phản hồi và đánh giá của hội viên phải trung thực, không mang tính xúc phạm cá nhân.",
      "Resort có quyền khóa tài khoản hội viên vi phạm quy tắc ứng xử.",
    ],
  },
  {
    icon: "⚖️",
    title: "6. Giới hạn trách nhiệm",
    content: [
      "Resort không chịu trách nhiệm đối với tài sản cá nhân bị thất lạc hoặc hư hỏng trong khuôn viên.",
      "Hội viên tự chịu trách nhiệm về tình trạng sức khỏe khi tham gia các hoạt động thể chất.",
      "Resort bảo lưu quyền điều chỉnh dịch vụ trong trường hợp bất khả kháng (thiên tai, sự kiện bất thường).",
    ],
  },
];

export default function PolicyModal({ type, onClose }) {
  const isPrivacy = type === "privacy";

  // Đóng modal khi nhấn ESC
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    // Ngăn cuộn trang nền
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const sections = isPrivacy ? PRIVACY_SECTIONS : TERMS_SECTIONS;
  const title = isPrivacy ? "Chính Sách Bảo Mật" : "Điều Khoản Hội Viên";
  const subtitle = isPrivacy
    ? "Ngũ Sơn Resort cam kết bảo vệ tuyệt đối quyền riêng tư và dữ liệu của hội viên."
    : "Điều khoản quy định quyền lợi và trách nhiệm của hội viên Ngũ Sơn Resort.";

  return (
    <div
      className="policy-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-modal-title"
    >
      <div className="policy-modal-container">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="policy-modal-header">
          <div className="policy-modal-header-icon">
            {isPrivacy ? (
              <Shield className="policy-header-svg" />
            ) : (
              <FileText className="policy-header-svg" />
            )}
          </div>
          <div className="policy-modal-header-text">
            <h2 id="policy-modal-title" className="policy-modal-title">
              {title}
            </h2>
            <p className="policy-modal-subtitle">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="policy-modal-close"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Badge cập nhật ─────────────────────────────────── */}
        <div className="policy-modal-meta">
          <span className="policy-meta-badge">
            <Lock size={12} />
            Tuân thủ Nghị định 356/2025/NĐ-CP
          </span>
          <span className="policy-meta-date">Cập nhật: Tháng 6 năm 2026</span>
        </div>

        {/* ── Nội dung ───────────────────────────────────────── */}
        <div className="policy-modal-body">
          {sections.map((section, idx) => (
            <div key={idx} className="policy-section">
              <div className="policy-section-header">
                <span className="policy-section-icon">{section.icon}</span>
                <h3 className="policy-section-title">{section.title}</h3>
              </div>
              <ul className="policy-section-list">
                {section.content.map((item, i) => (
                  <li key={i} className="policy-section-item">
                    <ChevronRight size={14} className="policy-item-arrow" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="policy-modal-footer">
          <div className="policy-footer-brand">
            <Leaf size={16} />
            <span>Ngũ Sơn Resort &amp; Spa</span>
          </div>
          <button onClick={onClose} className="policy-footer-close-btn">
            Tôi đã đọc và hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
