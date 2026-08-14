import GroupedListingPage from "./GroupedListingPage";

const traditionalSubcategories = [
  {
    id: "all",
    label: "All",
    image:
      "https://res.cloudinary.com/di6unrpjw/image/upload/v1773726481/IMG_2179_wmypnr.webp",
  },
  {
    id: "kurta",
    label: "Kurta",
    image:
      "https://res.cloudinary.com/di6unrpjw/image/upload/v1770924368/Photoroom_20260121_152835_igaa0h.webp",
    filterFn: (product) => product.sourceCollection === "kurtas" && !product.isRoyal,
  },
  {
    id: "royal",
    label: "Royal",
    image:
      "https://res.cloudinary.com/di6unrpjw/image/upload/v1760562224/Diwali_6_begntv.jpg",
    filterFn: (product) => product.sourceCollection === "kurtas" && product.isRoyal === true,
  },
  {
    id: "dhoti",
    label: "Dhoti",
    image:
      "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_02_21_PM_qqy08k.webp",
    filterFn: (product) => product.sourceCollection === "dhotiss",
  },
  {
    id: "pathani",
    label: "Pathani",
    image:
      "https://res.cloudinary.com/di6unrpjw/image/upload/v1768739245/IMG_0079_sdnofh.webp",
    filterFn: (product) => product.sourceCollection === "pathanis",
  },
];

const TraditionalListing = () => (
  <GroupedListingPage
    title="Traditional"
    subtitle="Kurta-led traditional wear, dhoti pairings, and Pathani styles in one place."
    category="traditional"
    bannerImage="https://res.cloudinary.com/di6unrpjw/image/upload/v1770984025/WhatsApp_Image_2026-02-13_at_3.34.10_PM_kyge7r.webp"
    bannerTitle="Traditional pieces built for ceremonies and celebrations"
    collections={["kurtas", "pathanis", "dhotiss"]}
    subcategories={traditionalSubcategories}
  />
);

export default TraditionalListing;