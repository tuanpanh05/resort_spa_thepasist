import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, Lock, Eye, EyeOff, ArrowLeft, Leaf, Shield, KeyRound, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [contactInfo, setContactInfo] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();

  // Handle countdown for OTP step
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Step 1: Send OTP
  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!contactInfo) {
      setError('Vui lòng nhập email hoặc số điện thoại của bạn.');
      return;
    }
    setError('');
    // Mock sending OTP
    setStep(2);
    setTimer(59);
    setCanResend(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const code = otpCode.join('');
    if (code.length < 6) {
      setError('Vui lòng nhập đầy đủ mã xác thực gồm 6 chữ số.');
      return;
    }
    setError('');
    // Mock OTP verification (any 6 digit works for mockup, or say code "123456")
    setStep(3);
  };

  // Step 3: Reset Password
  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ mật khẩu mới.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setError('');
    // Mock password update
    setStep(4);
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    setTimer(59);
    setCanResend(false);
    setError('');
    alert(`Mã OTP mới đã được gửi lại thành công tới: ${contactInfo}`);
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtpCode([...otpCode.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
      style={{ backgroundImage: "url('/hero_bg.png')" }}
    >
      {/* Dark organic overlay */}
      <div className="absolute inset-0 bg-[#233827]/40 backdrop-blur-sm" />

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-md border border-primary-100/50 rounded-[32px] shadow-2xl p-8 sm:p-10 transition-all duration-300">
        
        {/* Back button (Only visible in step 1, 2, 3) */}
        {step < 4 && (
          <button
            onClick={() => {
              if (step === 1) navigate('/dang-nhap');
              else setStep(step - 1);
              setError('');
            }}
            className="inline-flex items-center space-x-2 text-xs font-semibold text-sage-600 hover:text-primary-900 transition-colors duration-200 mb-6 group cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            <span>{step === 1 ? 'Quay lại Đăng Nhập' : 'Quay lại bước trước'}</span>
          </button>
        )}

        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary-100 rounded-full text-primary-900 mb-3 shadow-sm">
            <Leaf className="h-6 w-6" />
          </div>
          
          {step === 1 && (
            <>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900">Quên Mật Khẩu?</h2>
              <p className="text-xs sm:text-sm text-sage-600 mt-2">
                Nhập Email hoặc Số điện thoại để nhận mã khôi phục tài khoản
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900">Xác Thực Tài Khoản</h2>
              <p className="text-xs sm:text-sm text-sage-600 mt-2">
                Chúng tôi đã gửi mã xác thực OTP gồm 6 chữ số đến:<br />
                <span className="font-semibold text-primary-900 text-sm mt-1 inline-block">{contactInfo}</span>
              </p>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900">Mật Khẩu Mới</h2>
              <p className="text-xs sm:text-sm text-sage-600 mt-2">
                Vui lòng đặt mật khẩu mới có độ bảo mật cao cho tài khoản của bạn
              </p>
            </>
          )}

          {step === 4 && (
            <>
              <div className="inline-flex p-3 bg-green-100 rounded-full text-green-600 mb-3 shadow-sm">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900">Đặt Lại Thành Công!</h2>
              <p className="text-xs sm:text-sm text-sage-600 mt-2">
                Mật khẩu của bạn đã được cập nhật thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
              </p>
            </>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-xs sm:text-sm border border-red-100">
            {error}
          </div>
        )}

        {/* STEP 1: Enter email or phone */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
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
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="example@gmail.com hoặc 090..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-primary-200/50 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent text-sm text-sage-900 placeholder-sage-400 transition-all duration-200"
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl text-sm font-semibold bg-primary-900 hover:bg-primary-800 text-white shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            >
              Gửi Mã OTP
            </button>
          </form>
        )}

        {/* STEP 2: Enter 6-digit OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-sage-800 uppercase tracking-wider block text-center">
                Mã Xác Thực OTP
              </label>
              <div className="flex justify-between gap-2 max-w-[280px] mx-auto">
                {otpCode.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    name="otp"
                    maxLength="1"
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onFocus={(e) => e.target.select()}
                    className="w-10 h-12 text-center text-lg font-bold text-primary-950 bg-white border border-primary-200/50 rounded-xl focus:border-primary-900 focus:ring-2 focus:ring-primary-900 focus:outline-none transition-all duration-150"
                  />
                ))}
              </div>
            </div>

            <div className="text-center text-xs">
              {timer > 0 ? (
                <span className="text-sage-500">
                  Gửi lại mã OTP sau <strong className="text-primary-900 font-semibold">{timer}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="font-bold text-primary-900 hover:underline cursor-pointer"
                >
                  Gửi lại mã OTP
                </button>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl text-sm font-semibold bg-primary-900 hover:bg-primary-800 text-white shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            >
              Xác Nhận Mã OTP
            </button>
          </form>
        )}

        {/* STEP 3: Enter new password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-sage-800 uppercase tracking-wider block">
                Mật Khẩu Mới
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sage-400">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-primary-200/50 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent text-sm text-sage-900 placeholder-sage-400 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-sage-400 hover:text-sage-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-sage-800 uppercase tracking-wider block">
                Nhập Lại Mật Khẩu Mới
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sage-400">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-primary-200/50 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent text-sm text-sage-900 placeholder-sage-400 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-sage-400 hover:text-sage-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl text-sm font-semibold bg-primary-900 hover:bg-primary-800 text-white shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer mt-6"
            >
              Cập Nhật Mật Khẩu
            </button>
          </form>
        )}

        {/* STEP 4: Success & Go to login button */}
        {step === 4 && (
          <div className="mt-8">
            <Link
              to="/dang-nhap"
              className="w-full inline-flex items-center justify-center py-3.5 rounded-2xl text-sm font-semibold bg-primary-900 hover:bg-primary-800 text-white shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            >
              Đăng Nhập Ngay
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
