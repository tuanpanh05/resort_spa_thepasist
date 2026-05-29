import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf } from 'lucide-react';

const navItems = [
  { label: 'TRANG CHỦ', href: '/' },
  { label: 'BLOG', href: '/blog' },
  { label: 'PHÒNG Ở', href: '/phong-o' },
  { label: 'SPA', href: '/spa' },
  { label: 'NHÀ HÀNG', href: '/nha-hang' },
  { label: 'HỘI NGHỊ HỘI THẢO', href: '/hoi-nghi' },
  { label: 'YOGA', href: '/yoga' },
  { label: 'VẬT LÝ TRỊ LIỆU', href: '/vat-ly-tri-lieu' },
  { label: 'KHUYẾN MÃI', href: '/khuyen-mai' },
  { label: 'THƯ VIỆN ẢNH', href: '/blog' }
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
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdminOrStaff = location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff') || location.pathname.startsWith('/chef') || location.pathname.startsWith('/specialist');
  if (isAdminOrStaff) {
    return null;
  }
  const isHomePage = location.pathname === '/';

  // Header is glass and dark-text if scrolled OR if we are on any subpage
  const showGlass = isScrolled || !isHomePage;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showGlass ? 'glass-header shadow-md py-3' : 'bg-gradient-to-b from-black/75 via-black/30 to-transparent py-5'}`}>
      <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Side: Logo & Resort Name */}
          <Link to="/" className="flex-shrink-0 flex items-center space-x-3.5 group focus:outline-none">
            <div className="relative flex items-center justify-center">
              {/* Outer premium rotating border on hover */}
              <div className={`absolute -inset-1 rounded-full border border-dashed transition-all duration-1000 ease-out group-hover:rotate-180 ${showGlass ? 'border-primary-900/30' : 'border-white/30 group-hover:border-primary-200/50'}`} />
              {/* Inner emblem container */}
              <div className={`relative p-2.5 rounded-full transition-all duration-500 group-hover:scale-110 ${showGlass ? 'bg-primary-100 text-primary-900' : 'bg-primary-200 text-primary-950 shadow-md shadow-primary-200/10'}`}>
                <Leaf className="h-5 w-5 transition-transform duration-700 group-hover:rotate-[25deg] group-hover:scale-110" />
              </div>
            </div>
            <div className="flex flex-col justify-center leading-none mt-0.5">
              <span className={`font-serif text-lg sm:text-xl font-bold tracking-wider transition-colors duration-350 ${showGlass ? 'text-primary-900' : 'text-white drop-shadow-md group-hover:text-primary-200'}`}>
                Ngũ Sơn
              </span>
              <span className={`font-sans text-[8px] sm:text-[9px] font-bold tracking-[0.3em] uppercase transition-colors duration-350 mt-1 ${showGlass ? 'text-sage-500' : 'text-primary-200/90'}`}>
                Resort & Spa
              </span>
            </div>
          </Link>

          {/* Center Side: 10 Uppercase Menu Items */}
          <nav className="hidden xl:flex space-x-4 2xl:space-x-6 font-bold text-[13px] 2xl:text-[15px] tracking-wide">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className={`relative py-1.5 transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-current after:transition-all after:duration-300 ${showGlass ? 'text-sage-800 hover:text-primary-900' : 'text-white hover:text-primary-200 drop-shadow-sm'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side: Separate Login / Register buttons (No divider line) */}
          <div className="hidden xl:flex items-center space-x-5">
            <Link to="/dang-nhap" className={`px-4 py-2 text-[13px] 2xl:text-[15px] font-bold transition-all duration-200 hover:scale-105 ${showGlass ? 'text-sage-800 hover:text-primary-900' : 'text-white hover:text-primary-200 drop-shadow-sm'}`}>
              ĐĂNG NHẬP
            </Link>
            <Link to="/dang-ky" className={`px-6 py-2.5 rounded-full text-[13px] 2xl:text-[15px] font-bold shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 ${showGlass ? 'bg-primary-900 hover:bg-primary-850 text-white shadow-primary-900/10' : 'bg-primary-200 text-primary-950 hover:bg-primary-300 shadow-primary-200/20'}`}>
              ĐĂNG KÝ
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex xl:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className={`inline-flex items-center justify-center p-2 rounded-md transition-colors ${showGlass ? 'text-sage-800 hover:bg-primary-100' : 'text-white hover:bg-white/10'}`}
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Mở menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`xl:hidden absolute top-20 left-0 right-0 transition-all duration-300 ease-in-out border-b border-primary-100 ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`} id="mobile-menu">
        <div className="px-4 py-4 space-y-1 bg-white shadow-lg">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-md text-xs font-bold tracking-wider text-sage-800 hover:bg-primary-50 hover:text-primary-900"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-primary-50 flex flex-col space-y-2">
            <Link 
              to="/dang-nhap"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-2.5 text-xs font-bold text-sage-700 hover:text-primary-900"
            >
              ĐĂNG NHẬP
            </Link>
            <Link 
              to="/dang-ky"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-2.5 rounded-full text-xs font-bold bg-primary-900 hover:bg-primary-800 text-white shadow-sm"
            >
              ĐĂNG KÝ
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
