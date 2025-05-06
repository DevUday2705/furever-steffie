import React, { useState, useEffect } from "react";

const ProductMeasurements = ({ onSizeDetected, setMeasurementsValid }) => {
  const [measurements, setMeasurements] = useState({
    neck: "",
    chest: "",
    back: "",
  });
  const [touched, setTouched] = useState({
    neck: false,
    chest: false,
    back: false,
  });
  const [detectedSize, setDetectedSize] = useState(null);
  const [errors, setErrors] = useState({});
  const [proportionError, setProportionError] = useState("");
  const [allFieldsFilled, setAllFieldsFilled] = useState(false);

  const handleChange = (name, value) => {
    setMeasurements((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

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

  // Check for proportional consistency in measurements
  const validateProportions = (neck, chest, back) => {
    const n = Number(neck);
    const c = Number(chest);
    const b = Number(back);

    // All fields have values and are in range but don't fit into a size category
    if (n && c && b) {
      // Check for unrealistic proportion combinations
      if (n > c) {
        return "Neck measurement cannot be larger than chest measurement";
      }

      // Check if measurements don't belong to any size category
      if (!mapMeasurementsToSize(neck, chest, back)) {
        return "These measurements don't match any standard size. Please verify your measurements.";
      }
    }

    return "";
  };

  const mapMeasurementsToSize = (neck, chest, back) => {
    const n = Number(neck);
    const c = Number(chest);
    const b = Number(back);

    // Added Extra Small size option for smaller pets
    if (n >= 10 && n < 14 && c >= 16 && c < 20 && b >= 10 && b < 14) {
      return "XS";
    } else if (n >= 14 && n <= 16 && c >= 20 && c <= 24 && b >= 14 && b <= 16) {
      return "Sm";
    } else if (n >= 17 && n <= 20 && c >= 25 && c <= 30 && b >= 17 && b <= 20) {
      return "Md";
    } else if (n >= 21 && n <= 24 && c >= 31 && c <= 36 && b >= 21 && b <= 24) {
      return "Lg";
    } else if (n >= 25 && n <= 28 && c >= 37 && c <= 42 && b >= 25 && b <= 28) {
      return "XL";
    } else if (n >= 29 && n <= 32 && c >= 43 && c <= 48 && b >= 29 && b <= 32) {
      return "XXL";
    } else {
      return null;
    }
  };

  useEffect(() => {
    const { neck, chest, back } = measurements;
    const newErrors = {
      neck: validateField("neck", neck),
      chest: validateField("chest", chest),
      back: validateField("back", back),
    };
    setErrors(newErrors);

    // Check if all fields have values (even if they have validation errors)
    const allFilled = neck !== "" && chest !== "" && back !== "";
    setAllFieldsFilled(allFilled);

    const hasFieldErrors = Object.values(newErrors).some((err) => err !== "");

    // Check for proportion errors only if all fields have valid individual values
    const propError =
      !hasFieldErrors && allFilled
        ? validateProportions(neck, chest, back)
        : "";
    setProportionError(propError);

    if (!hasFieldErrors && !propError && allFilled) {
      const size = mapMeasurementsToSize(neck, chest, back);
      setDetectedSize(size);
      setMeasurementsValid(true);
      onSizeDetected(size, measurements);
    } else {
      setDetectedSize(null);
      setMeasurementsValid(false);
    }
  }, [measurements]);

  // Get all current errors but only show for touched fields
  const getVisibleErrors = () => {
    const visibleErrors = {};
    Object.keys(errors).forEach((key) => {
      if (touched[key] && errors[key]) {
        visibleErrors[key] = errors[key];
      }
    });
    return visibleErrors;
  };

  const visibleErrors = getVisibleErrors();
  const hasVisibleErrors = Object.keys(visibleErrors).length > 0;
  const showProportionError =
    proportionError &&
    allFieldsFilled &&
    touched.neck &&
    touched.chest &&
    touched.back;

  // Helper to shorten labels for display
  const shortenLabel = (field) => {
    if (field === "neck") return "Neck";
    if (field === "chest") return "Chest";
    if (field === "back") return "Back Length";
    return field;
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md space-y-4">
      {/* Motivational Section - More compact */}
      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md text-sm text-gray-800 shadow-sm">
        <div className="font-semibold text-gray-900 mb-1">
          🧵 Why we need measurements
        </div>
        <div className="text-xs flex flex-wrap gap-2">
          <span>• Custom stitched for your pet</span>
          <span>• Perfect fit guaranteed</span>
          <span>• Zero returns</span>
        </div>
      </div>

      {/* Input Fields in a Row */}
      <div className="flex flex-wrap gap-2">
        {/* Neck */}
        <div className="flex-1 min-w-0">
          <label className="text-xs text-gray-700 font-medium block mb-1">
            Neck (inches)
          </label>
          <input
            type="text"
            value={measurements.neck}
            onChange={(e) => handleChange("neck", e.target.value)}
            onBlur={() => handleBlur("neck")}
            className={`p-2 w-full border ${
              touched.neck && errors.neck ? "border-red-300" : "border-gray-300"
            } rounded-md text-sm`}
            placeholder="e.g. 14"
          />
        </div>

        {/* Chest */}
        <div className="flex-1 min-w-0">
          <label className="text-xs text-gray-700 font-medium block mb-1">
            Chest (inches)
          </label>
          <input
            type="text"
            value={measurements.chest}
            onChange={(e) => handleChange("chest", e.target.value)}
            onBlur={() => handleBlur("chest")}
            className={`p-2 w-full border ${
              touched.chest && errors.chest
                ? "border-red-300"
                : "border-gray-300"
            } rounded-md text-sm`}
            placeholder="e.g. 24"
          />
        </div>

        {/* Back */}
        <div className="flex-1 min-w-0">
          <label className="text-xs text-gray-700 font-medium block mb-1">
            Back (inches)
          </label>
          <input
            type="text"
            value={measurements.back}
            onChange={(e) => handleChange("back", e.target.value)}
            onBlur={() => handleBlur("back")}
            className={`p-2 w-full border ${
              touched.back && errors.back ? "border-red-300" : "border-gray-300"
            } rounded-md text-sm`}
            placeholder="e.g. 16"
          />
        </div>
      </div>

      {/* Field-specific Error Display */}
      {hasVisibleErrors && (
        <div className="text-xs text-red-500 p-2 bg-red-50 rounded-md border border-red-100">
          <p className="font-medium mb-1">Please fix the following errors:</p>
          <ul className="pl-5 list-disc">
            {Object.entries(visibleErrors).map(([field, error]) => (
              <li key={field}>
                {shortenLabel(field)}: {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Proportion Error Display - only show after all fields are touched */}
      {showProportionError && (
        <div className="text-xs text-red-500 p-2 bg-red-50 rounded-md border border-red-100">
          <p className="font-medium mb-1">Measurement issue:</p>
          <p>{proportionError}</p>
        </div>
      )}

      {/* Size Chart Helper */}
      {!detectedSize &&
        allFieldsFilled &&
        !hasVisibleErrors &&
        !proportionError && (
          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded-md border border-blue-100">
            Finding your pet's size based on measurements...
          </div>
        )}

      {/* Detected Pet Size */}

      {detectedSize && (
        <div className="mt-3 bg-green-50 rounded-lg border-2 border-green-300 overflow-hidden shadow-sm">
          <div className="p-4 flex items-center">
            <div className="bg-white rounded-full p-2 mr-3 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">
                RECOMMENDED SIZE FOR YOUR PET
              </p>
              <p className="text-2xl font-bold text-gray-800">{detectedSize}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductMeasurements;
