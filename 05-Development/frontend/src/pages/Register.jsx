import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Crown,
  Loader2,
} from "lucide-react";
import heroBg from "../assets/hero_bg.png";
import PolicyModal from "../components/PolicyModal";
import { authApi } from "../api";

export default function Register() {
  // Navigation & Multi-step
  const [step, setStep] = useState(1); // 1 = Form, 2 = OTP Verification
  const navigate = useNavigate();

  // Registration Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification State
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(59);
  const [isLoading, setIsLoading] = useState(false);
  const otpRefs = useRef([]);

  // Common UI State
  const [error, setError] = useState("");
  const [policyModal, setPolicyModal] = useState(null); // "privacy" | "terms" | null
  
  // Custom states for animated floating placeholders and entrance transitions
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [mounted, setMounted] = useState(false);

  const canResend = timer === 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  const nameActive = nameFocused || name.length > 0;
  const emailActive = emailFocused || email.length > 0;
  const phoneActive = phoneFocused || phone.length > 0;
  const passwordActive = passwordFocused || password.length > 0;
  const confirmActive = confirmFocused || confirmPassword.length > 0;

  // Countdown for OTP Step
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Focus first OTP input on step 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // OTP Input Handlers
  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const updated = [...otpCode];
    updated[index] = val.slice(-1);
    setOtpCode(updated);

    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const updated = [...otpCode];
      if (otpCode[index]) {
        updated[index] = "";
        setOtpCode(updated);
      } else if (index > 0) {
        updated[index - 1] = "";
        setOtpCode(updated);
        otpRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const updated = [...otpCode];
    pasted.split("").forEach((char, i) => {
      if (i < 6) updated[i] = char;
    });
    setOtpCode(updated);
    const nextFocus = Math.min(pasted.length, 5);
    otpRefs.current[nextFocus]?.focus();
  };

  // Submit Registration Form (Step 1)
  const handleSubmit = async (e) => {
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
    setIsLoading(true);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
      console.log(`Đang gửi yêu cầu đăng ký tới Backend tại ${apiBaseUrl}/auth/register ...`);
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: name,
          email,
          phone,
          password,
          idPassport: ""
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Đăng ký tài khoản thành công! Mã OTP kích hoạt đã được gửi tới email của bạn.");
        setStep(2);
        setTimer(59);
        setOtpCode(["", "", "", "", "", ""]);
      } else {
        setError(data.message || "Đăng ký không thành công. Vui lòng kiểm tra lại dữ liệu.");
      }
    } catch (err) {
      console.error("Không kết nối được với Backend:", err);
      setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Activation OTP (Step 2)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otpCode.join("");
    if (code.length < 6) {
      setError("Vui lòng nhập đầy đủ mã xác thực gồm 6 chữ số.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await authApi.verifyRegistration(email, code);
      alert("Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.");
      navigate("/dang-nhap");
    } catch (err) {
      setError(err.message || "Mã OTP không đúng hoặc đã hết hạn.");
      setOtpCode(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Activation OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setError("");
    setIsLoading(true);
    try {
      await authApi.resendVerification(email);
      setTimer(59);
      setOtpCode(["", "", "", "", "", ""]);
      alert("Mã OTP kích hoạt mới đã được gửi tới hòm thư của bạn.");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message || "Không thể gửi lại mã OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="min-h-screen relative flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        {/* Light warm ivory cover overlay with blur */}
        <div className="absolute inset-0 bg-[#faf8f5]/85 backdrop-blur-md" />

        {/* Register Card (Ivory glass container) */}
        <div 
          className={`relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-xl border border-[#cda250]/25 rounded-2xl shadow-[0_30px_70px_rgba(26,44,34,0.08)] p-8 sm:p-10 transition-all duration-[1200ms] ease-out transform ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          
          {/* Back / Navigation button */}
          <div 
            className={`transition-all duration-700 transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: "100ms" }}
          >
            {step === 1 ? (
              <Link
                to="/"
                className="inline-flex items-center space-x-2 text-xs font-semibold text-sage-600 hover:text-[#b28a50] transition-colors duration-200 mb-6 group cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                <span>Quay lại trang chủ</span>
              </Link>
            ) : (
              <button
                onClick={() => { setStep(1); setError(""); }}
                className="inline-flex items-center space-x-2 text-xs font-semibold text-sage-600 hover:text-[#b28a50] transition-colors duration-200 mb-6 group cursor-pointer border-none bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                <span>Quay lại đăng ký</span>
              </button>
            )}
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
              {step === 1 ? "Đăng Ký Thành Viên" : "Xác Thực Email"}
            </h2>
            <p className="text-xs text-sage-650 font-light leading-relaxed">
              {step === 1 
                ? "Trở thành hội viên để nhận đặc quyền và ưu đãi nghỉ dưỡng tốt nhất"
                : `Mã OTP kích hoạt tài khoản đã được gửi đến: ${email}`
              }
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 text-xs sm:text-sm border border-red-250 flex items-start gap-2 animate-fade-in">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Registration Form */}
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Full Name field */}
              <div 
                className={`space-y-1.5 transition-all duration-700 transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "300ms" }}
              >
                <div className="relative border-b border-[#cda250]/30 focus-within:border-[#b28a50] transition-colors duration-300 py-2">
                  <label 
                    className={`absolute left-9 transition-all duration-300 pointer-events-none ${
                      nameActive 
                        ? "-top-3.5 text-[#b28a50] text-[9px] font-bold uppercase tracking-wider" 
                        : "top-2 text-sage-500 text-xs font-light"
                    }`}
                  >
                    Họ và Tên
                  </label>
                  <span className="absolute left-0 top-2 flex items-center text-[#b28a50]/70">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    onChange={(e) => setName(e.target.value)}
                    placeholder=""
                    className="w-full pl-9 pr-4 bg-transparent focus:outline-none text-sm text-[#1a2f23] transition-all duration-200"
                  />
                </div>
              </div>

              {/* Grid for Email and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Email field */}
                <div 
                  className={`space-y-1.5 transition-all duration-700 transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{ transitionDelay: "400ms" }}
                >
                  <div className="relative border-b border-[#cda250]/30 focus-within:border-[#b28a50] transition-colors duration-300 py-2">
                    <label 
                      className={`absolute left-9 transition-all duration-300 pointer-events-none ${
                        emailActive 
                          ? "-top-3.5 text-[#b28a50] text-[9px] font-bold uppercase tracking-wider" 
                          : "top-2 text-sage-500 text-xs font-light"
                      }`}
                    >
                      Địa Chỉ Email
                    </label>
                    <span className="absolute left-0 top-2 flex items-center text-[#b28a50]/70">
                      <Mail className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=""
                      className="w-full pl-9 pr-4 bg-transparent focus:outline-none text-sm text-[#1a2f23] transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Phone field */}
                <div 
                  className={`space-y-1.5 transition-all duration-700 transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{ transitionDelay: "500ms" }}
                >
                  <div className="relative border-b border-[#cda250]/30 focus-within:border-[#b28a50] transition-colors duration-300 py-2">
                    <label 
                      className={`absolute left-9 transition-all duration-300 pointer-events-none ${
                        phoneActive 
                          ? "-top-3.5 text-[#b28a50] text-[9px] font-bold uppercase tracking-wider" 
                          : "top-2 text-sage-500 text-xs font-light"
                      }`}
                    >
                      Số Điện Thoại
                    </label>
                    <span className="absolute left-0 top-2 flex items-center text-[#b28a50]/70">
                      <Phone className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onFocus={() => setPhoneFocused(true)}
                      onBlur={() => setPhoneFocused(false)}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder=""
                      className="w-full pl-9 pr-4 bg-transparent focus:outline-none text-sm text-[#1a2f23] transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Grid for Password and Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Password field */}
                <div 
                  className={`space-y-1.5 transition-all duration-700 transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{ transitionDelay: "600ms" }}
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
                      placeholder=""
                      className="w-full pl-9 pr-11 bg-transparent focus:outline-none text-sm text-[#1a2f23] transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-1 flex items-center text-sage-400 hover:text-[#b28a50] focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password field */}
                <div 
                  className={`space-y-1.5 transition-all duration-700 transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{ transitionDelay: "700ms" }}
                >
                  <div className="relative border-b border-[#cda250]/30 focus-within:border-[#b28a50] transition-colors duration-300 py-2">
                    <label 
                      className={`absolute left-9 transition-all duration-300 pointer-events-none ${
                        confirmActive 
                          ? "-top-3.5 text-[#b28a50] text-[9px] font-bold uppercase tracking-wider" 
                          : "top-2 text-sage-500 text-xs font-light"
                      }`}
                    >
                      Nhập Lại Mật Khẩu
                    </label>
                    <span className="absolute left-0 top-2 flex items-center text-[#b28a50]/70">
                      <Lock className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onFocus={() => setConfirmFocused(true)}
                      onBlur={() => setConfirmFocused(false)}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder=""
                      className="w-full pl-9 pr-11 bg-transparent focus:outline-none text-sm text-[#1a2f23] transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-1 flex items-center text-sage-400 hover:text-[#b28a50] focus:outline-none cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms checkbox */}
              <div 
                className={`pt-2 transition-all duration-700 transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "800ms" }}
              >
                <label className="flex items-start space-x-2 text-xs text-sage-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded-sm border-[#cda250]/40 bg-transparent text-[#b28a50] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="leading-normal">
                    Tôi đồng ý với các{" "}
                    <button
                      type="button"
                      onClick={() => setPolicyModal("privacy")}
                      className="font-bold text-[#b28a50] hover:text-[#1a2f23] transition-colors bg-transparent border-none p-0 cursor-pointer"
                    >
                      Chính sách bảo mật
                    </button>{" "}
                    và{" "}
                    <button
                      type="button"
                      onClick={() => setPolicyModal("terms")}
                      className="font-bold text-[#b28a50] hover:text-[#1a2f23] transition-colors bg-transparent border-none p-0 cursor-pointer"
                    >
                      Điều khoản hội viên
                    </button>{" "}
                    của khu nghỉ dưỡng.
                  </span>
                </label>
              </div>

              {/* Submit button */}
              <div 
                className={`transition-all duration-700 transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "900ms" }}
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-[#cda250] to-[#b1893c] hover:from-[#d9b360] hover:to-[#c29a4a] text-[#070e0a] shadow-md shadow-[#cda250]/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer mt-4 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang gửi yêu cầu...
                    </>
                  ) : (
                    "Đăng Ký Tài Khoản"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: OTP Verification Form */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-bold text-sage-800 uppercase tracking-wider block text-center">
                  Nhập Mã Kích Hoạt OTP
                </label>
                <div
                  className="flex justify-center gap-2.5"
                  onPaste={handleOtpPaste}
                >
                  {otpCode.map((data, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={data}
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      onFocus={(e) => e.target.select()}
                      className="w-11 h-13 text-center text-xl font-bold text-[#1a2f23] bg-white border border-[#cda250]/30 rounded-lg focus:border-[#b28a50] focus:ring-2 focus:ring-[#cda250]/10 focus:outline-none transition-all duration-150 shadow-sm"
                      style={{ height: "52px" }}
                    />
                  ))}
                </div>
              </div>

              {/* Timer & Resend Button */}
              <div className="text-center text-xs">
                {timer > 0 ? (
                  <span className="text-sage-500">
                    Gửi lại mã sau{" "}
                    <strong className="text-[#1a2f23] font-semibold tabular-nums">
                      {timer}s
                    </strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="font-bold text-[#b28a50] hover:text-[#1a2f23] cursor-pointer disabled:opacity-50 border-none bg-transparent transition-colors"
                  >
                    Gửi lại mã OTP
                  </button>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading || otpCode.join("").length < 6}
                className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest bg-[#1a2f23] hover:bg-[#070e0a] text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang kích hoạt...
                  </>
                ) : (
                  "Kích Hoạt Tài Khoản"
                )}
              </button>
            </form>
          )}

          {/* Link to Login (only in step 1) */}
          {step === 1 && (
            <div 
              className={`text-center mt-8 pt-4 border-t border-[#cda250]/15 text-xs transition-all duration-700 transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "1000ms" }}
            >
              <span className="text-sage-500">Bạn đã có tài khoản? </span>
              <Link
                to="/dang-nhap"
                className="font-bold text-[#b28a50] hover:text-[#1a2f23] transition-colors"
              >
                Đăng nhập ngay
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Policy Modal */}
      {policyModal && (
        <PolicyModal
          type={policyModal}
          onClose={() => setPolicyModal(null)}
        />
      )}
    </>
  );
}
