import { useContext, useState } from "react";
import {
  containerVariants,
  itemVariants,
  traditionalOptions,
} from "../constants/constant";
import { AppContext } from "../context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

const SelectedFabric = () => {
  const { selections, updateSelections } = useContext(AppContext);
  const { id } = useParams();
  const product = traditionalOptions.find((p) => p.id == id);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const navigate = useNavigate();

  const currentProduct = selectedVariant || product;
  const currentSizes = selectedVariant ? selectedVariant.sizes : product.sizes;
  const [sizeHelp, setSizeHelp] = useState(false);
  // const sizes = ["xs", "sm", "md", "lg", "xl"];

  // const fabric = traditionalOptions.filter((item) => item.id == id)[0];

  const handleOrder = () => {
    // Store all three variables in the global context
    updateSelections("variant", selectedVariant);
    updateSelections("price", getCurrentPrice());
    updateSelections("size", selectedSize);
    navigate("/order-form");
  };

  // const handleAddToCart = () => {
  //   updateSelections("cart", [
  //     ...selections.cart,
  //     {
  //       ...currentProduct,
  //       variant: selectedVariant,
  //       size: selectedSize,
  //       qty: 1,
  //     },
  //   ]);
  //   toast("Added to cart successfully!", {
  //     icon: "👏",
  //     style: {
  //       borderRadius: "10px",
  //       background: "#333",
  //       color: "#fff",
  //     },
  //   });
  // };

  const getCurrentPrice = () => {
    if (!selectedSize) return currentProduct.price;
    return currentSizes.find((s) => s.size === selectedSize).price;
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setSelectedSize(null); // Reset size when variant changes
  };

  const handleResetVariant = () => {
    setSelectedVariant(null);
    setSelectedSize(null);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="my-10"
    >
      <motion.div variants={itemVariants}>
        <img
          className="rounded-2xl"
          src={currentProduct?.image}
          alt={currentProduct?.name}
        />
      </motion.div>
      {product.variants.length > 0 && (
        <div className="mt-4">
          <p className="text-gray-600 mb-2 font-medium">Available Variants:</p>
          <div className="flex flex-wrap gap-3 justify-start">
            {product.variants.map((variant) => (
              <motion.div
                key={variant.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleVariantSelect(variant)}
                className={`cursor-pointer p-2 rounded-lg flex flex-col items-center border-2 ${
                  selectedVariant?.id === variant.id
                    ? "border-black"
                    : "border-gray-200"
                }`}
              >
                <img
                  src={variant.image}
                  alt={variant.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <p className="text-sm mt-1">{variant.name}</p>
                {/* <p className="text-sm font-medium">₹{variant.price}</p> */}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {selectedVariant && (
        <p className="text-lg mt-2 text-gray-600">
          <button
            onClick={handleResetVariant}
            className="ml-2 cursor-pointer text-sm text-blue-600 underline"
          >
            Reset to original
          </button>
        </p>
      )}
      <div className="flex items-center gap-3 mt-5 justify-center">
        {currentSizes.map(({ size, inStock }) => (
          <motion.span
            key={size}
            onClick={() => inStock && setSelectedSize(size)}
            className={`
                inline-block text-center w-20 cursor-pointer py-0.5 border rounded-full
                ${
                  selectedSize === size
                    ? "bg-black text-white"
                    : "border-gray-300 text-gray-400"
                }
                ${!inStock && "opacity-50 cursor-not-allowed bg-gray-100"}
              `}
          >
            {size}
          </motion.span>
        ))}
      </div>
      <motion.div variants={itemVariants} className="text-center">
        <p className="text-3xl mt-4 font-medium">{currentProduct.name}</p>
        <div className="mt-4">
          <p className="text-2xl inline-block text-green-700 font-medium mr-4">
            ₹{getCurrentPrice()}/-
          </p>
          <span className="line-through text-2xl text-red-500 font-medium">
            ₹{parseInt(getCurrentPrice()) + 300}
          </span>
        </div>
        <p
          onClick={() => setSizeHelp(!sizeHelp)}
          className="text-gray-500 cursor-pointer underline mt-4"
        >
          How Do I select the size?
        </p>

        {sizeHelp && (
          <motion.div
            className="text-left mt-2 text-sm text-gray-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="bg-amber-100 p-2 rounded-md">
              <p>
                Hey! Don't worry. It's pretty simple - You just need to measure
                3 things as shown in the picture below.
              </p>
              <p className="font-medium mt-2">1. Circumference of the Neck</p>
              <p className="font-medium">2. Circumference of the Chest</p>
              <p className="font-medium mb-2">3. Length from neck till tail</p>
              <p>
                And that's pretty much it - Please check the picture below and
                select appropriate size for your furry friend.
              </p>
            </div>
            <img src="/images/size-chart.jpg" alt="size chart" />
          </motion.div>
        )}
      </motion.div>
      <motion.button
        disabled={!selectedSize}
        onClick={handleOrder}
        variants={itemVariants}
        className="w-full py-3 disabled:bg-black/50 cursor-pointer bg-black text-xl mt-5 text-white rounded-md"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Order Now
      </motion.button>
      {/* <motion.button
        onClick={() => handleAddToCart()}
        variants={itemVariants}
        className="w-full py-3 cursor-pointer border text-xl mt-5  rounded-md"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Add To Cart
      </motion.button> */}
    </motion.div>
  );
};

export default SelectedFabric;
