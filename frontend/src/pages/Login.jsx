import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Leaf } from "lucide-react";
import heroBg from "../assets/hero_bg.png";
import { signInWithPopup } from "firebase/auth";

import { auth, googleProvider } from "../firebase";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
      console.log("Đang gửi thông tin Google tới Backend...");
      const response = await fetch(`${apiBaseUrl}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          fullName: user.displayName || "Google User",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("userFullName", data.fullName);

        alert(`Đăng nhập Google thành công! Chào mừng ${data.fullName}`);
        
        // Điều hướng dựa trên vai trò từ backend
        const role = data.role.toUpperCase();
        localStorage.removeItem("specialistRole");

        if (role === "ADMIN" || role === "MANAGER") {
          navigate("/admin");
        } else if (role === "RECEPTIONIST" || role === "STAFF") {
          navigate("/staff");
        } else if (role === "CHEF") {
          navigate("/chef");
        } else if (role === "SPA") {
          localStorage.setItem("specialistRole", "spa");
          navigate("/specialist");
        } else if (role === "YOGA") {
          localStorage.setItem("specialistRole", "yoga");
          navigate("/specialist");
        } else if (role === "PHYSIO" || role === "THERAPIST") {
          localStorage.setItem("specialistRole", "physio");
          navigate("/specialist");
        } else {
          navigate("/");
        }
      } else {
        setError(data.message || "Đăng nhập Google qua Backend thất bại.");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập Google:", error);
      setError(error.message || "Lỗi kết nối hệ thống. Không thể đăng nhập bằng Google.");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Vui lòng điền đầy đủ các thông tin đăng nhập.");
      return;
    }
    setError("");

    const normalizedEmail = email.toLowerCase();
    
    // Tự động thêm hậu tố email nếu người dùng chỉ gõ tên đăng nhập giả lập (như admin, staff...)
    let loginEmail = email;
    if (!email.includes("@")) {
      if (email === "admin") loginEmail = "admin@nguson.com";
      else if (email === "staff") loginEmail = "staff@nguson.com";
      else if (email === "chef") loginEmail = "chef@nguson.com";
      else if (email === "spa") loginEmail = "spa@nguson.com";
      else if (email === "yoga") loginEmail = "yoga@nguson.com";
      else if (email === "physio") loginEmail = "physio@nguson.com";
    }

    // Kiểm tra định dạng email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginEmail)) {
      setError("Định dạng Email không hợp lệ (ví dụ: example@gmail.com).");
      return;
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
      console.log(`Đang kết nối tới Backend tại ${apiBaseUrl}/auth/login ...`);
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: loginEmail, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Đăng nhập thành công từ backend thật
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("userFullName", data.fullName);

        alert(`Đăng nhập hệ thống thành công! Chào mừng ${data.fullName}`);
        
        // Điều hướng dựa trên vai trò từ backend
        const role = data.role.toUpperCase();
        localStorage.removeItem("specialistRole");

        if (role === "ADMIN" || role === "MANAGER") {
          navigate("/admin");
        } else if (role === "RECEPTIONIST" || role === "STAFF") {
          navigate("/staff");
        } else if (role === "CHEF") {
          navigate("/chef");
        } else if (role === "SPA") {
          localStorage.setItem("specialistRole", "spa");
          navigate("/specialist");
        } else if (role === "YOGA") {
          localStorage.setItem("specialistRole", "yoga");
          navigate("/specialist");
        } else if (role === "PHYSIO" || role === "THERAPIST") {
          localStorage.setItem("specialistRole", "physio");
          navigate("/specialist");
        } else {
          navigate("/");
        }
        return;
      } else {
        // Backend trả về lỗi (ví dụ: sai mật khẩu, tài khoản không tồn tại)
        setError(data.message || "Tên đăng nhập hoặc mật khẩu không đúng.");
        return;
      }
    } catch (err) {
      console.error("Không kết nối được với Backend:", err);
      setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.");
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* Dark organic overlay */}
      <div className="absolute inset-0 bg-[#233827]/40 backdrop-blur-sm" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-md border border-primary-100/50 rounded-[32px] shadow-2xl p-8 sm:p-10 transition-all duration-300">
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
            Chào Mừng Trở Lại
          </h2>
          <p className="text-xs sm:text-sm text-sage-600 mt-2">
            Đăng nhập để tiếp tục quản lý kỳ nghỉ dưỡng trị liệu của bạn
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-xs sm:text-sm border border-red-100">
            {error}
          </div>
        )}

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email / Username field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-sage-800 uppercase tracking-wider block">
              Email / Số Điện Thoại
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sage-400">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-primary-200/50 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent text-sm text-sage-900 placeholder-sage-400 transition-all duration-200"
              />
            </div>
          </div>

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
                className="w-full pl-11 pr-11 py-3 rounded-2xl border border-primary-200/50 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent text-sm text-sage-900 placeholder-sage-400 transition-all duration-200"
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

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 text-sage-700 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-primary-300 text-primary-900 focus:ring-primary-900 cursor-pointer"
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <Link
              to="/quen-mat-khau"
              className="font-semibold text-primary-900 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl text-sm font-semibold bg-primary-900 hover:bg-primary-800 text-white shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer mt-6"
          >
            Đăng Nhập
          </button>
        </form>

        {/* Social Login Division */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-primary-200/50"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/95 px-3.5 text-sage-500 font-semibold tracking-wider">
              Hoặc đăng nhập bằng
            </span>
          </div>
        </div>

        {/* Social Login Button */}
        <div className="w-full">
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center space-x-2 py-3 border border-primary-200/50 rounded-2xl bg-white/70 hover:bg-white text-xs font-semibold text-sage-800 hover:shadow-sm transition-all duration-200 cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-7.989 0-4.41 3.529-7.989 7.859-7.989 2.463 0 4.116 1.015 5.054 1.916l3.257-3.132C18.318 1.928 15.538 1 12.24 1 5.922 1 1 5.922 1 12.24s4.922 11.24 11.24 11.24c6.598 0 10.985-4.636 10.985-11.168 0-.751-.081-1.326-.18-1.742H12.24z"
              />
            </svg>
            <span>Đăng nhập với Google</span>
          </button>
        </div>

        {/* Link to Register */}
        <div className="text-center mt-8 pt-4 border-t border-primary-100/50 text-xs sm:text-sm">
          <span className="text-sage-600">Bạn chưa có tài khoản? </span>
          <Link
            to="/dang-ky"
            className="font-bold text-primary-900 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
