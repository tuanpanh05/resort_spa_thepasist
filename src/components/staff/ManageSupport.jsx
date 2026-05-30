import React, { useState } from "react";
import { PlusCircle, Send, X } from "lucide-react";

export default function ManageSupport({ complaints, setComplaints, rooms }) {
  const [showAddComplaintModal, setShowAddComplaintModal] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    guest: "",
    room: "101",
    content: "",
  });
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

  const handleAddComplaint = (e) => {
    e.preventDefault();
    if (!complaintForm.guest || !complaintForm.content) {
      alert("Vui lòng nhập tên khách và nội dung phàn hồi.");
      return;
    }
    const newComp = {
      id: Date.now(),
      guest: complaintForm.guest,
      room: complaintForm.room,
      content: complaintForm.content,
      status: "Open",
      time: "Vừa xong",
      feedback: "",
    };
    setComplaints((prev) => [newComp, ...prev]);
    setShowAddComplaintModal(false);
    setComplaintForm({ guest: "", room: rooms[0]?.id || "101", content: "" });
    alert("Đã ghi nhận yêu cầu / khiếu nại của khách hàng.");
  };

  const handleResolveComplaint = (id, responseText) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "Resolved",
              feedback: responseText || "Đã xử lý xong",
            }
          : c,
      ),
    );
    alert('Đã cập nhật trạng thái khiếu nại thành "Đã giải quyết".');
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
                  <th className="p-4">Thời gian nhận</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-center">Xử lý giải quyết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50/50">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-primary-50/10">
                    <td className="p-4 font-bold text-primary-950">{c.id}</td>
                    <td className="p-4 font-bold text-sage-950">
                      Phòng {c.room}
                    </td>
                    <td className="p-4 text-sage-700">{c.guest}</td>
                    <td className="p-4 text-sage-800 max-w-xs">{c.content}</td>
                    <td className="p-4 text-sage-500 font-mono">{c.time}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-none text-[10px] font-semibold uppercase tracking-wider ${
                          c.status === "Resolved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {c.status === "Resolved"
                          ? "Đã giải quyết"
                          : "Mở khiếu nại"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {c.status === "Resolved" ? (
                        <div className="p-2 bg-primary-50/50 text-[11px] font-light text-sage-750 italic max-w-xs text-left mx-auto">
                          <span className="font-bold block not-italic">
                            Giải pháp:
                          </span>
                          {c.feedback}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 justify-center max-w-xs mx-auto">
                          <input
                            type="text"
                            placeholder="Ghi nhận phương án..."
                            id={`support-comp-reply-${c.id}`}
                            className="flex-grow p-2 border border-primary-100 text-xs focus:outline-primary-200"
                          />
                          <button
                            onClick={() => {
                              const val = document.getElementById(
                                `support-comp-reply-${c.id}`,
                              ).value;
                              handleResolveComplaint(c.id, val);
                            }}
                            className="px-3 py-2 bg-primary-850 text-white text-[10px] font-semibold uppercase tracking-wider hover:bg-primary-900 cursor-pointer"
                          >
                            Xong
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
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
    </div>
  );
}
