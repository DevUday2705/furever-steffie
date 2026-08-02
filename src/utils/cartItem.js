const CART_ITEM_IDENTITY_FIELDS = [
  "productId",
  "isBeaded",
  "isFullSet",
  "isDupattaSet",
  "isRoyalSet",
  "selectedSize",
  "selectedDhoti",
  "selectedColor",
  "selectedStyle",
];

const normalizeCartItemIdentityValue = (field, value) => {
  if (
    field === "isBeaded" ||
    field === "isFullSet" ||
    field === "isDupattaSet" ||
    field === "isRoyalSet"
  ) {
    return Boolean(value);
  }

  return value ?? null;
};

export const getCartItemIdentity = (item = {}) =>
  CART_ITEM_IDENTITY_FIELDS.reduce((identity, field) => {
    identity[field] = normalizeCartItemIdentityValue(field, item[field]);
    return identity;
  }, {});

export const isSameCartItem = (left = {}, right = {}) =>
  CART_ITEM_IDENTITY_FIELDS.every(
    (field) =>
      normalizeCartItemIdentityValue(field, left[field]) ===
      normalizeCartItemIdentityValue(field, right[field])
  );

