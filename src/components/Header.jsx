import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Leaf } from "lucide-react";

const navItems = [
  { label: "Trang chủ.", href: "/" },
  { label: "Phòng nghỉ", href: "/phong-o" },
  { label: "Spa & Wellness", href: "/spa" },
  { label: "Ẩm thực", href: "/nha-hang" },
  { label: "Khuyến mãi", href: "/khuyen-mai" },
  { label: "Blog", href: "/blog" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAdminOrStaff =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/staff") ||
    location.pathname.startsWith("/chef") ||
    location.pathname.startsWith("/specialist");
  if (isAdminOrStaff) {
    return null;
  }
  const isHomePage = location.pathname === "/";

  // Header is glass and dark-text if scrolled OR if we are on any subpage
  const showGlass = isScrolled || !isHomePage;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showGlass
          ? "glass-header shadow-[0_2px_15px_rgba(0,0,0,0.03)] py-3.5"
          : "bg-gradient-to-b from-black/60 to-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Left Side: Logo & Resort Name */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center space-x-3 group focus:outline-none"
          >
            <div
              className={`relative p-2 rounded-full transition-all duration-500 ease-out group-hover:scale-110 ${
                showGlass
                  ? "bg-primary-100 text-primary-800 group-hover:bg-primary-200"
                  : "bg-white/10 text-white group-hover:bg-white/20"
              }`}
            >
              <Leaf className="h-5 w-5 transition-transform duration-500 ease-out group-hover:rotate-[15deg]" />
            </div>
            <div className="flex flex-col justify-center leading-none mt-0.5">
              <span
                className={`font-serif text-lg font-normal tracking-wider transition-colors duration-350 ${
                  showGlass ? "text-primary-900" : "text-white"
                }`}
              >
                Ngũ Sơn
              </span>
              <span
                className={`font-sans text-[8px] font-semibold tracking-[0.3em] uppercase transition-colors duration-350 mt-1 ${
                  showGlass ? "text-primary-600" : "text-primary-100/80"
                }`}
              >
                Resort & Spa
              </span>
            </div>
          </Link>

          {/* Center Side: Simplified Menu Items with Sliding Underlines */}
          <nav className="hidden xl:flex space-x-8 font-medium text-sm tracking-wide flex-shrink-0">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={index}
                  to={item.href}
                  className={`whitespace-nowrap relative py-1 transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:origin-left after:transition-transform after:duration-300 ${
                    isActive
                      ? "after:scale-x-100"
                      : "after:scale-x-0 hover:after:scale-x-100"
                  } ${
                    showGlass
                      ? `text-sage-700 hover:text-primary-900 after:bg-primary-800 ${
                          isActive ? "text-primary-900 font-semibold" : ""
                        }`
                      : `text-white/80 hover:text-white after:bg-white ${
                          isActive ? "text-white font-semibold" : ""
                        }`
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side: Separate Login / Register / Book buttons */}
          <div className="hidden xl:flex items-center space-x-2 flex-shrink-0">
            <Link
              to="/dang-nhap"
              className={`whitespace-nowrap px-3 py-2 text-xs font-semibold tracking-wider transition-all duration-300 hover:scale-105 ${
                showGlass ? "text-sage-700 hover:text-primary-900" : "text-white/80 hover:text-white"
              }`}
            >
              Đăng nhập
            </Link>
            <Link
              to="/dang-ky"
              className={`whitespace-nowrap px-4 py-2 text-xs font-semibold tracking-wider transition-all duration-300 hover:scale-105 ${
                showGlass ? "text-sage-700 hover:text-primary-900" : "text-white/80 hover:text-white"
              }`}
            >
              Đăng ký
            </Link>
            <Link
              to="/dat-lich"
              className={`whitespace-nowrap px-5 py-2.5 rounded-none text-xs font-semibold tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-md ${
                showGlass
                  ? "bg-primary-800 hover:bg-primary-900 text-white"
                  : "bg-white hover:bg-white/95 text-primary-950"
              }`}
            >
              Đặt lịch
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex xl:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className={`inline-flex items-center justify-center p-2 rounded-md transition-colors ${
                showGlass
                  ? "text-sage-800 hover:bg-primary-50"
                  : "text-white hover:bg-white/10"
              }`}
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Mở menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`xl:hidden absolute top-20 left-0 right-0 transition-all duration-300 ease-in-out border-b border-primary-100 ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
        id="mobile-menu"
      >
        <div className="px-6 py-6 space-y-1 bg-white shadow-lg">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={index}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 hover:translate-x-1.5 ${
                  isActive
                    ? "bg-primary-50 text-primary-900 font-semibold border-l-2 border-primary-800"
                    : "text-sage-800 hover:bg-primary-50 hover:text-primary-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-primary-50 flex flex-col space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/dang-nhap"
                onClick={() => setIsOpen(false)}
                className="text-center py-2.5 text-sm font-medium text-sage-700 hover:text-primary-900 transition-colors duration-200 border border-primary-100/50"
              >
                Đăng nhập
              </Link>
              <Link
                to="/dang-ky"
                onClick={() => setIsOpen(false)}
                className="text-center py-2.5 text-sm font-medium text-sage-700 hover:text-primary-900 transition-colors duration-200 border border-primary-100/50"
              >
                Đăng ký
              </Link>
            </div>
            <Link
              to="/dat-lich"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-2.5 rounded-none text-sm font-medium bg-primary-800 hover:bg-primary-900 text-white shadow-sm transition-all duration-200"
            >
              Đặt lịch trải nghiệm
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
