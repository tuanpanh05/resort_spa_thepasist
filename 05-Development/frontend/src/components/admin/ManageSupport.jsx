import React, { useState, useEffect } from "react";
import { MessageSquare, Star, Ban, ShieldCheck, User, Phone, Check, RefreshCw, X, Send } from "lucide-react";
import { complaintsApi, paymentApi, adminApi, userApi } from "../../api";

export default function ManageSupport({
  feedbacks = [],
  complaints = [],
  loadFeedbacks,
  loadComplaints,
}) {
  const [complaintReplyText, setComplaintReplyText] = useState({});

  // Chat & Staff Assignment States
  const [staffList, setStaffList] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [drawerMessages, setDrawerMessages] = useState([]);
  const [drawerReplyText, setDrawerReplyText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Staff Assignment Form State
  const [isManualStaff, setIsManualStaff] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [manualStaffName, setManualStaffName] = useState("");
  const [manualStaffPhone, setManualStaffPhone] = useState("");

  useEffect(() => {
    userApi.getStaffList()
      .then(data => {
        // Lọc lấy danh sách tài khoản có vai trò là nhân viên vận hành, kỹ thuật hoặc dọn dẹp
        const filtered = data.filter(u => u.role === "STAFF" || u.role === "STAFF_TECH" || u.role === "STAFF_CLEAN");
        setStaffList(filtered);
      })
      .catch(err => console.error("Lỗi khi tải danh sách nhân viên:", err));
  }, []);

  const loadDrawerMessages = async (complaintId) => {
    setLoadingMessages(true);
    try {
      const msgs = await complaintsApi.getComplaintMessages(complaintId);
      setDrawerMessages(msgs || []);
    } catch (err) {
      console.error("Không thể tải tin nhắn hội thoại:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleOpenDrawer = (complaint) => {
    setSelectedComplaint(complaint);
    loadDrawerMessages(complaint.id);

    // Prefill assignment state
    if (complaint.assignedStaffId) {
      setSelectedStaffId(complaint.assignedStaffId.toString());
      setIsManualStaff(false);
    } else if (complaint.assignedStaffName) {
      setIsManualStaff(true);
      setManualStaffName(complaint.assignedStaffName || "");
      setManualStaffPhone(complaint.assignedStaffPhone || "");
    } else {
      setSelectedStaffId("");
      setIsManualStaff(false);
      setManualStaffName("");
      setManualStaffPhone("");
    }
  };

  const handleAssignStaff = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      let staffId = null;
      let staffName = null;
      let staffPhone = null;

      if (isManualStaff) {
        if (!manualStaffName.trim()) {
          alert("Vui lòng nhập tên nhân viên");
          return;
        }
        staffName = manualStaffName;
        staffPhone = manualStaffPhone;
      } else {
        if (!selectedStaffId) {
          alert("Vui lòng chọn nhân viên");
          return;
        }
        staffId = parseInt(selectedStaffId);
      }

      const updated = await complaintsApi.assignComplaintStaff(
        selectedComplaint.id,
        staffId,
        staffName,
        staffPhone
      );

      // Refresh complaints list
      await loadComplaints();
      
      // Update local state in drawer
      const mappedUpdated = {
        ...updated,
        id: updated.id,
        roomId: updated.roomNumber,
        customerName: updated.guestName,
        details: updated.content,
        timeReceived: new Date(updated.createdAt).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
        }),
        status: updated.status,
        solution: updated.feedback || "",
      };
      setSelectedComplaint(mappedUpdated);
      alert("Đã phân công nhân viên hỗ trợ thành công.");
    } catch (err) {
      alert("Lỗi khi phân công nhân viên: " + err.message);
    }
  };

  const handleSendDrawerMessage = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !drawerReplyText.trim()) return;

    setSendingMessage(true);
    try {
      const sent = await complaintsApi.sendComplaintMessage(
        selectedComplaint.id,
        drawerReplyText,
        "Admin",
        "Admin"
      );
      setDrawerMessages(prev => [...prev, sent]);
      setDrawerReplyText("");
    } catch (err) {
      alert("Lỗi gửi tin nhắn: " + err.message);
    } finally {
      setSendingMessage(false);
    }
  };


  const handleToggleToxicity = async (id, currentToxic) => {
    try {
      await paymentApi.markFeedbackToxic(id, !currentToxic);
      alert(`Đánh giá #${id} đã được ${!currentToxic ? "đánh dấu Độc hại (Ẩn)" : "khôi phục hiển thị (Hiện)"}.`);
      await loadFeedbacks();
    } catch (err) {
      alert("Lỗi khi kiểm duyệt đánh giá: " + err.message);
    }
  };

  const handleResolveComplaint = async (id) => {
    const txt = complaintReplyText[id];
    if (!txt) {
      alert("Vui lòng nhập phương án xử lý khiếu nại.");
      return;
    }
    try {
      await complaintsApi.resolveComplaint(id, txt);
      alert(`Khiếu nại #${id} đã được đánh dấu là "Đã xử lý".`);
      setComplaintReplyText((prev) => ({ ...prev, [id]: "" }));
      await loadComplaints();
    } catch (err) {
      alert("Lỗi khi xử lý khiếu nại: " + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Feedbacks Section */}
      <div className="space-y-4">
        <div>
          <h3 className="font-serif text-lg font-normal text-sage-950">
            Phản Hồi & Đánh Giá Gần Đây
          </h3>
          <p className="text-xs text-sage-500">
            Giám sát đánh giá 5 sao, ý kiến đóng góp từ khách hàng sau khi trả
            phòng nghỉ dưỡng.
          </p>
        </div>

        {feedbacks.length === 0 ? (
          <div className="text-center py-8 text-sage-400 italic text-xs bg-white border border-primary-100 p-6">
            Chưa có phản hồi hay đánh giá nào từ khách hàng.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedbacks.map((f) => (
              <div
                key={f.id}
                className="bg-white border border-primary-100 p-5 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-sage-950 text-sm block">
                      {f.customerName}
                    </span>
                    <span className="text-[10px] text-sage-400 block uppercase mt-0.5">
                      {f.serviceUsed} • {f.date}
                    </span>
                  </div>
                  <div className="flex items-center space-x-0.5 text-amber-500">
                    {[...Array(f.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                <p className="text-sage-700 text-xs leading-relaxed italic">
                  "{f.comment}"
                </p>

                <div className="flex items-center justify-between border-t border-primary-50 pt-2.5 mt-2 text-xs">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${f.isToxic ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {f.isToxic ? "Độc hại (Bị Ẩn)" : "Hợp lệ (Hiển thị)"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleToxicity(f.id, f.isToxic)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition ${f.isToxic ? "bg-green-700 text-white hover:bg-green-800" : "bg-red-50 text-red-700 hover:bg-red-100"}`}
                  >
                    {f.isToxic ? (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Hiện đánh giá</span>
                      </>
                    ) : (
                      <>
                        <Ban className="h-3.5 w-3.5" />
                        <span>Ẩn đánh giá</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complaints Section */}
      <div className="space-y-4 pt-4 border-t border-primary-100">
        <div>
          <h3 className="font-serif text-lg font-normal text-sage-950">
            Tiếp Nhận & Xử Lý Khiếu Nại
          </h3>
        </div>
        <div className="bg-white border border-primary-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-primary-50/50 text-sage-600 font-bold border-b border-primary-100">
                  <th className="p-4">Mã số</th>
                  <th className="p-4">Số Phòng</th>
                  <th className="p-4">Khách báo cáo</th>
                  <th className="p-4">Chi tiết Sự Việc</th>
                  <th className="p-4">Nhân viên xử lý</th>
                  <th className="p-4">Thời gian nhận</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-center">Xử lý giải quyết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50/50">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-sage-400 italic">
                      Không có khiếu nại hay báo cáo nào từ khách hàng.
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => {
                    let statusClass = "bg-red-50 text-red-700 border border-red-100";
                    let statusLabel = "Mở khiếu nại";
                    if (c.status === "Resolved") {
                      statusClass = "bg-green-100 text-green-700 border border-green-200";
                      statusLabel = "Đã giải quyết";
                    } else if (c.status === "In Progress" || c.status === "Assigned") {
                      statusClass = "bg-amber-100 text-amber-700 border border-amber-205";
                      statusLabel = "Đang xử lý";
                    }

                    return (
                      <tr key={c.id} className="hover:bg-primary-50/10">
                        <td className="p-4 font-bold text-primary-950">{c.id}</td>
                        <td className="p-4 font-bold text-sage-950">
                          Phòng {c.roomId}
                        </td>
                        <td className="p-4 text-sage-700">{c.customerName}</td>
                        <td className="p-4 text-sage-800 max-w-xs">{c.details}</td>
                        <td className="p-4">
                          {c.assignedStaffName ? (
                            <div>
                              <span className="font-semibold text-sage-900">{c.assignedStaffName}</span>
                              {c.assignedStaffPhone && (
                                <span className="text-[10px] text-sage-400 block font-mono">
                                  {c.assignedStaffPhone}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-amber-600 italic bg-amber-50 px-2 py-0.5 border border-amber-100/50 rounded-sm text-[10px]">Chưa phân công</span>
                          )}
                        </td>
                        <td className="p-4 text-sage-500 font-mono">
                          {c.timeReceived}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-none text-[10px] font-semibold uppercase tracking-wider ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col gap-1.5 items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleOpenDrawer(c)}
                              className="px-2.5 py-1.5 bg-primary-850 hover:bg-primary-900 text-white text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="h-3 w-3" />
                              <span>Chat & Phân công</span>
                            </button>

                            {c.status === "Resolved" ? (
                              <div className="p-2 bg-primary-50/50 text-[11px] font-light text-sage-750 italic max-w-xs text-left mx-auto">
                                <span className="font-bold block not-italic text-emerald-800">
                                  Biện pháp:
                                </span>
                                {c.solution}
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 justify-center max-w-xs mx-auto mt-1">
                                <input
                                  type="text"
                                  placeholder="Phương án xử lý..."
                                  value={complaintReplyText[c.id] || ""}
                                  onChange={(e) =>
                                    setComplaintReplyText({
                                      ...complaintReplyText,
                                      [c.id]: e.target.value,
                                    })
                                  }
                                  className="w-24 p-1 border border-primary-100 text-[11px] focus:outline-primary-200"
                                />
                                <button
                                  onClick={() => handleResolveComplaint(c.id)}
                                  className="px-2 py-1 bg-emerald-700 text-white text-[9px] font-semibold uppercase tracking-wider hover:bg-emerald-800 cursor-pointer"
                                >
                                  Xong
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Chat & Assignment Side Drawer */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/45 flex justify-end">
          <div className="bg-white w-full max-w-lg h-full flex flex-col shadow-2xl animate-slide-in">
            {/* Drawer Header */}
            <div className="p-4 border-b border-primary-100 flex items-center justify-between bg-primary-50/40">
              <div>
                <h3 className="font-serif text-base font-normal text-sage-950 flex items-center gap-1.5">
                  <MessageSquare className="h-5 w-5 text-primary-800" />
                  Yêu cầu hỗ trợ #{selectedComplaint.id}
                </h3>
                <p className="text-[11px] text-sage-500 mt-0.5">
                  Phòng {selectedComplaint.roomId} • Khách: {selectedComplaint.customerName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="p-1 rounded-full text-sage-400 hover:text-sage-800 hover:bg-sage-100 cursor-pointer transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-5">
              {/* Staff Assignment Section */}
              <div className="p-4 bg-primary-50/20 border border-primary-100 rounded-sm space-y-3">
                <h4 className="text-[11px] font-bold text-sage-800 uppercase tracking-wider flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-primary-850" />
                  Phân công nhân sự xử lý
                </h4>

                <form onSubmit={handleAssignStaff} className="space-y-3">
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={!isManualStaff}
                        onChange={() => setIsManualStaff(false)}
                        className="text-primary-850 focus:ring-primary-800"
                      />
                      <span>Chọn từ danh sách tài khoản</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={isManualStaff}
                        onChange={() => setIsManualStaff(true)}
                        className="text-primary-850 focus:ring-primary-800"
                      />
                      <span>Nhập thủ công</span>
                    </label>
                  </div>

                  {!isManualStaff ? (
                    <div>
                      <select
                        value={selectedStaffId}
                        onChange={(e) => setSelectedStaffId(e.target.value)}
                        className="w-full p-2 border border-primary-200 bg-white text-xs focus:outline-none focus:border-primary-800"
                      >
                        <option value="">-- Chọn nhân viên --</option>
                        {staffList.map((u) => {
                          const roleLabel = u.role === "STAFF"
                            ? (u.specialty === "TECHNICAL" ? "Kỹ thuật" : u.specialty === "CLEANING" ? "Dọn dẹp" : "Vận hành")
                            : u.role;
                          return (
                            <option key={u.userId} value={u.userId}>
                              {u.fullName} ({roleLabel}) {u.phone ? `- SĐT: ${u.phone}` : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Tên nhân viên"
                        value={manualStaffName}
                        onChange={(e) => setManualStaffName(e.target.value)}
                        className="p-2 border border-primary-200 bg-white text-xs focus:outline-none focus:border-primary-800"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Số điện thoại"
                        value={manualStaffPhone}
                        onChange={(e) => setManualStaffPhone(e.target.value)}
                        className="p-2 border border-primary-200 bg-white text-xs focus:outline-none focus:border-primary-800"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-850 hover:bg-primary-900 text-white text-[10px] font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
                  >
                    Cập nhật phân công
                  </button>
                </form>
              </div>

              {/* Chat log block */}
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between border-b border-primary-50 pb-1 flex-wrap gap-2">
                  <span className="text-[11px] font-bold text-sage-800 uppercase tracking-wider">Hội thoại với Khách</span>
                  <button
                    type="button"
                    onClick={() => loadDrawerMessages(selectedComplaint.id)}
                    className="flex items-center gap-1 text-[10px] text-primary-850 hover:underline"
                    disabled={loadingMessages}
                  >
                    <RefreshCw className={`h-3 w-3 ${loadingMessages ? "animate-spin" : ""}`} />
                    <span>Làm mới tin nhắn</span>
                  </button>
                </div>

                {loadingMessages && drawerMessages.length === 0 ? (
                  <div className="flex justify-center py-6">
                    <div className="w-5 h-5 border-2 border-primary-800 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {/* Customer original complaint message */}
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] text-sage-700 font-bold">{selectedComplaint.customerName} (Khách)</span>
                        <span className="text-[9px] text-sage-400 font-mono">
                          {selectedComplaint.createdAt ? new Date(selectedComplaint.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>
                      <div className="p-2.5 max-w-[85%] bg-primary-50 border border-primary-100 text-sage-900 rounded-none text-xs">
                        <p className="font-light">{selectedComplaint.details}</p>
                      </div>
                    </div>

                    {/* Follow up chat logs */}
                    {drawerMessages.map((msg) => {
                      const isMe = msg.senderRole === "Staff" || msg.senderRole === "Admin";
                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`text-[10px] font-bold ${isMe ? "text-sage-500" : "text-primary-800"}`}>
                              {isMe ? `${msg.senderName} (Bạn)` : `${msg.senderName} (Khách)`}
                            </span>
                            <span className="text-[9px] text-sage-400 font-mono">
                              {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : ""}
                            </span>
                          </div>
                          <div className={`p-2.5 max-w-[85%] text-xs ${
                            isMe 
                              ? "bg-primary-900 text-white" 
                              : "bg-primary-50 border border-primary-100 text-sage-900"
                          }`}>
                            <p className="font-light">{msg.content}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Reply Area (Footer) */}
            <div className="p-4 border-t border-primary-100 bg-white">
              {selectedComplaint.status !== "Resolved" ? (
                <form onSubmit={handleSendDrawerMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập nội dung tin nhắn gửi khách..."
                    value={drawerReplyText}
                    onChange={(e) => setDrawerReplyText(e.target.value)}
                    className="flex-grow p-2.5 border border-primary-200 text-xs focus:outline-none focus:border-primary-800"
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !drawerReplyText.trim()}
                    className="px-4 py-2.5 bg-primary-850 hover:bg-primary-900 disabled:bg-primary-200 text-white text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
                  >
                    {sendingMessage ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Gửi"
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center text-xs text-sage-400 italic">
                  Khiếu nại này đã hoàn thành. Kênh hội thoại đã đóng.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
