import React, { useState, useEffect } from "react";
import { MessageSquare, AlertTriangle, CheckCircle2, Clock, Send, Info } from "lucide-react";
import { complaintsApi, userApi } from "../../api";
import { fmtDate } from "../../utils/formatters";
import { useLanguage } from "../../context/LanguageContext";

export default function SupportRequests({ profile }) {
  const { t } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch guest's complaints and active rooms
  useEffect(() => {
    if (!profile?.userId) return;

    const loadSupportData = async () => {
      try {
        setLoadingList(true);
        // Load requests
        const list = await complaintsApi.getMyComplaints(profile.userId);
        setComplaints(list || []);

        // Load active bookings to prefill room numbers
        const bookings = await userApi.getMyBookings().catch(() => []);
        const roomsList = [];
        bookings.forEach((b) => {
          if (b.rooms) {
            b.rooms.forEach((r) => {
              if (r.roomNumber && !roomsList.includes(r.roomNumber)) {
                roomsList.push(r.roomNumber);
              }
            });
          }
        });
        setMyRooms(roomsList);
        if (roomsList.length > 0) {
          setSelectedRoom(roomsList[0]);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu hỗ trợ:", err);
      } finally {
        setLoadingList(false);
      }
    };

    loadSupportData();
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedRoom.trim()) {
      setError(t("profile.supportErrorRoom"));
      return;
    }
    if (!content.trim()) {
      setError(t("profile.supportErrorContent"));
      return;
    }

    setLoading(true);
    try {
      const response = await complaintsApi.submitComplaint(
        profile.fullName || t("nav.guest"),
        selectedRoom,
        content,
        profile.userId
      );
      setSuccess(t("profile.supportSuccessSubmit"));
      setContent("");
      
      // Refresh list
      setComplaints((prev) => [response, ...prev]);
    } catch (err) {
      setError(err.message || t("profile.supportErrorSubmit"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h3 className="font-serif text-lg font-normal text-sage-950 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary-800" />
          {t("profile.supportTitle")}
        </h3>
        <p className="text-xs text-sage-500 mt-1">
          {t("profile.supportDesc")}
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-md bg-red-50 text-red-700 text-sm border border-red-200 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3.5 rounded-md bg-emerald-50 text-emerald-700 text-sm border border-emerald-200 flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Submit Form */}
      <form onSubmit={handleSubmit} className="bg-primary-50/30 p-5 rounded-md border border-primary-100/50 space-y-4">
        <h4 className="text-xs font-bold text-sage-800 uppercase tracking-wider">
          {t("profile.supportFormTitle")}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
              {t("profile.supportRoomLabel")}
            </label>
            {myRooms.length > 0 ? (
              <div className="flex gap-2">
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="flex-grow p-2.5 border border-primary-200 bg-white text-xs rounded-sm focus:outline-none focus:border-primary-800"
                >
                  {myRooms.map((room) => (
                    <option key={room} value={room}>
                      {t("profile.supportRoomOption").replace("{room}", room)}
                    </option>
                  ))}
                  <option value="other">{t("profile.supportRoomOther")}</option>
                </select>
                {selectedRoom === "other" || !myRooms.includes(selectedRoom) ? (
                  <input
                    type="text"
                    placeholder={t("profile.supportRoomPlaceholder")}
                    value={selectedRoom === "other" ? "" : selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-32 p-2.5 border border-primary-200 bg-white text-xs rounded-sm focus:outline-none focus:border-primary-800"
                    required
                  />
                ) : null}
              </div>
            ) : (
              <input
                type="text"
                placeholder={t("profile.supportRoomVaguePlaceholder")}
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full p-2.5 border border-primary-200 bg-white text-xs rounded-sm focus:outline-none focus:border-primary-800"
                required
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
            {t("profile.supportIssueDetail")}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder={t("profile.supportIssuePlaceholder")}
            className="w-full p-3 border border-primary-200 bg-white text-xs rounded-sm focus:outline-none focus:border-primary-800 resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider bg-primary-900 hover:bg-primary-800 text-white shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              {t("profile.supportSubmitBtn")}
            </>
          )}
        </button>
      </form>

      {/* Support History */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-sage-800 uppercase tracking-wider">
          {t("profile.supportHistoryTitle")}
        </h4>

        {loadingList ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary-800 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-8 border border-dashed border-primary-200 text-center rounded-md">
            <Info className="h-6 w-6 text-sage-300 mx-auto mb-2" />
            <p className="text-xs text-sage-500">{t("profile.supportHistoryEmpty")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div key={c.id} className="p-4 border-b border-primary-100 bg-white space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-sage-800 bg-primary-50 px-2 py-0.5 rounded-none">
                      {t("profile.supportRoomOption").replace("{room}", c.roomNumber)}
                    </span>
                    <span className="text-[10px] text-sage-400 font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {c.createdAt ? fmtDate(c.createdAt) : "—"}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-none ${
                      c.status === "Resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {c.status === "Resolved" ? t("profile.supportStatusResolved") : t("profile.supportStatusPending")}
                  </span>
                </div>

                <p className="text-xs text-sage-750 font-light">{c.content}</p>

                {c.status === "Resolved" && c.feedback && (
                  <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 text-xs text-sage-800 rounded-sm">
                    <p className="font-bold text-emerald-800 text-[10px] uppercase tracking-wider mb-1">
                      {t("profile.supportFeedbackLabel")}:
                    </p>
                    <p className="font-light italic">"{c.feedback}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
