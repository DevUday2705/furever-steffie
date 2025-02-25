import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";
import { productData } from "../constants/constant";
import useEmblaCarousel from "embla-carousel-react";

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // User selections
  const [isBeaded, setIsBeaded] = useState(true);
  const [isFullSet, setIsFullSet] = useState(false);
  const [selectedSize, setSelectedSize] = useState("S");

  // Images based on beaded/non-beaded selection
  const [images, setImages] = useState([]);

  // Embla carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollTo = useCallback(
    (index) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700"></div>
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

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
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
      <div className="container mx-auto px-3 pt-2 pb-12">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Embla Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {images.map((image, index) => (
                <div className="min-w-full relative pb-[100%]" key={index}>
                  <img
                    src={image}
                    alt={`${product.name} - View ${index + 1}`}
                    className="absolute w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center gap-x-2 py-3">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === selectedIndex ? "bg-black w-4" : "bg-black/50"
                }`}
              />
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
                        ? "bg-gray-50 text-gray-800 border border-gray-800"
                        : "bg-gray-50 text-gray-800 border border-gray-200"
                    }`}
                  >
                    Hand Work
                  </button>
                  <button
                    onClick={() => setIsBeaded(false)}
                    className={`py-1.5 px-3 rounded-md text-sm ${
                      !isBeaded
                        ? "bg-gray-50 text-gray-800 border border-gray-800"
                        : "bg-gray-50 text-gray-800 border border-gray-200"
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
                        ? "bg-gray-50 text-gray-800 border border-gray-800"
                        : "bg-gray-50 text-gray-800 border border-gray-200"
                    }`}
                  >
                    Kurta
                  </button>
                  <button
                    onClick={() => setIsFullSet(true)}
                    className={`py-1.5 px-3 rounded-md text-sm ${
                      isFullSet
                        ? "bg-gray-50 text-gray-800 border border-gray-800"
                        : "bg-gray-50 text-gray-800 border border-gray-200"
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
                          : "bg-gray-50 text-gray-800"
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
                  <div className="flex-1">
                    <h3 className="text-xs font-medium text-gray-900">
                      Looking for a specific color?
                    </h3>
                    <div className="mt-2 flex items-center">
                      <input
                        type="text"
                        id="customColor"
                        placeholder="Enter desired color"
                        className="text-xs p-1.5 border border-gray-300 rounded-md mr-2 w-full"
                      />
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          const color =
                            document.getElementById("customColor").value;
                          const productName = product.name; // Replace with dynamic product name
                          const productId = "123"; // Replace with dynamic product ID
                          const message = `Hi! I'm interested in ${productName} (ID: ${productId}) in ${color} color. Is it available?`;
                          const encodedMessage = encodeURIComponent(message);
                          const whatsappNumber = "+918828145667"; // Replace with your WhatsApp number
                          window.open(
                            `https://wa.me/${whatsappNumber}?text=${encodedMessage}`,
                            "_blank"
                          );
                        }}
                        className="inline-flex shrink-0 items-center  text-white text-xs py-1.5 px-3 rounded-md"
                      >
                        <img className="h-7" src="/images/wssp.png" />
                      </a>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">
                      We'll check availability and get back to you quickly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional sections with plenty of space for new content */}
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-900">
                  Product Details
                </h3>
                <div className="mt-2 text-xs text-gray-600 space-y-2">
                  <p>• Premium quality fabric for maximum comfort</p>
                  <p>• Hand-stitched with attention to detail</p>
                  <p>• Designed specifically for pets</p>
                  <p>• Easy to put on and take off</p>
                  <p>• Machine washable</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">
                  Shipping Information
                </h3>
                <div className="mt-2 text-xs text-gray-600">
                  <p>
                    Free shipping on orders above ₹999. Standard delivery within
                    3-5 business days.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">
                  Return Policy
                </h3>
                <div className="mt-2 text-xs text-gray-600">
                  <p>
                    Easy 7-day returns for unworn items. Please contact our
                    customer service for more details.
                  </p>
                </div>
              </div>

              {/* Space for customer reviews */}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Add to Cart Button */}
      <div className="fixed bottom-0 max-w-md mx-auto left-0 right-0 bg-white shadow-top p-3 z-20">
        <motion.button
          className="w-full py-3 bg-gray-800 text-white font-medium rounded-md"
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // Create order details object with all selected options
            const orderDetails = {
              productId: product.id,
              name: product.name,
              subcategory: product.subcategory,
              isBeaded: isBeaded,
              isFullSet: isFullSet,
              selectedSize: selectedSize,
              price: calculatePrice(),
              image: images[0], // Pass the first image as the primary image
            };

            // Navigate to review page with the order details
            navigate("/review", {
              state: { orderDetails },
            });
          }}
        >
          Buy Now • ₹{calculatePrice()}
        </motion.button>
      </div>
    </div>
  );
};

export default ProductDetail;
