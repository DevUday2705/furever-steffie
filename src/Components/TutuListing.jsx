import ProductListing from "./ProductListing";
import { useFirestoreCollection } from "../hooks/fetchCollection";

const TutuListing = () => {
  const { data: tutu, isLoading } = useFirestoreCollection("tuts");
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  return (
    <ProductListing
      title="All Tutu Dress"
      subtitle="Explore our exclusive range of handcrafted Tutu Dresses for pets!"
      category="tutu-dress"
      bannerImage="https://res.cloudinary.com/di6unrpjw/image/upload/v1746007679/banner-min_pbtnwp.webp"
      products={tutu}
      bannerTitle="Elegant Kurtas for Every Pet Personality"
    />
  );
};

export default TutuListing;
