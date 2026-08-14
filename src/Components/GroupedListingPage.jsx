import { useMemo } from "react";
import ProductListing from "./ProductListing";
import { useFirestoreCollections } from "../hooks/fetchCollections";

const GroupedListingPage = ({
  title,
  subtitle,
  category,
  bannerImage,
  bannerTitle,
  collections,
  subcategories,
  filterProduct,
}) => {
  const { data, isLoading } = useFirestoreCollections(collections);

  const products = useMemo(() => {
    if (!filterProduct) return data;
    return data.filter(filterProduct);
  }, [data, filterProduct]);

  return (
    <ProductListing
      title={title}
      subtitle={subtitle}
      category={category}
      bannerImage={bannerImage}
      bannerTitle={bannerTitle}
      products={products}
      subcategories={subcategories}
      loading={isLoading}
    />
  );
};

export default GroupedListingPage;