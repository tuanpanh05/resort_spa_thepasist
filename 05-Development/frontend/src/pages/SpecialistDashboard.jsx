import { useState } from "react";
import {
  Flower,
  Heart,
  Calendar,
  Users,
  Package,
  Clock,
  ShieldCheck,
  X,
  Check,
  LogOut,
  Activity,
  Clipboard,
  Sliders,
  BarChart2,
  Sparkles,
} from "lucide-react";

import {
  specialistInitialSpaAppointments as initialSpaAppointments,
  specialistInitialSpaRooms as initialSpaRooms,
  specialistInitialSpaInventory as initialSpaInventory,
  specialistInitialYogaClasses as initialYogaClasses,
  specialistInitialYogaEquipment as initialYogaEquipment,
  specialistInitialAttendance as initialAttendance,
  specialistInitialPhysioAppointments as initialPhysioAppointments,
  specialistInitialPatientRecords as initialPatientRecords,
  specialistInitialPhysioEquipment as initialPhysioEquipment,
} from "../mockData";

// Import subcomponents
import SpecialistOverview from "../components/specialist/SpecialistOverview";
import ManageAppointments from "../components/specialist/ManageAppointments";
import ManageInventory from "../components/specialist/ManageInventory";
import ManageAttendance from "../components/specialist/ManageAttendance";
import ManageEquipment from "../components/specialist/ManageEquipment";
import ManageRecords from "../components/specialist/ManageRecords";

export default function SpecialistDashboard() {
  // Active Role switcher: 'spa' | 'yoga' | 'physio'
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem("specialistRole") || sessionStorage.getItem("specialistRole") || "spa";
  });

  const isLocked = !!(localStorage.getItem("specialistRole") || sessionStorage.getItem("specialistRole"));
  const [activeTab, setActiveTab] = useState("overview");

  // Mobile navigation drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. Spa States
  const [spaAppointments, setSpaAppointments] = useState(
    initialSpaAppointments,
  );
  const [spaRooms, setSpaRooms] = useState(initialSpaRooms);
  const [spaInventory] = useState(initialSpaInventory);

  // 2. Yoga States
  const [yogaClasses] = useState(initialYogaClasses);
  const [yogaEquipment, setYogaEquipment] = useState(initialYogaEquipment);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [selectedYogaClassId, setSelectedYogaClassId] = useState("YOG-101");

  // 3. Physio States
  const [physioAppointments, setPhysioAppointments] = useState(
    initialPhysioAppointments,
  );
  const [patientRecords, setPatientRecords] = useState(initialPatientRecords);
  const [physioEquipment, setPhysioEquipment] = useState(
    initialPhysioEquipment,
  );
  const [selectedPatientName, setSelectedPatientName] =
    useState("Lê Hoàng Nam");

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setActiveTab("overview");
  };

  return (
    <div className="admin-theme min-h-screen bg-[#f7f8f6] flex flex-col lg:flex-row antialiased text-sage-950 font-sans pt-0 relative">
      {/* Mobile Header Bar */}
      <header className="lg:hidden w-full bg-[#0c2e28] text-white px-4 py-3.5 flex items-center justify-between shadow-md z-30">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-[#facc15] text-[#0c2e28] rounded-none">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-base font-bold leading-tight">
              Trị Liệu & Yoga
            </h1>
            <span className="text-[9px] text-[#facc15] font-bold uppercase tracking-wider block">
              Wellness Center Hub
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-sage-800 text-white hover:bg-sage-750 transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Sliders className="h-6 w-6" />
          )}
        </button>
      </header>

      {/* Backdrop for Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-25"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-[#0c2e28] text-white flex flex-col z-30 transition-transform duration-300 shadow-xl border-r border-[#08221d] lg:static lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Profile and Role Locked Section */}
        <div className="p-6 border-b border-[#14443c] bg-[#07211d]">
          <div className="flex items-center space-x-3 mb-5">
            <div className="h-10 w-10 bg-[#facc15] flex items-center justify-center text-sage-950 font-bold border border-[#f59e0b] shadow-inner text-sm">
              WS
            </div>
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">
                Chuyên Viên Trị Liệu
              </h4>
              <span className="text-[10px] text-[#a3b899]">
                Wellness Center Staff
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            {isLocked ? (
              <div>
                <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest mb-1.5 block">
                  Quyền Hạn Được Phân
                </p>
                <div className="bg-[#0b3831] border border-teal-500/20 p-3 flex items-center space-x-2.5 shadow-inner">
                  {activeRole === "spa" && (
                    <Flower className="h-5 w-5 text-[#facc15]" />
                  )}
                  {activeRole === "yoga" && (
                    <Heart className="h-5 w-5 text-[#facc15]" />
                  )}
                  {activeRole === "physio" && (
                    <Activity className="h-5 w-5 text-[#facc15]" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {activeRole === "spa" && "Nhân viên Spa"}
                      {activeRole === "yoga" && "HLV Yoga & Thiền"}
                      {activeRole === "physio" && "Chuyên viên VLTL"}
                    </span>
                    <span className="text-[9px] text-teal-355 font-medium block">
                      Tài khoản cố định
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-[#071f1b] border border-[#14443c] p-2 mb-3">
                  <span className="text-[8px] text-amber-300 font-bold block">
                    ⚠️ CHẾ ĐỘ DEMO
                  </span>
                  <span className="text-[8px] text-teal-300 font-light block leading-normal">
                    Thay đổi phân quyền nhanh bằng cách click các vai trò bên
                    dưới.
                  </span>
                </div>
                <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest mb-1.5 block">
                  Chọn Bộ Phận Chuyên Môn
                </p>
                {[
                  { id: "spa", label: "Spa & Trị Liệu Đá Nóng", icon: Flower },
                  { id: "yoga", label: "HLV Yoga & Thiền Định", icon: Heart },
                  {
                    id: "physio",
                    label: "Vật Lý Trị Liệu Cột Sống",
                    icon: Activity,
                  },
                ].map((role) => {
                  const Icon = role.icon;
                  const isSelected = activeRole === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleRoleChange(role.id)}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold transition-all text-left cursor-pointer ${
                        isSelected
                          ? "bg-[#facc15] text-[#0c2e28] font-extrabold"
                          : "text-teal-100 hover:bg-[#14443c]/50 hover:text-white"
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

        {/* Tab Items List */}
        <nav className="flex-grow py-6 px-3.5 space-y-1.5 overflow-y-auto">
          <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest px-3.5 mb-2 block">
            Nghiệp Vụ Bộ Phận
          </p>

          {/* SPA TABS */}
          {activeRole === "spa" &&
            [
              {
                id: "overview",
                label: "1. Sơ đồ phòng & KPIs",
                icon: BarChart2,
              },
              {
                id: "appointments",
                label: "2. Lịch hẹn trị liệu",
                icon: Calendar,
                badge: `${spaAppointments.filter((a) => a.status !== "Completed").length}`,
              },
              {
                id: "inventory",
                label: "3. Kho dầu & Thảo dược",
                icon: Package,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 text-[13px] font-semibold tracking-wide transition-all duration-150 cursor-pointer ${isActive ? "bg-[#facc15] text-[#0c2e28] shadow-md" : "text-teal-200 hover:bg-[#14443c]/50 hover:text-white"}`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </div>
                  {tab.badge && tab.badge !== "0" && (
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold flex-shrink-0 ml-1.5 ${isActive ? "bg-[#0c2e28] text-white" : "bg-teal-900/50 text-[#facc15]"}`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}

          {/* YOGA TABS */}
          {activeRole === "yoga" &&
            [
              {
                id: "overview",
                label: "1. Lịch lớp Yoga ngày",
                icon: Calendar,
              },
              { id: "attendance", label: "2. Điểm danh học viên", icon: Users },
              {
                id: "equipment",
                label: "3. Quản lý thảm & dụng cụ",
                icon: Package,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 text-[13px] font-semibold tracking-wide transition-all duration-150 cursor-pointer ${isActive ? "bg-[#facc15] text-[#0c2e28] shadow-md" : "text-teal-200 hover:bg-[#14443c]/50 hover:text-white"}`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </div>
                </button>
              );
            })}

          {/* PHYSIOTHERAPY TABS */}
          {activeRole === "physio" &&
            [
              {
                id: "overview",
                label: "1. Danh sách ca trị liệu",
                icon: Clock,
                badge: `${physioAppointments.filter((a) => a.status !== "Completed").length}`,
              },
              {
                id: "records",
                label: "2. Bệnh án & Phục hồi",
                icon: Clipboard,
              },
              {
                id: "equipment",
                label: "3. Giám sát thiết bị máy",
                icon: Sliders,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 text-[13px] font-semibold tracking-wide transition-all duration-150 cursor-pointer ${isActive ? "bg-[#facc15] text-[#0c2e28] shadow-md" : "text-teal-200 hover:bg-[#14443c]/50 hover:text-white"}`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </div>
                  {tab.badge && tab.badge !== "0" && (
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold flex-shrink-0 ml-1.5 ${isActive ? "bg-[#0c2e28] text-white" : "bg-teal-900/50 text-[#facc15]"}`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>

        {/* Exit portal button */}
        <div className="p-4 border-t border-[#14443c] bg-[#07211d]">
          <button
            onClick={() => {
              if (window.confirm("Bạn muốn quay lại trang đăng nhập?")) {
                localStorage.removeItem("specialistRole");
                sessionStorage.removeItem("specialistRole");
                window.location.href = "/dang-nhap";
              }
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-[#092622] hover:bg-red-950 text-teal-300 hover:text-red-300 text-xs font-bold transition-all cursor-pointer border border-[#14443c]"
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất hệ thống</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen">
        {/* Dynamic Section Header Title */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-sage-250/30 mb-6 gap-3">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-sage-950 leading-tight">
              {activeRole === "spa" &&
                activeTab === "overview" &&
                "Spa: Sơ đồ phòng & Hoạt động"}
              {activeRole === "spa" &&
                activeTab === "appointments" &&
                "Spa: Lịch hẹn ca trị liệu của khách"}
              {activeRole === "spa" &&
                activeTab === "inventory" &&
                "Spa: Kiểm kê tinh dầu thảo dược"}

              {activeRole === "yoga" &&
                activeTab === "overview" &&
                "Yoga: Lịch lớp học Yoga trong ngày"}
              {activeRole === "yoga" &&
                activeTab === "attendance" &&
                "Yoga: Điểm danh học viên đăng ký"}
              {activeRole === "yoga" &&
                activeTab === "equipment" &&
                "Yoga: Quản lý dụng cụ thảm tập"}

              {activeRole === "physio" &&
                activeTab === "overview" &&
                "Vật lý trị liệu: Ca trị liệu máy"}
              {activeRole === "physio" &&
                activeTab === "records" &&
                "Vật lý trị liệu: Hồ sơ bệnh án & Tiến trình"}
              {activeRole === "physio" &&
                activeTab === "equipment" &&
                "Vật lý trị liệu: Giám sát thiết bị máy móc"}
            </h2>
            <p className="text-xs text-sage-500 font-medium mt-0.5">
              Bộ phận chuyên trách:{" "}
              <strong className="text-sage-800 font-bold uppercase">
                {activeRole === "spa"
                  ? "Khu Vực Spa & Trị Liệu Đá Nóng"
                  : activeRole === "yoga"
                    ? "Học Viện Thiền Định & Yoga Ngũ Sơn"
                    : "Khoa Phục Hồi Chức Năng Cột Sống"}
              </strong>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="bg-[#fef3c7] border border-[#fde68a] px-3 py-1 text-[10px] font-bold text-[#b45309] uppercase tracking-wider flex items-center space-x-1">
              <Activity className="h-3.5 w-3.5 animate-pulse" />
              <span>Wellness Center Live</span>
            </span>
          </div>
        </header>

        {/* Tab Panel Router */}
        {activeTab === "overview" && (
          <SpecialistOverview
            activeRole={activeRole}
            setActiveTab={setActiveTab}
            setSelectedYogaClassId={setSelectedYogaClassId}
            spaAppointments={spaAppointments}
            spaRooms={spaRooms}
            setSpaRooms={setSpaRooms}
            spaInventory={spaInventory}
            yogaClasses={yogaClasses}
            physioAppointments={physioAppointments}
            setPhysioAppointments={setPhysioAppointments}
          />
        )}

        {activeRole === "spa" && activeTab === "appointments" && (
          <ManageAppointments />
        )}

        {activeRole === "spa" && activeTab === "inventory" && (
          <ManageInventory spaInventory={spaInventory} />
        )}

        {activeRole === "yoga" && activeTab === "attendance" && (
          <ManageAttendance
            yogaClasses={yogaClasses}
            attendance={attendance}
            setAttendance={setAttendance}
            selectedYogaClassId={selectedYogaClassId}
            setSelectedYogaClassId={setSelectedYogaClassId}
          />
        )}

        {activeTab === "equipment" && (
          <ManageEquipment
            activeRole={activeRole}
            yogaEquipment={yogaEquipment}
            setYogaEquipment={setYogaEquipment}
            physioEquipment={physioEquipment}
            setPhysioEquipment={setPhysioEquipment}
          />
        )}

        {activeRole === "physio" && activeTab === "records" && (
          <ManageRecords
            patientRecords={patientRecords}
            setPatientRecords={setPatientRecords}
            selectedPatientName={selectedPatientName}
            setSelectedPatientName={setSelectedPatientName}
          />
        )}
      </main>
    </div>
  );
}
