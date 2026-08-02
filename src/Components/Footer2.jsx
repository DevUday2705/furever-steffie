// MobileFooter.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const footerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Footer2 = () => {
  const linkClassName =
    "text-gray-300 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded-sm";

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
            <Link to="/contact" className={linkClassName}>
              Contact Us
            </Link>
          </li>
          <li>
            <Link to="/policy" className={linkClassName}>
              Policy
            </Link>
          </li>
          <li>
            <Link to="/terms" className={linkClassName}>
              Terms
            </Link>
          </li>
          <li>
            <Link to="/privacy" className={linkClassName}>
              Privacy
            </Link>
          </li>
          <li>
            <Link to="/cancellations" className={linkClassName}>
              Cancellations
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
        <ul className="space-y-1">
          <li>
            <Link to="/track" className={linkClassName}>
              Track My Order
            </Link>
          </li>
          <li>
            <Link to="/kurta" className={linkClassName}>
              Kurtas
            </Link>
          </li>
          <li>
            <Link to="/frock" className={linkClassName}>
              Frocks
            </Link>
          </li>
          <li>
            <Link to="/bow-tie" className={linkClassName}>
              Bowtie
            </Link>
          </li>
          <li>
            <Link to="/about-us" className={linkClassName}>
              About Us
            </Link>
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
