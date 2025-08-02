import { ArrowLeft, Heart, Users, Award, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
  const navigate = useNavigate();

  const milestones = [
    {
      year: "2023",
      title: "The Beginning",
      description:
        "Started Furever Steffie with a passion for creating beautiful, comfortable pet clothing.",
    },
    {
      year: "2024",
      title: "Growing Family",
      description:
        "Reached 500+ happy pet parents and expanded our collection to include premium fabrics.",
    },
    {
      year: "2025",
      title: "Custom Perfection",
      description:
        "Pioneered custom-fit pet clothing with precise measurements for every furry friend.",
    },
  ];

  const values = [
    {
      icon: <Heart className="w-6 h-6 text-white" />,
      title: "Pet Comfort First",
      description:
        "Every design decision prioritizes your pet's comfort and happiness.",
    },
    {
      icon: <Users className="w-6 h-6 text-white" />,
      title: "Family-Owned",
      description:
        "A small family business that treats every customer like family.",
    },
    {
      icon: <Award className="w-6 h-6 text-white" />,
      title: "Quality Promise",
      description:
        "We use only premium, pet-safe materials in all our creations.",
    },
    {
      icon: <Clock className="w-6 h-6 text-white" />,
      title: "Handcrafted Care",
      description:
        "Each outfit is carefully handcrafted with attention to every detail.",
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
          <h1 className="text-xl font-bold text-gray-800">About Us</h1>
          <div className="w-10 h-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-md mx-auto pb-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-8 text-center">
            <div className="mb-4">
              <Heart className="w-12 h-12 mx-auto text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Our Story</h2>
            <p className="text-lg opacity-90 leading-relaxed">
              Creating beautiful moments for pets and their families
            </p>
          </div>
          <div className="absolute -bottom-1 left-0 right-0 h-8 bg-white rounded-t-3xl"></div>
        </div>

        {/* Founder Image Placeholder */}
        <div className="px-6 -mt-4 relative z-10">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Founder Photo</p>
                <p className="text-xs opacity-75">
                  Placeholder for team/founder image
                </p>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
                Meet the Founder
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed text-center">
                &quot;Every pet deserves to look and feel their best.
                That&apos;s the passion that drives Furever Steffie.&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="px-6 mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              How It All Started
            </h2>
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
              <p>
                Furever Steffie was born from a simple observation: our beloved
                pets deserve clothing that&apos;s not just stylish, but truly
                comfortable. As pet parents ourselves, we noticed that most pet
                clothing prioritized looks over comfort, often using materials
                that irritated sensitive skin or designs that restricted
                movement.
              </p>
              <p>
                We decided to change that. Starting from our home in Mumbai, we
                began creating custom pet outfits with a focus on comfort-first
                design. Every fabric is chosen for its softness, every stitch is
                placed with purpose, and every detail is crafted with love.
              </p>
              <p>
                What started as a passion project has grown into a thriving
                business that has dressed over 500 happy pets across India. But
                our mission remains the same: creating beautiful, comfortable
                clothing that makes both pets and their parents smile.
              </p>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="px-6 mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            What We Believe In
          </h2>
          <div className="space-y-4">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 shadow-lg">
                    {value.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Our Journey */}
        <div className="px-6 mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
              Our Journey
            </h2>
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm shadow-lg">
                    {milestone.year}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-6 mt-8">
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl text-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-center mb-6">
              By the Numbers
            </h3>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold mb-1">500+</div>
                <div className="text-xs opacity-90">Happy Pets Dressed</div>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">100%</div>
                <div className="text-xs opacity-90">Custom Fit Guarantee</div>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">24/7</div>
                <div className="text-xs opacity-90">Customer Support</div>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">4.9★</div>
                <div className="text-xs opacity-90">Customer Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="px-6 mt-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Join Our Family
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Be part of the Furever Steffie community and give your pet the
              comfort they deserve
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white py-3 px-6 rounded-xl font-medium hover:from-gray-800 hover:to-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
