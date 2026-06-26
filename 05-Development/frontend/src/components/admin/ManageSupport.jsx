import React, { useState } from "react";
import { MessageSquare, Star, Ban, ShieldCheck } from "lucide-react";
import { complaintsApi, paymentApi } from "../../api";

export default function ManageSupport({
  feedbacks = [],
  complaints = [],
  loadFeedbacks,
  loadComplaints,
}) {
  const [complaintReplyText, setComplaintReplyText] = useState({});

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
          <p className="text-xs text-sage-500">
            Tiếp nhận báo cáo hỏng hóc thiết bị, phàn nàn dịch vụ khẩn cấp từ
            các phòng nghỉ của khách hàng.
          </p>
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
                  <th className="p-4">Thời gian nhận</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-center">Xử lý giải quyết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50/50">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-sage-400 italic">
                      Không có khiếu nại hay báo cáo nào từ khách hàng.
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-primary-50/10">
                      <td className="p-4 font-bold text-primary-950">{c.id}</td>
                      <td className="p-4 font-bold text-sage-950">
                        Phòng {c.roomId}
                      </td>
                      <td className="p-4 text-sage-700">{c.customerName}</td>
                      <td className="p-4 text-sage-800 max-w-xs">{c.details}</td>
                      <td className="p-4 text-sage-500 font-mono">
                        {c.timeReceived}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-none text-[10px] font-semibold uppercase tracking-wider ${
                            c.status === "Resolved"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {c.status === "Resolved" ? "Đã xử lý" : "Đang xử lý"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {c.status === "Resolved" ? (
                          <div className="p-2 bg-primary-50/50 text-[11px] font-light text-sage-750 italic max-w-xs text-left mx-auto">
                            <span className="font-bold block not-italic">
                              Biện pháp:
                            </span>
                            {c.solution}
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5 justify-center max-w-xs mx-auto">
                            <input
                              type="text"
                              placeholder="Ghi nhận phương án xử lý..."
                              value={complaintReplyText[c.id] || ""}
                              onChange={(e) =>
                                setComplaintReplyText({
                                  ...complaintReplyText,
                                  [c.id]: e.target.value,
                                })
                              }
                              className="flex-grow p-2 border border-primary-100 text-xs focus:outline-primary-200"
                            />
                            <button
                              onClick={() => handleResolveComplaint(c.id)}
                              className="px-3 py-2 bg-primary-850 text-white text-[10px] font-semibold uppercase tracking-wider hover:bg-primary-900 cursor-pointer"
                            >
                              Xong
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
