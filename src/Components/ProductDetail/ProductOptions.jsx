import React, { useContext, useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import ColorSelector from "../ColorSelector";
import { Check, Crown, Gift, Info, AlertCircle } from "lucide-react";
import Lottie from "react-lottie";

import confettiAnimation from "../../../public/animation/confetti.json";
import { getAvailableDhtoisForSize, getGlobalSettings } from "../../utils/dhotiInventoryUtils";
import { CurrencyContext } from "../../context/currencyContext";
import { convertCurrency } from "../../constants/currency";

const confettiOptions = {
  loop: false,
  autoplay: true,
  animationData: confettiAnimation,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const sizeCodeMap = {
  Small: "S",
  Medium: "M",
  Large: "L",
  XL: "XL",
  XXL: "XXL",
};

// Small pill toggle used for the optional "finishing touches" (Beaded / Tassels).
const ToggleChip = ({ label, active, priceLabel, onToggle, onInfo }) => (
  <div
    className={`flex items-center rounded-full border transition-colors ${
      active ? "border-gray-800 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-700"
    }`}
  >
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-1 pl-3 pr-1.5 py-1.5 text-xs font-medium"
    >
      {active && <Check className="w-3 h-3" />}
      {label}
      {priceLabel && (
        <span className={active ? "text-gray-300" : "text-gray-500"}>{priceLabel}</span>
      )}
    </button>
    {onInfo && (
      <button
        type="button"
        onClick={onInfo}
        aria-label={`What is ${label}?`}
        className={`w-6 h-6 mr-1 rounded-full flex items-center justify-center ${
          active ? "hover:bg-white/20" : "hover:bg-gray-100"
        }`}
      >
        <Info className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

const ProductOptions = ({
  product,
  isBeaded,
  setIsBeaded,
  isFullSet,
  setIsFullSet,
  isDupattaSet,
  setIsDupattaSet,
  selectedSize,
  selectedDhoti,
  setSelectedDhoti,
  selectedColor,
  setSelectedColor,
  isRoyalSet,
  setIsRoyalSet,
  selectedStyle,
  setSelectedStyle,
}) => {
  const { currency } = useContext(CurrencyContext);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isShining, setIsShining] = useState(false);
  const [availableDhtois, setAvailableDhtois] = useState([]);
  const [globalSettings, setGlobalSettings] = useState(null);
  const [dhotiLoading, setDhotiLoading] = useState(false);
  const [infoPanel, setInfoPanel] = useState(null); // 'beaded' | 'tassels' | null

  const handleColorChange = (colorId) => {
    setSelectedColor(colorId);
  };

  // Load global settings once
  useEffect(() => {
    const loadGlobalSettings = async () => {
      try {
        const settings = await getGlobalSettings();
        setGlobalSettings(settings);
      } catch (error) {
        console.error("Error loading global settings:", error);
      }
    };

    loadGlobalSettings();
  }, []);

  // Load available dhotis when size changes
  useEffect(() => {
    const loadAvailableDhtois = async () => {
      if (!selectedSize || !globalSettings) return;

      const dhotiManagementEnabled = globalSettings?.features?.dhotiManagementEnabled;

      if (dhotiManagementEnabled) {
        setDhotiLoading(true);
        try {
          const dhtois = await getAvailableDhtoisForSize(selectedSize);
          setAvailableDhtois(dhtois);

          if (selectedDhoti && !dhtois.some((d) => d.id === selectedDhoti)) {
            setSelectedDhoti(null);
          }

          if (!selectedDhoti && dhtois.length > 0 && isFullSet) {
            setSelectedDhoti(dhtois[0].id);
          }
        } catch (error) {
          console.error("Error loading available dhotis:", error);
          setAvailableDhtois([]);
        } finally {
          setDhotiLoading(false);
        }
      } else {
        if (product?.dhotis && product.dhotis.length > 0) {
          const productDhotis = product.dhotis.map((dhoti) => ({
            id: dhoti.name?.toLowerCase() || dhoti.id,
            name: dhoti.name,
            image: dhoti.image,
            availableStock: 999,
          }));
          setAvailableDhtois(productDhotis);

          if (!selectedDhoti && productDhotis.length > 0 && isFullSet) {
            setSelectedDhoti(productDhotis[0].id);
          }
        } else {
          setAvailableDhtois([]);
        }
      }
    };

    loadAvailableDhtois();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSize, globalSettings, product]);

  const dhotiManagementEnabled = globalSettings?.features?.dhotiManagementEnabled;
  const kurtaDhotiEnabled =
    globalSettings?.features?.kurtaDhotiEnabled &&
    (dhotiManagementEnabled ? availableDhtois.length > 0 : product?.dhotis?.length > 0);
  const kurtaDupattaEnabled = globalSettings?.features?.kurtaDupattaEnabled;
  const royalSetEnabled =
    globalSettings?.features?.royalSetEnabled &&
    (dhotiManagementEnabled ? availableDhtois.length > 0 : product?.dhotis?.length > 0);
  const dhotiAvailable = availableDhtois.length > 0;

  // If the size changes to one with no dhoti stock, drop dhoti-dependent selections
  useEffect(() => {
    if (availableDhtois.length === 0) {
      if (isRoyalSet) setIsRoyalSet(false);
      if (isFullSet) setIsFullSet(false);
      if (selectedDhoti) setSelectedDhoti(null);
    }

    if (!kurtaDupattaEnabled && isDupattaSet) {
      setIsDupattaSet(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSize, availableDhtois.length, kurtaDhotiEnabled, royalSetEnabled, kurtaDupattaEnabled]);

  useEffect(() => {
    if (!isRoyalSet && !isFullSet && selectedDhoti) {
      setSelectedDhoti(null);
    }
  }, [isRoyalSet, isFullSet, selectedDhoti, setSelectedDhoti]);

  // Periodic shine sweep on the Royal Set card, matches the brand's premium feel
  useEffect(() => {
    const initialTimer = setTimeout(() => triggerShine(), 1000);
    const intervalId = setInterval(() => triggerShine(), 5000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalId);
    };
  }, []);

  const triggerShine = () => {
    setIsShining(true);
    setTimeout(() => setIsShining(false), 2500);
  };

  const isKurtaFamily = product.type === "kurta" || product.type === "pathani";
  const showOutfitCards = isKurtaFamily && !!product.options;

  // ---- Pricing (mirrors ProductDetail.calculatePrice, minus style add-ons,
  // so each card's price is directly comparable regardless of finish chosen) ----
  const mappedSize = sizeCodeMap[selectedSize] || selectedSize;
  const sizeIncrement = product?.pricing?.sizeIncrements?.[mappedSize] ?? 0;
  const basePrice = product?.pricing?.basePrice ?? 0;
  const fullSetAdd = product?.pricing?.fullSetAdditional ?? 0;
  // These two were previously hardcoded in ProductDetail.jsx. Reading them from
  // product.pricing (with the same fallback values) keeps every existing
  // product's price identical while making the numbers admin-configurable.
  const dupattaAdd = product?.pricing?.dupattaAdditional ?? 200;
  const royalPremium = product?.pricing?.royalSetPremium ?? 300;
  const tasselsAdd = product?.pricing?.tasselsAdditional ?? 0;
  const beadedAdd = product?.pricing?.beadedAdditional ?? 0;

  const tierPrice = {
    kurta: basePrice + sizeIncrement,
    dhoti: basePrice + fullSetAdd + sizeIncrement,
    dupatta: basePrice + dupattaAdd + sizeIncrement,
    royal: basePrice + fullSetAdd + royalPremium + sizeIncrement,
  };

  // Real, verifiable savings only — never a fabricated discount.
  const separateAddonsCost = dupattaAdd + tasselsAdd;
  const royalSavings = separateAddonsCost - royalPremium;

  // Complete Set "Price Saver" badge - only real when an admin has actually
  // priced a standalone dhoti (pricing.dhotiStandalonePrice). Defaults to 0,
  // which hides the badge entirely rather than guessing a number.
  const dhotiStandalonePrice = product?.pricing?.dhotiStandalonePrice ?? 0;
  const dhotiComboSavings = dhotiStandalonePrice > 0 ? dhotiStandalonePrice - fullSetAdd : 0;

  const selectRegular = (isFullSetOption, isDupattaOption) => {
    setIsRoyalSet(false);
    setIsFullSet(isFullSetOption);
    setIsDupattaSet(isDupattaOption);
    if (!isFullSetOption && selectedDhoti) {
      setSelectedDhoti(null);
    }
  };

  const handleRoyalSetClick = () => {
    if (!royalSetEnabled) return;
    setIsRoyalSet(true);
    setIsFullSet(true);
    setIsDupattaSet(false);
    // Royal Set already includes tassels physically - don't also charge the
    // separate tassels add-on on top of it.
    if (selectedStyle === "tassels") setSelectedStyle("simple");
    if (selectedStyle === "beaded-tassels") setSelectedStyle("beaded");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const cards = useMemo(() => {
    const list = [
      {
        key: "kurta",
        name: "Kurta Only",
        tagline: "A simple, classic ethnic look for everyday celebrations.",
        items: ["Kurta"],
        price: tierPrice.kurta,
        isSelected: !isFullSet && !isDupattaSet && !isRoyalSet,
        onSelect: () => selectRegular(false, false),
        disabled: false,
      },
      {
        key: "dhoti",
        name: "Complete Set",
        tagline: "A coordinated kurta and dhoti for a more traditional, dressed-up look.",
        items: ["Kurta", "Dhoti"],
        price: tierPrice.dhoti,
        isSelected: isFullSet && !isRoyalSet && !isDupattaSet,
        onSelect: () => selectRegular(true, false),
        disabled: !dhotiAvailable,
        unavailableNote: !dhotiAvailable ? `Not available for size ${selectedSize}` : null,
        badge: dhotiComboSavings > 0 ? "Price Saver" : null,
        badgeColor: "green",
        savingsNote:
          dhotiComboSavings > 0
            ? `Save ${convertCurrency(dhotiComboSavings, currency)} vs a standalone dhoti at ${convertCurrency(
                dhotiStandalonePrice,
                currency
              )}`
            : null,
        show: !!kurtaDhotiEnabled,
      },
      {
        key: "dupatta",
        name: "Kurta + Dupatta",
        tagline: "Add a festive touch with a beautiful dupatta — without a bottom.",
        items: ["Kurta", "Dupatta"],
        price: tierPrice.dupatta,
        isSelected: isDupattaSet && !isRoyalSet,
        onSelect: () => selectRegular(false, true),
        disabled: false,
        show: !!kurtaDupattaEnabled,
      },
      {
        key: "royal",
        name: "Royal Set",
        tagline: "The ultimate celebration look — a complete coordinated outfit with all the royal details included.",
        items: ["Kurta", "Dhoti", "Dupatta", "Bow", "Tassels"],
        price: tierPrice.royal,
        isSelected: isRoyalSet,
        onSelect: handleRoyalSetClick,
        disabled: !dhotiAvailable,
        unavailableNote: !dhotiAvailable ? `Not available for size ${selectedSize}` : null,
        badge: "Most Complete",
        isPremium: true,
        savingsNote:
          royalSavings > 0
            ? `Save ${convertCurrency(royalSavings, currency)} vs adding dupatta & tassels separately`
            : "Everything your pet needs for the complete royal look",
        show: !!product.isRoyal && !!royalSetEnabled,
      },
    ];

    return list.filter((c) => c.show !== false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isFullSet,
    isDupattaSet,
    isRoyalSet,
    tierPrice.kurta,
    tierPrice.dhoti,
    tierPrice.dupatta,
    tierPrice.royal,
    dhotiAvailable,
    selectedSize,
    kurtaDhotiEnabled,
    kurtaDupattaEnabled,
    royalSetEnabled,
    royalSavings,
    dhotiComboSavings,
    dhotiStandalonePrice,
    currency,
  ]);

  const upsell = (() => {
    if (!showOutfitCards || isRoyalSet) return null;
    if (!isFullSet && !isDupattaSet) {
      if (kurtaDhotiEnabled && dhotiAvailable) {
        return {
          text: "Complete the traditional look with a matching dhoti.",
          action: () => selectRegular(true, false),
        };
      }
      return null;
    }
    if ((isFullSet || isDupattaSet) && product.isRoyal && royalSetEnabled && dhotiAvailable) {
      return {
        text: "Add the missing pieces for the full Royal look.",
        action: handleRoyalSetClick,
      };
    }
    return null;
  })();

  // ---- Finishing touches: Beaded Luxe (alternate fabric finish) and Tassels (add-on) ----
  const isBeadedOn = selectedStyle === "beaded" || selectedStyle === "beaded-tassels";
  const isTasselsOn = selectedStyle === "tassels" || selectedStyle === "beaded-tassels";

  const applyStyle = (beadedOn, tasselsOn) => {
    const style = beadedOn && tasselsOn ? "beaded-tassels" : beadedOn ? "beaded" : tasselsOn ? "tassels" : "simple";
    setSelectedStyle(style);
    // Keep the main image carousel's beaded/plain photo set in sync with the
    // finish the customer actually picked (previously wired up but never called).
    if (product.isBeadedAvailable) setIsBeaded(beadedOn);
  };

  const showBeadedToggle = !!product.isBeadedAvailable && !product.disableBeadedOption;
  const showTasselsToggle = !product.disableTasselsOption && isKurtaFamily && !isRoyalSet;

  useEffect(() => {
    // Royal Set already includes tassels; if a tassels add-on was chosen before
    // switching to Royal, drop it so it isn't priced twice.
    if (isRoyalSet && isTasselsOn) {
      setSelectedStyle(isBeadedOn ? "beaded" : "simple");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRoyalSet]);

  const getBeadedPreviewImage = () => {
    if (product?.colors?.length > 0 && selectedColor) {
      const colorData = product.colors.find((c) => c.id === selectedColor);
      return colorData?.options?.beaded?.images?.[0] || null;
    }
    return product?.options?.beaded?.images?.[0] || null;
  };

  const renderDhotiOptions = () => {
    if (!isFullSet || !isKurtaFamily) return null;

    if (dhotiLoading) {
      return (
        <div className="mt-4">
          <h3 className="text-xs font-medium text-gray-900 mb-3">Loading dhoti options...</h3>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
          </div>
        </div>
      );
    }

    if (availableDhtois.length === 0) {
      return (
        <div className="mt-4">
          <h3 className="text-xs font-medium text-gray-900 mb-3">Dhoti Color</h3>
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No dhotis available for size {selectedSize}</p>
            <p className="text-xs text-gray-500 mt-1">Try selecting a different size</p>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        transition={{ duration: 0.3 }}
        className="mt-4"
      >
        <h3 className="text-xs font-medium text-gray-900 mb-3">
          Dhoti Color ({availableDhtois.length} available)
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {availableDhtois.map((dhoti) => (
            <motion.div
              key={dhoti.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedDhoti(dhoti.id)}
              className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                selectedDhoti === dhoti.id ? "border-gray-800" : "border-transparent"
              }`}
            >
              <div className="relative pb-3/4 h-16">
                <img
                  src={dhoti.image}
                  alt={dhoti.name}
                  className="absolute h-full w-full object-contain"
                />
              </div>
              <div className="p-1 bg-gray-50">
                <p className="text-[10px] font-medium text-center text-gray-800 truncate">
                  {dhoti.name}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="px-4 pb-4 space-y-5">
      <ColorSelector colors={product.colors} selectedColor={selectedColor} onColorSelect={handleColorChange} />

      {showOutfitCards && (
        <div>
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2">
            Choose Your Outfit
          </h3>
          <div className="space-y-2.5">
            {cards.map((card) => (
              <button
                key={card.key}
                type="button"
                onClick={card.disabled ? undefined : card.onSelect}
                disabled={card.disabled}
                aria-pressed={card.isSelected}
                className={`relative w-full text-left rounded-xl border-2 p-3.5 overflow-hidden transition-all ${
                  card.disabled
                    ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
                    : card.isSelected
                    ? card.isPremium
                      ? "border-[#b5892e] bg-gradient-to-br from-[#fbf3e0] to-white shadow-sm"
                      : "border-gray-800 bg-gray-50 shadow-sm"
                    : "border-gray-200 bg-white active:scale-[0.99]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {card.isPremium && <Crown className="w-3.5 h-3.5 text-[#b5892e] shrink-0" />}
                      <span className="font-semibold text-sm text-gray-900">{card.name}</span>
                      {card.badge && (
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-white"
                          style={{
                            background:
                              card.badgeColor === "green"
                                ? "linear-gradient(90deg, #16a34a, #15803d)"
                                : "linear-gradient(90deg, #c9a94e, #b5892e)",
                          }}
                        >
                          {card.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-2.5 gap-y-1 mt-2">
                      {card.items.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center gap-1 text-[11px] text-gray-600"
                        >
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          {item}
                        </span>
                      ))}
                    </div>
                    {card.savingsNote && (
                      <p className="text-[11px] font-medium text-emerald-700 mt-1.5">
                        {card.savingsNote}
                      </p>
                    )}
                    {card.unavailableNote && (
                      <p className="text-[11px] font-medium text-orange-600 mt-1.5">
                        {card.unavailableNote}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-base font-bold text-gray-900 whitespace-nowrap">
                      {convertCurrency(card.price, currency)}
                    </span>
                    {card.key !== "kurta" && card.price > tierPrice.kurta && (
                      <span className="text-[10px] text-gray-500 whitespace-nowrap">
                        +{convertCurrency(card.price - tierPrice.kurta, currency)} vs Kurta Only
                      </span>
                    )}
                    <div
                      className={`mt-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        card.isSelected
                          ? card.isPremium
                            ? "border-[#b5892e] bg-[#b5892e]"
                            : "border-gray-800 bg-gray-800"
                          : "border-gray-300"
                      }`}
                    >
                      {card.isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </div>

                {card.isPremium && !card.disabled && (
                  <motion.div
                    className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none"
                    initial={{ x: "-100%", skewX: -30 }}
                    animate={isShining ? { x: "300%" } : { x: "-100%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                  />
                )}
              </button>
            ))}
          </div>

          {upsell && (
            <div className="mt-2.5 flex items-center justify-between gap-2 text-xs bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <span className="text-amber-800">{upsell.text}</span>
              <button
                type="button"
                onClick={upsell.action}
                className="shrink-0 font-semibold text-amber-900 underline underline-offset-2"
              >
                Upgrade
              </button>
            </div>
          )}

          {isRoyalSet && (
            <div className="mt-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Gift className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Royal Experience for Your Pet</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Comes with Kurta, Dhoti, Dupatta, Bow, Tassels and a free gift.
                  </p>
                </div>
              </div>
            </div>
          )}

          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-50">
              <Lottie
                options={confettiOptions}
                height="100vh"
                width="100vw"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  filter: "grayscale(0.7) brightness(0.95)",
                }}
              />
            </div>
          )}
        </div>
      )}

      {product?.dhotis?.length > 0 && renderDhotiOptions()}

      {(showBeadedToggle || showTasselsToggle) && (
        <div>
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2">
            Finishing Touches
          </h3>
          <div className="flex flex-wrap gap-2">
            {showBeadedToggle && (
              <ToggleChip
                label="Beaded Luxe"
                active={isBeadedOn}
                priceLabel={beadedAdd > 0 ? ` +${convertCurrency(beadedAdd, currency)}` : null}
                onToggle={() => applyStyle(!isBeadedOn, isTasselsOn)}
                onInfo={() => setInfoPanel(infoPanel === "beaded" ? null : "beaded")}
              />
            )}
            {showTasselsToggle && (
              <ToggleChip
                label="Add Tassels"
                active={isTasselsOn}
                priceLabel={tasselsAdd > 0 ? ` +${convertCurrency(tasselsAdd, currency)}` : null}
                onToggle={() => applyStyle(isBeadedOn, !isTasselsOn)}
                onInfo={() => setInfoPanel(infoPanel === "tassels" ? null : "tassels")}
              />
            )}
          </div>

          <AnimatePresence>
            {infoPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 overflow-hidden"
              >
                <div className="flex gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  {infoPanel === "beaded" && getBeadedPreviewImage() && (
                    <img
                      src={getBeadedPreviewImage()}
                      alt="Beaded look preview"
                      className="w-16 h-16 rounded-md object-cover shrink-0"
                    />
                  )}
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {infoPanel === "beaded"
                      ? "Decorative bead-style detailing that gives the outfit a richer, more embellished appearance."
                      : "Decorative hanging details that add movement, texture, and a festive finishing touch to the outfit."}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ProductOptions;
