import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { frocks, kurtas } from "../constants/constant"; // Import all types separately
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";
import BackButton from "../Components/ProductDetail/BackButton";
import ImageCarousel from "../Components/ProductDetail/ImageCarousel";
import ProductInfo from "../Components/ProductDetail/ProductInfo";
import ProductOptions from "../Components/ProductDetail/ProductOptions";
import CustomColorEnquiry from "../Components/ProductDetail/CustomColorEnquiry";
import BottomActions from "../Components/ProductDetail/BottomActions";
import ProductMeasurements from "../Components/ProductDetail/ProductMeasurements";
import ReadyMadeSizeSelector from "../Components/ReadyMadeSizeSelector";
import SmartPetSizing from "../Components/SmartPetSizing";
const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsOpen } = useAppContext();
  const [idPart, typePart] = productId.split("+");
  const [selectedColor, setSelectedColor] = useState(null);
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isBeaded, setIsBeaded] = useState(true);
  const [isFullSet, setIsFullSet] = useState(false);
  const [selectedSize, setSelectedSize] = useState("S");
  const [selectedDhoti, setSelectedDhoti] = useState(
    product?.dhotis?.length ? product.dhotis[0].id : null
  );
  const [images, setImages] = useState([]);
  const [measurementsValid, setMeasurementsValid] = useState(false);
  const [petInfo, setPetInfo] = useState(null); // ADD THIS LINE
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
      let productArray = [];

      // 👇 Based on type
      if (typePart === "kurta") productArray = kurtas;
      else if (typePart === "frock") productArray = frocks;
      else if (typePart === "bow") productArray = bows;
      else if (typePart === "lehnga") productArray = lehngas;
      else if (typePart === "tuxedo") productArray = tuxedos;
      else return null; // Invalid type

      return productArray.find((p) => p.id === idPart) || null;
    };

    setTimeout(() => {
      const foundProduct = fetchProduct();

      if (foundProduct) {
        setProduct(foundProduct);
        setIsBeaded(foundProduct.defaultOptions?.isBeaded ?? true);
        setIsFullSet(foundProduct.defaultOptions?.isFullSet ?? false);
        setSelectedSize(foundProduct.defaultOptions?.size ?? "S");

        // NEW: Set default color
        const defaultColor =
          foundProduct.defaultOptions?.color || foundProduct.colors?.[0]?.id;
        setSelectedColor(defaultColor);

        // NEW: Updated image logic for colors
        const defaultIsBeaded = foundProduct.defaultOptions?.isBeaded ?? true;
        if (foundProduct.colors && foundProduct.colors.length > 0) {
          const colorData = foundProduct.colors.find(
            (c) => c.id === defaultColor
          );
          if (colorData?.options) {
            setImages(
              defaultIsBeaded
                ? colorData.options.beaded?.images ?? []
                : colorData.options.nonBeaded?.images ?? []
            );
          }
        } else if (foundProduct.options) {
          // Fallback to old structure
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
    if (product.colors && selectedColor) {
      const colorData = product.colors.find((c) => c.id === selectedColor);
      if (colorData?.options) {
        setImages(
          isBeaded
            ? colorData.options.beaded?.images ?? []
            : colorData.options.nonBeaded?.images ?? []
        );
        return;
      }
    }
    if (product.options) {
      setImages(
        isBeaded
          ? product.options.beaded?.images ?? []
          : product.options.nonBeaded?.images ?? []
      );
    } else {
      setImages([product.mainImage]);
    }
  }, [isBeaded, product, selectedColor]);

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

    const mappedSize = sizeCodeMap[selectedSize] || selectedSize;
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
    "kurta",
    "lehnga",
    "frock",
    "tuxedo",
    "dress",
  ];

  const requiresMeasurements =
    categoriesThatRequireMeasurements.includes(typePart);

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
          <ProductOptions
            product={product}
            isBeaded={isBeaded}
            setIsBeaded={setIsBeaded}
            isFullSet={isFullSet}
            setIsFullSet={setIsFullSet}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            selectedDhoti={selectedDhoti}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            setSelectedDhoti={setSelectedDhoti}
          />
          {requiresMeasurements ? (
            <SmartPetSizing
              onSizeDetected={(size, petInfo) => {
                setSelectedSize(size);
                setPetInfo(petInfo); // Store breed/age/bodyType
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
        selectedDhoti={selectedDhoti}
        selectedSize={selectedSize}
        selectedColor={selectedColor} // NEW
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
