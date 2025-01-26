import { useNavigate } from "react-router-dom";
import { containerVariants, itemVariants } from "../constants/constant";
import { useAppContext } from "../hooks/useAppContext";
import { motion } from "framer-motion";
const SelectPet = () => {
  const { updateSelections } = useAppContext();
  const navigate = useNavigate();
  const handleSelection = (key, value) => {
    updateSelections(key, value);
    navigate("/gender");
  };

  return (
    <div>
      <h1 className="text-2xl mt-10 text-center">I'm looking to shop for my</h1>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex gap-5 mt-10 items-center justify-between"
      >
        <motion.div
          variants={itemVariants}
          onClick={() => handleSelection("pet", "cat")}
          className="p-10 cursor-pointer text-center border rounded-2xl"
        >
          <img src="/images/cat.png" className="h-20" />
          <p className="text-2xl font-medium mt-5">Cat</p>
        </motion.div>
        <motion.div
          variants={itemVariants}
          onClick={() => handleSelection("pet", "dog")}
          className="p-10 cursor-pointer text-center border rounded-2xl"
        >
          <img src="/images/dog.png" className="h-20" />
          <p className="text-2xl font-medium mt-5">Dog</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SelectPet;
