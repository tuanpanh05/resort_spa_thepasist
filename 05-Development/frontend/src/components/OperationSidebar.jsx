import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, LogOut, X, User } from "lucide-react";

export default function OperationSidebar({
  activeTab,
  setActiveTab,
  handleLogout,
  sidebarItems,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  userRoleLabel,
  customSidebarHeader,
}) {
  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-45 lg:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-[#121f0d] to-[#080d06] text-white flex flex-col justify-between py-6 flex-shrink-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:z-30 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Header Brand Logo */}
          <div className="px-6 pb-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-serif text-base font-bold tracking-wide text-white">
                  Quản Trị Resort
                </h2>
                <span className="text-[9px] font-bold text-emerald-400 tracking-wider uppercase block">
                  {userRoleLabel || "Operations Panel"}
                </span>
              </div>
            </div>
            {/* Close button on mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {customSidebarHeader && (
             <div className="px-4">
                {customSidebarHeader}
             </div>
          )}

          {/* Navigation Links */}
          <nav className="px-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer relative group ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-950/60 to-emerald-900/30 text-emerald-100 border-l-4 border-emerald-400 font-bold shadow-xs"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4.5 w-4.5 transition-colors duration-200 ${isActive ? "text-emerald-400" : "text-white/40 group-hover:text-white"}`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>
                  {item.badge && item.badge !== "0" && (
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full font-sans transition-all duration-200 ${
                      isActive 
                        ? "bg-emerald-500 text-white shadow-xs" 
                        : "bg-white/10 text-white/80 border border-white/10 group-hover:bg-white/20 group-hover:text-white"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Navigation & Log out */}
        <div className="px-4 space-y-2 border-t border-white/5 pt-4">
          <Link
            to="/tai-khoan"
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200 cursor-pointer text-xs font-semibold rounded-lg"
          >
            <User className="h-4.5 w-4.5 text-emerald-400" />
            <span>Thông tin cá nhân</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-all duration-200 cursor-pointer text-xs font-semibold rounded-lg"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Đăng xuất hệ thống</span>
          </button>
        </div>
      </aside>
    </>
  );
}
