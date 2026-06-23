import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Leaf,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import heroBg from "../assets/hero_bg.png";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [timer, setTimer] = useState(59);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  const canResend = timer === 0;

  // Redirect logged-in users away from forgot password page
  useEffect(() => {
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
    }
  }, [navigate]);

  // Countdown for OTP step
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Auto-focus first OTP input when entering step 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // Validate email format
  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Vui lòng nhập địa chỉ email của bạn.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setStep(2);
      setTimer(59);
      setOtpCode(["", "", "", "", "", ""]);
    } catch (err) {
      setError(err.message || "Không thể gửi mã OTP. Vui lòng kiểm tra lại email.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
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
      await authApi.verifyOtp(email, code);
      setStep(3);
    } catch (err) {
      setError(err.message || "Mã OTP không đúng hoặc đã hết hạn.");
      // Clear OTP fields on error
      setOtpCode(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ mật khẩu mới.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await authApi.resetPassword(email, otpCode.join(""), newPassword);
      setStep(4);
    } catch (err) {
      setError(err.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setError("");
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setTimer(59);
      setOtpCode(["", "", "", "", "", ""]);
      setSuccessMsg("Mã OTP mới đã được gửi tới hộp thư của bạn.");
      setTimeout(() => setSuccessMsg(""), 4000);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message || "Không thể gửi lại mã OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return; // Only digits

    const updated = [...otpCode];
    updated[index] = val.slice(-1); // Keep only last digit
    setOtpCode(updated);

    // Auto-focus next
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

  return (
    <div
      className="min-h-screen relative flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* Dark organic overlay */}
      <div className="absolute inset-0 bg-[#233827]/40 backdrop-blur-sm" />

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md rounded-md shadow-xl p-8 sm:p-10 transition-all duration-300">

        {/* Back button */}
        {step < 4 && (
          <button
            onClick={() => {
              if (step === 1) navigate("/dang-nhap");
              else setStep(step - 1);
              setError("");
            }}
            className="inline-flex items-center space-x-2 text-xs font-semibold text-sage-600 hover:text-primary-900 transition-colors duration-200 mb-6 group cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            <span>
              {step === 1 ? "Quay lại Đăng Nhập" : "Quay lại bước trước"}
            </span>
          </button>
        )}

        {/* Step progress indicator */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step > s
                      ? "bg-primary-900 text-white"
                      : step === s
                      ? "bg-primary-900 text-white ring-4 ring-primary-900/20"
                      : "bg-primary-100 text-sage-500"
                  }`}
                >
                  {step > s ? "✓" : s}
                </div>
                {s < 3 && (
                  <div
                    className={`h-0.5 w-8 transition-all duration-500 ${
                      step > s ? "bg-primary-900" : "bg-primary-100"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Branding Header */}
        <div className="text-center mb-8">
          {step < 4 ? (
            <div className="inline-flex p-3 bg-primary-100 rounded-md text-primary-900 mb-3">
              <Leaf className="h-6 w-6" />
            </div>
          ) : (
            <div className="inline-flex p-4 bg-green-100 rounded-md text-green-600 mb-3">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          )}

          {step === 1 && (
            <>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900">
                Quên Mật Khẩu?
              </h2>
              <p className="text-xs sm:text-sm text-sage-600 mt-2">
                Nhập địa chỉ email để nhận mã OTP khôi phục tài khoản
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900">
                Xác Thực OTP
              </h2>
              <p className="text-xs sm:text-sm text-sage-600 mt-2">
                Mã OTP 6 chữ số đã được gửi đến:
                <br />
                <span className="font-semibold text-primary-900 text-sm mt-1 inline-block">
                  {email}
                </span>
              </p>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900">
                Mật Khẩu Mới
              </h2>
              <p className="text-xs sm:text-sm text-sage-600 mt-2">
                Đặt mật khẩu mới an toàn cho tài khoản của bạn
              </p>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900">
                Đặt Lại Thành Công!
              </h2>
              <p className="text-xs sm:text-sm text-sage-600 mt-2">
                Mật khẩu của bạn đã được cập nhật thành công. Bạn có thể đăng
                nhập với mật khẩu mới.
              </p>
            </>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50 text-red-700 text-xs sm:text-sm border border-red-100 flex items-start gap-2">
            <span className="mt-0.5 shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-md bg-green-50 text-green-700 text-xs sm:text-sm border border-green-100 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Enter email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
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
                  autoComplete="email"
                  className="w-full pl-9 pr-4 py-2.5 border-b border-primary-200 focus:border-primary-900 focus:outline-none bg-transparent text-sm text-sage-900 placeholder-sage-400 transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-md text-sm font-semibold bg-primary-900 hover:bg-primary-800 text-white shadow-md transition-all duration-300 hover:scale-[1.01] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang gửi mã OTP...
                </>
              ) : (
                "Gửi Mã OTP"
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Enter 6-digit OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-semibold text-sage-800 uppercase tracking-wider block text-center">
                Nhập Mã Xác Thực OTP
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

            {/* Timer / Resend */}
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
                  className="font-bold text-primary-900 hover:underline cursor-pointer disabled:opacity-50"
                >
                  Gửi lại mã OTP
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.join("").length < 6}
              className="w-full py-3.5 rounded-md text-sm font-semibold bg-primary-900 hover:bg-primary-800 text-white shadow-md transition-all duration-300 hover:scale-[1.01] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                "Xác Nhận Mã OTP"
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Enter new password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-sage-800 uppercase tracking-wider block">
                Mật Khẩu Mới
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-1.5 flex items-center text-sage-400">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ít nhất 6 ký tự"
                  autoComplete="new-password"
                  className="w-full pl-9 pr-11 py-2.5 border-b border-primary-200 focus:border-primary-900 focus:outline-none bg-transparent text-sm text-sage-900 placeholder-sage-400 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-1 flex items-center text-sage-400 hover:text-sage-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
              {/* Password strength hint */}
              {newPassword && (
                <p
                  className={`text-xs mt-1 ${
                    newPassword.length >= 8
                      ? "text-green-600"
                      : newPassword.length >= 6
                      ? "text-amber-500"
                      : "text-red-500"
                  }`}
                >
                  {newPassword.length < 6
                    ? "Quá ngắn (tối thiểu 6 ký tự)"
                    : newPassword.length < 8
                    ? "Chấp nhận được (khuyến nghị ≥8 ký tự)"
                    : "✓ Mật khẩu đủ mạnh"}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-sage-800 uppercase tracking-wider block">
                Nhập Lại Mật Khẩu Mới
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
                  autoComplete="new-password"
                  className="w-full pl-9 pr-11 py-2.5 border-b border-primary-200 focus:border-primary-900 focus:outline-none bg-transparent text-sm text-sage-900 placeholder-sage-400 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-1 flex items-center text-sage-400 hover:text-sage-600 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
              {/* Match indicator */}
              {confirmPassword && (
                <p
                  className={`text-xs mt-1 ${
                    newPassword === confirmPassword
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {newPassword === confirmPassword
                    ? "✓ Mật khẩu khớp"
                    : "✗ Mật khẩu chưa khớp"}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-md text-sm font-semibold bg-primary-900 hover:bg-primary-800 text-white shadow-md transition-all duration-300 hover:scale-[1.01] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                "Cập Nhật Mật Khẩu"
              )}
            </button>
          </form>
        )}

        {/* STEP 4: Success */}
        {step === 4 && (
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-md bg-green-50 border border-green-100 text-center">
              <p className="text-sm text-green-700 font-medium">
                🎉 Mật khẩu đã được đặt lại thành công!
              </p>
              <p className="text-xs text-green-600 mt-1">
                Bạn có thể đăng nhập ngay với mật khẩu mới.
              </p>
            </div>
            <Link
              to="/dang-nhap"
              className="w-full inline-flex items-center justify-center py-3.5 rounded-md text-sm font-semibold bg-primary-900 hover:bg-primary-800 text-white shadow-md transition-all duration-300 hover:scale-[1.01] cursor-pointer"
            >
              Đăng Nhập Ngay
            </Link>
          </div>
        )}

        {/* Footer link */}
        {step === 1 && (
          <div className="text-center mt-8 pt-4 border-t border-primary-100/50 text-xs sm:text-sm">
            <span className="text-sage-600">Đã nhớ mật khẩu? </span>
            <Link
              to="/dang-nhap"
              className="font-bold text-primary-900 hover:underline"
            >
              Đăng nhập
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
