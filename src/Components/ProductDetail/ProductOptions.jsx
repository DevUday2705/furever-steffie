import React from "react";

const ProductOptions = ({
  product,
  isBeaded,
  setIsBeaded,
  isFullSet,
  setIsFullSet,
}) => {
  const { isBeadedAvailable, isNonBeadedAvailable } = product;

  const renderStyleOptions = () => {
    if (isBeadedAvailable && isNonBeadedAvailable) {
      // both available, show toggle
      return (
        <div className="mt-1 flex space-x-2">
          <button
            onClick={() => setIsBeaded(true)}
            className={`py-1.5 px-3 rounded-md text-sm ${
              isBeaded ? "border-gray-800" : "border-gray-200"
            } border bg-gray-50 text-gray-800`}
          >
            Hand Work
          </button>
          <button
            onClick={() => setIsBeaded(false)}
            className={`py-1.5 px-3 rounded-md text-sm ${
              !isBeaded ? "border-gray-800" : "border-gray-200"
            } border bg-gray-50 text-gray-800`}
          >
            Simple
          </button>
        </div>
      );
    } else if (isBeadedAvailable) {
      // only beaded available
      return (
        <div className="mt-1">
          <button
            disabled
            className="py-1.5 px-3 rounded-md text-sm border border-gray-800 bg-gray-100 text-gray-800 cursor-not-allowed"
          >
            Hand Work Only
          </button>
        </div>
      );
    } else if (isNonBeadedAvailable) {
      // only non-beaded available
      return (
        <div className="mt-1">
          <button
            disabled
            className="py-1.5 px-3 rounded-md text-sm border border-gray-800 bg-gray-100 text-gray-800 cursor-not-allowed"
          >
            Simple Only
          </button>
        </div>
      );
    } else {
      // neither available (very rare case)
      return null;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* STYLE OPTIONS */}
      {["kurta", "lehnga", "tuxedo"].includes(product.type) &&
        (isBeadedAvailable || isNonBeadedAvailable) && (
          <div>
            <h3 className="text-xs font-medium text-gray-900">Style</h3>
            {renderStyleOptions()}
          </div>
        )}

      {/* PRODUCT TYPE OPTIONS */}
      {product.type === "kurta" && product.options && (
        <div>
          <h3 className="text-xs font-medium text-gray-900">Product Type</h3>
          <div className="mt-1 flex space-x-2">
            <button
              onClick={() => setIsFullSet(false)}
              className={`py-1.5 px-3 rounded-md text-sm ${
                !isFullSet ? "border-gray-800" : "border-gray-200"
              } border bg-gray-50 text-gray-800`}
            >
              Kurta
            </button>
            <button
              onClick={() => setIsFullSet(true)}
              className={`py-1.5 px-3 rounded-md text-sm ${
                isFullSet ? "border-gray-800" : "border-gray-200"
              } border bg-gray-50 text-gray-800`}
            >
              Full Set
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductOptions;
