import { useNavigate } from "react-router-dom";
import {
  containerVariants,
  itemVariants,
  traditionalOptions,
} from "../constants/constant";
import { useAppContext } from "../hooks/useAppContext";
import { motion } from "framer-motion";
import { convertCurrency } from "../constants/currency";
import { useContext } from "react";
import { CurrencyContext } from "../context/currencyContext";
const FabricOptions = () => {
  const { updateSelections } = useAppContext();
  const navigate = useNavigate();
  const handleSelection = (key, value) => {
    updateSelections(key, value); // Update selection and move to the next step
    navigate(`/product-detail/${value}`);
  };
  const { currency } = useContext(CurrencyContext);
  return (
    <motion.div
      className="my-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-2 gap-4">
        {traditionalOptions.map((item, idx) => (
          <motion.div
            onClick={() => handleSelection("id", item.id)}
            key={idx}
            variants={itemVariants}
            className="border cursor-pointer border-gray-200 rounded-2xl"
          >
            <div className="h-64 w-full">
              <img
                className="h-full w-full object-cover rounded-2xl"
                src={item.image}
                alt={item.id}
              />
            </div>
            <div className="px-4 py-2">
              <p className="font-medium">{item.name}</p>
              <p className="text-green-600 font-semibold">
                {convertCurrency(item.price, currency)}/-
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default FabricOptions;
