// src/components/ProductDetail/ProductMeasurements.jsx

import React, { useState, useEffect } from "react";

const ProductMeasurements = ({ onSizeDetected, setMeasurementsValid }) => {
  const [neck, setNeck] = useState("");
  const [chest, setChest] = useState("");
  const [back, setBack] = useState("");

  const [detectedSize, setDetectedSize] = useState(null);
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = "";

    if (!value) {
      error = "Required";
    } else if (isNaN(value) || Number(value) <= 0) {
      error = "Enter a valid number";
    } else {
      const num = Number(value);
      if (name === "neck" && (num < 4 || num > 32)) {
        error = 'Enter between 4" to 32"';
      }
      if (name === "chest" && (num < 8 || num > 48)) {
        error = 'Enter between 8" to 48"';
      }
      if (name === "back" && (num < 6 || num > 40)) {
        error = 'Enter between 6" to 40"';
      }
    }

    return error;
  };

  const mapMeasurementsToSize = (neck, chest, back) => {
    const n = Number(neck);
    const c = Number(chest);
    const b = Number(back);

    if (n >= 14 && n <= 16 && c >= 20 && c <= 24 && b >= 14 && b <= 16) {
      return "Small";
    } else if (n >= 17 && n <= 20 && c >= 25 && c <= 30 && b >= 17 && b <= 20) {
      return "Medium";
    } else if (n >= 21 && n <= 24 && c >= 31 && c <= 36 && b >= 21 && b <= 24) {
      return "Large";
    } else if (n >= 25 && n <= 28 && c >= 37 && c <= 42 && b >= 25 && b <= 28) {
      return "XL";
    } else if (n >= 29 && n <= 32 && c >= 43 && c <= 48 && b >= 29 && b <= 32) {
      return "XXL";
    } else {
      return null;
    }
  };

  useEffect(() => {
    const newErrors = {
      neck: validateField("neck", neck),
      chest: validateField("chest", chest),
      back: validateField("back", back),
    };
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => err !== "");

    if (!hasErrors) {
      const size = mapMeasurementsToSize(neck, chest, back);
      setDetectedSize(size);
      setMeasurementsValid(true); // 👈 perfectly safe
      onSizeDetected(size, { neck, chest, back }); // 👈 perfectly safe
    } else {
      setDetectedSize(null);
      setMeasurementsValid(false);
    }
  }, [neck, chest, back]);

  return (
    <div className="bg-gray-50 p-4 rounded-md space-y-6">
      {/* ✨ Motivational Section */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-sm text-gray-800 space-y-2 shadow-sm">
        <div className="font-semibold text-gray-900 flex items-center gap-2">
          🧵 Why we need measurements
        </div>
        <ul className="list-disc pl-5 space-y-1 text-[13px]">
          <li>Every outfit is stitched custom for your pet 🐾</li>
          <li>No ready-made sizing – only perfect fit ✂️</li>
          <li>Better comfort, hygiene & zero return issues ✅</li>
        </ul>
      </div>

      {/* 📏 Input Fields */}
      <div className="space-y-4">
        {/* Neck */}
        <div>
          <label className="text-xs text-gray-700 font-medium">
            Neck Circumference (inches)
          </label>
          <input
            type="text"
            value={neck}
            onChange={(e) => setNeck(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md text-sm"
            placeholder="e.g., 14"
          />
          {errors.neck && (
            <p className="text-xs text-red-500 mt-1">{errors.neck}</p>
          )}
        </div>

        {/* Chest */}
        <div>
          <label className="text-xs text-gray-700 font-medium">
            Chest Circumference (inches)
          </label>
          <input
            type="text"
            value={chest}
            onChange={(e) => setChest(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md text-sm"
            placeholder="e.g., 24"
          />
          {errors.chest && (
            <p className="text-xs text-red-500 mt-1">{errors.chest}</p>
          )}
        </div>

        {/* Back */}
        <div>
          <label className="text-xs text-gray-700 font-medium">
            Back Length (inches)
          </label>
          <input
            type="text"
            value={back}
            onChange={(e) => setBack(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md text-sm"
            placeholder="e.g., 16"
          />
          {errors.back && (
            <p className="text-xs text-red-500 mt-1">{errors.back}</p>
          )}
        </div>
      </div>

      {/* ✅ Detected Pet Size */}
      {detectedSize && (
        <div className="text-green-600 font-medium text-sm mt-1">
          🎉 Measurements saved! Pet Size Detected: {detectedSize}
        </div>
      )}
    </div>
  );
};

export default ProductMeasurements;
