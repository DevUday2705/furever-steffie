import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { productDataMap } from "../constants/constant";
import { useAppContext } from "../context/AppContext";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsOpen } = useAppContext();
  const [idPart, categoryPart] = productId.split("+");

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isBeaded, setIsBeaded] = useState(true);
  const [isFullSet, setIsFullSet] = useState(false);
  const [selectedSize, setSelectedSize] = useState("S");
  const [images, setImages] = useState([]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollTo = useCallback(
    (index) => emblaApi?.scrollTo(index),
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
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const fetchProduct = () => {
      const categoryData = productDataMap[categoryPart.toLowerCase()];
      if (!categoryData) return null;

      // Handle nested products with subcategories
      if (Array.isArray(categoryData.subcategories)) {
        for (const sub of categoryData.subcategories) {
          const match = sub.products.find((p) => p.id === idPart);
          if (match) return { ...match, subcategory: sub.name };
        }
      }

      // Handle flat product arrays
      if (Array.isArray(categoryData.products)) {
        const match = categoryData.products.find((p) => p.id === idPart);
        if (match) return match;
      }

      // Handle direct product array (no wrapper)
      if (Array.isArray(categoryData)) {
        const match = categoryData.find((p) => p.id === idPart);
        if (match) return match;
      }

      return null;
    };

    setTimeout(() => {
      const foundProduct = fetchProduct();

      if (foundProduct) {
        setProduct(foundProduct);
        setIsBeaded(foundProduct.defaultOptions?.isBeaded ?? true);
        setIsFullSet(foundProduct.defaultOptions?.isFullSet ?? false);
        setSelectedSize(foundProduct.defaultOptions?.size ?? "S");

        const defaultIsBeaded = foundProduct.defaultOptions?.isBeaded ?? true;
        if (foundProduct.options) {
          setImages(
            defaultIsBeaded
              ? foundProduct.options.beaded?.images ?? []
              : foundProduct.options.nonBeaded?.images ?? []
          );
        } else {
          setImages([foundProduct.mainImage]);
        }
      }

      setIsLoading(false);
    }, 500);
  }, [productId]);

  useEffect(() => {
    if (!product) return;
    if (product.options) {
      setImages(
        isBeaded
          ? product.options.beaded?.images ?? []
          : product.options.nonBeaded?.images ?? []
      );
    } else {
      setImages([product.mainImage]);
    }
  }, [isBeaded, product]);

  const calculatePrice = () => {
    if (!product) return 0;

    let price = product.pricing.basePrice;

    if (isFullSet && product.pricing.fullSetAdditional) {
      price += product.pricing.fullSetAdditional;
    }

    if (isBeaded && product.pricing.beadedAdditional) {
      price += product.pricing.beadedAdditional;
    }

    price += product.pricing.sizeIncrements[selectedSize] ?? 0;

    return price;
  };

  const handleGoBack = () => navigate(-1);

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

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Back Navigation */}
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
          {/* Image Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {images.map((img, idx) => (
                <div className="min-w-full relative pb-[100%]" key={idx}>
                  <img
                    src={img}
                    alt={`${product.name} - View ${idx + 1}`}
                    className="absolute w-full h-full object-cover object-[0%_25%]"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-x-2 py-3">
            {scrollSnaps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollTo(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  selectedIndex === idx ? "bg-black w-4" : "bg-black/50"
                }`}
              />
            ))}
          </div>

          {/* Info Section */}
          <div className="p-4">
            {product.subcategory && (
              <div className="text-xs font-medium text-gray-600">
                {product.subcategory}
              </div>
            )}
            <h1 className="text-xl font-bold text-gray-800 mt-1">
              {product.name}
            </h1>

            <div className="mt-2 text-2xl font-bold text-gray-800">
              ₹{calculatePrice()}
            </div>

            <p className="mt-3 text-sm text-gray-600">{product.description}</p>

            {/* Options */}
            <div className="mt-4 space-y-4">
              {/* Style */}
              {product.options && (
                <div>
                  <h3 className="text-xs font-medium text-gray-900">Style</h3>
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
                </div>
              )}

              {/* Product Type */}
              {product.options && (
                <div>
                  <h3 className="text-xs font-medium text-gray-900">
                    Product Type
                  </h3>
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

              {/* Size Selection */}
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-medium text-gray-900">Size</h3>
                  <button className="text-xs text-gray-800">Size Guide</button>
                </div>
                <div className="mt-1 grid grid-cols-6 gap-1">
                  {product.sizes?.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-1.5 text-xs font-medium rounded-md ${
                        selectedSize === size
                          ? "bg-gray-800 text-white"
                          : "bg-gray-50 text-gray-800"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color */}
              {product.contactForCustomColors && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-start">
                    <Check className="mr-2 mt-0.5 text-gray-800" size={16} />
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
                            const message = `Hi! I'm interested in ${product.name} (ID: ${product.id}) in ${color} color. Is it available?`;
                            window.open(
                              `https://wa.me/+918828145667?text=${encodeURIComponent(
                                message
                              )}`,
                              "_blank"
                            );
                          }}
                          className="inline-flex items-center text-white text-xs py-1.5 px-3 rounded-md"
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
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Buy Button */}
      <div className="fixed bottom-0 max-w-md mx-auto left-0 right-0 bg-white shadow-top p-3 z-20">
        <motion.button
          className="w-full py-3 bg-gray-800 text-white font-medium rounded-md"
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            const orderDetails = {
              productId: product.id,
              name: product.name,
              subcategory: product.subcategory,
              isBeaded,
              isFullSet,
              selectedSize,
              price: calculatePrice(),
              image: images[0],
            };
            navigate("/review", { state: { orderDetails } });
          }}
        >
          Buy Now • ₹{calculatePrice()}
        </motion.button>
        <motion.button
          className="w-full py-3  text-gray-800 border border-gray-800 mt-2 font-medium rounded-md"
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            addToCart({
              productId: product.id,
              name: product.name,
              subcategory: product.subcategory,
              isBeaded,
              isFullSet,
              selectedSize,
              price: calculatePrice(),
              image: images[0],
              quantity: 1,
            });
            setIsOpen(true);
          }}
        >
          Add to Cart • ₹{calculatePrice()}
        </motion.button>
      </div>
    </div>
  );
};

export default ProductDetail;
