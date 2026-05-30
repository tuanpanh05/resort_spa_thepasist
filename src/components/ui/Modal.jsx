import React from "react";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className={`bg-white ${maxWidth} w-full p-6 space-y-4 shadow-xl text-left`}
      >
        <div className="flex justify-between items-center border-b border-primary-50 pb-3">
          <h3 className="font-serif text-lg font-normal text-sage-950">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-sage-400 hover:text-sage-900 cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
