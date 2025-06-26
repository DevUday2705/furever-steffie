import { useState } from "react";
import { motion } from "framer-motion";

const TrackOrder = () => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) {
      setError("Please enter Order ID or Mobile Number.");
      return;
    }
    setError("");
    // TODO: Call backend API with `input`
    console.log("Fetching order for:", input);
  };

  return (
    <motion.div
      className="min-h-screen bg-white px-4 py-12 flex flex-col justify-start items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
    >
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Track Your Order
      </h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex flex-col gap-4"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter Order ID or Mobile Number"
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />

        {error && <p className="text-red-500 text-sm -mt-2">{error}</p>}

        <motion.button
          whileTap={{ scale: 0.96 }}
          type="submit"
          className="w-full bg-black text-white py-3 rounded-md text-sm font-medium hover:bg-gray-800"
        >
          Submit
        </motion.button>
      </form>
    </motion.div>
  );
};

export default TrackOrder;
