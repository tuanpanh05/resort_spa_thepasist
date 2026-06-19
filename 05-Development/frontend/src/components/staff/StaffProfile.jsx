import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Shield, Calendar, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { userApi } from "../../api";

export default function StaffProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const userProfile = await userApi.getProfile();
      setProfile(userProfile);
    } catch (err) {
      console.error("Error loading profile:", err);
      setError(err.message || "Không thể tải thông tin hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-sage-500">
        <Loader2 className="h-8 w-8 animate-spin text-primary-800 mb-3" />
        <span className="text-sm">Đang tải hồ sơ nhân viên...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-5 flex items-start gap-3 text-red-700 text-xs sm:text-sm">
        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">Đã xảy ra lỗi</h4>
          <p className="mt-1">{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded font-semibold text-xs transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-left max-w-4xl mx-auto">
      {/* Page Title Banner */}
      <div className="bg-white border border-primary-100 p-6">
        <h3 className="font-serif text-xl font-normal text-sage-950">
          Hồ Sơ Nhân Viên
        </h3>
        <p className="text-xs text-sage-500 mt-1">
          Thông tin chi tiết về tài khoản làm việc của bạn trong hệ thống vận hành Ngũ Sơn Resort.
        </p>
      </div>

      <div className="bg-white border border-primary-100 p-8 shadow-xs flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* Profile Avatar Card */}
        <div className="w-full md:w-1/3 text-center pb-6 md:pb-0 md:border-r border-primary-50 md:pr-8">
          <div className="w-24 h-24 bg-primary-900 text-white text-3xl font-bold font-serif rounded-full flex items-center justify-center shadow-md mx-auto mb-4">
            {profile?.fullName ? profile.fullName.split(" ").slice(-2).map(w => w[0]).join("").toUpperCase() : "NV"}
          </div>
          <h4 className="font-serif text-lg font-bold text-sage-950">
            {profile?.fullName}
          </h4>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-900 mt-3 uppercase tracking-wider">
            <Shield className="h-3.5 w-3.5" />
            {profile?.role === "STAFF" ? "Nhân viên Lễ tân" : profile?.role === "ADMIN" ? "Quản trị viên" : profile?.role}
          </span>
        </div>

        {/* Profile Info Details */}
        <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="flex items-center space-x-3 text-sage-700 p-3 bg-primary-50/20 border border-primary-50/50">
            <Mail className="h-5 w-5 text-sage-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-sage-400 block uppercase tracking-wider">Email</span>
              <span className="font-medium text-sage-900 truncate block">{profile?.email}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-sage-700 p-3 bg-primary-50/20 border border-primary-50/50">
            <Phone className="h-5 w-5 text-sage-400 shrink-0" />
            <div>
              <span className="text-[10px] text-sage-400 block uppercase tracking-wider">Số điện thoại</span>
              <span className="font-medium text-sage-900">{profile?.phone || "—"}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-sage-700 p-3 bg-primary-50/20 border border-primary-50/50">
            <Calendar className="h-5 w-5 text-sage-400 shrink-0" />
            <div>
              <span className="text-[10px] text-sage-400 block uppercase tracking-wider">Ngày gia nhập</span>
              <span className="font-medium text-sage-900">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("vi-VN") : "—"}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-sage-700 p-3 bg-primary-50/20 border border-primary-50/50">
            <CheckCircle className="h-5 w-5 text-sage-400 shrink-0" />
            <div>
              <span className="text-[10px] text-sage-400 block uppercase tracking-wider">Trạng thái</span>
              <span className="font-semibold text-green-700">{profile?.status === "ACTIVE" ? "Đang hoạt động" : profile?.status}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-sage-700 p-3 bg-primary-50/20 border border-primary-50/50 sm:col-span-2">
            <User className="h-5 w-5 text-sage-400 shrink-0" />
            <div>
              <span className="text-[10px] text-sage-400 block uppercase tracking-wider">Bộ phận / Phòng ban</span>
              <span className="font-medium text-sage-900">Bộ phận Lễ tân & Vận hành Dịch vụ Resort</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
