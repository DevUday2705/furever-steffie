import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const CurrencySelector = ({ currency, setCurrency }) => {
  const [isOpen, setIsOpen] = useState(false);

  const currencies = [
    { value: "INR", label: "🇮🇳 INR (₹)" },
    { value: "SGD", label: "🇸🇬 SGD (S$)" },
    { value: "MYR", label: "🇲🇾 MYR (RM)" },
    { value: "USD", label: "🇺🇸 USD ($)" },
    { value: "GBP", label: "🇬🇧 GBP (£)" },
    { value: "NZD", label: "🇳🇿 NZD (NZ$)" },
    { value: "CAD", label: "🇨🇦 CAD (C$)" },
  ];

  const selected = currencies.find((c) => c.value === currency);

  const handleSelect = (value) => {
    setCurrency(value);
    setIsOpen(false);
  };

  return (
    <div className="relative text-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 border rounded bg-white shadow-sm hover:bg-gray-50"
      >
        <span>{selected?.label.split(" ")[0]}</span> {/* just flag */}
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border rounded shadow w-36">
          {currencies.map((curr) => (
            <button
              key={curr.value}
              onClick={() => handleSelect(curr.value)}
              className={`w-full px-3 py-1 text-left hover:bg-gray-100 ${
                currency === curr.value ? "bg-gray-100 font-semibold" : ""
              }`}
            >
              {curr.label}
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default CurrencySelector;
