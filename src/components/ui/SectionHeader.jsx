import React from "react";

export default function SectionHeader({
  title,
  description,
  children,
  className = "",
}) {
  return (
    <div
      className={`bg-white border border-primary-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${className}`}
    >
      <div>
        <h3 className="font-serif text-lg font-normal text-sage-950">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-sage-500 mt-1">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex-shrink-0 flex items-center space-x-2 w-full sm:w-auto">
          {children}
        </div>
      )}
    </div>
  );
}
