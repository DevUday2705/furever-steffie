import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="bg-white">
      <div className="flex items-start gap-5">
        <img src="/images/mii.webp" className="h-28" alt="made in india logo" />
        <div className="flex-1">
          <h1 className="text-xl text-gray-800">Made With Love, In India</h1>
          <h2 className="text-gray-500">
            With every purchase, you are supporting an Indian Start-Up
          </h2>
        </div>
      </div>
      <div className="bg-gray-800 mt-5 py-4 rounded-t-3xl gap-x-8 flex justify-center items-center">
        <Link className="text-white" to="/contact">
          Contact Us
        </Link>
      </div>
    </div>
  );
};

export default Footer;
