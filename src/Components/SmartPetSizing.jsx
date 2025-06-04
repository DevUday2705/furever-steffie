import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Heart, Shield, MessageCircle } from "lucide-react";

const SmartPetSizing = ({ onSizeDetected, setMeasurementsValid }) => {
  const [currentStep, setCurrentStep] = useState("breed");
  const [selectedBreed, setSelectedBreed] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedBodyType, setSelectedBodyType] = useState("");
  const [recommendedSize, setRecommendedSize] = useState("");
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);
  const [breedSearch, setBreedSearch] = useState("");

  const dogBreeds = [
    // Small Breeds (Most Popular for Your Business)
    { name: "Chihuahua", avgSize: "XS", popular: true },
    { name: "Yorkshire Terrier", avgSize: "XS", popular: true },
    { name: "Pomeranian", avgSize: "XS", popular: true },
    { name: "Maltese", avgSize: "XS", popular: true },
    { name: "Shih Tzu", avgSize: "S", popular: true },
    { name: "Dachshund", avgSize: "S", popular: true },
    { name: "Havanese", avgSize: "S", popular: true },
    { name: "Pug", avgSize: "S", popular: true },

    // Small Mix Options
    { name: "Small Mix (Under 10 lbs)", avgSize: "XS", popular: true },
    { name: "Small Mix (10-20 lbs)", avgSize: "S", popular: true },

    // Medium Popular
    { name: "Beagle", avgSize: "M", popular: true },
    { name: "Cocker Spaniel", avgSize: "M", popular: true },
    { name: "Medium Mix (20-40 lbs)", avgSize: "M", popular: true },

    // Less Common Large Breeds
    { name: "Golden Retriever", avgSize: "L", popular: false },
    { name: "Labrador Retriever", avgSize: "L", popular: false },
    { name: "German Shepherd", avgSize: "XL", popular: false },
    { name: "Bulldog", avgSize: "M", popular: false },
    { name: "Poodle (Standard)", avgSize: "L", popular: false },
    { name: "Poodle (Toy)", avgSize: "XS", popular: false },
    { name: "Poodle (Miniature)", avgSize: "S", popular: false },
    { name: "Rottweiler", avgSize: "XL", popular: false },
    { name: "Siberian Husky", avgSize: "L", popular: false },
    { name: "Boxer", avgSize: "L", popular: false },
    { name: "Boston Terrier", avgSize: "S", popular: false },
    { name: "Australian Shepherd", avgSize: "L", popular: false },
    { name: "Border Collie", avgSize: "M", popular: false },
    { name: "Large Mix (40+ lbs)", avgSize: "L", popular: false },
    { name: "Don't Know / Other", avgSize: "S", popular: true },
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
      emoji: "🏃‍♂️",
      modifier: -1,
      description: "Skinny, athletic build",
    },
    {
      label: "Normal",
      value: "average",
      emoji: "🐕",
      modifier: 0,
      description: "Average, healthy weight",
    },
    {
      label: "Fluffy",
      value: "chunky",
      emoji: "🥰",
      modifier: 1,
      description: "Chubby, extra fluffy",
    },
  ];

  const sizeChart = {
    XS: {
      label: "Extra Small",
      range: "4-8 lbs",
      neck: '8-10"',
      chest: '12-16"',
    },
    S: { label: "Small", range: "8-15 lbs", neck: '10-12"', chest: '16-20"' },
    M: { label: "Medium", range: "15-35 lbs", neck: '12-16"', chest: '20-26"' },
    L: { label: "Large", range: "35-65 lbs", neck: '16-20"', chest: '26-32"' },
    XL: {
      label: "Extra Large",
      range: "65-90 lbs",
      neck: '20-24"',
      chest: '32-38"',
    },
    XXL: {
      label: "XX Large",
      range: "90+ lbs",
      neck: '24-28"',
      chest: '38-44"',
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

    const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
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

  useEffect(() => {
    calculateSize();
  }, [selectedBreed, selectedAge, selectedBodyType]);

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

  return (
    <div className="bg-gradient-to-br from-gray-50 to-pink-50 p-6 rounded-2xl space-y-6 border border-gray-100">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-2">
          <Heart className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-800">Smart Sizing</h3>
        </div>
        <p className="text-sm text-gray-600">
          Skip the measuring tape! We'll find the perfect fit.
        </p>
      </motion.div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2">
        {["breed", "age", "bodyType"].map((step, index) => (
          <motion.div
            key={step}
            className={`flex-1 h-2 rounded-full ${
              currentStep === step
                ? "bg-gray-500"
                : ["breed", "age", "bodyType"].indexOf(currentStep) > index
                ? "bg-gray-300"
                : "bg-gray-200"
            }`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: index * 0.1 }}
          />
        ))}
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
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium">
                Popular Breeds
              </p>
              <div className="grid grid-cols-2 gap-2">
                {popularBreeds.slice(0, 6).map((breed) => (
                  <motion.button
                    key={breed.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedBreed(breed.name);
                      setTimeout(nextStep, 300);
                    }}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      selectedBreed === breed.name
                        ? "bg-gray-500 text-white shadow-lg"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
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
                className="w-full p-3 bg-white border border-gray-200 rounded-xl cursor-pointer flex items-center justify-between hover:border-gray-300 transition-colors"
              >
                <span className="text-gray-500 text-sm">
                  {selectedBreed || "Search for other breeds..."}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    showBreedDropdown ? "rotate-180" : ""
                  }`}
                />
              </div>

              <AnimatePresence>
                {showBreedDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto"
                  >
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Search breeds..."
                        value={breedSearch}
                        onChange={(e) => setBreedSearch(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    {filteredBreeds.map((breed) => (
                      <motion.button
                        key={breed.name}
                        whileHover={{ backgroundColor: "#f3f4f6" }}
                        onClick={() => {
                          setSelectedBreed(breed.name);
                          setShowBreedDropdown(false);
                          setBreedSearch("");
                          setTimeout(nextStep, 300);
                        }}
                        className="w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span className="text-sm">{breed.name}</span>
                        <span className="text-xs text-gray-400">
                          {breed.avgSize}
                        </span>
                      </motion.button>
                    ))}
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
              {selectedBreed === "Don't Know / Other" ? "pup" : selectedBreed}?
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {ageGroups.map((age) => (
                <motion.button
                  key={age.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedAge(age.value);
                    setTimeout(nextStep, 300);
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
                  <div className="text-2xl mb-1">{type.emoji}</div>
                  <div className="font-medium text-xs">{type.label}</div>
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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-gradient-to-r from-green-400 to-green-500 rounded-2xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Check className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium opacity-90">
                    Perfect Match Found!
                  </p>
                  <p className="text-2xl font-bold">{recommendedSize}</p>
                  <p className="text-sm opacity-90">
                    {sizeChart[recommendedSize]?.label} •{" "}
                    {sizeChart[recommendedSize]?.range}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Trust Badges */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100"
      >
        <div className="text-center">
          <Shield className="w-5 h-5 text-purple-500 mx-auto mb-1" />
          <p className="text-xs text-purple-600 font-medium">Perfect Fit</p>
          <p className="text-xs text-purple-500">Guarantee</p>
        </div>
        <div className="text-center">
          <MessageCircle className="w-5 h-5 text-purple-500 mx-auto mb-1" />
          <p className="text-xs text-purple-600 font-medium">WhatsApp</p>
          <p className="text-xs text-purple-500">Confirmation</p>
        </div>
        <div className="text-center">
          <Check className="w-5 h-5 text-purple-500 mx-auto mb-1" />
          <p className="text-xs text-purple-600 font-medium">95% Accuracy</p>
          <p className="text-xs text-purple-500">Rate</p>
        </div>
      </motion.div>

      {/* Reassurance Message */}
      {recommendedSize && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center"
        >
          <p className="text-sm text-blue-800 font-medium">
            🎯 Our sizing experts will confirm via WhatsApp before shipping
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Your order will only be processed after we verify the perfect fit!
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default SmartPetSizing;
