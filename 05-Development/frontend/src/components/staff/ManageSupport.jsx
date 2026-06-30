import React, { useState, useEffect } from "react";
import { PlusCircle, Send, X, User, Phone, Check, RefreshCw, MessageSquare } from "lucide-react";
import { complaintsApi, adminApi, userApi } from "../../api";

export default function ManageSupport({ complaints, setComplaints, rooms }) {
  const [showAddComplaintModal, setShowAddComplaintModal] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    guest: "",
    room: "101",
    content: "",
  });

  // State for Staff Assignment and Chat Dialog
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

      // Update state
      setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? updated : c));
      setSelectedComplaint(updated);
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
        "Lễ tân", // or use current staff name
        "Staff"
      );
      setDrawerMessages(prev => [...prev, sent]);
      setDrawerReplyText("");
    } catch (err) {
      alert("Lỗi gửi tin nhắn: " + err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const [chatMessages, setChatMessages] = useState([
    {
      sender: "Hệ thống hỗ trợ",
      text: "Chào mừng bạn đến với kênh liên lạc nội bộ của Ngũ Sơn Resort.",
      time: "08:00",
    },
  ]);
  const [newChatInput, setNewChatInput] = useState("");


  const triggerAddModal = () => {
    setComplaintForm({ guest: "", room: rooms[0]?.id || "101", content: "" });
    setShowAddComplaintModal(true);
  };

  const handleAddComplaint = async (e) => {
    e.preventDefault();
    if (!complaintForm.guest || !complaintForm.content) {
      alert("Vui lòng nhập tên khách và nội dung phản hồi.");
      return;
    }
    try {
      const response = await complaintsApi.submitComplaint(
        complaintForm.guest,
        complaintForm.room,
        complaintForm.content
      );
      setComplaints((prev) => [response, ...prev]);
      setShowAddComplaintModal(false);
      setComplaintForm({ guest: "", room: rooms[0]?.id || "101", content: "" });
      alert("Đã ghi nhận yêu cầu / khiếu nại của khách hàng.");
    } catch (err) {
      alert("Ghi nhận thất bại: " + err.message);
    }
  };

  const handleResolveComplaint = async (id, responseText) => {
    try {
      const resolved = await complaintsApi.resolveComplaint(id, responseText || "Đã xử lý xong");
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === id ? resolved : c
        )
      );
      alert('Đã cập nhật trạng thái khiếu nại thành "Đã giải quyết".');
    } catch (err) {
      alert("Cập nhật thất bại: " + err.message);
    }
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!newChatInput.trim()) return;
    const newMessage = {
      sender: "Lễ tân (Bạn)",
      text: newChatInput,
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setChatMessages((prev) => [...prev, newMessage]);
    setNewChatInput("");

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "Hệ thống hỗ trợ",
          text: "Tin nhắn hỗ trợ của bạn đã được ghi nhận vào hệ thống liên lạc.",
          time: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Complaints Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-serif text-lg font-normal text-sage-950">
              Hỗ Trợ & Tiếp Nhận Complaint
            </h3>
            <p className="text-xs text-sage-500 mt-1">
              Tiếp nhận báo cáo sự cố cơ sở vật chất, hỏng hóc thiết bị buồng
              phòng hoặc các khiếu nại trực tiếp từ khách hàng.
            </p>
          </div>
          <button
            onClick={triggerAddModal}
            className="px-5 py-2.5 bg-primary-800 hover:bg-primary-900 text-white rounded-none text-xs font-semibold tracking-wider flex items-center space-x-1.5 cursor-pointer shadow-sm uppercase"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Tiếp nhận phản hồi mới</span>
          </button>
        </div>

        <div className="bg-white border border-primary-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-primary-50/50 text-sage-600 font-bold border-b border-primary-100">
                  <th className="p-4">Mã số</th>
                  <th className="p-4">Số Phòng</th>
                  <th className="p-4">Khách báo cáo</th>
                  <th className="p-4">Nội Dung Sự Việc</th>
                  <th className="p-4">Nhân viên xử lý</th>
                  <th className="p-4">Thời gian nhận</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-center">Xử lý giải quyết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50/50">
                {complaints.map((c) => {
                  let statusClass = "bg-red-50 text-red-700";
                  let statusLabel = "Mở khiếu nại";
                  if (c.status === "Resolved") {
                    statusClass = "bg-green-100 text-green-700";
                    statusLabel = "Đã giải quyết";
                  } else if (c.status === "In Progress" || c.status === "Assigned") {
                    statusClass = "bg-amber-100 text-amber-700";
                    statusLabel = "Đang xử lý";
                  }

                  return (
                    <tr key={c.id} className="hover:bg-primary-50/10">
                      <td className="p-4 font-bold text-primary-950">{c.id}</td>
                      <td className="p-4 font-bold text-sage-950">
                        Phòng {c.roomNumber || c.room}
                      </td>
                      <td className="p-4 text-sage-700">{c.guestName || c.guest}</td>
                      <td className="p-4 text-sage-800 max-w-xs">{c.content}</td>
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
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString("vi-VN") + " " + new Date(c.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : c.time}
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
                            <div className="p-2 bg-primary-50/50 text-[10px] font-light text-sage-750 italic max-w-xs text-left mx-auto">
                              <span className="font-bold block not-italic text-emerald-800">
                                Giải pháp:
                              </span>
                              {c.feedback}
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 justify-center max-w-xs mx-auto mt-1">
                              <input
                                type="text"
                                placeholder="Ghi phương án..."
                                id={`support-comp-reply-${c.id}`}
                                className="w-24 p-1 border border-primary-100 text-[11px] focus:outline-primary-200"
                              />
                              <button
                                onClick={() => {
                                  const val = document.getElementById(
                                    `support-comp-reply-${c.id}`,
                                  ).value;
                                  handleResolveComplaint(c.id, val);
                                }}
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
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Internal Chat Messenger */}
      <div className="space-y-4 pt-4 border-t border-primary-100">
        <div>
          <h3 className="font-serif text-lg font-normal text-sage-950">
            Bộ Đàm Liên Lạc Nội Bộ
          </h3>
          <p className="text-xs text-sage-500">
            Trao đổi thông tin trực tiếp với bộ phận Kỹ thuật, Bếp ăn, Dịch vụ
            spa hoặc Quản lý ca trực.
          </p>
        </div>

        <div className="bg-white border border-primary-100 p-5 flex flex-col h-80">
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 custom-scrollbar text-xs">
            {chatMessages.map((msg, i) => {
              const isMe = msg.sender.includes("Bạn");
              return (
                <div
                  key={i}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <span className="text-[10px] text-sage-400 font-semibold mb-0.5">
                    {msg.sender} • {msg.time}
                  </span>
                  <div
                    className={`p-3 max-w-xs ${
                      isMe
                        ? "bg-primary-800 text-white"
                        : "bg-primary-50/50 text-sage-900 border border-primary-100"
                    }`}
                  >
                    <p className="font-light">{msg.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <form
            onSubmit={handleSendChatMessage}
            className="flex space-x-2 border-t border-primary-50 pt-3"
          >
            <input
              type="text"
              placeholder="Nhập nội dung thông điệp gửi bộ đàm..."
              value={newChatInput}
              onChange={(e) => setNewChatInput(e.target.value)}
              className="flex-grow p-2.5 border border-primary-100 text-xs focus:outline-primary-200"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-primary-850 hover:bg-primary-900 text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              Gửi
            </button>
          </form>
        </div>
      </div>

      {/* Add Complaint Modal */}
      {showAddComplaintModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-primary-50 pb-3">
              <h3 className="font-serif text-lg font-normal text-sage-950">
                Ghi Nhận Phản Hồi Từ Khách Hàng
              </h3>
              <button
                onClick={() => setShowAddComplaintModal(false)}
                className="text-sage-400 hover:text-sage-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Tên khách hàng báo cáo
                </label>
                <input
                  type="text"
                  value={complaintForm.guest}
                  onChange={(e) =>
                    setComplaintForm({
                      ...complaintForm,
                      guest: e.target.value,
                    })
                  }
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Số phòng
                </label>
                <select
                  value={complaintForm.room}
                  onChange={(e) =>
                    setComplaintForm({ ...complaintForm, room: e.target.value })
                  }
                  className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-white"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Phòng {r.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Nội dung phản hồi / khiếu nại
                </label>
                <textarea
                  value={complaintForm.content}
                  onChange={(e) =>
                    setComplaintForm({
                      ...complaintForm,
                      content: e.target.value,
                    })
                  }
                  rows="3"
                  placeholder="Khách phàn nàn tiếng ồn phòng bên cạnh, phòng thiếu khăn tắm..."
                  className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50">
                <button
                  type="button"
                  onClick={() => setShowAddComplaintModal(false)}
                  className="px-4 py-2 border border-primary-100 text-xs font-semibold uppercase tracking-wider hover:bg-primary-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-900 cursor-pointer"
                >
                  Ghi nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  Phòng {selectedComplaint.roomNumber || selectedComplaint.room} • Khách: {selectedComplaint.guestName || selectedComplaint.guest}
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
                        <span className="text-[10px] text-sage-700 font-bold">{selectedComplaint.guestName || selectedComplaint.guest} (Khách)</span>
                        <span className="text-[9px] text-sage-400 font-mono">
                          {selectedComplaint.createdAt ? new Date(selectedComplaint.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>
                      <div className="p-2.5 max-w-[85%] bg-primary-50 border border-primary-100 text-sage-900 rounded-none text-xs">
                        <p className="font-light">{selectedComplaint.content}</p>
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
