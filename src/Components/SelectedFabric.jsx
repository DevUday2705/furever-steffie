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
  const navigate = useNavigate();

  const [size, setSize] = useState("xs");
  const [sizeHelp, setSizeHelp] = useState(false);
  const sizes = ["xs", "sm", "md", "lg", "xl"];

  const fabric = traditionalOptions.filter((item) => item.id == id)[0];

  const handleOrder = () => {
    updateSelections("size", size);
    updateSelections("cart", [...selections.cart, { ...fabric, qty: 1 }]);
    navigate("/order-form");
  };

  const handleAddToCart = () => {
    updateSelections("cart", [...selections.cart, { ...fabric, qty: 1 }]);
    toast("Added to cart successfully!", {
      icon: "👏",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });
  };
  console.log(selections);
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="my-10"
    >
      <motion.div variants={itemVariants}>
        <img className="rounded-2xl" src={fabric.img} alt={fabric.name} />
      </motion.div>
      <motion.div variants={itemVariants} className="text-center">
        <p className="text-3xl mt-4 font-medium">{fabric.name}</p>
        <p className="text-2xl inline-block mt-2 text-green-700 font-medium mr-4">
          ₹{fabric.price}/-
        </p>
        <span className="line-through text-2xl text-red-500 font-medium">
          {parseInt(fabric.price) + 300}
        </span>
        <span className="ml-2 font-semibold">40% OFF</span>
        <p className="mt-2 font-medium text-red-400">2 units in stock</p>
        <div className="flex items-center gap-3 mt-5 justify-center">
          {sizes.map((item) => (
            <motion.span
              key={item}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSize(item)}
              className={` ${
                size == item && "bg-black text-white"
              } inline-block w-20 cursor-pointer py-0.5 border border-gray-300 text-gray-400 rounded-full`}
            >
              {item}
            </motion.span>
          ))}
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
        onClick={handleOrder}
        variants={itemVariants}
        className="w-full py-3 cursor-pointer bg-black text-xl mt-5 text-white rounded-md"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Order Now
      </motion.button>
      <motion.button
        onClick={() => handleAddToCart()}
        variants={itemVariants}
        className="w-full py-3 cursor-pointer border text-xl mt-5  rounded-md"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Add To Cart
      </motion.button>
    </motion.div>
  );
};

export default SelectedFabric;
