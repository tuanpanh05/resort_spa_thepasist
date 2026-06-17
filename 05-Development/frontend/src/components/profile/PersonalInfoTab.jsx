import React, { useState, useEffect } from "react";
import { User, Phone, CreditCard, Save, Lock, Eye, EyeOff, CheckCircle2, AlertTriangle } from "lucide-react";
import { userApi } from "../../services/api";

const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = "text", readOnly = false }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-sage-700 uppercase tracking-wider block">{label}</label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 pl-1 flex items-center text-sage-400 pointer-events-none">
        <Icon className="h-4 w-4" />
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full pl-8 pr-4 py-2.5 border-b ${
          readOnly
            ? "border-sage-200 text-sage-400 bg-transparent cursor-not-allowed"
            : "border-primary-200 focus:border-primary-800 bg-transparent"
        } text-sm text-sage-900 placeholder-sage-400 outline-none transition-all`}
      />
    </div>
  </div>
);

const PwdInput = ({ label, value, onChange, show, onToggle }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-sage-700 uppercase tracking-wider block">{label}</label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 pl-1 flex items-center text-sage-400 pointer-events-none">
        <Lock className="h-4 w-4" />
      </span>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-8 pr-8 py-2.5 border-b border-primary-200 bg-transparent focus:border-primary-800 text-sm text-sage-900 outline-none transition-all"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute inset-y-0 right-0 pr-1 flex items-center text-sage-400 hover:text-sage-700 transition-colors"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  </div>
);

export default function PersonalInfoTab({ profile, onProfileUpdate }) {
  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [idPassport, setIdPassport] = useState(profile?.idPassport || "");
  const [saving, setSaving] = useState(false);
  const [infoMsg, setInfoMsg] = useState({ type: "", text: "" });

  // Change password sub-state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ type: "", text: "" });
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setPhone(profile.phone || "");
      setIdPassport(profile.idPassport || "");
    }
  }, [profile]);

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setInfoMsg({ type: "", text: "" });
    if (!fullName.trim()) {
      setInfoMsg({ type: "error", text: "Họ tên không được để trống." });
      return;
    }
    setSaving(true);
    try {
      const updated = await userApi.updateProfile({ fullName, phone, idPassport });
      onProfileUpdate(updated);
      // sync localStorage/sessionStorage name for Header
      localStorage.setItem("userFullName", updated.fullName || fullName);
      sessionStorage.setItem("userFullName", updated.fullName || fullName);
      setInfoMsg({ type: "success", text: "Thông tin đã được cập nhật thành công!" });
    } catch (err) {
      setInfoMsg({ type: "error", text: err.message || "Không thể lưu thông tin. Vui lòng thử lại." });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: "", text: "" });
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: "error", text: "Mật khẩu mới và xác nhận không khớp." });
      return;
    }
    if (newPwd.length < 6) {
      setPwdMsg({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự." });
      return;
    }
    setPwdSaving(true);
    try {
      await userApi.changePassword(currentPwd, newPwd);
      setPwdMsg({ type: "success", text: "Mật khẩu đã được thay đổi thành công!" });
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err) {
      setPwdMsg({
        type: "error",
        text: err.message || "Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại.",
      });
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Personal info form */}
      <div className="bg-white rounded-md p-2 pb-8 border-b border-primary-100">
        <h3 className="text-sm font-bold text-sage-900 uppercase tracking-wider mb-5 flex items-center gap-2">
          <User className="h-4 w-4 text-primary-700" />
          Thông Tin Cá Nhân
        </h3>

        {infoMsg.text && (
          <div
            className={`mb-5 p-3.5 rounded-md text-sm border flex items-start gap-2 ${
              infoMsg.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {infoMsg.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            )}
            <span>{infoMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveInfo} className="space-y-4">
          <InputField label="Email (không thể thay đổi)" icon={User} value={profile?.email || ""} readOnly />
          <InputField label="Họ và Tên" icon={User} value={fullName} onChange={setFullName} placeholder="Nguyễn Văn A" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Số Điện Thoại" icon={Phone} value={phone} onChange={setPhone} placeholder="0901234567" />
            <InputField label="CCCD / Hộ chiếu" icon={CreditCard} value={idPassport} onChange={setIdPassport} placeholder="Nhập số CCCD..." />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 rounded-md text-sm font-semibold bg-primary-900 hover:bg-primary-800 text-white shadow transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
            </button>
          </div>
        </form>
      </div>

      {/* Change password form */}
      <div className="bg-white rounded-md p-2 pt-6">
        <h3 className="text-sm font-bold text-sage-900 uppercase tracking-wider mb-5 flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary-700" />
          Đổi Mật Khẩu
        </h3>

        {pwdMsg.text && (
          <div
            className={`mb-5 p-3.5 rounded-md text-sm border flex items-start gap-2 ${
              pwdMsg.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {pwdMsg.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            )}
            <span>{pwdMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <PwdInput
            label="Mật Khẩu Hiện Tại"
            value={currentPwd}
            onChange={setCurrentPwd}
            show={showCurrent}
            onToggle={() => setShowCurrent(!showCurrent)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PwdInput
              label="Mật Khẩu Mới"
              value={newPwd}
              onChange={setNewPwd}
              show={showNew}
              onToggle={() => setShowNew(!showNew)}
            />
            <PwdInput
              label="Xác Nhận Mật Khẩu Mới"
              value={confirmPwd}
              onChange={setConfirmPwd}
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={pwdSaving}
              className="w-full sm:w-auto px-6 py-2.5 rounded-md text-sm font-semibold bg-sage-800 hover:bg-sage-700 text-white shadow transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {pwdSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {pwdSaving ? "Đang cập nhật..." : "Cập Nhật Mật Khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
