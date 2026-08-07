// Shipping type + courier combinations -> customer-facing delivery estimate & tracking URL
export const COURIER_OPTIONS = [
  { value: "mahavir", label: "Shree Mahavir Courier" },
  { value: "delhivery", label: "Delhivery" },
  { value: "shree_maruti", label: "Shree Maruti Courier" },
];

export const SHIPPING_TYPE_OPTIONS = [
  { value: "standard", label: "📦 Standard" },
  { value: "air", label: "✈️ Air" },
  { value: "express", label: "🚀 Express" },
];

// courier -> { trackingUrl, label, estimates: { shippingType: "X-Y working days" } }
export const COURIER_INFO = {
  mahavir: {
    label: "Shree Mahavir Courier",
    trackingUrl: "https://shreemahavircourier.com/",
    estimates: {
      standard: "1-2 working days",
      air: "1-2 working days",
      express: "1-2 working days",
    },
  },
  delhivery: {
    label: "Delhivery",
    trackingUrl: "https://www.delhivery.com/",
    estimates: {
      standard: "5-6 working days",
      air: "3-5 working days",
      express: "3-5 working days",
    },
  },
  shree_maruti: {
    label: "Shree Maruti Courier",
    trackingUrl: "https://shreemaruti.com/track-shipment/",
    estimates: {
      standard: "4-6 working days",
      air: "3-5 working days",
      express: "1-2 working days",
    },
  },
};

export const getDeliveryEstimate = (courierPartner, shippingType) => {
  const courier = COURIER_INFO[courierPartner];
  if (!courier) return "";
  return courier.estimates[shippingType] || "";
};

export const getCourierTrackingUrl = (courierPartner) => {
  return COURIER_INFO[courierPartner]?.trackingUrl || "";
};

export const getCourierLabel = (courierPartner) => {
  return COURIER_INFO[courierPartner]?.label || courierPartner || "";
};
