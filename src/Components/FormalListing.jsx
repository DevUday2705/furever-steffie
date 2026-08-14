import GroupedListingPage from "./GroupedListingPage";

const formalSubcategories = [
  {
    id: "all",
    label: "All",
    image:
      "https://res.cloudinary.com/di6unrpjw/image/upload/v1778151677/IMG_3843_dqyl4d.webp",
  },
  {
    id: "tuxedo",
    label: "Tuxedo",
    image:
      "https://res.cloudinary.com/di6unrpjw/image/upload/v1753618664/Luxury_navy_blue_Sets_for_Pets_bnp2ck.webp",
    filterFn: (product) => product.sourceCollection === "tuxedos",
  },
  {
    id: "bandanas",
    label: "Bandanas",
    image:
      "https://res.cloudinary.com/di6unrpjw/image/upload/v1755713280/IMG_9469_txpsl9.webp",
    filterFn: (product) => product.sourceCollection === "male-bandanas",
  },
];

const FormalListing = () => (
  <GroupedListingPage
    title="Formal"
    subtitle="Tuxedos and formal accessories for polished occasions."
    category="formal"
    bannerImage="https://res.cloudinary.com/di6unrpjw/image/upload/v1753618664/Luxury_navy_blue_Sets_for_Pets_bnp2ck.webp"
    bannerTitle="Formalwear with a sharp, tailored finish"
    collections={["tuxedos", "male-bandanas"]}
    subcategories={formalSubcategories}
  />
);

export default FormalListing;