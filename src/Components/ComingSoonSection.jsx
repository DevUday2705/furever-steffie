import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { doc, updateDoc, increment, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";

const ComingSoonSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      containScroll: "trimSnaps",
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false);

  // Coming soon images - replace these URLs with your actual images
  const comingSoonItems = [
    {
      id: "yellow-denim",
      url: "https://res.cloudinary.com/di6unrpjw/image/upload/v1753816465/F115A0D5-00AD-4A2B-A242-5CBF2B2F1B50_trtatm.webp",
    },
    {
      id: "black-white-checks-butterfly-frock",
      url: "https://res.cloudinary.com/di6unrpjw/image/upload/v1753816722/WhatsApp_Image_2025-07-30_at_00.44.57_79416629_gy08xr.webp",
    },
  ];

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const handleInterestClick = async (imageId) => {
    if (isRegistering) return;

    setIsRegistering(true);
    try {
      const docRef = doc(db, "coming-soon", "interest-count");

      // Check if document exists, if not create it
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        // Initialize with all image IDs set to 0
        const initialData = {};
        comingSoonItems.forEach((item) => {
          initialData[item.id] = 0;
        });
        await setDoc(docRef, initialData);
      }

      // Increment the count for this specific image
      await updateDoc(docRef, {
        [imageId]: increment(1),
      });

      toast.success("Registered your interest - stay tuned! 🎉", {
        duration: 4000,
        position: "top-right",
        style: {
          background: "linear-gradient(135deg, #10b981, #059669)",
          color: "white",
          fontWeight: "500",
        },
      });
    } catch (error) {
      console.error("Error registering interest:", error);
      toast.error("Something went wrong. Please try again.", {
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const scrollTo = useCallback(
    (index) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-300 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-100 to-purple-100 rounded-full mb-4">
            <span className="text-gray-700 font-semibold text-sm tracking-wide uppercase">
              Coming Soon
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Exciting New
            <span className=""> Collections</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Get ready for our most adorable and stylish pet outfits yet.
            Register your interest to be the first to know when they launch!
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div
            className="overflow-hidden rounded-3xl shadow-2xl"
            ref={emblaRef}
          >
            <div className="flex">
              {comingSoonItems.map((item, index) => (
                <div key={item.id} className="flex-[0_0_100%] min-w-0 relative">
                  <div className="relative group">
                    {/* Image */}
                    <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>

                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                      {/* Interest Button */}
                      <button
                        onClick={() => handleInterestClick(item.id)}
                        disabled={isRegistering}
                        className="inline-flex items-center px-4 py-2 bg-gray-500  text-white font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 font-light transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRegistering ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                            Registering...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5 mr-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                            </svg>
                            I'm Interested
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot indicators */}
        </div>

        {/* Stats or additional info */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Join thousands of pet parents who are already excited about our
            upcoming collections
          </p>
        </div>
      </div>
    </section>
  );
};

export default ComingSoonSection;
