import React from "react";
import { radius } from "../../styles/designSystem";

export default function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
  ...props
}) {
  let baseStyles = `px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer ${radius.button} disabled:opacity-50 disabled:cursor-not-allowed`;
  let variantStyles = "";

  if (variant === "primary") {
    variantStyles = "bg-primary-800 hover:bg-primary-900 text-white shadow-sm";
  } else if (variant === "secondary") {
    variantStyles = "bg-primary-100 hover:bg-primary-200 text-primary-950";
  } else if (variant === "danger") {
    variantStyles = "bg-red-700 hover:bg-red-800 text-white";
  } else if (variant === "danger-light") {
    variantStyles =
      "bg-red-50 hover:bg-red-100 text-red-700 border border-red-150";
  } else if (variant === "outline") {
    variantStyles =
      "border border-primary-250 hover:bg-primary-50 text-primary-950";
  } else if (variant === "warning") {
    variantStyles = "bg-yellow-600 hover:bg-yellow-700 text-white";
  } else if (variant === "warning-light") {
    variantStyles =
      "bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border border-yellow-150";
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
