import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function CustomerLayout() {
  return (
    <>
      {/* Navigation Header (Shared across customer pages) */}
      <Header />

      {/* Main Routed Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer Info (Shared across customer pages) */}
      <Footer />
    </>
  );
}
