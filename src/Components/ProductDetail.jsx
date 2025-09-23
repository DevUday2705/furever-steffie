import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { useAppContext } from "../context/AppContext";
import BackButton from "../Components/ProductDetail/BackButton";
import ImageCarousel from "../Components/ProductDetail/ImageCarousel";
import ProductInfo from "../Components/ProductDetail/ProductInfo";
import ProductOptions from "../Components/ProductDetail/ProductOptions";
import CustomColorEnquiry from "../Components/ProductDetail/CustomColorEnquiry";
import BottomActions from "../Components/ProductDetail/BottomActions";
import SimpleSizeSelector from "../Components/ModernSizeSelector";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
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
  const [isDupattaSet, setIsDupattaSet] = useState(false); // NEW
  const [selectedStyle, setSelectedStyle] = useState("simple");
  const [selectedSize, setSelectedSize] = useState("S");
  const [isRoyalSet, setIsRoyalSet] = useState(false);
  const [selectedDhoti, setSelectedDhoti] = useState(
    product?.dhotis?.length ? product.dhotis[0].name : null
  );
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
    const fetchProduct = async () => {
      try {
        const snapshot = await getDocs(collection(db, typePart + "s")); // e.g. "kurtas"
        const allProducts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const foundProduct = allProducts.find((p) => p.id === idPart);

        if (foundProduct) {
          setProduct(foundProduct);
          setIsBeaded(foundProduct.defaultOptions?.isBeaded ?? true);
          setIsFullSet(foundProduct.defaultOptions?.isFullSet ?? false);
          setSelectedSize(foundProduct.defaultOptions?.size ?? "S");

          const defaultColor =
            foundProduct.defaultOptions?.color || foundProduct.colors?.[0]?.id;
          setSelectedColor(defaultColor);

          const isKurta = foundProduct.type === "kurta";
          const defaultIsBeaded = foundProduct.defaultOptions?.isBeaded ?? true;

          // 👇 Combine all beaded & non-beaded images if kurta
          if (isKurta) {
            const beadedImgs = foundProduct.options?.beaded?.images || [];
            const nonBeadedImgs = foundProduct.options?.nonBeaded?.images || [];
            setImages([...beadedImgs, ...nonBeadedImgs]);
          } else if (foundProduct.colors?.length > 0) {
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
            setImages(
              defaultIsBeaded
                ? foundProduct.options.beaded?.images ?? []
                : foundProduct.options.nonBeaded?.images ?? []
            );
          } else {
            setImages([foundProduct.mainImage]);
          }
        } else {
          setProduct(null);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading product:", error);
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, idPart, typePart]);

  useEffect(() => {
    if (!product || product.type === "kurta") return; // ⛔ Skip if kurta

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

    // Handle Royal Set pricing (takes precedence over regular full set)
    if (isRoyalSet) {
      // Royal set includes full set cost + additional 400 premium
      price += (product.pricing.fullSetAdditional || 0) + 300;
    } else if (isFullSet && product.pricing.fullSetAdditional) {
      // Regular full set pricing
      price += product.pricing.fullSetAdditional;
    } else if (isDupattaSet) {
      // Dupatta set pricing - base price + 200 INR
      price += 200;
    }

    // Handle style-based pricing
    switch (selectedStyle) {
      case "simple":
        // No additional cost
        break;

      case "beaded":
        if (product.pricing.beadedAdditional) {
          price += product.pricing.beadedAdditional;
        }
        break;
      case "beaded-tassels":
        if (product.pricing.beadedAdditional) {
          price += product.pricing.beadedAdditional;
        }
        if (product.pricing.tasselsAdditional) {
          price += product.pricing.tasselsAdditional;
        }
        break;
      case "tassels":
        if (product.pricing.tasselsAdditional) {
          price += product.pricing.tasselsAdditional;
        }
        break;
      default:
        break;
    }

    // Size increment pricing
    const mappedSize = sizeCodeMap[selectedSize] || selectedSize;
    price += product.pricing.sizeIncrements[mappedSize] ?? 0;

    return price;
  };
  console.log(selectedStyle);
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

  console.log(product);
  return (
    <div className="bg-gray-50 min-h-screen pb-4">
      <BackButton onClick={handleGoBack} />

      <div className="container mx-auto px-3 pt-2 pb-4">
        <div className="bg-white rounded-lg shadow-md overflow-visible">
          <ImageCarousel
            images={images}
            selectedIndex={selectedIndex}
            scrollTo={scrollTo}
            scrollSnaps={scrollSnaps}
            emblaRef={emblaRef}
          />

          <div className="">
            <ProductInfo product={product} calculatePrice={calculatePrice} />
            <ProductOptions
              product={product}
              isBeaded={isBeaded}
              setIsBeaded={setIsBeaded}
              isFullSet={isFullSet}
              setIsFullSet={setIsFullSet}
              isDupattaSet={isDupattaSet}
              setIsDupattaSet={setIsDupattaSet}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              selectedDhoti={selectedDhoti}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              setSelectedDhoti={setSelectedDhoti}
              isRoyalSet={isRoyalSet}
              setIsRoyalSet={setIsRoyalSet}
              selectedStyle={selectedStyle}
              setSelectedStyle={setSelectedStyle}
            />

            {/* Simple Size Selector - replaces smart sizing logic */}
            <SimpleSizeSelector
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              product={product}
              // Action button props
              images={images}
              isBeaded={isBeaded}
              isFullSet={isFullSet}
              isDupattaSet={isDupattaSet}
              isRoyalSet={isRoyalSet}
              selectedDhoti={selectedDhoti}
              selectedStyle={selectedStyle}
              selectedColor={selectedColor}
              calculatePrice={calculatePrice}
              navigate={navigate}
              addToCart={addToCart}
              setIsOpen={setIsOpen}
            />

            {product.contactForCustomColors && (
              <CustomColorEnquiry product={product} />
            )}
          </div>
        </div>
      </div>

      <BottomActions
        product={product}
        images={images}
        isBeaded={isBeaded}
        isFullSet={isFullSet}
        isDupattaSet={isDupattaSet} // NEW
        isRoyalSet={isRoyalSet}
        selectedDhoti={selectedDhoti}
        selectedStyle={selectedStyle} // NEW: Pass selected style for tassels
        selectedSize={selectedSize}
        selectedColor={selectedColor} // NEW
        calculatePrice={calculatePrice}
        navigate={navigate}
        addToCart={addToCart}
        setIsOpen={setIsOpen}
      />
    </div>
  );
};

export default ProductDetail;
