const getCheckoutItems = ({ isCartCheckout, cart, orderDetails }) =>
  isCartCheckout ? cart : orderDetails ? [orderDetails] : [];

const getSubtotal = (items) =>
  items.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);

const getNavratriSubtotal = (items) =>
  items.reduce((total, item) => {
    if (item.name && item.name.toUpperCase().includes("NAVRATRI")) {
      return total + (item.price || 0) * (item.quantity || 1);
    }

    return total;
  }, 0);

const getInternationalDeliveryCharge = (
  country,
  internationalDelivery,
  currencyRates
) => {
  const deliveryInfo = internationalDelivery[country];
  if (!deliveryInfo) {
    return 0;
  }

  return Math.round(
    deliveryInfo.charge / (currencyRates[deliveryInfo.currency] || 1)
  );
};

const getDomesticDeliveryCharge = (deliveryOption) => {
  if (deliveryOption === "express") {
    return 399;
  }

  if (deliveryOption === "air") {
    return 199;
  }

  return 0;
};

export const calculateCheckoutPricing = ({
  isCartCheckout,
  cart,
  orderDetails,
  couponCode,
  discountPercent,
  customCouponData,
  formData,
  internationalDelivery,
  currencyRates,
  singleUseCoupon,
  navratriCoupon,
  customerValidationCoupons,
}) => {
  const normalizedCouponCode = couponCode.trim().toUpperCase();
  const items = getCheckoutItems({ isCartCheckout, cart, orderDetails });
  const subtotal = getSubtotal(items);

  let discountAmount = 0;

  if (normalizedCouponCode === singleUseCoupon) {
    discountAmount = 750;
  } else if (customerValidationCoupons[normalizedCouponCode]) {
    discountAmount = 100;
  } else if (customCouponData) {
    discountAmount = customCouponData.discountAmount || 0;
  } else if (normalizedCouponCode === navratriCoupon) {
    discountAmount = (getNavratriSubtotal(items) * 5) / 100;
  } else {
    discountAmount = (subtotal * discountPercent) / 100;
  }

  const totalAfterDiscount = subtotal - discountAmount;
  const isInternational = formData.country !== "india";
  const deliveryCharge = isInternational
    ? getInternationalDeliveryCharge(
        formData.country,
        internationalDelivery,
        currencyRates
      )
    : getDomesticDeliveryCharge(formData.deliveryOption);

  return {
    items,
    subtotal,
    discountAmount,
    totalAfterDiscount,
    deliveryCharge,
    total: Math.round(totalAfterDiscount + deliveryCharge),
    isInternational,
    internationalDeliveryInfo: internationalDelivery[formData.country] || null,
    normalizedCouponCode,
  };
};

