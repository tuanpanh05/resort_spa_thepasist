import React from "react";

export default function ManageEquipment({
  activeRole,
  yogaEquipment,
  setYogaEquipment,
  physioEquipment,
  setPhysioEquipment,
}) {
  // Handlers
  const handleEquipmentClean = (name) => {
    setYogaEquipment((prev) =>
      prev.map((eq) => {
        if (eq.name === name && eq.laundry > 0) {
          alert(`Đã vệ sinh sạch sẽ thảm/dây đai tập: ${name}`);
          return { ...eq, clean: eq.clean + 1, laundry: eq.laundry - 1 };
        }
        return eq;
      }),
    );
  };

  const handleToggleMachineStatus = (code) => {
    setPhysioEquipment((prev) =>
      prev.map((eq) => {
        if (eq.code === code) {
          const nextStatus =
            eq.status === "Available"
              ? "Under Maintenance"
              : eq.status === "Under Maintenance"
                ? "Occupied"
                : "Available";
          return { ...eq, status: nextStatus };
        }
        return eq;
      }),
    );
  };

  // --- YOGA ROLE ---
  if (activeRole === "yoga") {
    return (
      <div className="space-y-6 animate-fade-in text-left">
        <div className="bg-white border border-sage-200/60 p-6">
          <h3 className="font-serif text-lg font-bold text-sage-950">
            Quản Lý Thảm Tập & Thiết Bị Yoga
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Giám sát lượng thảm đang giặt sấy (laundry), thảm sạch sẵn dùng và
            thảm hỏng cần thanh lý.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {yogaEquipment.map((eq) => (
            <div
              key={eq.name}
              className="bg-white border border-sage-200 p-5 flex flex-col justify-between h-52"
            >
              <div>
                <h4 className="font-bold text-sage-800 text-xs uppercase tracking-wider">
                  {eq.name}
                </h4>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="bg-sage-50 p-2 border border-sage-200">
                    <span className="text-[10px] text-sage-600 font-bold block">
                      Sạch
                    </span>
                    <strong className="text-base font-bold text-sage-900 font-mono">
                      {eq.clean}
                    </strong>
                  </div>
                  <div className="bg-amber-50 p-2 border border-amber-200">
                    <span className="text-[10px] text-amber-700 font-bold block">
                      Giặt
                    </span>
                    <strong className="text-base font-bold text-amber-900 font-mono">
                      {eq.laundry}
                    </strong>
                  </div>
                  <div className="bg-sage-50/20 p-2 border border-sage-150">
                    <span className="text-[10px] text-sage-500 font-bold block">
                      Tổng
                    </span>
                    <strong className="text-base font-bold text-sage-800 font-mono">
                      {eq.total}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 border-t border-sage-100 flex justify-between items-center mt-3">
                <span className="text-[9px] text-sage-400">Giặt sấy xong?</span>
                <button
                  onClick={() => handleEquipmentClean(eq.name)}
                  disabled={eq.laundry === 0}
                  className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                    eq.laundry === 0
                      ? "bg-sage-50 text-sage-300 border border-sage-150 cursor-not-allowed"
                      : "bg-sage-950 text-white hover:bg-sage-850"
                  }`}
                >
                  Trả thảm sạch
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- PHYSIO ROLE ---
  if (activeRole === "physio") {
    return (
      <div className="space-y-6 animate-fade-in text-left">
        <div className="bg-white border border-sage-200/60 p-6">
          <h3 className="font-serif text-lg font-bold text-sage-950">
            Giám Sát Thiết Bị Máy Móc Trị Liệu
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Giám sát trạng thái hoạt động và đổi trạng thái bảo trì đối với các
            máy kéo cột sống, máy laser phục hồi chức năng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {physioEquipment.map((eq) => (
            <div
              key={eq.code}
              className="bg-white border border-sage-200 p-5 flex flex-col justify-between h-52"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-bold text-sage-400 font-mono uppercase">
                    {eq.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                      eq.status === "Available"
                        ? "bg-green-50 text-green-700 border border-green-150"
                        : eq.status === "Under Maintenance"
                          ? "bg-red-50 text-red-700 border border-red-150"
                          : "bg-blue-50 text-blue-800 border border-blue-150"
                    }`}
                  >
                    {eq.status === "Available"
                      ? "Hoạt động tốt"
                      : eq.status === "Under Maintenance"
                        ? "Bảo trì"
                        : "Đang sử dụng"}
                  </span>
                </div>
                <h4 className="font-serif text-sage-800 text-sm font-bold leading-tight mt-1.5">
                  {eq.name}
                </h4>
                <span className="text-[10px] text-sage-550 block mt-2">
                  Giờ tích lũy:{" "}
                  <strong className="text-sage-750 font-mono">
                    {eq.usageHours} giờ
                  </strong>
                </span>
              </div>

              <div className="pt-3 border-t border-sage-100 flex justify-between items-center mt-3">
                <span className="text-[9px] text-sage-400">
                  Tác vụ kỹ thuật
                </span>
                <button
                  onClick={() => handleToggleMachineStatus(eq.code)}
                  className="px-2.5 py-1.5 bg-white hover:bg-sage-50 border border-sage-250 text-sage-800 text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Đổi trạng thái
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
