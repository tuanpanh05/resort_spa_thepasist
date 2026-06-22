import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Leaf, Phone, Mail, MapPin } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const location = useLocation();
  if (
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/staff") ||
    location.pathname.startsWith("/chef") ||
    location.pathname.startsWith("/specialist")
  ) {
    return null;
  }
  return (
    <footer
      id="footer"
      className="bg-[#1a2e05] text-white pt-20 pb-10 relative overflow-hidden"
    >
      {/* Decorative ambient glow */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full filter blur-3xl" />
      <div className="absolute top-0 left-0 w-80 h-80 bg-primary-400/5 rounded-full filter blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Footer Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/10">
          {/* Brand Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-white/10 rounded-full">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-white">
                Ngũ Sơn Resort
              </span>
            </div>
            <p className="text-white/80 font-light text-sm leading-relaxed">
              {t("footer.brandDesc")}
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                aria-label="Facebook"
                className="p-2 bg-white/5 hover:bg-white hover:text-sage-950 rounded-full transition-all duration-300 text-white"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="p-2 bg-white/5 hover:bg-white hover:text-sage-950 rounded-full transition-all duration-300 text-white"
              >
                <svg
                  className="h-5 w-5 stroke-current fill-none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Youtube"
                className="p-2 bg-white/5 hover:bg-white hover:text-sage-950 rounded-full transition-all duration-300 text-white"
              >
                <svg
                  className="h-5 w-5 stroke-current fill-none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6 border-l-2 border-white pl-3 text-white">
              {t("footer.explore")}
            </h4>
            <ul className="space-y-3.5 text-sm font-light text-white/80">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link
                  to="/#services"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.therapyServices")}
                </Link>
              </li>
              <li>
                <Link
                  to="/phong-o"
                  className="hover:text-white transition-colors"
                >
                  {t("nav.rooms")}
                </Link>
              </li>
              <li>
                <Link
                  to="/dat-lich"
                  className="hover:text-white transition-colors"
                >
                  {t("nav.bookNow")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Therapy Services List */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6 border-l-2 border-white pl-3 text-white">
              {t("footer.therapyServices")}
            </h4>
            <ul className="space-y-3.5 text-sm font-light text-white/80">
              <li>
                <span className="hover:text-white cursor-default transition-colors">
                  {t("footer.organicMeals")}
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-default transition-colors">
                  {t("footer.massageSpa")}
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-default transition-colors">
                  {t("footer.yogaZen")}
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-default transition-colors">
                  {t("footer.physio")}
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold mb-6 border-l-2 border-white pl-3 text-white">
              {t("footer.contact")}
            </h4>
            <ul className="space-y-4 text-sm font-light text-white/80">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {t("footer.address")}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-white flex-shrink-0" />
                <span>{t("footer.phone")}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-white flex-shrink-0" />
                <span>{t("footer.mail")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-xs text-white/60 font-light">
          <p>{t("footer.copyright")}</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-white transition-colors">
              {t("footer.privacy")}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {t("footer.terms")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
