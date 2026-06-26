import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Crown } from "lucide-react";
import heroBg from "../assets/hero_bg.png";
import { signInWithPopup } from "firebase/auth";

import { auth, googleProvider } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState(() => localStorage.getItem("rememberedEmail") || "");
  const [password, setPassword] = useState(() => localStorage.getItem("rememberedPassword") || "");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem("rememberedEmail"));
  const [error, setError] = useState("");
  
  // Custom states for animated floating placeholders
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in to redirect away
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      const role = (localStorage.getItem("userRole") || sessionStorage.getItem("userRole") || "").toUpperCase();
      if (role === "ADMIN" || role === "MANAGER") {
        navigate("/admin", { replace: true });
      } else if (role === "RECEPTIONIST" || role === "STAFF") {
        navigate("/staff", { replace: true });
      } else if (role === "CHEF") {
        navigate("/chef", { replace: true });
      } else if (role === "SPA" || role === "YOGA" || role === "PHYSIO" || role === "THERAPIST") {
        navigate("/specialist", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
      return;
    }

    // Trigger entry animations sequentially on mount
    setMounted(true);
  }, [navigate]);

  const emailActive = emailFocused || email.length > 0;
  const passwordActive = passwordFocused || password.length > 0;

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
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("token", data.token);
        storage.setItem("userEmail", data.email);
        storage.setItem("userRole", data.role);
        storage.setItem("userFullName", data.fullName);

        if (rememberMe) {
          localStorage.setItem("rememberedEmail", user.email);
          localStorage.removeItem("rememberedPassword");
        } else {
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberedPassword");
        }

        alert(`Đăng nhập Google thành công! Chào mừng ${data.fullName}`);
        
        const role = data.role.toUpperCase();
        localStorage.removeItem("specialistRole");
        sessionStorage.removeItem("specialistRole");

        if (role === "ADMIN" || role === "MANAGER") {
          navigate("/admin");
        } else if (role === "RECEPTIONIST" || role === "STAFF") {
          navigate("/staff");
        } else if (role === "CHEF") {
          navigate("/chef");
        } else if (role === "SPA") {
          storage.setItem("specialistRole", "spa");
          navigate("/specialist");
        } else if (role === "YOGA") {
          storage.setItem("specialistRole", "yoga");
          navigate("/specialist");
        } else if (role === "PHYSIO" || role === "THERAPIST") {
          storage.setItem("specialistRole", "physio");
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
    
    let loginEmail = email;
    if (!email.includes("@")) {
      if (email === "admin") loginEmail = "admin@nguson.com";
      else if (email === "staff") loginEmail = "staff@nguson.com";
      else if (email === "chef") loginEmail = "chef@nguson.com";
      else if (email === "spa") loginEmail = "spa@nguson.com";
      else if (email === "yoga") loginEmail = "yoga@nguson.com";
      else if (email === "physio") loginEmail = "physio@nguson.com";
    }

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
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("token", data.token);
        storage.setItem("userEmail", data.email);
        storage.setItem("userRole", data.role);
        storage.setItem("userFullName", data.fullName);

        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
          localStorage.setItem("rememberedPassword", password);
        } else {
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberedPassword");
        }

        alert(`Đăng nhập hệ thống thành công! Chào mừng ${data.fullName}`);
        
        const role = data.role.toUpperCase();
        localStorage.removeItem("specialistRole");
        sessionStorage.removeItem("specialistRole");

        if (role === "ADMIN" || role === "MANAGER") {
          navigate("/admin");
        } else if (role === "RECEPTIONIST" || role === "STAFF") {
          navigate("/staff");
        } else if (role === "CHEF") {
          navigate("/chef");
        } else if (role === "SPA") {
          storage.setItem("specialistRole", "spa");
          navigate("/specialist");
        } else if (role === "YOGA") {
          storage.setItem("specialistRole", "yoga");
          navigate("/specialist");
        } else if (role === "PHYSIO" || role === "THERAPIST") {
          storage.setItem("specialistRole", "physio");
          navigate("/specialist");
        } else {
          navigate("/");
        }
        return;
      } else {
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
      {/* Light warm ivory cover overlay with blur */}
      <div className="absolute inset-0 bg-[#faf8f5]/85 backdrop-blur-md" />

      {/* Login Card (Ivory glass container) */}
      <div 
        className={`relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl border border-[#cda250]/25 rounded-2xl shadow-[0_30px_70px_rgba(26,44,34,0.08)] p-8 sm:p-10 transition-all duration-[1200ms] ease-out transform ${
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        
        {/* Back button */}
        <div 
          className={`transition-all duration-700 transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "100ms" }}
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-sage-600 hover:text-[#b28a50] transition-colors duration-200 mb-6 group cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            <span>Quay lại trang chủ</span>
          </Link>
        </div>

        {/* Branding Header */}
        <div 
          className={`text-center mb-8 space-y-3 transition-all duration-700 transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "200ms" }}
        >
          <div className="inline-flex p-3 bg-[#faf8f5] border border-[#cda250]/25 rounded-lg text-[#b28a50] mb-1 animate-pulse">
            <Crown className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1a2f23] tracking-wide">
            Chào Mừng Trở Lại
          </h2>
          <p className="text-xs text-sage-650 font-light leading-relaxed">
            Đăng nhập tài khoản để tiếp tục hành trình chăm sóc sức khỏe hoàng gia tại Ngũ Sơn Resort.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div 
            className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 text-xs sm:text-sm border border-red-200 animate-fade-in"
          >
            {error}
          </div>
        )}

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          
          {/* Email / Username field */}
          <div 
            className={`space-y-1.5 transition-all duration-700 transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: "300ms" }}
          >
            <div className="relative border-b border-[#cda250]/30 focus-within:border-[#b28a50] transition-colors duration-300 py-2">
              <label 
                className={`absolute left-9 transition-all duration-300 pointer-events-none ${
                  emailActive 
                    ? "-top-3.5 text-[#b28a50] text-[9px] font-bold uppercase tracking-wider" 
                    : "top-2 text-sage-500 text-xs font-light"
                }`}
              >
                Email / Số Điện Thoại
              </label>
              <span className="absolute left-0 top-2 flex items-center text-[#b28a50]/70">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                value={email}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                className="w-full pl-9 pr-4 bg-transparent focus:outline-none text-sm text-[#1a2f23] transition-all duration-200"
              />
            </div>
          </div>

          {/* Password field */}
          <div 
            className={`space-y-1.5 transition-all duration-700 transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: "400ms" }}
          >
            <div className="relative border-b border-[#cda250]/30 focus-within:border-[#b28a50] transition-colors duration-300 py-2">
              <label 
                className={`absolute left-9 transition-all duration-300 pointer-events-none ${
                  passwordActive 
                    ? "-top-3.5 text-[#b28a50] text-[9px] font-bold uppercase tracking-wider" 
                    : "top-2 text-sage-500 text-xs font-light"
                }`}
              >
                Mật Khẩu
              </label>
              <span className="absolute left-0 top-2 flex items-center text-[#b28a50]/70">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full pl-9 pr-12 bg-transparent focus:outline-none text-sm text-[#1a2f23] transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-1 flex items-center text-sage-400 hover:text-[#b28a50] focus:outline-none cursor-pointer"
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
          <div 
            className={`flex items-center justify-between text-xs pt-1 transition-all duration-700 transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: "500ms" }}
          >
            <label className="flex items-center space-x-2 text-sage-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded-sm border-[#cda250]/40 bg-transparent text-[#b28a50] focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <Link
              to="/quen-mat-khau"
              className="font-bold text-[#b28a50] hover:text-[#1a2f23] transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit button */}
          <div 
            className={`transition-all duration-700 transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: "600ms" }}
          >
            <button
              type="submit"
              className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-[#cda250] to-[#b1893c] hover:from-[#d9b360] hover:to-[#c29a4a] text-[#070e0a] shadow-md shadow-[#cda250]/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer mt-4"
            >
              Đăng Nhập
            </button>
          </div>
        </form>

        {/* Social Login Division */}
        <div 
          className={`relative my-8 transition-all duration-700 transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "700ms" }}
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#cda250]/15"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-white px-4 text-sage-500 font-bold">
              Hoặc đăng nhập bằng
            </span>
          </div>
        </div>

        {/* Social Login Button */}
        <div 
          className={`w-full transition-all duration-700 transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "800ms" }}
        >
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center space-x-2.5 py-3.5 rounded-xl border border-[#cda250]/30 hover:border-[#b28a50] bg-[#faf8f5] hover:bg-[#faf8f5]/60 text-xs font-bold text-sage-800 hover:shadow-sm transition-all duration-300 cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-7.989 0-4.41 3.529-7.989 7.859-7.989 2.463 0 4.116 1.015 5.054 1.916l3.257-3.132C18.318 1.928 15.538 1 12.24 1 5.922 1 12.24s4.922 11.24 11.24 11.24c6.598 0 10.985-4.636 10.985-11.168 0-.751-.081-1.326-.18-1.742H12.24z"
              />
            </svg>
            <span>Đăng nhập với Google</span>
          </button>
        </div>

        {/* Link to Register */}
        <div 
          className={`text-center mt-8 pt-4 border-t border-[#cda250]/15 text-xs transition-all duration-700 transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "900ms" }}
        >
          <span className="text-sage-500">Bạn chưa có tài khoản? </span>
          <Link
            to="/dang-ky"
            className="font-bold text-[#b28a50] hover:text-[#1a2f23] transition-colors"
          >
            Đăng ký ngay
          </Link>
        </div>

      </div>
    </div>
  );
}
