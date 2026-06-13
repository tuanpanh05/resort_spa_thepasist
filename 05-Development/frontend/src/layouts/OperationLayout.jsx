import React from "react";
import { ShieldCheck, Menu } from "lucide-react";
import OperationSidebar from "../components/OperationSidebar";

export default function OperationLayout({
  children,
  activeTab,
  setActiveTab,
  handleLogout,
  sidebarItems,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  userRoleLabel,
  headerTitle,
  customHeaderRight,
}) {
  return (
    <div className="admin-theme min-h-screen bg-primary-50 flex flex-col lg:flex-row text-left relative">
      {/* Mobile Top Navbar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-primary-950 text-white sticky top-0 z-40 shadow-md">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-primary-850 rounded text-white">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="font-serif text-sm font-normal tracking-wide">
            Ngũ Sơn {userRoleLabel || "Operations"}
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 focus:outline-none cursor-pointer"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Sidebar Layout */}
      <OperationSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
        sidebarItems={sidebarItems}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        userRoleLabel={userRoleLabel}
      />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-y-auto max-h-screen custom-scrollbar min-w-0">
        {/* Top Header navbar */}
        <header className="h-16 bg-white border-b border-primary-100 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h1 className="font-serif text-lg font-normal text-sage-950">
              {headerTitle || "Bảng Tổng Quan Vận Hành Resort"}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {customHeaderRight ? customHeaderRight : (
              <span className="text-[10px] font-bold text-primary-900 bg-primary-100 px-3 py-1 uppercase tracking-wider">
                Phiên trực: {userRoleLabel || "Nhân viên"}
              </span>
            )}
          </div>
        </header>

        {/* Scrollable views content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
