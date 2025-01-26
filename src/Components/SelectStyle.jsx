import { useNavigate } from "react-router-dom";
import { containerVariants, itemVariants } from "../constants/constant";
import { useAppContext } from "../hooks/useAppContext";
import { motion } from "framer-motion";
const SelectStyle = ({}) => {
  const { updateSelections } = useAppContext();
  const navigate = useNavigate();

  const handleSelection = (key, value) => {
    updateSelections(key, value); // Update selection and move to the next step
    value == "traditional" ? navigate("/traditional") : navigate("/modern");
  };
  return (
    <div>
      <h1 className="text-2xl mt-10 text-center">I would like to see</h1>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex gap-5 mt-10 items-center justify-center"
      >
        <motion.div
          variants={itemVariants}
          onClick={() => handleSelection("style", "traditional")}
          className="px-8 cursor-pointer py-10 flex flex-col items-center flex-1 text-center border rounded-2xl"
        >
          <img src="/images/traditional.png" className="h-20" />
          <p className="text-2xl font-medium mt-5">Traditional</p>
        </motion.div>
        <motion.div
          variants={itemVariants}
          onClick={() => handleSelection("style", "modern")}
          className="px-12 cursor-pointer py-10 flex flex-col items-center flex-1 text-center border rounded-2xl"
        >
          <img src="/images/modern.png" className="h-20" />
          <p className="text-2xl font-medium mt-5">Modern</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SelectStyle;
