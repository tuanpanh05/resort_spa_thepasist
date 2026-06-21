import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const userRole = localStorage.getItem("userRole") || sessionStorage.getItem("userRole");

  if (!token) {
    // Not logged in -> Redirect to login page
    return <Navigate to="/dang-nhap" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole?.toUpperCase())) {
    // Logged in but not allowed -> Redirect to login page to allow switching account
    return <Navigate to="/dang-nhap" replace />;
  }

  return children;
}
