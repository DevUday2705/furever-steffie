import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { productDataMap } from "../constants/constant";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";
import BackButton from "../Components/ProductDetail/BackButton";
import ImageCarousel from "../components/ProductDetail/ImageCarousel";
import ProductInfo from "../components/ProductDetail/ProductInfo";
import ProductOptions from "../components/ProductDetail/ProductOptions";
import CustomColorEnquiry from "../components/ProductDetail/CustomColorEnquiry";
import BottomActions from "../components/ProductDetail/BottomActions";
import ProductMeasurements from "../components/ProductDetail/ProductMeasurements";
import ReadyMadeSizeSelector from "../components/ReadyMadeSizeSelector";

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
  const [measurementsValid, setMeasurementsValid] = useState(false);
  const [measurements, setMeasurements] = useState({
    neck: "",
    chest: "",
    back: "",
  });
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

  const sizeCodeMap = {
    Small: "S",
    Medium: "M",
    Large: "L",
    XL: "XL",
    XXL: "XXL",
  };

  const calculatePrice = () => {
    if (!product) return 0;

    let price = product.pricing.basePrice;

    if (isFullSet && product.pricing.fullSetAdditional) {
      price += product.pricing.fullSetAdditional;
    }

    if (isBeaded && product.pricing.beadedAdditional) {
      price += product.pricing.beadedAdditional;
    }

    const mappedSize = sizeCodeMap[selectedSize] ?? "S"; // 👈 this is key
    price += product.pricing.sizeIncrements[mappedSize] ?? 0;

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

  const categoriesThatRequireMeasurements = [
    "solid-kurtas",
    "brocade-kurtas",
    "printed-kurtas",
    "tuxedos",
    "lehengas",
    "dresses",
  ];

  const requiresMeasurements = categoriesThatRequireMeasurements.includes(
    product.category
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <BackButton onClick={handleGoBack} />

      <div className="container mx-auto px-3 pt-2 pb-12">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ImageCarousel
            images={images}
            selectedIndex={selectedIndex}
            scrollTo={scrollTo}
            scrollSnaps={scrollSnaps}
            emblaRef={emblaRef}
          />

          <ProductInfo product={product} calculatePrice={calculatePrice} />
          {requiresMeasurements ? (
            <ProductMeasurements
              onSizeDetected={(size, measurements) => {
                setSelectedSize(size);
                setMeasurements(measurements);
              }}
              setMeasurementsValid={setMeasurementsValid}
            />
          ) : (
            <ReadyMadeSizeSelector
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              sizes={product.sizes || ["S", "M", "L", "XL"]}
            />
          )}
          <ProductOptions
            product={product}
            isBeaded={isBeaded}
            setIsBeaded={setIsBeaded}
            isFullSet={isFullSet}
            setIsFullSet={setIsFullSet}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
          />

          {product.contactForCustomColors && (
            <CustomColorEnquiry product={product} />
          )}
        </div>
      </div>

      <BottomActions
        product={product}
        images={images}
        isBeaded={isBeaded}
        isFullSet={isFullSet}
        selectedSize={selectedSize}
        calculatePrice={calculatePrice}
        navigate={navigate}
        addToCart={addToCart}
        setIsOpen={setIsOpen}
        measurements={measurements}
        measurementsValid={measurementsValid}
        requiresMeasurements={requiresMeasurements}
      />
    </div>
  );
};

export default ProductDetail;
