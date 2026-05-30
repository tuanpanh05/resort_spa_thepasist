import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Leaf,
} from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ tất cả các thông tin.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (!agreeTerms) {
      setError("Bạn cần đồng ý với các Điều khoản & Chính sách của Resort.");
      return;
    }
    setError("");
    // Mock registration
    alert(
      "Đăng ký thành công! Chào mừng thành viên mới đến với Ngũ Sơn Resort.",
    );
    navigate("/dang-nhap");
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
      style={{ backgroundImage: "url('/hero_bg.png')" }}
    >
      {/* Dark organic overlay */}
      <div className="absolute inset-0 bg-[#233827]/40 backdrop-blur-sm" />

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-lg bg-white/90 backdrop-blur-md border border-primary-100/50 rounded-[32px] shadow-2xl p-8 sm:p-10 transition-all duration-300">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-sage-600 hover:text-primary-900 transition-colors duration-200 mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Quay lại trang chủ</span>
        </Link>

        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary-100 rounded-full text-primary-900 mb-3 shadow-sm">
            <Leaf className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900">
            Đăng Ký Thành Viên
          </h2>
          <p className="text-xs sm:text-sm text-sage-600 mt-2">
            Trở thành hội viên để nhận đặc quyền và ưu đãi nghỉ dưỡng tốt nhất
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-xs sm:text-sm border border-red-100">
            {error}
          </div>
        )}

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-sage-800 uppercase tracking-wider block">
              Họ và Tên
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sage-400">
                <User className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-primary-200/50 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent text-sm text-sage-900 placeholder-sage-400 transition-all duration-200"
              />
            </div>
          </div>

          {/* Grid for Email and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-sage-800 uppercase tracking-wider block">
                Địa Chỉ Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sage-400">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-primary-200/50 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent text-sm text-sage-900 placeholder-sage-400 transition-all duration-200"
                />
              </div>
            </div>

            {/* Phone field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-sage-800 uppercase tracking-wider block">
                Số Điện Thoại
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sage-400">
                  <Phone className="h-4.5 w-4.5" />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-primary-200/50 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent text-sm text-sage-900 placeholder-sage-400 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Grid for Password and Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-sage-800 uppercase tracking-wider block">
                Mật Khẩu
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sage-400">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-2.5 rounded-2xl border border-primary-200/50 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent text-sm text-sage-900 placeholder-sage-400 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-sage-400 hover:text-sage-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-sage-800 uppercase tracking-wider block">
                Nhập Lại Mật Khẩu
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sage-400">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-2.5 rounded-2xl border border-primary-200/50 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent text-sm text-sage-900 placeholder-sage-400 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-sage-400 hover:text-sage-600 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="pt-2">
            <label className="flex items-start space-x-2 text-xs text-sage-700 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-primary-300 text-primary-900 focus:ring-primary-900 cursor-pointer"
              />
              <span className="leading-normal">
                Tôi đồng ý với các{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      "Chính sách bảo mật của Ngũ Sơn Resort bảo vệ tuyệt đối thông tin của hội viên.",
                    );
                  }}
                  className="font-semibold text-primary-900 hover:underline"
                >
                  Chính sách bảo mật
                </a>{" "}
                và{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      "Điều khoản hội viên bao gồm các quy định về tích điểm và đặt phòng.",
                    );
                  }}
                  className="font-semibold text-primary-900 hover:underline"
                >
                  Điều khoản hội viên
                </a>{" "}
                của khu nghỉ dưỡng.
              </span>
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl text-sm font-semibold bg-primary-900 hover:bg-primary-800 text-white shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer mt-6"
          >
            Đăng Ký Tài Khoản
          </button>
        </form>

        {/* Link to Login */}
        <div className="text-center mt-8 pt-4 border-t border-primary-100/50 text-xs sm:text-sm">
          <span className="text-sage-600">Bạn đã có tài khoản? </span>
          <Link
            to="/dang-nhap"
            className="font-bold text-primary-900 hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
