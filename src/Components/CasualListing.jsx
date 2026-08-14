import GroupedListingPage from "./GroupedListingPage";

const casualSubcategories = [
  {
    id: "all",
    label: "All",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "shirts",
    label: "Shirts",
    image:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80",
    filterFn: (product) => {
      const text = `${product.type || ""} ${product.category || ""} ${(product.tags || []).join(" ")}`.toLowerCase();
      return text.includes("shirt");
    },
  },
  {
    id: "coord-sets",
    label: "Co-ord Sets",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
    filterFn: (product) => {
      const text = `${product.type || ""} ${product.category || ""} ${(product.tags || []).join(" ")}`.toLowerCase();
      return text.includes("coord") || text.includes("co-ord") || text.includes("co ord");
    },
  },
];

const CasualListing = () => (
  <GroupedListingPage
    title="Casual"
    subtitle="Relaxed shirts and co-ord set looks for everyday wear."
    category="casual"
    bannerImage="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
    bannerTitle="Casual pieces, styled with the same premium finish"
    collections={["shirts", "coord-sets"]}
    subcategories={casualSubcategories}
  />
);

export default CasualListing;