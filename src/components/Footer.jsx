import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="footer" className="bg-[#1a2e05] text-white pt-20 pb-10 relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full filter blur-3xl" />
      <div className="absolute top-0 left-0 w-80 h-80 bg-primary-400/5 rounded-full filter blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Footer Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary-500/20 rounded-full">
                <Leaf className="h-6 w-6 text-primary-300" />
              </div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wide">
                Ngũ Sơn Resort
              </span>
            </div>
            <p className="text-primary-100/70 font-light text-sm leading-relaxed">
              Nơi kết hợp tinh hoa của thiên nhiên núi rừng và các liệu pháp trị liệu cổ truyền, giúp khơi nguồn sức sống mới và nuôi dưỡng tâm hồn bạn.
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="p-2 bg-white/5 hover:bg-primary-500 hover:text-white rounded-full transition-all duration-300 text-primary-200">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="p-2 bg-white/5 hover:bg-primary-500 hover:text-white rounded-full transition-all duration-300 text-primary-200">
                <svg className="h-5 w-5 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" aria-label="Youtube" className="p-2 bg-white/5 hover:bg-primary-500 hover:text-white rounded-full transition-all duration-300 text-primary-200">
                <svg className="h-5 w-5 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6 border-l-2 border-primary-400 pl-3">
              Khám Phá
            </h4>
            <ul className="space-y-3.5 text-sm font-light text-primary-100/70">
              <li><Link to="/" className="hover:text-primary-300 transition-colors">Trang chủ</Link></li>
              <li><Link to="/#services" className="hover:text-primary-300 transition-colors">Dịch vụ trị liệu</Link></li>
              <li><Link to="/phong-o" className="hover:text-primary-300 transition-colors">Phòng nghỉ dưỡng</Link></li>
              <li><Link to="/#booking" className="hover:text-primary-300 transition-colors">Đặt lịch tư vấn</Link></li>
            </ul>
          </div>

          {/* Therapy Services List */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6 border-l-2 border-primary-400 pl-3">
              Liệu Trình Chữa Lành
            </h4>
            <ul className="space-y-3.5 text-sm font-light text-primary-100/70">
              <li><span className="hover:text-primary-300 cursor-default transition-colors">Ẩm thực thực dưỡng organic</span></li>
              <li><span className="hover:text-primary-300 cursor-default transition-colors">Massage & Spa thảo dược</span></li>
              <li><span className="hover:text-primary-300 cursor-default transition-colors">Yoga thở & Thiền định phục hồi</span></li>
              <li><span className="hover:text-primary-300 cursor-default transition-colors">Vật lý trị liệu cột sống</span></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold mb-6 border-l-2 border-primary-400 pl-3">
              Liên Hệ
            </h4>
            <ul className="space-y-4 text-sm font-light text-primary-100/70">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary-300 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">Thung Lũng Ngũ Sơn, Xã Hòa Ninh, Huyện Hòa Vang, Đà Nẵng</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-300 flex-shrink-0" />
                <span>1900 8888 (Hotline 24/7)</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-300 flex-shrink-0" />
                <span>info@ngusonresort.com.vn</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-xs text-primary-200/50 font-light">
          <p>© 2026 Ngũ Sơn Resort. Tất cả các quyền được bảo lưu.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-primary-300 transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-primary-300 transition-colors">Điều khoản dịch vụ</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
