import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Check, AlertTriangle } from "lucide-react";
import { productData } from "../constants/constant";
// This would normally be fetched from an API

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const navigate = useNavigate();
  // User selections
  const [isBeaded, setIsBeaded] = useState(true);
  const [isFullSet, setIsFullSet] = useState(false);
  const [selectedSize, setSelectedSize] = useState("S");

  // Images based on beaded/non-beaded selection
  const [images, setImages] = useState([]);

  // Option validation state
  const [validationMessages, setValidationMessages] = useState({
    beaded: "",
    fullSet: "",
  });

  useEffect(() => {
    // Simulate API fetch for product details
    setTimeout(() => {
      // Find the product from all subcategories
      let foundProduct = null;

      for (const subcategory of productData.subcategories) {
        const product = subcategory.products.find((p) => p.id === productId);
        if (product) {
          foundProduct = { ...product, subcategory: subcategory.name };
          break;
        }
      }

      if (foundProduct) {
        setProduct(foundProduct);
        // Set default options from product
        setIsBeaded(foundProduct.defaultOptions.isBeaded);
        setIsFullSet(foundProduct.defaultOptions.isFullSet);
        setSelectedSize(foundProduct.defaultOptions.size);

        // Set initial images based on default beaded option
        setImages(foundProduct.options.beaded.images);
      }

      setIsLoading(false);
    }, 700);
  }, [productId]);

  // Update images when beaded option changes
  useEffect(() => {
    if (product) {
      setImages(
        isBeaded
          ? product.options.beaded.images
          : product.options.nonBeaded.images
      );
      setCurrentImage(0); // Reset to first image on option change
    }
  }, [isBeaded, product]);

  // Handle option validation based on multiple conditions
  useEffect(() => {
    if (!product) return;

    const newValidationMessages = {
      beaded: "",
      fullSet: "",
    };

    // Enforce rules based on conditions:

    // For Solid Kurtas Category - If Full Set selected, then Simple should be disabled
    if (product.category === "solid-kurta" && isFullSet && !isBeaded) {
      setIsBeaded(true); // Auto-select beaded option
      newValidationMessages.beaded =
        "For Full Set, you must select Hand Work option. Simple is not available.";
    }

    // For Full Work Kurta category - Simple option is never available
    if (product.category === "full-work-kurta" && !isBeaded) {
      setIsBeaded(true); // Auto-select beaded option
      newValidationMessages.beaded =
        "This product is only available with Hand Work option.";
    }

    // For Premium category - Kurta Only option is not available
    if (product.category === "premium" && !isFullSet) {
      setIsFullSet(true); // Auto-select full set
      newValidationMessages.fullSet =
        "Premium designs are only available as Full Set.";
    }

    // For Festive category - If Simple selected, Full Set is not available
    if (product.category === "festive" && !isBeaded && isFullSet) {
      setIsFullSet(false); // Auto-select kurta only
      newValidationMessages.fullSet =
        "Simple option is only available as Kurta Only.";
    }

    setValidationMessages(newValidationMessages);
  }, [isBeaded, isFullSet, product]);

  // Calculate price based on all selections
  const calculatePrice = () => {
    if (!product) return 0;

    let price = product.pricing.basePrice;

    if (isFullSet) {
      price += product.pricing.fullSetAdditional;
    }

    if (isBeaded) {
      price += product.pricing.beadedAdditional;
    }

    // Add size increment
    price += product.pricing.sizeIncrements[selectedSize];

    return price;
  };

  // Check if beaded/simple option should be disabled
  const isSimpleDisabled = () => {
    if (!product) return false;

    // Case 1: If product is in "full work kurta" category
    if (product.category === "full-work-kurtas") {
      setIsBeaded(true);
      return true;
    }

    // Case 2: If product is in solid kurta category and full set is selected
    if (product.category === "solid-kurtas" && isFullSet) {
      setIsBeaded(true);
      return true;
    }

    return false;
  };

  // Check if full set/kurta only option should be disabled
  const isKurtaOnlyDisabled = () => {
    if (!product) return false;
    // lOGIC TO MAKE KURTA ONLY DISABLED
    return false;
  };

  // Check if full set option should be disabled
  const isFullSetDisabled = () => {
    if (!product) return false;

    // lOGIC TO MAKE FULL SET DISABLED

    return false;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Product Not Found
          </h2>
          <p className="mt-2 text-gray-800">
            The product you're looking for doesn't exist.
          </p>
          <Link to="/" className="mt-4 inline-block text-gray-800 font-medium">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page in history
  };

  console.log(isSimpleDisabled(), product);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 py-3">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center text-gray-800"
          >
            <ChevronLeft size={18} />
            <span className="ml-1 text-sm">Back</span>
          </button>
        </div>
      </div>
      {/* Product Detail */}
      <div className="container mx-auto px-3 pt-2 pb-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Product Images */}
          <div className="relative pb-[100%]">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={images[currentImage]}
                alt={product.name}
                className="absolute w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>
          </div>

          {/* Thumbnail Navigation */}
          <div className="flex p-2 space-x-2 overflow-x-auto">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-14 h-14 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                  currentImage === index
                    ? "border-gray-500"
                    : "border-transparent"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Product Info */}
          <div className="p-4">
            <div className="text-xs font-medium text-gray-800">
              {product.subcategory}
            </div>
            <h1 className="text-xl font-bold text-gray-800 mt-1">
              {product.name}
            </h1>

            <div className="mt-2">
              <div className="text-2xl font-bold text-gray-800">
                ₹{calculatePrice()}
              </div>
            </div>

            <div className="mt-3">
              <p className="text-sm text-gray-800">{product.description}</p>
            </div>

            {/* Options */}
            <div className="mt-4 space-y-4">
              {/* Beaded/Non-Beaded Selection */}
              <div>
                <h3 className="text-xs font-medium text-gray-900">Style</h3>
                <div className="mt-1 flex space-x-2">
                  <button
                    onClick={() => setIsBeaded(true)}
                    className={`py-1.5 px-3 rounded-md text-sm ${
                      isBeaded
                        ? "bg-gray-100 text-gray-800 border border-gray-800"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                  >
                    Hand Work
                  </button>
                  <button
                    onClick={() => !isSimpleDisabled() && setIsBeaded(false)}
                    className={`py-1.5 px-3 rounded-md text-sm ${
                      !isBeaded
                        ? "bg-gray-100 text-gray-800 border border-gray-800"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    } ${
                      isSimpleDisabled()
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    Simple
                  </button>
                </div>

                {/* Validation message for beaded/simple option */}
                {validationMessages.beaded && (
                  <div className="mt-1.5 flex items-start">
                    <div className="flex-shrink-0 mt-0.5 text-amber-500">
                      <AlertTriangle size={14} />
                    </div>
                    <p className="ml-1.5 text-xs text-amber-600">
                      {validationMessages.beaded}
                    </p>
                  </div>
                )}
              </div>

              {/* Set Type Selection */}
              <div>
                <h3 className="text-xs font-medium text-gray-900">
                  Product Type
                </h3>
                <div className="mt-1 flex space-x-2">
                  <button
                    onClick={() =>
                      !isKurtaOnlyDisabled() && setIsFullSet(false)
                    }
                    className={`py-1.5 px-3 rounded-md text-sm ${
                      !isFullSet
                        ? "bg-white text-gray-800 border border-gray-800"
                        : "bg-white text-gray-800 border border-gray-200"
                    } ${
                      isKurtaOnlyDisabled()
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    Kurta
                  </button>
                  <button
                    onClick={() => !isFullSetDisabled() && setIsFullSet(true)}
                    className={`py-1.5 px-3 rounded-md text-sm ${
                      isFullSet
                        ? "bg-white text-gray-800 border border-gray-800"
                        : "bg-white text-gray-800 border border-gray-200"
                    } ${
                      isFullSetDisabled()
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    Full Set
                  </button>
                </div>

                {/* Validation message for full set/kurta option */}
                {validationMessages.fullSet && (
                  <div className="mt-1.5 flex items-start">
                    <div className="flex-shrink-0 mt-0.5 text-amber-500">
                      <AlertTriangle size={14} />
                    </div>
                    <p className="ml-1.5 text-xs text-amber-600">
                      {validationMessages.fullSet}
                    </p>
                  </div>
                )}
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-gray-900">Size</h3>
                  <button className="text-xs text-gray-800">Size Guide</button>
                </div>
                <div className="mt-1 grid grid-cols-6 gap-1">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex items-center justify-center py-1.5 text-xs font-medium rounded-md ${
                        selectedSize === size
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-800"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {selectedSize !== "S" && (
                    <span>
                      {selectedSize < "S" ? "Discount" : "Extra charge"} of ₹
                      {Math.abs(product.pricing.sizeIncrements[selectedSize])}{" "}
                      for size {selectedSize}
                    </span>
                  )}
                </div>
              </div>

              {/* Custom Color */}
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-start">
                  <div className="mr-2 mt-0.5 text-gray-800">
                    <Check size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-gray-900">
                      Looking for a specific color?
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Contact us to check availability of custom colors.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Add to Cart Button */}
      <div className="fixed bottom-0 max-w-md mx-auto left-0 right-0 bg-white shadow-top p-3">
        <motion.button
          className="w-full py-3 bg-gray-800 text-white font-medium rounded-md"
          whileTap={{ scale: 0.98 }}
        >
          Buy Now • ₹{calculatePrice()}
        </motion.button>
      </div>
    </div>
  );
};

export default ProductDetail;
