import {
  ArrowLeft,
  Scissors,
  Heart,
  Ruler,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const WhyUs = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Ruler className="w-8 h-8 text-white" />,
      title: "Custom Measurements",
      description:
        "Every outfit is custom-stitched based on your pet's unique measurements, ensuring a perfect fit every time.",
      gradient: "from-gray-600 to-gray-700",
    },
    {
      icon: <Heart className="w-8 h-8 text-white" />,
      title: "Comfort First Design",
      description:
        "We use premium fiber materials instead of mirrors for maximum comfort. Your pet's comfort is our priority.",
      gradient: "from-gray-500 to-gray-600",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-white" />,
      title: "Fur-Friendly Velcro",
      description:
        "Extra space around velcro areas prevents fur from getting stuck, making dressing up stress-free for your pet.",
      gradient: "from-gray-600 to-gray-800",
    },
    {
      icon: <Scissors className="w-8 h-8 text-white" />,
      title: "Adjustable Sizing",
      description:
        "Smart velcro placement allows size adjustments, growing with your pet and ensuring long-lasting wear.",
      gradient: "from-gray-500 to-gray-700",
    },
  ];

  const craftDetails = [
    {
      step: "01",
      title: "Precise Measurements",
      description:
        "We take detailed measurements of your pet's chest, neck, length, and weight for perfect fitting.",
    },
    {
      step: "02",
      title: "Premium Material Selection",
      description:
        "Only the finest, pet-safe fabrics are chosen for comfort, durability, and style.",
    },
    {
      step: "03",
      title: "Expert Craftsmanship",
      description:
        "Each piece is hand-crafted by skilled artisans who understand pet clothing intricacies.",
    },
    {
      step: "04",
      title: "Quality Assurance",
      description:
        "Multiple quality checks ensure every outfit meets our high standards before delivery.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="sticky top-[60px] z-[50] bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Why Choose Us?</h1>
          <div className="w-10 h-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-md mx-auto pb-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-8 text-center">
            <div className="mb-4">
              <Sparkles className="w-12 h-12 mx-auto text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Crafted with Love</h2>
            <p className="text-lg opacity-90 leading-relaxed">
              Every stitch tells a story of care, comfort, and craftsmanship for
              your beloved pet
            </p>
          </div>
          <div className="absolute -bottom-1 left-0 right-0 h-8 bg-white rounded-t-3xl"></div>
        </div>

        {/* Features Section */}
        <div className="px-6 -mt-4 relative z-10">
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} shadow-lg`}
                    >
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Craft Process Section */}
        <div className="px-6 mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Our Craft Process
            </h2>
            <p className="text-gray-600">From measurement to masterpiece</p>
          </div>

          <div className="space-y-4">
            {craftDetails.map((detail, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5"
                style={{
                  animation: `slideInRight 0.6s ease-out ${index * 0.15}s both`,
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold shadow-lg">
                    {detail.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">
                      {detail.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {detail.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-6 mt-12">
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl text-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-center mb-6">
              Why Pet Parents Choose Us
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold mb-1">100%</div>
                <div className="text-xs opacity-90">Custom Fit</div>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">500+</div>
                <div className="text-xs opacity-90">Happy Pets</div>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">4.9★</div>
                <div className="text-xs opacity-90">Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="px-6 mt-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Ready to Dress Your Pet?
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Experience the difference of custom-made pet clothing
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white py-3 px-6 rounded-xl font-medium hover:from-gray-800 hover:to-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyUs;
