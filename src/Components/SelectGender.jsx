import { useNavigate } from "react-router-dom";
import { containerVariants, itemVariants } from "../constants/constant";
import { useAppContext } from "../hooks/useAppContext";
import { motion } from "framer-motion";
const SelectGender = () => {
  const { updateSelections, selections } = useAppContext();
  const navigate = useNavigate();

  const handleSelection = (key, value) => {
    updateSelections(key, value); // Update selection and move to the next step
    navigate("/style");
  };

  return (
    <div>
      <h1 className="text-2xl mt-10 text-center">My {selections.pet} is a</h1>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex gap-5 mt-10 items-center justify-center"
      >
        <motion.div
          variants={itemVariants}
          onClick={() => handleSelection("gender", "male")}
          className="p-8 cursor-pointer text-center border rounded-2xl"
        >
          <img src="/images/male.png" className="h-20 w-full object-cover" />
          <p className="text-2xl font-medium mt-5">Male</p>
        </motion.div>
        <motion.div
          variants={itemVariants}
          onClick={() => handleSelection("gender", "female")}
          className="p-8 cursor-pointer text-center border rounded-2xl"
        >
          <img src="/images/female.png" className="h-20" />
          <p className="text-2xl font-medium mt-5">Female</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SelectGender;
