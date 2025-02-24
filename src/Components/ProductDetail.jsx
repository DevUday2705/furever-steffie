import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
          <p className="mt-2 text-gray-600">
            The product you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="mt-4 inline-block text-purple-600 font-medium"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page in history
  };

  const isSimpleDisabled = () => {
    // Case 1: If product is in "full work kurta" category
    if (product.category === "full-work-kurta") {
      return true;
    }

    // Case 2: If product is in solid kurta category and full set is selected
    if (product.category === "solid-kurta" && isFullSet) {
      return true;
    }

    return false;
  };

  const isKurtaOnlyDisabled = () => {
    // Add your business logic here if needed
    return false;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 py-3">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center text-gray-600"
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
                className="absolute w-full h-full object-cover rounded-lg"
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
            <div className="text-xs font-medium text-gray-600">
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
              <p className="text-sm text-gray-600">{product.description}</p>
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
                    onClick={() => setIsBeaded(false)}
                    className={`py-1.5 px-3 rounded-md text-sm ${
                      !isBeaded
                        ? "bg-gray-100 text-gray-800 border border-gray-800"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                  >
                    Simple
                  </button>
                </div>
              </div>

              {/* Set Type Selection */}
              <div>
                <h3 className="text-xs font-medium text-gray-900">
                  Product Type
                </h3>
                <div className="mt-1 flex space-x-2">
                  <button
                    onClick={() => setIsFullSet(false)}
                    className={`py-1.5 px-3 rounded-md text-sm ${
                      !isFullSet
                        ? "bg-gray-100 text-gray-800 border border-gray-800"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                  >
                    Kurta
                  </button>
                  <button
                    onClick={() => setIsFullSet(true)}
                    className={`py-1.5 px-3 rounded-md text-sm ${
                      isFullSet
                        ? "bg-gray-100 text-gray-800 border border-gray-800"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                  >
                    Full Set
                  </button>
                </div>
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
                          : "bg-gray-100 text-gray-800"
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

              {/* Quantity */}
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
