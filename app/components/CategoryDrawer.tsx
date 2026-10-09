"use client";

import { useEffect } from "react";

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// The category tree on phones and tablets: a panel that slides in from the left over
// a dimmed page. Closes with ×, a tap outside it or Escape; the page behind it does
// not scroll while it is open.
const CategoryDrawer: React.FC<CategoryDrawerProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Kategoriler"
        className={`absolute inset-y-0 left-0 flex w-[85%] max-w-xs flex-col bg-gray-800 text-white shadow-xl transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-lg font-bold">Kategoriler</span>
          <button
            type="button"
            aria-label="Kapat"
            className="flex h-11 w-11 items-center justify-center rounded-full text-2xl hover:bg-gray-700"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default CategoryDrawer;
