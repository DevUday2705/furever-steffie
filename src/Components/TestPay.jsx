import { motion } from "framer-motion";

const PayButton = () => {
  const handlePayment = async () => {
    const options = {
      key: "rzp_test_Q2zLMwkylstbfw", // Replace with your Razorpay key
      amount: 50000, // Amount in paisa (₹500)
      currency: "INR",
      name: "Your Brand",
      description: "Test Transaction",
      image: "https://yourdomain.com/logo.png",
      // order_id: "order_DBJOWzybf0sJbb", // Optional without backend
      handler: function (response) {
        alert("Payment Successful");
        console.log(response);
      },
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "9999999999",
      },
      notes: {
        address: "Customer Address",
      },
      theme: {
        color: "#6366f1", // Tailwind indigo-500
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handlePayment}
      className="px-6 py-3 bg-indigo-500 text-white rounded-2xl shadow-lg hover:bg-indigo-600 transition"
    >
      Pay ₹500
    </motion.button>
  );
};

export default PayButton;
