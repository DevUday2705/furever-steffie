import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const reviewlink =
  "https://www.instagram.com/s/aGlnaGxpZ2h0OjE3OTE1NDkzODI4MDQ4NDY1?story_media_id=3675146093414536555_59060661911&igsh=MW5uMDBmZmo2dHRjZQ==";
const ModernReviewsSection = () => {
  const reviews = [
    {
      name: "Thasleema Nasreen",
      image:
        "https://instagram.fbom35-1.fna.fbcdn.net/v/t51.2885-19/453831736_1140144907048269_6337771628695346892_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbom35-1.fna.fbcdn.net&_nc_cat=109&_nc_oc=Q6cZ2QEyLbPRTgZbfHzyUz8jk222AE-En1vDK0IW2h396H0TTYJ1Z2oS9kcr2aVowybIKN4&_nc_ohc=5zcvATwJlEAQ7kNvwH8lOI6&_nc_gid=JqLgu9Y97d51-eHInkLY4Q&edm=ALGbJPMBAAAA&ccb=7-5&oh=00_AfQZpB2dND-ZFbNdwZ0ZsJP_rOzQl7yIC50tUp4hP-HHvw&oe=687BC477&_nc_sid=7d3ac5",
      link: reviewlink,
      review:
        "We received the product, We really like the work you did, Thank you so much",
    },
    {
      name: "Amy Dhanoa",
      image:
        "https://instagram.fbom35-1.fna.fbcdn.net/v/t51.2885-19/466352742_3866723880209382_8413369503830146673_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbom35-1.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2QFyFsL8qXvVKE6q8B5oYsZdIdBcsbrVPcLVWTZzRzXCm4IRVt2t5eqglixJ7o5C2GM&_nc_ohc=qp3aEY86qaoQ7kNvwHylNfu&_nc_gid=g9tYBjEL8BSpPVnLg9cYwg&edm=ALGbJPMBAAAA&ccb=7-5&oh=00_AfRI2GgQpmKXfTT5o83-_dIebp3dKg6S0J2wG6jyKo-3lw&oe=687BF1D4&_nc_sid=7d3ac5",
      link: reviewlink,
      review:
        "Furever Steffie is the best place to order outfits for your fur babies, I ordered some traditional outfits for my pup, and they turned out beautifully. I'm so happy with the quality and fit - Absolutely love them! The shop is very trustsworthy, With open communication and outstanding customer service. Highly recommended",
    },
    {
      name: "Mary Suma",
      image:
        "https://instagram.fbom35-1.fna.fbcdn.net/v/t51.2885-19/490886945_1209484820770244_4074577941630940642_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbom35-1.fna.fbcdn.net&_nc_cat=108&_nc_oc=Q6cZ2QHujwO6S30s1U3bBHAQVBeelF6oSaS5oamSU8oEnCsgu_HpIDbVf8oFZQRGzN0Msik&_nc_ohc=YHNB5eA2u7oQ7kNvwEztWFP&_nc_gid=vGhfapcYtqOSUvO5ZyQNUQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfT_m_n0R1TpDPdK9WHwIpM_zCe5ySdFpvicPq4bsyme4g&oe=687BC87C&_nc_sid=7a9f4b",
      link: reviewlink,
      review:
        "Hi Chetna. Just recieved the order. Lucky looks soo handsome in the tux. You've made him the star of the show. Thank you so much.",
    },
    {
      name: "Deepali",
      image:
        "https://instagram.fbom35-1.fna.fbcdn.net/v/t51.2885-19/271217095_1144680616064842_5967729328943069264_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbom35-1.fna.fbcdn.net&_nc_cat=110&_nc_oc=Q6cZ2QHer886djm9fY2WKGKkreolxE99q1N8VJMKIOmEUp6qMWYBLMrnsCEv1lTRixAeOII&_nc_ohc=G2l9zs20t9UQ7kNvwF7x-rz&_nc_gid=2H3aWn3oVEztmGCuV4lePA&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfT7zs30kEWDWcZ1ZOsaeikYsjR0Bl52LSfSrH5TWOVPbg&oe=687BE9AB&_nc_sid=7a9f4b",
      link: reviewlink,
      review: "We Love it, Thank you so much!.",
    },
    {
      name: "Sakshi Kapoor",
      image:
        "https://instagram.fbom35-1.fna.fbcdn.net/v/t51.2885-19/467543680_1584802055806980_8585216759692152371_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbom35-1.fna.fbcdn.net&_nc_cat=100&_nc_oc=Q6cZ2QFXoXiLC2in0TQ8KFIb86HXvV7o2RbfUE6Q0KlBBstNXGrRi_BKZIr2d4IlhcFXgbI&_nc_ohc=9swJ1OGQMswQ7kNvwEB5O3B&_nc_gid=J3p02VCxxzE_5sHfYGXKmw&edm=ALGbJPMBAAAA&ccb=7-5&oh=00_AfREdw3OYCWlLeadpbVzYHKtXiu9QRqzbmSluJbgyHjRpw&oe=687BCAD3&_nc_sid=7d3ac5",
      link: reviewlink,
      review:
        "My dog usually hates clothes, but she didn’t mind this at all. The size chart was accurate, and it arrived quickly. Great experience!",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, reviews.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,107,107,0.1),transparent_50%)]"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our amazing clients
            have to say about their experience.
          </p>
        </motion.div>

        {/* Reviews Slider */}
        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative h-96 md:h-80 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 max-w-3xl mx-4 relative">
                  {/* Quote decoration */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <Quote className="w-6 h-6 text-white" />
                  </div>

                  {/* Review content */}
                  <div className="text-center">
                    <div className="flex justify-center mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-6 h-6 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>

                    <blockquote className="text-lg md:text-xl text-slate-700 leading-relaxed mb-8 font-medium">
                      "{reviews[currentIndex].review}"
                    </blockquote>

                    <div className="flex items-center justify-center space-x-4">
                      <a
                        href={reviews[currentIndex].link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-4 group hover:scale-105 transition-transform duration-300"
                      >
                        <div className="relative">
                          <img
                            src={reviews[currentIndex].image}
                            alt={reviews[currentIndex].name}
                            className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow-lg"
                          />
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 group-hover:from-blue-500/30 group-hover:to-purple-600/30 transition-all duration-300"></div>
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {reviews[currentIndex].name}
                          </h4>
                          <Link to={reviews[currentIndex].link}>
                            <h1 className="underline">See More</h1>
                          </Link>
                          <p className="text-sm text-slate-500">
                            Verified Customer
                          </p>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/20 flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 group"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/20 flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 group"
          >
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
          </button>
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center mt-8 space-x-3">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                index === currentIndex
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
                  : "bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>

        {/* Auto-play indicator */}
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <div
              className={`w-2 h-2 rounded-full ${
                isAutoPlaying ? "bg-green-500" : "bg-slate-400"
              }`}
            ></div>
            <span>{isAutoPlaying ? "Auto-playing" : "Paused"}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernReviewsSection;
