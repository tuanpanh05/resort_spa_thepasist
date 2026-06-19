import React from "react";
import { ShieldCheck, LogOut, X } from "lucide-react";

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
        className={`fixed inset-y-0 left-0 w-64 bg-primary-950 text-white flex flex-col justify-between py-6 flex-shrink-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:z-30 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Header Brand Logo */}
          <div className="px-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-850 text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-serif text-base font-normal tracking-wide text-white">
                  Quản Trị Resort
                </h2>
                <span className="text-[9px] font-semibold text-primary-200 tracking-widest uppercase">
                  {userRoleLabel || "Operations Panel"}
                </span>
              </div>
            </div>
            {/* Close button on mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1 text-white/70 hover:text-white hover:bg-white/10 rounded cursor-pointer"
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
          <nav className="px-4 space-y-1.5">
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
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-none text-xs font-semibold tracking-wider transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-primary-800 text-white font-bold"
                      : "text-primary-100/70 hover:bg-primary-900 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4.5 w-4.5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge !== "0" && (
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${isActive ? "bg-white text-primary-900" : "bg-primary-800 text-primary-200"}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Log out */}
        <div className="px-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-all duration-150 cursor-pointer text-xs font-semibold tracking-wider"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Đăng xuất hệ thống</span>
          </button>
        </div>
      </aside>
    </>
  );
}
