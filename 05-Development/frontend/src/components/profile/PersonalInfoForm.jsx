import React, { useState, useEffect } from "react";
import { User, Phone, CreditCard, Save, Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, Calendar, RefreshCw } from "lucide-react";
import { userApi } from "../../api";
import { useLanguage } from "../../context/LanguageContext";

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
        className={`w-full pl-8 pr-4 py-2.5 border-b ${readOnly ? "border-sage-200 text-sage-400 bg-transparent cursor-not-allowed" : "border-primary-200 focus:border-primary-800 bg-transparent"} text-sm text-sage-900 placeholder-sage-400 outline-none transition-all`}
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
      <button type="button" onClick={onToggle}
        className="absolute inset-y-0 right-0 pr-1 flex items-center text-sage-400 hover:text-sage-700 transition-colors">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  </div>
);

export default function PersonalInfoForm({ profile, onProfileUpdate }) {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [phone, setPhone]       = useState(profile?.phone || "");
  const [idPassport, setIdPassport] = useState(profile?.idPassport || "");
  const [saving, setSaving]     = useState(false);
  const [infoMsg, setInfoMsg]   = useState({ type: "", text: "" });

  // Calendar states
  const [googleCalendarSyncEnabled, setGoogleCalendarSyncEnabled] = useState(false);
  const [googleCalendarId, setGoogleCalendarId] = useState("");
  const [calendarRemindersEnabled, setCalendarRemindersEnabled] = useState(true);
  const [reminderLeadTimeMins, setReminderLeadTimeMins] = useState(30);
  const [syncing, setSyncing] = useState(false);

  // Change password sub-state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd]         = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdMsg, setPwdMsg]           = useState({ type: "", text: "" });
  const [pwdSaving, setPwdSaving]     = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setPhone(profile.phone || "");
      setIdPassport(profile.idPassport || "");
      setGoogleCalendarSyncEnabled(!!profile.googleCalendarSyncEnabled);
      setGoogleCalendarId(profile.googleCalendarId || "");
      setCalendarRemindersEnabled(profile.calendarRemindersEnabled !== false);
      setReminderLeadTimeMins(profile.reminderLeadTimeMins || 30);
    }
  }, [profile]);

  const handleSaveInfo = async (e) => {
    if (e) e.preventDefault();
    setInfoMsg({ type: "", text: "" });
    if (!fullName.trim()) {
      setInfoMsg({ type: "error", text: t("profile.infoErrorEmptyName") });
      return;
    }
    setSaving(true);
    try {
      const updated = await userApi.updateProfile({ 
        fullName, 
        phone, 
        idPassport,
        googleCalendarSyncEnabled,
        googleCalendarId,
        calendarRemindersEnabled,
        reminderLeadTimeMins: Number(reminderLeadTimeMins)
      });
      onProfileUpdate(updated);
      localStorage.setItem("userFullName", updated.fullName || fullName);
      sessionStorage.setItem("userFullName", updated.fullName || fullName);
      setInfoMsg({ type: "success", text: t("profile.infoSuccess") });
    } catch (err) {
      setInfoMsg({ type: "error", text: err.message || t("profile.infoErrorFallback") });
    } finally {
      setSaving(false);
    }
  };

  const handleManualSync = async () => {
    setInfoMsg({ type: "", text: "" });
    if (!googleCalendarSyncEnabled) {
      setInfoMsg({ type: "error", text: "Vui lòng kích hoạt và lưu cấu hình Đồng bộ Google Calendar trước khi đồng bộ." });
      return;
    }
    setSyncing(true);
    try {
      const res = await userApi.syncCalendar();
      setInfoMsg({ type: "success", text: res.message || "Đồng bộ hóa lịch trình lên Google Calendar thành công!" });
    } catch (err) {
      setInfoMsg({ type: "error", text: err.message || "Không thể đồng bộ lịch trình. Vui lòng thử lại." });
    } finally {
      setSyncing(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: "", text: "" });
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: "error", text: t("profile.pwdErrorMismatch") });
      return;
    }
    if (newPwd.length < 8) {
      setPwdMsg({ type: "error", text: t("profile.pwdErrorLength") });
      return;
    }
    setPwdSaving(true);
    try {
      await userApi.changePassword(currentPwd, newPwd);
      setPwdMsg({ type: "success", text: t("profile.pwdSuccess") });
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (err) {
      setPwdMsg({ type: "error", text: err.message || t("profile.pwdErrorFallback") });
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Personal info form */}
      <div className="bg-white rounded-md p-2 pb-8 border-b border-primary-100 text-left">
        <h3 className="text-sm font-bold text-sage-900 uppercase tracking-wider mb-5 flex items-center gap-2">
          <User className="h-4 w-4 text-primary-700" />
          {t("profile.personalInfoTitle")}
        </h3>

        {infoMsg.text && (
          <div className={`mb-5 p-3.5 rounded-md text-sm border flex items-start gap-2 ${infoMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
            {infoMsg.type === "success" ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />}
            <span>{infoMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveInfo} className="space-y-4">
          <InputField label={t("profile.emailReadOnly")} icon={User} value={profile?.email || ""} readOnly />
          <InputField label={t("profile.fullName")} icon={User} value={fullName} onChange={setFullName} placeholder="Nguyễn Văn A" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label={t("profile.phoneLabel")} icon={Phone} value={phone} onChange={setPhone} placeholder="0901234567" />
            <InputField label={t("profile.idPassport")} icon={CreditCard} value={idPassport} onChange={setIdPassport} placeholder={t("profile.idPassportPlaceholder")} />
          </div>
          <div className="pt-2">
            <button type="submit" disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 rounded-md text-sm font-semibold bg-primary-900 hover:bg-primary-800 text-white shadow transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? t("profile.saving") : t("profile.saveChanges")}
            </button>
          </div>
        </form>
      </div>

      {/* Google Calendar Sync Settings */}
      <div className="bg-white rounded-md p-2 pb-8 border-b border-primary-100 text-left">
        <h3 className="text-sm font-bold text-sage-900 uppercase tracking-wider mb-5 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary-700" />
          Cấu Hình Google Calendar & Nhắc Lịch
        </h3>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-3.5 bg-primary-50/50 border border-primary-100 rounded-md">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-sage-900 uppercase tracking-wider block">Kích hoạt đồng bộ hóa</label>
              <span className="text-[11px] text-sage-500 font-light">Tự động đẩy phòng và lịch spa đã đặt lên Google Calendar của bạn.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={googleCalendarSyncEnabled}
                onChange={(e) => setGoogleCalendarSyncEnabled(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-sage-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-sage-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-900"></div>
            </label>
          </div>

          {googleCalendarSyncEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-sage-100 p-4 bg-white rounded-md shadow-xs animate-fade-in">
              <InputField 
                label="Địa chỉ Google Calendar ID" 
                icon={Calendar} 
                value={googleCalendarId} 
                onChange={setGoogleCalendarId} 
                placeholder="emailcuaban@gmail.com" 
              />

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-sage-700 uppercase tracking-wider block">Thời gian nhắc nhở</label>
                <div className="relative">
                  <select
                    value={reminderLeadTimeMins}
                    onChange={(e) => setReminderLeadTimeMins(Number(e.target.value))}
                    className="w-full py-2.5 border-b border-primary-200 bg-transparent focus:border-primary-800 text-sm text-sage-900 outline-none transition-all cursor-pointer"
                  >
                    <option value="15">15 phút trước khi bắt đầu</option>
                    <option value="30">30 phút trước khi bắt đầu</option>
                    <option value="60">1 tiếng trước khi bắt đầu</option>
                    <option value="120">2 tiếng trước khi bắt đầu</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between col-span-1 sm:col-span-2 pt-2 border-t border-sage-50">
                <div className="space-y-0.5">
                  <label className="text-xs font-bold text-sage-900 uppercase tracking-wider block">Bật nhắc nhở thông báo</label>
                  <span className="text-[11px] text-sage-500 font-light">Gửi cảnh báo và email nhắc lịch trước giờ bắt đầu.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={calendarRemindersEnabled}
                    onChange={(e) => setCalendarRemindersEnabled(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-sage-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-sage-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-900"></div>
                </label>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button 
              type="button"
              onClick={handleSaveInfo}
              disabled={saving}
              className="px-6 py-2.5 rounded-md text-sm font-semibold bg-primary-900 hover:bg-primary-800 text-white shadow transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
              Lưu Cấu Hình Lịch
            </button>

            {googleCalendarSyncEnabled && (
              <button 
                type="button"
                onClick={handleManualSync}
                disabled={syncing}
                className="px-6 py-2.5 rounded-md text-sm font-semibold bg-sage-800 hover:bg-sage-700 text-white shadow transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border border-sage-200"
              >
                {syncing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Đồng bộ ngay
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Change password form */}
      <div className="bg-white rounded-md p-2 pt-6 text-left">
        <h3 className="text-sm font-bold text-sage-900 uppercase tracking-wider mb-5 flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary-700" />
          {t("profile.changePasswordTitle")}
        </h3>

        {pwdMsg.text && (
          <div className={`mb-5 p-3.5 rounded-md text-sm border flex items-start gap-2 ${pwdMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
            {pwdMsg.type === "success" ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />}
            <span>{pwdMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <PwdInput label={t("profile.currentPassword")} value={currentPwd} onChange={setCurrentPwd} show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PwdInput label={t("profile.newPassword")} value={newPwd} onChange={setNewPwd} show={showNew} onToggle={() => setShowNew(!showNew)} />
            <PwdInput label={t("profile.confirmPassword")} value={confirmPwd} onChange={setConfirmPwd} show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
          </div>
          <div className="pt-2">
            <button type="submit" disabled={pwdSaving}
              className="w-full sm:w-auto px-6 py-2.5 rounded-md text-sm font-semibold bg-sage-800 hover:bg-sage-700 text-white shadow transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
              {pwdSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock className="h-4 w-4" />}
              {pwdSaving ? t("profile.updatingPassword") : t("profile.updatePassword")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
