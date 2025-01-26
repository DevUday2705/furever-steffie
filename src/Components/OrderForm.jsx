import React, { useContext, useState } from "react";

import TextInput from "./TextInput";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "../constants/constant";
const OrderForm = () => {
  const { updateSelections } = useContext(AppContext);
  const [formValues, setFormValues] = useState({
    fullName: "Uday Kulkarni",
    address:
      "Room 3, Fernandis Chawl, Shivaji Nagar, Jogeshwari East Mumbai 400060",
    number: "9920271866",
    alternateNumber: "9769746242",
    neck: "42",
    chest: "22",
    length: "60",
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    updateSelections("customerData", formValues);
    navigate("/final-receipt");
  };
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
        <TextInput
          label="Your Full Name"
          placeholder="John Doe..."
          name="fullName"
          value={formValues.fullName}
          onChange={handleInputChange}
        />
      </motion.div>

      <motion.div className={`w-full max-w-sm mt-5`} variants={itemVariants}>
        <label className="block mb-2 text-sm text-slate-600">Address</label>
        <textarea
          rows={5}
          className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
          placeholder="Enter full address including State / City / Pin Code - And nearest landmark if any."
          name="address"
          value={formValues.address}
          onChange={handleInputChange}
        />
      </motion.div>
      <motion.p
        className="flex items-start mt-2 text-xs text-slate-400"
        variants={itemVariants}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 mr-1.5"
        >
          <path
            fill-rule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
            clip-rule="evenodd"
          />
        </svg>
        Make sure to include FULL address including - State, City, Pin Code.
        Also add a landmark if possible. A complete address ensures safe and
        timely delivery without delay.
      </motion.p>
      <motion.div variants={itemVariants}>
        <TextInput
          className="mt-5"
          label="Mobile Number"
          placeholder="9999999999"
          name="number"
          value={formValues.number}
          onChange={handleInputChange}
        />
      </motion.div>
      <motion.p
        className="flex items-start mt-2 text-xs text-slate-400"
        variants={itemVariants}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 mr-1.5"
        >
          <path
            fill-rule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
            clip-rule="evenodd"
          />
        </svg>
        Please check mobile number twice - This helps courier service to contact
        you if any issues with parcel.
      </motion.p>
      <motion.div variants={itemVariants}>
        <TextInput
          className="mt-5"
          label="Alternate Number (If any)"
          placeholder="9999999999"
          name="alternateNumber"
          value={formValues.alternateNumber}
          onChange={handleInputChange}
        />
      </motion.div>
      <motion.hr className="bg-gray-600 mt-5" variants={itemVariants} />
      <motion.p className="text-xl font-semibold mt-5" variants={itemVariants}>
        Pet Measurement - In Inches
      </motion.p>
      <motion.div
        className="bg-amber-100 mt-2 text-sm p-2 rounded-md text-slate-800"
        variants={itemVariants}
      >
        <p className="font-medium mb-1">Why is this important</p>
        <p>
          At furever_steffie, we don't keep the outfits ready, We stitch them on
          order, these outfits are custom made only based on measurements of
          only and only your pet.
        </p>
      </motion.div>
      <motion.div className="grid grid-cols-3 gap-3" variants={itemVariants}>
        <TextInput
          className="mt-5"
          label="Neck"
          placeholder='eg 12"'
          name="neck"
          value={formValues.neck}
          onChange={handleInputChange}
        />
        <TextInput
          className="mt-5"
          label="Chest"
          placeholder='eg 24"'
          name="chest"
          value={formValues.chest}
          onChange={handleInputChange}
        />
        <TextInput
          className="mt-5"
          label="Length"
          placeholder='eg 40"'
          name="length"
          value={formValues.length}
          onChange={handleInputChange}
        />
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
    </motion.div>
  );
};

export default OrderForm;
