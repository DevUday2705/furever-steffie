import { Play, VideoOff } from "lucide-react";
import React, { useState } from "react";

const SizeGuide = () => {
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleVideoError = () => {
    setVideoError(true);
    setIsLoading(false);
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
  };
  const handleWhatsAppClick = () => {
    const phoneNumber = "918828145667";
    const message =
      "Hi! I need help with taking my pet's measurements for the perfect fit. Can you guide me through the process?";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">📏 Size Guide</h1>
        <p className="text-purple-100">
          Get the perfect fit for your furry friend
        </p>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Measurement Guide Image */}
        <div className="mb-6">
          <div className="bg-gray-100 rounded-lg p-6 text-center border-2 border-dashed border-gray-300">
            <img
              src="/images/size-chart.jpg"
              alt="Pet Measurement Guide"
              className="w-full max-w-sm mx-auto rounded-lg shadow-md"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <div className="hidden">
              <div className="text-6xl mb-4">📐</div>
              <p className="text-gray-600">Measurement Guide Image</p>
              <p className="text-sm text-gray-500 mt-2">
                Add your measurement guide image to
                /public/images/size-chart.jpg
              </p>
            </div>
          </div>
        </div>

        {/* Measurement Instructions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            We Need Just 3 Simple Measurements
          </h2>

          <div className="space-y-4">
            {/* Neck Circumference */}
            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="font-semibold text-purple-800 mb-1">
                  1. Neck Circumference
                </h3>
                <p className="text-gray-700 text-sm">
                  Measure around the base of your pet&apos;s neck where the
                  collar sits naturally.
                </p>
              </div>
            </div>

            {/* Chest Circumference */}
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl">📏</div>
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">
                  2. Chest Circumference
                </h3>
                <p className="text-gray-700 text-sm">
                  Measure around the widest part of your pet&apos;s chest, just
                  behind the front legs.
                </p>
              </div>
            </div>

            {/* Back Length */}
            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl">📐</div>
              <div>
                <h3 className="font-semibold text-green-800 mb-1">
                  3. Back Length (Collar to Tail)
                </h3>
                <p className="text-gray-700 text-sm">
                  Measure from the base of the neck (where collar sits) to the
                  base of the tail.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            📹 Watch Our Measurement Tutorial
          </h3>

          <div className="bg-gray-100 rounded-lg p-6 text-center border-2 border-dashed border-gray-300">
            {/* Video Container with 4:5 Aspect Ratio */}
            <div className="relative w-full max-w-md mx-auto">
              {/* Aspect Ratio Container */}
              <div
                className="relative w-full"
                style={{ paddingBottom: "125%" }}
              >
                {!videoError ? (
                  <video
                    className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-md"
                    controls
                    poster="/images/thumbnail.avif"
                    onError={handleVideoError}
                    onLoadedData={handleVideoLoad}
                    preload="metadata"
                  >
                    <source src="/images/measurements.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  // Fallback content when video fails to load
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 rounded-lg shadow-md">
                    <VideoOff className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-gray-600 text-sm mb-2">
                      Video not available
                    </p>
                    <p className="text-xs text-gray-500 px-4">
                      The measurement tutorial video is currently unavailable.
                      Please check back later or contact support.
                    </p>
                  </div>
                )}

                {/* Loading state */}
                {isLoading && !videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
                    <div className="flex flex-col items-center">
                      <Play className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-gray-500 text-sm">Loading video...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <p className="text-sm text-gray-600 mt-4">
              Learn the proper techniques for taking accurate measurements
            </p>
          </div>
        </div>

        {/* Important Tips */}
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            💡 Pro Tips for Accurate Measurements
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Use a flexible measuring tape for best results</li>
            <li>• Keep your pet standing in a natural position</li>
            <li>
              • Add 2-3 cm for comfort (we&apos;ll adjust for perfect fit)
            </li>
            <li>• Take measurements when your pet is calm and relaxed</li>
          </ul>
        </div>

        {/* WhatsApp CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-bold mb-2">
              Need Help with Measurements?
            </h3>
            <p className="text-green-100 text-sm mb-4">
              Our experts are here to guide you through the process
            </p>

            <button
              onClick={handleWhatsAppClick}
              className="bg-white text-green-600 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center gap-2 mx-auto"
            >
              <span className="text-xl">📱</span>
              Message us on WhatsApp
            </button>

            <p className="text-green-100 text-xs mt-3">
              WhatsApp: +91 88281 45667
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Once you have the measurements, our team will create the perfect fit
            for your pet! 🐾
          </p>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;
