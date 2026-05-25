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
  const isHomePage = location.pathname === '/';

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

  // Header is glass and dark-text if scrolled OR if we are on any subpage
  const showGlass = isScrolled || !isHomePage;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showGlass ? 'glass-header shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Side: Logo & Resort Name */}
          <Link to="/" className="flex-shrink-0 flex items-center space-x-2 focus:outline-none">
            <div className={`p-2 rounded-full transition-colors duration-300 ${showGlass ? 'bg-primary-100' : 'bg-white/20 backdrop-blur-md'}`}>
              <Leaf className="h-6 w-6 text-primary-900" />
            </div>
            <span className={`font-serif text-xl sm:text-2xl font-bold tracking-wide transition-colors duration-300 ${showGlass ? 'text-primary-900' : 'text-white drop-shadow-md'}`}>
              Ngũ Sơn Resort
            </span>
          </Link>

          {/* Center Side: 10 Uppercase Menu Items */}
          <nav className="hidden xl:flex space-x-3.5 2xl:space-x-5 font-bold text-[10px] 2xl:text-xs">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className={`transition-colors duration-200 hover:text-primary-800 ${showGlass ? 'text-sage-800' : 'text-white hover:text-primary-200 drop-shadow-sm'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side: Separate Login / Register buttons (No divider line) */}
          <div className="hidden xl:flex items-center space-x-4">
            <Link to="/dang-nhap" className={`px-4 py-2 text-xs font-bold transition-colors duration-200 ${showGlass ? 'text-sage-800 hover:text-primary-900' : 'text-white hover:text-primary-200 drop-shadow-sm'}`}>
              ĐĂNG NHẬP
            </Link>
            <Link to="/dang-ky" className={`px-5 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 ${showGlass ? 'bg-primary-900 hover:bg-primary-800 text-white' : 'bg-primary-200 text-sage-950 hover:bg-primary-300'}`}>
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
