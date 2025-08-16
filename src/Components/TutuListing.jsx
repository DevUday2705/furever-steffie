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
      bannerImage="https://res.cloudinary.com/di6unrpjw/image/upload/v1753034319/Twilight_pastel_purple_Tutu_dress_t8jxtv.webp"
      products={tutu}
      bannerTitle="Elegant Tutu Dresses for your princess"
    />
  );
};

export default TutuListing;
