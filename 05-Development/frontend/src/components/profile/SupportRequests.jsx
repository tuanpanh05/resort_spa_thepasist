import React, { useState, useEffect } from "react";
import { MessageSquare, AlertTriangle, CheckCircle2, Clock, Send, Info, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
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

  // Chat/Support Back-and-forth states
  const [expandedId, setExpandedId] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [replyTexts, setReplyTexts] = useState({});
  const [sendingReply, setSendingReply] = useState({});

  const loadMessages = async (complaintId) => {
    try {
      const list = await complaintsApi.getComplaintMessages(complaintId);
      setChatMessages((prev) => ({ ...prev, [complaintId]: list || [] }));
    } catch (err) {
      console.error("Lỗi tải tin nhắn:", err);
    }
  };

  const handleToggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      loadMessages(id);
    }
  };

  const handleSendReply = async (complaintId) => {
    const text = replyTexts[complaintId];
    if (!text || !text.trim()) return;

    setSendingReply((prev) => ({ ...prev, [complaintId]: true }));
    try {
      const sent = await complaintsApi.sendComplaintMessage(
        complaintId,
        text,
        profile.fullName || "Khách",
        "Guest",
        profile.userId
      );
      setChatMessages((prev) => ({
        ...prev,
        [complaintId]: [...(prev[complaintId] || []), sent],
      }));
      setReplyTexts((prev) => ({ ...prev, [complaintId]: "" }));
    } catch (err) {
      alert("Không thể gửi tin nhắn: " + err.message);
    } finally {
      setSendingReply((prev) => ({ ...prev, [complaintId]: false }));
    }
  };


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
            {complaints.map((c) => {
              const isExpanded = expandedId === c.id;
              const msgs = chatMessages[c.id] || [];
              const isResolved = c.status === "Resolved";
              
              // Status Styling
              let statusLabel = t("profile.supportStatusPending");
              let statusClass = "bg-red-50 text-red-700 border border-red-200";
              if (c.status === "Resolved") {
                statusLabel = t("profile.supportStatusResolved");
                statusClass = "bg-green-50 text-green-700 border border-green-200";
              } else if (c.status === "In Progress" || c.status === "Assigned") {
                statusLabel = "Đang xử lý";
                statusClass = "bg-amber-50 text-amber-700 border border-amber-200";
              }

              return (
                <div key={c.id} className="border border-primary-100/70 bg-white shadow-sm transition-all overflow-hidden rounded-sm">
                  {/* Card Header Clickable */}
                  <div 
                    onClick={() => handleToggleExpand(c.id)}
                    className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-primary-50/20"
                  >
                    <div className="space-y-1.5 text-left flex-grow">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-sage-800 bg-primary-50 px-2 py-0.5 rounded-none">
                          {t("profile.supportRoomOption").replace("{room}", c.roomNumber)}
                        </span>
                        <span className="text-[10px] text-sage-400 font-mono flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {c.createdAt ? fmtDate(c.createdAt) : "—"}
                        </span>
                      </div>
                      <p className="text-xs text-sage-750 font-light line-clamp-1">{c.content}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-none ${statusClass}`}>
                        {statusLabel}
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-sage-400" /> : <ChevronDown className="h-4 w-4 text-sage-400" />}
                    </div>
                  </div>

                  {/* Expanded Chat section */}
                  {isExpanded && (
                    <div className="border-t border-primary-50 bg-primary-50/10 p-4 space-y-4 text-left">
                      {/* Assigned Staff Banner */}
                      {c.assignedStaffName ? (
                        <div className="p-3 bg-sky-50 border border-sky-100 rounded-sm flex items-center justify-between text-xs text-sage-800">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                            </span>
                            <span>
                              <strong>Nhân viên hỗ trợ:</strong> {c.assignedStaffName} {c.assignedStaffPhone ? `(SĐT: ${c.assignedStaffPhone})` : ""}
                            </span>
                          </div>
                          <span className="text-[9px] font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 uppercase tracking-wider">
                            Đang đến xử lý
                          </span>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-yellow-50/50 border border-yellow-100 text-[11px] text-yellow-800 rounded-sm">
                          Yêu cầu đang chờ Lễ tân tiếp nhận và phân công nhân viên hỗ trợ.
                        </div>
                      )}

                      {/* Chat Messages */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-primary-100 pb-1.5">
                          <span className="text-[10px] font-bold text-sage-500 uppercase tracking-wider">Lịch sử hội thoại</span>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              loadMessages(c.id);
                            }}
                            className="p-1 text-primary-800 hover:bg-primary-50 rounded"
                            title="Tải lại tin nhắn"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                          {/* Original Guest Message */}
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] text-sage-400 font-bold">Khách (Bạn)</span>
                              <span className="text-[9px] text-sage-400 font-mono">
                                {c.createdAt ? new Date(c.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : ""}
                              </span>
                            </div>
                            <div className="p-2.5 max-w-[85%] bg-primary-900 text-white rounded-none text-xs">
                              <p className="font-light">{c.content}</p>
                            </div>
                          </div>

                          {/* Message Logs */}
                          {msgs.map((msg) => {
                            const isMe = msg.senderRole === "Guest";
                            return (
                              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className={`text-[10px] font-bold ${isMe ? "text-sage-400" : "text-primary-800"}`}>
                                    {isMe ? "Bạn" : `${msg.senderName} (${msg.senderRole === "Admin" ? "Quản trị" : "Nhân viên"})`}
                                  </span>
                                  <span className="text-[9px] text-sage-400 font-mono">
                                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : ""}
                                  </span>
                                </div>
                                <div className={`p-2.5 max-w-[85%] text-xs ${
                                  isMe 
                                    ? "bg-primary-900 text-white" 
                                    : "bg-white text-sage-900 border border-primary-100"
                                }`}>
                                  <p className="font-light">{msg.content}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Static feedback solution if resolved */}
                      {isResolved && c.feedback && (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 text-xs text-sage-800 rounded-sm">
                          <p className="font-bold text-emerald-800 text-[10px] uppercase tracking-wider mb-1">
                            Giải pháp xử lý từ hệ thống:
                          </p>
                          <p className="font-light italic">"{c.feedback}"</p>
                        </div>
                      )}

                      {/* Reply Input Box */}
                      {!isResolved ? (
                        <div className="flex gap-2 items-center border-t border-primary-100 pt-3">
                          <input
                            type="text"
                            placeholder="Nhập nội dung phản hồi..."
                            value={replyTexts[c.id] || ""}
                            onChange={(e) => setReplyTexts(prev => ({ ...prev, [c.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSendReply(c.id);
                            }}
                            className="flex-grow p-2 border border-primary-200 bg-white text-xs rounded-sm focus:outline-none focus:border-primary-800"
                          />
                          <button
                            type="button"
                            onClick={() => handleSendReply(c.id)}
                            disabled={sendingReply[c.id] || !(replyTexts[c.id] || "").trim()}
                            className="p-2 bg-primary-900 hover:bg-primary-800 disabled:bg-primary-200 text-white rounded-sm cursor-pointer shadow-sm transition"
                          >
                            {sendingReply[c.id] ? (
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Send className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-[10px] text-sage-400 italic pt-2 border-t border-primary-50">
                          Yêu cầu hỗ trợ này đã được đóng. Kênh chat trực tiếp không khả dụng.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
