import React, { useContext, useState } from "react";

import TextInput from "./TextInput";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { containerVariants, itemVariants } from "../constants/constant";
const OrderForm = () => {
  const { updateSelections } = useContext(AppContext);
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    fullName: "",
    address: "",
    number: "",
    alternateNumber: "",
    neck: "",
    chest: "",
    length: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const requiredFields = [
    "fullName",
    "address",
    "number",
    "neck",
    "chest",
    "alternateNumber",
    "length",
  ];

  const validateField = (name, value) => {
    if (requiredFields.includes(name) && !value.trim()) {
      return "This field is required";
    }
    if (name === "number" || name === "alternateNumber") {
      if (value && !/^\d{10}$/.test(value)) {
        return "Please enter a valid 10-digit number";
      }
    }
    if (["neck", "chest", "length"].includes(name)) {
      if (value && !/^\d+(\.\d+)?$/.test(value)) {
        return "Please enter a valid measurement";
      }
    }
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, formValues[name]),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    requiredFields.forEach((field) => {
      const error = validateField(field, formValues[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    setErrors(newErrors);
    setTouched(
      requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      updateSelections("customerData", formValues);
      navigate("/final-receipt");
    }
  };

  const inputClassName = (name) => `
    w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm 
    border rounded-md px-3 py-2 transition-all duration-300 ease 
    focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow
    ${
      touched[name] && errors[name]
        ? "border-red-500 animate-shake"
        : "border-slate-200"
    }
  `;
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="my-10"
    >
      <motion.h1
        variants={itemVariants}
        className="text-4xl my-5 font-semibold text-center"
      >
        Checkout Form
      </motion.h1>

      <motion.div variants={itemVariants}>
        <div className="mb-4">
          <label className="block mb-2 text-sm text-slate-600">
            Your Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            value={formValues.fullName}
            onChange={handleInputChange}
            onBlur={() => handleBlur("fullName")}
            className={inputClassName("fullName")}
            placeholder="John Doe..."
          />
          <AnimatePresence>
            {touched.fullName && errors.fullName && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-1 text-xs text-red-500"
              >
                {errors.fullName}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="mb-4">
          <label className="block mb-2 text-sm text-slate-600">Address *</label>
          <textarea
            rows={5}
            name="address"
            value={formValues.address}
            onChange={handleInputChange}
            onBlur={() => handleBlur("address")}
            className={inputClassName("address")}
            placeholder="Enter full address including State / City / Pin Code - And nearest landmark if any."
          />
          <AnimatePresence>
            {touched.address && errors.address && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-1 text-xs text-red-500"
              >
                {errors.address}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Phone Number Fields */}
      <motion.div variants={itemVariants}>
        <div className="mb-4">
          <label className="block mb-2 text-sm text-slate-600">
            Mobile Number *
          </label>
          <input
            type="tel"
            name="number"
            value={formValues.number}
            onChange={handleInputChange}
            onBlur={() => handleBlur("number")}
            className={inputClassName("number")}
            placeholder="9999999999"
          />
          <AnimatePresence>
            {touched.number && errors.number && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-1 text-xs text-red-500"
              >
                {errors.number}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="mb-4">
          <label className="block mb-2 text-sm text-slate-600">
            Alternate Number
          </label>
          <input
            type="tel"
            name="alternateNumber"
            value={formValues.alternateNumber}
            onChange={handleInputChange}
            onBlur={() => handleBlur("alternateNumber")}
            className={inputClassName("alternateNumber")}
            placeholder="9999999999"
          />
          <AnimatePresence>
            {touched.alternateNumber && errors.alternateNumber && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-1 text-xs text-red-500"
              >
                {errors.alternateNumber}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.hr className="bg-gray-600 mt-5" variants={itemVariants} />

      {/* Pet Measurements */}
      <motion.div variants={itemVariants} className="mt-5">
        <p className="text-xl font-semibold">Pet Measurement - In Inches *</p>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {["neck", "chest", "length"].map((measurement) => (
            <div key={measurement}>
              <label className="block mb-2 text-sm text-slate-600 capitalize">
                {measurement}
              </label>
              <input
                type="text"
                name={measurement}
                value={formValues[measurement]}
                onChange={handleInputChange}
                onBlur={() => handleBlur(measurement)}
                className={inputClassName(measurement)}
                placeholder={`eg 24"`}
              />
              <AnimatePresence>
                {touched[measurement] && errors[measurement] && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-1 text-xs text-red-500"
                  >
                    {errors[measurement]}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.button
        onClick={handleSubmit}
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 cursor-pointer bg-black text-xl mt-5 text-white rounded-md"
      >
        Review My Order
      </motion.button>

      <style>{`
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
      }
      .animate-shake {
        animation: shake 0.5s ease-in-out;
      }
    `}</style>
    </motion.div>
  );
};

export default OrderForm;
