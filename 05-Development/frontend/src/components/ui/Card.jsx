import React from "react";
import { radius, shadows } from "../../styles/designSystem";

export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-white border border-primary-100 p-6 ${radius.card} ${shadows.soft} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
