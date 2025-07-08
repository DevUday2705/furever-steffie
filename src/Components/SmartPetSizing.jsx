import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Check,
  Heart,
  Shield,
  MessageCircle,
  CheckCircle,
} from "lucide-react";

const SmartPetSizing = ({ onSizeDetected, setMeasurementsValid }) => {
  const [currentStep, setCurrentStep] = useState("breed");
  const [selectedBreed, setSelectedBreed] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedBodyType, setSelectedBodyType] = useState("");
  const [recommendedSize, setRecommendedSize] = useState("");
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);
  const [breedSearch, setBreedSearch] = useState("");

  const dogBreeds = [
    // Extra Small Breeds (XS)
    { name: "Shih Tzu", avgSize: "S", popular: true },
    { name: "Lhasa Apso", avgSize: "S", popular: true },
    { name: "Poodle (Toy)", avgSize: "S", popular: true },
    { name: "Bichon Frise", avgSize: "S", popular: true },
    { name: "Maltese", avgSize: "S", popular: true },
    { name: "Toy Poodle", avgSize: "S", popular: true },
    { name: "Chihuahua", avgSize: "S", popular: true },
    { name: "Yorkshire Terrier", avgSize: "S", popular: true },
    { name: "Pomeranian", avgSize: "S", popular: true },

    // Small Breeds (S)
    { name: "Regular Shih Tzu", avgSize: "S", popular: true },
    { name: "Havanese", avgSize: "S", popular: true },
    { name: "Dachshund", avgSize: "S", popular: true },
    { name: "Boston Terrier", avgSize: "S", popular: true },
    { name: "Pug", avgSize: "S", popular: true },

    // Medium Breeds (M)
    { name: "Regular Lhasa", avgSize: "M", popular: true },
    { name: "Dachshund (Standard)", avgSize: "M", popular: true },
    { name: "Pom", avgSize: "M", popular: false },
    { name: "Beagle", avgSize: "M", popular: true },
    { name: "Cocker Spaniel", avgSize: "M", popular: true },
    { name: "Border Collie", avgSize: "M", popular: false },
    { name: "Bulldog", avgSize: "M", popular: false },

    // Large Breeds (L)
    { name: "Poodle (Standard)", avgSize: "L", popular: false },
    { name: "Dalmatian", avgSize: "L", popular: false },
    { name: "Pomeranian (Large)", avgSize: "L", popular: false },
    { name: "Golden Retriever", avgSize: "L", popular: false },
    { name: "Labrador Retriever", avgSize: "L", popular: false },
    { name: "Australian Shepherd", avgSize: "L", popular: false },
    { name: "Boxer", avgSize: "L", popular: false },

    // Extra Large Breeds (XL)
    { name: "Cocker Spaniel (Large)", avgSize: "XL", popular: false },
    { name: "Beagle (Large)", avgSize: "XL", popular: false },
    { name: "German Shepherd", avgSize: "XL", popular: false },
    { name: "Rottweiler", avgSize: "XL", popular: false },
    { name: "Siberian Husky", avgSize: "XL", popular: false },

    // XX Large Breeds (XXL)
    { name: "India", avgSize: "XXL", popular: false },
    { name: "Great Dane", avgSize: "XXL", popular: false },
    { name: "Saint Bernard", avgSize: "XXL", popular: false },

    // XXX Large Breeds (XXXL)
    { name: "Labrador (Golden Retriever)", avgSize: "XXXL", popular: false },
    { name: "Husky", avgSize: "XXXL", popular: false },
    { name: "Above (Giant Breeds)", avgSize: "XXXL", popular: false },

    // Mix Options
    { name: "Small Mix (Under 6 lbs)", avgSize: "XS", popular: true },
    { name: "Small Mix (6-12 lbs)", avgSize: "S", popular: true },
    { name: "Medium Mix (12-25 lbs)", avgSize: "M", popular: true },
    { name: "Large Mix (25+ lbs)", avgSize: "L", popular: true },
    { name: "Don't Know / Other", avgSize: "M", popular: true },
  ];

  const ageGroups = [
    {
      label: "Puppy",
      value: "puppy",
      emoji: "🐶",
      modifier: -1,
      ageRange: "0-1 year",
    },
    {
      label: "Young Adult",
      value: "young",
      emoji: "🐕",
      modifier: 0,
      ageRange: "1-3 years",
    },
    {
      label: "Adult",
      value: "adult",
      emoji: "🦮",
      modifier: 0,
      ageRange: "3-7 years",
    },
    {
      label: "Senior",
      value: "senior",
      emoji: "🐕‍🦺",
      modifier: 0,
      ageRange: "7+ years",
    },
  ];

  const bodyTypes = [
    {
      label: "Lean",
      value: "slim",
      emoji: "/images/lean-pup.png",
      modifier: -1,
      description: "Skinny",
    },
    {
      label: "Normal",
      value: "average",
      emoji: "/images/mid-fur.png",
      modifier: 0,
      description: "Average",
    },
    {
      label: "Fluffy",
      value: "chunky",
      emoji: "/images/full-fur.png",
      modifier: 1,
      description: "Chubby",
    },
  ];

  // Updated size chart based on Lehengas brand chart
  const sizeChart = {
    XS: {
      label: "Extra Small",
      chest: '14-16"',
      neck: '10-12"',
      length: '13"',
      weight: "2.5-5.5kg",
      breeds:
        "Imperial Shih Tzu, Poodle, Bichon Frise, Maltese, Toy Poodle, Toy Yorkie",
    },
    S: {
      label: "Small",
      chest: '16-18"',
      neck: '14"',
      length: '14"',
      weight: "6.7-8 kg",
      breeds: "Regular Shih Tzu, Lhasa Apso",
    },
    M: {
      label: "Medium",
      chest: '20-21"',
      neck: '15"',
      length: '15"',
      weight: "8-9 kg",
      breeds: "Regular Lhasa, Dachshund, Pom",
    },
    L: {
      label: "Large",
      chest: '22-24"',
      neck: '18"',
      length: '16"',
      weight: "10-12 kg",
      breeds: "Poodle, Toy Dalmatian, Pomeranian",
    },
    XL: {
      label: "Extra Large",
      chest: '25-27"',
      neck: '20"',
      length: '20"',
      weight: "12-15 kg",
      breeds: "Cocker Spaniel, Beagle",
    },
    XXL: {
      label: "XX Large",
      chest: '28-30"',
      neck: '22-24"',
      length: '22-25"',
      weight: "15-20 kg",
      breeds: "India",
    },
    XXXL: {
      label: "XXX Large",
      chest: '31-35"',
      neck: '26-29"',
      length: '27-30"',
      weight: "25 kg+",
      breeds: "Labrador, Golden Retriever, Husky, Above",
    },
  };

  const filteredBreeds = dogBreeds.filter((breed) =>
    breed.name.toLowerCase().includes(breedSearch.toLowerCase())
  );

  const popularBreeds = dogBreeds.filter((breed) => breed.popular);

  const calculateSize = () => {
    if (!selectedBreed || !selectedAge || !selectedBodyType) return;

    const breed = dogBreeds.find((b) => b.name === selectedBreed);
    const age = ageGroups.find((a) => a.value === selectedAge);
    const body = bodyTypes.find((b) => b.value === selectedBodyType);

    if (!breed || !age || !body) return;

    const sizes = ["S", "M", "L", "XL", "XXL", "XXXL"];
    let baseIndex = sizes.indexOf(breed.avgSize);

    // Apply modifiers
    baseIndex += age.modifier + body.modifier;

    // Ensure within bounds
    baseIndex = Math.max(0, Math.min(sizes.length - 1, baseIndex));

    const finalSize = sizes[baseIndex];
    setRecommendedSize(finalSize);
    setMeasurementsValid(true);
    onSizeDetected(finalSize, {
      breed: selectedBreed,
      age: selectedAge,
      bodyType: selectedBodyType,
    });
  };

  // Helper function to get size details
  const getSizeDetails = (size) => {
    return sizeChart[size] || null;
  };

  // Helper function to get breed recommendations for a size
  const getBreedsForSize = (size) => {
    const sizeData = sizeChart[size];
    return sizeData ? sizeData.breeds : "";
  };

  useEffect(() => {
    calculateSize();
  }, [selectedBreed, selectedAge, selectedBodyType]);
  useEffect(() => {
    if (currentStep === "breed" && selectedBreed) {
      setCurrentStep("age");
    } else if (currentStep === "age" && selectedAge) {
      setCurrentStep("bodyType");
    }
  }, [selectedBreed, selectedAge]);

  const nextStep = () => {
    if (currentStep === "breed" && selectedBreed) {
      setCurrentStep("age");
    } else if (currentStep === "age" && selectedAge) {
      setCurrentStep("bodyType");
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const stepLabels = {
    breed: "Breed",
    age: "Age",
    bodyType: "Body Type",
  };
  const isStepCompleted = (step) => {
    switch (step) {
      case "breed":
        return selectedBreed;
      case "age":
        return selectedAge;
      case "bodyType":
        return selectedBodyType;
      default:
        return false;
    }
  };

  // Helper function to check if step is accessible (current or completed previous steps)
  const isStepAccessible = (step) => {
    const steps = ["breed", "age", "bodyType"];
    const stepIndex = steps.indexOf(step);
    const currentIndex = steps.indexOf(currentStep);

    // Can always go to current step or earlier
    if (stepIndex <= currentIndex) return true;

    // Can go to next step only if all previous steps are completed
    for (let i = 0; i < stepIndex; i++) {
      if (!isStepCompleted(steps[i])) return false;
    }
    return true;
  };
  const motionStyles = {
    animation: "slideUp 0.6s ease-out 0.5s both",
  };
  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
      `}</style>

      <div className="bg-gradient-to-br from-gray-50 to-pink-50 p-6 rounded-2xl space-y-6 border border-gray-100">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              Smart Sizing
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            Skip the measuring tape! We'll find the perfect fit.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          {["breed", "age", "bodyType"].map((step, index) => {
            const isCompleted = isStepCompleted(step);
            const isCurrent = currentStep === step;
            const isAccessible = isStepAccessible(step);

            return (
              <motion.button
                key={step}
                onClick={() => isAccessible && setCurrentStep(step)}
                disabled={!isAccessible}
                className={`flex-1 h-2 rounded-full transition-all duration-200 ${
                  isCurrent
                    ? "bg-gray-600 shadow-sm"
                    : isCompleted
                    ? "bg-gray-400 hover:bg-gray-500"
                    : isAccessible
                    ? "bg-gray-300 hover:bg-gray-400"
                    : "bg-gray-200 cursor-not-allowed"
                } ${isAccessible ? "cursor-pointer" : ""}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={isAccessible ? { scaleY: 1.2 } : {}}
                whileTap={isAccessible ? { scaleY: 0.8 } : {}}
              />
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {currentStep === "breed" && (
            <motion.div
              key="breed"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <h4 className="font-medium text-gray-800">
                What's your dog's breed?
              </h4>

              {/* Popular Breeds */}
              <div className="space-y-1.5">
                <p className="text-xs text-gray-500 font-medium">
                  Popular Breeds
                </p>
                <div className="grid grid-cols-4 gap-1">
                  {popularBreeds.slice(0, 8).map((breed) => (
                    <motion.button
                      key={breed.name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedBreed(breed.name)}
                      className={`p-1.5 rounded-md text-[10px] font-medium transition-all leading-tight ${
                        selectedBreed === breed.name
                          ? "bg-gray-600 text-white"
                          : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {breed.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Search Dropdown */}
              <div className="relative">
                <div
                  onClick={() => setShowBreedDropdown(!showBreedDropdown)}
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg cursor-pointer flex items-center justify-between hover:border-gray-300 transition-colors"
                >
                  <span className="text-gray-500 text-xs truncate">
                    {selectedBreed || "Search for other breeds..."}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ml-1 ${
                      showBreedDropdown ? "rotate-180" : ""
                    }`}
                  />
                </div>

                <AnimatePresence>
                  {showBreedDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.98 }}
                      className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg mt-0.5 max-h-48 overflow-y-auto"
                    >
                      <div className="p-1.5">
                        <input
                          type="text"
                          placeholder="Search breeds..."
                          value={breedSearch}
                          onChange={(e) => setBreedSearch(e.target.value)}
                          className="w-full p-1.5 border border-gray-200 rounded text-xs focus:border-gray-400 focus:outline-none"
                        />
                      </div>
                      <div className="max-h-32 overflow-y-auto">
                        {filteredBreeds.map((breed) => (
                          <motion.button
                            key={breed.name}
                            whileHover={{ backgroundColor: "#f9fafb" }}
                            onClick={() => {
                              setSelectedBreed(breed.name);
                              setShowBreedDropdown(false);
                              setBreedSearch("");
                            }}
                            className="w-full p-2 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-b-0"
                          >
                            <span className="text-xs font-medium truncate">
                              {breed.name}
                            </span>
                            <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">
                              {breed.avgSize}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {currentStep === "age" && (
            <motion.div
              key="age"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <h4 className="font-medium text-gray-800">
                How old is your{" "}
                {selectedBreed === "Don't Know / Other" ? "pup" : selectedBreed}
                ?
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {ageGroups.map((age) => (
                  <motion.button
                    key={age.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedAge(age.value);
                    }}
                    className={`p-4 rounded-xl text-center transition-all ${
                      selectedAge === age.value
                        ? "bg-gray-500 text-white shadow-lg"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{age.emoji}</div>
                    <div className="font-medium text-sm">{age.label}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {age.ageRange}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === "bodyType" && (
            <motion.div
              key="bodyType"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <h4 className="font-medium text-gray-800">
                What's your dog's body type?
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {bodyTypes.map((type) => (
                  <motion.button
                    key={type.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedBodyType(type.value)}
                    className={`p-4 rounded-xl text-center transition-all ${
                      selectedBodyType === type.value
                        ? "bg-gray-500 text-white shadow-lg"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      <img
                        src={type.emoji}
                        className="h-20 shrink-0 object-cover"
                      />
                    </div>
                    <div className="text-sm font-semibold">{type.label}</div>
                    <div className="text-xs text-white-500 mt-1 leading-tight">
                      {type.description}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Size Recommendation */}
        <AnimatePresence>
          {recommendedSize &&
            selectedBreed &&
            selectedAge &&
            selectedBodyType && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-emerald-200 rounded-lg p-3 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="bg-emerald-100 rounded-full p-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-emerald-700 mb-0.5">
                      Recommended Size
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {recommendedSize}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getSizeDetails(recommendedSize)?.label} •{" "}
                      {getBreedsForSize(recommendedSize)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
        </AnimatePresence>

        {/* Trust Badges */}
        <div
          style={motionStyles}
          className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 mt-6 border border-gray-100/50"
        >
          <div className="grid grid-cols-3 gap-4">
            {/* Perfect Fit */}
            <div className="flex flex-col items-center group cursor-default">
              <div className="w-8 h-8 mb-2 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-md transition-shadow duration-200">
                <Shield className="w-4 h-4 text-slate-700" />
              </div>
              <p className="text-xs font-semibold text-slate-800 mb-0.5 tracking-wide">
                PERFECT FIT
              </p>
              <p className="text-xs text-slate-500">Guaranteed</p>
            </div>

            {/* WhatsApp Confirmation */}
            <div className="flex flex-col items-center group cursor-default border-x border-gray-200/50 px-2">
              <div className="w-8 h-8 mb-2 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-md transition-shadow duration-200">
                <MessageCircle className="w-4 h-4 text-slate-700" />
              </div>
              <p className="text-xs font-semibold text-slate-800 mb-0.5 tracking-wide">
                WHATSAPP
              </p>
              <p className="text-xs text-slate-500">Verified</p>
            </div>

            {/* Accuracy Rate */}
            <div className="flex flex-col items-center group cursor-default">
              <div className="w-8 h-8 mb-2 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-md transition-shadow duration-200">
                <Check className="w-4 h-4 text-slate-700" />
              </div>
              <p className="text-xs font-semibold text-slate-800 mb-0.5 tracking-wide">
                98% SUCCESS
              </p>
              <p className="text-xs text-slate-500">Rate</p>
            </div>
          </div>
        </div>

        {/* Reassurance Message */}
        {recommendedSize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center relative"
          >
            {/* Small trust indicator */}
            <div className="absolute top-2 right-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
            </div>

            <p className="text-sm text-slate-700 font-medium flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-slate-600 mr-2" />
              Size confirmation via WhatsApp
            </p>
            <p className="text-xs text-slate-500 mt-1">
              We verify the perfect fit before shipping
            </p>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default SmartPetSizing;
