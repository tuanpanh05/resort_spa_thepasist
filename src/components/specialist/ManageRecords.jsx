import React, { useState } from "react";
import { Clipboard, PlusCircle, X, AlertTriangle } from "lucide-react";

export default function ManageRecords({
  patientRecords,
  setPatientRecords,
  selectedPatientName,
  setSelectedPatientName,
}) {
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [newPhysioRecord, setNewPhysioRecord] = useState({
    symptoms: "",
    therapy: "",
    progress: "",
  });

  const activeRecord =
    patientRecords.find((r) => r.guest === selectedPatientName) ||
    patientRecords[0];

  const handleAddClinicalRecord = (e) => {
    e.preventDefault();
    if (!newPhysioRecord.symptoms || !newPhysioRecord.therapy) {
      alert("Vui lòng điền triệu chứng lâm sàng và chỉ định trị liệu.");
      return;
    }
    const todayStr = new Date().toISOString().split("T")[0];

    setPatientRecords((prev) =>
      prev.map((record) => {
        if (record.guest === selectedPatientName) {
          const nextHistory = [
            ...record.history,
            {
              date: todayStr,
              symptoms: newPhysioRecord.symptoms,
              therapy: newPhysioRecord.therapy,
              progress: newPhysioRecord.progress || "Tiến triển bình thường",
            },
          ];
          return { ...record, history: nextHistory };
        }
        return record;
      }),
    );

    setShowAddRecordModal(false);
    setNewPhysioRecord({ symptoms: "", therapy: "", progress: "" });
    alert("Đã cập nhật thành công hồ sơ bệnh án phục hồi trị liệu.");
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Patient dropdown selection header */}
      <div className="bg-white border border-sage-200/60 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-sage-950">
            Bệnh Án & Tiến Trình Phục Hồi Chức Năng
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Xem lịch sử các buổi tập, ghi chú của bác sĩ và bài tập phục hồi tại
            nhà.
          </p>
        </div>
        <div className="space-y-1.5 w-full sm:w-80">
          <label className="text-[9px] font-bold text-sage-400 uppercase tracking-widest block">
            Chọn hồ sơ bệnh nhân
          </label>
          <select
            value={selectedPatientName}
            onChange={(e) => setSelectedPatientName(e.target.value)}
            className="w-full p-2.5 border border-sage-250 bg-white text-xs font-bold text-sage-800 focus:outline-none focus:border-sage-800"
          >
            {patientRecords.map((rec) => (
              <option key={rec.guest} value={rec.guest}>
                {rec.guest} (Phòng {rec.room})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Records Detail View */}
      {activeRecord && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Timeline of treatments */}
          <div className="bg-white border border-sage-200/60 p-6 col-span-2 space-y-4">
            <div className="flex justify-between items-center border-b border-sage-100 pb-3">
              <h4 className="font-serif font-bold text-sage-900 text-sm">
                Bệnh nhân: {activeRecord.guest}
              </h4>
              <button
                onClick={() => setShowAddRecordModal(true)}
                className="px-3.5 py-2 bg-sage-950 hover:bg-sage-800 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Ghi chẩn đoán hôm nay</span>
              </button>
            </div>

            {/* Timeline of sessions */}
            <div className="relative border-l-2 border-sage-200 ml-4 pl-6 space-y-5 py-2">
              {activeRecord.history.map((hist, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-9.5 top-0 h-7 w-7 bg-white border-2 border-sage-950 flex items-center justify-center text-[10px] font-bold text-sage-950 font-mono">
                    {idx + 1}
                  </span>
                  <div className="bg-sage-50/30 border border-sage-150 p-4 rounded-none text-xs space-y-2">
                    <div className="flex justify-between items-center pb-1.5 border-b border-sage-100/50">
                      <span className="font-mono text-sage-400 font-bold">
                        {hist.date}
                      </span>
                      <span className="px-2 py-0.5 bg-sage-100 text-sage-800 border border-sage-200 text-[8px] font-bold uppercase tracking-wider">
                        Buổi điều trị {idx + 1}
                      </span>
                    </div>
                    <p className="text-sage-950 font-bold">
                      Lâm sàng:{" "}
                      <span className="font-normal text-sage-600">
                        {hist.symptoms}
                      </span>
                    </p>
                    <p className="text-sage-950 font-bold">
                      Chỉ định trị liệu:{" "}
                      <span className="font-normal text-sage-600">
                        {hist.therapy}
                      </span>
                    </p>
                    <div className="p-2.5 bg-green-50/50 text-green-800 border border-green-150 font-medium mt-1">
                      Đánh giá tiến triển: {hist.progress}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations of physician */}
          <div className="bg-white border border-sage-200/60 p-6 space-y-4">
            <h4 className="font-serif text-sm font-bold text-sage-900 border-b border-sage-100 pb-3 uppercase tracking-wide">
              Dặn Dò Của Bác Sĩ & Chuyên Gia
            </h4>
            <div className="p-4 bg-sage-50/50 text-sage-750 border border-sage-200 font-light text-xs leading-relaxed">
              {activeRecord.recommendations}
            </div>

            <div className="p-4 bg-red-50/50 border border-red-150 text-red-950 text-xs font-semibold space-y-1.5">
              <h5 className="font-bold text-red-750 flex items-center space-x-1 uppercase text-[10px] tracking-wider">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Lưu ý chống chỉ định:</span>
              </h5>
              <p className="font-light text-[11px] leading-relaxed text-red-800">
                Không chườm nóng nếu sưng đỏ khớp gối cấp. Tránh tư thế cúi lưng
                gập người quá mức (Flexion).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Clinical Physio Record Modal */}
      {showAddRecordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-md w-full p-6 sm:p-8 border border-sage-200 shadow-2xl relative">
            <button
              onClick={() => setShowAddRecordModal(false)}
              className="absolute top-4 right-4 p-2 text-sage-400 hover:text-sage-900 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-base font-bold text-sage-950 mb-4 flex items-center space-x-2">
              <Clipboard className="h-5 w-5 text-sage-800" />
              <span>Ghi Bệnh Án Buổi Hôm Nay: {selectedPatientName}</span>
            </h3>

            <form
              onSubmit={handleAddClinicalRecord}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1.5">
                <label className="font-semibold text-sage-800">
                  Triệu chứng lâm sàng *
                </label>
                <input
                  type="text"
                  value={newPhysioRecord.symptoms}
                  onChange={(e) =>
                    setNewPhysioRecord((prev) => ({
                      ...prev,
                      symptoms: e.target.value,
                    }))
                  }
                  placeholder="Ví dụ: Đau thắt lưng lan chân, cơ co thắt, VAS 5/10"
                  className="w-full p-2.5 border border-sage-200 bg-white text-sage-900 focus:outline-none focus:border-sage-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-sage-800">
                  Chỉ định trị liệu hôm nay *
                </label>
                <input
                  type="text"
                  value={newPhysioRecord.therapy}
                  onChange={(e) =>
                    setNewPhysioRecord((prev) => ({
                      ...prev,
                      therapy: e.target.value,
                    }))
                  }
                  placeholder="Ví dụ: Di quang học laser 12 phút + Kéo giãn"
                  className="w-full p-2.5 border border-sage-200 bg-white text-sage-900 focus:outline-none focus:border-sage-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-sage-800">
                  Đánh giá tiến triển sau buổi điều trị
                </label>
                <textarea
                  value={newPhysioRecord.progress}
                  onChange={(e) =>
                    setNewPhysioRecord((prev) => ({
                      ...prev,
                      progress: e.target.value,
                    }))
                  }
                  rows="2"
                  placeholder="Ví dụ: Cơ thắt lưng mềm dịu hơn, VAS giảm còn 3/10"
                  className="w-full p-2.5 border border-sage-200 bg-white text-sage-950 font-light focus:outline-none focus:border-sage-800"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-sage-100">
                <button
                  type="button"
                  onClick={() => setShowAddRecordModal(false)}
                  className="px-4 py-2 border border-sage-200 hover:bg-sage-50 text-sage-800 rounded-none font-bold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sage-950 text-white rounded-none font-bold hover:bg-sage-850 cursor-pointer"
                >
                  Lưu bệnh án
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
