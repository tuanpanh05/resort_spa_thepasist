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
  Leaf,
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

  const canResend = timer === 0;

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
        {/* Dark organic overlay */}
        <div className="absolute inset-0 bg-[#233827]/40 backdrop-blur-sm" />

        {/* Register Card */}
        <div className="relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-md rounded-md shadow-xl p-8 sm:p-10 transition-all duration-300">
          
          {/* Back / Navigation button */}
          {step === 1 ? (
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-sage-600 hover:text-primary-900 transition-colors duration-200 mb-6 group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Quay lại trang chủ</span>
            </Link>
          ) : (
            <button
              onClick={() => { setStep(1); setError(""); }}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-sage-600 hover:text-primary-900 transition-colors duration-200 mb-6 group cursor-pointer border-none bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Quay lại đăng ký</span>
            </button>
          )}

          {/* Branding Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-primary-100 rounded-md text-primary-900 mb-3">
              <Leaf className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900">
              {step === 1 ? "Đăng Ký Thành Viên" : "Xác Thực Email"}
            </h2>
            <p className="text-xs sm:text-sm text-sage-600 mt-2">
              {step === 1 
                ? "Trở thành hội viên để nhận đặc quyền và ưu đãi nghỉ dưỡng tốt nhất"
                : `Mã OTP kích hoạt tài khoản đã được gửi đến: ${email}`
              }
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 text-red-700 text-xs sm:text-sm border border-red-100 flex items-start gap-2">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Registration Form */}
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-sage-800 uppercase tracking-wider block">
                  Họ và Tên
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-1.5 flex items-center text-sage-400">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-9 pr-4 py-2.5 border-b border-primary-200 focus:border-primary-900 focus:outline-none bg-transparent text-sm text-sage-900 placeholder-sage-400 transition-all duration-200"
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
                    <span className="absolute inset-y-0 left-0 pl-1.5 flex items-center text-sage-400">
                      <Mail className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="w-full pl-9 pr-4 py-2.5 border-b border-primary-200 focus:border-primary-900 focus:outline-none bg-transparent text-sm text-sage-900 placeholder-sage-400 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Phone field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-sage-800 uppercase tracking-wider block">
                    Số Điện Thoại
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-1.5 flex items-center text-sage-400">
                      <Phone className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0901234567"
                      className="w-full pl-9 pr-4 py-2.5 border-b border-primary-200 focus:border-primary-900 focus:outline-none bg-transparent text-sm text-sage-900 placeholder-sage-400 transition-all duration-200"
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
                    <span className="absolute inset-y-0 left-0 pl-1.5 flex items-center text-sage-400">
                      <Lock className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-11 py-2.5 border-b border-primary-200 focus:border-primary-900 focus:outline-none bg-transparent text-sm text-sage-900 placeholder-sage-400 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Confirm Password field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-sage-800 uppercase tracking-wider block">
                    Nhập Lại Mật Khẩu
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-1.5 flex items-center text-sage-400">
                      <Lock className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-11 py-2.5 border-b border-primary-200 focus:border-primary-900 focus:outline-none bg-transparent text-sm text-sage-900 placeholder-sage-400 transition-all duration-200"
                    />
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
                    className="mt-0.5 rounded-sm border-primary-300 text-primary-900 focus:ring-primary-900 cursor-pointer"
                  />
                  <span className="leading-normal">
                    Tôi đồng ý với các{" "}
                    <button
                      type="button"
                      onClick={() => setPolicyModal("privacy")}
                      className="font-semibold text-primary-900 hover:underline bg-transparent border-none p-0 cursor-pointer"
                    >
                      Chính sách bảo mật
                    </button>{" "}
                    và{" "}
                    <button
                      type="button"
                      onClick={() => setPolicyModal("terms")}
                      className="font-semibold text-primary-900 hover:underline bg-transparent border-none p-0 cursor-pointer"
                    >
                      Điều khoản hội viên
                    </button>{" "}
                    của khu nghỉ dưỡng.
                  </span>
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-md text-sm font-semibold bg-primary-900 hover:bg-primary-800 text-white shadow-md transition-all duration-300 hover:scale-[1.01] cursor-pointer mt-6 flex items-center justify-center gap-2"
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
            </form>
          )}

          {/* STEP 2: OTP Verification Form */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-semibold text-sage-800 uppercase tracking-wider block text-center">
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
                      className="w-11 h-13 text-center text-xl font-bold text-primary-950 bg-white border border-primary-300 rounded-md focus:border-primary-900 focus:ring-2 focus:ring-primary-900/20 focus:outline-none transition-all duration-150 shadow-sm"
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
                    <strong className="text-primary-900 font-semibold tabular-nums">
                      {timer}s
                    </strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="font-bold text-primary-900 hover:underline cursor-pointer disabled:opacity-50 border-none bg-transparent"
                  >
                    Gửi lại mã OTP
                  </button>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading || otpCode.join("").length < 6}
                className="w-full py-3.5 rounded-md text-sm font-semibold bg-primary-900 hover:bg-primary-800 text-white shadow-md transition-all duration-300 hover:scale-[1.01] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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
            <div className="text-center mt-8 pt-4 border-t border-primary-100/50 text-xs sm:text-sm">
              <span className="text-sage-600">Bạn đã có tài khoản? </span>
              <Link
                to="/dang-nhap"
                className="font-bold text-primary-900 hover:underline"
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
