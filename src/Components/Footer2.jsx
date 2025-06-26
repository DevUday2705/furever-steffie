// MobileFooter.jsx
import { motion } from "framer-motion";

const footerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Footer2 = () => {
  return (
    <motion.footer
      className="bg-gray-900 rounded-t-md text-white px-4 py-8 text-sm"
      variants={footerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
        <ul className="space-y-1">
          <li>
            <a href="/contact" className="text-gray-300 hover:text-white">
              Contact Us
            </a>
          </li>
          <li>
            <a href="/policy" className="text-gray-300 hover:text-white">
              Policy
            </a>
          </li>
          <li>
            <a href="/terms" className="text-gray-300 hover:text-white">
              Terms
            </a>
          </li>
          <li>
            <a href="/privacy" className="text-gray-300 hover:text-white">
              Privacy
            </a>
          </li>
          <li>
            <a href="/cancellations" className="text-gray-300 hover:text-white">
              Cancellations
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
        <ul className="space-y-1">
          <li>
            <a href="/track" className="text-gray-300 hover:text-white">
              Track My Order
            </a>
          </li>
          <li>
            <a href="/kurtas" className="text-gray-300 hover:text-white">
              Kurtas
            </a>
          </li>
          <li>
            <a href="/frocks" className="text-gray-300 hover:text-white">
              Frocks
            </a>
          </li>
          <li>
            <a href="/bowtie" className="text-gray-300 hover:text-white">
              Bowtie
            </a>
          </li>
          <li>
            <a href="/about" className="text-gray-300 hover:text-white">
              About Us
            </a>
          </li>
        </ul>
      </div>

      <div className="text-center text-xs text-gray-500 mt-6">
        © {new Date().getFullYear()} Furever Steffie. All rights reserved.
      </div>
    </motion.footer>
  );
};

export default Footer2;
