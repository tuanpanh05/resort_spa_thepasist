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

// Import sub-components
import OperationLayout from "../layouts/OperationLayout";
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
  const [selectedPatientName, setSelectedPatientName] = useState("Lê Hoàng Nam");
  const [yogaStudents, setYogaStudents] = useState(initialAttendance);

  const [physioSchedules] = useState(initialPhysioAppointments);
  const [physioRecords, setPhysioRecords] = useState(initialPatientRecords);
  const [physioInventory, setPhysioInventory] = useState(initialPhysioEquipment);

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setActiveTab("overview");
  };

  const sidebarItems = activeRole === "spa" ? [
    { id: "overview", label: "1. Sơ đồ phòng & KPIs", icon: BarChart2 },
    { id: "appointments", label: "2. Lịch hẹn trị liệu", icon: Calendar },
    { id: "inventory", label: "3. Kho dầu & Thảo dược", icon: Package },
  ] : activeRole === "yoga" ? [
    { id: "overview", label: "1. Lịch lớp Yoga ngày", icon: Calendar },
    { id: "attendance", label: "2. Điểm danh học viên", icon: Users },
    { id: "equipment", label: "3. Quản lý thảm & dụng cụ", icon: Package },
  ] : [
    { id: "overview", label: "1. Lịch hẹn bệnh nhân", icon: Calendar },
    { id: "appointments", label: "2. Hồ sơ y tế & VLTL", icon: Heart },
    { id: "inventory", label: "3. Vật tư y tế dự phòng", icon: Package },
  ];

  const customSidebarHeader = (
    <div>
      <div className="bg-[#071f1b] border border-[#14443c] p-2 mb-3 rounded">
        <span className="text-[10px] text-amber-300 font-bold block mb-1">
          CHẾ ĐỘ CHUYÊN GIA
        </span>
        <span className="text-[10px] text-teal-300 font-light block leading-normal">
          Click để thay đổi phân quyền
        </span>
      </div>
      <div className="space-y-1">
      {[
        { id: "spa", label: "Spa & Trị Liệu Đá Nóng", icon: Flower },
        { id: "yoga", label: "HLV Yoga & Thiền Định", icon: Heart },
        { id: "physio", label: "Vật Lý Trị Liệu", icon: Activity },
      ].map((role) => {
        const Icon = role.icon;
        const isSelected = activeRole === role.id;
        return (
          <button
            key={role.id}
            onClick={() => handleRoleChange(role.id)}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-bold transition-all text-left cursor-pointer ${
              isSelected
                ? "bg-primary-800 text-white font-extrabold"
                : "text-primary-100/70 hover:bg-primary-900 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span>{role.label}</span>
          </button>
        );
      })}
      </div>
    </div>
  );
  return (
    <OperationLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      handleLogout={() => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống chuyên gia?")) {
          localStorage.removeItem("specialistRole");
          sessionStorage.removeItem("specialistRole");
          window.location.href = "/dang-nhap";
        }
      }}
      sidebarItems={sidebarItems}
      isMobileMenuOpen={isMobileMenuOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
      userRoleLabel={
        activeRole === "spa" ? "Nhân viên Spa" :
        activeRole === "yoga" ? "HLV Yoga & Thiền" : "Chuyên viên VLTL"
      }
      headerTitle={
        activeRole === "spa" ? "Quản Lý Bộ Phận Spa & Massage Trị Liệu" :
        activeRole === "yoga" ? "Hệ Thống Lớp Học Yoga & Thiền Định" :
        "Trung Tâm Vật Lý Trị Liệu Ngũ Sơn"
      }
      customSidebarHeader={customSidebarHeader}
      customHeaderRight={
        <div className="flex items-center space-x-3">
          <span className="bg-[#fef3c7] border border-[#fde68a] px-3 py-1 text-[10px] font-bold text-[#b45309] uppercase tracking-wider flex items-center space-x-1">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            <span>Đang trực chuyên môn</span>
          </span>
        </div>
      }
    >
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
        <ManageAppointments
          spaAppointments={spaAppointments}
          setSpaAppointments={setSpaAppointments}
        />
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
    </OperationLayout>
  );
}
