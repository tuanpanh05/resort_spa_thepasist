import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, Calendar, Clock, Users, Play, Check, CheckCircle2,
  Loader2, AlertCircle, XCircle, LogOut, LayoutGrid, CalendarDays, PlusCircle,
  Sparkles, RefreshCw, CalendarCheck, ShieldCheck, DoorOpen, FileText, HeartPulse,
} from "lucide-react";
import { specialistApi, spaApi } from "../../api";
import SpecialistCalendarTab from "../../components/specialist/SpecialistCalendarTab";

const pad = (n) => String(n).padStart(2, "0");
const toLocalDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtTime = (s) => { if (!s) return ""; const d = new Date(s); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fmtTimeRange = (s, e) => (s ? `${fmtTime(s)} - ${fmtTime(e)}` : "");
const fmtDateVN = (d) => d.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
const startOfWeek = (date) => { const d = new Date(date); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); d.setHours(0, 0, 0, 0); return d; };

const STATUS = {
  CONFIRMED: { label: "Chờ điều trị", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  IN_PROGRESS: { label: "Đang điều trị", cls: "bg-amber-50 text-amber-700 border-amber-200 animate-pulse" },
  COMPLETED: { label: "Đã hoàn thành", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Đã huỷ", cls: "bg-red-50 text-red-700 border-red-200" },
  NO_SHOW: { label: "Vắng mặt", cls: "bg-red-50 text-red-700 border-red-200" },
  PENDING: { label: "Chờ xác nhận", cls: "bg-slate-50 text-slate-600 border-slate-200" },
};

const ROOM_STATUS = {
  AVAILABLE: { label: "Trống", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  OCCUPIED: { label: "Đang dùng", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  CLEANING: { label: "Dọn dẹp", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  MAINTENANCE: { label: "Bảo trì", cls: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default function PhysioDashboard() {
  const navigate = useNavigate();
  const fullName = localStorage.getItem("userFullName") || sessionStorage.getItem("userFullName") || "Chuyên viên VLTL";

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDate, setSelectedDate] = useState(() => toLocalDate(new Date()));
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const [sessions, setSessions] = useState([]);
  const [weekAppts, setWeekAppts] = useState([]);
  const [services, setServices] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [loading, setLoading] = useState(false);
  const [weekLoading, setWeekLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  const [form, setForm] = useState({ guestUserId: "", roomBookingId: "", serviceId: "", date: toLocalDate(new Date()), time: "08:00" });
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [bookingMsg, setBookingMsg] = useState(null);

  const loadSchedule = useCallback(async () => {
    setLoading(true); setError("");
    try { const data = await specialistApi.getTherapistSchedule(selectedDate); setSessions(data || []); }
    catch (e) { setError(e.message || "Không thể tải lịch điều trị."); }
    finally { setLoading(false); }
  }, [selectedDate]);

  const loadServices = useCallback(async () => {
    try { const data = await specialistApi.getServicesByCategory("PHYSIO"); let list = data || [];
      if (!list.length) { const t = await specialistApi.getServicesByCategory("THERAPY"); list = t || []; }
      setServices(list); } catch { /* */ }
  }, []);
  const loadRooms = useCallback(async () => {
    try { const data = await specialistApi.getTreatmentRooms(); setRooms((data || []).filter((r) => r.category === "PHYSIO")); } catch { /* */ }
  }, []);

  const loadWeek = useCallback(async () => {
    setWeekLoading(true);
    try { const end = new Date(weekStart); end.setDate(end.getDate() + 6);
      const data = await specialistApi.getTherapistScheduleRange(toLocalDate(weekStart), toLocalDate(end)); setWeekAppts(data || []); }
    catch { setWeekAppts([]); } finally { setWeekLoading(false); }
  }, [weekStart]);

  useEffect(() => { loadSchedule(); }, [loadSchedule]);
  useEffect(() => { loadServices(); loadRooms(); }, [loadServices, loadRooms]);
  useEffect(() => { if (activeTab === "week") loadWeek(); }, [activeTab, loadWeek]);

  const updateStatus = async (id, status) => {
    setActionId(id);
    try { await specialistApi.updateStatus(id, status); await loadSchedule(); await loadRooms(); }
    catch (e) { alert("Cập nhật thất bại: " + e.message); }
    finally { setActionId(null); }
  };

  const runAutoMatch = async () => {
    setBookingMsg(null); setMatchResult(null);
    if (!form.serviceId) { setBookingMsg({ type: "error", text: "Vui lòng chọn liệu trình." }); return; }
    setMatching(true);
    try { const res = await spaApi.autoMatch(Number(form.serviceId), `${form.date}T${form.time}:00`);
      setMatchResult(res); setBookingMsg({ type: "ok", text: `Đã ghép: ${res.therapistName} · ${res.roomName}` }); }
    catch (e) { setBookingMsg({ type: "error", text: e.message || "Không có chuyên viên/phòng VLTL trống." }); }
    finally { setMatching(false); }
  };

  const submitBooking = async () => {
    setBookingMsg(null);
    if (!form.guestUserId) { setBookingMsg({ type: "error", text: "Vui lòng nhập mã bệnh nhân (User ID)." }); return; }
    if (!matchResult) { setBookingMsg({ type: "error", text: "Hãy chạy ghép lịch tự động trước." }); return; }
    if (!form.roomBookingId) { setBookingMsg({ type: "error", text: "Vui lòng nhập mã đặt phòng lưu trú. Khách phải có đặt phòng tại resort mới được đặt dịch vụ spa." }); return; }
    setMatching(true);
    try {
      const dto = { spaServiceId: Number(form.serviceId), startDatetime: `${form.date}T${form.time}:00`,
        roomBookingId: form.roomBookingId ? Number(form.roomBookingId) : null, therapistId: matchResult.therapistId,
        treatmentRoomId: matchResult.treatmentRoomId, isPackageIncluded: false };
      await spaApi.schedule(dto, Number(form.guestUserId));
      setBookingMsg({ type: "ok", text: "Đặt buổi điều trị thành công! Lịch đã đồng bộ Google Calendar & gửi email nhắc." });
      setMatchResult(null); if (form.date === selectedDate) loadSchedule();
    } catch (e) { setBookingMsg({ type: "error", text: e.message || "Đặt lịch thất bại (có thể trùng lịch)." }); }
    finally { setMatching(false); }
  };

  const logout = () => {
    ["token", "userEmail", "userRole", "userFullName", "userSpecialty", "specialistRole"].forEach((k) => { localStorage.removeItem(k); sessionStorage.removeItem(k); });
    navigate("/dang-nhap");
  };

  const stats = useMemo(() => {
    const total = sessions.length;
    const waiting = sessions.filter((a) => a.status === "CONFIRMED").length;
    const running = sessions.filter((a) => a.status === "IN_PROGRESS").length;
    const done = sessions.filter((a) => a.status === "COMPLETED").length;
    const freeRooms = rooms.filter((r) => r.status === "AVAILABLE").length;
    return { total, waiting, running, done, freeRooms };
  }, [sessions, rooms]);

  const records = useMemo(() => sessions.filter((a) => a.note && a.note.trim().length > 0), [sessions]);

  const weekDays = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); const key = toLocalDate(d);
    return { date: d, key, items: weekAppts.filter((a) => (a.startDatetime || "").slice(0, 10) === key) };
  }), [weekStart, weekAppts]);

  const tabs = [
    { id: "overview", label: "Tổng quan", icon: LayoutGrid },
    { id: "sessions", label: "Ca điều trị", icon: Calendar, badge: stats.waiting + stats.running },
    { id: "records", label: "Hồ sơ bệnh nhân", icon: FileText },
    { id: "week", label: "Lịch tuần", icon: CalendarDays },
    { id: "calendar", label: "Lịch biểu", icon: CalendarDays },
    { id: "book", label: "Đặt buổi điều trị", icon: PlusCircle },
  ];

  return (
    <div className="flex min-h-screen bg-[#f3f5f8] text-slate-800">
      <aside className="w-72 shrink-0 bg-[#0c1326] text-white flex flex-col">
        <div className="px-5 py-5 border-b border-white/10 flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-indigo-500/20 flex items-center justify-center"><Activity className="h-5 w-5 text-indigo-300" /></div>
          <div><p className="font-serif font-bold leading-tight">Vật Lý Trị Liệu</p><p className="text-[9px] uppercase tracking-widest text-indigo-300/80 font-bold">Rehabilitation Unit</p></div>
        </div>
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-[9px] uppercase tracking-widest text-indigo-400 font-bold mb-2">Chuyên viên VLTL</p>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-200">{fullName.charAt(0)}</div>
            <div className="min-w-0"><p className="text-xs font-bold truncate">{fullName}</p><p className="text-[9px] text-indigo-300/80">BS Vật lý trị liệu</p></div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {tabs.map((t) => { const Icon = t.icon; const active = activeTab === t.id;
            return (<button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${active ? "bg-indigo-500 text-white" : "bg-transparent text-indigo-100/70 hover:bg-white/5"}`}>
              <span className="flex items-center gap-2.5"><Icon className="h-4 w-4" />{t.label}</span>
              {t.badge ? <span className="bg-amber-400 text-[#0c1326] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">{t.badge}</span> : null}
            </button>); })}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 hover:bg-red-950 text-indigo-100 hover:text-red-300 text-xs font-bold transition-all cursor-pointer border border-white/10"><LogOut className="h-4 w-4" /> Đăng xuất hệ thống</button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div><h1 className="font-serif text-xl font-bold text-slate-900">{tabs.find((t) => t.id === activeTab)?.label}</h1><p className="text-xs text-slate-500 mt-0.5">Trung Tâm Vật Lý Trị Liệu & Phục Hồi Chức Năng Ngũ Sơn</p></div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full text-[10px] font-bold text-indigo-700 uppercase tracking-wider"><Sparkles className="h-3.5 w-3.5" /> Rehab Live</span>
            <button onClick={() => { loadSchedule(); loadRooms(); }} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"><RefreshCw className="h-4 w-4 text-slate-600" /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[{ label: "Ca hôm nay", value: stats.total, color: "text-slate-900" },
                  { label: "Chờ điều trị", value: stats.waiting, color: "text-blue-600" },
                  { label: "Đang điều trị", value: stats.running, color: "text-amber-600" },
                  { label: "Đã hoàn thành", value: stats.done, color: "text-emerald-600" },
                  { label: "Phòng trống", value: stats.freeRooms, color: "text-indigo-600" }].map((k) => (
                  <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-5"><p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{k.label}</p><p className={`text-2xl font-serif font-bold mt-2 ${k.color}`}>{k.value}</p></div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
                  <h3 className="font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">Ca chờ & đang điều trị</h3>
                  <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
                    {sessions.filter((a) => a.status === "CONFIRMED" || a.status === "IN_PROGRESS").map((a) => (
                      <div key={a.spaBookingId} className={`p-4 rounded-lg border flex items-center justify-between ${a.status === "IN_PROGRESS" ? "border-amber-200 bg-amber-50/40" : "border-slate-200"}`}>
                        <div><p className="font-bold text-sm text-slate-900">{a.guestName} <span className="text-[10px] text-slate-400 font-mono ml-1">PHY-{String(a.spaBookingId).padStart(4, "0")}</span></p><p className="text-xs text-slate-600 mt-0.5">{a.serviceName}</p><p className="text-[11px] text-slate-400 mt-0.5 font-mono">{fmtTimeRange(a.startDatetime, a.endDatetime)} · {a.treatmentRoomName}</p></div>
                        <span className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-full border ${STATUS[a.status]?.cls}`}>{STATUS[a.status]?.label}</span>
                      </div>
                    ))}
                    {sessions.filter((a) => a.status === "CONFIRMED" || a.status === "IN_PROGRESS").length === 0 && <p className="text-xs text-slate-400 italic text-center py-10">Không có ca dở dang nào.</p>}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h3 className="font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">Phòng VLTL</h3>
                  <div className="space-y-2.5 max-h-[28rem] overflow-y-auto pr-1">
                    {rooms.map((r) => (<div key={r.treatmentRoomId} className="p-3 rounded-lg border border-slate-200 flex justify-between items-center"><span className="text-xs font-bold text-slate-800">{r.roomName}</span><span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full border ${ROOM_STATUS[r.status]?.cls || ROOM_STATUS.AVAILABLE.cls}`}>{ROOM_STATUS[r.status]?.label || r.status}</span></div>))}
                    {rooms.length === 0 && <p className="text-xs text-slate-400 italic text-center py-10">Chưa có phòng VLTL.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between gap-4">
                <div><h3 className="font-serif font-bold text-slate-900">Lịch điều trị cơ xương khớp</h3><p className="text-xs text-slate-500 mt-0.5">{fmtDateVN(new Date(selectedDate + "T00:00:00"))}</p></div>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              {loading ? <div className="flex flex-col items-center py-20 gap-3"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /><span className="text-xs text-slate-500 uppercase font-bold">Đang tải…</span></div>
                : error ? <div className="max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex gap-2"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}</div>
                : sessions.length === 0 ? <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">Không có ca điều trị nào trong ngày này.</div>
                : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{sessions.map((a) => <SessionCard key={a.spaBookingId} a={a} actionId={actionId} onUpdate={updateStatus} />)}</div>}
            </div>
          )}

          {activeTab === "records" && (
            <div className="space-y-5">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-2 text-xs text-indigo-800"><ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" /><span>Tuân thủ Nghị định 13/2023/NĐ-CP về tối thiểu hoá dữ liệu: chỉ hiển thị tình trạng thể chất liên quan trực tiếp đến trị liệu. Không hiển thị dị ứng thức ăn, CCCD hay thông tin tài chính.</span></div>
              {loading ? <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-indigo-600" /></div>
                : records.length === 0 ? <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">Không có ghi chú thể trạng nào cho ngày {selectedDate}.</div>
                : <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{records.map((a) => (
                    <div key={a.spaBookingId} className="bg-white border border-slate-200 rounded-xl p-5">
                      <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2"><div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center"><HeartPulse className="h-4.5 w-4.5 text-indigo-600" /></div><div><p className="font-bold text-sm text-slate-900">{a.guestName}</p><p className="text-[10px] text-slate-400 font-mono">PHY-{String(a.spaBookingId).padStart(4, "0")} · {fmtTime(a.startDatetime)}</p></div></div>
                        <span className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-full border ${STATUS[a.status]?.cls}`}>{STATUS[a.status]?.label}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-3"><span className="font-bold text-slate-800">Liệu trình:</span> {a.serviceName}</p>
                      <div className="mt-3 bg-indigo-50/60 border-l-2 border-indigo-400 rounded p-3 text-xs text-indigo-900 leading-relaxed"><span className="font-bold uppercase text-[10px] tracking-wide block mb-1">Tình trạng thể chất</span>{a.note}</div>
                    </div>))}</div>}
            </div>
          )}

          {activeTab === "week" && (
            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between">
                <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer">← Tuần trước</button>
                <p className="font-serif font-bold text-slate-900 text-sm">Tuần {toLocalDate(weekStart)}</p>
                <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer">Tuần sau →</button>
              </div>
              {weekLoading ? <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-indigo-600" /></div>
                : <div className="grid grid-cols-1 md:grid-cols-7 gap-3">{weekDays.map((d) => (
                    <div key={d.key} className="bg-white border border-slate-200 rounded-xl p-3 min-h-[12rem]">
                      <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">{d.date.toLocaleDateString("vi-VN", { weekday: "short" })}</p>
                      <p className="text-sm font-serif font-bold text-slate-900 mb-2">{pad(d.date.getDate())}/{pad(d.date.getMonth() + 1)}</p>
                      <div className="space-y-1.5">{d.items.map((a) => (<div key={a.spaBookingId} className="p-1.5 rounded bg-indigo-50 border border-indigo-100"><p className="text-[10px] font-mono text-indigo-800 font-bold">{fmtTime(a.startDatetime)}</p><p className="text-[10px] text-slate-600 truncate">{a.guestName}</p></div>))}{d.items.length === 0 && <p className="text-[10px] text-slate-300 italic">—</p>}</div>
                    </div>))}</div>}
            </div>
          )}

          {activeTab === "calendar" && (
            <SpecialistCalendarTab activeRole="physio" />
          )}

          {activeTab === "book" && (
            <div className="max-w-2xl">
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                <div><h3 className="font-serif font-bold text-slate-900">Đặt buổi điều trị cho bệnh nhân</h3><p className="text-xs text-slate-500 mt-1">Hệ thống tự động ghép chuyên viên VLTL trống + phòng máy trống và chống trùng lịch khi xác nhận.</p></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Mã bệnh nhân (User ID)"><input value={form.guestUserId} onChange={(e) => setForm({ ...form, guestUserId: e.target.value })} placeholder="VD: 5" className="pinput" /></Field>
                  <Field label="Mã đặt phòng lưu trú (bắt buộc)"><input value={form.roomBookingId} onChange={(e) => setForm({ ...form, roomBookingId: e.target.value })} placeholder="VD: 12" className="pinput" /></Field>
                  <Field label="Liệu trình"><select value={form.serviceId} onChange={(e) => { setForm({ ...form, serviceId: e.target.value }); setMatchResult(null); }} className="pinput"><option value="">— Chọn liệu trình VLTL —</option>{services.map((s) => <option key={s.serviceId} value={s.serviceId}>{s.name} ({s.durationMinutes}p)</option>)}</select></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Ngày"><input type="date" value={form.date} onChange={(e) => { setForm({ ...form, date: e.target.value }); setMatchResult(null); }} className="pinput" /></Field>
                    <Field label="Giờ"><input type="time" value={form.time} onChange={(e) => { setForm({ ...form, time: e.target.value }); setMatchResult(null); }} className="pinput" /></Field>
                  </div>
                </div>
                {bookingMsg && <div className={`p-3 rounded-lg text-xs flex gap-2 ${bookingMsg.type === "ok" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>{bookingMsg.type === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}{bookingMsg.text}</div>}
                {matchResult && <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200"><p className="text-[10px] uppercase tracking-wide font-bold text-indigo-600 mb-2">Kết quả ghép tự động</p><div className="grid grid-cols-2 gap-3 text-xs"><p><ShieldCheck className="h-3.5 w-3.5 inline mr-1 text-indigo-600" />Chuyên viên: <strong>{matchResult.therapistName}</strong></p><p><DoorOpen className="h-3.5 w-3.5 inline mr-1 text-indigo-600" />Phòng: <strong>{matchResult.roomName}</strong></p><p><Clock className="h-3.5 w-3.5 inline mr-1 text-indigo-600" />Bắt đầu: <strong>{fmtTime(matchResult.startDatetime)}</strong></p><p><CalendarCheck className="h-3.5 w-3.5 inline mr-1 text-indigo-600" />Kết thúc: <strong>{fmtTime(matchResult.endDatetime)}</strong></p></div></div>}
                <div className="flex gap-3">
                  <button onClick={runAutoMatch} disabled={matching} className="flex-1 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wide cursor-pointer border-none disabled:opacity-50 flex items-center justify-center gap-2">{matching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Ghép lịch tự động</button>
                  <button onClick={submitBooking} disabled={matching || !matchResult} className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wide cursor-pointer border-none disabled:opacity-40 flex items-center justify-center gap-2"><Check className="h-4 w-4" /> Xác nhận đặt lịch</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <style>{`.pinput{width:100%;padding:0.55rem 0.75rem;border:1px solid #cbd5e1;border-radius:0.5rem;font-size:0.8rem;outline:none}.pinput:focus{box-shadow:0 0 0 2px #a5b4fc}`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (<label className="block"><span className="text-[10px] uppercase tracking-wide font-bold text-slate-500 mb-1 block">{label}</span>{children}</label>);
}

function SessionCard({ a, actionId, onUpdate }) {
  const s = STATUS[a.status] || STATUS.PENDING;
  const isPending = a.status === "CONFIRMED";
  const isRunning = a.status === "IN_PROGRESS";
  const busy = actionId === a.spaBookingId;
  return (
    <div className={`bg-white border rounded-xl p-5 flex flex-col justify-between ${isRunning ? "border-amber-300 ring-2 ring-amber-100" : "border-slate-200"}`}>
      <div>
        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
          <div><span className="text-[9px] font-mono text-slate-400 font-bold block">PHY-{String(a.spaBookingId).padStart(4, "0")}</span><span className="text-[11px] font-bold text-slate-700 font-mono uppercase mt-0.5 block">{a.treatmentRoomName || "Chưa phân phòng"}</span></div>
          <span className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-full border ${s.cls}`}>{s.label}</span>
        </div>
        <h4 className="font-serif font-bold text-slate-900 mt-3">{a.serviceName}</h4>
        <div className="space-y-1.5 text-xs text-slate-600 mt-2">
          <p className="flex items-center"><Users className="h-3.5 w-3.5 mr-2 text-slate-400" />Bệnh nhân: <strong className="ml-1 text-slate-800">{a.guestName}</strong></p>
          <p className="flex items-center"><Clock className="h-3.5 w-3.5 mr-2 text-slate-400" /><span className="font-mono">{fmtTimeRange(a.startDatetime, a.endDatetime)}</span></p>
        </div>
        {a.note && <div className="mt-3 bg-indigo-50/70 border-l-2 border-indigo-400 rounded p-2.5 text-[10px] text-indigo-900 leading-relaxed"><span className="font-bold">Tình trạng thể chất:</span> {a.note}</div>}
      </div>
      <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-1.5">
        {busy ? <span className="text-[10px] text-slate-400 italic">Đang cập nhật…</span> : (
          <>
            {isPending && (<>
              <button onClick={() => onUpdate(a.spaBookingId, "IN_PROGRESS")} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold uppercase rounded-md cursor-pointer border-none flex items-center gap-1"><Play className="h-3 w-3 fill-white" />Bắt đầu</button>
              <button onClick={() => onUpdate(a.spaBookingId, "NO_SHOW")} className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase rounded-md cursor-pointer border-none">No Show</button>
            </>)}
            {isRunning && <button onClick={() => onUpdate(a.spaBookingId, "COMPLETED")} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase rounded-md cursor-pointer border-none flex items-center gap-1"><Check className="h-3.5 w-3.5" />Hoàn thành</button>}
            {a.status === "COMPLETED" && <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Hoàn tất</span>}
            {(a.status === "CANCELLED" || a.status === "NO_SHOW") && <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />{s.label}</span>}
          </>
        )}
      </div>
    </div>
  );
}
