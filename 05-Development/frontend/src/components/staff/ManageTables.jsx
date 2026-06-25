import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, Users, CheckCircle, XCircle, LogOut } from 'lucide-react';

export default function ManageTables({ tables, setTables }) {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [bookingError, setBookingError] = useState('');

  // Lọc bàn theo trạng thái để hiển thị thống kê
  const availableTables = tables.filter(t => t.status === 'Available');
  const occupiedTables = tables.filter(t => t.status === 'Occupied');

  const handleBookTable = (e) => {
    e.preventDefault();
    setBookingError('');

    if (!guestName.trim()) {
      setBookingError('Vui lòng nhập tên khách hàng.');
      return;
    }

    if (guestCount < 1) {
      setBookingError('Số lượng khách phải lớn hơn 0.');
      return;
    }

    // Thuật toán: Tìm bàn trống có capacity >= guestCount, chọn bàn có capacity nhỏ nhất (để tối ưu)
    const suitableTables = availableTables
      .filter(t => t.capacity >= guestCount)
      .sort((a, b) => a.capacity - b.capacity);

    if (suitableTables.length === 0) {
      setBookingError(`Không tìm thấy bàn trống nào có sức chứa đủ cho ${guestCount} người.`);
      return;
    }

    const assignedTable = suitableTables[0]; // Chọn bàn vừa nhất

    // Cập nhật trạng thái bàn
    setTables(prev => prev.map(t => 
      t.id === assignedTable.id 
        ? { ...t, status: 'Occupied', guestName: guestName } 
        : t
    ));

    alert(`Xếp bàn thành công! Đã xếp khách ${guestName} (${guestCount} người) vào bàn ${assignedTable.id} (Sức chứa: ${assignedTable.capacity}).`);
    
    // Đóng modal và reset form
    setShowBookingModal(false);
    setGuestName('');
    setGuestCount(1);
  };

  const handleReleaseTable = (tableId) => {
    if (confirm(`Bạn có chắc chắn muốn kết thúc phục vụ và dọn bàn ${tableId}?`)) {
      setTables(prev => prev.map(t => 
        t.id === tableId 
          ? { ...t, status: 'Available', guestName: '' } 
          : t
      ));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header & Stats */}
      <div className="bg-white border border-primary-100 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-sage-950 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            Sơ Đồ Bàn (Table Map)
          </h3>
          <p className="text-xs text-sage-500 mt-1">
            Tổng: {tables.length} bàn | Trống: {availableTables.length} | Đang phục vụ: {occupiedTables.length}
          </p>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="px-4 py-2 bg-primary-800 hover:bg-primary-900 text-white rounded-none text-xs font-semibold uppercase tracking-wider cursor-pointer flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Đặt Bàn Nhanh
        </button>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map(table => (
          <div 
            key={table.id} 
            className={`p-4 border flex flex-col justify-between rounded-lg relative overflow-hidden transition-all duration-300 ${
              table.status === 'Available' 
                ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-400' 
                : 'bg-red-50/50 border-red-200 hover:border-red-400'
            }`}
          >
            {/* Status indicator line */}
            <div className={`absolute top-0 left-0 w-full h-1 ${
              table.status === 'Available' ? 'bg-emerald-500' : 'bg-red-500'
            }`} />

            <div className="flex justify-between items-start mb-4 mt-1">
              <span className="font-bold text-lg text-gray-800">{table.id}</span>
              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1 ${
                table.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {table.status === 'Available' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {table.status === 'Available' ? 'Trống' : 'Đang Dùng'}
              </span>
            </div>

            <div className="space-y-3 flex-grow">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Users className="w-4 h-4" />
                <span>Sức chứa: <strong>{table.capacity}</strong> người</span>
              </div>
              
              {table.status === 'Occupied' && (
                <div className="bg-white/60 p-2 rounded border border-red-100 text-xs">
                  <span className="text-gray-500 block text-[10px] uppercase">Khách hàng:</span>
                  <span className="font-bold text-gray-800">{table.guestName}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            {table.status === 'Occupied' && (
              <button
                onClick={() => handleReleaseTable(table.id)}
                className="mt-4 w-full py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors flex items-center justify-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                Trả bàn
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl rounded-none">
            <div className="flex justify-between items-center border-b border-primary-50 pb-3 mb-5">
              <h3 className="font-serif text-lg font-bold text-sage-950 flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary-700" />
                Xếp Bàn Tự Động
              </h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-sage-400 hover:text-sage-900 cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {bookingError && (
              <div className="bg-red-50 border border-red-200 p-3 text-xs text-red-700 mb-4 rounded">
                {bookingError}
              </div>
            )}

            <form onSubmit={handleBookTable} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Tên khách hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Nhập tên khách..."
                  className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-sage-50/30"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">
                  Số lượng người <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 border border-primary-100 text-xs focus:outline-primary-200 bg-sage-50/30"
                />
              </div>

              <div className="bg-blue-50 text-blue-800 p-3 text-[11px] rounded border border-blue-100 mt-2">
                <strong>Thuật toán:</strong> Hệ thống sẽ tự động tìm bàn <strong>Trống</strong> có sức chứa <strong>lớn hơn hoặc bằng</strong> số người và ưu tiên bàn nhỏ nhất phù hợp để tiết kiệm không gian.
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-primary-50">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 border border-primary-100 text-xs font-semibold uppercase tracking-wider hover:bg-primary-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-900 cursor-pointer"
                >
                  Xếp Bàn Nhanh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
