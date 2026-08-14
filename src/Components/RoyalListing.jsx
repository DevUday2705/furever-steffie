import GroupedListingPage from "./GroupedListingPage";

const royalSubcategories = [
  {
    id: "all",
    label: "Male",
    image:
      "https://res.cloudinary.com/di6unrpjw/image/upload/v1760562224/Diwali_6_begntv.jpg",
    filterFn: (product) =>
      product.isRoyal === true ||
      (product.tags || []).some((tag) => tag.toLowerCase().includes("royal")),
  },
  {
    id: "female",
    label: "Female",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
    disabled: true,
  },
];

const RoyalListing = () => (
  <GroupedListingPage
    title="Royal"
    subtitle="Royal-tagged pieces across the male catalog for now."
    category="royal"
    bannerImage="https://res.cloudinary.com/di6unrpjw/image/upload/v1760562224/Diwali_6_begntv.jpg"
    bannerTitle="All royal-tagged fits in one place"
    collections={["kurtas", "pathanis", "tuxedos", "male-bandanas", "dhotiss", "shirts", "coord-sets"]}
    subcategories={royalSubcategories}
    filterProduct={(product) =>
      product.isRoyal === true ||
      (product.tags || []).some((tag) => tag.toLowerCase().includes("royal"))
    }
  />
);

export default RoyalListing;