import { useState } from "react";
import { X } from "lucide-react";

// Temporary notice while our image host is down - remove this component (and
// its line in App.jsx) once product images load again.
const STORAGE_KEY = "maintenanceNoticeSeen";

const MaintenanceNotice = () => {
  const [open, setOpen] = useState(() => {
    try {
      return !sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return true;
    }
  });

  if (!open) return null;

  const close = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Private mode etc. - it just shows again next page load.
    }
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4"
      onClick={close}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <p className="text-2xl">🛠️</p>
        <h2 className="mt-2 text-lg font-semibold text-gray-900">
          Quick maintenance in progress
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Some images and videos may not load for a short while as we carry
          out maintenance. We&apos;ll be fully back shortly.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Ordering works just fine - you can browse and place your order as
          usual.
        </p>
        <button
          onClick={close}
          className="mt-4 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Got it, continue shopping
        </button>
      </div>
    </div>
  );
};

export default MaintenanceNotice;
